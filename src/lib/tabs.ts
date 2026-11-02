import { DAYS, TRIP_END, TRIP_START } from '../data/days';
import type { DayId, TabId } from '../data/types';
import { isTabId, type StartOn } from './prefs';

export const dayForDate = (ymd: string): DayId | null => DAYS.find((day) => day.date === ymd)?.id ?? null;

// The day to show for "today": the trip day itself, else the nearest end.
export const focusDay = (today: string): DayId => {
  const first = DAYS[0];
  const last = DAYS[DAYS.length - 1];
  if (!first || !last) throw new Error('Trip has no days');
  if (today < TRIP_START) return first.id;
  if (today > TRIP_END) return last.id;
  return dayForDate(today) ?? first.id;
};

type InitialTabInput = { hash: string; today: string; startOn: StartOn; lastTab: TabId | null };

export const resolveInitialTab = ({ hash, today, startOn, lastTab }: InitialTabInput): TabId => {
  const fromHash = hash.replace(/^#\/?/, '');
  if (isTabId(fromHash)) return fromHash;
  if (startOn === 'last' && lastTab) return lastTab;
  return focusDay(today);
};

export const adjacentDay = (current: DayId, step: 1 | -1): DayId | null => {
  const index = DAYS.findIndex((day) => day.id === current);
  return DAYS[index + step]?.id ?? null;
};
