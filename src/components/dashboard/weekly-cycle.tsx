"use client";

import { motion } from "framer-motion";
import {
  addDays,
  getTemplateForDate,
  parseIsoDate,
  todayIsoDate,
} from "@/lib/heroes-logbook";

interface WeeklyCycleProps {
  selectedDate: string;
  onSelectDate: (dateIso: string) => void;
}

function formatDisplayDate(dateIso: string): string {
  return parseIsoDate(dateIso).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

export function WeeklyCycle({ selectedDate, onSelectDate }: WeeklyCycleProps) {
  const today = todayIsoDate();

  const stripDays = Array.from({ length: 7 }, (_, index) => {
    const offset = index - 3;
    const dateIso = addDays(selectedDate, offset);
    const template = getTemplateForDate(dateIso);
    return {
      dateIso,
      template,
      isSelected: dateIso === selectedDate,
      isToday: dateIso === today,
    };
  });

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-white">6-Day Repeating Cycle</h2>
          <p className="mt-1 text-sm text-slate-300">
            Push A, Pull A, Legs A, Push B, Pull B, Legs B, then recovery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectDate(addDays(selectedDate, -1))}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
          >
            Previous day
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(today)}
            className="rounded-lg border border-cyan-500/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-500/20"
          >
            Jump to today
          </button>
          <button
            type="button"
            onClick={() => onSelectDate(addDays(selectedDate, 1))}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:border-slate-500"
          >
            Next day
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
        {stripDays.map((item) => {
          const cardClasses = item.isSelected
            ? "border-cyan-400/60 bg-cyan-500/15"
            : "border-slate-800 bg-slate-950/70";

          return (
            <button
              key={item.dateIso}
              type="button"
              onClick={() => onSelectDate(item.dateIso)}
              className={`rounded-xl border p-3 text-left transition ${cardClasses}`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {formatDisplayDate(item.dateIso)}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{item.template.title}</p>
              <p className="text-xs text-slate-300">{item.template.focus}</p>
              {item.isToday ? (
                <span className="mt-2 inline-block rounded-full border border-fuchsia-400/50 bg-fuchsia-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-fuchsia-100">
                  Today
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
