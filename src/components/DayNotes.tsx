import { useEffect, useId, useRef, useState } from 'react';
import type { DayPlan } from '../data/types';
import { formatDateTime, TRIP_TZ } from '../lib/dates';
import { MAX_NOTE_LENGTH, setNote, type NoteStore } from '../lib/notes';
import { Icon } from './Icon';
import { Section } from './ui';

type DayNotesProps = {
  day: DayPlan;
  store: NoteStore;
  onChange: (update: (store: NoteStore) => NoteStore) => void;
};

const SAVE_DELAY_MS = 400;

// Notes save a moment after typing stops, and when leaving the day.
export const DayNotes = ({ day, store, onChange }: DayNotesProps) => {
  const id = useId();
  const saved = store[day.id];
  const [text, setText] = useState(saved?.text ?? '');
  const [dirty, setDirty] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const pending = useRef<string | null>(null);

  const flush = () => {
    window.clearTimeout(timer.current);
    if (pending.current === null) return;
    const value = pending.current;
    pending.current = null;
    onChange((s) => setNote(s, day.id, value, Date.now()));
    setDirty(false);
  };

  // Load the right note when switching days, saving the previous one first.
  useEffect(() => {
    setText(store[day.id]?.text ?? '');
    setDirty(false);
    return flush;
    // flush and store are read at switch time on purpose.
  }, [day.id]);

  // Pick up edits made in another browser tab, or a reset from Settings.
  useEffect(() => {
    if (pending.current === null) setText(saved?.text ?? '');
  }, [saved?.text]);

  const update = (value: string) => {
    setText(value);
    setDirty(true);
    pending.current = value;
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(flush, SAVE_DELAY_MS);
  };

  return (
    <Section id={`${id}-h`} title="Notes">
      <div className="notes">
        <label className="sr-only" htmlFor={id}>Notes for {day.dow} {day.dom}</label>
        <textarea
          id={id}
          value={text}
          maxLength={MAX_NOTE_LENGTH}
          rows={5}
          placeholder={`What happened on ${day.dow} ${day.dom}? Dive log, what you saw, people you met, what to change tomorrow…`}
          onChange={(e) => update(e.target.value)}
          onBlur={flush}
        />
        <p className="notes-foot t-cap" aria-live="polite">
          {dirty ? (
            'Saving…'
          ) : saved ? (
            <>
              <Icon name="check" />
              Saved on this device · {formatDateTime(saved.updatedAt, TRIP_TZ)}
            </>
          ) : (
            'Private to this device. Saves as you type.'
          )}
        </p>
      </div>
    </Section>
  );
};
