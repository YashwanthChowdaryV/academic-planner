// src/pages/DashboardPage.js
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress } from "../services/planService";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import Loader from "../components/Loader";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const ps = await getUserPlans(user.uid, 10);
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

  // Compute stats
  const totalPlans = plans.length;
  const totalHours = plans.reduce((s, p) => s + (p.meta?.estimatedTotalHours || 0), 0);

  let totalCompleted = 0, totalPhases = 0;
  plans.forEach((p) => {
    const prog = progressMap[p.id]?.phases || {};
    const count = p.meta?.phaseCount || Object.keys(prog).length || 0;
    const done = Object.values(prog).filter(Boolean).length;
    totalCompleted += done;
    totalPhases += count;
  });

  const avgPct = totalPhases > 0 ? Math.round((totalCompleted / totalPhases) * 100) : 0;
  const completedPlans = plans.filter((p) => {
    const prog = progressMap[p.id]?.phases || {};
    const count = p.meta?.phaseCount || Object.keys(prog).length || 0;
    return count > 0 && Object.values(prog).filter(Boolean).length === count;
  }).length;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  if (loading) return (
    <div className="page-layout">
      <div className="main-content"><Loader text="Loading dashboard…" /></div>
    </div>
  );

  return (
    <div className="main-content animate-fade-in">
      <div style={{ marginBottom: "2rem" }}>
        <h1 className="page-title">{greeting}, {profile?.name?.split(" ")[0] || "there"} 👋</h1>
        <p className="page-subtitle">Here's your learning overview.</p>
      </div>

      <div className="stats-grid">
        <StatCard icon="📋" label="Total Plans" value={totalPlans} sub="AI-generated plans" accentColor="var(--accent)" />
        <StatCard icon="✅" label="Completed Plans" value={completedPlans} sub="All phases done" accentColor="var(--green)" />
        <StatCard icon="📈" label="Avg Completion" value={`${avgPct}%`} sub="Across all plans" accentColor="var(--amber)" />
        <StatCard icon="⏱" label="Hours Planned" value={totalHours} sub="Total study hours" accentColor="var(--red)" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div className="card" style={{ gridColumn: "1 / -1" }}>
          <div className="section-title">📊 Overall Progress</div>
          <ProgressBar completed={totalCompleted} total={totalPhases} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div className="section-title" style={{ marginBottom: 0 }}>📚 Recent Plans</div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate("/planner")}>
          + New Plan
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🗺</div>
          <div className="empty-title">No plans yet</div>
          <div className="empty-desc">Generate your first AI academic plan to get started.</div>
          <button className="btn btn-primary" onClick={() => navigate("/planner")}>
            Create My First Plan
          </button>
        </div>
      ) : (
        <div className="recent-list">
          {plans.slice(0, 5).map((plan) => {
            const prog = progressMap[plan.id]?.phases || {};
            const count = plan.meta?.phaseCount || Object.keys(prog).length || 0;
            const done = Object.values(prog).filter(Boolean).length;
            const pct = count > 0 ? Math.round((done / count) * 100) : 0;
            const isComplete = count > 0 && done === count;

            return (
              <div
                key={plan.id}
                className="recent-item"
                onClick={() => navigate(`/plan/${plan.id}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && navigate(`/plan/${plan.id}`)}
              >
                <span style={{ fontSize: "1.3rem" }}>{isComplete ? "🏆" : "📋"}</span>
                <div className="recent-item-title">{plan.input?.goal || plan.title}</div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                  <span className="badge badge-muted">{plan.input?.level}</span>
                  {count > 0 && (
                    <span className={`badge ${isComplete ? "badge-green" : "badge-blue"}`}>
                      {pct}%
                    </span>
                  )}
                </div>
                <div className="recent-item-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={(e) => { e.stopPropagation(); navigate(`/plan/${plan.id}`); }}
                  >
                    Open →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {plans.length > 5 && (
        <div style={{ textAlign: "center", marginTop: "1rem" }}>
          <button className="btn btn-secondary" onClick={() => navigate("/history")}>
            View All Plans ({totalPlans}) →
          </button>
        </div>
      )}
    </div>
  );
}
