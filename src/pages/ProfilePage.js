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
import {
  User,
  Mail,
  GraduationCap,
  Save,
  LogOut,
  CheckCircle,
  ShieldCheck,
  Settings,
} from "lucide-react";

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
    ? form.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "?";

  async function handleSave(e) {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.show("Name required", "error");
      return;
    }

    setSaving(true);
    setSuccess(false);

    try {
      await updateUserProfile(user.uid, {
        name: form.name.trim(),
        academicLevel: form.academicLevel,
      });

      await refreshProfile();

      setSuccess(true);
      toast.show("Profile updated successfully", "success");

      setTimeout(() => setSuccess(false), 3000);
    } catch {
      toast.show("Update failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div
      className="main-content"
      style={{
        maxWidth: "1100px",
        margin: "0 auto",
        paddingBottom: "3rem",
      }}
    >
      {/* HEADER */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "2rem",
            fontWeight: "700",
            color: "#1e3a8a",
            marginBottom: "0.4rem",
          }}
        >
          <Settings size={30} />
          Account Settings
        </h1>

        <p
          style={{
            color: "#64748b",
            fontSize: "0.95rem",
          }}
        >
          Manage your profile information and preferences.
        </p>
      </div>

      {/* PROFILE CARD */}
      <AnimatedCard
        delay={0}
        style={{
          padding: "2rem",
          borderRadius: "20px",
          border: "1px solid #dbeafe",
          background: "#ffffff",
          boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            flexWrap: "wrap",
          }}
        >
          {/* AVATAR */}
          <div
            style={{
              width: "90px",
              height: "90px",
              borderRadius: "20px",
              background: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2rem",
              fontWeight: "700",
            }}
          >
            {initials}
          </div>

          {/* INFO */}
          <div style={{ flex: 1 }}>
            <h2
              style={{
                fontSize: "1.6rem",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "0.5rem",
              }}
            >
              {profile?.name || "Student"}
            </h2>

            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "8px 14px",
                borderRadius: "10px",
                background: "#dbeafe",
                color: "#1d4ed8",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {
                LEVELS.find((l) => l.value === form.academicLevel)?.label
              }
            </div>
          </div>
        </div>
      </AnimatedCard>

      {/* GRID */}
      <div
        className="profile-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* PERSONAL INFO */}
        <AnimatedCard
          delay={0.1}
          style={{
            padding: "2rem",
            borderRadius: "20px",
            border: "1px solid #dbeafe",
            background: "#ffffff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "1.8rem",
              fontSize: "1.1rem",
              fontWeight: "700",
              color: "#1e3a8a",
            }}
          >
            <IconBadge icon={User} size={18} colorClass="primary" />
            Personal Information
          </div>

          <form
            onSubmit={handleSave}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "12px 14px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontWeight: "600",
                    fontSize: "0.9rem",
                  }}
                >
                  <CheckCircle size={18} />
                  Profile updated successfully
                </motion.div>
              )}
            </AnimatePresence>

            {/* NAME */}
            <div className="form-group">
              <label className="form-label">Display Name</label>

              <div className="input-with-icon">
                <User className="input-icon" size={18} />

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      name: e.target.value,
                    }))
                  }
                  disabled={saving}
                />
              </div>
            </div>

            {/* EMAIL */}
            <div className="form-group">
              <label className="form-label">Email Address</label>

              <div
                className="input-with-icon"
                style={{
                  opacity: 0.8,
                }}
              >
                <Mail className="input-icon" size={18} />

                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                  style={{
                    cursor: "not-allowed",
                  }}
                />
              </div>

              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  marginTop: "8px",
                  fontSize: "0.8rem",
                  color: "#64748b",
                }}
              >
                <ShieldCheck size={14} />
                Managed securely through Firebase Authentication
              </span>
            </div>

            {/* LEVEL */}
            <div className="form-group">
              <label className="form-label">
                Academic Level
              </label>

              <div className="input-with-icon">
                <GraduationCap className="input-icon" size={18} />

                <select
                  value={form.academicLevel}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      academicLevel: e.target.value,
                    }))
                  }
                  disabled={saving}
                >
                  {LEVELS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* SAVE BUTTON */}
            <motion.button
              type="submit"
              disabled={saving}
              whileTap={{ scale: 0.98 }}
              style={{
                height: "50px",
                border: "none",
                borderRadius: "12px",
                background: "#2563eb",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
              }}
            >
              {saving ? (
                "Updating..."
              ) : (
                <>
                  <Save size={18} />
                  Update Profile
                </>
              )}
            </motion.button>
          </form>
        </AnimatedCard>

        {/* SETTINGS */}
        <AnimatedCard
          delay={0.2}
          style={{
            padding: "2rem",
            borderRadius: "20px",
            border: "1px solid #dbeafe",
            background: "#ffffff",
            boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
          }}
        >
          <SettingsForm />
        </AnimatedCard>
      </div>

      {/* SIGN OUT */}
      <div
        style={{
          marginTop: "2.5rem",
        }}
      >
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "58px",
            border: "none",
            borderRadius: "16px",
            background: "#1e40af",
            color: "white",
            fontSize: "1rem",
            fontWeight: "700",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "10px",
            cursor: "pointer",
          }}
        >
          <LogOut size={20} />
          Sign Out
        </button>
      </div>
    </div>
  );
}
