import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Target, Calendar, Clock, BookOpen, Layers, Tag as TagIcon, Loader, Sparkles } from "lucide-react";
import TagSelector from "./TagSelector";

const LEVELS = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "pro", label: "Advanced / Pro" },
];

const defaultValues = {
  goal: "",
  level: "intermediate",
  time_available_days: 30,
  hours_per_day: 3,
  constraints: [],
  tags: [],
};

export default function PlanForm({ initialValues = {}, onSubmit, loading = false }) {
  const [form, setForm] = useState({ ...defaultValues, ...initialValues });
  const [constraintInput, setConstraintInput] = useState("");
  const [errors, setErrors] = useState({});

  function validate() {
    const e = {};
    if (!form.goal.trim()) e.goal = "What are you trying to learn?";
    if (!form.time_available_days || form.time_available_days < 1) e.days = "Need at least 1 day";
    if (!form.hours_per_day || form.hours_per_day < 1) e.hours = "Min 1 hour required";
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
      tags: form.tags,
    });
  }

  return (
    <form className="plan-form" onSubmit={handleSubmit} noValidate>
      <div className="form-group">
        <label className="form-label">Learning Objective</label>
        <div className="input-with-icon">
          <Target className="input-icon" size={18} />
          <input
            type="text"
            placeholder="e.g. Master React and build a SaaS app"
            value={form.goal}
            onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
            disabled={loading}
          />
        </div>
        {errors.goal && <span className="form-error">{errors.goal}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Knowledge Depth</label>
        <div className="input-with-icon">
          <Layers className="input-icon" size={18} />
          <select value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))} disabled={loading}>
            {LEVELS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Duration (Days)</label>
          <div className="input-with-icon">
            <Calendar className="input-icon" size={18} />
            <input
              type="number"
              value={form.time_available_days}
              onChange={(e) => setForm((f) => ({ ...f, time_available_days: e.target.value }))}
              disabled={loading}
            />
          </div>
          {errors.days && <span className="form-error">{errors.days}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Time / Day (Hours)</label>
          <div className="input-with-icon">
            <Clock className="input-icon" size={18} />
            <input
              type="number"
              value={form.hours_per_day}
              onChange={(e) => setForm((f) => ({ ...f, hours_per_day: e.target.value }))}
              disabled={loading}
            />
          </div>
          {errors.hours && <span className="form-error">{errors.hours}</span>}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Prior Knowledge / Constraints</label>
        <div className="input-with-icon" style={{ paddingRight: '8px' }}>
          <BookOpen className="input-icon" size={18} />
          <input
            type="text"
            placeholder="e.g. I already skip basic HTML"
            value={constraintInput}
            onChange={(e) => setConstraintInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addConstraint())}
            disabled={loading}
          />
          <button type="button" className="btn btn-secondary btn-sm" onClick={addConstraint} disabled={loading} style={{ padding: '0 12px', height: '36px' }}>
            <Plus size={18} />
          </button>
        </div>
        
        <div className="tag-list" style={{ marginTop: "12px" }}>
          <AnimatePresence>
            {form.constraints.map((c) => (
              <motion.div 
                key={c} 
                className="badge badge-indigo"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                style={{ display: 'flex', alignItems: 'center', gap: '6px', borderRadius: '8px' }}
              >
                {c}
                <X size={14} className="cursor-pointer hover:opacity-70" onClick={() => removeConstraint(c)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Categorization Tags</label>
        <div style={{ background: "var(--surface2)", padding: "16px", borderRadius: "16px", border: "1px solid var(--border)" }}>
          <TagSelector 
            tags={form.tags} 
            onChange={(newTags) => setForm(f => ({ ...f, tags: newTags }))} 
          />
        </div>
      </div>

      <motion.button 
        type="submit" 
        className="btn btn-primary btn-lg btn-full" 
        disabled={loading}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? <Loader className="spinner" size={20} /> : <><Sparkles size={18} /> Generate Learning Roadmap</>}
      </motion.button>
    </form>
  );
}

