// src/components/NotesBox.js
import React, { useState, useEffect, useRef, useCallback } from "react";

export default function NotesBox({ initialText = "", onSave, placeholder = "Add notes…" }) {
  const [text, setText] = useState(initialText);
  const [status, setStatus] = useState("");
  const debounceRef = useRef(null);

  useEffect(() => { setText(initialText); }, [initialText]);

  const save = useCallback(async (value) => {
    try {
      await onSave(value);
      setStatus(`Saved ${new Date().toLocaleTimeString()}`);
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
    <div className="notes-box">
      <textarea
        className="notes-textarea"
        value={text}
        onChange={handleChange}
        placeholder={placeholder}
        aria-label="Phase notes"
      />
      <div className="notes-footer">
        <span>Notes auto-save</span>
        <span>{status}</span>
      </div>
    </div>
  );
}
