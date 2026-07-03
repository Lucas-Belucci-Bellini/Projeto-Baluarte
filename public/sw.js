/*
 * Service Worker — Baluarte (v2.0.0)
 *
 * Estratégia: stale-while-revalidate para assets, network-first para
 * navegação. A VERSION abaixo muda a cada release — ao mudar, o
 * navegador instala o SW novo, que limpa os caches das versões antigas.
 * Isso evita servir assets velhos após um deploy (ex.: no Vercel).
 */

const VERSION = 'baluarte-v0.4.0';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

/* Assets críticos para o app shell */
const CORE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(CORE_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k.startsWith('baluarte-') && !k.startsWith(VERSION))
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  /* Navegação: tenta rede primeiro, fallback offline.html */
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match('/offline.html').then((r) => r || caches.match('/'))
      )
    );
    return;
  }

  /* Assets com HASH no nome (/assets/*.js|css do Vite) são IMUTÁVEIS: cache-first
     puro — 2ª carga nem toca a rede (perf v0.4.0). Deploy novo = hash novo =
     baixa 1x. */
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response && response.status === 200 && response.type === 'basic') {
          cache.put(request, response.clone());
        }
        return response;
      })
    );
    return;
  }

  /* Stale-while-revalidate pro resto (fontes, imagens, dados) */
  event.respondWith(
    caches.open(RUNTIME_CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          cache.put(request, response.clone());
        }
        return response;
      }).catch(() => cached);
      return cached || networkFetch;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data?.type === 'CLEAR_CACHE') {
    caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
  }
});
