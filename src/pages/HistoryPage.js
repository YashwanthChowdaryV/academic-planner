// src/pages/HistoryPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress, deletePlan } from "../services/planService";
import HistoryList from "../components/HistoryList";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";

const LEVEL_OPTIONS = ["all", "beginner", "intermediate", "pro"];

export default function HistoryPage() {
  const { user } = useAuth();
  const toast = useToast();
  const [plans, setPlans] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const ps = await getUserPlans(user.uid, 50);
      setPlans(ps);
      const pm = {};
      await Promise.all(ps.map(async (p) => {
        pm[p.id] = await getProgress(user.uid, p.id);
      }));
      setProgressMap(pm);
    } finally {
      setLoading(false);
    }
  }, [user.uid]);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(planId) {
    try {
      await deletePlan(user.uid, planId);
      setPlans((ps) => ps.filter((p) => p.id !== planId));
      toast.show("Plan deleted.", "info");
    } catch {
      toast.show("Failed to delete plan.", "error");
    } finally {
      setDeleteTarget(null);
    }
  }

  const filtered = plans.filter((p) => {
    const matchSearch = !search || p.input?.goal?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = levelFilter === "all" || p.input?.level === levelFilter;
    return matchSearch && matchLevel;
  });

  return (
    <div className="main-content animate-fade-in">
      <h1 className="page-title">📚 Plan History</h1>
      <p className="page-subtitle">All your AI-generated plans in one place.</p>

      {/* Filters */}
      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <div className="search-input-wrap" style={{ flex: 1, minWidth: "200px" }}>
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search by goal…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{ width: "auto", minWidth: "160px" }}
        >
          {LEVEL_OPTIONS.map((l) => (
            <option key={l} value={l}>{l === "all" ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader text="Loading your plans…" />
      ) : (
        <>
          {filtered.length > 0 && (
            <p className="text-muted text-sm" style={{ marginBottom: "1rem" }}>
              Showing {filtered.length} of {plans.length} plans
            </p>
          )}
          <HistoryList
            plans={filtered}
            progressMap={progressMap}
            onDelete={(id) => setDeleteTarget(id)}
          />
        </>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Plan"
          body="This will permanently delete the plan, its progress, and all notes. This cannot be undone."
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Delete"
          confirmClass="btn btn-danger btn-sm"
        />
      )}
    </div>
  );
}
