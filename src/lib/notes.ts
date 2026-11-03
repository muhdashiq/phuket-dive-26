import { DAY_ID_PATTERN, type DayId } from '../data/types';

export type DayNote = { text: string; updatedAt: number };
export type NoteStore = Partial<Record<DayId, DayNote>>;

export const MAX_NOTE_LENGTH = 20000;

export const setNote = (store: NoteStore, day: DayId, text: string, now: number): NoteStore => {
  const next = { ...store };
  if (text.trim() === '') delete next[day];
  else next[day] = { text: text.slice(0, MAX_NOTE_LENGTH), updatedAt: now };
  return next;
};

export const sanitizeNoteStore = (raw: unknown): NoteStore => {
  if (typeof raw !== 'object' || raw === null) return {};
  const source = raw as Record<string, unknown>;
  const store: NoteStore = {};
  Object.keys(source).filter((day) => DAY_ID_PATTERN.test(day)).forEach((day) => {
    const entry = source[day];
    if (typeof entry !== 'object' || entry === null) return;
    const { text, updatedAt } = entry as Record<string, unknown>;
    if (typeof text === 'string' && text.trim() !== '') {
      store[day] = { text, updatedAt: typeof updatedAt === 'number' ? updatedAt : 0 };
    }
  });
  return store;
};

// Plain-text export so notes survive a cleared browser.
export const notesToText = (store: NoteStore, days: { id: DayId; label: string }[]): string =>
  days
    .filter((day) => store[day.id])
    .map((day) => `${day.label}\n${'-'.repeat(day.label.length)}\n${store[day.id]?.text.trim() ?? ''}\n`)
    .join('\n');
