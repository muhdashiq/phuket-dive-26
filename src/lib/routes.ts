import { getDays, hasDay, tripEnd, tripStart } from '../data/trip';
import type { DayId } from '../data/types';
import type { StartOn } from './prefs';

export type ExploreSegment = 'places' | 'rainy';

export type Route =
  | { screen: 'today'; day: DayId }
  | { screen: 'trip' }
  | { screen: 'explore'; segment: ExploreSegment }
  | { screen: 'chat' }
  | { screen: 'contacts' }
  | { screen: 'you' };

export type Screen = Route['screen'];

// Hashes from the earlier versions (#costs, #places, #planb) keep working.
export const parseHash = (hash: string): Route | null => {
  const id = hash.replace(/^#\/?/, '').toLowerCase();
  if (hasDay(id)) return { screen: 'today', day: id };
  switch (id) {
    case 'trip':
    case 'costs':
      return { screen: 'trip' };
    case 'explore':
    case 'places':
      return { screen: 'explore', segment: 'places' };
    case 'planb':
    case 'rainy':
      return { screen: 'explore', segment: 'rainy' };
    case 'chat':
      return { screen: 'chat' };
    case 'contacts':
    case 'sos':
      return { screen: 'contacts' };
    case 'you':
    case 'settings':
      return { screen: 'you' };
    default:
      return null;
  }
};

export const toHash = (route: Route): string => {
  switch (route.screen) {
    case 'today':
      return `#${route.day}`;
    case 'explore':
      return route.segment === 'rainy' ? '#planb' : '#places';
    default:
      return `#${route.screen}`;
  }
};

export const dayForDate = (ymd: string): DayId | null => getDays().find((day) => day.date === ymd)?.id ?? null;

// The day to show for "today": the trip day itself, else the nearest end.
export const focusDay = (today: string): DayId => {
  const days = getDays();
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) throw new Error('Trip has no days');
  if (today < tripStart()) return first.id;
  if (today > tripEnd()) return last.id;
  return dayForDate(today) ?? first.id;
};

type InitialRouteInput = { hash: string; today: string; startOn: StartOn; lastHash: string | null };

export const resolveInitialRoute = ({ hash, today, startOn, lastHash }: InitialRouteInput): Route => {
  const fromHash = parseHash(hash);
  if (fromHash) return fromHash;
  const fromLast = startOn === 'last' && lastHash ? parseHash(lastHash) : null;
  return fromLast ?? { screen: 'today', day: focusDay(today) };
};

export const adjacentDay = (current: DayId, step: 1 | -1): DayId | null => {
  const days = getDays();
  const index = days.findIndex((day) => day.id === current);
  if (index < 0) return null;
  return days[index + step]?.id ?? null;
};

export const dayIndex = (id: DayId): number => getDays().findIndex((day) => day.id === id);
