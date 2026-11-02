import { DAYS } from '../data/days';
import type { DayId } from '../data/types';
import { addDaysToYmd, localIsoToMs, TRIP_OFFSET_S } from './dates';
import type { NoteStore } from './notes';
import { todoItems, type TodoStore } from './todos';
import type { DailyWeather } from './weather';

export const REMINDER_KINDS = ['plan', 'weather', 'checklist', 'note'] as const;
export type ReminderKind = (typeof REMINDER_KINDS)[number];

export type Reminder = {
  id: string;
  kind: ReminderKind;
  day: DayId;
  at: number;
  title: string;
  body: string;
};

export const KIND_LABELS: Record<ReminderKind, { label: string; detail: string }> = {
  plan: { label: 'Plan reminders', detail: 'Pickups, cash to bring, decisions to make' },
  weather: { label: 'Weather alerts', detail: 'Heavy rain or strong wind on a boat day' },
  checklist: { label: 'Checklist nudges', detail: 'Unticked items the evening before' },
  note: { label: 'Note prompts', detail: 'A nudge to log the day in the evening' },
};

const RAIN_ALERT_PCT = 60;
const GUST_ALERT_KMH = 40;

const at = (ymd: string, hhmm: string) => localIsoToMs(`${ymd}T${hhmm}`, TRIP_OFFSET_S);

type BuildInput = { todos: TodoStore; notes: NoteStore; daily: Record<string, DailyWeather> };

// Every reminder for the trip. Conditional ones (weather, checklist, notes)
// appear or disappear as the forecast, ticks and notes change.
export const buildReminders = ({ todos, notes, daily }: BuildInput): Reminder[] => {
  const list: Reminder[] = [];

  DAYS.forEach((day) => {
    const label = `${day.dow} ${day.dom}`;
    const eve = addDaysToYmd(day.date, -1);

    day.reminders?.forEach((seed) => {
      list.push({ id: `plan-${day.id}-${seed.id}`, kind: 'plan', day: day.id, at: localIsoToMs(seed.at, TRIP_OFFSET_S), title: seed.title, body: seed.body });
    });

    const wx = daily[day.date];
    if (day.sea && wx) {
      const rainy = wx.rainPct !== null && wx.rainPct >= RAIN_ALERT_PCT;
      const windy = wx.gustMax !== null && wx.gustMax >= GUST_ALERT_KMH;
      if (rainy || windy) {
        const reasons = [rainy && `${wx.rainPct}% chance of rain`, windy && `gusts to ${Math.round(wx.gustMax ?? 0)} km/h`].filter(Boolean).join(' and ');
        list.push({
          id: `wx-${day.id}`,
          kind: 'weather',
          day: day.id,
          at: at(eve, '18:00'),
          title: `Rough weather possible on ${label}`,
          body: `Forecast shows ${reasons}. Check with the operator tonight and keep a Plan B ready.`,
        });
      }
    }

    const left = todoItems(day.todos, todos, day.id).filter((item) => !item.done);
    if (left.length > 0) {
      list.push({
        id: `todo-${day.id}`,
        kind: 'checklist',
        day: day.id,
        at: at(eve, '20:30'),
        title: `${left.length} ${left.length === 1 ? 'item' : 'items'} left for ${label}`,
        body: left.slice(0, 3).map((item) => item.text).join(' · ') + (left.length > 3 ? ' · …' : ''),
      });
    }

    if (!notes[day.id]) {
      list.push({
        id: `note-${day.id}`,
        kind: 'note',
        day: day.id,
        at: at(day.date, '21:00'),
        title: `How was ${label}?`,
        body: 'Add a few lines to your notes while you still remember the details.',
      });
    }
  });

  return list.sort((a, b) => a.at - b.at);
};

/* ---------- Read state and settings ---------- */

export type NotifyState = {
  system: boolean;
  kinds: Record<ReminderKind, boolean>;
  read: string[];
  dismissed: string[];
  notified: string[];
};

export const DEFAULT_NOTIFY: NotifyState = {
  system: false,
  kinds: { plan: true, weather: true, checklist: true, note: true },
  read: [],
  dismissed: [],
  notified: [],
};

const MAX_IDS = 300;
const ids = (value: unknown): string[] => (Array.isArray(value) ? value.filter((x): x is string => typeof x === 'string').slice(-MAX_IDS) : []);

export const sanitizeNotify = (raw: unknown): NotifyState => {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_NOTIFY;
  const r = raw as Record<string, unknown>;
  const kindsRaw = typeof r.kinds === 'object' && r.kinds !== null ? (r.kinds as Record<string, unknown>) : {};
  const kinds = Object.fromEntries(REMINDER_KINDS.map((k) => [k, kindsRaw[k] !== false])) as Record<ReminderKind, boolean>;
  return { system: r.system === true, kinds, read: ids(r.read), dismissed: ids(r.dismissed), notified: ids(r.notified) };
};

// Reminders that have arrived and are switched on, newest first.
export const delivered = (all: Reminder[], state: NotifyState, now: number): Reminder[] =>
  all.filter((r) => r.at <= now && state.kinds[r.kind] && !state.dismissed.includes(r.id)).reverse();

export const upcoming = (all: Reminder[], state: NotifyState, now: number, count = 3): Reminder[] =>
  all.filter((r) => r.at > now && state.kinds[r.kind]).slice(0, count);

export const unreadCount = (all: Reminder[], state: NotifyState, now: number): number =>
  delivered(all, state, now).filter((r) => !state.read.includes(r.id)).length;

// Alerts only go out for reminders that arrived recently, so opening the
// app late doesn't fire a burst of stale ones. Newest first.
export const ALERT_WINDOW_MS = 30 * 60 * 1000;

export const dueForAlert = (all: Reminder[], state: NotifyState, now: number): Reminder[] =>
  delivered(all, state, now).filter((r) => now - r.at <= ALERT_WINDOW_MS && !state.notified.includes(r.id));

export const addIds = (list: string[], more: string[]): string[] => [...new Set([...list, ...more])].slice(-MAX_IDS);
