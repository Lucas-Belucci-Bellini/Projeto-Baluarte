/**
 * /organizacao-militar — Organização Militar
 * Ranks comparativos (NATO OR/OF) e estrutura de unidades
 */

import { h } from '../utils/helpers.js';

/* Ranks de oficiais — código OTAN OF-1 a OF-10 */
const OFICIAIS = [
  { otan: 'OF-1',  eua: '2nd/1st Lieutenant', uk: 'Lieutenant',          br: 'Tenente',              insignia: '▬' },
  { otan: 'OF-2',  eua: 'Captain',            uk: 'Captain',             br: 'Capitão',              insignia: '▬▬' },
  { otan: 'OF-3',  eua: 'Major',              uk: 'Major',               br: 'Major',                insignia: '◆' },
  { otan: 'OF-4',  eua: 'Lieutenant Colonel', uk: 'Lieutenant Colonel',  br: 'Tenente-Coronel',      insignia: '◆◆' },
  { otan: 'OF-5',  eua: 'Colonel',            uk: 'Colonel',             br: 'Coronel',              insignia: '★' },
  { otan: 'OF-6',  eua: 'Brigadier General',  uk: 'Brigadier',           br: 'General de Brigada',   insignia: '★' },
  { otan: 'OF-7',  eua: 'Major General',      uk: 'Major General',       br: 'General de Divisão',   insignia: '★★' },
  { otan: 'OF-8',  eua: 'Lieutenant General', uk: 'Lieutenant General',  br: 'General de Exército',  insignia: '★★★' },
  { otan: 'OF-9',  eua: 'General',            uk: 'General',             br: 'General (4 estrelas)', insignia: '★★★★' },
  { otan: 'OF-10', eua: 'General of the Army','uk': 'Field Marshal',     br: 'Marechal',             insignia: '★★★★★' },
];

/* Praças e graduados — OR-1 a OR-9 */
const PRACAS = [
  { otan: 'OR-1', eua: 'Private',              br: 'Soldado',        insignia: '—' },
  { otan: 'OR-2', eua: 'Private E-2',          br: 'Soldado 1ª Cl.', insignia: '▸' },
  { otan: 'OR-3', eua: 'Private First Class',  br: 'Cabo',           insignia: '▸▸' },
  { otan: 'OR-4', eua: 'Corporal/Specialist',  br: 'Cabo',           insignia: '∧' },
  { otan: 'OR-5', eua: 'Sergeant',             br: '3º Sargento',    insignia: '∧∧' },
  { otan: 'OR-6', eua: 'Staff Sergeant',       br: '2º Sargento',    insignia: '∧∧∧' },
  { otan: 'OR-7', eua: 'Sergeant First Class', br: '1º Sargento',    insignia: '∧∧∧∧' },
  { otan: 'OR-8', eua: 'Master Sergeant',      br: 'Subtenente',     insignia: '∧★' },
  { otan: 'OR-9', eua: 'Sergeant Major',       br: 'Suboficial',     insignia: '∧★★' },
];

/* Estrutura de unidades terrestres */
const UNIDADES = [
  { nome: 'Esquadra / Fireteam', efetivo: '4–13', comando: 'Cabo / Sargento', simbolo: 'Ø' },
  { nome: 'Pelotão', efetivo: '26–55', comando: 'Tenente', simbolo: '•••' },
  { nome: 'Companhia', efetivo: '80–250', comando: 'Capitão / Major', simbolo: 'I' },
  { nome: 'Batalhão', efetivo: '300–1.000', comando: 'Tenente-Coronel', simbolo: 'II' },
  { nome: 'Regimento / Brigada', efetivo: '1.500–3.500', comando: 'Coronel / Gen. Brigada', simbolo: 'X' },
  { nome: 'Divisão', efetivo: '10.000–25.000', comando: 'General de Divisão', simbolo: 'XX' },
  { nome: 'Corpo de Exército', efetivo: '25.000–50.000', comando: 'Tenente-General', simbolo: 'XXX' },
  { nome: 'Exército de Campo', efetivo: '100.000–300.000', comando: 'General', simbolo: 'XXXX' },
  { nome: 'Grupo de Exércitos', efetivo: '400.000+', comando: 'General / Marechal', simbolo: 'XXXXX' },
];

export function organizacaoMilitarPage() {
  let tab = 'oficiais';
  const content = h('div', { className: 'org-content' });

  function renderOficiais() {
    return h('div', { className: 'forcas-table-wrap' },
      h('table', { className: 'forcas-table org-table' },
        h('thead', null, h('tr', null,
          h('th', { className: 'forcas-th' }, 'Código OTAN'),
          h('th', { className: 'forcas-th' }, '🇺🇸 EUA'),
          h('th', { className: 'forcas-th' }, '🇬🇧 Reino Unido'),
          h('th', { className: 'forcas-th' }, '🇧🇷 Brasil'),
          h('th', { className: 'forcas-th' }, 'Insígnia')
        )),
        h('tbody', null, ...OFICIAIS.map(r =>
          h('tr', { className: 'forcas-row' },
            h('td', { className: 'forcas-td forcas-td--pais' }, r.otan),
            h('td', { className: 'forcas-td' }, r.eua),
            h('td', { className: 'forcas-td' }, r.uk),
            h('td', { className: 'forcas-td' }, r.br),
            h('td', { className: 'forcas-td org-insignia' }, r.insignia)
          )
        ))
      )
    );
  }

  function renderPracas() {
    return h('div', { className: 'forcas-table-wrap' },
      h('table', { className: 'forcas-table org-table' },
        h('thead', null, h('tr', null,
          h('th', { className: 'forcas-th' }, 'Código OTAN'),
          h('th', { className: 'forcas-th' }, '🇺🇸 EUA'),
          h('th', { className: 'forcas-th' }, '🇧🇷 Brasil'),
          h('th', { className: 'forcas-th' }, 'Insígnia')
        )),
        h('tbody', null, ...PRACAS.map(r =>
          h('tr', { className: 'forcas-row' },
            h('td', { className: 'forcas-td forcas-td--pais' }, r.otan),
            h('td', { className: 'forcas-td' }, r.eua),
            h('td', { className: 'forcas-td' }, r.br),
            h('td', { className: 'forcas-td org-insignia' }, r.insignia)
          )
        ))
      )
    );
  }

  function renderUnidades() {
    return h('div', { className: 'org-units' },
      ...UNIDADES.map((u, i) =>
        h('div', { className: 'org-unit' },
          h('div', { className: 'org-unit__symbol' }, u.simbolo),
          h('div', { className: 'org-unit__info' },
            h('div', { className: 'org-unit__name' }, u.nome),
            h('div', { className: 'org-unit__cmd' }, `Comando: ${u.comando}`)
          ),
          h('div', { className: 'org-unit__efetivo' }, u.efetivo, h('small', null, ' militares')),
          i < UNIDADES.length - 1 && h('div', { className: 'org-unit__arrow' }, '↓')
        )
      )
    );
  }

  const renderers = { oficiais: renderOficiais, pracas: renderPracas, unidades: renderUnidades };

  function setTab(t) {
    tab = t;
    content.innerHTML = '';
    content.appendChild(renderers[t]());
    document.querySelectorAll('.org-tab').forEach(b => b.classList.toggle('is-active', b.dataset.tab === t));
  }

  const tabBar = h('div', { className: 'org-tabs' },
    ...[['oficiais', '⭐ Oficiais (OF)'], ['pracas', '▸ Praças (OR)'], ['unidades', '◫ Estrutura de Unidades']].map(([t, label]) =>
      h('button', { className: `org-tab${t === 'oficiais' ? ' is-active' : ''}`, 'data-tab': t, onclick: () => setTab(t) }, label)
    )
  );

  content.appendChild(renderOficiais());

  return h('div', { className: 'org-page page-wrap' },
    h('div', { className: 'page-hero' },
      h('h1', null, '⚙ Organização Militar'),
      h('p', { className: 'u-text-muted' }, 'Hierarquia de patentes (padrão OTAN OF/OR) e estrutura de unidades militares.')
    ),
    tabBar,
    content
  );
}
