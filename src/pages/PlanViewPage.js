// src/pages/PlanViewPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getPlan, getProgress, togglePhase, saveNote, getNotesForPlan } from "../services/planService";
import { splitPhases } from "../utils/splitPhases";
import PhaseCard from "../components/PhaseCard";
import ProgressBar from "../components/ProgressBar";
import Loader from "../components/Loader";
import { useToast } from "../components/Toast";

export default function PlanViewPage() {
  const { planId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [plan, setPlan] = useState(null);
  const [phases, setPhases] = useState([]);
  const [progress, setProgress] = useState({});
  const [notes, setNotes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (err) {
        setError("Failed to load plan. " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [planId, user.uid]);

  const handleToggle = useCallback(async (index, value) => {
    // Optimistic update
    setProgress((prev) => ({ ...prev, [String(index)]: value }));
    try {
      await togglePhase(user.uid, planId, index, value);
      toast.show(value ? "✓ Phase marked complete!" : "Phase marked incomplete", value ? "success" : "info");
    } catch {
      // Revert
      setProgress((prev) => ({ ...prev, [String(index)]: !value }));
      toast.show("Failed to save progress", "error");
    }
  }, [user.uid, planId, toast]);

  const handleSaveNote = useCallback(async (index, text) => {
    await saveNote(user.uid, planId, index, text);
    setNotes((n) => ({ ...n, [index]: { text } }));
  }, [user.uid, planId]);

  if (loading) return (
    <div className="main-content"><Loader text="Loading your plan…" /></div>
  );

  if (error) return (
    <div className="main-content">
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-secondary" style={{ marginTop: "1rem" }} onClick={() => navigate(-1)}>← Go Back</button>
    </div>
  );

  const total = phases.length;
  const completed = Object.values(progress).filter(Boolean).length;
  const createdAt = plan.createdAt?.toDate?.()
    ? plan.createdAt.toDate().toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  return (
    <div className="main-content animate-fade-in">
      {/* Header Card */}
      <div className="plan-header-card">
        <div className="plan-title-row">
          <div>
            <div className="plan-goal-title">{plan.input?.goal}</div>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/history")}>
              ← History
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/planner")}>
              + New Plan
            </button>
          </div>
        </div>

        <div className="plan-meta-row">
          <span className="plan-meta-item">
            <span>🎓</span> {plan.input?.level}
          </span>
          <span className="plan-meta-item">
            <span>📅</span> {plan.input?.time_available_days} days
          </span>
          <span className="plan-meta-item">
            <span>⏰</span> {plan.input?.hours_per_day}h / day
          </span>
          <span className="plan-meta-item">
            <span>⚡</span> {plan.meta?.estimatedTotalHours}h total
          </span>
          <span className="plan-meta-item">
            <span>🗓</span> Created {createdAt}
          </span>
        </div>

        {plan.input?.constraints?.length > 0 && (
          <div style={{ marginBottom: "1rem" }}>
            <div className="text-xs text-muted" style={{ marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
              Constraints
            </div>
            <div className="tag-list">
              {plan.input.constraints.map((c, i) => (
                <span key={i} className="tag-item">{c}</span>
              ))}
            </div>
          </div>
        )}

        <ProgressBar completed={completed} total={total} />
      </div>

      {/* Fallback for unparsed plans */}
      {phases.length === 0 && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <div className="regen-banner">⚠ Could not auto-parse phases. Showing raw plan below.</div>
          <pre style={{ color: "var(--text-muted)", fontSize: "0.88rem", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
            {plan.output}
          </pre>
        </div>
      )}

      {/* Phase Cards */}
      <div className="phases-list">
        {phases.map((phase, i) => (
          <PhaseCard
            key={i}
            phase={phase}
            index={i}
            done={!!progress[String(i)]}
            onToggle={handleToggle}
            note={notes[i]?.text || ""}
            onSaveNote={handleSaveNote}
          />
        ))}
      </div>

      {completed === total && total > 0 && (
        <div className="alert alert-success" style={{ marginTop: "2rem" }}>
          🏆 Congratulations! You've completed all phases of this plan!
        </div>
      )}
    </div>
  );
}
