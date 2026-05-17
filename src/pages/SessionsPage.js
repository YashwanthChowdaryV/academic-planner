// src/pages/SessionsPage.js
import React, {
  useState,
  useEffect,
  useRef,
} from "react";

import { useAuth } from "../context/AuthContext";

import { getUserPlans } from "../services/planService";

import {
  saveStudySession,
  getStudySessions,
  deleteStudySession,
} from "../services/sessionService";

import { useToast } from "../components/Toast";

import { motion } from "framer-motion";

import {
  Timer,
  Play,
  Pause,
  Square,
  Save,
  Trash2,
  Clock,
  AlertCircle,
  Zap,
  AlertTriangle,
} from "lucide-react";

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);

  const m = Math.floor(
    (seconds % 3600) / 60
  );

  const s = seconds % 60;

  return `${String(h).padStart(
    2,
    "0"
  )}:${String(m).padStart(
    2,
    "0"
  )}:${String(s).padStart(2, "0")}`;
}

export default function SessionsPage() {
  const { user } = useAuth();

  const toast = useToast();

  const [plans, setPlans] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] =
    useState(true);

  // Selection
  const [selectedPlanId, setSelectedPlanId] =
    useState("");

  const [
    selectedPhaseIndex,
    setSelectedPhaseIndex,
  ] = useState(0);

  // Timer
  const [seconds, setSeconds] = useState(0);

  const [isRunning, setIsRunning] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const intervalRef = useRef(null);

  // Fetch Data
  useEffect(() => {
    if (!user?.uid) return;

    const fetchData = async () => {
      try {
        const [userPlans, userSessions] =
          await Promise.all([
            getUserPlans(user.uid),
            getStudySessions(user.uid),
          ]);

        setPlans(userPlans);
        setSessions(userSessions);

        if (userPlans.length > 0) {
          setSelectedPlanId(userPlans[0].id);
        }
      } catch (error) {
        toast.show(
          "Error loading data",
          "error"
        );
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
        setSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () =>
      clearInterval(intervalRef.current);
  }, [isRunning]);

  const handleStart = () =>
    setIsRunning(true);

  const handlePause = () =>
    setIsRunning(false);

  const handleReset = () => {
    setIsRunning(false);
    setSeconds(0);
  };

  const handleSave = async () => {
    if (seconds < 60) {
      toast.show(
        "Session too short (min 1 min)",
        "error"
      );
      return;
    }

    if (!selectedPlanId) {
      toast.show(
        "Please select a plan",
        "error"
      );
      return;
    }

    setSaving(true);

    const selectedPlan = plans.find(
      (p) => p.id === selectedPlanId
    );

    const sessionData = {
      planId: selectedPlanId,
      planTitle:
        selectedPlan?.title ||
        "Untitled Plan",
      phaseIndex: Number(
        selectedPhaseIndex
      ),
      startTime: new Date(
        Date.now() - seconds * 1000
      ).toISOString(),
      endTime: new Date().toISOString(),
      duration: seconds,
      userId: user.uid,
      focusScore: 100,
      distractionsCount: 0,
    };

    try {
      await saveStudySession(
        user.uid,
        sessionData
      );

      const updatedSessions =
        await getStudySessions(user.uid);

      setSessions(updatedSessions);

      handleReset();

      toast.show(
        "Study session saved!",
        "success"
      );
    } catch (error) {
      toast.show(
        "Failed to save session",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (
    sessionId
  ) => {
    if (
      !window.confirm(
        "Delete this session?"
      )
    )
      return;

    try {
      await deleteStudySession(
        user.uid,
        sessionId
      );

      setSessions(
        sessions.filter(
          (s) => s.id !== sessionId
        )
      );

      toast.show(
        "Session deleted",
        "success"
      );
    } catch (error) {
      toast.show(
        "Delete failed",
        "error"
      );
    }
  };

  const selectedPlan = plans.find(
    (p) => p.id === selectedPlanId
  );

  const phaseCount =
    selectedPlan?.meta?.phaseCount || 0;

  if (loading) {
    return (
      <div className="main-content">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "4rem",
          }}
        >
          Loading Sessions...
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="main-content"
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.4,
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: "2rem",
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
            background: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
          }}
        >
          <Clock size={28} />
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
            Study Sessions
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "var(--text-muted)",
              fontSize: "0.95rem",
            }}
          >
            Track your focus time and build
            consistent study habits.
          </p>
        </div>
      </div>

      {/* QUOTE */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem 1.25rem",
          borderRadius: "16px",
          background: "#eff6ff",
          border: "1px solid #dbeafe",
        }}
      >
        <p
          style={{
            margin: 0,
            color: "#1e3a8a",
            fontSize: "0.95rem",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          “Focused hours today become strong
          achievements tomorrow.”
        </p>
      </div>

      {/* MAIN GRID */}
      <div
        className="sessions-container"
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 340px",
          gap: "2rem",
          marginTop: "2rem",
        }}
      >
        {/* TIMER SECTION */}
        <div className="timer-section">
          <div
            className="card"
            style={{
              padding: "2rem",
              textAlign: "center",
              borderRadius: "24px",
              border:
                "1px solid #dbeafe",
              background: "white",
            }}
          >
            <div
              className="section-title"
              style={{
                marginBottom: "1.5rem",
                justifyContent:
                  "center",
                fontWeight: 700,
              }}
            >
              <Timer
                size={20}
                color="#2563eb"
              />

              Active Session
            </div>

            {/* TIMER */}
            <div
              style={{
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  fontSize: "4rem",
                  fontWeight: 800,
                  fontFamily:
                    "monospace",
                  letterSpacing:
                    "-2px",
                  color: isRunning
                    ? "#2563eb"
                    : "var(--text)",
                }}
              >
                {formatTime(seconds)}
              </div>

              <p
                style={{
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color:
                    "var(--text-muted)",
                }}
              >
                {isRunning
                  ? "Stay focused and keep going."
                  : "Ready to start your next session?"}
              </p>
            </div>

            {/* BUTTONS */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent:
                  "center",
                marginBottom: "2rem",
                flexWrap: "wrap",
              }}
            >
              {!isRunning ? (
                <button
                  className="btn btn-primary"
                  onClick={handleStart}
                  style={{
                    minWidth: "120px",
                    background:
                      "#2563eb",
                    border: "none",
                  }}
                >
                  <Play
                    size={18}
                    fill="currentColor"
                  />

                  Start
                </button>
              ) : (
                <button
                  className="btn btn-secondary"
                  onClick={handlePause}
                  style={{
                    minWidth: "120px",
                  }}
                >
                  <Pause
                    size={18}
                    fill="currentColor"
                  />

                  Pause
                </button>
              )}

              <button
                className="btn btn-outline"
                onClick={handleReset}
                disabled={seconds === 0}
              >
                <Square
                  size={16}
                  fill="currentColor"
                />

                Reset
              </button>
            </div>

            <div
              style={{
                height: "1px",
                background:
                  "#e2e8f0",
                margin: "2rem 0",
              }}
            />

            {/* CONFIG */}
            <div
              style={{
                textAlign: "left",
              }}
            >
              <h4
                style={{
                  marginBottom: "1rem",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                }}
              >
                Session Settings
              </h4>

              {/* PLAN */}
              <div
                className="form-group"
                style={{
                  marginBottom: "1rem",
                }}
              >
                <label
                  className="form-label"
                >
                  Associate with Plan
                </label>

                <select
                  className="form-control"
                  value={selectedPlanId}
                  onChange={(e) => {
                    setSelectedPlanId(
                      e.target.value
                    );

                    setSelectedPhaseIndex(
                      0
                    );
                  }}
                >
                  {plans.map((p) => (
                    <option
                      key={p.id}
                      value={p.id}
                    >
                      {p.title}
                    </option>
                  ))}

                  {plans.length ===
                    0 && (
                    <option disabled>
                      No plans found
                    </option>
                  )}
                </select>
              </div>

              {/* PHASE */}
              {selectedPlanId &&
                phaseCount > 0 && (
                  <div
                    className="form-group"
                    style={{
                      marginBottom:
                        "1rem",
                    }}
                  >
                    <label className="form-label">
                      Current Phase
                    </label>

                    <select
                      className="form-control"
                      value={
                        selectedPhaseIndex
                      }
                      onChange={(e) =>
                        setSelectedPhaseIndex(
                          e.target.value
                        )
                      }
                    >
                      {[
                        ...Array(
                          phaseCount
                        ),
                      ].map((_, i) => (
                        <option
                          key={i}
                          value={i}
                        >
                          Phase {i + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

              {/* SAVE */}
              <button
                className="btn btn-primary btn-full"
                style={{
                  marginTop: "1rem",
                  background: "#2563eb",
                  border: "none",
                }}
                disabled={
                  seconds < 60 ||
                  saving
                }
                onClick={handleSave}
              >
                {saving ? (
                  "Saving..."
                ) : (
                  <>
                    <Save size={18} />
                    Finish & Save Session
                  </>
                )}
              </button>

              {seconds > 0 &&
                seconds < 60 && (
                  <p
                    style={{
                      fontSize:
                        "0.75rem",
                      color:
                        "var(--text-muted)",
                      marginTop:
                        "0.5rem",
                      textAlign:
                        "center",
                    }}
                  >
                    Minimum 1 minute
                    required to save.
                  </p>
                )}
            </div>
          </div>
        </div>

        {/* HISTORY */}
        <div className="history-section">
          <div
            className="card"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              borderRadius: "24px",
              border:
                "1px solid #dbeafe",
              background: "white",
            }}
          >
            <div
              className="section-title"
              style={{
                padding:
                  "1.25rem 1.5rem",
                borderBottom:
                  "1px solid #e2e8f0",
                fontWeight: 700,
              }}
            >
              <Clock
                size={16}
                color="#2563eb"
              />

              Recent Sessions
            </div>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "1rem",
              }}
            >
              {sessions.length === 0 ? (
                <div
                  style={{
                    textAlign:
                      "center",
                    padding:
                      "3rem 1rem",
                    color:
                      "var(--text-muted)",
                  }}
                >
                  <AlertCircle
                    size={32}
                    style={{
                      marginBottom:
                        "1rem",
                      opacity: 0.5,
                    }}
                  />

                  <p
                    style={{
                      fontSize:
                        "0.875rem",
                    }}
                  >
                    No study sessions
                    yet.
                  </p>
                </div>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection:
                      "column",
                    gap: "0.75rem",
                  }}
                >
                  {sessions.map(
                    (session) => (
                      <motion.div
                        key={
                          session.id
                        }
                        initial={{
                          opacity: 0,
                          x: 10,
                        }}
                        animate={{
                          opacity: 1,
                          x: 0,
                        }}
                        style={{
                          padding:
                            "1rem",
                          background:
                            "#f8fafc",
                          borderRadius:
                            "16px",
                          border:
                            "1px solid #e2e8f0",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            marginBottom:
                              "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize:
                                "0.75rem",
                              fontWeight: 700,
                              color:
                                "#2563eb",
                              textTransform:
                                "uppercase",
                            }}
                          >
                            Phase{" "}
                            {session.phaseIndex +
                              1}
                          </span>

                          <button
                            onClick={() =>
                              handleDelete(
                                session.id
                              )
                            }
                            style={{
                              background:
                                "none",
                              border:
                                "none",
                              color:
                                "var(--text-muted)",
                              cursor:
                                "pointer",
                            }}
                          >
                            <Trash2
                              size={
                                14
                              }
                            />
                          </button>
                        </div>

                        <h5
                          style={{
                            fontSize:
                              "0.9rem",
                            fontWeight: 700,
                            marginBottom:
                              "0.25rem",
                            color:
                              "var(--text)",
                          }}
                        >
                          {
                            session.planTitle
                          }
                        </h5>

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "10px",
                            color:
                              "var(--text-muted)",
                            fontSize:
                              "0.8rem",
                          }}
                        >
                          <span
                            style={{
                              display:
                                "flex",
                              alignItems:
                                "center",
                              gap: "4px",
                            }}
                          >
                            <Clock
                              size={
                                12
                              }
                            />

                            {(
                              session.duration /
                              60
                            ).toFixed(
                              0
                            )}
                            m
                          </span>

                          <span>
                            •
                          </span>

                          <span>
                            {new Date(
                              session.startTime
                            ).toLocaleDateString()}
                          </span>
                        </div>

                        {(session.focusScore !==
                          undefined ||
                          session.distractionsCount !==
                            undefined) && (
                          <div
                            style={{
                              display:
                                "flex",
                              gap: "10px",
                              marginTop:
                                "10px",
                              flexWrap:
                                "wrap",
                            }}
                          >
                            {session.focusScore !==
                              undefined && (
                              <div
                                style={{
                                  fontSize:
                                    "0.7rem",
                                  fontWeight: 700,
                                  padding:
                                    "4px 8px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "#dbeafe",
                                  color:
                                    "#2563eb",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "4px",
                                }}
                              >
                                <Zap
                                  size={
                                    10
                                  }
                                />

                                Focus:{" "}
                                {
                                  session.focusScore
                                }
                                %
                              </div>
                            )}

                            {session.distractionsCount >
                              0 && (
                              <div
                                style={{
                                  fontSize:
                                    "0.7rem",
                                  fontWeight: 700,
                                  padding:
                                    "4px 8px",
                                  borderRadius:
                                    "6px",
                                  background:
                                    "#fee2e2",
                                  color:
                                    "#dc2626",
                                  display:
                                    "flex",
                                  alignItems:
                                    "center",
                                  gap: "4px",
                                }}
                              >
                                <AlertTriangle
                                  size={
                                    10
                                  }
                                />

                                {
                                  session.distractionsCount
                                }{" "}
                                Distractions
                              </div>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
