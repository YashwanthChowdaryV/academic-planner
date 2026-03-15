// src/pages/SessionsPage.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlans } from "../services/planService";
import { saveStudySession, getStudySessions, deleteStudySession } from "../services/sessionService";
import { useToast } from "../components/Toast";
import HeroBanner from "../components/ui/HeroBanner";
import { motion, AnimatePresence } from "framer-motion";
import { Timer, Play, Pause, Square, Save, Trash2, Clock, BookOpen, AlertCircle, CheckCircle2, Zap, AlertTriangle } from "lucide-react";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function SessionsPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Selection
  const [selectedPlanId, setSelectedPlanId] = useState("");
  const [selectedPhaseIndex, setSelectedPhaseIndex] = useState(0);
  
  // Timer State
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [saving, setSaving] = useState(false);
  const intervalRef = useRef(null);

  // Load Initial Data
  useEffect(() => {
    if (!user?.uid) return;
    
    const fetchData = async () => {
      try {
        const [userPlans, userSessions] = await Promise.all([
          getUserPlans(user.uid),
          getStudySessions(user.uid)
        ]);
        setPlans(userPlans);
        setSessions(userSessions);
        if (userPlans.length > 0) {
          setSelectedPlanId(userPlans[0].id);
        }
      } catch (error) {
        toast.show("Error loading data", "error");
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [user?.uid, toast]);

  // Timer Effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const handleSave = async () => {
    if (seconds < 60) {
      toast.show("Session too short (min 1 min)", "error");
      return;
    }
    if (!selectedPlanId) {
      toast.show("Please select a plan", "error");
      return;
    }

    setSaving(true);
    const selectedPlan = plans.find(p => p.id === selectedPlanId);
    
    const sessionData = {
      planId: selectedPlanId,
      planTitle: selectedPlan?.title || "Untitled Plan",
      phaseIndex: Number(selectedPhaseIndex),
      startTime: new Date(Date.now() - seconds * 1000).toISOString(),
      endTime: new Date().toISOString(),
      duration: seconds,
      userId: user.uid,
      focusScore: 100, // Manual sessions get 100 by default or we could add a slider
      distractionsCount: 0
    };

    try {
      await saveStudySession(user.uid, sessionData);
      const updatedSessions = await getStudySessions(user.uid);
      setSessions(updatedSessions);
      handleReset();
      toast.show("Study session saved! 🚀", "success");
    } catch (error) {
      toast.show("Failed to save session", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (sessionId) => {
    if (!window.confirm("Delete this session?")) return;
    try {
      await deleteStudySession(user.uid, sessionId);
      setSessions(sessions.filter(s => s.id !== sessionId));
      toast.show("Session deleted", "success");
    } catch (error) {
      toast.show("Delete failed", "error");
    }
  };

  const selectedPlan = plans.find(p => p.id === selectedPlanId);
  const phaseCount = selectedPlan?.meta?.phaseCount || 0;

  if (loading) {
    return <div className="main-content"><div className="loader-container">Loading Sessions...</div></div>;
  }

  return (
    <motion.div 
      className="main-content"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <HeroBanner 
        title="Study Sessions"
        subtitle="Track focus time for each phase and level up your productivity."
        icon={Clock}
        colorClass="primary"
      />

      <div className="sessions-container" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "2rem", marginTop: "2rem" }}>
        
        {/* Left Side: Timer & Selection */}
        <div className="timer-section">
          <div className="card glass-card" style={{ padding: "2rem", textAlign: "center", position: "relative", overflow: "hidden" }}>
            <div className="section-title" style={{ marginBottom: "1.5rem", justifyContent: "center" }}>
              <Timer size={20} className="text-primary" /> Active Session
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <div className="timer-display" style={{ fontSize: "4rem", fontWeight: 800, fontFamily: "monospace", letterSpacing: "-2px", color: isRunning ? "var(--primary)" : "var(--text)" }}>
                {formatTime(seconds)}
              </div>
              <p className="text-muted" style={{ fontSize: "0.875rem", fontWeight: 500 }}>
                {isRunning ? "Focusing..." : "Ready to start?"}
              </p>
            </div>

            <div style={{ display: "flex", gap: "1rem", justifyContent: "center", marginBottom: "2rem" }}>
              {!isRunning ? (
                <button className="btn btn-primary btn-lg" onClick={handleStart} style={{ minWidth: "120px" }}>
                  <Play size={18} fill="currentColor" /> Start
                </button>
              ) : (
                <button className="btn btn-secondary btn-lg" onClick={handlePause} style={{ minWidth: "120px" }}>
                  <Pause size={18} fill="currentColor" /> Pause
                </button>
              )}
              <button className="btn btn-outline btn-lg" onClick={handleReset} disabled={seconds === 0}>
                <Square size={16} fill="currentColor" /> Reset
              </button>
            </div>

            <div className="divider" style={{ margin: "2rem 0" }} />

            <div className="session-config" style={{ textAlign: "left" }}>
              <h4 style={{ marginBottom: "1rem", fontSize: "0.95rem", fontWeight: 700 }}>Session Settings</h4>
              <div className="form-group">
                <label className="form-label">Associate with Plan</label>
                <select 
                  className="form-control" 
                  value={selectedPlanId} 
                  onChange={(e) => {
                    setSelectedPlanId(e.target.value);
                    setSelectedPhaseIndex(0);
                  }}
                >
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                  {plans.length === 0 && <option disabled>No plans found</option>}
                </select>
              </div>

              {selectedPlanId && phaseCount > 0 && (
                <div className="form-group">
                  <label className="form-label">Current Phase</label>
                  <select 
                    className="form-control" 
                    value={selectedPhaseIndex} 
                    onChange={(e) => setSelectedPhaseIndex(e.target.value)}
                  >
                    {[...Array(phaseCount)].map((_, i) => (
                      <option key={i} value={i}>Phase {i + 1}</option>
                    ))}
                  </select>
                </div>
              )}

              <button 
                className="btn btn-accent btn-full btn-lg" 
                style={{ marginTop: "1rem" }}
                disabled={seconds < 60 || saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : <><Save size={18} /> Finish & Save Session</>}
              </button>
              {seconds > 0 && seconds < 60 && (
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.5rem", textAlign: "center" }}>
                  * Mind 1 minute minimum to save.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: History */}
        <div className="history-section">
          <div className="card" style={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <div className="section-title" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)" }}>
              <Clock size={16} /> Recent Sessions
            </div>
            
            <div className="session-list" style={{ flex: 1, overflowY: "auto", padding: "1rem" }}>
              {sessions.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted)" }}>
                  <AlertCircle size={32} style={{ marginBottom: "1rem", opacity: 0.5 }} />
                  <p style={{ fontSize: "0.875rem" }}>No study sessions yet.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  {sessions.map(session => (
                    <motion.div 
                      key={session.id} 
                      className="session-item-card"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ 
                        padding: "1rem", 
                        background: "var(--surface2)", 
                        borderRadius: "12px",
                        border: "1px solid var(--border)",
                        position: "relative"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--primary)", textTransform: "uppercase" }}>
                          Phase {session.phaseIndex + 1}
                        </span>
                        <button 
                          onClick={() => handleDelete(session.id)}
                          style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <h5 style={{ fontSize: "0.9rem", fontWeight: 700, marginBottom: "0.25rem", color: "var(--text)" }}>
                        {session.planTitle}
                      </h5>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", color: "var(--text-muted)", fontSize: "0.8rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={12} /> {(session.duration / 60).toFixed(0)}m
                        </span>
                        <span>•</span>
                        <span>{new Date(session.startTime).toLocaleDateString()}</span>
                      </div>

                      {(session.focusScore !== undefined || session.distractionsCount !== undefined) && (
                        <div style={{ display: "flex", gap: "10px", marginTop: "10px", flexWrap: "wrap" }}>
                          {session.focusScore !== undefined && (
                            <div style={{ 
                              fontSize: "0.7rem", 
                              fontWeight: 700, 
                              padding: "4px 8px", 
                              borderRadius: "6px", 
                              background: session.focusScore > 80 ? "rgba(16, 185, 129, 0.1)" : "rgba(245, 158, 11, 0.1)",
                              color: session.focusScore > 80 ? "var(--accent)" : "var(--amber)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              <Zap size={10} /> Focus: {session.focusScore}%
                            </div>
                          )}
                          {session.distractionsCount > 0 && (
                            <div style={{ 
                              fontSize: "0.7rem", 
                              fontWeight: 700, 
                              padding: "4px 8px", 
                              borderRadius: "6px", 
                              background: "rgba(239, 68, 68, 0.1)",
                              color: "var(--rose)",
                              display: "flex",
                              alignItems: "center",
                              gap: "4px"
                            }}>
                              <AlertTriangle size={10} /> {session.distractionsCount} Distractions
                            </div>
                          )}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.4);
        }
        .session-item-card:hover {
          border-color: var(--primary-soft) !important;
          transform: translateX(4px);
        }
        .session-item-card {
          transition: all 0.2s ease;
        }
      `}</style>
    </motion.div>
  );
}
