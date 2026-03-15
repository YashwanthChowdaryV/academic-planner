// src/components/ui/HeroBanner.js
import React from "react";
import { motion } from "framer-motion";

export default function HeroBanner({ title, subtitle, icon: Icon, colorClass = "primary", imageUrl }) {
  const gradientClass = `hero-grad-${colorClass}`;
  
  return (
    <motion.div 
      className={`hero-banner ${gradientClass}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.0, 0, 0.2, 1] }}
    >
      <div className="hero-content">
        {Icon && (
          <div className="hero-icon-wrap">
            <Icon size={26} />
          </div>
        )}
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
      </div>

      {imageUrl && (
        <motion.img 
          src={imageUrl} 
          alt=""
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.0, 0, 0.2, 1] }}
          style={{ 
            width: '200px',
            height: '150px',
            borderRadius: '14px', 
            boxShadow: '0 10px 28px rgba(0,0,0,0.3)',
            objectFit: 'cover',
            border: '3px solid rgba(255,255,255,0.18)',
            flexShrink: 0,
            display: 'block',
            zIndex: 2,
            position: 'relative'
          }}
        />
      )}
      
      <div className="hero-shapes" aria-hidden="true">
        <div className="shape shape-1" />
        <div className="shape shape-2" />
      </div>
    </motion.div>
  );
}
