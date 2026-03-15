// src/services/extendedService.js
import { doc, setDoc, getDoc, serverTimestamp, updateDoc, collection, query, getDocs, orderBy, limit, addDoc } from "firebase/firestore";
import { db } from "../firebase";

/**
 * Saves a timestamp when a phase is completed.
 * This extends the existing progress document without breaking it.
 */
export async function savePhaseTimestamp(uid, planId, phaseIndex) {
  const ref = doc(db, "users", uid, "progress", planId);
  const key = `timestamps.${phaseIndex}`;
  await setDoc(ref, {
    [key]: new Date().toISOString()
  }, { merge: true });
}

export async function removePhaseTimestamp(uid, planId, phaseIndex) {
  const ref = doc(db, "users", uid, "progress", planId);
  const key = `timestamps.${phaseIndex}`;
  // Setting it to null to mark it incomplete instead of deleting the field completely
  // which might be trickier with mere merge queries, but string empty is safe.
  await setDoc(ref, {
    [key]: ""
  }, { merge: true });
}

export async function savePlanRating(uid, planId, rating) {
  const ref = doc(db, "users", uid, "plans", planId);
  await updateDoc(ref, {
    rating
  });
}

export async function saveGlobalNote(uid, planId, text) {
  const ref = doc(db, "users", uid, "planNotes", planId);
  const snap = await getDoc(ref);
  await setDoc(ref, {
    text,
    updatedAt: serverTimestamp(),
    createdAt: snap.exists() ? snap.data().createdAt : serverTimestamp(),
  }, { merge: true });
}

export async function getGlobalNote(uid, planId) {
  const ref = doc(db, "users", uid, "planNotes", planId);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data().text || "" : "";
}

/**
 * Updates the user's login streak based on lastActive date.
 * Returns the current streak object.
 */
export async function updateUserStreak(uid) {
  const ref = doc(db, "users", uid, "stats", "streak");
  const snap = await getDoc(ref);
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0]; // YYYY-MM-DD

  if (!snap.exists()) {
    const newData = { streak: 1, lastActive: todayStr };
    await setDoc(ref, newData);
    return newData;
  }

  const data = snap.data();
  if (data.lastActive === todayStr) {
    return data; // already logged in today
  }

  const lastActiveDate = new Date(data.lastActive);
  const diffTime = Math.abs(now - lastActiveDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = data.streak;
  if (diffDays === 1) {
    newStreak += 1;
  } else {
    // If diff is greater than 1, they missed a day
    newStreak = 1;
  }

  const newData = { streak: newStreak, lastActive: todayStr };
  await updateDoc(ref, newData);
  return newData;
}

// ── Daily Tracker ──────────────────────────────────────────────

export async function saveDailyLog(uid, dateStr, hours) {
  const ref = doc(db, "users", uid, "dailyLogs", dateStr);
  await setDoc(ref, {
    hours: Number(hours),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getDailyLogs(uid) {
  const q = query(collection(db, "users", uid, "dailyLogs"), orderBy("updatedAt", "desc"), limit(100));
  const snap = await getDocs(q);
  const logs = {};
  snap.forEach(d => {
    logs[d.id] = d.data().hours || 0;
  });
  return logs;
}

// ── Settings ───────────────────────────────────────────────────

export async function saveSettings(uid, settings) {
  const ref = doc(db, "users", uid, "settings", "prefs");
  await setDoc(ref, {
    ...settings,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getSettings(uid) {
  const ref = doc(db, "users", uid, "settings", "prefs");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { dailyReminderTime: "09:00", emailNotifications: false };
}

// ── Activity Logs ──────────────────────────────────────────────

export async function logActivity(uid, type, description, detail = "") {
  try {
    const col = collection(db, "users", uid, "activityLogs");
    await addDoc(col, {
      type,
      description,
      detail,
      timestamp: new Date().toISOString(),
      createdAt: serverTimestamp()
    });
  } catch (e) {
    // Non-critical — silently fail
  }
}

export async function getActivityLogs(uid) {
  const q = query(collection(db, "users", uid, "activityLogs"), orderBy("createdAt", "desc"), limit(50));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
