// src/pages/SignupPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Sparkles, User, Mail, GraduationCap, Lock, ArrowRight, Loader } from "lucide-react";

const LEVELS = [
  { value: "school", label: "School Student" },
  { value: "inter", label: "Intermediate / Pre-U" },
  { value: "btech", label: "Undergraduate" },
];

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "", academicLevel: "inter" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Name is required"); return; }
    if (!form.email) { setError("Email is required"); return; }
    if (form.password.length < 6) { setError("Password: min 6 chars"); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }

    setLoading(true);
    try {
      await signup(form.email, form.password, form.name.trim(), form.academicLevel);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use" ? "Email already exists" : "Signup failed";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-side" style={{ background: "var(--secondary)" }}>
        <div className="auth-side-content">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="logo-badge" style={{ borderColor: 'rgba(34, 197, 94, 0.4)' }}>
              <Sparkles size={24} color="white" fill="white" />
            </div>
            <h1>Your Future, Planned with AI.</h1>
            <p>Structure your academic goals and track your success with precision.</p>
          </motion.div>
          
          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-dot" />
              <span>Smart Milestone Visualization</span>
            </div>
            <div className="auth-feature">
              <div className="feature-dot" />
              <span>Personalized Study Tracks</span>
            </div>
          </div>
        </div>
        <img 
          src="https://images.unsplash.com/photo-1513258496099-48168024aec0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80" 
          alt="Productivity" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div className="auth-overlay" style={{ background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.9) 0%, rgba(34, 197, 94, 0.8) 100%)' }} />
      </div>

      <div className="auth-main">
        <motion.div 
          className="auth-card"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
        >
          <form className="auth-form" onSubmit={handleSubmit}>
            <header className="auth-header">
              <h2>Join AcadPlan</h2>
              <p>Start your AI-powered journey today</p>
            </header>

            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error">
                {error}
              </motion.div>
            )}

            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-with-icon">
                <User className="input-icon" size={18} />
                <input
                  type="text"
                  placeholder="E.g. Arnav Kumar"
                  value={form.name}
                  onChange={set("name")}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={form.email}
                  onChange={set("email")}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Academic Level</label>
              <div className="input-with-icon">
                <GraduationCap className="input-icon" size={18} />
                <select value={form.academicLevel} onChange={set("academicLevel")} disabled={loading}>
                  {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="input-with-icon">
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    placeholder="Min 6 chars"
                    value={form.password}
                    onChange={set("password")}
                    disabled={loading}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Confirm</label>
                <input
                  type="password"
                  placeholder="Repeat it"
                  value={form.confirm}
                  onChange={set("confirm")}
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button 
              type="submit" 
              className="btn btn-primary btn-lg btn-full" 
              disabled={loading}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? <Loader className="spinner" size={20} /> : <>Create Account <ArrowRight size={18} /></>}
            </motion.button>

            <div className="auth-footer">
              Already have an account? <Link to="/login">Sign In</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}

