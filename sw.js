// Keeps the app on the phone. Online: loads the latest version (and saves it). Offline or slow: uses the saved copy.
const CACHE = 'japan-v25';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png?v=3', 'icon-192.png?v=3', 'icon-512.png?v=3', 'img/1106-cat3d.jpg', 'img/1106-chrys.jpg', 'img/1106-godzilla.jpg', 'img/1106-goldengai.jpg', 'img/1106-gyoen.jpg', 'img/1106-hanazono.jpg', 'img/1106-kabuki.jpg', 'img/1106-omoide.jpg', 'img/1106-station.jpg', 'img/1106-tocho.jpg', 'img/1106-yodobashi.jpg', 'img/1107-ginza.jpg', 'img/1107-hongwanji.jpg', 'img/1107-teamlab.jpg', 'img/1107-tower.jpg', 'img/1107-tsukiji.jpg', 'img/1107-tuna.jpg', 'img/1107-zojoji.jpg', 'img/1108-hakone.jpg', 'img/1108-oam.jpg', 'img/1108-symph.jpg', 'img/1108-tokyosta.jpg', 'img/1108-tomei.jpg', 'img/1108-yukata.jpg', 'img/1108-yunessun.jpg', 'img/1109-amazake.jpg', 'img/1109-eggs.jpg', 'img/1109-lake.jpg', 'img/1109-sekisho.jpg', 'img/1109-ship.jpg', 'img/1109-shrine.jpg', 'img/1109-torii.jpg', 'img/1110-alps.jpg', 'img/1110-castle.jpg', 'img/1110-fuji.jpg', 'img/1110-hakone.jpg', 'img/1110-nakamachi.jpg', 'img/1110-onsen.jpg', 'img/1110-soba.jpg', 'img/1111-bus.jpg', 'img/1111-hidabeef.jpg', 'img/1111-hidanosato.jpg', 'img/1111-hirayu.jpg', 'img/1111-kappa.jpg', 'img/1111-kappa2.jpg', 'img/1111-ramen.jpg', 'img/1111-sanmachi.jpg', 'img/1111-sarubobo.jpg', 'img/1111-shinhotaka.jpg', 'img/1111-sugidama.jpg', 'img/1111-taisho.jpg', 'img/1112-bridge.jpg', 'img/1112-dango.jpg', 'img/1112-gassho.jpg', 'img/1112-market.jpg', 'img/1112-sanmachi.jpg', 'img/1112-view.jpg', 'img/1113-castle.jpg', 'img/1113-chaya.jpg', 'img/1113-crab.jpg', 'img/1113-goldice.jpg', 'img/1113-kenrokuen.jpg', 'img/1113-kotoji.jpg', 'img/1113-museum21.jpg', 'img/1113-nomura.jpg', 'img/1113-oden.jpg', 'img/1113-omicho.jpg', 'img/1113-suzuki.jpg', 'img/1114-biwa.jpg', 'img/1114-kamo.jpg', 'img/1114-kyotosta.jpg', 'img/1114-pontocho.jpg', 'img/1114-taxi.jpg', 'img/1116-fox.jpg', 'img/1116-gion.jpg', 'img/1116-inari.jpg', 'img/1116-kiyomizu.jpg', 'img/1116-sannenzaka.jpg', 'img/1116-tofukuji.jpg', 'img/1116-yasaka.jpg', 'img/1117-bamboo.jpg', 'img/1117-gioji.jpg', 'img/1117-monkey.jpg', 'img/1117-tenryuji.jpg', 'img/1117-togetsukyo.jpg', 'img/1117-torokko.jpg', 'img/cat.jpg', 'img/ema.jpg', 'img/forest.jpg', 'img/hachiko.jpg', 'img/hills.jpg', 'img/nezuentry.jpg', 'img/nezugarden.jpg', 'img/omotesando.jpg', 'img/sake.jpg', 'img/shibuya.jpg', 'img/shrine.jpg', 'img/takeshita.jpg', 'img/torii.jpg', 'img/wine.jpg'];

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
