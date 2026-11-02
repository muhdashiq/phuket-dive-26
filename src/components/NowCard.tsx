import { addDaysToYmd, formatDuration, formatRelative, formatTime, sunTimes, ymdIn } from '../lib/dates';
import type { LatLon } from '../lib/prefs';
import { adviceFor, compass, describeCode, PHUKET } from '../lib/weather';
import type { NowWeather } from '../hooks/useWeather';
import { Icon } from './Icon';

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
      <g style={{ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)` }}>
        <circle className="sun-halo" r="9" />
        <circle className="sun-core" r="4.5" />
      </g>
    </svg>
  );
};

const fmt = (value: number | null | undefined, suffix: string, digits = 0) =>
  value === null || value === undefined ? '—' : `${value.toFixed(digits)}${suffix}`;

type NowCardProps = {
  weather: NowWeather;
  now: number;
  location: LatLon | null;
  onLocationTap: () => void;
};

export const NowCard = ({ weather, now, location, onLocationTap }: NowCardProps) => {
  const { current, sea } = weather;
  const tz = weather.timeZone;
  const rainToday = weather.daily[ymdIn(tz, now)]?.rainPct ?? null;
  const events = sunEvents(weather, location);
  const next = events.find((e) => e.at > now);
  const arc = arcProgress(events, now);
  const loading = !current && !weather.error;
  const sk = loading ? ' skeleton' : '';
  const advice = adviceFor(current, rainToday);

  let updated = 'Checking live weather…';
  if (weather.fetchedAt) {
    const age = now - weather.fetchedAt;
    updated = `Updated ${age < 6e4 ? 'just now' : `${formatDuration(age)} ago`}${weather.stale ? ' · offline copy' : ''}`;
  } else if (weather.error) {
    updated = 'Live weather unavailable right now';
  }

  const sunSide = (
    <div className="now-sun" aria-live="polite">
      <SunArc t={arc.t} day={arc.day} />
      {next && (
        <>
          <p className="t-headline">{next.kind} {formatRelative(next.at - now)}</p>
          <p className="t-cap">at {formatTime(next.at, tz)}</p>
        </>
      )}
    </div>
  );

  const locationButton = (
    <button className="btn btn-tinted btn-small" type="button" onClick={onLocationTap}>
      <Icon name="location" size={15} />
      {location ? 'Show Phuket' : 'Use my location'}
    </button>
  );

  // Offline and nothing cached: say so plainly instead of a grid of dashes.
  if (weather.error && !current) {
    return (
      <section className="now-card" aria-label="Weather right now">
        <div className="now-top">
          <div className="now-offline">
            <span className="empty-icon"><Icon name="rain" /></span>
            <div>
              <p className="t-headline">Live weather unavailable</p>
              <p className="t-foot">Pull down to try again. The forecast below uses the saved outlook.</p>
            </div>
          </div>
          {sunSide}
        </div>
        <div className="now-foot">
          <span />
          {locationButton}
        </div>
      </section>
    );
  }

  return (
    <section className="now-card" aria-label="Weather right now" aria-busy={loading}>
      <div className="now-top">
        <div>
          <p className="t-eyebrow">Right now · {location ? 'Your location' : 'Phuket'}</p>
          <p className={`now-temp${sk}`}>{current?.temp != null ? `${Math.round(current.temp)}°` : '00°'}</p>
          <p className={`now-cond${sk}`}>{current ? describeCode(current.code) : 'Loading'}</p>
          <p className={`t-foot${sk}`}>
            {current?.feels != null ? `Feels like ${Math.round(current.feels)}°` : 'Feels like —'}
            {rainToday !== null && ` · ${rainToday}% rain today`}
          </p>
        </div>
        {sunSide}
      </div>
      <dl className="now-stats">
        <div><dt>Wind</dt><dd className={sk.trim()}>{current?.wind != null ? `${current.windDir !== null ? `${compass(current.windDir)} ` : ''}${Math.round(current.wind)} km/h` : '—'}</dd></div>
        <div><dt>Gusts</dt><dd className={sk.trim()}>{fmt(current?.gust, ' km/h')}</dd></div>
        <div><dt>Humidity</dt><dd className={sk.trim()}>{fmt(current?.humidity, '%')}</dd></div>
        <div><dt>Rain now</dt><dd className={sk.trim()}>{fmt(current?.rainMm, ' mm', 1)}</dd></div>
        <div><dt>Waves</dt><dd className={sk.trim()}>{fmt(sea?.wave, ' m', 1)}</dd></div>
        <div><dt>Water</dt><dd className={sk.trim()}>{fmt(sea?.water, '°', 1)}</dd></div>
      </dl>
      {advice && <p className="t-sub">{advice}</p>}
      <div className="now-foot">
        <p className={`t-cap live-line${weather.stale ? ' stale' : ''}`}>
          <span className="dot" />
          {updated}
        </p>
        {locationButton}
      </div>
    </section>
  );
};
