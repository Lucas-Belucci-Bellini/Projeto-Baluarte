/**
 * Contexto do módulo + log estruturado.
 *
 * O que estes testes protegem: **a declaração do manifesto vale em runtime.**
 *
 * Sem isto, `permissions: []` e `storage: [...]` seriam comentários bonitos — um
 * módulo pediria qualquer coisa e ninguém notaria. O caso concreto que motivou:
 * o JARVIS da V1 escreve em `editor:state` porque nada o impede.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { criarContexto, ErroPermissao, ErroChave } from '../../v2/core/contexto.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';
import { criarLog, definirDestino, coletor, definirNivelMinimo } from '../../v2/core/log.js';
import { normalizar } from '../../v2/core/manifest.js';

/** Storage de mentira, para ver o que o contexto deixa passar. */
function storageFalso(inicial = {}) {
  const dados = { ...inicial };
  return {
    dados,
    get: (k) => dados[k],
    set: (k, v) => { dados[k] = v; return true; }
  };
}

function busFalso() {
  const emitidos = [];
  return {
    emitidos,
    emit: (ev, payload, meta) => emitidos.push({ ev, payload, meta }),
    on: () => () => {}
  };
}

const manifesto = (extra = {}) => normalizar({
  id: 'cripto', name: 'Cripto', version: '1.0.0', ...extra
});

let col;
beforeEach(() => {
  col = coletor();
  definirDestino(col.destino);
  definirNivelMinimo('debug');
});

/* ═══════════ permissões ═══════════
 *
 * ⚠️ Esta seção foi REESCRITA, e o motivo importa mais que os testes.
 *
 * A versão anterior afirmava «exigir() passa quando o manifesto declarou» — e
 * passava, porque `pode()` era `manifesto.permissions.includes(p)`. Os testes
 * estavam verdes e **cobravam o defeito**: declarar era receber, exatamente o
 * que a `V2_MODULE_RULES.md` diz que não pode acontecer.
 *
 * É o caso inverso da Regra 8 dos testes ("suposição do teste ≠ defeito do
 * código"): aqui o código estava errado e o teste, escrito olhando a
 * implementação, fixou o erro no lugar. Teste escrito a partir do código
 * confirma o código; só teste escrito a partir do CONTRATO confere o contrato. */

/** Decisor de verdade, já sabendo do módulo — é o que o boot monta. */
function decisorPara(m) {
  const p = criarPermissoes();
  p.conhecerModulos([m]);
  return p;
}

test('declarar NÃO é receber — o manifesto é o teto, não a concessão', () => {
  const m = manifesto({ permissions: ['NETWORK'] });
  const ctx = criarContexto(m, { storage: storageFalso(), permissoes: decisorPara(m) });

  assert.equal(ctx.pode('NETWORK'), false, 'ganhou por ter declarado');
  assert.throws(() => ctx.exigir('NETWORK'), ErroPermissao);
});

test('depois de concedida, passa', () => {
  const m = manifesto({ permissions: ['NETWORK'] });
  const permissoes = decisorPara(m);
  const ctx = criarContexto(m, { storage: storageFalso(), permissoes });

  permissoes.conceder('cripto', 'NETWORK', { origem: 'operador' });
  assert.equal(ctx.exigir('NETWORK'), true);
  assert.equal(ctx.pode('NETWORK'), true);
});

test('revogar alcança módulo que JÁ está no ar', () => {
  /* Se `pode()` fosse fotografia do init, revogar seria enfeite: o módulo
   * continuaria autorizado até reiniciar o Baluarte — e "reinicie para a
   * revogação valer" não é revogação. */
  const m = manifesto({ permissions: ['NETWORK'] });
  const permissoes = decisorPara(m);
  const ctx = criarContexto(m, { storage: storageFalso(), permissoes });

  permissoes.conceder('cripto', 'NETWORK', { origem: 'operador' });
  assert.equal(ctx.pode('NETWORK'), true);

  permissoes.revogar('cripto', 'NETWORK', { origem: 'operador' });
  assert.equal(ctx.pode('NETWORK'), false, 'a consulta ficou congelada no init');
});

test('os três "nãos" são distinguíveis — só um deles vale perguntar ao operador', () => {
  const m = manifesto({ permissions: ['NETWORK'] });
  const ctx = criarContexto(m, { storage: storageFalso(), permissoes: decisorPara(m) });

  /* declarada e não concedida → negativa LEGÍTIMA: cabe oferecer conceder */
  assert.equal(ctx.pode('NETWORK'), false);
  try { ctx.exigir('NETWORK'); } catch (e) { assert.equal(e.veredicto, 'negada'); }

  /* não declarada → defeito do módulo: não há o que oferecer */
  try { ctx.exigir('DATABASE'); } catch (e) { assert.equal(e.veredicto, 'nao-declarada'); }

  /* fora do vocabulário → typo de quem chamou */
  assert.throws(() => ctx.exigir('ROOT'), /desconhecida/);
});

test('contexto sem decisor: módulo que declara permissão NÃO monta', () => {
  /* As duas alternativas são piores. Negar tudo em silêncio quebra o módulo
   * longe da causa; liberar tudo devolve o buraco. Falhar aqui aponta o Core
   * mal montado no lugar onde ele foi mal montado. */
  assert.throws(
    () => criarContexto(manifesto({ permissions: ['NETWORK'] }), { storage: storageFalso() }),
    /sem decisor/
  );
});

test('módulo que NÃO declara nada dispensa decisor — e não ganha nada', () => {
  /* O caso do cripto de verdade: `permissions: []`. Exigir decisor aqui seria
   * burocracia sem ganho. */
  const ctx = criarContexto(manifesto({ permissions: [] }), { storage: storageFalso() });
  assert.equal(ctx.pode('NETWORK'), false);
  assert.throws(() => ctx.exigir('NETWORK'), ErroPermissao);
});

test('a negação é REGISTRADA antes de levantar', () => {
  /* Quem captura a exceção pode engoli-la; sem o registro, a tentativa de
   * acesso indevido sumiria sem rastro. */
  const ctx = criarContexto(manifesto({ permissions: [] }), { storage: storageFalso() });
  try { ctx.exigir('DATABASE'); } catch { /* esperado */ }

  const avisos = col.de('aviso');
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0].modulo, 'cripto');
  assert.equal(avisos[0].campos.permissao, 'DATABASE');
  assert.equal(avisos[0].campos.veredicto, 'nao-declarada');
});

test('permissão fora do vocabulário é erro de programação, não negação', () => {
  const ctx = criarContexto(manifesto({ permissions: [] }), { storage: storageFalso() });
  assert.throws(() => ctx.exigir('ROOT'), /desconhecida/);
});

/* ═══════════ storage recortado ═══════════ */

test('só enxerga as chaves que declarou', () => {
  const st = storageFalso({ 'cripto:prefs': { tema: 'x' }, 'apis:vault': ['chave-secreta'] });
  const ctx = criarContexto(
    manifesto({ storage: [{ key: 'cripto:prefs', version: 1, class: 'local' }] }),
    { storage: st }
  );

  assert.deepEqual(ctx.storage.get('cripto:prefs'), { tema: 'x' });
  assert.throws(() => ctx.storage.get('apis:vault'), ErroChave,
    'alcançou o cofre de API sem ter declarado');
});

test('ESCREVER em chave alheia é bloqueado — o caso do JARVIS na V1', () => {
  /* jarvis-tools.js:232 faz storage.set('editor:state', ...). Aqui não dá. */
  const st = storageFalso({ 'editor:state': { tabs: ['original'] } });
  const jarvis = criarContexto(
    normalizar({ id: 'jarvis', name: 'JARVIS', version: '1.0.0',
      storage: [{ key: 'jarvis:memoria', version: 1, class: 'local' }] }),
    { storage: st }
  );

  assert.throws(() => jarvis.storage.set('editor:state', { tabs: [] }), ErroChave);
  assert.deepEqual(st.dados['editor:state'], { tabs: ['original'] }, 'o estado do editor foi corrompido');
});

test('chaves() lista o que o módulo declarou, e nada além', () => {
  const ctx = criarContexto(
    manifesto({ storage: [{ key: 'cripto:a', version: 1, class: 'local' },
                          { key: 'cripto:b', version: 1, class: 'local' }] }),
    { storage: storageFalso({ 'outro:x': 1 }) }
  );
  assert.deepEqual(ctx.storage.chaves().sort(), ['cripto:a', 'cripto:b']);
});

/* ═══════════ barramento recortado ═══════════ */

test('emitir evento não declarado é erro alto', () => {
  /* Emitir em nome de outro corrompe o catálogo, que é o que permite descobrir
   * quem depende de quê (§7). */
  const bus = busFalso();
  const ctx = criarContexto(
    manifesto({ events: { emits: ['cripto:cifrado'], consumes: [] } }),
    { storage: storageFalso(), bus }
  );

  ctx.bus.emit('cripto:cifrado', { n: 1 });
  assert.equal(bus.emitidos.length, 1);
  assert.throws(() => ctx.bus.emit('editor:aba-aberta'), /não declarou emitir/);
});

test('o evento emitido carrega a ORIGEM — o que falta no bus da V1', () => {
  const bus = busFalso();
  const ctx = criarContexto(
    manifesto({ events: { emits: ['cripto:cifrado'], consumes: [] } }),
    { storage: storageFalso(), bus }
  );
  ctx.bus.emit('cripto:cifrado');
  assert.equal(bus.emitidos[0].meta.origem, 'cripto');
});

test('sem bus injetado, o contexto simplesmente não tem bus', () => {
  const ctx = criarContexto(manifesto(), { storage: storageFalso() });
  assert.equal('bus' in ctx, false, 'capacidade ausente não deve existir no objeto');
});

/* ═══════════ log ═══════════ */

test('o registro é objeto, não frase — com módulo e horário', () => {
  const log = criarLog('militar');
  log.info('buscou verbete', { verbete: 'Leopard 2', ms: 120 });

  const [r] = col.registros;
  assert.equal(r.modulo, 'militar');
  assert.equal(r.msg, 'buscou verbete');
  assert.equal(r.campos.verbete, 'Leopard 2');
  assert.match(r.em, /^\d{4}-\d{2}-\d{2}T/);
});

test('log.erro decompõe o erro em vez de interpolar', () => {
  /* `'falhou: ' + e` perde stack e tipo — as duas coisas que importam às 3h. */
  const log = criarLog('x');
  log.erro('falhou ao salvar', new TypeError('x is not a function'), { chave: 'a' });

  const [r] = col.de('erro');
  assert.equal(r.campos.erroTipo, 'TypeError');
  assert.equal(r.campos.erroMsg, 'x is not a function');
  assert.ok(r.campos.stack, 'perdeu o stack');
  assert.equal(r.campos.chave, 'a', 'perdeu os campos do chamador');
});

test('medir() registra a duração mesmo quando FALHA', () => {
  /* Operação lenta que falha é o caso que mais importa. */
  const log = criarLog('x');
  return log.medir('lento', async () => { throw new Error('boom'); })
    .then(() => assert.fail('devia propagar'))
    .catch((e) => {
      assert.equal(e.message, 'boom', 'engoliu o erro');
      const [r] = col.de('aviso');
      assert.equal(r.campos.ok, false);
      assert.equal(typeof r.campos.ms, 'number');
    });
});

test('nível mínimo filtra', () => {
  definirNivelMinimo('aviso');
  const log = criarLog('x');
  log.debug('some'); log.info('some'); log.aviso('fica'); log.erro('fica');
  assert.deepEqual(col.registros.map((r) => r.nivel), ['aviso', 'erro']);
});

test('destino que explode não derruba quem estava registrando', () => {
  /* A única exceção engolida do arquivo, e é deliberada: erro de log mascarar
   * o erro real seria pior. */
  definirDestino(() => { throw new Error('destino quebrado'); });
  const log = criarLog('x');
  assert.doesNotThrow(() => log.info('ainda funciona'));
});

/* ═══════════ o conjunto ═══════════ */

test('declarado{} espelha o manifesto — é o que o /diagnostico mostra', () => {
  const m = manifesto({
    permissions: ['NETWORK'],
    storage: [{ key: 'cripto:p', version: 1, class: 'local' }],
    events: { emits: ['cripto:x'], consumes: [] }
  });
  const permissoes = decisorPara(m);
  const ctx = criarContexto(m, { storage: storageFalso(), permissoes });

  const { concedidas, ...estaticos } = ctx.declarado;
  assert.deepEqual(estaticos, {
    permissoes: ['NETWORK'], chaves: ['cripto:p'], emite: ['cripto:x'], depende: []
  });

  /* `concedidas` é FUNÇÃO, e é a diferença entre "o que pediu" e "o que tem" —
   * mostrar só o primeiro no /diagnostico é como deny-by-default vira slogan. */
  assert.deepEqual(concedidas(), [], 'declarado veio concedido');
  permissoes.conceder('cripto', 'NETWORK', { origem: 'operador' });
  assert.deepEqual(concedidas(), ['NETWORK']);
});

/* ═══════════ a superfície completa ═══════════ */

test('o contexto entrega TODAS as capacidades injetadas — nada construído e não ligado', () => {
  /* Este teste existe por um erro concreto: o escalonador de trabalho foi
   * construído, testado e ficou INALCANÇÁVEL — o contexto não o expunha, então
   * nenhum módulo poderia usá-lo. Peça pronta e não ligada é pior que peça
   * ausente, porque parece feita.
   *
   * Enumerar a superfície aqui faz a próxima capacidade nova falhar este teste
   * até ser ligada de verdade. */
  const ctx = criarContexto(manifesto({ dependencies: [] }), {
    storage: storageFalso(),
    bus: busFalso(),
    apis: { usar: () => ({}) },
    metricas: { paraModulo: () => ({ contar: () => {}, medir: () => {}, cronometrar: (n, f) => f() }) },
    trabalho: { paraModulo: () => ({ fazer: (n, f) => f({}), INTERATIVO: 10, NORMAL: 100, FUNDO: 500 }) }
  });

  assert.deepEqual(
    Object.keys(ctx).sort(),
    ['bus', 'declarado', 'exigir', 'log', 'metricas', 'modulo', 'pode', 'storage', 'trabalho', 'usar'],
    'a superfície do contexto mudou — alguma capacidade foi construída e não ligada?'
  );
});

test('ctx.trabalho carimba o módulo e executa', async () => {
  const { criarEscalonador } = await import('../../v2/core/trabalho.js');
  const { criarMetricas } = await import('../../v2/core/metricas.js');
  const metricas = criarMetricas();
  const trabalho = criarEscalonador({}, { metricas });

  const ctx = criarContexto(manifesto(), { storage: storageFalso(), trabalho });
  assert.equal(await ctx.trabalho.fazer('busca', () => 'ok'), 'ok');
  assert.equal(metricas.retrato().contadores.trabalho_enfileirado['modulo=cripto'], 1);
});
