self.addEventListener('install', (e) => {
  // Skip waiting agar langsung aktif
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  // Claim clients supaya segera dipakai
  e.waitUntil(self.clients.claim());
});

// Terima payload push (server kirim JSON {title, body})
self.addEventListener('push', (event) => {
  if (!event.data) return;
  let data = {};
  try { data = event.data.json(); } catch { data = { title: 'Notifikasi', body: event.data.text() }; }
  const title = data.title || 'Smart Home';
  const body = data.body || 'Ada pembaruan sensor.';
  const options = {
    body,
    icon: '/icon.png', // sediakan icon jika ada
    badge: '/badge.png',
    data: { url: '/' }
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Klik notifikasi: fokus atau buka tab baru
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
