// src/components/ui/AnimatedCard.js
import React from "react";
import { motion } from "framer-motion";

export default function AnimatedCard({ children, className = "", delay = 0, onClick, style = {} }) {
  return (
    <motion.div
      className={`card ${className}`}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay, ease: [0.0, 0, 0.2, 1] }}
      onClick={onClick}
      style={style}
    >
      {children}
    </motion.div>
  );
}
