// src/pages/AnalyticsPage.js
import React, { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
  getUserPlans,
  getProgress,
} from "../services/planService";

import Loader from "../components/Loader";
import AnimatedCard from "../components/ui/AnimatedCard";
import IconBadge from "../components/ui/IconBadge";
import ProgressBar from "../components/ProgressBar";

import { motion } from "framer-motion";

import Heatmap from "../components/ui/Heatmap";

import {
  LineChart as LineChartIcon,
  Trophy,
  Target,
  Clock,
  Activity,
  CheckCircle,
  GraduationCap,
  Flame,
  ArrowUpRight,
  TrendingUp,
  Star,
} from "lucide-react";

import {
  getDailyLogs,
  updateUserStreak,
} from "../services/extendedService";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import {
  Line,
  Bar,
} from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler
);

const LEVEL_COLORS = {
  beginner: "#10b981",
  intermediate: "#6366f1",
  pro: "#ec4899",
};

export default function AnalyticsPage() {
  const { user } = useAuth();

  const [plans, setPlans] =
    useState([]);

  const [progressMap, setProgressMap] =
    useState({});

  const [dailyLogs, setDailyLogs] =
    useState({});

  const [currentStreak, setCurrentStreak] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [
          ps,
          logs,
          streakData,
        ] = await Promise.all([
          getUserPlans(
            user.uid,
            50
          ),
          getDailyLogs(
            user.uid
          ),
          updateUserStreak(
            user.uid
          ),
        ]);

        setPlans(ps);

        setDailyLogs(logs);

        setCurrentStreak(
          streakData.streak
        );

        const pm = {};

        await Promise.all(
          ps.map(async (p) => {
            pm[p.id] =
              await getProgress(
                user.uid,
                p.id
              );
          })
        );

        setProgressMap(pm);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user.uid]);

  if (loading)
    return (
      <div className="main-content">
        <Loader text="Crunching your learning data…" />
      </div>
    );

  const totalPlans =
    plans.length;

  const totalHours =
    plans.reduce(
      (s, p) =>
        s +
        (p.meta
          ?.estimatedTotalHours ||
          0),
      0
    );

  let totalPhases = 0;

  let totalCompleted = 0;

  const planStats =
    plans.map((p) => {
      const prog =
        progressMap[p.id]
          ?.phases || {};

      const count =
        p.meta
          ?.phaseCount || 0;

      const done =
        Object.values(
          prog
        ).filter(Boolean)
          .length;

      totalPhases += count;

      totalCompleted += done;

      return {
        ...p,
        count,
        done,
        pct:
          count > 0
            ? Math.round(
                (done /
                  count) *
                  100
              )
            : 0,
      };
    });

  const completedPlans =
    planStats.filter(
      (p) =>
        p.count > 0 &&
        p.done === p.count
    ).length;

  const avgPct =
    totalPhases > 0
      ? Math.round(
          (totalCompleted /
            totalPhases) *
            100
        )
      : 0;

  const byLevel =
    planStats.reduce(
      (acc, p) => {
        const l =
          p.input?.level ||
          "beginner";

        if (!acc[l])
          acc[l] = {
            count: 0,
            hours: 0,
            done: 0,
            phases: 0,
          };

        acc[l].count++;

        acc[l].hours +=
          p.meta
            ?.estimatedTotalHours ||
          0;

        acc[l].done += p.done;

        acc[l].phases +=
          p.count;

        return acc;
      },
      {}
    );

  const last7Days =
    Array.from(
      { length: 7 },
      (_, i) => {
        const d =
          new Date();

        d.setDate(
          d.getDate() -
            (6 - i)
        );

        return d
          .toISOString()
          .split("T")[0];
      }
    );

  const barData = {
    labels:
      last7Days.map((d) =>
        new Date(
          d
        ).toLocaleDateString(
          "en-US",
          {
            weekday:
              "short",
          }
        )
      ),

    datasets: [
      {
        label:
          "Hours Studied",

        data:
          last7Days.map(
            (d) =>
              dailyLogs[d] ||
              0
          ),

        backgroundColor:
          "#6366f1",

        borderRadius: 10,
      },
    ],
  };

  const lineData = {
    labels:
      last7Days.map((d) =>
        new Date(
          d
        ).toLocaleDateString(
          "en-US",
          {
            weekday:
              "short",
          }
        )
      ),

    datasets: [
      {
        label:
          "Momentum",

        data:
          last7Days.map(
            (d, i) =>
              Math.max(
                0,
                currentStreak -
                  (6 - i)
              )
          ),

        borderColor:
          "#f59e0b",

        backgroundColor:
          "rgba(245,158,11,0.08)",

        fill: true,

        tension: 0.4,

        pointRadius: 4,

        pointBackgroundColor:
          "#f59e0b",

        pointBorderWidth: 0,
      },
    ],
  };

  return (
    <motion.div
      className="main-content"
      initial={{
        opacity: 0,
      }}
      animate={{
        opacity: 1,
      }}
      transition={{
        duration: 0.35,
      }}
    >
      {/* TOP LEFT TITLE */}
      <div
        style={{
          marginBottom: "2.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "58px",
              height: "58px",
              borderRadius: "16px",
              background:
                "#6366f1",
              display: "flex",
              alignItems: "center",
              justifyContent:
                "center",
              color: "white",
              flexShrink: 0,
            }}
          >
            <LineChartIcon
              size={26}
            />
          </div>

          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 800,
                color:
                  "var(--text)",
                lineHeight: 1.1,
              }}
            >
              Learning Analytics
            </h1>

            <p
              style={{
                margin:
                  "6px 0 0",
                color:
                  "var(--text-muted)",
                fontSize:
                  "0.95rem",
                fontWeight: 500,
              }}
            >
              Analyze your
              study habits,
              consistency,
              and roadmap
              progress.
            </p>
          </div>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        <AnimatedCard
          delay={0.1}
          className="stat-card"
        >
          <div className="stat-icon-box">
            <Target size={20} />
          </div>

          <div className="stat-label">
            Total Plans
          </div>

          <div className="stat-value">
            {totalPlans}
          </div>

          <div className="stat-sub">
            <TrendingUp
              size={13}
            />{" "}
            Tracking active
          </div>
        </AnimatedCard>

        <AnimatedCard
          delay={0.2}
          className="stat-card"
        >
          <div className="stat-icon-box">
            <Trophy size={20} />
          </div>

          <div className="stat-label">
            Plans Finished
          </div>

          <div className="stat-value">
            {
              completedPlans
            }
          </div>

          <div className="stat-sub">
            <Star size={13} />{" "}
            Full completion
          </div>
        </AnimatedCard>

        <AnimatedCard
          delay={0.3}
          className="stat-card"
        >
          <div className="stat-icon-box">
            <Activity size={20} />
          </div>

          <div className="stat-label">
            Avg Accuracy
          </div>

          <div className="stat-value">
            {avgPct}%
          </div>

          <div className="stat-sub">
            <TrendingUp
              size={13}
            />{" "}
            Progress rate
          </div>
        </AnimatedCard>

        <AnimatedCard
          delay={0.4}
          className="stat-card"
        >
          <div className="stat-icon-box">
            <Clock size={20} />
          </div>

          <div className="stat-label">
            Time Logged
          </div>

          <div className="stat-value">
            {totalHours}h
          </div>

          <div className="stat-sub">
            <CheckCircle
              size={13}
            />{" "}
            Quality hours
          </div>
        </AnimatedCard>
      </div>

      {/* REMAINING CONTENT UNCHANGED */}
    </motion.div>
  );
}
