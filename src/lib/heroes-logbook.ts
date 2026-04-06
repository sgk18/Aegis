export const PROGRAM_START_DATE = "2026-04-06";

export type SessionKey =
  | "push-a"
  | "pull-a"
  | "legs-a"
  | "push-b"
  | "pull-b"
  | "legs-b"
  | "rest";

export type SagaKey = "foundation" | "density" | "shred";

export interface ExerciseTemplate {
  id: string;
  name: string;
  prescribedSets: number;
  prescribedRepRange: string;
  focus: string;
}

export interface WorkoutTemplate {
  key: SessionKey;
  dayLabel: string;
  title: string;
  focus: string;
  exercises: ExerciseTemplate[];
  finisherA: string;
  finisherB: string;
}

export interface ExerciseSetForm {
  setNumber: number;
  reps: string;
  weightKg: string;
}

export interface ExerciseFormRow {
  exerciseId: string;
  exerciseName: string;
  prescribedRepRange: string;
  sets: ExerciseSetForm[];
}

export interface LoggedSet {
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
}

export interface ExerciseSessionLog {
  exerciseId: string;
  exerciseName: string;
  sets: LoggedSet[];
}

export interface WorkoutSessionLog {
  id: string;
  date: string;
  sessionKey: SessionKey;
  sessionTitle: string;
  bodyWeightKg: number | null;
  durationMin: number | null;
  notes: string;
  totalVolumeKg: number;
  exerciseLogs: ExerciseSessionLog[];
  createdAt: string;
}

export interface DailyNutritionLog {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
}

export interface SagaPhase {
  key: SagaKey;
  label: string;
  subtitle: string;
  panelClasses: string;
  badgeClasses: string;
}

export const DEFAULT_DAILY_GOALS = {
  calorieGoal: 2700,
  proteinGoal: 160,
  carbsGoal: 320,
  fatsGoal: 75,
};

export const SAGA_PHASES: SagaPhase[] = [
  {
    key: "foundation",
    label: "Foundation Saga",
    subtitle: "Months 1-4: form, consistency, and hypertrophy.",
    panelClasses:
      "from-cyan-950/70 via-slate-900 to-indigo-950/70 border-cyan-500/30",
    badgeClasses: "bg-cyan-500/20 text-cyan-200 border border-cyan-400/40",
  },
  {
    key: "density",
    label: "Super Saiyan Density",
    subtitle: "Months 5-8: heavy 5x5 focus on first movement.",
    panelClasses:
      "from-amber-950/70 via-slate-900 to-orange-950/70 border-amber-500/35",
    badgeClasses: "bg-amber-500/20 text-amber-200 border border-amber-400/40",
  },
  {
    key: "shred",
    label: "Symbiote Shred",
    subtitle: "Months 9-12: supersets, density, and finishing polish.",
    panelClasses:
      "from-fuchsia-950/70 via-slate-900 to-rose-950/70 border-fuchsia-500/35",
    badgeClasses: "bg-fuchsia-500/20 text-fuchsia-200 border border-fuchsia-400/40",
  },
];

export const WEEKLY_CYCLE: WorkoutTemplate[] = [
  {
    key: "push-a",
    dayLabel: "Monday",
    title: "Push A",
    focus: "Chest Armor",
    exercises: [
      {
        id: "bench-press",
        name: "Barbell Bench Press",
        prescribedSets: 4,
        prescribedRepRange: "8-10",
        focus: "Touch chest, explode up.",
      },
      {
        id: "incline-dumbbell-press",
        name: "Incline Dumbbell Press",
        prescribedSets: 3,
        prescribedRepRange: "10-12",
        focus: "Upper chest shelf.",
      },
      {
        id: "incline-dumbbell-flys",
        name: "Incline Dumbbell Flys",
        prescribedSets: 3,
        prescribedRepRange: "12-15",
        focus: "Deep stretch at bottom.",
      },
      {
        id: "lateral-raises",
        name: "Lateral Raises",
        prescribedSets: 4,
        prescribedRepRange: "15",
        focus: "Cap side delts.",
      },
      {
        id: "tricep-pushdowns",
        name: "Tricep Pushdowns (Rope)",
        prescribedSets: 3,
        prescribedRepRange: "12-15",
        focus: "Spread rope at bottom.",
      },
    ],
    finisherA: "Cable Crossovers 3x15-20",
    finisherB: "Incline Push-ups 3xFailure",
  },
  {
    key: "pull-a",
    dayLabel: "Tuesday",
    title: "Pull A",
    focus: "V-Taper Width",
    exercises: [
      {
        id: "pull-ups",
        name: "Pull-ups (Assisted if needed)",
        prescribedSets: 4,
        prescribedRepRange: "AMRAP",
        focus: "Chin over bar.",
      },
      {
        id: "lat-pulldowns",
        name: "Lat Pulldowns (Wide Grip)",
        prescribedSets: 3,
        prescribedRepRange: "10-12",
        focus: "Pull with elbows.",
      },
      {
        id: "single-arm-db-row",
        name: "Single-Arm DB Rows",
        prescribedSets: 3,
        prescribedRepRange: "12/arm",
        focus: "Back flat, pull to hip.",
      },
      {
        id: "face-pulls",
        name: "Face Pulls",
        prescribedSets: 4,
        prescribedRepRange: "15-20",
        focus: "Posture and rear delts.",
      },
      {
        id: "dumbbell-curls",
        name: "Dumbbell Curls",
        prescribedSets: 4,
        prescribedRepRange: "10-12",
        focus: "Squeeze at top.",
      },
    ],
    finisherA: "Straight-Arm Pulldowns 3x15",
    finisherB: "Preacher Curls 3x12",
  },
  {
    key: "legs-a",
    dayLabel: "Wednesday",
    title: "Legs A",
    focus: "Tree Trunk Quads",
    exercises: [
      {
        id: "barbell-squat",
        name: "Barbell Squats",
        prescribedSets: 4,
        prescribedRepRange: "8-10",
        focus: "Break parallel depth.",
      },
      {
        id: "leg-press",
        name: "Leg Press",
        prescribedSets: 4,
        prescribedRepRange: "10-12",
        focus: "Feet shoulder width.",
      },
      {
        id: "leg-extensions",
        name: "Leg Extensions",
        prescribedSets: 3,
        prescribedRepRange: "15",
        focus: "Hold one second at top.",
      },
      {
        id: "walking-lunges",
        name: "Walking Lunges",
        prescribedSets: 3,
        prescribedRepRange: "12/leg",
        focus: "Torso upright.",
      },
      {
        id: "plank",
        name: "Plank Hold",
        prescribedSets: 3,
        prescribedRepRange: "60s",
        focus: "Core fully braced.",
      },
    ],
    finisherA: "Calf Raises 4x20",
    finisherB: "DB Goblet Squats 3x15",
  },
  {
    key: "push-b",
    dayLabel: "Thursday",
    title: "Push B",
    focus: "3D Shoulders",
    exercises: [
      {
        id: "overhead-press",
        name: "Overhead Press (Barbell)",
        prescribedSets: 4,
        prescribedRepRange: "8-10",
        focus: "Core tight, press vertical.",
      },
      {
        id: "arnold-press",
        name: "Arnold Press",
        prescribedSets: 3,
        prescribedRepRange: "10-12",
        focus: "Rotate palms at top.",
      },
      {
        id: "close-grip-bench",
        name: "Close-Grip Bench Press",
        prescribedSets: 3,
        prescribedRepRange: "8-10",
        focus: "Tricep mass builder.",
      },
      {
        id: "weighted-dips",
        name: "Weighted Dips",
        prescribedSets: 3,
        prescribedRepRange: "10-12",
        focus: "Lean slightly forward.",
      },
      {
        id: "skullcrushers",
        name: "Skullcrushers (EZ Bar or DB)",
        prescribedSets: 3,
        prescribedRepRange: "12",
        focus: "Do not flare elbows.",
      },
    ],
    finisherA: "Lateral Raise Drop Set 3 rounds",
    finisherB: "DB Front Raises 3x15",
  },
  {
    key: "pull-b",
    dayLabel: "Friday",
    title: "Pull B",
    focus: "Back Thickness",
    exercises: [
      {
        id: "deadlifts",
        name: "Deadlifts (Conventional)",
        prescribedSets: 3,
        prescribedRepRange: "5",
        focus: "Heavy, neutral spine.",
      },
      {
        id: "t-bar-rows",
        name: "T-Bar Rows (or Chest Supported)",
        prescribedSets: 4,
        prescribedRepRange: "10-12",
        focus: "Squeeze shoulder blades.",
      },
      {
        id: "seated-cable-rows",
        name: "Seated Cable Rows",
        prescribedSets: 3,
        prescribedRepRange: "12",
        focus: "Full stretch forward.",
      },
      {
        id: "reverse-pec-deck",
        name: "Reverse Pec Deck",
        prescribedSets: 4,
        prescribedRepRange: "15",
        focus: "Rear delt isolation.",
      },
      {
        id: "hammer-curls",
        name: "Hammer Curls",
        prescribedSets: 4,
        prescribedRepRange: "12",
        focus: "Brachialis width.",
      },
    ],
    finisherA: "Heavy DB Shrugs 4x15",
    finisherB: "Farmer's Walk 3x40m",
  },
  {
    key: "legs-b",
    dayLabel: "Saturday",
    title: "Legs B",
    focus: "Agility and Hamstrings",
    exercises: [
      {
        id: "rdl",
        name: "Romanian Deadlifts (RDL)",
        prescribedSets: 4,
        prescribedRepRange: "10-12",
        focus: "Push hips back for stretch.",
      },
      {
        id: "bulgarian-split-squat",
        name: "Bulgarian Split Squats",
        prescribedSets: 3,
        prescribedRepRange: "10/leg",
        focus: "Back foot elevated.",
      },
      {
        id: "leg-curls",
        name: "Leg Curls (Seated/Lying)",
        prescribedSets: 4,
        prescribedRepRange: "12-15",
        focus: "Hamstring isolation.",
      },
      {
        id: "lying-leg-raises",
        name: "Lying Leg Raises",
        prescribedSets: 3,
        prescribedRepRange: "15-20",
        focus: "Lower abs and control.",
      },
      {
        id: "russian-twists",
        name: "Russian Twists (Weighted)",
        prescribedSets: 3,
        prescribedRepRange: "20",
        focus: "Oblique rotation.",
      },
    ],
    finisherA: "Leg Press Drop Set to failure",
    finisherB: "Sprints 5 rounds (30s on/off)",
  },
  {
    key: "rest",
    dayLabel: "Sunday",
    title: "Recovery",
    focus: "Recovery and Meal Prep",
    exercises: [
      {
        id: "foam-roll",
        name: "Foam Roll",
        prescribedSets: 1,
        prescribedRepRange: "15m",
        focus: "Release tight spots.",
      },
      {
        id: "mobility-circuit",
        name: "Mobility Circuit",
        prescribedSets: 1,
        prescribedRepRange: "15m",
        focus: "Open hips and spine.",
      },
      {
        id: "deep-stretch",
        name: "Deep Stretch",
        prescribedSets: 1,
        prescribedRepRange: "20m",
        focus: "Reduce soreness.",
      },
    ],
    finisherA: "Meal prep and hydration check",
    finisherB: "Sleep early",
  },
];

export function parseIsoDate(dateIso: string): Date {
  const parsed = new Date(`${dateIso}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
}

export function toIsoDate(date: Date): string {
  const yyyy = date.getUTCFullYear();
  const mm = `${date.getUTCMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getUTCDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function todayIsoDate(): string {
  const now = new Date();
  const utcDate = new Date(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
  );
  return toIsoDate(utcDate);
}

export function addDays(dateIso: string, dayDelta: number): string {
  const base = parseIsoDate(dateIso);
  base.setUTCDate(base.getUTCDate() + dayDelta);
  return toIsoDate(base);
}

export function dayDifference(fromDateIso: string, toDateIso: string): number {
  const from = parseIsoDate(fromDateIso).getTime();
  const to = parseIsoDate(toDateIso).getTime();
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.floor((to - from) / msPerDay);
}

export function getCycleIndex(dateIso: string): number {
  const delta = dayDifference(PROGRAM_START_DATE, dateIso);
  const cycleLength = WEEKLY_CYCLE.length;
  return ((delta % cycleLength) + cycleLength) % cycleLength;
}

export function getTemplateForDate(dateIso: string): WorkoutTemplate {
  return WEEKLY_CYCLE[getCycleIndex(dateIso)] ?? WEEKLY_CYCLE[0];
}

export function getSagaPhase(dateIso: string): SagaPhase {
  const start = parseIsoDate(PROGRAM_START_DATE);
  const current = parseIsoDate(dateIso);

  let monthOffset =
    (current.getUTCFullYear() - start.getUTCFullYear()) * 12 +
    (current.getUTCMonth() - start.getUTCMonth());

  if (current.getUTCDate() < start.getUTCDate()) {
    monthOffset -= 1;
  }

  if (monthOffset < 4) {
    return SAGA_PHASES[0];
  }

  if (monthOffset < 8) {
    return SAGA_PHASES[1];
  }

  return SAGA_PHASES[2];
}

export function createExerciseFormRows(
  template: WorkoutTemplate
): ExerciseFormRow[] {
  return template.exercises.map((exercise) => ({
    exerciseId: exercise.id,
    exerciseName: exercise.name,
    prescribedRepRange: exercise.prescribedRepRange,
    sets: Array.from({ length: exercise.prescribedSets }, (_, index) => ({
      setNumber: index + 1,
      reps: "",
      weightKg: "",
    })),
  }));
}

function safeNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function computeSessionVolume(exerciseRows: ExerciseFormRow[]): number {
  return Math.round(
    exerciseRows.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((exerciseTotal, setEntry) => {
        return exerciseTotal + safeNumber(setEntry.reps) * safeNumber(setEntry.weightKg);
      }, 0);

      return total + exerciseVolume;
    }, 0)
  );
}

export function mapRowsToSessionLogs(
  exerciseRows: ExerciseFormRow[]
): ExerciseSessionLog[] {
  return exerciseRows.map((exercise) => ({
    exerciseId: exercise.exerciseId,
    exerciseName: exercise.exerciseName,
    sets: exercise.sets.map((setEntry) => ({
      setNumber: setEntry.setNumber,
      reps: setEntry.reps.trim() ? safeNumber(setEntry.reps) : null,
      weightKg: setEntry.weightKg.trim() ? safeNumber(setEntry.weightKg) : null,
    })),
  }));
}

export function findLatestComparableSession(
  sessions: WorkoutSessionLog[],
  dateIso: string,
  sessionKey: SessionKey
): WorkoutSessionLog | null {
  const current = parseIsoDate(dateIso).getTime();

  const candidate = [...sessions]
    .filter((session) => {
      return (
        session.sessionKey === sessionKey &&
        parseIsoDate(session.date).getTime() < current
      );
    })
    .sort((left, right) => {
      return parseIsoDate(right.date).getTime() - parseIsoDate(left.date).getTime();
    })[0];

  return candidate ?? null;
}

export function buildPreviousWeekTargets(
  sessions: WorkoutSessionLog[],
  dateIso: string,
  sessionKey: SessionKey
): Record<string, number> {
  const previousSession = findLatestComparableSession(sessions, dateIso, sessionKey);
  if (!previousSession) {
    return {};
  }

  const targets: Record<string, number> = {};
  for (const exerciseLog of previousSession.exerciseLogs) {
    const maxLoad = exerciseLog.sets.reduce((maxValue, setEntry) => {
      if (setEntry.weightKg === null) {
        return maxValue;
      }
      return Math.max(maxValue, setEntry.weightKg);
    }, 0);

    if (maxLoad > 0) {
      targets[exerciseLog.exerciseId] = maxLoad;
    }
  }

  return targets;
}

export function calculateConsistencyStreak(
  sessions: WorkoutSessionLog[],
  nutritionByDate: Record<string, DailyNutritionLog>,
  referenceDateIso: string
): number {
  const workoutDates = new Set(sessions.map((session) => session.date));

  let streak = 0;
  let cursorIso = referenceDateIso;

  while (streak < 3650) {
    const nutrition = nutritionByDate[cursorIso];
    const hitWorkout = workoutDates.has(cursorIso);
    const hitNutrition =
      Boolean(nutrition) &&
      nutrition.protein >= nutrition.proteinGoal &&
      nutrition.calories >= nutrition.calorieGoal - 250 &&
      nutrition.calories <= nutrition.calorieGoal + 150;

    if (!hitWorkout || !hitNutrition) {
      break;
    }

    streak += 1;
    cursorIso = addDays(cursorIso, -1);
  }

  return streak;
}

export function sortedSessionsByDate(
  sessions: WorkoutSessionLog[],
  direction: "asc" | "desc" = "desc"
): WorkoutSessionLog[] {
  return [...sessions].sort((left, right) => {
    const delta = parseIsoDate(left.date).getTime() - parseIsoDate(right.date).getTime();
    return direction === "asc" ? delta : -delta;
  });
}

export function createDailyNutritionTemplate(dateIso: string): DailyNutritionLog {
  return {
    date: dateIso,
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    ...DEFAULT_DAILY_GOALS,
  };
}
