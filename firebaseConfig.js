// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "🔥YOUR🔥API🔥KEY",
  authDomain: "mission1-f5306.firebaseapp.com",
  databaseURL: "https://mission1-f5306-default-rtdb.asia-southeast1.firebasedatabase.app", // ✅ SUPER CORRECT!
  projectId: "mission1-f5306",
  storageBucket: "mission1-f5306.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
export const dbFirestore = getFirestore(app);
