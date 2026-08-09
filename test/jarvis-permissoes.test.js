/**
 * Testes do mapa tool→permissão do JARVIS (#420).
 *
 * O que se cobra aqui é a *coerência entre dois arquivos*: o mapa aponta para
 * permissões que precisam existir no catálogo de `src/core/politica.js`. Se
 * alguém renomear uma permissão lá e esquecer aqui, a ferramenta passa a exigir
 * uma permissão inexistente — `exigir()` lança `desconhecida` e a tool morre em
 * runtime, para o operador, sem aviso em desenvolvimento.
 *
 * E cobra-se a classificação: uma tool perigosa mapeada para uma permissão de
 * `leitura` seria uma fronteira que existe no papel e não segura nada, porque
 * `conceder('*')` a entregaria de graça.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { PERMISSAO_POR_TOOL, PERMISSAO_PADRAO, permissaoDe } from '../src/utils/jarvis-permissoes.js';
import { PERMISSOES } from '../src/core/politica.js';

const CATALOGO = new Map(PERMISSOES.map((p) => [p.id, p]));

/* ===== Coerência com o catálogo ===== */

test('toda permissão citada pelo mapa existe no catálogo', () => {
  for (const [tool, id] of Object.entries(PERMISSAO_POR_TOOL)) {
    assert.ok(CATALOGO.has(id), `a tool "${tool}" aponta para "${id}", que não existe em politica.js`);
  }
});

test('a permissão padrão existe no catálogo', () => {
  assert.ok(CATALOGO.has(PERMISSAO_PADRAO));
});

/* ===== Classificação ===== */

test('o padrão de quem não declara permissão é restrito', () => {
  /* Se o padrão fosse `leitura`, uma tool registrada sem declarar permissão
   * entraria de graça em qualquer `conceder('*')`. */
  assert.equal(CATALOGO.get(PERMISSAO_PADRAO).risco, 'restrito');
});

test('as tools que tocam dado sensível ou executam código são restritas', () => {
  const perigosas = ['recall_memory', 'create_skill', 'delete_skill'];
  for (const tool of perigosas) {
    const id = PERMISSAO_POR_TOOL[tool];
    assert.equal(
      CATALOGO.get(id).risco, 'restrito',
      `"${tool}" → "${id}" precisa ser restrito, senão conceder('*') a entrega`
    );
  }
});

test('as tools que só leem conteúdo público são leitura', () => {
  for (const tool of ['search_arsenal', 'get_equipe', 'get_arco', 'calculate', 'system_status']) {
    const id = PERMISSAO_POR_TOOL[tool];
    assert.equal(CATALOGO.get(id).risco, 'leitura', `"${tool}" → "${id}" devia ser leitura`);
  }
});

test('as tools que gravam estado são escrita', () => {
  for (const tool of ['open_editor', 'set_color']) {
    const id = PERMISSAO_POR_TOOL[tool];
    assert.equal(CATALOGO.get(id).risco, 'escrita', `"${tool}" → "${id}" devia ser escrita`);
  }
});

/* ===== Resolução ===== */

test('permissaoDe usa o mapa quando a tool é built-in', () => {
  assert.equal(permissaoDe('search_arsenal'), 'arsenal.read');
});

test('permissaoDe respeita a permissão declarada por uma tool dinâmica', () => {
  assert.equal(permissaoDe('minha_tool', { permissao: 'nexus.read' }), 'nexus.read');
});

test('permissaoDe cai no padrão fechado para tool desconhecida', () => {
  assert.equal(permissaoDe('inventada'), PERMISSAO_PADRAO);
  assert.equal(permissaoDe('skill_do_agente', {}), PERMISSAO_PADRAO);
});

test('o mapa vence a declaração da dinâmica — built-in não é rebaixável', () => {
  /* Registrar uma tool dinâmica com o nome de uma built-in não pode ser um
   * caminho para trocar a permissão dela por uma mais fraca. */
  assert.equal(permissaoDe('create_skill', { permissao: 'arsenal.read' }), 'jarvis.skills.escrever');
});
