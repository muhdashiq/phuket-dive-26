import { useId, useState, type FormEvent } from 'react';
import type { DayPlan } from '../data/types';
import { addTodo, MAX_TODO_LENGTH, newTodoId, removeTodo, todoItems, toggleTodo, type TodoStore } from '../lib/todos';

type DayChecklistProps = {
  day: DayPlan;
  store: TodoStore;
  onChange: (update: (store: TodoStore) => TodoStore) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
};

export const DayChecklist = ({ day, store, onChange, hideDone, onToggleHideDone }: DayChecklistProps) => {
  const [draft, setDraft] = useState('');
  const inputId = useId();
  const items = todoItems(day.todos, store, day.id);
  const doneCount = items.filter((item) => item.done).length;
  const visible = hideDone ? items.filter((item) => !item.done) : items;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    onChange((s) => addTodo(s, day.id, draft, newTodoId()));
    setDraft('');
  };

  return (
    <section className="panel" aria-labelledby={`${inputId}-h`}>
      <div className="panel-head">
        <h3 id={`${inputId}-h`}>Checklist</h3>
        <span className={`steps-progress${doneCount === items.length && items.length > 0 ? ' all' : ''}`} aria-live="polite">
          {doneCount === items.length && items.length > 0 ? 'All done' : `${doneCount} of ${items.length} done`}
        </span>
        <button className="btn" type="button" aria-pressed={hideDone} onClick={onToggleHideDone}>
          {hideDone ? 'Show done' : 'Hide done'}
        </button>
      </div>
      <div className="meter" aria-hidden="true">
        <span style={{ width: items.length ? `${(doneCount / items.length) * 100}%` : '0%' }} />
      </div>
      <ul className="todos">
        {visible.map((item) => (
          <li key={item.id} className={item.done ? 'done' : undefined}>
            <label className="todo">
              <input type="checkbox" className="step-check" checked={item.done} onChange={() => onChange((s) => toggleTodo(s, day.id, item.id))} />
              <span>{item.text}</span>
            </label>
            {item.custom && (
              <button className="todo-del" type="button" aria-label={`Delete "${item.text}"`} onClick={() => onChange((s) => removeTodo(s, day.id, item.id))}>
                ×
              </button>
            )}
          </li>
        ))}
        {visible.length === 0 && <li className="todos-empty">Everything here is done.</li>}
      </ul>
      <form className="todo-add" onSubmit={submit}>
        <label className="sr-only" htmlFor={inputId}>Add an item to the {day.dow} {day.dom} checklist</label>
        <input id={inputId} type="text" value={draft} maxLength={MAX_TODO_LENGTH} placeholder="Add your own item…" onChange={(e) => setDraft(e.target.value)} />
        <button className="btn" type="submit" disabled={!draft.trim()}>Add</button>
      </form>
    </section>
  );
};
