/* ============================================================
 * Mapa do código (auto-análise) — escaneia src/ e gera o grafo de
 * arquivos e imports, consumido pela página /codigo (Raio-X do Código).
 *
 * Nós = arquivos .js; arestas = imports locais (A importa B). Inclui
 * métricas (linhas, por diretório, mais importados). Inspirado no GitNexus.
 *
 * Uso:  node scripts/gen-codemap.mjs
 * ============================================================ */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';

const ROOT = 'src';

function walk(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    const st = statSync(p);
    if (st.isDirectory()) walk(p, acc);
    else if (e.endsWith('.js')) acc.push(p);
  }
  return acc;
}

const idOf = (p) => relative(ROOT, p).replace(/\\/g, '/');
const files = walk(ROOT);
const byId = new Map();
const nodes = [];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const id = idOf(f);
  const d = dirname(id);
  const node = { id, label: id.split('/').pop(), dir: d === '.' ? '(raiz)' : d, loc: src.split('\n').length, imports: 0, importedBy: 0 };
  byId.set(id, node);
  nodes.push(node);
}

const importRe = /import[^'"]*from\s*['"]([^'"]+)['"]/g;
const sideRe = /(?:^|\n)\s*import\s*['"]([^'"]+)['"]/g;
const links = [];

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const id = idOf(f);
  const fromDir = dirname(f);
  const specs = new Set();
  let m;
  importRe.lastIndex = 0; while ((m = importRe.exec(src))) specs.add(m[1]);
  sideRe.lastIndex = 0; while ((m = sideRe.exec(src))) specs.add(m[1]);

  for (const spec of specs) {
    if (!spec.startsWith('.')) continue; /* só imports locais */
    const base = resolve(fromDir, spec);
    let tid = relative(ROOT, base).replace(/\\/g, '/');
    if (!byId.has(tid)) {
      if (byId.has(tid + '.js')) tid = tid + '.js';
      else if (byId.has(tid + '/index.js')) tid = tid + '/index.js';
      else continue; /* json/css/externo */
    }
    if (tid === id) continue;
    links.push({ source: id, target: tid });
    byId.get(id).imports++;
    byId.get(tid).importedBy++;
  }
}

const byDir = {};
for (const n of nodes) byDir[n.dir] = (byDir[n.dir] || 0) + 1;
const loc = nodes.reduce((s, n) => s + n.loc, 0);
const topImported = [...nodes].sort((a, b) => b.importedBy - a.importedBy).slice(0, 12)
  .map((n) => ({ id: n.id, label: n.label, importedBy: n.importedBy }));
const topLoc = [...nodes].sort((a, b) => b.loc - a.loc).slice(0, 12)
  .map((n) => ({ id: n.id, label: n.label, loc: n.loc }));

writeFileSync('src/data/codemap.json', JSON.stringify({
  meta: { files: nodes.length, loc, links: links.length, dirs: Object.keys(byDir).length, geradoEm: new Date().toISOString() },
  byDir, topImported, topLoc, nodes, links
}));

console.log(`✓ src/data/codemap.json — ${nodes.length} arquivos, ${loc.toLocaleString('pt-BR')} linhas, ${links.length} imports, ${Object.keys(byDir).length} pastas`);
