// src/pages/GoalsPage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
} from "../services/goalService";

import { motion, AnimatePresence } from "framer-motion";

import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Circle,
  Calendar,
  BarChart3,
  Loader2,
  AlertCircle,
} from "lucide-react";

import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";

export default function GoalsPage() {
  const { user } = useAuth();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);

  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    targetDate: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteConfirmId, setDeleteConfirmId] =
    useState(null);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const g = await getGoals(user.uid);
      setGoals(g);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();

    if (!newGoal.title) return;

    setIsSubmitting(true);

    try {
      await createGoal(user.uid, newGoal);

      setNewGoal({
        title: "",
        description: "",
        targetDate: "",
      });

      setShowAddModal(false);

      fetchGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      const updated = {
        completed: !goal.completed,
        progress: goal.completed ? 0 : 100,
      };

      await updateGoal(user.uid, goal.id, updated);

      setGoals(
        goals.map((g) =>
          g.id === goal.id
            ? { ...g, ...updated }
            : g
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (
    goalId,
    val
  ) => {
    try {
      const progress = parseInt(val);

      const completed = progress === 100;

      await updateGoal(user.uid, goalId, {
        progress,
        completed,
      });

      setGoals(
        goals.map((g) =>
          g.id === goalId
            ? { ...g, progress, completed }
            : g
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(user.uid, id);

      setGoals((prev) =>
        prev.filter((g) => g.id !== id)
      );

      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="main-content">
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
          <Target size={28} />
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
            My Goals
          </h1>

          <p
            style={{
              margin: "6px 0 0",
              color: "var(--text-muted)",
              fontSize: "0.95rem",
            }}
          >
            Set meaningful targets and track your
            academic journey.
          </p>
        </div>
      </div>

      {/* ACTION BAR */}
      <div
        className="action-bar"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.8rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div
          className="section-title"
          style={{
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontWeight: 700,
          }}
        >
          <IconBadge
            icon={BarChart3}
            size={20}
            colorClass="secondary"
          />

          Goal Overview
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="btn btn-primary"
          style={{
            background: "#2563eb",
            border: "none",
          }}
        >
          <Plus size={18} />
          Add New Goal
        </button>
      </div>

      {/* POSITIVE QUOTE */}
      <div
        style={{
          marginBottom: "2rem",
          padding: "1rem 1.2rem",
          borderRadius: "16px",
          background: "#eff6ff",
          border: "1px solid #dbeafe",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.95rem",
            color: "#1e3a8a",
            fontWeight: 500,
            lineHeight: 1.6,
          }}
        >
          “Small consistent progress every day leads
          to extraordinary results over time.”
        </p>
      </div>

      {/* ADD MODAL */}
      <AnimatePresence>
        {showAddModal && (
          <div
            className="modal-overlay"
            onClick={() =>
              setShowAddModal(false)
            }
          >
            <motion.div
              className="modal-content"
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              style={{
                maxWidth: "500px",
                width: "100%",
                padding: "2rem",
                borderRadius: "20px",
                background: "white",
              }}
            >
              <h2
                style={{
                  marginBottom: "1.5rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                }}
              >
                <Target color="#2563eb" />
                Add Academic Goal
              </h2>

              <form onSubmit={handleAddGoal}>
                <div
                  className="form-group"
                  style={{
                    marginBottom: "1rem",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    Goal Title
                  </label>

                  <input
                    type="text"
                    className="form-input"
                    value={newGoal.title}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        title: e.target.value,
                      })
                    }
                    placeholder="e.g. Master Calculus II"
                    required
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "12px",
                      border:
                        "1px solid #dbeafe",
                    }}
                  />
                </div>

                <div
                  className="form-group"
                  style={{
                    marginBottom: "1rem",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    Description
                  </label>

                  <textarea
                    className="form-input"
                    value={newGoal.description}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        description:
                          e.target.value,
                      })
                    }
                    placeholder="What does success look like?"
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "12px",
                      border:
                        "1px solid #dbeafe",
                      minHeight: "90px",
                    }}
                  />
                </div>

                <div
                  className="form-group"
                  style={{
                    marginBottom: "2rem",
                  }}
                >
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                    }}
                  >
                    Target Date
                  </label>

                  <input
                    type="date"
                    className="form-input"
                    value={newGoal.targetDate}
                    onChange={(e) =>
                      setNewGoal({
                        ...newGoal,
                        targetDate:
                          e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.8rem",
                      borderRadius: "12px",
                      border:
                        "1px solid #dbeafe",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                  }}
                >
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{
                      flex: 1,
                      background: "#2563eb",
                      border: "none",
                    }}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" />
                    ) : (
                      "Save Goal"
                    )}
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() =>
                      setShowAddModal(false)
                    }
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div
            className="modal-overlay"
            onClick={() =>
              setDeleteConfirmId(null)
            }
          >
            <motion.div
              className="modal-content"
              initial={{
                scale: 0.9,
                opacity: 0,
              }}
              animate={{
                scale: 1,
                opacity: 1,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
              style={{
                maxWidth: "400px",
                width: "100%",
                padding: "2rem",
                textAlign: "center",
                borderRadius: "20px",
                background: "white",
              }}
            >
              <div
                style={{
                  color: "#ef4444",
                  marginBottom: "1rem",
                }}
              >
                <AlertCircle
                  size={48}
                  style={{
                    margin: "0 auto",
                  }}
                />
              </div>

              <h2
                style={{
                  marginBottom: "1rem",
                }}
              >
                Delete Goal?
              </h2>

              <p
                style={{
                  color: "var(--text-muted)",
                  marginBottom: "2rem",
                }}
              >
                This action cannot be undone.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                }}
              >
                <button
                  onClick={() =>
                    handleDelete(
                      deleteConfirmId
                    )
                  }
                  className="btn btn-primary"
                  style={{
                    flex: 1,
                    background: "#ef4444",
                    border: "none",
                  }}
                >
                  Delete
                </button>

                <button
                  onClick={() =>
                    setDeleteConfirmId(null)
                  }
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LOADING */}
      {loading ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            padding: "4rem",
          }}
        >
          <Loader2
            className="animate-spin text-primary"
            size={40}
          />
        </div>
      ) : goals.length === 0 ? (
        /* EMPTY STATE */
        <div
          style={{
            textAlign: "center",
            padding: "4rem",
            background: "#f8fafc",
            borderRadius: "20px",
            border: "1px dashed #cbd5e1",
          }}
        >
          <div
            style={{
              marginBottom: "1rem",
              color: "#2563eb",
            }}
          >
            <Target size={48} />
          </div>

          <h3
            style={{
              marginBottom: "0.5rem",
              fontSize: "1.3rem",
            }}
          >
            No goals set yet
          </h3>

          <p
            style={{
              color: "var(--text-muted)",
              marginBottom: "1.5rem",
              maxWidth: "500px",
              marginInline: "auto",
              lineHeight: 1.6,
            }}
          >
            “A goal without a plan is just a wish.
            Start with one meaningful target today.”
          </p>

          <button
            onClick={() =>
              setShowAddModal(true)
            }
            className="btn btn-primary"
            style={{
              background: "#2563eb",
              border: "none",
            }}
          >
            <Plus size={18} />
            Set Your First Goal
          </button>
        </div>
      ) : (
        /* GOALS GRID */
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {goals.map((goal, i) => (
            <AnimatedCard
              key={goal.id}
              delay={i * 0.05}
              className="goal-card h-full"
              style={{
                borderRadius: "20px",
                border:
                  "1px solid #dbeafe",
                background: "white",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div
                  onClick={() =>
                    handleToggleComplete(
                      goal
                    )
                  }
                  style={{
                    cursor: "pointer",
                    display: "flex",
                    gap: "12px",
                    alignItems:
                      "flex-start",
                  }}
                >
                  {goal.completed ? (
                    <CheckCircle2
                      size={24}
                      color="#2563eb"
                      style={{
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <Circle
                      size={24}
                      color="#94a3b8"
                      style={{
                        flexShrink: 0,
                      }}
                    />
                  )}

                  <div>
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        textDecoration:
                          goal.completed
                            ? "line-through"
                            : "none",
                        color:
                          goal.completed
                            ? "var(--text-muted)"
                            : "var(--text)",
                      }}
                    >
                      {goal.title}
                    </h3>

                    {goal.targetDate && (
                      <div
                        style={{
                          fontSize:
                            "0.75rem",
                          color:
                            "var(--text-muted)",
                          display: "flex",
                          alignItems:
                            "center",
                          gap: "4px",
                          marginTop:
                            "4px",
                        }}
                      >
                        <Calendar
                          size={12}
                        />

                        Target:{" "}
                        {new Date(
                          goal.targetDate
                        ).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() =>
                    setDeleteConfirmId(
                      goal.id
                    )
                  }
                  style={{
                    color:
                      "var(--text-muted)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    height: "fit-content",
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <p
                style={{
                  fontSize: "0.85rem",
                  color:
                    "var(--text-muted)",
                  marginBottom:
                    "1.5rem",
                  minHeight: "40px",
                  lineHeight: 1.5,
                }}
              >
                {goal.description}
              </p>

              <div
                className="goal-progress"
                style={{
                  marginTop: "auto",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    marginBottom:
                      "0.5rem",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                  }}
                >
                  <span>Progress</span>

                  <span
                    style={{
                      color:
                        "#2563eb",
                    }}
                  >
                    {goal.progress}%
                  </span>
                </div>

                <div
                  style={{
                    height: "8px",
                    background:
                      "#dbeafe",
                    borderRadius:
                      "10px",
                    overflow:
                      "hidden",
                    marginBottom:
                      "1rem",
                  }}
                >
                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width: `${goal.progress}%`,
                    }}
                    style={{
                      height: "100%",
                      background:
                        "#2563eb",
                      borderRadius:
                        "10px",
                    }}
                  />
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={goal.progress}
                  onChange={(e) =>
                    handleUpdateProgress(
                      goal.id,
                      e.target.value
                    )
                  }
                  style={{
                    width: "100%",
                    cursor: "pointer",
                  }}
                />
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
}
