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

import AnimatedCard from "../components/ui/AnimatedCard";

import { motion, AnimatePresence } from "framer-motion";

import {
  Sparkles,
  Lightbulb,
  Rocket,
  BookOpen,
  Clock,
  Target,
  TrendingUp,
} from "lucide-react";

const THINKING_MESSAGES = [
  "Understanding your learning goal...",
  "Preparing a structured roadmap...",
  "Optimizing timeline and phases...",
  "Finalizing your personalized plan...",
];

export default function PlannerPage() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const toast = useToast();

  const [loading, setLoading] = useState(false);

  const [thinkingMsg, setThinkingMsg] =
    useState(THINKING_MESSAGES[0]);

  const [error, setError] = useState("");

  const [msgIdx, setMsgIdx] = useState(0);

  async function handleSubmit(payload) {
    setError("");

    setLoading(true);

    setMsgIdx(0);

    setThinkingMsg(THINKING_MESSAGES[0]);

    const interval = setInterval(() => {
      setMsgIdx((i) => {
        const next = Math.min(
          i + 1,
          THINKING_MESSAGES.length - 1
        );

        setThinkingMsg(
          THINKING_MESSAGES[next]
        );

        return next;
      });
    }, 5000);

    try {
      const planText =
        await generatePlan(payload);

      clearInterval(interval);

      const phases =
        splitPhases(planText);

      if (phases.length === 0) {
        setError(
          "Unable to generate a proper roadmap. Try giving a more specific goal."
        );

        setLoading(false);

        return;
      }

      const planId =
        await createPlan(
          user.uid,
          payload,
          planText,
          phases.length
        );

      toast.show(
        "Roadmap generated successfully",
        "success"
      );

      navigate(`/plan/${planId}`);
    } catch (err) {
      clearInterval(interval);

      setError(
        err.message ||
          "Plan generation failed. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: "2.75rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "16px",
              background:
                "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <Sparkles size={24} />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 800,
                color: "var(--text)",
                lineHeight: 1.1,
              }}
            >
              Course Planner
            </h1>

            <p
              style={{
                marginTop: "0.45rem",
                color: "var(--text-muted)",
                fontSize: "0.95rem",
                fontWeight: 500,
                lineHeight: 1.6,
              }}
            >
              Build structured learning roadmaps
              based on your goals, schedule, and
              current skill level.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0, 1fr) 360px",
          gap: "2.5rem",
          alignItems: "start",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <AnimatedCard
                key="loading"
                delay={0.1}
                style={{
                  padding:
                    "5rem 2.5rem",
                  textAlign: "center",
                  borderRadius: "24px",
                }}
              >
                <Loader text={thinkingMsg} />

                <p
                  style={{
                    marginTop: "2rem",
                    color:
                      "var(--text-muted)",
                    fontSize: "0.95rem",
                    lineHeight: 1.8,
                  }}
                >
                  Generating a practical and
                  realistic roadmap for your
                  learning journey.
                </p>
              </AnimatedCard>
            ) : (
              <AnimatedCard
                key="form"
                delay={0.1}
                style={{
                  padding:
                    "2.75rem",
                  borderRadius: "24px",
                }}
              >
                {/* FORM HEADER */}
                <div
                  style={{
                    marginBottom:
                      "2.25rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize:
                        "1.45rem",
                      fontWeight: 800,
                      marginBottom:
                        "0.6rem",
                      color:
                        "var(--text)",
                    }}
                  >
                    Generate Your Plan
                  </h2>

                  <p
                    style={{
                      color:
                        "var(--text-muted)",
                      fontSize:
                        "0.95rem",
                      lineHeight: 1.7,
                    }}
                  >
                    Enter your learning target
                    and preferred study pace to
                    create a personalized roadmap.
                  </p>
                </div>

                {/* ERROR */}
                {error && (
                  <motion.div
                    initial={{
                      opacity: 0,
                      y: -10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    style={{
                      padding:
                        "1rem 1.1rem",
                      borderRadius:
                        "14px",
                      background:
                        "rgba(239,68,68,0.08)",
                      border:
                        "1px solid rgba(239,68,68,0.15)",
                      color:
                        "#ef4444",
                      fontSize:
                        "0.92rem",
                      fontWeight: 600,
                      marginBottom:
                        "2rem",
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* PLAN FORM */}
                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "1.5rem",
                  }}
                >
                  <PlanForm
                    onSubmit={
                      handleSubmit
                    }
                    loading={loading}
                  />
                </div>
              </AnimatedCard>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT SIDE */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "2rem",
          }}
        >
          {/* QUOTE CARD */}
          <AnimatedCard
            delay={0.2}
            style={{
              borderRadius: "24px",
              padding: "2rem",
              background:
                "linear-gradient(135deg, rgba(249,115,22,0.06) 0%, rgba(236,72,153,0.06) 100%)",
              border:
                "1px solid rgba(249,115,22,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "flex-start",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "52px",
                  height: "52px",
                  borderRadius: "14px",
                  background:
                    "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent:
                    "center",
                  color: "white",
                  flexShrink: 0,
                }}
              >
                <TrendingUp size={22} />
              </div>

              <div>
                <h3
                  style={{
                    fontSize:
                      "1.05rem",
                    fontWeight: 700,
                    marginBottom:
                      "0.7rem",
                    color:
                      "var(--text)",
                  }}
                >
                  Consistency builds mastery
                </h3>

                <p
                  style={{
                    color:
                      "var(--text-muted)",
                    fontSize:
                      "0.92rem",
                    lineHeight: 1.8,
                  }}
                >
                  Focus on steady progress,
                  realistic goals, and daily
                  discipline. Small efforts done
                  consistently create long-term
                  growth.
                </p>
              </div>
            </div>
          </AnimatedCard>

          {/* TIPS */}
          <AnimatedCard
            delay={0.3}
            style={{
              borderRadius: "24px",
              padding: "2rem",
            }}
          >
            <h3
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                marginBottom: "1.8rem",
                color: "var(--text)",
              }}
            >
              Planning Tips
            </h3>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.75rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <Rocket
                  size={18}
                  color="#f97316"
                  style={{
                    marginTop: "3px",
                    flexShrink: 0,
                  }}
                />

                <div>
                  <h4
                    style={{
                      fontSize:
                        "0.95rem",
                      fontWeight: 700,
                      marginBottom:
                        "0.35rem",
                    }}
                  >
                    Be specific with goals
                  </h4>

                  <p
                    style={{
                      color:
                        "var(--text-muted)",
                      fontSize:
                        "0.88rem",
                      lineHeight: 1.7,
                    }}
                  >
                    Detailed goals help generate
                    better and more accurate
                    learning plans.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <BookOpen
                  size={18}
                  color="#ec4899"
                  style={{
                    marginTop: "3px",
                    flexShrink: 0,
                  }}
                />

                <div>
                  <h4
                    style={{
                      fontSize:
                        "0.95rem",
                      fontWeight: 700,
                      marginBottom:
                        "0.35rem",
                    }}
                  >
                    Mention your background
                  </h4>

                  <p
                    style={{
                      color:
                        "var(--text-muted)",
                      fontSize:
                        "0.88rem",
                      lineHeight: 1.7,
                    }}
                  >
                    Adding your current skill
                    level helps avoid unnecessary
                    beginner content.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <Clock
                  size={18}
                  color="#f97316"
                  style={{
                    marginTop: "3px",
                    flexShrink: 0,
                  }}
                />

                <div>
                  <h4
                    style={{
                      fontSize:
                        "0.95rem",
                      fontWeight: 700,
                      marginBottom:
                        "0.35rem",
                    }}
                  >
                    Keep study hours realistic
                  </h4>

                  <p
                    style={{
                      color:
                        "var(--text-muted)",
                      fontSize:
                        "0.88rem",
                      lineHeight: 1.7,
                    }}
                  >
                    Sustainable schedules improve
                    completion rates and reduce
                    burnout.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <Target
                  size={18}
                  color="#ec4899"
                  style={{
                    marginTop: "3px",
                    flexShrink: 0,
                  }}
                />

                <div>
                  <h4
                    style={{
                      fontSize:
                        "0.95rem",
                      fontWeight: 700,
                      marginBottom:
                        "0.35rem",
                    }}
                  >
                    Focus on one roadmap
                  </h4>

                  <p
                    style={{
                      color:
                        "var(--text-muted)",
                      fontSize:
                        "0.88rem",
                      lineHeight: 1.7,
                    }}
                  >
                    Concentrating on one major
                    goal improves learning
                    efficiency and consistency.
                  </p>
                </div>
              </div>
            </div>
          </AnimatedCard>
        </div>
      </div>
    </motion.div>
  );
}
