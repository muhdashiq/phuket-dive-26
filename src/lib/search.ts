import { DAYS } from '../data/days';
import { PLACES, type PlaceKey } from '../data/places';
import { PLACE_GROUPS, RAINY_OPTIONS } from '../data/reference';
import type { DayId } from '../data/types';

export type SearchResults = {
  days: DayId[];
  places: { place: PlaceKey; note: string; group: string }[];
  rainy: string[];
};

const normalize = (text: string) =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, 'and');

// Every word of the query must appear somewhere in the item's text.
const matches = (haystack: string, words: string[]) => {
  const text = normalize(haystack);
  return words.every((word) => text.includes(word));
};

export const searchTrip = (query: string): SearchResults => {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return { days: [], places: [], rainy: [] };

  const days = DAYS.filter((day) =>
    matches([day.title, day.dow, day.dom, day.pill, typeof day.sub === 'string' ? day.sub : '', ...day.todos.map((t) => t.text)].join(' '), words),
  ).map((day) => day.id);

  const seen = new Set<PlaceKey>();
  const places = PLACE_GROUPS.flatMap((group) =>
    group.items
      .filter((item) => matches(`${PLACES[item.place].name} ${item.note} ${group.title}`, words))
      .map((item) => ({ place: item.place, note: item.note, group: group.title })),
  ).filter((item) => (seen.has(item.place) ? false : (seen.add(item.place), true)));

  const rainy = RAINY_OPTIONS.filter((option) => matches(`${option.title} ${option.badge}`, words)).map((option) => option.title);

  return { days, places, rainy };
};

export const resultCount = (results: SearchResults) => results.days.length + results.places.length + results.rainy.length;
