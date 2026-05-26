/**
 * Cliente da Radio Browser API — estações de rádio reais da internet.
 *
 * API pública, gratuita, sem chave e com CORS habilitado.
 * Documentação: https://api.radio-browser.info
 *
 * A API roda em vários mirrors espelhados; tentamos um a um, em ordem,
 * até algum responder — assim a busca não cai se um servidor sair do ar.
 */

/* all.api.* é o round-robin oficial (sempre aponta para um servidor vivo);
 * vem primeiro. Os nomeados são fallback — alguns saem do ar de tempos em tempos. */
const MIRRORS = [
  'https://all.api.radio-browser.info',
  'https://de1.api.radio-browser.info',
  'https://fi1.api.radio-browser.info',
  'https://nl1.api.radio-browser.info',
  'https://de2.api.radio-browser.info'
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
  { value: 'AU', label: 'Austrália' },
  /* Américas */
  { value: 'CL', label: 'Chile' },
  { value: 'CO', label: 'Colômbia' },
  { value: 'PE', label: 'Peru' },
  { value: 'UY', label: 'Uruguai' },
  { value: 'PY', label: 'Paraguai' },
  { value: 'BO', label: 'Bolívia' },
  { value: 'VE', label: 'Venezuela' },
  { value: 'EC', label: 'Equador' },
  /* Europa */
  { value: 'NL', label: 'Países Baixos' },
  { value: 'BE', label: 'Bélgica' },
  { value: 'CH', label: 'Suíça' },
  { value: 'AT', label: 'Áustria' },
  { value: 'IE', label: 'Irlanda' },
  { value: 'SE', label: 'Suécia' },
  { value: 'NO', label: 'Noruega' },
  { value: 'DK', label: 'Dinamarca' },
  { value: 'FI', label: 'Finlândia' },
  { value: 'PL', label: 'Polônia' },
  { value: 'CZ', label: 'Tchéquia' },
  { value: 'GR', label: 'Grécia' },
  { value: 'RO', label: 'Romênia' },
  { value: 'UA', label: 'Ucrânia' },
  { value: 'RU', label: 'Rússia' },
  { value: 'TR', label: 'Turquia' },
  /* Ásia / Oceania */
  { value: 'CN', label: 'China' },
  { value: 'KR', label: 'Coreia do Sul' },
  { value: 'IN', label: 'Índia' },
  { value: 'ID', label: 'Indonésia' },
  { value: 'PH', label: 'Filipinas' },
  { value: 'TH', label: 'Tailândia' },
  { value: 'VN', label: 'Vietnã' },
  { value: 'NZ', label: 'Nova Zelândia' },
  /* África / Oriente Médio */
  { value: 'ZA', label: 'África do Sul' },
  { value: 'AO', label: 'Angola' },
  { value: 'MZ', label: 'Moçambique' },
  { value: 'MA', label: 'Marrocos' },
  { value: 'EG', label: 'Egito' },
  { value: 'NG', label: 'Nigéria' },
  { value: 'KE', label: 'Quênia' },
  { value: 'GH', label: 'Gana' },
  { value: 'ET', label: 'Etiópia' },
  { value: 'TN', label: 'Tunísia' },
  { value: 'DZ', label: 'Argélia' },
  /* Oriente Médio / Ásia Central */
  { value: 'IR', label: 'Irã' },
  { value: 'AF', label: 'Afeganistão' },
  { value: 'IL', label: 'Israel' },
  { value: 'SA', label: 'Arábia Saudita' },
  { value: 'AE', label: 'Emirados Árabes' },
  { value: 'QA', label: 'Catar' },
  { value: 'IQ', label: 'Iraque' },
  { value: 'LB', label: 'Líbano' },
  { value: 'PK', label: 'Paquistão' },
  { value: 'BD', label: 'Bangladesh' },
  { value: 'KZ', label: 'Cazaquistão' },
  /* Ásia / Oceania (mais) */
  { value: 'KP', label: 'Coreia do Norte' },
  { value: 'TW', label: 'Taiwan' },
  { value: 'HK', label: 'Hong Kong' },
  { value: 'MY', label: 'Malásia' },
  { value: 'SG', label: 'Singapura' },
  { value: 'LK', label: 'Sri Lanka' },
  { value: 'NP', label: 'Nepal' },
  /* Europa (mais) */
  { value: 'HU', label: 'Hungria' },
  { value: 'HR', label: 'Croácia' },
  { value: 'RS', label: 'Sérvia' },
  { value: 'BG', label: 'Bulgária' },
  { value: 'SK', label: 'Eslováquia' },
  { value: 'LT', label: 'Lituânia' },
  { value: 'LV', label: 'Letônia' },
  { value: 'EE', label: 'Estônia' },
  { value: 'IS', label: 'Islândia' },
  /* Américas (mais) */
  { value: 'CU', label: 'Cuba' },
  { value: 'CR', label: 'Costa Rica' },
  { value: 'PA', label: 'Panamá' },
  { value: 'GT', label: 'Guatemala' },
  { value: 'DO', label: 'Rep. Dominicana' }
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
  { value: '80s',       label: 'Anos 80' },
  { value: '90s',       label: 'Anos 90' },
  { value: 'funk',      label: 'Funk' },
  { value: 'samba',     label: 'Samba' },
  { value: 'forro',     label: 'Forró' },
  { value: 'pagode',    label: 'Pagode' },
  { value: 'country',   label: 'Country' },
  { value: 'blues',     label: 'Blues' },
  { value: 'soul',      label: 'Soul / R&B' },
  { value: 'salsa',     label: 'Salsa' },
  { value: 'k-pop',     label: 'K-Pop' },
  { value: 'anime',     label: 'Anime / J-Pop' },
  { value: 'ambient',   label: 'Ambient / Chill' },
  { value: 'oldies',    label: 'Oldies' },
  { value: 'punk',      label: 'Punk' },
  { value: 'indie',     label: 'Indie' }
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
export async function searchStations({ name = '', countryCode = '', tag = '', limit = 100 } = {}) {
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

  /* No site publicado (HTTPS), streams http:// são bloqueados (mixed content)
   * e não tocam — então só listamos estações HTTPS, que funcionam em qualquer rede. */
  const httpsPage = typeof location !== 'undefined' && location.protocol === 'https:';
  const seen = new Set();
  const stations = [];
  for (const item of raw) {
    const station = normalizeStation(item);
    if (!station.url || seen.has(station.uuid)) continue;
    if (httpsPage && station.url.startsWith('http://')) continue;
    seen.add(station.uuid);
    stations.push(station);
  }
  return stations.sort(httpsFirst);
}
