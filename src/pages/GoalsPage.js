// src/pages/GoalsPage.js
import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { createGoal, getGoals, updateGoal, deleteGoal } from "../services/goalService";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Target, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Circle, 
  Calendar, 
  BarChart3,
  Loader2,
  AlertCircle
} from "lucide-react";
import HeroBanner from "../components/ui/HeroBanner";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";

export default function GoalsPage() {
  const { user } = useAuth(); // useAuth returns { user, profile, logout } in this project
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: "", description: "", targetDate: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  useEffect(() => {
    if (user) {
      fetchGoals();
    }
  }, [user]);

  const fetchGoals = async () => {
    try {
      const g = await getGoals(user.uid);
      setGoals(g);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    if (!newGoal.title) return;
    setIsSubmitting(true);
    try {
      await createGoal(user.uid, newGoal);
      setNewGoal({ title: "", description: "", targetDate: "" });
      setShowAddModal(false);
      fetchGoals();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleComplete = async (goal) => {
    try {
      const updated = { completed: !goal.completed, progress: goal.completed ? 0 : 100 };
      await updateGoal(user.uid, goal.id, updated);
      setGoals(goals.map(g => g.id === goal.id ? { ...g, ...updated } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProgress = async (goalId, val) => {
    try {
      const progress = parseInt(val);
      const completed = progress === 100;
      await updateGoal(user.uid, goalId, { progress, completed });
      setGoals(goals.map(g => g.id === goalId ? { ...g, progress, completed } : g));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteGoal(user.uid, id);
      setGoals(prev => prev.filter(g => g.id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      console.error("Failed to delete goal:", err);
    }
  };

  return (
    <div className="main-content">
      <HeroBanner 
        title="My Goals"
        subtitle="Set long-term targets and track your academic milestones."
        icon={Target}
        colorClass="secondary"
        imageUrl="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      />

      <div className="action-bar" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <div className="section-title" style={{ margin: 0 }}>
          <IconBadge icon={BarChart3} size={20} colorClass="secondary" />
          Goal Overview
        </div>
        <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
          <Plus size={18} /> Add New Goal
        </button>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
            <motion.div 
              className="modal-content glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: "500px", width: "100%", padding: "2rem" }}
            >
              <h2 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
                <Target className="text-secondary" /> Add Academic Goal
              </h2>
              <form onSubmit={handleAddGoal}>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Goal Title</label>
                  <input 
                    type="text" 
                    className="form-input"
                    value={newGoal.title} 
                    onChange={e => setNewGoal({...newGoal, title: e.target.value})}
                    placeholder="e.g. Master Calculus II"
                    required
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)", color: "var(--text)" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "1rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Description</label>
                  <textarea 
                    className="form-input"
                    value={newGoal.description} 
                    onChange={e => setNewGoal({...newGoal, description: e.target.value})}
                    placeholder="What does success look like?"
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)", minHeight: "80px", color: "var(--text)" }}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: "2rem" }}>
                  <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: 600 }}>Target Date</label>
                  <input 
                    type="date" 
                    className="form-input"
                    value={newGoal.targetDate} 
                    onChange={e => setNewGoal({...newGoal, targetDate: e.target.value})}
                    style={{ width: "100%", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: "rgba(255,255,255,0.05)", color: "var(--text)" }}
                  />
                </div>
                <div style={{ display: "flex", gap: "1rem" }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={isSubmitting}>
                    {isSubmitting ? <Loader2 className="animate-spin" /> : "Save Goal"}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmId && (
          <div className="modal-overlay" onClick={() => setDeleteConfirmId(null)}>
            <motion.div 
              className="modal-content glass-card"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: "400px", width: "100%", padding: "2rem", textAlign: "center" }}
            >
              <div style={{ color: "var(--accent-red, #ef4444)", marginBottom: "1rem" }}>
                <AlertCircle size={48} style={{ margin: "0 auto" }} />
              </div>
              <h2 style={{ marginBottom: "1rem" }}>Delete Goal?</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "2rem" }}>
                This action cannot be undone. All progress for this goal will be lost.
              </p>
              <div style={{ display: "flex", gap: "1rem" }}>
                <button 
                  onClick={() => handleDelete(deleteConfirmId)} 
                  className="btn btn-primary" 
                  style={{ flex: 1, background: "var(--accent-red, #ef4444)" }}
                  id="confirm-delete-button"
                >
                  Delete
                </button>
                <button 
                  onClick={() => setDeleteConfirmId(null)} 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: "4rem" }}>
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
      ) : goals.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem", background: "var(--surface2)", borderRadius: "20px", border: "1px dashed var(--border)" }}>
          <div style={{ marginBottom: "1rem", opacity: 0.5 }}><Target size={48} /></div>
          <h3 style={{ marginBottom: "0.5rem" }}>No goals set yet</h3>
          <p style={{ color: "var(--text-muted)", marginBottom: "1.5rem" }}>Setting targets is the first step towards academic mastery.</p>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={18} /> Set your first goal
          </button>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {goals.map((goal, i) => (
            <AnimatedCard key={goal.id} delay={i * 0.05} className="goal-card glass-card h-full">
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                <div 
                  onClick={() => handleToggleComplete(goal)}
                  style={{ cursor: "pointer", display: "flex", gap: "12px", alignItems: "flex-start" }}
                >
                  {goal.completed ? 
                    <CheckCircle2 size={24} className="text-accent" style={{ flexShrink: 0 }} /> : 
                    <Circle size={24} className="text-muted" style={{ flexShrink: 0 }} />
                  }
                  <div>
                    <h3 style={{ fontSize: "1.1rem", textDecoration: goal.completed ? "line-through" : "none", color: goal.completed ? "var(--text-muted)" : "var(--text)" }}>{goal.title}</h3>
                    {goal.targetDate && (
                      <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        <Calendar size={12} /> Target: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => setDeleteConfirmId(goal.id)}
                  className="goal-delete-btn"
                  style={{ color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer", height: "fit-content" }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
              
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginBottom: "1.5rem", minHeight: "40px" }}>{goal.description}</p>
              
              <div className="goal-progress" style={{ marginTop: "auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem", fontSize: "0.8rem", fontWeight: 600 }}>
                  <span>Progress</span>
                  <span className="text-secondary">{goal.progress}%</span>
                </div>
                <div style={{ height: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "10px", overflow: "hidden", marginBottom: "1rem" }}>
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${goal.progress}%` }}
                    style={{ height: "100%", background: goal.completed ? "var(--accent)" : "var(--secondary)", borderRadius: "10px" }}
                  />
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={goal.progress} 
                  onChange={(e) => handleUpdateProgress(goal.id, e.target.value)}
                  style={{ width: "100%", cursor: "pointer" }}
                />
              </div>
            </AnimatedCard>
          ))}
        </div>
      )}
    </div>
  );
}
