/**
 * Event Bus da V2.
 *
 * Metade destes testes existe porque a V1 já pagou por eles — curinga emitido,
 * handler que se desinscreve durante o `emit`, handler que levanta. São
 * regressões de um bus que funciona há tempo, e reescrever sem elas seria
 * reaprender na prática.
 *
 * A outra metade é o que a V1 não tem e a §7 exige: **origem** e **versão** no
 * envelope. Sem origem, "quem emitiu isto?" não tem resposta em runtime.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarBus } from '../../v2/core/bus.js';

/* ═══════════ o básico ═══════════ */

test('handler recebe payload e envelope', () => {
  const bus = criarBus();
  let visto;
  bus.on('editor:salvou', (payload, env) => { visto = { payload, env }; });
  bus.emit('editor:salvou', { arquivo: 'a.js' }, { origem: 'editor' });

  assert.deepEqual(visto.payload, { arquivo: 'a.js' });
  assert.equal(visto.env.evento, 'editor:salvou');
  assert.equal(visto.env.origem, 'editor');
});

test('o envelope tem o que a §7 exige', () => {
  const bus = criarBus();
  let env;
  bus.on('x:y', (_, e) => { env = e; });
  bus.emit('x:y', null, { origem: 'x', versao: 2, contexto: { req: 'abc' } });

  assert.equal(env.evento, 'x:y');
  assert.equal(env.origem, 'x');
  assert.equal(env.versao, 2);
  assert.match(env.em, /^\d{4}-\d{2}-\d{2}T/);
  assert.deepEqual(env.contexto, { req: 'abc' });
});

test('sem origem declarada, o campo diz "desconhecida" — não fica vazio', () => {
  /* Campo vazio faz quem lê achar que quebrou; "desconhecida" diz que ninguém
   * declarou, que é outra informação. */
  const bus = criarBus();
  let env;
  bus.on('x:y', (_, e) => { env = e; });
  bus.emit('x:y');
  assert.equal(env.origem, 'desconhecida');
  assert.equal(env.versao, 1, 'versão padrão devia ser 1');
});

/* ═══════════ curingas (herdado da V1) ═══════════ */

test('curinga de prefixo pega os do namespace', () => {
  const bus = criarBus();
  const vistos = [];
  bus.on('arsenal:*', (_, e) => vistos.push(e.evento));
  bus.emit('arsenal:abriu');
  bus.emit('arsenal:fechou');
  bus.emit('editor:salvou');
  assert.deepEqual(vistos, ['arsenal:abriu', 'arsenal:fechou']);
});

test('curinga total pega tudo', () => {
  const bus = criarBus();
  const vistos = [];
  bus.on('*', (_, e) => vistos.push(e.evento));
  bus.emit('a:x'); bus.emit('b:y');
  assert.deepEqual(vistos, ['a:x', 'b:y']);
});

test('EMITIR curinga é erro alto', () => {
  /* Faria os ouvintes de '*' receberem um evento que nunca aconteceu, com o
   * nome de um padrão — dado sujo no histórico. */
  const bus = criarBus();
  assert.throws(() => bus.emit('*'), /padrão de inscrição/);
  assert.throws(() => bus.emit('arsenal:*'), /padrão de inscrição/);
});

test('inscrição exata e curinga coexistem sem duplicar', () => {
  const bus = criarBus();
  let exato = 0, curinga = 0;
  bus.on('a:x', () => { exato += 1; });
  bus.on('a:*', () => { curinga += 1; });
  bus.emit('a:x');
  assert.equal(exato, 1);
  assert.equal(curinga, 1);
});

/* ═══════════ isolamento e ciclo de vida ═══════════ */

test('handler que levanta não impede os outros', () => {
  const erros = [];
  const bus = criarBus({ log: { erro: (msg, err, campos) => erros.push(campos), aviso: () => {} } });
  const ok = [];

  bus.on('x:y', () => { throw new Error('ruim'); });
  bus.on('x:y', () => ok.push('segundo'));
  bus.emit('x:y', null, { origem: 'teste' });

  assert.deepEqual(ok, ['segundo']);
  assert.equal(erros.length, 1, 'a falha do handler não foi registrada');
  assert.equal(erros[0].evento, 'x:y');
});

test('handler que se desinscreve DURANTE o emit não corrompe o laço', () => {
  /* A razão de iterar sobre cópias. Sem isso o segundo handler é pulado. */
  const bus = criarBus();
  const vistos = [];
  const off = bus.on('x:y', () => { vistos.push('primeiro'); off(); });
  bus.on('x:y', () => vistos.push('segundo'));

  bus.emit('x:y');
  assert.deepEqual(vistos, ['primeiro', 'segundo']);

  bus.emit('x:y');
  assert.deepEqual(vistos, ['primeiro', 'segundo', 'segundo'], 'o off() não teve efeito');
});

test('a baixa devolvida cancela — inclusive de função anônima', () => {
  /* Exigir `off(padrao, fn)` tornaria `on(x, () => {})` impossível de cancelar,
   * que é a origem clássica de vazamento de listener. */
  const bus = criarBus();
  let n = 0;
  const off = bus.on('x:y', () => { n += 1; });
  bus.emit('x:y');
  off();
  bus.emit('x:y');
  assert.equal(n, 1);
});

test('handler não-função é recusado na inscrição, não no emit', () => {
  /* Falhar no emit apontaria para o lugar errado — quem emitiu não errou. */
  const bus = criarBus();
  assert.throws(() => bus.on('x:y', 'nao-sou-funcao'), TypeError);
});

/* ═══════════ observabilidade ═══════════ */

test('contagem() diz quantas vezes cada evento passou', () => {
  const bus = criarBus();
  bus.emit('a:x'); bus.emit('a:x'); bus.emit('b:y');
  assert.deepEqual(bus.contagem(), { 'a:x': 2, 'b:y': 1 });
});

test('conta mesmo sem ninguém escutando — evento órfão é informação', () => {
  const bus = criarBus();
  bus.emit('ninguem:ouve');
  assert.deepEqual(bus.contagem(), { 'ninguem:ouve': 1 });
});

test('inscricoes() mostra quem está escutando agora', () => {
  const bus = criarBus();
  bus.on('a:*', () => {});
  bus.on('a:*', () => {});
  bus.on('b:x', () => {});
  assert.deepEqual(bus.inscricoes().sort((x, y) => x.padrao.localeCompare(y.padrao)),
    [{ padrao: 'a:*', ouvintes: 2 }, { padrao: 'b:x', ouvintes: 1 }]);
});

test('padrão sem ouvintes some da lista', () => {
  const bus = criarBus();
  const off = bus.on('a:x', () => {});
  off();
  assert.deepEqual(bus.inscricoes(), []);
});

/* ═══════════ integração com o contexto ═══════════ */

test('o contexto do módulo carimba a origem sozinho', async () => {
  /* É o fecho: o módulo não escolhe a origem, ele a tem. */
  const { criarContexto } = await import('../../v2/core/contexto.js');
  const { normalizar } = await import('../../v2/core/manifest.js');

  const bus = criarBus();
  let env;
  bus.on('cripto:cifrado', (_, e) => { env = e; });

  const ctx = criarContexto(
    normalizar({ id: 'cripto', name: 'C', version: '1.0.0',
      events: { emits: ['cripto:cifrado'], consumes: [] } }),
    { storage: { get: () => undefined, set: () => true }, bus }
  );
  ctx.bus.emit('cripto:cifrado', { n: 1 });

  assert.equal(env.origem, 'cripto', 'a origem não foi carimbada pelo contexto');
});
