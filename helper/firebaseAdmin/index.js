var admin = require("firebase-admin");
var serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://msgsafe-test.firebaseio.com"
});
var registrationToken = "APA91bEQ82pxLwI2qfE2_J3doeqR1p93ptEHDT-D7Flwwg8ShJ7JvooK4FatTI_Asj-M1UzitqLD_E67cf_502FdqpqRJeNsrQE36vV7I1KxnuQvrmjOKU4_kcbevMd5ies6YmrIxpZv";
var payload = {
	"notification": {
	    "icon": "icon",
	    "title": "test",
	    "body": "body"
  }
};

admin.messaging().sendToDevice(registrationToken, payload)
  .then(function(response) {
    // See the MessagingDevicesResponse reference documentation for
    // the contents of response.
    console.log("Successfully sent message:", response);
  })
  .catch(function(error) {
    console.log("Error sending message:", error);
  });