"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import { HeroAnalytics } from "@/components/dashboard/hero-analytics";
import { NutritionPanel } from "@/components/dashboard/nutrition-panel";
import { WeeklyCycle } from "@/components/dashboard/weekly-cycle";
import { WorkoutLogger } from "@/components/workout/workout-logger";
import {
  addDays,
  createDailyNutritionTemplate,
  getSagaPhase,
  getTemplateForDate,
  sortedSessionsByDate,
  todayIsoDate,
  type DailyNutritionLog,
  type WorkoutSessionLog,
} from "@/lib/heroes-logbook";

const SESSIONS_STORAGE_KEY = "hero-logbook-sessions-v2";
const NUTRITION_STORAGE_KEY = "hero-logbook-nutrition-v2";

type ToastState = {
  kind: "success" | "level-up";
  message: string;
} | null;

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<string>(() => todayIsoDate());
  const [sessions, setSessions] = useState<WorkoutSessionLog[]>([]);
  const [nutritionByDate, setNutritionByDate] = useState<
    Record<string, DailyNutritionLog>
  >({});
  const [toast, setToast] = useState<ToastState>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    try {
      const rawSessions = window.localStorage.getItem(SESSIONS_STORAGE_KEY);
      if (rawSessions) {
        const parsed = JSON.parse(rawSessions) as WorkoutSessionLog[];
        if (Array.isArray(parsed)) {
          setSessions(parsed);
        }
      }

      const rawNutrition = window.localStorage.getItem(NUTRITION_STORAGE_KEY);
      if (rawNutrition) {
        const parsed = JSON.parse(rawNutrition) as Record<string, DailyNutritionLog>;
        if (parsed && typeof parsed === "object") {
          setNutritionByDate(parsed);
        }
      }
    } catch {
      setToast({
        kind: "success",
        message: "Started with a clean local cache.",
      });
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
    window.localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(nutritionByDate));
  }, [isHydrated, nutritionByDate, sessions]);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setToast(null);
    }, 2800);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [toast]);

  const activeTemplate = useMemo(() => {
    return getTemplateForDate(selectedDate);
  }, [selectedDate]);

  const activeSaga = useMemo(() => {
    return getSagaPhase(selectedDate);
  }, [selectedDate]);

  const dailyNutrition = useMemo(() => {
    return nutritionByDate[selectedDate] ?? createDailyNutritionTemplate(selectedDate);
  }, [nutritionByDate, selectedDate]);

  const recentSessions = useMemo(() => {
    return sortedSessionsByDate(sessions, "desc").slice(0, 6);
  }, [sessions]);

  const totalSessions = sessions.length;
  const weekStartDate = addDays(selectedDate, -6);
  const sessionsInLast7Days = sessions.filter(
    (session) => session.date >= weekStartDate && session.date <= selectedDate
  ).length;

  function handleSaveSession(payload: {
    session: WorkoutSessionLog;
    newPrCount: number;
  }) {
    setSessions((previous) => {
      const withoutExisting = previous.filter((entry) => {
        return !(
          entry.date === payload.session.date &&
          entry.sessionKey === payload.session.sessionKey
        );
      });

      return [payload.session, ...withoutExisting];
    });

    if (payload.newPrCount > 0) {
      setToast({
        kind: "level-up",
        message: `Level up: ${payload.newPrCount} progressive overload target${
          payload.newPrCount > 1 ? "s" : ""
        } beaten.`,
      });
      return;
    }

    setToast({ kind: "success", message: "Workout entry saved." });
  }

  function handleNutritionChange(next: DailyNutritionLog) {
    setNutritionByDate((previous) => ({
      ...previous,
      [selectedDate]: next,
    }));
  }

  return (
    <main className="min-h-screen px-4 py-8 text-slate-100 sm:px-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`rounded-3xl border bg-gradient-to-br p-6 shadow-xl shadow-black/30 sm:p-8 ${activeSaga.panelClasses}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                Hero&apos;s Logbook
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-5xl">
                12-Month A/B PPL Operating System
              </h1>
              <p className="mt-3 text-sm leading-7 text-slate-200">
                Built for the April 6, 2026 to April 6, 2027 arc. Full-body mode is now backup
                only. Every session is structured to drive progressive overload toward 75kg.
              </p>
            </div>

            <div className="w-full max-w-xs space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-300">
                Active Date
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
                />
              </label>
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Today Split</p>
                  <p className="text-sm font-semibold text-white">{activeTemplate.title}</p>
                </div>
                <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-2">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Current Saga</p>
                  <p className="text-sm font-semibold text-white">{activeSaga.label}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-300">Total Logged Sessions</p>
              <p className="mt-1 text-2xl font-semibold text-white">{totalSessions}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-300">Last 7 Days</p>
              <p className="mt-1 text-2xl font-semibold text-white">{sessionsInLast7Days}</p>
            </div>
            <div className="rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-xs uppercase tracking-wide text-slate-300">Phase Objective</p>
              <p className="mt-1 text-sm font-semibold text-white">{activeSaga.subtitle}</p>
            </div>
          </div>
        </motion.header>

        <WeeklyCycle selectedDate={selectedDate} onSelectDate={setSelectedDate} />

        <section className="grid gap-6 xl:grid-cols-[1.25fr_1fr]">
          <WorkoutLogger
            key={`${selectedDate}-${activeTemplate.key}`}
            selectedDate={selectedDate}
            template={activeTemplate}
            sessions={sessions}
            onSaveSession={handleSaveSession}
          />
          <NutritionPanel nutrition={dailyNutrition} onChange={handleNutritionChange} />
        </section>

        <HeroAnalytics
          sessions={sessions}
          nutritionByDate={nutritionByDate}
          referenceDate={selectedDate}
        />

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-xl font-semibold text-white">Recent Workout Logs</h2>
          <p className="mt-1 text-sm text-slate-300">
            Quick verification that each A/B day is being captured consistently.
          </p>

          {recentSessions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
              {isHydrated
                ? "No workouts logged yet. Start with today's session to initialize your tracking history."
                : "Loading local records..."}
            </div>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                    <th className="border-b border-slate-800 pb-2">Date</th>
                    <th className="border-b border-slate-800 pb-2">Session</th>
                    <th className="border-b border-slate-800 pb-2">Bodyweight</th>
                    <th className="border-b border-slate-800 pb-2">Volume</th>
                    <th className="border-b border-slate-800 pb-2">Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSessions.map((session) => (
                    <tr key={session.id} className="text-slate-200">
                      <td className="border-b border-slate-900 py-2">{session.date}</td>
                      <td className="border-b border-slate-900 py-2">{session.sessionTitle}</td>
                      <td className="border-b border-slate-900 py-2">
                        {session.bodyWeightKg ?? "-"} kg
                      </td>
                      <td className="border-b border-slate-900 py-2">{session.totalVolumeKg} kg</td>
                      <td className="border-b border-slate-900 py-2">
                        {session.durationMin ?? "-"} min
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {toast ? (
          <motion.div
            key={toast.message}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className={`fixed right-4 bottom-4 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg ${
              toast.kind === "level-up"
                ? "border-fuchsia-400/50 bg-fuchsia-500/20 text-fuchsia-100"
                : "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
            }`}
          >
            {toast.message}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
