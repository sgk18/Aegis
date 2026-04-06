"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";

type DayPlan = {
  day: string;
  sessionKey: string;
  sessionLabel: string;
  focus: string;
  exercises: string[];
  finisher: string;
};

type ExerciseInput = {
  name: string;
  sets: string;
  reps: string;
  loadKg: string;
};

type WorkoutForm = {
  date: string;
  sessionKey: string;
  bodyWeightKg: string;
  sleepHours: string;
  durationMin: string;
  energy: string;
  notes: string;
  exercises: ExerciseInput[];
};

type WorkoutRecord = {
  id: string;
  createdAt: string;
  date: string;
  sessionKey: string;
  sessionLabel: string;
  bodyWeightKg: string;
  sleepHours: string;
  durationMin: string;
  energy: string;
  notes: string;
  exercises: ExerciseInput[];
};

const STORAGE_KEY = "aegis-workout-records-v1";

const PLAN: DayPlan[] = [
  {
    day: "Monday",
    sessionKey: "push-a",
    sessionLabel: "Push A",
    focus: "Chest Focus",
    exercises: [
      "Barbell Bench Press 4x8-10",
      "Incline Dumbbell Press 3x10-12",
      "Incline Dumbbell Flys 3x12-15",
      "Lateral Raises 4x15",
      "Tricep Pushdowns 3x12-15",
    ],
    finisher: "Cable Crossovers or Incline Push-ups",
  },
  {
    day: "Tuesday",
    sessionKey: "pull-a",
    sessionLabel: "Pull A",
    focus: "Width Focus",
    exercises: [
      "Pull-ups 4xAMRAP",
      "Lat Pulldowns 3x10-12",
      "Single-Arm DB Rows 3x12/arm",
      "Face Pulls 4x15-20",
      "Dumbbell Curls 4x10-12",
    ],
    finisher: "Straight-Arm Pulldowns or Preacher Curls",
  },
  {
    day: "Wednesday",
    sessionKey: "legs-a",
    sessionLabel: "Legs A",
    focus: "Squat Focus",
    exercises: [
      "Barbell Squats 4x8-10",
      "Leg Press 4x10-12",
      "Leg Extensions 3x15",
      "Walking Lunges 3x12/leg",
      "Plank 3x60s",
    ],
    finisher: "Calf Raises or Goblet Squats",
  },
  {
    day: "Thursday",
    sessionKey: "push-b",
    sessionLabel: "Push B",
    focus: "Shoulder Focus",
    exercises: [
      "Overhead Press 4x8-10",
      "Arnold Press 3x10-12",
      "Close-Grip Bench Press 3x8-10",
      "Weighted Dips 3x10-12",
      "Skullcrushers 3x12",
    ],
    finisher: "Lateral Raise Drop Set or Front Raises",
  },
  {
    day: "Friday",
    sessionKey: "pull-b",
    sessionLabel: "Pull B",
    focus: "Thickness Focus",
    exercises: [
      "Deadlifts 3x5",
      "T-Bar Rows 4x10-12",
      "Seated Cable Rows 3x12",
      "Reverse Pec Deck 4x15",
      "Hammer Curls 4x12",
    ],
    finisher: "Heavy Shrugs or Farmer's Walk",
  },
  {
    day: "Saturday",
    sessionKey: "legs-b",
    sessionLabel: "Legs B",
    focus: "Hinge and Agility",
    exercises: [
      "Romanian Deadlifts 4x10-12",
      "Bulgarian Split Squats 3x10/leg",
      "Leg Curls 4x12-15",
      "Lying Leg Raises 3x15",
      "Russian Twists 3x20",
    ],
    finisher: "Leg Press Drop Set or Sprints",
  },
  {
    day: "Sunday",
    sessionKey: "recovery",
    sessionLabel: "Recovery",
    focus: "Mobility and Reset",
    exercises: [
      "Foam Roll 15 min",
      "Mobility Circuit 15 min",
      "Deep Stretch 20 min",
      "Light Walk 20 min",
      "Hydration and Meal Prep",
    ],
    finisher: "Early sleep and full recovery",
  },
];

const SESSION_CHOICES = [
  ...PLAN.map((item) => ({ key: item.sessionKey, label: `${item.day} - ${item.sessionLabel}` })),
  { key: "full-body-backup", label: "Backup - Full Body (Dumbbell)" },
  { key: "custom", label: "Custom Session" },
];

function todayDate() {
  return new Date().toISOString().split("T")[0] ?? "";
}

function emptyExercise(): ExerciseInput {
  return {
    name: "",
    sets: "",
    reps: "",
    loadKg: "",
  };
}

function createInitialForm(sessionKey?: string): WorkoutForm {
  return {
    date: todayDate(),
    sessionKey: sessionKey ?? "push-a",
    bodyWeightKg: "",
    sleepHours: "",
    durationMin: "",
    energy: "7",
    notes: "",
    exercises: [emptyExercise(), emptyExercise(), emptyExercise()],
  };
}

function toNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeCsv(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

export default function Home() {
  const [records, setRecords] = useState<WorkoutRecord[]>([]);
  const [form, setForm] = useState<WorkoutForm>(() => createInitialForm());
  const [feedback, setFeedback] = useState<string>("");
  const [isLoaded, setIsLoaded] = useState(false);

  const sessionLabelMap = useMemo(() => {
    return new Map(SESSION_CHOICES.map((item) => [item.key, item.label]));
  }, []);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setIsLoaded(true);
        return;
      }

      const parsed = JSON.parse(raw) as WorkoutRecord[];
      if (Array.isArray(parsed)) {
        setRecords(parsed);
      }
    } catch {
      setFeedback("Could not read previous records. Starting fresh.");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
  }, [isLoaded, records]);

  const stats = useMemo(() => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    let weeklySessions = 0;
    let totalDuration = 0;
    let totalVolume = 0;

    for (const record of records) {
      const sessionDate = new Date(`${record.date}T00:00:00`);
      if (!Number.isNaN(sessionDate.getTime()) && sessionDate >= weekStart) {
        weeklySessions += 1;
      }

      totalDuration += toNumber(record.durationMin);

      for (const exercise of record.exercises) {
        totalVolume +=
          toNumber(exercise.sets) * toNumber(exercise.reps) * toNumber(exercise.loadKg);
      }
    }

    return {
      totalSessions: records.length,
      weeklySessions,
      averageDuration: records.length > 0 ? Math.round(totalDuration / records.length) : 0,
      estimatedVolume: Math.round(totalVolume),
    };
  }, [records]);

  function updateField<Key extends keyof WorkoutForm>(key: Key, value: WorkoutForm[Key]) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  function updateExercise(index: number, key: keyof ExerciseInput, value: string) {
    setForm((previous) => {
      const nextExercises = [...previous.exercises];
      const target = nextExercises[index];
      if (!target) {
        return previous;
      }

      nextExercises[index] = {
        ...target,
        [key]: value,
      };

      return {
        ...previous,
        exercises: nextExercises,
      };
    });
  }

  function addExercise() {
    setForm((previous) => ({
      ...previous,
      exercises: [...previous.exercises, emptyExercise()],
    }));
  }

  function removeExercise(index: number) {
    setForm((previous) => {
      if (previous.exercises.length <= 1) {
        return previous;
      }

      return {
        ...previous,
        exercises: previous.exercises.filter((_, exerciseIndex) => exerciseIndex !== index),
      };
    });
  }

  function saveRecord(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanExercises = form.exercises
      .map((exercise) => ({
        name: exercise.name.trim(),
        sets: exercise.sets.trim(),
        reps: exercise.reps.trim(),
        loadKg: exercise.loadKg.trim(),
      }))
      .filter((exercise) => exercise.name.length > 0);

    if (cleanExercises.length === 0) {
      setFeedback("Add at least one exercise before saving.");
      return;
    }

    const record: WorkoutRecord = {
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      date: form.date,
      sessionKey: form.sessionKey,
      sessionLabel: sessionLabelMap.get(form.sessionKey) ?? "Custom Session",
      bodyWeightKg: form.bodyWeightKg.trim(),
      sleepHours: form.sleepHours.trim(),
      durationMin: form.durationMin.trim(),
      energy: form.energy.trim(),
      notes: form.notes.trim(),
      exercises: cleanExercises,
    };

    setRecords((previous) => [record, ...previous]);
    setForm(createInitialForm(form.sessionKey));
    setFeedback("Session saved to your log.");
  }

  function deleteRecord(id: string) {
    setRecords((previous) => previous.filter((record) => record.id !== id));
  }

  function clearAllRecords() {
    if (!window.confirm("Delete all workout records? This cannot be undone.")) {
      return;
    }

    setRecords([]);
    setFeedback("All records were removed.");
  }

  function exportCsv() {
    if (records.length === 0) {
      setFeedback("No records found. Save at least one session first.");
      return;
    }

    const headers = [
      "Date",
      "Session",
      "BodyWeightKg",
      "SleepHours",
      "DurationMin",
      "Energy",
      "Exercises",
      "Notes",
    ];

    const rows = records.map((record) => {
      const exerciseSummary = record.exercises
        .map((exercise) => {
          const sets = exercise.sets || "-";
          const reps = exercise.reps || "-";
          const load = exercise.loadKg || "-";
          return `${exercise.name} (${sets}x${reps} @ ${load}kg)`;
        })
        .join(" | ");

      return [
        record.date,
        record.sessionLabel,
        record.bodyWeightKg,
        record.sleepHours,
        record.durationMin,
        record.energy,
        exerciseSummary,
        record.notes,
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => escapeCsv(String(cell ?? ""))).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `aegis-workout-log-${todayDate()}.csv`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(downloadUrl);

    setFeedback("CSV exported successfully.");
  }

  return (
    <div className="min-h-screen px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <header className="relative overflow-hidden rounded-3xl border border-orange-200 bg-gradient-to-br from-amber-50 via-rose-50 to-orange-100 p-6 shadow-lg shadow-orange-900/5 sm:p-8">
          <div className="absolute -top-20 -right-16 h-52 w-52 rounded-full bg-orange-300/30 blur-3xl" />
          <div className="absolute -bottom-20 left-2 h-44 w-44 rounded-full bg-teal-300/30 blur-3xl" />
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
              AEGIS Training Log
            </p>
            <h1 className="mt-3 max-w-3xl text-3xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              Track every session, keep the record, and stay consistent.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700 sm:text-base">
              This tracker is built around your 12-month Push/Pull/Legs plan and includes backup
              full-body logging when your schedule gets busy. Save sessions, review progress, and
              export your data anytime.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={exportCsv}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Export workout log (CSV)
              </button>
              <a
                href="/api/export-prd"
                className="rounded-xl border border-slate-900/15 bg-white/70 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white"
              >
                Download PRD workbook (XLSX)
              </a>
            </div>
            {feedback ? (
              <p className="mt-3 text-sm font-medium text-orange-700">{feedback}</p>
            ) : null}
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Total Sessions</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.totalSessions}</p>
          </article>
          <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Last 7 Days</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.weeklySessions}</p>
          </article>
          <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Avg Duration</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.averageDuration} min</p>
          </article>
          <article className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Est. Total Volume</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{stats.estimatedVolume} kg</p>
          </article>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <form
            onSubmit={saveRecord}
            className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-900/5 sm:p-7"
          >
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Log New Session</h2>
            <p className="mt-2 text-sm text-slate-600">
              Fill in your session details and add as many exercises as needed.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Date
                <input
                  type="date"
                  value={form.date}
                  onChange={(event) => updateField("date", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-400"
                  required
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Session Type
                <select
                  value={form.sessionKey}
                  onChange={(event) => updateField("sessionKey", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-400"
                >
                  {SESSION_CHOICES.map((option) => (
                    <option key={option.key} value={option.key}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Body Weight (kg)
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={form.bodyWeightKg}
                  onChange={(event) => updateField("bodyWeightKg", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-400"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Sleep (hours)
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={form.sleepHours}
                  onChange={(event) => updateField("sleepHours", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-400"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Duration (minutes)
                <input
                  type="number"
                  min="0"
                  value={form.durationMin}
                  onChange={(event) => updateField("durationMin", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-400"
                />
              </label>

              <label className="flex flex-col gap-2 text-sm font-medium text-slate-700">
                Energy (1-10)
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={form.energy}
                  onChange={(event) => updateField("energy", event.target.value)}
                  className="rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-400"
                />
              </label>
            </div>

            <label className="mt-4 flex flex-col gap-2 text-sm font-medium text-slate-700">
              Session Notes
              <textarea
                value={form.notes}
                onChange={(event) => updateField("notes", event.target.value)}
                className="min-h-28 rounded-xl border border-slate-300 px-3 py-2.5 outline-none transition focus:border-orange-400"
                placeholder="How did the session feel?"
              />
            </label>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Exercises</h3>
                <button
                  type="button"
                  onClick={addExercise}
                  className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
                >
                  Add Exercise
                </button>
              </div>

              {form.exercises.map((exercise, index) => (
                <div
                  key={`${index}-${exercise.name}`}
                  className="grid gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-3 lg:grid-cols-[2fr_0.7fr_0.7fr_0.9fr_auto]"
                >
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(event) => updateExercise(index, "name", event.target.value)}
                    placeholder={`Exercise ${index + 1}`}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400"
                  />
                  <input
                    type="number"
                    min="0"
                    value={exercise.sets}
                    onChange={(event) => updateExercise(index, "sets", event.target.value)}
                    placeholder="Sets"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400"
                  />
                  <input
                    type="number"
                    min="0"
                    value={exercise.reps}
                    onChange={(event) => updateExercise(index, "reps", event.target.value)}
                    placeholder="Reps"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.5"
                    value={exercise.loadKg}
                    onChange={(event) => updateExercise(index, "loadKg", event.target.value)}
                    placeholder="Load kg"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-orange-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeExercise(index)}
                    className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-700 transition hover:bg-slate-100"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-xl bg-orange-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-500"
              >
                Save Session
              </button>
              <button
                type="button"
                onClick={() => setForm(createInitialForm(form.sessionKey))}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Reset Form
              </button>
            </div>
          </form>

          <aside className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-900/5 sm:p-7">
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Weekly Blueprint</h2>
            <p className="mt-2 text-sm text-slate-600">
              Six unique training days plus one recovery day to keep the plan sustainable.
            </p>

            <div className="mt-5 space-y-3">
              {PLAN.map((dayPlan) => (
                <article
                  key={dayPlan.day}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-slate-900">
                      {dayPlan.day}: {dayPlan.sessionLabel}
                    </p>
                    <span className="rounded-full bg-white px-2.5 py-1 text-xs font-medium text-slate-600">
                      {dayPlan.focus}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-slate-600">
                    {dayPlan.exercises.slice(0, 3).map((exercise) => (
                      <li key={exercise}>{exercise}</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs font-medium text-orange-700">
                    Finisher: {dayPlan.finisher}
                  </p>
                </article>
              ))}
            </div>
          </aside>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-md shadow-slate-900/5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Workout Records</h2>
              <p className="mt-2 text-sm text-slate-600">
                Latest sessions are shown first. Everything is saved locally in your browser.
              </p>
            </div>
            <button
              type="button"
              onClick={clearAllRecords}
              className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-50"
            >
              Clear All
            </button>
          </div>

          {records.length === 0 ? (
            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-600">
              No entries yet. Log your first session to start your training history.
            </div>
          ) : (
            <div className="mt-5 grid gap-4">
              {records.map((record) => (
                <article
                  key={record.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{record.sessionLabel}</p>
                      <p className="mt-1 text-xs text-slate-600">{record.date}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteRecord(record.id)}
                      className="rounded-lg border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 transition hover:bg-white"
                    >
                      Delete
                    </button>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                      Bodyweight: {record.bodyWeightKg || "-"} kg
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                      Sleep: {record.sleepHours || "-"} h
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                      Duration: {record.durationMin || "-"} min
                    </span>
                    <span className="rounded-full bg-white px-2.5 py-1 text-slate-700">
                      Energy: {record.energy || "-"}/10
                    </span>
                  </div>

                  <ul className="mt-3 space-y-1 text-xs leading-5 text-slate-700">
                    {record.exercises.map((exercise, index) => (
                      <li key={`${record.id}-${exercise.name}-${index}`}>
                        {exercise.name} - {exercise.sets || "-"}x{exercise.reps || "-"} @{" "}
                        {exercise.loadKg || "-"} kg
                      </li>
                    ))}
                  </ul>

                  {record.notes ? (
                    <p className="mt-3 rounded-lg bg-white p-2 text-xs text-slate-600">{record.notes}</p>
                  ) : null}
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
