
const CACHE_NAME = 'pulsecoach-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/index.tsx',
  '/types.ts',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// During install, cache the essential app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Intercept requests
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((fetchResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.method === 'GET' && fetchResponse.status === 200) {
            cache.put(event.request, fetchResponse.clone());
          }
          return fetchResponse;
        });
      });
    }).catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    })
  );
});

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// --- PUSH NOTIFICATION SYSTEM ---

// Handle remote push notifications
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { 
    title: 'PulseCoach Reminder', 
    body: 'Time for a quick high-performance reset!',
    icon: '/favicon.ico'
  };

  const options = {
    body: data.body,
    icon: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 88.5L44.2 83.2C23.6 64.5 10 52.2 10 37C10 24.6 19.6 15 32 15C39 15 45.8 18.2 50 23.2C54.2 18.2 61 15 68 15C80.4 15 90 24.6 90 37C90 52.2 76.4 64.5 55.8 83.2L50 88.5Z" fill="%2300B8A9"/%3E%3C/svg%3E',
    badge: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Cpath d="M50 88.5L44.2 83.2C23.6 64.5 10 52.2 10 37C10 24.6 19.6 15 32 15C39 15 45.8 18.2 50 23.2C54.2 18.2 61 15 68 15C80.4 15 90 24.6 90 37C90 52.2 76.4 64.5 55.8 83.2L50 88.5Z" fill="%2300B8A9"/%3E%3C/svg%3E',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification interaction
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === '/' && 'focus' in client) {
          return client.focus();
        }
      }
      // If no window is open, open a new one
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
