// src/components/CountdownBar.js
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AlarmClock } from "lucide-react";

export default function CountdownBar({ createdAt, daysAllocated }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    if (!createdAt || !daysAllocated) return;

    const createdTime = createdAt?.toDate?.() ? createdAt.toDate().getTime() : new Date(createdAt).getTime();
    if (isNaN(createdTime)) return;
    
    // Calculate deadline by adding days (in milliseconds)
    const deadlineTime = createdTime + (daysAllocated * 24 * 60 * 60 * 1000);

    const updateTimer = () => {
      const now = Date.now();
      const diff = deadlineTime - now;
      const totalAllocatedMs = daysAllocated * 24 * 60 * 60 * 1000;

      if (diff <= 0) {
        setTimeLeft("Deadline passed");
        setProgressPct(100);
        return;
      }

      // Progress means how much time HAS passed.
      const passed = now - createdTime;
      const pct = Math.min(100, Math.max(0, (passed / totalAllocatedMs) * 100));
      setProgressPct(pct);

      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
      setTimeLeft(`${d}d ${h}h remaining`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000); // update every minute
    return () => clearInterval(interval);
  }, [createdAt, daysAllocated]);

  if (!timeLeft) return null;

  // Change color based on how close we are to deadline
  const barColor = progressPct > 90 ? "var(--red)" : progressPct > 70 ? "var(--amber)" : "var(--primary)";

  return (
    <div style={{ background: "rgba(255,255,255,0.1)", padding: "12px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.2)", marginTop: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.85rem", fontWeight: 600, marginBottom: "8px" }}>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}><AlarmClock size={16} /> Deadline Countdown</span>
        <span style={{ color: progressPct > 90 ? "#fca5a5" : "white" }}>{timeLeft}</span>
      </div>
      <div style={{ width: "100%", height: "6px", background: "rgba(0,0,0,0.3)", borderRadius: "100px", overflow: "hidden" }}>
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progressPct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          style={{ height: "100%", background: barColor, borderRadius: "100px", boxShadow: `0 0 10px ${barColor}` }}
        />
      </div>
    </div>
  );
}
