import { DAY_IDS, type DayId } from '../data/types';

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const START_OPTIONS = ['today', 'last'] as const;
export type StartOn = (typeof START_OPTIONS)[number];

export type LatLon = { lat: number; lon: number };

export type Prefs = {
  theme: Theme;
  startOn: StartOn;
  lastHash: string | null;
  lastDay: DayId | null;
  location: LatLon | null;
  hideDone: boolean;
  name: string;
  onboarded: boolean;
  tipsSeen: string[];
};

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  startOn: 'today',
  lastHash: null,
  lastDay: null,
  location: null,
  hideDone: false,
  name: '',
  onboarded: false,
  tipsSeen: [],
};

export const MAX_NAME_LENGTH = 40;

export const isDayId = (value: unknown): value is DayId => typeof value === 'string' && (DAY_IDS as readonly string[]).includes(value);

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

const oneOf = <T extends string>(options: readonly T[], value: unknown, fallback: T): T =>
  typeof value === 'string' && (options as readonly string[]).includes(value) ? (value as T) : fallback;

export const sanitizeLatLon = (value: unknown): LatLon | null => {
  if (!isRecord(value)) return null;
  const { lat, lon } = value;
  if (typeof lat !== 'number' || typeof lon !== 'number' || !Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;
  return { lat, lon };
};

const HASH_PATTERN = /^#[a-z0-9-]{1,24}$/;

// Stored data can be stale or hand-edited, so every field is checked.
export const sanitizePrefs = (raw: unknown): Prefs => {
  if (!isRecord(raw)) return DEFAULT_PREFS;
  // The previous version stored the last tab id as "lastTab".
  const legacyHash = typeof raw.lastTab === 'string' ? `#${raw.lastTab}` : null;
  const lastHash = typeof raw.lastHash === 'string' ? raw.lastHash : legacyHash;
  return {
    theme: oneOf(THEMES, raw.theme, DEFAULT_PREFS.theme),
    startOn: oneOf(START_OPTIONS, raw.startOn, DEFAULT_PREFS.startOn),
    lastHash: lastHash && HASH_PATTERN.test(lastHash) ? lastHash : null,
    lastDay: isDayId(raw.lastDay) ? raw.lastDay : null,
    location: sanitizeLatLon(raw.location),
    hideDone: raw.hideDone === true,
    name: typeof raw.name === 'string' ? raw.name.trim().slice(0, MAX_NAME_LENGTH) : '',
    onboarded: raw.onboarded === true,
    tipsSeen: Array.isArray(raw.tipsSeen) ? raw.tipsSeen.filter((x): x is string => typeof x === 'string').slice(0, 20) : [],
  };
};

export const initialsOf = (name: string): string =>
  name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
