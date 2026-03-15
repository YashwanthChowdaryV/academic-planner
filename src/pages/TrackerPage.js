// src/pages/TrackerPage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { saveDailyLog, getDailyLogs } from "../services/extendedService";
import { useToast } from "../components/Toast";
import Loader from "../components/Loader";
import HeroBanner from "../components/ui/HeroBanner";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar as CalendarIcon, Clock, CheckCircle, Flame, BarChart3, Target } from "lucide-react";

export default function TrackerPage() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [hoursInput, setHoursInput] = useState("");

  useEffect(() => {
    async function fetchLogs() {
      try {
        const data = await getDailyLogs(user.uid);
        setLogs(data);
        if (data[todayStr] !== undefined) {
          setHoursInput(data[todayStr]);
        }
      } catch (err) {
        toast.show("Sync error. Please refresh.", "error");
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [user.uid, todayStr, toast]);

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setHoursInput(logs[dateStr] !== undefined ? logs[dateStr] : "");
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const val = Number(hoursInput);
    if (hoursInput === "" || val < 0 || val > 24) {
      toast.show("Enter hours between 0-24", "error");
      return;
    }
    setSaving(true);
    try {
      await saveDailyLog(user.uid, selectedDate, val);
      setLogs(prev => ({ ...prev, [selectedDate]: val }));
      toast.show(val > 0 ? "Focused study session logged! 🔥" : "Log updated", "success");
    } catch (err) {
      toast.show("Failed to update log", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="main-content"><Loader text="Opening your tracker..." /></div>;

  const last14Days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (13 - i));
    return d.toISOString().split("T")[0];
  });

  const totalThisWeek = last14Days.slice(7).reduce((sum, dateStr) => sum + (logs[dateStr] || 0), 0);
  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  return (
    <motion.div className="main-content">
      <HeroBanner 
        title="Momentum Tracker"
        subtitle="Consistency is the key to mastery. Log your daily efforts and watch your progress compound."
        icon={Flame}
        colorClass="amber"
        imageUrl="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      />

      <div className="tracker-grid" style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2.5rem", alignItems: "start" }}>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <AnimatedCard delay={0.1}>
            <div className="section-title">
              <IconBadge icon={CalendarIcon} size={18} colorClass="primary" />
              Consistency Heatmap
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "10px", padding: '1rem 0' }}>
              {last14Days.map(dateStr => {
                const d = new Date(dateStr);
                const dayName = d.toLocaleDateString('en-US', { weekday: 'short' }).charAt(0);
                const hrs = logs[dateStr] || 0;
                const isSelected = dateStr === selectedDate;
                
                let bg = "var(--surface2)";
                let color = "var(--text-muted)";
                let borderColor = "transparent";
                
                if (hrs > 0) {
                  if (hrs >= 4) { bg = "var(--primary)"; color = "white"; }
                  else if (hrs >= 2) { bg = "var(--primary-glow)"; color = "var(--primary)"; }
                  else { bg = "rgba(79, 70, 229, 0.1)"; color = "var(--primary)"; }
                }
                
                if (isSelected) borderColor = "var(--primary)";

                return (
                  <motion.div
                    key={dateStr}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleDateSelect(dateStr)}
                    className="heatmap-cell"
                    style={{ 
                      aspectRatio: '1', borderRadius: "12px", background: bg, color, 
                      border: `2px solid ${borderColor}`, cursor: "pointer", 
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s ease', boxShadow: isSelected ? 'var(--shadow-md)' : 'none'
                    }}
                  >
                    <span style={{ fontSize: "0.65rem", fontWeight: 700, opacity: 0.6 }}>{dayName}</span>
                    <span style={{ fontSize: "1.1rem", fontWeight: 800 }}>{d.getDate()}</span>
                  </motion.div>
                );
              })}
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "1rem", gap: '12px', alignItems: 'center' }}>
              <span>Less</span>
              <div style={{ display: "flex", gap: "4px" }}>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--surface2)" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "rgba(79, 70, 229, 0.1)" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--primary-glow)" }}></div>
                <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: "var(--primary)" }}></div>
              </div>
              <span>More</span>
            </div>
          </AnimatedCard>

          <AnimatedCard delay={0.2} style={{ background: 'var(--surface2)', borderColor: 'var(--primary-glow)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div className="streak-icon-wrap" style={{ background: 'var(--amber)', color: 'white', padding: '1rem', borderRadius: '16px', boxShadow: 'var(--shadow-md)' }}>
                <Flame size={32} />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>Weekly Impact</h3>
                <p className="text-muted text-sm">You have invested <strong>{totalThisWeek} hours</strong> in your education this week. Keep the fire burning!</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber)' }}>{totalThisWeek}h</div>
                <div className="text-xs font-bold text-muted uppercase tracking-wider">Invested</div>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          <AnimatedCard delay={0.3}>
            <div className="section-title">
              <IconBadge icon={Clock} size={18} colorClass="primary" />
              Update Logs
            </div>
            <p className="text-muted text-xs mb-4">Logging for <strong>{selectedDateFormatted}</strong></p>
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Study Duration (Hours)</label>
                <div className="input-with-icon">
                  <Clock className="input-icon" size={18} />
                  <input 
                    type="number" 
                    min="0" max="24" step="0.5"
                    placeholder="e.g. 4.5"
                    value={hoursInput} 
                    onChange={(e) => setHoursInput(e.target.value)} 
                    disabled={saving}
                  />
                </div>
              </div>
              <motion.button 
                type="submit" 
                className="btn btn-primary btn-full" 
                disabled={saving}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? "Updating..." : <><CheckCircle size={18} /> Record Study Session</>}
              </motion.button>
            </form>
          </AnimatedCard>

          <AnimatedCard delay={0.4} style={{ padding: 0, overflow: 'hidden' }}>
            <img 
              src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Analytics" 
              style={{ width: '100%', height: '180px', objectFit: 'cover' }}
            />
            <div style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.5rem' }}>
                <BarChart3 size={16} className="text-primary" />
                <span className="font-bold text-sm">Data-Driven Growth</span>
              </div>
              <p className="text-muted text-xs leading-relaxed">
                Tracking your hours helps AI calibrate your roadmap velocity. Be honest with your logs for the most accurate planning.
              </p>
            </div>
          </AnimatedCard>
        </div>

      </div>
    </motion.div>
  );
}

