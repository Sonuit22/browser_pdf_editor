/**
 * Service Worker for PDF Editor by ib
 * 
 * This service worker provides:
 * - Installation and activation lifecycle management
 * - Foundation for future caching strategies
 * - Offline support framework
 * 
 * Current state: Minimal implementation - no caching yet.
 * Caching strategies will be implemented when PWA features are added.
 */

const CACHE_NAME = 'pdf-editor-v1';
const VERSION = '1.0.0';
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/privacy.html',
    '/terms.html',
    '/manifest.json',
    '/assets/css/style.css',
    '/assets/js/main.js',
    '/assets/icons/favicon.svg',
    '/assets/icons/app-icon.svg',
];

/**
 * Service Worker Installation
 * Runs once when the service worker is first registered
 */
self.addEventListener('install', (event) => {
    // Skip waiting and take control immediately
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS))
    );
});

/**
 * Service Worker Activation
 * Runs when the service worker becomes active
 */
self.addEventListener('activate', (event) => {
    // Take control of all clients immediately
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

/**
 * Fetch Event Handler
 * Foundation for future request handling and caching
 * Currently passes all requests through to the network
 */
self.addEventListener('fetch', (event) => {
    const request = event.request;

    if (request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(request.url);
    if (requestUrl.origin !== self.location.origin) {
        return;
    }

    event.respondWith(
        fetch(request)
            .then((response) => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
                return response;
            })
            .catch(() => caches.match(request))
    );
});

/**
 * Message Handler
 * Allows communication between app and service worker
 * Useful for cache management, updates, etc.
 */
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    // Future: Handle cache operations, version checks, etc.
});
