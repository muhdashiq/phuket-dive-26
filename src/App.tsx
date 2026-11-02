import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { DAY_BY_ID } from './data/days';
import type { PlaceKey } from './data/places';
import type { DayId } from './data/types';
import { LocationSheet } from './components/LocationSheet';
import { NotificationCenter, NotificationSettings } from './components/Notifications';
import { PhotoSheet } from './components/PhotoSheet';
import { Onboarding } from './components/Onboarding';
import { TabBar } from './components/TabBar';
import { useToast } from './components/Toast';
import { useClock } from './hooks/useClock';
import { useLocalStorage } from './hooks/useLocalStorage';
import { usePhoto } from './hooks/usePhoto';
import { useRoute } from './hooks/useRoute';
import { useNowWeather, useTripWeather } from './hooks/useWeather';
import { TRIP_TZ, ymdIn } from './lib/dates';
import { sanitizeFavorites, toggleFavorite } from './lib/favorites';
import { sanitizeNoteStore, type NoteStore } from './lib/notes';
import { addIds, buildReminders, DEFAULT_NOTIFY, delivered, dueForAlert, sanitizeNotify, unreadCount, type NotifyState } from './lib/reminders';
import { currentPermission, showAlert } from './lib/systemNotify';
import { DEFAULT_PREFS, sanitizePrefs, type LatLon, type Prefs } from './lib/prefs';
import { focusDay, resolveInitialRoute, toHash, type ExploreSegment, type Route, type Screen } from './lib/routes';
import { STORAGE_KEYS } from './lib/storage';
import { sanitizeTodoStore, type TodoStore } from './lib/todos';
import { MIN_REFRESH_MS } from './lib/weather';
import { ContactsScreen } from './screens/ContactsScreen';
import { ExploreScreen } from './screens/ExploreScreen';
import { TodayScreen } from './screens/TodayScreen';
import { TripScreen } from './screens/TripScreen';
import { YouScreen } from './screens/YouScreen';

const sanitizeSteps = (raw: unknown): string[] => (Array.isArray(raw) ? raw.filter((x): x is string => typeof x === 'string') : []);
const THEME_COLORS = { light: '#f2f2f7', dark: '#000000' };
const DAY_TIP = 'days';

export const App = () => {
  const [prefs, setPrefs] = useLocalStorage<Prefs>(STORAGE_KEYS.prefs, DEFAULT_PREFS, sanitizePrefs);
  const [todos, setTodos] = useLocalStorage<TodoStore>(STORAGE_KEYS.todos, {}, sanitizeTodoStore);
  const [notes, setNotes] = useLocalStorage<NoteStore>(STORAGE_KEYS.notes, {}, sanitizeNoteStore);
  const [steps, setSteps] = useLocalStorage<string[]>(STORAGE_KEYS.bookingSteps, [], sanitizeSteps);
  const [favorites, setFavorites] = useLocalStorage<PlaceKey[]>(STORAGE_KEYS.favorites, [], sanitizeFavorites);
  const [notify, setNotify] = useLocalStorage<NotifyState>(STORAGE_KEYS.notify, DEFAULT_NOTIFY, sanitizeNotify);
  const { photo, save: savePhoto, remove: removePhoto } = usePhoto();
  const [locationOpen, setLocationOpen] = useState(false);
  const [photoOpen, setPhotoOpen] = useState(false);
  const [centerOpen, setCenterOpen] = useState(false);
  const [notifySettingsOpen, setNotifySettingsOpen] = useState(false);
  const [readBefore, setReadBefore] = useState<string[]>([]);
  const [onboarding, setOnboarding] = useState(!prefs.onboarded);
  const [segment, setSegment] = useState<ExploreSegment>('places');
  const toast = useToast();

  const now = useClock();
  const today = ymdIn(TRIP_TZ, now);
  const [route, navigate] = useRoute(resolveInitialRoute({ hash: window.location.hash, today, startOn: prefs.startOn, lastHash: prefs.lastHash }));
  const [tripWeather, reloadTrip] = useTripWeather();
  const [nowWeather, reloadNow] = useNowWeather(prefs.location);
  const reminders = useMemo(() => buildReminders({ todos, notes, daily: tripWeather.daily }), [todos, notes, tripWeather.daily]);
  const unread = unreadCount(reminders, notify, now);
  const alerting = useRef(new Set<string>());
  const scrollMemory = useRef<Partial<Record<Screen, number>>>({});
  const lastScreen = useRef<Screen>(route.screen);
  const lastDay = useRef<DayId | null>(route.screen === 'today' ? route.day : null);

  // Theme, including the browser chrome colour.
  useEffect(() => {
    const root = document.documentElement;
    if (prefs.theme === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', prefs.theme);
    document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
      const dark = meta.media.includes('dark');
      meta.content = prefs.theme === 'system' ? (dark ? THEME_COLORS.dark : THEME_COLORS.light) : THEME_COLORS[prefs.theme];
    });
  }, [prefs.theme]);

  // Remember where the user is, for "open the app on: last screen".
  useEffect(() => {
    setPrefs((p) => {
      const lastHash = toHash(route);
      const day = route.screen === 'today' ? route.day : p.lastDay;
      return p.lastHash === lastHash && p.lastDay === day ? p : { ...p, lastHash, lastDay: day };
    });
    if (route.screen === 'explore') setSegment(route.segment);
  }, [route, setPrefs]);

  // Sheets belong to the screen they were opened on, so close them when the
  // route changes (for example with the browser or Android back button).
  useEffect(() => {
    setCenterOpen(false);
    setNotifySettingsOpen(false);
    setPhotoOpen(false);
    setLocationOpen(false);
  }, [route]);

  // Each tab keeps its own scroll position; a new day starts at the top.
  useLayoutEffect(() => {
    const dayChanged = route.screen === 'today' && lastDay.current !== null && lastDay.current !== route.day;
    if (route.screen !== lastScreen.current) window.scrollTo(0, scrollMemory.current[route.screen] ?? 0);
    else if (dayChanged) window.scrollTo(0, 0);
    lastScreen.current = route.screen;
    if (route.screen === 'today') lastDay.current = route.day;
  }, [route]);

  const go = useCallback(
    (next: Route) => {
      scrollMemory.current[lastScreen.current] = window.scrollY;
      navigate(next);
    },
    [navigate],
  );

  // Deliver reminders as they come due: a phone alert when allowed,
  // otherwise an in-app banner while the app is on screen.
  useEffect(() => {
    if (!prefs.onboarded) return;
    const due = dueForAlert(reminders, notify, now).filter((r) => !alerting.current.has(r.id));
    if (due.length === 0) return;
    due.forEach((r) => alerting.current.add(r.id));
    setNotify((s) => ({ ...s, notified: addIds(s.notified, due.map((r) => r.id)) }));
    if (notify.system && currentPermission() === 'granted') {
      due.forEach((r) => void showAlert({ id: r.id, title: r.title, body: r.body, hash: `#${r.day}` }));
    } else if (document.visibilityState === 'visible') {
      const latest = due[0];
      if (latest) toast({ message: latest.title, tone: 'info', action: { label: 'View', onClick: () => go({ screen: 'today', day: latest.day }) } });
    }
  }, [now, reminders, notify, prefs.onboarded, setNotify, toast, go]);

  const openNotifications = () => {
    setReadBefore(notify.read);
    setNotify((s) => ({ ...s, read: addIds(s.read, delivered(reminders, s, now).map((r) => r.id)) }));
    setCenterOpen(true);
  };

  const routeFor = (screen: Screen): Route => {
    switch (screen) {
      case 'today':
        return { screen, day: prefs.lastDay ?? focusDay(today) };
      case 'explore':
        return { screen, segment };
      default:
        return { screen };
    }
  };

  const selectTab = (screen: Screen) => {
    // Tapping the active tab again scrolls to the top, as on iOS.
    if (screen === route.screen) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    go(routeFor(screen));
  };

  const openDay = (day: DayId) => go({ screen: 'today', day });

  const refresh = useCallback(async () => {
    const [trip, current] = await Promise.all([reloadTrip(MIN_REFRESH_MS), reloadNow(MIN_REFRESH_MS)]);
    if (trip || current) toast({ message: 'Weather updated', tone: 'success' });
    else toast({ message: "Couldn't reach the forecast. Showing the saved one.", tone: 'error' });
  }, [reloadNow, reloadTrip, toast]);

  const setLocation = (location: LatLon | null) => setPrefs((p) => ({ ...p, location }));

  const finishOnboarding = ({ name, location, locationDenied }: { name: string; location: LatLon | null; locationDenied: boolean }) => {
    setPrefs((p) => ({ ...p, name, location, onboarded: true }));
    setOnboarding(false);
    if (locationDenied) toast({ message: 'Location wasn’t shared, so weather shows Phuket', tone: 'info' });
    else toast({ message: name ? `Welcome, ${name}` : 'You’re all set', tone: 'success' });
  };

  const screen = (() => {
    switch (route.screen) {
      case 'today':
        return (
          <TodayScreen
            day={DAY_BY_ID[route.day]}
            today={today}
            now={now}
            tripWeather={tripWeather}
            nowWeather={nowWeather}
            location={prefs.location}
            name={prefs.name}
            photo={photo}
            unread={unread}
            onOpenNotifications={openNotifications}
            todos={todos}
            onTodos={setTodos}
            notes={notes}
            onNotes={setNotes}
            hideDone={prefs.hideDone}
            onToggleHideDone={() => setPrefs((p) => ({ ...p, hideDone: !p.hideDone }))}
            showTip={prefs.onboarded && !prefs.tipsSeen.includes(DAY_TIP)}
            onDismissTip={() => setPrefs((p) => ({ ...p, tipsSeen: [...p.tipsSeen, DAY_TIP] }))}
            onSelectDay={(day) => navigate({ screen: 'today', day }, { replace: true })}
            onOpenYou={() => go({ screen: 'you' })}
            onRefresh={refresh}
            onLocationTap={() => setLocationOpen(true)}
          />
        );
      case 'trip':
        return (
          <TripScreen
            today={today}
            weather={tripWeather}
            todos={todos}
            notes={notes}
            doneSteps={steps}
            onToggleStep={(id) => setSteps((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))}
            onOpenDay={openDay}
          />
        );
      case 'explore':
        return (
          <ExploreScreen
            segment={route.segment}
            onSegment={(next) => navigate({ screen: 'explore', segment: next }, { replace: true })}
            favorites={favorites}
            onToggleFavorite={(key) => setFavorites((list) => toggleFavorite(list, key))}
            onOpenDay={openDay}
          />
        );
      case 'contacts':
        return <ContactsScreen />;
      case 'you':
        return (
          <YouScreen
            prefs={prefs}
            onPrefs={setPrefs}
            todos={todos}
            notes={notes}
            favorites={favorites}
            today={today}
            now={now}
            onOpenDay={openDay}
            onClearPlanner={() => {
              setTodos({});
              setNotes({});
            }}
            onReplayOnboarding={() => setOnboarding(true)}
            onLocationTap={() => setLocationOpen(true)}
            photo={photo}
            onEditPhoto={() => setPhotoOpen(true)}
            alertsOn={notify.system}
            onOpenNotificationSettings={() => setNotifySettingsOpen(true)}
          />
        );
    }
  })();

  return (
    <div className="app">
      <TabBar active={route.screen} hrefFor={(s) => toHash(routeFor(s))} onSelect={selectTab} />
      <main className="main" key={route.screen}>
        {screen}
      </main>
      <LocationSheet open={locationOpen} onClose={() => setLocationOpen(false)} location={prefs.location} onChange={setLocation} />
      <PhotoSheet open={photoOpen} onClose={() => setPhotoOpen(false)} name={prefs.name} photo={photo} onSave={savePhoto} onRemove={removePhoto} />
      <NotificationCenter
        open={centerOpen}
        onClose={() => setCenterOpen(false)}
        reminders={reminders}
        state={notify}
        readBefore={readBefore}
        now={now}
        onOpenDay={openDay}
        onClearAll={(ids) => {
          setNotify((s) => ({ ...s, dismissed: addIds(s.dismissed, ids) }));
          toast({ message: 'Notifications cleared', tone: 'success' });
        }}
        onOpenSettings={() => {
          setCenterOpen(false);
          setNotifySettingsOpen(true);
        }}
      />
      <NotificationSettings open={notifySettingsOpen} onClose={() => setNotifySettingsOpen(false)} state={notify} onChange={setNotify} />
      {onboarding && <Onboarding initialName={prefs.name} photo={photo} onPhoto={savePhoto} onFinish={finishOnboarding} />}
    </div>
  );
};
