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
const TOKEN_KEY = 'nucleo:wsToken';

let ws = null;
let retry = 0;
let stopped = false;
let curUrl = '';

export function getNucleoUrl() { return storage.get(URL_KEY, '') || ''; }

/** Token da ponte (Fase D · #316): quando o backend Java sobe com NUCLEO_TOKEN,
 * o handshake do WS exige `?token=`. Vazio = backend aberto (dev). */
export function getNucleoToken() { return storage.get(TOKEN_KEY, '') || ''; }
export function setNucleoToken(tok) {
  storage.set(TOKEN_KEY, String(tok || '').trim());
  if (getNucleoUrl()) { disconnectNucleo(); connectNucleo(); }   // reconecta com o token novo
  return getNucleoToken();
}

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
  const tok = getNucleoToken();
  try {
    ws = new WebSocket(url.replace(/\/+$/, '') + '/ws/nucleo' + (tok ? `?token=${encodeURIComponent(tok)}` : ''));
  }
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

/* ===== Ponte SEM servidor (v0.5.0 #340): Supabase Realtime =====
 * A função Vercel /api/nucleo grava eventos em `nucleo_events` e o Realtime
 * empurra pra cá — mesmo shape de JarvisEvent. É assim que o agente de VOZ
 * (ElevenLabs) comanda o Núcleo ao vivo, sem o backend Java no ar. */
let supaSub = null;
function connectSupabaseBridge() {
  if (supaSub) return;
  Promise.all([import('../core/realtime.js'), import('../core/supabase.js')])
    .then(([rt, sb]) => {
      if (supaSub || !sb.supabaseConfigured()) return;
      supaSub = rt.subscribeTable(
        { table: 'nucleo_events', event: 'INSERT' },
        (row) => bus.emit('nucleo:event', {
          type: row.type, source: row.source, payload: row.payload, ts: row.created_at
        }),
        { onStatus: (s) => { if (s.connected) emitStatus(true, 'supabase'); } }
      );
    })
    .catch(() => { /* ponte é best-effort */ });
}

/** Liga as pontes no mount: Supabase Realtime (sempre que configurado) +
 *  WebSocket do backend Java (opt-in por URL, como antes). */
export function initNucleoLink() {
  connectSupabaseBridge();
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
    command: { text: 'mostrar memória', source: 'demo' },
    system: 'ping'
  };
  bus.emit('nucleo:event', {
    type, source: 'demo',
    payload: payload != null ? payload : demo[type] || null,
    ts: Date.now()
  });
}
