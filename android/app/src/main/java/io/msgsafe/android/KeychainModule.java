package io.msgsafe.android;

import android.app.Activity;
import android.content.Context;
import android.os.Build;
import android.support.annotation.NonNull;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;

import io.msgsafe.android.PrefsStorage;
import io.msgsafe.android.PrefsStorage.ResultSet;
import io.msgsafe.android.cipherStorage.CipherStorage;
import io.msgsafe.android.cipherStorage.CipherStorage.DecryptionResult;
import io.msgsafe.android.cipherStorage.CipherStorage.EncryptionResult;
import io.msgsafe.android.cipherStorage.CipherStorageFacebookConceal;
import io.msgsafe.android.cipherStorage.CipherStorageKeystoreAESCBC;

import com.oblador.keychain.exceptions.CryptoFailedException;
import com.oblador.keychain.exceptions.EmptyParameterException;
import com.oblador.keychain.exceptions.KeyStoreAccessException;
import com.oblador.keychain.DeviceAvailability;

import java.util.HashMap;
import java.util.Map;

public class KeychainModule {

    public static final String E_EMPTY_PARAMETERS = "E_EMPTY_PARAMETERS";
    public static final String E_CRYPTO_FAILED = "E_CRYPTO_FAILED";
    public static final String E_KEYSTORE_ACCESS_ERROR = "E_KEYSTORE_ACCESS_ERROR";
    public static final String E_SUPPORTED_BIOMETRY_ERROR = "E_SUPPORTED_BIOMETRY_ERROR";
    public static final String KEYCHAIN_MODULE = "RNKeychainManager";
    public static final String FINGERPRINT_SUPPORTED_NAME = "Fingerprint";
    public static final String EMPTY_STRING = "";

    private final Map<String, CipherStorage> cipherStorageMap = new HashMap<>();
    private final PrefsStorage prefsStorage;
    private final Activity _activity;

    public KeychainModule(Context context, Activity activity) {
        this._activity = activity;
        prefsStorage = new PrefsStorage(context);

        addCipherStorageToMap(new CipherStorageFacebookConceal(context));
        addCipherStorageToMap(new CipherStorageKeystoreAESCBC());
    }

    private void addCipherStorageToMap(CipherStorage cipherStorage) {
        cipherStorageMap.put(cipherStorage.getCipherStorageName(), cipherStorage);
    }

    @ReactMethod
    public void setGenericPasswordForOptions(String service, String username, String password, Promise promise) {
        try {
            if (username == null || username.isEmpty() || password == null || password.isEmpty()) {
                throw new EmptyParameterException("you passed empty or null username/password");
            }
            service = getDefaultServiceIfNull(service);

            CipherStorage currentCipherStorage = getCipherStorageForCurrentAPILevel();

            EncryptionResult result = currentCipherStorage.encrypt(service, username, password);
            prefsStorage.storeEncryptedEntry(service, result);

            promise.resolve(true);
        } catch (EmptyParameterException e) {
            Log.e(KEYCHAIN_MODULE, e.getMessage());
            promise.reject(E_EMPTY_PARAMETERS, e);
        } catch (CryptoFailedException e) {
            Log.e(KEYCHAIN_MODULE, e.getMessage());
            promise.reject(E_CRYPTO_FAILED, e);
        }
    }

    @ReactMethod
    public WritableMap getGenericPasswordForOptions(String service) {
        try {
            service = getDefaultServiceIfNull(service);

            CipherStorage currentCipherStorage = getCipherStorageForCurrentAPILevel();

            final DecryptionResult decryptionResult;
            ResultSet resultSet = prefsStorage.getEncryptedEntry(service);
            if (resultSet == null) {
                Log.e(KEYCHAIN_MODULE, "No entry found for service: " + service);
                return null;
            }

            if (resultSet.cipherStorageName.equals(currentCipherStorage.getCipherStorageName())) {
                // The encrypted data is encrypted using the current CipherStorage, so we just decrypt and return
                decryptionResult = currentCipherStorage.decrypt(service, resultSet.usernameBytes, resultSet.passwordBytes);
            } else {
                // The encrypted data is encrypted using an older CipherStorage, so we need to decrypt the data first, then encrypt it using the current CipherStorage, then store it again and return
                CipherStorage oldCipherStorage = getCipherStorageByName(resultSet.cipherStorageName);
                // decrypt using the older cipher storage
                decryptionResult = oldCipherStorage.decrypt(service, resultSet.usernameBytes, resultSet.passwordBytes);
                // encrypt using the current cipher storage
                EncryptionResult encryptionResult = currentCipherStorage.encrypt(service, decryptionResult.username, decryptionResult.password);
                // store the encryption result
                prefsStorage.storeEncryptedEntry(service, encryptionResult);
                // clean up the old cipher storage
                oldCipherStorage.removeKey(service);
            }

            WritableMap credentials = Arguments.createMap();

            credentials.putString("service", service);
            credentials.putString("username", decryptionResult.username);
            credentials.putString("password", decryptionResult.password);

            return credentials;
        } catch (KeyStoreAccessException e) {
            Log.e(KEYCHAIN_MODULE, e.getMessage());
            return null;
        } catch (CryptoFailedException e) {
            Log.e(KEYCHAIN_MODULE, e.getMessage());
            return null;
        }
    }

    @ReactMethod
    public void resetGenericPasswordForOptions(String service, Promise promise) {
        try {
            service = getDefaultServiceIfNull(service);

            // First we clean up the cipher storage (using the cipher storage that was used to store the entry)
            ResultSet resultSet = prefsStorage.getEncryptedEntry(service);
            if (resultSet != null) {
                CipherStorage cipherStorage = getCipherStorageByName(resultSet.cipherStorageName);
                if (cipherStorage != null) {
                    cipherStorage.removeKey(service);
                }
            }
            // And then we remove the entry in the shared preferences
            prefsStorage.removeEntry(service);

            promise.resolve(true);
        } catch (KeyStoreAccessException e) {
            Log.e(KEYCHAIN_MODULE, e.getMessage());
            promise.reject(E_KEYSTORE_ACCESS_ERROR, e);
        }
    }

    @ReactMethod
    public void setInternetCredentialsForServer(@NonNull String server, String username, String password, ReadableMap unusedOptions, Promise promise) {
        setGenericPasswordForOptions(server, username, password, promise);
    }

    @ReactMethod
    public void resetInternetCredentialsForServer(@NonNull String server, ReadableMap unusedOptions, Promise promise) {
        resetGenericPasswordForOptions(server, promise);
    }

    @ReactMethod
    public void getSupportedBiometryType(Promise promise) {
        try {
            boolean fingerprintAuthAvailable = isFingerprintAuthAvailable();
            if (fingerprintAuthAvailable) {
                promise.resolve(FINGERPRINT_SUPPORTED_NAME);
            } else {
                promise.resolve(null);
            }
        } catch (Exception e) {
            Log.e(KEYCHAIN_MODULE, e.getMessage());
            promise.reject(E_SUPPORTED_BIOMETRY_ERROR, e);
        }
    }

    // The "Current" CipherStorage is the cipherStorage with the highest API level that is lower than or equal to the current API level
    private CipherStorage getCipherStorageForCurrentAPILevel() throws CryptoFailedException {
        int currentAPILevel = Build.VERSION.SDK_INT;
        CipherStorage currentCipherStorage = null;
        for (CipherStorage cipherStorage : cipherStorageMap.values()) {
            int cipherStorageAPILevel = cipherStorage.getMinSupportedApiLevel();
            // Is the cipherStorage supported on the current API level?
            boolean isSupported = (cipherStorageAPILevel <= currentAPILevel);
            // Is the API level better than the one we previously selected (if any)?
            if (isSupported && (currentCipherStorage == null || cipherStorageAPILevel > currentCipherStorage.getMinSupportedApiLevel())) {
                currentCipherStorage = cipherStorage;
            }
        }
        if (currentCipherStorage == null) {
            throw new CryptoFailedException("Unsupported Android SDK " + Build.VERSION.SDK_INT);
        }
        return currentCipherStorage;
    }

    private CipherStorage getCipherStorageByName(String cipherStorageName) {
        return cipherStorageMap.get(cipherStorageName);
    }

    private boolean isFingerprintAuthAvailable() {
        return DeviceAvailability.isFingerprintAuthAvailable(_activity);
    }

    @NonNull
    private String getDefaultServiceIfNull(String service) {
        return service == null ? EMPTY_STRING : service;
    }
}
