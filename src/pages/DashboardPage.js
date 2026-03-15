// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress } from "../services/planService";
import { updateUserStreak } from "../services/extendedService";
import { getUserStats } from "../services/statsService";
import { getStudySessions } from "../services/sessionService";
import { analyzeWeaknesses } from "../services/weaknessService";
import { getRecommendations } from "../services/recommendationService";
import { getPreferences, shouldShowReminder, savePreferences } from "../services/reminderService";
import { getAchievedMilestones, checkMilestones, MILESTONES } from "../services/streakService";
import StatCard from "../components/StatCard";
import StreakCard from "../components/StreakCard";
import ProgressBar from "../components/ProgressBar";
import CountdownBar from "../components/CountdownBar";
import Loader from "../components/Loader";
import HeroBanner from "../components/ui/HeroBanner";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ClipboardList, 
  CheckCircle, 
  TrendingUp, 
  Clock, 
  Plus, 
  BookOpen, 
  ArrowRight,
  Zap,
  Star,
  Trophy,
  LayoutDashboard,
  AlertCircle,
  Lightbulb,
  X,
  Sparkles
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [streak, setStreak] = useState(0);
  const [stats, setStats] = useState(null);
  const [weaknesses, setWeaknesses] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const streakData = await updateUserStreak(user.uid);
        setStreak(streakData.streak);

        const [ps, userStats, userSessions] = await Promise.all([
          getUserPlans(user.uid, 50), // Get more for calculations
          getUserStats(user.uid),
          getStudySessions(user.uid, 100)
        ]);
        
        setPlans(ps.slice(0, 5)); // Keep only 5 for display
        setStats(userStats);

        // Find most studied plan
        const sessionHoursByPlan = {};
        userSessions.forEach(s => {
          sessionHoursByPlan[s.planId] = (sessionHoursByPlan[s.planId] || 0) + (s.duration || 0);
        });
        
        const mostStudiedPlanId = Object.keys(sessionHoursByPlan).reduce((a, b) => 
          sessionHoursByPlan[a] > sessionHoursByPlan[b] ? a : b, null);
        const mostStudiedPlan = ps.find(p => p.id === mostStudiedPlanId);

        const pm = {};
        await Promise.all(ps.map(async (p) => {
          pm[p.id] = await getProgress(user.uid, p.id);
        }));
        setProgressMap(pm);

        // Find least completed plan (only among active ones)
        const activePlans = ps.filter(p => {
          const prog = pm[p.id]?.phases || {};
          const count = p.meta?.phaseCount || 0;
          const done = Object.values(prog).filter(Boolean).length;
          return count > 0 && done < count;
        });

        const leastCompletedPlan = activePlans.reduce((min, p) => {
          const pProg = pm[p.id]?.phases || {};
          const pDone = Object.values(pProg).filter(Boolean).length;
          const pPct = pDone / p.meta.phaseCount;
          
          if (!min) return p;
          const minProg = pm[min.id]?.phases || {};
          const minPct = Object.values(minProg).filter(Boolean).length / min.meta.phaseCount;
          
          return pPct < minPct ? p : min;
        }, null);

        // Analyze Weaknesses
        const foundWeaknesses = analyzeWeaknesses(ps, pm, userSessions);
        setWeaknesses(foundWeaknesses);

        // Get Recommendations
        const recs = getRecommendations(userStats, foundWeaknesses);
        setRecommendations(recs);

        // Check for Reminders
        const prefs = await getPreferences(user.uid);
        if (prefs?.remindersEnabled) {
          const reminderPrompt = shouldShowReminder(prefs, userSessions);
          if (reminderPrompt) {
            setReminder(reminderPrompt);
          }
        }

        // Check Milestones
        const achieved = await getAchievedMilestones(user.uid);
        setAchievements(achieved);
        
        // Background check for new ones
        checkMilestones(user.uid, userStats).then(newOnes => {
          if (newOnes.length > 0) {
            setAchievements(prev => [...prev, ...newOnes]);
          }
        });

        setStats(prev => ({ 
          ...prev, 
          mostStudiedPlan: mostStudiedPlan?.title || "None",
          leastCompletedPlan: leastCompletedPlan?.title || "None"
        }));

      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.uid]);

  const totalPlans = plans.length;
  const totalHours = plans.reduce((s, p) => s + (p.meta?.estimatedTotalHours || 0), 0);

  let totalCompleted = 0, totalPhases = 0;
  plans.forEach((p) => {
    const prog = progressMap[p.id]?.phases || {};
    const count = p.meta?.phaseCount || 0;
    const done = Object.values(prog).filter(Boolean).length;
    totalCompleted += done;
    totalPhases += count;
  });

  const avgPct = totalPhases > 0 ? Math.round((totalCompleted / totalPhases) * 100) : 0;
  const completedPlans = plans.filter((p) => {
    const prog = progressMap[p.id]?.phases || {};
    const count = p.meta?.phaseCount || 0;
    return count > 0 && Object.values(prog).filter(Boolean).length === count;
  }).length;

  const hour = new Date().getHours();
  const greetingText = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const firstName = profile?.name?.split(" ")[0] || "there";

  const handleDismissReminder = async () => {
    setReminder(null);
    try {
      await savePreferences(user.uid, { lastDismissed: new Date().toISOString() });
    } catch (e) {
      console.error("Failed to save dismissal:", e);
    }
  };

  if (loading) return <div className="main-content"><Loader text="Preparing your dashboard..." /></div>;

  return (
    <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <HeroBanner 
        title={`${greetingText}, ${firstName}`}
        subtitle="You're making great progress! Here's a quick look at your academic status."
        icon={LayoutDashboard}
        colorClass="primary"
        imageUrl="https://images.unsplash.com/photo-1523240795612-9a054b0db644?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      />

      <AnimatePresence>
        {reminder && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass-card"
            style={{ 
              marginBottom: "2rem", 
              padding: "1rem 1.5rem", 
              background: "linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)",
              border: "1px solid rgba(99, 102, 241, 0.2)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "1rem"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ 
                background: "var(--primary)", 
                padding: "8px", 
                borderRadius: "10px", 
                color: "white",
                display: "flex"
              }}>
                {reminder.type === 'smart' ? <Sparkles size={18} /> : <Clock size={18} />}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>
                  {reminder.type === 'smart' ? "Smart Suggestion" : "Study Reminder"}
                </div>
                <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>{reminder.message}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => navigate("/sessions")}
              >
                Start Session
              </button>
              <button 
                onClick={handleDismissReminder}
                style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: "4px" }}
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="stats-grid">
        <AnimatedCard delay={0.1} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(79, 70, 229, 0.1)", color: "var(--primary)" }}>
            <ClipboardList size={20} />
          </div>
          <div className="stat-label">Active Plans</div>
          <div className="stat-value">{totalPlans}</div>
          <div className="stat-sub"><TrendingUp size={13} /> Total generated</div>
        </AnimatedCard>

        <AnimatedCard delay={0.2} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent)" }}>
            <CheckCircle size={20} />
          </div>
          <div className="stat-label">Completed</div>
          <div className="stat-value">{completedPlans}</div>
          <div className="stat-sub"><Star size={13} /> Mastery achieved</div>
        </AnimatedCard>

        <AnimatedCard delay={0.3} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--amber)" }}>
            <Zap size={20} />
          </div>
          <div className="stat-label">Learn Streak</div>
          <div className="stat-value">{streak}</div>
          <div className="stat-sub">Days in a row</div>
        </AnimatedCard>

        <AnimatedCard delay={0.4} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--secondary)" }}>
            <Clock size={20} />
          </div>
          <div className="stat-label">Time Invested</div>
          <div className="stat-value">{stats?.totalHours || 0}h</div>
          <div className="stat-sub"><Trophy size={13} /> Across {stats?.totalSessions || 0} sessions</div>
        </AnimatedCard>

        {/* New Insight Cards */}
        <AnimatedCard delay={0.5} className="stat-card highlight-card">
          <div className="stat-icon-box" style={{ background: "rgba(236, 72, 153, 0.1)", color: "#ec4899" }}>
            <Star size={20} />
          </div>
          <div className="stat-label">Most Studied</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>{stats?.mostStudiedPlan}</div>
          <div className="stat-sub">By focus time</div>
        </AnimatedCard>

        <AnimatedCard delay={0.6} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(244, 63, 94, 0.1)", color: "#f43f5e" }}>
            <AlertCircle size={20} />
          </div>
          <div className="stat-label">Attention Needed</div>
          <div className="stat-value" style={{ fontSize: "1.2rem" }}>{stats?.leastCompletedPlan}</div>
          <div className="stat-sub">Lowest progress</div>
        </AnimatedCard>
      </div>

      <AnimatePresence>
        {weaknesses.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="weakness-alerts"
            style={{ marginBottom: "2rem" }}
          >
            <div className="section-title" style={{ color: "var(--text)" }}>
              <IconBadge icon={AlertCircle} size={18} colorClass="amber" />
              Focus Areas & Alerts
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
              {weaknesses.map((w, i) => (
                <motion.div 
                  key={i} 
                  className={`card glass-card alert-card-${w.severity}`}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ 
                    padding: "1rem", 
                    borderLeft: `4px solid var(--${w.severity === 'red' ? 'accent' : 'amber'})`,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "0.75rem"
                  }}
                >
                  <AlertCircle size={20} className={`text-${w.severity === 'red' ? 'accent' : 'amber'}`} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", marginBottom: "2px" }}>{w.title}</div>
                    <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4" }}>{w.message}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        
        {/* Recommendation Section */}
        <AnimatedCard delay={0.4} className="recommendation-section" style={{ height: "100%" }}>
          <div className="section-title">
            <IconBadge icon={Lightbulb} size={18} colorClass="primary" />
            Daily Guide
          </div>
          <div className="recommendations-container" style={{ display: "flex", flexDirection: "column", gap: "1rem", marginTop: "1rem" }}>
            {recommendations.slice(0, 2).map((rec, i) => (
              <motion.div 
                key={rec.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                style={{ 
                  padding: "1rem", 
                  background: "var(--surface2)", 
                  borderRadius: "12px", 
                  border: "1px solid var(--border)",
                  borderLeft: `4px solid ${rec.color}`
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.25rem" }}>
                  <span style={{ color: rec.color }}>{rec.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: "0.9rem" }}>{rec.title}</span>
                </div>
                <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  {rec.text}
                </div>
              </motion.div>
            ))}
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.5} className="progress-section">
          <div className="section-title">
            <IconBadge icon={TrendingUp} size={18} colorClass="primary" />
            Overall Progress
          </div>
          <ProgressBar completed={totalCompleted} total={totalPhases} />
          <p className="text-muted text-sm" style={{ marginTop: '1rem' }}>
            You have completed {totalCompleted} out of {totalPhases} total task phases.
          </p>
        </AnimatedCard>

        <AnimatedCard delay={0.6} className="streak-section">
          <div className="section-title">
            <IconBadge icon={Zap} size={18} colorClass="accent" />
            Learning Momentum
          </div>
          <StreakCard streak={streak} />
        </AnimatedCard>

        {/* Milestones Scroller */}
        <AnimatedCard delay={0.7} className="milestones-section" style={{ gridColumn: "span 2" }}>
          <div className="section-title">
            <IconBadge icon={Trophy} size={18} colorClass="amber" />
            Scholar Milestones
          </div>
          <div className="milestone-scroller" style={{ 
            display: "flex", 
            gap: "1rem", 
            overflowX: "auto", 
            padding: "0.5rem 0",
            msOverflowStyle: "none",
            scrollbarWidth: "none"
          }}>
            {MILESTONES.map(m => {
              const isAchieved = achievements.some(a => a.id === m.id);
              return (
                <motion.div 
                  key={m.id}
                  className={`milestone-item ${isAchieved ? 'achieved' : 'locked'}`}
                  whileHover={{ y: -5 }}
                  style={{ 
                    minWidth: "160px",
                    padding: "1rem",
                    background: isAchieved ? "rgba(245, 158, 11, 0.1)" : "var(--surface2)",
                    borderRadius: "16px",
                    border: `1px solid ${isAchieved ? "var(--amber)" : "var(--border)"}`,
                    textAlign: "center",
                    opacity: isAchieved ? 1 : 0.6
                  }}
                >
                  <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{isAchieved ? m.icon : "🔒"}</div>
                  <div style={{ fontWeight: 700, fontSize: "0.9rem", color: isAchieved ? "var(--text)" : "var(--text-muted)" }}>{m.title}</div>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "4px" }}>{m.description}</div>
                </motion.div>
              );
            })}
          </div>
        </AnimatedCard>
      </div>

      <div className="recent-plans-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div className="section-title" style={{ margin: 0 }}>
            <IconBadge icon={BookOpen} size={18} colorClass="secondary" />
            Recent Plans
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/history")}>
            View All Plans <ArrowRight size={14} />
          </button>
        </div>

        {plans.length === 0 ? (
          <div className="empty-state card">
            <div className="empty-icon"><ClipboardList size={48} /></div>
            <div className="empty-title">No active plans</div>
            <p className="empty-desc">Generate an AI-driven plan to start your learning journey.</p>
            <button className="btn btn-primary" onClick={() => navigate("/planner")}>
              <Plus size={18} /> Create First Plan
            </button>
          </div>
        ) : (
          <div className="plans-grid">
            {plans.map((plan, idx) => {
              const prog = progressMap[plan.id]?.phases || {};
              const count = plan.meta?.phaseCount || 0;
              const done = Object.values(prog).filter(Boolean).length;
              const pct = count > 0 ? Math.round((done / count) * 100) : 0;
              const isComplete = count > 0 && done === count;

              return (
                <AnimatedCard 
                  key={plan.id} 
                  delay={0.7 + idx * 0.1}
                  className="plan-preview-card"
                  onClick={() => navigate(`/plan/${plan.id}`)}
                >
                  <div className="plan-card-header">
                    <div className={`plan-status-dot ${isComplete ? 'complete' : 'active'}`} />
                    <span className="plan-date">{new Date(plan.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="plan-title">{plan.input?.goal || plan.title}</h3>
                  <div className="plan-badges">
                    <span className="badge badge-indigo">{plan.input?.level}</span>
                    <span className={`badge ${isComplete ? 'badge-green' : 'badge-amber'}`}>
                      {pct}% Done
                    </span>
                  </div>
                  
                  {!isComplete && plan.createdAt && plan.input?.time_available_days && (
                    <div className="plan-countdown">
                      <CountdownBar createdAt={plan.createdAt} daysAllocated={plan.input.time_available_days} />
                    </div>
                  )}

                  <div className="plan-card-footer">
                    <span>{count} Phases</span>
                    <ArrowRight size={16} className="hover-arrow" />
                  </div>
                </AnimatedCard>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

