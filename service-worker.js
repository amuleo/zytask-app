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
// تابع کمکی بررسی انقضای کش برای منابع غیر از index.html
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
// تابع تولید پاسخ HTML fallback به صورت دینامیک
// -----------------------------------------------------------------------------
function getOfflineFallbackResponse() {
  const html = `
  <!DOCTYPE html>
  <html lang="fa">
  <head>
    <meta charset="UTF-8">
    <title>اتصال اینترنت و بارگذاری مجدد</title>
    <style>
      body {
        font-family: sans-serif;
        text-align: center;
        background: #f0f0f0;
        margin: 0;
        padding: 2em;
      }
      .container {
        background: white;
        padding: 2em;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        max-width: 400px;
        margin: auto;
      }
      #progress {
        width: 100%;
        height: 20px;
        background: #ddd;
        border-radius: 10px;
        overflow: hidden;
        margin-top: 1em;
        display: none;
      }
      #progressBar {
        height: 100%;
        width: 0;
        background: #4caf50;
        transition: width 0.3s;
      }
      button {
        margin-top: 1em;
        padding: 0.5em 1em;
        font-size: 1em;
        border: none;
        background: #4caf50;
        color: white;
        border-radius: 4px;
        cursor: pointer;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>اتصال اینترنت و بارگذاری مجدد</h1>
      <p>فایل‌های ضروری دانلود نشده‌اند. لطفاً اینترنت خود را وصل کنید و روی دکمه "بارگذاری مجدد" کلیک کنید.</p>
      <button id="refreshButton">بارگذاری مجدد</button>
      <div id="progress">
        <div id="progressBar"></div>
      </div>
    </div>
    <script>
      document.getElementById('refreshButton').addEventListener('click', () => {
        if (!navigator.onLine) {
          alert('لطفاً ابتدا به اینترنت وصل شوید.');
          return;
        }
        
        const progress = document.getElementById('progress');
        const progressBar = document.getElementById('progressBar');
        progress.style.display = 'block';
        
        // ارسال پیام deep update به Service Worker
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'START_DEEP_UPDATE' });
        }
        
        // شبیه‌سازی پیشرفت دانلود
        let progressValue = 0;
        const interval = setInterval(() => {
          progressValue += 10;
          progressBar.style.width = progressValue + '%';
          if (progressValue >= 100) {
            clearInterval(interval);
            window.location.reload();
          }
        }, 300);
      });
    </script>
  </body>
  </html>
  `;
  return new Response(html, {
    headers: { 'Content-Type': 'text/html;charset=utf-8' }
  });
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
        return cachedResponse;
      }
      
      // برای درخواست‌های ناوبری (navigate) سعی می‌کنیم فایل index.html را از کش بازگردانیم
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html')
          .then((response) => {
            // اگر index.html موجود باشد از آن استفاده می‌کنیم
            if (response) {
              return response;
            }
            // در صورت عدم وجود index.html، fallback تولید شده به صورت دینامیک برگردانده می‌شود
            return getOfflineFallbackResponse();
          });
      }
      
      // در موارد دیگر در صورت عدم وجود، یک پاسخ خطای آفلاین ارائه می‌دهیم
      return new Response('اپلیکیشن در حالت آفلاین اجرا می‌شود', {
        status: 503,
        statusText: 'Service Unavailable',
      });
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
            console.log(\`[Service Worker] در حال حذف کش: \${cacheName}\`);
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
