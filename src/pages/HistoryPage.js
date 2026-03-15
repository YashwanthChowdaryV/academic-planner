// src/pages/HistoryPage.js
import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserPlans, getProgress, deletePlan } from "../services/planService";
import HistoryList from "../components/HistoryList";
import Loader from "../components/Loader";
import Modal from "../components/Modal";
import { useToast } from "../components/Toast";
import { motion } from "framer-motion";
import { Search, LayoutGrid, List as ListIcon, History as HistoryIcon } from "lucide-react";

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
  const [viewMode, setViewMode] = useState("list");

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
      toast.show("Plan deleted successfully.", "success");
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
    <motion.div 
      className="main-content"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div style={{ marginBottom: "2rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <HistoryIcon className="text-primary" size={32} /> Plan History
          </h1>
          <p className="page-subtitle">Access and manage all your AI-generated learning roadmaps.</p>
        </div>
        
        <div style={{ display: "flex", background: "var(--surface)", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", overflow: "hidden" }}>
          <button 
            style={{ padding: "8px 12px", border: "none", background: viewMode === "list" ? "var(--primary-glow)" : "transparent", color: viewMode === "list" ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
            onClick={() => setViewMode("list")}
          >
            <ListIcon size={16} /> List
          </button>
          <button 
            style={{ padding: "8px 12px", border: "none", background: viewMode === "grid" ? "var(--primary-glow)" : "transparent", color: viewMode === "grid" ? "var(--primary)" : "var(--text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", fontWeight: 600 }}
            onClick={() => setViewMode("grid")}
          >
            <LayoutGrid size={16} /> Grid
          </button>
        </div>
      </div>

      {/* Filters */}
      <motion.div 
        className="card"
        style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", padding: "1rem" }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="search-input-wrap" style={{ flex: 1, minWidth: "250px", position: "relative" }}>
          <Search size={18} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search by goal or keywords…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "40px", width: "100%", background: "var(--surface)", border: "1px solid var(--border)" }}
          />
        </div>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{ width: "auto", minWidth: "160px", background: "var(--surface)", border: "1px solid var(--border)", cursor: "pointer" }}
        >
          {LEVEL_OPTIONS.map((l) => (
            <option key={l} value={l}>{l === "all" ? "All Levels" : l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
      </motion.div>

      {loading ? (
        <div className="card" style={{ padding: "4rem" }}>
          <Loader text="Loading your history…" />
        </div>
      ) : (
        <motion.div layout>
          {filtered.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <p className="text-muted" style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                Showing {filtered.length} {filtered.length === 1 ? 'plan' : 'plans'}
              </p>
            </div>
          )}
          
          {filtered.length === 0 && plans.length > 0 && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="card" style={{ textAlign: "center", padding: "4rem 2rem", color: "var(--text-muted)" }}
            >
              <Search size={48} style={{ opacity: 0.2, marginBottom: "1rem" }} />
              <h3>No plans match your search</h3>
              <p>Try adjusting your filters or search term.</p>
              <button className="btn btn-secondary" onClick={() => { setSearch(""); setLevelFilter("all"); }} style={{ marginTop: "1rem" }}>Clear Filters</button>
            </motion.div>
          )}

          <HistoryList
            plans={filtered}
            progressMap={progressMap}
            onDelete={(id) => setDeleteTarget(id)}
            viewMode={viewMode}
          />
        </motion.div>
      )}

      {deleteTarget && (
        <Modal
          title="Delete Plan"
          body="Are you sure? This will permanently delete the plan, its progress, and all notes. This cannot be undone."
          onConfirm={() => handleDelete(deleteTarget)}
          onCancel={() => setDeleteTarget(null)}
          confirmText="Delete Plan"
          confirmClass="btn btn-danger"
        />
      )}
    </motion.div>
  );
}
