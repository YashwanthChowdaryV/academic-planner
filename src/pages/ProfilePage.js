// src/pages/ProfilePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/userService";
import { useToast } from "../components/Toast";
import SettingsForm from "../components/SettingsForm";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";
import { motion, AnimatePresence } from "framer-motion";
import { User, Mail, GraduationCap, Save, LogOut, CheckCircle, Clock, ShieldCheck, Settings } from "lucide-react";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "pro", label: "Advanced / Pro" },
];

export default function ProfilePage() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: profile?.name || "",
    academicLevel: profile?.academicLevel || "intermediate",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.show("Name required", "error"); return; }
    setSaving(true);
    setSuccess(false);
    try {
      await updateUserProfile(user.uid, { name: form.name.trim(), academicLevel: form.academicLevel });
      await refreshProfile();
      setSuccess(true);
      toast.show("Profile synced! ✨", "success");
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      toast.show("Sync failed.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <motion.div className="main-content">
      <div style={{ marginBottom: "2.5rem", width: "100%" }}>
        <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Settings className="text-primary" size={32} /> Account Settings
        </h1>
        <p className="page-subtitle">Configure your personal profile and application preferences.</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        
        <AnimatedCard delay={0.1} style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ height: "120px", background: "linear-gradient(135deg, var(--primary) 0%, #6366f1 100%)", position: 'relative' }}>
            <div style={{ 
              position: 'absolute', bottom: '-40px', left: '2rem',
              width: "100px", height: "100px", borderRadius: '24px', background: 'white',
              boxShadow: 'var(--shadow-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2.5rem', fontWeight: 800, color: 'var(--primary)', border: '4px solid white', zIndex: 1
            }}>
              {initials}
            </div>
          </div>
          
          <div style={{ padding: '3.5rem 2rem 2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text)' }}>{profile?.name || "Student"}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '0.25rem' }}>
                  <span className="badge badge-indigo" style={{ fontWeight: 700 }}>{LEVELS.find(l => l.value === form.academicLevel)?.label || "Student"}</span>
                  <span className="text-muted text-xs font-bold uppercase tracking-widest">• Verified Explorer</span>
                </div>
              </div>
              <button 
                className="btn btn-sm" 
                onClick={handleLogout}
                style={{ background: 'var(--surface2)', color: 'var(--red)', border: '1px solid var(--border)' }}
              >
                <LogOut size={14} /> Sign Out
              </button>
            </div>
          </div>
        </AnimatedCard>

        <div className="profile-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <AnimatedCard delay={0.2}>
            <div className="section-title">
              <IconBadge icon={User} size={18} colorClass="primary" />
              Personal Info
            </div>
            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              <AnimatePresence>
                {success && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="alert alert-success">
                    <CheckCircle size={18} /> Profile synced.
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="form-group">
                <label className="form-label">Display Name</label>
                <div className="input-with-icon">
                  <User className="input-icon" size={18} />
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                    disabled={saving}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email Context</label>
                <div className="input-with-icon" style={{ opacity: 0.6 }}>
                  <Mail className="input-icon" size={18} />
                  <input type="email" value={user?.email || ""} readOnly style={{ cursor: 'not-allowed' }} />
                </div>
                <span className="text-xs text-muted mt-2 block"><ShieldCheck size={10} inline /> Authentication managed by Firebase.</span>
              </div>

              <div className="form-group">
                <label className="form-label">Current Academic Level</label>
                <div className="input-with-icon">
                  <GraduationCap className="input-icon" size={18} />
                  <select value={form.academicLevel} onChange={(e) => setForm((f) => ({ ...f, academicLevel: e.target.value }))} disabled={saving}>
                    {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                  </select>
                </div>
              </div>

              <motion.button 
                type="submit" 
                className="btn btn-primary btn-full" 
                disabled={saving}
                whileTap={{ scale: 0.98 }}
              >
                {saving ? "Syncing..." : <><Save size={18} /> Update Profile</>}
              </motion.button>
            </form>
          </AnimatedCard>

          <AnimatedCard delay={0.3}>
            <SettingsForm />
          </AnimatedCard>
        </div>

        <AnimatedCard delay={0.4} style={{ textAlign: 'center', background: 'var(--surface2)', borderStyle: 'dashed' }}>
          <p className="text-muted text-xs">
            Member since {profile?.createdAt?.toDate?.()
              ? profile.createdAt.toDate().toLocaleDateString("en-US", { month: "long", year: "numeric", day: 'numeric' })
              : "the beginning of your journey"}
          </p>
        </AnimatedCard>
      </div>
    </motion.div>
  );
}

