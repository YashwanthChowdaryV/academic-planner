// src/components/Modal.js
import React from "react";

export default function Modal({ title, body, onConfirm, onCancel, confirmText = "Confirm", confirmClass = "btn btn-danger btn-sm", cancelText = "Cancel" }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <h3 className="modal-title">{title}</h3>
        <p className="modal-body">{body}</p>
        <div className="modal-actions">
          <button className="btn btn-secondary btn-sm" onClick={onCancel}>{cancelText}</button>
          <button className={confirmClass} onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
