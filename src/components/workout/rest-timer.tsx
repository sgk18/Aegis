"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

const PRESET_SECONDS = [60, 90, 120];

function formatClock(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function playCompletionBell() {
  try {
    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;

    if (!AudioContextConstructor) {
      return;
    }

    const context = new AudioContextConstructor();
    const gain = context.createGain();
    const oscillator = context.createOscillator();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(880, context.currentTime);
    gain.gain.setValueAtTime(0.001, context.currentTime);

    oscillator.connect(gain);
    gain.connect(context.destination);

    gain.gain.exponentialRampToValueAtTime(0.2, context.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.6);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.62);
  } catch {
    // Silent fallback when audio context is blocked by the browser.
  }
}

export function RestTimer() {
  const [preset, setPreset] = useState<number>(90);
  const [remaining, setRemaining] = useState<number>(90);
  const [isRunning, setIsRunning] = useState<boolean>(false);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timer = window.setInterval(() => {
      setRemaining((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          playCompletionBell();
          setIsRunning(false);
          return 0;
        }

        return value - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isRunning]);

  const progress = useMemo(() => {
    if (preset <= 0) {
      return 0;
    }
    return Math.max(0, Math.min(100, Math.round((remaining / preset) * 100)));
  }, [preset, remaining]);

  function handlePresetClick(nextPreset: number) {
    setPreset(nextPreset);
    setRemaining(nextPreset);
    setIsRunning(false);
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-100">Rest Timer</h3>
        <p className="text-xs text-slate-400">Auto ring enabled</p>
      </div>

      <div className="mt-3 flex gap-2">
        {PRESET_SECONDS.map((option) => {
          const isActive = option === preset;
          return (
            <button
              key={option}
              type="button"
              onClick={() => handlePresetClick(option)}
              className={`rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100"
                  : "border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500"
              }`}
            >
              {option}s
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/60 p-4">
        <div className="flex items-center justify-between">
          <p className="text-3xl font-semibold text-white">{formatClock(remaining)}</p>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-indigo-400 transition-[width] duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={() => {
              if (remaining <= 0) {
                setRemaining(preset);
              }
              setIsRunning((value) => !value);
            }}
            className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            {isRunning ? "Pause" : "Start"}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRunning(false);
              setRemaining(preset);
            }}
            className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-slate-500"
          >
            Reset
          </button>
        </div>
      </div>
    </motion.section>
  );
}
