import { useSyncExternalStore } from 'react';
import { sanitizeCustomDays, toDayPlan, type CustomDay } from '../lib/customDays';
import { readJSON, STORAGE_KEYS, tryWriteRaw } from '../lib/storage';
import { BUILT_IN_DAYS } from './days';
import type { DayId, DayPlan } from './types';

// The trip is the built-in days plus any days added from a prompt. It is a
// small external store so plain modules (routes, reminders, search) and
// React components read the same list.

type Snapshot = { custom: CustomDay[]; days: DayPlan[]; byId: Map<DayId, DayPlan> };

const build = (custom: CustomDay[]): Snapshot => {
  const builtInDates = new Set(BUILT_IN_DAYS.map((d) => d.date));
  const extra = custom.filter((c) => !builtInDates.has(c.date)).map(toDayPlan);
  const days = [...BUILT_IN_DAYS, ...extra].sort((a, b) => a.date.localeCompare(b.date));
  return { custom, days, byId: new Map(days.map((d) => [d.id, d])) };
};

let snapshot = build(sanitizeCustomDays(readJSON<unknown>(STORAGE_KEYS.customDays, [])));
const listeners = new Set<() => void>();

const publish = (custom: CustomDay[]) => {
  snapshot = build(custom);
  listeners.forEach((listener) => listener());
};

export const getDays = (): DayPlan[] => snapshot.days;
export const getDay = (id: DayId): DayPlan | undefined => snapshot.byId.get(id);
export const getCustomDays = (): CustomDay[] => snapshot.custom;
export const hasDay = (id: unknown): id is DayId => typeof id === 'string' && snapshot.byId.has(id);
export const tripStart = (): string => snapshot.days[0]?.date ?? '';
export const tripEnd = (): string => snapshot.days[snapshot.days.length - 1]?.date ?? '';
export const isDateTaken = (date: string): boolean => snapshot.days.some((d) => d.date === date);

// Returns false if the browser could not store it.
export const saveCustomDays = (custom: CustomDay[]): boolean => {
  const ok = tryWriteRaw(STORAGE_KEYS.customDays, JSON.stringify(custom));
  publish(custom);
  return ok;
};

export const addCustomDay = (day: CustomDay): boolean => saveCustomDays([...snapshot.custom.filter((c) => c.date !== day.date), day]);
export const removeCustomDay = (id: DayId): boolean => saveCustomDays(snapshot.custom.filter((c) => c.id !== id));

// Other tabs adding or removing days.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === STORAGE_KEYS.customDays) publish(sanitizeCustomDays(readJSON<unknown>(STORAGE_KEYS.customDays, [])));
  });
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export const useTrip = () => useSyncExternalStore(subscribe, () => snapshot);
