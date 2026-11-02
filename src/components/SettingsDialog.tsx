import { useEffect, useRef } from 'react';
import { DAYS } from '../data/days';
import type { DayId } from '../data/types';
import { notesToText, type NoteStore } from '../lib/notes';
import { DEFAULT_PREFS, THEMES, type Prefs, type Theme } from '../lib/prefs';

type SettingsDialogProps = {
  open: boolean;
  onClose: () => void;
  prefs: Prefs;
  onPrefs: (update: (prefs: Prefs) => Prefs) => void;
  notes: NoteStore;
  onClearPlanner: () => void;
};

const THEME_LABELS: Record<Theme, string> = { system: 'Match device', light: 'Light', dark: 'Dark' };

const DAY_LABELS = Object.fromEntries(DAYS.map((d) => [d.id, `${d.dow} ${d.dom} · ${d.title}`])) as Record<DayId, string>;

const downloadNotes = (notes: NoteStore) => {
  const text = notesToText(notes, DAY_LABELS);
  const blob = new Blob([text || 'No notes yet.\n'], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'phuket-trip-notes.txt';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};

export const SettingsDialog = ({ open, onClose, prefs, onPrefs, notes, onClearPlanner }: SettingsDialogProps) => {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => onPrefs((p) => ({ ...p, [key]: value }));
  const noteCount = Object.keys(notes).length;

  const clearPlanner = () => {
    if (window.confirm('Clear every checklist tick, your own checklist items and all day notes on this device?')) onClearPlanner();
  };

  return (
    <dialog ref={ref} className="settings" aria-labelledby="settings-h" onClose={onClose} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="settings-body">
        <div className="settings-head">
          <h2 id="settings-h">Settings</h2>
          <button className="lb-close settings-close" type="button" aria-label="Close settings" onClick={onClose}>×</button>
        </div>
        <p className="note">Saved in this browser only. Nothing is sent anywhere.</p>

        <fieldset className="setting">
          <legend>Theme</legend>
          <div className="seg">
            {THEMES.map((theme) => (
              <label key={theme}>
                <input type="radio" name="theme" checked={prefs.theme === theme} onChange={() => set('theme', theme)} />
                <span>{THEME_LABELS[theme]}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="setting">
          <legend>When the page opens</legend>
          <div className="seg">
            <label>
              <input type="radio" name="start" checked={prefs.startOn === 'today'} onChange={() => set('startOn', 'today')} />
              <span>Show today</span>
            </label>
            <label>
              <input type="radio" name="start" checked={prefs.startOn === 'last'} onChange={() => set('startOn', 'last')} />
              <span>Last tab viewed</span>
            </label>
          </div>
        </fieldset>

        <fieldset className="setting">
          <legend>Display</legend>
          <label className="switch">
            <input type="checkbox" checked={prefs.hideDone} onChange={(e) => set('hideDone', e.target.checked)} />
            <span>Hide finished checklist items</span>
          </label>
          <label className="switch">
            <input type="checkbox" checked={prefs.nowCollapsed} onChange={(e) => set('nowCollapsed', e.target.checked)} />
            <span>Collapse the Right now weather panel</span>
          </label>
        </fieldset>

        <fieldset className="setting">
          <legend>Weather location</legend>
          <p className="note">
            {prefs.location ? `Using your location (${prefs.location.lat}, ${prefs.location.lon}).` : 'Showing Phuket. Use the Right now panel to switch to your location.'}
          </p>
          {prefs.location && (
            <button className="btn" type="button" onClick={() => set('location', null)}>Show Phuket instead</button>
          )}
        </fieldset>

        <fieldset className="setting">
          <legend>Your data</legend>
          <div className="setting-actions">
            <button className="btn" type="button" onClick={() => downloadNotes(notes)}>
              Download notes ({noteCount} {noteCount === 1 ? 'day' : 'days'})
            </button>
            <button className="btn" type="button" onClick={() => onPrefs(() => ({ ...DEFAULT_PREFS }))}>Reset settings</button>
            <button className="btn btn-danger" type="button" onClick={clearPlanner}>Clear checklists &amp; notes</button>
          </div>
        </fieldset>
      </div>
    </dialog>
  );
};
