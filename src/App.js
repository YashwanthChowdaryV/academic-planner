// src/App.js
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./components/Toast";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";

import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import PlannerPage from "./pages/PlannerPage";
import PlanViewPage from "./pages/PlanViewPage";
import HistoryPage from "./pages/HistoryPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import ProfilePage from "./pages/ProfilePage";
import TrackerPage from "./pages/TrackerPage";
import CalendarPage from "./pages/CalendarPage";
import TimerPage from "./pages/TimerPage";
import AchievementsPage from "./pages/AchievementsPage";
import ActivityPage from "./pages/ActivityPage";
import SessionsPage from "./pages/SessionsPage";
import GoalsPage from "./pages/GoalsPage";
import PageTransition from "./components/ui/PageTransition";

import "./styles/global.css";
import "./styles/components.css";

function AppLayout({ children }) {
  return (
    <div className="page-layout">
      <Sidebar />
      <PageTransition>{children}</PageTransition>
    </div>
  );
}

function Protected({ children }) {
  return (
    <ProtectedRoute>
      <AppLayout>{children}</AppLayout>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
            <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />

            {/* Protected — Existing */}
            <Route path="/dashboard" element={<Protected><DashboardPage /></Protected>} />
            <Route path="/planner" element={<Protected><PlannerPage /></Protected>} />
            <Route path="/plan/:planId" element={<Protected><PlanViewPage /></Protected>} />
            <Route path="/tracker" element={<Protected><TrackerPage /></Protected>} />
            <Route path="/history" element={<Protected><HistoryPage /></Protected>} />
            <Route path="/analytics" element={<Protected><AnalyticsPage /></Protected>} />
            <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />

            {/* Protected — New Features */}
            <Route path="/calendar" element={<Protected><CalendarPage /></Protected>} />
            <Route path="/timer" element={<Protected><TimerPage /></Protected>} />
            <Route path="/achievements" element={<Protected><AchievementsPage /></Protected>} />
            <Route path="/activity" element={<Protected><ActivityPage /></Protected>} />
            <Route path="/sessions" element={<Protected><SessionsPage /></Protected>} />
            <Route path="/goals" element={<Protected><GoalsPage /></Protected>} />

            {/* Default */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
