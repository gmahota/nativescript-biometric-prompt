import * as utils from "tns-core-modules/utils/utils";
import { BiometricIDAvailableResult, ERROR_CODES, BiometricPromptApi } from './biometric-prompt.common';


export class CancelSignal extends android.os.CancellationSignal{
    constructor() {
        super();

        return global.__native(this);
    }

    cancel(): void {
        super.cancel();

        console.log("OnCreate() called");

    }
    isCanceled(): any{
        super.isCanceled();
    }
    
	throwIfCanceled(): void{
        super.throwIfCanceled();
    }
    
    setOnCancelListener(param0: android.os.CancellationSignal.OnCancelListener): void{
        super.setOnCancelListener(param0);
    }
}

export class AuthenticationCallback extends android.hardware.biometrics.BiometricPrompt.AuthenticationCallback{
    onAuthenticationHelp(number, param1) {

    }
onAuthenticationSucceeded(result) {

    }

onAuthenticationFailed() { }

onAuthenticationError(param0, param1) {

    }
}
                       

export class BiometricPrompt extends android.hardware.biometrics.BiometricPrompt.AuthenticationCallback implements BiometricPromptApi {

    private biometricApi: android.hardware.biometrics.BiometricPrompt;
    private keyguardManager: any;
    private fingerprintManager: any;
    private keystoreKeyAlias: string;
    private data: string;
    private keyStore: java.security.KeyStore;
    private cipher: javax.crypto.Cipher;
    private cryptoObject: android.hardware.biometrics.BiometricPrompt.CryptoObject;
    private cipherInEncryptMode: boolean;
    private encryptionIv: any;
    private cancellationSignal: CancelSignal;

    private promiseResolve; // Used for async/callback from FingerprintManager, can be overwritten so don't be a fool with it
    private promiseReject; // Used for async/callback from FingerprintManager, can be overwritten so don't be a fool with it



    constructor() {
        super();

        this.keyguardManager = utils.ad.getApplicationContext().getSystemService("keyguard");

    }

    available(): Promise<BiometricIDAvailableResult> {
        this.stopListening(); // Somebody may be listening in, always stop listening before anything else
        return new Promise((resolve, reject) => {
            try {

                console.log("a");

                if (!this.keyguardManager || !this.keyguardManager.isKeyguardSecure()) {

                    // resolve({
                    //     any: false,
                    //     customUI: true,
                    //     touch:false
                    // });
                    //return;
                }

                // The fingerprint API is only available from Android 6.0 (M, Api level 23)
                if (android.os.Build.VERSION.SDK_INT < 23) {
                    reject(`Your api version doesn't support fingerprint authentication`);
                    return;
                }

                const fingerprintManager = utils.ad
                    .getApplicationContext()
                    .getSystemService(
                        "fingerprint"
                    ) as android.hardware.fingerprint.FingerprintManager;

                if (!fingerprintManager || !fingerprintManager.isHardwareDetected()) {

                    // Device doesn't support fingerprint authentication
                    reject(`Device doesn't support fingerprint authentication`);
                } else if (!fingerprintManager.hasEnrolledFingerprints()) {
                    // If the user has not enrolled any fingerprints, they still might have the device secure so we can fallback
                    // to present the user with the swipe, password, pin device security screen regardless
                    // the developer can handle this resolve by checking the `touch` property and determine if they want to use the
                    // verifyFingerprint method or not since they'll know the user has no finger prints enrolled but do have a security option enabled
                    // https://developer.android.com/reference/android/app/KeyguardManager.html#isDeviceSecure() only 23+
                    if (this.keyguardManager.isDeviceSecure()) {
                        console.log("ccc");
                        // resolve({
                        //     any: true,
                        //     customUI: true,
                        //     touch: false
                        // });
                    } else {
                        console.log("ddd");
                        // User hasn't enrolled any fingerprints to authenticate with
                        // reject(
                        //     `User hasn't enrolled any fingerprints to authenticate with`
                        // );
                    }
                } else {
                    console.log("ola - ddd");
                    // resolve({
                    //     any: true,
                    //     customUI: true,
                    //     touch: false
                    // });
                }
                console.log("ola - ccc");

                this.biometricApi = new android.hardware.biometrics.BiometricPrompt
                    .Builder(utils.ad.getApplicationContext())
                    .setTitle("Biometric Authentication")
                    .setSubtitle("Please authenticate to continue")
                    .setDescription("Fingerprinting in biometric authentication API is being tested.")
                    .setNegativeButton("Cancel", utils.ad.getApplicationContext().getMainExecutor(), new android.content.DialogInterface.OnClickListener({
                        onClick(a, b) {

                        }
                    }))
                    .build();
                
                // Authenticate with callback functions
                this.biometricApi.authenticate(new android.os.CancellationSignal(),
                    utils.ad.getApplicationContext().getMainExecutor(),
                    this
                );

                resolve({
                    any: true,
                    touch: true,
                    customUI: true
                });


            } catch (ex) {
                console.log(`fingerprint-auth.available: ${ex}`);
                reject(ex);
            }
        });
    }

    useCustomUI(): boolean {
        return true;
    }

    authDialog(): Promise<void> {
        this.stopListening();
        console.log("Ola 1");
        return new Promise((resolve, reject) => {
            try {
                console.log("Ola 1");

            } catch (ex) {
                console.trace(ex);
                reject({
                    code: ERROR_CODES.DEVELOPER_ERROR,
                    message: ex.message,
                });
            }
        });
    }

    storeDataWithFingerprint(keystoreKeyAlias: string, data: string, biometricMessage: string): Promise<void> {
        this.stopListening(); // Somebody may be listening in, always stop listening before anything else
        return new Promise((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
            try {
                this.keystoreKeyAlias = keystoreKeyAlias;
                this.data = data;
                this.cipherInEncryptMode = true;
                this.createKey(keystoreKeyAlias);
                this.startListening();
            } catch (ex) {
                console.trace(ex);
                this.deleteFingerprintEncryptedData(keystoreKeyAlias);
                reject({
                    code: ERROR_CODES.DEVELOPER_ERROR,
                    message: ex.message,
                });
            }
        });
    }

    retrieveDataWithFingerprint(keystoreKeyAlias: string, biometricPromptMessage: string): Promise<string> {
        this.stopListening(); // Somebody may be listening in, always stop listening before anything else
        return new Promise((resolve, reject) => {
            this.promiseResolve = resolve;
            this.promiseReject = reject;
            try {
                this.cipherInEncryptMode = false;
                this.keystoreKeyAlias = keystoreKeyAlias;
                this.startListening();
            } catch (ex) {
                this.deleteFingerprintEncryptedData(keystoreKeyAlias);
                reject({
                    code: ERROR_CODES.DEVELOPER_ERROR,
                    message: ex.message,
                });
            }
        });
    }

    fingerprintEncryptedDataExists(keystoreKeyAlias: string): boolean {
        this.stopListening(); // Somebody may be listening in, always stop listening before anything else
        this.keystoreKeyAlias = keystoreKeyAlias;
        const preferences = android.preference.PreferenceManager.getDefaultSharedPreferences(utils.ad.getApplicationContext());
        return preferences.contains(BiometricPrompt.name + this.keystoreKeyAlias);
    }

    deleteFingerprintEncryptedData(keystoreKeyAlias: string): void {
        this.stopListening(); // Somebody may be listening in, always stop listening before anything else
        this.keystoreKeyAlias = keystoreKeyAlias;
        const preferences = android.preference.PreferenceManager.getDefaultSharedPreferences(utils.ad.getApplicationContext());
        preferences.edit().remove(BiometricPrompt.name + this.keystoreKeyAlias).apply();
    }

    cleanup(): void {
        this.stopListening();
    }

    private createKey(keystoreKeyAlias: string): void {
        try {
            this.keyStore = java.security.KeyStore.getInstance('AndroidKeyStore');
            this.keyStore.load(null);
            const keyGenerator = javax.crypto.KeyGenerator.getInstance(android.security.keystore.KeyProperties.KEY_ALGORITHM_AES, 'AndroidKeyStore');

            keyGenerator.init(new android.security.keystore.KeyGenParameterSpec.Builder(keystoreKeyAlias, android.security.keystore.KeyProperties.PURPOSE_ENCRYPT | android.security.keystore.KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes([android.security.keystore.KeyProperties.BLOCK_MODE_CBC])
                .setEncryptionPaddings([android.security.keystore.KeyProperties.ENCRYPTION_PADDING_PKCS7])
                .setKeySize(256)
                .build());

            keyGenerator.generateKey();

            console.log("Key created in Keystore");
        } catch (ex) {
            console.trace(ex);
            this.promiseReject({
                code: ERROR_CODES.DEVELOPER_ERROR,
                message: ex.message,
            });
        }
    }

    private initCipher(mode: number, keystoreKeyAlias: string): void {
        try {
            this.keyStore = java.security.KeyStore.getInstance('AndroidKeyStore');
            this.keyStore.load(null);
            const key = this.keyStore.getKey(keystoreKeyAlias, null);
            this.cipher = javax.crypto.Cipher.getInstance(`${android.security.keystore.KeyProperties.KEY_ALGORITHM_AES}/${android.security.keystore.KeyProperties.BLOCK_MODE_CBC}/${android.security.keystore.KeyProperties.ENCRYPTION_PADDING_PKCS7}`);
            this.cryptoObject = new android.hardware.biometrics.BiometricPrompt.CryptoObject(this.cipher);
            if (mode === javax.crypto.Cipher.ENCRYPT_MODE) {
                this.cipher.init(javax.crypto.Cipher.ENCRYPT_MODE, key);
            } else {
                if (key != null) {
                    const preferences = android.preference.PreferenceManager.getDefaultSharedPreferences(utils.ad.getApplicationContext());
                    const ivString = preferences.getString(BiometricPrompt.name + keystoreKeyAlias + "_encryption_iv", null);
                    if (ivString != null) {
                        const javaString = new java.lang.String(new java.lang.StringBuffer(ivString));
                        this.encryptionIv = android.util.Base64.decode(javaString.getBytes("UTF-8"), android.util.Base64.DEFAULT);
                        this.cipher.init(javax.crypto.Cipher.DECRYPT_MODE, key, new javax.crypto.spec.IvParameterSpec(this.encryptionIv));
                    }
                } else {
                    this.promiseReject({
                        code: ERROR_CODES.DEVELOPER_ERROR,
                        message: "IV not found while decrypting.",
                    });
                }
            }
        } catch (ex) {
            console.trace(ex);
            if (ex instanceof android.security.keystore.KeyPermanentlyInvalidatedException) {
                this.promiseReject({
                    code: ERROR_CODES.TAMPERED_WITH,
                    message: ex.getMessage(),
                });
            } else {
                this.promiseReject({
                    code: ERROR_CODES.DEVELOPER_ERROR,
                    message: ex.message,
                });
            }
        }
    }

    private tryEncrypt(secret: java.lang.String): void {
        try {
            this.encryptionIv = this.cipher.getIV();
            const encrypted = new java.lang.String(android.util.Base64.encode(this.cipher.doFinal(secret.getBytes("UTF-8")), android.util.Base64.DEFAULT), "UTF-8").toString();
            const preferences = android.preference.PreferenceManager.getDefaultSharedPreferences(utils.ad.getApplicationContext());
            // Store IV alongside encrypted data because we need it for decryption. IV makes it harder to decipher the  for a hacker with access to the device data
            const ivString = new java.lang.String(android.util.Base64.encode(this.encryptionIv, android.util.Base64.DEFAULT), "UTF-8").toString();
            preferences.edit().putString(BiometricPrompt.name + this.keystoreKeyAlias, encrypted).putString(BiometricPrompt.name + this.keystoreKeyAlias + "_encryption_iv", ivString).apply();
        } catch (ex) {
            console.trace(ex);
            this.promiseReject({
                code: ERROR_CODES.DEVELOPER_ERROR,
                message: ex.message,
            });
        }
    }

    private tryDecrypt(): string {
        try {
            const preferences = android.preference.PreferenceManager.getDefaultSharedPreferences(utils.ad.getApplicationContext());
            const sb = new java.lang.StringBuffer(preferences.getString(BiometricPrompt.name + this.keystoreKeyAlias, ""));
            const secret = android.util.Base64.decode(new java.lang.String(sb).getBytes("UTF-8"), android.util.Base64.DEFAULT);
            const decrypted = this.cipher.doFinal(secret);
            return new java.lang.String(decrypted, "UTF-8").toString();
        } catch (ex) {
            console.trace(ex);
            this.promiseReject({
                code: ERROR_CODES.DEVELOPER_ERROR,
                message: ex.message,
            });
        }
        return null;
    }

    private startListening() {
        this.cancellationSignal = new android.os.CancellationSignal();
        //android.hardware.biometrics.BiometricPrompt.authenticate(this.cryptoObject, this.cancellationSignal, 0 /* flags */, this, null);
    }

    private stopListening() {
        if (this.cancellationSignal != null) {
            this.cancellationSignal.cancel();
            this.cancellationSignal = null;
        }
    }

    // FingerprintManager.AuthenticationCallback callbacks

    public onAuthenticationError(errorCode: number, errString: string): void {
        this.promiseReject({
            code: ERROR_CODES.AUTHENTICATION_FAILED,
            message: errString,
            errorCode: errorCode
        });
    }

    public onAuthenticationHelp(helpCode: number, helpString: string) {
        if (helpCode === 1) {
            this.promiseReject({
                code: ERROR_CODES.RECOVERABLE_ERROR_FINGER_MUST_COVER_SENSOR,
                message: helpString
            });
        } else if (helpCode === 5) {
            this.promiseReject({
                code: ERROR_CODES.RECOVERABLE_ERROR_FINGER_MOVED_TO_FAST,
                message: helpString
            });
        } else {
            this.promiseReject({
                code: ERROR_CODES.RECOVERABLE_ERROR_BIOMETRICS_NOT_RECOGNIZED,
                message: helpString
            });
        }

    }

    public onAuthenticationSucceeded(result: android.hardware.biometrics.BiometricPrompt.AuthenticationResult) {
        
        console.log(JSON.stringify(result));

        console.log("ola1");
        // if (this.cipherInEncryptMode) {
        //     this.initCipher(javax.crypto.Cipher.ENCRYPT_MODE, this.keystoreKeyAlias);
        //     this.tryEncrypt(new java.lang.String(this.data));
        //     this.promiseResolve();

        // } else {
        //     this.initCipher(javax.crypto.Cipher.DECRYPT_MODE, this.keystoreKeyAlias);
        //     const decrypted = this.tryDecrypt();
        //     console.log(decrypted);
        //     this.promiseResolve(decrypted);
        // }
    }

    public onAuthenticationFailed() {
        console.log("ola2");
        // this.promiseReject({
        //     code: ERROR_CODES.AUTHENTICATION_FAILED,
        //     message: "Finger not recognized"
        // });
    }

}
