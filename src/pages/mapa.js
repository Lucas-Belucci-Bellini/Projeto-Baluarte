/**
 * /mapa — Mapa Tático Mundial (MapLibre GL)
 * Multi-camada nível militar:
 *  - Bases: satélite, escuro tático, terreno relevo
 *  - Terreno 3D (DEM Terrarium AWS) + projeção globo
 *  - Espaço aéreo (OpenSky, tempo real)
 *  - Naval (AIS Digitraffic, tempo real)
 *  - Subaquático (cabos submarinos + batimetria GEBCO)
 *  - Temperatura (Open-Meteo grid) + radar de chuva (RainViewer)
 *  - Ferramentas táticas: grid, coordenadas, medição, alvo
 * Todas as fontes são gratuitas e sem chave de API.
 */

import { h } from '../utils/helpers.js';

/* ── Endpoints ── */
const OPENSKY = 'https://opensky-network.org/api/states/all';
const RAINVIEWER = 'https://api.rainviewer.com/public/weather-maps.json';
const OPENMETEO = 'https://api.open-meteo.com/v1/forecast';
const AIS_DIGITRAFFIC = 'https://meri.digitraffic.fi/api/ais/v1/locations';
const CABOS = 'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json';

/* Data de ontem (UTC) — imagem de satélite NASA GIBS mais recente disponível. */
function gibsDate() {
  const d = new Date(Date.now() - 36 * 3600 * 1000);
  return d.toISOString().slice(0, 10);
}

/* ── Estado do módulo ── */
let _map = null;
let _timers = [];
let _terrainOn = false;
let _radarFrames = [];
let _radarIdx = 0;
let _maplibre = null;

function clearTimers() { _timers.forEach(t => clearInterval(t)); _timers = []; }

function cleanup() {
  clearTimers();
  if (_map) { try { _map.remove(); } catch {} _map = null; }
  _radarFrames = [];
  _terrainOn = false;
}

/* ── Loader MapLibre GL ── */
function loadMapLibre() {
  return new Promise((resolve) => {
    if (window.maplibregl) { resolve(window.maplibregl); return; }
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js';
    s.onload = () => resolve(window.maplibregl);
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
}

/* ── Estilo base com múltiplas fontes ── */
function buildStyle() {
  return {
    version: 8,
    glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
    sources: {
      sat: {
        type: 'raster', tileSize: 256, maxzoom: 22,
        tiles: [
          'https://mt0.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          'https://mt2.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
          'https://mt3.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
        ],
        attribution: '© Google'
      },
      labels: {
        type: 'raster', tileSize: 256, maxzoom: 20,
        tiles: [
          'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
          'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png',
          'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_only_labels/{z}/{x}/{y}.png'
        ],
        attribution: '© CARTO'
      },
      gibs: {
        type: 'raster', tileSize: 256, maxzoom: 9,
        tiles: [`https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/MODIS_Terra_CorrectedReflectance_TrueColor/default/${gibsDate()}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`],
        attribution: '© NASA GIBS / MODIS Terra'
      },
      dark: {
        type: 'raster', tileSize: 256, maxzoom: 19,
        tiles: [
          'https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
          'https://cartodb-basemaps-b.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png',
          'https://cartodb-basemaps-c.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png'
        ],
        attribution: '© CARTO'
      },
      terreno: {
        type: 'raster', tileSize: 256, maxzoom: 18,
        tiles: ['https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'.replace('{s}', 'a')],
        attribution: '© OpenTopoMap'
      },
      'dem': {
        type: 'raster-dem', tileSize: 256, maxzoom: 15, encoding: 'terrarium',
        tiles: ['https://elevation-tiles-prod.s3.amazonaws.com/terrarium/{z}/{x}/{y}.png']
      },
      gebco: {
        type: 'raster', tileSize: 256,
        tiles: ['https://wms.gebco.net/mapserv?request=GetMap&service=WMS&version=1.3.0&layers=GEBCO_LATEST&styles=&format=image/png&transparent=true&crs=EPSG:3857&width=256&height=256&bbox={bbox-epsg-3857}'],
        attribution: '© GEBCO'
      }
    },
    layers: [
      { id: 'base-dark', type: 'raster', source: 'dark', layout: { visibility: 'none' } },
      { id: 'base-terreno', type: 'raster', source: 'terreno', layout: { visibility: 'none' } },
      { id: 'base-sat', type: 'raster', source: 'sat' },
      { id: 'gibs-layer', type: 'raster', source: 'gibs', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.85 } },
      { id: 'gebco-layer', type: 'raster', source: 'gebco', layout: { visibility: 'none' }, paint: { 'raster-opacity': 0.7 } },
      { id: 'hillshade', type: 'hillshade', source: 'dem', layout: { visibility: 'none' }, paint: { 'hillshade-exaggeration': 0.5 } },
      { id: 'labels-layer', type: 'raster', source: 'labels', layout: { visibility: 'visible' } }
    ],
    terrain: undefined
  };
}

/* ════════════════════════════════════
   CAMADA: Espaço Aéreo (OpenSky)
   ════════════════════════════════════ */
async function fetchAir(map) {
  try {
    const b = map.getBounds();
    const url = `${OPENSKY}?lamin=${b.getSouth().toFixed(2)}&lomin=${b.getWest().toFixed(2)}&lamax=${b.getNorth().toFixed(2)}&lomax=${b.getEast().toFixed(2)}`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

function airToGeo(data) {
  const fc = { type: 'FeatureCollection', features: [] };
  if (!data?.states) return fc;
  for (const s of data.states) {
    const [icao, cs, , , , lon, lat, baroAlt, onGround, vel, hdg, vr, , geoAlt] = s;
    if (lat == null || lon == null || onGround) continue;
    fc.features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lon, lat] },
      properties: {
        callsign: (cs || icao).trim(),
        alt: Math.round((geoAlt ?? baroAlt ?? 0)),
        vel: vel ? Math.round(vel * 3.6) : 0,
        hdg: hdg || 0
      }
    });
  }
  return fc;
}

/* ════════════════════════════════════
   CAMADA: Naval (AIS Digitraffic — tempo real, cobertura Báltico)
   ════════════════════════════════════ */
async function fetchNaval() {
  try {
    const r = await fetch(AIS_DIGITRAFFIC, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const data = await r.json();
    // já vem como GeoJSON FeatureCollection
    if (data?.features) {
      data.features = data.features.slice(0, 800).map(f => ({
        ...f,
        properties: {
          mmsi: f.mmsi || f.properties?.mmsi || '—',
          sog: f.properties?.sog ?? 0,
          heading: f.properties?.heading ?? f.properties?.cog ?? 0
        }
      }));
    }
    return data;
  } catch { return null; }
}

/* ════════════════════════════════════
   CAMADA: Subaquático (cabos submarinos)
   ════════════════════════════════════ */
async function fetchCabos() {
  try {
    const r = await fetch(CABOS, { signal: AbortSignal.timeout(9000) });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

/* ════════════════════════════════════
   CAMADA: Temperatura (Open-Meteo grid)
   ════════════════════════════════════ */
async function fetchTemp(map) {
  try {
    const b = map.getBounds();
    const cols = 7, rows = 5;
    const lats = [], lons = [];
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        lats.push((b.getSouth() + (b.getNorth() - b.getSouth()) * (i + 0.5) / rows).toFixed(3));
        lons.push((b.getWest() + (b.getEast() - b.getWest()) * (j + 0.5) / cols).toFixed(3));
      }
    }
    const url = `${OPENMETEO}?latitude=${lats.join(',')}&longitude=${lons.join(',')}&current=temperature_2m`;
    const r = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!r.ok) return null;
    const data = await r.json();
    const arr = Array.isArray(data) ? data : [data];
    const fc = { type: 'FeatureCollection', features: [] };
    arr.forEach((d, k) => {
      const t = d?.current?.temperature_2m;
      if (t == null) return;
      fc.features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [+lons[k], +lats[k]] },
        properties: { temp: Math.round(t), label: `${Math.round(t)}°` }
      });
    });
    return fc;
  } catch { return null; }
}

/* ════════════════════════════════════
   CAMADA: Radar de chuva (RainViewer)
   ════════════════════════════════════ */
async function loadRadar(map) {
  try {
    const r = await fetch(RAINVIEWER, { signal: AbortSignal.timeout(6000) });
    if (!r.ok) return;
    const data = await r.json();
    _radarFrames = [...(data.radar?.past || []), ...(data.radar?.nowcast || [])];
    if (!_radarFrames.length) return;
    _radarIdx = _radarFrames.length - 1;
    setRadarFrame(map, _radarIdx);
  } catch {}
}
function setRadarFrame(map, idx) {
  if (!_radarFrames.length) return;
  const frame = _radarFrames[idx];
  const id = 'radar-src';
  if (map.getLayer('radar-layer')) map.removeLayer('radar-layer');
  if (map.getSource(id)) map.removeSource(id);
  map.addSource(id, {
    type: 'raster', tileSize: 256,
    tiles: [`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`]
  });
  map.addLayer({ id: 'radar-layer', type: 'raster', source: id, paint: { 'raster-opacity': 0.55 } });
}

/* ════════════════════════════════════
   Grid tático (graticule)
   ════════════════════════════════════ */
function graticuleGeo(step = 10) {
  const fc = { type: 'FeatureCollection', features: [] };
  for (let lon = -180; lon <= 180; lon += step) {
    fc.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[lon, -85], [lon, 85]] }, properties: {} });
  }
  for (let lat = -80; lat <= 80; lat += step) {
    fc.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[-180, lat], [180, lat]] }, properties: {} });
  }
  return fc;
}

/* ════════════════════════════════════
   Setup de camadas no mapa
   ════════════════════════════════════ */
function addDataLayers(map, refs) {
  const empty = { type: 'FeatureCollection', features: [] };

  /* Subaquático: cabos */
  map.addSource('cabos', { type: 'geojson', data: empty });
  map.addLayer({
    id: 'cabos-layer', type: 'line', source: 'cabos',
    layout: { visibility: 'none', 'line-cap': 'round' },
    paint: { 'line-color': '#00f0ff', 'line-width': 1, 'line-opacity': 0.5 }
  });

  /* Grid tático */
  map.addSource('grid', { type: 'geojson', data: graticuleGeo(10) });
  map.addLayer({
    id: 'grid-layer', type: 'line', source: 'grid',
    layout: { visibility: 'none' },
    paint: { 'line-color': '#00f0ff', 'line-width': 0.4, 'line-opacity': 0.25 }
  });

  /* Naval */
  map.addSource('naval', { type: 'geojson', data: empty });
  map.addLayer({
    id: 'naval-layer', type: 'circle', source: 'naval',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': 3,
      'circle-color': '#00ff9d',
      'circle-stroke-width': 1, 'circle-stroke-color': '#003322'
    }
  });

  /* Espaço aéreo */
  map.addSource('air', { type: 'geojson', data: empty });
  map.addLayer({
    id: 'air-layer', type: 'circle', source: 'air',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': 4,
      'circle-color': [
        'interpolate', ['linear'], ['get', 'alt'],
        0, '#ff3b3b', 3000, '#ffaa00', 8000, '#00f0ff', 12000, '#ffffff'
      ],
      'circle-stroke-width': 1, 'circle-stroke-color': '#001a1a'
    }
  });

  /* Temperatura */
  map.addSource('temp', { type: 'geojson', data: empty });
  map.addLayer({
    id: 'temp-layer', type: 'circle', source: 'temp',
    layout: { visibility: 'none' },
    paint: {
      'circle-radius': 16, 'circle-blur': 0.6, 'circle-opacity': 0.35,
      'circle-color': [
        'interpolate', ['linear'], ['get', 'temp'],
        -20, '#3b4cff', 0, '#00d0ff', 15, '#00ff9d', 25, '#ffd000', 35, '#ff5500', 45, '#ff0033'
      ]
    }
  });
  map.addLayer({
    id: 'temp-label', type: 'symbol', source: 'temp',
    layout: { visibility: 'none', 'text-field': ['get', 'label'], 'text-size': 12, 'text-font': ['Noto Sans Regular'] },
    paint: { 'text-color': '#ffffff', 'text-halo-color': '#000000', 'text-halo-width': 1 }
  });

  /* Popups de clique */
  const popup = new _maplibre.Popup({ closeButton: false, className: 'mapa-ml-popup' });
  map.on('click', 'air-layer', (e) => {
    const p = e.features[0].properties;
    popup.setLngLat(e.lngLat).setHTML(
      `<b>✈ ${p.callsign}</b><br>Alt: ${p.alt} m<br>Vel: ${p.vel} km/h<br>Rumo: ${Math.round(p.hdg)}°`
    ).addTo(map);
  });
  map.on('click', 'naval-layer', (e) => {
    const p = e.features[0].properties;
    popup.setLngLat(e.lngLat).setHTML(
      `<b>🚢 MMSI ${p.mmsi}</b><br>Veloc: ${p.sog} nós<br>Rumo: ${Math.round(p.heading)}°`
    ).addTo(map);
  });
  ['air-layer', 'naval-layer'].forEach(l => {
    map.on('mouseenter', l, () => map.getCanvas().style.cursor = 'pointer');
    map.on('mouseleave', l, () => map.getCanvas().style.cursor = '');
  });
}

/* ── Toggle de visibilidade ── */
function setVis(map, ids, on) {
  ids.forEach(id => { if (map.getLayer(id)) map.setLayoutProperty(id, 'visibility', on ? 'visible' : 'none'); });
}

/* ── Refresh de cada feed ── */
async function refreshAir(map, refs) {
  if (!refs.air.checked) return;
  const data = await fetchAir(map);
  const fc = airToGeo(data);
  if (map.getSource('air')) map.getSource('air').setData(fc);
  refs.counts.air = fc.features.length;
  updateStatus(refs);
}
async function refreshNaval(map, refs) {
  if (!refs.naval.checked) return;
  const data = await fetchNaval();
  if (data && map.getSource('naval')) {
    map.getSource('naval').setData(data);
    refs.counts.naval = data.features?.length || 0;
    updateStatus(refs);
  }
}
async function refreshTemp(map, refs) {
  if (!refs.temp.checked) return;
  const fc = await fetchTemp(map);
  if (fc && map.getSource('temp')) map.getSource('temp').setData(fc);
}

function updateStatus(refs) {
  refs.statusEl.textContent =
    `✈ ${refs.counts.air} aeronaves · 🚢 ${refs.counts.naval} navios · ⟳ ${new Date().toLocaleTimeString('pt-BR')}`;
}

/* ════════════════════════════════════
   Init
   ════════════════════════════════════ */
async function initMap(mapEl, refs) {
  const maplibregl = await loadMapLibre();
  if (!maplibregl) { mapEl.innerHTML = '<p class="mapa-error">Falha ao carregar MapLibre GL.</p>'; return; }
  _maplibre = maplibregl;

  _map = new maplibregl.Map({
    container: mapEl,
    style: buildStyle(),
    center: [-47.9, -15.8],
    zoom: 3.5,
    pitch: 0,
    maxPitch: 85,
    maxZoom: 22,
    attributionControl: { compact: true }
  });
  const map = _map;
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
  map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

  map.on('load', async () => {
    addDataLayers(map, refs);

    /* coordenadas em tempo real */
    map.on('mousemove', (e) => {
      refs.coordEl.textContent =
        `LAT ${e.lngLat.lat.toFixed(4)}  LON ${e.lngLat.lng.toFixed(4)}`;
    });

    /* primeira carga */
    await loadRadar(map);
    setVis(map, ['radar-layer'], refs.radar.checked);
    refreshAir(map, refs);

    /* timers tempo real */
    _timers.push(setInterval(() => refreshAir(map, refs), 12000));
    _timers.push(setInterval(() => refreshNaval(map, refs), 20000));
    _timers.push(setInterval(() => refreshTemp(map, refs), 5 * 60000));
    _timers.push(setInterval(() => loadRadar(map), 5 * 60000));
    map.on('moveend', () => { refreshAir(map, refs); refreshTemp(map, refs); });
  });

  return map;
}

/* ════════════════════════════════════
   Página
   ════════════════════════════════════ */
export function mapaPage() {
  cleanup();

  const mapEl = h('div', { className: 'mapa-ml' });
  const statusEl = h('span', { className: 'mapa-live__status' }, 'Inicializando…');
  const coordEl = h('span', { className: 'mapa-coord' }, 'LAT —  LON —');

  const mk = (checked = false) => h('input', { type: 'checkbox', checked });
  const air = mk(true), naval = mk(false), temp = mk(false), radar = mk(true),
        cabos = mk(false), grid = mk(false), gebco = mk(false), hill = mk(false),
        gibs = mk(false), labels = mk(true);

  const refs = { air, naval, temp, radar, statusEl, coordEl, counts: { air: 0, naval: 0 } };

  /* Base layer radios */
  let base = 'sat';
  function setBase(b) {
    base = b;
    if (!_map) return;
    setVis(_map, ['base-sat'], b === 'sat');
    setVis(_map, ['base-dark'], b === 'dark');
    setVis(_map, ['base-terreno'], b === 'terreno');
    /* Rótulos: úteis sobre satélite/terreno (modo híbrido); o tático escuro já tem rótulos. */
    const showLabels = labels.checked && b !== 'dark';
    setVis(_map, ['labels-layer'], showLabels);
  }

  const baseBtns = h('div', { className: 'mapa-base-group' },
    ...[['sat', '🛰 Satélite'], ['dark', '◗ Tático'], ['terreno', '⛰ Terreno']].map(([id, label]) =>
      h('button', {
        className: `mapa-base-btn${id === 'sat' ? ' is-active' : ''}`,
        onclick: (e) => {
          document.querySelectorAll('.mapa-base-btn').forEach(b => b.classList.remove('is-active'));
          e.currentTarget.classList.add('is-active');
          setBase(id);
        }
      }, label)
    )
  );

  /* Terreno 3D + exagero */
  const exag = h('input', { type: 'range', min: 1, max: 4, step: 0.5, value: 1.5, className: 'mapa-slider' });
  const terrain3dBtn = h('button', { className: 'mapa-btn', onclick: () => {
    if (!_map) return;
    _terrainOn = !_terrainOn;
    if (_terrainOn) {
      _map.setTerrain({ source: 'dem', exaggeration: +exag.value });
      _map.easeTo({ pitch: 60, duration: 800 });
      terrain3dBtn.classList.add('is-active');
      terrain3dBtn.textContent = '⛰ 3D ON';
    } else {
      _map.setTerrain(null);
      _map.easeTo({ pitch: 0, duration: 800 });
      terrain3dBtn.classList.remove('is-active');
      terrain3dBtn.textContent = '⛰ Relevo 3D';
    }
  }}, '⛰ Relevo 3D');
  exag.addEventListener('input', () => { if (_terrainOn && _map) _map.setTerrain({ source: 'dem', exaggeration: +exag.value }); });

  /* Globo */
  const globeBtn = h('button', { className: 'mapa-btn', onclick: () => {
    if (!_map) return;
    const cur = _map.getProjection?.()?.type;
    const next = cur === 'globe' ? 'mercator' : 'globe';
    try { _map.setProjection({ type: next }); globeBtn.classList.toggle('is-active', next === 'globe'); } catch {}
  }}, '🌐 Globo');

  /* Overlays — wiring */
  function wire(input, layers, onToggle) {
    input.addEventListener('change', () => {
      if (_map) setVis(_map, layers, input.checked);
      if (input.checked && onToggle) onToggle();
    });
  }
  wire(air, ['air-layer'], () => refreshAir(_map, refs));
  wire(naval, ['naval-layer'], () => refreshNaval(_map, refs));
  wire(temp, ['temp-layer', 'temp-label'], () => refreshTemp(_map, refs));
  wire(radar, ['radar-layer']);
  wire(grid, ['grid-layer']);
  wire(hill, ['hillshade']);
  wire(gebco, ['gebco-layer']);
  wire(gibs, ['gibs-layer']);
  labels.addEventListener('change', () => {
    if (_map) setVis(_map, ['labels-layer'], labels.checked && base !== 'dark');
  });
  cabos.addEventListener('change', async () => {
    if (_map) setVis(_map, ['cabos-layer'], cabos.checked);
    if (cabos.checked && _map?.getSource('cabos')) {
      const data = await fetchCabos();
      if (data) _map.getSource('cabos').setData(data);
    }
  });

  const layerToggle = (input, label, hint) =>
    h('label', { className: 'mapa-tog' }, input, h('span', null, label),
      hint && h('small', { className: 'mapa-tog__hint' }, hint));

  const panel = h('div', { className: 'mapa-panel' },
    h('div', { className: 'mapa-panel__sec' },
      h('div', { className: 'mapa-panel__title' }, 'Base'),
      baseBtns,
      layerToggle(labels, '🏷 Rótulos (modo híbrido)')
    ),
    h('div', { className: 'mapa-panel__sec' },
      h('div', { className: 'mapa-panel__title' }, 'Relevo'),
      h('div', { className: 'mapa-panel__row' }, terrain3dBtn, globeBtn),
      h('div', { className: 'mapa-panel__row' },
        h('span', { className: 'mapa-exag-lbl' }, 'Exagero'), exag),
      layerToggle(hill, 'Sombreamento (hillshade)')
    ),
    h('div', { className: 'mapa-panel__sec' },
      h('div', { className: 'mapa-panel__title' }, '◗ Camadas Táticas'),
      layerToggle(air, '✈ Espaço Aéreo', 'tempo real'),
      layerToggle(naval, '🚢 Naval (AIS)', 'tempo real · Báltico'),
      layerToggle(cabos, '🔌 Cabos Submarinos'),
      layerToggle(gebco, '🌊 Batimetria (subaquático)'),
      layerToggle(temp, '🌡 Temperatura'),
      layerToggle(radar, '🌧 Radar de Chuva'),
      layerToggle(gibs, '🛰 Satélite NASA (nuvens)', 'tempo quase real'),
      layerToggle(grid, '⊞ Grid de Coordenadas')
    ),
    h('div', { className: 'mapa-panel__sec' },
      h('button', { className: 'mapa-btn mapa-btn--full', onclick: () => {
        if (_map && navigator.geolocation) navigator.geolocation.getCurrentPosition(
          p => _map.flyTo({ center: [p.coords.longitude, p.coords.latitude], zoom: 18 }));
      }}, '◉ Minha posição (zoom rua)'),
      h('button', { className: 'mapa-btn mapa-btn--full', onclick: () => {
        if (_map) _map.zoomTo(Math.min(_map.getZoom() + 6, 22), { duration: 900 });
      }}, '🔍 Zoom máximo (~5 m)'),
      h('button', { className: 'mapa-btn mapa-btn--full', onclick: () => {
        if (_map) _map.flyTo({ center: [22, 59.5], zoom: 6 });
      }}, '🚢 Ver navios (Báltico)')
    )
  );

  const wrap = h('div', { className: 'mapa-tac-page' },
    h('div', { className: 'mapa-tac-head' },
      h('div', null,
        h('h1', { className: 'mapa-tac-title' }, '◗ Mapa Tático Mundial'),
        h('p', { className: 'mapa-tac-sub' }, 'Espaço aéreo, naval, subaquático e terreno 3D em tempo real.')
      ),
      h('div', { className: 'mapa-live' },
        h('span', { className: 'mapa-live__dot' }),
        statusEl
      )
    ),
    h('div', { className: 'mapa-tac-body' },
      panel,
      h('div', { className: 'mapa-tac-viewport' },
        mapEl,
        h('div', { className: 'mapa-coord-bar' }, coordEl)
      )
    )
  );

  requestAnimationFrame(() => initMap(mapEl, refs));

  const obs = new MutationObserver(() => {
    if (!document.body.contains(wrap)) { cleanup(); obs.disconnect(); }
  });
  obs.observe(document.body, { childList: true, subtree: true });

  return wrap;
}
