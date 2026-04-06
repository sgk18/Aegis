# Hero's Logbook Architecture

## System Design

- Frontend: Next.js App Router + React + Tailwind + Framer Motion.
- Auth + data layer: Supabase (Auth, Postgres, Row Level Security).
- Real-time and history strategy:
  - workout_sessions + workout_set_logs for exact set-level training data
  - nutrition_logs for daily calorie and macro compliance
  - v_previous_week_targets view for progressive overload hints

## Core Domain Flow

1. User selects a date.
2. App resolves the repeating session key from the 7-day A/B PPL cycle.
3. Workout logger loads template exercises and previous comparable session targets.
4. User logs sets, reps, and weights.
5. Session volume is computed client-side and persisted.
6. Nutrition is logged for the same date and compared to macro goals.
7. Analytics computes weight trend, cumulative volume, and streak.
8. Saga phase is derived from program month to adjust UI atmosphere.

## Recommended Folder Structure

```
src/
  app/
    api/
      export-prd/
        route.ts
    layout.tsx
    page.tsx
    globals.css
  components/
    dashboard/
      hero-analytics.tsx
      nutrition-panel.tsx
      weekly-cycle.tsx
    workout/
      rest-timer.tsx
      workout-logger.tsx
  lib/
    heroes-logbook.ts
supabase/
  schema.sql
docs/
  architecture.md
```

## Scalability Notes

- Keep templates data-driven in Postgres once admin tooling is added.
- Move local state persistence to Supabase per user after auth is integrated.
- Add server actions for writes when moving from local-only to cloud sync.
- Add chart abstraction if future metrics (RPE, sleep debt, HRV) are introduced.
- Add a notifications table for reminders and level-up badges.
