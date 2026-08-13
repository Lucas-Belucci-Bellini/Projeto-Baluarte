/**
 * Testes do Permission Manager.
 *
 * O que está sendo cobrado aqui não é "a função devolve true" — é a fronteira
 * que a issue #420 pediu antes do MCP: um agente não pode ganhar acesso por
 * descuido. Três propriedades carregam o módulo inteiro:
 *
 *   1. nada é concedido por omissão;
 *   2. permissão escrita errada FALHA, não vira negação silenciosa;
 *   3. curinga nunca alcança o que é `restrito`.
 *
 * Roda em Node puro: o módulo não toca DOM nem storage de propósito.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  declarar, declararTodas, conceder, revogar, checar, exigir, protegido,
  exportar, importar, listar, descrever, estado, ultimasDecisoes, limpar,
  PermissionError
} from '../src/core/permissions.js';

/* Conjunto pequeno que exercita os três riscos. */
const BASE = [
  { id: 'arsenal.read', risco: 'leitura', descricao: 'Ler o Arsenal' },
  { id: 'arsenal.write', risco: 'escrita', descricao: 'Alterar o Arsenal' },
  { id: 'terminal.read', risco: 'leitura' },
  { id: 'terminal.execute', risco: 'restrito', descricao: 'Executar comando' },
  { id: 'system.diagnostics', risco: 'leitura' }
];

beforeEach(() => {
  limpar();
  declararTodas(BASE);
});

/* ===== deny-by-default ===== */

test('nada é concedido por omissão', () => {
  for (const p of BASE) assert.equal(checar(p.id), false, `${p.id} não devia estar concedida`);
});

test('exigir sem concessão lança PermissionError com code "negada"', () => {
  assert.throws(() => exigir('arsenal.read'), (err) => {
    assert.ok(err instanceof PermissionError);
    assert.equal(err.code, 'negada');
    assert.equal(err.permissao, 'arsenal.read');
    return true;
  });
});

/* ===== typo não vira negação silenciosa ===== */

test('exigir de permissão não declarada acusa "desconhecida", não "negada"', () => {
  /* A diferença importa: "negada" faz a UI pedir autorização ao operador —
   * e nenhum clique dele vai consertar um typo no código. */
  assert.throws(() => exigir('arsenl.read'), (err) => err.code === 'desconhecida');
});

test('conceder permissão não declarada lança em vez de criar do nada', () => {
  assert.throws(() => conceder('arsenal.reed'), (err) => err.code === 'desconhecida');
  assert.equal(checar('arsenal.reed'), false);
});

test('checar de permissão desconhecida devolve false e deixa rastro', () => {
  assert.equal(checar('nao.existe'), false);
  const ultima = ultimasDecisoes(1)[0];
  assert.equal(ultima.resultado, 'desconhecida');
  assert.equal(ultima.id, 'nao.existe');
});

/* ===== curinga ===== */

test('curinga de domínio concede leitura e escrita daquele domínio', () => {
  const novos = conceder('arsenal.*', { origem: 'operador' });
  assert.deepEqual(novos.sort(), ['arsenal.read', 'arsenal.write']);
  assert.equal(checar('arsenal.read'), true);
  assert.equal(checar('arsenal.write'), true);
  assert.equal(checar('terminal.read'), false, 'curinga não deve vazar pra outro domínio');
});

test('curinga NUNCA alcança risco restrito', () => {
  conceder('*', { origem: 'operador' });
  assert.equal(checar('arsenal.write'), true);
  assert.equal(checar('system.diagnostics'), true);
  assert.equal(checar('terminal.execute'), false, 'execução de comando não pode entrar por curinga');
});

test('restrito só é concedido pelo nome inteiro', () => {
  conceder('terminal.execute', { origem: 'operador' });
  assert.equal(checar('terminal.execute'), true);
});

test('curinga no meio é recusado', () => {
  assert.throws(() => conceder('*.read'), (err) => err.code === 'invalida');
});

/* ===== revogar ===== */

test('revogar por curinga alcança restrito — tirar acesso é sempre seguro', () => {
  conceder(['arsenal.*', 'terminal.execute'], { origem: 'operador' });
  assert.equal(checar('terminal.execute'), true);

  const tirados = revogar('*', { origem: 'panico' });
  assert.ok(tirados.includes('terminal.execute'));
  assert.equal(checar('terminal.execute'), false);
  assert.equal(checar('arsenal.read'), false);
});

test('revogar por domínio não derruba os outros', () => {
  conceder(['arsenal.*', 'terminal.read'], { origem: 'operador' });
  revogar('arsenal.*');
  assert.equal(checar('arsenal.read'), false);
  assert.equal(checar('terminal.read'), true);
});

/* ===== declaração ===== */

test('redeclarar com o MESMO risco é idempotente', () => {
  declarar({ id: 'arsenal.read', risco: 'leitura' });
  assert.equal(listar().filter((p) => p.id === 'arsenal.read').length, 1);
});

test('redeclarar com risco diferente lança — rebaixar risco escaparia do curinga', () => {
  assert.throws(
    () => declarar({ id: 'terminal.execute', risco: 'leitura' }),
    (err) => err.code === 'invalida'
  );
  /* E o risco original continua valendo. */
  assert.equal(descrever('terminal.execute').risco, 'restrito');
});

test('id fora do formato dominio.acao é recusado', () => {
  assert.throws(() => declarar({ id: 'arsenal' }), (err) => err.code === 'invalida');
  assert.throws(() => declarar({ id: 'Arsenal.Read' }), (err) => err.code === 'invalida');
});

test('sem risco declarado, assume o mais fechado', () => {
  declarar({ id: 'novo.acao' });
  assert.equal(descrever('novo.acao').risco, 'restrito');
  conceder('novo.*');
  assert.equal(checar('novo.acao'), false, 'o padrão fechado tem que valer também pro curinga');
});

/* ===== protegido() ===== */

test('protegido() bloqueia antes de a função rodar', () => {
  let rodou = false;
  const tool = protegido(['arsenal.read'], () => { rodou = true; return 'ok'; });

  assert.throws(() => tool(), PermissionError);
  assert.equal(rodou, false, 'a função não podia ter executado');

  conceder('arsenal.read');
  assert.equal(tool(), 'ok');
});

test('protegido() exige TODAS as permissões da lista', () => {
  const tool = protegido(['arsenal.read', 'arsenal.write'], () => 'ok');
  conceder('arsenal.read');
  assert.throws(() => tool(), PermissionError);
  conceder('arsenal.write');
  assert.equal(tool(), 'ok');
});

test('protegido() repassa argumentos e retorno', () => {
  conceder('arsenal.read');
  const tool = protegido('arsenal.read', (a, b) => a + b);
  assert.equal(tool(2, 3), 5);
});

/* ===== persistência ===== */

test('exportar/importar reconstrói o mesmo conjunto', () => {
  conceder(['arsenal.*', 'terminal.execute'], { origem: 'operador' });
  const salvo = JSON.parse(JSON.stringify(exportar()));

  limpar();
  declararTodas(BASE);
  const { aplicadas, descartadas } = importar(salvo);

  assert.deepEqual(aplicadas.sort(), ['arsenal.read', 'arsenal.write', 'terminal.execute']);
  assert.deepEqual(descartadas, []);
  assert.equal(checar('terminal.execute'), true);
});

test('importar descarta permissão que não existe mais nesta versão', () => {
  const salvo = { versao: 1, concedidas: [{ id: 'arsenal.read' }, { id: 'modulo.removido' }] };
  const { aplicadas, descartadas } = importar(salvo);
  assert.deepEqual(aplicadas, ['arsenal.read']);
  assert.deepEqual(descartadas, ['modulo.removido']);
});

test('o estado exportado guarda ids exatos, não o curinga usado', () => {
  /* Se guardasse "arsenal.*", uma permissão `arsenal.delete` criada amanhã
   * apareceria concedida no próximo boot sem ninguém ter autorizado. */
  conceder('arsenal.*');
  const ids = exportar().concedidas.map((c) => c.id);
  assert.ok(!ids.some((id) => id.includes('*')));
});

/* ===== introspecção ===== */

test('estado() reporta declaradas, concedidas e contagem por risco', () => {
  conceder('arsenal.read');
  const e = estado();
  assert.equal(e.declaradas.length, BASE.length);
  assert.deepEqual(e.concedidas, ['arsenal.read']);
  assert.equal(e.porRisco.restrito, 1);
  assert.equal(e.porRisco.leitura, 3);
  assert.equal(e.declaradas.find((p) => p.id === 'arsenal.read').concedida, true);
});
