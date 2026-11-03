import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useTrip } from '../data/trip';
import type { DayId } from '../data/types';
import { ProfileButton, useApp } from '../components/AppContext';
import { Icon } from '../components/Icon';
import { Alert } from '../components/Sheet';
import { EmptyState, ScreenHeader } from '../components/ui';
import type { TripWeather } from '../hooks/useWeather';
import { appendTurn, forRequest, MAX_MESSAGE, suggestionsFor, type ChatStore } from '../lib/chats';
import { connectionLabel, LlmError, streamChat } from '../lib/llm';
import { chatSystemPrompt } from '../lib/prompts';

type ChatScreenProps = {
  day: DayId;
  onDay: (day: DayId) => void;
  chats: ChatStore;
  onChats: (update: (store: ChatStore) => ChatStore) => void;
  weather: TripWeather;
};

export const ChatScreen = ({ day: dayId, onDay, chats, onChats, weather }: ChatScreenProps) => {
  const { days, byId } = useTrip();
  const { connection, profile, name, openAi } = useApp();
  const day = byId.get(dayId) ?? days[0];
  const [draft, setDraft] = useState('');
  const [streaming, setStreaming] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);
  const abort = useRef<AbortController | null>(null);
  const partial = useRef('');
  const endRef = useRef<HTMLDivElement>(null);
  const turns = day ? (chats[day.id] ?? []) : [];

  useEffect(() => () => abort.current?.abort(), []);
  useEffect(() => {
    abort.current?.abort();
    setStreaming(null);
    setError('');
  }, [dayId]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'end', behavior: 'smooth' });
  }, [turns.length, streaming]);

  if (!day) return null;

  const send = async (text: string) => {
    const question = text.trim().slice(0, MAX_MESSAGE);
    if (!question || !connection || streaming !== null) return;
    setDraft('');
    setError('');
    const history = [...turns, { role: 'user' as const, content: question }];
    onChats((s) => appendTurn(s, day.id, { role: 'user', content: question }));
    const controller = new AbortController();
    abort.current = controller;
    setStreaming('');
    partial.current = '';
    try {
      const answer = await streamChat({
        connection,
        system: chatSystemPrompt(day, profile, name, weather.daily[day.date]),
        messages: forRequest(history),
        signal: controller.signal,
        onText: (text) => {
          partial.current = text;
          setStreaming(text);
        },
      });
      if (answer.trim()) onChats((s) => appendTurn(s, day.id, { role: 'assistant', content: answer }));
    } catch (err) {
      if (err instanceof LlmError && err.kind === 'aborted') return;
      setError(err instanceof LlmError ? err.message : 'Couldn’t get an answer. Try again.');
    } finally {
      if (abort.current === controller) {
        // Keep whatever arrived before a stop.
        const kept = partial.current.trim();
        if (controller.signal.aborted && kept) onChats((s) => appendTurn(s, day.id, { role: 'assistant', content: `${kept} …` }));
        setStreaming(null);
        abort.current = null;
      }
    }
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    void send(draft);
  };

  const onKey = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void send(draft);
    }
  };

  const lastUser = [...turns].reverse().find((t) => t.role === 'user');

  return (
    <div className="screen chat-screen">
      <ScreenHeader
        title="Chat"
        eyebrow="Ask about the diving"
        actions={
          <>
            {turns.length > 0 && (
              <button className="icon-btn" type="button" aria-label="Clear this conversation" onClick={() => setConfirmClear(true)}>
                <Icon name="trash" size={18} />
              </button>
            )}
            <ProfileButton />
          </>
        }
      />

      <div className="chat-days" role="tablist" aria-label="Day to talk about">
        {days.map((d) => (
          <button key={d.id} type="button" role="tab" aria-selected={d.id === day.id} className="chat-day" onClick={() => onDay(d.id)}>
            <span className="tnum">{d.dow} {d.dom.split(' ')[0]}</span>
            {chats[d.id]?.length ? <span className="chat-dot" aria-label="has messages" /> : null}
          </button>
        ))}
      </div>

      <div className="chat-context">
        <span className="tile-icon teal"><Icon name={day.sea ? 'waves' : 'pin'} size={18} /></span>
        <span className="row-body">
          <span className="row-title">{day.title}</span>
          <span className="row-sub">{day.dow} {day.dom} · {day.pill}</span>
        </span>
      </div>

      {!connection ? (
        <EmptyState
          icon="message"
          title="Chat about your dives"
          text="Connect Claude, ChatGPT, Gemini or OpenRouter to ask about sites, marine life, conditions and gas planning for each day."
          action={<button className="btn btn-small" type="button" onClick={openAi}>Connect AI service</button>}
        />
      ) : (
        <>
          <div className="messages" aria-live="polite">
            {turns.length === 0 && streaming === null && (
              <div className="chat-empty">
                <p className="t-foot">Try asking</p>
                <div className="chips">
                  {suggestionsFor(day.sea !== null).map((q) => (
                    <button key={q} type="button" className="chip-suggest" onClick={() => void send(q)}>{q}</button>
                  ))}
                </div>
              </div>
            )}
            {turns.map((turn, i) => (
              <div key={i} className={`bubble ${turn.role}`}>{turn.content}</div>
            ))}
            {streaming !== null && (
              <div className="bubble assistant" aria-busy="true">
                {streaming || <span className="typing" aria-label="Writing"><i /><i /><i /></span>}
              </div>
            )}
            {error && (
              <div className="chat-error" role="alert">
                <span>{error}</span>
                {lastUser && <button className="btn btn-plain btn-small" type="button" onClick={() => void send(lastUser.content)}>Retry</button>}
              </div>
            )}
            <div ref={endRef} />
          </div>
          <p className="t-cap chat-note">{connectionLabel(connection)} · AI can be wrong. Follow your training and your dive guide.</p>
        </>
      )}

      {connection && (
        <form className="composer" onSubmit={submit}>
          <label className="sr-only" htmlFor="chat-input">Message about {day.title}</label>
          <textarea
            id="chat-input"
            rows={1}
            value={draft}
            maxLength={MAX_MESSAGE}
            placeholder={`Ask about ${day.title}`}
            enterKeyHint="send"
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={onKey}
          />
          {streaming !== null ? (
            <button className="send-btn stop" type="button" aria-label="Stop" onClick={() => abort.current?.abort()}>
              <span className="stop-square" />
            </button>
          ) : (
            <button className="send-btn" type="submit" aria-label="Send" disabled={!draft.trim()}>
              <Icon name="send" size={18} />
            </button>
          )}
        </form>
      )}

      <Alert
        open={confirmClear}
        title="Clear this conversation?"
        message={`Removes the chat about ${day.dow} ${day.dom} from this device.`}
        confirmLabel="Clear"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          onChats((s) => {
            const next = { ...s };
            delete next[day.id];
            return next;
          });
        }}
      />
    </div>
  );
};
