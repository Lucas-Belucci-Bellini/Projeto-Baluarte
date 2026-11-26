import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';
import ts from 'typescript';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../..');
const raizV2 = join(raiz, 'v2');
const caminhoConfig = join(raizV2, 'tsconfig.types.json');
const config = JSON.parse(readFileSync(caminhoConfig, 'utf8'));

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

function arquivosDoProjetoTypeScript() {
  const projeto = ts.parseJsonConfigFileContent(
    config,
    ts.sys,
    raizV2,
    undefined,
    caminhoConfig,
  );
  assert.deepEqual(
    projeto.errors,
    [],
    'v2/tsconfig.types.json precisa ser interpretado sem erros pelo próprio TypeScript',
  );
  return new Set(projeto.fileNames.map((arquivo) => resolve(arquivo)));
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

test('todo arquivo .ts/.d.ts de v2/ está no projeto real do TypeScript', () => {
  const fontes = listarFontesTypeScript(raizV2);
  const incluidos = arquivosDoProjetoTypeScript();
  const fora = fontes
    .map((arquivo) => resolve(arquivo))
    .filter((arquivo) => !incluidos.has(arquivo));

  assert.deepEqual(
    fora,
    [],
    'há fontes TypeScript da V2 fora de v2/tsconfig.types.json',
  );
});
