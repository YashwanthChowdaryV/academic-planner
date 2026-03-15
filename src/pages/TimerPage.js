// src/pages/TimerPage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { saveDailyLog, getDailyLogs } from "../services/extendedService";
import { useToast } from "../components/Toast";
import HeroBanner from "../components/ui/HeroBanner";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, Square, RotateCcw, Save, Clock, Flame, CheckCircle } from "lucide-react";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function getTodayStr() {
  return new Date().toISOString().split("T")[0];
}

export default function TimerPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState(false);
  const [todayHours, setTodayHours] = useState(0);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef(null);

  // Load today's existing hours
  useEffect(() => {
    getDailyLogs(user.uid).then(logs => {
      const today = getTodayStr();
      setTodayHours(logs[today] || 0);
    });
  }, [user.uid]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setSeconds(s => s + 1), 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const handleStart = () => { setRunning(true); setSaved(false); };
  const handlePause = () => setRunning(false);
  const handleReset = () => { setRunning(false); setSeconds(0); setSaved(false); };

  const handleSave = useCallback(async () => {
    if (seconds === 0) { toast.show("Start the timer first!", "error"); return; }
    setSaving(true);
    const hoursLogged = seconds / 3600;
    const today = getTodayStr();
    const newTotal = parseFloat((todayHours + hoursLogged).toFixed(2));
    try {
      await saveDailyLog(user.uid, today, newTotal);
      setTodayHours(newTotal);
      setSaved(true);
      setRunning(false);
      setSeconds(0);
      toast.show(`${(hoursLogged * 60).toFixed(0)} min saved! 🎯`, "success");
    } catch {
      toast.show("Save failed. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }, [user.uid, seconds, todayHours, toast]);

  const progress = Math.min((seconds / 3600) * 100, 100); // Progress toward 1h

  return (
    <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <HeroBanner
        title="Study Timer"
        subtitle="Track your focused study sessions and log them automatically."
        icon={Timer}
        colorClass="primary"
      />

      {/* Stats */}
      <div className="stats-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)", marginBottom: "2rem" }}>
        <div className="card stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(79,70,229,0.1)", color: "var(--primary)" }}>
            <Clock size={18} />
          </div>
          <div className="stat-label">Today's Hours</div>
          <div className="stat-value">{todayHours.toFixed(1)}h</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent)" }}>
            <Flame size={18} />
          </div>
          <div className="stat-label">This Session</div>
          <div className="stat-value">{(seconds / 3600).toFixed(2)}h</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon-box" style={{ background: "rgba(245,158,11,0.1)", color: "var(--amber)" }}>
            <CheckCircle size={18} />
          </div>
          <div className="stat-label">Status</div>
          <div className="stat-value" style={{ fontSize: "1.1rem" }}>{running ? "🟢 Active" : saved ? "✅ Saved" : "⏸ Idle"}</div>
        </div>
      </div>

      {/* Main Timer Card */}
      <div className="card" style={{ textAlign: "center", padding: "3rem 2rem", maxWidth: "520px", margin: "0 auto" }}>
        {/* Circular Progress */}
        <div style={{ position: "relative", width: "220px", height: "220px", margin: "0 auto 2.5rem" }}>
          <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
            <circle cx="50" cy="50" r="44" fill="none" stroke="var(--surface3)" strokeWidth="4" />
            <motion.circle
              cx="50" cy="50" r="44"
              fill="none"
              stroke={running ? "var(--primary)" : "var(--border)"}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${progress * 2.76}, 276`}
              animate={{ strokeDasharray: `${progress * 2.76}, 276` }}
              transition={{ duration: 0.5 }}
            />
          </svg>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center"
          }}>
            <motion.div
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                fontFamily: "var(--font-display)",
                letterSpacing: "-0.04em",
                color: running ? "var(--primary)" : "var(--text)",
                lineHeight: 1
              }}
              animate={{ scale: running ? [1, 1.02, 1] : 1 }}
              transition={{ repeat: Infinity, duration: 1, ease: "easeInOut" }}
            >
              {formatTime(seconds)}
            </motion.div>
            <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-dim)", marginTop: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {running ? "Focused Mode" : "Ready"}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1.5rem" }}>
          {!running ? (
            <motion.button
              className="btn btn-primary btn-lg"
              onClick={handleStart}
              whileTap={{ scale: 0.95 }}
              style={{ gap: "10px", minWidth: "130px" }}
            >
              <Play size={20} fill="white" /> Start
            </motion.button>
          ) : (
            <motion.button
              className="btn btn-secondary btn-lg"
              onClick={handlePause}
              whileTap={{ scale: 0.95 }}
              style={{ gap: "10px", minWidth: "130px" }}
            >
              <Pause size={20} /> Pause
            </motion.button>
          )}
          <motion.button
            className="btn btn-secondary btn-lg"
            onClick={handleReset}
            whileTap={{ scale: 0.95 }}
            style={{ padding: "13px 16px" }}
          >
            <RotateCcw size={18} />
          </motion.button>
        </div>

        <motion.button
          className="btn btn-accent btn-full btn-lg"
          onClick={handleSave}
          disabled={saving || seconds === 0}
          whileTap={{ scale: 0.97 }}
        >
          {saving ? "Saving…" : <><Save size={18} /> Save Session</>}
        </motion.button>

        <p className="text-muted text-xs" style={{ marginTop: "1rem" }}>
          Session will be added to today's total in Daily Tracker.
        </p>

        {/* Saved success animation */}
        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ marginTop: "1rem", padding: "12px", background: "var(--accent-soft)", borderRadius: "10px", color: "var(--accent)", fontWeight: 600, fontSize: "0.875rem" }}
            >
              ✅ Session saved! Keep up the great work!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tips */}
      <div className="card" style={{ marginTop: "1.5rem", padding: "1.25rem 1.5rem", maxWidth: "520px", margin: "1.5rem auto 0" }}>
        <div className="section-title" style={{ marginBottom: "0.75rem", fontSize: "0.875rem" }}>
          💡 Timer Tips
        </div>
        <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          {["Use the Pomodoro method: 25 min work, 5 min break", "Each session saved adds to your daily log", "Build a streak by logging every day"].map(tip => (
            <li key={tip} style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
              <span style={{ color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>→</span> {tip}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
