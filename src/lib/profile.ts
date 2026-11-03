// Basic profile details, kept on this device and used to personalise
// generated plans and chat answers.

export const CERT_LEVELS = ['Not certified', 'Open Water', 'Advanced Open Water', 'Rescue Diver', 'Divemaster', 'Instructor'] as const;
export type CertLevel = (typeof CERT_LEVELS)[number];

export const INTERESTS = ['Wrecks', 'Reefs', 'Big fish', 'Macro', 'Turtles', 'Photography', 'Snorkelling', 'Night dives', 'Food', 'Markets', 'Temples', 'Relaxing'] as const;

export const PACES = ['relaxed', 'balanced', 'packed'] as const;
export type Pace = (typeof PACES)[number];

export type Profile = {
  homeCountry: string;
  certLevel: CertLevel;
  loggedDives: number | null;
  nitrox: boolean;
  maxDepth: number | null;
  interests: string[];
  pace: Pace;
  budgetPerDay: number | null;
  diet: string;
  seasick: boolean;
  notes: string;
};

export const DEFAULT_PROFILE: Profile = {
  homeCountry: '',
  certLevel: 'Advanced Open Water',
  loggedDives: null,
  nitrox: true,
  maxDepth: 30,
  interests: [],
  pace: 'balanced',
  budgetPerDay: null,
  diet: '',
  seasick: false,
  notes: '',
};

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.trim().slice(0, max) : '');
const int = (value: unknown, min: number, max: number) =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? Math.round(value) : null;

export const sanitizeProfile = (raw: unknown): Profile => {
  if (typeof raw !== 'object' || raw === null) return DEFAULT_PROFILE;
  const r = raw as Record<string, unknown>;
  return {
    homeCountry: text(r.homeCountry, 60),
    certLevel: (CERT_LEVELS as readonly string[]).includes(r.certLevel as string) ? (r.certLevel as CertLevel) : DEFAULT_PROFILE.certLevel,
    loggedDives: int(r.loggedDives, 0, 20000),
    nitrox: r.nitrox !== false,
    maxDepth: int(r.maxDepth, 0, 130),
    interests: Array.isArray(r.interests) ? r.interests.filter((i): i is string => (INTERESTS as readonly string[]).includes(i as string)) : [],
    pace: (PACES as readonly string[]).includes(r.pace as string) ? (r.pace as Pace) : DEFAULT_PROFILE.pace,
    budgetPerDay: int(r.budgetPerDay, 0, 1_000_000),
    diet: text(r.diet, 80),
    seasick: r.seasick === true,
    notes: text(r.notes, 300),
  };
};

// One line for the UI, e.g. "Advanced Open Water · 45 dives · nitrox".
export const profileHeadline = (p: Profile): string =>
  [p.certLevel, p.loggedDives !== null && `${p.loggedDives} dives`, p.nitrox && 'nitrox', p.maxDepth !== null && `to ${p.maxDepth} m`].filter(Boolean).join(' · ');

// The profile as plain facts for an AI prompt.
export const profileForPrompt = (p: Profile, name: string): string =>
  [
    name && `Name: ${name}`,
    p.homeCountry && `From: ${p.homeCountry}`,
    `Certification: ${p.certLevel}${p.loggedDives !== null ? `, ${p.loggedDives} logged dives` : ''}`,
    `Nitrox certified: ${p.nitrox ? 'yes' : 'no'}`,
    p.maxDepth !== null && `Comfortable maximum depth: ${p.maxDepth} m`,
    p.interests.length > 0 && `Interests: ${p.interests.join(', ')}`,
    `Preferred pace: ${p.pace}`,
    p.budgetPerDay !== null && `Budget: about ${p.budgetPerDay.toLocaleString('en-US')} THB per day`,
    p.diet && `Diet: ${p.diet}`,
    p.seasick && 'Gets seasick: yes',
    p.notes && `Other notes: ${p.notes}`,
  ]
    .filter(Boolean)
    .join('\n');
