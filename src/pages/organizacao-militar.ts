/**
 * /organizacao-militar — ranks comparativos OTAN e estrutura de unidades.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

interface Oficial {
  otan: string;
  eua: string;
  uk: string;
  br: string;
  insignia: string;
}

interface Praca {
  otan: string;
  eua: string;
  br: string;
  insignia: string;
}

interface Unidade {
  nome: string;
  efetivo: string;
  comando: string;
  simbolo: string;
}

type TabId = 'oficiais' | 'pracas' | 'unidades';

interface TabDefinition {
  id: TabId;
  label: string;
}

const OFICIAIS: readonly Oficial[] = [
  { otan: 'OF-1', eua: '2nd/1st Lieutenant', uk: 'Lieutenant', br: 'Tenente', insignia: '▬' },
  { otan: 'OF-2', eua: 'Captain', uk: 'Captain', br: 'Capitão', insignia: '▬▬' },
  { otan: 'OF-3', eua: 'Major', uk: 'Major', br: 'Major', insignia: '◆' },
  { otan: 'OF-4', eua: 'Lieutenant Colonel', uk: 'Lieutenant Colonel', br: 'Tenente-Coronel', insignia: '◆◆' },
  { otan: 'OF-5', eua: 'Colonel', uk: 'Colonel', br: 'Coronel', insignia: '★' },
  { otan: 'OF-6', eua: 'Brigadier General', uk: 'Brigadier', br: 'General de Brigada', insignia: '★' },
  { otan: 'OF-7', eua: 'Major General', uk: 'Major General', br: 'General de Divisão', insignia: '★★' },
  { otan: 'OF-8', eua: 'Lieutenant General', uk: 'Lieutenant General', br: 'General de Exército', insignia: '★★★' },
  { otan: 'OF-9', eua: 'General', uk: 'General', br: 'General (4 estrelas)', insignia: '★★★★' },
  { otan: 'OF-10', eua: 'General of the Army', uk: 'Field Marshal', br: 'Marechal', insignia: '★★★★★' }
];

const PRACAS: readonly Praca[] = [
  { otan: 'OR-1', eua: 'Private', br: 'Soldado', insignia: '—' },
  { otan: 'OR-2', eua: 'Private E-2', br: 'Soldado 1ª Cl.', insignia: '▸' },
  { otan: 'OR-3', eua: 'Private First Class', br: 'Cabo', insignia: '▸▸' },
  { otan: 'OR-4', eua: 'Corporal/Specialist', br: 'Cabo', insignia: '∧' },
  { otan: 'OR-5', eua: 'Sergeant', br: '3º Sargento', insignia: '∧∧' },
  { otan: 'OR-6', eua: 'Staff Sergeant', br: '2º Sargento', insignia: '∧∧∧' },
  { otan: 'OR-7', eua: 'Sergeant First Class', br: '1º Sargento', insignia: '∧∧∧∧' },
  { otan: 'OR-8', eua: 'Master Sergeant', br: 'Subtenente', insignia: '∧★' },
  { otan: 'OR-9', eua: 'Sergeant Major', br: 'Suboficial', insignia: '∧★★' }
];

const UNIDADES: readonly Unidade[] = [
  { nome: 'Esquadra / Fireteam', efetivo: '4–13', comando: 'Cabo / Sargento', simbolo: 'Ø' },
  { nome: 'Pelotão', efetivo: '26–55', comando: 'Tenente', simbolo: '•••' },
  { nome: 'Companhia', efetivo: '80–250', comando: 'Capitão / Major', simbolo: 'I' },
  { nome: 'Batalhão', efetivo: '300–1.000', comando: 'Tenente-Coronel', simbolo: 'II' },
  { nome: 'Regimento / Brigada', efetivo: '1.500–3.500', comando: 'Coronel / Gen. Brigada', simbolo: 'X' },
  { nome: 'Divisão', efetivo: '10.000–25.000', comando: 'General de Divisão', simbolo: 'XX' },
  { nome: 'Corpo de Exército', efetivo: '25.000–50.000', comando: 'Tenente-General', simbolo: 'XXX' },
  { nome: 'Exército de Campo', efetivo: '100.000–300.000', comando: 'General', simbolo: 'XXXX' },
  { nome: 'Grupo de Exércitos', efetivo: '400.000+', comando: 'General / Marechal', simbolo: 'XXXXX' }
];

const TABS: readonly TabDefinition[] = [
  { id: 'oficiais', label: '⭐ Oficiais (OF)' },
  { id: 'pracas', label: '▸ Praças (OR)' },
  { id: 'unidades', label: '◫ Estrutura de Unidades' }
];

function makeTable(
  headers: readonly string[],
  rows: readonly (readonly string[])[],
): HTMLDivElement {
  const table = h('table', { className: 'forcas-table org-table' });
  const head = h('thead', null);
  const headerRow = h('tr', null);
  headers.forEach((header) => headerRow.appendChild(h('th', { className: 'forcas-th' }, header)));
  head.appendChild(headerRow);
  const body = h('tbody', null);
  rows.forEach((row) => {
    const tableRow = h('tr', { className: 'forcas-row' });
    row.forEach((cell, index) => tableRow.appendChild(
      h('td', {
        className: `forcas-td${index === 0 ? ' forcas-td--pais' : ''}${index === row.length - 1 ? ' org-insignia' : ''}`
      }, cell)));
    body.appendChild(tableRow);
  });
  table.append(head, body);
  return h('div', { className: 'forcas-table-wrap' }, table);
}

export function organizacaoMilitarPage(): HTMLDivElement {
  let activeTab: TabId = 'oficiais';
  const content = h('div', { className: 'org-content' });

  const renderOficiais = (): HTMLDivElement => makeTable(
    ['Código OTAN', '🇺🇸 EUA', '🇬🇧 Reino Unido', '🇧🇷 Brasil', 'Insígnia'],
    OFICIAIS.map((rank) => [rank.otan, rank.eua, rank.uk, rank.br, rank.insignia]));

  const renderPracas = (): HTMLDivElement => makeTable(
    ['Código OTAN', '🇺🇸 EUA', '🇧🇷 Brasil', 'Insígnia'],
    PRACAS.map((rank) => [rank.otan, rank.eua, rank.br, rank.insignia]));

  const renderUnidades = (): HTMLDivElement => {
    const units = h('div', { className: 'org-units' });
    UNIDADES.forEach((unit, index) => {
      units.appendChild(
        h('div', { className: 'org-unit' },
          h('div', { className: 'org-unit__symbol' }, unit.simbolo),
          h('div', { className: 'org-unit__info' },
            h('div', { className: 'org-unit__name' }, unit.nome),
            h('div', { className: 'org-unit__cmd' }, `Comando: ${unit.comando}`)),
          h('div', { className: 'org-unit__efetivo' }, unit.efetivo, h('small', null, ' militares')),
          index < UNIDADES.length - 1 && h('div', { className: 'org-unit__arrow' }, '↓')));
    });
    return units;
  };

  const renderers: Record<TabId, () => HTMLDivElement> = {
    oficiais: renderOficiais,
    pracas: renderPracas,
    unidades: renderUnidades
  };

  const setTab = (tab: TabId): void => {
    activeTab = tab;
    content.innerHTML = '';
    content.appendChild(renderers[activeTab]());
    document.querySelectorAll<HTMLElement>('.org-tab').forEach((button) =>
      button.classList.toggle('is-active', button.dataset.tab === activeTab));
  };

  const tabBar = h('div', { className: 'org-tabs' },
    ...TABS.map((tab) => h('button', {
      className: `org-tab${tab.id === activeTab ? ' is-active' : ''}`,
      dataset: { tab: tab.id },
      onclick: (): void => setTab(tab.id)
    }, tab.label)));

  content.appendChild(renderOficiais());
  return h('div', { className: 'org-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · ORGANIZAÇÃO MILITAR',
      title: 'Organização Militar',
      sub: 'PATENTES & ESTRUTURA',
      desc: 'Hierarquia de patentes (padrão OTAN OF/OR) e estrutura de unidades militares.',
      hudLeft: '⚙ HIERARQUIA OTAN',
      hudRight: 'OF/OR'
    }),
    tabBar,
    content);
}
