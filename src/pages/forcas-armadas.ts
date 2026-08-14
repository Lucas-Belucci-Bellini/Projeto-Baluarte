/**
 * /forcas-armadas — tabela comparativa de efetivos e orçamentos militares.
 */

import '../styles/militar.css';
import { h } from '../utils/helpers.js';
import { buildImmersiveHero } from '../utils/immersive.js';

interface ForcaArmada {
  pais: string;
  bandeira: string;
  efetivos: number;
  reserva: number;
  orcamento: number;
  pib: number;
  ramos: readonly string[];
}

type SortKey = keyof ForcaArmada;

interface ColumnDefinition {
  key: SortKey;
  label: string;
  format: (row: ForcaArmada) => string;
}

const FORCAS: readonly ForcaArmada[] = [
  { pais: 'China', bandeira: '🇨🇳', efetivos: 2035000, reserva: 510000, orcamento: 225, pib: 1.7, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Foguetes', 'Apoio'] },
  { pais: 'EUA', bandeira: '🇺🇸', efetivos: 1328000, reserva: 799500, orcamento: 858, pib: 3.5, ramos: ['Exército', 'Marinha', 'Fuzileiros', 'Aeronáutica', 'Guarda Costeira', 'Espaço'] },
  { pais: 'Índia', bandeira: '🇮🇳', efetivos: 1455000, reserva: 1155000, orcamento: 81, pib: 2.4, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Coreia do Norte', bandeira: '🇰🇵', efetivos: 1280000, reserva: 600000, orcamento: 4, pib: 26.0, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Forças Especiais'] },
  { pais: 'Rússia', bandeira: '🇷🇺', efetivos: 900000, reserva: 2000000, orcamento: 109, pib: 6.8, ramos: ['Exército', 'Marinha', 'Aeroespacial', 'Foguetes'] },
  { pais: 'Paquistão', bandeira: '🇵🇰', efetivos: 654000, reserva: 550000, orcamento: 10, pib: 4.0, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Irã', bandeira: '🇮🇷', efetivos: 610000, reserva: 350000, orcamento: 10, pib: 2.3, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Guarda Revolucionária'] },
  { pais: 'Coreia do Sul', bandeira: '🇰🇷', efetivos: 555000, reserva: 3100000, orcamento: 46, pib: 2.8, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Marines'] },
  { pais: 'Vietnã', bandeira: '🇻🇳', efetivos: 482000, reserva: 5000000, orcamento: 7, pib: 2.3, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Fronteira', 'Costa'] },
  { pais: 'Egito', bandeira: '🇪🇬', efetivos: 438500, reserva: 479000, orcamento: 4, pib: 1.2, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Defesa Aérea'] },
  { pais: 'Brasil', bandeira: '🇧🇷', efetivos: 366500, reserva: 1340000, orcamento: 20, pib: 1.2, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Myanmar', bandeira: '🇲🇲', efetivos: 406000, reserva: 107000, orcamento: 3, pib: 4.9, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Turquia', bandeira: '🇹🇷', efetivos: 355200, reserva: 378700, orcamento: 18, pib: 2.0, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Gendarmerie'] },
  { pais: 'Tailândia', bandeira: '🇹🇭', efetivos: 361000, reserva: 200000, orcamento: 7, pib: 1.4, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Indonésia', bandeira: '🇮🇩', efetivos: 395500, reserva: 400000, orcamento: 9, pib: 0.8, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Colômbia', bandeira: '🇨🇴', efetivos: 293200, reserva: 61900, orcamento: 11, pib: 3.3, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Etiópia', bandeira: '🇪🇹', efetivos: 162000, reserva: 0, orcamento: 1, pib: 0.5, ramos: ['Exército', 'Aeronáutica'] },
  { pais: 'México', bandeira: '🇲🇽', efetivos: 277150, reserva: 82000, orcamento: 8, pib: 0.7, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Arábia Saudita', bandeira: '🇸🇦', efetivos: 227000, reserva: 25000, orcamento: 75, pib: 6.0, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Mísseis', 'Guarda Nacional'] },
  { pais: 'França', bandeira: '🇫🇷', efetivos: 208350, reserva: 41650, orcamento: 54, pib: 1.9, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Gendarmerie'] },
  { pais: 'Japão', bandeira: '🇯🇵', efetivos: 247154, reserva: 56100, orcamento: 51, pib: 1.0, ramos: ['JSDF-Terra', 'JSDF-Mar', 'JSDF-Ar'] },
  { pais: 'Israel', bandeira: '🇮🇱', efetivos: 169500, reserva: 465000, orcamento: 27, pib: 5.3, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Inteligência'] },
  { pais: 'Alemanha', bandeira: '🇩🇪', efetivos: 183638, reserva: 30000, orcamento: 67, pib: 1.5, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Cyber', 'Médico', 'Logística'] },
  { pais: 'Reino Unido', bandeira: '🇬🇧', efetivos: 153290, reserva: 37120, orcamento: 75, pib: 2.3, ramos: ['Exército', 'Marinha Real', 'RAF'] },
  { pais: 'Ucrânia', bandeira: '🇺🇦', efetivos: 900000, reserva: 1000000, orcamento: 64, pib: 37.0, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Guarda Nacional'] },
  { pais: 'Taiwan', bandeira: '🇹🇼', efetivos: 169000, reserva: 1657000, orcamento: 19, pib: 2.6, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Marines'] },
  { pais: 'Polônia', bandeira: '🇵🇱', efetivos: 216000, reserva: 75000, orcamento: 32, pib: 4.0, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Defesa Territorial'] },
  { pais: 'Itália', bandeira: '🇮🇹', efetivos: 174500, reserva: 18300, orcamento: 35, pib: 1.5, ramos: ['Exército', 'Marinha', 'Aeronáutica', 'Carabinieri', 'GdF'] },
  { pais: 'Canadá', bandeira: '🇨🇦', efetivos: 68000, reserva: 27000, orcamento: 27, pib: 1.4, ramos: ['Exército', 'Marinha', 'Aeronáutica'] },
  { pais: 'Austrália', bandeira: '🇦🇺', efetivos: 59095, reserva: 28878, orcamento: 35, pib: 2.0, ramos: ['Exército', 'Marinha', 'Aeronáutica'] }
];

const COLS: readonly ColumnDefinition[] = [
  { key: 'pais', label: 'País', format: (row) => `${row.bandeira} ${row.pais}` },
  { key: 'efetivos', label: 'Efetivos Ativos', format: (row) => row.efetivos.toLocaleString('pt-BR') },
  { key: 'reserva', label: 'Reserva', format: (row) => row.reserva > 0 ? row.reserva.toLocaleString('pt-BR') : '—' },
  { key: 'orcamento', label: 'Orçamento (bi USD)', format: (row) => `$${row.orcamento}bi` },
  { key: 'pib', label: '% PIB', format: (row) => `${row.pib}%` },
  { key: 'ramos', label: 'Ramos', format: (row) => row.ramos.join(', ') }
];

function comparable(value: ForcaArmada[SortKey]): string | number | null {
  return typeof value === 'string' || typeof value === 'number' ? value : null;
}

export function forcasArmadasPage(): HTMLDivElement {
  let sortKey: SortKey = 'efetivos';
  let sortDirection = -1;
  let search = '';

  const searchEl = h('input', {
    type: 'search',
    placeholder: 'Buscar país…',
    className: 'forcas-search',
    oninput: (event: Event): void => {
      if (event.target instanceof HTMLInputElement) {
        search = event.target.value.toLowerCase();
        renderTable();
      }
    }
  });

  const tableBody = h('tbody', null);
  const tableHead = h('thead', null);
  const headerRow = h('tr', null);
  const tableEl = h('table', { className: 'forcas-table' }, tableHead, tableBody);

  const renderTable = (): void => {
    const filtered = FORCAS.filter((row) => row.pais.toLowerCase().includes(search))
      .slice()
      .sort((left, right) => {
        const leftValue = comparable(left[sortKey]);
        const rightValue = comparable(right[sortKey]);
        if (leftValue === null || rightValue === null || leftValue === rightValue) return 0;
        if (typeof leftValue === 'number' && typeof rightValue === 'number') {
          return (leftValue < rightValue ? -1 : 1) * sortDirection;
        }
        const leftText = String(leftValue);
        const rightText = String(rightValue);
        return (leftText < rightText ? -1 : 1) * sortDirection;
      });

    tableBody.innerHTML = '';
    filtered.forEach((row) => {
      const cells = COLS.map((column, index) => {
        const cell = h('td', { className: `forcas-td${index === 0 ? ' forcas-td--pais' : ''}` }, column.format(row));
        if (column.key === 'efetivos') {
          cell.appendChild(h('div', { className: 'forcas-bar' },
            h('div', { className: 'forcas-bar__fill', style: `width:${Math.min(100, row.efetivos / 20350)}%` })));
        }
        return cell;
      });
      tableBody.appendChild(h('tr', { className: 'forcas-row' }, ...cells));
    });
  };

  COLS.forEach((column) => {
    headerRow.appendChild(h('th', {
      className: `forcas-th${column.key === sortKey ? ' is-sorted' : ''}`,
      onclick: (event: Event): void => {
        if (sortKey === column.key) sortDirection *= -1;
        else {
          sortKey = column.key;
          sortDirection = -1;
        }
        document.querySelectorAll<HTMLElement>('.forcas-th').forEach((element) =>
          element.classList.remove('is-sorted'));
        if (event.currentTarget instanceof HTMLElement) event.currentTarget.classList.add('is-sorted');
        renderTable();
      }
    }, column.label));
  });
  tableHead.appendChild(headerRow);
  renderTable();

  const stats = h('div', { className: 'forcas-stats' },
    h('div', { className: 'forcas-stat' },
      h('span', { className: 'forcas-stat__val' }, FORCAS.reduce((sum, row) => sum + row.efetivos, 0).toLocaleString('pt-BR')),
      h('span', { className: 'forcas-stat__lbl' }, 'Efetivos totais')),
    h('div', { className: 'forcas-stat' },
      h('span', { className: 'forcas-stat__val' }, `$${FORCAS.reduce((sum, row) => sum + row.orcamento, 0).toLocaleString('pt-BR')}bi`),
      h('span', { className: 'forcas-stat__lbl' }, 'Gasto militar total')),
    h('div', { className: 'forcas-stat' },
      h('span', { className: 'forcas-stat__val' }, FORCAS.length),
      h('span', { className: 'forcas-stat__lbl' }, 'Países listados')));

  return h('div', { className: 'forcas-page page-wrap' },
    buildImmersiveHero({
      kicker: 'BALUARTE · FORÇAS ARMADAS',
      title: 'Forças Armadas do Mundo',
      sub: 'EFETIVOS & ORÇAMENTOS',
      desc: 'Efetivos, orçamentos e ramos militares por país. Dados: GFP 2024 + SIPRI.',
      hudLeft: '🌍 DADOS GLOBAIS',
      hudRight: 'GFP + SIPRI'
    }),
    stats,
    h('div', { className: 'forcas-controls' }, searchEl),
    h('div', { className: 'forcas-table-wrap' }, tableEl));
}
