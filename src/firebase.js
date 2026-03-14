// src/firebase.js
// ─────────────────────────────────────────────────────────────
// SETUP: Create a .env file in project root with your Firebase config:
//
//   REACT_APP_FIREBASE_API_KEY=your_api_key
//   REACT_APP_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
//   REACT_APP_FIREBASE_PROJECT_ID=your_project_id
//   REACT_APP_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
//   REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
//   REACT_APP_FIREBASE_APP_ID=your_app_id
// ─────────────────────────────────────────────────────────────

import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCNw-IzIfNSs2hXKnU4_Jh3kqSEUYAupZA",
  authDomain: "aiagent-a0a84.firebaseapp.com",
  projectId: "aiagent-a0a84",
  storageBucket: "aiagent-a0a84.firebasestorage.app",
  messagingSenderId: "52178677620",
  appId: "1:52178677620:web:d742a5fd4112211880c621",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// ── Profile helpers ────────────────────────────────────────────

export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? snap.data() : null;
}

export async function createUserProfile(uid, data) {
  await setDoc(
    doc(db, "users", uid),
    { ...data, createdAt: serverTimestamp() },
    { merge: true }
  );
}

// ── Re-export Auth helpers ─────────────────────────────────────
export {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
