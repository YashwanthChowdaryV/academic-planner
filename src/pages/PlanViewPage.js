// src/pages/PlanViewPage.js
import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import {
  useParams,
  useNavigate,
} from "react-router-dom";

import { useAuth } from "../context/AuthContext";

import {
  getPlan,
  getProgress,
  togglePhase,
  saveNote,
  getNotesForPlan,
} from "../services/planService";

import {
  savePhaseTimestamp,
  removePhaseTimestamp,
  savePlanRating,
  saveGlobalNote,
  getGlobalNote,
} from "../services/extendedService";

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

import {
  GraduationCap,
  Calendar,
  Clock,
  Zap,
  ArrowLeft,
  Plus,
  History,
  Trophy,
  AlertCircle,
  Star,
  Edit3,
  Target,
} from "lucide-react";

export default function PlanViewPage() {
  const { planId } = useParams();

  const { user } = useAuth();

  const navigate = useNavigate();

  const toast = useToast();

  const [plan, setPlan] =
    useState(null);

  const [phases, setPhases] =
    useState([]);

  const [progress, setProgress] =
    useState({});

  const [notes, setNotes] =
    useState({});

  const [globalNote, setGlobalNote] =
    useState("");

  const [
    savingGlobalNote,
    setSavingGlobalNote,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [
    justCompleted,
    setJustCompleted,
  ] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [p, prog] =
          await Promise.all([
            getPlan(
              user.uid,
              planId
            ),
            getProgress(
              user.uid,
              planId
            ),
          ]);

        if (!p) {
          setError(
            "Plan not found."
          );

          setLoading(false);

          return;
        }

        setPlan(p);

        const parsed =
          splitPhases(p.output);

        setPhases(parsed);

        setProgress(
          prog?.phases || {}
        );

        const n =
          await getNotesForPlan(
            user.uid,
            planId,
            parsed.length
          );

        setNotes(n);

        const gn =
          await getGlobalNote(
            user.uid,
            planId
          );

        setGlobalNote(gn);
      } catch (err) {
        setError(
          "Failed to load plan. " +
            err.message
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [planId, user.uid]);

  const handleToggle =
    useCallback(
      async (index, value) => {
        setProgress((prev) => {
          const updated = {
            ...prev,
            [String(index)]:
              value,
          };

          const completedCount =
            Object.values(
              updated
            ).filter(
              (v, i) =>
                String(i) !==
                  "timestamps" &&
                v
            ).length;

          if (
            completedCount ===
              phases.length &&
            value === true
          ) {
            setJustCompleted(true);
          } else {
            setJustCompleted(false);
          }

          return updated;
        });

        try {
          await togglePhase(
            user.uid,
            planId,
            index,
            value
          );

          if (value) {
            await savePhaseTimestamp(
              user.uid,
              planId,
              index
            );
          } else {
            await removePhaseTimestamp(
              user.uid,
              planId,
              index
            );
          }

          const prog =
            await getProgress(
              user.uid,
              planId
            );

          setProgress(
            prog?.phases || {}
          );

          toast.show(
            value
              ? "Phase complete!"
              : "Phase updated",
            "success"
          );
        } catch {
          setProgress((prev) => ({
            ...prev,
            [String(index)]:
              !value,
          }));

          toast.show(
            "Sync failed",
            "error"
          );
        }
      },
      [
        user.uid,
        planId,
        toast,
        phases.length,
      ]
    );

  const handleSaveNote =
    useCallback(
      async (index, text) => {
        try {
          await saveNote(
            user.uid,
            planId,
            index,
            text
          );

          setNotes((n) => ({
            ...n,
            [index]: { text },
          }));

          toast.show(
            "Note saved",
            "success"
          );
        } catch {
          toast.show(
            "Note save failed",
            "error"
          );
        }
      },
      [user.uid, planId, toast]
    );

  const handleRate =
    useCallback(
      async (rating) => {
        try {
          await savePlanRating(
            user.uid,
            planId,
            rating
          );

          setPlan((prev) => ({
            ...prev,
            rating,
          }));

          toast.show(
            "Thanks for rating!",
            "success"
          );
        } catch {
          toast.show(
            "Rating failed",
            "error"
          );
        }
      },
      [user.uid, planId, toast]
    );

  const handleSaveGlobalNote =
    useCallback(async () => {
      setSavingGlobalNote(true);

      try {
        await saveGlobalNote(
          user.uid,
          planId,
          globalNote
        );

        toast.show(
          "Plan notes updated",
          "success"
        );
      } catch {
        toast.show(
          "Global note failed",
          "error"
        );
      } finally {
        setSavingGlobalNote(false);
      }
    }, [
      user.uid,
      planId,
      globalNote,
      toast,
    ]);

  if (loading)
    return (
      <div className="main-content">
        <Loader text="Opening roadmap..." />
      </div>
    );

  if (error)
    return (
      <div className="main-content">
        <div className="alert alert-error">
          <AlertCircle size={20} />{" "}
          {error}
        </div>

        <button
          className="btn btn-secondary"
          style={{
            marginTop: "1rem",
          }}
          onClick={() =>
            navigate(-1)
          }
        >
          <ArrowLeft size={16} />
          Go Back
        </button>
      </div>
    );

  const total = phases.length;

  const completed =
    Object.keys(progress).filter(
      (k) =>
        k !== "timestamps" &&
        progress[k]
    ).length;

  const completionPct =
    Math.round(
      (completed / total) * 100
    ) || 0;

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
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          {/* LEFT */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "58px",
                height: "58px",
                borderRadius: "18px",
                background:
                  "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent:
                  "center",
                color: "white",
                flexShrink: 0,
              }}
            >
              <Target size={28} />
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
                {plan.input?.goal}
              </h1>

              <p
                style={{
                  margin:
                    "6px 0 0",
                  color:
                    "var(--text-muted)",
                  fontSize:
                    "0.95rem",
                }}
              >
                Learning roadmap
                overview and
                progress tracking.
              </p>
            </div>
          </div>

          {/* ACTIONS */}
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              flexWrap: "wrap",
            }}
          >
            <button
              className="btn btn-secondary"
              onClick={() =>
                navigate(
                  "/history"
                )
              }
            >
              <History size={16} />
              History
            </button>

            <button
              className="btn btn-primary"
              onClick={() =>
                navigate(
                  "/planner"
                )
              }
              style={{
                background:
                  "#2563eb",
                border: "none",
              }}
            >
              <Plus size={16} />
              New Plan
            </button>
          </div>
        </div>

        {/* PROGRESS FIRST */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div
            style={{
              padding: "1.25rem",
              borderRadius: "20px",
              background:
                "white",
              border:
                "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                marginBottom:
                  "0.75rem",
              }}
            >
              <GraduationCap
                size={18}
                color="#2563eb"
              />

              <span
                style={{
                  fontSize:
                    "0.8rem",
                  fontWeight: 700,
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                }}
              >
                Level
              </span>
            </div>

            <div
              style={{
                fontSize:
                  "1.15rem",
                fontWeight: 800,
                color:
                  "var(--text)",
              }}
            >
              {
                plan.input
                  ?.level
              }
            </div>
          </div>

          <div
            style={{
              padding: "1.25rem",
              borderRadius: "20px",
              background:
                "white",
              border:
                "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                marginBottom:
                  "0.75rem",
              }}
            >
              <Calendar
                size={18}
                color="#2563eb"
              />

              <span
                style={{
                  fontSize:
                    "0.8rem",
                  fontWeight: 700,
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                }}
              >
                Duration
              </span>
            </div>

            <div
              style={{
                fontSize:
                  "1.15rem",
                fontWeight: 800,
                color:
                  "var(--text)",
              }}
            >
              {
                plan.input
                  ?.time_available_days
              }{" "}
              Days
            </div>
          </div>

          <div
            style={{
              padding: "1.25rem",
              borderRadius: "20px",
              background:
                "white",
              border:
                "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                marginBottom:
                  "0.75rem",
              }}
            >
              <Clock
                size={18}
                color="#2563eb"
              />

              <span
                style={{
                  fontSize:
                    "0.8rem",
                  fontWeight: 700,
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                }}
              >
                Daily Hours
              </span>
            </div>

            <div
              style={{
                fontSize:
                  "1.15rem",
                fontWeight: 800,
                color:
                  "var(--text)",
              }}
            >
              {
                plan.input
                  ?.hours_per_day
              }
              h / day
            </div>
          </div>

          <div
            style={{
              padding: "1.25rem",
              borderRadius: "20px",
              background:
                "white",
              border:
                "1px solid #dbeafe",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                marginBottom:
                  "0.75rem",
              }}
            >
              <Zap
                size={18}
                color="#2563eb"
              />

              <span
                style={{
                  fontSize:
                    "0.8rem",
                  fontWeight: 700,
                  color:
                    "var(--text-muted)",
                  textTransform:
                    "uppercase",
                }}
              >
                Progress
              </span>
            </div>

            <div
              style={{
                fontSize:
                  "1.15rem",
                fontWeight: 800,
                color:
                  "#2563eb",
              }}
            >
              {completionPct}%
            </div>
          </div>
        </div>

        {/* COUNTDOWN */}
        <div
          style={{
            background: "white",
            borderRadius: "20px",
            padding: "1.25rem",
            border:
              "1px solid #dbeafe",
          }}
        >
          <CountdownBar
            createdAt={
              plan.createdAt
            }
            daysAllocated={
              plan.input
                ?.time_available_days
            }
          />
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 320px",
          gap: "2rem",
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
            gap: "1.5rem",
          }}
        >
          {phases.length === 0 ? (
            <AnimatedCard>
              <div
                className="alert alert-error"
                style={{
                  marginBottom:
                    "1.5rem",
                }}
              >
                <AlertCircle size={18} />
                Format Mismatch.
                Raw Plan below.
              </div>

              <pre
                style={{
                  color:
                    "var(--text)",
                  fontSize:
                    "0.95rem",
                  whiteSpace:
                    "pre-wrap",
                  lineHeight: 1.8,
                  padding:
                    "1.5rem",
                  background:
                    "var(--surface2)",
                  borderRadius:
                    "16px",
                }}
              >
                {plan.output}
              </pre>
            </AnimatedCard>
          ) : (
            <div>
              {phases.map(
                (
                  phase,
                  i
                ) => (
                  <PhaseCard
                    key={i}
                    phase={
                      phase
                    }
                    index={i}
                    done={
                      !!progress[
                        String(
                          i
                        )
                      ]
                    }
                    completedAt={
                      progress
                        .timestamps?.[
                        String(
                          i
                        )
                      ]
                    }
                    onToggle={
                      handleToggle
                    }
                    note={
                      notes[i]
                        ?.text ||
                      ""
                    }
                    onSaveNote={
                      handleSaveNote
                    }
                  />
                )
              )}
            </div>
          )}

          {(justCompleted ||
            (completed ===
              total &&
              total > 0)) && (
            <AnimatedCard
              delay={0.2}
              style={{
                background:
                  "rgba(34, 197, 94, 0.05)",
                borderColor:
                  "var(--accent)",
              }}
            >
              <div
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "1.5rem",
                  padding:
                    "1rem",
                }}
              >
                <div
                  style={{
                    background:
                      "var(--accent)",
                    color:
                      "white",
                    padding:
                      "1.25rem",
                    borderRadius:
                      "50%",
                    display:
                      "flex",
                    alignItems:
                      "center",
                    justifyContent:
                      "center",
                  }}
                >
                  <Trophy size={32} />
                </div>

                <div>
                  <h2
                    style={{
                      fontSize:
                        "1.25rem",
                      fontWeight: 800,
                    }}
                  >
                    Roadmap
                    Completed!
                  </h2>

                  <p
                    className="text-muted text-sm"
                    style={{
                      marginTop:
                        "0.25rem",
                    }}
                  >
                    Excellent
                    progress on
                    your learning
                    journey.
                  </p>
                </div>
              </div>
            </AnimatedCard>
          )}
        </div>

        {/* RIGHT */}
        <div
          style={{
            display: "flex",
            flexDirection:
              "column",
            gap: "1.5rem",
            position:
              "sticky",
            top: "100px",
          }}
        >
          <AnimatedCard
            delay={0.1}
          >
            <div className="section-title">
              <IconBadge
                icon={Target}
                size={18}
                colorClass="primary"
              />

              Mastery Progress
            </div>

            <div
              style={{
                textAlign:
                  "center",
                padding:
                  "1.5rem 0",
              }}
            >
              <div
                style={{
                  fontSize:
                    "3rem",
                  fontWeight: 800,
                  color:
                    "#2563eb",
                  letterSpacing:
                    "-2px",
                }}
              >
                {completionPct}%
              </div>

              <p className="text-muted text-xs font-bold uppercase tracking-wider">
                Course
                Completion
              </p>
            </div>

            <ProgressBar
              completed={
                completed
              }
              total={total}
              height={10}
            />

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginTop:
                  "1.5rem",
              }}
            >
              <span className="text-xs font-bold text-muted">
                {completed} /{" "}
                {total} Phases
              </span>

              <MilestoneBadge
                percentage={
                  completionPct
                }
              />
            </div>
          </AnimatedCard>

          <AnimatedCard
            delay={0.2}
          >
            <div className="section-title">
              <IconBadge
                icon={Star}
                size={18}
                colorClass="amber"
              />

              Review Strategy
            </div>

            <p className="text-muted text-xs mb-3">
              Rate the quality
              and usefulness
              of this roadmap.
            </p>

            <RatingStars
              initialRating={
                plan.rating ||
                0
              }
              onRate={
                handleRate
              }
            />
          </AnimatedCard>

          <AnimatedCard
            delay={0.3}
          >
            <div className="section-title">
              <IconBadge
                icon={Edit3}
                size={18}
                colorClass="secondary"
              />

              Strategic Notes
            </div>

            <textarea
              className="input text-sm"
              rows="6"
              placeholder="Resources, links, or important thoughts for this roadmap..."
              value={globalNote}
              onChange={(e) =>
                setGlobalNote(
                  e.target.value
                )
              }
              style={{
                resize: "none",
                marginBottom:
                  "1rem",
                borderRadius:
                  "12px",
                padding:
                  "12px",
              }}
            />

            <button
              className="btn btn-primary btn-sm btn-full"
              onClick={
                handleSaveGlobalNote
              }
              disabled={
                savingGlobalNote
              }
              style={{
                background:
                  "#2563eb",
                border: "none",
              }}
            >
              {savingGlobalNote
                ? "Syncing..."
                : "Update Roadmap Notes"}
            </button>
          </AnimatedCard>
        </div>
      </div>
    </motion.div>
  );
}
