/**
 * /memoria — Memória do JARVIS (durável, estilo supermemory).
 *
 * Mostra e gerencia os fatos que o JARVIS guardou ("lembre que ..."), ligados
 * aos conceitos do Segundo Cérebro. Lê/escreve via src/utils/jarvis-brain.js.
 */

import { h, empty, debounce } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import {
  getMemories, addMemory, deleteMemory, clearMemories,
  searchMemories, memoryStats, conceptLabel, conceptRoute
} from '../utils/jarvis-brain.js';

function fmtDate(ts) {
  try { return new Date(ts).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
}

export function memoriaPage() {
  const page = h('div', { className: 'page-memoria' });
  let query = '';

  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'MEMÓRIA')),
      h('h1', { className: 'page-header__title' }, '🧠 Memória do JARVIS'),
      h('p', { className: 'page-header__description' },
        'O que o JARVIS guardou para lembrar entre conversas — cada fato ligado aos conceitos do ',
        h('span', { className: 'u-text-cyan' }, 'Segundo Cérebro'),
        '. No chat: ', h('span', { className: 'u-mono' }, '"lembre que ..."'), '.'))
  );

  const statsEl = h('div', { className: 'mem-stats' });
  page.appendChild(statsEl);

  /* Adicionar memória */
  const input = h('input', {
    className: 'mem-input', type: 'text',
    placeholder: 'Ex.: o operador prefere ícones de linha e o universo Warhammer40k'
  });
  const addBtn = h('button', { className: 'btn btn--primary', onclick: add }, '+ Lembrar');
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') add(); });
  page.appendChild(h('div', { className: 'mem-add' }, input, addBtn));

  /* Busca + limpar */
  const searchEl = h('input', {
    className: 'mem-input', type: 'search', placeholder: '🔎 Buscar nas memórias…',
    oninput: debounce((e) => { query = e.target.value.trim(); refresh(); }, 150)
  });
  const clearBtn = h('button', {
    className: 'btn btn--ghost btn--sm',
    onclick: () => {
      if (!getMemories().length) return;
      if (confirm('Apagar TODAS as memórias do JARVIS?')) { clearMemories(); refresh(); toast('Memória limpa', { type: 'warning' }); }
    }
  }, '🗑 Apagar tudo');
  page.appendChild(h('div', { className: 'mem-tools' }, searchEl, clearBtn));

  const listEl = h('div', { className: 'mem-list' });
  page.appendChild(listEl);

  page.appendChild(
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', marginTop: 'var(--space-md)' } },
      '🕸️ As memórias aparecem como nós no ',
      h('a', { href: '#/cerebro', className: 'u-text-cyan' }, 'Segundo Cérebro'),
      ' e dão contexto ao JARVIS junto com o ',
      h('a', { href: '#/codigo', className: 'u-text-cyan' }, 'Raio-X do Código'), '.')
  );

  function statBox(v, l) {
    return h('div', { className: 'mem-stat' },
      h('div', { className: 'mem-stat__v' }, String(v)),
      h('div', { className: 'mem-stat__l' }, l));
  }

  function chip(id) {
    const route = conceptRoute(id);
    return h('span', {
      className: 'mem-chip',
      title: route ? `Abrir ${route}` : 'Ver no Segundo Cérebro',
      onclick: () => router.navigate(route || '/cerebro')
    }, conceptLabel(id));
  }

  function card(m) {
    return h('div', { className: 'mem-card' },
      h('div', { className: 'mem-card__text' }, m.text),
      h('div', { className: 'mem-card__meta' },
        h('div', { className: 'mem-card__chips' }, ...(m.conceptIds || []).map(chip)),
        h('span', { className: 'mem-card__date u-mono u-text-muted' }, fmtDate(m.ts)),
        h('button', {
          className: 'mem-card__del', title: 'Apagar memória',
          onclick: () => { deleteMemory(m.id); refresh(); toast('Memória apagada'); }
        }, '✕')));
  }

  function add() {
    const t = input.value.trim();
    if (t.length < 3) { toast('Escreva o que devo lembrar', { type: 'warning' }); return; }
    const item = addMemory({ text: t, source: 'manual' });
    input.value = '';
    refresh();
    if (item) toast('Memorizado 🧠', { type: 'success' });
  }

  function refresh() {
    const st = memoryStats();
    empty(statsEl);
    statsEl.append(
      statBox(st.total, 'memórias'),
      statBox(Object.keys(st.byConcept).length, 'conceitos ligados'),
      statBox(getMemories().filter((m) => m.source === 'manual').length, 'manuais'));

    const items = query ? searchMemories(query, 50) : getMemories();
    empty(listEl);
    if (!items.length) {
      listEl.appendChild(h('div', { className: 'mem-empty u-text-muted' },
        query ? 'Nenhuma memória encontrada.' : 'Ainda não há memórias. Diga ao JARVIS "lembre que ..." ou adicione acima.'));
      return;
    }
    items.forEach((m) => listEl.appendChild(card(m)));
  }

  refresh();
  return page;
}
