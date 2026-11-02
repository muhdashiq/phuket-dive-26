import { DAY_IDS, type DayId } from '../data/types';

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
  DAY_IDS.forEach((day) => {
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
export const notesToText = (store: NoteStore, labels: Record<DayId, string>): string =>
  DAY_IDS.filter((day) => store[day])
    .map((day) => `${labels[day]}\n${'-'.repeat(labels[day].length)}\n${store[day]?.text.trim() ?? ''}\n`)
    .join('\n');
