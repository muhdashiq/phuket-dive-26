import type { Reminder } from './reminders';

export type NotifySupport = 'supported' | 'ios-needs-install' | 'unsupported';
export type NotifyPermission = NotificationPermission | 'unsupported';

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;

// iPhone and iPad only allow web notifications for apps added to the Home Screen.
export const notifySupport = (): NotifySupport => {
  if ('Notification' in window) return 'supported';
  if (isIOS() && !isStandalone()) return 'ios-needs-install';
  return 'unsupported';
};

export const currentPermission = (): NotifyPermission => ('Notification' in window ? Notification.permission : 'unsupported');

export const requestPermission = async (): Promise<NotifyPermission> => {
  if (!('Notification' in window)) return 'unsupported';
  try {
    return await Notification.requestPermission();
  } catch {
    return Notification.permission;
  }
};

const registration = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) return null;
  try {
    const existing = await navigator.serviceWorker.getRegistration();
    return existing ?? null;
  } catch {
    return null;
  }
};

type AlertInput = Pick<Reminder, 'id' | 'title' | 'body'> & { hash: string };

// Phones need the service worker to show a notification; desktops can use
// the Notification constructor directly.
export const showAlert = async ({ id, title, body, hash }: AlertInput): Promise<boolean> => {
  if (currentPermission() !== 'granted') return false;
  const options: NotificationOptions = { body, tag: id, icon: 'icon-192.png', badge: 'favicon.svg', data: { hash } };
  const reg = await registration();
  try {
    if (reg) {
      await reg.showNotification(title, options);
      return true;
    }
    const note = new Notification(title, options);
    note.onclick = () => {
      window.focus();
      window.location.hash = hash;
      note.close();
    };
    return true;
  } catch {
    return false;
  }
};

export const registerServiceWorker = () => {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { scope: './' }).catch(() => undefined);
  });
  // Tapping a notification asks the open app to show that day.
  navigator.serviceWorker.addEventListener('message', (event: MessageEvent) => {
    const data = event.data as { type?: unknown; hash?: unknown } | null;
    if (data?.type === 'open' && typeof data.hash === 'string' && /^#[a-z0-9-]{1,24}$/.test(data.hash)) window.location.hash = data.hash;
  });
};
