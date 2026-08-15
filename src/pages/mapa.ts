/**
 * /mapa — Mapa Tático Mundial.
 *
 * MapLibre continua carregado sob demanda; os feeds externos são opcionais e
 * degradam para camadas vazias quando a rede falha. O módulo limpa timers e o
 * mapa ao sair para não manter polling em uma rota desmontada.
 */

import '../styles/mapa.css';
import { h } from '../utils/helpers.js';
import { estiloMapLibre, CAMADAS_BASE } from '../data/camadas-mapa.js';
import { loadMapLibre } from '../utils/maplibre-loader.js';
import type { MapLibreNamespace } from '../utils/maplibre-loader.js';

const OPENSKY = 'https://opensky-network.org/api/states/all';
const RAINVIEWER = 'https://api.rainviewer.com/public/weather-maps.json';
const OPENMETEO = 'https://api.open-meteo.com/v1/forecast';
const AIS_DIGITRAFFIC = 'https://meri.digitraffic.fi/api/ais/v1/locations';
const CABLES = 'https://www.submarinecablemap.com/api/v3/cable/cable-geo.json';

type GeoProperties = Record<string, string | number | boolean | null>;
interface GeoFeature { readonly type: 'Feature'; readonly geometry: { readonly type: string; readonly coordinates: readonly unknown[] }; properties: GeoProperties }
interface FeatureCollection { readonly type: 'FeatureCollection'; features: GeoFeature[] }
interface Bounds { getSouth(): number; getWest(): number; getNorth(): number; getEast(): number }
interface MapSource { setData(data: unknown): void }
interface MapEvent { readonly lngLat: { readonly lat: number; readonly lng: number }; readonly features?: readonly [{ readonly properties?: GeoProperties }?] }
interface TacticalMap {
  addControl(control: unknown, position?: string): TacticalMap;
  on(type: string, layerOrListener: string | ((event: MapEvent) => void), listener?: (event: MapEvent) => void): TacticalMap;
  getBounds(): Bounds;
  addSource(id: string, source: unknown): void;
  getSource(id: string): MapSource | null;
  removeSource(id: string): void;
  addLayer(layer: unknown): void;
  getLayer(id: string): unknown;
  removeLayer(id: string): void;
  setLayoutProperty(id: string, property: string, value: string): void;
  getCanvas(): HTMLCanvasElement;
  remove(): void;
  setTerrain(value: unknown): void;
  easeTo(options: Readonly<Record<string, unknown>>): void;
  setProjection(value: Readonly<Record<string, string>>): void;
  getProjection(): { readonly type?: string } | null;
  flyTo(options: Readonly<Record<string, unknown>>): void;
  zoomTo(zoom: number, options?: Readonly<Record<string, unknown>>): void;
  getZoom(): number;
}
interface MapLibreApi extends MapLibreNamespace { readonly Popup: new (options?: Readonly<Record<string, unknown>>) => MapPopup }
interface MapPopup { setLngLat(lngLat: unknown): MapPopup; setHTML(html: string): MapPopup; addTo(map: TacticalMap): MapPopup }
interface RadarFrame { readonly path: string }
interface MapRefs { readonly air: HTMLInputElement; readonly naval: HTMLInputElement; readonly temp: HTMLInputElement; readonly radar: HTMLInputElement; readonly statusEl: HTMLSpanElement; readonly coordEl: HTMLSpanElement; readonly counts: { air: number; naval: number } }

let map: TacticalMap | null = null;
let timers: number[] = [];
let terrainOn = false;
let radarFrames: RadarFrame[] = [];
let radarIndex = 0;
let maplibre: MapLibreApi | null = null;

function isRecord(value: unknown): value is Record<string, unknown> { return value !== null && typeof value === 'object' && !Array.isArray(value); }
function numberValue(value: unknown): number | null { return typeof value === 'number' && Number.isFinite(value) ? value : null; }
function clearTimers(): void { timers.forEach((timer) => window.clearInterval(timer)); timers = []; }
function cleanup(): void { clearTimers(); if (map) { try { map.remove(); } catch { /* already removed */ } map = null; } radarFrames = []; terrainOn = false; }
function buildStyle(): unknown { return estiloMapLibre({ base: 'sat', overlays: ['labels'] }); }

async function fetchAir(current: TacticalMap): Promise<unknown> {
  try { const bounds = current.getBounds(); const url = `${OPENSKY}?lamin=${bounds.getSouth().toFixed(2)}&lomin=${bounds.getWest().toFixed(2)}&lamax=${bounds.getNorth().toFixed(2)}&lomax=${bounds.getEast().toFixed(2)}`; const response = await fetch(url, { signal: AbortSignal.timeout(8000) }); return response.ok ? response.json() : null; } catch { return null; }
}
function airToGeo(value: unknown): FeatureCollection {
  const collection: FeatureCollection = { type: 'FeatureCollection', features: [] };
  if (!isRecord(value) || !Array.isArray(value.states)) return collection;
  value.states.forEach((state) => {
    if (!Array.isArray(state)) return;
    const [icao, callsign, , , , longitude, latitude, baroAltitude, onGround, velocity, heading, , , geoAltitude] = state;
    const lat = numberValue(latitude); const lon = numberValue(longitude);
    if (lat === null || lon === null || onGround === true) return;
    const altitude = numberValue(geoAltitude) ?? numberValue(baroAltitude) ?? 0;
    const speed = numberValue(velocity);
    collection.features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [lon, lat] }, properties: { callsign: String(callsign || icao || '').trim(), alt: Math.round(altitude), vel: speed === null ? 0 : Math.round(speed * 3.6), hdg: numberValue(heading) ?? 0 } });
  });
  return collection;
}
async function fetchNaval(): Promise<unknown> { try { const response = await fetch(AIS_DIGITRAFFIC, { signal: AbortSignal.timeout(8000) }); return response.ok ? response.json() : null; } catch { return null; } }
async function fetchCables(): Promise<unknown> { try { const response = await fetch(CABLES, { signal: AbortSignal.timeout(9000) }); return response.ok ? response.json() : null; } catch { return null; } }
async function fetchTemp(current: TacticalMap): Promise<FeatureCollection | null> {
  try {
    const bounds = current.getBounds(); const cols = 7; const rows = 5; const lats: string[] = []; const lons: string[] = [];
    for (let row = 0; row < rows; row += 1) for (let col = 0; col < cols; col += 1) { lats.push((bounds.getSouth() + (bounds.getNorth() - bounds.getSouth()) * (row + 0.5) / rows).toFixed(3)); lons.push((bounds.getWest() + (bounds.getEast() - bounds.getWest()) * (col + 0.5) / cols).toFixed(3)); }
    const response = await fetch(`${OPENMETEO}?latitude=${lats.join(',')}&longitude=${lons.join(',')}&current=temperature_2m`, { signal: AbortSignal.timeout(8000) }); if (!response.ok) return null;
    const data: unknown = await response.json(); const values = Array.isArray(data) ? data : [data]; const collection: FeatureCollection = { type: 'FeatureCollection', features: [] };
    values.forEach((item, index) => { if (!isRecord(item) || !isRecord(item.current)) return; const temperature = numberValue(item.current.temperature_2m); if (temperature === null) return; collection.features.push({ type: 'Feature', geometry: { type: 'Point', coordinates: [Number(lons[index]), Number(lats[index])] }, properties: { temp: Math.round(temperature), label: `${Math.round(temperature)}°` } }); });
    return collection;
  } catch { return null; }
}
async function loadRadar(current: TacticalMap): Promise<void> { try { const response = await fetch(RAINVIEWER, { signal: AbortSignal.timeout(6000) }); if (!response.ok) return; const value: unknown = await response.json(); if (!isRecord(value) || !isRecord(value.radar)) return; const past = Array.isArray(value.radar.past) ? value.radar.past : []; const nowcast = Array.isArray(value.radar.nowcast) ? value.radar.nowcast : []; radarFrames = [...past, ...nowcast].filter((frame): frame is RadarFrame => isRecord(frame) && typeof frame.path === 'string'); if (!radarFrames.length) return; radarIndex = radarFrames.length - 1; setRadarFrame(current, radarIndex); } catch { /* feed opcional */ } }
function setRadarFrame(current: TacticalMap, index: number): void { const frame = radarFrames[index]; if (!frame) return; const id = 'radar-src'; if (current.getLayer('radar-layer')) current.removeLayer('radar-layer'); if (current.getSource(id)) current.removeSource(id); current.addSource(id, { type: 'raster', tileSize: 256, tiles: [`https://tilecache.rainviewer.com${frame.path}/256/{z}/{x}/{y}/2/1_1.png`] }); current.addLayer({ id: 'radar-layer', type: 'raster', source: id, paint: { 'raster-opacity': 0.55 } }); }
function graticuleGeo(step = 10): FeatureCollection { const collection: FeatureCollection = { type: 'FeatureCollection', features: [] }; for (let longitude = -180; longitude <= 180; longitude += step) collection.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[longitude, -85], [longitude, 85]] }, properties: {} }); for (let latitude = -80; latitude <= 80; latitude += step) collection.features.push({ type: 'Feature', geometry: { type: 'LineString', coordinates: [[-180, latitude], [180, latitude]] }, properties: {} }); return collection; }

function addDataLayers(current: TacticalMap, refs: MapRefs): void {
  const emptyCollection: FeatureCollection = { type: 'FeatureCollection', features: [] };
  current.addSource('cabos', { type: 'geojson', data: emptyCollection }); current.addLayer({ id: 'cabos-layer', type: 'line', source: 'cabos', layout: { visibility: 'none', 'line-cap': 'round' }, paint: { 'line-color': '#d4a24e', 'line-width': 1, 'line-opacity': 0.5 } });
  current.addSource('grid', { type: 'geojson', data: graticuleGeo(10) }); current.addLayer({ id: 'grid-layer', type: 'line', source: 'grid', layout: { visibility: 'none' }, paint: { 'line-color': '#d4a24e', 'line-width': 0.4, 'line-opacity': 0.25 } });
  current.addSource('naval', { type: 'geojson', data: emptyCollection }); current.addLayer({ id: 'naval-layer', type: 'circle', source: 'naval', layout: { visibility: 'none' }, paint: { 'circle-radius': 3, 'circle-color': '#00ff9d', 'circle-stroke-width': 1, 'circle-stroke-color': '#003322' } });
  current.addSource('air', { type: 'geojson', data: emptyCollection }); current.addLayer({ id: 'air-layer', type: 'circle', source: 'air', layout: { visibility: 'none' }, paint: { 'circle-radius': 4, 'circle-color': ['interpolate', ['linear'], ['get', 'alt'], 0, '#ff3b3b', 3000, '#ffaa00', 8000, '#d4a24e', 12000, '#ffffff'], 'circle-stroke-width': 1, 'circle-stroke-color': '#001a1a' } });
  current.addSource('temp', { type: 'geojson', data: emptyCollection }); current.addLayer({ id: 'temp-layer', type: 'circle', source: 'temp', layout: { visibility: 'none' }, paint: { 'circle-radius': 16, 'circle-blur': 0.6, 'circle-opacity': 0.35, 'circle-color': ['interpolate', ['linear'], ['get', 'temp'], -20, '#3b4cff', 0, '#00d0ff', 15, '#00ff9d', 25, '#ffd000', 35, '#ff5500', 45, '#ff0033'] } }); current.addLayer({ id: 'temp-label', type: 'symbol', source: 'temp', layout: { visibility: 'none', 'text-field': ['get', 'label'], 'text-size': 12, 'text-font': ['Noto Sans Regular'] }, paint: { 'text-color': '#ffffff', 'text-halo-color': '#000000', 'text-halo-width': 1 } });
  if (!maplibre) return; const popup = new maplibre.Popup({ closeButton: false, className: 'mapa-ml-popup' });
  current.on('click', 'air-layer', (event) => { const props = event.features?.[0]?.properties ?? {}; popup.setLngLat(event.lngLat).setHTML(`<b>✈ ${String(props.callsign ?? '')}</b><br>Alt: ${String(props.alt ?? 0)} m<br>Vel: ${String(props.vel ?? 0)} km/h<br>Rumo: ${Math.round(Number(props.hdg ?? 0))}°`).addTo(current); });
  current.on('click', 'naval-layer', (event) => { const props = event.features?.[0]?.properties ?? {}; popup.setLngLat(event.lngLat).setHTML(`<b>🚢 MMSI ${String(props.mmsi ?? '—')}</b><br>Veloc: ${String(props.sog ?? 0)} nós<br>Rumo: ${Math.round(Number(props.heading ?? 0))}°`).addTo(current); });
  ['air-layer', 'naval-layer'].forEach((layer) => { current.on('mouseenter', layer, () => { current.getCanvas().style.cursor = 'pointer'; }); current.on('mouseleave', layer, () => { current.getCanvas().style.cursor = ''; }); });
}
function setVisibility(current: TacticalMap, ids: readonly string[], enabled: boolean): void { ids.forEach((id) => { if (current.getLayer(id)) current.setLayoutProperty(id, 'visibility', enabled ? 'visible' : 'none'); }); }
function updateStatus(refs: MapRefs): void { refs.statusEl.textContent = `✈ ${refs.counts.air} aeronaves · 🚢 ${refs.counts.naval} navios · ⟳ ${new Date().toLocaleTimeString('pt-BR')}`; }
async function refreshAir(current: TacticalMap, refs: MapRefs): Promise<void> { if (!refs.air.checked) return; const collection = airToGeo(await fetchAir(current)); current.getSource('air')?.setData(collection); refs.counts.air = collection.features.length; updateStatus(refs); }
async function refreshNaval(current: TacticalMap, refs: MapRefs): Promise<void> { if (!refs.naval.checked) return; const value = await fetchNaval(); if (!isRecord(value) || !Array.isArray(value.features)) return; const collection = { ...value, features: value.features.slice(0, 800) }; current.getSource('naval')?.setData(collection); refs.counts.naval = collection.features.length; updateStatus(refs); }
async function refreshTemp(current: TacticalMap, refs: MapRefs): Promise<void> { if (!refs.temp.checked) return; const collection = await fetchTemp(current); if (collection) current.getSource('temp')?.setData(collection); }

async function initMap(mapElement: HTMLDivElement, refs: MapRefs): Promise<TacticalMap | null> {
  const namespace = await loadMapLibre(); if (!namespace) { mapElement.innerHTML = '<p class="mapa-error">Falha ao carregar MapLibre GL.</p>'; return null; }
  maplibre = namespace as unknown as MapLibreApi;
  map = new maplibre.Map({ container: mapElement, style: buildStyle(), center: [-47.9, -15.8], zoom: 3.5, pitch: 0, maxPitch: 85, maxZoom: 22, attributionControl: { compact: true } }) as unknown as TacticalMap;
  const current = map; current.addControl(new maplibre.NavigationControl({ visualizePitch: true }), 'top-right'); current.addControl(new maplibre.ScaleControl({ unit: 'metric' }), 'bottom-left');
  current.on('load', async () => { addDataLayers(current, refs); current.on('mousemove', (event) => { refs.coordEl.textContent = `LAT ${event.lngLat.lat.toFixed(4)}  LON ${event.lngLat.lng.toFixed(4)}`; }); await loadRadar(current); setVisibility(current, ['radar-layer'], refs.radar.checked); void refreshAir(current, refs); timers.push(window.setInterval(() => { void refreshAir(current, refs); }, 12000)); timers.push(window.setInterval(() => { void refreshNaval(current, refs); }, 20000)); timers.push(window.setInterval(() => { void refreshTemp(current, refs); }, 300000)); timers.push(window.setInterval(() => { void loadRadar(current); }, 300000)); current.on('moveend', () => { void refreshAir(current, refs); void refreshTemp(current, refs); }); });
  return current;
}

export function mapaPage(): HTMLDivElement {
  cleanup(); const mapElement = h('div', { className: 'mapa-ml' }); const status = h('span', { className: 'mapa-live__status' }, 'Inicializando…'); const coordinates = h('span', { className: 'mapa-coord' }, 'LAT —  LON —');
  const checkbox = (checked = false): HTMLInputElement => h('input', { type: 'checkbox', checked }); const air = checkbox(true); const naval = checkbox(); const temp = checkbox(); const radar = checkbox(true); const cables = checkbox(); const grid = checkbox(); const gebco = checkbox(); const hill = checkbox(); const gibs = checkbox(); const labels = checkbox(true);
  const refs: MapRefs = { air, naval, temp, radar, statusEl: status, coordEl: coordinates, counts: { air: 0, naval: 0 } };
  const icons: Record<string, string> = { sat: '🛰', dark: '◗', terreno: '⛰', imagery: '🌍' }; let base = CAMADAS_BASE.find((layer) => layer.padrao)?.id ?? CAMADAS_BASE[0]?.id ?? 'sat';
  function setBase(next: string): void { base = next; if (!map) return; CAMADAS_BASE.forEach((layer) => setVisibility(map as TacticalMap, [`base-${layer.id}`], layer.id === next)); setVisibility(map as TacticalMap, ['labels-layer'], labels.checked && next !== 'dark'); }
  const baseButtons = h('div', { className: 'mapa-base-group' }, ...CAMADAS_BASE.map((layer) => h('button', { className: `mapa-base-btn${layer.id === base ? ' is-active' : ''}`, title: layer.desc, onclick: (event: Event) => { const target = event.currentTarget; if (target instanceof HTMLElement) { document.querySelectorAll('.mapa-base-btn').forEach((button) => button.classList.remove('is-active')); target.classList.add('is-active'); } setBase(layer.id); } }, `${icons[layer.id] ?? '▣'} ${layer.nome}`)));
  const exaggeration = h('input', { type: 'range', min: 1, max: 4, step: 0.5, value: 1.5, className: 'mapa-slider', 'aria-label': 'Exagero vertical do relevo' });
  const terrainButton = h('button', { className: 'mapa-btn', onclick: () => { if (!map) return; terrainOn = !terrainOn; if (terrainOn) { map.setTerrain({ source: 'dem', exaggeration: Number(exaggeration.value) }); map.easeTo({ pitch: 60, duration: 800 }); terrainButton.classList.add('is-active'); terrainButton.textContent = '⛰ 3D ON'; } else { map.setTerrain(null); map.easeTo({ pitch: 0, duration: 800 }); terrainButton.classList.remove('is-active'); terrainButton.textContent = '⛰ Relevo 3D'; } } }, '⛰ Relevo 3D');
  exaggeration.addEventListener('input', () => { if (terrainOn && map) map.setTerrain({ source: 'dem', exaggeration: Number(exaggeration.value) }); });
  const globeButton = h('button', { className: 'mapa-btn', onclick: () => { if (!map) return; const current = map.getProjection()?.type; const next = current === 'globe' ? 'mercator' : 'globe'; try { map.setProjection({ type: next }); globeButton.classList.toggle('is-active', next === 'globe'); } catch { /* browser fallback */ } } }, '🌐 Globo');
  function wire(input: HTMLInputElement, layers: readonly string[], onToggle?: () => void): void { input.addEventListener('change', () => { if (map) setVisibility(map, layers, input.checked); if (input.checked) onToggle?.(); }); }
  wire(air, ['air-layer'], () => { if (map) void refreshAir(map, refs); }); wire(naval, ['naval-layer'], () => { if (map) void refreshNaval(map, refs); }); wire(temp, ['temp-layer', 'temp-label'], () => { if (map) void refreshTemp(map, refs); }); wire(radar, ['radar-layer']); wire(grid, ['grid-layer']); wire(hill, ['hillshade']); wire(gebco, ['gebco-layer']); wire(gibs, ['gibs-layer']); labels.addEventListener('change', () => { if (map) setVisibility(map, ['labels-layer'], labels.checked && base !== 'dark'); });
  cables.addEventListener('change', async () => { if (map) setVisibility(map, ['cabos-layer'], cables.checked); if (cables.checked && map) { const data = await fetchCables(); if (data) map.getSource('cabos')?.setData(data); } });
  const toggle = (input: HTMLInputElement, label: string, hint?: string): HTMLLabelElement => h('label', { className: 'mapa-tog' }, input, h('span', null, label), hint ? h('small', { className: 'mapa-tog__hint' }, hint) : false);
  const panel = h('div', { className: 'mapa-panel' }, h('div', { className: 'mapa-panel__sec' }, h('div', { className: 'mapa-panel__title' }, 'Base'), baseButtons, toggle(labels, '🏷 Rótulos (modo híbrido)')), h('div', { className: 'mapa-panel__sec' }, h('div', { className: 'mapa-panel__title' }, 'Relevo'), h('div', { className: 'mapa-panel__row' }, terrainButton, globeButton), h('div', { className: 'mapa-panel__row' }, h('span', { className: 'mapa-exag-lbl' }, 'Exagero'), exaggeration), toggle(hill, 'Sombreamento (hillshade)')), h('div', { className: 'mapa-panel__sec' }, h('div', { className: 'mapa-panel__title' }, '◗ Camadas Táticas'), toggle(air, '✈ Espaço Aéreo', 'tempo real'), toggle(naval, '🚢 Naval (AIS)', 'tempo real · Báltico'), toggle(cables, '🔌 Cabos Submarinos'), toggle(gebco, '🌊 Batimetria (subaquático)'), toggle(temp, '🌡 Temperatura'), toggle(radar, '🌧 Radar de Chuva'), toggle(gibs, '🛰 Satélite NASA (nuvens)', 'tempo quase real'), toggle(grid, '⊞ Grid de Coordenadas')), h('div', { className: 'mapa-panel__sec' }, h('button', { className: 'mapa-btn mapa-btn--full', onclick: () => { if (map && navigator.geolocation) navigator.geolocation.getCurrentPosition((position) => map?.flyTo({ center: [position.coords.longitude, position.coords.latitude], zoom: 18 })); } }, '◉ Minha posição (zoom rua)'), h('button', { className: 'mapa-btn mapa-btn--full', onclick: () => { if (map) map.zoomTo(Math.min(map.getZoom() + 6, 22), { duration: 900 }); } }, '🔍 Zoom máximo (~5 m)'), h('button', { className: 'mapa-btn mapa-btn--full', onclick: () => { map?.flyTo({ center: [22, 59.5], zoom: 6 }); } }, '🚢 Ver navios (Báltico)')));
  const wrap = h('div', { className: 'mapa-tac-page' }, h('div', { className: 'mapa-tac-head' }, h('div', null, h('h1', { className: 'mapa-tac-title' }, '◗ Mapa Tático Mundial'), h('p', { className: 'mapa-tac-sub' }, 'Espaço aéreo, naval, subaquático e terreno 3D em tempo real.')), h('div', { className: 'mapa-live' }, h('span', { className: 'mapa-live__dot' }), status)), h('div', { className: 'mapa-tac-body' }, panel, h('div', { className: 'mapa-tac-viewport' }, mapElement, h('div', { className: 'mapa-coord-bar' }, coordinates))));
  requestAnimationFrame(() => { void initMap(mapElement, refs); });
  const observer = new MutationObserver(() => { if (!document.body.contains(wrap)) { cleanup(); observer.disconnect(); } }); observer.observe(document.body, { childList: true, subtree: true });
  return wrap;
}
