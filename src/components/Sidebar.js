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
  Clock,
  Trophy,
  Target,
} from "lucide-react";

const NAV_ITEMS = [
  {
    group: "Overview",
    color: "green",
    items: [
      {
        to: "/dashboard",
        icon: <LayoutDashboard size={17} />,
        label: "Dashboard",
      },
      {
        to: "/analytics",
        icon: <LineChart size={17} />,
        label: "Analytics",
      },
    ],
  },

  {
    group: "Planning",
    color: "orange",
    items: [
      {
        to: "/planner",
        icon: <PenTool size={17} />,
        label: "Create Plan",
      },
      {
        to: "/tracker",
        icon: <CalendarCheck size={17} />,
        label: "Daily Tracker",
      },
      {
        to: "/history",
        icon: <Library size={17} />,
        label: "My Plans",
      },
      {
        to: "/sessions",
        icon: <Clock size={17} />,
        label: "Study Sessions",
      },
      {
        to: "/goals",
        icon: <Target size={17} />,
        label: "My Goals",
      },
    ],
  },

  {
    group: "Progress",
    color: "red",
    items: [
      {
        to: "/achievements",
        icon: <Trophy size={17} />,
        label: "Achievements",
      },
    ],
  },

  {
    group: "Account",
    color: "muted",
    items: [
      {
        to: "/profile",
        icon: <Settings size={17} />,
        label: "Settings",
      },
    ],
  },
];

const LEVEL_LABELS = {
  school: "Beginner",
  beginner: "Beginner",

  inter: "Intermediate",
  intermediate: "Intermediate",

  btech: "Pro",
  pro: "Pro",
  advanced: "Pro",
};

export default function Sidebar() {
  const { user, profile, logout } = useAuth();

  const navigate = useNavigate();

  const [showOnboarding, setShowOnboarding] =
    useState(false);

  useEffect(() => {
    if (!user?.uid) return;

    getSettings(user.uid)
      .then((s) => {
        if (!s.onboarded) {
          setShowOnboarding(true);
        }
      })
      .catch(() => {});
  }, [user?.uid]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initials = profile?.name
    ? profile.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const displayLevel =
    LEVEL_LABELS[profile?.academicLevel] ||
    profile?.academicLevel ||
    "Beginner";

  return (
    <>
      {showOnboarding && (
        <OnboardingModal
          uid={user.uid}
          onClose={() =>
            setShowOnboarding(false)
          }
        />
      )}

      <aside className="sidebar">
        {/* LOGO */}
        <div className="sidebar-logo">
          <div
            className="logo-icon"
            style={{
              background: "transparent",
              boxShadow: "none",
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              overflow: "hidden",
              padding: 0,
            }}
          >
            <img
              src="https://www.projectsmart.co.uk/img/plan.png"
              alt="AcadPlan AI"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <div>
            <h2
              style={{
                color: "#dc2626",
                fontWeight: 800,
              }}
            >
              AcadPlan AI
            </h2>

            <p
              style={{
                color: "var(--text-muted)",
                fontWeight: 500,
              }}
            >
              Academic Master
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((section) => (
            <div
              key={section.group}
              className={`nav-group nav-group-${section.color}`}
            >
              <span
                className="nav-section-label"
                style={{
                  color:
                    section.color ===
                    "green"
                      ? "#16a34a"
                      : section.color ===
                        "orange"
                      ? "#ea580c"
                      : section.color ===
                        "red"
                      ? "#dc2626"
                      : "var(--text-muted)",
                }}
              >
                {section.group}
              </span>

              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({
                    isActive,
                  }) =>
                    `nav-link ${
                      isActive
                        ? "active"
                        : ""
                    }`
                  }
                  style={({ isActive }) => ({
                    background:
                      isActive
                        ? "var(--surface2)"
                        : "transparent",

                    border:
                      isActive
                        ? "1px solid var(--border)"
                        : "1px solid transparent",

                    color:
                      isActive
                        ? "#dc2626"
                        : "var(--text)",
                  })}
                >
                  <span className="nav-icon">
                    {item.icon}
                  </span>

                  <span className="nav-label">
                    {item.label}
                  </span>

                  <ChevronRight
                    className="nav-chevron"
                    size={13}
                  />
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div
              className="sidebar-avatar"
              style={{
                background:
                  "var(--surface2)",
                color: "#dc2626",
                border:
                  "1px solid var(--border)",
              }}
            >
              {initials}
            </div>

            <div className="sidebar-user-info">
              <div className="sidebar-user-name">
                {profile?.name ||
                  "Student"}
              </div>

              <div className="sidebar-user-level">
                {displayLevel}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="logout-btn"
              title="Sign Out"
              style={{
                color: "#dc2626",
                background:
                  "transparent",
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
