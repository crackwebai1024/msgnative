package io.msgsafe.android;


import android.support.multidex.MultiDexApplication;

import com.facebook.react.ReactApplication;
import com.reactnativecommunity.webview.RNCWebViewPackage;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;
import com.facebook.react.bridge.ReadableNativeArray;
import com.facebook.react.bridge.ReadableNativeMap;
import com.facebook.soloader.SoLoader;

import com.ocetnik.timer.BackgroundTimerPackage;
import com.alinz.parkerdan.shareextension.SharePackage;
import com.cmcewen.blurview.BlurViewPackage;

import in.sriraman.sharedpreferences.RNSharedPreferencesReactPackage;
import io.rnkit.actionsheetpicker.ASPickerViewPackage;
import com.reactnativedocumentpicker.ReactNativeDocumentPicker;
import com.evollu.react.fcm.FIRMessagingPackage;
import com.opensettings.OpenSettingsPackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.rnfs.RNFSPackage;
import com.imagepicker.ImagePickerPackage;
import com.oney.WebRTCModule.WebRTCModulePackage;
import com.oblador.vectoricons.VectorIconsPackage;
import com.zmxv.RNSound.RNSoundPackage;

import cl.json.RNSharePackage;

import com.rngrp.RNGRPPackage;

import org.pgsqlite.SQLitePluginPackage;

import org.libsodium.rn.RCTSodiumPackage;

import com.dylanvann.fastimage.FastImageViewPackage;
import com.BV.LinearGradient.LinearGradientPackage;
import com.oblador.keychain.KeychainPackage;
import com.corbt.keepawake.KCKeepAwakePackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.rt2zz.reactnativecontacts.ReactNativeContacts;
import com.lugg.ReactNativeConfig.ReactNativeConfigPackage;
import com.bugsnag.BugsnagReactNative;
import com.reactlibrary.RNBackgroundToForegroundServicePackage;

import java.util.Arrays;
import java.util.List;

// import coelib.c.couluslibrary.plugin.NetworkSurvey;

public class MainApplication extends MultiDexApplication
implements ReactApplication {

    private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
            return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
            return Arrays.<ReactPackage>asList(
                    new MainReactPackage(),
                    new RNCWebViewPackage(),
                    new BackgroundTimerPackage(),
                    new SharePackage(),
                    new SQLitePluginPackage(),
                    new BlurViewPackage(),
                    new ASPickerViewPackage(),
                    new ReactNativeDocumentPicker(),
                    new FIRMessagingPackage(),
                    new OpenSettingsPackage(),
                    new MapsPackage(),
                    new RNFSPackage(),
                    new ImagePickerPackage(),
                    new WebRTCModulePackage(),
                    new VectorIconsPackage(),
                    new RNSoundPackage(),
                    new RCTSodiumPackage(),
                    new LinearGradientPackage(),
                    new KeychainPackage(),
                    new KCKeepAwakePackage(),
                    new RNDeviceInfo(),
                    new FastImageViewPackage(),
                    new ReactNativeContacts(),
                    new ReactNativeConfigPackage(),
                    new RNBackgroundToForegroundServicePackage(),
                    new RNSharePackage(),
                    new RNGRPPackage(),
                    new PinNetworkingPackage(),
                    new RNSharedPreferencesReactPackage(),
                    BugsnagReactNative.getPackage()
            );
        }
    };

    // private NetworkSurvey mySurvey;

    @Override
    public ReactNativeHost getReactNativeHost() {
        return mReactNativeHost;
    }

    @Override
    public void onCreate() {
        super.onCreate();

        BugsnagReactNative.start(this);
        
//        mySurvey = new NetworkSurvey(this);
//        mySurvey.runMeasuresLib();

        SoLoader.init(this, /* native exopackage */ false);

        ReadableNativeArray.setUseNativeAccessor(true);
        ReadableNativeMap.setUseNativeAccessor(true);
    }

//    @Override
//    public void onDestroy() {
//        super.onDestroy();
//        mySurvey.unregister(this);
//    }

    public void stopNetworkSurvey() {
        //mySurvey.unregister(this);
    }
}
