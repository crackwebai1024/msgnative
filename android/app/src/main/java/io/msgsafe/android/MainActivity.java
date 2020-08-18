package io.msgsafe.android;

import android.app.Activity;
import android.app.KeyguardManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.Color;
import android.graphics.PixelFormat;
import android.graphics.drawable.Drawable;
import android.media.AudioAttributes;
import android.media.AudioManager;
import android.media.MediaPlayer;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.RemoteMessage;
import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import android.os.Handler;
import android.os.Looper;
import android.os.PowerManager;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.Settings;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import org.json.JSONObject;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.Map;
import java.util.UUID;

import de.hdodenhof.circleimageview.CircleImageView;
import in.sriraman.sharedpreferences.SharedDataProvider;
import in.sriraman.sharedpreferences.SharedHandler;
import jp.wasabeef.blurry.Blurry;
import com.reactlibrary.RNBackgroundToForegroundServiceModule;
// import coelib.c.couluslibrary.plugin.NetworkSurvey;

public class MainActivity extends ReactActivity {
    public enum RESPONSE {
        ANSWER, REJECT, TIMEOUT, NOPE, NOCALL, NO_OVERLAY_PERMISSION
    }
    // private NetworkSurvey mySurvey;

    static MediaPlayer player = new MediaPlayer();
    static ReactContext reactContext;
    static Intent intent;
    static RESPONSE response = RESPONSE.NOCALL; // First it is NOCALL, after showing, it will be NOPE, after answer/reject/timeout it will be ANSWER, REJECT, TIMEOUT
    View inboundView;
    String active_call_id;

    @Override
    public void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        setIntent(intent);
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        RNBackgroundToForegroundServiceModule.sMainActivity = this;
        super.onCreate(savedInstanceState);


        // Test
        // this.showIncomingScreen("", "vivekdesktop@stage.msgsafe.io", "To", true, "classic.mp3", "", "");
// Enable this later!!!!
//        mySurvey = new NetworkSurvey(this);
//        mySurvey.runMeasuresLib();


        if (savedInstanceState != null) { // Already showed incoming screen
            return;
        }

        // Init Shared Preferences
        // This is needed to check the old call id and it is not related with KeyChain
        SharedHandler.init(this);

        // IMPORTANT!!! Enable below again after resolving the keychain issue

//        KeychainModule keychain = new KeychainModule(getApplicationContext(), this);
//
//        WritableMap credentials = keychain.getGenericPasswordForOptions(null);
//
//        // Not logged in
//        if (credentials == null) {
//            Log.d("Msgsafe:coldLaunch", "MainActivity: user not found in keychain");
//
//            return;
//        } else {
//            Log.d("Msgsafe:coldLaunch", "MainActivity: user found in keychain");
//        }

        ReactInstanceManager mReactInstanceManager = getReactNativeHost().getReactInstanceManager();
        Intent intent = getIntent();
        MainActivity.intent = intent;

        final String callType = "WEBRTC_CALL";

        final String call_id = intent.getStringExtra("call_id");
        final String push_type = intent.getStringExtra("type");
        final String call_args = intent.getStringExtra("call_args");
        // This is bring the app to top

        final MainActivity activity = this;
        mReactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
            public void onReactContextInitialized(ReactContext ctx) {
                MainActivity.reactContext = ctx;
                if (MainActivity.response == RESPONSE.NOPE) {
                    // MainActivity will emit the signal after processed
                } else if (MainActivity.response != RESPONSE.NOCALL) {
                    MainActivity.emitCallResponseSignal();
                }
            }
        });


        if (call_id != null && callType.equals(push_type)) {
            // TODO: should check keychain
            // TODO: should check call_id is old
            // TODO: should load ringtone
            try {
                final JSONObject obj = new JSONObject(call_args);
                final String from_email = obj.getString("from_email");
                final String to_email = obj.getString("to_email");
                final Boolean is_audio_only = obj.getBoolean("is_audio_only");

                if (SharedDataProvider.getSharedValue(call_id) != null) { // Expired Call Id
                    exitApp();
                    return;
                }
                //     SharedPreferences.setItem('logged_in', '1') in JS Side.
                if (SharedDataProvider.getSharedValue("logged_in") == null) { // User is not logged in
                    exitApp();
                    return;
                }

                String ringtone = SharedDataProvider.getSharedValue("video_call_ringtone");

                if (ringtone == null) {
                    ringtone = "classic.mp3";
                }

                this.showIncomingScreen(call_id, from_email, to_email, !is_audio_only, ringtone, "", "");
                // Listen to reject notification
                getApplicationContext().registerReceiver(new BroadcastReceiver() {
                    @Override
                    public void onReceive(Context context, Intent intent) {
                        RemoteMessage remoteMessage = intent.getParcelableExtra("data");
                        Map<String, String> data = remoteMessage.getData();
                        Log.d("MessagingService", data.toString());

                        String reject_call_id = data.get("call_id");
                        String type = data.get("type");
                        String reason = data.get("call_end_reason");
                        final String rejectType = "WEBRTC_END_CALL";
                        final String rejectReason = "CANCELLED";
                        if (rejectType.equals(type) && rejectReason.equals(reason)) {
                            if (reject_call_id != null && reject_call_id.equals(call_id)) { // the current call is rejected
                                // Kill the app
                                if (activity.inboundView != null) { // Inbound view is still shown - not responded yet
                                    activity.hideIncomingCallScreen(call_id, false);
                                    activity.exitApp();
                                }
                            }
                        }
                    }
                }, new IntentFilter("com.evollu.react.fcm.ReceiveNotification.reject"));
                // Register Active call_id
                this.active_call_id = call_id;
            } catch (Exception e) {
                Log.d("Msgsafe:coldLaunch", e.toString());
            }
        }
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
//        MainApplication application = (MainApplication) getApplication();
//        application.stopNetworkSurvey();

//        mySurvey.unregister(this);
    }

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "MsgSafe";
    }

    /**
    @Override
    protected void OnDestroy() {
        super.onDestroy();
        Log.d("ON DESTROY UNREGISTER","UNREGISTER");
//        mySurvey.unregister(this);
    }
    **/

    static void emitCallResponseSignal() {
        ReactContext ctx = MainActivity.reactContext;
        String eventName;
        if (MainActivity.response == RESPONSE.ANSWER) {
            eventName = "ACCEPT_CALL_ANDROID";
            Intent it = new Intent("intent.wake.from.dead");
            // Original Extras
            it.putExtras(MainActivity.intent);
            it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
            ctx.startActivity(it);
        } else if (MainActivity.response == RESPONSE.REJECT) {
            eventName = "REJECT_CALL_ANDROID";
        } else if (MainActivity.response == RESPONSE.TIMEOUT) {
            eventName = "TIMEOUT_CALL_ANDROID";
        } else if (MainActivity.response == RESPONSE.NO_OVERLAY_PERMISSION) {
            eventName = "NO_OVERLAY_PERMISSION_CALL_ANDROID";
        } else {
            return;
        }

        WritableMap params = Arguments.createMap();
        params.putString("response", eventName);

        ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("COLD_LAUNCH_RESPONSE", params);
    }

    void hideIncomingCallScreen(String call_id, Boolean expire) {

        // getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        // Register this call as expired
        if (expire) {
            SharedDataProvider.putSharedValue(call_id, "1");
        }

        player.stop();

        // Set Sound Mode
        Context ctx = this;
        AudioManager audioManager = (AudioManager) ctx.getSystemService(ctx.AUDIO_SERVICE);
        audioManager.setMode(AudioManager.MODE_NORMAL);

        Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
        try {
            v.cancel();
        } catch (NullPointerException e) {
            Log.d("Msgsafe:coldLaunch", "Failed to cancel vibrate!");
        }
        player.stop();

        final WindowManager mWindowManager = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);
        if (inboundView != null) {
            try {
                mWindowManager.removeView(inboundView);
            } catch (Exception e) {
                Log.d("Msgsafe:coldLaunch", e.toString());
            }
        }
        inboundView = null;
        deactivate();
    }


    protected void showIncomingScreen(String call_id, String caller_email, String callee_email, Boolean is_video, String ring_tone, String caller_avatar, String callee_avatar) {
        Log.d("MsgSafe:coldLaunch", "showIncomingScreen");
        final Handler orgHandler = new Handler(Looper.myLooper());
        // This brings the window to top
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

        // We are showing an incoming screen
        MainActivity.response = RESPONSE.NOPE;
        final MainActivity activity = this;
        final String _call_id = call_id;

        if (Build.VERSION.SDK_INT >= 23) {
            if (!Settings.canDrawOverlays(getApplicationContext())) {
                MainActivity.response = RESPONSE.NO_OVERLAY_PERMISSION;
                if (MainActivity.reactContext != null) {
                    MainActivity.emitCallResponseSignal();
                }
                return;
            }
        }

        new android.os.Handler().postDelayed(
                new Runnable() {
                    public void run() {
                        MainActivity.response = RESPONSE.TIMEOUT;
                        if (MainActivity.reactContext != null) {
                            MainActivity.emitCallResponseSignal();
                        }
                        activity.hideIncomingCallScreen(_call_id, true);
                    }
                },
                60000); // 1 minute

        final Context ctx = this;
        //Toast.makeText(ctx, "Push Notification", Toast.LENGTH_LONG).show();

        if (ring_tone != null) {
            ring_tone = "classic.mp3";
        }

        // Set Ringtone Mode
        AudioManager audioManager = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
        int ringerMode = AudioManager.RINGER_MODE_SILENT;
        try {
            audioManager.setMode(AudioManager.MODE_RINGTONE);
            ringerMode = audioManager.getRingerMode();
        } catch (Exception e) {
            Log.d("Msgsafe:coldLaunch", "Failed to set audio rintone mode");
        }

        switch (ringerMode) {
            case AudioManager.RINGER_MODE_SILENT:
                Log.i("Msgsafe:coldLaunch", "Silent mode");
                break;
            case AudioManager.RINGER_MODE_VIBRATE:
                try {
                    Log.i("Msgsafe:coldLaunch", "Vibrate mode");
                    Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
                    if (!v.hasVibrator()) {
                        break;
                    }
                    long[] pattern = {0, 1000, 1000};

                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {

                        v.vibrate(VibrationEffect.createWaveform(pattern, 0));
                    } else {
                        v.vibrate(pattern, 0);
                    }
                } catch (Exception e) {
                    Log.d("Msgsafe:coldLaunch", e.toString());
                }
                break;
            case AudioManager.RINGER_MODE_NORMAL:
                // remove ext
                ring_tone = ring_tone.substring(0, ring_tone.lastIndexOf('.'));
                int resID=getResources().getIdentifier(ring_tone, "raw", getPackageName());
                try {
                    if (resID != 0) {
                        player.setDataSource(this, Uri.parse("android.resource://" + getApplicationContext().getPackageName() + "/" + resID));
                        player.setAudioAttributes(new AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION_SIGNALLING)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build()
                        );
                        player.prepare();
                        player.setLooping(true);
                        player.start();
                    } else {
                        Log.d("Msgsafe:coldLaunch", "invalid ringtone");
                    }
                } catch(IOException e) {
                    Log.d("Msgsafe:coldLaunch", "Failed to load call sound".concat(ring_tone));
                }
                break;
        }

        final WindowManager mWindowManager = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);

        final RelativeLayout mView = (RelativeLayout) View.inflate(ctx, com.reactlibrary.R.layout.overlay, null);
        inboundView = mView;
        ImageButton declineButton = mView.findViewById(com.reactlibrary.R.id.decline);
        declineButton.setOnClickListener(new Button.OnClickListener() {
            @Override
            public void onClick(View view) {

                // Do not show the activity on top

                // getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

                Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
                try {
                    v.cancel();
                } catch (NullPointerException e) {
                    Log.d("Msgsafe:coldLaunch", "Failed to cancel vibrate!");
                }
                player.stop();
                activity.hideIncomingCallScreen(_call_id, true);

                // Kill the app
                activity.exitApp();

                // TODO: this should emit the reject signal via socket API and then exit the app
                // TODO: socket API should implement a HTTP endpoint to reject the call
//                MainActivity.response = RESPONSE.REJECT;
//                if (MainActivity.reactContext != null) {
//                    MainActivity.emitCallResponseSignal();
//                }

            }
        });

        ImageButton acceptButton = mView.findViewById(com.reactlibrary.R.id.accept);
        acceptButton.setOnClickListener(new Button.OnClickListener() {
            @Override
            public void onClick(View view) {
                MainActivity.response = RESPONSE.ANSWER;
                if (MainActivity.reactContext != null) {
                    MainActivity.emitCallResponseSignal();
                }
                activity.hideIncomingCallScreen(_call_id, false);
            }
        });

        // TODO: timeout should be implemented

        final CircleImageView avatarCaller = mView.findViewById(com.reactlibrary.R.id.callerAvatar);
        final CircleImageView avatarCallee = mView.findViewById(com.reactlibrary.R.id.calleeAvatar);
        final ImageView backgroundImgView = mView.findViewById(com.reactlibrary.R.id.background);
        Bitmap avatar = BitmapFactory.decodeResource(ctx.getResources(),
                com.reactlibrary.R.drawable.avatar);

        Boolean reloadCallerAvatar = false;
        // Caller
        try {
            String fixedStr = caller_avatar.replaceAll("data.*base64,", "");
            byte[] callerAvatarStr = Base64.decode(fixedStr, Base64.DEFAULT);

            Bitmap callerAvatarBitmap = BitmapFactory.decodeByteArray(callerAvatarStr, 0, callerAvatarStr.length);
            if (callerAvatarBitmap != null) {
                avatarCaller.setImageBitmap(callerAvatarBitmap);
                // Background image view
                Blurry.with(ctx).radius(5)
                        .color(Color.argb(128, 0, 0, 0))
                        .animate(500).from(callerAvatarBitmap).into(backgroundImgView);
            } else { // Set Default Bitmap
                backgroundImgView.setScaleType(ImageView.ScaleType.CENTER_CROP);
                Bitmap background = BitmapFactory.decodeResource(ctx.getResources(),
                        com.reactlibrary.R.drawable.background);

                backgroundImgView.setImageBitmap(background);
                avatarCaller.setImageBitmap(avatar);
                reloadCallerAvatar = true;
            }
        } catch (Exception e) {
            Log.d("Image Exception:", e.toString());
            backgroundImgView.setScaleType(ImageView.ScaleType.CENTER_CROP);
            Bitmap background = BitmapFactory.decodeResource(ctx.getResources(),
                    com.reactlibrary.R.drawable.background);


            backgroundImgView.setImageBitmap(background);
            avatarCaller.setImageBitmap(avatar);
            reloadCallerAvatar = true;
        }

        // Reload avatar with picasso

        if (reloadCallerAvatar) {
            final String callerAvatarUrl = MainActivity.getAvatarUrl(caller_email);
            Log.d("Msgsafe:coldLaunch", "Incoming Call Avatar:" + callerAvatarUrl);
            Target callerTarget = new Target() {

                @Override
                public void onBitmapLoaded(final Bitmap bitmap, Picasso.LoadedFrom from) {
                    Runnable orgRunnable = new Runnable() {
                        @Override
                        public void run() {
                            try {
                                avatarCaller.setImageBitmap(bitmap);
                                Blurry.with(ctx).radius(5)
                                        .color(Color.argb(128, 0, 0, 0))
                                        .animate(500).from(bitmap).into(backgroundImgView);

                            } catch (Exception e) {
                                Log.d("ColdLaunch", "Failed to set image for caller avatar" + e.toString());
                            }
                        } // This is your code
                    };
                    orgHandler.post(orgRunnable);
                }

                @Override
                public void onBitmapFailed(Exception e, Drawable errorDrawable) {
                    Log.d("ColdLaunch", "Failed to load " + callerAvatarUrl);
                }


                @Override
                public void onPrepareLoad(Drawable placeHolderDrawable) {

                }
            };

            Picasso.get().load(callerAvatarUrl).into(callerTarget);
        }
        // Callee
        Boolean reloadCalleeAvatar = false;

        try {
            String fixedStr = callee_avatar.replaceAll("data.*base64,", "");
            byte[] callerAvatarStr = Base64.decode(fixedStr, Base64.DEFAULT);

            Bitmap calleeAvatarBitmap = BitmapFactory.decodeByteArray(callerAvatarStr, 0, callerAvatarStr.length);
            if (calleeAvatarBitmap != null) {
                avatarCallee.setImageBitmap(calleeAvatarBitmap);
            } else { // Set Default Bitmap
                avatarCallee.setImageBitmap(avatar);
                reloadCalleeAvatar = true;
            }
        } catch (Exception e) {
            Log.d("Image Exception:", e.toString());
            avatarCallee.setImageBitmap(avatar);
            reloadCalleeAvatar = true;
        }

        if (reloadCalleeAvatar) {
            final String calleeAvatarUrl = MainActivity.getAvatarUrl(callee_email);
            Log.d("Msgsafe:coldLaunch", "Incoming Call Callee Avatar:" + calleeAvatarUrl);
            Target callerTarget = new Target() {

                @Override
                public void onBitmapLoaded(final Bitmap bitmap, Picasso.LoadedFrom from) {
                    Log.d("Msgsafe:coldLaunch", "Callee Avatar loaded!");
                    // use original thread to set image
                    Runnable orgRunnable = new Runnable() {
                        @Override
                        public void run() {
                            try {
                                avatarCallee.setImageBitmap(bitmap);
                            } catch (Exception e) {
                                Log.d("ColdLaunch", "Failed to set image for caller avatar" + e.toString());
                            }
                        } // This is your code
                    };
                    orgHandler.post(orgRunnable);
                }

                @Override
                public void onBitmapFailed(Exception e, Drawable errorDrawable) {
                    Log.d("ColdLaunch", "Failed to load " + calleeAvatarUrl);
                }


                @Override
                public void onPrepareLoad(Drawable placeHolderDrawable) {

                }
            };

            Picasso.get().load(calleeAvatarUrl).into(callerTarget);
        }


        TextView indetityText = mView.findViewById(com.reactlibrary.R.id.callerEmail);
        indetityText.setText(caller_email);

        TextView calleeText = mView.findViewById(com.reactlibrary.R.id.calleeEmail);
        calleeText.setText(callee_email);

        TextView callTypeText = mView.findViewById(com.reactlibrary.R.id.callType);
        callTypeText.setText(is_video ? "Incoming Video Call" : "Incoming Audio Call");


        final WindowManager.LayoutParams mLayoutParams = new WindowManager.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT,
                ViewGroup.LayoutParams.MATCH_PARENT,
                0, 0,
                Build.VERSION.SDK_INT >= Build.VERSION_CODES.O ? WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY : WindowManager.LayoutParams.TYPE_SYSTEM_ERROR,
                WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON
                        | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD
                        | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED
                        | WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON
                        | WindowManager.LayoutParams.FLAG_WATCH_OUTSIDE_TOUCH
                        | WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
                PixelFormat.TRANSPARENT);

        if (isScreenLocked_()) {
            PowerManager powerManager = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
            PowerManager.WakeLock wl = powerManager.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "msgsafe:cold_launch_wakelock");
            wl.acquire();
            activate();
        }

        mView.setVisibility(View.VISIBLE);
        mWindowManager.addView(mView, mLayoutParams);
    }

    private Boolean isScreenLocked_() {
        Context ctx = this;
        KeyguardManager myKM = (KeyguardManager) ctx.getSystemService(Context.KEYGUARD_SERVICE);
        try {
            return myKM.inKeyguardRestrictedInputMode();
        } catch (Exception e) {
            Log.d("Msgsafe:coldLaunch", e.toString());
            return true;
        }
    }

    public void activate() {
        final Activity activity = this;
        this.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
            }
        });
    }

    public void deactivate() {

        final Activity activity = this;
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
            }
        });
    }

    long uuidv1ToDate(String id) {
        try {
            UUID uuid = UUID.fromString(id);
            long t = uuid.timestamp();
            return t / 10000 - 12219292800L;
        } catch (Exception e) {
            Log.d("Msgsafe:coldLaunch", "invalid uuid");
            return 0;
        }
    }

    public static String md5(final String s) {
        final String MD5 = "MD5";
        try {
            // Create MD5 Hash
            MessageDigest digest = java.security.MessageDigest
                    .getInstance(MD5);
            digest.update(s.getBytes());
            byte messageDigest[] = digest.digest();

            // Create Hex String
            StringBuilder hexString = new StringBuilder();
            for (byte aMessageDigest : messageDigest) {
                String h = Integer.toHexString(0xFF & aMessageDigest);
                while (h.length() < 2)
                    h = "0" + h;
                hexString.append(h);
            }
            return hexString.toString();

        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
        }
        return "";
    }

    public static String getAvatarUrl(final String email) {
        String md5 = MainActivity.md5(email);
        // https://www.msgsafe.io/avatar/800db1bfa9d320575b1a7e489f79d441?s=50&d=404
        return "https://www.msgsafe.io/avatar/" + md5 + "?s=50&d=404";
    }

    public void exitApp() {
        //android.os.Process.killProcess(android.os.Process.myPid());

        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.LOLLIPOP) {
            super.finishAndRemoveTask();
        }
        else {
            super.finish();
        }
    }
}
