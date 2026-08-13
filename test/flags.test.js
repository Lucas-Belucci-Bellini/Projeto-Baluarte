/**
 * Testes das feature flags e dos níveis de estabilidade (#420, itens 1 e 7).
 *
 * A propriedade central: **experimental não nasce ligada**. É ela que dá
 * sentido à frase "1.0.0 = o que está marcado como estável é confiável" — sem
 * cobrança, o nível vira um adjetivo no README e a 1.0.0 sai prometendo o que
 * não entrega.
 *
 * A segunda: uma flag app-only não liga na web nem se o operador mandar. O gate
 * do mega-plano #238 (web leve / app completo) não pode ter porta dos fundos.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  declarar, declararTodas, configurarAmbiente, ambiente, conectarPersistencia,
  ativo, descrever, listar, porNivel, definir, resetar, aplicarDaURL, limpar
} from '../src/core/flags.js';

beforeEach(() => limpar());

/* ===== a regra que sustenta a 1.0.0 ===== */

test('experimental NÃO pode nascer ligada por padrão', () => {
  assert.throws(
    () => declarar({ id: 'jarvisAgente', nivel: 'experimental', padrao: true }),
    /experimental/
  );
});

test('beta e estável podem vir ligadas', () => {
  declarar({ id: 'novoTerminal', nivel: 'beta', padrao: true });
  declarar({ id: 'arsenal', nivel: 'estavel', padrao: true });
  assert.equal(ativo('novoTerminal'), true);
  assert.equal(ativo('arsenal'), true);
});

test('sem nível declarado, nasce experimental e desligada', () => {
  declarar({ id: 'coisaNova' });
  assert.equal(descrever('coisaNova').nivel, 'experimental');
  assert.equal(ativo('coisaNova'), false);
});

test('flag não declarada é sempre falsa — nunca lança na consulta', () => {
  assert.equal(ativo('naoExiste'), false);
  assert.equal(descrever('naoExiste'), null);
});

/* ===== escolha do operador ===== */

test('o operador liga uma experimental na mão', () => {
  declarar({ id: 'jarvisAgente', nivel: 'experimental' });
  assert.equal(ativo('jarvisAgente'), false);
  assert.equal(definir('jarvisAgente', true), true);
  assert.equal(ativo('jarvisAgente'), true);
});

test('o operador também desliga o que vem ligado', () => {
  declarar({ id: 'novoTerminal', nivel: 'beta', padrao: true });
  definir('novoTerminal', false);
  assert.equal(ativo('novoTerminal'), false);
});

test('resetar esquece a escolha e volta ao padrão', () => {
  declarar({ id: 'novoTerminal', nivel: 'beta', padrao: true });
  definir('novoTerminal', false);
  assert.equal(resetar('novoTerminal'), true);
  assert.equal(descrever('novoTerminal').escolhida, false);
});

test('definir flag inexistente lança — é typo, não configuração', () => {
  assert.throws(() => definir('naoExiste', true), /não foi declarada/);
});

/* ===== ambiente (gate do #238) ===== */

test('o ambiente começa em "web" — o pior caso, não o mais permissivo', () => {
  assert.equal(ambiente(), 'web');
});

test('flag app-only fica desligada na web mesmo com padrao: true', () => {
  declarar({ id: 'motorReal', nivel: 'beta', padrao: true, ambiente: 'app' });
  assert.equal(ativo('motorReal'), false);
  configurarAmbiente('app');
  assert.equal(ativo('motorReal'), true);
});

test('nem a escolha do operador liga uma flag app-only na web', () => {
  /* Se ligasse, o gate do #238 teria porta dos fundos: bastaria um clique pra
   * a web tentar carregar o chunk pesado que ela não tem como rodar. */
  declarar({ id: 'motorReal', nivel: 'beta', ambiente: 'app' });
  definir('motorReal', true);
  assert.equal(ativo('motorReal'), false);
  configurarAmbiente('app');
  assert.equal(ativo('motorReal'), true, 'a escolha fica guardada e vale quando o ambiente permite');
});

test('flag web-only não liga no app', () => {
  declarar({ id: 'teaserBaixar', nivel: 'estavel', padrao: true, ambiente: 'web' });
  assert.equal(ativo('teaserBaixar'), true);
  configurarAmbiente('app');
  assert.equal(ativo('teaserBaixar'), false);
});

test('ambiente inválido é recusado', () => {
  assert.throws(() => configurarAmbiente('android'), /inválido/);
});

/* ===== persistência injetada ===== */

test('conectarPersistencia recarrega as escolhas salvas', () => {
  declararTodas([
    { id: 'a', nivel: 'experimental' },
    { id: 'b', nivel: 'beta', padrao: true }
  ]);

  const n = conectarPersistencia({ ler: () => ({ a: true, b: false }), gravar() {} });
  assert.equal(n, 2);
  assert.equal(ativo('a'), true);
  assert.equal(ativo('b'), false);
});

test('escolha salva de flag que não existe mais é descartada', () => {
  declarar({ id: 'a', nivel: 'experimental' });
  const n = conectarPersistencia({ ler: () => ({ a: true, removida: true }), gravar() {} });
  assert.equal(n, 1);
  assert.equal(ativo('removida'), false);
});

test('definir grava pela persistência conectada', () => {
  declarar({ id: 'a', nivel: 'experimental' });
  let gravado = null;
  conectarPersistencia({ ler: () => ({}), gravar: (obj) => { gravado = obj; } });
  definir('a', true);
  assert.deepEqual(gravado, { a: true });
});

/* ===== override por URL ===== */

test('?flags= liga e desliga, com "-" pra desligar', () => {
  declararTodas([
    { id: 'a', nivel: 'experimental' },
    { id: 'b', nivel: 'beta', padrao: true }
  ]);
  const aplicados = aplicarDaURL('?flags=a,-b');
  assert.deepEqual(aplicados.sort(), ['a', 'b']);
  assert.equal(ativo('a'), true);
  assert.equal(ativo('b'), false);
});

test('?flags= NÃO persiste — fechou a aba, acabou', () => {
  declarar({ id: 'a', nivel: 'experimental' });
  let gravou = false;
  conectarPersistencia({ ler: () => ({}), gravar: () => { gravou = true; } });
  aplicarDaURL('?flags=a');
  assert.equal(ativo('a'), true);
  assert.equal(gravou, false);
});

test('?flags= ignora id desconhecido em vez de quebrar a página', () => {
  declarar({ id: 'a', nivel: 'experimental' });
  const aplicados = aplicarDaURL('?flags=a,fantasma');
  assert.deepEqual(aplicados, ['a']);
});

test('sem ?flags= não muda nada', () => {
  declarar({ id: 'a', nivel: 'experimental' });
  assert.deepEqual(aplicarDaURL('?outra=1'), []);
  assert.deepEqual(aplicarDaURL(''), []);
  assert.equal(ativo('a'), false);
});

/* ===== a tabela de estabilidade da 1.0.0 ===== */

test('porNivel monta a tabela que o README da 1.0.0 vai mostrar', () => {
  declararTodas([
    { id: 'arsenal', nivel: 'estavel', padrao: true },
    { id: 'router', nivel: 'estavel', padrao: true },
    { id: 'jarvis', nivel: 'beta', padrao: true },
    { id: 'mcp', nivel: 'experimental' }
  ]);
  assert.deepEqual(porNivel(), {
    estavel: ['arsenal', 'router'],
    beta: ['jarvis'],
    experimental: ['mcp']
  });
});

test('listar traz o estado resolvido de cada flag', () => {
  declarar({ id: 'a', nivel: 'beta', padrao: true, descricao: 'teste' });
  const [f] = listar();
  assert.equal(f.id, 'a');
  assert.equal(f.ativo, true);
  assert.equal(f.escolhida, false);
  assert.equal(f.descricao, 'teste');
});

test('id fora do camelCase é recusado', () => {
  assert.throws(() => declarar({ id: 'nova-flag' }), /inválido/);
  assert.throws(() => declarar({ id: '2coisas' }), /inválido/);
});
