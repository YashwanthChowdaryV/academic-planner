// src/pages/TimerPage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { saveDailyLog, getDailyLogs } from "../services/extendedService";
import { useToast } from "../components/Toast";
import HeroBanner from "../components/ui/HeroBanner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Timer, Play, Pause, Square, RotateCcw, Save, Clock, 
  Flame, CheckCircle, Maximize2, Minimize2, 
  AlertOctagon, Music, Volume2, VolumeX, X
} from "lucide-react";
import { saveStudySession } from "../services/sessionService";

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
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [distractions, setDistractions] = useState(0);
  const [showDistractionLog, setShowDistractionLog] = useState(false);
  const [distractionText, setDistractionText] = useState("");
  const [distractionHistory, setDistractionHistory] = useState([]);
  const [ambientSound, setAmbientSound] = useState(null); // 'rain', 'white-noise', 'lo-fi'
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
    const durationMin = Math.floor(seconds / 60);
    const hoursLogged = seconds / 3600;
    
    // Calculate Focus Score (Basic algorithm: duration vs distractions)
    const baseScore = 100;
    const penalty = distractions * 5;
    const focusScore = Math.max(0, Math.min(100, baseScore - penalty));

    try {
      // 1. Save to Detailed Sessions
      await saveStudySession(user.uid, {
        title: "Focused Study",
        duration: seconds, // saving seconds for precision in sessions
        distractionsCount: distractions,
        focusScore: focusScore,
        type: "timer",
        date: getTodayStr(),
        distractionLogs: distractionHistory,
        startTime: new Date(Date.now() - seconds * 1000).toISOString(),
        endTime: new Date().toISOString()
      });

      // 2. Save to Daily Log (legacy hours counter)
      const today = getTodayStr();
      const newTotal = parseFloat((todayHours + hoursLogged).toFixed(2));
      await saveDailyLog(user.uid, today, newTotal);
      
      setTodayHours(newTotal);
      setSaved(true);
      setRunning(false);
      setSeconds(0);
      setDistractions(0);
      setDistractionHistory([]);
      setIsFocusMode(false);
      
      toast.show(`Success! Focus Score: ${focusScore}% 🎯`, "success");
    } catch (err) {
      console.error(err);
      toast.show("Save failed. Try again.", "error");
    } finally {
      setSaving(false);
    }
  }, [user.uid, seconds, todayHours, distractions, distractionHistory, toast]);

  const addDistraction = () => {
    if (distractionText.trim()) {
      setDistractionHistory(prev => [...prev, distractionText.trim()]);
      setDistractionText("");
    }
    setDistractions(prev => prev + 1);
    setShowDistractionLog(false);
    toast.show("Distraction logged. Stay focused!", "info");
  };

  const progress = Math.min((seconds / 3600) * 100, 100); // Progress toward 1h

  return (
    <motion.div className="main-content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      {!isFocusMode && (
        <HeroBanner
          title="Study Timer"
          subtitle="Track your focused study sessions and log them automatically."
          icon={Timer}
          colorClass="primary"
        />
      )}

      <AnimatePresence>
        {isFocusMode && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ 
              position: "fixed", 
              inset: 0, 
              zIndex: 1000, 
              background: "var(--background)", 
              display: "flex", 
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem"
            }}
          >
            <button 
              onClick={() => setIsFocusMode(false)}
              style={{ position: "absolute", top: "2rem", right: "2rem", background: "none", border: "none", cursor: "pointer" }}
            >
              <Minimize2 size={24} color="var(--text-muted)" />
            </button>
            
            <div style={{ textAlign: "center", maxWidth: "600px" }}>
              <motion.div
                style={{ fontSize: "8rem", fontWeight: 800, fontFamily: "var(--font-display)", color: "var(--primary)" }}
                animate={{ opacity: running ? [0.8, 1, 0.8] : 1 }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {formatTime(seconds)}
              </motion.div>
              
              <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginTop: "2rem" }}>
                <button className="btn btn-secondary" onClick={running ? handlePause : handleStart}>
                  {running ? <Pause /> : <Play />} {running ? "Pause" : "Resume"}
                </button>
                <button 
                  className="btn btn-outline" 
                  onClick={() => setShowDistractionLog(true)}
                  style={{ display: "flex", gap: "8px", alignItems: "center", borderColor: "rgba(239, 68, 68, 0.4)" }}
                >
                  <AlertOctagon size={18} color="var(--rose)" /> Log Distraction
                </button>
              </div>

              <div style={{ marginTop: "3rem", display: "flex", gap: "10px", justifyContent: "center" }}>
                {["rain", "white-noise", "lo-fi"].map(s => (
                  <button 
                    key={s}
                    onClick={() => setAmbientSound(ambientSound === s ? null : s)}
                    className={`btn btn-xs ${ambientSound === s ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ textTransform: "capitalize", borderRadius: "20px", padding: "4px 12px" }}
                  >
                    <Volume2 size={12} style={{ marginRight: "4px" }} /> {s.replace("-", " ")}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!isFocusMode && (
        <>
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
                <AlertOctagon size={18} />
              </div>
              <div className="stat-label">Distractions</div>
              <div className="stat-value" style={{ color: distractions > 0 ? "var(--rose)" : "inherit" }}>{distractions}</div>
            </div>
          </div>

          <div className="card" style={{ textAlign: "center", padding: "3rem 2rem", maxWidth: "520px", margin: "0 auto" }}>
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

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "1.5rem" }}>
              {!running ? (
                <motion.button className="btn btn-primary btn-lg" onClick={handleStart} whileTap={{ scale: 0.95 }} style={{ gap: "10px", minWidth: "130px" }}>
                  <Play size={20} fill="white" /> Start
                </motion.button>
              ) : (
                <motion.button className="btn btn-secondary btn-lg" onClick={handlePause} whileTap={{ scale: 0.95 }} style={{ gap: "10px", minWidth: "130px" }}>
                  <Pause size={20} /> Pause
                </motion.button>
              )}
              <motion.button className="btn btn-secondary btn-lg" onClick={handleReset} whileTap={{ scale: 0.95 }} style={{ padding: "13px 16px" }}>
                <RotateCcw size={18} />
              </motion.button>
              <motion.button className="btn btn-outline btn-lg" onClick={() => setIsFocusMode(true)} whileTap={{ scale: 0.95 }} style={{ padding: "13px 16px" }} title="Enter Focus Mode">
                <Maximize2 size={18} />
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
              Sessions with detailed focus metrics are saved to Activity.
            </p>

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

          <div className="card" style={{ marginTop: "1.5rem", padding: "1.25rem 1.5rem", maxWidth: "520px", margin: "1.5rem auto 0" }}>
            <div className="section-title" style={{ marginBottom: "0.75rem", fontSize: "0.875rem" }}>
              💡 Focus Mode Features
            </div>
            <ul style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {[
                "Fullscreen immersion to block digital distractions", 
                "Log specific distractions to analyze your focus patterns", 
                "Ambient sound selection (Rain, Lo-Fi) for better concentration",
                "Automatic focus score calculation based on performance"
              ].map(tip => (
                <li key={tip} style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ color: "var(--primary)", fontWeight: 700, flexShrink: 0 }}>→</span> {tip}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {/* Distraction Log Modal */}
      <AnimatePresence>
        {showDistractionLog && (
          <div style={{ position: "fixed", inset: 0, zIndex: 2000, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="card"
              style={{ width: "90%", maxWidth: "400px", padding: "1.5rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, fontSize: "1.1rem" }}>Log Distraction</h3>
                <button onClick={() => setShowDistractionLog(false)} style={{ background: "none", border: "none" }}><X size={20} /></button>
              </div>
              <textarea 
                className="input-field" 
                placeholder="What distracted you? (e.g. Phone, Sudden thought...)"
                rows={3}
                value={distractionText}
                onChange={e => setDistractionText(e.target.value)}
                autoFocus
                style={{ marginBottom: "1rem" }}
              />
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn btn-primary btn-full" onClick={addDistraction}>Track Distraction</button>
                <button className="btn btn-secondary btn-full" onClick={() => { setDistractions(d => d + 1); setShowDistractionLog(false); toast.show("Distraction logged.", "info") }}>Just +1</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
