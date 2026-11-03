import { describe, expect, it } from 'vitest';
import { BUILT_IN_BY_ID } from '../data/days';
import { addCustomDay, getDay, getDays, isDateTaken, removeCustomDay } from '../data/trip';
import { appendTurn, forRequest, MAX_TURNS, sanitizeChats } from './chats';
import { dateLabels, newCustomDayId, readPlan, sanitizeCustomDays, toDayPlan, type GeneratedPlan } from './customDays';
import { dayToText, tripToText } from './dayText';
import { maskKey, pickDefaultModel, sanitizeLlmStore } from './llm/providers';
import { challengeFor } from './llm/oauth';
import { sseData } from './llm/sse';
import { DEFAULT_PROFILE, profileForPrompt, profileHeadline, sanitizeProfile } from './profile';
import { planUserPrompt } from './prompts';
import { parseHash } from './routes';

const plan: GeneratedPlan = {
  title: 'Turtles at Racha Yai',
  summary: 'Two easy dives, then seafood in Rawai.',
  kind: 'dive',
  status: 'good',
  statusLabel: 'Good window · 2 dives',
  timeline: [{ time: '07:30', text: 'Pickup' }],
  diveSites: [{ name: 'Racha Yai Bay 2', note: 'Turtles in the shallows' }],
  bring: ['Cert card'],
  checklist: ['Confirm pickup', 'Charge computer'],
  tips: ['Book nitrox ahead'],
  places: [{ name: 'Racha Yai Bay 2', query: 'Racha Yai, Phuket' }],
  estimatedCost: '3,000–4,000 THB',
};

describe('generated plans', () => {
  it('reads JSON wrapped in prose or a code fence, and clamps lengths', () => {
    const text = 'Here you go:\n```json\n' + JSON.stringify({ ...plan, tips: Array(10).fill('x'.repeat(500)) }) + '\n```';
    const read = readPlan(text);
    expect(read?.title).toBe(plan.title);
    expect(read?.tips).toHaveLength(6);
    expect(read?.tips[0]).toHaveLength(240);
  });

  it('rejects replies without a title or that are not JSON, and fills missing parts', () => {
    expect(readPlan('no plan here')).toBeNull();
    expect(readPlan({ summary: 'x' })).toBeNull();
    expect(readPlan({ title: 'Rest', kind: 'nap' })).toMatchObject({ title: 'Rest', kind: 'land', timeline: [], checklist: [] });
  });

  it('turns a stored day into a normal day plan', () => {
    const day = toDayPlan({ id: 'x-20261111-ab12', date: '2026-11-11', prompt: 'turtles', model: 'claude-opus-5-5', createdAt: 1, plan });
    expect(day).toMatchObject({ dow: 'Wed', dom: '11 Nov', tone: 'good', sea: 'west', title: plan.title });
    expect(day.todos.map((t) => t.id)).toEqual(['g1', 'g2']);
    expect(dayToText(day, { full: true, checklist: false, notes: false })).toContain('07:30 Pickup');
  });

  it('drops corrupt stored days and duplicate dates', () => {
    const ok = { id: 'x-20261111-ab12', date: '2026-11-11', prompt: 'p', model: 'm', createdAt: 1, plan };
    expect(sanitizeCustomDays([ok, { ...ok, id: 'x-20261111-cd34' }, { ...ok, id: 'bad id' }, 'junk'])).toHaveLength(1);
  });

  it('labels dates and makes ids that fit the URL pattern', () => {
    expect(dateLabels('2026-11-03')).toEqual({ dow: 'Tue', dom: '3 Nov' });
    expect(newCustomDayId('2026-11-11')).toMatch(/^x-20261111-[a-z0-9]{4}$/);
  });
});

describe('trip store', () => {
  it('adds and removes days, sorted by date and reachable by link', () => {
    const id = 'x-20261111-ab12';
    addCustomDay({ id, date: '2026-11-11', prompt: 'p', model: 'm', createdAt: 1, plan });
    expect(getDays().at(-1)?.id).toBe(id);
    expect(isDateTaken('2026-11-11')).toBe(true);
    expect(parseHash(`#${id}`)).toEqual({ screen: 'today', day: id });
    removeCustomDay(id);
    expect(getDay(id)).toBeUndefined();
    expect(getDays()).toHaveLength(8);
  });
});

describe('profile', () => {
  it('keeps valid fields and drops bad ones', () => {
    const p = sanitizeProfile({ certLevel: 'Rescue Diver', loggedDives: 42.4, maxDepth: 500, interests: ['Wrecks', 'Hacking'], pace: 'zoom', notes: ' hi ' });
    expect(p).toMatchObject({ certLevel: 'Rescue Diver', loggedDives: 42, maxDepth: null, interests: ['Wrecks'], pace: 'balanced', notes: 'hi' });
    expect(sanitizeProfile(null)).toEqual(DEFAULT_PROFILE);
  });

  it('describes the profile for people and for prompts', () => {
    const p = { ...DEFAULT_PROFILE, loggedDives: 40, interests: ['Wrecks'] };
    expect(profileHeadline(p)).toBe('Advanced Open Water · 40 dives · nitrox · to 30 m');
    expect(profileForPrompt(p, 'Ashiq')).toContain('Interests: Wrecks');
    expect(planUserPrompt('2026-11-11', 'turtles', p, 'Ashiq')).toContain('Plan Wed 11 Nov 2026');
  });
});

describe('AI connections', () => {
  it('sanitizes stored connections and keeps a valid active one', () => {
    const store = sanitizeLlmStore({
      connections: [{ id: 'a', provider: 'anthropic', key: 'sk-ant-xyz', model: 'claude-opus-5-5' }, { id: 'b', provider: 'skynet', key: 'k' }],
      activeId: 'b',
    });
    expect(store.connections.map((c) => c.id)).toEqual(['a']);
    expect(store.activeId).toBe('a');
  });

  it('picks a sensible default model and masks keys', () => {
    expect(pickDefaultModel('anthropic', ['claude-haiku-5-5', 'claude-opus-5-5'])).toBe('claude-opus-5-5');
    expect(pickDefaultModel('gemini', ['gemini-2.0-flash', 'gemini-3.1-pro'])).toBe('gemini-3.1-pro');
    expect(maskKey('sk-ant-api03-abcdefghijkl')).toBe('sk-ant…ijkl');
  });

  it('computes the PKCE S256 challenge (base64url SHA-256 of the verifier)', async () => {
    const verifier = 'dBjftJeZ4CVP-mJ92K9KsjWa0B8pfT0hKXFkF2XpyuE';
    // Expected value computed independently with Node's crypto.createHash.
    expect(await challengeFor(verifier)).toBe('wGaK1xP4RwmA80mDkt2jLhBFycwFwwojQbyDZnMTc1E');
  });

  it('reads server-sent events split across chunks', async () => {
    const encoder = new TextEncoder();
    const body = new ReadableStream({
      start(controller) {
        ['data: {"a":', '1}\n\nevent: x\ndata: two\r\n\r\ndata: [DONE]', '\n\n'].forEach((c) => controller.enqueue(encoder.encode(c)));
        controller.close();
      },
    });
    const out: string[] = [];
    for await (const data of sseData(new Response(body))) out.push(data);
    expect(out).toEqual(['{"a":1}', 'two', '[DONE]']);
  });
});

describe('chat history', () => {
  it('merges same-role turns and never starts with the assistant', () => {
    expect(
      forRequest([
        { role: 'assistant', content: 'hi' },
        { role: 'user', content: 'a' },
        { role: 'user', content: 'b' },
        { role: 'assistant', content: '' },
      ]),
    ).toEqual([{ role: 'user', content: 'a\n\nb' }]);
  });

  it('caps stored turns and drops malformed ones', () => {
    let store = {};
    for (let i = 0; i < MAX_TURNS + 5; i += 1) store = appendTurn(store, 'wed', { role: 'user', content: String(i) });
    expect((store as Record<string, unknown[]>).wed).toHaveLength(MAX_TURNS);
    expect(sanitizeChats({ wed: [{ role: 'system', content: 'x' }, { role: 'user', content: 'ok' }], 'bad key!': [] })).toEqual({ wed: [{ role: 'user', content: 'ok' }] });
  });
});

describe('share text', () => {
  const tue3 = BUILT_IN_BY_ID.tue3!;

  it('renders a built-in day as readable text without map links', () => {
    const text = dayToText(tue3, { full: true, checklist: false, notes: false });
    expect(text).toContain('TUE 3 NOV · Phi Phi, Maya Bay & Khai Nok');
    expect(text).toContain('• 07:30 Hotel lobby pickup');
    expect(text).toContain('+66 81 538 7695');
    expect(text).not.toMatch(/\bMap\b/);
  });

  it('includes checklist ticks and notes only when asked', () => {
    const todos = { tue3: { done: ['cash'], custom: [] } };
    const notes = { tue3: { text: 'Great day', updatedAt: 1 } };
    const summary = dayToText(tue3, { full: false, checklist: false, notes: false }, todos, notes);
    expect(summary).not.toContain('Hotel lobby');
    expect(summary).not.toContain('Great day');
    const withAll = dayToText(tue3, { full: false, checklist: true, notes: true }, todos, notes);
    expect(withAll).toContain('☑ Get 2,500');
    expect(withAll).toContain('Great day');
    expect(tripToText([tue3], { full: false, checklist: false, notes: false }, {}, {}, 'https://x')).toContain('Phuket Dive Week: 1 day');
  });
});
