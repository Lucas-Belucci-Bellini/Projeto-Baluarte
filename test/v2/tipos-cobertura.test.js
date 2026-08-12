/**
 * O portão de tipos cobre o que diz cobrir?
 *
 * ── O erro que este arquivo existe para não repetir ──────────────────────────
 * `npm run tipos:v2` entrou no CI depois de eu ter afirmado "tsc exit=0" com o
 * tsc vermelho. Portão instalado, lição aprendida — e mesmo assim, meses depois,
 * o `include` do `jsconfig.json` ainda era **só** `core/**`. O primeiro módulo
 * escrito para a V2 nunca passou pelo verificador: 12 erros de tipo esperando,
 * num arquivo que é o modelo de todo módulo futuro.
 *
 * A lição não é "esqueci de acrescentar". É que **portão com escopo implícito
 * mente**: ele fica verde e ninguém sabe sobre o quê. `npm run tipos:v2` não
 * dizia "verifiquei 11 arquivos de 14" — dizia `exit 0`.
 *
 * ── A fronteira, e por que ela não é arbitrária ──────────────────────────────
 * Módulo **nativo** entra. Módulo **adaptador** — o que importa página da V1 —
 * fica fora, porque o tsc segue import e a V1 tem 297 erros de tipo em código
 * congelado, que não é nosso para consertar. `exclude` não resolveria: ele tira
 * o arquivo do `include`, não do grafo de imports.
 *
 * Este teste transforma essa fronteira em regra cobrada: módulo nativo novo que
 * não apareça no `include` deixa a suíte vermelha, no mesmo commit em que nasce.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../..');
const jsconfig = JSON.parse(readFileSync(join(raiz, 'v2/jsconfig.json'), 'utf8'));

/** Arquivos `.js` de um módulo, um nível de profundidade — é a forma que eles têm. */
function fontesDoModulo(id) {
  return readdirSync(join(raiz, 'v2/modules', id), { withFileTypes: true })
    .filter((e) => e.isFile() && e.name.endsWith('.js'))
    .map((e) => readFileSync(join(raiz, 'v2/modules', id, e.name), 'utf8'));
}

/**
 * Adaptador é o módulo que alcança a V1. A checagem é sobre o **texto do
 * import** de propósito: é o que o tsc enxerga, e é o que arrasta `src/` para
 * dentro do grafo — inclusive no `import()` com template string do militar,
 * que nenhuma análise de módulo resolveria.
 */
const ehAdaptador = (id) => fontesDoModulo(id).some((s) => s.includes('/src/'));

const modulos = readdirSync(join(raiz, 'v2/modules'), { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name);

const cobre = (id) => jsconfig.include.some((g) => g.startsWith(`modules/${id}/`));

test('há módulos para conferir — a varredura não achou pasta vazia', () => {
  /* Sem isto, um `readdirSync` que devolvesse `[]` faria todos os testes abaixo
   * passarem sem verificar nada. Suíte verde por ausência de sujeito é o modo
   * de falha mais silencioso que um teste de cobertura tem. */
  assert.ok(modulos.length >= 1, 'nenhum módulo em v2/modules');
});

test('o Core inteiro está no portão de tipos', () => {
  assert.ok(jsconfig.include.includes('core/**/*.js'), jsconfig.include.join(' | '));
});

test('todo módulo NATIVO está no portão de tipos', () => {
  const nativos = modulos.filter((id) => !ehAdaptador(id));
  const fora = nativos.filter((id) => !cobre(id));

  assert.deepEqual(fora, [],
    `módulo nativo fora de v2/jsconfig.json include: ${fora.join(', ')} — ` +
    'acrescente `modules/<id>/**/*.js` e conserte os tipos antes de commitar');
});

test('módulo ADAPTADOR fica fora — e por motivo declarado, não por descuido', () => {
  /* Se alguém incluir um adaptador achando que "falta cobertura", `npm run
   * tipos:v2` passa a falhar por 297 erros da V1 e o portão vira ruído que se
   * aprende a ignorar. Este teste falha ANTES, dizendo o porquê. */
  const adaptadores = modulos.filter((id) => ehAdaptador(id));
  assert.ok(adaptadores.length >= 1, 'nenhum adaptador — reveja se este teste ainda descreve o repo');

  for (const id of adaptadores) {
    assert.equal(cobre(id), false,
      `"${id}" importa a V1 e está no include: o tsc vai seguir para src/ e o portão fica vermelho por código congelado`);
  }
});

test('o cripto é nativo — o que sustenta os dois testes acima', () => {
  /* Âncora: se um dia o cripto passar a importar da V1, a classificação vira e
   * os testes acima mudariam de significado em silêncio. */
  assert.equal(ehAdaptador('cripto'), false);
  assert.equal(cobre('cripto'), true);
});
