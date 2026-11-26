import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve, sep, join } from 'node:path';
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

test('o gate TypeScript dedicado é estrito e valida declarações', () => {
  assert.equal(config.compilerOptions?.strict, true);
  assert.equal(config.compilerOptions?.skipLibCheck, false);
  assert.equal(config.compilerOptions?.noEmit, true);
  assert.equal(config.compilerOptions?.allowImportingTsExtensions, true);
  assert.deepEqual(config.compilerOptions?.types, []);
});

test('há fontes TypeScript reais para o gate verificar', () => {
  const fontes = listarFontesTypeScript(raizV2);
  assert.ok(fontes.length > 0, 'nenhum arquivo .ts/.d.ts encontrado em v2/');
});

test('todo arquivo .ts/.d.ts de v2/ está coberto pelo include recursivo', () => {
  const fontes = listarFontesTypeScript(raizV2);
  const includes = config.include ?? [];
  const exclusoes = config.exclude ?? [];

  // TypeScript interpreta **/*.ts como todos os arquivos .ts em v2/ e
  // qualquer subdiretório. A execução de tsc valida a configuração de fato;
  // este teste impede que o padrão seja removido ou estreitado em silêncio.
  assert.deepEqual(
    includes,
    ['**/*.ts'],
    `o include de v2/tsconfig.types.json precisa manter cobertura recursiva: ${includes.join(' | ')}`,
  );
  assert.deepEqual(
    exclusoes,
    [],
    'o gate TypeScript da V2 não deve excluir fontes sem revisão explícita',
  );

  const foraDoEscopo = fontes.filter((arquivo) => {
    const caminhoRelativo = relative(raizV2, resolve(arquivo));
    return caminhoRelativo === '..'
      || caminhoRelativo.startsWith(`..${sep}`)
      || caminhoRelativo.startsWith(sep);
  });

  assert.deepEqual(
    foraDoEscopo,
    [],
    'todos os arquivos cobertos devem estar sob v2/',
  );
});
