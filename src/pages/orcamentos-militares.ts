/**
 * /orcamentos-militares — Orçamentos Militares SIPRI 2024
 * Tabela interativa com visualização em barras.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

interface MilitaryBudget {
  readonly pais: string;
  readonly bandeira: string;
  readonly valor: number;
  readonly pib: number;
  readonly pop: number;
  readonly variacao: number;
}

type ViewMode = 'table' | 'chart';

const SIPRI_2024: MilitaryBudget[] = [
  { pais: 'EUA',            bandeira: '🇺🇸', valor: 858, pib: 3.5,  pop: 335,  variacao: 2.3 },
  { pais: 'China',          bandeira: '🇨🇳', valor: 225, pib: 1.7,  pop: 1412, variacao: 6.0 },
  { pais: 'Rússia',         bandeira: '🇷🇺', valor: 109, pib: 6.8,  pop: 145,  variacao: 24.0 },
  { pais: 'Índia',          bandeira: '🇮🇳', valor: 83,  pib: 2.4,  pop: 1432, variacao: 4.2 },
  { pais: 'Arábia Saudita', bandeira: '🇸🇦', valor: 75,  pib: 6.0,  pop: 36,   variacao: -0.5 },
  { pais: 'Reino Unido',    bandeira: '🇬🇧', valor: 75,  pib: 2.3,  pop: 67,   variacao: 7.9 },
  { pais: 'Alemanha',        bandeira: '🇩🇪', valor: 67,  pib: 1.5,  pop: 84,   variacao: 9.0 },
  { pais: 'Ucrânia',         bandeira: '🇺🇦', valor: 64,  pib: 37.0, pop: 44,   variacao: 51.0 },
  { pais: 'França',          bandeira: '🇫🇷', valor: 54,  pib: 1.9,  pop: 68,   variacao: 7.0 },
  { pais: 'Japão',           bandeira: '🇯🇵', valor: 51,  pib: 1.0,  pop: 125,  variacao: 11.0 },
  { pais: 'Coreia do Sul',   bandeira: '🇰🇷', valor: 46,  pib: 2.8,  pop: 52,   variacao: 5.9 },
  { pais: 'Itália',          bandeira: '🇮🇹', valor: 35,  pib: 1.5,  pop: 60,   variacao: 5.6 },
  { pais: 'Austrália',       bandeira: '🇦🇺', valor: 35,  pib: 2.0,  pop: 26,   variacao: 3.4 },
  { pais: 'Israel',          bandeira: '🇮🇱', valor: 27,  pib: 5.3,  pop: 9,    variacao: 24.0 },
  { pais: 'Canadá',          bandeira: '🇨🇦', valor: 27,  pib: 1.4,  pop: 38,   variacao: 11.5 },
  { pais: 'Espanha',         bandeira: '🇪🇸', valor: 24,  pib: 1.4,  pop: 47,   variacao: 7.5 },
  { pais: 'Países Baixos',   bandeira: '🇳🇱', valor: 19,  pib: 1.6,  pop: 18,   variacao: 18.0 },
  { pais: 'Taiwan',          bandeira: '🇹🇼', valor: 19,  pib: 2.6,  pop: 23,   variacao: 3.4 },
  { pais: 'Turquia',         bandeira: '🇹🇷', valor: 18,  pib: 2.0,  pop: 85,   variacao: 88.0 },
  { pais: 'Brasil',          bandeira: '🇧🇷', valor: 20,  pib: 1.2,  pop: 215,  variacao: 3.5 },
  { pais: 'Polônia',         bandeira: '🇵🇱', valor: 32,  pib: 4.0,  pop: 37,   variacao: 75.0 },
  { pais: 'Singapura',       bandeira: '🇸🇬', valor: 14,  pib: 3.0,  pop: 6,    variacao: 1.5 },
  { pais: 'Noruega',         bandeira: '🇳🇴', valor: 10,  pib: 1.7,  pop: 5,    variacao: 10.5 },
  { pais: 'Grécia',          bandeira: '🇬🇷', valor: 11,  pib: 3.0,  pop: 11,   variacao: 6.1 },
  { pais: 'Romênia',         bandeira: '🇷🇴', valor: 8,   pib: 2.2,  pop: 19,   variacao: 27.0 },
  { pais: 'Suécia',          bandeira: '🇸🇪', valor: 10,  pib: 2.0,  pop: 10,   variacao: 28.0 },
  { pais: 'México',          bandeira: '🇲🇽', valor: 8,   pib: 0.7,  pop: 130,  variacao: 4.5 },
  { pais: 'Colômbia',        bandeira: '🇨🇴', valor: 11,  pib: 3.3,  pop: 51,   variacao: 5.0 },
  { pais: 'Irã',             bandeira: '🇮🇷', valor: 10,  pib: 2.3,  pop: 86,   variacao: 16.0 },
  { pais: 'Paquistão',       bandeira: '🇵🇰', valor: 10,  pib: 4.0,  pop: 220,  variacao: 22.0 },
].sort((a, b) => b.valor - a.valor);

const MAX = SIPRI_2024[0].valor;

export function orcamentosMilitaresPage(): HTMLDivElement {
  let viewMode: ViewMode = 'table';

  const tableView = buildTable();
  const chartView = buildChart();
  const modeBtns: Record<ViewMode, HTMLButtonElement> = {
    table: h('button', { className: 'orca-mode-btn is-active' }, '☰ Tabela'),
    chart: h('button', { className: 'orca-mode-btn' }, '▦ Gráfico'),
  };

  const btnBar = h('div', { className: 'orca-mode-bar' });
  const modeOptions: readonly [ViewMode, string][] = [
    ['table', '☰ Tabela'],
    ['chart', '▦ Gráfico'],
  ];
  for (const [key, label] of modeOptions) {
    const btn = modeBtns[key];
    btn.textContent = label;
    btn.onclick = () => {
      modeBtns[viewMode].classList.remove('is-active');
      viewMode = key;
      modeBtns[key].classList.add('is-active');
      contentArea.innerHTML = '';
      contentArea.appendChild(key === 'table' ? tableView : chartView);
    };
    btnBar.appendChild(btn);
  }

  const contentArea = h('div', { className: 'orca-content' }, tableView);
  const total = SIPRI_2024.reduce((sum, row) => sum + row.valor, 0);
  const topCountry = SIPRI_2024[0];
  const unitedStates = SIPRI_2024.find((row) => row.pais === 'EUA') ?? topCountry;
  const stats = h('div', { className: 'forcas-stats' },
    h('div', { className: 'forcas-stat' },
      h('span', { className: 'forcas-stat__val' }, `$${total.toLocaleString('pt-BR')}bi`),
      h('span', { className: 'forcas-stat__lbl' }, 'Total mundial (amostra)'),
    ),
    h('div', { className: 'forcas-stat' },
      h('span', { className: 'forcas-stat__val' }, `$${topCountry.valor}bi`),
      h('span', { className: 'forcas-stat__lbl' }, `Maior gasto: ${topCountry.pais}`),
    ),
    h('div', { className: 'forcas-stat' },
      h('span', { className: 'forcas-stat__val' }, `${(unitedStates.valor / total * 100).toFixed(0)}%`),
      h('span', { className: 'forcas-stat__lbl' }, 'Participação dos EUA'),
    ),
  );

  return h('div', { className: 'orca-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · ORÇAMENTOS MILITARES',
      title: 'Orçamentos Militares',
      sub: 'SIPRI 2024',
      desc: 'Gastos militares por país — SIPRI 2024. Valores em bilhões de USD.',
      hudLeft: '📊 GASTOS MILITARES',
      hudRight: 'USD BI',
    }),
    stats,
    h('div', { className: 'orca-toolbar' },
      btnBar,
      h('p', { className: 'orca-source' }, 'Fonte: SIPRI Military Expenditure Database 2024'),
    ),
    contentArea,
  );
}

function buildTable(): HTMLDivElement {
  const rows = [...SIPRI_2024];
  const tbody = h('tbody');

  function render(): void {
    tbody.innerHTML = '';
    for (let index = 0; index < rows.length; index += 1) {
      const row = rows[index];
      const pct = (row.valor / MAX * 100).toFixed(0);
      const up = row.variacao >= 0;
      tbody.appendChild(h('tr', { className: 'forcas-row' },
        h('td', { className: 'forcas-td' }, `#${index + 1}`),
        h('td', { className: 'forcas-td forcas-td--pais' }, `${row.bandeira} ${row.pais}`),
        h('td', { className: 'forcas-td' },
          h('div', { className: 'orca-bar-wrap' },
            h('div', { className: 'orca-bar', style: `width:${pct}%` }),
            h('span', { className: 'orca-bar-val' }, `$${row.valor}bi`),
          ),
        ),
        h('td', { className: 'forcas-td' }, `${row.pib}%`),
        h('td', { className: `forcas-td orca-var--${up ? 'up' : 'down'}` },
          `${up ? '+' : ''}${row.variacao}%`,
        ),
        h('td', { className: 'forcas-td' }, `$${Math.round(row.valor * 1000 / row.pop)}`),
      ));
    }
  }
  render();

  return h('div', { className: 'forcas-table-wrap' },
    h('table', { className: 'forcas-table' },
      h('thead', null,
        h('tr', null,
          h('th', { className: 'forcas-th' }, '#'),
          h('th', { className: 'forcas-th' }, 'País'),
          h('th', { className: 'forcas-th' }, 'Gasto (bi USD)'),
          h('th', { className: 'forcas-th' }, '% PIB'),
          h('th', { className: 'forcas-th' }, 'Variação 2023→24'),
          h('th', { className: 'forcas-th' }, 'Per capita (M USD)'),
        ),
      ),
      tbody,
    ),
  );
}

function buildChart(): HTMLDivElement {
  const top20 = SIPRI_2024.slice(0, 20);
  const bars = top20.map((row) => {
    const pct = (row.valor / MAX * 100).toFixed(1);
    return h('div', { className: 'orca-chart-row' },
      h('span', { className: 'orca-chart-label' }, `${row.bandeira} ${row.pais}`),
      h('div', { className: 'orca-chart-bar-wrap' },
        h('div', { className: 'orca-chart-bar', style: `width:${pct}%` },
          h('span', { className: 'orca-chart-bar-val' }, `$${row.valor}bi`),
        ),
      ),
    );
  });

  return h('div', { className: 'orca-chart' }, ...bars);
}
