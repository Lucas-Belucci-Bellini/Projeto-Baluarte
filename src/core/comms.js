/**
 * Global Comms — a "Rede Neural" do Baluarte (0008 · Banco de Dados Universal).
 *
 * Chat global entre todos os usuários conectados: histórico pela REST
 * (`global_comms`, leitura pública) e entrega INSTANTÂNEA por WebSocket
 * (Supabase Realtime via `realtime.js`) — sem recarregar página, sem polling.
 *
 * Escrever exige login (RLS: só como si mesmo) e o banco impõe anti-flood
 * (1 msg/2s por usuário, trigger `comms_rate_limit`). Deslogado = só leitura.
 *
 * Uso:
 *   const chat = openComms({
 *     onMessage: (m) => render(m),               // cada msg nova, ao vivo
 *     onStatus:  (s) => dot.classList.toggle('on', s.connected)
 *   });
 *   const historico = await chat.history();       // últimas 50 (asc p/ render)
 *   await chat.send('olá, rede!');                // precisa estar logado
 *   chat.close();
 */

import { dbFetch } from './supabase.js';
import { getAccessToken, currentUser, isLoggedIn } from './supabase-auth.js';
import { subscribeTable } from './realtime.js';

export function openComms({ onMessage, onStatus } = {}) {
  const seen = new Set();   // dedupe: o próprio insert também chega pelo socket

  const sub = subscribeTable(
    { table: 'global_comms', event: 'INSERT' },
    (row) => {
      if (seen.has(row.id)) return;
      seen.add(row.id);
      onMessage && onMessage(row);
    },
    { onStatus }
  );

  return {
    /** Últimas `limit` mensagens, em ordem cronológica (pra render direto). */
    async history(limit = 50) {
      const rows = await dbFetch(`global_comms?select=*&order=created_at.desc&limit=${limit}`);
      rows.forEach((r) => seen.add(r.id));
      return rows.reverse();
    },

    /** Envia uma mensagem como o usuário logado. Lança se deslogado/flood. */
    async send(text) {
      const clean = String(text || '').trim().slice(0, 500);
      if (!clean) return null;
      if (!isLoggedIn()) throw new Error('faça login para falar na rede');
      const token = await getAccessToken();
      const user = currentUser();
      const author = (user.user_metadata && (user.user_metadata.name || user.user_metadata.full_name))
        || (user.email ? user.email.split('@')[0] : 'anônimo');
      const rows = await dbFetch('global_comms', {
        method: 'POST',
        token,
        prefer: 'return=representation',
        body: { user_id: user.id, author: String(author).slice(0, 40), text: clean }
      });
      const row = rows && rows[0];
      if (row) { seen.add(row.id); onMessage && onMessage(row); }
      return row;
    },

    close() { sub.close(); }
  };
}
