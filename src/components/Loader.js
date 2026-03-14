// src/components/Loader.js
import React from "react";

export default function Loader({ text = "Loading…", fullScreen = false }) {
  const inner = (
    <div className="loader-overlay">
      <div className="loader-spinner" />
      <p className="loader-text">{text}</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div style={{
        position: "fixed", inset: 0, background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
      }}>
        {inner}
      </div>
    );
  }

  return inner;
}
