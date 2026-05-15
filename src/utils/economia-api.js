/**
 * Wrappers de APIs de cotação (Fase 19).
 *
 * APIs públicas com CORS habilitado:
 *   - AwesomeAPI (economia.awesomeapi.com.br) — câmbio BRL
 *   - CoinGecko (api.coingecko.com) — criptomoedas
 *
 * Todas as chamadas têm timeout e fallback de erro tratado.
 */

const TIMEOUT_MS = 10000;

function fetchWithTimeout(url, opts = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  return fetch(url, { ...opts, signal: controller.signal })
    .finally(() => clearTimeout(timer));
}

/* ===== Câmbio (AwesomeAPI) ===== */

export const CURRENCY_PAIRS = [
  { code: 'USD-BRL', label: 'Dólar', symbol: 'US$', icon: '$' },
  { code: 'EUR-BRL', label: 'Euro', symbol: '€', icon: '€' },
  { code: 'GBP-BRL', label: 'Libra', symbol: '£', icon: '£' },
  { code: 'BTC-BRL', label: 'Bitcoin', symbol: '₿', icon: '₿' },
  { code: 'ARS-BRL', label: 'Peso Argentino', symbol: 'AR$', icon: '$' },
  { code: 'JPY-BRL', label: 'Iene', symbol: '¥', icon: '¥' },
  { code: 'CAD-BRL', label: 'Dólar Canadense', symbol: 'C$', icon: '$' },
  { code: 'CNY-BRL', label: 'Yuan', symbol: '¥', icon: '¥' }
];

/**
 * Busca cotações de câmbio.
 * @returns {Promise<Array<{code, label, bid, pct, high, low}>>}
 */
export async function fetchCurrencies() {
  const codes = CURRENCY_PAIRS.map((p) => p.code).join(',');
  const url = `https://economia.awesomeapi.com.br/json/last/${codes}`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`AwesomeAPI HTTP ${res.status}`);
  const data = await res.json();

  return CURRENCY_PAIRS.map((pair) => {
    const key = pair.code.replace('-', '');
    const d = data[key];
    if (!d) return { ...pair, bid: null, pct: null, error: true };
    return {
      ...pair,
      bid: parseFloat(d.bid),
      pct: parseFloat(d.pctChange),
      high: parseFloat(d.high),
      low: parseFloat(d.low),
      updatedAt: d.create_date
    };
  });
}

/* ===== Cripto (CoinGecko) ===== */

export const CRYPTO_IDS = [
  { id: 'bitcoin', label: 'Bitcoin', symbol: 'BTC' },
  { id: 'ethereum', label: 'Ethereum', symbol: 'ETH' },
  { id: 'solana', label: 'Solana', symbol: 'SOL' },
  { id: 'cardano', label: 'Cardano', symbol: 'ADA' },
  { id: 'binancecoin', label: 'BNB', symbol: 'BNB' },
  { id: 'ripple', label: 'XRP', symbol: 'XRP' },
  { id: 'dogecoin', label: 'Dogecoin', symbol: 'DOGE' },
  { id: 'polkadot', label: 'Polkadot', symbol: 'DOT' }
];

/**
 * Busca cotações de criptomoedas em BRL e USD.
 * @returns {Promise<Array<{id, label, symbol, brl, usd, pct24h}>>}
 */
export async function fetchCrypto() {
  const ids = CRYPTO_IDS.map((c) => c.id).join(',');
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl,usd&include_24hr_change=true`;
  const res = await fetchWithTimeout(url);
  if (!res.ok) throw new Error(`CoinGecko HTTP ${res.status}`);
  const data = await res.json();

  return CRYPTO_IDS.map((c) => {
    const d = data[c.id];
    if (!d) return { ...c, brl: null, usd: null, error: true };
    return {
      ...c,
      brl: d.brl,
      usd: d.usd,
      pct24h: d.brl_24h_change
    };
  });
}

/* ===== Formatação ===== */

export function fmtBRL(v) {
  if (v == null || !isFinite(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL',
    minimumFractionDigits: v < 1 ? 4 : 2,
    maximumFractionDigits: v < 1 ? 6 : 2
  }).format(v);
}

export function fmtUSD(v) {
  if (v == null || !isFinite(v)) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD'
  }).format(v);
}

export function fmtPct(v) {
  if (v == null || !isFinite(v)) return '—';
  const sign = v >= 0 ? '+' : '';
  return `${sign}${v.toFixed(2)}%`;
}
