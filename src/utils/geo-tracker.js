/**
 * GeoPulse — motor de rastreio de localização no tempo.
 *
 * Conceito do **geopulse** (tess1o/geopulse): registrar onde você esteve ao
 * longo do tempo e mostrar a trajetória + estatísticas. Usa a Geolocation API
 * do navegador (funciona no celular), acumula os pontos e persiste a trilha no
 * localStorage (assim dá pra fechar e continuar depois).
 *
 * JS puro, sem dependências e sem backend.
 */

import { storage } from '../core/storage.js';

const KEY = 'geo:track';
const MAX_POINTS = 5000;

/** Distância em metros entre dois {lat, lon} (Haversine). */
export function haversine(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const la1 = toRad(a.lat), la2 = toRad(b.lat);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(x)));
}

export function createGeoTracker() {
  let points = storage.get(KEY, []) || [];
  let watchId = null;

  function persist() {
    if (points.length > MAX_POINTS) points = points.slice(-MAX_POINTS);
    storage.set(KEY, points);
  }

  function start(onUpdate, onError) {
    if (!('geolocation' in navigator)) {
      onError && onError('Geolocalização indisponível neste navegador.');
      return false;
    }
    if (watchId != null) return true;
    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const p = {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          acc: pos.coords.accuracy ?? null,
          spd: pos.coords.speed ?? null,
          t: pos.timestamp || Date.now()
        };
        const last = points[points.length - 1];
        /* só guarda se moveu ≥ 2 m (ou é o 1º) — evita acumular ruído parado */
        if (!last || haversine(last, p) >= 2) {
          points.push(p);
          persist();
        }
        onUpdate && onUpdate(stats(), points);
      },
      (err) => { onError && onError(err.message || 'Falha ao obter a localização.'); },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 }
    );
    return true;
  }

  function stop() {
    if (watchId != null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  }

  function isRunning() { return watchId != null; }

  function clear() { points = []; persist(); }

  function getPoints() { return points; }

  function stats() {
    let dist = 0, maxSpd = 0;
    for (let i = 1; i < points.length; i++) {
      dist += haversine(points[i - 1], points[i]);
      const s = points[i].spd;
      if (s != null && s > maxSpd) maxSpd = s;
    }
    const dur = points.length >= 2 ? (points[points.length - 1].t - points[0].t) : 0;
    const avg = dur > 0 ? dist / (dur / 1000) : 0; /* m/s */
    return { count: points.length, dist, dur, avg, maxSpd, cur: points[points.length - 1] || null };
  }

  return { start, stop, isRunning, clear, getPoints, stats };
}
