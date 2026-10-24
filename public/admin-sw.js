/* Torch Admin service worker: receives order alerts and opens the order on tap. */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = { title: 'Torch Admin', body: event.data ? event.data.text() : '' };
  }

  const title = data.title || 'Torch Admin';
  const options = {
    body: data.body || '',
    icon: '/admin-icons/icon-192.png',
    badge: '/admin-icons/icon-192.png',
    tag: data.tag,                 // same tag = reminder replaces the first alert
    renotify: Boolean(data.tag),   // still buzz when it replaces
    data: { url: data.url || '/admin/orders' },
  };

  // iOS requires a visible notification for every push, so always show one.
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL(event.notification.data && event.notification.data.url ? event.notification.data.url : '/admin/orders', self.location.origin).href;

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of all) {
      if (client.url.startsWith(self.location.origin + '/admin')) {
        await client.focus();
        if ('navigate' in client) return client.navigate(target);
        return;
      }
    }
    return self.clients.openWindow(target);
  })());
});
