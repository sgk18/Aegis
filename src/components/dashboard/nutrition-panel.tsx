"use client";

import { motion } from "framer-motion";
import { type DailyNutritionLog } from "@/lib/heroes-logbook";

interface NutritionPanelProps {
  nutrition: DailyNutritionLog;
  onChange: (next: DailyNutritionLog) => void;
}

function safeNumber(value: string): number {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function ratio(current: number, goal: number): number {
  if (goal <= 0) {
    return 0;
  }
  return Math.max(0, Math.min(1.5, current / goal));
}

function ProgressRing({
  label,
  value,
  goal,
  accentClass,
}: {
  label: string;
  value: number;
  goal: number;
  accentClass: string;
}) {
  const percentage = ratio(value, goal);
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - Math.min(percentage, 1));

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <svg width="86" height="86" viewBox="0 0 86 86">
          <circle
            cx="43"
            cy="43"
            r={radius}
            stroke="rgba(148,163,184,0.25)"
            strokeWidth="8"
            fill="none"
          />
          <circle
            cx="43"
            cy="43"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            className={accentClass}
            transform="rotate(-90 43 43)"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-semibold text-white">
            {Math.round(percentage * 100)}%
          </span>
        </div>
      </div>
      <p className="text-xs font-semibold text-slate-300">{label}</p>
      <p className="text-[11px] text-slate-400">
        {value} / {goal}
      </p>
    </div>
  );
}

function MacroBar({ label, value, goal }: { label: string; value: number; goal: number }) {
  const width = Math.min(100, Math.round(ratio(value, goal) * 100));

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs text-slate-300">
        <span>{label}</span>
        <span>
          {value} / {goal}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-all duration-300"
          style={{ width: `${width}%` }}
        />
      </div>
    </div>
  );
}

export function NutritionPanel({ nutrition, onChange }: NutritionPanelProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5"
    >
      <h2 className="text-lg font-semibold text-white sm:text-xl">Nutrition and Calorie Dashboard</h2>
      <p className="mt-1 text-sm text-slate-300">
        Track calories and macros daily against your lean-mass goals.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Calories
          <input
            type="number"
            min="0"
            value={nutrition.calories}
            onChange={(event) =>
              onChange({
                ...nutrition,
                calories: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Protein (g)
          <input
            type="number"
            min="0"
            value={nutrition.protein}
            onChange={(event) =>
              onChange({
                ...nutrition,
                protein: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Carbs (g)
          <input
            type="number"
            min="0"
            value={nutrition.carbs}
            onChange={(event) =>
              onChange({
                ...nutrition,
                carbs: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>

        <label className="text-xs font-semibold uppercase tracking-wide text-slate-400">
          Fats (g)
          <input
            type="number"
            min="0"
            value={nutrition.fats}
            onChange={(event) =>
              onChange({
                ...nutrition,
                fats: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Calorie Goal
          <input
            type="number"
            min="0"
            value={nutrition.calorieGoal}
            onChange={(event) =>
              onChange({
                ...nutrition,
                calorieGoal: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Protein Goal
          <input
            type="number"
            min="0"
            value={nutrition.proteinGoal}
            onChange={(event) =>
              onChange({
                ...nutrition,
                proteinGoal: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Carbs Goal
          <input
            type="number"
            min="0"
            value={nutrition.carbsGoal}
            onChange={(event) =>
              onChange({
                ...nutrition,
                carbsGoal: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
          Fats Goal
          <input
            type="number"
            min="0"
            value={nutrition.fatsGoal}
            onChange={(event) =>
              onChange({
                ...nutrition,
                fatsGoal: safeNumber(event.target.value),
              })
            }
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-400"
          />
        </label>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <ProgressRing
          label="Calories"
          value={nutrition.calories}
          goal={nutrition.calorieGoal}
          accentClass="text-cyan-300"
        />
        <ProgressRing
          label="Protein"
          value={nutrition.protein}
          goal={nutrition.proteinGoal}
          accentClass="text-fuchsia-300"
        />
        <ProgressRing
          label="Carbs"
          value={nutrition.carbs}
          goal={nutrition.carbsGoal}
          accentClass="text-amber-300"
        />
        <ProgressRing
          label="Fats"
          value={nutrition.fats}
          goal={nutrition.fatsGoal}
          accentClass="text-emerald-300"
        />
      </div>

      <div className="mt-6 space-y-3">
        <MacroBar label="Protein" value={nutrition.protein} goal={nutrition.proteinGoal} />
        <MacroBar label="Carbs" value={nutrition.carbs} goal={nutrition.carbsGoal} />
        <MacroBar label="Fats" value={nutrition.fats} goal={nutrition.fatsGoal} />
      </div>
    </motion.section>
  );
}
