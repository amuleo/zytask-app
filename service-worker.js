const CACHE_NAME = 'my-app-v1.0.7'; // نسخه جدید کش منابع استاتیک
const API_CACHE_NAME = 'api-cache-v1'; // کش جداگانه برای پاسخ‌های API

// حداکثر زمان نگهداری کش برای منابع غیر index (مثلاً API یا تصاویر): ۳۶۵ روز
const MAX_CACHE_AGE = 365 * 24 * 60 * 60 * 1000;

// لیست URL‌هایی که در هنگام نصب کش می‌شوند
const urlsToCache = [
  '/',               // فرض شده index.html از این مسیر ارائه می‌شود
  '/index.html',     // کش کردن صریح فایل HTML اصلی
  '/script.js',      // اضافه شد
  '/style.css',      // اضافه شد
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
// نصب Service Worker و کش کردن منابع اولیه
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// مدیریت درخواست‌های شبکه در حالت آفلاین دائمی
// حتی اگر کاربر به اینترنت متصل باشد، فقط داده‌های کش شده استفاده می‌شوند
// -----------------------------------------------------------------------------
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // اگر درخواست در کش موجود باشد، همان را برگردان
        return cachedResponse;
      } else if (event.request.mode === 'navigate') {
        // برای درخواست‌های ناوبری (صفحه اصلی) سعی می‌شود index.html از کش ارائه شود
        return caches.match('/index.html').then((response) => {
          return response || new Response('اپلیکیشن در حالت آفلاین اجرا می‌شود', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      } else {
        // در صورت عدم یافتن موردی در کش، پیغام آفلاین ارائه می‌شود
        return new Response('اپلیکیشن در حالت آفلاین اجرا می‌شود', {
          status: 503,
          statusText: 'Service Unavailable',
        });
      }
    })
  );
});

// -----------------------------------------------------------------------------
// فعال‌سازی Service Worker و پاکسازی کش‌های قدیمی
// -----------------------------------------------------------------------------
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

// -----------------------------------------------------------------------------
// مدیریت پیام‌ها (برای مثال، برای بروزرسانی عمیق)
// -----------------------------------------------------------------------------
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
