// src/services/recommendationService.js
import { Lightbulb, Zap, Clock, BookOpen, Star } from "lucide-react";
import React from "react";

/**
 * Generates smart recommendations based on user stats and identified weaknesses.
 */
export function getRecommendations(stats, weaknesses) {
  const recommendations = [];

  // 1. Momentum-based recommendation
  if (stats?.longestStreak > 2) {
    recommendations.push({
      id: "momentum",
      title: "Keep the Momentum!",
      text: `You have a ${stats.longestStreak}-day streak. Even a 15-minute session today keeps your growth active.`,
      icon: <Zap size={18} />,
      color: "var(--amber)"
    });
  }

  // 2. Weakness-based recommendations
  const stalePlan = weaknesses.find(w => w.type === "stale_plan");
  if (stalePlan) {
    recommendations.push({
      id: "stale_fix",
      title: "Revive your Progress",
      text: `It's been a while since you touched "${stalePlan.planId}". Try a quick review of the next phase.`,
      icon: <Clock size={18} />,
      color: "var(--primary)"
    });
  }

  const stuckPhase = weaknesses.find(w => w.type === "stuck_phase");
  if (stuckPhase) {
    recommendations.push({
      id: "stuck_fix",
      title: "Push through the block",
      text: "You've logged time on a phase but haven't finished it. Let's get it to 100% today!",
      icon: <Star size={18} />,
      color: "var(--accent)"
    });
  }

  // 3. Goal-oriented recommendation
  if (stats?.mostStudiedPlan && stats.mostStudiedPlan !== "None") {
    recommendations.push({
      id: "focus",
      title: "Deep Dive",
      text: `You're doing great with "${stats.mostStudiedPlan}". Consistency is the key to mastery.`,
      icon: <BookOpen size={18} />,
      color: "var(--secondary)"
    });
  }

  // 4. Learning Science Tips (Fallback)
  if (recommendations.length < 2) {
    recommendations.push({
      id: "tip_recall",
      title: "Pro Tip: Active Recall",
      text: "Testing yourself is 2x more effective than re-reading. Try to summarize what you learned yesterday.",
      icon: <Lightbulb size={18} />,
      color: "var(--primary-soft)"
    });
    
    recommendations.push({
      id: "tip_pomodoro",
      title: "Productivity Hack",
      text: "Try the 25/5 Pomodoro technique for your next session to maintain high focus levels.",
      icon: <Clock size={18} />,
      color: "var(--accent-soft)"
    });
  }

  return recommendations;
}
