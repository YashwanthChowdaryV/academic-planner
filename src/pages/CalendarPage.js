// src/pages/CalendarPage.js
import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getDailyLogs } from "../services/extendedService";
import Loader from "../components/Loader";
import HeroBanner from "../components/ui/HeroBanner";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, ChevronLeft, ChevronRight, Clock, X, Flame } from "lucide-react";

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

function toDateStr(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getHeatColor(hours) {
  if (!hours || hours === 0) return null;
  if (hours < 1) return "rgba(79, 70, 229, 0.2)";
  if (hours < 2) return "rgba(79, 70, 229, 0.4)";
  if (hours < 4) return "rgba(79, 70, 229, 0.65)";
  return "rgba(79, 70, 229, 0.9)";
}

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function CalendarPage() {
  const { user } = useAuth();
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [today] = useState(new Date());
  const [view, setView] = useState({ year: new Date().getFullYear(), month: new Date().getMonth() });
  const [selectedDay, setSelectedDay] = useState(null);

  useEffect(() => {
    getDailyLogs(user.uid).then(data => {
      setLogs(data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user.uid]);

  const goToPrev = () => setView(v => {
    if (v.month === 0) return { year: v.year - 1, month: 11 };
    return { ...v, month: v.month - 1 };
  });

  const goToNext = () => setView(v => {
    if (v.month === 11) return { year: v.year + 1, month: 0 };
    return { ...v, month: v.month + 1 };
  });

  const goToToday = () => setView({ year: today.getFullYear(), month: today.getMonth() });

  const { year, month } = view;
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const totalHoursThisMonth = Array.from({ length: daysInMonth }, (_, i) => {
    const ds = toDateStr(year, month, i + 1);
    return logs[ds] || 0;
  }).reduce((a, b) => a + b, 0);

  const activeDays = Array.from({ length: daysInMonth }, (_, i) => {
    const ds = toDateStr(year, month, i + 1);
    return logs[ds] ? 1 : 0;
  }).reduce((a, b) => a + b, 0);

  const selectedDateStr = selectedDay ? toDateStr(year, month, selectedDay) : null;
  const selectedHours = selectedDateStr ? (logs[selectedDateStr] || 0) : 0;

  if (loading) return <div className="main-content"><Loader text="Loading your calendar…" /></div>;

  return (
    <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <HeroBanner
        title="Study Calendar"
        subtitle="Visualize your study patterns and track logged hours over time."
        icon={Calendar}
        colorClass="secondary"
      />

      {/* Month Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "1.5rem" }}>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(79,70,229,0.1)", color: "var(--primary)" }}>
            <Clock size={18} />
          </div>
          <div className="stat-label">Hours This Month</div>
          <div className="stat-value">{totalHoursThisMonth.toFixed(1)}h</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent)" }}>
            <Flame size={18} />
          </div>
          <div className="stat-label">Active Days</div>
          <div className="stat-value">{activeDays}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(245,158,11,0.1)", color: "var(--amber)" }}>
            <Calendar size={18} />
          </div>
          <div className="stat-label">Avg Daily</div>
          <div className="stat-value">{activeDays > 0 ? (totalHoursThisMonth / activeDays).toFixed(1) : 0}h</div>
        </div>
      </div>

      <div className="card" style={{ padding: "1.75rem" }}>
        {/* Calendar Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--text)" }}>
            {MONTH_NAMES[month]} {year}
          </h2>
          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <button className="btn btn-secondary btn-sm" onClick={goToToday}>Today</button>
            <button className="btn btn-secondary btn-sm" onClick={goToPrev} style={{ padding: "7px 10px" }}>
              <ChevronLeft size={16} />
            </button>
            <button className="btn btn-secondary btn-sm" onClick={goToNext} style={{ padding: "7px 10px" }}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        {/* Day Labels */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" }}>
          {DAY_NAMES.map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 700, color: "var(--text-dim)", padding: "6px 0", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
          {/* Empty cells before first day */}
          {Array.from({ length: firstDay }, (_, i) => <div key={`empty-${i}`} />)}

          {/* Day cells */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dateStr = toDateStr(year, month, day);
            const hours = logs[dateStr] || 0;
            const heatColor = getHeatColor(hours);
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate();
            const isSelected = selectedDay === day;

            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.08 }}
                onClick={() => setSelectedDay(isSelected ? null : day)}
                style={{
                  aspectRatio: "1",
                  borderRadius: "10px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  background: isSelected ? "var(--primary)" : heatColor || "var(--surface2)",
                  border: isToday ? "2px solid var(--primary)" : "2px solid transparent",
                  transition: "all 0.2s",
                  gap: "2px",
                  position: "relative"
                }}
              >
                <span style={{
                  fontSize: "0.8rem",
                  fontWeight: isToday || isSelected ? 800 : 500,
                  color: isSelected ? "white" : heatColor ? "white" : isToday ? "var(--primary)" : "var(--text-muted)"
                }}>
                  {day}
                </span>
                {hours > 0 && !isSelected && (
                  <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "rgba(255,255,255,0.9)", lineHeight: 1 }}>
                    {hours}h
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginTop: "1.25rem", justifyContent: "flex-end" }}>
          <span style={{ fontSize: "0.72rem", color: "var(--text-dim)", fontWeight: 600 }}>Hours logged:</span>
          {[["None", null], ["<1h", "rgba(79,70,229,0.2)"], ["1–2h", "rgba(79,70,229,0.4)"], ["2–4h", "rgba(79,70,229,0.65)"], ["4h+", "rgba(79,70,229,0.9)"]].map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <div style={{ width: "14px", height: "14px", borderRadius: "4px", background: color || "var(--surface3)", border: "1px solid var(--border)" }} />
              <span style={{ fontSize: "0.7rem", color: "var(--text-dim)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Day Detail Panel */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            className="card"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            style={{ marginTop: "1.25rem", padding: "1.5rem" }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontWeight: 700, fontSize: "1rem" }}>
                {MONTH_NAMES[month]} {selectedDay}, {year}
              </h3>
              <button className="btn btn-secondary btn-sm" onClick={() => setSelectedDay(null)} style={{ padding: "5px 8px" }}>
                <X size={14} />
              </button>
            </div>
            {selectedHours > 0 ? (
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ background: "var(--primary-soft)", color: "var(--primary)", borderRadius: "12px", padding: "1rem 1.5rem", textAlign: "center" }}>
                  <div style={{ fontSize: "2rem", fontWeight: 800, lineHeight: 1 }}>{selectedHours}</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 600, opacity: 0.7 }}>hours</div>
                </div>
                <div>
                  <p style={{ fontWeight: 600, color: "var(--text)", marginBottom: "4px" }}>Study session logged</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>You studied for <strong>{selectedHours} hour{selectedHours !== 1 ? "s" : ""}</strong> on this day.</p>
                </div>
              </div>
            ) : (
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>No hours logged for this day. Use the <strong>Daily Tracker</strong> to log study time.</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
