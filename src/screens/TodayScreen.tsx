import { useRef, type TouchEvent } from 'react';
import { DAY_BY_ID, DAYS } from '../data/days';
import type { DayId, DayPlan } from '../data/types';
import { DayChecklist } from '../components/DayChecklist';
import { DayNotes } from '../components/DayNotes';
import { ForecastTiles } from '../components/ForecastTiles';
import { Icon } from '../components/Icon';
import { NowCard } from '../components/NowCard';
import { Photo } from '../components/Photo';
import { useToast } from '../components/Toast';
import { Avatar, ScreenHeader, Section } from '../components/ui';
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
  name: string;
  photo: string | null;
  unread: number;
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
  onOpenYou: () => void;
  onRefresh: () => Promise<unknown>;
  onLocationTap: () => void;
};

export const TodayScreen = (props: TodayScreenProps) => {
  const { day, today, now, tripWeather, nowWeather, onSelectDay } = props;
  const toast = useToast();
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

  const share = async () => {
    const url = `${window.location.href.split('#')[0]}#${day.id}`;
    const text = `${day.dow} ${day.dom}: ${day.title}`;
    if (navigator.share) {
      navigator.share({ title: 'Phuket Dive Week', text, url }).catch(() => undefined);
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      toast({ message: 'Link to this day copied', tone: 'success' });
    } catch {
      toast({ message: "Couldn't copy the link", tone: 'error' });
    }
  };

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
        eyebrow={`${day.dow} ${day.dom} · Day ${index + 1} of ${DAYS.length}`}
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
            <button className="icon-btn" type="button" aria-label="Share this day" onClick={share}>
              <Icon name="share" size={19} />
            </button>
            <button className="icon-btn plain" type="button" aria-label="Open your profile and settings" onClick={props.onOpenYou} style={{ width: 36, height: 36 }}>
              <Avatar name={props.name} photo={props.photo} size={36} />
            </button>
          </>
        }
      />
      <WeekStrip selected={day.id} today={today} daily={tripWeather.daily} onSelect={onSelectDay} />
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
              <span className={`pill ${tone}`}><span className="dot" />{day.pill}</span>
            </div>
            <h2 id={`${day.id}-title`} className="t-title">{day.title}</h2>
            <p className="t-sub">{day.sub}</p>
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
              <span><span className="t-cap">Previous</span><span className="t-headline">{DAY_BY_ID[prev].dow} {DAY_BY_ID[prev].dom}</span></span>
            </a>
          ) : <span />}
          {next ? (
            <a className="next" href={`#${next}`} onClick={(e) => { e.preventDefault(); onSelectDay(next); }}>
              <span><span className="t-cap">Next</span><span className="t-headline">{DAY_BY_ID[next].dow} {DAY_BY_ID[next].dom}</span></span>
              <Icon name="chevronRight" />
            </a>
          ) : <span />}
        </nav>
      </div>
    </div>
  );
};
