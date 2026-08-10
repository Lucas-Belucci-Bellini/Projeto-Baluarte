/**
 * O contrato de módulo aguenta os casos DIFÍCEIS?
 *
 * `/cripto` passou de primeira e por isso não provou quase nada: motor isolado,
 * sem rede, sem evento, uma rota. O risco anotado na `V2_ARCHITECTURE.md` §6 era
 * exatamente este — *formato validado só contra o caso fácil erra nos difíceis*.
 *
 * Estes testes rodam o formato contra os dois piores que a V1 tem:
 *
 *   /militar  15 rotas num módulo · rede · id de estabilidade que não bate
 *   /editor   chave escrita por OUTRO módulo (JARVIS)
 *
 * O que eles cobram não é "o manifesto está bonito" — é que os achados
 * continuem verdadeiros. Se alguém consertar o acoplamento do JARVIS na V1, o
 * teste correspondente falha e obriga a atualizar o registro.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import militar from '../../v2/modules/militar/module.js';
import editor from '../../v2/modules/editor/module.js';
import { validar, normalizar } from '../../v2/core/manifest.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../..');
const ler = (p) => readFileSync(join(raiz, p), 'utf8');

/* ═══════════ /militar — 15 rotas, rede, id ≠ rota ═══════════ */

test('o Centro Militar é válido com 15 rotas num módulo só', () => {
  const r = validar(militar);
  assert.equal(r.ok, true, r.erros.join(' | '));
  assert.equal(militar.routes.length, 15);
});

test('as 15 rotas existem de verdade no main.js da V1', () => {
  const main = ler('src/main.js');
  for (const { path } of militar.routes) {
    assert.ok(
      main.includes(`router.register('${path}'`),
      `${path} está no manifesto e não existe na V1`
    );
  }
});

test('ACHADO: a estabilidade da V1 usa um id que cobre DUAS rotas', () => {
  /* `arsenal` cobre "Arsenal e Centro Militar" — evidência de que módulo não é
   * rota, e de que as 99 rotas não viram 99 módulos. */
  const politica = ler('src/core/politica.js');
  assert.match(politica, /\{ id: 'arsenal'.*'Arsenal e Centro Militar'/);
  assert.ok(
    militar.routes.some((r) => r.path === '/arsenal'),
    'o módulo militar devia abarcar /arsenal, como a tabela da V1 já dizia'
  );
});

test('declara NETWORK — e o /cripto não declara nada', () => {
  /* A diferença entre os dois é a razão de permissão ser declarada em vez de
   * concedida por padrão. */
  assert.deepEqual(normalizar(militar).permissions, ['NETWORK']);
  const wiki = ler('src/utils/wikipedia.js');
  assert.ok(wiki.includes('fetch('), 'militar declara NETWORK mas nada usa rede');
});

test('ACHADO: militar-enc:cat não cabe no namespace, e isso não foi mascarado', () => {
  /* A chave da V1 é `militar-enc:cat`; o validador exige `militar:`. A saída
   * honesta é deixar de fora e registrar a migração — não renomear num arquivo
   * de exemplo nem afrouxar o invariante. */
  const politica = ler('src/core/politica.js');
  assert.match(politica, /chave: 'militar-enc:cat'/, 'a chave sumiu da V1; revise o manifesto');

  assert.deepEqual(militar.storage, [], 'a chave foi declarada — o invariante devia ter barrado');

  const rejeitado = validar({
    ...militar,
    storage: [{ key: 'militar-enc:cat', version: 1, class: 'local' }]
  });
  assert.equal(rejeitado.ok, false, 'o validador aceitou chave fora do namespace');
});

/* ═══════════ /editor — o acoplamento invisível ═══════════ */

test('o Editor é válido', () => {
  const r = validar(editor);
  assert.equal(r.ok, true, r.erros.join(' | '));
});

test('ACHADO: o JARVIS escreve direto na chave do editor', () => {
  /* Storage compartilhado é import disfarçado — e nenhuma análise estática
   * aponta. Este teste é o alarme: se alguém consertar na V1, ele falha. */
  const tools = ler('src/utils/jarvis-tools.js');
  assert.match(tools, /storage\.set\('editor:state'/,
    'o acoplamento foi consertado na V1 — atualize este teste e o manifesto do editor');
  assert.match(tools, /tabs|activeId/,
    'o JARVIS conhecia o formato interno do editor; confirme se ainda conhece');
});

test('o namespace de storage torna esse acoplamento IMPOSSÍVEL na V2', () => {
  /* Um módulo `jarvis` que declarasse `editor:state` é recusado. É a garantia
   * por construção que substitui a disciplina. */
  const jarvisIntruso = {
    id: 'jarvis', name: 'JARVIS', version: '1.0.0',
    storage: [{ key: 'editor:state', version: 1, class: 'local' }]
  };
  const r = validar(jarvisIntruso);
  assert.equal(r.ok, false);
  assert.ok(r.erros.some((e) => e.includes('jarvis:')), r.erros.join(' | '));
});

test('o editor declara a API que substitui o acesso direto', () => {
  /* Regra 29: API precisa de dono e consumidor. Aqui o consumidor é o JARVIS. */
  assert.ok('api' in editor, 'sem API declarada, o JARVIS não tem caminho legítimo');
  assert.deepEqual(normalizar(editor).events.emits, ['editor:aba-aberta', 'editor:aba-fechada']);
});

/* ═══════════ o conjunto ═══════════ */

test('os três módulos não colidem em id nem em rota', () => {
  /* Invariante DO CONJUNTO — hoje verificado à mão porque o Registry ainda não
   * existe. É a primeira coisa que ele vai assumir. */
  const modulos = [militar, editor];
  const ids = modulos.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length, 'ids repetidos');

  const rotas = modulos.flatMap((m) => (m.routes || []).map((r) => r.path));
  assert.equal(new Set(rotas).size, rotas.length, 'a mesma rota em dois módulos');
});
