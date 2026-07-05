/**
 * /comms — Rede Neural (0008 · Banco de Dados Universal).
 *
 * Chat global entre todos os usuários conectados ao Baluarte: histórico pela
 * REST e mensagens novas chegando AO VIVO pelo WebSocket do Supabase Realtime
 * (`src/core/comms.js` + `realtime.js`) — sem recarregar, sem polling.
 *
 * Deslogado = só leitura (com CTA de login Google). Logado = fala como si
 * mesmo (RLS garante o autor; anti-flood de 1 msg/2s vem do banco).
 */

import '../styles/comms.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { buildImmersiveHero } from '../utils/immersive.js';
import { openComms } from '../core/comms.js';
import { supabaseConfigured } from '../core/supabase.js';
import { isLoggedIn, currentUser, signInWithGoogle, onAuthChange } from '../core/supabase-auth.js';

export function commsPage() {
  const page = h('div', { className: 'page-comms' });

  page.appendChild(buildImmersiveHero({
    kicker: 'BALUARTE · COMUNICAÇÕES',
    title: 'Rede Neural',
    sub: 'CHAT GLOBAL · TEMPO REAL',
    variant: 'reactor',
    desc: [
      'Canal aberto entre todos os operadores conectados — mensagens chegam ',
      h('span', { className: 'u-text-cyan' }, 'instantaneamente'),
      ' pela ponte Realtime, sem recarregar a página.'
    ],
    hudLeft: '📡 COMMS',
    hudRight: 'AO VIVO'
  }));

  const box = h('div', { className: 'comms' });
  page.appendChild(box);

  if (!supabaseConfigured()) {
    box.appendChild(h('p', { className: 'comms__empty' }, 'Backend de dados não configurado neste ambiente.'));
    return page;
  }

  /* ===== status da ponte ===== */
  const dot = h('span', { className: 'comms__dot' });
  box.appendChild(h('div', { className: 'comms__status' }, dot,
    h('span', null, 'PONTE REALTIME')));

  /* ===== feed ===== */
  const feed = h('div', { className: 'comms__feed', role: 'log', 'aria-live': 'polite' },
    h('p', { className: 'comms__empty' }, 'Sintonizando a rede…'));
  box.appendChild(feed);

  const me = () => (isLoggedIn() && currentUser()) ? currentUser().id : null;

  function msgEl(m) {
    const own = m.user_id === me();
    const when = new Date(m.created_at);
    return h('div', { className: `comms__msg${own ? ' comms__msg--own' : ''}` },
      h('span', { className: 'comms__author' }, m.author),
      h('span', { className: 'comms__text' }, m.text),
      h('span', { className: 'comms__time' },
        when.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })));
  }
  function append(m) {
    const stick = feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 40;
    feed.appendChild(msgEl(m));
    while (feed.children.length > 200) feed.removeChild(feed.firstChild);
    if (stick) feed.scrollTop = feed.scrollHeight;
  }

  const chat = openComms({
    onMessage: append,
    onStatus: (s) => dot.classList.toggle('is-on', !!s.connected)
  });

  /* histórico com teto de 8s: rede pendurada (mobile ruim) não deixa o
   * "Sintonizando…" eterno — mostra o aviso e as msgs ao vivo seguem chegando */
  let histOk = false;
  chat.history(50).then((rows) => {
    histOk = true;
    empty(feed);
    if (!rows.length) feed.appendChild(h('p', { className: 'comms__empty' }, 'Rede silenciosa. Seja a primeira voz.'));
    rows.forEach(append);
    feed.scrollTop = feed.scrollHeight;
  }).catch(() => {
    histOk = true;
    empty(feed);
    feed.appendChild(h('p', { className: 'comms__empty' }, 'Não deu pra carregar o histórico agora.'));
  });
  setTimeout(() => {
    if (histOk || !document.contains(feed)) return;
    empty(feed);
    feed.appendChild(h('p', { className: 'comms__empty' },
      'Histórico demorando… as mensagens novas chegam ao vivo assim que a ponte conectar.'));
  }, 8000);

  /* ===== dock: enviar (logado) ou CTA de login ===== */
  const dockHost = h('div', null);
  box.appendChild(dockHost);

  function renderDock() {
    empty(dockHost);
    if (isLoggedIn()) {
      const input = h('input', {
        className: 'input comms__input',
        placeholder: 'Transmitir para a rede…',
        maxlength: '500', autocomplete: 'off'
      });
      const sendBtn = h('button', { className: 'btn btn--primary' }, '📡 Enviar');
      const form = h('form', {
        className: 'comms__dock',
        onsubmit: async (e) => {
          e.preventDefault();
          const text = input.value.trim();
          if (!text) return;
          sendBtn.disabled = true;
          try { await chat.send(text); input.value = ''; }
          catch (err) {
            toast(/rate limit/i.test(err.message) ? 'Calma, soldado: 1 mensagem a cada 2s.' : err.message,
              { type: 'warning' });
          }
          finally { sendBtn.disabled = false; input.focus(); }
        }
      }, input, sendBtn);
      dockHost.appendChild(form);
    } else {
      dockHost.appendChild(h('div', { className: 'comms__login' },
        h('span', null, 'A rede é aberta pra leitura. Pra transmitir, identifique-se:'),
        h('button', { className: 'btn btn--sm', onclick: () => signInWithGoogle() }, 'Entrar com Google')));
    }
  }
  renderDock();
  const offAuth = onAuthChange(renderDock);

  /* limpeza: fecha o socket ao sair da rota */
  if (typeof MutationObserver !== 'undefined') {
    const mo = new MutationObserver(() => {
      if (!document.contains(page)) { chat.close(); offAuth(); mo.disconnect(); }
    });
    mo.observe(document.body, { childList: true, subtree: true });
  }

  return page;
}
