// Thin, failure-tolerant wrapper over localStorage. Private windows and
// blocked storage throw on access, so every call falls back to memory.

export const STORAGE_KEYS = {
  prefs: 'pdw:prefs',
  todos: 'pdw:todos',
  notes: 'pdw:notes',
  bookingSteps: 'pdw:booking-steps',
  weatherPrefix: 'pdw:wx:',
} as const;

const memory = new Map<string, string>();

export const readRaw = (key: string): string | null => {
  try {
    const value = window.localStorage.getItem(key);
    if (value !== null) return value;
  } catch {
    /* storage unavailable: use memory */
  }
  return memory.get(key) ?? null;
};

export const writeRaw = (key: string, value: string): void => {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* quota or blocked: memory copy still serves this session */
  }
};

export const removeKey = (key: string): void => {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
};

export const parseJSON = <T>(raw: string | null, fallback: T): T => {
  if (raw === null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
};

export const readJSON = <T>(key: string, fallback: T): T => parseJSON(readRaw(key), fallback);

export const writeJSON = (key: string, value: unknown): void => writeRaw(key, JSON.stringify(value));
