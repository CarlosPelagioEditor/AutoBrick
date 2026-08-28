import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  projectId: "excellent-reflector-z9brs",
  appId: "1:66722248411:web:f5f906638afc171eef7efe",
  apiKey: "AIzaSyAYJaSGzWvNp4CJyl9tm1SWEbS7ZgBlLYY",
  authDomain: "excellent-reflector-z9brs.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-autobrickcopilot-e1142f7b-4afa-442f-936d-2f67d9887ed1",
  storageBucket: "excellent-reflector-z9brs.firebasestorage.app",
  messagingSenderId: "66722248411",
  oAuthClientId: "66722248411-h39fmc78erpsarpmvm1ccia4k4q778c8.apps.googleusercontent.com"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Use the specific firestore database ID configured if present
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

export const auth = getAuth(app);
export default app;
