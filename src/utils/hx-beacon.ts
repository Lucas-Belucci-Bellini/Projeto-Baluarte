/**
 * @internal
 * Telemetria de sessão opcional, desativada por padrão.
 * O contrato fail-closed está em docs/v2/HX_BEACON_PRIVACY_CONTRACT_2026-08-26.md.
 * Só registra acessos quando há consentimento explícito e endpoint configurado.
 */

interface BeaconConfig {
  readonly ep: string;
  readonly salt: string;
}

export type GeoCoordinate = string | number;

export interface BeaconGeo {
  readonly ip: string;
  readonly cidade: string;
  readonly pais: string;
  readonly regiao: string;
  readonly lat: GeoCoordinate;
  readonly lon: GeoCoordinate;
}

export interface HxBeaconPayload extends BeaconGeo {
  readonly s: string;
  readonly fp: string;
  readonly ua: string;
  readonly lang: string;
  readonly tela: string;
  readonly tz: string;
  readonly data: string;
  readonly hora: string;
  readonly ts: string;
  readonly ref: string;
  readonly rota: string;
}

const CONFIG: BeaconConfig = {
  ep: '__HX_ENDPOINT__', // substituir pelo URL do Apps Script
  salt: '__HX_SALT__', // string aleatória para deduplicação
};

function fingerprint(): string {
  const raw = [
    navigator.userAgent,
    navigator.language,
    `${screen.width}x${screen.height}@${window.devicePixelRatio || 1}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.hardwareConcurrency || 0,
    navigator.platform || '',
  ].join('|');

  let hash = 0;
  for (let index = 0; index < raw.length; index += 1) {
    hash = Math.imul(31, hash) + raw.charCodeAt(index) | 0;
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function sessionKey(fp: string): string {
  const day = new Date().toISOString().slice(0, 10);
  return `_hx_${day}_${fp}`;
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function textOrDash(value: unknown): string {
  return typeof value === 'string' && value.length > 0 ? value : '—';
}

function coordinateOrEmpty(value: unknown): GeoCoordinate {
  if (typeof value === 'number' && value !== 0 && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.length > 0) return value;
  return '';
}

async function geo(): Promise<BeaconGeo> {
  try {
    const response = await fetch('https://freeipapi.com/api/json/', { cache: 'no-store' });
    if (!response.ok) throw new Error('geolocation request failed');
    const value: unknown = await response.json();
    if (!isRecord(value)) throw new Error('invalid geolocation response');

    return {
      ip: textOrDash(value.ipAddress),
      cidade: textOrDash(value.cityName),
      pais: textOrDash(value.countryName),
      regiao: textOrDash(value.regionName),
      lat: coordinateOrEmpty(value.latitude),
      lon: coordinateOrEmpty(value.longitude),
    };
  } catch {
    return { ip: '—', cidade: '—', pais: '—', regiao: '—', lat: '', lon: '' };
  }
}

export interface HxBeaconOptions {
  readonly consent?: boolean;
}

export async function hxBeacon(options: HxBeaconOptions | null = {}): Promise<void> {
  try {
    if (options?.consent !== true) return;
    if (CONFIG.ep === '__HX_ENDPOINT__') return;

    const fp = fingerprint();
    const key = sessionKey(fp);

    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    const locationData = await geo();
    const now = new Date();
    const payload: HxBeaconPayload = {
      s: CONFIG.salt,
      fp,
      ...locationData,
      ua: navigator.userAgent,
      lang: navigator.language,
      tela: `${screen.width}x${screen.height}`,
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
      data: now.toLocaleDateString('pt-BR'),
      hora: now.toLocaleTimeString('pt-BR'),
      ts: now.toISOString(),
      ref: document.referrer || '(direto)',
      rota: location.hash || '/',
    };

    navigator.sendBeacon(CONFIG.ep, JSON.stringify(payload));
  } catch {
    /* silencioso */
  }
}
