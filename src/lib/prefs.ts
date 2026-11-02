import { COMMON_TAB_IDS, DAY_IDS, type TabId } from '../data/types';

export const THEMES = ['system', 'light', 'dark'] as const;
export type Theme = (typeof THEMES)[number];

export const START_OPTIONS = ['today', 'last'] as const;
export type StartOn = (typeof START_OPTIONS)[number];

export type LatLon = { lat: number; lon: number };

export type Prefs = {
  theme: Theme;
  startOn: StartOn;
  lastTab: TabId | null;
  location: LatLon | null;
  hideDone: boolean;
  nowCollapsed: boolean;
};

export const DEFAULT_PREFS: Prefs = {
  theme: 'system',
  startOn: 'today',
  lastTab: null,
  location: null,
  hideDone: false,
  nowCollapsed: false,
};

const TAB_IDS: readonly string[] = [...DAY_IDS, ...COMMON_TAB_IDS];

export const isTabId = (value: unknown): value is TabId => typeof value === 'string' && TAB_IDS.includes(value);

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

// Stored data can be stale or hand-edited, so every field is checked.
export const sanitizePrefs = (raw: unknown): Prefs => {
  if (!isRecord(raw)) return DEFAULT_PREFS;
  return {
    theme: oneOf(THEMES, raw.theme, DEFAULT_PREFS.theme),
    startOn: oneOf(START_OPTIONS, raw.startOn, DEFAULT_PREFS.startOn),
    lastTab: isTabId(raw.lastTab) ? raw.lastTab : null,
    location: sanitizeLatLon(raw.location),
    hideDone: raw.hideDone === true,
    nowCollapsed: raw.nowCollapsed === true,
  };
};
