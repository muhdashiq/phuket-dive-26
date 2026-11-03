import { getDays } from '../data/trip';
import type { DayPlan } from '../data/types';
import { dateLabels } from './customDays';
import { dayToText } from './dayText';
import { profileForPrompt, type Profile } from './profile';
import type { DailyWeather } from './weather';
import { describeCode } from './weather';

const tripOutline = () => getDays().map((d) => `- ${d.dow} ${d.dom} (${d.date}): ${d.title} [${d.pill}]`).join('\n');

export const PLAN_SYSTEM = `You plan single days for a traveller on a dive trip based in Patong, Phuket, Thailand, in early November 2026 (start of the Andaman high season).

Plan around the traveller's profile and request:
- Keep dives within their certification and comfortable depth. If they dive on nitrox, keep depths within the MOD for their mix.
- No scuba diving within 24 hours before a flight. The flight home is Tuesday 10 November from Phuket airport (HKT); if a requested day is too close, plan land activities and say why in the summary.
- Use real places, piers, dive sites and operators in Phuket and the Andaman Sea. Don't invent exact prices or departure times: give typical ranges and say to confirm with the operator.
- Use 24-hour local times. Keep the day realistic for their preferred pace and budget.
- status: "good" for a normal day, "watch" if it depends on weather or booking, "poor" if it is risky or likely to be cancelled, "rest" for a land or rest day. statusLabel is 2–5 words, like "Good window · 2 dives".
- kind is "dive", "snorkel", "land" or "rest".
- diveSites only for dive or snorkel days (at most 3). places lists up to 6 locations with a Google Maps search query each, like "Chalong Pier, Phuket".
- checklist: up to 8 short, actionable items for the day. bring: up to 8 items. tips: up to 4.

Reply with one JSON object only, no other text, with exactly these fields:
{"title": string, "summary": string, "kind": "dive"|"snorkel"|"land"|"rest", "status": "good"|"watch"|"poor"|"rest", "statusLabel": string,
 "timeline": [{"time": string, "text": string}], "diveSites": [{"name": string, "note": string}], "bring": [string], "checklist": [string],
 "tips": [string], "places": [{"name": string, "query": string}], "estimatedCost": string}`;

export const planUserPrompt = (date: string, request: string, profile: Profile, name: string): string => {
  const { dow, dom } = dateLabels(date);
  return `Plan ${dow} ${dom} 2026 (${date}).

The trip so far:
${tripOutline()}

Traveller profile:
${profileForPrompt(profile, name)}

What they want from the day:
${request.trim()}`;
};

export const chatSystemPrompt = (day: DayPlan, profile: Profile, name: string, weather: DailyWeather | undefined): string => {
  const forecast = weather
    ? `Forecast for that day: ${describeCode(weather.code)}, air ${weather.tMax ?? '?'}°/${weather.tMin ?? '?'}°C, rain chance ${weather.rainPct ?? '?'}%, wind up to ${weather.windMax ?? '?'} km/h, gusts ${weather.gustMax ?? '?'} km/h.`
    : 'No live forecast is available for that day.';
  return `You are a friendly, experienced dive buddy and local guide for Phuket and the Andaman Sea. You are chatting with a traveller about the diving on one day of their trip.

Answer questions about the dive sites, marine life, conditions, currents, visibility, gas planning, what to expect, and things to do nearby. Keep answers short and practical: a few sentences or a short list, under about 180 words unless they ask for more. Use plain text, no markdown headings.

Safety: keep advice within their certification and training, and defer to the dive guide and boat captain on the day. Don't give medical advice beyond general guidance; for a suspected dive injury, tell them to stop diving, breathe oxygen if available and call Hyperbaric Services Thailand on +66 81 081 9000 or 1669. If you aren't sure of a fact, such as a current price or schedule, say so and suggest confirming with the operator.

Traveller profile:
${profileForPrompt(profile, name)}

The day they are asking about:
${dayToText(day, { full: true, checklist: false, notes: false })}

${forecast}

The whole trip:
${tripOutline()}`;
};
