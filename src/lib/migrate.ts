import { readJSON, readRaw, STORAGE_KEYS, writeJSON } from './storage';
import { sanitizeLatLon } from './prefs';

// The original single-page version stored the weather location and the
// booking checklist under "dw:" keys. Carry them over once.
export const migrateLegacyStorage = (): void => {
  if (readRaw(STORAGE_KEYS.prefs) === null) {
    const location = sanitizeLatLon(readJSON<unknown>('dw:loc', null));
    if (location) writeJSON(STORAGE_KEYS.prefs, { location });
  }
  if (readRaw(STORAGE_KEYS.bookingSteps) === null) {
    const legacy = readJSON<unknown>('dw:steps', null);
    if (typeof legacy === 'object' && legacy !== null) {
      const ticked = Object.entries(legacy as Record<string, unknown>).filter(([, v]) => v === true).map(([k]) => k);
      if (ticked.length) writeJSON(STORAGE_KEYS.bookingSteps, ticked);
    }
  }
};
