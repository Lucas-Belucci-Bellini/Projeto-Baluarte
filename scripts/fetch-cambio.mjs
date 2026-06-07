/* ============================================================
 * Coleta câmbio (USD, EUR, BTC em BRL) e mantém a série histórica
 * em src/data/cambio-historico.json (o "banco" versionado).
 *
 * Fontes (gratuitas, sem chave):
 *   - USD/BRL e EUR/BRL → Frankfurter (taxas de referência do BCE)
 *   - BTC/BRL          → CoinGecko
 *
 * 1ª execução (série vazia): semeia ~90 dias de histórico para o
 * gráfico já nascer cheio. Depois, cada run anexa o ponto atual
 * (1 ponto/dia para fiat; intraday para BTC). Resiliente: retry com
 * backoff e nunca apaga o histórico se a coleta falhar.
 *
 * Roda no workflow .github/workflows/cambio.yml a cada 12h.
 * Uso:  node scripts/fetch-cambio.mjs
 * ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const OUT = 'src/data/cambio-historico.json';
const SEED_DAYS = 90;
const MAX_POINTS = 6000;
const MIN_GAP_MS = 6 * 3600 * 1000; /* não anexa 2 pontos a < 6h */
const KEYS = ['USD', 'EUR', 'BTC'];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const num = (x) => { const n = Number(x); return Number.isFinite(n) ? n : null; };
const valid = (p) => p && p.t && p.v != null;
const fmtDate = (d) => d.toISOString().slice(0, 10);
const dayMs = (s) => new Date(s + 'T00:00:00Z').getTime();

async function getJson(url, tries = 4) {
  for (let i = 0; i < tries; i++) {
    try {
      const r = await fetch(url, { headers: { accept: 'application/json' } });
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return await r.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await sleep(1200 * 2 ** i);
    }
  }
}

function load() {
  if (existsSync(OUT)) {
    try { const d = JSON.parse(readFileSync(OUT, 'utf8')); if (d && d.series) return d; } catch {}
  }
  return { meta: {}, series: {} };
}

const db = load();
db.series = db.series || {};
for (const k of KEYS) if (!Array.isArray(db.series[k])) db.series[k] = [];
let added = 0, seeded = 0, failed = 0;

function pushPoint(key, p) {
  if (!valid(p)) return;
  const s = db.series[key];
  const prev = s[s.length - 1];
  if (!prev || p.t - prev.t >= MIN_GAP_MS) { s.push(p); added++; }
  else if (p.t >= prev.t) s[s.length - 1] = p; /* mesma janela: atualiza */
}

/* ===== Fiat (Frankfurter / BCE) ===== */
for (const key of ['USD', 'EUR']) {
  try {
    if (db.series[key].length === 0) {
      const start = fmtDate(new Date(Date.now() - SEED_DAYS * 864e5));
      const end = fmtDate(new Date());
      const hist = await getJson(`https://api.frankfurter.app/${start}..${end}?from=${key}&to=BRL`);
      const pts = Object.entries(hist.rates || {})
        .map(([d, r]) => ({ t: dayMs(d), v: num(r.BRL) })).filter(valid).sort((a, b) => a.t - b.t);
      db.series[key].push(...pts); seeded += pts.length;
      console.log(`• seed ${key}: ${pts.length}`);
    }
    const cur = await getJson(`https://api.frankfurter.app/latest?from=${key}&to=BRL`);
    pushPoint(key, { t: dayMs(cur.date), v: num(cur.rates && cur.rates.BRL) });
  } catch (e) { failed++; console.error(`✗ ${key}: ${e.message}`); }
  await sleep(500);
}

/* ===== BTC (CoinGecko) ===== */
try {
  if (db.series.BTC.length === 0) {
    const mc = await getJson(`https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=brl&days=${SEED_DAYS}&interval=daily`);
    const pts = (mc.prices || []).map(([t, v]) => ({ t: num(t), v: num(v) })).filter(valid).sort((a, b) => a.t - b.t);
    db.series.BTC.push(...pts); seeded += pts.length;
    console.log(`• seed BTC: ${pts.length}`);
  }
  const sp = await getJson('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=brl');
  pushPoint('BTC', { t: Date.now(), v: num(sp.bitcoin && sp.bitcoin.brl) });
} catch (e) { failed++; console.error(`✗ BTC: ${e.message}`); }

/* ===== Persiste ===== */
for (const k of KEYS) if (db.series[k].length > MAX_POINTS) db.series[k] = db.series[k].slice(-MAX_POINTS);
if (KEYS.every((k) => !db.series[k].length)) { console.error('✗ banco vazio — não escrevo.'); process.exit(1); }

db.meta = {
  updatedAt: new Date().toISOString(),
  pairs: KEYS,
  source: 'Frankfurter (BCE) + CoinGecko',
  points: Object.fromEntries(KEYS.map((k) => [k, db.series[k].length]))
};
writeFileSync(OUT, JSON.stringify(db));
console.log(`✓ ${OUT}: +${added} agora, ${seeded} semeado(s), ${failed} falha(s) · ${JSON.stringify(db.meta.points)}`);
