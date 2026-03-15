// src/pages/ActivityPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getActivityLogs } from "../services/extendedService";
import Loader from "../components/Loader";
import HeroBanner from "../components/ui/HeroBanner";
import { motion } from "framer-motion";
import { Activity, BookOpen, CheckCircle, Clock, Award, Plus } from "lucide-react";

const EVENT_ICONS = {
  plan_created: { icon: Plus, color: "var(--primary)", bg: "var(--primary-soft)", label: "Plan Created" },
  phase_done: { icon: CheckCircle, color: "var(--accent)", bg: "var(--accent-soft)", label: "Phase Completed" },
  hours_logged: { icon: Clock, color: "var(--secondary)", bg: "var(--secondary-soft)", label: "Hours Logged" },
  badge_earned: { icon: Award, color: "#f59e0b", bg: "#fef3c7", label: "Badge Earned" },
  plan_rated: { icon: BookOpen, color: "#7c3aed", bg: "#ede9fe", label: "Plan Rated" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "recently";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d} day${d > 1 ? "s" : ""} ago`;
  if (h > 0) return `${h} hour${h > 1 ? "s" : ""} ago`;
  if (m > 0) return `${m} min ago`;
  return "just now";
}

export default function ActivityPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActivityLogs(user.uid).then(data => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user.uid]);

  if (loading) return <div className="main-content"><Loader text="Loading activity feed…" /></div>;

  return (
    <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <HeroBanner
        title="Activity Feed"
        subtitle="A timeline of everything you've accomplished in your learning journey."
        icon={Activity}
        colorClass="accent"
      />

      {logs.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "4rem 2rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📋</div>
          <h3 style={{ fontWeight: 700, marginBottom: "0.5rem" }}>No activity yet</h3>
          <p className="text-muted text-sm">
            Start creating plans, completing phases, or logging hours to see your activity here.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
          {logs.map((log, i) => {
            const type = EVENT_ICONS[log.type] || EVENT_ICONS.plan_created;
            const Icon = type.icon;

            return (
              <motion.div
                key={log.id || i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                style={{ display: "flex", gap: "1rem", position: "relative", paddingBottom: "1rem" }}
              >
                {/* Timeline line */}
                {i < logs.length - 1 && (
                  <div style={{
                    position: "absolute",
                    left: "19px", top: "42px",
                    width: "2px", bottom: "0",
                    background: "var(--border)"
                  }} />
                )}

                {/* Icon */}
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: type.bg, color: type.color,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, border: `2px solid ${type.color}20`, zIndex: 1
                }}>
                  <Icon size={18} />
                </div>

                {/* Content */}
                <div className="card" style={{ flex: 1, padding: "1rem 1.25rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--text)", marginBottom: "3px" }}>
                        {log.description || type.label}
                      </div>
                      {log.detail && (
                        <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{log.detail}</div>
                      )}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px", flexShrink: 0 }}>
                      <span className="badge badge-muted" style={{ fontSize: "0.68rem" }}>{type.label}</span>
                      <span style={{ fontSize: "0.72rem", color: "var(--text-dim)" }}>{timeAgo(log.timestamp)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
