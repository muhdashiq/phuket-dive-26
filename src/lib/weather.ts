import type { SeaArea, Tone } from '../data/types';
import { localIsoToMs, TRIP_TZ } from './dates';
import { readJSON, STORAGE_KEYS, writeJSON } from './storage';

export const PHUKET = { lat: 7.8804, lon: 98.3923 };
export const SEA_POINTS: Record<SeaArea, [number, number]> = {
  racha: [7.58, 98.36],
  similan: [8.65, 97.62],
  south: [7.78, 98.58],
  phiphi: [7.66, 98.75],
  west: [7.88, 98.25],
};

// Weather is fetched at most once per CACHE_TTL_MS and kept in localStorage.
export const CACHE_TTL_MS = 10 * 60 * 1000;
// The Refresh button never refetches data younger than this.
export const MIN_REFRESH_MS = 60 * 1000;

const API = 'https://api.open-meteo.com/v1/forecast';
const MARINE = 'https://marine-api.open-meteo.com/v1/marine';

export type Fetched<T> = { data: T; fetchedAt: number; stale: boolean };

type CacheEntry = { t: number; d: unknown };

const isCacheEntry = (value: unknown): value is CacheEntry =>
  typeof value === 'object' && value !== null && typeof (value as CacheEntry).t === 'number' && 'd' in value;

// Cached JSON fetch: fresh cache is reused, stale cache is the offline fallback.
export const fetchCached = async (url: string, maxAge: number = CACHE_TTL_MS): Promise<Fetched<unknown>> => {
  const key = STORAGE_KEYS.weatherPrefix + url;
  const cached = readJSON<unknown>(key, null);
  const hit = isCacheEntry(cached) ? cached : null;
  if (hit && Date.now() - hit.t < maxAge) return { data: hit.d, fetchedAt: hit.t, stale: false };
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'error' in data) throw new Error('API error');
    const entry: CacheEntry = { t: Date.now(), d: data };
    writeJSON(key, entry);
    return { data, fetchedAt: entry.t, stale: false };
  } catch (error) {
    if (hit) return { data: hit.d, fetchedAt: hit.t, stale: true };
    throw error;
  }
};

const query = (params: Record<string, string | number>) =>
  Object.entries(params)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&');

export const tripForecastUrl = (start: string, end: string) =>
  `${API}?${query({
    latitude: PHUKET.lat,
    longitude: PHUKET.lon,
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,sunrise,sunset',
    timezone: TRIP_TZ,
    start_date: start,
    end_date: end,
  })}`;

export const tripMarineUrl = (area: SeaArea, start: string, end: string) => {
  const [lat, lon] = SEA_POINTS[area];
  return `${MARINE}?${query({ latitude: lat, longitude: lon, daily: 'wave_height_max', timezone: TRIP_TZ, start_date: start, end_date: end })}`;
};

export const nowUrl = (lat: number, lon: number) =>
  `${API}?${query({
    latitude: lat,
    longitude: lon,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m',
    daily: 'sunrise,sunset,precipitation_probability_max',
    timezone: 'auto',
    forecast_days: 2,
  })}`;

export const nowSeaUrl = (lat: number, lon: number) =>
  `${MARINE}?${query({ latitude: lat, longitude: lon, current: 'wave_height,sea_surface_temperature', timezone: 'auto' })}`;

/* ---------- Parsing ---------- */

const rec = (value: unknown): Record<string, unknown> => (typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {});
const numAt = (value: unknown, i: number): number | null => {
  const item = Array.isArray(value) ? value[i] : undefined;
  return typeof item === 'number' && Number.isFinite(item) ? item : null;
};
const strAt = (value: unknown, i: number): string | null => {
  const item = Array.isArray(value) ? value[i] : undefined;
  return typeof item === 'string' ? item : null;
};
const num = (value: unknown): number | null => (typeof value === 'number' && Number.isFinite(value) ? value : null);

export type DailyWeather = {
  code: number | null;
  tMax: number | null;
  tMin: number | null;
  rainPct: number | null;
  rainMm: number | null;
  windMax: number | null;
  gustMax: number | null;
  windDir: number | null;
  sunrise: number | null;
  sunset: number | null;
};

export const utcOffset = (json: unknown, fallback: number): number => num(rec(json).utc_offset_seconds) ?? fallback;

export const parseDaily = (json: unknown, offsetFallback: number): Record<string, DailyWeather> => {
  const daily = rec(rec(json).daily);
  const offset = utcOffset(json, offsetFallback);
  const times = Array.isArray(daily.time) ? daily.time : [];
  const out: Record<string, DailyWeather> = {};
  times.forEach((date, i) => {
    if (typeof date !== 'string') return;
    const rise = strAt(daily.sunrise, i);
    const set = strAt(daily.sunset, i);
    out[date] = {
      code: numAt(daily.weather_code, i),
      tMax: numAt(daily.temperature_2m_max, i),
      tMin: numAt(daily.temperature_2m_min, i),
      rainPct: numAt(daily.precipitation_probability_max, i),
      rainMm: numAt(daily.precipitation_sum, i),
      windMax: numAt(daily.wind_speed_10m_max, i),
      gustMax: numAt(daily.wind_gusts_10m_max, i),
      windDir: numAt(daily.wind_direction_10m_dominant, i),
      sunrise: rise ? localIsoToMs(rise, offset) : null,
      sunset: set ? localIsoToMs(set, offset) : null,
    };
  });
  return out;
};

export const parseWaves = (json: unknown): Record<string, number> => {
  const daily = rec(rec(json).daily);
  const times = Array.isArray(daily.time) ? daily.time : [];
  const out: Record<string, number> = {};
  times.forEach((date, i) => {
    const wave = numAt(daily.wave_height_max, i);
    if (typeof date === 'string' && wave !== null) out[date] = wave;
  });
  return out;
};

export type CurrentWeather = {
  temp: number | null;
  feels: number | null;
  humidity: number | null;
  rainMm: number | null;
  code: number | null;
  wind: number | null;
  windDir: number | null;
  gust: number | null;
};

export const parseCurrent = (json: unknown): CurrentWeather | null => {
  const current = rec(json).current;
  if (typeof current !== 'object' || current === null) return null;
  const c = rec(current);
  return {
    temp: num(c.temperature_2m),
    feels: num(c.apparent_temperature),
    humidity: num(c.relative_humidity_2m),
    rainMm: num(c.precipitation),
    code: num(c.weather_code),
    wind: num(c.wind_speed_10m),
    windDir: num(c.wind_direction_10m),
    gust: num(c.wind_gusts_10m),
  };
};

export type CurrentSea = { wave: number | null; water: number | null };

export const parseCurrentSea = (json: unknown): CurrentSea | null => {
  const current = rec(json).current;
  if (typeof current !== 'object' || current === null) return null;
  const c = rec(current);
  return { wave: num(c.wave_height), water: num(c.sea_surface_temperature) };
};

/* ---------- Presentation helpers ---------- */

const WMO: Record<number, string> = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 48: 'Fog',
  51: 'Light drizzle', 53: 'Drizzle', 55: 'Heavy drizzle', 56: 'Freezing drizzle', 57: 'Freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain', 67: 'Freezing rain',
  71: 'Light snow', 73: 'Snow', 75: 'Heavy snow', 77: 'Snow grains', 80: 'Light showers', 81: 'Showers',
  82: 'Heavy showers', 85: 'Snow showers', 86: 'Snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail', 99: 'Thunderstorm with hail',
};

export const describeCode = (code: number | null): string => (code === null ? 'Unknown' : (WMO[code] ?? 'Unknown'));

export const compass = (deg: number): string =>
  ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'][Math.round((((deg % 360) + 360) % 360) / 45) % 8] ?? 'N';

export const rainTone = (pct: number): Tone => (pct <= 30 ? 'good' : pct <= 60 ? 'watch' : 'poor');

export const adviceFor = (current: CurrentWeather | null, rainPct: number | null): string => {
  if (!current || current.code === null) return '';
  const c = current.code;
  if (c >= 95) return 'Thunderstorms around now. Boats may wait or change sites, so check with your dive shop.';
  if ((c >= 80 && c <= 82) || (c >= 61 && c <= 67)) return 'Raining now. Rain alone rarely stops a dive; thunderstorms and the waves they bring do.';
  if (rainPct !== null && rainPct >= 60) return `High rain chance today (${rainPct}%). Keep the Plan B ideas handy.`;
  if (current.gust !== null && current.gust >= 40) return `Gusty wind (${Math.round(current.gust)} km/h). Boat crossings may be bumpy.`;
  return 'No storms showing at the moment.';
};
