// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCqiAH3I8UgpCM_uxEqG6W0b-Cok-19ny4",
  authDomain: "erabanyu-31482.firebaseapp.com",
  projectId: "erabanyu-31482",
  storageBucket: "erabanyu-31482.firebasestorage.app",
  messagingSenderId: "1008870200132",
  appId: "1:1008870200132:web:df39176e64e9ca5c973d11",
  measurementId: "G-Z9DQQ6H2X8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

// Initialize Analytics only on client side
let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

export { app, db, analytics };