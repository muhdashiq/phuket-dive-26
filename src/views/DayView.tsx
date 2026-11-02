import { useRef, type TouchEvent } from 'react';
import { DAY_BY_ID } from '../data/days';
import type { DayId, DayPlan } from '../data/types';
import { DayChecklist } from '../components/DayChecklist';
import { DayNotes } from '../components/DayNotes';
import { Photo } from '../components/Photo';
import { WeatherStrip } from '../components/WeatherStrip';
import type { TripWeather } from '../hooks/useWeather';
import type { NoteStore } from '../lib/notes';
import { adjacentDay } from '../lib/tabs';
import type { TodoStore } from '../lib/todos';

type DayViewProps = {
  day: DayPlan;
  today: string;
  now: number;
  weather: TripWeather;
  todos: TodoStore;
  onTodos: (update: (store: TodoStore) => TodoStore) => void;
  notes: NoteStore;
  onNotes: (update: (store: NoteStore) => NoteStore) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
  onSelectDay: (id: DayId) => void;
};

const SWIPE_MIN_X = 70;
const SWIPE_MAX_Y = 50;

export const DayView = ({ day, today, now, weather, todos, onTodos, notes, onNotes, hideDone, onToggleHideDone, onSelectDay }: DayViewProps) => {
  const touch = useRef<{ x: number; y: number } | null>(null);
  const prev = adjacentDay(day.id, -1);
  const next = adjacentDay(day.id, 1);
  const isToday = day.date === today;

  const onTouchStart = (event: TouchEvent) => {
    const t = event.touches[0];
    const target = event.target as HTMLElement;
    touch.current = t && event.touches.length === 1 && !target.closest('.tablebox, textarea, input') ? { x: t.clientX, y: t.clientY } : null;
  };

  // Swipe sideways: right = previous day, left = next day.
  const onTouchEnd = (event: TouchEvent) => {
    const start = touch.current;
    const t = event.changedTouches[0];
    touch.current = null;
    if (!start || !t) return;
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) < SWIPE_MIN_X || Math.abs(dy) > SWIPE_MAX_Y) return;
    const target = dx < 0 ? next : prev;
    if (target) onSelectDay(target);
  };

  return (
    <div className="day-view" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <article className={`day${isToday ? ' is-today' : ''}`} aria-labelledby={`${day.id}-h`}>
        {day.photo && <Photo key={day.id} photo={day.photo} />}
        <div className="day-head">
          <div className={`slate s-${day.tone}`}>
            <span className="dow">{day.dow}</span>
            <span className="dom">{day.dom}</span>
          </div>
          <div className="day-title">
            <div className="pills">
              {isToday && <span className="pill today-pill">Today</span>}
              <span className={`pill s-${day.tone}`}><i className="dot" />{day.pill}</span>
            </div>
            <h2 id={`${day.id}-h`}>{day.title}</h2>
            <p className="day-sub">{day.sub}</p>
          </div>
        </div>
        <WeatherStrip
          day={day}
          live={weather.daily[day.date]}
          wave={day.sea ? weather.waves[day.sea]?.[day.date] : undefined}
          isToday={isToday}
          now={now}
          fetchedAt={weather.fetchedAt}
          stale={weather.stale}
        />
        <div className="body">
          <div className="block">{day.left}</div>
          {day.right && <div className="block">{day.right}</div>}
        </div>
        {day.planB && (
          <div className="planb">
            <h3>{day.planB.title}</h3>
            <ul>
              {day.planB.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </article>

      <DayChecklist key={day.id} day={day} store={todos} onChange={onTodos} hideDone={hideDone} onToggleHideDone={onToggleHideDone} />
      <DayNotes day={day} store={notes} onChange={onNotes} />

      <nav className="pager" aria-label="Previous and next day">
        {prev ? (
          <a className="pager-link" href={`#${prev}`}>
            <span className="k">Previous</span>
            <span>← {DAY_BY_ID[prev].dow} {DAY_BY_ID[prev].dom}</span>
          </a>
        ) : <span />}
        {next ? (
          <a className="pager-link next" href={`#${next}`}>
            <span className="k">Next</span>
            <span>{DAY_BY_ID[next].dow} {DAY_BY_ID[next].dom} →</span>
          </a>
        ) : <span />}
      </nav>
    </div>
  );
};
