# Phuket Dive Week

A day-by-day planner for a Phuket trip, 3–10 November 2026: a Phi Phi snorkel tour, five dive days, a rest day and the flight home. Built with React, TypeScript and Vite.

## What it does

A mobile-first app in the style of iOS consumer apps: large titles, a bottom tab bar (Today, Trip, Chat, Explore, Contacts; a sidebar on wide screens), inset grouped lists, bottom sheets, toasts and light and dark themes. Your profile and settings open from the avatar on every screen.

- **Today**: the selected day's plan. An Apple Fitness-style week strip switches days (or swipe sideways). It shows live weather when it is that day, the forecast, timeline, what to bring, operators, a fallback plan, a checklist and notes. Pull down to refresh the weather.
- **Trip**: every day at a glance with checklist progress, the "Book in this order" steps and costs per diver. **Plan a new day** picks a free date, takes a short description ("two easy reef dives and a seafood dinner"), and has the connected AI service draft the day from your profile and the rest of the trip: timeline, dive sites, what to bring, a checklist, tips and map links. Review it, then add it; added days work like the built-in ones and can be deleted.
- **Share**: pick days with checkboxes, choose a summary or the full plan, optionally include checklists and your notes, then share through the phone's share sheet or copy the text for WhatsApp.
- **Chat**: talk about the diving on any day. The AI gets that day's plan, its forecast and your profile, and answers about sites, marine life, conditions and gas planning. Each day keeps its own conversation; replies stream in and can be stopped.
- **Explore**: search across places, days and rainy-day ideas; star places to pin them to Favorites; open any place in Google Maps.
- **Contacts**: one-tap calls to emergency numbers, plus call, WhatsApp, email and copy for each operator.
- **You**: profile details (home country, certification, logged dives, nitrox, comfortable depth, interests, pace, budget, diet, seasickness), AI services, name and profile photo (chosen or taken on the device, cropped to a small square), notes history, settings (appearance, start screen, notifications, weather location, hide finished items) and data controls.
- **Notifications**: the bell on Today lists reminders as they come due: plan reminders written for each day (pickups, cash, decisions), weather alerts when the live forecast shows heavy rain or strong gusts on a boat day, unticked checklist items the evening before, and a prompt to write the day's note. Each kind can be switched off. With permission, they also arrive as system notifications through a small service worker (`public/sw.js`).

  Without a push server, system notifications only fire while the app is open or running in the background. A fully closed app can't wake the phone. On iPhone and iPad, web notifications need the app added to the Home Screen first (`public/manifest.webmanifest` makes it installable).

First launch shows a short welcome that asks for an optional name and explains the location request before the browser asks. Links from earlier versions (`#wed`, `#contacts`, `#costs`, `#planb`) still work.

### AI services

Connect one or more in **You → AI services**; one is in use at a time.

| Service | How you connect | Called with |
| --- | --- | --- |
| Claude (Anthropic) | API key from the Anthropic console | the official `@anthropic-ai/sdk`, defaulting to `claude-opus-5-5`, with streaming, structured output for plans, and server-side refusal fallback |
| OpenAI | API key | REST: `/v1/chat/completions` |
| Google Gemini | API key from Google AI Studio | REST: `streamGenerateContent` / `generateContent` |
| OpenRouter | **Sign in with OpenRouter** (OAuth with PKCE, no server needed), or an API key | REST, OpenAI-compatible |

Anthropic, OpenAI and Google don't offer "sign in with your account" for third-party apps, so those connect with an API key. Requests go straight from the browser to the provider. Keys are stored in this browser's `localStorage`: anyone with access to the browser can use them, so set a spending limit on the key and disconnect when you're done. Plans from every provider are checked against the same structure before they're shown. The AI clients load only when first used.

### Storage

Everything you enter is kept in this browser's `localStorage` under `pdw:` keys. Nothing is sent to a server except your AI requests, which go directly to the AI service you connected, and nothing syncs between devices.

| Key | Holds |
| --- | --- |
| `pdw:prefs` | name, theme, start screen, last screen and day, weather location, hide-finished, onboarding and tips seen |
| `pdw:todos` | per-day ticks and your own checklist items |
| `pdw:notes` | per-day notes |
| `pdw:favorites` | starred places |
| `pdw:photo` | profile photo, a small JPEG data URL |
| `pdw:notify` | notification settings, and which reminders were read, cleared or alerted |
| `pdw:profile` | profile details used to tailor plans and chat |
| `pdw:llm` | connected AI services: provider, API key, chosen model |
| `pdw:custom-days` | days you added: date, your prompt, the model and the generated plan |
| `pdw:chats` | chat conversations, per day |
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

The trip content lives in `src/data/`: `days.tsx` for each day (including the starter checklist and plan reminders), `reference.tsx` for contacts, costs, rainy-day options, places and sources, and `places.ts` for map locations. Screens are in `src/screens/`, shared UI in `src/components/`, and the design tokens at the top of `src/styles.css`.

## Deploy

`.github/workflows/deploy.yml` tests, builds and publishes `dist/` to GitHub Pages on every push to `main`. In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions**.
