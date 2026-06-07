/* ============================================================
 * Gera src/data/dossie.json a partir do .md das Equipes/Forças
 * (sincronizado dos Google Docs por scripts/sync-cronicas.mjs).
 *
 * O documento é o "dossiê" completo do Baluarte: a nave Infinity
 * Dreadnought, hierarquia, equipes, colossos, arsenal, frotas, etc.
 * Aqui ele vira uma lista de SEÇÕES navegáveis que a página /dossie
 * renderiza (no estilo da Biblioteca).
 *
 * Saída: { meta, sections:[ { id, title, level, blocks:[ {t,v,level?} ] } ] }
 *   blocos: t='h' (subtítulo, com level) · 'p' (parágrafo) · 'li' (item) · 'hr'
 *
 * Quebra de seção: todo H2 (##); e H1 (#) que seja rótulo de equipe
 * (UMA palavra MAIÚSCULA) ou "TODAS AS EQUIPES". Os demais H1 da parte
 * "TODAS AS EQUIPES" (categorias/membros) viram conteúdo da seção.
 *
 * Anti-regressão: se o parse vier vazio (doc privado/login), não escreve.
 *
 * Uso:  node scripts/gen-dossie-from-doc.mjs
 * ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const MD = 'Equipes ALFA e BRAVO e CHARLIE e DELTA e ECHO e Foxtrott e Golf e Hotel e India e  Juliett e Kilo e Mike e November e Oscar e Papa e Quebec e Romeo.md';
const OUT = 'src/data/dossie.json';

if (!existsSync(MD)) { console.error('✗ .md das Equipes não encontrado:', MD); process.exit(1); }

const clean = (s) => String(s)
  .replace(/\*\*/g, '')
  .replace(/\\([.\-()$#*_`[\]])/g, '$1')   // desfaz escapes do export (\.  \(  …)
  .replace(/\\/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const isTeamLabel = (t) => /^[A-ZÀ-Ý][A-ZÀ-Ý0-9]{2,}$/.test(t) || /^TODAS AS EQUIPES$/i.test(t);
const isCategory = (t) => /^\d+\s*\./.test(t);

const lines = readFileSync(MD, 'utf8').split('\n');
const sections = [];
let cur = null;
let inTeams = false;   // após "TODAS AS EQUIPES" os ## viram conteúdo (só # de equipe quebra)

function pushSection(title, level) {
  cur = { id: `sec-${sections.length + 1}`, title, level, blocks: [] };
  sections.push(cur);
}

for (const raw of lines) {
  const line = raw.replace(/\r$/, '');

  const hm = line.match(/^(#{1,6})\s+(.*)$/);
  if (hm) {
    const level = hm[1].length;
    const text = clean(hm[2]);
    if (!text) continue;                              // "# " vazio
    if (level === 1 && isTeamLabel(text)) {
      pushSection(text, 1);                           // rótulo de equipe → seção
      if (/^TODAS AS EQUIPES$/i.test(text)) inTeams = true;
      continue;
    }
    if (level === 2 && !inTeams) {
      pushSection(text, 2);                           // seção macro (manual)
      continue;
    }
    if (!cur) continue;                               // heading órfão antes da 1ª seção
    if (level === 1) {
      // dentro de "TODAS AS EQUIPES": categoria numerada = subtítulo; resto = parágrafo
      cur.blocks.push(isCategory(text) ? { t: 'h', level: 3, v: text } : { t: 'p', v: text });
    } else {
      cur.blocks.push({ t: 'h', level: inTeams ? 3 : Math.min(level, 4), v: text });
    }
    continue;
  }

  if (/^\s*(?:---+|___+|\*\*\*+)\s*$/.test(line)) { if (cur) cur.blocks.push({ t: 'hr' }); continue; }

  const lm = line.match(/^\s*[\*\-]\s+(.+)$/);
  if (lm) { const v = clean(lm[1]); if (v && cur) cur.blocks.push({ t: 'li', v }); continue; }

  const p = clean(line);
  if (p && cur) cur.blocks.push({ t: 'p', v: p });
}

const out = sections.filter((s) => s.blocks.length);

if (out.length < 5) {
  console.error(`✗ parse suspeito (${out.length} seções) — não sobrescrevo ${OUT}.`);
  process.exit(1);
}

const data = {
  meta: {
    source: 'Google Docs — Equipes & Forças do Baluarte',
    sections: out.length,
    blocks: out.reduce((n, s) => n + s.blocks.length, 0),
    generatedAt: new Date().toISOString()
  },
  sections: out
};

writeFileSync(OUT, JSON.stringify(data));
console.log(`✓ ${OUT}: ${out.length} seções, ${data.meta.blocks} blocos.`);
console.log('Seções:', out.map((s) => s.title.slice(0, 28)).join(' · '));
