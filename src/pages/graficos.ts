/**
 * Página /graficos — Gerador de Gráficos.
 *
 * Suporta os 12 tipos do chart-engine e persiste o estado localmente.
 */

import '../styles/graficos.css';
import { h, cx, debounce } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast';
import {
  CHART_TYPES,
  PALETTES,
  drawChart,
  exportPNG,
} from '../utils/chart-engine.js';
import type { ChartData } from '../utils/chart-engine.js';

const STORAGE_KEY = 'graficos:state';

type ToggleKey = 'showGrid' | 'showLabels' | 'showValues';

interface GraphicsState {
  type: string;
  palette: string;
  title: string;
  showGrid: boolean;
  showLabels: boolean;
  showValues: boolean;
  rawData: string;
}

interface GraphicsStateRecord {
  readonly type?: unknown;
  readonly palette?: unknown;
  readonly title?: unknown;
  readonly showGrid?: unknown;
  readonly showLabels?: unknown;
  readonly showValues?: unknown;
  readonly rawData?: unknown;
}

const PRESETS: Readonly<Record<string, ChartData>> = {
  line: { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'], values: [12, 19, 8, 15, 25, 22, 30] },
  bar: { labels: ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO'], values: [42, 38, 51, 29, 47] },
  hbar: { labels: ['Tank', 'Sniper', 'Médico', 'Demolidor', 'Eclair'], values: [85, 72, 60, 95, 50] },
  pie: { labels: ['Operacional', 'Recon', 'Logística', 'Médico'], values: [45, 25, 20, 10] },
  donut: { labels: ['Operacional', 'Recon', 'Logística', 'Médico'], values: [45, 25, 20, 10] },
  area: { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [100, 150, 130, 180] },
  radar: { labels: ['Velocidade', 'Força', 'Stealth', 'Tech', 'Combate', 'Resistência'], values: [75, 85, 60, 90, 80, 70] },
  scatter: { points: [{ x: 1, y: 5 }, { x: 2, y: 7 }, { x: 3, y: 6 }, { x: 4, y: 9 }, { x: 5, y: 12 }, { x: 6, y: 14 }, { x: 7, y: 11 }, { x: 8, y: 16 }] },
  bubble: { points: [{ x: 1, y: 5, r: 8 }, { x: 3, y: 8, r: 14 }, { x: 5, y: 6, r: 20 }, { x: 7, y: 12, r: 10 }, { x: 9, y: 9, r: 18 }] },
  heatmap: { matrix: [[2, 4, 6, 3], [5, 8, 7, 4], [9, 11, 12, 8], [6, 9, 10, 7]] },
  histogram: { values: [12, 15, 12, 18, 22, 14, 16, 19, 21, 13, 17, 20, 15, 24, 18, 11, 14, 19, 22, 16, 13, 17, 21, 18, 15] },
  gauge: { values: [73, 100] },
};

let state: GraphicsState;
let canvasElement: HTMLCanvasElement | null = null;
let dataTextarea: HTMLTextAreaElement | null = null;

function isRecord(value: unknown): value is GraphicsStateRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function defaultState(): GraphicsState {
  return {
    type: 'line',
    palette: 'neon',
    title: 'Operações por mês',
    showGrid: true,
    showLabels: true,
    showValues: false,
    rawData: JSON.stringify(PRESETS.line, null, 2),
  };
}

function loadState(): GraphicsState {
  const saved: unknown = storage.get<unknown>(STORAGE_KEY, null);
  if (!isRecord(saved)) return defaultState();
  const fallback = defaultState();
  return {
    type: typeof saved.type === 'string' && saved.type in CHART_TYPES ? saved.type : fallback.type,
    palette: typeof saved.palette === 'string' && saved.palette in PALETTES ? saved.palette : fallback.palette,
    title: typeof saved.title === 'string' ? saved.title : fallback.title,
    showGrid: typeof saved.showGrid === 'boolean' ? saved.showGrid : fallback.showGrid,
    showLabels: typeof saved.showLabels === 'boolean' ? saved.showLabels : fallback.showLabels,
    showValues: typeof saved.showValues === 'boolean' ? saved.showValues : fallback.showValues,
    rawData: typeof saved.rawData === 'string' ? saved.rawData : fallback.rawData,
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function isChartData(value: unknown): value is ChartData {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function parseData(raw: string, type: string): { readonly data: ChartData; readonly error: string | null } {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isChartData(parsed)) return { data: PRESETS[type] ?? PRESETS.line, error: 'os dados precisam ser um objeto JSON' };
    return { data: parsed, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { data: PRESETS[type] ?? PRESETS.line, error: message };
  }
}

function renderChart(): void {
  if (!canvasElement) return;
  const parsed = parseData(state.rawData, state.type);
  drawChart(canvasElement, state.type, parsed.data, {
    title: state.title,
    palette: state.palette,
    showGrid: state.showGrid,
    showLabels: state.showLabels,
    showValues: state.showValues,
  });
  const errorElement = document.getElementById('graficos-err');
  if (errorElement) {
    errorElement.textContent = parsed.error ? `⚠ ${parsed.error}` : '';
    errorElement.classList.toggle('is-error', Boolean(parsed.error));
  }
}

function renderTypeSelector(): HTMLDivElement {
  const wrapper = h('div', { className: 'graficos-types' });
  Object.entries(CHART_TYPES).forEach(([id, definition]) => {
    wrapper.appendChild(h('button', {
      className: cx('graficos-type', state.type === id && 'is-active'),
      title: definition.needs,
      'data-t': id,
      onclick: () => {
        state.type = id;
        state.rawData = JSON.stringify(PRESETS[id] ?? PRESETS.line, null, 2);
        if (dataTextarea) dataTextarea.value = state.rawData;
        persist();
        document.querySelectorAll<HTMLElement>('.graficos-type').forEach((button) => {
          button.classList.toggle('is-active', button.dataset.t === id);
        });
        renderChart();
      },
    },
      h('span', { className: 'graficos-type__icon' }, definition.icon),
      h('span', { className: 'graficos-type__label' }, definition.label),
    ));
  });
  return wrapper;
}

function renderToolbar(): HTMLDivElement {
  const palette = h('select', {
    className: 'input',
    onchange: (event: Event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLSelectElement)) return;
      state.palette = target.value;
      persist();
      renderChart();
    },
  });
  Object.keys(PALETTES).forEach((paletteName) => {
    palette.appendChild(h('option', { value: paletteName, selected: state.palette === paletteName }, paletteName));
  });
  const title = h('input', {
    className: 'input', type: 'text', value: state.title, placeholder: 'Título',
    oninput: debounce((event: Event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLInputElement)) return;
      state.title = target.value;
      persist();
      renderChart();
    }, 120),
  });
  const toggle = (key: ToggleKey, label: string): HTMLLabelElement => {
    const checkbox = h('input', {
      type: 'checkbox', id: key, checked: state[key],
      onchange: (event: Event) => {
        const target = event.currentTarget;
        if (!(target instanceof HTMLInputElement)) return;
        state[key] = target.checked;
        persist();
        renderChart();
      },
    });
    return h('label', { className: 'graficos-toggle' }, checkbox, h('span', null, label));
  };
  const exportButton = h('button', {
    className: 'btn btn--primary btn--sm',
    onclick: () => {
      if (!canvasElement) return;
      exportPNG(canvasElement, `baluarte-${state.type}.png`);
      toast('PNG exportado', { type: 'success' });
    },
  }, '⎙ Exportar PNG');
  return h('div', { className: 'graficos-toolbar' },
    h('label', { className: 'graficos-toolbar__field' }, h('span', null, 'Título'), title),
    h('label', { className: 'graficos-toolbar__field' }, h('span', null, 'Paleta'), palette),
    toggle('showGrid', 'Grid'),
    toggle('showLabels', 'Labels'),
    toggle('showValues', 'Valores'),
    exportButton,
  );
}

function renderEditor(): HTMLDivElement {
  dataTextarea = h('textarea', {
    className: 'input graficos-data',
    'aria-label': 'Dados do gráfico em JSON',
    rows: 18,
    spellcheck: 'false',
    value: state.rawData,
    oninput: debounce((event: Event) => {
      const target = event.currentTarget;
      if (!(target instanceof HTMLTextAreaElement)) return;
      state.rawData = target.value;
      persist();
      renderChart();
    }, 200),
  });
  const errorElement = h('div', { id: 'graficos-err', className: 'graficos-err' });
  return h('div', { className: 'graficos-editor' },
    h('div', { className: 'graficos-editor__head' },
      h('h3', { style: { margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-cyan)' } }, '✎ Dados JSON'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: () => {
          state.rawData = JSON.stringify(PRESETS[state.type] ?? PRESETS.line, null, 2);
          if (dataTextarea) dataTextarea.value = state.rawData;
          persist();
          renderChart();
          toast('Preset restaurado', { type: 'info' });
        },
      }, '⟲ reset'),
    ),
    dataTextarea,
    errorElement,
    h('div', { className: 'graficos-editor__hint u-text-muted' },
      'Formato: ', h('code', null, '{ labels, values }'), ' · scatter/bubble: ', h('code', null, '{ points: [{x,y,r}] }'),
      ' · heatmap: ', h('code', null, '{ matrix: [[]] }'), ' · gauge: ', h('code', null, '{ values: [atual, max] }'),
    ),
  );
}

export function graficosPage(): HTMLDivElement {
  state = loadState();
  const page = h('div', { className: 'page-graficos' });
  page.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'FERRAMENTAS'), h('span', null, '›'), h('span', null, 'GERADOR DE GRÁFICOS')),
      h('h1', { className: 'page-header__title' }, '◢ Gerador de Gráficos'),
      h('p', { className: 'page-header__description' },
        '12 tipos em Canvas 2D puro: linha, barra (V/H), pizza, donut, área, radar, scatter, bolha, heatmap, histograma, gauge. ',
        h('span', { className: 'u-text-cyan' }, 'Exporta PNG'), '.'),
    ),
  );
  page.appendChild(renderTypeSelector());
  page.appendChild(renderToolbar());
  canvasElement = h('canvas', { className: 'graficos-canvas', width: 800, height: 500 });
  const main = h('div', { className: 'graficos-main' },
    renderEditor(),
    h('div', { className: 'graficos-preview' }, canvasElement),
  );
  page.appendChild(main);
  const resizeHandler = debounce(() => renderChart(), 100);
  const initialTimer = setTimeout(() => {
    renderChart();
    window.addEventListener('resize', resizeHandler);
  }, 50);
  aoSair(page, () => {
    clearTimeout(initialTimer);
    window.removeEventListener('resize', resizeHandler);
    if (canvasElement?.parentElement === page) canvasElement = null;
  });
  return page;
}
