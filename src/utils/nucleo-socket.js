/**
 * Ponte AO VIVO do Núcleo (Fase D do #316) — o cliente que liga o front à
 * ponte Java (`backend-java/`, WebSocket `/ws/nucleo`). Cada `JarvisEvent`
 * `{type,source,payload,ts}` que chega (telemetria, voz, biometria do app)
 * é publicado no event bus como `nucleo:event` — e o cockpit faz a cena do
 * jarvis-nucleo **pulsar/reagir** de verdade.
 *
 * OPT-IN e best-effort: só conecta se houver uma URL configurada
 * (`storage 'nucleo:wsUrl'`, ex.: `ws://localhost:8080` em dev, `wss://host`
 * em prod). Sem URL, fica quieto (nada de reconectar num servidor que não
 * existe). Reconexão com backoff. Também expõe `simulateNucleoEvent()` pra
 * demonstrar a reação sem o backend no ar.
 */

import { bus } from '../core/events.js';
import { storage } from '../core/storage.js';

const URL_KEY = 'nucleo:wsUrl';

let ws = null;
let retry = 0;
let stopped = false;
let curUrl = '';

export function getNucleoUrl() { return storage.get(URL_KEY, '') || ''; }

/** Define (e persiste) a URL do backend; reconecta na hora. '' desliga. */
export function setNucleoUrl(url) {
  storage.set(URL_KEY, url || '');
  disconnectNucleo();
  if (url) connectNucleo();
  return url || '';
}

function emitStatus(connected, detail) {
  bus.emit('nucleo:status', { connected, url: curUrl, detail: detail || '' });
}

/** Abre a conexão (se houver URL). Idempotente. */
export function connectNucleo() {
  const url = getNucleoUrl();
  if (!url) return null;
  if (ws && curUrl === url && (ws.readyState === 0 || ws.readyState === 1)) return ws;
  stopped = false; curUrl = url;
  try { ws = new WebSocket(url.replace(/\/+$/, '') + '/ws/nucleo'); }
  catch { scheduleRetry(); return null; }

  ws.onopen = () => { retry = 0; emitStatus(true); };
  ws.onmessage = (e) => {
    let ev; try { ev = JSON.parse(e.data); } catch { return; }
    if (ev && ev.type) bus.emit('nucleo:event', ev);
  };
  ws.onclose = () => { emitStatus(false, 'fechado'); if (!stopped) scheduleRetry(); };
  ws.onerror = () => { try { ws.close(); } catch { /* ok */ } };
  return ws;
}

function scheduleRetry() {
  if (stopped) return;
  const delay = Math.min(1000 * Math.pow(2, retry++), 15000);
  setTimeout(() => { if (!stopped && getNucleoUrl()) connectNucleo(); }, delay);
}

/** Fecha e para de reconectar. */
export function disconnectNucleo() {
  stopped = true; retry = 0;
  if (ws) { try { ws.onclose = null; ws.close(); } catch { /* ok */ } ws = null; }
  emitStatus(false, 'desligado');
}

/** Liga a ponte no boot/mount — só age se uma URL estiver configurada. */
export function initNucleoLink() {
  if (getNucleoUrl()) connectNucleo();
}

/**
 * Injeta um evento como se viesse do backend — pra demonstrar a reação da cena
 * sem o serviço no ar. `type`: 'telemetry' | 'biometric' | 'command' | 'system'.
 */
export function simulateNucleoEvent(type = 'telemetry', payload = null) {
  const demo = {
    telemetry: { deviceId: 'demo', metrics: { battery: 0.5 + Math.random() * 0.5 } },
    biometric: { deviceId: 'demo', heartRate: 60 + Math.floor(Math.random() * 60) },
    command: { text: 'abrir arsenal', source: 'demo' },
    system: 'ping'
  };
  bus.emit('nucleo:event', {
    type, source: 'demo',
    payload: payload != null ? payload : demo[type] || null,
    ts: Date.now()
  });
}
