# Phuket Dive Week

A day-by-day planner for a Phuket trip, 3–10 November 2026: a Phi Phi snorkel tour, five dive days, a rest day and the flight home. Built with React, TypeScript and Vite.

## What it does

- **One tab per day**, plus shared tabs for **Contacts** (emergency numbers and operators), **Places** (Google Maps links), **Costs** and **Plan B**. The tab is in the URL (`#tue3`, `#contacts`), so links can be shared and the back button works. On a phone, swipe a day sideways to move to the previous or next day.
- **Checklist per day**: starter items for each day's activities, plus your own. Tick them off, hide finished ones, delete the ones you added.
- **Notes per day** at the bottom of each day tab. They save as you type, and can be downloaded as a text file from Settings.
- **Live weather** from Open-Meteo: a Right now panel and per-day forecasts, cached for 10 minutes. Offline, it falls back to the values checked on 2 Nov.
- **Settings** (theme, which tab opens first, hide finished items, collapse the weather panel, weather location).

Everything you enter is kept in this browser's `localStorage` under `pdw:` keys. Nothing is sent to a server, and nothing syncs between devices.

| Key | Holds |
| --- | --- |
| `pdw:prefs` | theme, start tab, last tab, weather location, display toggles |
| `pdw:todos` | per-day ticks and your own checklist items |
| `pdw:notes` | per-day notes |
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

The trip content lives in `src/data/`: `days.tsx` for each day (including the starter checklist), `reference.tsx` for costs, rainy-day options, places and sources, and `places.ts` for map locations.

## Deploy

`.github/workflows/deploy.yml` tests, builds and publishes `dist/` to GitHub Pages on every push to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
