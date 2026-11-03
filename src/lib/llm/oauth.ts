import { readJSON, removeKey, STORAGE_KEYS, writeJSON } from '../storage';
import { LlmError } from './types';

// "Sign in with OpenRouter": OAuth with PKCE, which needs no server. The
// browser proves it started the sign-in (code verifier) and receives a key
// scoped to this app, which the user can revoke in their OpenRouter account.

const AUTH_URL = 'https://openrouter.ai/auth';
const EXCHANGE_URL = 'https://openrouter.ai/api/v1/auth/keys';
const PENDING_MAX_AGE_MS = 15 * 60 * 1000;

type Pending = { verifier: string; startedAt: number };

const base64url = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

export const createVerifier = (): string => base64url(crypto.getRandomValues(new Uint8Array(32)));

export const challengeFor = async (verifier: string): Promise<string> =>
  base64url(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))));

export const callbackUrl = () => `${window.location.origin}${window.location.pathname}`;

export const startOpenRouterSignIn = async (): Promise<void> => {
  const verifier = createVerifier();
  writeJSON(STORAGE_KEYS.oauthPending, { verifier, startedAt: Date.now() } satisfies Pending);
  const params = new URLSearchParams({ callback_url: callbackUrl(), code_challenge: await challengeFor(verifier), code_challenge_method: 'S256' });
  window.location.assign(`${AUTH_URL}?${params.toString()}`);
};

// Called on load. Returns the new key when the page was opened by the
// OpenRouter redirect, null when there is nothing to finish.
export const finishOpenRouterSignIn = async (): Promise<string | null> => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) return null;
  const pending = readJSON<Pending | null>(STORAGE_KEYS.oauthPending, null);
  removeKey(STORAGE_KEYS.oauthPending);
  url.searchParams.delete('code');
  window.history.replaceState(null, '', `${url.pathname}${url.search}#you`);
  if (!pending || typeof pending.verifier !== 'string' || Date.now() - pending.startedAt > PENDING_MAX_AGE_MS) {
    throw new LlmError('auth', 'That sign-in link has expired. Try signing in with OpenRouter again.');
  }
  let response: Response;
  try {
    response = await fetch(EXCHANGE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, code_verifier: pending.verifier, code_challenge_method: 'S256' }),
    });
  } catch {
    throw new LlmError('network', 'Couldn’t reach OpenRouter to finish signing in.');
  }
  if (!response.ok) throw new LlmError('auth', 'OpenRouter didn’t accept the sign-in. Try again.');
  const body = (await response.json()) as { key?: unknown };
  if (typeof body.key !== 'string' || !body.key) throw new LlmError('auth', 'OpenRouter didn’t return a key. Try again.');
  return body.key;
};
