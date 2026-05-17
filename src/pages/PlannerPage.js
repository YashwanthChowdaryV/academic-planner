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
import IconBadge from "../components/ui/IconBadge";

import { motion, AnimatePresence } from "framer-motion";

import {
  Sparkles,
  Lightbulb,
  Zap,
  Rocket,
  BookOpen,
  Clock,
  Target,
  Flame,
} from "lucide-react";

const THINKING_MESSAGES = [
  "Analyzing your goal with Groq AI…",
  "Building a structured learning roadmap…",
  "Optimizing phases and timelines…",
  "Finalizing your personalized roadmap…",
];

export default function PlannerPage() {
  const { user } = useAuth();

  const navigate = useNavigate();

  const toast = useToast();

  const [loading, setLoading] =
    useState(false);

  const [thinkingMsg, setThinkingMsg] =
    useState(THINKING_MESSAGES[0]);

  const [error, setError] =
    useState("");

  const [msgIdx, setMsgIdx] =
    useState(0);

  async function handleSubmit(
    payload
  ) {
    setError("");

    setLoading(true);

    setMsgIdx(0);

    setThinkingMsg(
      THINKING_MESSAGES[0]
    );

    const interval = setInterval(() => {
      setMsgIdx((i) => {
        const next = Math.min(
          i + 1,
          THINKING_MESSAGES.length -
            1
        );

        setThinkingMsg(
          THINKING_MESSAGES[next]
        );

        return next;
      });
    }, 6000);

    try {
      const planText =
        await generatePlan(
          payload
        );

      clearInterval(interval);

      const phases =
        splitPhases(planText);

      if (phases.length === 0) {
        setError(
          "AI output format error. Please try a more specific goal."
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
        "Academic roadmap ready!",
        "success"
      );

      navigate(`/plan/${planId}`);
    } catch (err) {
      clearInterval(interval);

      setError(
        err.message ||
          "Plan generation failed. Check your connection."
      );

      setLoading(false);
    }
  }

  return (
    <motion.div
      className="main-content"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.35,
      }}
    >
      {/* TOP HEADER */}
      <div
        style={{
          marginBottom: "2.5rem",
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
              width: "58px",
              height: "58px",
              borderRadius: "18px",
              background:
                "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <Sparkles size={28} />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 800,
                color:
                  "var(--text)",
                lineHeight: 1.1,
              }}
            >
              AI Course Planner
            </h1>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "var(--text-muted)",
                fontSize:
                  "0.95rem",
                fontWeight: 500,
              }}
            >
              Transform your
              learning goals into
              structured roadmaps
              with intelligent AI
              guidance.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        className="planner-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "minmax(0,1fr) 360px",
          gap: "2.5rem",
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* LEFT */}
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "2rem",
          }}
        >
          <AnimatePresence mode="wait">
            {loading ? (
              <AnimatedCard
                delay={0.1}
                key="loading"
                style={{
                  padding:
                    "5rem 2rem",
                  textAlign:
                    "center",
                  borderRadius:
                    "24px",
                }}
              >
                <Loader
                  text={thinkingMsg}
                />

                <p
                  className="text-muted text-sm"
                  style={{
                    marginTop:
                      "2rem",
                    lineHeight: 1.8,
                  }}
                >
                  Creating the
                  most efficient
                  and realistic
                  learning roadmap
                  for your goal.
                </p>
              </AnimatedCard>
            ) : (
              <AnimatedCard
                delay={0.1}
                key="form"
                style={{
                  padding:
                    "2.5rem",
                  borderRadius:
                    "24px",
                }}
              >
                <div
                  style={{
                    marginBottom:
                      "2rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize:
                        "1.5rem",
                      fontWeight: 800,
                      marginBottom:
                        "0.5rem",
                    }}
                  >
                    Create Your
                    Roadmap
                  </h2>

                  <p className="text-muted text-sm">
                    Define your
                    objective and
                    let AI design
                    the learning
                    structure for
                    you.
                  </p>
                </div>

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
                    className="alert alert-error"
                    style={{
                      marginBottom:
                        "2rem",
                    }}
                  >
                    <Zap
                      size={18}
                    />{" "}
                    {error}
                  </motion.div>
                )}

                <PlanForm
                  onSubmit={
                    handleSubmit
                  }
                  loading={
                    loading
                  }
                />
              </AnimatedCard>
            )}
          </AnimatePresence>
        </div>

        {/* RIGHT */}
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "2rem",
          }}
        >
          {/* POSITIVE CARD */}
          <AnimatedCard
            delay={0.2}
            style={{
              borderRadius:
                "24px",
              background:
                "linear-gradient(135deg, rgba(236,72,153,0.06) 0%, rgba(249,115,22,0.06) 100%)",
              border:
                "1px solid rgba(236,72,153,0.12)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "flex-start",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius:
                    "16px",
                  background:
                    "linear-gradient(135deg, #ec4899 0%, #f97316 100%)",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  color:
                    "white",
                  flexShrink: 0,
                }}
              >
                <Flame
                  size={26}
                />
              </div>

              <div>
                <h3
                  style={{
                    fontSize:
                      "1.15rem",
                    fontWeight: 800,
                    marginBottom:
                      "0.75rem",
                  }}
                >
                  Every Expert Was
                  Once a Beginner
                </h3>

                <p
                  className="text-muted text-sm"
                  style={{
                    lineHeight: 1.8,
                  }}
                >
                  Consistent
                  learning and
                  structured
                  planning create
                  long-term growth.
                  Small daily
                  progress compounds
                  into massive
                  achievement over
                  time.
                </p>
              </div>
            </div>
          </AnimatedCard>

          {/* PRO TIPS */}
          <AnimatedCard
            delay={0.3}
            style={{
              borderRadius:
                "24px",
              border:
                "1px solid rgba(249,115,22,0.12)",
            }}
          >
            <div className="section-title">
              <IconBadge
                icon={
                  Lightbulb
                }
                size={18}
                colorClass="amber"
              />

              Smart Planning Tips
            </div>

            <div
              style={{
                display:
                  "flex",
                flexDirection:
                  "column",
                gap: "1.5rem",
                marginTop:
                  "1.5rem",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <div
                  style={{
                    color:
                      "#ec4899",
                    marginTop:
                      "2px",
                  }}
                >
                  <Rocket
                    size={18}
                  />
                </div>

                <div>
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize:
                        "0.95rem",
                      marginBottom:
                        "0.3rem",
                    }}
                  >
                    Be Specific
                  </h4>

                  <p className="text-muted text-sm">
                    Clear goals help
                    the AI generate
                    more accurate
                    and useful
                    roadmaps.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <div
                  style={{
                    color:
                      "#f97316",
                    marginTop:
                      "2px",
                  }}
                >
                  <BookOpen
                    size={18}
                  />
                </div>

                <div>
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize:
                        "0.95rem",
                      marginBottom:
                        "0.3rem",
                    }}
                  >
                    Mention Your
                    Background
                  </h4>

                  <p className="text-muted text-sm">
                    Include your
                    current skill
                    level to avoid
                    unnecessary
                    basics.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <div
                  style={{
                    color:
                      "#ec4899",
                    marginTop:
                      "2px",
                  }}
                >
                  <Clock
                    size={18}
                  />
                </div>

                <div>
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize:
                        "0.95rem",
                      marginBottom:
                        "0.3rem",
                    }}
                  >
                    Stay Realistic
                  </h4>

                  <p className="text-muted text-sm">
                    Sustainable daily
                    study hours lead
                    to better
                    long-term
                    consistency.
                  </p>
                </div>
              </div>

              <div
                style={{
                  display:
                    "flex",
                  gap: "14px",
                  alignItems:
                    "flex-start",
                }}
              >
                <div
                  style={{
                    color:
                      "#f97316",
                    marginTop:
                      "2px",
                  }}
                >
                  <Target
                    size={18}
                  />
                </div>

                <div>
                  <h4
                    style={{
                      fontWeight: 700,
                      fontSize:
                        "0.95rem",
                      marginBottom:
                        "0.3rem",
                    }}
                  >
                    Focus on One
                    Goal
                  </h4>

                  <p className="text-muted text-sm">
                    Single focused
                    roadmaps improve
                    completion and
                    learning quality.
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
