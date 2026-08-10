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

/* ═══════════ permissões ═══════════ */

test('exigir() passa quando o manifesto declarou', () => {
  const ctx = criarContexto(manifesto({ permissions: ['NETWORK'] }), { storage: storageFalso() });
  assert.equal(ctx.exigir('NETWORK'), true);
  assert.equal(ctx.pode('NETWORK'), true);
});

test('exigir() LEVANTA quando não declarou — e o tipo é distinguível', () => {
  /* Tipo próprio para o chamador separar "não pode" de "quebrou": um é pedir
   * autorização, o outro é abrir bug. */
  const ctx = criarContexto(manifesto({ permissions: [] }), { storage: storageFalso() });
  assert.throws(() => ctx.exigir('NETWORK'), ErroPermissao);
  assert.equal(ctx.pode('NETWORK'), false);
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
  const ctx = criarContexto(
    manifesto({
      permissions: ['NETWORK'],
      storage: [{ key: 'cripto:p', version: 1, class: 'local' }],
      events: { emits: ['cripto:x'], consumes: [] }
    }),
    { storage: storageFalso() }
  );
  assert.deepEqual(ctx.declarado, {
    permissoes: ['NETWORK'], chaves: ['cripto:p'], emite: ['cripto:x']
  });
});
