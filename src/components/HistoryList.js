// src/components/HistoryList.js
import React from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Calendar, Clock, Layers, Trash2, ArrowRight, CheckCircle2, Tag } from "lucide-react";

export default function HistoryList({ plans, progressMap = {}, onDelete, viewMode = "list" }) {
  const navigate = useNavigate();

  if (!plans.length) {
    return (
      <motion.div 
        className="empty-state card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ padding: "3rem", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <img src="https://images.unsplash.com/photo-1588600878108-578307a3cc9d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80" alt="Empty history" style={{ width: "200px", height: "150px", objectFit: "cover", borderRadius: "16px", marginBottom: "1.5rem" }} />
          <h3 style={{ fontSize: "1.5rem", fontFamily: "var(--font-display)", marginBottom: "0.5rem" }}>No plans yet</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "2rem", maxWidth: "300px" }}>Generate your first AI academic plan to start tracking your progress here.</p>
          <button className="btn btn-primary" onClick={() => navigate("/planner")}>Create Your First Plan</button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      layout 
      style={{ 
        display: "grid", 
        gridTemplateColumns: viewMode === "grid" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr", 
        gap: "1.25rem",
        width: "100%"
      }}
    >
      <AnimatePresence>
        {plans.map((plan, i) => {
          const prog = progressMap[plan.id];
          const phases = prog?.phases || {};
          const total = plan.meta?.phaseCount || Object.keys(phases).length || 0;
          const completed = Object.values(phases).filter(Boolean).length;
          const isComplete = total > 0 && completed === total;

          const createdAt = plan.createdAt?.toDate?.()
            ? plan.createdAt.toDate().toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
            : plan.createdAt
            ? new Date(plan.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" })
            : "—";

          return (
            <motion.div
              key={plan.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              whileHover={{ y: -4, scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`card ${viewMode === "list" ? "history-card" : ""}`}
              style={{
                display: "flex",
                flexDirection: viewMode === "list" ? "row" : "column",
                alignItems: viewMode === "list" ? "center" : "flex-start",
                gap: "1.5rem",
                padding: "1.5rem",
                cursor: "pointer",
                borderLeft: isComplete ? "4px solid var(--green)" : "4px solid var(--primary)",
                height: "100%"
              }}
              onClick={() => navigate(`/plan/${plan.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && navigate(`/plan/${plan.id}`)}
            >
              <div style={{ 
                background: isComplete ? "var(--green-dim)" : "var(--primary-glow)", 
                padding: "16px", 
                borderRadius: "var(--radius-sm)", 
                color: isComplete ? "var(--green)" : "var(--primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                {isComplete ? <CheckCircle2 size={32} /> : <BookOpen size={32} />}
              </div>
              
              <div style={{ flex: 1, width: "100%", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "1rem" }}>
                  <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text)", lineHeight: 1.3 }}>
                    {plan.input?.goal || plan.title}
                  </div>
                  {isComplete && <span className="badge badge-green" style={{ whiteSpace: "nowrap" }}>Completed</span>}
                </div>
                
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Layers size={14} /> {plan.input?.level}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Calendar size={14} /> {createdAt}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "4px" }}><Clock size={14} /> {plan.meta?.estimatedTotalHours}h total</span>
                </div>
                
                {plan.input?.tags?.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
                    {plan.input.tags.map(t => (
                      <span key={t} style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--surface2)", padding: "4px 8px", borderRadius: "12px", fontSize: "0.75rem", color: "var(--text-dim)", border: "1px solid var(--border)" }}>
                        <Tag size={12} /> {t}
                      </span>
                    ))}
                  </div>
                )}
                
                {total > 0 && (
                  <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "var(--text-muted)", fontWeight: 500 }}>
                      <span>Progress</span>
                      <span style={{ color: isComplete ? "var(--green)" : "var(--primary)" }}>{Math.round((completed/total)*100)}%</span>
                    </div>
                    <ProgressBar completed={completed} total={total} showCount={false} />
                  </div>
                )}
              </div>
              
              <div style={{ 
                display: "flex", 
                gap: "0.5rem", 
                flexDirection: viewMode === "list" ? "row" : "row-reverse", 
                width: viewMode === "list" ? "auto" : "100%",
                justifyContent: viewMode === "list" ? "flex-start" : "space-between",
                marginTop: viewMode === "list" ? 0 : "auto"
              }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={(e) => { e.stopPropagation(); navigate(`/plan/${plan.id}`); }}
                >
                  View Plan <ArrowRight size={14} style={{ marginLeft: "4px" }} />
                </button>
                {onDelete && (
                  <button
                    className="btn btn-sm"
                    style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "8px" }}
                    onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}
                    aria-label="Delete plan"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
}
