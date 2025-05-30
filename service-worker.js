// service-worker.js
// این Service Worker به طور خاص برای مدیریت کش و بروزرسانی‌های برنامه index.html طراحی شده است.
// تمامی عملیات کشینگ و پاکسازی داده‌ها در محدوده این برنامه انجام می‌شود.

// service-worker.js
// -----------------------------------------------------------------------------
// این Service Worker به طور خاص برای مدیریت کش و بروزرسانی‌های برنامه index.html طراحی شده است.
// تمامی عملیات کشینگ و پاکسازی داده‌ها در محدوده این برنامه انجام می‌شود.
// * نسخه اصلی حدود ۲۰۰ خط کد در این فایل وجود دارد که در زیر حفظ شده و سپس ویژگی‌های جدید اضافه شده‌اند.
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// تعریف متغیرهای اصلی
// -----------------------------------------------------------------------------
const CACHE_NAME = 'my-app-v1.0.7'; // نسخه جدید کش منابع استاتیک
const API_CACHE_NAME = 'api-cache-v1'; // کش جداگانه برای پاسخ‌های API

// حداکثر زمان نگهداری کش: ۳۶۵ روز (بر حسب میلی‌ثانیه)
const MAX_CACHE_AGE = 365 * 24 * 60 * 60 * 1000;

// لیست URL‌هایی که در هنگام نصب کش می‌شوند
const urlsToCache = [
    '/', // کش کردن مسیر ریشه (فرض می‌شود index.html از این سایت ارائه می‌شود)
    '/index.html', // کش کردن صریح فایل HTML
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@33.003/misc/Farsi-Digits/Vazirmatn-FD-font-face.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.ttf',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.ttf',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.ttf'
    // سایر منابع در صورت نیاز می‌توانند اضافه شوند
];


// -----------------------------------------------------------------------------
// NEW FEATURE: تابع کمکی برای بررسی انقضای کش (بر اساس هدر Date)
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
// کدهای اصلی (تقریباً ۲۰۰ خط) پایین این نقطه دست نخورده حفظ شده‌اند
// -----------------------------------------------------------------------------


// شنونده رویداد 'install': هنگام نصب Service Worker فراخوانی می‌شود.
// این رویداد منابع ضروری برنامه را در کش ذخیره می‌کند تا برای استفاده آفلاین در دسترس باشند.
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




// شنونده رویداد 'fetch': هر درخواست شبکه را رهگیری می‌کند.
// این رویداد ابتدا سعی می‌کند پاسخ را از کش برگرداند؛ اگر در کش نبود، درخواست را از شبکه دریافت می‌کند.
// این رفتار، قابلیت آفلاین را برای index.html و منابع وابسته به آن فراهم می‌کند.
self.addEventListener('fetch', event => {
    // فقط درخواست‌های GET را رهگیری می‌کنیم
    if (event.request.method !== 'GET') {
        return;
    }

    // مدیریت درخواست‌های API (فرض می‌کنیم URLهای API با '/api/' شروع می‌شوند)
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {

                    // NEW FEATURE: بررسی انقضای پاسخ کش شده API قبل از استفاده
                    if (cachedResponse && isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
                        console.log('[Service Worker] پاسخ API کش شده منقضی شده است:', event.request.url);
                        cache.delete(event.request);
                        cachedResponse = null;
                    }

                    const networkPromise = fetch(event.request).then(networkResponse => {
                        // کش کردن پاسخ‌های موفقیت‌آمیز API
                        if (networkResponse.ok) {
                            // مهم: پاسخ را کلون کنید قبل از قرار دادن در کش
                            cache.put(event.request.clone(), networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        console.warn('[Service Worker] درخواست API با شکست مواجه شد، در حال بازگشت به کش:', event.request.url);
                        return cachedResponse;
                    });
                    return cachedResponse || networkPromise;
                });
            })
        );
        return;
    }
    // مدیریت درخواست‌های سایر منابع (CSS، JS، تصاویر، HTML و غیره)
    else {
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {

                // NEW FEATURE: بررسی انقضای پاسخ کش شده برای منابع غیر API
                if (cachedResponse && isResponseExpired(cachedResponse, MAX_CACHE_AGE)) {
                    console.log('[Service Worker] پاسخ کش شده منقضی شده است:', event.request.url);
                    // حذف پاسخ منقضی شده از کش
                    caches.open(CACHE_NAME).then(cache => {
                        cache.delete(event.request);
                    });
                    cachedResponse = null;
                }

                if (cachedResponse) {
                    return cachedResponse;
                }

                // مهم: درخواست را کلون کنید. یک درخواست یک جریان است و فقط یکبار مصرف می‌شود.
                const fetchRequest = event.request.clone();

                return fetch(fetchRequest).then((networkResponse) => {
                    // بررسی صحت پاسخ دریافت شده (برای کدهای وضعیت 2xx)
                    if (!networkResponse || !networkResponse.ok) {
                        return networkResponse;
                    }

                    // کش کردن پویا منابع موفقیت‌آمیز
                    // NEW: بررسی این که آیا URL در لیست پیش‌کش موجود نیست تا دوبار کش نشود
                    if (!urlsToCache.includes(event.request.url)) {
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                // توجه: به دلیل اینکه امکان افزودن هدر تاریخ به پاسخ وجود ندارد،
                                // ما بر روی هدر Date موجود در پاسخ تکیه می‌کنیم.
                                cache.put(event.request, networkResponse.clone());
                            })
                            .catch(cacheError => {
                                console.error('خطا در قرار دادن پاسخ پویا در کش:', cacheError);
                            });
                    }
                    return networkResponse;
                }).catch((error) => {
                    console.error('دریافت اطلاعات با شکست مواجه شد؛ در صورت موجود بودن، منبع کش شده برگردانده می‌شود:', error);
                    return caches.match(event.request);
                });
            })
        );
    }
});




// شنونده رویداد 'activate': هنگام فعال شدن Service Worker فراخوانی می‌شود.
// این رویداد کش‌های قدیمی را پاک می‌کند تا اطمینان حاصل شود که فقط آخرین نسخه برنامه استفاده می‌شود.
self.addEventListener('activate', (event) => {
    console.log('[Service Worker] در حال فعال‌سازی...');
    // لیست کش‌های مجاز (کش فعلی منابع استاتیک و کش API)
    const cacheWhitelist = [CACHE_NAME, API_CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // حذف کش‌های قدیمی که در لیست مجاز نیستند
                        console.log('[Service Worker] در حال حذف کش قدیمی:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            console.log('[Service Worker] در حال تصاحب کلاینت‌ها (صفحات برنامه)...');
            return self.clients.claim(); // کنترل تمامی کلاینت‌ها را بلافاصله دریافت می‌کند
        })
    );
});




// شنونده پیام‌ها از رشته اصلی (مثلاً از index.html).
// این بخش مسئول مدیریت دستور بروزرسانی عمیق (Deep Update) از برنامه index.html است.
self.addEventListener('message', (event) => {
    // بررسی می‌کنیم که پیام از index.html و از نوع START_DEEP_UPDATE باشد.
    if (event.data && event.data.type === 'START_DEEP_UPDATE') {
        console.log('[Service Worker] پیام START_DEEP_UPDATE دریافت شد. در حال پاکسازی تمامی کش‌ها و لغو ثبت...');
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                // تمامی کش‌های Service Worker را پاک می‌کنیم.
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        console.log(`[Service Worker] در حال حذف کش: ${cacheName}`);
                        return caches.delete(cacheName);
                    })
                );
            }).then(() => {
                // کلیدهای localStorage که باید در صفحه اصلی حفظ شوند.
                // این لیست باید با لیست موجود در index.html یکسان باشد.
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
                    'theme' // حفظ تم برنامه
                    // می‌توانید کلیدهای دیگری که می‌خواهید حفظ شوند را اضافه کنید
                ];

                console.log('[Service Worker] تمامی کش‌ها پاک شدند. در حال لغو ثبت Service Worker و ارسال پیام به کلاینت.');
                // لغو ثبت Service Worker به‌منظور نصب نسخه جدید
                return self.registration.unregister().then(() => {
                    // ارسال پیام به کلاینت‌ها جهت پاکسازی localStorage و بارگذاری مجدد
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
