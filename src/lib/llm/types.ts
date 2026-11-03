export const PROVIDER_IDS = ['anthropic', 'openai', 'gemini', 'openrouter'] as const;
export type ProviderId = (typeof PROVIDER_IDS)[number];

export type Connection = {
  id: string;
  provider: ProviderId;
  key: string;
  model: string;
  connectedAt: number;
};

export type LlmStore = { connections: Connection[]; activeId: string | null };

export type ChatTurn = { role: 'user' | 'assistant'; content: string };

export type ErrorKind = 'auth' | 'rate' | 'network' | 'refused' | 'invalid' | 'aborted' | 'other';

export class LlmError extends Error {
  constructor(
    public kind: ErrorKind,
    message: string,
  ) {
    super(message);
  }
}
