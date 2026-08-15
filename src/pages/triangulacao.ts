/**
 * Página /triangulacao — Triangulação por rumos (bearings).
 *
 * Estações em posições conhecidas medem o ângulo até um alvo; o cruzamento das
 * retas dá a posição. Com ruído, a posição é estimada por mínimos quadrados.
 */

import '../styles/triangulacao.css';
import { h } from '../utils/helpers.js';
import { aoSair } from '../core/ciclo-vida.js';
import {
  triangulate,
  bearingTo,
  gaussianNoise,
  dist,
} from '../utils/triangulation.js';
import type { BearingStation, Point2D } from '../utils/triangulation.js';

type StationCount = 3 | 4 | 5;
type StatKey = 'est' | 'real' | 'err' | 'res';

const PRESETS: Readonly<Record<StationCount, readonly [number, number][]>> = {
  3: [[0.15, 0.82], [0.85, 0.82], [0.5, 0.14]],
  4: [[0.12, 0.85], [0.88, 0.85], [0.12, 0.2], [0.88, 0.2]],
  5: [[0.12, 0.85], [0.88, 0.85], [0.12, 0.2], [0.88, 0.2], [0.5, 0.12]],
};

export function triangulacaoPage(): HTMLElement {
  const page = h('div', { className: 'page-tri' });
  page.append(
    h('div', { className: 'page-header anim-fade-in' },
      h('div', { className: 'page-header__crumbs' },
        h('span', null, 'BALUARTE'),
        h('span', null, '›'),
        h('span', null, 'TÁTICO'),
        h('span', null, '›'),
        h('span', null, 'TRIANGULAÇÃO'),
      ),
      h('h1', { className: 'page-header__title' }, '△ Triangulação'),
      h('p', { className: 'page-header__description' },
        'Localização por cruzamento de rumos. ',
        h('span', { className: 'u-text-cyan' }, 'Arraste o alvo'),
        ' — as estações medem o ângulo com ruído e o ponto é estimado por mínimos quadrados.',
      ),
    ),
  );

  const canvas = h('canvas', { className: 'tri-canvas', width: 640, height: 420 });
  let nStations: StationCount = 4;
  let sigmaDeg = 4;
  let target: Point2D = { x: 320, y: 230 };

  const refs: Record<StatKey, HTMLSpanElement> = {} as Record<StatKey, HTMLSpanElement>;
  function stat(key: StatKey, label: string): HTMLDivElement {
    const value = h('span', { className: 'tri-stat__val u-mono' }, '—');
    refs[key] = value;
    return h('div', { className: 'tri-stat' },
      h('span', { className: 'tri-stat__lbl' }, label),
      value,
    );
  }

  const statsBar = h('div', { className: 'tri-stats card' },
    stat('est', 'ESTIMADO'),
    stat('real', 'REAL'),
    stat('err', 'ERRO'),
    stat('res', 'RESÍDUO'),
  );
  const setStat = (key: StatKey, value: string): void => {
    refs[key].textContent = value;
  };

  const sigmaVal = h('span', { className: 'tri-slider__val u-mono' }, `${sigmaDeg}°`);
  const sigmaSlider = h('input', {
    type: 'range',
    min: 0,
    max: 15,
    step: 0.5,
    value: sigmaDeg,
    className: 'tri-slider',
    'aria-label': 'Erro angular do sensor, em graus',
    oninput: (event: Event) => {
      if (!(event.currentTarget instanceof HTMLInputElement)) return;
      sigmaDeg = Number.parseFloat(event.currentTarget.value);
      sigmaVal.textContent = `${sigmaDeg}°`;
    },
  });

  const stationBtns = h('div', { className: 'tri-seg' },
    ...([3, 4, 5] as const).map((stationCount) => h('button', {
      className: `tri-seg__btn${stationCount === nStations ? ' is-active' : ''}`,
      'data-n': stationCount,
      onclick: () => {
        nStations = stationCount;
        stationBtns.querySelectorAll<HTMLButtonElement>('.tri-seg__btn').forEach((button) => {
          button.classList.toggle('is-active', Number(button.dataset.n) === stationCount);
        });
      },
    }, `${stationCount} estações`)),
  );

  const controls = h('div', { className: 'tri-controls card' },
    h('div', { className: 'tri-ctrl-row' },
      h('span', { className: 'tri-ctrl__lbl' }, 'ESTAÇÕES'),
      stationBtns,
    ),
    h('div', { className: 'tri-ctrl-row' },
      h('span', { className: 'tri-ctrl__lbl' }, 'RUÍDO'),
      h('div', { className: 'tri-slider-wrap' }, sigmaSlider, sigmaVal),
    ),
  );

  page.append(
    statsBar,
    controls,
    h('div', { className: 'tri-scope card' },
      h('div', { className: 'tri-scope__head' },
        h('span', null, '◎ CAMPO'),
        h('span', { className: 'u-text-muted u-mono' }, 'estação ▦ · alvo ● · estimado ✛'),
      ),
      canvas,
    ),
  );

  let dragging = false;
  const setTargetFromEvent = (event: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    target = {
      x: (event.clientX - rect.left) * sx,
      y: (event.clientY - rect.top) * sy,
    };
  };
  canvas.addEventListener('pointerdown', (event: PointerEvent) => {
    dragging = true;
    setTargetFromEvent(event);
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove', (event: PointerEvent) => {
    if (dragging) setTargetFromEvent(event);
  });
  canvas.addEventListener('pointerup', () => {
    dragging = false;
  });
  canvas.addEventListener('pointercancel', () => {
    dragging = false;
  });

  let raf: number | null = null;
  let last = 0;
  function loop(timestamp: number): void {
    raf = requestAnimationFrame(loop);
    if (timestamp - last < 66) return;
    last = timestamp;
    render();
  }

  function stations(): Point2D[] {
    const width = canvas.width;
    const height = canvas.height;
    return PRESETS[nStations].map(([fx, fy]) => ({ x: fx * width, y: fy * height }));
  }

  function render(): void {
    const width = canvas.width;
    const height = canvas.height;
    const stationPoints = stations();
    const sigmaRad = sigmaDeg * Math.PI / 180;
    const measured: BearingStation[] = stationPoints.map((station) => ({
      x: station.x,
      y: station.y,
      bearing: bearingTo(station, target) + gaussianNoise(sigmaRad),
    }));
    const estimate = triangulate(measured);
    const context = canvas.getContext('2d');
    if (!context) return;

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
    for (let index = 1; index < 6; index += 1) {
      const y = (height / 6) * index;
      context.beginPath();
      context.moveTo(0, y);
      context.lineTo(width, y);
      context.stroke();
    }

    const lineLength = Math.hypot(width, height);
    context.strokeStyle = 'rgba(212,162,78,0.35)';
    context.lineWidth = 1.2;
    measured.forEach((measurement) => {
      context.beginPath();
      context.moveTo(measurement.x, measurement.y);
      context.lineTo(
        measurement.x + Math.cos(measurement.bearing) * lineLength,
        measurement.y + Math.sin(measurement.bearing) * lineLength,
      );
      context.stroke();
    });

    context.fillStyle = '#9fb4d8';
    stationPoints.forEach((station, index) => {
      context.fillRect(station.x - 5, station.y - 5, 10, 10);
      context.fillStyle = '#9fb4d8';
      context.font = '11px "JetBrains Mono", monospace';
      context.fillText(`E${index + 1}`, station.x + 8, station.y - 8);
    });

    context.fillStyle = '#e8c07a';
    context.beginPath();
    context.arc(target.x, target.y, 7, 0, Math.PI * 2);
    context.fill();

    if (estimate.ok) {
      context.strokeStyle = '#d4a24e';
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(estimate.x - 10, estimate.y);
      context.lineTo(estimate.x + 10, estimate.y);
      context.moveTo(estimate.x, estimate.y - 10);
      context.lineTo(estimate.x, estimate.y + 10);
      context.stroke();
      context.strokeStyle = 'rgba(255,255,255,0.35)';
      context.setLineDash([4, 4]);
      context.beginPath();
      context.moveTo(estimate.x, estimate.y);
      context.lineTo(target.x, target.y);
      context.stroke();
      context.setLineDash([]);

      setStat('est', `${estimate.x.toFixed(0)}, ${estimate.y.toFixed(0)}`);
      setStat('err', `${dist(estimate, target).toFixed(1)} px`);
      setStat('res', estimate.residual.toFixed(1));
    } else {
      setStat('est', 'singular');
      setStat('err', '—');
      setStat('res', '∞');
    }
    setStat('real', `${target.x.toFixed(0)}, ${target.y.toFixed(0)}`);
  }

  raf = requestAnimationFrame(loop);
  aoSair(page, () => {
    if (raf !== null) cancelAnimationFrame(raf);
    raf = null;
  });
  return page;
}
