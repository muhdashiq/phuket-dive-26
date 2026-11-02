import { useId, useState, type FormEvent } from 'react';
import type { DayPlan } from '../data/types';
import { addTodo, MAX_TODO_LENGTH, newTodoId, removeTodo, restoreTodo, todoItems, toggleTodo, type TodoItem, type TodoStore } from '../lib/todos';
import { Icon } from './Icon';
import { useToast } from './Toast';
import { ProgressRing, Section } from './ui';

type DayChecklistProps = {
  day: DayPlan;
  store: TodoStore;
  onChange: (update: (store: TodoStore) => TodoStore) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
};

export const DayChecklist = ({ day, store, onChange, hideDone, onToggleHideDone }: DayChecklistProps) => {
  const [draft, setDraft] = useState('');
  const id = useId();
  const toast = useToast();
  const items = todoItems(day.todos, store, day.id);
  const doneCount = items.filter((item) => item.done).length;
  const allDone = items.length > 0 && doneCount === items.length;
  const visible = hideDone ? items.filter((item) => !item.done) : items;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onChange((s) => addTodo(s, day.id, draft, newTodoId()));
    setDraft('');
  };

  const remove = (item: TodoItem) => {
    const index = (store[day.id]?.custom ?? []).findIndex((t) => t.id === item.id);
    onChange((s) => removeTodo(s, day.id, item.id));
    const short = item.text.length > 28 ? `${item.text.slice(0, 26)}…` : item.text;
    toast({
      message: `Deleted “${short}”`,
      action: { label: 'Undo', onClick: () => onChange((s) => restoreTodo(s, day.id, { id: item.id, text: item.text }, item.done, index)) },
    });
  };

  return (
    <Section
      id={`${id}-h`}
      title="Checklist"
      trailing={
        <span className="row-meta t-foot">
          <ProgressRing value={doneCount} total={items.length} size={22} />
          <span className="tnum">{doneCount}/{items.length}</span>
          <button className="btn btn-plain btn-small" type="button" aria-pressed={hideDone} onClick={onToggleHideDone}>
            {hideDone ? 'Show all' : 'Hide done'}
          </button>
        </span>
      }
    >
      <ul className="checklist">
        {allDone && hideDone ? (
          <li className="done-state">
            <span className="badge"><Icon name="check" /></span>
            <span>
              <span className="t-headline">All set for {day.dow} {day.dom}</span>
              <span className="t-foot" style={{ display: 'block' }}>Every item is ticked. Tap Show all to review them.</span>
            </span>
          </li>
        ) : (
          visible.map((item) => (
            <li key={item.id} className="check-row">
              <label className="check">
                <input type="checkbox" checked={item.done} onChange={() => onChange((s) => toggleTodo(s, day.id, item.id))} />
                <span className="box"><Icon name="check" /></span>
                <span className="label">{item.text}</span>
              </label>
              {item.custom && (
                <button className="icon-btn plain danger" type="button" aria-label={`Delete “${item.text}”`} onClick={() => remove(item)}>
                  <Icon name="trash" size={19} />
                </button>
              )}
            </li>
          ))
        )}
        <li className="check-row">
          <form className="check-add" onSubmit={submit} style={{ flex: 1 }}>
            <span className="plus" aria-hidden="true"><Icon name="plus" /></span>
            <label className="sr-only" htmlFor={id}>Add an item for {day.dow} {day.dom}</label>
            <input id={id} type="text" value={draft} maxLength={MAX_TODO_LENGTH} placeholder="Add item" enterKeyHint="done" onChange={(e) => setDraft(e.target.value)} />
            {draft.trim() && <button className="btn btn-small" type="submit">Add</button>}
          </form>
        </li>
      </ul>
    </Section>
  );
};
