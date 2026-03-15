// src/services/sessionService.js
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  orderBy, 
  limit 
} from "firebase/firestore";
import { db } from "../firebase";
import { recalculateStats } from "./statsService";

const COLLECTION_NAME = "studySessions";

/**
 * Saves a new study session to Firestore.
 */
export async function saveStudySession(uid, sessionData) {
  try {
    const colRef = collection(db, "users", uid, COLLECTION_NAME);
    const docRef = await addDoc(colRef, {
      ...sessionData,
      createdAt: serverTimestamp()
    });
    // Trigger stats update
    recalculateStats(uid).catch(console.error);
    return docRef.id;
  } catch (error) {
    console.error("Error saving study session:", error);
    throw error;
  }
}

/**
 * Fetches study sessions for a specific user.
 */
export async function getStudySessions(uid, maxCount = 50) {
  try {
    const colRef = collection(db, "users", uid, COLLECTION_NAME);
    const q = query(colRef, orderBy("createdAt", "desc"), limit(maxCount));
    const querySnapshot = await getDocs(q);
    const sessions = [];
    querySnapshot.forEach((doc) => {
      sessions.push({ id: doc.id, ...doc.data() });
    });
    return sessions;
  } catch (error) {
    console.error("Error fetching study sessions:", error);
    throw error;
  }
}

/**
 * Deletes a study session.
 */
export async function deleteStudySession(uid, sessionId) {
  try {
    const docRef = doc(db, "users", uid, COLLECTION_NAME, sessionId);
    await deleteDoc(docRef);
    // Trigger stats update
    recalculateStats(uid).catch(console.error);
  } catch (error) {
    console.error("Error deleting study session:", error);
    throw error;
  }
}
