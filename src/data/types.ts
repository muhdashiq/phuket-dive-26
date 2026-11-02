import type { ReactNode } from 'react';

export const DAY_IDS = ['tue3', 'wed', 'thu', 'fri', 'sat', 'sun', 'mon', 'tue'] as const;
export type DayId = (typeof DAY_IDS)[number];

export type Tone = 'good' | 'watch' | 'poor' | 'rest';

export type SeaArea = 'racha' | 'similan' | 'south' | 'phiphi' | 'west';

export type Place = {
  name: string;
  query: string;
  placeId?: string;
};

export type PhotoInfo = {
  file: string; // Wikimedia Commons file name
  alt: string;
  caption: string;
};

// Offline fallback for the weather strip; live data replaces these when online.
export type WeatherFallback = {
  air?: string;
  rain?: string;
  rainPct?: number;
  wind?: string;
  sea?: string;
  seaNote?: string;
};

export type TodoSeed = {
  id: string;
  text: string;
};

// A plan reminder; `at` is local Phuket time (YYYY-MM-DDTHH:mm).
export type ReminderSeed = {
  id: string;
  at: string;
  title: string;
  body: string;
};

export type DayPlan = {
  id: DayId;
  date: string;
  dow: string;
  dom: string;
  tone: Tone;
  pill: string;
  title: string;
  sub: ReactNode;
  chipNote?: string;
  photo?: PhotoInfo;
  sea: SeaArea | null;
  weather: WeatherFallback;
  extraCells?: { label: string; value: string; small?: string }[];
  weatherNote?: string;
  left: ReactNode;
  right?: ReactNode;
  planB?: { title: string; items: ReactNode[] };
  todos: TodoSeed[];
  reminders?: ReminderSeed[];
};
