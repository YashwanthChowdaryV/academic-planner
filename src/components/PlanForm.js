// src/components/PlanForm.js
import React, { useState } from "react";

const LEVELS = [
  { value: "beginner", label: "Beginner (School)" },
  { value: "intermediate", label: "Intermediate (Inter / Pre-university)" },
  { value: "pro", label: "Advanced (BTech / Degree)" },
];

const defaultValues = {
  goal: "",
  level: "intermediate",
  time_available_days: 30,
  hours_per_day: 3,
  constraints: [],
};

export default function PlanForm({ initialValues = {}, onSubmit, loading = false }) {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [constraintInput, setConstraintInput] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.goal.trim()) e.goal = "Learning goal is required";
    if (form.goal.trim().length > 500) e.goal = "Goal must be under 500 characters";
    if (!form.time_available_days || form.time_available_days < 1) e.days = "Must be at least 1 day";
    if (!form.hours_per_day || form.hours_per_day < 1) e.hours = "Must be at least 1 hour/day";
    if (form.hours_per_day > 24) e.hours = "Cannot exceed 24 hours/day";
    return e;
  }

  function addConstraint() {
    const c = constraintInput.trim();
    if (c && !form.constraints.includes(c)) {
      setForm((f) => ({ ...f, constraints: [...f.constraints, c] }));
    }
    setConstraintInput("");
  }

  function removeConstraint(c) {
    setForm((f) => ({ ...f, constraints: f.constraints.filter((x) => x !== c) }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onSubmit({
      goal: form.goal.trim(),
      level: form.level,
      time_available_days: Number(form.time_available_days),
      hours_per_day: Number(form.hours_per_day),
      constraints: form.constraints,
    });
  }

  return (
    <form className="plan-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label" htmlFor="goal">Learning Goal *</label>
        <input
          id="goal"
          type="text"
          placeholder="e.g. Learn MERN Stack, Crack GATE Exam, Master Python DSA"
          value={form.goal}
          onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
          maxLength={500}
          disabled={loading}
          aria-describedby="goal-error"
        />
        {errors.goal && <span id="goal-error" className="form-error">{errors.goal}</span>}
      </div>

      <div className="form-group">
        <label className="form-label" htmlFor="level">Academic Level</label>
        <select
          id="level"
          value={form.level}
          onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
          disabled={loading}
        >
          {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label" htmlFor="days">Days Available *</label>
          <input
            id="days"
            type="number"
            min={1} max={365}
            value={form.time_available_days}
            onChange={(e) => setForm((f) => ({ ...f, time_available_days: e.target.value }))}
            disabled={loading}
          />
          {errors.days && <span className="form-error">{errors.days}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="hours">Hours / Day *</label>
          <input
            id="hours"
            type="number"
            min={1} max={24}
            value={form.hours_per_day}
            onChange={(e) => setForm((f) => ({ ...f, hours_per_day: e.target.value }))}
            disabled={loading}
          />
          {errors.hours && <span className="form-error">{errors.hours}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Constraints / Prior Knowledge</label>
        <div className="constraint-input-row">
          <input
            type="text"
            placeholder="e.g. I already know React basics"
            value={constraintInput}
            onChange={(e) => setConstraintInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addConstraint(); } }}
            disabled={loading}
          />
          <button type="button" className="btn btn-secondary" onClick={addConstraint} disabled={loading}>
            Add
          </button>
        </div>
        <div className="tag-list">
          {form.constraints.map((c) => (
            <div key={c} className="tag-item">
              <span>{c}</span>
              <button type="button" className="tag-remove" onClick={() => removeConstraint(c)}>×</button>
            </div>
          ))}
        </div>
        <span className="form-hint">Press Enter or click Add. These help personalize your plan.</span>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
        {loading ? "⏳ Generating Plan…" : "🚀 Generate My Plan"}
      </button>
    </form>
  );
}
