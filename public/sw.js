// Service worker: shows /offline/ instead of the browser's error page when there is no connection.
// Pages always come from the network first, so a saved copy is only used offline.
// Placeholders are filled in by scripts/postbuild.mjs.
const VERSION = '__VERSION__';
const BASE = '__BASE__';
const PRECACHE = ['__PRECACHE__'];
const OFFLINE = BASE + 'offline/';
const CACHE = 'jnt-' + VERSION;

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('jnt-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Only plain GETs for this site. The quote form (POST), Maps, Turnstile and other sites pass straight through.
  if (req.method !== 'GET' || url.origin !== location.origin || !url.pathname.startsWith(BASE)) return;

  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match(OFFLINE))),
    );
    return;
  }

  // Fingerprinted build files never change: use the saved copy when there is one.
  if (url.pathname.startsWith(BASE + '_astro/')) {
    event.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })),
    );
    return;
  }

  // Everything else (scripts, logo, favicon): network first, saved copy offline.
  event.respondWith(fetch(req).catch(() => caches.match(req)));
});
