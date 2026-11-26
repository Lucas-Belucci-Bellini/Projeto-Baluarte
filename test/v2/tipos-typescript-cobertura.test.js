import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../..');
const raizV2 = join(raiz, 'v2');
const config = JSON.parse(
  readFileSync(join(raizV2, 'tsconfig.types.json'), 'utf8'),
);

/**
 * Lista fontes TypeScript reais sob v2/. Arquivos .d.ts também terminam em
 * .ts e precisam estar no mesmo portão que os fontes executáveis.
 */
function listarFontesTypeScript(diretorio) {
  return readdirSync(diretorio, { withFileTypes: true }).flatMap((entrada) => {
    const caminho = join(diretorio, entrada.name);
    if (entrada.isDirectory()) return listarFontesTypeScript(caminho);
    return entrada.isFile() && entrada.name.endsWith('.ts') ? [caminho] : [];
  });
}

test('o gate TypeScript dedicado é estrito e não emite artefatos', () => {
  assert.equal(config.compilerOptions?.strict, true);
  assert.equal(config.compilerOptions?.noEmit, true);
  assert.equal(config.compilerOptions?.allowImportingTsExtensions, true);
  assert.deepEqual(config.compilerOptions?.types, []);
});

test('há fontes TypeScript reais para o gate verificar', () => {
  const fontes = listarFontesTypeScript(raizV2);
  assert.ok(fontes.length > 0, 'nenhum arquivo .ts/.d.ts encontrado em v2/');
});

test('todo arquivo .ts/.d.ts de v2/ entra no gate recursivo', () => {
  const fontes = listarFontesTypeScript(raizV2);
  const includes = config.include ?? [];

  // O padrão recursivo mantém arquivos futuros dentro do gate sem depender
  // de uma lista manual que possa ficar desatualizada.
  assert.ok(
    includes.includes('**/*.ts'),
    `v2/tsconfig.types.json precisa incluir "**/*.ts"; atual: ${includes.join(' | ')}`,
  );

  // Não permitir exclusões silenciosas de uma parte do escopo TypeScript da V2.
  assert.equal(
    Object.hasOwn(config, 'exclude'),
    false,
    'o gate TypeScript da V2 não deve excluir arquivos sem uma revisão explícita deste contrato',
  );

  assert.ok(
    fontes.every((arquivo) => arquivo.startsWith(raizV2)),
    'todos os arquivos cobertos devem estar sob v2/',
  );
});
