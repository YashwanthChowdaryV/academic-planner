// src/components/ui/IconBadge.js
import React from "react";

export default function IconBadge({ icon: Icon, size = 18, colorClass = "primary" }) {
  return (
    <div className={`icon-badge-box icon-badge-${colorClass}`}>
      <Icon size={size} />
    </div>
  );
}
