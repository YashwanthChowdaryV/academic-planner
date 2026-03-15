// src/services/statsService.js
import { 
  doc, 
  getDoc, 
  setDoc, 
  collection, 
  getDocs, 
  serverTimestamp 
} from "firebase/firestore";
import { db } from "../firebase";

const STATS_PATH = "stats/summary";

/**
 * Recalculates all user stats by scanning plans and sessions.
 * This ensures data consistency.
 */
export async function recalculateStats(uid) {
  try {
    const plansRef = collection(db, "users", uid, "plans");
    const sessionsRef = collection(db, "users", uid, "studySessions");
    const streakRef = doc(db, "users", uid, "stats", "streak");

    const [plansSnap, sessionsSnap, streakSnap] = await Promise.all([
      getDocs(plansRef),
      getDocs(sessionsRef),
      getDoc(streakRef)
    ]);

    const totalPlans = plansSnap.size;
    const totalSessions = sessionsSnap.size;
    
    let totalSeconds = 0;
    sessionsSnap.forEach(doc => {
      totalSeconds += (doc.data().duration || 0);
    });

    const totalHours = parseFloat((totalSeconds / 3600).toFixed(2));
    const streakData = streakSnap.exists() ? streakSnap.data() : { streak: 0 };
    
    // Average hours per session
    const avgHours = totalSessions > 0 ? parseFloat((totalHours / totalSessions).toFixed(2)) : 0;

    const statsData = {
      totalPlans,
      totalSessions,
      totalHours,
      avgHours,
      longestStreak: streakData.streak || 0,
      updatedAt: serverTimestamp()
    };

    const statsRef = doc(db, "users", uid, STATS_PATH);
    await setDoc(statsRef, statsData, { merge: true });
    
    return statsData;
  } catch (error) {
    console.error("Error recalculating stats:", error);
    throw error;
  }
}

/**
 * Gets the current stats summary for a user.
 */
export async function getUserStats(uid) {
  try {
    const statsRef = doc(db, "users", uid, STATS_PATH);
    const snap = await getDoc(statsRef);
    if (snap.exists()) {
      return snap.data();
    }
    // If not exists, trigger first calculation
    return await recalculateStats(uid);
  } catch (error) {
    console.error("Error getting user stats:", error);
    return {
      totalPlans: 0,
      totalSessions: 0,
      totalHours: 0,
      avgHours: 0,
      longestStreak: 0
    };
  }
}
