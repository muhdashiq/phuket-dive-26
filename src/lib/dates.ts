export const TRIP_TZ = 'Asia/Bangkok';
export const TRIP_OFFSET_S = 7 * 3600;

export type Ymd = string; // YYYY-MM-DD

export const ymdIn = (timeZone: string, ms: number = Date.now()): Ymd => {
  try {
    const parts: Record<string, string> = {};
    new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(ms)
      .forEach((part) => {
        parts[part.type] = part.value;
      });
    return `${parts.year}-${parts.month}-${parts.day}`;
  } catch {
    return new Date(ms).toISOString().slice(0, 10);
  }
};

export const ymdToUTC = (ymd: Ymd): number => Date.UTC(+ymd.slice(0, 4), +ymd.slice(5, 7) - 1, +ymd.slice(8, 10));

export const addDaysToYmd = (ymd: Ymd, n: number): Ymd => new Date(ymdToUTC(ymd) + n * 864e5).toISOString().slice(0, 10);

export const daysBetween = (from: Ymd, to: Ymd): number => Math.round((ymdToUTC(to) - ymdToUTC(from)) / 864e5);

// "2026-11-03T06:14" in a zone with the given UTC offset -> epoch ms
export const localIsoToMs = (iso: string, offsetS: number): number =>
  Date.UTC(+iso.slice(0, 4), +iso.slice(5, 7) - 1, +iso.slice(8, 10), +iso.slice(11, 13), +iso.slice(14, 16)) - offsetS * 1000;

export const formatTime = (ms: number, timeZone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }).format(ms);
  } catch {
    return new Date(ms).toTimeString().slice(0, 5);
  }
};

export const formatDateTime = (ms: number, timeZone: string): string => {
  try {
    return new Intl.DateTimeFormat('en-GB', { timeZone, weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).format(ms);
  } catch {
    return new Date(ms).toString().slice(0, 21);
  }
};

export const formatDuration = (ms: number): string => {
  const minutes = Math.round(Math.abs(ms) / 6e4);
  if (minutes < 1) return 'less than a minute';
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return hours ? `${hours} h${rest ? ` ${rest} min` : ''}` : `${minutes} min`;
};

export const formatRelative = (ms: number): string => {
  if (Math.abs(ms) < 6e4) return 'now';
  return ms > 0 ? `in ${formatDuration(ms)}` : `${formatDuration(ms)} ago`;
};

export type SunTimes = { rise: number | null; set: number | null };

// NOAA sunrise/sunset approximation, accurate to about two minutes.
export const sunTimes = (ymd: Ymd, lat: number, lon: number, offsetHours: number): SunTimes => {
  const year = +ymd.slice(0, 4);
  const month = +ymd.slice(5, 7);
  const day = +ymd.slice(8, 10);
  const dayOfYear = Math.round((Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 0)) / 864e5);
  const rad = Math.PI / 180;
  const lngHour = lon / 15;

  const eventAt = (baseHour: number, rising: boolean): number | null => {
    const t = dayOfYear + (baseHour - lngHour) / 24;
    const meanAnomaly = 0.9856 * t - 3.289;
    let trueLong = (meanAnomaly + 1.916 * Math.sin(meanAnomaly * rad) + 0.02 * Math.sin(2 * meanAnomaly * rad) + 282.634) % 360;
    if (trueLong < 0) trueLong += 360;
    let rightAsc = Math.atan(0.91764 * Math.tan(trueLong * rad)) / rad;
    rightAsc = ((rightAsc % 360) + 360) % 360;
    rightAsc = (rightAsc + (Math.floor(trueLong / 90) * 90 - Math.floor(rightAsc / 90) * 90)) / 15;
    const sinDec = 0.39782 * Math.sin(trueLong * rad);
    const cosDec = Math.cos(Math.asin(sinDec));
    const cosH = (Math.cos(90.833 * rad) - sinDec * Math.sin(lat * rad)) / (cosDec * Math.cos(lat * rad));
    if (cosH > 1 || cosH < -1) return null;
    const hourAngle = (rising ? 360 - Math.acos(cosH) / rad : Math.acos(cosH) / rad) / 15;
    const localMean = hourAngle + rightAsc - 0.06571 * t - 6.622;
    const utc = (((localMean - lngHour) % 24) + 24) % 24;
    const local = (((utc + offsetHours) % 24) + 24) % 24;
    return Date.UTC(year, month - 1, day) + (local - offsetHours) * 36e5;
  };

  return { rise: eventAt(6, true), set: eventAt(18, false) };
};
