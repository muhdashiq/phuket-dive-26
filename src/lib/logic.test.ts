import { describe, expect, it } from 'vitest';
import { DAYS } from '../data/days';
import { formatTime, sunTimes, TRIP_TZ } from './dates';
import { notesToText, sanitizeNoteStore, setNote } from './notes';
import { DEFAULT_PREFS, sanitizePrefs } from './prefs';
import { readJSON, writeJSON } from './storage';
import { adjacentDay, focusDay, resolveInitialTab } from './tabs';
import { addTodo, removeTodo, sanitizeTodoStore, todoItems, toggleTodo } from './todos';
import { parseDaily } from './weather';

describe('todos', () => {
  const seeds = [{ id: 'cash', text: 'Get cash' }];

  it('toggles a seeded item on and off', () => {
    const on = toggleTodo({}, 'tue3', 'cash');
    expect(todoItems(seeds, on, 'tue3')[0]?.done).toBe(true);
    const off = toggleTodo(on, 'tue3', 'cash');
    expect(todoItems(seeds, off, 'tue3')[0]?.done).toBe(false);
  });

  it('keeps each day separate', () => {
    const store = toggleTodo({}, 'tue3', 'cash');
    expect(todoItems(seeds, store, 'wed')[0]?.done).toBe(false);
  });

  it('adds trimmed custom items, ignores blank ones, and removes them with their tick', () => {
    let store = addTodo({}, 'wed', '  Buy defog  ', 'c-1');
    store = addTodo(store, 'wed', '   ', 'c-2');
    store = toggleTodo(store, 'wed', 'c-1');
    expect(todoItems([], store, 'wed')).toEqual([{ id: 'c-1', text: 'Buy defog', done: true, custom: true }]);
    store = removeTodo(store, 'wed', 'c-1');
    expect(store.wed).toEqual({ done: [], custom: [] });
  });

  it('drops malformed stored data', () => {
    const store = sanitizeTodoStore({ wed: { done: ['a', 3], custom: [{ id: 'x', text: 'ok' }, { id: 1 }] }, bogus: {} });
    expect(store).toEqual({ wed: { done: [], custom: [{ id: 'x', text: 'ok' }] } });
  });
});

describe('notes', () => {
  it('saves text with a timestamp and deletes empty notes', () => {
    const saved = setNote({}, 'thu', 'Saw a whale shark', 5);
    expect(saved.thu).toEqual({ text: 'Saw a whale shark', updatedAt: 5 });
    expect(setNote(saved, 'thu', '   ', 6).thu).toBeUndefined();
  });

  it('exports notes in trip order', () => {
    const store = sanitizeNoteStore({ wed: { text: 'B', updatedAt: 1 }, tue3: { text: 'A', updatedAt: 1 } });
    const text = notesToText(store, { tue3: 'Tue 3', wed: 'Wed 4' } as never);
    expect(text.indexOf('Tue 3')).toBeLessThan(text.indexOf('Wed 4'));
  });
});

describe('prefs', () => {
  it('falls back to defaults for missing or invalid fields', () => {
    expect(sanitizePrefs(null)).toEqual(DEFAULT_PREFS);
    expect(sanitizePrefs({ theme: 'neon', lastTab: 'nowhere', location: { lat: 200, lon: 0 } })).toEqual(DEFAULT_PREFS);
  });

  it('keeps valid values', () => {
    const prefs = sanitizePrefs({ theme: 'dark', startOn: 'last', lastTab: 'contacts', location: { lat: 7.9, lon: 98.4 }, hideDone: true });
    expect(prefs).toMatchObject({ theme: 'dark', startOn: 'last', lastTab: 'contacts', location: { lat: 7.9, lon: 98.4 }, hideDone: true });
  });
});

describe('storage', () => {
  it('round-trips JSON even without a browser localStorage', () => {
    writeJSON('test:key', { a: 1 });
    expect(readJSON('test:key', null)).toEqual({ a: 1 });
    expect(readJSON('test:missing', 'fallback')).toBe('fallback');
  });
});

describe('tabs', () => {
  it('opens a valid hash first', () => {
    expect(resolveInitialTab({ hash: '#places', today: '2026-11-05', startOn: 'today', lastTab: 'wed' })).toBe('places');
  });

  it("opens today's day during the trip, the first day before it, the last day after it", () => {
    expect(resolveInitialTab({ hash: '', today: '2026-11-05', startOn: 'today', lastTab: 'costs' })).toBe('thu');
    expect(focusDay('2026-11-02')).toBe('tue3');
    expect(focusDay('2026-12-01')).toBe('tue');
  });

  it('opens the last tab when that preference is set', () => {
    expect(resolveInitialTab({ hash: '#bogus', today: '2026-11-05', startOn: 'last', lastTab: 'costs' })).toBe('costs');
  });

  it('walks between days', () => {
    expect(adjacentDay('tue3', -1)).toBeNull();
    expect(adjacentDay('tue3', 1)).toBe('wed');
    expect(adjacentDay('tue', 1)).toBeNull();
  });

  it('has one day per consecutive date', () => {
    const dates = DAYS.map((d) => d.date);
    expect(dates).toEqual([...dates].sort());
    expect(new Set(DAYS.map((d) => d.id)).size).toBe(DAYS.length);
  });
});

describe('weather and sun', () => {
  it('computes Phuket sunrise and sunset close to the published times', () => {
    const sun = sunTimes('2026-11-03', 7.8804, 98.3923, 7);
    expect(formatTime(sun.rise ?? 0, TRIP_TZ)).toMatch(/^06:1[2-7]$/);
    expect(formatTime(sun.set ?? 0, TRIP_TZ)).toMatch(/^18:0[3-8]$/);
  });

  it('parses an Open-Meteo daily payload and tolerates missing fields', () => {
    const parsed = parseDaily(
      { utc_offset_seconds: 25200, daily: { time: ['2026-11-03'], precipitation_probability_max: [40], sunrise: ['2026-11-03T06:14'] } },
      0,
    );
    expect(parsed['2026-11-03']?.rainPct).toBe(40);
    expect(parsed['2026-11-03']?.tMax).toBeNull();
    expect(formatTime(parsed['2026-11-03']?.sunrise ?? 0, TRIP_TZ)).toBe('06:14');
    expect(parseDaily('garbage', 0)).toEqual({});
  });
});
