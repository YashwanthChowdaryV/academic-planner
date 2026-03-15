// src/components/PhaseCard.js
import React, { useState } from "react";
import NotesBox from "./NotesBox";
import AnimatedCard from "./ui/AnimatedCard";
import IconBadge from "./ui/IconBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Edit3, Circle, PlayCircle } from "lucide-react";

export default function PhaseCard({ phase, index, done = false, completedAt, onToggle, note = "", onSaveNote }) {
  const [showNotes, setShowNotes] = useState(!!note);
  const [expanded, setExpanded] = useState(index === 0);

  const formattedDate = completedAt ? new Date(completedAt).toLocaleString("en-US", { 
    month: "short", day: "numeric", hour: "numeric", minute: "numeric" 
  }) : null;

  return (
    <AnimatedCard 
      className={`phase-card ${done ? "done" : ""}`}
      delay={index * 0.05}
    >
      <div className="phase-header" onClick={() => setExpanded(!expanded)} style={{ cursor: 'pointer' }}>
        <div className="phase-main-info" style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div className={`phase-index-badge ${done ? 'done' : ''}`} style={{
              width: '24px', height: '24px', borderRadius: '50%', 
              background: done ? 'var(--accent)' : 'var(--surface2)',
              color: done ? 'white' : 'var(--text-muted)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 800
            }}>
              {done ? <CheckCircle size={14} /> : index + 1}
            </div>
            <h3 style={{ 
              fontSize: '1.1rem', 
              fontWeight: 700, 
              color: done ? 'var(--text-dim)' : 'var(--text)',
              textDecoration: done ? 'line-through' : 'none',
              margin: 0
            }}>
              {phase.title}
            </h3>
          </div>
          
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingLeft: '36px' }}>
            {phase.duration && (
              <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}><Clock size={12} /> {phase.duration}</span>
            )}
            {phase.risk && (
              <span className="badge badge-amber" style={{ fontSize: '0.7rem' }}><AlertTriangle size={12} /> {phase.risk}</span>
            )}
            {done && formattedDate && (
              <span className="badge badge-green" style={{ fontSize: '0.7rem' }}>Completed {formattedDate}</span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <motion.button
            whileTap={{ scale: 0.9 }}
            className={`phase-action-btn ${done ? 'active' : ''}`}
            onClick={(e) => { e.stopPropagation(); onToggle(index, !done); }}
            style={{
              padding: '8px 16px',
              borderRadius: '100px',
              border: 'none',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: done ? 'var(--green-dim)' : 'var(--primary-glow)',
              color: done ? 'var(--green)' : 'var(--primary)',
            }}
          >
            {done ? <><CheckCircle size={16} /> Done</> : <><PlayCircle size={16} /> Start</>}
          </motion.button>
          
          <div style={{ color: "var(--text-muted)" }}>
            {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden', paddingLeft: '36px' }}
          >
            <div style={{ 
              marginTop: '1.25rem', 
              fontSize: '0.95rem', 
              lineHeight: 1.7, 
              color: 'var(--text-dim)',
              whiteSpace: 'pre-wrap'
            }}>
              {phase.content}
            </div>

            <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowNotes(!showNotes); }}
                style={{
                  background: 'none', border: 'none', color: 'var(--primary)', 
                  fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: '6px', width: 'fit-content'
                }}
              >
                <Edit3 size={14} /> {showNotes ? "Hide Notes" : "Personal Notes"}
              </button>

              <AnimatePresence>
                {showNotes && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                    <NotesBox
                      initialText={note}
                      onSave={(text) => onSaveNote(index, text)}
                      placeholder={`Reflection or links for this phase...`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </AnimatedCard>
  );
}

