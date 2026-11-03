import Anthropic from '@anthropic-ai/sdk';
import { betaZodOutputFormat } from '@anthropic-ai/sdk/helpers/beta/zod';
import { readPlan, type GeneratedPlan } from '../customDays';
import { PlanSchema } from './planSchema';
import { LlmError, type ChatTurn } from './types';

// The browser calls the API directly with the user's own key. The SDK adds
// the header Anthropic requires for browser calls when this flag is set.
const client = (key: string) => new Anthropic({ apiKey: key, dangerouslyAllowBrowser: true, maxRetries: 1 });

// Models that accept the server-side refusal fallback ("default" routing).
const FALLBACK_MODELS = new Set(['claude-fable-5-1', 'claude-opus-5-5', 'claude-opus-5', 'claude-sonnet-5-5']);
// Models that accept output_config.effort.
const EFFORT_MODELS = /^claude-(fable-5|mythos-5|opus-5|sonnet-5|haiku-5|opus-4-[678]|sonnet-4-6)/;

const extras = (model: string) => ({
  ...(FALLBACK_MODELS.has(model) ? { betas: ['server-side-fallback-2026-07-01'], fallbacks: 'default' as const } : {}),
});

const effort = (model: string) => (EFFORT_MODELS.test(model) ? { effort: 'medium' as const } : {});

const toLlmError = (error: unknown): LlmError => {
  if (error instanceof LlmError) return error;
  if (error instanceof Anthropic.APIUserAbortError) return new LlmError('aborted', 'Stopped.');
  if (error instanceof Anthropic.AuthenticationError || error instanceof Anthropic.PermissionDeniedError)
    return new LlmError('auth', 'Claude rejected the API key. Reconnect it in You → AI services.');
  if (error instanceof Anthropic.RateLimitError) return new LlmError('rate', 'Claude is rate limiting this key. Try again in a minute.');
  if (error instanceof Anthropic.NotFoundError) return new LlmError('invalid', 'That Claude model isn’t available to this key. Pick another model.');
  if (error instanceof Anthropic.BadRequestError) return new LlmError('invalid', `Claude couldn’t take that request: ${error.message}`);
  if (error instanceof Anthropic.APIConnectionError) return new LlmError('network', 'Couldn’t reach Claude. Check your connection.');
  if (error instanceof Anthropic.APIError) return new LlmError('other', `Claude error ${error.status ?? ''}: ${error.message}`);
  return new LlmError('other', 'Something went wrong talking to Claude.');
};

export const anthropicModels = async (key: string): Promise<string[]> => {
  try {
    const ids: string[] = [];
    for await (const model of client(key).models.list()) ids.push(model.id);
    return ids;
  } catch (error) {
    throw toLlmError(error);
  }
};

type ChatInput = { key: string; model: string; system: string; messages: ChatTurn[]; signal?: AbortSignal; onText: (text: string) => void };

export const anthropicChat = async ({ key, model, system, messages, signal, onText }: ChatInput): Promise<string> => {
  try {
    const stream = client(key).beta.messages.stream(
      { model, max_tokens: 16000, system, messages, output_config: effort(model), ...extras(model) },
      { signal },
    );
    let text = '';
    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        text += event.delta.text;
        onText(text);
      }
    }
    const final = await stream.finalMessage();
    if (final.stop_reason === 'refusal') throw new LlmError('refused', 'Claude declined to answer that. Try rephrasing the question.');
    return text;
  } catch (error) {
    throw toLlmError(error);
  }
};

type PlanInput = { key: string; model: string; system: string; prompt: string; signal?: AbortSignal };

export const anthropicPlan = async ({ key, model, system, prompt, signal }: PlanInput): Promise<GeneratedPlan> => {
  try {
    const response = await client(key).beta.messages.parse(
      {
        model,
        max_tokens: 16000,
        system,
        messages: [{ role: 'user', content: prompt }],
        output_config: { ...effort(model), format: betaZodOutputFormat(PlanSchema) },
        ...extras(model),
      },
      { signal },
    );
    if (response.stop_reason === 'refusal') throw new LlmError('refused', 'Claude declined to plan that day. Try a different prompt.');
    const plan = readPlan(response.parsed_output);
    if (!plan) throw new LlmError('invalid', 'Claude’s plan came back incomplete. Try again.');
    return plan;
  } catch (error) {
    throw toLlmError(error);
  }
};
