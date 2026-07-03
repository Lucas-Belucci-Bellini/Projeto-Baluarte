/**
 * Página /geo — GeoPulse (trilha de localização no tempo).
 *
 * Conceito do geopulse: registra a sua localização (Geolocation API), desenha a
 * trajetória num canvas auto-escalado e mostra estatísticas (distância, duração,
 * velocidade média/máxima). A trilha fica salva — dá pra fechar e continuar.
 */

import '../styles/geopulse.css';
import { h, empty } from '../utils/helpers.js';
import { toast } from '../utils/toast.js';
import { createGeoTracker } from '../utils/geo-tracker.js';

function fmtDist(m) {
  if (m < 1000) return `${m.toFixed(0)} m`;
  return `${(m / 1000).toFixed(2)} km`;
}
function fmtDur(ms) {
  const s = Math.floor(ms / 1000);
  const hh = Math.floor(s / 3600), mm = Math.floor((s % 3600) / 60), ss = s % 60;
  const p2 = (n) => String(n).padStart(2, '0');
  return hh > 0 ? `${hh}:${p2(mm)}:${p2(ss)}` : `${p2(mm)}:${p2(ss)}`;
}
const kmh = (ms) => `${(ms * 3.6).toFixed(1)} km/h`;

export function geopulsePage() {
  const tracker = createGeoTracker();
  const page = h('div', { className: 'page-geo' });

  page.append(h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'TÁTICO'), h('span', null, '›'), h('span', null, 'GEOPULSE')),
    h('h1', { className: 'page-header__title' }, '🛰 GeoPulse'),
    h('p', { className: 'page-header__description' },
      'Sua ', h('span', { className: 'u-text-cyan' }, 'trilha de localização'),
      ' no tempo — trajetória, distância e velocidade. Funciona no celular (precisa permitir a localização).')));

  /* ===== Estatísticas ===== */
  const statRefs = {};
  const statItem = (key, label) => {
    const val = h('span', { className: 'geo-stat__val u-mono' }, '—');
    statRefs[key] = val;
    return h('div', { className: 'geo-stat' }, h('span', { className: 'geo-stat__lbl' }, label), val);
  };
  const statsBar = h('div', { className: 'geo-stats card' },
    statItem('count', 'PONTOS'), statItem('dist', 'DISTÂNCIA'), statItem('dur', 'DURAÇÃO'),
    statItem('avg', 'VEL. MÉDIA'), statItem('max', 'VEL. MÁX'), statItem('cur', 'POSIÇÃO'));
  const setStat = (k, v) => { if (statRefs[k]) statRefs[k].textContent = v; };

  /* ===== Canvas + lista ===== */
  const canvas = h('canvas', { className: 'geo-canvas', width: 640, height: 360 });
  const listEl = h('div', { className: 'geo-list' });

  /* ===== Controles ===== */
  const startBtn = h('button', { className: 'btn btn--primary', onclick: toggle }, '▸ Iniciar');
  const clearBtn = h('button', {
    className: 'btn btn--ghost', onclick: () => {
      if (tracker.isRunning()) { toast('Pare a trilha antes de limpar.', { type: 'warning' }); return; }
      tracker.clear(); refresh(); toast('Trilha apagada.');
    }
  }, '🗑 Limpar');

  const demoBtn = h('button', {
    className: 'btn btn--ghost', onclick: () => {
      if (tracker.isRunning()) { toast('Pare a trilha antes de simular.', { type: 'warning' }); return; }
      tracker.clear();
      simulateDemoTrack(tracker);
      refresh();
      toast('Trilha de demonstração carregada.', { type: 'success' });
    }
  }, '◉ Demo');

  const controls = h('div', { className: 'geo-controls card' }, startBtn, clearBtn, demoBtn);

  function toggle() {
    if (tracker.isRunning()) {
      tracker.stop();
      startBtn.textContent = '▸ Iniciar';
      startBtn.classList.remove('is-rec');
      toast('Trilha pausada.');
      return;
    }
    const ok = tracker.start(refresh, (msg) => {
      toast(msg, { type: 'warning' });
      startBtn.textContent = '▸ Iniciar';
      startBtn.classList.remove('is-rec');
    });
    if (ok) {
      startBtn.textContent = '⏸ Parar';
      startBtn.classList.add('is-rec');
      toast('Rastreando… permita a localização.', { type: 'success' });
    }
  }

  function refresh() {
    const s = tracker.stats();
    setStat('count', String(s.count));
    setStat('dist', fmtDist(s.dist));
    setStat('dur', fmtDur(s.dur));
    setStat('avg', kmh(s.avg));
    setStat('max', kmh(s.maxSpd));
    setStat('cur', s.cur ? `${s.cur.lat.toFixed(5)}, ${s.cur.lon.toFixed(5)}` : '—');
    drawTrack(canvas, tracker.getPoints());
    renderList(listEl, tracker.getPoints());
  }

  page.append(statsBar, controls,
    h('div', { className: 'geo-scope card' },
      h('div', { className: 'geo-scope__head' }, h('span', null, '🗺 TRAJETÓRIA'),
        h('span', { className: 'u-text-muted u-mono' }, 'início ● · atual ●')),
      canvas),
    h('div', { className: 'geo-panel card' },
      h('div', { className: 'geo-scope__head' }, h('span', null, '📍 PONTOS')), listEl));

  refresh();
  window.addEventListener('hashchange', () => tracker.stop(), { once: true });
  return page;
}

/* ===== Desenho da trajetória ===== */
function drawTrack(canvas, pts) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.fillStyle = '#020409';
  ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(150,180,255,0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) { const x = (W / 8) * i; ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let i = 1; i < 5; i++) { const y = (H / 5) * i; ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  if (!pts.length) {
    ctx.fillStyle = '#93a4bf';
    ctx.font = '13px "JetBrains Mono", monospace';
    ctx.fillText('Sem trilha ainda — toque em Iniciar e permita a localização.', 18, H / 2);
    return;
  }

  let minLat = Infinity, maxLat = -Infinity, minLon = Infinity, maxLon = -Infinity;
  for (const p of pts) {
    if (p.lat < minLat) minLat = p.lat; if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon; if (p.lon > maxLon) maxLon = p.lon;
  }
  const pad = 30;
  const latMid = (minLat + maxLat) / 2;
  const lonScale = Math.cos((latMid * Math.PI) / 180) || 1;
  const spanLat = (maxLat - minLat) || 1e-5;
  const spanLon = ((maxLon - minLon) * lonScale) || 1e-5;
  const s = Math.min((W - 2 * pad) / spanLon, (H - 2 * pad) / spanLat);
  const proj = (p) => ({ x: pad + (p.lon - minLon) * lonScale * s, y: H - pad - (p.lat - minLat) * s });

  ctx.strokeStyle = '#d4a24e';
  ctx.lineWidth = 2;
  ctx.beginPath();
  pts.forEach((p, i) => { const q = proj(p); if (i === 0) ctx.moveTo(q.x, q.y); else ctx.lineTo(q.x, q.y); });
  ctx.stroke();

  const a = proj(pts[0]);
  ctx.fillStyle = '#00ff66';
  ctx.beginPath(); ctx.arc(a.x, a.y, 5, 0, Math.PI * 2); ctx.fill();
  const b = proj(pts[pts.length - 1]);
  ctx.fillStyle = '#e8c07a';
  ctx.beginPath(); ctx.arc(b.x, b.y, 6, 0, Math.PI * 2); ctx.fill();
}

/* ===== Demo: simula uma trilha em Brasília ===== */
function simulateDemoTrack(tracker) {
  const baseLat = -15.7942, baseLon = -47.8825;
  const now = Date.now();
  let lat = baseLat, lon = baseLon;
  let heading = 0.3;
  for (let i = 0; i < 80; i++) {
    heading += (Math.random() - 0.5) * 0.4;
    lat += Math.cos(heading) * 0.00008 + (Math.random() - 0.5) * 0.00004;
    lon += Math.sin(heading) * 0.00012 + (Math.random() - 0.5) * 0.00004;
    const spd = 2 + Math.random() * 3;
    tracker._injectPoint({ lat, lon, acc: 5, spd, t: now - (80 - i) * 8000 });
  }
}

/* ===== Lista de pontos (mais recentes primeiro) ===== */
function renderList(listEl, pts) {
  empty(listEl);
  if (!pts.length) {
    listEl.appendChild(h('div', { className: 'u-text-muted u-mono' }, 'sem pontos'));
    return;
  }
  pts.slice(-12).reverse().forEach((p) => {
    const time = new Date(p.t).toLocaleTimeString('pt-BR');
    listEl.appendChild(h('div', { className: 'geo-row' },
      h('span', { className: 'geo-row__t u-mono u-text-muted' }, time),
      h('span', { className: 'geo-row__c u-mono' }, `${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`),
      h('span', { className: 'geo-row__s u-mono u-text-cyan' }, p.spd != null ? `${(p.spd * 3.6).toFixed(1)} km/h` : '—')));
  });
}
