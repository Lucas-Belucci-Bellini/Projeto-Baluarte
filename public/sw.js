/*
 * Service Worker — skeleton
 * Ativado de fato apenas na Fase 5 (PWA offline-first).
 * Hoje só responde com network-first sem cache para não bloquear nada.
 */

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // No-op pass-through. Cache real chega na Fase 5.
});
