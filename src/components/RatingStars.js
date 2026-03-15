// src/components/RatingStars.js
import React, { useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

export default function RatingStars({ initialRating = 0, onRate, readOnly = false }) {
  const [rating, setRating] = useState(initialRating);
  const [hover, setHover] = useState(0);

  const handleClick = (value) => {
    if (readOnly) return;
    setRating(value);
    if (onRate) onRate(value);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= (hover || rating);
        return (
          <motion.button
            key={star}
            type="button"
            whileHover={readOnly ? {} : { scale: 1.2 }}
            whileTap={readOnly ? {} : { scale: 0.9 }}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            onClick={() => handleClick(star)}
            style={{
              background: "none",
              border: "none",
              cursor: readOnly ? "default" : "pointer",
              padding: "4px",
              color: isFilled ? "var(--amber)" : "var(--border)",
              transition: "color 0.2s"
            }}
          >
            <Star size={20} fill={isFilled ? "currentColor" : "none"} strokeWidth={isFilled ? 0 : 2} />
          </motion.button>
        );
      })}
    </div>
  );
}
