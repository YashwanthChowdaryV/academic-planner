// src/pages/AnalyticsPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress } from "../services/planService";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import Loader from "../components/Loader";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ps = await getUserPlans(user.uid, 50);
        setPlans(ps);
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

  if (loading) return <div className="main-content"><Loader text="Loading analytics…" /></div>;

  // Compute stats
  const totalPlans = plans.length;
  const totalHours = plans.reduce((s, p) => s + (p.meta?.estimatedTotalHours || 0), 0);

  let totalPhases = 0, totalCompleted = 0;
  const planStats = plans.map((p) => {
    const prog = progressMap[p.id]?.phases || {};
    const count = p.meta?.phaseCount || Object.keys(prog).length || 0;
    const done = Object.values(prog).filter(Boolean).length;
    totalPhases += count;
    totalCompleted += done;
    return { ...p, count, done, pct: count > 0 ? Math.round((done / count) * 100) : 0 };
  });

  const completedPlans = planStats.filter((p) => p.count > 0 && p.done === p.count).length;
  const avgPct = totalPhases > 0 ? Math.round((totalCompleted / totalPhases) * 100) : 0;

  // Level breakdown
  const byLevel = planStats.reduce((acc, p) => {
    const l = p.input?.level || "unknown";
    if (!acc[l]) acc[l] = { count: 0, hours: 0, done: 0, phases: 0 };
    acc[l].count++;
    acc[l].hours += p.meta?.estimatedTotalHours || 0;
    acc[l].done += p.done;
    acc[l].phases += p.count;
    return acc;
  }, {});

  const LEVEL_COLORS = { beginner: "var(--green)", intermediate: "var(--accent)", pro: "var(--amber)", unknown: "var(--text-dim)" };

  return (
    <div className="main-content animate-fade-in">
      <h1 className="page-title">📈 Analytics</h1>
      <p className="page-subtitle">Deep-dive into your learning progress and habits.</p>

      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <StatCard icon="📋" label="Total Plans" value={totalPlans} accentColor="var(--accent)" />
        <StatCard icon="🏆" label="Completed" value={completedPlans} accentColor="var(--green)" />
        <StatCard icon="📊" label="Avg Completion" value={`${avgPct}%`} accentColor="var(--amber)" />
        <StatCard icon="⏱" label="Total Hours" value={`${totalHours}h`} accentColor="var(--red)" />
        <StatCard icon="🧩" label="Total Phases" value={totalPhases} accentColor="var(--accent)" />
        <StatCard icon="✅" label="Phases Done" value={totalCompleted} accentColor="var(--green)" />
      </div>

      {/* Overall */}
      <div className="card" style={{ marginBottom: "1.5rem" }}>
        <div className="section-title">Overall Phase Completion</div>
        <ProgressBar completed={totalCompleted} total={totalPhases} />
      </div>

      {/* By Level */}
      {Object.keys(byLevel).length > 0 && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section-title">By Academic Level</div>
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {Object.entries(byLevel).map(([level, data]) => (
              <div key={level}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                  <span style={{ fontWeight: 600, textTransform: "capitalize", color: LEVEL_COLORS[level] || "var(--text)" }}>
                    {level}
                  </span>
                  <span className="text-muted text-sm">
                    {data.count} plan{data.count !== 1 ? "s" : ""} · {data.hours}h planned
                  </span>
                </div>
                <ProgressBar completed={data.done} total={data.phases} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Per-plan breakdown */}
      <div className="card">
        <div className="section-title">Per-Plan Progress</div>
        {planStats.length === 0 ? (
          <p className="text-muted text-sm">No plans to show.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {planStats.map((p) => (
              <div key={p.id}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px", flexWrap: "wrap", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>{p.input?.goal || p.title}</span>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span className="badge badge-muted">{p.input?.level}</span>
                    <span className={`badge ${p.pct === 100 ? "badge-green" : "badge-blue"}`}>{p.pct}%</span>
                  </div>
                </div>
                <ProgressBar completed={p.done} total={p.count} showCount={false} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
