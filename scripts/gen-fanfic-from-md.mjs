/* Atualiza, no fanfic.json, o arco cujo título == H1 do .md de continuação,
 * regenerando seus capítulos/blocos. NÃO toca nos demais arcos.
 * Uso: node scripts/gen-fanfic-from-md.mjs "<arquivo .md>"
 */
import { readFileSync, writeFileSync } from 'fs';

const MD = process.argv[2] || 'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).md';
const lines = readFileSync(MD, 'utf8').split('\n');

const clean = (s) => s.replace(/\*\*/g, '').replace(/\\/g, '').replace(/\s+/g, ' ').trim();
const head = (s) => clean(s.replace(/^#{1,6}\s*/, ''));

let arcTitle = null;
const chapters = [];
let cur = null;
for (const raw of lines) {
  const line = raw.replace(/\r$/, '');
  if (/^#\s+[^#]/.test(line)) {                 // H1
    if (!arcTitle) { arcTitle = head(line); continue; }
    if (cur) cur.blocks.push({ t: 'h', v: head(line) });
    continue;
  }
  if (/^##\s+/.test(line)) {                    // H2 = capítulo
    cur = { id: '', title: head(line), blocks: [] };
    chapters.push(cur);
    continue;
  }
  if (!cur) continue;
  if (/^#{3,}\s+/.test(line)) { cur.blocks.push({ t: 'h', v: head(line) }); continue; }
  const p = clean(line);
  if (p) cur.blocks.push({ t: 'p', v: p });
}

if (!arcTitle || !chapters.length) { console.error('Falha ao parsear o .md'); process.exit(1); }

const data = JSON.parse(readFileSync('src/data/fanfic.json', 'utf8'));
const arco = data.arcos.find((a) => clean(a.title) === clean(arcTitle));
if (!arco) { console.error('Arco não encontrado no fanfic.json:', arcTitle); process.exit(1); }

const prefix = (arco.id || 'arco').replace('arco-', 'a') ;
chapters.forEach((c, i) => { c.id = `${prefix}-c${i + 1}`; });
const before = arco.chapters.length;
arco.chapters = chapters;
writeFileSync('src/data/fanfic.json', JSON.stringify(data));

console.log(`Arco "${arco.title}" (${arco.id}): ${before} → ${chapters.length} capítulos.`);
console.log('Total de arcos:', data.arcos.length);
console.log('Blocos no cap 1:', chapters[0].blocks.length, '| cap 100:', chapters[chapters.length-1]?.blocks.length);
