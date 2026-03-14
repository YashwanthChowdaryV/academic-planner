// src/pages/SignupPage.js
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LEVELS = [
  { value: "school", label: "School (High School)" },
  { value: "inter", label: "Intermediate / Pre-university" },
  { value: "btech", label: "BTech / Undergraduate Engineering" },
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
    if (!form.name.trim()) { setError("Please enter your name."); return; }
    if (!form.email) { setError("Please enter your email."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await signup(form.email, form.password, form.name.trim(), form.academicLevel);
      navigate("/dashboard");
    } catch (err) {
      const msg = err.code === "auth/email-already-in-use"
        ? "An account with this email already exists."
        : err.code === "auth/invalid-email"
        ? "Please enter a valid email address."
        : err.code === "auth/weak-password"
        ? "Password is too weak. Use at least 6 characters."
        : "Signup failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🎓 AcadPlan AI</h1>
          <p>Start your AI-powered learning journey</p>
        </div>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "1.4rem", marginBottom: "0.25rem" }}>
            Create your account
          </h2>
          <p className="text-muted text-sm" style={{ marginBottom: "0.5rem" }}>
            Free forever. No credit card required.
          </p>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name" type="text" placeholder="Riya Sharma"
              value={form.name} onChange={set("name")} disabled={loading} autoFocus autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="su-email">Email</label>
            <input
              id="su-email" type="email" placeholder="you@example.com"
              value={form.email} onChange={set("email")} disabled={loading} autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="level">Academic Level</label>
            <select id="level" value={form.academicLevel} onChange={set("academicLevel")} disabled={loading}>
              {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label" htmlFor="pw">Password</label>
              <input
                id="pw" type="password" placeholder="Min. 6 characters"
                value={form.password} onChange={set("password")} disabled={loading} autoComplete="new-password"
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm" type="password" placeholder="Repeat password"
                value={form.confirm} onChange={set("confirm")} disabled={loading} autoComplete="new-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-lg btn-full" disabled={loading}>
            {loading ? "Creating account…" : "Create Account →"}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{" "}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
