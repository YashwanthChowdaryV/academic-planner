// src/components/StatCard.js
import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ icon, label, value, sub, accentColor }) {
  return (
    <motion.div 
      className="stat-card" 
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300 }}
      style={accentColor ? { borderColor: `${accentColor}40` } : {}}
    >
      <div className="stat-icon">{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value" style={accentColor ? { color: accentColor } : {}}>{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </motion.div>
  );
}
