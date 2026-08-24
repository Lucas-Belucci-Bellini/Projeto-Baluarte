import '../styles/zomboid-admin.css';
import { h, empty, normalize, debounce } from '../utils/helpers.js';
import { router } from '../core/router.js';
import { toast } from '../utils/toast';
import { PZ_COMMANDS, PZ_IDS, PZ_CATS } from '../data/zomboid-admin.js';
import type { PzId, PzCategory } from '../data/zomboid-admin.js';

function copiar(texto: string): void {
  const done = (): void => toast('Copiado ✓', { type: 'success' });
  const fallback = (): void => { const textarea = document.createElement('textarea'); textarea.value = texto; document.body.appendChild(textarea); textarea.select(); try { document.execCommand('copy'); done(); } catch { /* navegador sem suporte */ } textarea.remove(); };
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(texto).then(done).catch(fallback); else fallback();
}
function idCell(value: string): HTMLSpanElement { if (!value) return h('span', { className: 'pza-id pza-id--empty' }, '—'); return h('span', { className: 'pza-id' }, h('code', null, value), h('button', { className: 'pza-copy', title: 'Copiar', onclick: (): void => copiar(value) }, '⧉')); }
function categoryView(item: PzId): PzCategory { return PZ_CATS[item.cat] ?? { label: item.cat, icon: '📦' }; }

export function zomboidAdminPage(): HTMLDivElement {
  const page = h('div', { className: 'page-zomboid-admin' });
  const box = h('div', { className: 'pza' }); page.appendChild(box);
  box.appendChild(h('header', { className: 'pza-head' }, h('h1', { className: 'pza-title' }, '🧟 Administração de Servidor'), h('p', { className: 'pza-sub' }, 'Project Zomboid — comandos de admin e banco de IDs da coleção.'), h('button', { className: 'pza-link', onclick: (): void => router.navigate('/zomboid') }, '← Voltar à coleção')));
  const commandsTable = h('table', { className: 'pza-table' }, h('thead', null, h('tr', null, h('th', null, 'Comando'), h('th', null, 'Função'), h('th', null, 'Exemplo de uso'))));
  const commandsBody = h('tbody');
  for (const command of PZ_COMMANDS) commandsBody.appendChild(h('tr', { className: command.danger ? 'is-danger' : '' }, h('td', null, h('code', { className: 'pza-cmd' }, command.cmd)), h('td', { className: 'pza-fn' }, command.fn), h('td', null, h('span', { className: 'pza-ex' }, h('code', null, command.ex), h('button', { className: 'pza-copy', title: 'Copiar exemplo', onclick: (): void => copiar(command.ex) }, '⧉')))));
  commandsTable.appendChild(commandsBody);
  box.appendChild(h('section', { className: 'pza-sec' }, h('h2', { className: 'pza-sec__title' }, '⌘ Comandos de Admin'), h('div', { className: 'pza-tablewrap' }, commandsTable)));
  const idsSection = h('section', { className: 'pza-sec' }); idsSection.appendChild(h('h2', { className: 'pza-sec__title' }, '🔎 Banco de IDs (mods e veículos)'));
  const input = h('input', { className: 'pza-search', type: 'search', placeholder: 'Buscar por nome, categoria ou ID…', autocomplete: 'off', 'aria-label': 'Buscar mod' });
  const countEl = h('span', { className: 'pza-count u-text-muted' }); idsSection.appendChild(h('div', { className: 'pza-searchbar' }, input, countEl));
  const grid = h('div', { className: 'pza-grid' }); idsSection.appendChild(grid); box.appendChild(idsSection);
  const card = (item: PzId): HTMLDivElement => { const category = categoryView(item); return h('div', { className: 'pza-card' }, h('div', { className: 'pza-card__top' }, h('span', { className: 'pza-card__name' }, item.name), h('span', { className: `pza-badge pza-badge--${item.cat}` }, `${category.icon} ${category.label}`)), h('dl', { className: 'pza-card__ids' }, h('dt', null, 'Mod ID'), h('dd', null, idCell(item.modId)), h('dt', null, 'Workshop ID'), h('dd', null, idCell(item.workshopId)), h('dt', null, 'Spawn ID'), h('dd', null, idCell(item.spawnId)))); };
  const render = (term: string): void => { const normalized = normalize(term); const pool = !normalized ? PZ_IDS : PZ_IDS.filter((item) => normalize(item.name).includes(normalized) || normalize(categoryView(item).label).includes(normalized) || normalize(item.modId).includes(normalized) || normalize(item.workshopId).includes(normalized) || normalize(item.spawnId).includes(normalized)); empty(grid); countEl.textContent = `${pool.length} de ${PZ_IDS.length}`; if (!pool.length) { grid.appendChild(h('p', { className: 'pza-empty u-text-muted' }, 'Nenhum resultado. Tente outro termo.')); return; } pool.forEach((item) => grid.appendChild(card(item))); };
  input.addEventListener('input', debounce((event: Event): void => { if (event.target instanceof HTMLInputElement) render(event.target.value); }, 120)); render('');
  box.appendChild(h('div', { className: 'pza-note' }, 'ℹ️ O ', h('strong', null, 'Workshop ID'), ' de todos os ', `${PZ_IDS.length} `, 'mods é real — extraído da coleção na Steam (vai no ', h('code', null, 'WorkshopItems='), ' do servidor). O ', h('strong', null, 'Mod ID'), ' e o ', h('strong', null, 'Spawn ID'), ' aparecem preenchidos só quando o mod os declara publicamente; nos demais ficam “—” porque só aparecem dentro do próprio jogo (não invento valor — comando errado quebra no servidor). Pra achar o Spawn ID de um veículo, spawne uma vez e use ', h('code', null, '/addvehicle'), '.'));
  return page;
}
