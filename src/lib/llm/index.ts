import type { GeneratedPlan } from '../customDays';
import type { ChatTurn, Connection, ProviderId } from './types';

export * from './types';
export * from './providers';

// Provider clients (including the Anthropic SDK) load on first use, so the
// rest of the app stays small for people who never connect an AI service.
const anthropic = () => import('./anthropic');
const rest = () => import('./rest');

export const listModels = async (provider: ProviderId, key: string): Promise<string[]> =>
  provider === 'anthropic' ? (await anthropic()).anthropicModels(key) : (await rest()).restModels(provider, key);

type ChatArgs = { connection: Connection; system: string; messages: ChatTurn[]; signal?: AbortSignal; onText: (text: string) => void };

export const streamChat = async ({ connection, ...args }: ChatArgs): Promise<string> =>
  connection.provider === 'anthropic'
    ? (await anthropic()).anthropicChat({ key: connection.key, model: connection.model, ...args })
    : (await rest()).restChat({ provider: connection.provider, key: connection.key, model: connection.model, ...args });

type PlanArgs = { connection: Connection; system: string; prompt: string; signal?: AbortSignal };

export const generatePlan = async ({ connection, ...args }: PlanArgs): Promise<GeneratedPlan> =>
  connection.provider === 'anthropic'
    ? (await anthropic()).anthropicPlan({ key: connection.key, model: connection.model, ...args })
    : (await rest()).restPlan({ provider: connection.provider, key: connection.key, model: connection.model, ...args });
