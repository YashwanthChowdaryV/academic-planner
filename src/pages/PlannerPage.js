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
import HeroBanner from "../components/ui/HeroBanner";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Lightbulb, Zap, Rocket, BookOpen, Clock } from "lucide-react";

const THINKING_MESSAGES = [
  "Analyzing your goal with Groq AI…",
  "Building a conservative, phased plan…",
  "Estimating durations and risks…",
  "Finalizing your custom roadmap…",
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
        setError("AI output format error. Please try a more specific goal.");
        setLoading(false);
        return;
      }

      const planId = await createPlan(user.uid, payload, planText, phases.length);
      toast.show("Academic roadmap ready! 🚀", "success");
      navigate(`/plan/${planId}`);
    } catch (err) {
      clearInterval(interval);
      setError(err.message || "Plan generation failed. Check your connection.");
      setLoading(false);
    }
  }

  return (
    <motion.div className="main-content">
      <HeroBanner
        title="AI Course Planner"
        subtitle="Transform any learning goal into a structured, step-by-step roadmap in seconds."
        icon={Sparkles}
        colorClass="pink"
        imageUrl="https://brainsensei.com/wp-content/uploads/2022/07/Planning-Process-Group-Activities.jpg"
      />

      <div className="planner-grid" style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem", alignItems: "start", width: "100%" }}>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <AnimatedCard delay={0.1} key="loading" style={{ padding: "5rem 2rem", textAlign: "center" }}>
                <Loader text={thinkingMsg} />
                <p className="text-muted text-sm" style={{ marginTop: "2rem" }}>
                  Our AI is currently mapping out the most efficient path for you.<br />This usually takes about 15-20 seconds.
                </p>
              </AnimatedCard>
            ) : (
              <AnimatedCard delay={0.1} key="form" style={{ padding: "2.5rem" }}>
                <div style={{ marginBottom: "2rem" }}>
                  <h2 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "0.5rem" }}>Create Your Roadmap</h2>
                  <p className="text-muted text-sm">Define your objective and let the AI handle the structure.</p>
                </div>

                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error" style={{ marginBottom: "2rem" }}>
                    <Zap size={18} /> {error}
                  </motion.div>
                )}
                <PlanForm onSubmit={handleSubmit} loading={loading} />
              </AnimatedCard>
            )}
          </AnimatePresence>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <AnimatedCard delay={0.2} style={{ padding: 0, overflow: "hidden" }}>
            <img
              src="https://images.pexels.com/photos/1109541/pexels-photo-1109541.jpeg?cs=srgb&dl=pexels-lexovertoom-1109541.jpg&fm=jpg"
              alt="Planning"
              style={{ width: "100%", height: "200px", objectFit: "cover" }}
            />
            <div style={{ padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.75rem" }}>Smart Optimization</h3>
              <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
                Our algorithms adjust for your current level and daily availability to ensure the plan is both challenging and achievable.
              </p>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.3} style={{ background: "var(--surface2)", borderColor: "var(--primary-glow)" }}>
            <div className="section-title">
              <IconBadge icon={Lightbulb} size={18} colorClass="amber" />
              Pro Tips
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ color: "var(--primary)", marginTop: "2px" }}><Rocket size={16} /></div>
                <p className="text-sm">Be specific with your goals for higher quality roadmaps.</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ color: "var(--primary)", marginTop: "2px" }}><BookOpen size={16} /></div>
                <p className="text-sm">Mention background knowledge to skip the basics.</p>
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ color: "var(--primary)", marginTop: "2px" }}><Clock size={16} /></div>
                <p className="text-sm">Be realistic with your daily hours for a sustainable pace.</p>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </motion.div>
  );
}

