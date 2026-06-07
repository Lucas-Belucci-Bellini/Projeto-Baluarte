/* ============================================================
 * Gera relatórios markdown do câmbio (Dólar, Euro, Bitcoin) a partir
 * de src/data/cambio-historico.json → reports/cambio/*.md.
 *
 * Janelas: diário (1d), semanal (7d), mensal (30d). Para cada moeda:
 * valor atual, variação %, mínima, máxima e média na janela.
 *
 * Roda no workflow logo após scripts/fetch-cambio.mjs.
 * Uso:  node scripts/gen-cambio-report.mjs
 * ============================================================ */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const SRC = 'src/data/cambio-historico.json';
const DIR = 'reports/cambio';

const META = {
  USD: { icon: '💵', label: 'Dólar', dec: 4 },
  EUR: { icon: '💶', label: 'Euro', dec: 4 },
  BTC: { icon: '₿', label: 'Bitcoin', dec: 0 }
};
const WINDOWS = [
  { id: 'diario', label: 'Diário', days: 1 },
  { id: 'semanal', label: 'Semanal', days: 7 },
  { id: 'mensal', label: 'Mensal', days: 30 }
];

const db = JSON.parse(readFileSync(SRC, 'utf8'));
const fmt = (v, dec) => (v == null ? '—' : v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec }));
const pctStr = (p) => (p == null ? '—' : (p >= 0 ? '▲ +' : '▼ ') + p.toFixed(2) + '%');

function stats(series, days) {
  if (!series || series.length === 0) return null;
  const now = series[series.length - 1].t;
  const from = now - days * 864e5;
  let win = series.filter((p) => p.t >= from);
  if (win.length < 2) win = series.slice(-2);
  const vals = win.map((p) => p.v);
  const cur = series[series.length - 1].v;
  const first = win[0].v;
  const min = Math.min(...vals), max = Math.max(...vals);
  const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
  const pct = first ? (cur / first - 1) * 100 : null;
  return { cur, min, max, avg, pct, n: win.length };
}

mkdirSync(DIR, { recursive: true });
const stamp = new Date(db.meta.updatedAt || Date.now()).toLocaleString('pt-BR');

for (const w of WINDOWS) {
  const rows = Object.keys(META).map((k) => {
    const m = META[k];
    const s = stats(db.series[k], w.days);
    if (!s) return `| ${m.icon} ${m.label} (${k}) | — | — | — | — | — |`;
    return `| ${m.icon} ${m.label} (${k}) | R$ ${fmt(s.cur, m.dec)} | ${pctStr(s.pct)} | R$ ${fmt(s.min, m.dec)} | R$ ${fmt(s.max, m.dec)} | R$ ${fmt(s.avg, m.dec)} |`;
  });
  const md = [
    `# 📊 Relatório ${w.label} — Câmbio (em BRL)`,
    '',
    `_Atualizado: ${stamp} · janela: ${w.days} dia(s) · fonte: ${db.meta.source || 'Frankfurter + CoinGecko'}_`,
    '',
    '| Moeda | Atual | Variação | Mínima | Máxima | Média |',
    '|---|---|---|---|---|---|',
    ...rows,
    '',
    '> Gerado automaticamente por `scripts/gen-cambio-report.mjs` a cada 12h. Veja o gráfico no site em **/dolar**.'
  ].join('\n');
  writeFileSync(`${DIR}/${w.id}.md`, md + '\n');
}

const readme = [
  '# 📈 Radar do Câmbio — Relatórios automáticos',
  '',
  'Séries históricas de **Dólar, Euro e Bitcoin** (em BRL), coletadas a cada 12h por um GitHub Action.',
  '',
  '- 🗄️ Banco de dados: [`src/data/cambio-historico.json`](../../src/data/cambio-historico.json)',
  '- 📊 Gráfico interativo no site: **/dolar**',
  '',
  '## Relatórios',
  ...WINDOWS.map((w) => `- [${w.label}](./${w.id}.md)`),
  '',
  `_Atualizado: ${stamp} · pontos: ${JSON.stringify(db.meta.points || {})}_`
].join('\n');
writeFileSync(`${DIR}/README.md`, readme + '\n');

console.log(`✓ relatórios em ${DIR}/ (diário, semanal, mensal, README)`);
