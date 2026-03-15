// src/components/MilestoneBadge.js
import React from "react";
import { motion } from "framer-motion";
import { Award, Zap, Star, Trophy } from "lucide-react";

export default function MilestoneBadge({ percentage }) {
  if (percentage < 25) return null;

  let label, Icon, colors;
  if (percentage >= 100) {
    label = "Mastery Achieved";
    Icon = Trophy;
    colors = "rgba(16, 185, 129, 0.15)";
  } else if (percentage >= 75) {
    label = "Almost There";
    Icon = Star;
    colors = "rgba(245, 158, 11, 0.15)";
  } else if (percentage >= 50) {
    label = "Halfway Point";
    Icon = Zap;
    colors = "rgba(124, 58, 237, 0.15)";
  } else {
    label = "Getting Started";
    Icon = Award;
    colors = "rgba(59, 130, 246, 0.15)";
  }

  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="badge"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: colors,
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "0.85rem",
        fontWeight: 700,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
      }}
    >
      <Icon size={16} />
      <span>{label}</span>
    </motion.div>
  );
}
