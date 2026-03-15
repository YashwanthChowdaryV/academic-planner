// src/pages/LoginPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Loader } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.code === "auth/invalid-credential" || err.code === "auth/wrong-password"
        ? "Invalid email or password."
        : "Login failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      {/* ── Left: Image + Branding ── */}
      <div className="auth-left">
        <img
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
          alt="Focused study"
        />
        <div className="auth-left-overlay" />
        <div className="auth-left-content">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="auth-brand-logo">
              <Sparkles size={22} color="white" fill="white" />
            </div>
            <h1>Empower Your Learning Journey.</h1>
            <p>Join thousands of students using AI to master their academic roadmap.</p>
          </motion.div>

          <motion.div
            className="auth-features"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="auth-feature">
              <div className="feature-dot" />
              <span>AI-Generated Study Plans</span>
            </div>
            <div className="auth-feature">
              <div className="feature-dot" />
              <span>Dynamic Progress Tracking</span>
            </div>
            <div className="auth-feature">
              <div className="feature-dot" />
              <span>Smart Streak & Analytics</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Right: Form ── */}
      <div className="auth-right">
        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="auth-header">
            <h2>Welcome Back</h2>
            <p>Sign in to your AcadPlan account</p>
          </header>

          <form className="auth-form" onSubmit={handleSubmit}>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="alert alert-error">
                {error}
              </motion.div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-with-icon">
                <Mail className="input-icon" size={18} />
                <input
                  type="email"
                  placeholder="name@university.edu"
                  value={form.email}
                  onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-with-icon">
                <Lock className="input-icon" size={18} />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={(e) => setForm(f => ({ ...f, password: e.target.value }))}
                  disabled={loading}
                />
              </div>
            </div>

            <motion.button
              type="submit"
              className="btn btn-primary btn-lg btn-full"
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{ marginTop: "0.5rem" }}
            >
              {loading ? <Loader className="spinner" size={20} /> : <>Sign In <ArrowRight size={18} /></>}
            </motion.button>

            <div className="auth-footer">
              Don't have an account? <Link to="/signup">Create one for free</Link>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
