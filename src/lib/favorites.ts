import { PLACES, type PlaceKey } from '../data/places';

export const isPlaceKey = (value: unknown): value is PlaceKey => typeof value === 'string' && Object.hasOwn(PLACES, value);

export const sanitizeFavorites = (raw: unknown): PlaceKey[] =>
  Array.isArray(raw) ? [...new Set(raw.filter(isPlaceKey))] : [];

export const toggleFavorite = (list: PlaceKey[], key: PlaceKey): PlaceKey[] =>
  list.includes(key) ? list.filter((k) => k !== key) : [...list, key];
