"use client";

import { motion } from "framer-motion";
import {
  buildExercisePrEntries,
  buildSessionTypeAnalytics,
  buildWeeklyVolumeBuckets,
  calculateConsistencyStreak,
  calculateNutritionHitDaysInWindow,
  calculateTrainingDaysInWindow,
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

function progressWidthClass(percentage: number): string {
  if (percentage >= 100) {
    return "w-full";
  }
  if (percentage >= 90) {
    return "w-11/12";
  }
  if (percentage >= 80) {
    return "w-10/12";
  }
  if (percentage >= 70) {
    return "w-9/12";
  }
  if (percentage >= 60) {
    return "w-8/12";
  }
  if (percentage >= 50) {
    return "w-7/12";
  }
  if (percentage >= 40) {
    return "w-6/12";
  }
  if (percentage >= 30) {
    return "w-5/12";
  }
  if (percentage >= 20) {
    return "w-4/12";
  }
  if (percentage >= 10) {
    return "w-3/12";
  }

  return "w-0";
}

function weeklyBarHeightClass(ratio: number): string {
  if (ratio >= 0.95) {
    return "h-28";
  }
  if (ratio >= 0.85) {
    return "h-24";
  }
  if (ratio >= 0.7) {
    return "h-20";
  }
  if (ratio >= 0.55) {
    return "h-16";
  }
  if (ratio >= 0.4) {
    return "h-12";
  }
  if (ratio >= 0.25) {
    return "h-10";
  }
  if (ratio > 0) {
    return "h-6";
  }

  return "h-2";
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
  const daysTrainedLast30 = calculateTrainingDaysInWindow(sessions, referenceDate, 30);
  const nutritionGoalHitDaysLast30 = calculateNutritionHitDaysInWindow(
    nutritionByDate,
    referenceDate,
    30
  );

  const sessionSplitAnalytics = buildSessionTypeAnalytics(chronSessions);
  const topExercisePrs = buildExercisePrEntries(chronSessions, 10);
  const weeklyVolumeBuckets = buildWeeklyVolumeBuckets(chronSessions, referenceDate, 8);
  const maxWeeklyVolume = Math.max(
    1,
    ...weeklyVolumeBuckets.map((bucket) => bucket.totalVolumeKg)
  );

  const heroXp = Math.round(totalVolume / 100 + streak * 40);
  const heroLevel = Math.floor(heroXp / 500) + 1;
  const xpWithinLevel = heroXp % 500;
  const xpProgress = Math.round((xpWithinLevel / 500) * 100);

  const latestWeight = bodyWeightSeries[bodyWeightSeries.length - 1] ?? 0;
  const weightDelta = latestWeight > 0 ? 75 - latestWeight : 75;

  const averageVolumePerSession =
    chronSessions.length > 0 ? Math.round(totalVolume / chronSessions.length) : 0;
  const validDurations = chronSessions
    .map((session) => session.durationMin)
    .filter((duration): duration is number => typeof duration === "number" && duration > 0);
  const averageDuration =
    validDurations.length > 0
      ? Math.round(validDurations.reduce((sum, duration) => sum + duration, 0) / validDurations.length)
      : 0;

  const trainingRatePercent = Math.round((daysTrainedLast30 / 30) * 100);
  const nutritionRatePercent = Math.round((nutritionGoalHitDaysLast30 / 30) * 100);

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
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white sm:text-xl">Hero Dashboard Analytics</h2>
          <p className="mt-1 text-sm text-slate-300">
            Full-spectrum progress tracking across weight, volume, consistency, and PRs.
          </p>
        </div>
        <div className="w-full rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-left sm:w-auto sm:text-right">
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
              className={`h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 ${progressWidthClass(
                xpProgress
              )}`}
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
          <p className="text-xs text-slate-400">Gamified strength output over time</p>
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

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Avg Session Volume</p>
          <p className="mt-1 text-lg font-semibold text-white">{averageVolumePerSession} kg</p>
          <p className="text-xs text-slate-400">Per logged training day</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">Avg Duration</p>
          <p className="mt-1 text-lg font-semibold text-white">{averageDuration || "-"} min</p>
          <p className="text-xs text-slate-400">Based on logged duration entries</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">30-Day Training Rate</p>
          <p className="mt-1 text-lg font-semibold text-white">{daysTrainedLast30} / 30 days</p>
          <p className="text-xs text-slate-400">{trainingRatePercent}% compliance</p>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-400">30-Day Nutrition Hit</p>
          <p className="mt-1 text-lg font-semibold text-white">{nutritionGoalHitDaysLast30} / 30</p>
          <p className="text-xs text-slate-400">{nutritionRatePercent}% goal alignment</p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-white">Weekly Volume (Last 8 Weeks)</p>
          <p className="text-xs text-slate-400">Training load trend with session counts</p>

          <div className="mt-3 grid h-36 grid-cols-8 items-end gap-1.5">
            {weeklyVolumeBuckets.map((bucket) => {
              const ratio = bucket.totalVolumeKg / maxWeeklyVolume;
              return (
                <div key={bucket.weekStartIso} className="flex min-w-0 flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-md bg-gradient-to-t from-cyan-500/80 to-fuchsia-400/70 ${weeklyBarHeightClass(
                      ratio
                    )}`}
                  />
                  <p className="text-[10px] font-semibold text-slate-300">{bucket.label}</p>
                  <p className="text-[10px] text-slate-500">{bucket.sessionCount}s</p>
                </div>
              );
            })}
          </div>

          <div className="mt-2 grid gap-1 text-[11px] text-slate-400 sm:grid-cols-2">
            {weeklyVolumeBuckets.map((bucket) => (
              <p key={`${bucket.weekStartIso}-volume`}>
                {bucket.label}: {bucket.totalVolumeKg} kg
              </p>
            ))}
          </div>
        </article>

        <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
          <p className="text-sm font-semibold text-white">Split Performance Breakdown</p>
          <p className="text-xs text-slate-400">Volume and frequency by workout split</p>

          {sessionSplitAnalytics.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-400">
              Save sessions to unlock split analytics.
            </p>
          ) : (
            <>
              <div className="mt-3 space-y-2 lg:hidden">
                {sessionSplitAnalytics.map((split) => (
                  <article key={`${split.sessionKey}-mobile`} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                    <p className="break-words text-xs font-semibold text-white">{split.sessionTitle}</p>
                    <div className="mt-1 grid grid-cols-2 gap-2 text-[11px] text-slate-300">
                      <p>Logs: {split.sessions}</p>
                      <p>Vol: {split.totalVolumeKg} kg</p>
                      <p>Avg: {split.averageVolumeKg} kg</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-3 hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[320px] border-collapse text-xs">
                  <thead>
                    <tr className="text-left uppercase tracking-wide text-slate-500">
                      <th className="border-b border-slate-800 pb-2">Split</th>
                      <th className="border-b border-slate-800 pb-2">Logs</th>
                      <th className="border-b border-slate-800 pb-2">Volume</th>
                      <th className="border-b border-slate-800 pb-2">Avg</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionSplitAnalytics.map((split) => (
                      <tr key={split.sessionKey} className="text-slate-200">
                        <td className="border-b border-slate-900 py-2">{split.sessionTitle}</td>
                        <td className="border-b border-slate-900 py-2">{split.sessions}</td>
                        <td className="border-b border-slate-900 py-2">{split.totalVolumeKg} kg</td>
                        <td className="border-b border-slate-900 py-2">{split.averageVolumeKg} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </article>
      </div>

      <article className="mt-5 rounded-xl border border-slate-800 bg-slate-950/70 p-4">
        <p className="text-sm font-semibold text-white">Top Exercise PRs</p>
        <p className="text-xs text-slate-400">Highest tracked weight per movement</p>

        {topExercisePrs.length === 0 ? (
          <p className="mt-3 rounded-lg border border-dashed border-slate-700 p-3 text-xs text-slate-400">
            Add weighted sets to populate personal records.
          </p>
        ) : (
          <>
            <div className="mt-3 space-y-2 lg:hidden">
              {topExercisePrs.map((entry) => (
                <article key={`${entry.exerciseId}-mobile`} className="rounded-lg border border-slate-800 bg-slate-900/60 p-3">
                  <p className="break-words text-xs font-semibold text-white">{entry.exerciseName}</p>
                  <div className="mt-1 flex flex-wrap gap-2 text-[11px] text-slate-300">
                    <span>{entry.bestWeightKg} kg</span>
                    <span>{entry.sourceDate}</span>
                    <span className="break-words">{entry.sessionTitle}</span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-3 hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[520px] border-collapse text-xs">
                <thead>
                  <tr className="text-left uppercase tracking-wide text-slate-500">
                    <th className="border-b border-slate-800 pb-2">Exercise</th>
                    <th className="border-b border-slate-800 pb-2">Best Weight</th>
                    <th className="border-b border-slate-800 pb-2">Date</th>
                    <th className="border-b border-slate-800 pb-2">Session</th>
                  </tr>
                </thead>
                <tbody>
                  {topExercisePrs.map((entry) => (
                    <tr key={entry.exerciseId} className="text-slate-200">
                      <td className="border-b border-slate-900 py-2">{entry.exerciseName}</td>
                      <td className="border-b border-slate-900 py-2">{entry.bestWeightKg} kg</td>
                      <td className="border-b border-slate-900 py-2">{entry.sourceDate}</td>
                      <td className="border-b border-slate-900 py-2">{entry.sessionTitle}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </article>
    </motion.section>
  );
}
