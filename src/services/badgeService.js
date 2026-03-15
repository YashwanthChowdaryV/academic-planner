// src/services/badgeService.js
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export const BADGES = [
  {
    id: "first_plan",
    title: "First Step",
    description: "Created your first learning plan",
    icon: "🎯",
    color: "var(--primary)",
    bg: "var(--primary-soft)",
    check: (stats) => stats.totalPlans >= 1,
    goal: 1,
    progressKey: "totalPlans",
  },
  {
    id: "five_plans",
    title: "Go-Getter",
    description: "Created 5 learning plans",
    icon: "📚",
    color: "var(--secondary)",
    bg: "var(--secondary-soft)",
    check: (stats) => stats.totalPlans >= 5,
    goal: 5,
    progressKey: "totalPlans",
  },
  {
    id: "first_complete",
    title: "Finisher",
    description: "Completed your first plan 100%",
    icon: "🏆",
    color: "#d97706",
    bg: "#fef3c7",
    check: (stats) => stats.completedPlans >= 1,
    goal: 1,
    progressKey: "completedPlans",
  },
  {
    id: "streak_7",
    title: "Week Warrior",
    description: "Achieved a 7-day study streak",
    icon: "🔥",
    color: "#dc2626",
    bg: "#fee2e2",
    check: (stats) => stats.streak >= 7,
    goal: 7,
    progressKey: "streak",
  },
  {
    id: "streak_30",
    title: "Iron Discipline",
    description: "Achieved a 30-day study streak",
    icon: "⚡",
    color: "#7c3aed",
    bg: "#ede9fe",
    check: (stats) => stats.streak >= 30,
    goal: 30,
    progressKey: "streak",
  },
  {
    id: "hundred_hours",
    title: "Century Club",
    description: "Logged 100 total study hours",
    icon: "💯",
    color: "var(--accent)",
    bg: "var(--accent-soft)",
    check: (stats) => stats.totalHours >= 100,
    goal: 100,
    progressKey: "totalHours",
  },
  {
    id: "five_hundred_hours",
    title: "Scholar Elite",
    description: "Logged 500 total study hours",
    icon: "🎓",
    color: "#0ea5e9",
    bg: "#e0f2fe",
    check: (stats) => stats.totalHours >= 500,
    goal: 500,
    progressKey: "totalHours",
  },
  {
    id: "three_plans_complete",
    title: "Triple Crown",
    description: "Completed 3 full plans",
    icon: "👑",
    color: "#f59e0b",
    bg: "#fef3c7",
    check: (stats) => stats.completedPlans >= 3,
    goal: 3,
    progressKey: "completedPlans",
  },
];

export async function getUserStats(uid) {
  const ref = doc(db, "users", uid, "stats", "streak");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : { streak: 0, lastActive: null };
}

export async function saveBadges(uid, earnedIds) {
  const ref = doc(db, "users", uid, "stats", "badges");
  await setDoc(ref, {
    earned: earnedIds,
    updatedAt: serverTimestamp()
  }, { merge: true });
}

export async function getEarnedBadges(uid) {
  const ref = doc(db, "users", uid, "stats", "badges");
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().earned || []) : [];
}
