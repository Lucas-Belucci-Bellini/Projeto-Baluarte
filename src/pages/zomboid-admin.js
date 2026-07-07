/**
 * /zomboid-admin — Administração de servidor Project Zomboid.
 *
 * Seção 1: tabela de comandos de admin (consulta rápida, com copiar).
 * Seção 2: banco de IDs de mods/veículos com BUSCA ao vivo (nome, categoria,
 *          Mod ID, Workshop ID, Spawn ID). Data-driven (`zomboid-admin.js`).
 */

import '../styles/zomboid-admin.css';
import { h, empty, normalize, debounce } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast.js';
import { PZ_COMMANDS, PZ_IDS, PZ_CATS } from '../data/zomboid-admin.js';

function copiar(texto) {
  const done = () => toast('Copiado ✓', { type: 'success' });
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto).then(done).catch(() => fallback());
  } else fallback();
  function fallback() {
    const t = document.createElement('textarea');
    t.value = texto; document.body.appendChild(t); t.select();
    try { document.execCommand('copy'); done(); } catch { /* ok */ }
    t.remove();
  }
}

/** Célula de ID: valor mono + botão copiar, ou "—" quando vazio. */
function idCell(val) {
  if (!val) return h('span', { className: 'pza-id pza-id--empty' }, '—');
  return h('span', { className: 'pza-id' },
    h('code', null, val),
    h('button', { className: 'pza-copy', title: 'Copiar', onclick: () => copiar(val) }, '⧉'));
}

export function zomboidAdminPage() {
  const page = h('div', { className: 'page-zomboid-admin' });
  const box = h('div', { className: 'pza' });
  page.appendChild(box);

  /* cabeçalho */
  box.appendChild(h('header', { className: 'pza-head' },
    h('h1', { className: 'pza-title' }, '🧟 Administração de Servidor'),
    h('p', { className: 'pza-sub' }, 'Project Zomboid — comandos de admin e banco de IDs da coleção.'),
    h('button', { className: 'pza-link', onclick: () => router.navigate('/zomboid') },
      '← Voltar à coleção')));

  /* ===== Seção 1 — Comandos ===== */
  box.appendChild(h('section', { className: 'pza-sec' },
    h('h2', { className: 'pza-sec__title' }, '⌘ Comandos de Admin'),
    h('div', { className: 'pza-tablewrap' },
      (() => {
        const table = h('table', { className: 'pza-table' },
          h('thead', null, h('tr', null,
            h('th', null, 'Comando'),
            h('th', null, 'Função'),
            h('th', null, 'Exemplo de uso'))));
        const tbody = h('tbody');
        for (const c of PZ_COMMANDS) {
          tbody.appendChild(h('tr', { className: c.danger ? 'is-danger' : '' },
            h('td', null, h('code', { className: 'pza-cmd' }, c.cmd)),
            h('td', { className: 'pza-fn' }, c.fn),
            h('td', null,
              h('span', { className: 'pza-ex' },
                h('code', null, c.ex),
                h('button', { className: 'pza-copy', title: 'Copiar exemplo', onclick: () => copiar(c.ex) }, '⧉')))));
        }
        table.appendChild(tbody);
        return table;
      })())));

  /* ===== Seção 2 — Banco de IDs ===== */
  const sec2 = h('section', { className: 'pza-sec' });
  sec2.appendChild(h('h2', { className: 'pza-sec__title' }, '🔎 Banco de IDs (mods e veículos)'));

  const input = h('input', {
    className: 'pza-search', type: 'search',
    placeholder: 'Buscar por nome, categoria ou ID…', autocomplete: 'off', 'aria-label': 'Buscar mod'
  });
  const countEl = h('span', { className: 'pza-count u-text-muted' });
  sec2.appendChild(h('div', { className: 'pza-searchbar' }, input, countEl));

  const grid = h('div', { className: 'pza-grid' });
  sec2.appendChild(grid);
  box.appendChild(sec2);

  function card(m) {
    const c = PZ_CATS[m.cat] || { label: m.cat, icon: '📦' };
    return h('div', { className: 'pza-card' },
      h('div', { className: 'pza-card__top' },
        h('span', { className: 'pza-card__name' }, m.name),
        h('span', { className: `pza-badge pza-badge--${m.cat}` }, `${c.icon} ${c.label}`)),
      h('dl', { className: 'pza-card__ids' },
        h('dt', null, 'Mod ID'), h('dd', null, idCell(m.modId)),
        h('dt', null, 'Workshop ID'), h('dd', null, idCell(m.workshopId)),
        h('dt', null, 'Spawn ID'), h('dd', null, idCell(m.spawnId))));
  }

  function render(term) {
    const t = normalize(term || '');
    const pool = !t ? PZ_IDS : PZ_IDS.filter((m) =>
      normalize(m.name).includes(t) ||
      normalize((PZ_CATS[m.cat] || {}).label || m.cat).includes(t) ||
      normalize(m.modId).includes(t) ||
      normalize(m.workshopId).includes(t) ||
      normalize(m.spawnId).includes(t));
    empty(grid);
    countEl.textContent = `${pool.length} de ${PZ_IDS.length}`;
    if (!pool.length) {
      grid.appendChild(h('p', { className: 'pza-empty u-text-muted' }, 'Nenhum resultado. Tente outro termo.'));
      return;
    }
    pool.forEach((m) => grid.appendChild(card(m)));
  }
  input.addEventListener('input', debounce((e) => render(e.target.value), 120));
  render('');

  /* nota: IDs a preencher */
  box.appendChild(h('div', { className: 'pza-note' },
    'ℹ️ Os campos de ID aparecem como “—” até serem preenchidos com os dados reais ',
    'da coleção (Mod ID / Workshop ID / Spawn ID). A busca já funciona por nome e categoria; ',
    'assim que a lista com os IDs entrar em ',
    h('code', null, 'src/data/zomboid-admin.js'),
    ', os cards mostram tudo — inclusive o valor pronto pra copiar no ',
    h('code', null, '/addvehicle'), '.'));

  return page;
}
