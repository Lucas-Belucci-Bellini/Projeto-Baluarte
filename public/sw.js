/*
 * Service Worker — Baluarte
 *
 * Estratégia: stale-while-revalidate para assets, network-first para
 * navegação. A VERSION abaixo muda a cada release — ao mudar, o
 * navegador instala o SW novo, que limpa os caches das versões antigas.
 * Isso evita servir assets velhos após um deploy (ex.: no Vercel).
 */

/* ⚠️ Este arquivo é servido CRU (não passa pelo bundler), então não dá para
 * importar `src/data/version.js`. A VERSION abaixo é uma cópia manual e
 * precisa mudar junto — é a única forma.
 *
 * Isso já falhou duas vezes:
 *   0.7.3 — ficou parada na v0.5.0 por DUAS releases; quem visitou naquela
 *           época carregava cache velho (o "3D não funciona" mesmo com o site
 *           novo no ar).
 *   1.0.0-rc — ficou em v0.9.1 enquanto o site já dizia 2.0.0.
 *
 * Na terceira não vai passar: `test/versao.test.js` compara este número com o
 * `package.json` e o `version.js` e reprova o CI se divergirem. */
const VERSION = 'baluarte-v1.0.0-rc';
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

  /* Modelos 3D e o decoder DRACO vão SEMPRE na rede: são binários grandes
     (estourariam o quota à toa) e o stale-while-revalidate podia entregar
     modelo/decoder de release velha — outra face do "3D não funciona". */
  if (url.pathname.startsWith('/modelos-3d/')) return;

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
