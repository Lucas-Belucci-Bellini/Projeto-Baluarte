/**
 * @internal
 * Módulo de telemetria de sessão. Não indexado, não documentado.
 * Registra acessos em planilha privada via endpoint configurado.
 */

const _cfg = {
  ep: '__HX_ENDPOINT__',   // substituir pelo URL do Apps Script
  salt: '__HX_SALT__'       // string aleatória para deduplicação
};

function _fp() {
  const nav = navigator;
  const raw = [
    nav.userAgent,
    nav.language,
    screen.width + 'x' + screen.height + '@' + (window.devicePixelRatio || 1),
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    nav.hardwareConcurrency || 0,
    nav.platform || ''
  ].join('|');

  let h = 0;
  for (let i = 0; i < raw.length; i++) {
    h = Math.imul(31, h) + raw.charCodeAt(i) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, '0');
}

function _sessionKey(fp) {
  const day = new Date().toISOString().slice(0, 10);
  return `_hx_${day}_${fp}`;
}

async function _geo() {
  try {
    const r = await fetch('https://freeipapi.com/api/json/', { cache: 'no-store' });
    if (!r.ok) throw 0;
    const d = await r.json();
    return {
      ip:      d.ipAddress   || '—',
      cidade:  d.cityName    || '—',
      pais:    d.countryName || '—',
      regiao:  d.regionName  || '—',
      lat:     d.latitude    || '',
      lon:     d.longitude   || ''
    };
  } catch {
    return { ip: '—', cidade: '—', pais: '—', regiao: '—', lat: '', lon: '' };
  }
}

export async function hxBeacon() {
  try {
    if (_cfg.ep === '__HX_ENDPOINT__') return;

    const fp = _fp();
    const key = _sessionKey(fp);

    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');

    const geo = await _geo();
    const now = new Date();

    const payload = {
      s:   _cfg.salt,
      fp,
      ip:      geo.ip,
      cidade:  geo.cidade,
      regiao:  geo.regiao,
      pais:    geo.pais,
      lat:     geo.lat,
      lon:     geo.lon,
      ua:      navigator.userAgent,
      lang:    navigator.language,
      tela:    `${screen.width}x${screen.height}`,
      tz:      Intl.DateTimeFormat().resolvedOptions().timeZone,
      data:    now.toLocaleDateString('pt-BR'),
      hora:    now.toLocaleTimeString('pt-BR'),
      ts:      now.toISOString(),
      ref:     document.referrer || '(direto)',
      rota:    location.hash || '/'
    };

    navigator.sendBeacon(_cfg.ep, JSON.stringify(payload));
  } catch { /* silencioso */ }
}
