// service-worker.js
// -----------------------------------------------------------------------------
// این Service Worker برای مدیریت کش و بروزرسانی‌های برنامه index.html طراحی شده است.
// نسخه اصلی (تقریباً ۲۰۰ خط کد) دست نخورده حفظ شده و ویژگی‌های جدید نیز اضافه شده‌اند.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// تعریف متغیرهای اصلی
// -----------------------------------------------------------------------------
const CACHE_NAME = 'my-app-v1.0.7'; // نسخه جدید کش منابع استاتیک
const API_CACHE_NAME = 'api-cache-v1'; // کش جداگانه برای پاسخ‌های API

// حداکثر زمان نگهداری کش: ۳۶۵ روز (برحسب میلی‌ثانیه)
const MAX_CACHE_AGE = 365 * 24 * 60 * 60 * 1000;

// لیست URL‌هایی که در هنگام نصب کش می‌شوند
const urlsToCache = [
    '/', // فرض شده index.html از این مسیر ارائه می‌شود
    '/index.html',
    // توجه: اگرچه در اصل استفاده از تایم‌لینک CDN tailwindcss به صورت اسکریپت بوده،
    // برای پایداری بهتر در حالت آفلاین، بهتر است نسخه تولیدی CSS را استفاده کنید.
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

// -----------------------------------------------------------------------------
// NEW FEATURE: تابع کمکی برای بررسی انقضای کش (با استفاده از هدر Date)
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// کدهای اصلی (تقریباً ۲۰۰ خط) – بدون تغییر باقی مانده و سپس ویژگی‌های جدید اضافه شده‌اند
// -----------------------------------------------------------------------------

// نصب Service Worker و کش کردن منابع اولیه
self.addEventListener('install', (event) => {
    console.log('[Service Worker] در حال نصب...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[Service Worker] در حال کش کردن منابع ضروری...');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('خطا در افزودن URL‌ها به کش در حین نصب:', error);
            })
    );
});

// مدیریت درخواست‌های شبکه 
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    // =============================
    // بخش ویژه: درخواست‌های navigational (HTML)؛
    // در صورت عدم موفقیت در بازیابی از شبکه یا کش، fallback آفلاین ارائه می‌شود.
    // =============================
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.match('/index.html').then(cachedResponse => {
                if (cachedResponse && !isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
                    return cachedResponse;
                }
                return fetch(event.request)
                    .then(networkResponse => {
                        // اگر دریافت موفقیت‌آمیز بود آن را در کش ذخیره می‌کنیم
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put('/index.html', networkResponse.clone());
                        });
                        return networkResponse;
                    })
                    .catch(() => {
                        // FALLBACK: اگر شبکه در دسترس نباشد، یک صفحه آفلاین ساده ارائه می‌دهیم.
                        return new Response(`
                            <!DOCTYPE html>
                            <html>
                              <head>
                                  <meta charset="utf-8">
                                  <meta name="viewport" content="width=device-width, initial-scale=1">
                                  <title>آفلاین</title>
                                  <style>
                                      body { font-family: sans-serif; text-align: center; padding: 2rem; }
                                  </style>
                              </head>
                              <body>
                                  <h1>این وب‌سایت به صورت آفلاین در دسترس نیست</h1>
                                  <p>به نظر می‌رسد شما به اینترنت متصل نیستید.</p>
                              </body>
                            </html>
                        `, { headers: { 'Content-Type': 'text/html' } });
                    });
            })
        );
        return;
    }

    // =============================
    // مدیریت درخواست‌های API
    // =============================
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {

                    // بررسی انقضای پاسخ کش شده API
                    if (cachedResponse && isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
                        console.log('[Service Worker] پاسخ API کش شده منقضی شده است:', event.request.url);
                        cache.delete(event.request);
                        cachedResponse = null;
                    }

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

    // =============================
    // مدیریت درخواست‌های سایر منابع (CSS، تصاویر و غیره)
    // =============================
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            if (cachedResponse && !isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
                return cachedResponse;
            } else if (cachedResponse) {
                console.log('[Service Worker] پاسخ کش شده منقضی شده است:', event.request.url);
                caches.open(CACHE_NAME).then(cache => {
                    cache.delete(event.request);
                });
            }
            const fetchRequest = event.request.clone();
            return fetch(fetchRequest)
                .then(networkResponse => {
                    if (!networkResponse || !networkResponse.ok) {
                        return networkResponse;
                    }
                    // کش کردن منابعی که در لیست پیش‌کش نیستند
                    if (!urlsToCache.includes(event.request.url)) {
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, networkResponse.clone());
                        }).catch(cacheError => {
                            console.error('خطا در قرار دادن پاسخ پویا در کش:', cacheError);
                        });
                    }
                    return networkResponse;
                })
                .catch(error => {
                    console.error('دریافت اطلاعات با شکست مواجه شد؛ سعی در استفاده از کش:', error);
                    return caches.match(event.request);
                });
        })
    );
});

// فعال‌سازی Service Worker و پاکسازی کش‌های قدیمی
self.addEventListener('activate', event => {
    console.log('[Service Worker] در حال فعال‌سازی...');
    const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log('[Service Worker] در حال حذف کش قدیمی:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] در حال تصاحب کلاینت‌ها...');
            return self.clients.claim();
        })
    );
});

// مدیریت پیام‌ها از صفحه اصلی (مثلاً برای بروزرسانی عمیق)
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'START_DEEP_UPDATE') {
        console.log('[Service Worker] پیام START_DEEP_UPDATE دریافت شد. در حال پاکسازی کش‌ها...');
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        console.log(`[Service Worker] در حال حذف کش: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                const keysToPreserve = [
                    'tasks', 'zPoint', 'level', 'dailyStreak', 'highestDailyStreak',
                    'lastCompletionDate', 'totalCustomTasksCompleted', 'userName',
                    'userCreationDate', 'unlockedAchievements', 'achievementUnlockDates',
                    'hasPinnedTaskEver', 'theme'
                ];
                console.log('[Service Worker] تمامی کش‌ها پاک شدند. لغو ثبت Service Worker و ارسال پیام به کلاینت...');
                return self.registration.unregister().then(() => {
                    self.clients.matchAll().then(clients => {
                        clients.forEach(client => {
                            client.postMessage({
                                type: 'PERFORM_LOCAL_STORAGE_CLEANUP_AND_RELOAD',
                                keysToPreserve: keysToPreserve
                            });
                        });
                    });
                });
            })
        );
    }
});

// -----------------------------------------------------------------------------
// پایان فایل Service Worker
// -----------------------------------------------------------------------------
