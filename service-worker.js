// service-worker.js
// -----------------------------------------------------------------------------
// این Service Worker برای مدیریت کش، نمایش فایل index.html ذخیره‌شده در حالت آفلاین
// و بروزرسانی عمیق برنامه index.html طراحی شده است.
// نسخه اصلی (حدود ۲۰۰ خط) دست نخورده حفظ شده و سپس ویژگی‌های جدید اضافه شده‌اند.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// تعریف متغیرهای اصلی
// -----------------------------------------------------------------------------
const CACHE_NAME = 'my-app-v1.0.7'; // نسخه جدید کش منابع استاتیک
const API_CACHE_NAME = 'api-cache-v1'; // کش جداگانه برای پاسخ‌های API

// حداکثر زمان نگهداری کش برای منابع غیر index (مثلاً API یا تصاویر): ۳۶۵ روز
const MAX_CACHE_AGE = 365 * 24 * 60 * 60 * 1000;

// لیست URL‌هایی که در هنگام نصب کش می‌شوند
const urlsToCache = [
  '/',               // فرض شده index.html از این مسیر ارائه می‌شود
  '/index.html',     // کش کردن صریح فایل HTML اصلی
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
// NEW FEATURE: تابع کمکی برای بررسی انقضای کش برای منابع غیر از index.html
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
// کدهای اصلی (تقریباً ۲۰۰ خط) – دست نخورده حفظ شده و سپس ویژگی‌های جدید اضافه شده‌اند
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
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  // =============================
  // بخش navigational (درخواست‌های بارگیری صفحه)
  // =============================
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match('/index.html').then((cachedIndex) => {
          if (cachedIndex) {
            // اگر index.html در کش موجود بود به کاربر برگردان (حتی اگر منقضی شده باشد)
            // در پس‌زمینه تلاش می‌کنیم فایل را به‌روز کنیم
            event.waitUntil(
              fetch(event.request)
                .then((networkResponse) => {
                  if (networkResponse && networkResponse.ok) {
                    cache.put('/index.html', networkResponse.clone());
                  }
                })
                .catch(() => {
                  // اگر شبکه در دسترس نباشد، مشکلی نیست؛ از نسخه کش شده استفاده می‌کنیم
                })
            );
            return cachedIndex;
          }
          // اگر index.html در کش موجود نباشد، تلاش برای دریافت از شبکه
          return fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put('/index.html', networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
              // FALLBACK: در صورتی که هیچ داده‌ای یافت نشد، یک صفحه آفلاین ساده نمایش داده می‌شود.
              return new Response(
                `<!DOCTYPE html>
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
                    <h1>وب‌سایت آفلاین است</h1>
                    <p>متأسفانه، امکان بارگذاری اطلاعات وجود ندارد.</p>
                  </body>
                </html>`,
                { headers: { 'Content-Type': 'text/html' } }
              );
            });
        });
      })
    );
    return;
  }

  // =============================
  // مدیریت درخواست‌های API (URLهایی که شامل '/api/' هستند)
  // =============================
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((cachedResponse) => {

          // بررسی انقضای پاسخ کش شده API برای منابع غیر index
          if (cachedResponse && isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
            console.log('[Service Worker] پاسخ API کش شده منقضی شده است:', event.request.url);
            cache.delete(event.request);
            cachedResponse = null;
          }

          const networkPromise = fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.ok) {
                cache.put(event.request.clone(), networkResponse.clone());
              }
              return networkResponse;
            })
            .catch(() => {
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
  // مدیریت درخواست‌های سایر منابع (مانند CSS، تصاویر و غیره)
  // =============================
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse && !isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
        return cachedResponse;
      } else if (cachedResponse) {
        console.log('[Service Worker] پاسخ کش شده منقضی شده است:', event.request.url);
        caches.open(CACHE_NAME).then((cache) => {
          cache.delete(event.request);
        });
      }
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest)
        .then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) {
            return networkResponse;
          }
          // برای منابعی که در لیست urlsToCache نیستند، نسخه پویا در کش ذخیره می‌شود.
          if (!urlsToCache.includes(event.request.url)) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            }).catch((cacheError) => {
              console.error('خطا در قرار دادن پاسخ پویا در کش:', cacheError);
            });
          }
          return networkResponse;
        })
        .catch((error) => {
          console.error('دریافت اطلاعات با شکست مواجه شد؛ تلاش برای استفاده از کش:', error);
          return caches.match(event.request);
        });
    })
  );
});


// فعال‌سازی Service Worker و پاکسازی کش‌های قدیمی
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
      console.log('[Service Worker] در حال تصاحب کلاینت‌ها...');
      return self.clients.claim();
    })
  );
});


// مدیریت پیام‌ها (به عنوان مثال، برای بروزرسانی عمیق)
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
          'dailyStreak',
          'highestDailyStreak',
          'lastCompletionDate',
          'totalCustomTasksCompleted',
          'userName',
          'userCreationDate',
          'unlockedAchievements',
          'achievementUnlockDates',
          'hasPinnedTaskEver',
          'theme'
        ];
        console.log('[Service Worker] تمامی کش‌ها پاک شدند. لغو ثبت Service Worker و ارسال پیام به کلاینت...');
        return self.registration.unregister().then(() => {
          self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
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
