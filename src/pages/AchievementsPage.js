// src/pages/AchievementsPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress } from "../services/planService";
import { getDailyLogs, updateUserStreak } from "../services/extendedService";
import { BADGES, getEarnedBadges, saveBadges } from "../services/badgeService";
import Loader from "../components/Loader";
import HeroBanner from "../components/ui/HeroBanner";
import { motion } from "framer-motion";
import { Trophy, Star, Lock } from "lucide-react";

function ProgressRing({ pct, size = 64, stroke = 5, color = "var(--primary)" }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--surface3)" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transform: "rotate(-90deg)", transformOrigin: "center", transition: "stroke-dashoffset 0.8s ease" }}
      />
    </svg>
  );
}

export default function AchievementsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ streak: 0, totalPlans: 0, completedPlans: 0, totalHours: 0 });
  const [earned, setEarned] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const [plans, logs, streakData, earnedIds] = await Promise.all([
          getUserPlans(user.uid, 100),
          getDailyLogs(user.uid),
          updateUserStreak(user.uid),
          getEarnedBadges(user.uid),
        ]);

        const totalHours = Object.values(logs).reduce((a, b) => a + b, 0);

        let completedPlans = 0;
        await Promise.all(plans.map(async (p) => {
          const prog = await getProgress(user.uid, p.id);
          const phases = prog?.phases || {};
          const count = p.meta?.phaseCount || 0;
          const done = Object.values(phases).filter(Boolean).length;
          if (count > 0 && done === count) completedPlans++;
        }));

        const computedStats = {
          streak: streakData.streak || 0,
          totalPlans: plans.length,
          completedPlans,
          totalHours: parseFloat(totalHours.toFixed(1)),
        };

        setStats(computedStats);

        // Auto-award new badges
        const newlyEarned = BADGES.filter(b => b.check(computedStats)).map(b => b.id);
        const merged = [...new Set([...earnedIds, ...newlyEarned])];
        if (merged.length > earnedIds.length) {
          await saveBadges(user.uid, merged);
        }
        setEarned(merged);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.uid]);

  if (loading) return <div className="main-content"><Loader text="Checking your achievements…" /></div>;

  const earnedCount = earned.length;
  const totalBadges = BADGES.length;

  return (
    <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <HeroBanner
        title="Achievements"
        subtitle="Earn badges by studying consistently and completing your learning goals."
        icon={Trophy}
        colorClass="amber"
      />

      {/* Overview */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(4, 1fr)", marginBottom: "2rem" }}>
        {[
          { label: "Badges Earned", value: `${earnedCount}/${totalBadges}`, icon: "🏅", color: "var(--amber)" },
          { label: "Day Streak", value: stats.streak, icon: "🔥", color: "var(--red)" },
          { label: "Total Plans", value: stats.totalPlans, icon: "📚", color: "var(--primary)" },
          { label: "Hours Logged", value: `${stats.totalHours}h`, icon: "⏱️", color: "var(--accent)" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            className="card stat-card"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <div style={{ fontSize: "1.75rem", marginBottom: "4px" }}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Badge Grid */}
      <div className="section-title" style={{ marginBottom: "1rem" }}>
        <Star size={18} /> All Badges
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1.25rem" }}>
        {BADGES.map((badge, i) => {
          const isEarned = earned.includes(badge.id);
          const progressVal = stats[badge.progressKey] || 0;
          const pct = Math.min(Math.round((progressVal / badge.goal) * 100), 100);

          return (
            <motion.div
              key={badge.id}
              className="card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              style={{
                padding: "1.5rem",
                opacity: isEarned ? 1 : 0.65,
                position: "relative",
                overflow: "hidden",
                cursor: "default",
              }}
            >
              {isEarned && (
                <div style={{
                  position: "absolute", top: "12px", right: "12px",
                  background: badge.bg, color: badge.color,
                  borderRadius: "var(--radius-full)", padding: "3px 10px",
                  fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.04em"
                }}>
                  EARNED
                </div>
              )}
              {!isEarned && (
                <div style={{
                  position: "absolute", top: "12px", right: "12px",
                  color: "var(--text-dim)"
                }}>
                  <Lock size={14} />
                </div>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
                <div style={{
                  width: "56px", height: "56px",
                  background: isEarned ? badge.bg : "var(--surface3)",
                  borderRadius: "16px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.75rem",
                  filter: isEarned ? "none" : "grayscale(1)"
                }}>
                  {badge.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", marginBottom: "2px" }}>
                    {badge.title}
                  </div>
                  <div style={{ fontSize: "0.78rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
                    {badge.description}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 500 }}>Progress</span>
                  <span style={{ fontSize: "0.72rem", color: badge.color, fontWeight: 700 }}>
                    {isEarned ? "Complete!" : `${progressVal} / ${badge.goal}`}
                  </span>
                </div>
                <div className="progress-track">
                  <motion.div
                    className="progress-fill"
                    style={{ background: isEarned ? badge.color : "var(--surface3)" }}
                    initial={{ width: "0%" }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.07, ease: "easeOut" }}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
