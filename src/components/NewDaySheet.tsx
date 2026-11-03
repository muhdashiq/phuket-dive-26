import { useEffect, useRef, useState, type FormEvent } from 'react';
import { addCustomDay, isDateTaken, tripEnd } from '../data/trip';
import { addDaysToYmd } from '../lib/dates';
import { dateLabels, newCustomDayId, type GeneratedPlan } from '../lib/customDays';
import { connectionLabel, generatePlan, LlmError } from '../lib/llm';
import { profileHeadline } from '../lib/profile';
import { PLAN_SYSTEM, planUserPrompt } from '../lib/prompts';
import { useApp } from './AppContext';
import { Icon } from './Icon';
import { Sheet } from './Sheet';
import { useToast } from './Toast';
import { EmptyState } from './ui';

type NewDaySheetProps = {
  open: boolean;
  onClose: () => void;
  onAdded: (id: string) => void;
};

const SUGGESTIONS = [
  'Two easy reef dives and a seafood dinner in Rawai',
  'A dry rest day: Thai cooking class and a massage',
  'Wreck dive in the morning, sunset at Promthep Cape',
  'Snorkelling with turtles for a non-diving friend',
];

const MAX_PROMPT = 600;

const firstFreeDate = () => {
  let date = addDaysToYmd(tripEnd(), 1);
  while (isDateTaken(date)) date = addDaysToYmd(date, 1);
  return date;
};

export const NewDaySheet = ({ open, onClose, onAdded }: NewDaySheetProps) => {
  const toast = useToast();
  const { connection, profile, name, openAi, openProfile } = useApp();
  const [date, setDate] = useState(firstFreeDate);
  const [prompt, setPrompt] = useState('');
  const [plan, setPlan] = useState<GeneratedPlan | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const abort = useRef<AbortController | null>(null);

  useEffect(() => {
    if (open) {
      setDate(firstFreeDate());
      setPlan(null);
      setError('');
    } else {
      abort.current?.abort();
    }
  }, [open]);

  const taken = isDateTaken(date);
  const { dow, dom } = dateLabels(date);

  const generate = async (event?: FormEvent) => {
    event?.preventDefault();
    if (!connection || !prompt.trim() || taken) return;
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    setBusy(true);
    setError('');
    setPlan(null);
    try {
      const result = await generatePlan({
        connection,
        system: PLAN_SYSTEM,
        prompt: planUserPrompt(date, prompt, profile, name),
        signal: controller.signal,
      });
      setPlan(result);
    } catch (err) {
      if (err instanceof LlmError && err.kind === 'aborted') return;
      setError(err instanceof LlmError ? err.message : 'Couldn’t plan that day. Try again.');
    } finally {
      if (abort.current === controller) setBusy(false);
    }
  };

  const add = () => {
    if (!plan || !connection) return;
    const id = newCustomDayId(date);
    const saved = addCustomDay({ id, date, prompt: prompt.trim(), model: connection.model, createdAt: Date.now(), plan });
    if (!saved) toast({ message: 'Added, but this browser couldn’t save it for next time', tone: 'error' });
    else toast({ message: `${dow} ${dom} added to your trip`, tone: 'success' });
    setPrompt('');
    onClose();
    onAdded(id);
  };

  return (
    <Sheet open={open} onClose={onClose} title="Plan a new day">
      {!connection ? (
        <EmptyState
          icon="sparkles"
          title="Connect an AI service first"
          text="Plans are written by the AI service you connect, using your profile and the rest of the trip."
          action={<button className="btn btn-small" type="button" onClick={openAi}>Connect AI service</button>}
        />
      ) : plan ? (
        <div className="plan-preview">
          <div className="hero-pills">
            <span className="pill teal">{dow} {dom}</span>
            <span className={`pill ${plan.status}`}><span className="dot" />{plan.statusLabel}</span>
          </div>
          <h3 className="t-title">{plan.title}</h3>
          <p className="t-sub">{plan.summary}</p>
          {plan.timeline.length > 0 && (
            <ul className="preview-list">
              {plan.timeline.slice(0, 6).map((item, i) => (
                <li key={i}><span className="tm">{item.time}</span><span>{item.text}</span></li>
              ))}
              {plan.timeline.length > 6 && <li className="t-foot">and {plan.timeline.length - 6} more</li>}
            </ul>
          )}
          {plan.checklist.length > 0 && <p className="t-foot">{plan.checklist.length} checklist items, {plan.bring.length} things to bring, {plan.tips.length} tips.</p>}
          <button className="btn btn-block" type="button" onClick={add}>
            <Icon name="plus" size={18} />
            Add to trip
          </button>
          <div className="ai-actions" style={{ justifyContent: 'center' }}>
            <button className="btn btn-plain btn-small" type="button" onClick={() => void generate()}>Try again</button>
            <button className="btn btn-plain btn-small" type="button" onClick={() => setPlan(null)}>Edit request</button>
          </div>
        </div>
      ) : (
        <form className="form" onSubmit={generate}>
          <label className="field">
            <span>Date</span>
            <input type="date" value={date} required onChange={(e) => setDate(e.target.value)} />
          </label>
          {taken && <p className="form-error" role="alert">There’s already a plan for {dow} {dom}. Pick another date.</p>}

          <label className="field stacked">
            <span>What do you want to do?</span>
            <textarea
              value={prompt}
              rows={4}
              maxLength={MAX_PROMPT}
              placeholder="e.g. Two relaxed dives with a chance of turtles, then a quiet dinner"
              onChange={(e) => setPrompt(e.target.value)}
            />
          </label>
          <div className="chips" aria-label="Ideas">
            {SUGGESTIONS.map((idea) => (
              <button key={idea} type="button" className="chip-suggest" onClick={() => setPrompt(idea)}>{idea}</button>
            ))}
          </div>

          <div className="group">
            <button type="button" className="row row-icon" onClick={openProfile}>
              <span className="tile-icon teal"><Icon name="you" size={18} /></span>
              <span className="row-body">
                <span className="row-title">Based on your profile</span>
                <span className="row-sub">{profileHeadline(profile)}{profile.interests.length ? ` · likes ${profile.interests.slice(0, 3).join(', ').toLowerCase()}` : ''}</span>
              </span>
              <Icon name="edit" className="row-chevron" />
            </button>
            <button type="button" className="row row-icon" onClick={openAi}>
              <span className="tile-icon indigo"><Icon name="sparkles" size={18} /></span>
              <span className="row-body">
                <span className="row-title">Planned by</span>
                <span className="row-sub">{connectionLabel(connection)}</span>
              </span>
              <Icon name="chevronRight" className="row-chevron" />
            </button>
          </div>

          {error && <p className="form-error" role="alert">{error}</p>}
          {busy ? (
            <div className="generating" aria-live="polite">
              <span className="spinner" aria-hidden="true" />
              <span>Planning {dow} {dom}…</span>
              <button className="btn btn-plain btn-small" type="button" onClick={() => abort.current?.abort()}>Stop</button>
            </div>
          ) : (
            <button className="btn btn-block" type="submit" disabled={!prompt.trim() || taken}>
              <Icon name="sparkles" size={18} />
              Create plan
            </button>
          )}
        </form>
      )}
    </Sheet>
  );
};
