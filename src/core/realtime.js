/**
 * Supabase Realtime SEM SDK (0008 · Banco de Dados Universal).
 *
 * Cliente WebSocket mínimo do protocolo Phoenix que o Realtime usa: entra num
 * canal com config `postgres_changes` e entrega cada INSERT/UPDATE/DELETE da
 * tabela ao callback — push do servidor, ZERO polling (nada de metralhar a
 * REST com requisições repetidas). ~90 linhas, dentro da regra "web = leve".
 *
 * Uso:
 *   const sub = subscribeTable({ table: 'global_comms', event: 'INSERT' },
 *     (row) => console.log('nova mensagem', row));
 *   …
 *   sub.close();
 *
 * Reconexão com backoff; heartbeat de 25s (o servidor derruba socket mudo).
 */

import { supabaseUrl, supabaseAnonKey } from './supabase.js';

const HEARTBEAT_MS = 25000;

export function subscribeTable({ schema = 'public', table, event = 'INSERT' }, onRow, { onStatus } = {}) {
  let ws = null;
  let refCount = 0;
  let hbTimer = null;
  let retry = 0;
  let closed = false;
  const topic = `realtime:public:${table}`;

  const wsUrl = supabaseUrl().replace(/^http/, 'ws')
    + `/realtime/v1/websocket?apikey=${encodeURIComponent(supabaseAnonKey())}&vsn=1.0.0`;

  const send = (msg) => { try { ws && ws.readyState === 1 && ws.send(JSON.stringify(msg)); } catch { /* ok */ } };
  const nextRef = () => String(++refCount);

  function connect() {
    if (closed) return;
    try { ws = new WebSocket(wsUrl); } catch { scheduleRetry(); return; }

    ws.onopen = () => {
      retry = 0;
      /* entra no canal pedindo o stream de mudanças da tabela */
      send({
        topic,
        event: 'phx_join',
        ref: nextRef(),
        payload: {
          config: {
            broadcast: { self: false },
            presence: { key: '' },
            postgres_changes: [{ event, schema, table }]
          },
          access_token: supabaseAnonKey()
        }
      });
      /* heartbeat: mantém o socket vivo */
      hbTimer = setInterval(() =>
        send({ topic: 'phoenix', event: 'heartbeat', ref: nextRef(), payload: {} }), HEARTBEAT_MS);
      onStatus && onStatus({ connected: true });
    };

    ws.onmessage = (e) => {
      let msg; try { msg = JSON.parse(e.data); } catch { return; }
      if (msg.topic !== topic) return;
      /* formato do Realtime: payload.data = {type, record, old_record, …} */
      if (msg.event === 'postgres_changes' && msg.payload && msg.payload.data) {
        const d = msg.payload.data;
        if (d.record) onRow(d.record, d);
      }
    };

    ws.onclose = () => {
      clearInterval(hbTimer);
      onStatus && onStatus({ connected: false });
      if (!closed) scheduleRetry();
    };
    ws.onerror = () => { try { ws.close(); } catch { /* ok */ } };
  }

  function scheduleRetry() {
    const delay = Math.min(1000 * Math.pow(2, retry++), 15000);
    setTimeout(() => { if (!closed) connect(); }, delay);
  }

  connect();

  return {
    close() {
      closed = true;
      clearInterval(hbTimer);
      try { ws && ws.close(); } catch { /* ok */ }
    }
  };
}
