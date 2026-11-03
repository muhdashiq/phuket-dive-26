import type { Connection, LlmStore, ProviderId } from './types';
import { PROVIDER_IDS } from './types';

type ProviderMeta = {
  name: string;
  company: string;
  auth: 'key' | 'oauth';
  keyHint: string;
  keyUrl: string;
  // Tried in order against the provider's model list to pick a default.
  preferred: RegExp[];
};

export const PROVIDERS: Record<ProviderId, ProviderMeta> = {
  anthropic: {
    name: 'Claude',
    company: 'Anthropic',
    auth: 'key',
    keyHint: 'sk-ant-…',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    preferred: [/^claude-opus-5-5$/, /^claude-opus/, /^claude-sonnet/],
  },
  openai: {
    name: 'ChatGPT models',
    company: 'OpenAI',
    auth: 'key',
    keyHint: 'sk-…',
    keyUrl: 'https://platform.openai.com/api-keys',
    preferred: [/^gpt-5(\.\d+)?$/, /^gpt-5/, /^gpt-4\.1$/, /^gpt-4o$/],
  },
  gemini: {
    name: 'Gemini',
    company: 'Google',
    auth: 'key',
    keyHint: 'AIza…',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    preferred: [/^gemini-\d+(\.\d+)?-pro$/, /^gemini-.*-pro/, /^gemini-.*-flash$/],
  },
  openrouter: {
    name: 'OpenRouter',
    company: 'Claude, GPT, Gemini and more',
    auth: 'oauth',
    keyHint: 'sk-or-…',
    keyUrl: 'https://openrouter.ai/keys',
    preferred: [/^anthropic\/claude-opus/, /^anthropic\/claude-sonnet/, /^openai\/gpt-5/, /^google\/gemini.*pro/],
  },
};

export const pickDefaultModel = (provider: ProviderId, models: string[]): string => {
  for (const pattern of PROVIDERS[provider].preferred) {
    const match = models.find((m) => pattern.test(m));
    if (match) return match;
  }
  return models[0] ?? '';
};

const isProvider = (value: unknown): value is ProviderId => typeof value === 'string' && (PROVIDER_IDS as readonly string[]).includes(value);

export const sanitizeLlmStore = (raw: unknown): LlmStore => {
  if (typeof raw !== 'object' || raw === null) return { connections: [], activeId: null };
  const r = raw as Record<string, unknown>;
  const connections = (Array.isArray(r.connections) ? r.connections : []).flatMap((item): Connection[] => {
    if (typeof item !== 'object' || item === null) return [];
    const c = item as Record<string, unknown>;
    if (!isProvider(c.provider) || typeof c.key !== 'string' || !c.key || c.key.length > 400 || typeof c.id !== 'string') return [];
    return [{ id: c.id, provider: c.provider, key: c.key, model: typeof c.model === 'string' ? c.model.slice(0, 120) : '', connectedAt: typeof c.connectedAt === 'number' ? c.connectedAt : 0 }];
  });
  const activeId = typeof r.activeId === 'string' && connections.some((c) => c.id === r.activeId) ? r.activeId : (connections[0]?.id ?? null);
  return { connections, activeId };
};

export const activeConnection = (store: LlmStore): Connection | null => store.connections.find((c) => c.id === store.activeId) ?? null;

export const connectionLabel = (c: Connection) => `${PROVIDERS[c.provider].name} · ${c.model || 'no model'}`;

// Keys are never shown in full again after connecting.
export const maskKey = (key: string) => (key.length > 10 ? `${key.slice(0, 6)}…${key.slice(-4)}` : '••••');
