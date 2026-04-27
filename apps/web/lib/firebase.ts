// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDFWdu_BBIClLzTWt2544CYWBZx_OOPXXw",
  authDomain: "smart-agritech-8122a.firebaseapp.com",
  projectId: "smart-agritech-8122a",
  storageBucket: "smart-agritech-8122a.firebasestorage.app",
  messagingSenderId: "23991014442",
  appId: "1:23991014442:web:9c58104d06715f85fc1f53",
  measurementId: "G-75098W6M5G"
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);

// Initialize Analytics if supported
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      getAnalytics(app);
    }
  });
}

export { app, auth };