// Keeps the app on the phone. Online: loads the latest version (and saves it). Offline or slow: uses the saved copy.
const CACHE = 'japan-v14';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png?v=3', 'icon-192.png?v=3', 'icon-512.png?v=3', 'img/1106-cat3d.jpg', 'img/1106-chrys.jpg', 'img/1106-godzilla.jpg', 'img/1106-goldengai.jpg', 'img/1106-gyoen.jpg', 'img/1106-hanazono.jpg', 'img/1106-kabuki.jpg', 'img/1106-omoide.jpg', 'img/1106-station.jpg', 'img/1106-tocho.jpg', 'img/1106-yodobashi.jpg', 'img/1107-ginza.jpg', 'img/1107-hongwanji.jpg', 'img/1107-teamlab.jpg', 'img/1107-tower.jpg', 'img/1107-tsukiji.jpg', 'img/1107-tuna.jpg', 'img/1107-zojoji.jpg', 'img/cat.jpg', 'img/ema.jpg', 'img/forest.jpg', 'img/hachiko.jpg', 'img/hills.jpg', 'img/nezuentry.jpg', 'img/nezugarden.jpg', 'img/omotesando.jpg', 'img/sake.jpg', 'img/shibuya.jpg', 'img/shrine.jpg', 'img/takeshita.jpg', 'img/torii.jpg', 'img/wine.jpg'];

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
