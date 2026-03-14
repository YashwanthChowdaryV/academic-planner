// src/pages/PlannerPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { generatePlan } from "../services/apiService";
import { createPlan } from "../services/planService";
import { splitPhases } from "../utils/splitPhases";
import PlanForm from "../components/PlanForm";
import Loader from "../components/Loader";
import { useToast } from "../components/Toast";

const THINKING_MESSAGES = [
  "Analysing your goal with Groq AI…",
  "Building a conservative, phased plan…",
  "Estimating durations and risks…",
  "Finalising your custom roadmap… (up to 30s)",
];

export default function PlannerPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [thinkingMsg, setThinkingMsg] = useState(THINKING_MESSAGES[0]);
  const [error, setError] = useState("");
  const [msgIdx, setMsgIdx] = useState(0);

  async function handleSubmit(payload) {
    setError("");
    setLoading(true);
    setMsgIdx(0);
    setThinkingMsg(THINKING_MESSAGES[0]);

    // Cycle through thinking messages
    const interval = setInterval(() => {
      setMsgIdx((i) => {
        const next = Math.min(i + 1, THINKING_MESSAGES.length - 1);
        setThinkingMsg(THINKING_MESSAGES[next]);
        return next;
      });
    }, 6000);

    try {
      const planText = await generatePlan(payload);
      clearInterval(interval);

      const phases = splitPhases(planText);

      if (phases.length === 0) {
        setError("Could not parse the plan. Please try again.");
        setLoading(false);
        return;
      }

      const planId = await createPlan(user.uid, payload, planText, phases.length);
      toast.show("Plan generated and saved! 🎉", "success");
      navigate(`/plan/${planId}`);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "Plan generation failed. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="main-content animate-fade-in">
      <h1 className="page-title">✏️ Generate Your Plan</h1>
      <p className="page-subtitle">
        Tell the AI your goal, time, and constraints — it'll build a phased academic roadmap for you.
      </p>

      {loading ? (
        <div className="card">
          <Loader text={thinkingMsg} />
          <p style={{ textAlign: "center", color: "var(--text-dim)", fontSize: "0.8rem", marginTop: "0.5rem" }}>
            Powered by Groq LLM · This may take up to 30 seconds
          </p>
        </div>
      ) : (
        <div className="card">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: "1.5rem" }}>
              <div>
                <strong>⚠ Generation Failed</strong>
                <p style={{ marginTop: "4px" }}>{error}</p>
              </div>
            </div>
          )}
          <PlanForm onSubmit={handleSubmit} loading={loading} />
        </div>
      )}

      <div className="card" style={{ marginTop: "1.5rem", background: "var(--surface2)" }}>
        <div className="section-title" style={{ marginBottom: "0.75rem" }}>💡 Tips for best results</div>
        <ul style={{ color: "var(--text-muted)", fontSize: "0.88rem", paddingLeft: "1.25rem", lineHeight: 2 }}>
          <li>Be specific: <em>"Build a REST API with Node.js and MongoDB"</em> beats <em>"Learn backend"</em></li>
          <li>Add constraints to skip topics you already know</li>
          <li>Use realistic hours — the AI plans conservatively</li>
          <li>Plans are saved automatically after generation</li>
        </ul>
      </div>
    </div>
  );
}
