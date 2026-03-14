// src/pages/ProfilePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/userService";
import { useToast } from "../components/Toast";

const LEVELS = [
  { value: "school", label: "School (High School)" },
  { value: "inter", label: "Intermediate / Pre-university" },
  { value: "btech", label: "BTech / Undergraduate Engineering" },
];

export default function ProfilePage() {
  const { user, profile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [form, setForm] = useState({
    name: profile?.name || "",
    academicLevel: profile?.academicLevel || "inter",
  });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  async function handleSave(e) {
    e.preventDefault();
    if (!form.name.trim()) { toast.show("Name cannot be empty", "error"); return; }
    setSaving(true);
    setSuccess(false);
    try {
      await updateUserProfile(user.uid, { name: form.name.trim(), academicLevel: form.academicLevel });
      await refreshProfile();
      setSuccess(true);
      toast.show("Profile updated!", "success");
    } catch {
      toast.show("Failed to update profile.", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="main-content animate-fade-in">
      <h1 className="page-title">👤 Profile</h1>
      <p className="page-subtitle">Manage your account details.</p>

      <div className="profile-card">
        <div className="profile-avatar-large">{initials}</div>

        <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {success && (
            <div className="alert alert-success">✓ Profile updated successfully.</div>
          )}

          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Your name"
              disabled={saving}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              style={{ opacity: 0.6, cursor: "not-allowed" }}
            />
            <span className="form-hint">Email cannot be changed here.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Academic Level</label>
            <select
              value={form.academicLevel}
              onChange={(e) => setForm((f) => ({ ...f, academicLevel: e.target.value }))}
              disabled={saving}
            >
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        <div style={{ borderTop: "1px solid var(--border)", marginTop: "1.5rem", paddingTop: "1.5rem" }}>
          <div className="section-title" style={{ marginBottom: "0.75rem" }}>Account</div>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button className="btn btn-danger btn-sm" onClick={handleLogout}>
              🚪 Sign Out
            </button>
          </div>
          <p className="form-hint" style={{ marginTop: "0.75rem" }}>
            Member since {profile?.createdAt?.toDate?.()
              ? profile.createdAt.toDate().toLocaleDateString()
              : "—"}
          </p>
        </div>
      </div>
    </div>
  );
}
