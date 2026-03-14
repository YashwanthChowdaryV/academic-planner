// src/services/userService.js
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db, getUserProfile, createUserProfile } from "../firebase";

export { getUserProfile, createUserProfile };

export async function updateUserProfile(uid, updates) {
  await updateDoc(doc(db, "users", uid), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}
