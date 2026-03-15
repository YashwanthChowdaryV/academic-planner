// src/components/SettingsForm.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { saveSettings, getSettings } from "../services/extendedService";
import { useToast } from "./Toast";
import Loader from "./Loader";
import IconBadge from "./ui/IconBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Clock, Save, CheckCircle, Mail, Plus, Trash2, BrainCircuit } from "lucide-react";
import { getPreferences, savePreferences } from "../services/reminderService";

export default function SettingsForm() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [form, setForm] = useState({ 
    dailyReminderTime: "09:00", 
    emailNotifications: false,
    remindersEnabled: false,
    reminderTimes: ["09:00"],
    smartReminders: true
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings(user.uid);
        const prefs = await getPreferences(user.uid);
        setForm({
          dailyReminderTime: data.dailyReminderTime || "09:00",
          emailNotifications: data.emailNotifications || false,
          ...prefs
        });
      } catch (err) {
        toast.show("Preference load failed", "error");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user.uid, toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(false);
    try {
      await saveSettings(user.uid, { 
        dailyReminderTime: form.dailyReminderTime, 
        emailNotifications: form.emailNotifications 
      });
      await savePreferences(user.uid, {
        remindersEnabled: form.remindersEnabled,
        reminderTimes: form.reminderTimes,
        smartReminders: form.smartReminders
      });
      setSuccess(true);
      toast.show("Preferences saved!", "success");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.show("Failed to update preferences", "error");
    } finally {
      setSaving(false);
    }
  };

  const addTime = () => setForm(f => ({ ...f, reminderTimes: [...f.reminderTimes, "09:00"] }));
  const removeTime = (idx) => setForm(f => ({ ...f, reminderTimes: f.reminderTimes.filter((_, i) => i !== idx) }));
  const updateTime = (idx, val) => {
    const newTimes = [...form.reminderTimes];
    newTimes[idx] = val;
    setForm(f => ({ ...f, reminderTimes: newTimes }));
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", padding: "2rem" }}><Loader size={24} /></div>;

  return (
    <div className="settings-form-container">
      <div className="section-title">
        <IconBadge icon={Bell} size={18} colorClass="primary" />
        Notifications
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        <AnimatePresence>
          {success && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="alert alert-success">
              <CheckCircle size={18} /> Settings updated.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="form-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <label className="form-label" style={{ margin: 0 }}>Study Reminders</label>
            <div className="toggle-switch">
              <input 
                type="checkbox" 
                id="remindersEnabled" 
                checked={form.remindersEnabled}
                onChange={(e) => setForm(f => ({ ...f, remindersEnabled: e.target.checked }))}
              />
              <label htmlFor="remindersEnabled"></label>
            </div>
          </div>

          <AnimatePresence>
            {form.remindersEnabled && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} 
                animate={{ opacity: 1, height: 'auto' }} 
                exit={{ opacity: 0, height: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
              >
                {form.reminderTimes.map((time, idx) => (
                  <div key={idx} className="input-with-icon" style={{ display: 'flex', gap: '8px' }}>
                    <div style={{ flex: 1, position: 'relative' }}>
                      <Clock className="input-icon" size={16} />
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => updateTime(idx, e.target.value)}
                        disabled={saving}
                      />
                    </div>
                    {form.reminderTimes.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => removeTime(idx)}
                        style={{ padding: '8px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
                <button 
                  type="button" 
                  onClick={addTime}
                  className="btn btn-xs btn-secondary"
                  style={{ alignSelf: 'flex-start', fontSize: '0.7rem', padding: '4px 10px' }}
                >
                  <Plus size={12} /> Add Time
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ 
          display: "flex", alignItems: "flex-start", gap: "12px", background: "var(--surface2)", 
          padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", transition: 'all 0.2s ease'
        }}>
          <div style={{ marginTop: '2px' }}>
            <input
              type="checkbox"
              id="smartReminders"
              checked={form.smartReminders}
              onChange={(e) => setForm(f => ({ ...f, smartReminders: e.target.checked }))}
              disabled={saving}
              className="custom-checkbox"
            />
          </div>
          <label htmlFor="smartReminders" style={{ cursor: "pointer", flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <BrainCircuit size={14} className="text-secondary" /> Smart Suggestions
            </div>
            <p className="text-xs text-muted" style={{ marginTop: '2px' }}>Personalized reminders based on your study patterns.</p>
          </label>
        </div>

        <div style={{ 
          display: "flex", alignItems: "flex-start", gap: "12px", background: "var(--surface2)", 
          padding: "16px", borderRadius: "16px", border: "1px solid var(--border)", transition: 'all 0.2s ease'
        }}>
          <div style={{ marginTop: '2px' }}>
            <input
              type="checkbox"
              id="emailNotifs"
              checked={form.emailNotifications}
              onChange={(e) => setForm(f => ({ ...f, emailNotifications: e.target.checked }))}
              disabled={saving}
              className="custom-checkbox"
            />
          </div>
          <label htmlFor="emailNotifs" style={{ cursor: "pointer", flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text)' }}>Email Digest</div>
            <p className="text-xs text-muted" style={{ marginTop: '2px' }}>Weekly progress reports and streak alerts.</p>
          </label>
        </div>

        <motion.button 
          type="submit" 
          className="btn btn-secondary btn-full" 
          disabled={saving}
          whileTap={{ scale: 0.98 }}
          style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
        >
          {saving ? "Syncing..." : <><Save size={18} /> Save Preferences</>}
        </motion.button>
      </form>
    </div>
  );
}

