// src/components/Sidebar.js
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getSettings } from "../services/extendedService";
import OnboardingModal from "./ui/OnboardingModal";
import { 
  LayoutDashboard, 
  PenTool, 
  Library, 
  LineChart, 
  Settings, 
  LogOut, 
  CalendarCheck,
  ChevronRight,
  Sparkles,
  Calendar,
  Timer,
  Clock,
  Trophy,
  Activity,
  Target,
} from "lucide-react";

const NAV_ITEMS = [
  { group: "Overview", color: "blue", items: [
    { to: "/dashboard", icon: <LayoutDashboard size={17} />, label: "Dashboard" },
    { to: "/analytics", icon: <LineChart size={17} />, label: "Analytics" },
    { to: "/activity", icon: <Activity size={17} />, label: "Activity Feed" },
  ]},
  { group: "Planning", color: "green", items: [
    { to: "/planner", icon: <PenTool size={17} />, label: "Create Plan" },
    { to: "/tracker", icon: <CalendarCheck size={17} />, label: "Daily Tracker" },
    { to: "/history", icon: <Library size={17} />, label: "My Plans" },
    { to: "/calendar", icon: <Calendar size={17} />, label: "Calendar" },
    { to: "/timer", icon: <Timer size={17} />, label: "Study Timer" },
    { to: "/sessions", icon: <Clock size={17} />, label: "Study Sessions" },
    { to: "/goals", icon: <Target size={17} />, label: "My Goals" },
  ]},
  { group: "Progress", color: "amber", items: [
    { to: "/achievements", icon: <Trophy size={17} />, label: "Achievements" },
  ]},
  { group: "Account", color: "muted", items: [
    { to: "/profile", icon: <Settings size={17} />, label: "Settings" },
  ]}
];

const LEVEL_LABELS = {
  school: "Beginner", beginner: "Beginner",
  inter: "Intermediate", intermediate: "Intermediate",
  btech: "Pro", pro: "Pro", advanced: "Pro",
};

export default function Sidebar() {
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (!user?.uid) return;
    getSettings(user.uid).then(s => {
      if (!s.onboarded) setShowOnboarding(true);
    }).catch(() => {});
  }, [user?.uid]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = profile?.name
    ? profile.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "??";

  const displayLevel = LEVEL_LABELS[profile?.academicLevel] || profile?.academicLevel || "Beginner";

  return (
    <>
      {showOnboarding && (
        <OnboardingModal uid={user.uid} onClose={() => setShowOnboarding(false)} />
      )}

      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Sparkles size={18} color="white" fill="white" />
          </div>
          <div>
            <h2>AcadPlan AI</h2>
            <p>Academic Master</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div key={section.group} className={`nav-group nav-group-${section.color}`}>
              <span className="nav-section-label">{section.group}</span>
              {section.items.map((item) => (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                  <ChevronRight className="nav-chevron" size={13} />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{profile?.name || "Student"}</div>
              <div className="sidebar-user-level">{displayLevel}</div>
            </div>
            <button onClick={handleLogout} className="logout-btn" title="Sign Out">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
