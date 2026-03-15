// src/components/ui/Heatmap.js
import React, { useMemo } from "react";
import { motion } from "framer-motion";

function getColor(hours) {
  if (!hours || hours === 0) return "var(--surface3)";
  if (hours < 1) return "#c7d2fe";
  if (hours < 2) return "#a5b4fc";
  if (hours < 4) return "#6366f1";
  return "#4338ca";
}

export default function Heatmap({ logs = {}, weeks = 26 }) {
  const cells = useMemo(() => {
    const today = new Date();
    const result = [];
    for (let i = weeks * 7 - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        hours: logs[dateStr] || 0,
        label: d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      });
    }
    return result;
  }, [logs, weeks]);

  // Group into weeks
  const grid = [];
  for (let i = 0; i < cells.length; i += 7) {
    grid.push(cells.slice(i, i + 7));
  }

  return (
    <div>
      <div style={{ display: "flex", gap: "3px", overflowX: "auto", paddingBottom: "4px" }}>
        {grid.map((week, wi) => (
          <div key={wi} style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
            {week.map((cell, di) => (
              <motion.div
                key={cell.date}
                title={`${cell.label}: ${cell.hours}h`}
                whileHover={{ scale: 1.3 }}
                style={{
                  width: "13px",
                  height: "13px",
                  borderRadius: "3px",
                  background: getColor(cell.hours),
                  cursor: "default",
                  transition: "background 0.2s"
                }}
              />
            ))}
          </div>
        ))}
      </div>
      {/* Legend */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "10px", justifyContent: "flex-end" }}>
        <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>Less</span>
        {["var(--surface3)", "#c7d2fe", "#a5b4fc", "#6366f1", "#4338ca"].map((c, i) => (
          <div key={i} style={{ width: "12px", height: "12px", borderRadius: "3px", background: c, border: "1px solid rgba(0,0,0,0.05)" }} />
        ))}
        <span style={{ fontSize: "0.68rem", color: "var(--text-dim)" }}>More</span>
      </div>
    </div>
  );
}
