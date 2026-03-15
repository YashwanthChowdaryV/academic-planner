// src/components/Loader.js
import React from "react";
import { motion } from "framer-motion";

export default function Loader({ text = "Loading…", fullScreen = false }) {
  const inner = (
    <div className="loader-overlay">
      <motion.div 
        className="loader-spinner" 
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 1 }}
      />
      <motion.p 
        className="loader-text"
        animate={{ opacity: [1, 0.5, 1] }}
        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
      >
        {text}
      </motion.p>
    </div>
  );

  if (fullScreen) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", inset: 0, background: "rgba(245, 247, 251, 0.8)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}
      >
        {inner}
      </motion.div>
    );
  }

  return inner;
}
