// CV Stash Service Worker
// Bump CACHE_VERSION to trigger update on deploy
const CACHE_VERSION = 'cvstash-v1';
const CACHE_NAME = CACHE_VERSION;

const PRECACHE_ASSETS = [
    '/',
    '/index.html',

    // CSS
    '/css/main.css',
    '/css/mobile.css',
    '/css/template.css',

    // JS modules
    '/js/app.js',
    '/js/commands.js',
    '/js/constants.js',
    '/js/data/samples.js',
    '/js/editor.js',
    '/js/history.js',
    '/js/i18n.js',
    '/js/icons.js',
    '/js/onboarding.js',
    '/js/pdf.js',
    '/js/preview.js',
    '/js/sanitize.js',
    '/js/selection.js',
    '/js/sidebar.js',
    '/js/storage.js',
    '/js/swipe.js',
    '/js/templates.js',
    '/js/theme.js',
    '/js/toast.js',
    '/js/ui.js',

    // Vendored libraries
    '/vendor/lucide.min.js',
    '/vendor/marked.min.js',
    '/vendor/html2pdf.bundle.min.js',

    // Locales
    '/locales/en.json',
    '/locales/fr.json',

    // Icons and images
    '/favicon.png',
    '/images/icon-192.png',
    '/images/icon-512.png',
    '/images/apple-touch-icon.png',
    '/images/logo.png',

    // Manifest
    '/manifest.json'
];

// Install: precache all static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(PRECACHE_ASSETS))
            .then(() => self.skipWaiting())
    );
});

// Activate: delete old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((names) =>
            Promise.all(
                names
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            )
        ).then(() => self.clients.claim())
    );
});

// Fetch: cache-first for all requests
self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    event.respondWith(
        caches.match(event.request).then((cached) => {
            if (cached) return cached;

            return fetch(event.request).then((response) => {
                // Cache successful same-origin responses
                if (response && response.ok && url.origin === self.location.origin) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            });
        }).catch(() => {
            // Navigation fallback for SPA
            if (event.request.mode === 'navigate') {
                return caches.match('/index.html');
            }
        })
    );
});
