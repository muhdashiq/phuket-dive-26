import { describe, expect, it } from 'vitest';
import { DAYS } from '../data/days';
import { formatTime, sunTimes, TRIP_TZ } from './dates';
import { notesToText, sanitizeNoteStore, setNote } from './notes';
import { DEFAULT_PREFS, initialsOf, sanitizePrefs } from './prefs';
import { readJSON, writeJSON } from './storage';
import { sanitizeFavorites, toggleFavorite } from './favorites';
import { adjacentDay, focusDay, parseHash, resolveInitialRoute, toHash } from './routes';
import { resultCount, searchTrip } from './search';
import { addTodo, removeTodo, restoreTodo, sanitizeTodoStore, todoItems, toggleTodo } from './todos';
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

  it('restores a deleted item in its old place for Undo', () => {
    let store = addTodo({}, 'wed', 'A', 'c-a');
    store = addTodo(store, 'wed', 'B', 'c-b');
    const removed = removeTodo(store, 'wed', 'c-a');
    const restored = restoreTodo(removed, 'wed', { id: 'c-a', text: 'A' }, true, 0);
    expect(restored.wed?.custom.map((t) => t.id)).toEqual(['c-a', 'c-b']);
    expect(restored.wed?.done).toEqual(['c-a']);
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
    expect(sanitizePrefs({ theme: 'neon', lastHash: 'javascript:alert(1)', location: { lat: 200, lon: 0 }, name: 42 })).toEqual(DEFAULT_PREFS);
  });

  it('keeps valid values and trims the name', () => {
    const prefs = sanitizePrefs({ theme: 'dark', startOn: 'last', lastHash: '#contacts', lastDay: 'wed', location: { lat: 7.9, lon: 98.4 }, hideDone: true, name: '  Ashiq ', onboarded: true });
    expect(prefs).toMatchObject({ theme: 'dark', startOn: 'last', lastHash: '#contacts', lastDay: 'wed', hideDone: true, name: 'Ashiq', onboarded: true });
  });

  it('carries over the last tab saved by the previous version', () => {
    expect(sanitizePrefs({ lastTab: 'places' }).lastHash).toBe('#places');
  });

  it('builds avatar initials', () => {
    expect(initialsOf('ashiq')).toBe('A');
    expect(initialsOf('Sea Bees Diving')).toBe('SB');
    expect(initialsOf('   ')).toBe('');
  });
});

describe('favorites', () => {
  it('toggles and drops unknown or duplicate places', () => {
    expect(toggleFavorite(toggleFavorite([], 'mayaBay'), 'mayaBay')).toEqual([]);
    expect(sanitizeFavorites(['mayaBay', 'mayaBay', 'nowhere', 3])).toEqual(['mayaBay']);
  });
});

describe('search', () => {
  it('finds places, days and rainy-day ideas', () => {
    expect(searchTrip('pier').places.map((p) => p.place)).toContain('roongSiamPier');
    expect(searchTrip('similan').days).toContain('thu');
    expect(searchTrip('aquaria').rainy).toEqual(['Aquaria Phuket']);
  });

  it('needs every word to match and ignores case and accents', () => {
    expect(searchTrip('MAYA bay').places.map((p) => p.place)).toEqual(['mayaBay']);
    expect(resultCount(searchTrip('maya museum'))).toBe(0);
    expect(resultCount(searchTrip('   '))).toBe(0);
  });
});

describe('storage', () => {
  it('round-trips JSON even without a browser localStorage', () => {
    writeJSON('test:key', { a: 1 });
    expect(readJSON('test:key', null)).toEqual({ a: 1 });
    expect(readJSON('test:missing', 'fallback')).toBe('fallback');
  });
});

describe('routes', () => {
  it('opens a valid hash first, including links from older versions', () => {
    expect(resolveInitialRoute({ hash: '#wed', today: '2026-11-05', startOn: 'today', lastHash: null })).toEqual({ screen: 'today', day: 'wed' });
    expect(parseHash('#costs')).toEqual({ screen: 'trip' });
    expect(parseHash('#planb')).toEqual({ screen: 'explore', segment: 'rainy' });
    expect(parseHash('#bogus')).toBeNull();
  });

  it("opens today's day during the trip, the first day before it, the last day after it", () => {
    expect(resolveInitialRoute({ hash: '', today: '2026-11-05', startOn: 'today', lastHash: '#trip' })).toEqual({ screen: 'today', day: 'thu' });
    expect(focusDay('2026-11-02')).toBe('tue3');
    expect(focusDay('2026-12-01')).toBe('tue');
  });

  it('opens the last screen when that preference is set', () => {
    expect(resolveInitialRoute({ hash: '', today: '2026-11-05', startOn: 'last', lastHash: '#contacts' })).toEqual({ screen: 'contacts' });
  });

  it('round-trips every route through the hash', () => {
    const routes = [{ screen: 'today', day: 'sat' }, { screen: 'trip' }, { screen: 'explore', segment: 'rainy' }, { screen: 'explore', segment: 'places' }, { screen: 'contacts' }, { screen: 'you' }] as const;
    routes.forEach((route) => expect(parseHash(toHash(route))).toEqual(route));
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
