
package com.reactlibrary;

import android.Manifest;
import android.app.KeyguardManager;
import android.content.BroadcastReceiver;
import android.content.ContentValues;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageManager;
import android.content.res.AssetFileDescriptor;
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
import android.os.Handler;
import android.os.Looper;
import android.os.Parcel;
import android.os.VibrationEffect;
import android.os.Vibrator;
import android.provider.CallLog;
import android.provider.Settings;
import android.support.v4.app.ActivityCompat;
import android.util.Base64;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.view.WindowManager;
import android.view.inputmethod.InputMethodManager;
import android.widget.Button;
import android.widget.ImageButton;
import android.widget.ImageView;
import android.widget.RelativeLayout;
import android.widget.TextView;

import com.facebook.react.HeadlessJsTaskService;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HashMap;
import java.util.Map;

import android.os.PowerManager;
import android.app.Activity;

import de.hdodenhof.circleimageview.CircleImageView;
import jp.wasabeef.blurry.Blurry;

import com.squareup.picasso.Picasso;
import com.squareup.picasso.Target;

import static android.media.AudioAttributes.USAGE_VOICE_COMMUNICATION_SIGNALLING;

public class RNBackgroundToForegroundServiceModule extends ReactContextBaseJavaModule {

    private Boolean isShowingInboundScreen = false;
    private Boolean isShowingInboundScreenWithActive = false;
    private View m_inboundView;
    private MediaPlayer player = new MediaPlayer();
    private static PowerManager.WakeLock wl;
    public static RNBackgroundToForegroundServiceModule sharedInstance;
    public static boolean isScreenLocked = false;
    public static Activity sMainActivity;

    public RNBackgroundToForegroundServiceModule(ReactApplicationContext reactContext) {
        super(reactContext);
        sharedInstance = this;


//        // Listen to power button and decline call
//        IntentFilter filter = new IntentFilter();
//        //filter.addAction(Intent.ACTION_SCREEN_OFF);
//        reactContext.registerReceiver(new BroadcastReceiver() {
//            @Override
//            public void onReceive(Context context, Intent intent) {
//                Log.d("BFService", intent.getAction());
//                //sharedInstance.hideIncomingCall();
//            }
//        }, filter);
    }

    @Override
    public String getName() {
        return "RNBackgroundToForegroundService";
    }

    @Override
    public Map<String, Object> getConstants() {
        final Map<String, Object> constants = new HashMap<>();
        constants.put("REJECT_CALL_ANDROID", "REJECT_CALL_ANDROID");
        constants.put("ACCEPT_CALL_ANDROID", "ACCEPT_CALL_ANDROID");
        return constants;
    }

    @ReactMethod
    public void hideIncomingCall() {
        final ReactApplicationContext ctx = getReactApplicationContext();
        Vibrator v = (Vibrator) ctx.getSystemService(Context.VIBRATOR_SERVICE);
        try {
            v.cancel();
        } catch (NullPointerException e) {
            Log.d("MsgSafe:BFService", "Failed to cancel vibrate!");
        }
        player.stop();

        isShowingInboundScreen = false;
        final WindowManager mWindowManager = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);
        if (m_inboundView != null) {
            try {
                mWindowManager.removeView(this.m_inboundView);
            } catch (Exception e) {
                Log.d("MsgSafe:BFService", e.toString());
            }
        }
        m_inboundView = null;

        Handler handler = new Handler(Looper.getMainLooper());

        // This will post a signal to MainActivity to hide incoming call screen in the cold launch
        final Intent intent = new Intent("com.msgsafe.hide_incoming_call");
        handler.post(new Runnable() {
            @Override
            public void run() {
                ctx.sendOrderedBroadcast(intent, null);
            }
        });
    }

    @ReactMethod
    public void showIncomingCall(final String caller_email, final String caller_avatar, final String callee_email, final String callee_avatar, final Boolean is_video, final String ring_tone) {
        final ReactApplicationContext ctx = getReactApplicationContext();
        final Handler orgHandler = new Handler(Looper.myLooper());
        final Handler mainHandler = new Handler(ctx.getMainLooper());
        final RNBackgroundToForegroundServiceModule module = this;

        // final Activity activity = ctx.getCurrentActivty();
        final Activity activity = sMainActivity;
        if (sMainActivity == null) {
            Log.d("MsgSafe:BFService", "No Activity");
            return;
        }
        isScreenLocked = isScreenLocked_();

        if (Build.VERSION.SDK_INT >= 23) {
            if (!Settings.canDrawOverlays(ctx)) {
                WritableMap params = Arguments.createMap(); // add here the data you want to send
                params.putString("NO_OVERLAY_PERMISSION_CALL_ANDROID", "NO_OVERLAY_PERMISSION_CALL_ANDROID");

                ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("REJECT_CALL_ANDROID", params);
                return;
            }
        }
        if (isShowingInboundScreen) {
            // TODO: send a reject event here
            return;
        }
        isShowingInboundScreen = true;
        //Toast.makeText(ctx, "Push Notification", Toast.LENGTH_LONG).show();

        // Set Ringtone Mode
        AudioManager audioManager = (AudioManager) ctx.getSystemService(Context.AUDIO_SERVICE);
        int ringerMode = AudioManager.RINGER_MODE_SILENT;
        try {
            audioManager.setMode(AudioManager.MODE_RINGTONE);
            ringerMode = audioManager.getRingerMode();
        } catch (Exception e) {
            Log.d("MsgSafe:BFService", "Failed to set audio rintone mode");
        }

        String soundFile = ring_tone;

        switch (ringerMode) {
            case AudioManager.RINGER_MODE_SILENT:
                Log.i("MsgSafe:BFService","Silent mode");
                break;
            case AudioManager.RINGER_MODE_VIBRATE:
                try {
                    Log.i("MsgSafe:BFService","Vibrate mode");
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
                    Log.d("MsgSafe:BFService", e.toString());
                }
                break;
            case AudioManager.RINGER_MODE_NORMAL:
                if (soundFile.lastIndexOf('.') > -1) { // Remove ext
                    soundFile = soundFile.substring(0, soundFile.lastIndexOf('.'));
                }
                int resID= ctx.getResources().getIdentifier(soundFile, "raw", ctx.getPackageName());
                try {
                    if (resID != 0) {
                        player.reset();
                        player.setDataSource(ctx, Uri.parse("android.resource://" + ctx.getApplicationContext().getPackageName() + "/" + resID));
                        player.setAudioAttributes(new AudioAttributes.Builder()
                                .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION_SIGNALLING)
                                .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                                .build()
                        );
                        player.prepare();
                        player.setLooping(true);
                        player.start();
                    } else {
                        Log.d("MsgSafe:BFService", "invalid ringtone");
                    }
                } catch (IOException e) {
                    Log.d("MsgSafe:BFService", e.toString());
                }
                break;
        }

        HeadlessJsTaskService.acquireWakeLockNow(ctx);

        final WindowManager mWindowManager = (WindowManager) ctx.getSystemService(Context.WINDOW_SERVICE);

        final RelativeLayout mView = (RelativeLayout) View.inflate(ctx, R.layout.overlay, null);

        m_inboundView = mView;

        ImageButton declineButton = mView.findViewById(R.id.decline);
        declineButton.setOnClickListener(new Button.OnClickListener() {
            @Override
            public void onClick(View view) {
                ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("REJECT_CALL_ANDROID", null);
                // TODO: put activity to the background if it was started in the background mode.
                module.deactivate();
                module.hideIncomingCall();
            }
        });

        ImageButton acceptButton = mView.findViewById(R.id.accept);
        acceptButton.setOnClickListener(new Button.OnClickListener() {
            @Override
            public void onClick(View view) {
                // emit accept event
                isShowingInboundScreenWithActive = false;
                ctx.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                        .emit("ACCEPT_CALL_ANDROID", null);

                module.hideIncomingCall();
                Intent it = new Intent("intent.wake.from.dead");
                it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                ctx.startActivity(it);

                // if (module.isScreenLocked_()) { // screen is locked
                //     Toast.makeText(ctx, "Please unlock your screen and accept the MsgSafe incoming call!", Toast.LENGTH_LONG).show();
                // }
            }
        });

        final CircleImageView avatarCaller = mView.findViewById(R.id.callerAvatar);
        final CircleImageView avatarCallee = mView.findViewById(R.id.calleeAvatar);
        final ImageView backgroundImgView = mView.findViewById(R.id.background);

        // Default Avatar
        Bitmap avatar = BitmapFactory.decodeResource(ctx.getResources(),
                R.drawable.avatar);

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
                        R.drawable.background);

                backgroundImgView.setImageBitmap(background);
                avatarCaller.setImageBitmap(avatar);
                reloadCallerAvatar = true;
            }
        } catch (Exception e) {
            Log.d("Image Exception:", e.toString());
            backgroundImgView.setScaleType(ImageView.ScaleType.CENTER_CROP);
            Bitmap background = BitmapFactory.decodeResource(ctx.getResources(),
                    R.drawable.background);


            backgroundImgView.setImageBitmap(background);
            avatarCaller.setImageBitmap(avatar);
            reloadCallerAvatar = true;
        }

        if (reloadCallerAvatar) {
            final String callerAvatarUrl = getAvatarUrl(caller_email);
            Log.d("MsgSafe:BFService", "Incoming Call Avatar:" + callerAvatarUrl);
            final Target callerTarget = new Target() {

                @Override
                public void onBitmapLoaded(final Bitmap bitmap, Picasso.LoadedFrom from) {
                    Log.d("MsgSafe:BFService", "Callee Avatar loaded!");
                    // use original thread to set image
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
            // Get a handler that can be used to post to the main thread

            Runnable myRunnable = new Runnable() {
                @Override
                public void run() {
                    Picasso.get().load(callerAvatarUrl).into(callerTarget);
                } // This is your code
            };
            mainHandler.post(myRunnable);
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
            final String calleeAvatarUrl = getAvatarUrl(callee_email);
            Log.d("MsgSafe:BFService", "Incoming Call Callee Avatar:" + calleeAvatarUrl);

            final Target callerTarget = new Target() {

                @Override
                public void onBitmapLoaded(final Bitmap bitmap, Picasso.LoadedFrom from) {
                    Log.d("MsgSafe:BFService", "Callee Avatar loaded!");
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


            Runnable myRunnable = new Runnable() {
                @Override
                public void run() {
                    Picasso.get().load(calleeAvatarUrl).into(callerTarget);
                } // This is your code
            };
            mainHandler.post(myRunnable);
        }


        TextView indetityText = mView.findViewById(R.id.callerEmail);
        indetityText.setText(caller_email);

        TextView calleeText = mView.findViewById(R.id.calleeEmail);
        calleeText.setText(callee_email);

        TextView callTypeText = mView.findViewById(R.id.callType);
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


        isShowingInboundScreenWithActive = true;
        Log.d("MsgSafe:BFService", "Start Wake up device.");
        sMainActivity.runOnUiThread(new Runnable() {
            @Override
            public void run() {

                Log.d("MsgSafe:BFService", "Wake up device.");
                // Put activity to top
                activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);

                // Wake screen
                if (isScreenLocked) {
                    PowerManager powerManager = (PowerManager) ctx.getSystemService(Context.POWER_SERVICE);
                    wl = powerManager.newWakeLock(PowerManager.FULL_WAKE_LOCK | PowerManager.ACQUIRE_CAUSES_WAKEUP, "MsgSafe:wakelock");
                    wl.acquire();
                    // Bring app to top
                    Intent it = new Intent("intent.wake.from.dead");
                    it.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP | Intent.FLAG_ACTIVITY_SINGLE_TOP);
                    ctx.startActivity(it);
                }

                // show incoming screen
                mView.setVisibility(View.VISIBLE);
                mWindowManager.addView(mView, mLayoutParams);

            }
        });
    }

    @ReactMethod
    public void activate() {
        ReactApplicationContext ctx = getReactApplicationContext();
        final Activity activity = ctx.getCurrentActivity();
        if (activity != null) {
            isShowingInboundScreenWithActive = true;
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    activity.getWindow().addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
                }
            });
        }
    }

    @ReactMethod
    public void deactivate() {

        ReactApplicationContext ctx = getReactApplicationContext();

        if (wl != null && wl.isHeld()) {
            wl.release();
        }

        final Activity activity = ctx.getCurrentActivity();
        if (activity != null) {
            isShowingInboundScreenWithActive = false;
            activity.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    activity.getWindow().clearFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON | WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED | WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
                }
            });
        }
    }

    private Boolean isScreenLocked_() {
        ReactApplicationContext ctx = getReactApplicationContext();
        KeyguardManager myKM = (KeyguardManager) ctx.getSystemService(Context.KEYGUARD_SERVICE);
        return myKM.inKeyguardRestrictedInputMode();
    }

    @ReactMethod
    public void isScreenLocked(Callback cb) {
        cb.invoke(isScreenLocked_());
    }

    @ReactMethod
    public void isShowingInboundScreen(Callback cb) {
        cb.invoke(isShowingInboundScreen);
    }

    @ReactMethod
    public void dismissKeyboard() {
        ReactApplicationContext ctx = getReactApplicationContext();
        InputMethodManager imm = (InputMethodManager) ctx.getSystemService(Context.INPUT_METHOD_SERVICE);
        View view = ctx.getCurrentActivity().getCurrentFocus();
        if (view != null) {
            imm.hideSoftInputFromWindow(view.getWindowToken(), InputMethodManager.HIDE_NOT_ALWAYS);
        }
    }

    // READ_CALL_LOG and WRITE_CALL_LOG permissions not allowed anymore
    // See https://support.google.com/googleplay/android-developer/answer/9047303

    // @ReactMethod
    // public void addIncomingCallLog(String phone, int duration) {
    //     ReactApplicationContext reactContext = getReactApplicationContext();

    //     if (ActivityCompat.checkSelfPermission(getCurrentActivity(), Manifest.permission.WRITE_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
    //         ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.WRITE_CALL_LOG}, 101);
    //     else {
    //         ContentValues values = new ContentValues();
    //         values.put(CallLog.Calls.CACHED_NUMBER_TYPE, 0);
    //         values.put(CallLog.Calls.TYPE, CallLog.Calls.INCOMING_TYPE);
    //         values.put(CallLog.Calls.DATE, System.currentTimeMillis());
    //         values.put(CallLog.Calls.DURATION, duration);
    //         values.put(CallLog.Calls.NUMBER, phone);
    //         reactContext.getApplicationContext().getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
    //     }
    // }

    // @ReactMethod
    // public void addIncomingCallLogAt(String phone, int duration, double timeInMillis) {
    //     ReactApplicationContext reactContext = getReactApplicationContext();
    //     if (ActivityCompat.checkSelfPermission(getCurrentActivity(), Manifest.permission.WRITE_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
    //         ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.WRITE_CALL_LOG}, 101);
    //     else {
    //         ContentValues values = new ContentValues();
    //         values.put(CallLog.Calls.CACHED_NUMBER_TYPE, 0);
    //         values.put(CallLog.Calls.TYPE, CallLog.Calls.INCOMING_TYPE);
    //         values.put(CallLog.Calls.DATE, timeInMillis);
    //         values.put(CallLog.Calls.DURATION, duration);
    //         values.put(CallLog.Calls.NUMBER, phone);
    //         reactContext.getApplicationContext().getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
    //     }
    // }

    // @ReactMethod
    // public void addOutgoingCallLog(String phone, int duration) {
    //     ReactApplicationContext reactContext = getReactApplicationContext();

    //     if (ActivityCompat.checkSelfPermission(getCurrentActivity(), Manifest.permission.WRITE_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
    //         ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.WRITE_CALL_LOG}, 101);
    //     else {
    //         ContentValues values = new ContentValues();
    //         values.put(CallLog.Calls.CACHED_NUMBER_TYPE, 0);
    //         values.put(CallLog.Calls.TYPE, CallLog.Calls.OUTGOING_TYPE);
    //         values.put(CallLog.Calls.DATE, System.currentTimeMillis());
    //         values.put(CallLog.Calls.DURATION, duration);
    //         values.put(CallLog.Calls.NUMBER, phone);
    //         reactContext.getApplicationContext().getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
    //     }
    // }

    // @ReactMethod
    // public void addOutgoingCallLogAt(String phone, int duration, double timeInMillis) {
    //     ReactApplicationContext reactContext = getReactApplicationContext();
    //     if (ActivityCompat.checkSelfPermission(getCurrentActivity(), Manifest.permission.WRITE_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
    //         ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.WRITE_CALL_LOG}, 101);
    //     else {
    //         ContentValues values = new ContentValues();
    //         values.put(CallLog.Calls.CACHED_NUMBER_TYPE, 0);
    //         values.put(CallLog.Calls.TYPE, CallLog.Calls.OUTGOING_TYPE);
    //         values.put(CallLog.Calls.DATE, timeInMillis);
    //         values.put(CallLog.Calls.DURATION, duration);
    //         values.put(CallLog.Calls.NUMBER, phone);
    //         reactContext.getApplicationContext().getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
    //     }
    // }

    // @ReactMethod
    // public void addMissedCallLog(String phone) {
    //     ReactApplicationContext reactContext = getReactApplicationContext();
    //     if (ActivityCompat.checkSelfPermission(getCurrentActivity(), Manifest.permission.WRITE_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
    //         ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.WRITE_CALL_LOG}, 101);
    //     else {
    //         ContentValues values = new ContentValues();
    //         values.put(CallLog.Calls.CACHED_NUMBER_TYPE, 0);
    //         values.put(CallLog.Calls.TYPE, CallLog.Calls.MISSED_TYPE);
    //         values.put(CallLog.Calls.DATE, System.currentTimeMillis());
    //         values.put(CallLog.Calls.NUMBER, phone);
    //         reactContext.getApplicationContext().getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
    //     }
    // }

    // @ReactMethod
    // public void addMissedCallLogAt(String phone, double timeInMillis) {
    //     ReactApplicationContext reactContext = getReactApplicationContext();
    //     if (ActivityCompat.checkSelfPermission(getCurrentActivity(), Manifest.permission.WRITE_CALL_LOG) != PackageManager.PERMISSION_GRANTED)
    //         ActivityCompat.requestPermissions(getCurrentActivity(), new String[]{Manifest.permission.WRITE_CALL_LOG}, 101);
    //     else {
    //         ContentValues values = new ContentValues();
    //         values.put(CallLog.Calls.CACHED_NUMBER_TYPE, 0);
    //         values.put(CallLog.Calls.TYPE, CallLog.Calls.MISSED_TYPE);
    //         values.put(CallLog.Calls.DATE, timeInMillis);
    //         values.put(CallLog.Calls.NUMBER, phone);
    //         reactContext.getApplicationContext().getContentResolver().insert(CallLog.Calls.CONTENT_URI, values);
    //     }
    // }

    @ReactMethod
    public void requestOverlayPermission() {
        ReactApplicationContext ctx = getReactApplicationContext();
        if (Build.VERSION.SDK_INT >= 23) {
            if (!Settings.canDrawOverlays(ctx)) {
                Intent intent = new Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                        Uri.parse("package:" + ctx.getPackageName()));
                intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                ctx.startActivity(intent);
            }
        }
    }

    @ReactMethod
    public void isOverlayAvailable(Promise promise) {
        ReactApplicationContext ctx = getReactApplicationContext();
        if (Build.VERSION.SDK_INT >= 23) {
            promise.resolve(Settings.canDrawOverlays(ctx));
        } else {
            promise.resolve(true);
        }
    }

    // This will show the incoming screen at the top after turning off/on screen
    @ReactMethod
    public void refreshScreen() {
        if (m_inboundView != null) {
            m_inboundView.setVisibility(View.VISIBLE);
        }
    }

    @ReactMethod
    public void exitApp() {
        android.os.Process.killProcess(android.os.Process.myPid());
    }

    private static String md5(final String s) {
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

    private static String getAvatarUrl(final String email) {
        String md5 = RNBackgroundToForegroundServiceModule.md5(email);
        // https://www.msgsafe.io/avatar/800db1bfa9d320575b1a7e489f79d441?s=50&d=404
        return "https://www.msgsafe.io/avatar/" + md5 + "?s=50&d=404";
    }
}
