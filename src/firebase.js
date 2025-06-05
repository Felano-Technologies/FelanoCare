// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getFunctions } from "firebase/functions";
import { getAI, getGenerativeModel, GoogleAIBackend } from "firebase/ai";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGnymwLaKEfPBPt4zBfz23YG1nr2yyFr8",
  authDomain: "felanocare.firebaseapp.com",
  projectId: "felanocare",
  storageBucket: "felanocare.firebasestorage.app",
  messagingSenderId: "773128365527",
  appId: "1:773128365527:web:9b19b8765237ce69361792",
  measurementId: "G-6T2FDHMP30"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const functions = getFunctions(app);

// Initialize the Gemini Developer API backend service
const ai = getAI(app, { backend: new GoogleAIBackend() });

// Create a `GenerativeModel` instance with a model that supports your use case
const generativeModel = getGenerativeModel(ai, { model: "gemini-2.0-flash" })


export { app, auth, db, analytics, functions, generativeModel };
// Export the Firebase app, auth, db, and analytics instances for use in other parts of the application