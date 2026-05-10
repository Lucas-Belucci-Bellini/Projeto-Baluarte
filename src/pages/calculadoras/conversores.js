/**
 * Calculadora de Conversores (Fase 5)
 *
 * Categorias:
 *   - Comprimento, Massa, Temperatura, Volume, Energia, Tempo,
 *     Dados, Velocidade, Pressão, Ângulo
 */

import { h, cx } from '../../utils/helpers.js';

const NUM = (v) => parseFloat(String(v).replace(',', '.')) || 0;
const fmt = (n) => {
  if (!isFinite(n)) return '—';
  if (n === 0) return '0';
  const abs = Math.abs(n);
  if (abs > 0 && (abs < 1e-4 || abs >= 1e10)) return n.toExponential(4);
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 6 }).format(n);
};

/* Cada categoria: { id, label, icon, units: [{id, label, factor}], custom? } */
const CATEGORIES = [
  {
    id: 'length', label: 'Comprimento', icon: '↔',
    units: [
      { id: 'm', label: 'metro (m)', factor: 1 },
      { id: 'km', label: 'kilômetro (km)', factor: 1000 },
      { id: 'cm', label: 'centímetro (cm)', factor: 0.01 },
      { id: 'mm', label: 'milímetro (mm)', factor: 0.001 },
      { id: 'μm', label: 'micrômetro (μm)', factor: 1e-6 },
      { id: 'nm', label: 'nanômetro (nm)', factor: 1e-9 },
      { id: 'mi', label: 'milha (mi)', factor: 1609.344 },
      { id: 'yd', label: 'jarda (yd)', factor: 0.9144 },
      { id: 'ft', label: 'pé (ft)', factor: 0.3048 },
      { id: 'in', label: 'polegada (in)', factor: 0.0254 },
      { id: 'nmi', label: 'milha náutica', factor: 1852 },
      { id: 'ly', label: 'ano-luz', factor: 9.461e15 },
      { id: 'au', label: 'unidade astronômica (au)', factor: 1.496e11 }
    ]
  },
  {
    id: 'mass', label: 'Massa', icon: '⚖',
    units: [
      { id: 'kg', label: 'kilograma (kg)', factor: 1 },
      { id: 'g', label: 'grama (g)', factor: 0.001 },
      { id: 'mg', label: 'miligrama (mg)', factor: 1e-6 },
      { id: 'μg', label: 'micrograma (μg)', factor: 1e-9 },
      { id: 't', label: 'tonelada (t)', factor: 1000 },
      { id: 'lb', label: 'libra (lb)', factor: 0.453592 },
      { id: 'oz', label: 'onça (oz)', factor: 0.0283495 },
      { id: 'st', label: 'stone (st)', factor: 6.35029 },
      { id: 'ct', label: 'quilate (ct)', factor: 0.0002 }
    ]
  },
  {
    id: 'temp', label: 'Temperatura', icon: '°',
    custom: { /* tratamento especial - não é multiplicação */
      from: (v, u) => {
        if (u === 'C') return v;
        if (u === 'F') return (v - 32) * 5 / 9;
        if (u === 'K') return v - 273.15;
        return v;
      },
      to: (v, u) => {
        if (u === 'C') return v;
        if (u === 'F') return v * 9 / 5 + 32;
        if (u === 'K') return v + 273.15;
        return v;
      }
    },
    units: [
      { id: 'C', label: 'Celsius (°C)' },
      { id: 'F', label: 'Fahrenheit (°F)' },
      { id: 'K', label: 'Kelvin (K)' }
    ]
  },
  {
    id: 'volume', label: 'Volume', icon: '◧',
    units: [
      { id: 'L', label: 'litro (L)', factor: 1 },
      { id: 'mL', label: 'mililitro (mL)', factor: 0.001 },
      { id: 'm3', label: 'metro cúbico (m³)', factor: 1000 },
      { id: 'cm3', label: 'centímetro cúbico (cm³)', factor: 0.001 },
      { id: 'gal', label: 'galão (US)', factor: 3.78541 },
      { id: 'galuk', label: 'galão (UK)', factor: 4.54609 },
      { id: 'qt', label: 'quart (US)', factor: 0.946353 },
      { id: 'pt', label: 'pint (US)', factor: 0.473176 },
      { id: 'cup', label: 'cup (US)', factor: 0.236588 },
      { id: 'floz', label: 'fluid ounce (US)', factor: 0.0295735 },
      { id: 'tbsp', label: 'colher de sopa', factor: 0.014787 },
      { id: 'tsp', label: 'colher de chá', factor: 0.00492892 }
    ]
  },
  {
    id: 'energy', label: 'Energia', icon: '⚡',
    units: [
      { id: 'J', label: 'joule (J)', factor: 1 },
      { id: 'kJ', label: 'kilojoule (kJ)', factor: 1000 },
      { id: 'cal', label: 'caloria (cal)', factor: 4.184 },
      { id: 'kcal', label: 'kilocaloria (kcal)', factor: 4184 },
      { id: 'Wh', label: 'watt-hora (Wh)', factor: 3600 },
      { id: 'kWh', label: 'kilowatt-hora (kWh)', factor: 3.6e6 },
      { id: 'eV', label: 'elétron-volt (eV)', factor: 1.602e-19 },
      { id: 'BTU', label: 'BTU', factor: 1055.06 },
      { id: 'ftlb', label: 'foot-pound', factor: 1.35582 }
    ]
  },
  {
    id: 'time', label: 'Tempo', icon: '◴',
    units: [
      { id: 's', label: 'segundo (s)', factor: 1 },
      { id: 'ms', label: 'milissegundo (ms)', factor: 0.001 },
      { id: 'μs', label: 'microssegundo (μs)', factor: 1e-6 },
      { id: 'ns', label: 'nanossegundo (ns)', factor: 1e-9 },
      { id: 'min', label: 'minuto (min)', factor: 60 },
      { id: 'h', label: 'hora (h)', factor: 3600 },
      { id: 'd', label: 'dia (d)', factor: 86400 },
      { id: 'wk', label: 'semana (wk)', factor: 604800 },
      { id: 'mo', label: 'mês (30 d)', factor: 2592000 },
      { id: 'y', label: 'ano (365 d)', factor: 31536000 }
    ]
  },
  {
    id: 'data', label: 'Dados (binário)', icon: '◫',
    units: [
      { id: 'B', label: 'byte (B)', factor: 1 },
      { id: 'KiB', label: 'kibibyte (KiB)', factor: 1024 },
      { id: 'MiB', label: 'mebibyte (MiB)', factor: 1048576 },
      { id: 'GiB', label: 'gibibyte (GiB)', factor: 1073741824 },
      { id: 'TiB', label: 'tebibyte (TiB)', factor: 1099511627776 },
      { id: 'PiB', label: 'pebibyte (PiB)', factor: 1125899906842624 },
      { id: 'KB', label: 'kilobyte (KB) — decimal', factor: 1000 },
      { id: 'MB', label: 'megabyte (MB) — decimal', factor: 1e6 },
      { id: 'GB', label: 'gigabyte (GB) — decimal', factor: 1e9 },
      { id: 'TB', label: 'terabyte (TB) — decimal', factor: 1e12 },
      { id: 'bit', label: 'bit', factor: 0.125 }
    ]
  },
  {
    id: 'speed', label: 'Velocidade', icon: '↣',
    units: [
      { id: 'm/s', label: 'metro/seg (m/s)', factor: 1 },
      { id: 'km/h', label: 'km/h', factor: 0.277778 },
      { id: 'mph', label: 'mph', factor: 0.44704 },
      { id: 'ft/s', label: 'pé/seg', factor: 0.3048 },
      { id: 'kn', label: 'nó (knot)', factor: 0.514444 },
      { id: 'mach', label: 'mach (340.29 m/s)', factor: 340.29 },
      { id: 'c', label: 'velocidade da luz', factor: 299792458 }
    ]
  },
  {
    id: 'pressure', label: 'Pressão', icon: '◉',
    units: [
      { id: 'Pa', label: 'pascal (Pa)', factor: 1 },
      { id: 'hPa', label: 'hectopascal (hPa)', factor: 100 },
      { id: 'kPa', label: 'kilopascal (kPa)', factor: 1000 },
      { id: 'MPa', label: 'megapascal (MPa)', factor: 1e6 },
      { id: 'bar', label: 'bar', factor: 1e5 },
      { id: 'atm', label: 'atmosfera (atm)', factor: 101325 },
      { id: 'psi', label: 'psi', factor: 6894.76 },
      { id: 'mmHg', label: 'mmHg / Torr', factor: 133.322 }
    ]
  },
  {
    id: 'angle', label: 'Ângulo', icon: '∠',
    units: [
      { id: 'rad', label: 'radianos', factor: 1 },
      { id: 'deg', label: 'graus (°)', factor: Math.PI / 180 },
      { id: 'grad', label: 'gradianos', factor: Math.PI / 200 },
      { id: 'turn', label: 'volta', factor: Math.PI * 2 },
      { id: 'arcmin', label: 'minuto de arco', factor: Math.PI / 10800 },
      { id: 'arcsec', label: 'segundo de arco', factor: Math.PI / 648000 }
    ]
  }
];

let activeCat = CATEGORIES[0];
let activeFromUnit = activeCat.units[0].id;
let inputValue = 1;
let resultsContainer = null;
let categoryGrid = null;

function convert(value, fromUnit, toUnit, cat) {
  if (cat.custom) {
    const inSI = cat.custom.from(value, fromUnit);
    return cat.custom.to(inSI, toUnit);
  }
  const from = cat.units.find((u) => u.id === fromUnit);
  const to = cat.units.find((u) => u.id === toUnit);
  if (!from || !to) return NaN;
  return (value * from.factor) / to.factor;
}

function renderResults() {
  if (!resultsContainer) return;
  resultsContainer.innerHTML = '';
  for (const u of activeCat.units) {
    const isFrom = u.id === activeFromUnit;
    const v = isFrom ? inputValue : convert(inputValue, activeFromUnit, u.id, activeCat);
    const row = h('div', {
      className: cx('conv-row', isFrom && 'is-source'),
      onclick: () => {
        if (!isFrom) {
          /* Trocar a unidade-fonte e recalcular pra valor igual à coluna clicada */
          inputValue = v;
          activeFromUnit = u.id;
          renderResults();
        }
      }
    },
      h('span', { className: 'conv-row__label' }, u.label),
      h('span', { className: 'conv-row__value u-mono' }, fmt(v))
    );
    resultsContainer.appendChild(row);
  }
}

function renderCategoryButtons(parent) {
  if (!categoryGrid) return;
  categoryGrid.innerHTML = '';
  for (const cat of CATEGORIES) {
    const btn = h('button', {
      className: cx('conv-cat', cat.id === activeCat.id && 'is-active'),
      onclick: () => {
        activeCat = cat;
        activeFromUnit = cat.units[0].id;
        renderCategoryButtons();
        renderResults();
      }
    },
      h('span', { className: 'conv-cat__icon' }, cat.icon),
      h('span', null, cat.label)
    );
    categoryGrid.appendChild(btn);
  }
}

export function conversoresPanel() {
  const wrap = h('div', { className: 'calc-conv' });

  const input = h('input', {
    className: 'input calc-conv__input',
    type: 'text',
    value: '1',
    placeholder: '1',
    oninput: (e) => {
      inputValue = NUM(e.target.value);
      renderResults();
    }
  });

  categoryGrid = h('div', { className: 'conv-cats' });
  resultsContainer = h('div', { className: 'conv-results' });

  wrap.append(
    h('div', { className: 'calc-tile__title' }, '⇄ Conversores Universais'),
    h('p', { className: 'u-text-secondary', style: { fontSize: '13px', marginBottom: '12px' } },
      'Click em qualquer unidade para definir como fonte. ',
      h('span', { className: 'u-text-cyan' }, '10 categorias, 80+ unidades')),
    h('div', { className: 'calc-conv__head' },
      h('label', null, 'Valor', input)
    ),
    categoryGrid,
    resultsContainer
  );

  renderCategoryButtons();
  renderResults();
  return wrap;
}
