// src/components/ProgressBar.js
import React from "react";
import { motion } from "framer-motion";

export default function ProgressBar({ completed = 0, total = 1, showCount = true }) {
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  return (
    <div className="progress-wrap">
      {showCount && (
        <div className="progress-meta">
          <span>{pct}% complete</span>
          <span>{completed}/{total} phases</span>
        </div>
      )}
      <div className="progress-track">
        <motion.div 
          className={`progress-fill ${pct === 100 ? "success" : ""}`}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
