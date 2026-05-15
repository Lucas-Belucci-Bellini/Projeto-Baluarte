/**
 * Página /graficos — Gerador de Gráficos (Fase 9).
 *
 * Layout (desktop):
 *   ┌─ controles (tipo, paleta, opções) ─────────────────┐
 *   ├─ editor de dados (left) ┃ preview canvas (right) ──┤
 *   └─────────────────────────────────────────────────────┘
 *
 * Suporta 12 tipos. Persistência em localStorage.
 */

import { h, cx, debounce, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import { toast } from '../utils/toast.js';
import { CHART_TYPES, PALETTES, drawChart, exportPNG } from '../utils/chart-engine.js';

const STORAGE_KEY = 'graficos:state';

/* Datasets padrão por tipo */
const PRESETS = {
  line:      { labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'], values: [12, 19, 8, 15, 25, 22, 30] },
  bar:       { labels: ['ALFA', 'BRAVO', 'CHARLIE', 'DELTA', 'ECHO'], values: [42, 38, 51, 29, 47] },
  hbar:      { labels: ['Tank', 'Sniper', 'Médico', 'Demolidor', 'Eclair'], values: [85, 72, 60, 95, 50] },
  pie:       { labels: ['Operacional', 'Recon', 'Logística', 'Médico'], values: [45, 25, 20, 10] },
  donut:     { labels: ['Operacional', 'Recon', 'Logística', 'Médico'], values: [45, 25, 20, 10] },
  area:      { labels: ['Q1', 'Q2', 'Q3', 'Q4'], values: [100, 150, 130, 180] },
  radar:     { labels: ['Velocidade', 'Força', 'Stealth', 'Tech', 'Combate', 'Resistência'], values: [75, 85, 60, 90, 80, 70] },
  scatter:   { points: [{x:1,y:5},{x:2,y:7},{x:3,y:6},{x:4,y:9},{x:5,y:12},{x:6,y:14},{x:7,y:11},{x:8,y:16}] },
  bubble:    { points: [{x:1,y:5,r:8},{x:3,y:8,r:14},{x:5,y:6,r:20},{x:7,y:12,r:10},{x:9,y:9,r:18}] },
  heatmap:   { matrix: [[2,4,6,3],[5,8,7,4],[9,11,12,8],[6,9,10,7]] },
  histogram: { values: [12, 15, 12, 18, 22, 14, 16, 19, 21, 13, 17, 20, 15, 24, 18, 11, 14, 19, 22, 16, 13, 17, 21, 18, 15] },
  gauge:     { values: [73, 100] }
};

let state = null;
let canvasEl = null;
let dataTextarea = null;
let typeSelectEl = null;

function loadState() {
  return storage.get(STORAGE_KEY) || {
    type: 'line',
    palette: 'neon',
    title: 'Operações por mês',
    showGrid: true,
    showLabels: true,
    showValues: false,
    rawData: JSON.stringify(PRESETS.line, null, 2)
  };
}

function persist() {
  storage.set(STORAGE_KEY, state);
}

function parseData(raw, type) {
  try {
    const obj = JSON.parse(raw);
    return { data: obj, error: null };
  } catch (e) {
    return { data: PRESETS[type] || PRESETS.line, error: e.message };
  }
}

function renderChart() {
  if (!canvasEl) return;
  const { data, error } = parseData(state.rawData, state.type);
  drawChart(canvasEl, state.type, data, {
    title: state.title,
    palette: state.palette,
    showGrid: state.showGrid,
    showLabels: state.showLabels,
    showValues: state.showValues
  });
  const errEl = document.getElementById('graficos-err');
  if (errEl) {
    errEl.textContent = error ? '⚠ ' + error : '';
    errEl.classList.toggle('is-error', !!error);
  }
}

/* ===== Tipo selector ===== */

function renderTypeSelector() {
  const wrap = h('div', { className: 'graficos-types' });
  Object.entries(CHART_TYPES).forEach(([id, def]) => {
    wrap.appendChild(
      h('button', {
        className: cx('graficos-type', state.type === id && 'is-active'),
        title: def.needs,
        onclick: () => {
          state.type = id;
          /* Carrega preset apropriado se não há dados compatíveis */
          state.rawData = JSON.stringify(PRESETS[id], null, 2);
          if (dataTextarea) dataTextarea.value = state.rawData;
          persist();
          document.querySelectorAll('.graficos-type').forEach((b) =>
            b.classList.toggle('is-active', b.dataset.t === id)
          );
          renderChart();
        },
        'data-t': id
      },
        h('span', { className: 'graficos-type__icon' }, def.icon),
        h('span', { className: 'graficos-type__label' }, def.label)
      )
    );
  });
  return wrap;
}

/* ===== Toolbar (paleta + opções + export) ===== */

function renderToolbar() {
  const palette = h('select', {
    className: 'input',
    onchange: (e) => { state.palette = e.target.value; persist(); renderChart(); }
  });
  Object.keys(PALETTES).forEach((p) =>
    palette.appendChild(h('option', { value: p, selected: state.palette === p }, p))
  );

  const title = h('input', {
    className: 'input', type: 'text', value: state.title, placeholder: 'Título',
    oninput: debounce((e) => { state.title = e.target.value; persist(); renderChart(); }, 120)
  });

  function toggle(id, label) {
    const cb = h('input', {
      type: 'checkbox', id, checked: state[id],
      onchange: (e) => { state[id] = e.target.checked; persist(); renderChart(); }
    });
    return h('label', { className: 'graficos-toggle' }, cb, h('span', null, label));
  }

  const exportBtn = h('button', {
    className: 'btn btn--primary btn--sm',
    onclick: () => {
      exportPNG(canvasEl, `baluarte-${state.type}.png`);
      toast('PNG exportado', { type: 'success' });
    }
  }, '⎙ Exportar PNG');

  return h('div', { className: 'graficos-toolbar' },
    h('label', { className: 'graficos-toolbar__field' },
      h('span', null, 'Título'), title
    ),
    h('label', { className: 'graficos-toolbar__field' },
      h('span', null, 'Paleta'), palette
    ),
    toggle('showGrid', 'Grid'),
    toggle('showLabels', 'Labels'),
    toggle('showValues', 'Valores'),
    exportBtn
  );
}

/* ===== Editor de dados ===== */

function renderEditor() {
  dataTextarea = h('textarea', {
    className: 'input graficos-data',
    rows: 18,
    spellcheck: 'false',
    value: state.rawData,
    oninput: debounce((e) => {
      state.rawData = e.target.value;
      persist();
      renderChart();
    }, 200)
  });

  const errEl = h('div', { id: 'graficos-err', className: 'graficos-err' });

  return h('div', { className: 'graficos-editor' },
    h('div', { className: 'graficos-editor__head' },
      h('h3', { style: { margin: 0, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-cyan)' } },
        '✎ Dados JSON'),
      h('button', {
        className: 'btn btn--ghost btn--sm',
        onclick: () => {
          state.rawData = JSON.stringify(PRESETS[state.type], null, 2);
          dataTextarea.value = state.rawData;
          persist();
          renderChart();
          toast('Preset restaurado', { type: 'info' });
        }
      }, '⟲ reset')
    ),
    dataTextarea,
    errEl,
    h('div', { className: 'graficos-editor__hint u-text-muted' },
      'Formato: ',
      h('code', null, '{ labels, values }'),
      ' · scatter/bubble: ',
      h('code', null, '{ points: [{x,y,r}] }'),
      ' · heatmap: ',
      h('code', null, '{ matrix: [[]] }'),
      ' · gauge: ',
      h('code', null, '{ values: [atual, max] }')
    )
  );
}

/* ===== Page builder ===== */

export function graficosPage() {
  state = loadState();

  const fullPage = h('div', { className: 'page-graficos' });

  fullPage.appendChild(
    h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'FERRAMENTAS'),
        h('span', null, '›'),
        h('span', null, 'GERADOR DE GRÁFICOS')
      ),
      h('h1', { className: 'page-header__title' }, '◢ Gerador de Gráficos'),
      h('p', { className: 'page-header__description' },
        '12 tipos em Canvas 2D puro: linha, barra (V/H), pizza, donut, área, radar, scatter, bolha, heatmap, histograma, gauge. ',
        h('span', { className: 'u-text-cyan' }, 'Exporta PNG'),
        '.'
      )
    )
  );

  /* Type selector */
  fullPage.appendChild(renderTypeSelector());

  /* Toolbar */
  fullPage.appendChild(renderToolbar());

  /* Main: editor + canvas */
  canvasEl = h('canvas', {
    className: 'graficos-canvas',
    width: 800,
    height: 500
  });

  const main = h('div', { className: 'graficos-main' },
    renderEditor(),
    h('div', { className: 'graficos-preview' },
      canvasEl
    )
  );
  fullPage.appendChild(main);

  /* Render inicial — usa requestAnimationFrame pra garantir que o canvas tem dimensões */
  setTimeout(() => {
    renderChart();
    /* Re-render no resize da janela */
    const resizeHandler = debounce(() => renderChart(), 100);
    window.addEventListener('resize', resizeHandler);
  }, 50);

  return fullPage;
}
