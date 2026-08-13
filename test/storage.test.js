/**
 * Testes do storage: versionamento de esquema e classificação de dado (#420).
 *
 * O modo de falha que estes testes existem pra pegar é chato justamente porque
 * é invisível em desenvolvimento: a máquina de quem programa tem o dado NOVO,
 * gravado pelo código de hoje. Quem tem dado velho é o operador que usa o
 * Baluarte há meses — e o sintoma dele é uma tela em branco que ninguém
 * reproduz.
 *
 * Em Node não há `window`, então `storage.js` cai no Map em memória. É o mesmo
 * caminho de código do modo privado do navegador, e é o que permite testar
 * persistência sem navegador.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  get, set, remove, clearAll,
  registrarEsquema, esquemaDe, versaoGravada, estadoEsquemas, CLASSES
} from '../src/core/storage.js';

/* Os esquemas registrados vivem no módulo e não têm reset — cada teste usa a
 * SUA chave, então nenhum herda registro do anterior. */
beforeEach(() => clearAll());

/* ===== comportamento clássico: chave sem esquema ===== */

test('sem esquema, grava e lê exatamente como antes', () => {
  set('t1.simples', { a: 1, b: [2, 3] });
  assert.deepEqual(get('t1.simples'), { a: 1, b: [2, 3] });
});

test('chave ausente devolve o fallback', () => {
  assert.equal(get('t2.nao-existe', 'padrao'), 'padrao');
  assert.equal(get('t2.nao-existe'), null);
});

test('remove apaga', () => {
  set('t3.x', 1);
  remove('t3.x');
  assert.equal(get('t3.x'), null);
});

test('sem esquema, o valor gravado é o valor cru — sem envelope', () => {
  set('t4.cru', { v: 1 });
  assert.equal(versaoGravada('t4.cru'), 0, 'valor sem envelope conta como legado (0)');
});

/* ===== versionamento ===== */

test('com esquema, o valor gravado carrega a versão', () => {
  registrarEsquema('t5.cfg', { versao: 3 });
  set('t5.cfg', { modo: 'local' });
  assert.equal(versaoGravada('t5.cfg'), 3);
  assert.deepEqual(get('t5.cfg'), { modo: 'local' }, 'o envelope não pode vazar pra quem lê');
});

test('dado LEGADO (gravado antes do esquema existir) é migrado a partir da versão 0', () => {
  /* Grava como o Baluarte de ontem gravava: sem esquema, valor cru. */
  set('t6.jarvis', { modo: 'local' });

  /* Amanhã o formato muda e alguém registra o esquema. */
  registrarEsquema('t6.jarvis', {
    versao: 2,
    migrar(dados, de) {
      assert.equal(de, 0, 'legado tem que chegar como versão 0');
      return { ...dados, provider: 'local', migradoDe: de };
    }
  });

  assert.deepEqual(get('t6.jarvis'), { modo: 'local', provider: 'local', migradoDe: 0 });
});

test('a migração roda uma vez e o resultado fica gravado', () => {
  set('t7.k', { n: 1 });
  let vezes = 0;
  registrarEsquema('t7.k', {
    versao: 2,
    migrar(dados) { vezes++; return { n: dados.n + 1 }; }
  });

  assert.deepEqual(get('t7.k'), { n: 2 });
  assert.deepEqual(get('t7.k'), { n: 2 });
  assert.equal(vezes, 1, 'migrar não pode rodar a cada leitura');
  assert.equal(versaoGravada('t7.k'), 2);
});

test('migração recebe de/para e pode escalonar versões', () => {
  set('t8.k', { fase: 1 });
  registrarEsquema('t8.k', {
    versao: 3,
    migrar(dados, de, para) {
      let d = dados;
      for (let v = de; v < para; v++) d = { fase: d.fase + 1 };
      return d;
    }
  });
  assert.deepEqual(get('t8.k'), { fase: 4 });   // 0→1→2→3
});

test('dado de uma versão MAIS NOVA é preservado, não adivinhado', () => {
  /* Acontece de verdade: o operador usa o app atualizado e depois abre uma aba
   * com o bundle antigo em cache. Tentar "desmigrar" destrói o dado bom. */
  registrarEsquema('t9.k', { versao: 5 });
  set('t9.k', { novo: true });

  registrarEsquema('t9.k', { versao: 2, migrar: () => ({ errado: true }) });

  assert.deepEqual(get('t9.k', 'fallback'), 'fallback', 'deve recuar pro fallback');
  assert.equal(versaoGravada('t9.k'), 5, 'e o dado gravado tem que continuar intacto');
});

test('versão velha sem migrar() cai no fallback em vez de devolver formato errado', () => {
  set('t10.k', { formatoAntigo: true });
  registrarEsquema('t10.k', { versao: 2 });   // sem migrar
  assert.deepEqual(get('t10.k', { vazio: true }), { vazio: true });
});

test('JSON corrompido no storage não derruba a leitura', () => {
  set('t11.k', { ok: 1 });
  /* Simula corrupção externa reaproveitando a mesma porta que o wrapper usa. */
  assert.deepEqual(get('t11.k'), { ok: 1 });
  remove('t11.k');
  assert.equal(get('t11.k', 'fb'), 'fb');
});

/* ===== classificação de dado ===== */

test('classe "secreto" é recusada na gravação — o frontend é público', () => {
  registrarEsquema('t12.token', { versao: 1, classe: 'secreto' });
  assert.throws(() => set('t12.token', 'sk-abc123'), /secreto/);
  assert.equal(get('t12.token'), null, 'nada pode ter sido gravado');
});

test('as outras classes gravam normalmente', () => {
  for (const classe of CLASSES.filter((c) => c !== 'secreto')) {
    const k = `t13.${classe}`;
    registrarEsquema(k, { versao: 1, classe });
    assert.equal(set(k, 'x'), true);
    assert.equal(get(k), 'x');
  }
});

test('classe inválida é recusada no registro', () => {
  assert.throws(() => registrarEsquema('t14.k', { versao: 1, classe: 'ultrassecreto' }), /inválida/);
});

test('sem classe declarada, assume "local"', () => {
  registrarEsquema('t15.k', { versao: 1 });
  assert.equal(esquemaDe('t15.k').classe, 'local');
});

/* ===== validação do registro ===== */

test('versão precisa ser inteiro >= 1', () => {
  assert.throws(() => registrarEsquema('t16.k', { versao: 0 }), /inteiro/);
  assert.throws(() => registrarEsquema('t16.k', { versao: 1.5 }), /inteiro/);
  assert.throws(() => registrarEsquema('t16.k', {}), /inteiro/);
});

/* ===== introspecção ===== */

test('estadoEsquemas mostra versão esperada vs. gravada', () => {
  registrarEsquema('t17.k', { versao: 2, classe: 'sensivel', migrar: (d) => d });
  set('t17.k', { a: 1 });

  const linha = estadoEsquemas().find((e) => e.chave === 't17.k');
  assert.equal(linha.versao, 2);
  assert.equal(linha.gravada, 2);
  assert.equal(linha.classe, 'sensivel');
  assert.equal(linha.temMigracao, true);
});

test('versaoGravada devolve null quando a chave não existe', () => {
  assert.equal(versaoGravada('t18.nunca-gravada'), null);
});
