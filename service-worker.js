// service-worker.js
// این Service Worker به طور خاص برای مدیریت کش و بروزرسانی‌های برنامه index.html طراحی شده است.
// تمامی عملیات کشینگ و پاکسازی داده‌ها در محدوده این برنامه انجام می‌شود.

const CACHE_NAME = 'my-app-v1.0.3'; // نسخه کش بروزرسانی شده برای منابع استاتیک
const API_CACHE_NAME = 'api-cache-v1'; // کش جداگانه برای پاسخ‌های API
const urlsToCache = [
    '/', // کش کردن مسیر ریشه، با فرض اینکه index.html از آنجا سرو می‌شود
    '/index.html', // کش کردن صریح فایل HTML
    'https://cdn.tailwindcss.com',
    'https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@33.003/misc/Farsi-Digits/Vazirmatn-FD-font-face.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
    // کش کردن صریح فونت‌های Font Awesome برای پشتیبانی بهتر آفلاین در iOS/Safari
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-solid-900.ttf',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-regular-400.ttf',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/webfonts/fa-brands-400.ttf'
    // می‌توانید URLهای دیگری از CSS، JavaScript، تصاویر و غیره را در اینجا اضافه کنید
];

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
    // شما باید این شرط را بر اساس ساختار واقعی URLهای API خود تنظیم کنید.
    if (event.request.url.includes('/api/')) {
        event.respondWith(
            caches.open(API_CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const networkPromise = fetch(event.request).then(networkResponse => {
                        // کش کردن پاسخ‌های موفقیت‌آمیز API
                        if (networkResponse.ok) {
                            // مهم: پاسخ را کلون کنید قبل از قرار دادن در کش
                            cache.put(event.request.clone(), networkResponse.clone());
                        }
                        return networkResponse;
                    }).catch(() => {
                        // اگر شبکه قطع بود یا درخواست شبکه با خطا مواجه شد، پاسخ کش شده را برگردان
                        console.warn('[Service Worker] درخواست API با شکست مواجه شد، در حال بازگشت به کش:', event.request.url);
                        return cachedResponse;
                    });
                    // استراتژی: ابتدا کش را بررسی کن، اگر نبود یا شبکه قطع بود، به شبکه برو و کش کن.
                    // اگر شبکه در دسترس نبود، از پاسخ کش شده استفاده کن.
                    return cachedResponse || networkPromise;
                });
            })
        );
    }
    // مدیریت درخواست‌های سایر منابع (CSS، JS، تصاویر، HTML و غیره)
    else {
        event.respondWith(
            caches.match(event.request)
                .then((response) => {
                    // اگر در کش یافت شد، پاسخ را برگردان
                    if (response) {
                        return response;
                    }

                    // مهم: درخواست را کلون کنید. یک درخواست یک جریان است و فقط یک بار می‌تواند مصرف شود.
                    const fetchRequest = event.request.clone();

                    return fetch(fetchRequest).then((networkResponse) => {
                        // بررسی می‌کنیم که آیا پاسخ معتبری دریافت کرده‌ایم.
                        // response.ok برای کدهای وضعیت 2xx صحیح است.
                        if (!networkResponse || !networkResponse.ok) {
                            return networkResponse;
                        }

                        // کش کردن پویا منابع موفقیت‌آمیز (به جز مواردی که قبلاً در install کش شده‌اند)
                        // و همچنین بررسی کنید که URL در لیست urlsToCache نباشد تا از کش کردن مجدد جلوگیری شود.
                        // این برای منابعی مانند تصاویر که به صورت پویا بارگیری می‌شوند، مفید است.
                        if (!urlsToCache.includes(event.request.url)) {
                            // مهم: پاسخ را کلون کنید قبل از قرار دادن در کش
                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(event.request, networkResponse.clone());
                                })
                                .catch(cacheError => {
                                    console.error('خطا در قرار دادن پاسخ پویا در کش:', cacheError);
                                });
                        }
                        return networkResponse;
                    }).catch((error) => {
                        // اگر درخواست شبکه با شکست مواجه شد (مثلاً آفلاین بود)، سعی کنید به عنوان یک جایگزین از کش دریافت کنید.
                        console.error('دریافت اطلاعات با شکست مواجه شد؛ در صورت موجود بودن، منبع کش شده برگردانده می‌شود:', error);
                        return caches.match(event.request); // سعی کنید در صورت شکست شبکه، از کش برگردانید
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
            return self.clients.claim(); // کنترل تمامی کلاینت‌ها را بلافاصله در دست می‌گیرد
        })
    );
});

// شنونده پیام‌ها از رشته اصلی (مثلاً از index.html).
// این بخش مسئول مدیریت دستور بروزرسانی عمیق از برنامه index.html است.
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
                    // می‌توانید کلیدهای دیگری که می‌خواهید حفظ کنید را به این لیست اضافه کنید
                ];

                console.log('[Service Worker] تمامی کش‌ها پاک شدند. در حال لغو ثبت Service Worker و ارسال پیام به کلاینت.');
                // Service Worker خودش را لغو ثبت می‌کند تا مرورگر نسخه جدید را نصب کند.
                return self.registration.unregister().then(() => {
                    // پیام را به کلاینت (صفحه index.html) ارسال می‌کنیم تا پاکسازی localStorage و بارگذاری مجدد را انجام دهد.
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
