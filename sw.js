// Keeps the app on the phone: answers from the saved copy, refreshes it in the background when online.
const CACHE = 'japan-v3';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png?v=2', 'icon-192.png?v=2', 'icon-512.png?v=2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;
  const key = e.request.mode === 'navigate' ? './' : e.request;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const saved = await cache.match(key, {ignoreSearch: true});
    const fresh = fetch(e.request).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    }).catch(() => saved);
    if (saved) { e.waitUntil(fresh); return saved; }
    return fresh;
  }));
});
