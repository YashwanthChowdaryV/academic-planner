// src/services/goalService.js
import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";

const getGoalsCollection = (uid) => collection(db, "users", uid, "goals");

export const createGoal = async (uid, goalData) => {
  try {
    const goalsCol = getGoalsCollection(uid);
    const docRef = await addDoc(goalsCol, {
      ...goalData,
      progress: 0,
      completed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { id: docRef.id, ...goalData };
  } catch (error) {
    console.error("Error creating goal:", error);
    throw error;
  }
};

export const getGoals = async (uid) => {
  try {
    const goalsCol = getGoalsCollection(uid);
    const q = query(goalsCol, orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error("Error fetching goals:", error);
    throw error;
  }
};

export const updateGoal = async (uid, goalId, goalData) => {
  try {
    const goalDoc = doc(db, "users", uid, "goals", goalId);
    await updateDoc(goalDoc, {
      ...goalData,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error("Error updating goal:", error);
    throw error;
  }
};

export const deleteGoal = async (uid, goalId) => {
  try {
    const goalDoc = doc(db, "users", uid, "goals", goalId);
    await deleteDoc(goalDoc);
  } catch (error) {
    console.error("Error deleting goal:", error);
    throw error;
  }
};
