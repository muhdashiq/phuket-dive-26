import { useEffect, useState, type FormEvent } from 'react';
import { startOpenRouterSignIn } from '../lib/llm/oauth';
import {
  LlmError,
  listModels,
  maskKey,
  pickDefaultModel,
  PROVIDER_IDS,
  PROVIDERS,
  type Connection,
  type LlmStore,
  type ProviderId,
} from '../lib/llm';
import { Icon } from './Icon';
import { Alert, Sheet } from './Sheet';
import { useToast } from './Toast';

type AiSheetProps = {
  open: boolean;
  onClose: () => void;
  store: LlmStore;
  onChange: (update: (store: LlmStore) => LlmStore) => void;
};

const TILE: Record<ProviderId, string> = { anthropic: 'amber', openai: 'green', gemini: '', openrouter: 'indigo' };
const newId = () => `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const AiSheet = ({ open, onClose, store, onChange }: AiSheetProps) => {
  const toast = useToast();
  const [connecting, setConnecting] = useState<ProviderId | null>(null);
  const [key, setKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [models, setModels] = useState<Record<string, string[]>>({});
  const [removing, setRemoving] = useState<Connection | null>(null);

  useEffect(() => {
    if (!open) {
      setConnecting(null);
      setKey('');
      setError('');
    }
  }, [open]);

  const connectWithKey = async (event: FormEvent) => {
    event.preventDefault();
    if (!connecting || !key.trim()) return;
    setBusy(true);
    setError('');
    try {
      const found = await listModels(connecting, key.trim());
      if (found.length === 0) throw new LlmError('invalid', 'That key works, but no chat models are available to it.');
      const connection: Connection = { id: newId(), provider: connecting, key: key.trim(), model: pickDefaultModel(connecting, found), connectedAt: Date.now() };
      setModels((m) => ({ ...m, [connection.id]: found }));
      onChange((s) => ({ connections: [...s.connections.filter((c) => c.provider !== connecting), connection], activeId: connection.id }));
      toast({ message: `${PROVIDERS[connecting].name} connected`, tone: 'success' });
      setConnecting(null);
      setKey('');
    } catch (err) {
      setError(err instanceof LlmError ? err.message : 'Couldn’t check that key.');
    } finally {
      setBusy(false);
    }
  };

  const loadModels = async (connection: Connection) => {
    if (models[connection.id]) return;
    try {
      const found = await listModels(connection.provider, connection.key);
      setModels((m) => ({ ...m, [connection.id]: found }));
    } catch (err) {
      toast({ message: err instanceof LlmError ? err.message : 'Couldn’t load the model list', tone: 'error' });
    }
  };

  const setModel = (id: string, model: string) =>
    onChange((s) => ({ ...s, connections: s.connections.map((c) => (c.id === id ? { ...c, model } : c)) }));

  return (
    <Sheet open={open} onClose={onClose} title="AI services">
      <p className="t-sub">
        Connect an AI service to plan new days and chat about the diving. Requests go straight from this device to the service you pick, using your account.
      </p>

      {PROVIDER_IDS.map((provider) => {
        const meta = PROVIDERS[provider];
        const connection = store.connections.find((c) => c.provider === provider);
        const active = connection && connection.id === store.activeId;
        const list = connection ? models[connection.id] : undefined;
        return (
          <div key={provider} className={`ai-card${active ? ' active' : ''}`}>
            <div className="ai-head">
              <span className={`tile-icon ${TILE[provider]}`}><Icon name="sparkles" size={18} /></span>
              <span className="row-body">
                <span className="t-headline">{meta.name}</span>
                <span className="t-foot">{connection ? `Connected · key ${maskKey(connection.key)}` : meta.company}</span>
              </span>
              {active && <span className="pill tint">In use</span>}
            </div>

            {connection ? (
              <>
                <label className="field">
                  <span>Model</span>
                  <select value={connection.model} onFocus={() => loadModels(connection)} onPointerDown={() => loadModels(connection)} onChange={(e) => setModel(connection.id, e.target.value)}>
                    {(list && list.length ? list : [connection.model]).map((m) => <option key={m}>{m}</option>)}
                  </select>
                </label>
                <div className="ai-actions">
                  {!active && (
                    <button className="btn btn-small" type="button" onClick={() => onChange((s) => ({ ...s, activeId: connection.id }))}>
                      Use {meta.name}
                    </button>
                  )}
                  <button className="btn btn-danger btn-small" type="button" onClick={() => setRemoving(connection)}>Disconnect</button>
                </div>
              </>
            ) : connecting === provider ? (
              <form className="ai-form" onSubmit={connectWithKey}>
                <label className="sr-only" htmlFor={`key-${provider}`}>{meta.name} API key</label>
                <input
                  id={`key-${provider}`}
                  type="password"
                  autoComplete="off"
                  spellCheck={false}
                  value={key}
                  placeholder={`Paste your API key (${meta.keyHint})`}
                  onChange={(e) => setKey(e.target.value)}
                  autoFocus
                />
                {error && <p className="form-error" role="alert">{error}</p>}
                <p className="t-cap">
                  Get a key at <a href={meta.keyUrl} target="_blank" rel="noopener">{new URL(meta.keyUrl).host}</a>. Set a spending limit on it. The key is kept in this browser and only sent to {meta.company}.
                </p>
                <div className="ai-actions">
                  <button className="btn btn-small" type="submit" disabled={busy || !key.trim()}>{busy ? 'Checking…' : 'Connect'}</button>
                  <button className="btn btn-plain btn-small" type="button" onClick={() => setConnecting(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="ai-actions">
                {meta.auth === 'oauth' && (
                  <button className="btn btn-small" type="button" onClick={() => void startOpenRouterSignIn()}>
                    Sign in with OpenRouter
                  </button>
                )}
                <button
                  className={`btn ${meta.auth === 'oauth' ? 'btn-plain' : ''} btn-small`}
                  type="button"
                  onClick={() => {
                    setConnecting(provider);
                    setKey('');
                    setError('');
                  }}
                >
                  {meta.auth === 'oauth' ? 'Use a key instead' : 'Connect with API key'}
                </button>
              </div>
            )}
          </div>
        );
      })}

      <p className="t-cap">
        Claude, OpenAI and Gemini don’t offer “sign in with your account” for other apps, so they connect with an API key from their developer console. OpenRouter
        supports a real sign-in and gives you access to models from all of them. Anyone using this browser can use a connected key; disconnect it when you’re done.
      </p>

      <Alert
        open={removing !== null}
        title={`Disconnect ${removing ? PROVIDERS[removing.provider].name : ''}?`}
        message="The key is removed from this browser. Days you already planned stay."
        confirmLabel="Disconnect"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          const target = removing;
          setRemoving(null);
          if (!target) return;
          onChange((s) => {
            const connections = s.connections.filter((c) => c.id !== target.id);
            return { connections, activeId: s.activeId === target.id ? (connections[0]?.id ?? null) : s.activeId };
          });
          toast({ message: `${PROVIDERS[target.provider].name} disconnected`, tone: 'info' });
        }}
      />
    </Sheet>
  );
};
