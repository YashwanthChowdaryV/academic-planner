// src/services/weaknessService.js

/**
 * Analyzes plans and sessions to find potential study weaknesses or blocks.
 */
export function analyzeWeaknesses(plans, progressMap, sessions) {
  const weaknesses = [];
  const now = new Date();
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // 1. Detect Stale Plans (No progress or activity in 3 days)
  plans.forEach(plan => {
    const updatedAt = plan.updatedAt?.toDate ? plan.updatedAt.toDate() : new Date(plan.createdAt);
    const planProgress = progressMap[plan.id]?.updatedAt?.toDate ? progressMap[plan.id].updatedAt.toDate() : updatedAt;
    
    // Last activity for this plan
    const planSessions = sessions.filter(s => s.planId === plan.id);
    const lastSessionDate = planSessions.length > 0 
      ? new Date(Math.max(...planSessions.map(s => new Date(s.endTime).getTime())))
      : new Date(0);

    const lastOverallActivity = new Date(Math.max(planProgress.getTime(), lastSessionDate.getTime()));

    if (lastOverallActivity < threeDaysAgo) {
      // Check if it's already completed
      const prog = progressMap[plan.id]?.phases || {};
      const count = plan.meta?.phaseCount || 0;
      const done = Object.values(prog).filter(Boolean).length;
      if (count > 0 && done < count) {
        weaknesses.push({
          type: "stale_plan",
          title: "Stale Plan",
          message: `"${plan.title}" hasn't seen progress in 3 days.`,
          planId: plan.id,
          severity: "amber"
        });
      }
    }
  });

  // 2. Detect Stuck Phases (Logged time/notes but not completed for > 2 days)
  // This is a bit complex as we don't track phase-level "last updated" easily without more queries,
  // but we can infer from sessions.
  plans.forEach(plan => {
    const prog = progressMap[plan.id]?.phases || {};
    const planSessions = sessions.filter(s => s.planId === plan.id);
    
    Object.keys(prog).forEach(phaseIndex => {
      if (prog[phaseIndex] === false) { // Phase is incomplete
        const phaseSessions = planSessions.filter(s => String(s.phaseIndex) === phaseIndex);
        if (phaseSessions.length > 0) {
          const lastPhaseActivity = new Date(Math.max(...phaseSessions.map(s => new Date(s.endTime).getTime())));
          if (lastPhaseActivity < new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)) {
            weaknesses.push({
              type: "stuck_phase",
              title: "Stuck Phase",
              message: `You've logged time on Phase ${Number(phaseIndex) + 1} of "${plan.title}" but it's not marked complete.`,
              planId: plan.id,
              severity: "red"
            });
          }
        }
      }
    });
  });

  // 3. Consistency Gaps (No activity in last 2 days)
  const lastSessionAll = sessions.length > 0
    ? new Date(Math.max(...sessions.map(s => new Date(s.endTime).getTime())))
    : null;

  if (lastSessionAll && lastSessionAll < new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)) {
    weaknesses.push({
      type: "consistency_gap",
      title: "Momentum Loss",
      message: "No study sessions logged in the last 48 hours. Time to jump back in!",
      severity: "amber"
    });
  }

  return weaknesses;
}
