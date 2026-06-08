/**
 * PWA — instalação no celular/desktop (o "sistema móvel").
 *
 * Captura o evento beforeinstallprompt e expõe uma API simples para a UI
 * oferecer "Instalar app". O service worker (public/sw.js) já cuida do cache
 * offline; aqui é só a instalação na tela inicial.
 */

let deferredPrompt = null;
const listeners = new Set();
function notify() { for (const fn of listeners) { try { fn(canInstall()); } catch { /* ok */ } } }

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    notify();
  });
  window.addEventListener('appinstalled', () => { deferredPrompt = null; notify(); });
}

/** Há um prompt de instalação disponível? */
export function canInstall() { return !!deferredPrompt; }

/** O app já está rodando instalado (standalone)? */
export function isStandalone() {
  if (typeof window === 'undefined') return false;
  return (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    window.navigator.standalone === true;
}

/** Assina mudanças de disponibilidade. Devolve uma função para cancelar. */
export function onInstallChange(fn) { listeners.add(fn); return () => listeners.delete(fn); }

/** Dispara o prompt nativo de instalação. */
export async function promptInstall() {
  if (!deferredPrompt) return false;
  deferredPrompt.prompt();
  let outcome = 'dismissed';
  try { ({ outcome } = await deferredPrompt.userChoice); } catch { /* ok */ }
  deferredPrompt = null;
  notify();
  return outcome === 'accepted';
}
