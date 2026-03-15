// src/components/SettingsForm.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { saveSettings, getSettings } from "../services/extendedService";
import { useToast } from "./Toast";
import Loader from "./Loader";
import IconBadge from "./ui/IconBadge";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Clock, Save, CheckCircle, Mail } from "lucide-react";

export default function SettingsForm() {
  const { user } = useAuth();
  const toast = useToast();
  
  const [form, setForm] = useState({ dailyReminderTime: "09:00", emailNotifications: false });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await getSettings(user.uid);
        setForm({
          dailyReminderTime: data.dailyReminderTime || "09:00",
          emailNotifications: data.emailNotifications || false
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
      await saveSettings(user.uid, form);
      setSuccess(true);
      toast.show("Preferences saved!", "success");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.show("Failed to update preferences", "error");
    } finally {
      setSaving(false);
    }
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
          <label className="form-label">Study Reminder</label>
          <div className="input-with-icon">
            <Clock className="input-icon" size={18} />
            <input
              type="time"
              value={form.dailyReminderTime}
              onChange={(e) => setForm(f => ({ ...f, dailyReminderTime: e.target.value }))}
              disabled={saving}
            />
          </div>
          <span className="text-xs text-muted mt-2 block">We'll nudge you daily to stay on track.</span>
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

