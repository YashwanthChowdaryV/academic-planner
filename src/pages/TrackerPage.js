// src/pages/TrackerPage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  saveDailyLog,
  getDailyLogs,
} from "../services/extendedService";

import { useToast } from "../components/Toast";
import Loader from "../components/Loader";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";

import { motion } from "framer-motion";

import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle,
  Flame,
  BarChart3,
  Target,
} from "lucide-react";

export default function TrackerPage() {
  const { user } = useAuth();

  const toast = useToast();

  const [logs, setLogs] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const today = new Date();

  const todayStr = today
    .toISOString()
    .split("T")[0];

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(todayStr);

  const [hoursInput, setHoursInput] =
    useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data =
          await getDailyLogs(
            user.uid
          );

        setLogs(data);

        if (
          data[todayStr] !==
          undefined
        ) {
          setHoursInput(
            data[todayStr]
          );
        }
      } catch {
        toast.show(
          "Sync error. Please refresh.",
          "error"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchLogs();
  }, [
    user.uid,
    todayStr,
    toast,
  ]);

  const handleDateSelect = (
    dateStr
  ) => {
    setSelectedDate(dateStr);

    setHoursInput(
      logs[dateStr] !==
        undefined
        ? logs[dateStr]
        : ""
    );
  };

  const handleSave = async (
    e
  ) => {
    e.preventDefault();

    const val =
      Number(hoursInput);

    if (
      hoursInput === "" ||
      val < 0 ||
      val > 24
    ) {
      toast.show(
        "Enter hours between 0-24",
        "error"
      );

      return;
    }

    setSaving(true);

    try {
      await saveDailyLog(
        user.uid,
        selectedDate,
        val
      );

      setLogs((prev) => ({
        ...prev,
        [selectedDate]: val,
      }));

      toast.show(
        val > 0
          ? "Focused study session logged!"
          : "Log updated",
        "success"
      );
    } catch {
      toast.show(
        "Failed to update log",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="main-content">
        <Loader text="Opening your tracker..." />
      </div>
    );

  const last14Days =
    Array.from(
      { length: 14 },
      (_, i) => {
        const d = new Date();

        d.setDate(
          d.getDate() -
            (13 - i)
        );

        return d
          .toISOString()
          .split("T")[0];
      }
    );

  const totalThisWeek =
    last14Days
      .slice(7)
      .reduce(
        (sum, dateStr) =>
          sum +
          (logs[dateStr] || 0),
        0
      );

  const selectedDateFormatted =
    new Date(
      selectedDate
    ).toLocaleDateString(
      "en-US",
      {
        month: "long",
        day: "numeric",
        year: "numeric",
      }
    );

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
                "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <Flame size={28} />
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
              Momentum Tracker
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
              Track your daily
              consistency and
              build stronger
              learning habits.
            </p>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        className="tracker-grid"
        style={{
          display: "grid",
          gridTemplateColumns:
            "1fr 400px",
          gap: "2.5rem",
          alignItems: "start",
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
          {/* HEATMAP */}
          <AnimatedCard
            delay={0.1}
            style={{
              borderRadius:
                "22px",
            }}
          >
            <div className="section-title">
              <IconBadge
                icon={
                  CalendarIcon
                }
                size={18}
                colorClass="amber"
              />

              Consistency
              Heatmap
            </div>

            <div
              style={{
                display:
                  "grid",
                gridTemplateColumns:
                  "repeat(7, 1fr)",
                gap: "10px",
                padding:
                  "1rem 0",
              }}
            >
              {last14Days.map(
                (dateStr) => {
                  const d =
                    new Date(
                      dateStr
                    );

                  const dayName =
                    d
                      .toLocaleDateString(
                        "en-US",
                        {
                          weekday:
                            "short",
                        }
                      )
                      .charAt(
                        0
                      );

                  const hrs =
                    logs[
                      dateStr
                    ] || 0;

                  const isSelected =
                    dateStr ===
                    selectedDate;

                  let bg =
                    "var(--surface2)";

                  let color =
                    "var(--text-muted)";

                  let borderColor =
                    "transparent";

                  if (hrs > 0) {
                    if (
                      hrs >= 4
                    ) {
                      bg =
                        "#f59e0b";
                      color =
                        "white";
                    } else if (
                      hrs >= 2
                    ) {
                      bg =
                        "rgba(245, 158, 11, 0.2)";
                      color =
                        "#f59e0b";
                    } else {
                      bg =
                        "rgba(245, 158, 11, 0.08)";
                      color =
                        "#f59e0b";
                    }
                  }

                  if (
                    isSelected
                  )
                    borderColor =
                      "#f59e0b";

                  return (
                    <motion.div
                      key={
                        dateStr
                      }
                      whileHover={{
                        scale: 1.05,
                        y: -2,
                      }}
                      whileTap={{
                        scale: 0.95,
                      }}
                      onClick={() =>
                        handleDateSelect(
                          dateStr
                        )
                      }
                      style={{
                        aspectRatio:
                          "1",
                        borderRadius:
                          "14px",
                        background:
                          bg,
                        color,
                        border: `2px solid ${borderColor}`,
                        cursor:
                          "pointer",
                        display:
                          "flex",
                        flexDirection:
                          "column",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        transition:
                          "all 0.2s ease",
                      }}
                    >
                      <span
                        style={{
                          fontSize:
                            "0.65rem",
                          fontWeight: 700,
                          opacity: 0.6,
                        }}
                      >
                        {
                          dayName
                        }
                      </span>

                      <span
                        style={{
                          fontSize:
                            "1.1rem",
                          fontWeight: 800,
                        }}
                      >
                        {d.getDate()}
                      </span>
                    </motion.div>
                  );
                }
              )}
            </div>

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                fontSize:
                  "0.75rem",
                color:
                  "var(--text-muted)",
                marginTop:
                  "1rem",
                gap: "12px",
                alignItems:
                  "center",
              }}
            >
              <span>
                Less
              </span>

              <div
                style={{
                  display:
                    "flex",
                  gap: "4px",
                }}
              >
                <div
                  style={{
                    width:
                      "12px",
                    height:
                      "12px",
                    borderRadius:
                      "3px",
                    background:
                      "var(--surface2)",
                  }}
                />

                <div
                  style={{
                    width:
                      "12px",
                    height:
                      "12px",
                    borderRadius:
                      "3px",
                    background:
                      "rgba(245, 158, 11, 0.08)",
                  }}
                />

                <div
                  style={{
                    width:
                      "12px",
                    height:
                      "12px",
                    borderRadius:
                      "3px",
                    background:
                      "rgba(245, 158, 11, 0.2)",
                  }}
                />

                <div
                  style={{
                    width:
                      "12px",
                    height:
                      "12px",
                    borderRadius:
                      "3px",
                    background:
                      "#f59e0b",
                  }}
                />
              </div>

              <span>
                More
              </span>
            </div>
          </AnimatedCard>

          {/* WEEKLY IMPACT */}
          <AnimatedCard
            delay={0.2}
            style={{
              borderRadius:
                "22px",
              border:
                "1px solid rgba(245, 158, 11, 0.15)",
              background:
                "rgba(245, 158, 11, 0.04)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "1.5rem",
              }}
            >
              <div
                style={{
                  background:
                    "#f59e0b",
                  color:
                    "white",
                  padding:
                    "1rem",
                  borderRadius:
                    "16px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                }}
              >
                <Flame size={30} />
              </div>

              <div
                style={{
                  flex: 1,
                }}
              >
                <h3
                  style={{
                    fontSize:
                      "1.2rem",
                    fontWeight: 800,
                    marginBottom:
                      "0.35rem",
                  }}
                >
                  Weekly Impact
                </h3>

                <p className="text-muted text-sm">
                  You invested{" "}
                  <strong>
                    {
                      totalThisWeek
                    }{" "}
                    hours
                  </strong>{" "}
                  in learning
                  this week.
                  Keep your
                  momentum
                  growing.
                </p>
              </div>

              <div
                style={{
                  textAlign:
                    "right",
                }}
              >
                <div
                  style={{
                    fontSize:
                      "2rem",
                    fontWeight: 800,
                    color:
                      "#f59e0b",
                  }}
                >
                  {
                    totalThisWeek
                  }
                  h
                </div>

                <div className="text-xs font-bold text-muted uppercase tracking-wider">
                  Invested
                </div>
              </div>
            </div>
          </AnimatedCard>
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
          {/* UPDATE LOGS */}
          <AnimatedCard
            delay={0.3}
            style={{
              borderRadius:
                "22px",
            }}
          >
            <div className="section-title">
              <IconBadge
                icon={Clock}
                size={18}
                colorClass="amber"
              />

              Update Logs
            </div>

            <p className="text-muted text-xs mb-4">
              Logging for{" "}
              <strong>
                {
                  selectedDateFormatted
                }
              </strong>
            </p>

            <form
              onSubmit={
                handleSave
              }
            >
              <div className="form-group">
                <label className="form-label">
                  Study Duration
                  (Hours)
                </label>

                <div className="input-with-icon">
                  <Clock
                    className="input-icon"
                    size={18}
                  />

                  <input
                    type="number"
                    min="0"
                    max="24"
                    step="0.5"
                    placeholder="e.g. 4.5"
                    value={
                      hoursInput
                    }
                    onChange={(
                      e
                    ) =>
                      setHoursInput(
                        e.target
                          .value
                      )
                    }
                    disabled={
                      saving
                    }
                  />
                </div>
              </div>

              <motion.button
                type="submit"
                className="btn btn-full"
                disabled={
                  saving
                }
                whileTap={{
                  scale: 0.98,
                }}
                style={{
                  background:
                    "#f59e0b",
                  color:
                    "white",
                  border:
                    "none",
                }}
              >
                {saving ? (
                  "Updating..."
                ) : (
                  <>
                    <CheckCircle
                      size={
                        18
                      }
                    />
                    Record Study
                    Session
                  </>
                )}
              </motion.button>
            </form>
          </AnimatedCard>

          {/* INFO CARD */}
          <AnimatedCard
            delay={0.4}
            style={{
              borderRadius:
                "22px",
              border:
                "1px solid rgba(245, 158, 11, 0.15)",
              background:
                "rgba(245, 158, 11, 0.04)",
            }}
          >
            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap: "10px",
                marginBottom:
                  "1rem",
              }}
            >
              <BarChart3
                size={18}
                color="#f59e0b"
              />

              <span
                style={{
                  fontWeight: 800,
                  fontSize:
                    "1rem",
                }}
              >
                Data-Driven
                Growth
              </span>
            </div>

            <p
              className="text-muted"
              style={{
                fontSize:
                  "0.88rem",
                lineHeight: 1.7,
              }}
            >
              Consistent
              tracking helps
              you understand
              your learning
              patterns and
              maintain steady
              academic
              progress over
              time.
            </p>
          </AnimatedCard>
        </div>
      </div>
    </motion.div>
  );
}
