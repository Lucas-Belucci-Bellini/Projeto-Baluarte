/**
 * Cliente da Radio Browser API — estações de rádio reais da internet.
 *
 * API pública, gratuita, sem chave e com CORS habilitado.
 * Documentação: https://api.radio-browser.info
 *
 * A API roda em vários mirrors espelhados; tentamos um a um, em ordem,
 * até algum responder — assim a busca não cai se um servidor sair do ar.
 */

const MIRRORS = [
  'https://de1.api.radio-browser.info',
  'https://de2.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://at1.api.radio-browser.info'
];

const TIMEOUT_MS = 8000;

function fetchWithTimeout(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { signal: controller.signal, headers: { Accept: 'application/json' } })
    .finally(() => clearTimeout(timer));
}

/** Tenta cada mirror em ordem até um responder com JSON válido. */
async function apiGet(path) {
  let lastError = null;
  for (const base of MIRRORS) {
    try {
      const res = await fetchWithTimeout(base + path);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error('Radio Browser indisponível — ' + (lastError ? lastError.message : 'sem resposta'));
}

/** Países do seletor de busca (value = código ISO usado no parâmetro countrycode). */
export const COUNTRY_OPTIONS = [
  { value: '',   label: 'Qualquer país' },
  { value: 'BR', label: 'Brasil' },
  { value: 'US', label: 'Estados Unidos' },
  { value: 'PT', label: 'Portugal' },
  { value: 'GB', label: 'Reino Unido' },
  { value: 'AR', label: 'Argentina' },
  { value: 'ES', label: 'Espanha' },
  { value: 'FR', label: 'França' },
  { value: 'DE', label: 'Alemanha' },
  { value: 'IT', label: 'Itália' },
  { value: 'JP', label: 'Japão' },
  { value: 'CA', label: 'Canadá' },
  { value: 'MX', label: 'México' },
  { value: 'AU', label: 'Austrália' }
];

/** Gêneros do seletor de busca (value = tag da Radio Browser). */
export const GENRE_OPTIONS = [
  { value: '',          label: 'Qualquer gênero' },
  { value: 'pop',       label: 'Pop' },
  { value: 'rock',      label: 'Rock' },
  { value: 'mpb',       label: 'MPB' },
  { value: 'sertanejo', label: 'Sertanejo' },
  { value: 'jazz',      label: 'Jazz' },
  { value: 'classical', label: 'Clássica' },
  { value: 'electronic', label: 'Eletrônica' },
  { value: 'lofi',      label: 'Lo-fi' },
  { value: 'metal',     label: 'Metal' },
  { value: 'hip hop',   label: 'Hip-Hop' },
  { value: 'dance',     label: 'Dance' },
  { value: 'reggae',    label: 'Reggae' },
  { value: 'gospel',    label: 'Gospel' },
  { value: 'news',      label: 'Notícias' },
  { value: '80s',       label: 'Anos 80' }
];

function normalizeStation(raw) {
  return {
    uuid: raw.stationuuid || '',
    name: (raw.name || '').trim() || 'Estação sem nome',
    url: raw.url_resolved || raw.url || '',
    country: raw.country || '',
    countryCode: (raw.countrycode || '').toUpperCase(),
    tags: (raw.tags || '')
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean),
    codec: (raw.codec || '').toUpperCase(),
    bitrate: Number(raw.bitrate) || 0,
    votes: Number(raw.votes) || 0
  };
}

/** Streams HTTPS primeiro — só eles tocam num site servido por HTTPS. */
function httpsFirst(a, b) {
  const rank = (s) => (s.url.startsWith('https:') ? 0 : 1);
  return rank(a) - rank(b);
}

/**
 * Busca estações na Radio Browser pelo endpoint /json/stations/search.
 * @param {{name?:string, countryCode?:string, tag?:string, limit?:number}} opts
 * @returns {Promise<Array>} estações normalizadas (sem duplicatas, populares primeiro)
 */
export async function searchStations({ name = '', countryCode = '', tag = '', limit = 40 } = {}) {
  const params = new URLSearchParams({
    limit: String(limit),
    hidebroken: 'true',
    order: 'clickcount',
    reverse: 'true'
  });
  if (name.trim()) params.set('name', name.trim());
  if (countryCode.trim()) params.set('countrycode', countryCode.trim());
  if (tag.trim()) params.set('tag', tag.trim());

  const raw = await apiGet('/json/stations/search?' + params.toString());
  if (!Array.isArray(raw)) return [];

  const seen = new Set();
  const stations = [];
  for (const item of raw) {
    const station = normalizeStation(item);
    if (!station.url || seen.has(station.uuid)) continue;
    seen.add(station.uuid);
    stations.push(station);
  }
  return stations.sort(httpsFirst);
}
