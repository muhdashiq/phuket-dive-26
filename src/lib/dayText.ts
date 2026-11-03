import { isValidElement, type ReactNode } from 'react';
import { Contact } from '../components/Contact';
import { MapLink } from '../components/MapLink';
import { Operator } from '../components/Operator';
import type { DayPlan } from '../data/types';
import { ExternalMapLink } from './customDays';
import type { NoteStore } from './notes';
import { todoItems, type TodoStore } from './todos';

type Props = { children?: ReactNode; className?: string; [key: string]: unknown };

// Flattens the JSX used for day content into readable plain text.
export const nodeText = (node: ReactNode): string => {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(nodeText).join('');
  if (!isValidElement<Props>(node)) return '';
  const { type, props } = node;
  if (type === MapLink || type === ExternalMapLink) return '';
  if (type === Contact) {
    const p = props as unknown as { display: string; note?: string };
    return `\n  ${p.display}${p.note ? ` (${p.note})` : ''}`;
  }
  if (type === Operator) {
    const p = props as unknown as { name: string; tag?: string; price: string; children?: ReactNode };
    return `\n• ${p.name}${p.tag ? ` (${p.tag})` : ''}: ${p.price}${nodeText(p.children)}`;
  }
  const inner = nodeText(props.children);
  switch (type) {
    case 'h3':
      return `\n\n${inner.trim()}\n`;
    case 'li':
      return `\n• ${inner.replace(/\s+/g, ' ').trim()}`;
    case 'p':
      return props.className === 'op-meta' ? `\n  ${inner.trim()}` : `\n${inner.trim()}`;
    case 'span':
      return props.className === 'tm' ? `${inner} ` : inner;
    case 'small':
      return ` (${inner})`;
    case 'br':
      return '\n';
    default:
      return inner;
  }
};

const tidy = (text: string) => text.replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

export type DayTextOptions = { full: boolean; checklist: boolean; notes: boolean };

export const dayToText = (day: DayPlan, options: DayTextOptions, todos: TodoStore = {}, notes: NoteStore = {}): string => {
  const parts = [`${day.dow.toUpperCase()} ${day.dom.toUpperCase()} · ${day.title}`, day.pill, nodeText(day.sub)];
  if (options.full) {
    parts.push(tidy(nodeText(day.left) + nodeText(day.right)));
    if (day.planB) parts.push(`${day.planB.title}\n${day.planB.items.map((item) => `• ${nodeText(item)}`).join('\n')}`);
  }
  if (options.checklist) {
    const items = todoItems(day.todos, todos, day.id);
    if (items.length) parts.push(`Checklist\n${items.map((i) => `${i.done ? '☑' : '☐'} ${i.text}`).join('\n')}`);
  }
  const note = notes[day.id];
  if (options.notes && note) parts.push(`Notes\n${note.text.trim()}`);
  return tidy(parts.filter(Boolean).join('\n\n'));
};

export const tripToText = (days: DayPlan[], options: DayTextOptions, todos: TodoStore, notes: NoteStore, link: string): string =>
  [`Phuket Dive Week: ${days.length} ${days.length === 1 ? 'day' : 'days'}`, ...days.map((day) => dayToText(day, options, todos, notes)), `Plan: ${link}`].join(
    '\n\n————————\n\n',
  );
