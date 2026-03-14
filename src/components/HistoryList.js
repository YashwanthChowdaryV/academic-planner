// src/components/HistoryList.js
import React from "react";
import { useNavigate } from "react-router-dom";
import ProgressBar from "./ProgressBar";

export default function HistoryList({ plans, progressMap = {}, onDelete }) {
  const navigate = useNavigate();

  if (!plans.length) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📭</div>
        <div className="empty-title">No plans yet</div>
        <div className="empty-desc">Generate your first AI plan to see it here.</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {plans.map((plan, i) => {
        const prog = progressMap[plan.id];
        const phases = prog?.phases || {};
        const total = plan.meta?.phaseCount || Object.keys(phases).length || 0;
        const completed = Object.values(phases).filter(Boolean).length;

        const createdAt = plan.createdAt?.toDate?.()
          ? plan.createdAt.toDate().toLocaleDateString()
          : plan.createdAt
          ? new Date(plan.createdAt).toLocaleDateString()
          : "—";

        return (
          <div
            key={plan.id}
            className="history-card"
            style={{ animationDelay: `${i * 0.06}s` }}
            onClick={() => navigate(`/plan/${plan.id}`)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && navigate(`/plan/${plan.id}`)}
          >
            <div style={{ fontSize: "1.5rem" }}>📋</div>
            <div className="history-card-main">
              <div className="history-card-title">{plan.input?.goal || plan.title}</div>
              <div className="history-card-meta">
                <span className="badge badge-muted">{plan.input?.level}</span>
                <span>🗓 {createdAt}</span>
                <span>⏱ {plan.meta?.estimatedTotalHours}h total</span>
                {total > 0 && (
                  <span style={{ color: completed === total ? "var(--green)" : "var(--text-muted)" }}>
                    {completed}/{total} phases
                  </span>
                )}
              </div>
              {total > 0 && (
                <div style={{ marginTop: "8px" }}>
                  <ProgressBar completed={completed} total={total} showCount={false} />
                </div>
              )}
            </div>
            <div style={{ display: "flex", gap: "0.5rem", flexShrink: 0 }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={(e) => { e.stopPropagation(); navigate(`/plan/${plan.id}`); }}
              >
                Open
              </button>
              {onDelete && (
                <button
                  className="btn btn-danger btn-sm"
                  onClick={(e) => { e.stopPropagation(); onDelete(plan.id); }}
                  aria-label="Delete plan"
                >
                  🗑
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
