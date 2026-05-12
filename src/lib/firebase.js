// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC2Sc7T2VwaxEuvHa8887eqjKVAP8suHpM",
  authDomain: "cloud-to-do-app-9d5c4.firebaseapp.com",
  projectId: "cloud-to-do-app-9d5c4",
  storageBucket: "cloud-to-do-app-9d5c4.firebasestorage.app",
  messagingSenderId: "684544067758",
  appId: "1:684544067758:web:6944edf90f5e64f47e453f",
  measurementId: "G-QZTDE6QQ49"
};

// Initialize Firebase (prevent multiple initializations in Next.js)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize Analytics only on the client side
let analytics;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}