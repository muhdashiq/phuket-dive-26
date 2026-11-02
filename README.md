# Phuket Dive Week

A day-by-day planner for a Phuket trip, 3–10 November 2026: a Phi Phi snorkel tour, five dive days, a rest day and the flight home. Built with React, TypeScript and Vite.

## What it does

A mobile-first app in the style of iOS consumer apps: large titles, a bottom tab bar (a sidebar on wide screens), inset grouped lists, bottom sheets, toasts and light and dark themes.

- **Today**: the selected day's plan. An Apple Fitness-style week strip switches days (or swipe sideways). It shows live weather when it is that day, the forecast, timeline, what to bring, operators, a fallback plan, a checklist and notes. Pull down to refresh the weather.
- **Trip**: every day at a glance with checklist progress, the "Book in this order" steps and costs per diver.
- **Explore**: search across places, days and rainy-day ideas; star places to pin them to Favorites; open any place in Google Maps.
- **Contacts**: one-tap calls to emergency numbers, plus call, WhatsApp, email and copy for each operator.
- **You**: name and avatar, notes history, settings (appearance, start screen, weather location, hide finished items) and data controls.

First launch shows a short welcome that asks for an optional name and explains the location request before the browser asks. Links from earlier versions (`#wed`, `#contacts`, `#costs`, `#planb`) still work.

Everything you enter is kept in this browser's `localStorage` under `pdw:` keys. Nothing is sent to a server, and nothing syncs between devices.

| Key | Holds |
| --- | --- |
| `pdw:prefs` | name, theme, start screen, last screen and day, weather location, hide-finished, onboarding and tips seen |
| `pdw:todos` | per-day ticks and your own checklist items |
| `pdw:notes` | per-day notes |
| `pdw:favorites` | starred places |
| `pdw:booking-steps` | the "Book in this order" ticks |
| `pdw:wx:*` | cached weather responses |

## Develop

```bash
npm install
npm run dev
```

```bash
npm test
```

```bash
npm run build
```

The trip content lives in `src/data/`: `days.tsx` for each day (including the starter checklist), `reference.tsx` for contacts, costs, rainy-day options, places and sources, and `places.ts` for map locations. Screens are in `src/screens/`, shared UI in `src/components/`, and the design tokens at the top of `src/styles.css`.

## Deploy

`.github/workflows/deploy.yml` tests, builds and publishes `dist/` to GitHub Pages on every push to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
