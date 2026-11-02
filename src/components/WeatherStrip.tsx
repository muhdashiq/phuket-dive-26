import type { DayPlan } from '../data/types';
import { formatRelative, formatTime, sunTimes, TRIP_TZ } from '../lib/dates';
import { compass, describeCode, PHUKET, type DailyWeather } from '../lib/weather';

type WeatherStripProps = {
  day: DayPlan;
  live: DailyWeather | undefined;
  wave: number | undefined;
  isToday: boolean;
  now: number;
  fetchedAt: number | null;
  stale: boolean;
};

type Cell = { label: string; value: string; small?: string; highlight?: boolean };

export const WeatherStrip = ({ day, live, wave, isToday, now, fetchedAt, stale }: WeatherStripProps) => {
  const fallbackSun = sunTimes(day.date, PHUKET.lat, PHUKET.lon, 7);
  const rise = live?.sunrise ?? fallbackSun.rise;
  const set = live?.sunset ?? fallbackSun.set;
  const nextSun = isToday ? (rise !== null && now < rise ? 'rise' : set !== null && now < set ? 'set' : null) : null;
  const w = day.weather;
  const cells: Cell[] = [];

  if (w.air !== undefined || live?.tMax != null) {
    cells.push(
      live?.tMax != null && live.tMin !== null
        ? { label: 'Air', value: `${Math.round(live.tMax)}° / ${Math.round(live.tMin)}°C` }
        : { label: 'Air', value: w.air ?? '—', small: w.air ? undefined : 'loads live online' },
    );
  }
  if (w.rain !== undefined || live?.rainPct != null || day.sea) {
    cells.push(
      live?.rainPct != null
        ? { label: 'Rain', value: `${live.rainPct}%`, small: live.rainMm !== null ? `${live.rainMm.toFixed(1)} mm expected` : undefined }
        : { label: 'Rain', value: w.rain ?? '—', small: w.rain ? undefined : 'loads live online' },
    );
  }
  if (w.wind !== undefined) {
    cells.push(
      live?.windMax != null
        ? {
            label: 'Wind',
            value: `${live.windDir !== null ? `${compass(live.windDir)} ` : ''}${Math.round(live.windMax)} km/h`,
            small: live.gustMax !== null ? `gusts ${Math.round(live.gustMax)} km/h` : undefined,
          }
        : { label: 'Wind', value: w.wind },
    );
  }
  if (w.sea !== undefined) {
    cells.push(wave !== undefined ? { label: 'Sea', value: `${wave.toFixed(1)} m`, small: 'max wave, live' } : { label: 'Sea', value: w.sea, small: w.seaNote });
  }
  [['Sunrise', rise, 'rise'], ['Sunset', set, 'set']].forEach(([label, at, kind]) => {
    if (typeof at !== 'number') return;
    cells.push({
      label: label as string,
      value: formatTime(at, TRIP_TZ),
      small: isToday ? formatRelative(at - now) : undefined,
      highlight: nextSun === kind,
    });
  });
  day.extraCells?.forEach((cell) => cells.push(cell));

  return (
    <>
      <div className="wx">
        {cells.map((cell) => (
          <div key={cell.label} className={`cell${cell.highlight ? ' sun-next' : ''}`}>
            <span className="k">{cell.label}</span>
            <span className="v">
              {cell.value}
              {cell.small && <small className={isToday && (cell.label === 'Sunrise' || cell.label === 'Sunset') ? 'rel' : undefined}>{cell.small}</small>}
            </span>
          </div>
        ))}
      </div>
      {live && fetchedAt && (
        <p className={`live${stale ? ' stale' : ''}`}>
          <i className="dot" />
          <span>
            Live forecast: {describeCode(live.code)}
            {live.rainPct !== null && `, ${live.rainPct}% rain chance`} · updated {formatTime(fetchedAt, TRIP_TZ)}
            {stale && ' (saved copy)'}
          </span>
        </p>
      )}
      {day.weatherNote && <p className="wx-note">{day.weatherNote}</p>}
    </>
  );
};
