import { useRef, useState, type TouchEvent } from 'react';
import { useTrip } from '../data/trip';
import { ProfileButton, useApp } from '../components/AppContext';
import { Alert } from '../components/Sheet';
import type { DayId, DayPlan } from '../data/types';
import { DayChecklist } from '../components/DayChecklist';
import { DayNotes } from '../components/DayNotes';
import { ForecastTiles } from '../components/ForecastTiles';
import { Icon } from '../components/Icon';
import { NowCard } from '../components/NowCard';
import { Photo } from '../components/Photo';
import { ScreenHeader, Section } from '../components/ui';
import { dayTone, WeekStrip } from '../components/WeekStrip';
import type { NowWeather, TripWeather } from '../hooks/useWeather';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { addDaysToYmd } from '../lib/dates';
import type { NoteStore } from '../lib/notes';
import type { LatLon } from '../lib/prefs';
import { adjacentDay, dayIndex } from '../lib/routes';
import type { TodoStore } from '../lib/todos';

const WEEKDAYS: Record<string, string> = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' };

const relativeTitle = (day: DayPlan, today: string): string => {
  if (day.date === today) return 'Today';
  if (day.date === addDaysToYmd(today, 1)) return 'Tomorrow';
  if (day.date === addDaysToYmd(today, -1)) return 'Yesterday';
  return WEEKDAYS[day.dow] ?? day.dow;
};

const SWIPE_MIN_X = 70;
const SWIPE_MAX_Y = 50;

type TodayScreenProps = {
  day: DayPlan;
  today: string;
  now: number;
  tripWeather: TripWeather;
  nowWeather: NowWeather;
  location: LatLon | null;
  unread: number;
  onDeleteDay: (id: DayId) => void;
  onChat: (id: DayId) => void;
  onOpenNotifications: () => void;
  todos: TodoStore;
  onTodos: (update: (store: TodoStore) => TodoStore) => void;
  notes: NoteStore;
  onNotes: (update: (store: NoteStore) => NoteStore) => void;
  hideDone: boolean;
  onToggleHideDone: () => void;
  showTip: boolean;
  onDismissTip: () => void;
  onSelectDay: (id: DayId) => void;
  onRefresh: () => Promise<unknown>;
  onLocationTap: () => void;
};

export const TodayScreen = (props: TodayScreenProps) => {
  const { day, today, now, tripWeather, nowWeather, onSelectDay } = props;
  const { openShare, openNewDay } = useApp();
  const { days, byId } = useTrip();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const previousIndex = useRef(dayIndex(day.id));
  const index = dayIndex(day.id);
  const direction = index > previousIndex.current ? 'from-right' : index < previousIndex.current ? 'from-left' : '';
  previousIndex.current = index;

  const { pull, refreshing, progress } = usePullToRefresh(props.onRefresh);
  const prev = adjacentDay(day.id, -1);
  const next = adjacentDay(day.id, 1);
  const isToday = day.date === today;
  const live = tripWeather.daily[day.date];
  const tone = dayTone(day.sea, day.tone, live?.rainPct ?? day.weather.rainPct);

  const onTouchStart = (event: TouchEvent) => {
    const t = event.touches[0];
    const target = event.target as HTMLElement;
    touch.current = t && event.touches.length === 1 && !target.closest('textarea, input, .weekstrip') ? { x: t.clientX, y: t.clientY } : null;
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
    <div className="screen" onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
      <div className={`ptr${refreshing ? ' spinning' : ''}`} style={{ height: pull }} aria-hidden={!refreshing}>
        <span style={{ opacity: refreshing ? 1 : progress, transform: `rotate(${progress * 270}deg)` }}>
          <Icon name="refresh" size={22} label={refreshing ? 'Refreshing weather' : undefined} />
        </span>
      </div>
      <ScreenHeader
        title={relativeTitle(day, today)}
        eyebrow={`${day.dow} ${day.dom} · Day ${index + 1} of ${days.length}`}
        actions={
          <>
            <button
              className="icon-btn"
              type="button"
              aria-label={props.unread ? `Notifications, ${props.unread} new` : 'Notifications'}
              onClick={props.onOpenNotifications}
            >
              <Icon name="bell" size={20} filled={props.unread > 0} />
              {props.unread > 0 && <span className="bell-badge" aria-hidden="true">{props.unread > 9 ? '9+' : props.unread}</span>}
            </button>
            <button className="icon-btn" type="button" aria-label="Share days with friends" onClick={() => openShare([day.id])}>
              <Icon name="share" size={19} />
            </button>
            <ProfileButton />
          </>
        }
      />
      <WeekStrip selected={day.id} today={today} daily={tripWeather.daily} onSelect={onSelectDay} onAdd={openNewDay} />
      {props.showTip && (
        <div className="tip" role="note">
          <p>Tap a date to switch days, or swipe the page left and right.</p>
          <button type="button" onClick={props.onDismissTip}>Got it</button>
        </div>
      )}

      <div key={day.id} className={`day-anim ${direction}`}>
        <article className="hero" aria-labelledby={`${day.id}-title`}>
          {day.photo && <Photo key={day.id} photo={day.photo} />}
          <div className="hero-body">
            <div className="hero-pills">
              {isToday && <span className="pill blue">Today</span>}
              {day.custom && <span className="pill teal"><Icon name="sparkles" size={13} />Added by you</span>}
              <span className={`pill ${tone}`}><span className="dot" />{day.pill}</span>
            </div>
            <h2 id={`${day.id}-title`} className="t-title">{day.title}</h2>
            <p className="t-sub">{day.sub}</p>
            <div className="hero-actions">
              <button className="btn btn-tinted btn-small" type="button" onClick={() => props.onChat(day.id)}>
                <Icon name="message" size={15} />
                Ask about this day
              </button>
              {day.custom && (
                <button className="btn btn-danger btn-small" type="button" onClick={() => setConfirmDelete(true)}>
                  <Icon name="trash" size={15} />
                  Delete day
                </button>
              )}
            </div>
            {day.custom && <p className="t-cap">Planned by {day.custom.model} from your prompt.</p>}
          </div>
        </article>

        {isToday && <NowCard weather={nowWeather} now={now} location={props.location} onLocationTap={props.onLocationTap} />}

        <Section id={`${day.id}-wx`} title="Forecast">
          <ForecastTiles
            day={day}
            live={live}
            wave={day.sea ? tripWeather.waves[day.sea]?.[day.date] : undefined}
            isToday={isToday}
            now={now}
            fetchedAt={tripWeather.fetchedAt}
            stale={tripWeather.stale}
          />
        </Section>

        <div className="section content">
          {day.left}
          {day.right}
        </div>

        {day.planB && (
          <Section id={`${day.id}-planb`} title={day.planB.title}>
            <ul className="tips">
              {day.planB.items.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </Section>
        )}

        <DayChecklist key={`c-${day.id}`} day={day} store={props.todos} onChange={props.onTodos} hideDone={props.hideDone} onToggleHideDone={props.onToggleHideDone} />
        <DayNotes day={day} store={props.notes} onChange={props.onNotes} />

        <nav className="pager" aria-label="Previous and next day">
          {prev ? (
            <a href={`#${prev}`} onClick={(e) => { e.preventDefault(); onSelectDay(prev); }}>
              <Icon name="chevronLeft" />
              <span><span className="t-cap">Previous</span><span className="t-headline">{byId.get(prev)?.dow} {byId.get(prev)?.dom}</span></span>
            </a>
          ) : <span />}
          {next ? (
            <a className="next" href={`#${next}`} onClick={(e) => { e.preventDefault(); onSelectDay(next); }}>
              <span><span className="t-cap">Next</span><span className="t-headline">{byId.get(next)?.dow} {byId.get(next)?.dom}</span></span>
              <Icon name="chevronRight" />
            </a>
          ) : <span />}
        </nav>
      </div>
      <Alert
        open={confirmDelete}
        title={`Delete ${day.dow} ${day.dom}?`}
        message="This removes the day you added, with its checklist ticks. Your notes for it are kept until you clear them."
        confirmLabel="Delete"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false);
          props.onDeleteDay(day.id);
        }}
      />
    </div>
  );
};
