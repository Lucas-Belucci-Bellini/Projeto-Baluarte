/**
 * Página /radar — Console de Radar Baluarte (Tier 0: Mock/Replay/Bridge).
 *
 * Mostra um Range-Doppler heatmap real-time, waterfall, lista de detecções
 * com CFAR-CA, e indicadores de status. A fonte de dados é trocável (Mock /
 * Replay / Bridge WebSocket) — quando o operador rodar tools/radar-bridge,
 * o modo Bridge passa a usar dados reais (CSI do roteador, ESP32 ou SDR).
 *
 * Sem hardware: Mock gera 3 alvos animados pra demo.
 */

import '../styles/radar.css';
import { h, cx, empty } from '../utils/helpers.js';
import { makeSource } from '../utils/radar-source.js';
import { cfar2d, rangeMeters, velocityMs } from '../utils/radar-dsp.js';
import { createTracker } from '../utils/radar-tracker.js';
import { toast } from '../utils/toast.js';

let source = null;
let mode = 'mock';
let cfg = { cfarK: 4.0, mtiOn: false, dcNotchOn: true, frozen: false };
let lastFrame = null;
let prevMag = null;
let fpsCounter = { count: 0, last: performance.now(), value: 0 };
let tracker = createTracker();
let tracksCache = [];

/* Refs DOM. */
let rdCanvas, waterfallCanvas, detListEl, statusBar, modeBtns, freezeBtn;
let rdMainEl = null; /* wrapper com RD + waterfall */
let satCanvas = null;

/* ===================== Satélites (CelesTrak + satellite.js) ===================== */

let satLib = null;
let satTles = [];
let satLoopTimer = null;
let satObserver = { lat: -15.8, lon: -47.9, alt: 0 }; /* Brasília como padrão */

function loadSatLib() {
  return new Promise(resolve => {
    if (window.satellite) { resolve(window.satellite); return; }
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/satellite.js@5.0.0/dist/satellite.min.js';
    s.onload = () => resolve(window.satellite);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

async function fetchTLE() {
  const r = await fetch(
    'https://celestrak.org/gp/query?GROUP=visual&FORMAT=JSON',
    { signal: AbortSignal.timeout(14000) }
  );
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.json();
}

async function initSatMode() {
  setStatus('link', 'carregando…');
  setStatus('mode', 'SATÉLITE');

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      p => { satObserver = { lat: p.coords.latitude, lon: p.coords.longitude, alt: (p.coords.altitude || 0) / 1000 }; },
      () => {}
    );
  }

  satLib = await loadSatLib();
  if (!satLib) {
    toast('Falha ao carregar satellite.js', { type: 'warning' });
    setStatus('link', 'ERRO');
    return;
  }

  try {
    const data = await fetchTLE();
    satTles = data.map(d => {
      try { return { name: (d.OBJECT_NAME || d.name || '???').trim(), satrec: satLib.twoline2satrec(d.TLE_LINE1, d.TLE_LINE2) }; }
      catch { return null; }
    }).filter(Boolean);
    setStatus('link', 'LIVE');
    toast(`${satTles.length} satélites carregados (CelesTrak)`, { type: 'success' });
  } catch {
    toast('Falha ao buscar TLEs da CelesTrak. Verifique a conexão.', { type: 'warning' });
    setStatus('link', 'OFFLINE');
    return;
  }

  function loop() {
    if (mode !== 'satellite') return;
    drawSatScope();
    satLoopTimer = setTimeout(loop, 2000);
  }
  loop();
}

function stopSatMode() {
  if (satLoopTimer) { clearTimeout(satLoopTimer); satLoopTimer = null; }
}

function drawSatScope() {
  if (!satCanvas || !satLib || !satTles.length) return;
  const ctx = satCanvas.getContext('2d');
  const W = satCanvas.width, H = satCanvas.height;
  const cx = W / 2, cy = H / 2;
  const R = Math.min(cx, cy) - 28;

  ctx.fillStyle = '#020409';
  ctx.fillRect(0, 0, W, H);

  /* Círculos de elevação: borda=0°, centro=90° */
  const elToR = el => R * (1 - el / 90);
  ctx.strokeStyle = 'rgba(0,240,255,0.12)';
  ctx.lineWidth = 1;
  [0, 30, 60].forEach(el => {
    ctx.beginPath(); ctx.arc(cx, cy, elToR(el), 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(0,240,255,0.35)';
    ctx.font = '9px "JetBrains Mono",monospace';
    ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
    ctx.fillText(`${el}°`, cx + elToR(el) + 3, cy);
  });

  /* Cruz + pontos cardeais */
  ctx.strokeStyle = 'rgba(0,240,255,0.1)';
  ctx.beginPath();
  ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R);
  ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy);
  ctx.stroke();

  ctx.fillStyle = '#00f0ff';
  ctx.font = 'bold 10px "JetBrains Mono",monospace';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  [['N', 0], ['L', 90], ['S', 180], ['O', 270]].forEach(([lbl, az]) => {
    const rad = (az - 90) * Math.PI / 180;
    ctx.fillText(lbl, cx + (R + 16) * Math.cos(rad), cy + (R + 16) * Math.sin(rad));
  });

  /* Propagação dos satélites */
  const now = new Date();
  const gmst = satLib.gstime(now);
  const obGd = {
    latitude:  satObserver.lat * Math.PI / 180,
    longitude: satObserver.lon * Math.PI / 180,
    height: satObserver.alt
  };

  const visible = [];
  for (const { name, satrec } of satTles) {
    try {
      const pv = satLib.propagate(satrec, now);
      if (!pv.position) continue;
      const ecf = satLib.eciToEcf(pv.position, gmst);
      const look = satLib.ecfToLookAngles(obGd, ecf);
      const el = look.elevation * 180 / Math.PI;
      const az = look.azimuth * 180 / Math.PI;
      if (el < 0) continue;
      visible.push({ name, el, az, range: look.rangeSat });
    } catch {}
  }

  visible.sort((a, b) => b.el - a.el);
  setStatus('tgt', String(visible.length));

  visible.forEach(({ name, el, az }, i) => {
    const r = elToR(el);
    const rad = (az - 90) * Math.PI / 180;
    const x = cx + r * Math.cos(rad);
    const y = cy + r * Math.sin(rad);
    const hi = el > 60;
    ctx.fillStyle = hi ? '#ff00aa' : '#00f0ff';
    ctx.beginPath(); ctx.arc(x, y, hi ? 4 : 2.5, 0, Math.PI * 2); ctx.fill();
    if (i < 10 || hi) {
      ctx.fillStyle = hi ? '#ff00aa' : 'rgba(0,240,255,0.75)';
      ctx.font = '9px "JetBrains Mono",monospace';
      ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(name.slice(0, 14), x + 6, y - 3);
    }
  });

  /* Ponto no centro = zênite */
  ctx.fillStyle = '#ffffff88';
  ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2); ctx.fill();

  /* Info no canto */
  ctx.fillStyle = 'rgba(0,240,255,0.5)';
  ctx.font = '9px "JetBrains Mono",monospace';
  ctx.textAlign = 'left'; ctx.textBaseline = 'top';
  ctx.fillText(`OBS ${satObserver.lat.toFixed(1)}°, ${satObserver.lon.toFixed(1)}°`, 6, 6);
  ctx.fillText(now.toLocaleTimeString('pt-BR'), 6, 18);

  /* Lista de detecções */
  empty(detListEl);
  if (!visible.length) {
    detListEl.appendChild(h('div', { className: 'u-text-muted u-mono' }, 'nenhum satélite acima do horizonte'));
    return;
  }
  visible.slice(0, 15).forEach(({ name, el, az, range }) => {
    detListEl.appendChild(h('div', { className: 'rdr-det-row' },
      h('span', { className: 'rdr-det-row__id u-mono', style: 'max-width:90px;overflow:hidden' }, name.slice(0, 10)),
      h('span', { className: 'rdr-det-row__range u-mono' }, `El ${el.toFixed(0)}°`),
      h('span', { className: 'rdr-det-row__vel u-mono' }, `Az ${az.toFixed(0)}°`),
      h('span', { className: 'rdr-det-row__snr u-mono u-text-cyan' }, `${Math.round(range)} km`)
    ));
  });
}

/* ===================== Render principal ===================== */

/* Painel "Fontes de Detecção" — radar sem antena, via fusão multi-sensor (#183). */
function buildSensorSources() {
  const SOURCES = [
    { icon: '👁️', name: 'Óptico / Térmico + IA', rota: '/visao', desc: 'Câmera com detecção e rastreio por visão computacional.' },
    { icon: '🛰️', name: 'Satélites (orbital)', rota: '/radar', desc: 'TLE do CelesTrak — modo Satélites deste console.' },
    { icon: '🧭', name: 'Geo / Posição', rota: '/geo', desc: 'GeoPulse e localização do operador.' },
    { icon: '🔐', name: 'RF passivo / SIGINT', rota: '/ciberseg', desc: 'Escuta de emissões e ameaças.' },
    { icon: '📡', name: 'Triangulação', rota: '/triangulacao', desc: 'Localização por múltiplos pontos.' },
    { icon: '🚀', name: 'Doutrina de sensores', rota: '/tecnologia-militar', desc: 'Referência: SAR, LIDAR, acústico, sísmico.' }
  ];
  const grid = h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '8px', marginTop: '8px' } });
  for (const s of SOURCES) {
    grid.appendChild(h('a', {
      href: '#' + s.rota,
      style: { display: 'flex', gap: '8px', alignItems: 'flex-start', padding: '8px 10px', borderRadius: 'var(--radius-sm)', background: 'var(--color-bg-elevated)', border: '1px solid rgba(255,255,255,0.07)', color: 'inherit', textDecoration: 'none' }
    },
      h('span', { style: { fontSize: '18px' } }, s.icon),
      h('div', null,
        h('div', { style: { fontWeight: '600', fontSize: 'var(--font-size-sm)' } }, s.name),
        h('div', { className: 'u-text-muted', style: { fontSize: '12px' } }, s.desc))));
  }
  return h('div', { className: 'card', style: { marginTop: 'var(--space-md)' } },
    h('h3', { style: { margin: '0 0 4px' } }, '📡 Fontes de Detecção · fusão multi-sensor'),
    h('p', { className: 'u-text-muted', style: { fontSize: '13px', margin: '0 0 4px' } },
      'O radar não depende de uma antena dedicada: o panorama tático é montado por fusão de sensores — cada fonte abaixo alimenta a imagem. (issue #183)'),
    grid);
}

export function radarPage() {
  const page = h('div', { className: 'page-radar' });

  page.appendChild(buildHeader());
  page.appendChild(buildConsole());
  page.appendChild(buildSensorSources());

  /* Inicia fonte default (mock). */
  setTimeout(() => switchSource('mock'), 0);

  /* Cleanup quando trocar de rota — observa hash. */
  window.addEventListener('hashchange', cleanup, { once: true });

  return page;
}

function buildHeader() {
  return h('div', { className: 'page-header anim-fade-in' },
    h('div', { className: 'page-header__crumbs' },
      h('span', null, 'BALUARTE'), h('span', null, '›'),
      h('span', null, 'TÁTICO'), h('span', null, '›'), h('span', null, 'RADAR')),
    h('h1', { className: 'page-header__title' }, '⌖ Radar Tático'),
    h('p', { className: 'page-header__description' },
      'Console range-Doppler com CFAR. ',
      h('span', { className: 'u-text-cyan' }, 'Modo ACÚSTICO funciona no celular'),
      ' (microfone + alto-falante, efeito Doppler). Mock roda sem nada; replay e bridge usam fixture ou WebSocket local.'
    )
  );
}

function buildConsole() {
  /* Bar de controle: modo + CFAR + filtros + freeze. */
  modeBtns = h('div', { className: 'rdr-modes' },
    modeButton('mock', 'MOCK'),
    modeButton('acoustic', '🎙 ACÚSTICO'),
    modeButton('passive', 'PASSIVO'),
    modeButton('replay', 'REPLAY'),
    modeButton('bridge', 'BRIDGE'),
    modeButton('satellite', '🛰 SATÉLITE')
  );

  const cfarSlider = h('input', {
    type: 'range', min: 2, max: 10, step: 0.1, value: cfg.cfarK,
    className: 'rdr-slider',
    oninput: (e) => {
      cfg.cfarK = parseFloat(e.target.value);
      const lbl = e.target.parentElement.querySelector('.rdr-slider__val');
      if (lbl) lbl.textContent = cfg.cfarK.toFixed(1);
    }
  });

  const mtiToggle = toggle('MTI', cfg.mtiOn, (v) => cfg.mtiOn = v);
  const dcToggle = toggle('DC notch', cfg.dcNotchOn, (v) => cfg.dcNotchOn = v);

  freezeBtn = h('button', {
    className: 'btn btn--ghost rdr-freeze',
    onclick: () => {
      cfg.frozen = !cfg.frozen;
      freezeBtn.classList.toggle('is-active', cfg.frozen);
      freezeBtn.textContent = cfg.frozen ? '▶ RETOMAR' : '⏸ FREEZE';
    }
  }, '⏸ FREEZE');

  const controls = h('div', { className: 'rdr-controls card' },
    h('div', { className: 'rdr-controls__row' },
      h('span', { className: 'rdr-controls__label' }, 'FONTE'), modeBtns
    ),
    h('div', { className: 'rdr-controls__row' },
      h('span', { className: 'rdr-controls__label' }, 'CFAR k'),
      h('div', { className: 'rdr-slider-wrap' },
        cfarSlider,
        h('span', { className: 'rdr-slider__val u-mono' }, cfg.cfarK.toFixed(1))
      )
    ),
    h('div', { className: 'rdr-controls__row' }, mtiToggle, dcToggle, freezeBtn)
  );

  /* Status bar topo do scope. */
  statusBar = h('div', { className: 'rdr-status' },
    statusItem('MODE', 'MOCK', 'mode'),
    statusItem('FPS', '0', 'fps'),
    statusItem('TGT', '0', 'tgt'),
    statusItem('FRAME', '0', 'frame'),
    statusItem('LINK', '─', 'link')
  );

  /* Canvas Range-Doppler. */
  rdCanvas = h('canvas', { className: 'rdr-rd', width: 512, height: 320 });
  const rdScope = h('div', { className: 'rdr-scope card' },
    h('div', { className: 'rdr-scope__head' },
      h('div', { className: 'rdr-scope__title' }, '⌖ RANGE × DOPPLER'),
      h('div', { className: 'rdr-scope__legend u-mono u-text-muted' },
        'X: velocidade · Y: alcance · brilho: magnitude'
      )
    ),
    rdCanvas
  );

  /* Waterfall. */
  waterfallCanvas = h('canvas', { className: 'rdr-waterfall', width: 512, height: 160 });
  const wfScope = h('div', { className: 'rdr-scope card' },
    h('div', { className: 'rdr-scope__head' },
      h('div', { className: 'rdr-scope__title' }, '∿ WATERFALL'),
      h('div', { className: 'rdr-scope__legend u-mono u-text-muted' },
        'tempo desce · range no eixo X'
      )
    ),
    waterfallCanvas
  );

  /* Canvas Satélite (visível somente no modo satellite). */
  satCanvas = h('canvas', { className: 'rdr-sat-scope', width: 512, height: 480, style: 'display:none' });
  const satScope = h('div', { className: 'rdr-scope card', id: 'sat-scope-card', style: 'display:none' },
    h('div', { className: 'rdr-scope__head' },
      h('div', { className: 'rdr-scope__title' }, '🛰 RADAR DE SATÉLITES'),
      h('div', { className: 'rdr-scope__legend u-mono u-text-muted' },
        'AZ/EL da sua posição · centro=zênite · borda=horizonte'
      )
    ),
    satCanvas
  );

  /* Lista de detecções. */
  detListEl = h('div', { className: 'rdr-det-list' },
    h('div', { className: 'u-text-muted u-mono' }, 'sem alvos')
  );
  const detPanel = h('div', { className: 'rdr-det card' },
    h('div', { className: 'rdr-scope__head' },
      h('div', { className: 'rdr-scope__title' }, '◎ DETECÇÕES'),
      h('div', { className: 'rdr-scope__legend u-mono u-text-muted' },
        'CFAR-CA · ordenado por SNR'
      )
    ),
    detListEl
  );

  rdMainEl = h('div', { className: 'rdr-main' }, rdScope, wfScope, satScope);
  return h('div', { className: 'rdr-layout' },
    h('div', { className: 'rdr-side' }, statusBar, controls, detPanel),
    rdMainEl
  );
}

function modeButton(kind, label) {
  const btn = h('button', {
    className: cx('rdr-mode', kind === mode && 'is-active'),
    'data-kind': kind,
    onclick: () => switchSource(kind)
  }, label);
  return btn;
}

function toggle(label, initial, onChange) {
  let on = initial;
  const btn = h('button', {
    className: cx('rdr-toggle', on && 'is-on'),
    onclick: () => {
      on = !on;
      btn.classList.toggle('is-on', on);
      onChange(on);
    }
  }, label);
  return btn;
}

function statusItem(label, value, key) {
  return h('div', { className: 'rdr-status__item', 'data-key': key },
    h('span', { className: 'rdr-status__label' }, label),
    h('span', { className: 'rdr-status__val u-mono' }, value)
  );
}

function setStatus(key, val) {
  const item = statusBar?.querySelector(`[data-key="${key}"] .rdr-status__val`);
  if (item) item.textContent = val;
}

/* ===================== Fonte ===================== */

function switchSource(kind) {
  /* Para modo satélite anterior, restaura RD/waterfall. */
  if (mode === 'satellite' && kind !== 'satellite') {
    stopSatMode();
    if (rdCanvas) rdCanvas.parentElement.style.display = '';
    if (waterfallCanvas) waterfallCanvas.parentElement.style.display = '';
    const sc = document.getElementById('sat-scope-card');
    if (sc) sc.style.display = 'none';
  }

  if (source) source.stop();
  tracker.reset();
  tracksCache = [];
  mode = kind;
  modeBtns?.querySelectorAll('.rdr-mode').forEach((b) =>
    b.classList.toggle('is-active', b.dataset.kind === kind));

  /* Satélite: esconde RD/waterfall, mostra sat scope. */
  if (kind === 'satellite') {
    if (rdCanvas) rdCanvas.parentElement.style.display = 'none';
    if (waterfallCanvas) waterfallCanvas.parentElement.style.display = 'none';
    const sc = document.getElementById('sat-scope-card');
    if (sc) sc.style.display = '';
    initSatMode();
    return;
  }

  setStatus('mode', kind.toUpperCase());
  setStatus('link', kind === 'bridge' ? 'conectando…' : (kind === 'acoustic' ? 'iniciando…' : '─'));

  source = makeSource(kind, {
    onError: (msg) => {
      toast(msg, { type: 'warning' });
      setStatus('link', 'OFFLINE');
    }
  });
  source.start(onFrame);

  if (kind === 'bridge') {
    /* Mostra link como conectado se o WS abrir em até 1.5s. */
    setTimeout(() => {
      if (source && source.kind === 'bridge') {
        setStatus('link', source.connected ? 'LIVE' : 'OFFLINE');
        if (!source.connected) {
          toast('Bridge offline. Rode tools/radar-bridge/bridge.py.', { type: 'warning' });
        }
      }
    }, 1500);
  }

  if (kind === 'acoustic') {
    /* getUserMedia é assíncrono: confirma o link após liberar o microfone. */
    setTimeout(() => {
      if (source && source.kind === 'acoustic') {
        setStatus('link', source.connected ? 'LIVE' : 'OFFLINE');
        if (source.connected) {
          toast('Radar acústico ativo. Mexa a mão perto do aparelho.', { type: 'success' });
        }
      }
    }, 1200);
  }
}

/* ===================== Pipeline de frame ===================== */

function onFrame(pkt) {
  if (cfg.frozen) return;
  lastFrame = pkt;
  const { rows, cols } = pkt;
  const mag = new Float32Array(pkt.mag); /* cópia mutável */

  /* DC notch (subtrai média por range bin). */
  if (cfg.dcNotchOn) {
    for (let r = 0; r < rows; r++) {
      let sum = 0;
      for (let c = 0; c < cols; c++) sum += mag[r * cols + c];
      const mean = sum / cols;
      for (let c = 0; c < cols; c++) mag[r * cols + c] = Math.max(0, mag[r * cols + c] - mean);
    }
  }

  /* MTI: subtrai frame anterior. */
  if (cfg.mtiOn && prevMag && prevMag.length === mag.length) {
    for (let i = 0; i < mag.length; i++) mag[i] = Math.abs(mag[i] - prevMag[i]);
  }
  prevMag = new Float32Array(mag);

  /* CFAR-CA 2D → rastreio multi-alvo (tracks persistentes com ID). */
  const cfar = cfar2d(mag, rows, cols, { guard: 1, ref: 3, k: cfg.cfarK });
  tracksCache = tracker.update(cfar.detections);

  /* Pinta. */
  drawRD(mag, rows, cols, cfar.mask);
  drawTrackOverlay(tracksCache, rows, cols);
  shiftWaterfall(mag, rows, cols);
  renderDetections();

  /* FPS. */
  fpsCounter.count++;
  const now = performance.now();
  if (now - fpsCounter.last >= 1000) {
    fpsCounter.value = Math.round((fpsCounter.count * 1000) / (now - fpsCounter.last));
    fpsCounter.count = 0;
    fpsCounter.last = now;
    setStatus('fps', String(fpsCounter.value));
  }
  setStatus('tgt', String(tracksCache.length));
  setStatus('frame', String(pkt.index));
}

/* ===================== Render Canvas ===================== */

const PALETTE = buildPalette(); /* viridis-ish em 256 níveis */

function buildPalette() {
  const p = new Uint8ClampedArray(256 * 4);
  for (let i = 0; i < 256; i++) {
    const t = i / 255;
    /* Aproximação simplificada (sem usar matriz cromática completa): vai do preto azulado → ciano → magenta. */
    const r = Math.round(255 * Math.pow(t, 1.3) * (0.6 + 0.4 * t));
    const g = Math.round(255 * t * (1 - 0.4 * t));
    const b = Math.round(255 * (1 - Math.pow(1 - t, 2.0)));
    p[i * 4] = r; p[i * 4 + 1] = g; p[i * 4 + 2] = b; p[i * 4 + 3] = 255;
  }
  return p;
}

function drawRD(mag, rows, cols, mask) {
  const ctx = rdCanvas.getContext('2d');
  const W = rdCanvas.width, H = rdCanvas.height;

  /* Normaliza pra max do frame. */
  let max = 1e-6;
  for (let i = 0; i < mag.length; i++) if (mag[i] > max) max = mag[i];

  /* Pinta cada bin como retângulo. cols=doppler→X, rows=range→Y. */
  const cellW = W / cols, cellH = H / rows;
  /* Background preto. */
  ctx.fillStyle = '#020409';
  ctx.fillRect(0, 0, W, H);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const v = Math.min(255, Math.round((mag[r * cols + c] / max) * 255));
      const p = v * 4;
      ctx.fillStyle = `rgb(${PALETTE[p]},${PALETTE[p+1]},${PALETTE[p+2]})`;
      ctx.fillRect(c * cellW, r * cellH, cellW + 0.5, cellH + 0.5);
    }
  }

  /* Marca detecções com retângulo ciano. */
  ctx.strokeStyle = '#00f0ff';
  ctx.lineWidth = 1.2;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (mask[r * cols + c]) {
        ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
      }
    }
  }

  /* Grid leve. */
  ctx.strokeStyle = 'rgba(150, 180, 255, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 8; i++) {
    const x = (W / 8) * i;
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
  }
  for (let i = 1; i < 4; i++) {
    const y = (H / 4) * i;
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }
}

/* Waterfall: cada novo frame vira uma linha NO TOPO, scroll pra baixo. */
function shiftWaterfall(mag, rows, cols) {
  const ctx = waterfallCanvas.getContext('2d');
  const W = waterfallCanvas.width, H = waterfallCanvas.height;
  /* Scroll: copia o canvas todo pra baixo 1px. */
  const img = ctx.getImageData(0, 0, W, H - 1);
  ctx.putImageData(img, 0, 1);

  /* Reduz row × col → vetor de "intensidade por range" somando doppler. */
  const rowMax = 1e-6;
  let max = rowMax;
  const lineData = new Float32Array(rows);
  for (let r = 0; r < rows; r++) {
    let s = 0;
    for (let c = 0; c < cols; c++) s += mag[r * cols + c];
    lineData[r] = s;
    if (s > max) max = s;
  }

  /* Pinta a primeira linha. X = range (rows), W dividido em rows. */
  const px = W / rows;
  for (let r = 0; r < rows; r++) {
    const v = Math.min(255, Math.round((lineData[r] / max) * 255));
    const p = v * 4;
    ctx.fillStyle = `rgb(${PALETTE[p]},${PALETTE[p+1]},${PALETTE[p+2]})`;
    ctx.fillRect(r * px, 0, px + 0.5, 1);
  }
}

/* Desenha rastros + marcadores + ID dos alvos rastreados sobre o range-Doppler. */
function drawTrackOverlay(tracks, rows, cols) {
  if (!rdCanvas) return;
  const ctx = rdCanvas.getContext('2d');
  const W = rdCanvas.width, H = rdCanvas.height;
  const cellW = W / cols, cellH = H / rows;
  ctx.lineWidth = 1.5;
  ctx.font = '11px "JetBrains Mono", monospace';
  tracks.forEach((t) => {
    const x = (t.c + 0.5) * cellW, y = (t.r + 0.5) * cellH;
    const coasting = t.misses > 0;

    /* rastro */
    ctx.strokeStyle = coasting ? 'rgba(255,0,170,0.35)' : 'rgba(255,0,170,0.6)';
    ctx.beginPath();
    t.trail.forEach((p, i) => {
      const px = (p[1] + 0.5) * cellW, py = (p[0] + 0.5) * cellH;
      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    });
    ctx.stroke();

    /* marcador */
    ctx.strokeStyle = coasting ? 'rgba(255,0,170,0.6)' : '#ff00aa';
    ctx.beginPath();
    ctx.arc(x, y, Math.max(5, cellW * 0.7), 0, Math.PI * 2);
    ctx.stroke();

    /* id */
    ctx.fillStyle = '#ff00aa';
    ctx.fillText('T' + String(t.id).padStart(2, '0'), x + 7, y - 7);
  });
}

function renderDetections() {
  empty(detListEl);
  if (tracksCache.length === 0) {
    detListEl.appendChild(h('div', { className: 'u-text-muted u-mono' }, 'sem alvos'));
    return;
  }
  tracksCache.forEach((t) => {
    const range = rangeMeters(t.r, { fftN: lastFrame?.rows ?? 64 });
    const vel = velocityMs(t.c, { dopplerN: lastFrame?.cols ?? 32 });
    const coasting = t.misses > 0;
    detListEl.appendChild(h('div', { className: cx('rdr-det-row', coasting && 'is-coasting') },
      h('span', { className: 'rdr-det-row__id u-mono' }, `T${String(t.id).padStart(2, '0')}`),
      h('span', { className: 'rdr-det-row__range u-mono' }, `${range.toFixed(1)} m`),
      h('span', { className: 'rdr-det-row__vel u-mono' }, `${vel >= 0 ? '+' : ''}${vel.toFixed(1)} m/s`),
      h('span', { className: 'rdr-det-row__snr u-mono u-text-cyan' }, `${(20 * Math.log10(Math.max(t.snr, 1e-6))).toFixed(1)} dB`)
    ));
  });
}

/* ===================== Cleanup ===================== */

function cleanup() {
  if (source) { source.stop(); source = null; }
  stopSatMode();
  tracker.reset();
  tracksCache = [];
  prevMag = null;
  lastFrame = null;
}
