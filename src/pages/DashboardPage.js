// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress } from "../services/planService";
import { updateUserStreak } from "../services/extendedService";
import StatCard from "../components/StatCard";
import StreakCard from "../components/StreakCard";
import ProgressBar from "../components/ProgressBar";
import CountdownBar from "../components/CountdownBar";
import Loader from "../components/Loader";
import HeroBanner from "../components/ui/HeroBanner";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";
import { motion } from "framer-motion";
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
  LayoutDashboard
} from "lucide-react";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const streakData = await updateUserStreak(user.uid);
        setStreak(streakData.streak);

        const ps = await getUserPlans(user.uid, 5);
        setPlans(ps);
        const pm = {};
        await Promise.all(ps.map(async (p) => {
          pm[p.id] = await getProgress(user.uid, p.id);
        }));
        setProgressMap(pm);
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
          <div className="stat-value">{totalHours}h</div>
          <div className="stat-sub"><Trophy size={13} /> Goal hours</div>
        </AnimatedCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
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

