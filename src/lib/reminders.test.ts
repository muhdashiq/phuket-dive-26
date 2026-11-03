import { describe, expect, it } from 'vitest';
import { localIsoToMs, TRIP_OFFSET_S } from './dates';
import { sanitizePhoto } from './photo';
import { buildReminders, DEFAULT_NOTIFY, delivered, dueForAlert, sanitizeNotify, unreadCount, upcoming } from './reminders';
import { toggleTodo } from './todos';
import type { DailyWeather } from './weather';

const t = (iso: string) => localIsoToMs(iso, TRIP_OFFSET_S);
const empty = { todos: {}, notes: {}, daily: {} };
const wx = (over: Partial<DailyWeather>): DailyWeather => ({
  code: 61, tMax: 30, tMin: 25, rainPct: 20, rainMm: 1, windMax: 15, gustMax: 25, windDir: 180, sunrise: null, sunset: null, ...over,
});

describe('buildReminders', () => {
  it('includes the plan reminders in time order', () => {
    const all = buildReminders(empty);
    const pickup = all.find((r) => r.id === 'plan-tue3-pickup');
    expect(pickup?.at).toBe(t('2026-11-03T07:10'));
    expect(all.map((r) => r.at)).toEqual([...all.map((r) => r.at)].sort((a, b) => a - b));
  });

  it('nudges about unticked items the evening before, and stops once all are ticked', () => {
    const before = buildReminders(empty).find((r) => r.id === 'todo-mon');
    expect(before?.title).toBe('3 items left for Mon 9 Nov');
    expect(before?.at).toBe(t('2026-11-08T20:30'));
    let todos = toggleTodo({}, 'mon', 'rinse');
    todos = toggleTodo(todos, 'mon', 'ride');
    todos = toggleTodo(todos, 'mon', 'checkin');
    expect(buildReminders({ ...empty, todos }).some((r) => r.id === 'todo-mon')).toBe(false);
  });

  it('prompts for a note only on days without one', () => {
    const notes = { wed: { text: 'Great viz', updatedAt: 1 } };
    const ids = buildReminders({ ...empty, notes }).map((r) => r.id);
    expect(ids).toContain('note-thu');
    expect(ids).not.toContain('note-wed');
  });

  it('warns about heavy rain or strong gusts on boat days only', () => {
    const daily = { '2026-11-06': wx({ rainPct: 75 }), '2026-11-05': wx({ gustMax: 45 }), '2026-11-09': wx({ rainPct: 90 }), '2026-11-04': wx({}) };
    const weather = buildReminders({ ...empty, daily }).filter((r) => r.kind === 'weather');
    expect(weather.map((r) => r.id)).toEqual(['wx-thu', 'wx-fri']);
    expect(weather[1]?.body).toContain('75% chance of rain');
  });
});

describe('notification state', () => {
  const all = buildReminders(empty);
  const now = t('2026-11-03T07:20');

  it('lists arrived reminders newest first and respects turned-off kinds', () => {
    const arrived = delivered(all, DEFAULT_NOTIFY, now);
    expect(arrived[0]?.id).toBe('plan-tue3-pickup');
    const noPlan = { ...DEFAULT_NOTIFY, kinds: { ...DEFAULT_NOTIFY.kinds, plan: false } };
    expect(delivered(all, noPlan, now).some((r) => r.kind === 'plan')).toBe(false);
  });

  it('counts unread and hides dismissed ones', () => {
    const count = unreadCount(all, DEFAULT_NOTIFY, now);
    expect(unreadCount(all, { ...DEFAULT_NOTIFY, read: ['plan-tue3-pickup'] }, now)).toBe(count - 1);
    expect(delivered(all, { ...DEFAULT_NOTIFY, dismissed: ['plan-tue3-pickup'] }, now)[0]?.id).not.toBe('plan-tue3-pickup');
  });

  it('only alerts for recent reminders that were not alerted before', () => {
    expect(dueForAlert(all, DEFAULT_NOTIFY, now).map((r) => r.id)).toEqual(['plan-tue3-pickup']);
    expect(dueForAlert(all, { ...DEFAULT_NOTIFY, notified: ['plan-tue3-pickup'] }, now)).toEqual([]);
    expect(dueForAlert(all, DEFAULT_NOTIFY, t('2026-11-03T08:30'))).toEqual([]);
  });

  it('shows what is coming up next', () => {
    expect(upcoming(all, DEFAULT_NOTIFY, now, 1)[0]?.id).toBe('plan-tue3-tablet');
  });

  it('sanitizes stored state', () => {
    expect(sanitizeNotify('x')).toEqual(DEFAULT_NOTIFY);
    const s = sanitizeNotify({ system: true, kinds: { weather: false, bogus: true }, read: ['a', 1] });
    expect(s.system).toBe(true);
    expect(s.kinds).toEqual({ plan: true, weather: false, checklist: true, note: true });
    expect(s.read).toEqual(['a']);
  });
});

describe('profile photo', () => {
  it('accepts small image data URLs only', () => {
    expect(sanitizePhoto('data:image/jpeg;base64,/9j/4AAQ')).toBe('data:image/jpeg;base64,/9j/4AAQ');
    expect(sanitizePhoto('data:text/html;base64,PHNjcmlwdD4=')).toBeNull();
    expect(sanitizePhoto('javascript:alert(1)')).toBeNull();
    expect(sanitizePhoto(`data:image/jpeg;base64,${'A'.repeat(500_000)}`)).toBeNull();
  });
});
