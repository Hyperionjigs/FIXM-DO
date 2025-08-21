import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// This is a public configuration and is safe to be exposed client-side.
// Security is handled by Firebase Security Rules.
const firebaseConfig = {
  apiKey: "AIzaSyCIxysqBJOfAFJeNm9K2iFc8-vTuyzKOxw",
  authDomain: "fixmo-ejgfh.firebaseapp.com",
  projectId: "fixmo-ejgfh",
  storageBucket: "fixmo-ejgfh.appspot.com",
  messagingSenderId: "252605014364",
  appId: "1:252605014364:web:8ba945a10cc67836a16199"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
