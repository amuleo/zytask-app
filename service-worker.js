// service-worker.js
// این Service Worker به طور خاص برای مدیریت کش و بروزرسانی‌های برنامه index.html طراحی شده است.
// تمامی عملیات کشینگ و پاکسازی داده‌ها در محدوده این برنامه انجام می‌شود.

const CACHE_NAME = 'my-app-v1.0.5';
const API_CACHE_NAME = 'api-cache-v1';
const urlsToCache = [
    '/index.html',
    '/favicon.ico',
    'https://cdn.jsdelivr.net/npm/tailwindcss@3.3.0/dist/tailwind.min.css',
    'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@33.003/misc/Farsi-Digits/Vazirmatn-FD-font-face.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2'
];

// 📌 **نصب Service Worker و کش کردن منابع**
self.addEventListener('install', (event) => {
    console.log('[Service Worker] نصب آغاز شد...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[Service Worker] در حال کش کردن منابع...');
            return cache.addAll(urlsToCache);
        })
    );
});

// 📌 **مدیریت درخواست‌های شبکه**
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    // مدیریت درخواست‌های API
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then((cache) => {
                return cache.match(event.request).then(cachedResponse => {
                    const networkPromise = fetch(event.request).then(networkResponse => {
                        if (networkResponse.ok) {
                            cache.put(event.request.clone(), networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        console.warn('[Service Worker] درخواست API با شکست مواجه شد، بازگشت به کش:', event.request.url);
                        return cachedResponse;
                    });
                    return cachedResponse || networkPromise;
                });
            })
        );
        return;
    }

    // مدیریت درخواست‌های HTML و سایر منابع
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) return cachedResponse;

            const fetchRequest = event.request.clone();
            return fetch(fetchRequest).then((networkResponse) => {
                if (!networkResponse || !networkResponse.ok) return networkResponse;

                // ذخیره پویا منابع جدید
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, networkResponse.clone());
                });
                return networkResponse;
            }).catch(() => caches.match(event.request));
        })
    );
});

// 📌 **پاکسازی کش‌های قدیمی**
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] فعال‌سازی آغاز شد...');
    const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log('[Service Worker] حذف کش قدیمی:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 📌 **مدیریت بروزرسانی عمیق**
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'START_DEEP_UPDATE') {
        console.log('[Service Worker] دریافت پیام بروزرسانی عمیق...');
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            }).then(() => {
                return self.registration.unregister().then(() => {
                    self.clients.matchAll().then((clients) => {
                        clients.forEach((client) => {
                            client.postMessage({
                                type: 'PERFORM_LOCAL_STORAGE_CLEANUP_AND_RELOAD',
                                keysToPreserve: [
                                    'tasks', 'zPoint', 'level', 'dailyStreak', 'highestDailyStreak',
                                    'lastCompletionDate', 'totalCustomTasksCompleted', 'userName', 
                                    'userCreationDate', 'unlockedAchievements', 'achievementUnlockDates',
                                    'hasPinnedTaskEver', 'theme'
                                ]
                            });
                        });
                    });
                });
            })
        );
    }
});
