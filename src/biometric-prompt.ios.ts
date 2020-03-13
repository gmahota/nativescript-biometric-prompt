import { BiometricPromptApi } from './biometric-prompt.common';

export class BiometricPrompt implements BiometricPromptApi {
    isAuth: boolean;
    onAuthenticationSucceeded(result: any): Promise<void> {
        throw new Error("Method not implemented.");
    }
    available(): Promise<import("./biometric-prompt.common").BiometricIDAvailableResult> {
        throw new Error("Method not implemented.");
    }
    authDialog(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    useCustomUI(): boolean {
        throw new Error("Method not implemented.");
    }
    storeDataWithFingerprint(keystoreKeyAlias: string, data: string, biometricMessage: string): Promise<void> {
        throw new Error("Method not implemented.");
    }
    retrieveDataWithFingerprint(keystoreKeyAlias: string, biometricPromptMessage: string): Promise<string> {
        throw new Error("Method not implemented.");
    }
    fingerprintEncryptedDataExists(keystoreKeyAlias: string): boolean {
        throw new Error("Method not implemented.");
    }
    deleteFingerprintEncryptedData(keystoreKeyAlias: string): void {
        throw new Error("Method not implemented.");
    }
    cleanup(): void {
        throw new Error("Method not implemented.");
    }
    


}
