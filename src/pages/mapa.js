/**
 * /mapa — Mapa Mundial interativo
 * Tráfego aéreo em tempo real (OpenSky Network)
 * Radar meteorológico (RainViewer)
 * Tiles: OpenStreetMap
 */

import { h } from '../utils/helpers.js';

const OPENSKY_URL = 'https://opensky-network.org/api/states/all';
const RAINVIEWER_URL = 'https://api.rainviewer.com/public/weather-maps.json';

let _map = null;
let _flightLayer = null;
let _weatherLayer = null;
let _flightMarkers = new Map();
let _flightInterval = null;
let _radarFrames = [];
let _radarIndex = 0;
let _radarInterval = null;
let _animInterval = null;
let _container = null;

/* ── Leaflet loader ── */
function loadLeaflet() {
  return new Promise((resolve) => {
    if (window.L) { resolve(window.L); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = () => resolve(window.L);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

/* ── Ícone de avião ── */
function planeIcon(L, heading) {
  const angle = heading ?? 0;
  return L.divIcon({
    className: '',
    html: `<div class="mapa-plane" style="transform:rotate(${angle}deg)">✈</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
}

/* ── Fetch voos na área visível ── */
async function fetchFlights(map) {
  try {
    const b = map.getBounds();
    const url = `${OPENSKY_URL}?lamin=${b.getSouth().toFixed(2)}&lomin=${b.getWest().toFixed(2)}&lamax=${b.getNorth().toFixed(2)}&lomax=${b.getEast().toFixed(2)}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

/* ── Atualiza marcadores de voo ── */
function updateFlightMarkers(L, data, infoEl) {
  if (!data || !data.states) return;
  const seen = new Set();

  for (const s of data.states) {
    const [icao24, callsign, , , , lon, lat, , onGround, velocity, heading, vertRate] = s;
    if (lat == null || lon == null || onGround) continue;
    seen.add(icao24);

    const tip = [
      `<b>${(callsign || icao24).trim()}</b>`,
      `Velocidade: ${velocity ? Math.round(velocity * 3.6) + ' km/h' : '—'}`,
      `Rumo: ${heading ? Math.round(heading) + '°' : '—'}`,
      `Variação alt: ${vertRate ? (vertRate > 0 ? '↑' : '↓') + Math.abs(Math.round(vertRate)) + ' m/s' : '—'}`
    ].join('<br>');

    if (_flightMarkers.has(icao24)) {
      const m = _flightMarkers.get(icao24);
      m.setLatLng([lat, lon]);
      m.setIcon(planeIcon(L, heading));
      m.setTooltipContent(tip);
    } else {
      const m = L.marker([lat, lon], { icon: planeIcon(L, heading) })
        .bindTooltip(tip, { className: 'mapa-tooltip' })
        .addTo(_flightLayer);
      _flightMarkers.set(icao24, m);
    }
  }

  // remove desaparecidos
  for (const [id, m] of _flightMarkers) {
    if (!seen.has(id)) { _flightLayer.removeLayer(m); _flightMarkers.delete(id); }
  }

  if (infoEl) infoEl.textContent = `${seen.size} aeronaves visíveis`;
}

/* ── Radar meteorológico (RainViewer) ── */
async function loadRadar(L) {
  try {
    const res = await fetch(RAINVIEWER_URL, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return;
    const data = await res.json();
    const frames = [...(data.radar.past || []), ...(data.radar.nowcast || [])];
    if (!frames.length) return;
    _radarFrames = frames;
    _radarIndex = frames.length - 1;
    showRadarFrame(L, _radarIndex);
  } catch { /* offline */ }
}

function showRadarFrame(L, idx) {
  if (!_radarFrames.length || !_map) return;
  if (_weatherLayer) _map.removeLayer(_weatherLayer);
  const frame = _radarFrames[idx];
  _weatherLayer = L.tileLayer(
    `https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`,
    { opacity: 0.5, zIndex: 10, attribution: '© RainViewer' }
  );
  if (_map.hasLayer(L.tileLayer())) return; // guard
  _weatherLayer.addTo(_map);
}

function animateRadar(L, sliderEl, timeEl) {
  if (_animInterval) { clearInterval(_animInterval); _animInterval = null; return false; }
  _animInterval = setInterval(() => {
    _radarIndex = (_radarIndex + 1) % _radarFrames.length;
    showRadarFrame(L, _radarIndex);
    if (sliderEl) sliderEl.value = _radarIndex;
    if (timeEl && _radarFrames[_radarIndex]) {
      timeEl.textContent = new Date(_radarFrames[_radarIndex].time * 1000)
        .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    }
  }, 600);
  return true;
}

/* ── Cleanup ── */
function cleanup() {
  if (_flightInterval) { clearInterval(_flightInterval); _flightInterval = null; }
  if (_radarInterval) { clearInterval(_radarInterval); _radarInterval = null; }
  if (_animInterval) { clearInterval(_animInterval); _animInterval = null; }
  if (_map) { _map.remove(); _map = null; }
  _flightMarkers.clear();
  _flightLayer = null;
  _weatherLayer = null;
  _radarFrames = [];
}

/* ── Init mapa ── */
async function initMap(mapEl, infoEl, radarSliderEl, radarTimeEl, layerFlight, layerWeather) {
  const L = await loadLeaflet();
  if (!L) { mapEl.innerHTML = '<p class="mapa-error">Falha ao carregar Leaflet.</p>'; return; }

  _map = L.map(mapEl, { zoomControl: true }).setView([-15.8, -47.9], 5);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap',
    maxZoom: 18
  }).addTo(_map);

  _flightLayer = L.layerGroup().addTo(_map);

  /* voos */
  const refresh = async () => {
    if (!layerFlight.checked) { _flightLayer.clearLayers(); _flightMarkers.clear(); return; }
    const data = await fetchFlights(_map);
    updateFlightMarkers(L, data, infoEl);
  };
  await refresh();
  _flightInterval = setInterval(refresh, 15000);
  _map.on('moveend', refresh);

  layerFlight.addEventListener('change', refresh);

  /* radar */
  await loadRadar(L);
  if (_radarFrames.length && radarSliderEl) {
    radarSliderEl.max = _radarFrames.length - 1;
    radarSliderEl.value = _radarIndex;
    radarSliderEl.addEventListener('input', () => {
      _radarIndex = +radarSliderEl.value;
      showRadarFrame(L, _radarIndex);
      if (radarTimeEl && _radarFrames[_radarIndex])
        radarTimeEl.textContent = new Date(_radarFrames[_radarIndex].time * 1000)
          .toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    });
    _radarInterval = setInterval(() => loadRadar(L), 5 * 60 * 1000);
  }

  layerWeather.addEventListener('change', () => {
    if (!layerWeather.checked && _weatherLayer) { _map.removeLayer(_weatherLayer); }
    else if (layerWeather.checked) showRadarFrame(L, _radarIndex);
  });

  return L;
}

/* ── Página ── */
export function mapaPage() {
  cleanup();

  const mapEl = h('div', { id: 'mapa-map', className: 'mapa-map' });
  const infoEl = h('span', { className: 'mapa-info__count' }, '…');

  const layerFlight = h('input', { type: 'checkbox', id: 'lyr-flight', checked: true });
  const layerWeather = h('input', { type: 'checkbox', id: 'lyr-weather', checked: true });

  const radarSlider = h('input', { type: 'range', className: 'mapa-slider', min: 0, max: 10, value: 0 });
  const radarTimeEl = h('span', { className: 'mapa-radar-time' }, '--:--');
  let animRunning = false;
  let L_ref = null;

  const animBtn = h('button', { className: 'mapa-btn', onclick: () => {
    if (!L_ref) return;
    animRunning = animateRadar(L_ref, radarSlider, radarTimeEl);
    animBtn.textContent = animRunning ? '⏹ Parar' : '▶ Animar';
  }}, '▶ Animar');

  const locBtn = h('button', { className: 'mapa-btn', onclick: () => {
    if (!_map || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(pos => {
      _map.setView([pos.coords.latitude, pos.coords.longitude], 10);
    });
  }}, '◉ Minha posição');

  const wrap = h('div', { className: 'mapa-page' },
    h('div', { className: 'page-hero' },
      h('h1', null, '🗺 Mapa Mundial'),
      h('p', { className: 'u-text-muted' }, 'Tráfego aéreo em tempo real + radar meteorológico.')
    ),

    h('div', { className: 'mapa-toolbar' },
      h('label', { className: 'mapa-layer-toggle' },
        layerFlight,
        h('span', null, '✈ Tráfego Aéreo')
      ),
      h('label', { className: 'mapa-layer-toggle' },
        layerWeather,
        h('span', null, '🌧 Radar Chuva')
      ),
      h('div', { className: 'mapa-info' }, infoEl),
      locBtn
    ),

    h('div', { className: 'mapa-wrap' }, mapEl),

    h('div', { className: 'mapa-radar-bar' },
      h('span', { className: 'mapa-radar-label' }, '🌩 Radar:'),
      radarSlider,
      radarTimeEl,
      animBtn
    )
  );

  /* init assíncrono após mount */
  requestAnimationFrame(async () => {
    L_ref = await initMap(mapEl, infoEl, radarSlider, radarTimeEl, layerFlight, layerWeather);
    _container = wrap;
  });

  /* cleanup ao sair */
  const obs = new MutationObserver(() => {
    if (!document.body.contains(wrap)) { cleanup(); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return wrap;
}
