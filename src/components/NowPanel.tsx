import { useEffect, useRef, useState } from 'react';
import { DAYS, DAY_BY_ID } from '../data/days';
import { addDaysToYmd, daysBetween, formatDateTime, formatDuration, formatRelative, formatTime, sunTimes, ymdIn } from '../lib/dates';
import type { LatLon } from '../lib/prefs';
import { dayForDate } from '../lib/tabs';
import { adviceFor, compass, describeCode, MIN_REFRESH_MS, PHUKET } from '../lib/weather';
import type { NowWeather } from '../hooks/useWeather';

type NowPanelProps = {
  weather: NowWeather;
  now: number;
  today: string;
  location: LatLon | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onRefresh: (maxAge: number) => void;
  onLocation: (next: LatLon | null) => void;
};

type SunEvent = { kind: 'Sunrise' | 'Sunset'; at: number };

const sunEvents = (weather: NowWeather, location: LatLon | null): SunEvent[] => {
  const events: SunEvent[] = [];
  const live = Object.values(weather.daily);
  if (live.some((d) => d.sunrise !== null)) {
    live.forEach((d) => {
      if (d.sunrise !== null) events.push({ kind: 'Sunrise', at: d.sunrise });
      if (d.sunset !== null) events.push({ kind: 'Sunset', at: d.sunset });
    });
  } else {
    const lat = location?.lat ?? PHUKET.lat;
    const lon = location?.lon ?? PHUKET.lon;
    const today = ymdIn(weather.timeZone);
    [today, addDaysToYmd(today, 1)].forEach((ymd) => {
      const sun = sunTimes(ymd, lat, lon, weather.offsetS / 3600);
      if (sun.rise !== null) events.push({ kind: 'Sunrise', at: sun.rise });
      if (sun.set !== null) events.push({ kind: 'Sunset', at: sun.set });
    });
  }
  return events.sort((a, b) => a.at - b.at);
};

// Position of the sun along the daylight arc, 0 at sunrise and 1 at sunset.
const arcProgress = (events: SunEvent[], now: number): { t: number; day: boolean } => {
  let rise: SunEvent | null = null;
  let set: SunEvent | null = null;
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    if (event?.kind === 'Sunrise' && event.at <= now) {
      rise = event;
      set = events.slice(i + 1).find((e) => e.kind === 'Sunset') ?? null;
    }
  }
  if (!rise || !set) return { t: 0, day: false };
  if (now >= set.at) return { t: 1, day: false };
  return { t: Math.min(1, Math.max(0, (now - rise.at) / (set.at - rise.at))), day: true };
};

const SunArc = ({ t, day }: { t: number; day: boolean }) => {
  const angle = Math.PI * (1 - t);
  const x = 60 + 52 * Math.cos(angle);
  const y = 46 - 38 * Math.sin(angle);
  return (
    <svg className={`sunarc${day ? '' : ' night'}`} viewBox="0 -6 120 58" aria-hidden="true">
      <line className="horizon" x1="2" y1="46" x2="118" y2="46" />
      <path className="arc-base" d="M8 46 A52 38 0 0 1 112 46" />
      <path className="arc-done" pathLength={100} d="M8 46 A52 38 0 0 1 112 46" style={{ strokeDasharray: `${(t * 100).toFixed(1)} 100` }} />
      <g className="sun-g" style={{ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` }}>
        <circle className="sun-halo" r="9" />
        <circle className="sun-core" r="4.5" />
      </g>
    </svg>
  );
};

const planLine = (today: string) => {
  const first = DAYS[0];
  const last = DAYS[DAYS.length - 1];
  if (!first || !last) return null;
  if (today < first.date) {
    const n = daysBetween(today, first.date);
    return (
      <>
        Your Phuket week starts Tuesday 3 Nov, {n === 1 ? 'tomorrow' : `in ${n} days`}. First up: <a href={`#${first.id}`}>{first.title}</a>.
      </>
    );
  }
  if (today > last.date) return <>The trip is over. Safe travels home.</>;
  const id = dayForDate(today);
  if (!id) return null;
  const day = DAY_BY_ID[id];
  return (
    <>
      Today: <a href={`#${day.id}`}>{day.title}</a> · {day.pill}.
    </>
  );
};

const deviceTimeZone = (): string | null => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
};

const fmt = (value: number | null, suffix: string, digits = 0) => (value === null ? '—' : `${value.toFixed(digits)}${suffix}`);

export const NowPanel = ({ weather, now, today, location, collapsed, onToggleCollapsed, onRefresh, onLocation }: NowPanelProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const messageTimer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(messageTimer.current), []);

  const flashMessage = (text: string) => {
    setMessage(text);
    window.clearTimeout(messageTimer.current);
    messageTimer.current = window.setTimeout(() => setMessage(null), 6000);
  };

  const { current, sea } = weather;
  const tz = weather.timeZone;
  const todayLocal = ymdIn(tz, now);
  const rainToday = weather.daily[todayLocal]?.rainPct ?? null;
  const events = sunEvents(weather, location);
  const nextIndex = events.findIndex((e) => e.at > now);
  const next = events[nextIndex];
  const after = events[nextIndex + 1];
  const arc = arcProgress(events, now);
  const device = deviceTimeZone();
  const loading = !current && !weather.error;

  const refresh = () => {
    setRefreshing(true);
    onRefresh(MIN_REFRESH_MS);
    window.setTimeout(() => setRefreshing(false), 1200);
  };

  const toggleLocation = () => {
    if (location) {
      onLocation(null);
      return;
    }
    if (!navigator.geolocation) {
      flashMessage('This browser cannot share its location. Showing Phuket.');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false);
        onLocation({ lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2) });
      },
      () => {
        setLocating(false);
        flashMessage('Location was not shared, so the panel shows Phuket.');
      },
      { timeout: 10_000, maximumAge: 10 * 60 * 1000 },
    );
  };

  let updated = 'Checking for live weather…';
  if (weather.fetchedAt) {
    const age = now - weather.fetchedAt;
    updated = `Live weather from Open-Meteo · updated ${age < 6e4 ? 'just now' : `${formatDuration(age)} ago`}${weather.stale ? ' (saved copy, offline)' : ''}`;
  } else if (weather.error) {
    updated = 'Live weather could not load. Day tabs show the values checked on 2 Nov.';
  }

  const summary = current
    ? `${current.temp === null ? '—' : Math.round(current.temp)}° · ${describeCode(current.code)}`
    : weather.error
      ? 'Live weather unavailable'
      : 'Loading weather…';

  return (
    <section className={`now${loading ? ' loading' : ''}${collapsed ? ' collapsed' : ''}`} aria-labelledby="now-h">
      <div className="now-head">
        <h2 id="now-h">Right now</h2>
        <p className="now-meta">
          {location ? 'Your location' : 'Phuket'} · {formatDateTime(now, tz)}
          {device && device !== tz && ` · your device ${formatTime(now, device)}`}
        </p>
        <button className="btn now-toggle" type="button" aria-expanded={!collapsed} onClick={onToggleCollapsed}>
          {collapsed ? 'Show' : 'Hide'}
        </button>
      </div>
      {collapsed ? (
        <p className="now-mini">
          {summary}
          {next && ` · ${next.kind} ${formatRelative(next.at - now)}`}
        </p>
      ) : (
        <>
          <div className="now-grid">
            <div className="now-temp">
              <span className="big skel">{current?.temp != null ? `${Math.round(current.temp)}°` : '—'}</span>
              <span className="skel">
                {current ? describeCode(current.code) : weather.error ? 'Live weather unavailable' : 'Loading weather…'}
                {current && rainToday !== null && ` · ${rainToday}% rain today`}
              </span>
              <span className="now-feels">{current?.feels != null ? `Feels like ${Math.round(current.feels)}°C` : ''}</span>
            </div>
            <dl className="now-stats">
              <div><dt>Wind</dt><dd className="skel">{current?.wind != null ? `${current.windDir !== null ? `${compass(current.windDir)} ` : ''}${Math.round(current.wind)} km/h` : '—'}</dd></div>
              <div><dt>Gusts</dt><dd className="skel">{fmt(current?.gust ?? null, ' km/h')}</dd></div>
              <div><dt>Humidity</dt><dd className="skel">{fmt(current?.humidity ?? null, '%')}</dd></div>
              <div><dt>Rain now</dt><dd className="skel">{fmt(current?.rainMm ?? null, ' mm', 1)}</dd></div>
              <div><dt>Waves</dt><dd className="skel">{fmt(sea?.wave ?? null, ' m', 1)}</dd></div>
              <div><dt>Water</dt><dd className="skel">{fmt(sea?.water ?? null, ' °C', 1)}</dd></div>
            </dl>
            <div className={`now-sun${next && next.at - now <= 15 * 6e4 ? ' soon' : ''}`} aria-live="polite">
              <SunArc t={arc.t} day={arc.day} />
              <span className="k">Sun</span>
              <strong>{next ? `${next.kind} ${formatRelative(next.at - now)}` : '—'}</strong>
              <span className="now-sun-sub">
                {next && `at ${formatTime(next.at, tz)}`}
                {next && after && ` · ${after.kind.toLowerCase()} ${formatTime(after.at, tz)}`}
              </span>
            </div>
          </div>
          <p className="now-summary">{planLine(today)}</p>
          <p className="now-advice">{adviceFor(current, rainToday)}</p>
          <div className="now-foot">
            <span className="now-updated">{message ?? updated}</span>
            <button className="btn" type="button" onClick={refresh}>{refreshing ? 'Refreshing…' : 'Refresh'}</button>
            <button className="btn" type="button" onClick={toggleLocation}>
              {locating ? 'Locating…' : location ? 'Show Phuket' : 'Use my location'}
            </button>
          </div>
        </>
      )}
    </section>
  );
};
