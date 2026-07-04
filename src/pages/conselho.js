/**
 * /conselho — Conselho de IAs (várias IAs trabalhando juntas).
 *
 * Faz a mesma pergunta a vários membros (JARVIS Local, Gemini e o modelo do
 * Navegador/Hermes se carregado), todos compartilhando a memória do JARVIS, e
 * mostra cada resposta + um consenso sintetizado. Lê src/utils/jarvis-council.js.
 */

import '../styles/conselho.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { runCouncil } from '../utils/jarvis-council.js';
import { getLoadedModel } from '../utils/jarvis-webllm.js';

export function conselhoPage() {
  const page = h('div', { className: 'page-conselho' });
  let busy = false;

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CONSELHO')),
      h('h1', { className: 'page-header__title' }, '⚖️ Conselho de IAs'),
      h('p', { className: 'page-header__description' },
        'Várias IAs respondem ', h('span', { className: 'u-text-cyan' }, 'juntas'),
        ' — todas compartilhando a memória do JARVIS — e um moderador sintetiza o ',
        h('span', { className: 'u-text-cyan' }, 'consenso'), '.'))
  );

  const input = h('textarea', { className: 'cons-input', rows: 2, placeholder: 'Pergunte ao conselho… (Enter envia, Shift+Enter quebra linha)' });
  const askBtn = h('button', { className: 'btn btn--primary', onclick: () => ask() }, '⚖️ Convocar conselho');
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); ask(); } });
  page.appendChild(h('div', { className: 'cons-ask' }, input, askBtn));

  const statusEl = h('div', { className: 'cons-status u-text-muted', style: { display: 'none' } });
  page.appendChild(statusEl);

  const membersEl = h('div', { className: 'cons-members' });
  page.appendChild(membersEl);

  const consensusEl = h('div', { className: 'cons-consensus', style: { display: 'none' } });
  page.appendChild(consensusEl);

  page.appendChild(
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' } },
      '🧠 O consenso entra na ', h('a', { href: '#/memoria', className: 'u-text-cyan' }, 'memória'),
      ' — assim o conselho também alimenta o cérebro comum. Para somar o modelo do navegador (Hermes), carregue-o antes no ',
      h('a', { href: '#/jarvis', className: 'u-text-cyan' }, 'JARVIS'), ' (modo Navegador).')
  );

  function memberCard(m) {
    return h('div', { className: 'cons-card' + (m.ok ? '' : ' is-fail') },
      h('div', { className: 'cons-card__name' },
        h('span', { className: 'cons-card__dot' }), m.name),
      h('div', { className: 'cons-card__text' }, m.text || ''));
  }

  async function ask() {
    const q = input.value.trim();
    if (q.length < 3) { toast('Escreva a pergunta', { type: 'warning' }); return; }
    if (busy) return;
    busy = true; askBtn.disabled = true; askBtn.textContent = '⏳ Deliberando…';
    empty(membersEl); empty(consensusEl); consensusEl.style.display = 'none';
    const loaded = getLoadedModel();
    statusEl.style.display = 'block';
    statusEl.textContent = 'Convocando: JARVIS Local · Gemini' + (loaded ? ' · Navegador (' + loaded.split('-')[0] + ')' : '') + '…';
    try {
      const { consensus, synthesizedBy } = await runCouncil(q, {
        onMember: (m) => { membersEl.appendChild(memberCard(m)); }
      });
      consensusEl.append(
        h('div', { className: 'cons-consensus__title' }, '⚖️ Consenso do conselho' + (synthesizedBy ? ' · por ' + synthesizedBy : '')),
        h('div', { className: 'cons-consensus__text' }, consensus));
      consensusEl.style.display = 'block';
      statusEl.style.display = 'none';
      toast('Conselho concluído', { type: 'success' });
    } catch (e) {
      console.error('[conselho]', e);
      statusEl.textContent = '⚠ Falha ao convocar o conselho. Tente novamente.';
      toast('Falha no conselho', { type: 'danger' });
    } finally {
      busy = false; askBtn.disabled = false; askBtn.textContent = '⚖️ Convocar conselho';
    }
  }

  return page;
}
