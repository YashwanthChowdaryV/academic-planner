// src/pages/PlanViewPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPlan, getProgress, togglePhase, saveNote, getNotesForPlan } from "../services/planService";
import { savePhaseTimestamp, removePhaseTimestamp, savePlanRating, saveGlobalNote, getGlobalNote } from "../services/extendedService";
import { splitPhases } from "../utils/splitPhases";
import PhaseCard from "../components/PhaseCard";
import ProgressBar from "../components/ProgressBar";
import CountdownBar from "../components/CountdownBar";
import RatingStars from "../components/RatingStars";
import MilestoneBadge from "../components/MilestoneBadge";
import Loader from "../components/Loader";
import IconBadge from "../components/ui/IconBadge";
import AnimatedCard from "../components/ui/AnimatedCard";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { GraduationCap, Calendar, Clock, Zap, ArrowLeft, Plus, History, Trophy, AlertCircle, Star, BookOpen, Edit3, Target, Rocket } from "lucide-react";

export default function PlanViewPage() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [plan, setPlan] = useState(null);
  const [phases, setPhases] = useState([]);
  const [progress, setProgress] = useState({});
  const [notes, setNotes] = useState({});
  const [globalNote, setGlobalNote] = useState("");
  const [savingGlobalNote, setSavingGlobalNote] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [p, prog] = await Promise.all([
          getPlan(user.uid, planId),
          getProgress(user.uid, planId),
        ]);
        if (!p) { setError("Plan not found."); setLoading(false); return; }
        setPlan(p);
        const parsed = splitPhases(p.output);
        setPhases(parsed);
        setProgress(prog?.phases || {});
        const n = await getNotesForPlan(user.uid, planId, parsed.length);
        setNotes(n);
        const gn = await getGlobalNote(user.uid, planId);
        setGlobalNote(gn);
      } catch (err) {
        setError("Failed to load plan. " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId, user.uid]);

  const handleToggle = useCallback(async (index, value) => {
    setProgress((prev) => {
      const updated = { ...prev, [String(index)]: value };
      const completedCount = Object.values(updated).filter((v, i) => String(i) !== "timestamps" && v).length;
      if (completedCount === phases.length && value === true) {
        setJustCompleted(true);
      } else {
        setJustCompleted(false);
      }
      return updated;
    });
    
    try {
      await togglePhase(user.uid, planId, index, value);
      if (value) {
        await savePhaseTimestamp(user.uid, planId, index);
      } else {
        await removePhaseTimestamp(user.uid, planId, index);
      }
      const prog = await getProgress(user.uid, planId);
      setProgress(prog?.phases || {});
      toast.show(value ? "Phase complete! 🎯" : "Phase updated", "success");
    } catch {
      setProgress((prev) => ({ ...prev, [String(index)]: !value }));
      toast.show("Sync failed", "error");
    }
  }, [user.uid, planId, toast, phases.length]);

  const handleSaveNote = useCallback(async (index, text) => {
    try {
      await saveNote(user.uid, planId, index, text);
      setNotes((n) => ({ ...n, [index]: { text } }));
      toast.show("Note saved", "success");
    } catch (err) {
      toast.show("Note save failed", "error");
    }
  }, [user.uid, planId, toast]);

  const handleRate = useCallback(async (rating) => {
    try {
      await savePlanRating(user.uid, planId, rating);
      setPlan(prev => ({ ...prev, rating }));
      toast.show("Thanks for rating!", "success");
    } catch (err) {
      toast.show("Rating failed", "error");
    }
  }, [user.uid, planId, toast]);

  const handleSaveGlobalNote = useCallback(async () => {
    setSavingGlobalNote(true);
    try {
      await saveGlobalNote(user.uid, planId, globalNote);
      toast.show("Plan notes updated", "success");
    } catch (err) {
      toast.show("Global note failed", "error");
    } finally {
      setSavingGlobalNote(false);
    }
  }, [user.uid, planId, globalNote, toast]);

  if (loading) return <div className="main-content"><Loader text="Opening roadmap..." /></div>;

  if (error) return (
    <div className="main-content">
      <div className="alert alert-error"><AlertCircle size={20} /> {error}</div>
      <button className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={() => navigate(-1)}><ArrowLeft size={16} /> Go Back</button>
    </div>
  );

  const total = phases.length;
  const completed = Object.keys(progress).filter(k => k !== "timestamps" && progress[k]).length;
  const createdAtStr = plan.createdAt?.toDate?.()
    ? plan.createdAt.toDate().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
    : "Recently";

  const completionPct = Math.round((completed / total) * 100) || 0;

  return (
    <motion.div className="main-content">
      {/* Header UI */}
      <div className="card plan-view-header" style={{ marginBottom: "2rem", background: "linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)", color: "white", border: "none", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", right: "-5%", top: "-20%", opacity: 0.1, pointerEvents: "none" }}>
          <Target size={300} color="white" />
        </div>
        
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "2rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <div style={{ flex: 1, minWidth: "300px" }}>
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "0.5rem" }}>
                  <IconBadge icon={Rocket} size={14} colorClass="white" />
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, opacity: 0.9, textTransform: "uppercase", letterSpacing: "1px" }}>Current Roadmap</span>
                </div>
                <h1 style={{ fontSize: "2.25rem", fontFamily: "var(--font-display)", fontWeight: 800, color: "white", marginBottom: "0.5rem", lineHeight: 1.2 }}>
                  {plan.input?.goal}
                </h1>
                <p style={{ opacity: 0.8, fontSize: "0.95rem", fontWeight: 500 }}>Active since {createdAtStr}</p>
              </motion.div>
            </div>
            
            <div style={{ display: "flex", gap: "0.75rem" }}>
              <button className="btn btn-secondary btn-sm" onClick={() => navigate("/history")} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "white" }}>
                <History size={16} /> History
              </button>
              <button className="btn btn-primary btn-sm" onClick={() => navigate("/planner")} style={{ background: "white", color: "var(--primary)", border: "none" }}>
                <Plus size={16} /> New Plan
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "8px 16px", borderRadius: "100px", fontWeight: 700 }}>
              <GraduationCap size={14} /> {plan.input?.level}
            </span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "8px 16px", borderRadius: "100px", fontWeight: 700 }}>
              <Calendar size={14} /> {plan.input?.time_available_days} Days
            </span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "8px 16px", borderRadius: "100px", fontWeight: 700 }}>
              <Clock size={14} /> {plan.input?.hours_per_day}h Velocity
            </span>
            <span className="badge" style={{ background: "rgba(255,255,255,0.15)", color: "white", padding: "8px 16px", borderRadius: "100px", fontWeight: 700 }}>
              <Zap size={14} /> {plan.meta?.estimatedTotalHours}h Focus
            </span>
          </div>

          <CountdownBar createdAt={plan.createdAt} daysAllocated={plan.input?.time_available_days} variant="white" />

          {plan.input?.constraints?.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <div style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800, opacity: 0.7, marginBottom: "0.75rem" }}>
                Boundaries & Settings
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                {plan.input.constraints.map((c, i) => (
                  <span key={i} style={{ background: "rgba(0,0,0,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", padding: "6px 14px", fontSize: "0.85rem", color: "white", fontWeight: 600 }}>{c}</span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="plan-view-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "2rem", alignItems: "start", width: "100%" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {phases.length === 0 ? (
            <AnimatedCard>
              <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}><AlertCircle size={18} /> Format Mismatch. Raw Plan below.</div>
              <pre style={{ color: "var(--text)", fontSize: "0.95rem", whiteSpace: "pre-wrap", lineHeight: 1.8, padding: "1.5rem", background: "var(--surface2)", borderRadius: "16px" }}>
                {plan.output}
              </pre>
            </AnimatedCard>
          ) : (
            <div className="phases-list">
              {phases.map((phase, i) => (
                <PhaseCard
                  key={i}
                  phase={phase}
                  index={i}
                  done={!!progress[String(i)]}
                  completedAt={progress.timestamps?.[String(i)]}
                  onToggle={handleToggle}
                  note={notes[i]?.text || ""}
                  onSaveNote={handleSaveNote}
                />
              ))}
            </div>
          )}

          {justCompleted || (completed === total && total > 0) ? (
            <AnimatedCard delay={0.2} style={{ background: "rgba(34, 197, 94, 0.05)", borderColor: "var(--accent)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", padding: "1rem" }}>
                <div style={{ background: "var(--accent)", color: "white", padding: "1.25rem", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: 'var(--shadow-lg)' }}>
                  <Trophy size={32} />
                </div>
                <div>
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Roadmap Conquered!</h2>
                  <p className="text-muted text-sm" style={{ marginTop: '0.25rem' }}>You've mastered this subject. Your analytics have been updated with this achievement.</p>
                </div>
              </div>
            </AnimatedCard>
          ) : null}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "sticky", top: "100px" }}>
          <AnimatedCard delay={0.1}>
            <div className="section-title">
              <IconBadge icon={Target} size={18} colorClass="primary" />
              Mastery Progress
            </div>
            <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
              <div style={{ fontSize: "3rem", fontWeight: 800, color: "var(--text)", letterSpacing: "-2px" }}>{completionPct}%</div>
              <p className="text-muted text-xs font-bold uppercase tracking-wider">Course Completion</p>
            </div>
            <ProgressBar completed={completed} total={total} height={10} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "1.5rem" }}>
              <span className="text-xs font-bold text-muted">{completed} / {total} Phases</span>
              <MilestoneBadge percentage={completionPct} />
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2}>
            <div className="section-title">
              <IconBadge icon={Star} size={18} colorClass="amber" />
              Review Strategy
            </div>
            <p className="text-muted text-xs mb-3">Rate the quality and helpfulness of this AI roadmap.</p>
            <RatingStars initialRating={plan.rating || 0} onRate={handleRate} />
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <div className="section-title">
              <IconBadge icon={Edit3} size={18} colorClass="secondary" />
              Strategic Notes
            </div>
            <textarea
              className="input text-sm"
              rows="6"
              placeholder="Resources, links, or overarching thoughts for this roadmap..."
              value={globalNote}
              onChange={(e) => setGlobalNote(e.target.value)}
              style={{ resize: "none", marginBottom: "1rem", borderRadius: "12px", padding: '12px' }}
            />
            <button 
              className="btn btn-primary btn-sm btn-full"
              onClick={handleSaveGlobalNote}
              disabled={savingGlobalNote}
            >
              {savingGlobalNote ? "Syncing..." : "Update Roadmap Notes"}
            </button>
          </AnimatedCard>
        </div>
      </div>
    </motion.div>
  );
}

