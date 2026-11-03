// Keeps the app on the phone. Online: loads the latest version (and saves it). Offline or slow: uses the saved copy.
const CACHE = 'japan-v4';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png?v=2', 'icon-192.png?v=2', 'icon-512.png?v=2'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, {cache: 'reload'})))).then(() => self.skipWaiting()));
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
    const saved = await cache.match(key, {ignoreSearch: e.request.mode === 'navigate'});
    const fresh = fetch(e.request, {cache: 'no-cache'}).then(res => {
      if (res.ok) cache.put(key, res.clone());
      return res;
    });
    if (!saved) return fresh;
    // Give the network 4 seconds; otherwise show the saved copy right away.
    const timeout = new Promise(r => setTimeout(() => r(saved), 4000));
    return Promise.race([fresh.catch(() => saved), timeout]);
  }));
});
