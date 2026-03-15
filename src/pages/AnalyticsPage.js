// src/pages/AnalyticsPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress } from "../services/planService";
import Loader from "../components/Loader";
import HeroBanner from "../components/ui/HeroBanner";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";
import ProgressBar from "../components/ProgressBar";
import { motion } from "framer-motion";
import Heatmap from "../components/ui/Heatmap";
import { 
  LineChart as LineChartIcon, 
  Trophy, 
  Target, 
  Clock, 
  Activity, 
  CheckCircle, 
  GraduationCap, 
  Flame, 
  ArrowUpRight,
  TrendingUp,
  Zap,
  Star
} from "lucide-react";
import { getDailyLogs, updateUserStreak } from "../services/extendedService";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const LEVEL_COLORS = { beginner: "var(--accent)", intermediate: "var(--primary)", pro: "var(--secondary)" };

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [dailyLogs, setDailyLogs] = useState({});
  const [currentStreak, setCurrentStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ps, logs, streakData] = await Promise.all([
          getUserPlans(user.uid, 50),
          getDailyLogs(user.uid),
          updateUserStreak(user.uid)
        ]);

        setPlans(ps);
        setDailyLogs(logs);
        setCurrentStreak(streakData.streak);

        const pm = {};
        await Promise.all(ps.map(async (p) => {
          pm[p.id] = await getProgress(user.uid, p.id);
        }));
        setProgressMap(pm);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.uid]);

  if (loading) return <div className="main-content"><Loader text="Crunching your learning data…" /></div>;

  const totalPlans = plans.length;
  const totalHours = plans.reduce((s, p) => s + (p.meta?.estimatedTotalHours || 0), 0);
  let totalPhases = 0, totalCompleted = 0;

  const planStats = plans.map((p) => {
    const prog = progressMap[p.id]?.phases || {};
    const count = p.meta?.phaseCount || 0;
    const done = Object.values(prog).filter(Boolean).length;
    totalPhases += count;
    totalCompleted += done;
    return { ...p, count, done, pct: count > 0 ? Math.round((done / count) * 100) : 0 };
  });

  const completedPlans = planStats.filter((p) => p.count > 0 && p.done === p.count).length;
  const avgPct = totalPhases > 0 ? Math.round((totalCompleted / totalPhases) * 100) : 0;

  const byLevel = planStats.reduce((acc, p) => {
    const l = p.input?.level || "beginner";
    if (!acc[l]) acc[l] = { count: 0, hours: 0, done: 0, phases: 0 };
    acc[l].count++;
    acc[l].hours += p.meta?.estimatedTotalHours || 0;
    acc[l].done += p.done;
    acc[l].phases += p.count;
    return acc;
  }, {});

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split("T")[0];
  });

  const barData = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Hours Studied',
      data: last7Days.map(d => dailyLogs[d] || 0),
      backgroundColor: 'rgba(79, 70, 229, 0.8)',
      borderRadius: 12,
      borderSkipped: false,
    }]
  };

  const lineData = {
    labels: last7Days.map(d => new Date(d).toLocaleDateString('en-US', { weekday: 'short' })),
    datasets: [{
      label: 'Engagement',
      data: last7Days.map((d, i) => Math.max(0, currentStreak - (6 - i))),
      borderColor: 'rgba(14, 165, 233, 1)',
      backgroundColor: 'rgba(14, 165, 233, 0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#fff',
      pointBorderWidth: 2,
    }]
  };

  return (
    <motion.div className="main-content">
      <HeroBanner 
        title="Learning Analytics"
        subtitle="Deep insight into your study habits, progress patterns, and academic mastery."
        icon={LineChartIcon}
        colorClass="secondary"
      />

      <div className="stats-grid">
        <AnimatedCard delay={0.1} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(14, 165, 233, 0.1)", color: "var(--secondary)" }}>
            <Target size={20} />
          </div>
          <div className="stat-label">Total Plans</div>
          <div className="stat-value">{totalPlans}</div>
          <div className="stat-sub"><TrendingUp size={13} /> Tracking active</div>
        </AnimatedCard>
        
        <AnimatedCard delay={0.2} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(16, 185, 129, 0.1)", color: "var(--accent)" }}>
            <Trophy size={20} />
          </div>
          <div className="stat-label">Plans Finished</div>
          <div className="stat-value">{completedPlans}</div>
          <div className="stat-sub"><Star size={13} /> Full completion</div>
        </AnimatedCard>

        <AnimatedCard delay={0.3} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(245, 158, 11, 0.1)", color: "var(--amber)" }}>
            <Activity size={20} />
          </div>
          <div className="stat-label">Avg Accuracy</div>
          <div className="stat-value">{avgPct}%</div>
          <div className="stat-sub"><TrendingUp size={13} /> Progress rate</div>
        </AnimatedCard>

        <AnimatedCard delay={0.4} className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(79, 70, 229, 0.1)", color: "var(--primary)" }}>
            <Clock size={20} />
          </div>
          <div className="stat-label">Time Logged</div>
          <div className="stat-value">{totalHours}h</div>
          <div className="stat-sub"><CheckCircle size={13} /> Quality hours</div>
        </AnimatedCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        <AnimatedCard delay={0.5}>
          <div className="section-title">
            <IconBadge icon={Activity} size={18} colorClass="primary" />
            Phase Completion
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "2.5rem 0" }}>
            <div style={{ position: "relative", width: "180px", height: "180px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: 'rotate(-90deg)' }}>
                <circle cx="18" cy="18" r="16" fill="none" stroke="var(--border-light)" strokeWidth="3" />
                <motion.circle 
                  cx="18" cy="18" r="16" 
                  fill="none" 
                  stroke="var(--primary)" 
                  strokeWidth="3" 
                  strokeDasharray={`${avgPct}, 100`} 
                  strokeLinecap="round"
                  initial={{ strokeDasharray: "0, 100" }}
                  animate={{ strokeDasharray: `${avgPct}, 100` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
              <div style={{ position: "absolute", textAlign: "center", transform: 'none' }}>
                <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "var(--text)", letterSpacing: '-0.05em' }}>{avgPct}%</div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-muted)", textTransform: 'uppercase' }}>Mastery</div>
              </div>
            </div>
          </div>
          <p className="text-muted text-sm" style={{ textAlign: "center" }}>
            You've completed <strong>{totalCompleted}</strong> tasks out of <strong>{totalPhases}</strong>.
          </p>
        </AnimatedCard>

        <AnimatedCard delay={0.6}>
          <div className="section-title">
            <IconBadge icon={GraduationCap} size={18} colorClass="accent" />
            Success by Level
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", marginTop: "1rem" }}>
            {Object.entries(byLevel).map(([level, data]) => (
              <div key={level}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 700, textTransform: "capitalize", color: "var(--text)", display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: LEVEL_COLORS[level] }} />
                    {level}
                  </span>
                  <span className="text-muted text-xs font-bold">{data.count} Plans</span>
                </div>
                <ProgressBar completed={data.done} total={data.phases} accentColor={LEVEL_COLORS[level]} />
              </div>
            ))}
          </div>
        </AnimatedCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "2rem", marginBottom: "3rem" }}>
        <AnimatedCard delay={0.7}>
          <div className="section-title">
            <IconBadge icon={Clock} size={18} colorClass="primary" />
            Study Velocity (Last 7 Days)
          </div>
          <div style={{ height: "280px", marginTop: "1rem" }}>
            <Bar 
              data={barData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                  y: { beginAtZero: true, grid: { display: false } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </AnimatedCard>

        <AnimatedCard delay={0.8}>
          <div className="section-title">
            <IconBadge icon={Flame} size={18} colorClass="accent" />
            Learning Momentum
          </div>
          <div style={{ height: "280px", marginTop: "1rem" }}>
            <Line 
              data={lineData} 
              options={{ 
                responsive: true, 
                maintainAspectRatio: false, 
                plugins: { legend: { display: false } },
                scales: { 
                  y: { beginAtZero: true, min: 0, suggestedMax: 10, ticks: { stepSize: 1 } },
                  x: { grid: { display: false } }
                }
              }} 
            />
          </div>
        </AnimatedCard>
      </div>

      <AnimatedCard delay={0.9}>
        <div className="section-title">
          <IconBadge icon={ArrowUpRight} size={18} colorClass="amber" />
          Plan Performance Breakdown
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", marginTop: "1rem" }}>
          {planStats.slice(0, 8).map((p, i) => (
            <div key={p.id} style={{ padding: "1.25rem", background: "var(--surface2)", borderRadius: "16px", border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)" }}>{p.input?.goal || p.title}</span>
                <span className={`badge ${p.pct === 100 ? "badge-green" : "badge-indigo"}`}>{p.pct}% Mastery</span>
              </div>
              <ProgressBar completed={p.done} total={p.count} showCount={false} height={8} />
            </div>
          ))}
        </div>
      </AnimatedCard>

      <AnimatedCard delay={1.0} style={{ marginTop: '0' }}>
        <div className="section-title">
          <IconBadge icon={Flame} size={18} colorClass="primary" />
          Study Activity Heatmap (Last 6 Months)
        </div>
        <div style={{ marginTop: "1rem", overflowX: "auto" }}>
          <Heatmap logs={dailyLogs} weeks={26} />
        </div>
      </AnimatedCard>
    </motion.div>
  );
}

