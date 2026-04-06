"use client";

import { AnimatePresence, motion } from "framer-motion";
import { type ChangeEvent, useEffect, useMemo, useState } from "react";
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

type BackupPayload = {
  exportedAt: string;
  version: number;
  sessions: WorkoutSessionLog[];
  nutritionByDate: Record<string, DailyNutritionLog>;
};

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

  const fullHistorySessions = useMemo(() => {
    return sortedSessionsByDate(sessions, "desc");
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
    setSessions((previous) => [payload.session, ...previous]);

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

  function downloadBackup() {
    const payload: BackupPayload = {
      exportedAt: new Date().toISOString(),
      version: 1,
      sessions,
      nutritionByDate,
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json;charset=utf-8",
    });

    const link = document.createElement("a");
    const downloadUrl = URL.createObjectURL(blob);
    link.href = downloadUrl;
    link.download = `hero-logbook-backup-${todayIsoDate()}.json`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);

    setToast({
      kind: "success",
      message: "Backup exported successfully.",
    });
  }

  function replaceAllData() {
    const hasAnyData = sessions.length > 0 || Object.keys(nutritionByDate).length > 0;
    if (!hasAnyData) {
      setToast({
        kind: "success",
        message: "No local data to clear.",
      });
      return;
    }

    const confirmed = window.confirm(
      "Clear all local workout and nutrition logs from this browser? This cannot be undone unless you have a backup."
    );

    if (!confirmed) {
      return;
    }

    setSessions([]);
    setNutritionByDate({});
    setToast({
      kind: "success",
      message: "All local logs cleared.",
    });
  }

  async function importBackupFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const raw = await file.text();
      const parsed = JSON.parse(raw) as BackupPayload;

      if (!parsed || typeof parsed !== "object") {
        throw new Error("Invalid backup file.");
      }

      const importedSessions = Array.isArray(parsed.sessions) ? parsed.sessions : [];
      const importedNutrition =
        parsed.nutritionByDate && typeof parsed.nutritionByDate === "object"
          ? parsed.nutritionByDate
          : {};

      setSessions(importedSessions);
      setNutritionByDate(importedNutrition);
      setToast({
        kind: "success",
        message: `Backup imported (${importedSessions.length} sessions).`,
      });
    } catch {
      setToast({
        kind: "success",
        message: "Backup import failed. Please choose a valid Hero's Logbook backup file.",
      });
    }
  }

  return (
    <main className="min-h-screen px-3 py-6 text-slate-100 sm:px-8 sm:py-8 lg:px-10">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <motion.header
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className={`rounded-3xl border bg-gradient-to-br p-4 shadow-xl shadow-black/30 sm:p-8 ${activeSaga.panelClasses}`}
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-slate-300">
                Hero&apos;s Logbook
              </p>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-5xl">
                12-Month A/B PPL Operating System
              </h1>
              <p className="mt-3 text-sm leading-6 text-slate-200 sm:leading-7">
                Built for the April 6, 2026 to April 6, 2027 arc. Full-body mode is now backup
                only. Every session is structured to drive progressive overload toward 75kg.
              </p>
            </div>

            <div className="w-full max-w-sm space-y-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:max-w-xs">
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={downloadBackup}
              className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
            >
              Export backup
            </button>

            <label className="cursor-pointer rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500">
              Import backup
              <input
                type="file"
                accept="application/json"
                className="hidden"
                onChange={importBackupFile}
              />
            </label>

            <button
              type="button"
              onClick={replaceAllData}
              className="rounded-lg border border-rose-500/40 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-100 transition hover:bg-rose-500/20"
            >
              Clear all local logs
            </button>

            <p className="text-xs text-slate-400">
              Worklogs are persisted locally in this browser and can be exported/imported.
            </p>
          </div>

          {recentSessions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
              {isHydrated
                ? "No workouts logged yet. Start with today's session to initialize your tracking history."
                : "Loading local records..."}
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-3 md:hidden">
                {recentSessions.map((session) => (
                  <article key={`${session.id}-recent-card`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{session.date}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{session.sessionTitle}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <p>Bodyweight: {session.bodyWeightKg ?? "-"} kg</p>
                      <p>Volume: {session.totalVolumeKg} kg</p>
                      <p>Duration: {session.durationMin ?? "-"} min</p>
                    </div>
                  </article>
                ))}
              </div>

              <div className="mt-4 hidden overflow-x-auto md:block">
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
            </>
          )}
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
          <h2 className="text-xl font-semibold text-white">Complete Worklog History</h2>
          <p className="mt-1 text-sm text-slate-300">
            Every logged session is kept here for long-term review and analytics depth.
          </p>

          {fullHistorySessions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/60 p-4 text-sm text-slate-300">
              Full history is empty until you save your first workout.
            </div>
          ) : (
            <>
              <div className="mt-4 space-y-3 md:hidden">
                {fullHistorySessions.map((session) => (
                  <article key={`${session.id}-history-card`} className="rounded-xl border border-slate-800 bg-slate-950/60 p-3">
                    <p className="text-xs uppercase tracking-wide text-slate-400">{session.date}</p>
                    <p className="mt-1 text-sm font-semibold text-white">{session.sessionTitle}</p>
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
                      <p>Bodyweight: {session.bodyWeightKg ?? "-"} kg</p>
                      <p>Volume: {session.totalVolumeKg} kg</p>
                      <p>Duration: {session.durationMin ?? "-"} min</p>
                    </div>
                    <ul className="mt-2 space-y-1 text-xs text-slate-300">
                      {session.exerciseLogs.map((exercise) => (
                        <li key={`${session.id}-${exercise.exerciseId}-card`}>
                          {exercise.exerciseName}: {exercise.sets.length} sets
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-xs text-slate-400">{session.notes || "-"}</p>
                  </article>
                ))}
              </div>

              <div className="mt-4 hidden overflow-x-auto md:block">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                      <th className="border-b border-slate-800 pb-2">Date</th>
                      <th className="border-b border-slate-800 pb-2">Split</th>
                      <th className="border-b border-slate-800 pb-2">Bodyweight</th>
                      <th className="border-b border-slate-800 pb-2">Volume</th>
                      <th className="border-b border-slate-800 pb-2">Duration</th>
                      <th className="border-b border-slate-800 pb-2">Exercises</th>
                      <th className="border-b border-slate-800 pb-2">Notes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fullHistorySessions.map((session) => (
                      <tr key={session.id} className="text-slate-200 align-top">
                        <td className="border-b border-slate-900 py-2">{session.date}</td>
                        <td className="border-b border-slate-900 py-2">{session.sessionTitle}</td>
                        <td className="border-b border-slate-900 py-2">
                          {session.bodyWeightKg ?? "-"} kg
                        </td>
                        <td className="border-b border-slate-900 py-2">{session.totalVolumeKg} kg</td>
                        <td className="border-b border-slate-900 py-2">
                          {session.durationMin ?? "-"} min
                        </td>
                        <td className="border-b border-slate-900 py-2">
                          <ul className="space-y-1 text-xs">
                            {session.exerciseLogs.map((exercise) => (
                              <li key={`${session.id}-${exercise.exerciseId}`}>
                                {exercise.exerciseName}: {exercise.sets.length} sets
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="border-b border-slate-900 py-2 text-xs text-slate-300">
                          {session.notes || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
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
            className={`fixed right-3 bottom-3 left-3 z-50 max-w-sm rounded-xl border px-4 py-3 text-sm font-semibold shadow-lg sm:right-4 sm:bottom-4 sm:left-auto ${
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
