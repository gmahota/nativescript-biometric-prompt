<template>
  <Page>
    <ActionBar>
      <Label text="Home"></Label>
    </ActionBar>

    <StackLayout>
      <Label :text="infoMessage" class="h2 text-center" textWrap="true" />
      <TextField :text="secretText" />
      <Button text="Check if biometrics is available" @tap="available" />
      <Button text="Encrypt data with biometric" @tap="encryptData" />
      <Button text="Decrypt data with biometric" @tap="decryptData" />
      <Button text="Check if encrypted data exists" @tap="dataExists" />
      <Button text="Delete encrypted data" @tap="deleteData" />
    </StackLayout>
  </Page>
</template>

<script>
var biometricPromptPlugin = require("nativescript-biometric-prompt");
var biometricPrompt = new biometricPromptPlugin.BiometricPrompt();

export default {
  data() {
    return {
      useCustomUI: false,
      secretText: "Dette er hemmeligt",
      infoMessage: ""
    };
  },
  mounted() {
    // Remember to call "useCustomUI()" and show some UI that is indicating to the user that the device is awaiting a fingerprint.
    // biometricPrompt
    //   .storeDataWithFingerprint("ALIAS", "olamudnoaas", "Biometric Message")
    //   .then(function(result) {
    //     console.log("Your secret is safe with me");
    //     // You can now remove your custom biometrics UI
    //   })
    //   .catch(err => {
    //     console.log(
    //       "storeDataWithFingerprint error: " + err.code + ", " + err.message
    //     );
    //     // Inform the user of the error, that may or may not be recoverable, on your custom biometrics UI
    //   });
  },
  computed: {
    message() {
      return "Blank {N}-Vue app";
    }
  },
  methods: {
    available() {

      this.useCustomUI = false;
      this.infoMessage = ""; // Remove custom UI

      biometricPrompt
        .available()
        .then(function(result) {
          console.log("doCheckAvailable result: " + JSON.stringify(result));
          alert(JSON.stringify(result));
          //this.useCustomUI = result.customUI;
        })
        .catch(err => {
          console.log(
            "doCheckAvailable error: " + err.code + ", " + err.message
          );
          alert("Error: " + err.code + ", " + err.message);
        });
    },
    encryptData() {
      if (this.useCustomUI) {
        this.infoMessage = "Scan yer finger now"; // Show custom UI
      }
      biometricPrompt
        .storeDataWithFingerprint("ALIAS", this.secretText, "Biometric Message")
        .then(() => {
          console.log("storeDataWithFingerprint result: OK");
          //this.set("infoMessage", ""); // Remove custom UI
          dialogs.alert("storeDataWithFingerprint result: OK");
        })
        .catch(err => {
          console.log(
            "storeDataWithFingerprint error: " + err.code + ", " + err.message
          );
          this.set("infoMessage", ""); // Remove custom UI
          dialogs.alert("Error: " + err.code + ", " + err.message);
        });
    },

    encryptData() {
      if (this.useCustomUI) {
        this.infoMessage = "Scan yer finger now"; // Show custom UI
      }
      biometricPrompt
        .storeDataWithFingerprint("ALIAS", this.secretText, "Biometric Message")
        .then(function(result) {
          console.log("storeDataWithFingerprint result: OK");
          this.infoMessage = ""; // Remove custom UI
          alert("storeDataWithFingerprint result: OK");
        })
        .catch(err => {
          console.log(
            "storeDataWithFingerprint error: " + err.code + ", " + err.message
          );
          this.infoMessage = ""; // Remove custom UI
          alert("Error: " + err.code + ", " + err.message);
        });
    },

    decryptData() {
      if (this.useCustomUI) {
        this.infoMessage = "Scan yer finger now"; // Show custom UI
      }
      biometricPrompt
        .retrieveDataWithFingerprint("ALIAS", "PROMPT")
        .then(function(result) {
          console.log("retrieveDataWithFingerprint result: " + result);
          this.infoMessage = ""; // Remove custom UI
          alert("retrieveDataWithFingerprint result: " + result);
        })
        .catch(err => {
          console.log(
            "retrieveDataWithFingerprint error: " +
              err.code +
              ", " +
              err.message
          );
          this.infoMessage = ""; // Remove custom UI
          alert("Error: " + err.code + ", " + err.message);
        });
    },

    dataExists() {
      this.infoMessage = ""; // Remove custom UI
      if (biometricPrompt.fingerprintEncryptedDataExists("ALIAS")) {
        alert("Encrypted data exists - YES");
      } else {
        alert("Encrypted data exists - NO");
      }
    },

    deleteData() {
      this.infoMessage = ""; // Remove custom UI
      biometricPrompt.deleteFingerprintEncryptedData("ALIAS");
    },

    doCheckAvailable() {
      biometricPrompt.available().then(function(avail) {
        console.log("Available? " + avail);
      });
    },

    doCheckFingerprintsChanged() {
      biometricPrompt
        .verifyFingerprintWithCustomFallback({
          message: "Scan yer finger", // optional, shown in the fingerprint dialog (default: 'Scan your finger').
          fallbackMessage: "Enter PIN", // optional, the button label when scanning fails (default: 'Enter password').
          authenticationValidityDuration: 10 // optional (used on Android, default 5)
        })
        .then(
          () => {
            console.log("Fingerprint was OK");
          },
          error => {
            // when error.code === -3, the user pressed the button labeled with your fallbackMessage
            console.log(
              "Fingerprint NOT OK. Error code: " +
                error.code +
                ". Error message: " +
                error.message
            );
          }
        );
    },

    doVerifyFingerprintWithCustomFallback() {
      biometricPrompt
        .verifyFingerprintWithCustomFallback({
          message: "Scan yer finger", // optional
          fallbackMessage: "Enter PIN", // optional
          authenticationValidityDuration: 10 // Android
        })
        .then(() => this.set("status", "Biometric ID OK"))
        .catch(error => {
          this.set("status", "Biometric ID NOT OK: " + JSON.stringify(error));
          alert({
            title: "Biometric ID NOT OK",
            message: error.code === -3 ? "Show custom fallback" : error.message,
            okButtonText: "Mmkay"
          });
        });
    }
  }
};
</script>

<style scoped lang="scss">
@import "~@nativescript/theme/scss/variables/blue";

// Custom styles
.fas {
  @include colorize($color: accent);
}

.info {
  font-size: 20;
  vertical-align: center;
}
</style>
