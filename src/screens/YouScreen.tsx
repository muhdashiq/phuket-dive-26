import { useState, type FormEvent } from 'react';
import { DAY_BY_ID, DAYS } from '../data/days';
import type { PlaceKey } from '../data/places';
import { SOURCES } from '../data/reference';
import type { DayId } from '../data/types';
import { Icon } from '../components/Icon';
import { Alert, Sheet } from '../components/Sheet';
import { useToast } from '../components/Toast';
import { Avatar, EmptyState, ScreenHeader, Section } from '../components/ui';
import { formatDuration } from '../lib/dates';
import { notesToText, type NoteStore } from '../lib/notes';
import { DEFAULT_PREFS, MAX_NAME_LENGTH, type Prefs, type StartOn, type Theme } from '../lib/prefs';
import { focusDay } from '../lib/routes';
import { todoItems, type TodoStore } from '../lib/todos';

type YouScreenProps = {
  prefs: Prefs;
  onPrefs: (update: (prefs: Prefs) => Prefs) => void;
  todos: TodoStore;
  notes: NoteStore;
  favorites: PlaceKey[];
  today: string;
  now: number;
  onOpenDay: (id: DayId) => void;
  onClearPlanner: () => void;
  onReplayOnboarding: () => void;
  onLocationTap: () => void;
};

const THEME_LABELS: Record<Theme, string> = { system: 'Automatic', light: 'Light', dark: 'Dark' };
const START_LABELS: Record<StartOn, string> = { today: 'Today', last: 'Last screen' };
const DAY_LABELS = Object.fromEntries(DAYS.map((d) => [d.id, `${d.dow} ${d.dom} · ${d.title}`])) as Record<DayId, string>;

type SheetName = 'name' | 'theme' | 'start' | 'sources' | null;

export const YouScreen = (props: YouScreenProps) => {
  const { prefs, onPrefs, todos, notes, now } = props;
  const toast = useToast();
  const [sheet, setSheet] = useState<SheetName>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [draftName, setDraftName] = useState(prefs.name);

  const allItems = DAYS.flatMap((day) => todoItems(day.todos, todos, day.id));
  const doneItems = allItems.filter((i) => i.done).length;
  const history = DAYS.filter((d) => notes[d.id])
    .map((d) => ({ day: d, note: notes[d.id] }))
    .sort((a, b) => (b.note?.updatedAt ?? 0) - (a.note?.updatedAt ?? 0));

  const set = <K extends keyof Prefs>(key: K, value: Prefs[K]) => onPrefs((p) => ({ ...p, [key]: value }));

  const saveName = (event: FormEvent) => {
    event.preventDefault();
    set('name', draftName.trim().slice(0, MAX_NAME_LENGTH));
    setSheet(null);
    toast({ message: draftName.trim() ? 'Name saved' : 'Name removed', tone: 'success' });
  };

  const downloadNotes = () => {
    if (history.length === 0) {
      toast({ message: 'No notes to download yet', tone: 'info' });
      return;
    }
    const blob = new Blob([notesToText(notes, DAY_LABELS)], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'phuket-trip-notes.txt';
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast({ message: 'Notes downloaded', tone: 'success' });
  };

  return (
    <div className="screen">
      <ScreenHeader title="You" />

      <div className="profile">
        <Avatar name={prefs.name} size={84} />
        <p className="t-title">{prefs.name || 'Add your name'}</p>
        <p className="t-foot">Phuket Dive Week · 3–10 Nov 2026</p>
        <button
          className="btn btn-tinted btn-small edit"
          type="button"
          onClick={() => {
            setDraftName(prefs.name);
            setSheet('name');
          }}
        >
          <Icon name="edit" size={15} />
          {prefs.name ? 'Edit name' : 'Add name'}
        </button>
      </div>

      <div className="stats" style={{ marginTop: 20 }}>
        <div className="stat"><b className="tnum">{doneItems}<span className="t-foot">/{allItems.length}</span></b><span>items done</span></div>
        <div className="stat"><b className="tnum">{history.length}</b><span>days with notes</span></div>
        <div className="stat"><b className="tnum">{props.favorites.length}</b><span>favorite places</span></div>
      </div>

      <Section id="history-h" title="Notes history">
        {history.length === 0 ? (
          <EmptyState
            icon="note"
            title="No notes yet"
            text="Notes you write on each day show up here, newest first."
            action={
              <button className="btn btn-tinted btn-small" type="button" onClick={() => props.onOpenDay(focusDay(props.today))}>
                Write today's note
              </button>
            }
          />
        ) : (
          <div className="group">
            {history.map(({ day, note }) => (
              <button key={day.id} type="button" className="row row-icon note-row" onClick={() => props.onOpenDay(day.id)}>
                <span className="tile-icon amber"><Icon name="history" size={18} /></span>
                <span className="row-body">
                  <span className="row-title">{day.dow} {day.dom} · {DAY_BY_ID[day.id].title}</span>
                  <span className="row-sub">{note?.text}</span>
                  <span className="t-cap">Edited {note ? `${formatDuration(now - note.updatedAt)} ago` : ''}</span>
                </span>
                <Icon name="chevronRight" className="row-chevron" />
              </button>
            ))}
          </div>
        )}
      </Section>

      <Section id="settings-h" title="Settings">
        <div className="group">
          <button type="button" className="row row-icon" onClick={() => setSheet('theme')}>
            <span className="tile-icon indigo"><Icon name="appearance" size={18} /></span>
            <span className="row-body"><span className="row-title">Appearance</span></span>
            <span className="row-value">{THEME_LABELS[prefs.theme]}</span>
            <Icon name="chevronRight" className="row-chevron" />
          </button>
          <button type="button" className="row row-icon" onClick={() => setSheet('start')}>
            <span className="tile-icon"><Icon name="today" size={18} /></span>
            <span className="row-body"><span className="row-title">Open the app on</span></span>
            <span className="row-value">{START_LABELS[prefs.startOn]}</span>
            <Icon name="chevronRight" className="row-chevron" />
          </button>
          <button type="button" className="row row-icon" onClick={props.onLocationTap}>
            <span className="tile-icon teal"><Icon name="location" size={18} /></span>
            <span className="row-body"><span className="row-title">Weather location</span></span>
            <span className="row-value">{prefs.location ? 'My location' : 'Phuket'}</span>
            <Icon name="chevronRight" className="row-chevron" />
          </button>
          <label className="row row-icon">
            <span className="tile-icon green"><Icon name="checklist" size={18} /></span>
            <span className="row-body"><span className="row-title">Hide finished items</span></span>
            <input className="switch" type="checkbox" role="switch" checked={prefs.hideDone} onChange={(e) => set('hideDone', e.target.checked)} />
          </label>
        </div>
      </Section>

      <Section id="data-h" title="Your data" footer="Everything you enter stays in this browser. Nothing is uploaded, and it doesn't sync between devices.">
        <div className="group">
          <button type="button" className="row row-icon" onClick={downloadNotes}>
            <span className="tile-icon"><Icon name="download" size={18} /></span>
            <span className="row-body"><span className="row-title">Download notes</span><span className="row-sub">A text file with every day's notes</span></span>
          </button>
          <button type="button" className="row row-icon" onClick={props.onReplayOnboarding}>
            <span className="tile-icon gray"><Icon name="sparkles" size={18} /></span>
            <span className="row-body"><span className="row-title">Show welcome again</span></span>
          </button>
          <button
            type="button"
            className="row row-icon"
            onClick={() => {
              onPrefs((p) => ({ ...DEFAULT_PREFS, name: p.name, onboarded: true, tipsSeen: p.tipsSeen }));
              toast({ message: 'Settings reset', tone: 'success' });
            }}
          >
            <span className="tile-icon gray"><Icon name="undo" size={18} /></span>
            <span className="row-body"><span className="row-title">Reset settings</span></span>
          </button>
          <button type="button" className="row row-icon destructive" onClick={() => setConfirmClear(true)}>
            <span className="tile-icon red"><Icon name="trash" size={18} /></span>
            <span className="row-body"><span className="row-title">Clear checklists and notes</span></span>
          </button>
        </div>
      </Section>

      <Section id="about-h" title="About">
        <div className="group">
          <button type="button" className="row row-icon" onClick={() => setSheet('sources')}>
            <span className="tile-icon gray"><Icon name="info" size={18} /></span>
            <span className="row-body"><span className="row-title">Sources</span><span className="row-sub">Where the prices, times and forecasts come from</span></span>
            <Icon name="chevronRight" className="row-chevron" />
          </button>
          <a className="row row-icon" href="https://github.com/muhdashiq/phuket-dive-26" target="_blank" rel="noopener">
            <span className="tile-icon gray"><Icon name="code" size={18} /></span>
            <span className="row-body"><span className="row-title">Source code</span><span className="row-sub">github.com/muhdashiq/phuket-dive-26</span></span>
            <Icon name="external" className="row-chevron" />
          </a>
        </div>
      </Section>

      <footer className="foot">
        <p className="t-cap">Plan prepared 2 Nov 2026. The dive shop and boat captain make the final call each morning.</p>
      </footer>

      <Sheet open={sheet === 'name'} onClose={() => setSheet(null)} title="Your name">
        <form onSubmit={saveName} style={{ display: 'grid', gap: 14 }}>
          <p className="t-sub">Used for your avatar initials. It stays on this device.</p>
          <label className="sr-only" htmlFor="name-input">Your name</label>
          <div className="search">
            <input id="name-input" style={{ paddingLeft: 14 }} value={draftName} maxLength={MAX_NAME_LENGTH} placeholder="First name" autoComplete="given-name" onChange={(e) => setDraftName(e.target.value)} />
          </div>
          <button className="btn btn-block" type="submit">Save</button>
        </form>
      </Sheet>

      <Sheet open={sheet === 'theme'} onClose={() => setSheet(null)} title="Appearance">
        <div className="group">
          {(Object.keys(THEME_LABELS) as Theme[]).map((theme) => (
            <button key={theme} type="button" className="row" aria-pressed={prefs.theme === theme} onClick={() => { set('theme', theme); setSheet(null); }}>
              <span className="row-body">
                <span className="row-title">{THEME_LABELS[theme]}</span>
                {theme === 'system' && <span className="row-sub">Follows your device's light or dark mode</span>}
              </span>
              {prefs.theme === theme && <Icon name="check" className="fav" />}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'start'} onClose={() => setSheet(null)} title="Open the app on">
        <div className="group">
          {(Object.keys(START_LABELS) as StartOn[]).map((option) => (
            <button key={option} type="button" className="row" aria-pressed={prefs.startOn === option} onClick={() => { set('startOn', option); setSheet(null); }}>
              <span className="row-body">
                <span className="row-title">{START_LABELS[option]}</span>
                <span className="row-sub">{option === 'today' ? "Jump straight to today's plan" : 'Pick up where you left off'}</span>
              </span>
              {prefs.startOn === option && <Icon name="check" />}
            </button>
          ))}
        </div>
      </Sheet>

      <Sheet open={sheet === 'sources'} onClose={() => setSheet(null)} title="Sources">
        <p className="t-sub">
          Live weather comes from Open-Meteo and is cached for 10 minutes. Offline, days show the values checked on 2 Nov. Prices are as published by each operator;
          confirm when you book.
        </p>
        <div className="group">
          {SOURCES.map((source) =>
            source.href ? (
              <a key={source.label} className="row" href={source.href} target="_blank" rel="noopener">
                <span className="row-body"><span className="row-title" style={{ fontSize: 15 }}>{source.label}</span></span>
                <Icon name="external" className="row-chevron" />
              </a>
            ) : (
              <div key={source.label} className="row">
                <span className="row-body"><span className="row-title" style={{ fontSize: 15 }}>{source.label}</span></span>
              </div>
            ),
          )}
        </div>
      </Sheet>

      <Alert
        open={confirmClear}
        title="Clear checklists and notes?"
        message="This removes every tick, your own checklist items and all day notes on this device. It can't be undone."
        confirmLabel="Clear"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          setConfirmClear(false);
          props.onClearPlanner();
          toast({ message: 'Checklists and notes cleared', tone: 'success' });
        }}
      />
    </div>
  );
};
