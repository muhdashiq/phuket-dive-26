import { mapsSearchUrl } from '../data/places';
import type { DayPlan, Tone } from '../data/types';
import { Icon } from '../components/Icon';

// The shape every AI provider must return for a generated day. The Claude
// client sends the matching Zod schema (planSchema.ts) as structured output;
// every reply, whichever service produced it, is checked here.
export type GeneratedPlan = {
  title: string;
  summary: string;
  kind: 'dive' | 'snorkel' | 'land' | 'rest';
  status: 'good' | 'watch' | 'poor' | 'rest';
  statusLabel: string;
  timeline: { time: string; text: string }[];
  diveSites: { name: string; note: string }[];
  bring: string[];
  checklist: string[];
  tips: string[];
  places: { name: string; query: string }[];
  estimatedCost: string;
};

const KINDS = ['dive', 'snorkel', 'land', 'rest'] as const;
const STATUSES = ['good', 'watch', 'poor', 'rest'] as const;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const str = (v: unknown) => (typeof v === 'string' ? v : '');
const strList = (v: unknown) => (Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string') : []);
const pairs = <A extends string, B extends string>(v: unknown, a: A, b: B) =>
  (Array.isArray(v) ? v.filter(isObj) : []).map((x) => ({ [a]: str(x[a]), [b]: str(x[b]) }) as Record<A | B, string>);

// Lenient structural check: missing lists become empty, wrong enums fall back.
const validatePlan = (value: unknown): GeneratedPlan | null => {
  if (!isObj(value) || typeof value.title !== 'string') return null;
  return {
    title: value.title,
    summary: str(value.summary),
    kind: (KINDS as readonly string[]).includes(str(value.kind)) ? (value.kind as GeneratedPlan['kind']) : 'land',
    status: (STATUSES as readonly string[]).includes(str(value.status)) ? (value.status as GeneratedPlan['status']) : 'watch',
    statusLabel: str(value.statusLabel),
    timeline: pairs(value.timeline, 'time', 'text'),
    diveSites: pairs(value.diveSites, 'name', 'note'),
    bring: strList(value.bring),
    checklist: strList(value.checklist),
    tips: strList(value.tips),
    places: pairs(value.places, 'name', 'query'),
    estimatedCost: str(value.estimatedCost),
  };
};

const cut = (value: string, max: number) => value.trim().slice(0, max);

// Length limits live here rather than in the schema, so every provider's
// structured-output mode accepts the schema as-is.
export const clampPlan = (plan: GeneratedPlan): GeneratedPlan | null => {
  const title = cut(plan.title, 80);
  if (!title) return null;
  return {
    title,
    summary: cut(plan.summary, 240),
    kind: plan.kind,
    status: plan.status,
    statusLabel: cut(plan.statusLabel, 40),
    timeline: plan.timeline.slice(0, 16).map((t) => ({ time: cut(t.time, 12), text: cut(t.text, 240) })).filter((t) => t.text),
    diveSites: plan.diveSites.slice(0, 4).map((d) => ({ name: cut(d.name, 60), note: cut(d.note, 200) })).filter((d) => d.name),
    bring: plan.bring.slice(0, 12).map((b) => cut(b, 120)).filter(Boolean),
    checklist: plan.checklist.slice(0, 12).map((c) => cut(c, 120)).filter(Boolean),
    tips: plan.tips.slice(0, 6).map((t) => cut(t, 240)).filter(Boolean),
    places: plan.places.slice(0, 8).map((p) => ({ name: cut(p.name, 60), query: cut(p.query, 100) })).filter((p) => p.name && p.query),
    estimatedCost: cut(plan.estimatedCost, 80),
  };
};

// Accepts a parsed object or a JSON string (possibly wrapped in prose or a
// code fence) and returns a clean plan, or null.
export const readPlan = (raw: unknown): GeneratedPlan | null => {
  let value = raw;
  if (typeof raw === 'string') {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return null;
    try {
      value = JSON.parse(raw.slice(start, end + 1));
    } catch {
      return null;
    }
  }
  const plan = validatePlan(value);
  return plan ? clampPlan(plan) : null;
};

export type CustomDay = {
  id: string;
  date: string;
  prompt: string;
  model: string;
  createdAt: number;
  plan: GeneratedPlan;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const CUSTOM_ID = /^x-\d{8}-[a-z0-9]{4}$/;

export const newCustomDayId = (date: string) => `x-${date.replace(/-/g, '')}-${Math.random().toString(36).slice(2, 6).padEnd(4, '0')}`;

export const sanitizeCustomDays = (raw: unknown): CustomDay[] => {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  return raw.flatMap((item): CustomDay[] => {
    if (typeof item !== 'object' || item === null) return [];
    const r = item as Record<string, unknown>;
    const plan = readPlan(r.plan);
    if (typeof r.id !== 'string' || !CUSTOM_ID.test(r.id) || typeof r.date !== 'string' || !DATE.test(r.date) || !plan) return [];
    if (seen.has(r.date)) return [];
    seen.add(r.date);
    return [{
      id: r.id,
      date: r.date,
      prompt: typeof r.prompt === 'string' ? r.prompt.slice(0, 1000) : '',
      model: typeof r.model === 'string' ? r.model.slice(0, 80) : '',
      createdAt: typeof r.createdAt === 'number' ? r.createdAt : 0,
      plan,
    }];
  });
};

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export const dateLabels = (ymd: string) => {
  const d = new Date(`${ymd}T12:00:00Z`);
  return { dow: DOW[d.getUTCDay()] ?? '', dom: `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()] ?? ''}` };
};

export const ExternalMapLink = ({ name, query }: { name: string; query: string }) => (
  <a className="map" href={mapsSearchUrl(query)} target="_blank" rel="noopener" aria-label={`Open ${name} in Google Maps`}>
    <Icon name="pin" />
    Map
  </a>
);

// Turns a stored generated plan into the same shape as a built-in day, so
// every screen, checklist and reminder handles it the same way.
export const toDayPlan = (custom: CustomDay): DayPlan => {
  const { plan } = custom;
  const { dow, dom } = dateLabels(custom.date);
  const placeFor = (name: string) => plan.places.find((p) => p.name.toLowerCase() === name.toLowerCase());
  const tone: Tone = plan.status;
  const wet = plan.kind === 'dive' || plan.kind === 'snorkel';
  return {
    id: custom.id,
    date: custom.date,
    dow,
    dom,
    tone,
    pill: plan.statusLabel || 'Your plan',
    title: plan.title,
    sub: plan.summary,
    chipNote: 'Added',
    sea: wet ? 'west' : null,
    weather: wet ? { wind: '—', sea: '—', seaNote: 'Live when online' } : {},
    weatherNote: 'Generated from your prompt. Check times, prices and conditions with the operator before you go.',
    left: (
      <>
        {plan.timeline.length > 0 && (
          <>
            <h3>Day timeline</h3>
            <ul className="timeline">
              {plan.timeline.map((item, i) => (
                <li key={i}><span className="tm">{item.time}</span><span>{item.text}</span></li>
              ))}
            </ul>
          </>
        )}
        {plan.diveSites.length > 0 && (
          <>
            <h3>{plan.kind === 'snorkel' ? 'Snorkel spots' : 'Dive plan'}</h3>
            <ol className="dives">
              {plan.diveSites.map((site, i) => {
                const place = placeFor(site.name);
                return (
                  <li key={i}><span><b>{site.name}</b>{place && <ExternalMapLink name={place.name} query={place.query} />} — {site.note}</span></li>
                );
              })}
            </ol>
          </>
        )}
      </>
    ),
    right: (
      <>
        {plan.bring.length > 0 && (
          <>
            <h3>Bring</h3>
            <ul className="bring">{plan.bring.map((item, i) => <li key={i}>{item}</li>)}</ul>
          </>
        )}
        {plan.places.length > 0 && (
          <>
            <h3>Places</h3>
            <ul className="rows">
              {plan.places.map((place, i) => (
                <li key={i}><span><b>{place.name}</b><small>{place.query}</small></span><ExternalMapLink name={place.name} query={place.query} /></li>
              ))}
            </ul>
          </>
        )}
        {plan.estimatedCost && <p className="note"><b>Estimated cost:</b> {plan.estimatedCost}</p>}
        <p className="note"><b>Your prompt:</b> {custom.prompt}</p>
      </>
    ),
    planB: plan.tips.length ? { title: 'Tips', items: plan.tips } : undefined,
    todos: plan.checklist.map((text, i) => ({ id: `g${i + 1}`, text })),
    custom: { prompt: custom.prompt, model: custom.model, createdAt: custom.createdAt },
  };
};
