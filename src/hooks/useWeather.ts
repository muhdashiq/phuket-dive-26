import { useCallback, useEffect, useState } from 'react';
import { useTrip } from '../data/trip';
import type { SeaArea } from '../data/types';
import { addDaysToYmd, TRIP_OFFSET_S, TRIP_TZ, ymdIn } from '../lib/dates';
import type { LatLon } from '../lib/prefs';
import {
  CACHE_TTL_MS,
  fetchCached,
  nowSeaUrl,
  nowUrl,
  parseCurrent,
  parseCurrentSea,
  parseDaily,
  parseWaves,
  PHUKET,
  SEA_POINTS,
  tripForecastUrl,
  tripMarineUrl,
  utcOffset,
  type CurrentSea,
  type CurrentWeather,
  type DailyWeather,
} from '../lib/weather';

const REFRESH_INTERVAL_MS = 60_000;

// Calls load() on mount, every minute, and when the tab becomes visible.
// The 10-minute cache keeps real network requests rare.
const usePolling = (load: (maxAge?: number) => Promise<boolean>) => {
  useEffect(() => {
    load();
    const id = window.setInterval(() => load(), REFRESH_INTERVAL_MS);
    const onVisible = () => document.visibilityState === 'visible' && load();
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);
};

export type TripWeather = {
  daily: Record<string, DailyWeather>;
  waves: Partial<Record<SeaArea, Record<string, number>>>;
  fetchedAt: number | null;
  stale: boolean;
};

// Open-Meteo forecasts about 16 days ahead; asking past that fails the whole
// request, so far-off added days simply show their saved values.
const FORECAST_DAYS_AHEAD = 15;

export const useTripWeather = () => {
  const [state, setState] = useState<TripWeather>({ daily: {}, waves: {}, fetchedAt: null, stale: false });

  const { days } = useTrip();
  const start = days[0]?.date ?? '';
  const lastDate = days[days.length - 1]?.date ?? start;
  const horizon = addDaysToYmd(ymdIn(TRIP_TZ), FORECAST_DAYS_AHEAD);
  const end = lastDate < horizon ? lastDate : horizon;
  const areas = [...new Set(days.map((day) => day.sea).filter((sea): sea is SeaArea => sea !== null))].sort().join(',');

  // Resolves true when the forecast is live (not a saved offline copy).
  const load = useCallback(async (maxAge: number = CACHE_TTL_MS): Promise<boolean> => {
    if (!start || end < start) return false;
    const marine = (areas ? (areas.split(',') as SeaArea[]) : []).map((area) =>
      fetchCached(tripMarineUrl(area, start, end), maxAge)
        .then((res) => setState((s) => ({ ...s, waves: { ...s.waves, [area]: parseWaves(res.data) } })))
        .catch(() => undefined),
    );
    const forecast = fetchCached(tripForecastUrl(start, end), maxAge)
      .then((res) => {
        setState((s) => ({ ...s, daily: parseDaily(res.data, TRIP_OFFSET_S), fetchedAt: res.fetchedAt, stale: res.stale }));
        return !res.stale;
      })
      .catch(() => false);
    const [ok] = await Promise.all([forecast, ...marine]);
    return ok;
  }, [start, end, areas]);

  usePolling(load);
  return [state, load] as const;
};

export type NowWeather = {
  current: CurrentWeather | null;
  sea: CurrentSea | null;
  daily: Record<string, DailyWeather>;
  timeZone: string;
  offsetS: number;
  fetchedAt: number | null;
  stale: boolean;
  error: boolean;
};

const deviceTimeZone = (): string | null => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
};

const emptyNow = (location: LatLon | null): NowWeather => ({
  current: null,
  sea: null,
  daily: {},
  timeZone: location ? (deviceTimeZone() ?? TRIP_TZ) : TRIP_TZ,
  offsetS: location ? -new Date().getTimezoneOffset() * 60 : TRIP_OFFSET_S,
  fetchedAt: null,
  stale: false,
  error: false,
});

export const useNowWeather = (location: LatLon | null) => {
  const [state, setState] = useState<NowWeather>(() => emptyNow(location));
  const lat = location?.lat ?? PHUKET.lat;
  const lon = location?.lon ?? PHUKET.lon;
  const sea = location ? ([location.lat, location.lon] as const) : SEA_POINTS.west;

  useEffect(() => {
    setState(emptyNow(location));
    // Reset only when the coordinates change.
  }, [lat, lon]);

  const load = useCallback(
    async (maxAge: number = CACHE_TTL_MS): Promise<boolean> => {
      const seaRequest = fetchCached(nowSeaUrl(sea[0], sea[1]), maxAge)
        .then((res) => setState((s) => ({ ...s, sea: parseCurrentSea(res.data) })))
        .catch(() => setState((s) => ({ ...s, sea: null })));
      const current = fetchCached(nowUrl(lat, lon), maxAge)
        .then((res) => {
          const json = res.data as { timezone?: unknown };
          setState((s) => ({
            ...s,
            current: parseCurrent(res.data),
            daily: parseDaily(res.data, s.offsetS),
            timeZone: typeof json.timezone === 'string' ? json.timezone : s.timeZone,
            offsetS: utcOffset(res.data, s.offsetS),
            fetchedAt: res.fetchedAt,
            stale: res.stale,
            error: false,
          }));
          return !res.stale;
        })
        .catch(() => {
          setState((s) => ({ ...s, error: true }));
          return false;
        });
      const [ok] = await Promise.all([current, seaRequest]);
      return ok;
    },
    [lat, lon, sea[0], sea[1]],
  );

  usePolling(load);
  return [state, load] as const;
};
