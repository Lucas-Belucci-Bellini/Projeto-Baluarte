/**
 * Decisor de permissões.
 *
 * O que estes testes protegem é **uma frase da arquitetura que estava sem
 * implementação**: *"declarar não é receber"*. Enquanto `pode()` respondia com
 * `manifesto.permissions.includes(p)`, a frase era falsa e ninguém sabia — os
 * testes do contexto estavam verdes cobrando o defeito.
 *
 * Por isso o primeiro teste aqui é o mais importante, e por isso todos os
 * mutantes desta rodada foram plantados antes de o arquivo ser commitado.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarPermissoes, ErroPolitica, TETO_AUDITORIA } from '../../v2/core/permissoes.js';

/** @param {Record<string, string[]>} tetos */
function decisor(tetos, opcoes = {}) {
  const p = criarPermissoes(opcoes);
  p.conhecerModulos(Object.entries(tetos).map(([id, permissions]) => ({ id, permissions })));
  return p;
}

/* ═══════════ deny-by-default ═══════════ */

test('DECLARAR NÃO É RECEBER — sem política, nada é concedido', () => {
  const p = decisor({ militar: ['NETWORK'] });
  assert.equal(p.pode('militar', 'NETWORK'), false);
  assert.equal(p.avaliar('militar', 'NETWORK'), 'negada');
});

test('módulo desconhecido responde false, não explode', () => {
  /* `pode()` é a forma de perguntar quando "não" é caminho normal — esconder um
   * botão não pode depender de try/catch. */
  const p = criarPermissoes();
  assert.equal(p.pode('fantasma', 'NETWORK'), false);
  assert.equal(p.avaliar('fantasma', 'NETWORK'), 'nao-declarada');
});

test('os três vereditos são distinguíveis', () => {
  const p = decisor({ militar: ['NETWORK'] });
  assert.equal(p.avaliar('militar', 'VOAR'), 'desconhecida');      // typo de quem chama
  assert.equal(p.avaliar('militar', 'DATABASE'), 'nao-declarada'); // bug do módulo
  assert.equal(p.avaliar('militar', 'NETWORK'), 'negada');         // legítimo
  p.conceder('militar', 'NETWORK', { origem: 'operador' });
  assert.equal(p.avaliar('militar', 'NETWORK'), 'ok');
});

/* ═══════════ concessão ⊆ declaração ═══════════ */

test('conceder ALÉM do declarado é recusado — e não concede pela metade', () => {
  /* Se a política pudesse conceder o que o manifesto não declara, o manifesto
   * deixaria de ser a verdade sobre o alcance do módulo. */
  const p = decisor({ militar: ['NETWORK'] });
  assert.throws(() => p.conceder('militar', 'EXECUTION'), ErroPolitica);
  assert.equal(p.pode('militar', 'EXECUTION'), false);
});

test('numa lista, o item recusado não deixa o anterior concedido pela metade… mas o que passou, passou', () => {
  /* Comportamento explícito em vez de suposto: `conceder` aplica em ordem e
   * levanta no item ruim. O que veio antes JÁ está concedido — e é por isso que
   * `aplicarPolitica` existe, para tratar isso em bloco com relatório. */
  const p = decisor({ militar: ['NETWORK', 'DATABASE'] });
  assert.throws(() => p.conceder('militar', ['NETWORK', 'EXECUTION']), ErroPolitica);
  assert.equal(p.pode('militar', 'NETWORK'), true, 'o item válido antes do erro sumiu');
  assert.equal(p.pode('militar', 'EXECUTION'), false);
});

test('permissão fora do vocabulário é recusada na concessão', () => {
  const p = decisor({ militar: ['NETWORK'] });
  assert.throws(() => p.conceder('militar', 'ROOT'), /desconhecida/);
});

test('conceder a módulo que o decisor não conhece é erro de configuração', () => {
  /* Não é "negar": é dizer que o Core foi montado fora de ordem. Negar em
   * silêncio aqui viraria "a política não pegou e ninguém sabe por quê". */
  const p = criarPermissoes();
  assert.throws(() => p.conceder('militar', 'NETWORK'), /não é conhecido/);
});

/* ═══════════ revogação ═══════════ */

test('revogar é sempre seguro: módulo desconhecido devolve lista vazia', () => {
  /* Um botão de pânico que valida pré-condições falha na hora do pânico. */
  const p = criarPermissoes();
  assert.deepEqual(p.revogar('fantasma'), []);
});

test('revogar sem argumento tira TUDO do módulo', () => {
  const p = decisor({ militar: ['NETWORK', 'DATABASE'] });
  p.conceder('militar', ['NETWORK', 'DATABASE'], { origem: 'politica' });
  assert.deepEqual(p.revogar('militar').sort(), ['DATABASE', 'NETWORK']);
  assert.equal(p.pode('militar', 'NETWORK'), false);
  assert.equal(p.pode('militar', 'DATABASE'), false);
});

test('revogar não afeta outro módulo', () => {
  const p = decisor({ a: ['NETWORK'], b: ['NETWORK'] });
  p.conceder('a', 'NETWORK', { origem: 'x' });
  p.conceder('b', 'NETWORK', { origem: 'x' });
  p.revogar('a');
  assert.equal(p.pode('b', 'NETWORK'), true, 'revogação vazou para o vizinho');
});

/* ═══════════ o teto manda ═══════════ */

test('reensinar um teto MAIS ESTREITO derruba a concessão que não cabe mais', () => {
  /* O caso real: numa versão nova, o módulo deixa de declarar NETWORK. Sem a
   * poda, ele continuaria com NETWORK — a concessão sobreviveria ao próprio
   * fundamento, e nada no sistema apontaria para isso. */
  const p = decisor({ militar: ['NETWORK', 'DATABASE'] });
  p.conceder('militar', ['NETWORK', 'DATABASE'], { origem: 'politica' });

  p.conhecerModulos([{ id: 'militar', permissions: ['DATABASE'] }]);

  assert.equal(p.pode('militar', 'NETWORK'), false, 'a concessão sobreviveu ao teto');
  assert.equal(p.pode('militar', 'DATABASE'), true, 'podou o que ainda cabia');
});

test('teto que ESTREITA e depois volta a abrir NÃO ressuscita a concessão', () => {
  /* Este teste existe porque o anterior sobreviveu ao mutante: apagar a poda de
   * `conhecerModulos` não o fazia cair. E não fazia porque `avaliar()` consulta
   * o teto ANTES da concessão — a checagem cobria a poda.
   *
   * As duas são defesa em profundidade, e defesa não testada sozinha é sorte
   * (Regra 1 dos testes). O que só a poda impede é isto: a concessão órfã fica
   * guardada, o teto reabre numa versão seguinte, e a permissão volta do morto
   * sem ninguém ter decidido nada no meio do caminho. */
  const p = decisor({ militar: ['NETWORK'] });
  p.conceder('militar', 'NETWORK', { origem: 'operador' });

  p.conhecerModulos([{ id: 'militar', permissions: [] }]);          // versão sem NETWORK
  p.conhecerModulos([{ id: 'militar', permissions: ['NETWORK'] }]); // e a seguinte com

  assert.equal(p.pode('militar', 'NETWORK'), false,
    'a concessão ressuscitou junto com o teto — ninguém concedeu de novo');
});

test('concessão órfã não sobrevive no ESTADO EXPORTADO', () => {
  /* A outra metade do que só a poda impede: sem ela, `exportar()` carrega um
   * par que não tem mais fundamento, e importar isso amanhã — num decisor com o
   * teto largo — reintroduz a permissão pela porta dos fundos. */
  const p = decisor({ militar: ['NETWORK', 'DATABASE'] });
  p.conceder('militar', ['NETWORK', 'DATABASE'], { origem: 'operador' });
  p.conhecerModulos([{ id: 'militar', permissions: ['DATABASE'] }]);

  const salvo = p.exportar();
  const guardadas = salvo.concedidas.flatMap((c) => c.permissoes);
  assert.deepEqual(guardadas, ['DATABASE'], 'o estado gravado carrega concessão sem teto');
});

test('reensinar o MESMO teto não mexe nas concessões', () => {
  /* É o caminho normal: o boot ensina o conjunto, e cada contexto reensina o
   * próprio módulo. Se isso podasse, a política morreria no primeiro `init`. */
  const p = decisor({ militar: ['NETWORK'] });
  p.conceder('militar', 'NETWORK', { origem: 'politica' });
  p.conhecerModulos([{ id: 'militar', permissions: ['NETWORK'] }]);
  assert.equal(p.pode('militar', 'NETWORK'), true);
});

/* ═══════════ política ═══════════ */

test('aplicarPolitica ACUMULA as recusas em vez de parar na primeira', () => {
  const p = decisor({ a: ['NETWORK'], b: ['DATABASE'], c: ['NETWORK'] });
  const r = p.aplicarPolitica({
    a: ['NETWORK'],
    b: ['EXECUTION'],    // não declarada
    c: ['NETWORK'],
    d: ['NETWORK']       // módulo inexistente
  });

  assert.equal(r.recusas.length, 2, 'parou na primeira recusa');
  assert.deepEqual(r.recusas.map((x) => x.modulo).sort(), ['b', 'd']);
  /* E o mais importante: os certos passaram assim mesmo. Uma política com um
   * item errado não pode impedir o Baluarte de subir com os outros certos. */
  assert.equal(p.pode('a', 'NETWORK'), true);
  assert.equal(p.pode('c', 'NETWORK'), true);
});

test('a recusa diz POR QUE, não só que falhou', () => {
  const p = decisor({ b: ['DATABASE'] });
  const r = p.aplicarPolitica({ b: ['EXECUTION'] });
  assert.match(r.recusas[0].motivo, /não declarou EXECUTION/);
});

test('política do construtor é usada quando aplicarPolitica é chamada sem argumento', () => {
  const p = criarPermissoes({ politica: { militar: ['NETWORK'] } });
  p.conhecerModulos([{ id: 'militar', permissions: ['NETWORK'] }]);
  p.aplicarPolitica();
  assert.equal(p.pode('militar', 'NETWORK'), true);
});

/* ═══════════ persistência ═══════════ */

test('importar DESCARTA o que não cabe mais no teto', () => {
  /* O estado gravado é uma lembrança, não uma autoridade. */
  const antes = decisor({ militar: ['NETWORK', 'DATABASE'] });
  antes.conceder('militar', ['NETWORK', 'DATABASE'], { origem: 'operador' });
  const salvo = antes.exportar();

  const depois = decisor({ militar: ['DATABASE'] });   // versão nova, teto menor
  const r = depois.importar(salvo);

  assert.deepEqual(r.aplicadas, ['militar:DATABASE']);
  assert.deepEqual(r.descartadas, ['militar:NETWORK']);
  assert.equal(depois.pode('militar', 'NETWORK'), false);
});

test('importar lixo não derruba nem concede', () => {
  const p = decisor({ militar: ['NETWORK'] });
  assert.doesNotThrow(() => p.importar(null));
  assert.doesNotThrow(() => p.importar({ concedidas: [{ modulo: 'x' }] }));
  assert.equal(p.pode('militar', 'NETWORK'), false);
});

/* ═══════════ rastro ═══════════ */

test('a trilha registra quem abriu a porta', () => {
  const p = decisor({ militar: ['NETWORK'] });
  p.conceder('militar', 'NETWORK', { origem: 'operador' });
  const ultima = p.ultimasDecisoes(1)[0];
  assert.equal(ultima.acao, 'conceder');
  assert.equal(ultima.origem, 'operador');
  assert.equal(ultima.modulo, 'militar');
});

test('a trilha tem TETO — processo longo não acumula sem limite', () => {
  /* §6 dos padrões. Sem isto, um módulo em laço de negação come a memória e o
   * sintoma aparece longe da causa. */
  const p = decisor({ militar: ['NETWORK'] });
  for (let i = 0; i < TETO_AUDITORIA + 50; i++) p.anotar('militar', 'NETWORK', 'negada');
  assert.equal(p.ultimasDecisoes(TETO_AUDITORIA + 100).length, TETO_AUDITORIA);
});

/* ═══════════ o bus ═══════════ */

test('anuncia concessão e negativa a quem escuta', () => {
  const eventos = [];
  const p = decisor({ militar: ['NETWORK'] }, { bus: { emit: (ev, pl) => eventos.push({ ev, pl }) } });

  p.conceder('militar', 'NETWORK', { origem: 'operador' });
  p.anotar('militar', 'DATABASE', 'nao-declarada');

  assert.deepEqual(eventos.map((e) => e.ev), ['permissoes:concedida', 'permissoes:negada']);
});

test('bus que quebra NÃO impede a decisão', () => {
  /* Quem escuta uma negativa não pode ter o poder de impedir a negativa de
   * acontecer. Mesma regra do destino de log. */
  const p = decisor({ militar: ['NETWORK'] }, { bus: { emit: () => { throw new Error('caiu'); } } });
  assert.doesNotThrow(() => p.conceder('militar', 'NETWORK', { origem: 'x' }));
  assert.equal(p.pode('militar', 'NETWORK'), true);
});

/* ═══════════ sem estado global ═══════════ */

test('dois decisores são independentes', () => {
  /* A V1 guarda concessões no escopo do módulo; dois testes em paralelo
   * compartilham estado. Aqui não — Regra 8. */
  const a = decisor({ m: ['NETWORK'] });
  const b = decisor({ m: ['NETWORK'] });
  a.conceder('m', 'NETWORK', { origem: 'x' });
  assert.equal(b.pode('m', 'NETWORK'), false, 'a concessão vazou entre decisores');
});

/* ═══════════ retrato ═══════════ */

test('o retrato mostra o DELTA — declarado, concedido e pendente', () => {
  /* Mostrar só o declarado é como deny-by-default vira slogan: a tela ficaria
   * igual antes e depois de conceder. */
  const p = decisor({ militar: ['NETWORK', 'DATABASE'] });
  p.conceder('militar', 'NETWORK', { origem: 'politica' });

  const [r] = p.retrato();
  assert.deepEqual(r, {
    modulo: 'militar',
    declaradas: ['NETWORK', 'DATABASE'],
    concedidas: ['NETWORK'],
    pendentes: ['DATABASE']
  });
});
