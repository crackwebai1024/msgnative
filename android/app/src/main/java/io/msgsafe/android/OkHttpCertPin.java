package io.msgsafe.android;

import android.util.Log;

import com.facebook.react.modules.network.OkHttpClientProvider;
import com.facebook.react.modules.network.ReactCookieJarContainer;

import java.util.concurrent.TimeUnit;

import okhttp3.OkHttpClient;
import okhttp3.Request;
import okhttp3.Response;
import okhttp3.CertificatePinner;

public class OkHttpCertPin {
    public static String stageHostname = "api-stage.msgsafe.io";
    public static String prodHostname = "api6.msgsafe.io";
    private static final String TAG = "OkHttpCertPin";

    public static OkHttpClient extend(OkHttpClient currentClient){
        try {
            CertificatePinner certificatePinner = new CertificatePinner.Builder()
                    .add(stageHostname, "sha256/Ko8tivDrEjiY90yGasP6ZpBU4jwXvHqVvQI0GS3GNdA=")

//                    .add(stageHostname, "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
//                    .add(stageHostname, "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
//                    .add(prodHostname, "sha256/Ko8tivDrEjiY90yGasP6ZpBU4jwXvHqVvQI0GS3GNdA")
//                    .add(prodHostname, "sha256/AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=")
//                    .add(prodHostname, "sha256/BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB=")
                    .build();
            return currentClient.newBuilder().certificatePinner(certificatePinner).build();
        } catch (Exception e) {
            Log.e(TAG, e.getMessage());
        }
        return currentClient;
    }
}
