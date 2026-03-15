// src/components/StreakCard.js
import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function StreakCard({ streak = 0 }) {
  const hasStreak = streak > 0;

  return (
    <motion.div
      className="card"
      whileHover={{ y: -4 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1.25rem",
        background: hasStreak ? "linear-gradient(135deg, rgba(253, 186, 116, 0.1) 0%, rgba(251, 146, 60, 0.2) 100%)" : "var(--surface)",
        border: hasStreak ? "1px solid rgba(251, 146, 60, 0.3)" : "1px solid var(--border)",
        padding: "1.5rem"
      }}
    >
      <div style={{
        background: hasStreak ? "var(--amber)" : "var(--surface2)",
        color: hasStreak ? "white" : "var(--text-muted)",
        padding: "1rem",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: hasStreak ? "0 4px 15px rgba(245, 158, 11, 0.4)" : "none"
      }}>
        <motion.div
          animate={hasStreak ? { scale: [1, 1.2, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
        >
          <Flame size={32} />
        </motion.div>
      </div>

      <div style={{ flex: 1 }}>
        <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-dim)", marginBottom: "0.25rem" }}>
          Current Streak
        </h3>
        <div style={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <span style={{ fontSize: "2rem", fontWeight: 800, fontFamily: "var(--font-display)", color: hasStreak ? "var(--amber)" : "var(--text)", lineHeight: 1 }}>
            {streak}
          </span>
          <span style={{ fontSize: "0.95rem", color: "var(--text-muted)", fontWeight: 500 }}>
            {streak === 1 ? "day" : "days"}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
