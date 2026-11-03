import { DAY_ID_PATTERN, type DayId } from '../data/types';
import type { ChatTurn } from './llm/types';

export type ChatStore = Record<DayId, ChatTurn[]>;

export const MAX_TURNS = 40;
export const MAX_MESSAGE = 8000;

export const sanitizeChats = (raw: unknown): ChatStore => {
  if (typeof raw !== 'object' || raw === null) return {};
  const out: ChatStore = {};
  Object.entries(raw as Record<string, unknown>).forEach(([day, turns]) => {
    if (!DAY_ID_PATTERN.test(day) || !Array.isArray(turns)) return;
    const clean = turns
      .filter((t): t is ChatTurn => typeof t === 'object' && t !== null && (t.role === 'user' || t.role === 'assistant') && typeof t.content === 'string')
      .map((t) => ({ role: t.role, content: t.content.slice(0, MAX_MESSAGE) }))
      .slice(-MAX_TURNS);
    if (clean.length) out[day] = clean;
  });
  return out;
};

export const appendTurn = (store: ChatStore, day: DayId, turn: ChatTurn): ChatStore => ({
  ...store,
  [day]: [...(store[day] ?? []), { role: turn.role, content: turn.content.slice(0, MAX_MESSAGE) }].slice(-MAX_TURNS),
});

// The API needs the conversation to start with the user and alternate.
export const forRequest = (turns: ChatTurn[]): ChatTurn[] => {
  const out: ChatTurn[] = [];
  turns.forEach((turn) => {
    if (!turn.content.trim()) return;
    const last = out[out.length - 1];
    if (last && last.role === turn.role) last.content += `\n\n${turn.content}`;
    else out.push({ ...turn });
  });
  while (out[0]?.role === 'assistant') out.shift();
  return out;
};

export const suggestionsFor = (wet: boolean): string[] =>
  wet
    ? ['What marine life might we see here?', 'What are currents and visibility like in early November?', 'Is this OK for my certification and depth limit?', 'How should I plan my nitrox for these dives?']
    : ['What can we do if it rains?', 'Where should we eat nearby?', 'Anything to know about local customs?', 'How do we get there from Patong?'];
