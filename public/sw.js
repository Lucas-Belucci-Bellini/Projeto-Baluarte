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
 *   1.1.0 — primeira release pública após o salto deliberado da 1.0.0.
 *   1.1.5 — fundação V2 incremental e dashboard JARVIS atualizado.
 *   1.2.0 — migração incremental do frontend e fechamento de contratos V2.
 *   1.2.5 — distribuição do Launcher com artefatos desktop verificáveis.
 *   1.2.6 — promoção do visual JARVIS Núcleo V7 e alinhamento web/desktop.
 *   1.2.7 — marco Briefing→Evidence pelo Registry e release sincronizada.
 *   1.2.8 — piloto local Wiki Zomboid com schema e Evidence bounded.
 *   1.2.9 — observabilidade bounded de status da Evidence no piloto Wiki.
 *   1.3.0 — fila local bounded e read-only para revisão de Evidence pendente.
 *   1.3.1 — preview local bounded de retenção Evidence, sem mutação.
 *   1.3.2 — auditoria estrutural local bounded da Evidence, sem mutação.
 *   1.3.3 — integração visual do Núcleo V7 na rota /jarvis com fallback Mark XIII.
 *   1.3.4 — verificação live do V7 na rota publicada e documentação do marco.
 *   1.3.5 — composição V7 seguida diretamente pela conversa; Spotify recolhido em configuração.
 *
 * Na terceira não vai passar: `test/versao.test.js` compara este número com o
 * `package.json` e o `version.js` e reprova o CI se divergirem. */
const VERSION = 'baluarte-v1.3.5';
const STATIC_CACHE = `${VERSION}-static`;
const RUNTIME_CACHE = `${VERSION}-runtime`;

/* Os caches que ESTA versão usa. A limpeza compara por nome exato contra esta
 * lista — nunca por prefixo.
 *
 * Por quê: prefixo mente quando uma versão é prefixo da outra.
 * `baluarte-v1.0.0-rc-static`.startsWith(`baluarte-v1.0.0`) é **true**, então na
 * subida de `1.0.0-rc` para `1.0.0` os caches da rc sobreviveriam para sempre —
 * invisíveis, ocupando espaço, nunca servidos. O mesmo valeria de `v1.0` para
 * `v1.0.1`. Nome exato não tem essa ambiguidade. */
const CACHES_DESTA_VERSAO = [STATIC_CACHE, RUNTIME_CACHE];

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
        keys.filter((k) => k.startsWith('baluarte-') && !CACHES_DESTA_VERSAO.includes(k))
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
