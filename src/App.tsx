import { useCallback, useEffect, useRef, useState } from 'react';
import { DAY_BY_ID, DAYS } from './data/days';
import { DAY_IDS, type DayId, type TabId } from './data/types';
import { SOURCES } from './data/reference';
import { Masthead } from './components/Masthead';
import { NowPanel } from './components/NowPanel';
import { SettingsDialog } from './components/SettingsDialog';
import { TabBar } from './components/TabBar';
import { useClock } from './hooks/useClock';
import { useHashTab } from './hooks/useHashTab';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useNowWeather, useTripWeather } from './hooks/useWeather';
import { TRIP_TZ, ymdIn } from './lib/dates';
import { sanitizeNoteStore, type NoteStore } from './lib/notes';
import { DEFAULT_PREFS, sanitizePrefs, type LatLon, type Prefs } from './lib/prefs';
import { STORAGE_KEYS } from './lib/storage';
import { resolveInitialTab } from './lib/tabs';
import { sanitizeTodoStore, type TodoStore } from './lib/todos';
import { ContactsView } from './views/ContactsView';
import { CostsView } from './views/CostsView';
import { DayView } from './views/DayView';
import { PlacesView } from './views/PlacesView';
import { PlanBView } from './views/PlanBView';

const isDayId = (tab: TabId): tab is DayId => (DAY_IDS as readonly string[]).includes(tab);
const sanitizeSteps = (raw: unknown): string[] => (Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);

export const App = () => {
  const [prefs, setPrefs] = useLocalStorage<Prefs>(STORAGE_KEYS.prefs, DEFAULT_PREFS, sanitizePrefs);
  const [todos, setTodos] = useLocalStorage<TodoStore>(STORAGE_KEYS.todos, {}, sanitizeTodoStore);
  const [notes, setNotes] = useLocalStorage<NoteStore>(STORAGE_KEYS.notes, {}, sanitizeNoteStore);
  const [steps, setSteps] = useLocalStorage<string[]>(STORAGE_KEYS.bookingSteps, [], sanitizeSteps);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const now = useClock();
  const today = ymdIn(TRIP_TZ, now);
  const [tab, select] = useHashTab(
    resolveInitialTab({ hash: window.location.hash, today, startOn: prefs.startOn, lastTab: prefs.lastTab }),
  );
  const [tripWeather, reloadTrip] = useTripWeather();
  const [nowWeather, reloadNow] = useNowWeather(prefs.location);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', prefs.theme);
  }, [prefs.theme]);

  // Remember the tab, and bring the new tab's top into view.
  useEffect(() => {
    setPrefs((p) => (p.lastTab === tab ? p : { ...p, lastTab: tab }));
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const main = mainRef.current;
    const bar = document.querySelector<HTMLElement>('.daybar');
    if (!main) return;
    const top = main.getBoundingClientRect().top + window.scrollY - (bar?.offsetHeight ?? 0);
    if (window.scrollY > top) window.scrollTo({ top, behavior: 'auto' });
  }, [tab, setPrefs]);

  const refresh = useCallback(
    (maxAge: number) => {
      reloadNow(maxAge);
      reloadTrip(maxAge);
    },
    [reloadNow, reloadTrip],
  );

  const setLocation = (location: LatLon | null) => setPrefs((p) => ({ ...p, location }));
  const toggleStep = (id: string) => setSteps((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const clearPlanner = () => {
    setTodos({});
    setNotes({});
  };

  const renderTab = () => {
    if (isDayId(tab)) {
      return (
        <DayView
          day={DAY_BY_ID[tab]}
          today={today}
          now={now}
          weather={tripWeather}
          todos={todos}
          onTodos={setTodos}
          notes={notes}
          onNotes={setNotes}
          hideDone={prefs.hideDone}
          onToggleHideDone={() => setPrefs((p) => ({ ...p, hideDone: !p.hideDone }))}
          onSelectDay={select}
        />
      );
    }
    switch (tab) {
      case 'contacts':
        return <ContactsView />;
      case 'places':
        return <PlacesView />;
      case 'costs':
        return <CostsView doneSteps={steps} onToggleStep={toggleStep} />;
      case 'planb':
        return <PlanBView />;
    }
  };

  return (
    <>
      <Masthead onOpenSettings={() => setSettingsOpen(true)} />
      <TabBar active={tab} today={today} daily={tripWeather.daily} />
      <main className="wrap" ref={mainRef}>
        {isDayId(tab) && (
          <NowPanel
            weather={nowWeather}
            now={now}
            today={today}
            location={prefs.location}
            collapsed={prefs.nowCollapsed}
            onToggleCollapsed={() => setPrefs((p) => ({ ...p, nowCollapsed: !p.nowCollapsed }))}
            onRefresh={refresh}
            onLocation={setLocation}
          />
        )}
        {renderTab()}
      </main>
      <footer className="wrap">
        <details className="sources">
          <summary>Sources</summary>
          <p>
            Live weather loads from Open-Meteo and is cached for 10 minutes. Offline, the day tabs show the values checked on 2 Nov:
            temperature and rain chance from the forecast model, wind and sea from the Thai Meteorological Department. Prices are as
            published by each operator; confirm when you book.
          </p>
          <ul>
            {SOURCES.map((source) => (
              <li key={source.label}>
                {source.href ? <a href={source.href} target="_blank" rel="noopener">{source.label}</a> : source.label}
              </li>
            ))}
          </ul>
        </details>
        <p>Plan prepared 2 Nov 2026 for {DAYS.length} days. Forecasts change daily in early November; the dive shop and boat captain make the final call each morning.</p>
      </footer>
      <SettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        prefs={prefs}
        onPrefs={setPrefs}
        notes={notes}
        onClearPlanner={clearPlanner}
      />
    </>
  );
};
