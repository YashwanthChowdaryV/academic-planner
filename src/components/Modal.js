// src/components/Modal.js
import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Modal({ title, body, onConfirm, onCancel, confirmText = "Confirm", confirmClass = "btn btn-danger", cancelText = "Cancel" }) {
  
  // Prevent scrolling when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-backdrop" 
        onClick={onCancel}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(15, 23, 42, 0.6)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "1rem"
        }}
      >
        <motion.div 
          className="modal-box card" 
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          style={{ width: "100%", maxWidth: "450px", padding: "2rem" }}
        >
          <h3 className="modal-title" style={{ fontSize: "1.25rem", fontWeight: 700, marginBottom: "0.75rem", color: "var(--text)" }}>{title}</h3>
          <p className="modal-body" style={{ color: "var(--text-muted)", marginBottom: "2rem", lineHeight: 1.6 }}>{body}</p>
          <div className="modal-actions" style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
            <button className="btn btn-secondary" onClick={onCancel}>{cancelText}</button>
            <button className={confirmClass} onClick={onConfirm} style={{ padding: "10px 20px" }}>{confirmText}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
