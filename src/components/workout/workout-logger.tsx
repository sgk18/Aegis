"use client";

import { motion } from "framer-motion";
import { type FormEvent, useMemo, useState } from "react";
import {
  buildPreviousWeekTargets,
  computeSessionVolume,
  createExerciseFormRows,
  mapRowsToSessionLogs,
  type ExerciseFormRow,
  type SessionKey,
  type WorkoutSessionLog,
  type WorkoutTemplate,
} from "@/lib/heroes-logbook";
import { RestTimer } from "@/components/workout/rest-timer";

type SavePayload = {
  session: WorkoutSessionLog;
  newPrCount: number;
};

interface WorkoutLoggerProps {
  selectedDate: string;
  template: WorkoutTemplate;
  sessions: WorkoutSessionLog[];
  onSaveSession: (payload: SavePayload) => void;
}

function safeNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function findExerciseBestLoad(exercise: ExerciseFormRow): number {
  return exercise.sets.reduce((maxValue, setEntry) => {
    const weight = safeNumber(setEntry.weightKg);
    return Math.max(maxValue, weight);
  }, 0);
}

export function WorkoutLogger({
  selectedDate,
  template,
  sessions,
  onSaveSession,
}: WorkoutLoggerProps) {
  const [exerciseRows, setExerciseRows] = useState<ExerciseFormRow[]>(() =>
    createExerciseFormRows(template)
  );
  const [bodyWeightKg, setBodyWeightKg] = useState<string>("");
  const [durationMin, setDurationMin] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  const previousTargets = useMemo(() => {
    return buildPreviousWeekTargets(sessions, selectedDate, template.key as SessionKey);
  }, [sessions, selectedDate, template.key]);

  const projectedVolume = useMemo(() => {
    return computeSessionVolume(exerciseRows);
  }, [exerciseRows]);

  function updateSet(
    exerciseIndex: number,
    setIndex: number,
    field: "reps" | "weightKg",
    value: string
  ) {
    setExerciseRows((previousRows) => {
      const cloned = [...previousRows];
      const exercise = cloned[exerciseIndex];
      if (!exercise) {
        return previousRows;
      }

      const sets = [...exercise.sets];
      const setEntry = sets[setIndex];
      if (!setEntry) {
        return previousRows;
      }

      sets[setIndex] = {
        ...setEntry,
        [field]: value,
      };

      cloned[exerciseIndex] = {
        ...exercise,
        sets,
      };

      return cloned;
    });
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const logs = mapRowsToSessionLogs(exerciseRows);
    const totalVolumeKg = computeSessionVolume(exerciseRows);

    // Progressive overload is counted when the current best set weight beats
    // the latest recorded weight for the same exercise in the same A/B day.
    const newPrCount = exerciseRows.reduce((count, exercise) => {
      const previous = previousTargets[exercise.exerciseId];
      if (!previous) {
        return count;
      }

      const currentBest = findExerciseBestLoad(exercise);
      return currentBest > previous ? count + 1 : count;
    }, 0);

    const session: WorkoutSessionLog = {
      id: crypto.randomUUID(),
      date: selectedDate,
      sessionKey: template.key,
      sessionTitle: `${template.dayLabel} - ${template.title}`,
      bodyWeightKg: bodyWeightKg.trim() ? safeNumber(bodyWeightKg) : null,
      durationMin: durationMin.trim() ? safeNumber(durationMin) : null,
      notes: notes.trim(),
      totalVolumeKg,
      exerciseLogs: logs,
      createdAt: new Date().toISOString(),
    };

    onSaveSession({ session, newPrCount });
    setExerciseRows(createExerciseFormRows(template));
    setBodyWeightKg("");
    setDurationMin("");
    setNotes("");
  }

  if (template.key === "rest") {
    return (
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
      >
        <h2 className="text-xl font-semibold text-white">Recovery Day Protocol</h2>
        <p className="mt-2 text-sm text-slate-300">
          Active recovery keeps the streak alive. Log a quick mobility session and prep your meals.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-slate-300">
          {template.exercises.map((exercise) => (
            <li key={exercise.id} className="rounded-lg bg-slate-950/60 px-3 py-2">
              {exercise.name}: {exercise.prescribedRepRange}
            </li>
          ))}
        </ul>
      </motion.section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Workout Logger: {template.dayLabel} - {template.title}
          </h2>
          <p className="mt-1 text-sm text-slate-300">{template.focus}</p>
        </div>
        <p className="rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
          Projected Volume: {projectedVolume} kg
        </p>
      </div>

      <form onSubmit={onSubmit} className="mt-5 space-y-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Body Weight (kg)
            <input
              value={bodyWeightKg}
              onChange={(event) => setBodyWeightKg(event.target.value)}
              type="number"
              min="0"
              step="0.1"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="e.g. 71.4"
            />
          </label>

          <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Duration (minutes)
            <input
              value={durationMin}
              onChange={(event) => setDurationMin(event.target.value)}
              type="number"
              min="0"
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
              placeholder="e.g. 95"
            />
          </label>

          <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-2">
            <RestTimer />
          </div>
        </div>

        <div className="space-y-3">
          {exerciseRows.map((exercise, exerciseIndex) => {
            const target = previousTargets[exercise.exerciseId];

            return (
              <motion.article
                key={exercise.exerciseId}
                layout
                className="rounded-xl border border-slate-800 bg-slate-950/60 p-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-semibold text-slate-100">{exercise.exerciseName}</h3>
                  <div className="flex items-center gap-2 text-[11px] text-slate-300">
                    <span>Target reps: {exercise.prescribedRepRange}</span>
                    {target ? (
                      <span className="rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-2 py-0.5 text-fuchsia-100">
                        Last week: {target} kg
                      </span>
                    ) : (
                      <span className="rounded-full border border-slate-700 px-2 py-0.5 text-slate-400">
                        First tracked week
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid gap-2">
                  {exercise.sets.map((setEntry, setIndex) => (
                    <div
                      key={`${exercise.exerciseId}-${setEntry.setNumber}`}
                      className="grid grid-cols-[auto_1fr_1fr] items-center gap-2"
                    >
                      <span className="w-12 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-center text-xs text-slate-300">
                        Set {setEntry.setNumber}
                      </span>
                      <input
                        value={setEntry.reps}
                        onChange={(event) =>
                          updateSet(exerciseIndex, setIndex, "reps", event.target.value)
                        }
                        type="number"
                        min="0"
                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white outline-none transition focus:border-cyan-400"
                        placeholder={`Reps (${exercise.prescribedRepRange})`}
                      />
                      <input
                        value={setEntry.weightKg}
                        onChange={(event) =>
                          updateSet(exerciseIndex, setIndex, "weightKg", event.target.value)
                        }
                        type="number"
                        min="0"
                        step="0.5"
                        className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-sm text-white outline-none transition focus:border-cyan-400"
                        placeholder={target ? `Beat ${target} kg` : "Weight kg"}
                      />
                    </div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>

        <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          Session Notes
          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            className="mt-1 min-h-24 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
            placeholder="Energy, form notes, what to improve next week"
          />
        </label>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-slate-400">
            Finisher options: {template.finisherA} or {template.finisherB}
          </p>
          <motion.button
            whileTap={{ scale: 0.97 }}
            type="submit"
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Save workout
          </motion.button>
        </div>
      </form>
    </motion.section>
  );
}
