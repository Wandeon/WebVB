// Service Worker for Općina Veliki Bukovec PWA
// Handles offline caching and push notifications

const SW_VERSION = 'v2';
const CACHE_NAME = `vb-cache-${SW_VERSION}`;
const STATIC_CACHE_NAME = `vb-static-${SW_VERSION}`;
const WASTE_CACHE_NAME = `vb-waste-${SW_VERSION}`;

// Cache TTL in milliseconds (7 days)
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/images/logo.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/odvoz-otpada',
];

// API URL for waste schedule (can come from push notification or direct request)
const ADMIN_API_URL = ''; // Will be set from first request origin

// Cache strategies
const CACHE_FIRST_PATTERNS = [
  /\/_next\/static\//,
  /\/images\//,
  /\/fonts\//,
  /\.(?:png|jpg|jpeg|webp|avif|svg|ico|woff|woff2)$/,
];

const NETWORK_FIRST_PATTERNS = [
  /\.html$/,
  /^\/(?!_next|api|images)/,
];

// Install event - precache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS.filter(url => {
          // Only cache URLs that exist
          return !url.includes('offline');
        }));
      })
      .then(() => self.skipWaiting())
      .catch(() => {})
  );
});

// Activate event - clean up old caches and stale entries
self.addEventListener('activate', (event) => {
  const currentCaches = [CACHE_NAME, STATIC_CACHE_NAME, WASTE_CACHE_NAME];

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            // Delete any cache that isn't in our current version list
            .filter((name) => name.startsWith('vb-') && !currentCaches.includes(name))
            .map((name) => {
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        // Clean up stale entries from current caches
        return cleanStaleCacheEntries();
      })
      .then(() => self.clients.claim())
  );
});

// Clean entries older than CACHE_TTL_MS from all caches
async function cleanStaleCacheEntries() {
  const now = Date.now();
  const cacheNames = [CACHE_NAME, STATIC_CACHE_NAME];

  for (const cacheName of cacheNames) {
    try {
      const cache = await caches.open(cacheName);
      const requests = await cache.keys();

      for (const request of requests) {
        const response = await cache.match(request);
        if (response) {
          // Check cache timestamp from custom header
          const cachedAt = response.headers.get('x-sw-cached-at');
          if (cachedAt) {
            const cacheAge = now - parseInt(cachedAt, 10);
            if (cacheAge > CACHE_TTL_MS) {
              await cache.delete(request);
            }
          }
        }
      }
    } catch (err) {
      void err;
    }
  }
}

// Message event - handle commands from client
self.addEventListener('message', (event) => {
  if (!event.data) return;

  const { type, payload } = event.data;

  switch (type) {
    case 'SYNC_WASTE_SCHEDULE':
      event.waitUntil(syncWasteSchedule(payload?.apiUrl));
      break;
    case 'GET_WASTE_SCHEDULE':
      event.waitUntil(getWasteScheduleFromCache().then((data) => {
        event.ports[0].postMessage({ type: 'WASTE_SCHEDULE_DATA', data });
      }));
      break;
  }
});

// Sync waste schedule from API to cache
async function syncWasteSchedule(apiUrl) {
  if (!apiUrl) return;

  try {
    // Get current and next month
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
    const nextYear = currentMonth === 12 ? currentYear + 1 : currentYear;

    // Fetch waste events for current and next month
    const [currentRes, nextRes] = await Promise.all([
      fetch(`${apiUrl}/api/public/events/calendar?month=${currentMonth}&year=${currentYear}`),
      fetch(`${apiUrl}/api/public/events/calendar?month=${nextMonth}&year=${nextYear}`),
    ]);

    if (!currentRes.ok || !nextRes.ok) {
      throw new Error('Failed to fetch waste schedule');
    }

    const [currentData, nextData] = await Promise.all([
      currentRes.json(),
      nextRes.json(),
    ]);

    // Filter waste events
    const filterWasteEvents = (events) => {
      if (!events || !Array.isArray(events)) return [];
      return events.filter((e) => e.title?.toLowerCase().includes('odvoz otpada'));
    };

    const wasteEvents = [
      ...filterWasteEvents(currentData.data || currentData),
      ...filterWasteEvents(nextData.data || nextData),
    ];

    // Store in cache
    const cache = await caches.open(WASTE_CACHE_NAME);
    const cacheData = {
      events: wasteEvents,
      syncedAt: new Date().toISOString(),
      currentMonth,
      currentYear,
    };

    // Store as a synthetic Response
    const response = new Response(JSON.stringify(cacheData), {
      headers: { 'Content-Type': 'application/json' },
    });

    await cache.put('/waste-schedule-data', response);

    // Notify all clients
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({ type: 'WASTE_SCHEDULE_SYNCED', data: cacheData });
    });

    return cacheData;
  } catch (err) {
    void err;
    return null;
  }
}

// Get waste schedule from cache
async function getWasteScheduleFromCache() {
  try {
    const cache = await caches.open(WASTE_CACHE_NAME);
    const response = await cache.match('/waste-schedule-data');
    if (response) {
      return await response.json();
    }
    return null;
  } catch {
    return null;
  }
}

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Skip API routes
  if (url.pathname.startsWith('/api/')) {
    return;
  }

  // Determine caching strategy
  const isCacheFirst = CACHE_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname));
  const isNetworkFirst = NETWORK_FIRST_PATTERNS.some((pattern) => pattern.test(url.pathname));

  if (isCacheFirst) {
    // Cache-first for static assets
    event.respondWith(cacheFirst(request));
  } else if (isNetworkFirst) {
    // Network-first for HTML pages
    event.respondWith(networkFirst(request));
  }
});

// Add timestamp header and cache a response
async function cacheWithTimestamp(cache, request, response) {
  // Clone response and add cache timestamp
  const headers = new Headers(response.headers);
  headers.set('x-sw-cached-at', String(Date.now()));

  const timestampedResponse = new Response(await response.clone().blob(), {
    status: response.status,
    statusText: response.statusText,
    headers: headers,
  });

  await cache.put(request, timestampedResponse);
}

// Check if cached response is still valid (within TTL)
function isCacheValid(response) {
  const cachedAt = response.headers.get('x-sw-cached-at');
  if (!cachedAt) return true; // No timestamp = assume valid (legacy cache)

  const cacheAge = Date.now() - parseInt(cachedAt, 10);
  return cacheAge < CACHE_TTL_MS;
}

// Cache-first strategy with TTL check
async function cacheFirst(request) {
  const cached = await caches.match(request);

  if (cached && isCacheValid(cached)) {
    return cached;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      await cacheWithTimestamp(cache, request, response);
    }
    return response;
  } catch {
    // Return stale cache if network fails
    if (cached) {
      return cached;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Network-first strategy with caching
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cacheWithTimestamp(cache, request, response);
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    // Return cached homepage as fallback
    const fallback = await caches.match('/');
    if (fallback) {
      return fallback;
    }
    return new Response('Offline', { status: 503 });
  }
}

// Push notification event
self.addEventListener('push', (event) => {
  if (!event.data) {
    return;
  }

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = {
      title: 'Općina Veliki Bukovec',
      body: event.data.text(),
    };
  }

  const options = {
    body: payload.body || '',
    icon: payload.icon || '/android-chrome-192x192.png',
    badge: payload.badge || '/android-chrome-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: payload.data?.url || payload.url || '/',
      topic: payload.data?.topic || payload.topic || 'all',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'open',
        title: 'Otvori',
      },
      {
        action: 'close',
        title: 'Zatvori',
      },
    ],
    tag: payload.tag || 'vb-notification',
    renotify: true,
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'Općina Veliki Bukovec', options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.focus();
            if (urlToOpen !== '/') {
              client.navigate(urlToOpen);
            }
            return;
          }
        }
        // Open new window if none found
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  void event;
});
