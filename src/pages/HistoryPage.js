// src/pages/HistoryPage.js
import React, {
  useEffect,
  useState,
  useCallback,
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  getUserPlans,
  getProgress,
  deletePlan,
} from "../services/planService";

import HistoryList from "../components/HistoryList";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

import { motion } from "framer-motion";

import {
  Search,
  LayoutGrid,
  List as ListIcon,
  History as HistoryIcon,
} from "lucide-react";

const LEVEL_OPTIONS = [
  "all",
  "beginner",
  "intermediate",
  "pro",
];

export default function HistoryPage() {
  const { user } = useAuth();

  const toast = useToast();

  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] =
    useState({});

  const [loading, setLoading] =
    useState(true);

  const [search, setSearch] =
    useState("");

  const [levelFilter, setLevelFilter] =
    useState("all");

  const [deleteTarget, setDeleteTarget] =
    useState(null);

  const [viewMode, setViewMode] =
    useState("list");

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const ps = await getUserPlans(
        user.uid,
        50
      );

      setPlans(ps);

      const pm = {};

      await Promise.all(
        ps.map(async (p) => {
          pm[p.id] = await getProgress(
            user.uid,
            p.id
          );
        })
      );

      setProgressMap(pm);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(planId) {
    try {
      await deletePlan(user.uid, planId);

      setPlans((ps) =>
        ps.filter((p) => p.id !== planId)
      );

      toast.show(
        "Plan deleted successfully.",
        "success"
      );
    } catch {
      toast.show(
        "Failed to delete plan.",
        "error"
      );
    } finally {
      setDeleteTarget(null);
    }
  }

  const filtered = plans.filter((p) => {
    const matchSearch =
      !search ||
      p.input?.goal
        ?.toLowerCase()
        .includes(search.toLowerCase());

    const matchLevel =
      levelFilter === "all" ||
      p.input?.level === levelFilter;

    return matchSearch && matchLevel;
  });

  return (
    <motion.div
      className="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
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
                "linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <HistoryIcon size={28} />
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
              Plan History
            </h1>

            <p
              style={{
                margin: "6px 0 0",
                color:
                  "var(--text-muted)",
                fontSize: "0.95rem",
              }}
            >
              Access and manage all your
              AI-generated learning
              roadmaps.
            </p>
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div
          style={{
            display: "flex",
            background:
              "var(--surface)",
            borderRadius: "14px",
            border:
              "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <button
            style={{
              padding:
                "10px 14px",
              border: "none",
              background:
                viewMode === "list"
                  ? "rgba(124, 58, 237, 0.12)"
                  : "transparent",
              color:
                viewMode === "list"
                  ? "#7c3aed"
                  : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
            }}
            onClick={() =>
              setViewMode("list")
            }
          >
            <ListIcon size={16} />
            List
          </button>

          <button
            style={{
              padding:
                "10px 14px",
              border: "none",
              background:
                viewMode === "grid"
                  ? "rgba(124, 58, 237, 0.12)"
                  : "transparent",
              color:
                viewMode === "grid"
                  ? "#7c3aed"
                  : "var(--text-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
            }}
            onClick={() =>
              setViewMode("grid")
            }
          >
            <LayoutGrid size={16} />
            Grid
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <motion.div
        className="card"
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          padding: "1rem",
          borderRadius: "20px",
          border:
            "1px solid rgba(124, 58, 237, 0.12)",
          background: "white",
        }}
        initial={{
          opacity: 0,
          y: 10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          delay: 0.1,
        }}
      >
        {/* SEARCH */}
        <div
          style={{
            flex: 1,
            minWidth: "250px",
            position: "relative",
          }}
        >
          <Search
            size={18}
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform:
                "translateY(-50%)",
              color:
                "var(--text-muted)",
            }}
          />

          <input
            type="text"
            placeholder="Search by goal or keywords…"
            value={search}
            onChange={(e) =>
              setSearch(
                e.target.value
              )
            }
            style={{
              paddingLeft: "40px",
              width: "100%",
              background:
                "var(--surface)",
              border:
                "1px solid var(--border)",
              borderRadius: "12px",
            }}
          />
        </div>

        {/* FILTER */}
        <select
          value={levelFilter}
          onChange={(e) =>
            setLevelFilter(
              e.target.value
            )
          }
          style={{
            width: "auto",
            minWidth: "170px",
            background:
              "var(--surface)",
            border:
              "1px solid var(--border)",
            cursor: "pointer",
            borderRadius: "12px",
            padding: "0 12px",
          }}
        >
          {LEVEL_OPTIONS.map((l) => (
            <option
              key={l}
              value={l}
            >
              {l === "all"
                ? "All Levels"
                : l
                    .charAt(0)
                    .toUpperCase() +
                  l.slice(1)}
            </option>
          ))}
        </select>
      </motion.div>

      {/* CONTENT */}
      {loading ? (
        <div
          className="card"
          style={{
            padding: "4rem",
            borderRadius: "20px",
          }}
        >
          <Loader text="Loading your history…" />
        </div>
      ) : (
        <motion.div layout>
          {/* COUNT */}
          {filtered.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "1rem",
              }}
            >
              <p
                style={{
                  fontSize: "0.9rem",
                  fontWeight: 500,
                  color:
                    "var(--text-muted)",
                }}
              >
                Showing{" "}
                {filtered.length}{" "}
                {filtered.length ===
                1
                  ? "plan"
                  : "plans"}
              </p>
            </div>
          )}

          {/* EMPTY */}
          {filtered.length === 0 &&
            plans.length > 0 && (
              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="card"
                style={{
                  textAlign:
                    "center",
                  padding:
                    "4rem 2rem",
                  color:
                    "var(--text-muted)",
                  borderRadius:
                    "20px",
                  background:
                    "white",
                  border:
                    "1px solid rgba(124, 58, 237, 0.12)",
                }}
              >
                <Search
                  size={48}
                  style={{
                    opacity: 0.2,
                    marginBottom:
                      "1rem",
                    color:
                      "#7c3aed",
                  }}
                />

                <h3
                  style={{
                    marginBottom:
                      "0.5rem",
                    color:
                      "var(--text)",
                  }}
                >
                  No plans match your
                  search
                </h3>

                <p>
                  Try adjusting your
                  filters or search
                  term.
                </p>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearch("");
                    setLevelFilter(
                      "all"
                    );
                  }}
                  style={{
                    marginTop:
                      "1rem",
                  }}
                >
                  Clear Filters
                </button>
              </motion.div>
            )}

          {/* HISTORY LIST */}
          <HistoryList
            plans={filtered}
            progressMap={progressMap}
            onDelete={(id) =>
              setDeleteTarget(id)
            }
            viewMode={viewMode}
          />
        </motion.div>
      )}

      {/* DELETE MODAL */}
      {deleteTarget && (
        <Modal
          title="Delete Plan"
          body="Are you sure? This will permanently delete the plan, its progress, and all notes. This cannot be undone."
          onConfirm={() =>
            handleDelete(deleteTarget)
          }
          onCancel={() =>
            setDeleteTarget(null)
          }
          confirmText="Delete Plan"
          confirmClass="btn btn-danger"
        />
      )}
    </motion.div>
  );
}
