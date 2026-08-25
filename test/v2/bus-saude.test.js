/**
 * A saúde do bus — o que `contagem()` sozinha nunca contou.
 *
 * O defeito: `contagem()` sobe a cada `emit`, igual se os handlers todos
 * funcionaram e igual se todos levantaram. O handler que levanta era passado a
 * `deps.log?.erro?.()` e acabava ali — e `criarBus()` SEM deps, que é o padrão
 * e o que quase todo teste usa, perdia-o inteiro. Um bus cuja telemetria toda
 * está partida ficava indistinguível de um saudável.
 *
 * O que o veredito NÃO faz é tão importante quanto o que faz: handler que
 * levanta não degrada `readiness`, porque o isolamento é decisão de desenho
 * deste bus. Degradar por isso contradiria a mesma regra que `saude.js` já
 * segue para falha de módulo.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { criarBus } from '../../v2/core/bus.js';

test('sem log injetado, a falha do handler deixa de desaparecer', () => {
  /* O defeito inteiro numa linha: `criarBus()` é o construtor padrão. */
  const bus = criarBus();
  bus.on('a', () => { throw new Error('rebentou'); });
  bus.emit('a');

  const s = bus.saude();
  assert.equal(s.contagem.falhas, 1);
  assert.equal(s.ultimasFalhas.length, 1);
  assert.equal(s.ultimasFalhas[0].erro, 'rebentou');
});

test('a falha leva a cadeia junto — é o que a liga ao que a causou', () => {
  const bus = criarBus();
  bus.on('pai', () => bus.emit('filho'));
  bus.on('filho', () => { throw new Error('x'); });
  const pai = bus.emit('pai', null, { origem: 'modulo-teste' });

  const [f] = bus.saude().ultimasFalhas;
  assert.equal(f.evento, 'filho');
  assert.equal(f.correlacao, pai.correlacao, 'a falha ficou fora da cadeia');
  assert.equal(f.causa, pai.id);
  assert.equal(f.origem, 'desconhecida');
});

test('a falha guarda a MENSAGEM, não o Error', () => {
  /* Guardar o objeto num anel de 50 retém stack e closures vivas — o histórico
   * de diagnóstico viraria uma fuga de memória silenciosa. */
  const bus = criarBus();
  bus.on('a', () => { throw new Error('só o texto'); });
  bus.emit('a');
  const [f] = bus.saude().ultimasFalhas;
  assert.equal(typeof f.erro, 'string');
  assert.ok(!(f.erro instanceof Error));
});

test('handler que levanta algo que não é Error não quebra o registo', () => {
  const bus = criarBus();
  bus.on('a', () => { throw 'string crua'; });
  bus.on('b', () => { throw null; });
  bus.emit('a');
  bus.emit('b');
  const s = bus.saude();
  assert.equal(s.contagem.falhas, 2);
  assert.equal(s.ultimasFalhas[0].erro, 'string crua');
  assert.equal(s.ultimasFalhas[1].erro, 'null');
});

test('o histórico de falhas é limitado — senão é vazamento', () => {
  const bus = criarBus({ tetoFalhas: 3 });
  bus.on('a', () => { throw new Error('sempre'); });
  for (let i = 0; i < 20; i += 1) bus.emit('a');

  const s = bus.saude();
  assert.equal(s.ultimasFalhas.length, 3, 'o anel não segurou');
  /* E o que sobra é o RECENTE: o histórico que se quer ler não é o do início. */
  assert.equal(s.contagem.falhas, 20, 'o anel não pode truncar a contagem');
});

test('bus sem inscrito nenhum é unhealthy: o evento cai no vazio', () => {
  /* É o "evento órfão" que a matriz da Fase 03 nomeia, visto do runtime: o
   * `emit` sucede, o contador sobe, e ninguém recebe. */
  const bus = criarBus();
  const s = bus.saude();
  assert.equal(s.readiness, 'unhealthy');
  assert.match(s.motivos.join(' '), /nenhum inscrito/);
});

test('um inscrito basta para ficar healthy', () => {
  const bus = criarBus();
  bus.on('a', () => {});
  assert.equal(bus.saude().readiness, 'healthy');
});

test('desinscrever o último volta a unhealthy', () => {
  const bus = criarBus();
  const baixa = bus.on('a', () => {});
  assert.equal(bus.saude().readiness, 'healthy');
  baixa();
  assert.equal(bus.saude().readiness, 'unhealthy');
});

test('handler que levanta NÃO degrada o veredito', () => {
  /* O isolamento é decisão de desenho: um handler ruim não derruba os outros,
   * então um handler a levantar é o bus a funcionar como projetado. Se isto um
   * dia flipar o veredito, o contrato mudou e esta linha obriga a rever a
   * página em vez de deixar a documentação mentir. */
  const bus = criarBus();
  bus.on('a', () => { throw new Error('x'); });
  for (let i = 0; i < 100; i += 1) bus.emit('a');

  const s = bus.saude();
  assert.equal(s.readiness, 'healthy', 'falha de handler passou a degradar o veredito');
  assert.equal(s.contagem.falhas, 100);
  assert.ok(s.motivos.length > 0, 'mas tem de aparecer nos motivos');
});

test('o handler que nunca funcionou aparece nomeado', () => {
  /* O sinal acionável: falhas == emissões é um handler que nunca funcionou,
   * não um que oscila. */
  const bus = criarBus();
  bus.on('quebrado', () => { throw new Error('x'); });
  bus.on('bom', () => {});
  for (let i = 0; i < 5; i += 1) { bus.emit('quebrado'); bus.emit('bom'); }

  const s = bus.saude();
  const texto = s.motivos.join(' | ');
  assert.match(texto, /"quebrado".*5\/5/);
  assert.ok(!texto.includes('"bom"'), 'o evento saudável não devia ser acusado');
  assert.deepEqual(s.porEvento.quebrado, { emissoes: 5, falhas: 5 });
  assert.deepEqual(s.porEvento.bom, { emissoes: 5, falhas: 0 });
});

test('handler que falha só às vezes não é acusado de nunca funcionar', () => {
  const bus = criarBus();
  let n = 0;
  bus.on('as-vezes', () => { n += 1; if (n % 2 === 0) throw new Error('par'); });
  for (let i = 0; i < 10; i += 1) bus.emit('as-vezes');

  const s = bus.saude();
  assert.deepEqual(s.porEvento['as-vezes'], { emissoes: 10, falhas: 5 });
  assert.ok(!s.motivos.join(' ').includes('em toda emissão'));
});

test('as somas batem com o detalhe por evento', () => {
  const bus = criarBus();
  bus.on('a', () => { throw new Error('x'); });
  bus.on('b', () => {});
  bus.emit('a'); bus.emit('a'); bus.emit('b');

  const s = bus.saude();
  const somaEmissoes = Object.values(s.porEvento).reduce((t, e) => t + e.emissoes, 0);
  const somaFalhas = Object.values(s.porEvento).reduce((t, e) => t + e.falhas, 0);
  assert.equal(s.contagem.emissoes, somaEmissoes);
  assert.equal(s.contagem.falhas, somaFalhas);
});

test('o log continua a receber: a contagem não o substitui', () => {
  const registos = [];
  const bus = criarBus({ log: { erro: (_m, _e, ctx) => registos.push(ctx) } });
  bus.on('a', () => { throw new Error('x'); });
  bus.emit('a');
  assert.equal(registos.length, 1, 'contar a falha não pode calar o log');
  assert.equal(bus.saude().contagem.falhas, 1);
});

test('falha depois de limpar() no meio do despacho continua visível', () => {
  /* Parece rebuscado e não é: `alvos()` tira uma cópia dos handlers (decisão do
   * cabeçalho do bus), então um handler que chama `limpar()` NÃO impede os
   * seguintes de correr. Se um deles levanta, a falha entra num evento que já
   * não está no contador.
   *
   * Sem o ramo que trata isso, a falha ficaria contada em `contagem.falhas` e
   * invisível em `porEvento` — e as duas deixariam de reconciliar. */
  const bus = criarBus();
  bus.on('a', () => { bus.limpar(); });
  bus.on('a', () => { throw new Error('depois'); });
  bus.emit('a');

  const s = bus.saude();
  assert.deepEqual(s.porEvento.a, { emissoes: 0, falhas: 1 });
  const somaFalhas = Object.values(s.porEvento).reduce((tot, e) => tot + e.falhas, 0);
  assert.equal(s.contagem.falhas, somaFalhas, 'a falha sumiu do detalhe por evento');
});

test('limpar() zera também as falhas', () => {
  const bus = criarBus();
  bus.on('a', () => { throw new Error('x'); });
  bus.emit('a');
  bus.limpar();

  const s = bus.saude();
  assert.equal(s.contagem.falhas, 0);
  assert.equal(s.ultimasFalhas.length, 0);
  assert.deepEqual(s.porEvento, {});
});

test('o retrato é uma cópia: quem lê não corrompe o bus', () => {
  const bus = criarBus();
  bus.on('a', () => { throw new Error('x'); });
  bus.emit('a');

  const s = bus.saude();
  s.ultimasFalhas[0].erro = 'adulterado';
  s.ultimasFalhas.push({ evento: 'inventado' });
  assert.equal(bus.saude().ultimasFalhas[0].erro, 'x');
  assert.equal(bus.saude().ultimasFalhas.length, 1);
});

test('a saúde não mudou nada do que o bus já garantia', () => {
  const bus = criarBus();
  assert.throws(() => bus.emit('*'), /padrão de inscrição/);
  assert.equal(bus.emit('a').origem, 'desconhecida');
  let visto = null;
  bus.on('b', (p, e) => { visto = { p, e }; });
  const b = bus.emit('b', { n: 1 });
  assert.deepEqual(visto.p, { n: 1 });
  assert.equal(visto.e.id, b.id);
  /* E a superfície antiga continua lá, com o mesmo formato. */
  assert.deepEqual(bus.inscricoes(), [{ padrao: 'b', ouvintes: 1 }]);
  assert.equal(typeof bus.contagem().a, 'number');
});

test('saude() resume a latência de cada despacho sem guardar amostras', () => {
  const tempos = [0, 5, 10, 13, 20, 28];
  const bus = criarBus({ relogio: () => tempos.shift() });
  bus.on('a', () => {});

  bus.emit('a');
  bus.emit('a');
  bus.emit('a');

  assert.deepEqual(bus.saude().latencia, {
    n: 3,
    mediaMs: 5.33,
    minMs: 3,
    maxMs: 8
  });
});

test('latência é registrada mesmo quando um handler falha', () => {
  const tempos = [100, 107];
  const bus = criarBus({ relogio: () => tempos.shift() });
  bus.on('a', () => { throw new Error('falha observada'); });

  bus.emit('a');

  assert.equal(bus.saude().contagem.falhas, 1);
  assert.deepEqual(bus.saude().latencia, { n: 1, mediaMs: 7, minMs: 7, maxMs: 7 });
});

test('relógio inválido não derruba o despacho nem envenena o resumo', () => {
  const bus = criarBus({ relogio: () => NaN });
  let recebido = 0;
  bus.on('a', () => { recebido += 1; });

  bus.emit('a');

  assert.equal(recebido, 1);
  assert.deepEqual(bus.saude().latencia, { n: 0, mediaMs: 0, minMs: null, maxMs: null });
});

test('limpar() zera também o resumo de latência', () => {
  let agora = 0;
  const bus = criarBus({ relogio: () => agora++ });
  bus.on('a', () => {});
  bus.emit('a');
  bus.limpar();

  assert.deepEqual(bus.saude().latencia, { n: 0, mediaMs: 0, minMs: null, maxMs: null });
});

test('o resumo de latência não muda readiness nem concede autoridade', () => {
  const bus = criarBus({ relogio: () => 1 });
  assert.equal(bus.saude().readiness, 'unhealthy');
  assert.equal('authority' in bus.saude(), false);
});
