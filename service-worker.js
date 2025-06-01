// service-worker.js
// -----------------------------------------------------------------------------
// این Service Worker برای مدیریت کش، استفاده از فایل cached index.html در حالت آفلاین
// و بروزرسانی عمیق (Deep Update) برنامه index.html طراحی شده است.
// نسخه اصلی (تقریباً ۲۰۰ خط) دست نخورده حفظ شده و سپس ویژگی‌های جدید اضافه شده‌اند.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// تعریف متغیرهای اصلی
// -----------------------------------------------------------------------------
const CACHE_NAME = 'my-app-v1.2.0'; // نسخه جدید کش منابع استاتیک (افزایش نسخه برای اطمینان از بروزرسانی)
const API_CACHE_NAME = 'api-cache-v1'; // کش جداگانه برای پاسخ‌های API

// حداکثر زمان نگهداری کش برای منابع غیر index (مثلاً API یا تصاویر): ۳۶۵ روز
const MAX_CACHE_AGE = 365 * 24 * 60 * 60 * 1000;

// لیست URL‌هایی که در هنگام نصب کش می‌شوند (App Shell)
const urlsToCache = [
  '/',               // فرض شده index.html از این مسیر ارائه می‌شود
  '/index.html',     // کش کردن صریح فایل HTML اصلی
  '/script.js',      // کش کردن فایل اصلی جاوااسکریپت
  '/style.css',      // کش کردن فایل اصلی CSS
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
// تابع کمکی برای بررسی انقضای کش
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
// کدهای اصلی Service Worker
// -----------------------------------------------------------------------------

// نصب Service Worker و کش کردن منابع اولیه (App Shell)
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
        // در صورت شکست، نصب Service Worker با خطا مواجه می‌شود
        throw error;
      })
  );
});

// مدیریت درخواست‌های شبکه
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const requestUrl = event.request.url;

  // 1. استراتژی برای ناوبری (App Shell - index.html)
  // این بخش برای بارگذاری اولیه صفحه و اطمینان از سرعت و قابلیت آفلاین است.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match('/index.html').then((cachedIndex) => {
          const fetchAndCache = fetch(event.request).then((networkResponse) => {
            // اگر پاسخ شبکه معتبر بود، آن را در کش بروزرسانی کن
            if (networkResponse && networkResponse.ok) {
              cache.put('/index.html', networkResponse.clone());
            }
            return networkResponse;
          }).catch((error) => {
            console.error('خطا در دریافت index.html از شبکه:', error);
            // در صورت شکست شبکه، اگر نسخه کش شده‌ای بود، آن را برگردان
            return cachedIndex || new Response('<h1>Offline</h1><p>The application is offline and the requested page is not in cache.</p>', {
              headers: { 'Content-Type': 'text/html' },
              status: 503,
              statusText: 'Service Unavailable'
            });
          });

          // اگر index.html در کش موجود بود، بلافاصله آن را برگردان
          // و در پس‌زمینه نسخه جدید را از شبکه دریافت و کش را بروزرسانی کن.
          if (cachedIndex) {
            event.waitUntil(fetchAndCache); // بروزرسانی کش در پس‌زمینه
            return cachedIndex;
          } else {
            // اگر در کش نبود، از شبکه بگیر و کش کن
            return fetchAndCache;
          }
        });
      })
    );
    return;
  }

  // 2. استراتژی برای API (Network First with Cache Fallback)
  // برای درخواست‌هایی که شامل '/api/' هستند.
  if (requestUrl.includes('/api/')) {
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
            console.warn('[Service Worker] درخواست API با شکست مواجه شد، بازگشت به کش:', requestUrl);
            return cache.match(event.request); // Fallback به کش
          });
      })
    );
    return;
  }

  // 3. استراتژی برای سایر منابع (App Shell Assets & Dynamic Assets)
  // این بخش شامل script.js, style.css و سایر منابع استاتیک و پویا می‌شود.
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // اگر منبع جزو App Shell باشد (در urlsToCache)، همیشه از کش برگردان
      // این بخش تضمین می‌کند که فایل‌های اصلی برنامه همیشه آفلاین در دسترس باشند.
      if (urlsToCache.includes(requestUrl) && cachedResponse) {
        return cachedResponse;
      }

      // اگر منبع در کش بود اما جزو App Shell نبود، بررسی انقضا
      // این برای منابعی است که ممکن است نیاز به بروزرسانی مکرر داشته باشند.
      if (cachedResponse && isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
        console.log('[Service Worker] پاسخ کش شده منقضی شده است (غیر از App Shell):', requestUrl);
        caches.open(CACHE_NAME).then((cache) => {
          cache.delete(event.request); // حذف نسخه منقضی شده
        });
        cachedResponse = null; // برای اطمینان از اینکه از آن استفاده نمی‌شود
      }

      // تلاش برای دریافت از شبکه
      const fetchRequest = event.request.clone();
      return fetch(fetchRequest)
        .then((networkResponse) => {
          if (!networkResponse || !networkResponse.ok) {
            return networkResponse; // اگر پاسخ شبکه معتبر نبود (مثلاً 404 یا 500)
          }
          // کش کردن پاسخ معتبر شبکه (برای منابع پویا یا بروزرسانی App Shell)
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          }).catch((cacheError) => {
            console.error('خطا در قرار دادن پاسخ پویا در کش:', cacheError);
          });
          return networkResponse;
        })
        .catch((error) => {
          console.error('دریافت اطلاعات با شکست مواجه شد؛ تلاش برای استفاده از کش (فال‌بک نهایی):', error);
          // اگر شبکه شکست خورد و cachedResponse معتبر (غیر منقضی یا App Shell) نبود،
          // سعی کن از آخرین نسخه کش شده (حتی اگر منقضی شده باشد) استفاده کنی.
          // این یک فال‌بک نهایی برای اطمینان از بارگذاری است.
          return cachedResponse || new Response('Offline: Resource not available', { status: 503, statusText: 'Service Unavailable' });
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
      return self.clients.claim(); // این تضمین می‌کند که Service Worker بلافاصله کنترل صفحه را در دست بگیرد.
    })
  );
});


// مدیریت پیام‌ها (برای مثال، برای بروزرسانی عمیق)
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
        // لیست کلیدهای Local Storage که باید در طول بروزرسانی حفظ شوند.
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
