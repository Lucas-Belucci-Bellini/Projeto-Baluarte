/* ============================================================
 * Atualiza o fanfic.json a partir dos .md das Crônicas (sincronizados
 * dos Google Docs por scripts/sync-cronicas.mjs).
 *
 * A marcação de título nos docs é irregular (capítulos aparecem como
 * #, ## ou ###; às vezes um arco tem dois # seguidos). Por isso NÃO
 * inferimos arco pelo nível do título. Em vez disso usamos a LISTA
 * OFICIAL de arcos (scripts/arcos.json — as "guias" do documento):
 *
 *   - ARCO     = título (em qualquer nível) que está na lista oficial
 *   - CAPÍTULO = título "Capítulo N" / "Cap N" entre dois arcos
 *   - bloco 'h'= demais títulos (subtítulos dentro do capítulo)
 *   - bloco 'p'= parágrafos
 *
 * Reconstrói os arcos NA ORDEM da lista oficial. Aliases permitem
 * absorver nomes antigos (ex.: "O Renascimento de Cybertron" → o arco
 * oficial "GUERRA MULTIVERSAL"). Trava anti-regressão: se o doc trouxer
 * menos capítulos do que o fanfic já tinha para o arco, mantém o fanfic.
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

const ARCS = JSON.parse(readFileSync('scripts/arcos.json', 'utf8'));

// Arco oficial -> títulos antigos no fanfic.json que devem ser absorvidos por ele.
const ALIASES = { 'GUERRA MULTIVERSAL': ['O Renascimento de Cybertron'] };

const clean = (s) => s.replace(/\*\*/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim();
const norm = (s) => clean(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const isChapter = (t) => /^cap(?:[íi]tulo)?\.?\s*\d+/i.test(t);

const arcByNorm = new Map(ARCS.map((t) => [norm(t), t]));

/* 1) Varre todos os .md e agrupa os capítulos por arco oficial. */
const capsByArc = new Map(ARCS.map((t) => [t, []]));
let current = null, curChap = null;
for (const file of MD_FILES) {
  if (!existsSync(file)) { console.warn('• ausente:', file); continue; }
  for (const raw of readFileSync(file, 'utf8').split('\n')) {
    const line = raw.replace(/\r$/, '');
    const m = line.match(/^#{1,6}\s+(.+?)\s*$/);
    if (m) {
      const txt = clean(m[1]);
      const oficial = arcByNorm.get(norm(txt));
      if (oficial) { current = oficial; curChap = null; continue; }   // âncora de arco
      if (isChapter(txt)) {                                            // capítulo
        if (!current) continue;
        curChap = { id: '', title: txt, blocks: [] };
        capsByArc.get(current).push(curChap);
        continue;
      }
      if (curChap) curChap.blocks.push({ t: 'h', v: txt });            // subtítulo
      continue;
    }
    const p = clean(line);
    if (p && curChap) curChap.blocks.push({ t: 'p', v: p });
  }
}

/* 2) Reconstrói os arcos na ordem oficial, com anti-regressão. */
const data = JSON.parse(readFileSync('src/data/fanfic.json', 'utf8'));
const fanficByNorm = new Map((data.arcos || []).map((a) => [norm(a.title), a]));
const findExisting = (titulo) => {
  let e = fanficByNorm.get(norm(titulo));
  if (!e && ALIASES[titulo]) for (const a of ALIASES[titulo]) { e = fanficByNorm.get(norm(a)); if (e) break; }
  return e;
};

const log = [];
const novos = ARCS.map((titulo, idx) => {
  const doc = capsByArc.get(titulo) || [];
  const existing = findExisting(titulo);
  const before = existing ? existing.chapters.length : 0;
  let chapters;
  if (doc.length >= before) {
    chapters = doc;
    if (doc.length !== before) log.push(`  ~ ${titulo}: ${before} → ${doc.length} cap.`);
  } else {
    chapters = existing.chapters;
    log.push(`  = ${titulo}: doc ${doc.length} < fanfic ${before} → mantém fanfic`);
  }
  chapters.forEach((c, i) => { c.id = `a${idx + 1}-c${i + 1}`; });
  return { id: `arco-${idx + 1}`, title: titulo, chapters };
});

const aliasNorms = Object.values(ALIASES).flat().map(norm);
const removidos = (data.arcos || []).filter(
  (a) => !arcByNorm.has(norm(a.title)) && !aliasNorms.includes(norm(a.title)));

data.arcos = novos;
writeFileSync('src/data/fanfic.json', JSON.stringify(data));

if (log.length) console.log(log.join('\n'));
if (removidos.length) console.log('\n⚠ Arcos não-oficiais removidos:', removidos.map((a) => `"${a.title}"`).join(', '));
console.log(`\nTotal de arcos: ${data.arcos.length} (lista oficial) | capítulos: ${data.arcos.reduce((s, a) => s + a.chapters.length, 0)}`);
