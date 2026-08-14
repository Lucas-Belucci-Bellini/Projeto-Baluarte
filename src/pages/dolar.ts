import '../styles/dolar.css';
import { h, cx, empty } from '../utils/helpers.js';
import { storage } from '../core/storage.js';
import cambioUrl from '../data/cambio-historico.json?url';

const STORAGE_KEY = 'dolar:state';
const REPORTS_URL = 'https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/tree/main/reports/cambio';

type CoinKey = 'USD' | 'EUR' | 'BTC';
type RangeId = 0 | 7 | 30 | 90;

interface CoinMeta {
  readonly key: CoinKey;
  readonly icon: string;
  readonly label: string;
  readonly color: string;
  readonly dec: number;
}

interface RangeOption {
  readonly id: RangeId;
  readonly label: string;
}

interface ChangePoint {
  readonly t: number;
  readonly v: number;
}

interface CambioData {
  readonly meta?: { readonly updatedAt?: string };
  readonly series: Partial<Record<CoinKey, readonly ChangePoint[]>>;
}

interface DolarState {
  coin: CoinKey;
  range: RangeId;
}

interface Stats {
  readonly cur: number;
  readonly first: number;
  readonly min: number;
  readonly max: number;
  readonly avg: number;
  readonly pct: number;
}

const COINS: readonly CoinMeta[] = [
  { key: 'USD', icon: '💵', label: 'Dólar', color: '#d4a24e', dec: 4 },
  { key: 'EUR', icon: '💶', label: 'Euro', color: '#e8c07a', dec: 4 },
  { key: 'BTC', icon: '₿', label: 'Bitcoin', color: '#ffaa00', dec: 0 },
];
const RANGES: readonly RangeOption[] = [
  { id: 7, label: '7 dias' },
  { id: 30, label: '30 dias' },
  { id: 90, label: '90 dias' },
  { id: 0, label: 'Tudo' },
];

let state: DolarState = { coin: 'USD', range: 30 };
let data: CambioData | null = null;
let status: 'loading' | 'ok' | 'error' = 'loading';
let rootEl: HTMLDivElement | null = null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isCoinKey(value: unknown): value is CoinKey {
  return value === 'USD' || value === 'EUR' || value === 'BTC';
}

function isRangeId(value: unknown): value is RangeId {
  return value === 0 || value === 7 || value === 30 || value === 90;
}

function parsePoints(value: unknown): ChangePoint[] {
  if (!Array.isArray(value)) return [];
  return value.filter((point): point is ChangePoint => {
    if (!isRecord(point)) return false;
    return typeof point.t === 'number' && Number.isFinite(point.t)
      && typeof point.v === 'number' && Number.isFinite(point.v);
  });
}

function parseCambio(value: unknown): CambioData | null {
  if (!isRecord(value) || !isRecord(value.series)) return null;
  const series: Partial<Record<CoinKey, readonly ChangePoint[]>> = {};
  for (const key of COINS.map((coin) => coin.key)) {
    series[key] = parsePoints(value.series[key]);
  }
  const meta = isRecord(value.meta) && typeof value.meta.updatedAt === 'string'
    ? { updatedAt: value.meta.updatedAt }
    : undefined;
  return { meta, series };
}

function loadState(): DolarState {
  const saved: unknown = storage.get(STORAGE_KEY);
  if (!isRecord(saved)) return { coin: 'USD', range: 30 };
  return {
    coin: isCoinKey(saved.coin) ? saved.coin : 'USD',
    range: isRangeId(saved.range) ? saved.range : 30,
  };
}

function persist(): void {
  storage.set(STORAGE_KEY, state);
}

function coinMeta(key: CoinKey): CoinMeta {
  return COINS.find((coin) => coin.key === key) ?? COINS[0];
}

async function loadCambio(): Promise<void> {
  try {
    const response = await fetch(cambioUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const parsed: unknown = await response.json();
    const nextData = parseCambio(parsed);
    if (!nextData) throw new Error('formato de câmbio inválido');
    data = nextData;
    status = 'ok';
  } catch {
    status = 'error';
  }
}

function seriesFor(key: CoinKey, days: number): readonly ChangePoint[] {
  const series = data?.series[key] ?? [];
  if (!days || !series.length) return series;
  const now = series[series.length - 1].t;
  return series.filter((point) => point.t >= now - days * 864e5);
}

function fmtMoney(value: number | null, decimals: number): string {
  if (value == null) return '—';
  return value.toLocaleString('pt-BR', {
    style: 'currency', currency: 'BRL', minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });
}

function fmtPct(value: number | null): string {
  if (value == null) return '—';
  return `${value >= 0 ? '▲ +' : '▼ '}${value.toFixed(2)}%`;
}

function trendClass(value: number | null): string {
  return value == null ? 'u-text-muted' : value >= 0 ? 'u-text-success' : 'u-text-danger';
}

function calcStats(points: readonly ChangePoint[]): Stats | null {
  if (!points.length) return null;
  const values = points.map((point) => point.v);
  const cur = values[values.length - 1];
  const first = values[0];
  return {
    cur,
    first,
    min: Math.min(...values),
    max: Math.max(...values),
    avg: values.reduce((total, value) => total + value, 0) / values.length,
    pct: first ? (cur / first - 1) * 100 : 0,
  };
}

function variation(key: CoinKey, days: number): number | null {
  return calcStats(seriesFor(key, days))?.pct ?? null;
}

function chartSvg(points: readonly ChangePoint[], color: string): string {
  if (points.length < 2) return '<div class="dolar-chart__empty u-text-muted">Sem dados suficientes nesta janela.</div>';
  const width = 820;
  const height = 260;
  const paddingX = 6;
  const paddingY = 20;
  const timestamps = points.map((point) => point.t);
  const values = points.map((point) => point.v);
  const minT = timestamps[0];
  const maxT = timestamps[timestamps.length - 1];
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const spanT = maxT - minT || 1;
  const spanV = maxV - minV || 1;
  const x = (timestamp: number): number => paddingX + ((timestamp - minT) / spanT) * (width - 2 * paddingX);
  const y = (value: number): number => paddingY + (1 - (value - minV) / spanV) * (height - 2 * paddingY);
  const line = points.map((point, index) => `${index ? 'L' : 'M'}${x(point.t).toFixed(1)},${y(point.v).toFixed(1)}`).join(' ');
  const area = `M${x(minT).toFixed(1)},${height - paddingY} ${points.map((point) => `L${x(point.t).toFixed(1)},${y(point.v).toFixed(1)}`).join(' ')} L${x(maxT).toFixed(1)},${height - paddingY} Z`;
  const lastX = x(maxT).toFixed(1);
  const lastY = y(values[values.length - 1]).toFixed(1);
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" class="dolar-chart__svg" role="img" aria-label="gráfico de preço">
    <defs><linearGradient id="dolarFill" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity="0.30"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    <path d="${area}" fill="url(#dolarFill)"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2" vector-effect="non-scaling-stroke" stroke-linejoin="round"/>
    <circle cx="${lastX}" cy="${lastY}" r="3.5" fill="${color}"/>
  </svg>`;
}

function fmtDay(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

function statCard(label: string, value: string): HTMLDivElement {
  return h('div', { className: 'dolar-stat' },
    h('div', { className: 'dolar-stat__label u-text-muted' }, label),
    h('div', { className: 'dolar-stat__value u-mono' }, value));
}

function render(): void {
  if (!rootEl) return;
  empty(rootEl);
  rootEl.appendChild(h('div', { className: 'page-header anim-fade-in', style: { marginBottom: '12px' } },
    h('div', { className: 'page-header__crumbs' }, h('span', null, 'BALUARTE'), h('span', null, '›'), h('span', null, 'CÂMBIO')),
    h('h1', { className: 'page-header__title' }, '💹 Radar do Câmbio'),
    h('p', { className: 'page-header__description' },
      'Histórico de ', h('span', { className: 'u-text-cyan' }, 'Dólar, Euro e Bitcoin'),
      ' (em R$). Coletado automaticamente a cada 12h. ',
      data?.meta?.updatedAt ? `Atualizado: ${new Date(data.meta.updatedAt).toLocaleString('pt-BR')}.` : '')));

  if (status === 'loading') {
    rootEl.appendChild(h('div', { className: 'dolar-note u-text-muted' }, 'Carregando o histórico…'));
    return;
  }
  if (status === 'error') {
    rootEl.appendChild(h('div', { className: 'dolar-note u-text-danger' }, 'Não consegui carregar o histórico. Recarregue a página.'));
    return;
  }

  const meta = coinMeta(state.coin);
  rootEl.appendChild(h('div', { className: 'dolar-coins' }, ...COINS.map((coin) => h('button', {
    className: cx('dolar-coin', state.coin === coin.key && 'is-active'),
    style: state.coin === coin.key ? `--coin: ${coin.color}; border-color:${coin.color};` : `--coin:${coin.color};`,
    onclick: (): void => { state.coin = coin.key; persist(); render(); },
  }, h('span', { className: 'dolar-coin__icon' }, coin.icon), h('span', null, `${coin.label} (${coin.key})`)))));

  const points = seriesFor(state.coin, state.range);
  const stats = calcStats(points);
  rootEl.appendChild(h('div', { className: 'dolar-hero', style: `--coin: ${meta.color};` },
    h('div', { className: 'dolar-hero__main' },
      h('div', { className: 'dolar-hero__label u-text-muted' }, `${meta.icon} ${meta.label} · 1 ${meta.key} =`),
      h('div', { className: 'dolar-hero__value' }, stats ? fmtMoney(stats.cur, meta.dec) : '—'),
      h('div', { className: cx('dolar-hero__pct', trendClass(stats?.pct ?? null)) }, stats ? `${fmtPct(stats.pct)} no período` : '')),
    h('div', { className: 'dolar-hero__quick' }, ...([1, 7, 30] as const).map((days) => {
      const periodLabel = days === 1 ? 'Dia' : days === 7 ? 'Semana' : 'Mês';
      const periodValue = variation(state.coin, days);
      return h('div', { className: 'dolar-quick' },
        h('div', { className: 'dolar-quick__label u-text-muted' }, periodLabel),
        h('div', { className: cx('dolar-quick__val', trendClass(periodValue)) }, fmtPct(periodValue)));
    }))));

  rootEl.appendChild(h('div', { className: 'dolar-ranges' }, ...RANGES.map((range) => h('button', {
    className: cx('dolar-range', state.range === range.id && 'is-active'),
    onclick: (): void => { state.range = range.id; persist(); render(); },
  }, range.label))));

  const chart = h('div', { className: 'dolar-chart' });
  chart.innerHTML = chartSvg(points, meta.color);
  rootEl.appendChild(h('div', { className: 'dolar-chart-wrap' },
    h('div', { className: 'dolar-chart__axis dolar-chart__axis--max u-mono u-text-muted' }, stats ? fmtMoney(stats.max, meta.dec) : ''),
    chart,
    h('div', { className: 'dolar-chart__axis dolar-chart__axis--min u-mono u-text-muted' }, stats ? fmtMoney(stats.min, meta.dec) : ''),
    points.length >= 2 && h('div', { className: 'dolar-chart__dates u-text-muted u-mono' }, h('span', null, fmtDay(points[0].t)), h('span', null, fmtDay(points[points.length - 1].t)))));

  if (stats) rootEl.appendChild(h('div', { className: 'dolar-stats' },
    statCard('Mínima', fmtMoney(stats.min, meta.dec)),
    statCard('Máxima', fmtMoney(stats.max, meta.dec)),
    statCard('Média', fmtMoney(stats.avg, meta.dec)),
    statCard('Pontos', String(points.length))));

  rootEl.appendChild(h('div', { className: 'dolar-reports' },
    h('div', { className: 'dolar-reports__title' }, '📑 Relatórios automáticos'),
    h('p', { className: 'u-text-muted', style: { fontSize: '12px', margin: '0 0 8px' } }, 'Diário, semanal e mensal — gerados a cada 12h e versionados no GitHub.'),
    h('a', { className: 'btn btn--ghost btn--sm', href: REPORTS_URL, target: '_blank', rel: 'noopener' }, '↗ Ver relatórios no GitHub')));
}

export function dolarPage(): HTMLDivElement {
  state = loadState();
  data = null;
  status = 'loading';
  rootEl = h('div', { className: 'page-dolar' });
  render();
  void loadCambio().then(render);
  return rootEl;
}
