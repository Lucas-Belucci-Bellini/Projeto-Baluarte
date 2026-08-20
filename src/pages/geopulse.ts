/**
 * Página /geo — GeoPulse (trilha de localização no tempo).
 *
 * Registra a localização, desenha a trajetória em Canvas e mostra distância,
 * duração e velocidades. A trilha continua persistida pelo motor GeoTracker.
 */

import '../styles/geopulse.css';
import { h, empty } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import { toast } from '../utils/toast';
import { createGeoTracker } from '../utils/geo-tracker';
import type { GeoPoint, GeoTracker } from '../utils/geo-tracker';
import type { Point2D } from '../utils/triangulation';

type StatKey = 'count' | 'dist' | 'dur' | 'avg' | 'max' | 'cur';

function fmtDist(meters: number): string {
  if (meters < 1000) return `${meters.toFixed(0)} m`;
  return `${(meters / 1000).toFixed(2)} km`;
}

function fmtDur(milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainder = seconds % 60;
  const pad2 = (value: number): string => String(value).padStart(2, '0');
  return hours > 0
    ? `${hours}:${pad2(minutes)}:${pad2(remainder)}`
    : `${pad2(minutes)}:${pad2(remainder)}`;
}

function kmh(metersPerSecond: number): string {
  return `${(metersPerSecond * 3.6).toFixed(1)} km/h`;
}

export function geopulsePage(): HTMLDivElement {
  const tracker = createGeoTracker();
  const page = h('div', { className: 'page-geo' });

  page.append(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'TÁTICO'),
        h('span', null, '›'),
        h('span', null, 'GEOPULSE'),
      ),
      h('h1', { className: 'page-header__title' }, '🛰 GeoPulse'),
      h('p', { className: 'page-header__description' },
        'Sua ',
        h('span', { className: 'u-text-cyan' }, 'trilha de localização'),
        ' no tempo — trajetória, distância e velocidade. Funciona no celular (precisa permitir a localização).',
      ),
    ),
  );

  const statRefs: Partial<Record<StatKey, HTMLSpanElement>> = {};
  const statItem = (key: StatKey, label: string): HTMLDivElement => {
    const value = h('span', { className: 'geo-stat__val u-mono' }, '—');
    statRefs[key] = value;
    return h('div', { className: 'geo-stat' },
      h('span', { className: 'geo-stat__lbl' }, label),
      value,
    );
  };
  const statsBar = h('div', { className: 'geo-stats card' },
    statItem('count', 'PONTOS'),
    statItem('dist', 'DISTÂNCIA'),
    statItem('dur', 'DURAÇÃO'),
    statItem('avg', 'VEL. MÉDIA'),
    statItem('max', 'VEL. MÁX'),
    statItem('cur', 'POSIÇÃO'),
  );
  const setStat = (key: StatKey, value: string): void => {
    const element = statRefs[key];
    if (element) element.textContent = value;
  };

  const canvas = h('canvas', { className: 'geo-canvas', width: 640, height: 360 });
  const listEl = h('div', { className: 'geo-list' });

  const startBtn = h('button', {
    className: 'btn btn--primary',
    onclick: toggle,
  }, '▸ Iniciar');
  const clearBtn = h('button', {
    className: 'btn btn--ghost',
    onclick: () => {
      if (tracker.isRunning()) {
        toast('Pare a trilha antes de limpar.', { type: 'warning' });
        return;
      }
      tracker.clear();
      refresh();
      toast('Trilha apagada.');
    },
  }, '🗑 Limpar');
  const demoBtn = h('button', {
    className: 'btn btn--ghost',
    onclick: () => {
      if (tracker.isRunning()) {
        toast('Pare a trilha antes de simular.', { type: 'warning' });
        return;
      }
      tracker.clear();
      simulateDemoTrack(tracker);
      refresh();
      toast('Trilha de demonstração carregada.', { type: 'success' });
    },
  }, '◉ Demo');
  const controls = h('div', { className: 'geo-controls card' }, startBtn, clearBtn, demoBtn);

  function toggle(): void {
    if (tracker.isRunning()) {
      tracker.stop();
      startBtn.textContent = '▸ Iniciar';
      startBtn.classList.remove('is-rec');
      toast('Trilha pausada.');
      return;
    }
    const started = tracker.start(
      refresh,
      (message: string) => {
        toast(message, { type: 'warning' });
        startBtn.textContent = '▸ Iniciar';
        startBtn.classList.remove('is-rec');
      },
    );
    if (started) {
      startBtn.textContent = '⏸ Parar';
      startBtn.classList.add('is-rec');
      toast('Rastreando… permita a localização.', { type: 'success' });
    }
  }

  function refresh(): void {
    const stats = tracker.stats();
    setStat('count', String(stats.count));
    setStat('dist', fmtDist(stats.dist));
    setStat('dur', fmtDur(stats.dur));
    setStat('avg', kmh(stats.avg));
    setStat('max', kmh(stats.maxSpd));
    setStat('cur', stats.cur ? `${stats.cur.lat.toFixed(5)}, ${stats.cur.lon.toFixed(5)}` : '—');
    const points = tracker.getPoints();
    drawTrack(canvas, points);
    renderList(listEl, points);
  }

  page.append(
    statsBar,
    controls,
    h('div', { className: 'geo-scope card' },
      h('div', { className: 'geo-scope__head' },
        h('span', null, '🗺 TRAJETÓRIA'),
        h('span', { className: 'u-text-muted u-mono' }, 'início ● · atual ●'),
      ),
      canvas,
    ),
    h('div', { className: 'geo-panel card' },
      h('div', { className: 'geo-scope__head' }, h('span', null, '📍 PONTOS')),
      listEl,
    ),
  );

  refresh();
  aoSair(page, () => tracker.stop());
  return page;
}

function drawTrack(canvas: HTMLCanvasElement, points: readonly GeoPoint[]): void {
  const context = canvas.getContext('2d');
  if (!context) return;
  const width = canvas.width;
  const height = canvas.height;
  context.fillStyle = '#020409';
  context.fillRect(0, 0, width, height);
  context.strokeStyle = 'rgba(150,180,255,0.08)';
  context.lineWidth = 1;
  for (let index = 1; index < 8; index += 1) {
    const x = (width / 8) * index;
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, height);
    context.stroke();
  }
  for (let index = 1; index < 5; index += 1) {
    const y = (height / 5) * index;
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(width, y);
    context.stroke();
  }

  if (points.length === 0) {
    context.fillStyle = '#93a4bf';
    context.font = '13px "JetBrains Mono", monospace';
    context.fillText('Sem trilha ainda — toque em Iniciar e permita a localização.', 18, height / 2);
    return;
  }

  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;
  for (const point of points) {
    if (point.lat < minLat) minLat = point.lat;
    if (point.lat > maxLat) maxLat = point.lat;
    if (point.lon < minLon) minLon = point.lon;
    if (point.lon > maxLon) maxLon = point.lon;
  }
  const pad = 30;
  const latMid = (minLat + maxLat) / 2;
  const lonScale = Math.cos(latMid * Math.PI / 180) || 1;
  const spanLat = (maxLat - minLat) || 1e-5;
  const spanLon = ((maxLon - minLon) * lonScale) || 1e-5;
  const scale = Math.min(
    (width - 2 * pad) / spanLon,
    (height - 2 * pad) / spanLat,
  );
  const project = (point: GeoPoint): Point2D => ({
    x: pad + (point.lon - minLon) * lonScale * scale,
    y: height - pad - (point.lat - minLat) * scale,
  });

  context.strokeStyle = '#d4a24e';
  context.lineWidth = 2;
  context.beginPath();
  points.forEach((point, index) => {
    const projected = project(point);
    if (index === 0) context.moveTo(projected.x, projected.y);
    else context.lineTo(projected.x, projected.y);
  });
  context.stroke();

  const first = project(points[0]);
  context.fillStyle = '#00ff66';
  context.beginPath();
  context.arc(first.x, first.y, 5, 0, Math.PI * 2);
  context.fill();
  const last = project(points[points.length - 1]);
  context.fillStyle = '#e8c07a';
  context.beginPath();
  context.arc(last.x, last.y, 6, 0, Math.PI * 2);
  context.fill();
}

function simulateDemoTrack(tracker: GeoTracker): void {
  const baseLat = -15.7942;
  const baseLon = -47.8825;
  const now = Date.now();
  let lat = baseLat;
  let lon = baseLon;
  let heading = 0.3;
  for (let index = 0; index < 80; index += 1) {
    heading += (Math.random() - 0.5) * 0.4;
    lat += Math.cos(heading) * 0.00008 + (Math.random() - 0.5) * 0.00004;
    lon += Math.sin(heading) * 0.00012 + (Math.random() - 0.5) * 0.00004;
    const speed = 2 + Math.random() * 3;
    tracker._injectPoint({
      lat,
      lon,
      acc: 5,
      spd: speed,
      t: now - (80 - index) * 8000,
    });
  }
}

function renderList(listEl: HTMLDivElement, points: readonly GeoPoint[]): void {
  empty(listEl);
  if (points.length === 0) {
    listEl.appendChild(h('div', { className: 'u-text-muted u-mono' }, 'sem pontos'));
    return;
  }
  points.slice(-12).reverse().forEach((point) => {
    const time = new Date(point.t).toLocaleTimeString('pt-BR');
    listEl.appendChild(h('div', { className: 'geo-row' },
      h('span', { className: 'geo-row__t u-mono u-text-muted' }, time),
      h('span', { className: 'geo-row__c u-mono' }, `${point.lat.toFixed(5)}, ${point.lon.toFixed(5)}`),
      h('span', { className: 'geo-row__s u-mono u-text-cyan' },
        point.spd !== null ? `${(point.spd * 3.6).toFixed(1)} km/h` : '—'),
    ));
  });
}
