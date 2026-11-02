import type { DayPlan } from '../data/types';
import { formatRelative, formatTime, sunTimes, TRIP_TZ } from '../lib/dates';
import { compass, describeCode, PHUKET, type DailyWeather } from '../lib/weather';
import { Icon, type IconName } from './Icon';

type ForecastTilesProps = {
  day: DayPlan;
  live: DailyWeather | undefined;
  wave: number | undefined;
  isToday: boolean;
  now: number;
  fetchedAt: number | null;
  stale: boolean;
};

type Tile = { key: string; icon: IconName; label: string; value: string; small?: string; next?: boolean };

export const ForecastTiles = ({ day, live, wave, isToday, now, fetchedAt, stale }: ForecastTilesProps) => {
  const fallbackSun = sunTimes(day.date, PHUKET.lat, PHUKET.lon, 7);
  const rise = live?.sunrise ?? fallbackSun.rise;
  const set = live?.sunset ?? fallbackSun.set;
  const nextSun = isToday ? (rise !== null && now < rise ? 'rise' : set !== null && now < set ? 'set' : null) : null;
  const w = day.weather;
  const tiles: Tile[] = [];

  if (w.air !== undefined || live?.tMax != null) {
    tiles.push(
      live?.tMax != null && live.tMin !== null
        ? { key: 'air', icon: 'thermometer', label: 'Air', value: `${Math.round(live.tMax)}° / ${Math.round(live.tMin)}°` }
        : { key: 'air', icon: 'thermometer', label: 'Air', value: w.air ?? '—', small: w.air ? undefined : 'Live when online' },
    );
  }
  if (w.rain !== undefined || live?.rainPct != null || day.sea) {
    tiles.push(
      live?.rainPct != null
        ? { key: 'rain', icon: 'rain', label: 'Rain', value: `${live.rainPct}%`, small: live.rainMm !== null ? `${live.rainMm.toFixed(1)} mm` : undefined }
        : { key: 'rain', icon: 'rain', label: 'Rain', value: w.rain ?? '—', small: w.rain ? undefined : 'Live when online' },
    );
  }
  if (w.wind !== undefined) {
    tiles.push(
      live?.windMax != null
        ? {
            key: 'wind',
            icon: 'wind',
            label: 'Wind',
            value: `${live.windDir !== null ? `${compass(live.windDir)} ` : ''}${Math.round(live.windMax)} km/h`,
            small: live.gustMax !== null ? `Gusts ${Math.round(live.gustMax)}` : undefined,
          }
        : { key: 'wind', icon: 'wind', label: 'Wind', value: w.wind },
    );
  }
  if (w.sea !== undefined) {
    tiles.push(
      wave !== undefined
        ? { key: 'sea', icon: 'waves', label: 'Sea', value: `${wave.toFixed(1)} m`, small: 'Max wave' }
        : { key: 'sea', icon: 'waves', label: 'Sea', value: w.sea, small: w.seaNote },
    );
  }
  if (rise !== null) tiles.push({ key: 'rise', icon: 'sunrise', label: 'Sunrise', value: formatTime(rise, TRIP_TZ), small: isToday ? formatRelative(rise - now) : undefined, next: nextSun === 'rise' });
  if (set !== null) tiles.push({ key: 'set', icon: 'sunset', label: 'Sunset', value: formatTime(set, TRIP_TZ), small: isToday ? formatRelative(set - now) : undefined, next: nextSun === 'set' });
  day.extraCells?.forEach((cell) => tiles.push({ key: cell.label, icon: 'clockStart', label: cell.label, value: cell.value, small: cell.small }));

  return (
    <>
      <div className="tiles">
        {tiles.map((tile) => (
          <div key={tile.key} className={`tile${tile.next ? ' next' : ''}`}>
            <span className="tile-k"><Icon name={tile.icon} />{tile.label}</span>
            <span className="tile-v">{tile.value}</span>
            {tile.small && <span className="tile-s">{tile.small}</span>}
          </div>
        ))}
      </div>
      {live && fetchedAt ? (
        <p className={`t-cap live-line${stale ? ' stale' : ''}`}>
          <span className="dot" />
          Live: {describeCode(live.code)} · updated {formatTime(fetchedAt, TRIP_TZ)}
          {stale && ' (saved copy)'}
        </p>
      ) : null}
      {day.weatherNote && <p className="t-foot">{day.weatherNote}</p>}
    </>
  );
};
