/* ============================================================
 * Atualiza o fanfic.json a partir dos .md das Crônicas (sincronizados
 * dos Google Docs por scripts/sync-cronicas.mjs).
 *
 * Um documento pode conter VÁRIOS arcos. A formatação de nível de
 * título varia entre docs, então NÃO confiamos no nível (#, ##, ###):
 *
 *   - ARCO     = título de nível 1 (#) que NÃO parece um capítulo
 *   - CAPÍTULO = qualquer título cujo texto começa com "Capítulo N"
 *                ou "Cap N" (em qualquer nível: ##, ### …)
 *   - bloco 'h'= demais títulos (subtítulos dentro do capítulo)
 *   - bloco 'p'= parágrafos
 *
 * Estratégia MERGE + trava anti-regressão:
 *   - arco existente (por título) -> substitui capítulos, MAS só se o
 *     novo conteúdo não encolher drasticamente (proteção contra parse ruim)
 *   - arco novo -> adiciona ao fim
 *   - arcos ausentes nos .md -> permanecem intactos
 *
 * Uso:  node scripts/gen-fanfic-from-docs.mjs
 * ============================================================ */
import { readFileSync, writeFileSync, existsSync } from 'fs';

const MD_FILES = [
  'Crônicas da Baluarte_ Onde os Deuses Sangram.md',
  'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 1).md',
  'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 2).md',
  'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).md',
  'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 4).md',
];

const clean = (s) => s.replace(/\*\*/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim();
const isChapter = (txt) => /^cap(?:[íi]tulo)?\.?\s*\d+/i.test(txt);

/* Separa o markdown em arcos -> capítulos -> blocos. */
function parseArcs(md) {
  const arcs = [];
  let arc = null, cur = null;
  for (const raw of md.split('\n')) {
    const line = raw.replace(/\r$/, '');
    const m = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m) {
      const level = m[1].length;
      const txt = clean(m[2]);
      if (!txt) continue;
      if (isChapter(txt)) {                         // CAPÍTULO (qualquer nível)
        if (!arc) { arc = { title: 'Prólogo', chapters: [] }; arcs.push(arc); }
        cur = { id: '', title: txt, blocks: [] };
        arc.chapters.push(cur);
        continue;
      }
      if (level === 1) {                            // H1 não-capítulo = ARCO
        arc = { title: txt, chapters: [] };
        arcs.push(arc); cur = null;
        continue;
      }
      if (cur) cur.blocks.push({ t: 'h', v: txt }); // subtítulo
      continue;
    }
    const p = clean(line);
    if (p && cur) cur.blocks.push({ t: 'p', v: p });
  }
  return arcs.filter((a) => a.chapters.length);
}

const data = JSON.parse(readFileSync('src/data/fanfic.json', 'utf8'));
data.arcos = data.arcos || [];
const byTitle = new Map(data.arcos.map((a) => [clean(a.title), a]));
let maxN = data.arcos.reduce(
  (m, a) => Math.max(m, parseInt(String(a.id || '').replace('arco-', ''), 10) || 0), 0);

let updated = 0, added = 0, skipped = 0, parsedCount = 0;
const log = [];

for (const file of MD_FILES) {
  if (!existsSync(file)) { console.warn('• ausente:', file); continue; }
  for (const parsed of parseArcs(readFileSync(file, 'utf8'))) {
    parsedCount++;
    const key = clean(parsed.title);
    const existing = byTitle.get(key);
    if (existing) {
      const before = existing.chapters.length;
      // Trava: o arco nunca encolhe (protege contra capítulos com título fora do padrão).
      if (before > 0 && parsed.chapters.length < before) {
        log.push(`  ! "${existing.title}": ${before}→${parsed.chapters.length} cap. — IGNORADO (anti-regressão)`);
        skipped++;
        continue;
      }
      const pfx = String(existing.id || 'arco').replace('arco-', 'a');
      parsed.chapters.forEach((c, i) => { c.id = `${pfx}-c${i + 1}`; });
      existing.chapters = parsed.chapters;
      if (parsed.chapters.length !== before) log.push(`  ~ ${existing.id} "${existing.title}": ${before}→${parsed.chapters.length} cap.`);
      updated++;
    } else {
      const n = ++maxN;
      parsed.chapters.forEach((c, i) => { c.id = `a${n}-c${i + 1}`; });
      data.arcos.push({ id: `arco-${n}`, title: parsed.title, chapters: parsed.chapters });
      byTitle.set(key, { id: `arco-${n}`, title: parsed.title });
      log.push(`  + arco-${n} "${parsed.title}" (NOVO) → ${parsed.chapters.length} cap.`);
      added++;
    }
  }
}

writeFileSync('src/data/fanfic.json', JSON.stringify(data));
if (log.length) console.log(log.join('\n'));
console.log(`\nArcos lidos dos .md: ${parsedCount} | atualizados: ${updated} | novos: ${added} | ignorados: ${skipped}`);
console.log(`Total de arcos no fanfic.json: ${data.arcos.length}`);
