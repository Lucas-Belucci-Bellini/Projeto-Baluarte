import { readFile, writeFile } from 'node:fs/promises';
import { readdir } from 'node:fs/promises';
import { join, relative, basename } from 'node:path';
import { execFileSync } from 'node:child_process';

const root = process.cwd();
const pagesRoot = join(root, 'src/pages');
const output = join(root, 'docs/v2/PAGES_JS_REMAINING_INVENTORY.md');

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(path));
    else if (entry.isFile() && entry.name.endsWith('.js')) files.push(path);
  }
  return files;
}

function isWrapper(source) {
  return /export\s+\{[^}]+\}\s+from\s+['"][^'"]+\.ts['"]/.test(source);
}

function classify(file) {
  const name = basename(file, '.js');
  if (['jarvis', 'jarvis-dashboard', 'jarvis-vision', 'cerebro', 'memoria', 'llm-lab', 'git-nexus', 'git-nexus-nucleo', 'git-nexus-cockpit', 'conselho'].includes(name)) {
    return ['IA, Nexus e memória', 'alto', 'tipar motores, transportes e memória antes da superfície'];
  }
  if (['editor', 'terminal', 'terminal-ia', 'qr-studio', 'calc-numerica', 'calc-cientifica', 'logic-sim', 'tabela-verdade', 'graficos', 'regex', 'ocr', 'codigo', 'gerar-codigo', 'git-helper', 'simbolos', 'dolar'].includes(name)) {
    return ['Ferramentas interativas', ['simbolos', 'git-helper', 'dolar'].includes(name) ? 'baixo' : 'médio', 'fechar tipos de entrada, estado e dependências'];
  }
  if (['wiki-arma3', 'arma3-tutorial', 'arma3-extracao-painel', 'vanguard', 'modelos-3d', 'visao', 'mapa'].includes(name)) {
    return ['Arma 3, 3D e visualização', 'alto', 'isolar dados grandes, WebGL e ciclo de vida visual'];
  }
  if (['radio', 'musicas', 'radar', 'videos', 'tv', 'media', 'filmes', 'memes'].includes(name)) {
    return ['Mídia, rádio e DSP', 'alto', 'tipar APIs de mídia, canvas e recursos externos'];
  }
  if (['biblioteca', 'academia', 'ciberseg', 'robotica', 'jogos', 'modpack', 'zomboid', 'zomboid-admin', 'aprendizado', 'projetos', 'mural'].includes(name)) {
    return ['Hubs e catálogos', 'médio', 'tipar catálogo, filtros e persistência local'];
  }
  if (['militar', 'poder-militar', 'orcamentos-militares', 'forcas-armadas', 'forcas-especiais', 'guerras-conflitos', 'batalhas-historicas', 'historia-militar', 'organizacao-militar', 'taticas-estrategias', 'tecnologia-militar', 'armas-por-pais', 'enciclopedia-militar'].includes(name)) {
    return ['Conteúdo militar', 'baixo', 'tipar dados estáticos e preservar rota'];
  }
  return ['Páginas utilitárias e conteúdo', 'baixo', 'tipar estado local, DOM e dependências diretas'];
}

const all = await walk(pagesRoot);
const rows = [];
for (const file of all) {
  const source = await readFile(file, 'utf8');
  if (isWrapper(source)) continue;
  const [group, risk, recommendation] = classify(file);
  const lines = source.split('\n').length;
  rows.push({ file: relative(root, file), name: basename(file, '.js'), lines, bytes: Buffer.byteLength(source), group, risk, recommendation });
}

const riskOrder = { baixo: 1, 'médio': 2, alto: 3 };
rows.sort((a, b) => riskOrder[b.risk] - riskOrder[a.risk] || b.lines - a.lines || a.file.localeCompare(b.file));
const counts = rows.reduce((acc, row) => {
  acc[row.group] = (acc[row.group] || 0) + 1;
  return acc;
}, {});
const sha = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
const generatedAt = new Date().toISOString();
const selected = new Set(['biblioteca', 'academia', 'ciberseg', 'robotica']);
const remainingSelected = rows.filter((row) => selected.has(row.name)).map((row) => row.name);
const waveSummary = remainingSelected.length
  ? 'A onda atual ainda contém: ' + remainingSelected.map((name) => String.fromCharCode(96) + name + '.js' + String.fromCharCode(96)).join(', ') + '.'
  : 'A onda de biblioteca, academia, ciberseg e robotica foi concluída; a próxima onda deve ser escolhida pelo risco documentado.';

const lines = [
  '# Inventário detalhado — páginas JavaScript restantes',
  '',
  `**SHA auditado:** \`${sha}\``,
  `**Gerado em:** ${generatedAt}`,
  '**Status:** INVENTÁRIO OPERACIONAL — páginas `.js` classificadas por implementação canônica; wrappers que apenas reexportam `.ts` foram excluídos.',
  '',
  '> Este relatório é gerado a partir do filesystem real. Uma página só sai da lista quando sua implementação canônica passa para `.ts`, o `.js` vira wrapper compatível e os gates comportamentais permanecem verdes.',
  '',
  '## Resumo',
  '',
  `Existem **${rows.length} páginas JavaScript canônicas restantes**. ${waveSummary} Os wrappers de compatibilidade não são contados como dívida funcional.`,
  '',
  '| Grupo | Páginas restantes |',
  '| --- | ---: |',
  ...Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([group, count]) => `| ${group} | ${count} |`),
  '',
  '## Matriz completa',
  '',
  '| # | Arquivo | Linhas | Bytes | Grupo | Risco | Próxima ação |',
  '| ---: | --- | ---: | ---: | --- | --- | --- |',
  ...rows.map((row, index) => `| ${index + 1} | \`${row.file}\` | ${row.lines} | ${row.bytes} | ${row.group} | ${row.risk} | ${selected.has(row.name) ? 'onda atual' : row.recommendation} |`),
  '',
  '## Critérios de saída',
  '',
  'Cada item deve sair desta lista somente após possuir implementação canônica `.ts`, wrapper `.js`, fronteiras `.d.ts` justificadas, typecheck estrito, testes comportamentais, build, smoke e documentação de rollback. Páginas de alto risco exigem ainda contratos de lifecycle, dados, browser APIs e testes específicos antes da conversão.',
  '',
  '## Páginas de alto risco reservadas',
  '',
  'As páginas JARVIS, Editor, Wiki Arma 3, Arma 3 Tutorial, Vanguard, Visão, Nexus, mídia e 3D permanecem reservadas para ondas próprias. O plano de contratos de JARVIS e Editor está em [`JARVIS_EDITOR_MIGRATION_PLAN.md`](./JARVIS_EDITOR_MIGRATION_PLAN.md).',
  '',
  '## Referências',
  '',
  '- [`TYPESCRIPT_REMAINING.md`](./TYPESCRIPT_REMAINING.md) — roadmap agregado da migração.',
  '- [`TYPESCRIPT_MIGRATION.md`](./TYPESCRIPT_MIGRATION.md) — histórico de ondas e gates.',
  '',
];

await writeFile(output, `${lines.join('\n')}\n`);
console.log(`inventory: ${rows.length} canonical JS pages -> ${output}`);
