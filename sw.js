const CACHE_NAME = 'taj-medical-store-v2';
const APP_SHELL = [
    'index.html',
    'admin.html',
    'site-data.js',
    'manifest.json',
    'admin-manifest.json',
    'logo.png',
    'offline.html'
];

self.addEventListener('install', (e) => {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            // Cache what we can; don't fail install if one asset (e.g. logo.png) is missing.
            return Promise.all(
                APP_SHELL.map((url) => cache.add(url).catch(() => null))
            );
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((names) =>
            Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
        ).then(() => clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const req = e.request;
    if (req.method !== 'GET') return;

    // Page navigations: try the network first (fresh content), fall back to
    // the cached shell, then to the offline page if nothing is available.
    if (req.mode === 'navigate') {
        e.respondWith(
            fetch(req)
                .then((res) => {
                    const copy = res.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put('index.html', copy));
                    return res;
                })
                .catch(() =>
                    caches.match(req).then((cached) => cached || caches.match('index.html')).then((cached) => cached || caches.match('offline.html'))
                )
        );
        return;
    }

    // Other assets (JS, CSS, images): cache-first, refresh in the background.
    e.respondWith(
        caches.match(req).then((cached) => {
            const networkFetch = fetch(req)
                .then((res) => {
                    if (res && res.status === 200) {
                        const copy = res.clone();
                        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
                    }
                    return res;
                })
                .catch(() => cached);
            return cached || networkFetch;
        })
    );
});
