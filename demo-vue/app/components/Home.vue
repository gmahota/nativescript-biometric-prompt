<template>
  <Page>
    <ActionBar>
      <Label text="I Clock - Picagem"></Label>
    </ActionBar>

    <StackLayout>
      <Label :text="infoMessage" class="h2 text-center" textWrap="true" />
      <!-- <TextField :text="secretText" /> -->

      <Button text="Check In" @tap="available" />
      <Button text="Check Out" @tap="available" />

      <Label :text="'Time: ' + time" class="font-weight-bold m-b-5" />
      <Label :text="'Latitude: ' + lat" class="font-weight-bold m-b-5" />
      <Label :text="'Longitude: ' + lon" class="font-weight-bold m-b-5" />
      <Label :text="'Speed: ' + speed" class="font-weight-bold m-b-5" />
      <Label :text="'Address: ' + addr" textWrap="true" class="font-weight-bold m-b-5" />
      <Label :text="'Sucess Time Track For - User Name: ' + user.name" class="font-weight-bold m-b-5" />

      <!-- <Button text="Encrypt data with biometric" @tap="encryptData" />
      <Button text="Decrypt data with biometric" @tap="decryptData" />
      <Button text="Check if encrypted data exists" @tap="dataExists" />
      <Button text="Delete encrypted data" @tap="deleteData" />-->
    </StackLayout>
  </Page>
</template>

<script>
import * as Geolocation from "nativescript-geolocation";

var biometricPromptPlugin = require("nativescript-biometric-prompt");

var biometricPrompt = new biometricPromptPlugin.BiometricPrompt();

export default {
  data() {
    return {
      useCustomUI: false,
      secretText: "Dette er hemmeligt",
      infoMessage: "",
      needLocation: false,
      locationFailure: true,
      lat: "",
      lon: "",
      speed: "",
      addr: "",
      time: "",
      message: "Attendance Record",
      img: "",
      pickedImage: null,
      user: { code: "", name: "" },
      touch: 0
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
    getLocation() {
      try {
        Geolocation.enableLocationRequest(true).then(() => {
          Geolocation.isEnabled().then(isLocationEnabled => {
            //console.log("result is " + isLocationEnabled);

            if (!isLocationEnabled) {
              this.needLocation = false;
              this.locationFailure = true;
              // potentially do more then just end here...
              return;
            }

            // MUST pass empty object!!
            Geolocation.getCurrentLocation({})
              .then(res => {
                var d = new Date();
                this.lat = res.latitude;
                this.lon = res.longitude;
                this.speed = res.speed;
                this.time =
                  d.getDate() +
                  "/" +
                  (d.getMonth() + 1) +
                  "/0" +
                  d.getFullYear() +
                  " " +
                  d.getHours() +
                  ":" +
                  d.getMinutes();
                // get the address (REQUIRES YOUR OWN GOOGLE MAP API KEY!)
                fetch(
                  "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
                    res.latitude +
                    "," +
                    res.longitude +
                    "&key=AIzaSyAHdHRPlDZfwVNhWBUYqFSzUvLSnddepsQ"
                )
                  .then(response => response.json())
                  .then(r => {
                    this.addr = r.results[0].formatted_address;
                  });
              })
              .catch(e => {
                console.log("loc error", e);
              });
          });
        });
      } catch (err) {
        alert({
          title: `Result`,
          message: JSON.stringify(err),
          okButtonText: "OK"
        });
      }
    },

    getUserName() {

      this.getLocation();

      if (this.user.code == "") {
        this.user = { code: "C001", name: "Guimarães Mahota" };
        return;
      }

      if (this.user.code == "C001") {
        this.user = { code: "C002", name: "Nelson Moiane" };
        return;
      }

      if (this.user.code == "C002") {
        this.user = { code: "C003", name: "Andre João" };
        return;
      }

      if (this.user.code == "C003") {
        this.user = { code: "C001", name: "Guimarães Mahota" };
        return;
      }
    },

    available() {
      this.useCustomUI = false;
      this.infoMessage = ""; // Remove custom UI

      biometricPrompt
        .available()
        .then(result => {
          console.log("doCheckAvailable result: " + JSON.stringify(result));

          biometricPrompt
            .onAuthenticationSucceeded({})
            .then(() => {})
            .catch(err => {
              console.log(
                "doCheckAvailable error: " + err.code + ", " + err.message
              );
              //alert("Error: " + err.code + ", " + err.message);
            });

          biometricPrompt.authDialog({}).then(() => {});

          //alert(JSON.stringify(result));
          //this.useCustomUI = result.customUI;
        })
        .catch(err => {
          console.log(
            "doCheckAvailable error: " + err.code + ", " + err.message
          );
          //alert("Error: " + err.code + ", " + err.message);
        });

      this.getUserName();
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
