const CACHE = 'schengen-v1';
const STATIC = ['./', 'manifest.json', 'favicon.ico', 'logo192.png', 'logo512.png'];
const scope = new URL(self.registration.scope);

const assetsOf = (html) =>
  [...html.matchAll(/(?:src|href)="\.?\/?(assets\/[^"]+)"/g)].map((m) => m[1]);

const sync = async (html) => {
  const cache = await caches.open(CACHE);
  const keep = new Set([...STATIC, ...assetsOf(html)].map((p) => new URL(p, scope).href));
  await Promise.all(
    [...keep].map(async (url) => (await cache.match(url)) ?? cache.add(url).catch(() => {})),
  );
  for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
};

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const res = await fetch(scope.href, { cache: 'no-store' });
      const cache = await caches.open(CACHE);
      await cache.put(scope.href, res.clone());
      await sync(await res.text());
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== scope.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const res = await fetch(request);
          if (res.ok) {
            const cache = await caches.open(CACHE);
            await cache.put(scope.href, res.clone());
            event.waitUntil(res.clone().text().then(sync));
          }
          return res;
        } catch {
          return (await caches.match(scope.href)) ?? Response.error();
        }
      })(),
    );
    return;
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request);
      if (cached) return cached;
      const res = await fetch(request);
      if (res.ok && url.pathname.includes('/assets/')) {
        const cache = await caches.open(CACHE);
        await cache.put(request, res.clone());
      }
      return res;
    })(),
  );
});
