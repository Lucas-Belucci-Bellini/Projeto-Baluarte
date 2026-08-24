/**
 * A cadeia de um evento — `origem` responde "quem", isto responde "de quê".
 *
 * Fase 03 da matriz de execução pedia "health, correlation, retry and cancel".
 * O cancelamento já existia no escalonador (`v2/core/trabalho.ts`); a correlação
 * não existia em lado nenhum — `grep correlac` no repositório inteiro só
 * encontrava o DSP do radar.
 *
 * O que ela resolve: num sistema em que um clique vira `rota:mudou`, que dispara
 * `modulo:carregar`, que dispara `runtime:pedido`, que falha — a pergunta da
 * investigação não é "quem emitiu o erro" (o runtime, obviamente), é **"o que
 * começou isto?"**. Sem um fio ligando os quatro, a resposta sai de adivinhar
 * por timestamp, que é justamente o que para de funcionar com concorrência.
 *
 * Três identidades, não uma: `id` (este evento), `correlacao` (a cadeia) e
 * `causa` (o `id` do anterior). A `causa` é o que torna a cadeia uma ÁRVORE:
 * com `correlacao` sozinha sabe-se que os eventos são parentes, com `causa`
 * sabe-se quem gerou quem.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { criarBus, derivar } from '../../v2/core/bus.js';

test('todo envelope nasce com as três identidades', () => {
  const bus = criarBus();
  const e = bus.emit('a');
  assert.equal(typeof e.id, 'string');
  assert.ok(e.id.length > 0);
  assert.equal(typeof e.correlacao, 'string');
  assert.ok(e.correlacao.length > 0);
  /* Raiz de cadeia: não foi causada por evento nenhum. `null` e não `undefined`
   * — quem serializa o envelope precisa ver o campo existir. */
  assert.equal(e.causa, null);
});

test('os ids não se repetem', () => {
  const bus = criarBus();
  const ids = new Set();
  for (let i = 0; i < 500; i += 1) ids.add(bus.emit('a').id);
  assert.equal(ids.size, 500, 'houve colisão de id');
});

test('emitir de dentro de um handler herda a cadeia e aponta a causa', () => {
  const bus = criarBus();
  let filho = null;
  bus.on('pai', () => { filho = bus.emit('filho'); });
  const pai = bus.emit('pai');

  assert.equal(filho.correlacao, pai.correlacao, 'a cadeia partiu-se');
  assert.equal(filho.causa, pai.id, 'a causa não aponta para quem gerou');
  assert.notEqual(filho.id, pai.id);
});

test('uma cadeia funda continua sendo uma só, e vira árvore', () => {
  const bus = criarBus();
  const vistos = [];
  bus.on('*', (_p, e) => vistos.push(e));
  bus.on('a', () => bus.emit('b'));
  bus.on('b', () => bus.emit('c'));
  bus.on('c', () => bus.emit('d'));
  bus.emit('a');

  assert.deepEqual(vistos.map((e) => e.evento), ['a', 'b', 'c', 'd']);
  assert.equal(new Set(vistos.map((e) => e.correlacao)).size, 1, 'mais de uma cadeia');
  /* A árvore: cada um aponta para o anterior, e só a raiz não aponta. */
  assert.equal(vistos[0].causa, null);
  for (let i = 1; i < vistos.length; i += 1) {
    assert.equal(vistos[i].causa, vistos[i - 1].id, `elo ${i} partido`);
  }
});

test('handlers irmãos apontam todos para o pai, não uns para os outros', () => {
  /* Se o escopo fosse atualizado por handler em vez de por evento, o segundo
   * irmão passaria a ter o primeiro como causa — inventando uma relação que não
   * existe. Irmãos são irmãos. */
  const bus = criarBus();
  const filhos = [];
  bus.on('pai', () => filhos.push(bus.emit('x')));
  bus.on('pai', () => filhos.push(bus.emit('y')));
  const pai = bus.emit('pai');

  assert.equal(filhos.length, 2);
  for (const f of filhos) assert.equal(f.causa, pai.id);
});

test('acabado o despacho, o próximo emit começa cadeia nova', () => {
  /* O bug que este teste existe para impedir: um escopo não restaurado faria
   * TODOS os eventos seguintes da sessão caírem na mesma cadeia — e um rastreio
   * que diz "tudo está correlacionado" não diz nada. */
  const bus = criarBus();
  bus.on('a', () => bus.emit('b'));
  const primeira = bus.emit('a');
  const depois = bus.emit('solto');
  assert.notEqual(depois.correlacao, primeira.correlacao);
  assert.equal(depois.causa, null);
});

test('handler que levanta não deixa o bus preso na cadeia', () => {
  const bus = criarBus();
  bus.on('a', () => { throw new Error('handler ruim'); });
  const a = bus.emit('a');
  const depois = bus.emit('b');
  assert.notEqual(depois.correlacao, a.correlacao, 'o escopo vazou pelo erro');
  assert.equal(depois.causa, null);
});

test('o despacho aninhado devolve o escopo ao pai, não ao vazio', () => {
  /* A → handler1 emite B (com os handlers de B a correr) → handler2 de A emite
   * C. O C tem de continuar filho de A: limpar o escopo no fim de B deixaria
   * o C órfão, com cadeia nova, no meio da investigação. */
  const bus = criarBus();
  let c = null;
  bus.on('b', () => {});
  bus.on('a', () => bus.emit('b'));
  bus.on('a', () => { c = bus.emit('c'); });
  const a = bus.emit('a');

  assert.equal(c.correlacao, a.correlacao);
  assert.equal(c.causa, a.id);
});

test('a correlação explícita ganha da herdada', () => {
  /* É o único caminho de quem cruza fronteira assíncrona ou de processo. Se a
   * herança ganhasse, `derivar()` não funcionaria dentro de um handler. */
  const bus = criarBus();
  let filho = null;
  bus.on('pai', () => { filho = bus.emit('filho', null, { correlacao: 'CADEIA-DE-FORA' }); });
  bus.emit('pai');
  assert.equal(filho.correlacao, 'CADEIA-DE-FORA');
});

test('derivar() continua a cadeia depois de um await', async () => {
  const bus = criarBus();
  const capturados = [];
  bus.on('tarde', (_p, e) => capturados.push(e));

  let doHandler = null;
  bus.on('inicio', (_p, e) => { doHandler = e; });
  const inicio = bus.emit('inicio');

  await Promise.resolve();
  /* Fora do despacho: sem `derivar`, isto nasceria com cadeia nova. */
  const semAjuda = bus.emit('tarde');
  const comAjuda = bus.emit('tarde', null, derivar(doHandler));

  assert.notEqual(semAjuda.correlacao, inicio.correlacao, 'o limite documentado mudou');
  assert.equal(comAjuda.correlacao, inicio.correlacao);
  assert.equal(comAjuda.causa, inicio.id);
  assert.equal(capturados.length, 2);
});

test('derivar() de lixo devolve meta vazio em vez de estourar', () => {
  /* Chamado com o envelope errado — ou com `undefined` de um handler que ainda
   * não correu — não pode derrubar quem emite. */
  for (const lixo of [null, undefined, 'texto', 42, {}, { correlacao: '' }]) {
    assert.deepEqual(derivar(lixo), {});
  }
});

test('o log de handler que levanta leva a cadeia junto', () => {
  /* Sem a correlação na linha de erro, o log diz que algo falhou e não deixa
   * ligar essa falha ao que a causou — que é o motivo inteiro desta mudança. */
  const registos = [];
  const bus = criarBus({ log: { erro: (_m, _e, ctx) => registos.push(ctx) } });
  bus.on('a', () => { throw new Error('x'); });
  const a = bus.emit('a', null, { origem: 'modulo-teste' });

  assert.equal(registos.length, 1);
  assert.equal(registos[0].evento, 'a');
  assert.equal(registos[0].origem, 'modulo-teste');
  assert.equal(registos[0].correlacao, a.correlacao);
});

test('a correlação não muda nada do que o bus já garantia', () => {
  const bus = criarBus();
  /* Curinga continua sendo inscrição, não evento. */
  assert.throws(() => bus.emit('*'), /padrão de inscrição/);
  assert.throws(() => bus.emit('arsenal:*'), /padrão de inscrição/);
  /* Origem ausente continua "desconhecida", não vazio. */
  assert.equal(bus.emit('a').origem, 'desconhecida');
  /* E o envelope continua a chegar ao handler como segundo argumento. */
  let recebido = null;
  bus.on('b', (payload, envelope) => { recebido = { payload, envelope }; });
  const b = bus.emit('b', { n: 1 });
  assert.deepEqual(recebido.payload, { n: 1 });
  assert.equal(recebido.envelope.id, b.id);
});
