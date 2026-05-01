// config/firebase.js
const admin = require("firebase-admin");
require("dotenv").config();
const serviceAccount = process.env.NODE_ENV == 'production'? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT): require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore(); // or admin.database()

module.exports = { admin, db };