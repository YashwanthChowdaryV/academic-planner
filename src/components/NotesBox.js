// src/components/NotesBox.js
import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { Save, CheckCircle2 } from "lucide-react";

export default function NotesBox({ initialText = "", onSave, placeholder = "Add notes…" }) {
  const [text, setText] = useState(initialText);
  const [status, setStatus] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => { setText(initialText); }, [initialText]);

  const save = useCallback(async (value) => {
    try {
      await onSave(value);
      setStatus(`Saved ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    } catch {
      setStatus("Save failed");
    }
  }, [onSave]);

  const handleChange = (e) => {
    const val = e.target.value;
    setText(val);
    setStatus("Saving…");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => save(val), 900);
  };

  return (
    <motion.div 
      className="notes-box"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      <textarea
        className="notes-textarea"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Phase notes"
      />
      <div className="notes-footer" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", color: "var(--text-dim)", marginTop: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {status.startsWith("Saved") ? <CheckCircle2 size={14} className="text-green" /> : <Save size={14} />} Notes auto-save
        </span>
        <span style={{ fontWeight: 500 }}>{status}</span>
      </div>
    </motion.div>
  );
}
