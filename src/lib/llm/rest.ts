import { readPlan, type GeneratedPlan } from '../customDays';
import { PROVIDERS } from './providers';
import { sseData } from './sse';
import { LlmError, type ChatTurn, type ProviderId } from './types';

// OpenAI, OpenRouter and Gemini are called over their public REST APIs,
// which accept browser requests with the user's own key.

type RestProvider = Exclude<ProviderId, 'anthropic'>;

const OPENAI_BASE = 'https://api.openai.com/v1';
const OPENROUTER_BASE = 'https://openrouter.ai/api/v1';
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta';

const headersFor = (provider: RestProvider, key: string): Record<string, string> => {
  switch (provider) {
    case 'gemini':
      return { 'Content-Type': 'application/json', 'x-goog-api-key': key };
    case 'openrouter':
      return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}`, 'HTTP-Referer': window.location.origin, 'X-Title': 'Phuket Dive Week' };
    case 'openai':
      return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
  }
};

const request = async (provider: RestProvider, url: string, init: RequestInit): Promise<Response> => {
  const name = PROVIDERS[provider].name;
  let response: Response;
  try {
    response = await fetch(url, init);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw new LlmError('aborted', 'Stopped.');
    throw new LlmError('network', `Couldn’t reach ${name}. Check your connection.`);
  }
  if (response.ok) return response;
  let detail = '';
  try {
    const body = (await response.json()) as { error?: { message?: string } | string };
    detail = typeof body.error === 'string' ? body.error : (body.error?.message ?? '');
  } catch {
    /* no JSON body */
  }
  if (response.status === 401 || response.status === 403) throw new LlmError('auth', `${name} rejected the key. Reconnect it in You → AI services.`);
  if (response.status === 429) throw new LlmError('rate', `${name} is rate limiting this key, or it is out of credit. Try again later.`);
  if (response.status === 404) throw new LlmError('invalid', `That ${name} model isn’t available to this key. Pick another model.`);
  throw new LlmError('other', `${name} error ${response.status}${detail ? `: ${detail}` : ''}`);
};

const CHAT_MODEL_EXCLUDE = /(audio|realtime|tts|transcribe|whisper|image|dall-e|embedding|moderation|search|instruct|davinci|babbage)/;

export const restModels = async (provider: RestProvider, key: string): Promise<string[]> => {
  if (provider === 'gemini') {
    const res = await request(provider, `${GEMINI_BASE}/models?pageSize=200`, { headers: headersFor(provider, key) });
    const body = (await res.json()) as { models?: { name?: string; supportedGenerationMethods?: string[] }[] };
    return (body.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent') && m.name?.startsWith('models/gemini'))
      .map((m) => (m.name ?? '').replace(/^models\//, ''));
  }
  const base = provider === 'openai' ? OPENAI_BASE : OPENROUTER_BASE;
  const res = await request(provider, `${base}/models`, { headers: headersFor(provider, key) });
  const body = (await res.json()) as { data?: { id?: string }[] };
  const ids = (body.data ?? []).map((m) => m.id ?? '').filter(Boolean);
  return provider === 'openai' ? ids.filter((id) => /^(gpt|o\d|chatgpt)/.test(id) && !CHAT_MODEL_EXCLUDE.test(id)).sort().reverse() : ids;
};

type ChatInput = { provider: RestProvider; key: string; model: string; system: string; messages: ChatTurn[]; signal?: AbortSignal; onText: (text: string) => void };

export const restChat = async ({ provider, key, model, system, messages, signal, onText }: ChatInput): Promise<string> => {
  let text = '';
  if (provider === 'gemini') {
    const res = await request(provider, `${GEMINI_BASE}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: headersFor(provider, key),
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
      }),
    });
    for await (const data of sseData(res, signal)) {
      const chunk = JSON.parse(data) as { candidates?: { content?: { parts?: { text?: string }[] }; finishReason?: string }[] };
      const candidate = chunk.candidates?.[0];
      if (candidate?.finishReason === 'SAFETY') throw new LlmError('refused', 'Gemini declined to answer that. Try rephrasing the question.');
      text += (candidate?.content?.parts ?? []).map((p) => p.text ?? '').join('');
      onText(text);
    }
    return text;
  }
  const base = provider === 'openai' ? OPENAI_BASE : OPENROUTER_BASE;
  const res = await request(provider, `${base}/chat/completions`, {
    method: 'POST',
    headers: headersFor(provider, key),
    signal,
    body: JSON.stringify({ model, stream: true, messages: [{ role: 'system', content: system }, ...messages] }),
  });
  for await (const data of sseData(res, signal)) {
    if (data === '[DONE]') break;
    const chunk = JSON.parse(data) as { choices?: { delta?: { content?: string | null; refusal?: string | null } }[] };
    const delta = chunk.choices?.[0]?.delta;
    if (delta?.refusal) throw new LlmError('refused', `${PROVIDERS[provider].name} declined to answer that.`);
    if (delta?.content) {
      text += delta.content;
      onText(text);
    }
  }
  return text;
};

type PlanInput = { provider: RestProvider; key: string; model: string; system: string; prompt: string; signal?: AbortSignal };

export const restPlan = async ({ provider, key, model, system, prompt, signal }: PlanInput): Promise<GeneratedPlan> => {
  let raw = '';
  if (provider === 'gemini') {
    const res = await request(provider, `${GEMINI_BASE}/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: headersFor(provider, key),
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: system }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });
    const body = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
    raw = (body.candidates?.[0]?.content?.parts ?? []).map((p) => p.text ?? '').join('');
  } else {
    const base = provider === 'openai' ? OPENAI_BASE : OPENROUTER_BASE;
    const res = await request(provider, `${base}/chat/completions`, {
      method: 'POST',
      headers: headersFor(provider, key),
      signal,
      body: JSON.stringify({
        model,
        response_format: { type: 'json_object' },
        messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
      }),
    });
    const body = (await res.json()) as { choices?: { message?: { content?: string | null; refusal?: string | null } }[] };
    const message = body.choices?.[0]?.message;
    if (message?.refusal) throw new LlmError('refused', `${PROVIDERS[provider].name} declined to plan that day.`);
    raw = message?.content ?? '';
  }
  const plan = readPlan(raw);
  if (!plan) throw new LlmError('invalid', `${PROVIDERS[provider].name}’s plan came back incomplete. Try again, or pick a stronger model.`);
  return plan;
};
