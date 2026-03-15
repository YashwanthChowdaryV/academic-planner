// src/components/TagSelector.js
import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TagSelector({ tags, onChange }) {
  const [inputValue, setInputValue] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    const val = inputValue.trim().toLowerCase();
    if (val && !tags.includes(val) && tags.length < 5) {
      onChange([...tags, val]);
    }
    setInputValue("");
  };

  const handleRemove = (tagToRemove) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        <AnimatePresence>
          {tags.map((tag) => (
            <motion.span
              key={tag}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                background: "var(--primary-light)",
                color: "var(--primary)",
                borderRadius: "20px",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              #{tag}
              <button
                type="button"
                onClick={() => handleRemove(tag)}
                style={{ background: "none", border: "none", color: "currentcolor", cursor: "pointer", padding: 0, display: "flex" }}
              >
                <X size={14} />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>
      </div>
      
      {tags.length < 5 && (
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            type="text"
            className="input"
            placeholder="Add a tag..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAdd(e);
              }
            }}
            style={{ padding: "8px 12px", fontSize: "0.85rem", flex: 1 }}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleAdd}>
            <Plus size={16} /> Add
          </button>
        </div>
      )}
      {tags.length >= 5 && <small style={{ color: "var(--text-muted)" }}>Maximum 5 tags allowed.</small>}
    </div>
  );
}
