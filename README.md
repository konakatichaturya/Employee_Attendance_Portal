# WorkTrack — Employee Attendance & Leave Portal

A cross-platform (web + iOS/Android) attendance and leave management app built with
Expo/React Native. It runs entirely on a frontend mock backend (AsyncStorage-backed) —
no server or database setup required to try it out.

## Features

- **Attendance** — check in/out with location capture, daily and historical views,
  offline-friendly sync queue.
- **Leave management** — apply for Casual/Sick/Earned/Unpaid leave, track balances,
  and view request history with a leave-usage breakdown chart.
- **Three-role hierarchy** — Admin, Manager, Employee, each with tailored dashboards
  (see below).
- **One-stage approval** — Employee applies for leave → their Manager approves or
  rejects it → the leave balance updates.
- **Admin console** — company-wide attendance/leave analytics, a read-only leave
  monitor, employee roster with role badges, and the ability to create new Manager
  and Employee accounts.
- **Org visibility** — Managers see "My Team" (their direct reports' attendance/leave);
  Admins see team rosters inline.
- **AI features** (rule-based, no API key required) — leave-reason rewriting, a
  leave-balance chat assistant, admin attendance insights, and approval-recommendation
  hints for reviewers.
- **Theming** — dark/light mode on the web dashboards.
- **Profile photos** — camera or gallery upload.

## Role model

| Role | How the account is created | What they can do |
|---|---|---|
| **Admin** | Predefined (seeded) | Monitor company-wide attendance/leave, manage the employee roster, create Manager and Employee accounts, apply for their own leave (routes to their assigned Manager) |
| **Manager** | Predefined, or created by Admin | Approve/reject their direct reports' leave requests; view "My Team" |
| **Employee** | Self-registers (picks a Manager at signup), or created by Admin | Check in/out, apply for leave, track balances and request status |

## Tech stack

- **Expo SDK 57** / React Native 0.86 / React 19, TypeScript
- **React Navigation** (native-stack, bottom-tabs) for the native mobile app
- **Redux Toolkit** for auth state, **TanStack React Query** for all data fetching
- **React Hook Form** + **Zod** for form validation
- **react-native-svg** for cross-platform charts (donut/bar), **react-native-paper**
  for base theming
- Mock backend (`src/services/mock/mockServer.ts`) persisted via AsyncStorage —
  no real network calls or server required

## Getting started

```bash
npm install
npm run web       # run in a browser (Admin console + web dashboards)
npm start         # or: npm run android / npm run ios
```

## Demo accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@company.com` | `admin1234` |
| Manager | `manager@company.com` | `manager1234` |
| Employee | `employee@company.com` | `password123` |

Employees can self-register (from the login screen's Employee tab, picking a Manager
at signup) or be created directly by an Admin; Admin and Manager accounts are
predefined or Admin-created.

## Enabling AI features (optional)

The four AI touchpoints run on deterministic, rule-based logic today and work out of
the box with no configuration — no API key needed.

## Project structure

```
src/
  admin/         Web-only Admin console + shared Employee/Manager dashboard
  components/    Shared cross-platform UI primitives
  features/      Native mobile screens, grouped by domain (auth, leave, attendance, ...)
  hooks/         React Query hooks
  navigation/    React Navigation setup (native app)
  services/      Mock backend, API layer, AI logic, storage, location, sync
  store/         Redux Toolkit auth slice
  theme/         Design tokens (colors, spacing, typography)
  types/         Shared TypeScript types
```

## Notes

- This is a frontend-only demo: all "backend" logic lives in
  `src/services/mock/mockServer.ts` and persists to AsyncStorage (web:
  browser localStorage under the hood). There is no real server, so data lives
  in the browser/device it was created on.
- `DateField.web.tsx` and `LocationMapPreview.web.tsx` are web-specific
  implementations swapped in automatically by the bundler in place of native
  modules that don't support web (`@react-native-community/datetimepicker`,
  `react-native-maps`).
