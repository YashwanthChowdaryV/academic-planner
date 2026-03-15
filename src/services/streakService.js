// src/services/streakService.js
import { db } from "../firebase";
import { 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp,
  getDoc
} from "firebase/firestore";

/**
 * Define available milestones
 */
export const MILESTONES = [
  { id: "first_session", title: "First Step", description: "Complete your first study session", icon: "🚀", target: 1, category: "sessions" },
  { id: "five_sessions", title: "Getting Serious", description: "Complete 5 study sessions", icon: "📚", target: 5, category: "sessions" },
  { id: "ten_hours", title: "Time Invested", description: "Study for a total of 10 hours", icon: "⏳", target: 10, category: "hours" },
  { id: "plan_master", title: "Plan Master", description: "Complete 3 full study plans", icon: "🏆", target: 3, category: "plans" },
  { id: "week_streak", title: "Unstoppable", description: "Maintain a 7-day study streak", icon: "🔥", target: 7, category: "streak" },
  { id: "fifty_hours", title: "Scholar", description: "Study for a total of 50 hours", icon: "🎓", target: 50, category: "hours" }
];

/**
 * Check and update milestones based on user stats
 */
export const checkMilestones = async (uid, stats) => {
  if (!stats) return [];
  
  try {
    const milestonesRef = collection(db, "users", uid, "milestones");
    const snapshot = await getDocs(milestonesRef);
    const achievedIds = snapshot.docs.map(d => d.id);
    
    const newAchievements = [];
    
    for (const m of MILESTONES) {
      if (achievedIds.includes(m.id)) continue;
      
      let currentVal = 0;
      switch (m.category) {
        case "sessions": currentVal = stats.totalSessions || 0; break;
        case "hours": currentVal = stats.totalHours || 0; break;
        case "plans": currentVal = stats.completedPlans || 0; break;
        case "streak": currentVal = stats.longestStreak || 0; break;
        default: break;
      }
      
      if (currentVal >= m.target) {
        const achievementRef = doc(db, "users", uid, "milestones", m.id);
        const achievementData = {
          ...m,
          achievedAt: serverTimestamp(),
          valueAtAchievement: currentVal
        };
        await setDoc(achievementRef, achievementData);
        newAchievements.push(achievementData);
      }
    }
    
    return newAchievements;
  } catch (error) {
    console.error("Error checking milestones:", error);
    return [];
  }
};

/**
 * Get all achieved milestones for a user
 */
export const getAchievedMilestones = async (uid) => {
  try {
    const milestonesRef = collection(db, "users", uid, "milestones");
    const snapshot = await getDocs(milestonesRef);
    return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching milestones:", error);
    return [];
  }
};
