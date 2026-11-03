// Service worker for Phuket Dive Week.
// It only shows notifications and handles taps on them; it does not cache
// pages or intercept requests.

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const raw = event.notification.data && event.notification.data.hash;
  const hash = typeof raw === 'string' && /^#[a-z0-9-]{1,24}$/.test(raw) ? raw : '';
  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      const open = windows.find((client) => client.url.startsWith(self.registration.scope));
      if (open) {
        open.postMessage({ type: 'open', hash });
        return open.focus();
      }
      return self.clients.openWindow(self.registration.scope + hash);
    })(),
  );
});
