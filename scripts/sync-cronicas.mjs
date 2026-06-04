/* ============================================================
 * Sincroniza as Crônicas da Baluarte a partir dos Google Docs.
 *
 * Os documentos do Google Docs (públicos) são a FONTE DA VERDADE.
 * Este script baixa cada um como Markdown e atualiza o .md
 * correspondente na raiz do projeto. Em seguida, os geradores
 * (gen-fanfic-from-md / gen-elites-rosters) transformam os .md
 * nos dados que o site e o JARVIS consomem.
 *
 * Uso:  node scripts/sync-cronicas.mjs
 * Requer: Node 18+ (fetch nativo).
 * ============================================================ */
import { writeFileSync, readFileSync, existsSync } from 'fs';

// docId -> arquivo .md de destino (mapeado por conteúdo/H1)
const DOCS = [
  ['1FJulPVU1WA8LTLL3NO7h2CTW7pmlNWgO-C77qwtcVgU', 'Crônicas da Baluarte_ Onde os Deuses Sangram.md'],
  ['1mJ0l6pXKZIFp56RXYCePha3jjZFYxdTlDckLnfYVK6A', 'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 1).md'],
  ['1TqlVGvX8dDB5hXQi-0QtFr-Lo3g4M3bmNA_bolPpf2s', 'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 2).md'],
  ['1HIfOYh4cnaGD9goVhginv6x1Zo2VOovrAMS2ApBMcZo', 'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).md'],
  ['1sZqFn6eztDhMfGNO9jexR29xEY26lh6Lp1b5abkCLQA', 'Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 4).md'],
  ['1J_quzF3M8p4-13t0mKhnizddXdU2UVcYkdEwVXqsVnY', 'Equipes ALFA e BRAVO e CHARLIE e DELTA e ECHO e Foxtrott e Golf e Hotel e India e  Juliett e Kilo e Mike e November e Oscar e Papa e Quebec e Romeo.md'],
];

const exportUrl = (id) => `https://docs.google.com/document/d/${id}/export?format=md`;

/* O export do Google Docs embute imagens como base64 inline, o que incha
 * muito o repositório (uma só imagem pode ter > 1 MB). Os geradores usam
 * apenas o texto, então trocamos cada imagem por uma marca [imagem]. */
function stripDataUris(md) {
  return md
    .replace(/!\[[^\]]*\]\(data:[^)]*\)/g, '![imagem]')
    .replace(/<img[^>]*src=["']data:[^>]*>/gi, '[imagem]')
    .replace(/data:image\/[A-Za-z.+-]+;base64,[A-Za-z0-9+/=\s]+/g, '');
}

let changed = 0;
let failed = 0;

for (const [id, file] of DOCS) {
  process.stdout.write(`• ${file} … `);
  try {
    const res = await fetch(exportUrl(id), { redirect: 'follow' });
    if (!res.ok) { console.log(`FALHA (HTTP ${res.status})`); failed++; continue; }
    let md = await res.text();
    // Se voltou HTML de login, o doc não está público.
    if (md.length < 100 || /^\s*<(?:!doctype|html)/i.test(md)) {
      console.log('FALHA (não está público?)'); failed++; continue;
    }
    md = stripDataUris(md);
    const prev = existsSync(file) ? readFileSync(file, 'utf8') : '';
    if (prev === md) { console.log('sem mudanças'); continue; }
    writeFileSync(file, md);
    console.log(`atualizado (${md.length.toLocaleString('pt-BR')} bytes)`);
    changed++;
  } catch (err) {
    console.log(`ERRO (${err.message})`); failed++;
  }
}

console.log(`\nResumo: ${changed} atualizado(s), ${failed} falha(s), de ${DOCS.length} documentos.`);
if (failed) process.exitCode = 1;
