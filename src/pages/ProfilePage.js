// src/pages/ProfilePage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { updateUserProfile } from "../services/userService";
import { useToast } from "../components/Toast";
import SettingsForm from "../components/SettingsForm";
import AnimatedCard from "../components/ui/AnimatedCard";
import { User, Mail, GraduationCap, Save, LogOut, Settings } from "lucide-react";

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

    try {
      await updateUserProfile(user.uid, {
        name: form.name.trim(),
        academicLevel: form.academicLevel,
      });

      await refreshProfile();

      toast.show("Profile updated successfully", "success");
    } catch {
      toast.show("Failed to update profile", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="main-content">
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          className="page-title"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            color: "#2563eb",
          }}
        >
          <Settings size={30} />
          Account Settings
        </h1>

        <p className="page-subtitle">
          Manage your profile and preferences
        </p>
      </div>

      {/* Profile Card */}
      <AnimatedCard
        style={{
          padding: "2rem",
          border: "1px solid #dbeafe",
          borderRadius: "20px",
          background: "#ffffff",
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

          <div>
            <h2
              style={{
                fontSize: "1.8rem",
                fontWeight: "700",
                marginBottom: "0.4rem",
              }}
            >
              {profile?.name || "Student"}
            </h2>

            <span
              style={{
                background: "#dbeafe",
                color: "#2563eb",
                padding: "6px 14px",
                borderRadius: "999px",
                fontSize: "0.9rem",
                fontWeight: "600",
              }}
            >
              {LEVELS.find((l) => l.value === form.academicLevel)?.label}
            </span>
          </div>
        </div>
      </AnimatedCard>

      {/* Main Grid */}
      <div
        className="profile-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Personal Info */}
        <AnimatedCard
          style={{
            padding: "2rem",
            border: "1px solid #dbeafe",
            borderRadius: "20px",
            background: "#ffffff",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
              color: "#2563eb",
            }}
          >
            Personal Information
          </h2>

          <form
            onSubmit={handleSave}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {/* Name */}
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

            {/* Email */}
            <div className="form-group">
              <label className="form-label">Email</label>

              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />

                <input
                  type="email"
                  value={user?.email || ""}
                  readOnly
                />
              </div>
            </div>

            {/* Academic Level */}
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

            {/* Save Button */}
            <button
              type="submit"
              className="btn btn-primary"
              disabled={saving}
              style={{
                width: "100%",
                height: "48px",
                background: "#2563eb",
                border: "none",
                borderRadius: "12px",
                color: "white",
                fontWeight: "600",
                fontSize: "1rem",
                cursor: "pointer",
              }}
            >
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save size={18} style={{ marginRight: "8px" }} />
                  Update Profile
                </>
              )}
            </button>
          </form>
        </AnimatedCard>

        {/* Settings */}
        <AnimatedCard
          style={{
            padding: "2rem",
            border: "1px solid #dbeafe",
            borderRadius: "20px",
            background: "#ffffff",
          }}
        >
          <SettingsForm />
        </AnimatedCard>
      </div>

      {/* Sign Out Button */}
      <div style={{ marginTop: "2.5rem" }}>
        <button
          onClick={handleLogout}
          style={{
            width: "100%",
            height: "56px",
            background: "#2563eb",
            border: "none",
            borderRadius: "16px",
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
