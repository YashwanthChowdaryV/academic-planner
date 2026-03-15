// src/services/reminderService.js
import { db } from "../firebase";
import { 
  doc, 
  getDoc, 
  updateDoc 
} from "firebase/firestore";

const getPreferencesRef = (uid) => doc(db, "users", uid, "settings", "prefs");

/**
 * Get user reminder preferences
 */
export const getPreferences = async (uid) => {
  try {
    const settingsRef = getPreferencesRef(uid);
    const docSnap = await getDoc(settingsRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        remindersEnabled: data.remindersEnabled ?? false,
        reminderTimes: data.reminderTimes || (data.dailyReminderTime ? [data.dailyReminderTime] : ["09:00"]),
        smartReminders: data.smartReminders ?? true,
        lastDismissed: data.lastDismissed || null
      };
    }
    // Default preferences
    return {
      remindersEnabled: false,
      reminderTimes: ["09:00"],
      smartReminders: true,
      lastDismissed: null
    };
  } catch (error) {
    console.error("Error fetching preferences:", error);
    return null;
  }
};

/**
 * Save user reminder preferences
 */
export const savePreferences = async (uid, preferences) => {
  try {
    const settingsRef = getPreferencesRef(uid);
    await updateDoc(settingsRef, {
      ...preferences,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error("Error saving preferences:", error);
    throw error;
  }
};

/**
 * Check if a reminder should be shown now
 */
export const shouldShowReminder = (preferences, studySessions = []) => {
  if (!preferences || !preferences.remindersEnabled) return false;
  
  const now = new Date();
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  
  // 1. Check if user dismissed it in the last 4 hours
  if (preferences.lastDismissed) {
    const lastDismissed = new Date(preferences.lastDismissed);
    const hoursSinceDismissal = (now - lastDismissed) / (1000 * 60 * 60);
    if (hoursSinceDismissal < 4) return false;
  }

  // 2. Exact match with set reminder times (allow 30 min window)
  const isTimeForReminder = (preferences.reminderTimes || []).some(time => {
    const [h, m] = time.split(':').map(Number);
    const diff = (currentHour * 60 + currentMinute) - (h * 60 + m);
    return diff >= 0 && diff <= 30;
  });

  if (isTimeForReminder) return { type: "scheduled", message: "It's time for your scheduled study session!" };

  // 3. Smart suggestion based on habits (if user usually studies at this hour)
  if (preferences.smartReminders && studySessions.length > 5) {
    const hourCounts = {};
    studySessions.slice(0, 20).forEach(session => {
      if (session.startTime) {
        const h = new Date(session.startTime).getHours();
        hourCounts[h] = (hourCounts[h] || 0) + 1;
      }
    });
    
    // If user studies at this hour > 30% of their sessions
    if (hourCounts[currentHour] > studySessions.length * 0.3) {
      return { type: "smart", message: "You usually study around this time. Ready to build momentum?" };
    }
  }

  return null;
};
