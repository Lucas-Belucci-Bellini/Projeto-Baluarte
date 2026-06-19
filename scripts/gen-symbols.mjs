/* ============================================================
 * Mapa de SÍMBOLOS (Git Nexus — nível função/classe). Escaneia src/ e extrai
 * funções, arrow-funcs de topo e classes, mais as CHAMADAS entre elas (call
 * graph). Sem dependências — regex + contagem de chaves, no estilo do
 * gen-codemap.mjs. Consumido pela página /git-nexus (modo "Funções").
 *
 * Nó  = símbolo (id = "arquivo::nome"), com {name, kind, file, dir, line, loc,
 *       imports (chamadas que faz), importedBy (vezes chamado)}.
 * Aresta = CALLS (símbolo A chama símbolo B).
 *
 * Uso:  node scripts/gen-symbols.mjs
 * ============================================================ */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname } from 'path';

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

/* palavras que parecem chamada mas não são símbolos do código */
const NOT_CALL = new Set([
  'if', 'for', 'while', 'switch', 'catch', 'return', 'function', 'super',
  'typeof', 'await', 'new', 'do', 'else', 'in', 'of', 'try', 'with'
]);

/* Span do bloco a partir da linha de def. Rastreia parênteses para NÃO contar
 * as chaves da lista de parâmetros (ex: destructuring `function f({a, b})`): só
 * começa a contar o corpo na 1ª chave fora de parênteses. */
function blockEnd(lines, start) {
  let depth = 0, started = false, paren = 0;
  for (let i = start; i < lines.length; i++) {
    for (const ch of lines[i]) {
      if (ch === '(') paren++;
      else if (ch === ')') { if (paren > 0) paren--; }
      else if (ch === '{') { if (paren === 0) { depth++; started = true; } }
      else if (ch === '}') { if (paren === 0 && started) { depth--; if (depth === 0) return i; } }
    }
    /* arrow de uma linha sem corpo em chaves: termina na própria linha */
    if (!started && /=>/.test(lines[start]) && /;?\s*$/.test(lines[i]) && i > start) return i;
  }
  return Math.min(lines.length - 1, start + 60);
}

const defRe = [
  { re: /^(export\s+)?(async\s+)?function\s+(\w+)/, kind: 'function', g: 3 },
  { re: /^(export\s+)?function\*\s+(\w+)/, kind: 'generator', g: 2 },
  { re: /^(export\s+)?class\s+(\w+)/, kind: 'class', g: 2 },
  { re: /^(export\s+)?const\s+(\w+)\s*=\s*(async\s+)?\([^)]*\)\s*=>/, kind: 'arrow', g: 2 },
  { re: /^(export\s+)?const\s+(\w+)\s*=\s*(async\s+)?function/, kind: 'function', g: 2 }
];

const symbols = [];           // {id, name, kind, file, dir, line, loc, exported, body}
const byFile = new Map();     // file → [symbols]

for (const f of files) {
  const src = readFileSync(f, 'utf8');
  const lines = src.split('\n');
  const id = idOf(f);
  const dir = dirname(id) === '.' ? '(raiz)' : dirname(id);
  const list = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const d of defRe) {
      const m = d.re.exec(line);
      if (m) {
        const name = m[d.g];
        if (!name) break;
        const end = blockEnd(lines, i);
        const sym = {
          id: `${id}::${name}`, name, kind: d.kind, file: id, dir,
          line: i + 1, loc: end - i + 1, exported: !!m[1],
          body: lines.slice(i, end + 1).join('\n')
        };
        /* herança: class X extends Y → guarda o nome do pai */
        if (d.kind === 'class') {
          const ext = /\bclass\s+\w+\s+extends\s+([\w.]+)/.exec(line);
          if (ext) sym.extendsName = ext[1].split('.').pop();
        }
        list.push(sym); symbols.push(sym);
        break;
      }
    }
  }
  byFile.set(id, list);
}

/* índice por nome → símbolos (para resolver chamadas) */
const byName = new Map();
for (const s of symbols) {
  if (!byName.has(s.name)) byName.set(s.name, []);
  byName.get(s.name).push(s);
}

/* arestas CALLS: para cada símbolo, acha nomes conhecidos chamados no corpo */
const edges = [];
const seen = new Set();
const callRe = /\b([A-Za-z_$][\w$]*)\s*\(/g;
for (const s of symbols) {
  const local = new Map((byFile.get(s.file) || []).map((x) => [x.name, x]));
  let m; callRe.lastIndex = 0;
  const calledHere = new Set();
  while ((m = callRe.exec(s.body))) {
    const name = m[1];
    if (name === s.name || NOT_CALL.has(name) || calledHere.has(name)) continue;
    if (!byName.has(name)) continue;
    calledHere.add(name);
    /* resolve alvo: mesmo arquivo > exportado único > qualquer exportado */
    let target = local.get(name);
    if (!target) {
      const cands = byName.get(name).filter((x) => x.exported);
      if (cands.length) target = cands[0];
    }
    if (!target || target.id === s.id) continue;
    const key = s.id + '>' + target.id;
    if (seen.has(key)) continue; seen.add(key);
    edges.push({ source: s.id, target: target.id, type: 'CALLS' });
  }
}

/* arestas EXTENDS: classe → classe-pai (herança), resolvido por nome */
for (const s of symbols) {
  if (s.kind !== 'class' || !s.extendsName) continue;
  const cands = (byName.get(s.extendsName) || []).filter((x) => x.kind === 'class');
  const parent = cands[0];
  if (!parent || parent.id === s.id) continue;
  const key = s.id + '>' + parent.id;
  if (seen.has(key)) continue; seen.add(key);
  edges.push({ source: s.id, target: parent.id, type: 'EXTENDS' });
}

/* métricas por símbolo (imports = chamadas feitas; importedBy = vezes chamado) */
const deg = new Map(symbols.map((s) => [s.id, { out: 0, in: 0 }]));
for (const e of edges) { deg.get(e.source).out++; deg.get(e.target).in++; }

const nodes = symbols.map((s) => ({
  id: s.id, label: s.name, kind: s.kind, file: s.file, dir: s.dir,
  loc: s.loc, line: s.line, exported: s.exported,
  imports: deg.get(s.id).out, importedBy: deg.get(s.id).in
}));

const byKind = {};
for (const n of nodes) byKind[n.kind] = (byKind[n.kind] || 0) + 1;
const topCalled = [...nodes].sort((a, b) => b.importedBy - a.importedBy).slice(0, 12)
  .map((n) => ({ id: n.id, label: n.label, importedBy: n.importedBy }));

writeFileSync('src/data/codemap-symbols.json', JSON.stringify({
  meta: { symbols: nodes.length, calls: edges.length, files: files.length, byKind, geradoEm: new Date().toISOString() },
  topCalled, nodes, links: edges
}));

// Companion LEVE (poucos kB): só `meta` + contagem de funções por arquivo.
// O site carrega isto no boot (badges/hint/métricas) e só baixa o grafo cheio
// (`codemap-symbols.json`, ~450 kB) sob demanda — modo Funções / drill-down.
// Mantém a web leve (#238 Fase 2 — gate parcial do Git Nexus).
const fnByFile = {};
for (const n of nodes) fnByFile[n.file] = (fnByFile[n.file] || 0) + 1;
writeFileSync('src/data/codemap-symbols-meta.json', JSON.stringify({
  meta: { symbols: nodes.length, calls: edges.length, files: files.length, byKind, geradoEm: new Date().toISOString() },
  fnByFile
}));

console.log(`✓ src/data/codemap-symbols.json — ${nodes.length} símbolos, ${edges.length} chamadas, kinds: ${JSON.stringify(byKind)}`);
console.log(`✓ src/data/codemap-symbols-meta.json — companion leve (meta + fnByFile de ${Object.keys(fnByFile).length} arquivos)`);
