const CACHE_NAME = 'sukibot-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/avatar.vrm', // replace with your avatar filename
  '/styles.css'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});
