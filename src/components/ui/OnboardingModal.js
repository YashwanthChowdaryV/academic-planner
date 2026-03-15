// src/components/ui/OnboardingModal.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Calendar, Trophy, Bot, ChevronRight } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const STEPS = [
  {
    icon: "🎯",
    title: "Welcome to AcadPlan AI!",
    desc: "Your personal AI-powered academic planner. Let's take a quick tour of what you can do.",
  },
  {
    icon: "🤖",
    title: "Generate AI Learning Plans",
    desc: "Just describe your learning goal and the AI creates a complete, structured roadmap tailored to your level and pace.",
    highlight: "Create Plan",
  },
  {
    icon: "📅",
    title: "Track Your Progress Daily",
    desc: "Log study hours using the built-in Study Timer. Your activity is visualized on the Calendar and Analytics pages.",
    highlight: "Study Timer & Calendar",
  },
  {
    icon: "🏆",
    title: "Earn Achievements",
    desc: "Complete plans and build streaks to earn badges. Challenge yourself to reach Scholar Elite status!",
    highlight: "Achievements",
  },
  {
    icon: "💬",
    title: "Chat with Your AI Coach",
    desc: "Get personalized study strategies, motivation, and learning tips from your AI-powered coach anytime.",
    highlight: "AI Coach",
  },
];

export default function OnboardingModal({ uid, onClose }) {
  const [step, setStep] = useState(0);

  const handleFinish = async () => {
    try {
      const ref = doc(db, "users", uid, "settings", "prefs");
      await updateDoc(ref, { onboarded: true }).catch(() => {
        // If doc doesn't exist yet, create it
        return import("firebase/firestore").then(({ setDoc, serverTimestamp }) =>
          setDoc(ref, { onboarded: true, updatedAt: serverTimestamp() }, { merge: true })
        );
      });
    } catch {}
    onClose();
  };

  const s = STEPS[step];
  const isLast = step === STEPS.length - 1;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, zIndex: 2000,
          background: "rgba(15, 23, 42, 0.6)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "1rem"
        }}
      >
        <motion.div
          initial={{ scale: 0.92, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.92, y: 20, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{
            background: "var(--surface)",
            borderRadius: "24px",
            padding: "2.5rem",
            maxWidth: "460px",
            width: "100%",
            boxShadow: "var(--shadow-xl)",
            border: "1px solid var(--border)",
            position: "relative"
          }}
        >
          <button
            onClick={handleFinish}
            style={{
              position: "absolute", top: "1.25rem", right: "1.25rem",
              background: "none", border: "none", color: "var(--text-dim)",
              cursor: "pointer", padding: "4px"
            }}
          >
            <X size={18} />
          </button>

          {/* Step indicator */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "2rem" }}>
            {STEPS.map((_, i) => (
              <div key={i} style={{
                flex: 1, height: "3px", borderRadius: "99px",
                background: i <= step ? "var(--primary)" : "var(--surface3)",
                transition: "background 0.3s"
              }} />
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <div style={{ fontSize: "3.5rem", marginBottom: "1.25rem", textAlign: "center" }}>{s.icon}</div>
              <h2 style={{
                fontSize: "1.4rem", fontWeight: 800,
                fontFamily: "var(--font-display)",
                marginBottom: "0.75rem", textAlign: "center",
                letterSpacing: "-0.03em"
              }}>
                {s.title}
              </h2>
              <p style={{
                color: "var(--text-muted)", textAlign: "center",
                lineHeight: 1.65, fontSize: "0.9rem", marginBottom: "1.5rem"
              }}>
                {s.desc}
              </p>
              {s.highlight && (
                <div style={{
                  background: "var(--primary-soft)", color: "var(--primary)",
                  borderRadius: "var(--radius-sm)", padding: "10px 16px",
                  textAlign: "center", fontWeight: 700, fontSize: "0.875rem",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: "8px"
                }}>
                  <Sparkles size={16} /> {s.highlight}
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "2rem" }}>
            {step > 0 && (
              <button
                className="btn btn-secondary btn-full"
                onClick={() => setStep(s => s - 1)}
              >
                Back
              </button>
            )}
            <button
              className="btn btn-primary btn-full"
              onClick={isLast ? handleFinish : () => setStep(s => s + 1)}
              style={{ gap: "8px" }}
            >
              {isLast ? "🚀 Get Started!" : <><span>Next</span><ChevronRight size={16} /></>}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
