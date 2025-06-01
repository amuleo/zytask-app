const CACHE_NAME = 'my-app-v1.5.0';
const API_CACHE_NAME = 'api-cache-v1';

const MAX_CACHE_AGE = 365 * 24 * 60 * 60 * 1000;

const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@33.003/misc/Farsi-Digits/Vazirmatn-FD-font-face.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.ttf',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.ttf',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.ttf'
];

function isResponseExpired(response, maxAge) {
  if (!response) return true;
  const dateHeader = response.headers.get('date');
  if (dateHeader) {
    const responseDate = new Date(dateHeader);
    const now = new Date();
    if ((now - responseDate) > maxAge) {
      return true;
    }
  }
  return false;
}

self.addEventListener('install', (event) => {
  console.log('[Service Worker] در حال نصب...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] در حال کش کردن منابع ضروری (App Shell)...');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('خطا در افزودن URL‌ها به کش در حین نصب:', error);
        throw error;
      })
      .finally(() => {
        self.skipWaiting();
      })
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = new URL(event.request.url);
  const isAppShellAsset = urlsToCache.some(url => {
    const appShellUrl = new URL(url, self.location.origin);
    return requestUrl.pathname === appShellUrl.pathname || requestUrl.href === appShellUrl.href;
  });

  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match('/index.html').then((cachedIndex) => {
          const fetchAndCache = fetch(event.request).then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put('/index.html', networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('خطا در دریافت index.html از شبکه:', error);
            return cachedIndex || new Response('<h1>Offline</h1><p>The application is offline and the requested page is not in cache.</p>', {
              headers: { 'Content-Type': 'text/html' },
              status: 503,
              statusText: 'Service Unavailable'
            });
          });

          if (cachedIndex) {
            event.waitUntil(fetchAndCache);
            return cachedIndex;
          } else {
            return fetchAndCache;
          }
        });
      })
    );
    return;
  }

  if (requestUrl.pathname.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.ok) {
              cache.put(event.request.clone(), networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            console.warn('[Service Worker] درخواست API با شکست مواجه شد، بازگشت به کش:', requestUrl.href);
            return cache.match(event.request);
          });
      })
    );
    return;
  }

  if (isAppShellAsset) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          console.log('[Service Worker] سرویس‌دهی از کش (App Shell):', requestUrl.href);
          return cachedResponse;
        }
        console.warn('[Service Worker] منبع App Shell در کش یافت نشد، تلاش برای دریافت از شبکه:', requestUrl.href);
        return fetch(event.request).then(networkResponse => {
            if (networkResponse && networkResponse.ok) {
                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, networkResponse.clone());
                });
            }
            return networkResponse;
        }).catch(error => {
            console.error('[Service Worker] خطا در دریافت منبع App Shell از شبکه:', error);
            return new Response('Offline: App Shell resource not available', { status: 503, statusText: 'Service Unavailable' });
        });
      })
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse && !isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
        console.log('[Service Worker] سرویس‌دهی از کش (با بررسی انقضا):', requestUrl.href);
        return cachedResponse;
      } else if (cachedResponse) {
        console.log('[Service Worker] پاسخ کش شده منقضی شده است (غیر از App Shell):', requestUrl.href);
        caches.open(CACHE_NAME).then((cache) => {
          cache.delete(event.request);
        });
      }

      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
          return networkResponse;
        })
        .catch(() => {
          console.warn('[Service Worker] دریافت منبع با شکست مواجه شد، بازگشت به کش (فال‌بک نهایی):', requestUrl.href);
          return cachedResponse;
        });

      return fetchPromise;
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] در حال فعال‌سازی...');
  const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('[Service Worker] در حال حذف کش قدیمی:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      self.clients.claim();
      console.log('[Service Worker] کنترل کلاینت‌ها با موفقیت در دست گرفته شد.');
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'START_DEEP_UPDATE') {
    console.log('[Service Worker] پیام START_DEEP_UPDATE دریافت شد. در حال پاکسازی کش‌ها...');
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log(`[Service Worker] در حال حذف کش: ${cacheName}`);
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        const keysToPreserve = [
          'tasks',
          'zPoint',
          'level',
          'totalCustomTasksCompleted',
          'userName',
          'userCreationDate',
          'unlockedAchievements',
          'achievementUnlockDates',
          'hasPinnedTaskEver',
          'currentMotivationIndex',
          'defaultCategories',
          'theme'
        ];
        console.log('[Service Worker] تمامی کش‌ها پاک شدند. ارسال پیام به کلاینت برای پاکسازی Local Storage و بارگذاری مجدد...');
        self.clients.matchAll().then((clients) => {
          clients.forEach((client) => {
            client.postMessage({
              type: 'PERFORM_LOCAL_STORAGE_CLEANUP_AND_RELOAD',
              keysToPreserve: keysToPreserve
            });
          });
        });
      })
    );
  }
});
