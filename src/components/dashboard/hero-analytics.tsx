"use client";

import { motion } from "framer-motion";
import {
  calculateConsistencyStreak,
  parseIsoDate,
  sortedSessionsByDate,
  type DailyNutritionLog,
  type WorkoutSessionLog,
} from "@/lib/heroes-logbook";

interface HeroAnalyticsProps {
  sessions: WorkoutSessionLog[];
  nutritionByDate: Record<string, DailyNutritionLog>;
  referenceDate: string;
}

type ChartPoint = {
  x: number;
  y: number;
};

function buildLinePath(points: ChartPoint[]): string {
  if (points.length === 0) {
    return "";
  }

  return points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`)
    .join(" ");
}

function normalizeSeries(values: number[], width: number, height: number): ChartPoint[] {
  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    return [{ x: width / 2, y: height / 2 }];
  }

  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(1, maxValue - minValue);

  return values.map((value, index) => {
    const x = (index / (values.length - 1)) * width;
    const y = height - ((value - minValue) / range) * height;
    return { x, y };
  });
}

export function HeroAnalytics({
  sessions,
  nutritionByDate,
  referenceDate,
}: HeroAnalyticsProps) {
  const chronSessions = sortedSessionsByDate(sessions, "asc");

  const weightByDate = new Map<string, number>();
  for (const session of chronSessions) {
    if (session.bodyWeightKg !== null && session.bodyWeightKg > 0) {
      weightByDate.set(session.date, session.bodyWeightKg);
    }
  }

  const bodyWeightSeries = [...weightByDate.values()];
  const bodyWeightPoints = normalizeSeries(bodyWeightSeries, 320, 120);

  const volumeSeries = chronSessions.reduce<number[]>((series, session) => {
    const previousTotal = series[series.length - 1] ?? 0;
    return [...series, previousTotal + session.totalVolumeKg];
  }, []);
  const volumePoints = normalizeSeries(volumeSeries, 320, 120);

  const totalVolume = chronSessions.reduce(
    (sum, session) => sum + session.totalVolumeKg,
    0
  );

  const streak = calculateConsistencyStreak(sessions, nutritionByDate, referenceDate);

  const heroXp = Math.round(totalVolume / 100 + streak * 40);
  const heroLevel = Math.floor(heroXp / 500) + 1;
  const xpWithinLevel = heroXp % 500;
  const xpProgress = Math.round((xpWithinLevel / 500) * 100);

  const latestWeight = bodyWeightSeries[bodyWeightSeries.length - 1] ?? 0;
  const weightDelta = latestWeight > 0 ? 75 - latestWeight : 75;

  const lastWorkoutDate =
    chronSessions.length > 0
      ? parseIsoDate(chronSessions[chronSessions.length - 1].date).toLocaleDateString(undefined, {
          month: "short",
          day: "numeric",
          year: "numeric",
          timeZone: "UTC",
        })
      : "No entries yet";

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">Hero Dashboard Analytics</h2>
          <p className="mt-1 text-sm text-slate-300">
            Bodyweight trajectory, cumulative volume, and consistency streaks.
          </p>
        </div>
        <div className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-wide text-emerald-200">Current Level</p>
          <p className="text-xl font-semibold text-emerald-100">Lv. {heroLevel}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Current Weight</p>
          <p className="mt-1 text-xl font-semibold text-white">{latestWeight || "-"} kg</p>
          <p className="text-xs text-slate-400">{weightDelta.toFixed(1)} kg to 75kg goal</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Total Volume</p>
          <p className="mt-1 text-xl font-semibold text-white">{Math.round(totalVolume)} kg</p>
          <p className="text-xs text-slate-400">Across {sessions.length} sessions</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Streak</p>
          <p className="mt-1 text-xl font-semibold text-white">{streak} days</p>
          <p className="text-xs text-slate-400">Gym + nutrition goals hit</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Last Session</p>
          <p className="mt-1 text-sm font-semibold text-white">{lastWorkoutDate}</p>
          <p className="mt-2 text-xs text-slate-400">XP {xpWithinLevel} / 500</p>
          <div className="mt-1 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-white">Body Weight Over Time</p>
          <p className="text-xs text-slate-400">Target line: 75kg</p>
          <svg className="mt-3 w-full" viewBox="0 0 340 140" preserveAspectRatio="none">
            <line x1="0" x2="340" y1="20" y2="20" stroke="rgba(94,234,212,0.45)" strokeDasharray="4 4" />
            <path
              d={buildLinePath(bodyWeightPoints)}
              fill="none"
              stroke="url(#weightGradient)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#22d3ee" />
                <stop offset="100%" stopColor="#f472b6" />
              </linearGradient>
            </defs>
          </svg>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-white">Cumulative Volume Curve</p>
          <p className="text-xs text-slate-400">Gamified Goku-strength tracker</p>
          <svg className="mt-3 w-full" viewBox="0 0 340 140" preserveAspectRatio="none">
            <path
              d={buildLinePath(volumePoints)}
              fill="none"
              stroke="url(#volumeGradient)"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <defs>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#a78bfa" />
                <stop offset="100%" stopColor="#22d3ee" />
              </linearGradient>
            </defs>
          </svg>
        </article>
      </div>
    </motion.section>
  );
}
