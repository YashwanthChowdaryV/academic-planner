// src/components/ui/IllustrationBlock.js
import React from "react";
import { motion } from "framer-motion";

export default function IllustrationBlock({ src, alt = "Illustration", overlayColor = "primary" }) {
  const overlayClass = `overlay-grad-${overlayColor}`;
  
  return (
    <motion.div 
      className="illustration-container"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <img src={src} alt={alt} className="illustration-img" />
      <div className={`illustration-overlay ${overlayClass}`} />
    </motion.div>
  );
}
