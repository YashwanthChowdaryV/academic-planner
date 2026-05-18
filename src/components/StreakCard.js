// src/components/StreakCard.js
import React from "react";
import { motion } from "framer-motion";
import { Flame } from "lucide-react";

export default function StreakCard({ streak = 0 }) {
  const hasStreak = streak > 0;

  return (
    <motion.div
      className="card"
      whileHover={{ y: -2 }}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.9rem",
        padding: "1rem 1.1rem",
        background: hasStreak
          ? "rgba(255, 140, 0, 0.12)"
          : "var(--surface)",
        border: hasStreak
          ? "1px solid rgba(255, 140, 0, 0.35)"
          : "1px solid var(--border)",
        borderRadius: "16px",
        minHeight: "88px",
      }}
    >
      <div
        style={{
          background: "#ff8c00",
          color: "white",
          width: "56px",
          height: "56px",
          borderRadius: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: hasStreak
            ? "0 6px 18px rgba(255, 140, 0, 0.35)"
            : "none",
          flexShrink: 0,
        }}
      >
        <motion.div
          animate={
            hasStreak
              ? { scale: [1, 1.12, 1] }
              : {}
          }
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <Flame size={26} />
        </motion.div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          gap: "6px",
        }}
      >
        <span
          style={{
            fontSize: "2rem",
            fontWeight: 800,
            color: "#ff8c00",
            lineHeight: 1,
            letterSpacing: "-1px",
          }}
        >
          {streak}
        </span>

        <span
          style={{
            fontSize: "0.95rem",
            color: "var(--text-muted)",
            fontWeight: 600,
          }}
        >
          {streak === 1 ? "day" : "days"}
        </span>
      </div>
    </motion.div>
  );
}
