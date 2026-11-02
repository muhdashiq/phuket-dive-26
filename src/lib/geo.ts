import type { LatLon } from './prefs';

// Ask the browser for an approximate position (2 decimals ≈ 1 km).
export const requestLocation = (): Promise<LatLon> =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('unsupported'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: +pos.coords.latitude.toFixed(2), lon: +pos.coords.longitude.toFixed(2) }),
      (error) => reject(error),
      { timeout: 10_000, maximumAge: 10 * 60 * 1000 },
    );
  });
