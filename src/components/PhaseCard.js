// src/components/PhaseCard.js
import React, { useState } from "react";
import NotesBox from "./NotesBox";

export default function PhaseCard({ phase, index, done = false, onToggle, note = "", onSaveNote }) {
  const [showNotes, setShowNotes] = useState(!!note);

  return (
    <div className={`phase-card animate-fade-in ${done ? "done" : ""}`}
      style={{ animationDelay: `${index * 0.07}s` }}>

      <div className="phase-header">
        <div className="phase-title-wrap">
          <div className={`phase-number ${done ? "done" : ""}`}>
            {done ? "✓" : index + 1}
          </div>
          <span className="phase-name">{phase.title}</span>
          {phase.duration && (
            <span className="badge badge-blue">⏱ {phase.duration}</span>
          )}
          {phase.risk && (
            <span className="badge badge-amber">⚠ {phase.risk}</span>
          )}
        </div>

        <button
          className={`phase-toggle ${done ? "done" : ""}`}
          onClick={() => onToggle(index, !done)}
          aria-label={done ? "Mark as incomplete" : "Mark as complete"}
        >
          {done ? "✓ Done" : "Mark Done"}
        </button>
      </div>

      <pre className="phase-content">{phase.content}</pre>

      <button className="phase-notes-toggle" onClick={() => setShowNotes((v) => !v)}>
        📝 {showNotes ? "Hide Notes" : "Add Notes"}
      </button>

      {showNotes && (
        <NotesBox
          initialText={note}
          onSave={(text) => onSaveNote(index, text)}
          placeholder={`Notes for Phase ${index + 1}…`}
        />
      )}
    </div>
  );
}
