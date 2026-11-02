import { DAY_IDS, type DayId, type TodoSeed } from '../data/types';

export type CustomTodo = { id: string; text: string };
export type DayTodoState = { done: string[]; custom: CustomTodo[] };
export type TodoStore = Partial<Record<DayId, DayTodoState>>;
export type TodoItem = { id: string; text: string; done: boolean; custom: boolean };

export const MAX_TODO_LENGTH = 200;

const EMPTY: DayTodoState = { done: [], custom: [] };

const dayState = (store: TodoStore, day: DayId): DayTodoState => store[day] ?? EMPTY;

export const todoItems = (seeds: TodoSeed[], store: TodoStore, day: DayId): TodoItem[] => {
  const state = dayState(store, day);
  const done = new Set(state.done);
  return [
    ...seeds.map((seed) => ({ id: seed.id, text: seed.text, done: done.has(seed.id), custom: false })),
    ...state.custom.map((todo) => ({ id: todo.id, text: todo.text, done: done.has(todo.id), custom: true })),
  ];
};

export const toggleTodo = (store: TodoStore, day: DayId, id: string): TodoStore => {
  const state = dayState(store, day);
  const done = state.done.includes(id) ? state.done.filter((x) => x !== id) : [...state.done, id];
  return { ...store, [day]: { ...state, done } };
};

export const addTodo = (store: TodoStore, day: DayId, text: string, id: string): TodoStore => {
  const clean = text.trim().slice(0, MAX_TODO_LENGTH);
  if (!clean) return store;
  const state = dayState(store, day);
  return { ...store, [day]: { ...state, custom: [...state.custom, { id, text: clean }] } };
};

export const removeTodo = (store: TodoStore, day: DayId, id: string): TodoStore => {
  const state = dayState(store, day);
  return {
    ...store,
    [day]: { done: state.done.filter((x) => x !== id), custom: state.custom.filter((todo) => todo.id !== id) },
  };
};

export const newTodoId = (): string => `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

const isStringArray = (value: unknown): value is string[] => Array.isArray(value) && value.every((x) => typeof x === 'string');

const sanitizeCustom = (value: unknown): CustomTodo[] =>
  Array.isArray(value)
    ? value.filter(
        (x): x is CustomTodo => typeof x === 'object' && x !== null && typeof x.id === 'string' && typeof x.text === 'string',
      )
    : [];

export const sanitizeTodoStore = (raw: unknown): TodoStore => {
  if (typeof raw !== 'object' || raw === null) return {};
  const source = raw as Record<string, unknown>;
  const store: TodoStore = {};
  DAY_IDS.forEach((day) => {
    const entry = source[day];
    if (typeof entry !== 'object' || entry === null) return;
    const { done, custom } = entry as Record<string, unknown>;
    store[day] = { done: isStringArray(done) ? done : [], custom: sanitizeCustom(custom) };
  });
  return store;
};

// Puts a deleted custom item back where it was (used by Undo).
export const restoreTodo = (store: TodoStore, day: DayId, todo: CustomTodo, done: boolean, index: number): TodoStore => {
  const state = dayState(store, day);
  if (state.custom.some((t) => t.id === todo.id)) return store;
  const custom = [...state.custom];
  custom.splice(Math.min(Math.max(index, 0), custom.length), 0, todo);
  return { ...store, [day]: { custom, done: done ? [...state.done, todo.id] : state.done } };
};
