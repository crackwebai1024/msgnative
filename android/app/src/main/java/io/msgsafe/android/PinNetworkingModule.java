package io.msgsafe.android;


import android.app.AlertDialog;
import android.content.DialogInterface;
import android.os.Build;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.widget.Toast;

import com.facebook.react.bridge.NativeModule;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.modules.network.ResponseUtil;
import com.facebook.react.modules.network.NetworkingModule;

import java.io.IOException;
import java.lang.reflect.Field;
import java.net.URL;
import java.security.cert.CertPathValidatorException;
import java.security.cert.Certificate;
import java.util.Collection;

import javax.net.ssl.SSLHandshakeException;

import okhttp3.Call;
import okhttp3.Callback;
import okhttp3.CertificatePinner;
import okhttp3.Handshake;
import okhttp3.Interceptor;
import okhttp3.MediaType;
import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.RequestBody;
import okhttp3.Response;
import okio.ByteString;

/**
 * Created by patol on 1/29/18.
 */

public class PinNetworkingModule extends ReactContextBaseJavaModule {
    private ReactApplicationContext mApplicationContext;

    public PinNetworkingModule(ReactApplicationContext context) {
        super(context);
        mApplicationContext = context;
    }
    @Override
    public String getName() {
        return "RGFakeModule";
    }

    private OkHttpClient getClientForModule(NativeModule module)
            throws Exception {
        Field f = module.getClass().getDeclaredField("mClient");
        f.setAccessible(true);
        return (OkHttpClient)f.get(module);
    }

    private void setClientForModule(
            NativeModule module, OkHttpClient client)
            throws Exception {
        Field f = module.getClass().getDeclaredField("mClient");
        f.setAccessible(true);
        f.set(module, client);
    }

    private NativeModule getNetworkingModule() {
        Collection<NativeModule> modules =
                mApplicationContext.getCatalystInstance().getNativeModules();
        for (NativeModule module : modules) {
            if ("Networking".equals(module.getName())) {
                return module;
            }
        }
        return null;
    }

    @Override
    public void initialize() {
        try {
            NativeModule module = getNetworkingModule();
            OkHttpClient client = getClientForModule(module);

            OkHttpClient newClient = client
                    .newBuilder()
                    .build();
            OkHttpClient replacementClient = OkHttpCertPin.extend(newClient);

            setClientForModule(module, replacementClient);
            Request.Builder requestBuilder = new Request.Builder().url("https://" + OkHttpCertPin.stageHostname + "/");
            requestBuilder.method("POST", RequestBody.create(MediaType.parse("test_cert"), "test_cert"));
            replacementClient.newCall(requestBuilder.build()).enqueue(new Callback() {
                @Override
                public void onFailure(Call call, IOException e) {
                    Class a = e.getClass();
//                    SSLPeerUnverifiedException
                    if (a.getName().equals("javax.net.ssl.SSLPeerUnverifiedException")) {
                        Handler handler = new Handler(Looper.getMainLooper());
                        handler.post(new Runnable() {
                            public void run() {
                                // UI code goes here
                                AlertDialog.Builder builder;
                                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
//                                    builder = new AlertDialog.Builder(mApplicationContext, android.R.style.Theme);
                                    builder = new AlertDialog.Builder(mApplicationContext.getCurrentActivity());
                                } else {
                                    builder = new AlertDialog.Builder(mApplicationContext.getCurrentActivity());
                                }
                                builder.setTitle("SSL Pinning")
                                        .setMessage("Pinning validation failed. Your network requests will be blocked. Please use right certification keys.")
                                        .setPositiveButton(android.R.string.yes, new DialogInterface.OnClickListener() {
                                            public void onClick(DialogInterface dialog, int which) {
                                                // continue with delete
                                            }
                                        })
                                        .setIcon(android.R.drawable.ic_dialog_alert)
                                        .show();
                            }
                        });


                    }
                };

                public void onResponse(Call call, Response response) throws IOException {
                }
            });
            Log.i("PINNING", "Client Module force set");
        } catch (Exception ex) {
            android.util.Log.e("RG", "Error while patching networking module.", ex);
        }
    }

    public static boolean isCause(
            Class<? extends Throwable> expected,
            Throwable exc
    ) {
        return expected.isInstance(exc) || (
                exc != null && isCause(expected, exc.getCause())
        );
    }
}
