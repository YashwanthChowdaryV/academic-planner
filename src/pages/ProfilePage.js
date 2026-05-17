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

      setTimeout(() => setSuccess(false), 2500);
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
        height: "100vh",
        overflow: "hidden",
        padding: "1.5rem",
        display: "flex",
        flexDirection: "column",
        background: "#f8fbff",
      }}
    >
      {/* HEADER */}
      <div
        style={{
          marginBottom: "1.2rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#1e3a8a",
              marginBottom: "4px",
            }}
          >
            <Settings size={28} />
            Account Settings
          </h1>

          <p
            style={{
              color: "#64748b",
              fontSize: "0.9rem",
            }}
          >
            Manage your profile and preferences
          </p>
        </div>

        {/* MINI PROFILE */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            background: "#ffffff",
            padding: "10px 16px",
            borderRadius: "16px",
            border: "1px solid #dbeafe",
            minWidth: "240px",
          }}
        >
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              background: "#2563eb",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "700",
              fontSize: "1.2rem",
            }}
          >
            {initials}
          </div>

          <div>
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: "700",
                color: "#0f172a",
              }}
            >
              {profile?.name || "Student"}
            </h3>

            <span
              style={{
                fontSize: "0.8rem",
                color: "#2563eb",
                fontWeight: "600",
              }}
            >
              {
                LEVELS.find((l) => l.value === form.academicLevel)?.label
              }
            </span>
          </div>
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "1.1fr 0.9fr",
          gap: "1.2rem",
          minHeight: 0,
        }}
      >
        {/* LEFT */}
        <AnimatedCard
          delay={0}
          style={{
            padding: "1.5rem",
            borderRadius: "20px",
            background: "#ffffff",
            border: "1px solid #dbeafe",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflow: "hidden",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "1.5rem",
                color: "#1e3a8a",
                fontWeight: "700",
                fontSize: "1.05rem",
              }}
            >
              <IconBadge icon={User} size={18} colorClass="primary" />
              Personal Information
            </div>

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
                    padding: "10px 12px",
                    borderRadius: "10px",
                    background: "#eff6ff",
                    color: "#2563eb",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    marginBottom: "1rem",
                  }}
                >
                  <CheckCircle size={17} />
                  Profile updated successfully
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={handleSave}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.2rem",
              }}
            >
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
                  style={{ opacity: 0.8 }}
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
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "0.78rem",
                    color: "#64748b",
                  }}
                >
                  <ShieldCheck size={14} />
                  Managed through Firebase Authentication
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

              {/* SAVE */}
              <motion.button
                type="submit"
                disabled={saving}
                whileTap={{ scale: 0.98 }}
                style={{
                  marginTop: "6px",
                  height: "48px",
                  border: "none",
                  borderRadius: "12px",
                  background: "#2563eb",
                  color: "white",
                  fontWeight: "600",
                  fontSize: "0.95rem",
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
          </div>

          {/* SIGN OUT */}
          <button
            onClick={handleLogout}
            style={{
              marginTop: "1.5rem",
              width: "100%",
              height: "52px",
              border: "none",
              borderRadius: "14px",
              background: "#1e40af",
              color: "white",
              fontSize: "0.95rem",
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              cursor: "pointer",
            }}
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </AnimatedCard>

        {/* RIGHT */}
        <AnimatedCard
          delay={0.1}
          style={{
            padding: "1.5rem",
            borderRadius: "20px",
            background: "#ffffff",
            border: "1px solid #dbeafe",
            overflow: "auto",
          }}
        >
          <SettingsForm />
        </AnimatedCard>
      </div>
    </div>
  );
}
