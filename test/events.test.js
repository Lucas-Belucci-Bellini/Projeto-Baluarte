/**
 * Testes do event bus, com foco no curinga (issue #420, item 🟠 4).
 *
 * O curinga existe pra que histórico, telemetria, diagnóstico e o contexto do
 * JARVIS vejam tudo sem manter uma lista de eventos. Isso só se sustenta se:
 *
 *   - o ouvinte de '*' souber QUAL evento chegou (senão o histórico é inútil);
 *   - um ouvinte global quebrado não derrubar a navegação;
 *   - cancelar inscrição funcionar igual pra curinga e pra evento exato.
 *
 * Cada teste usa um bus próprio (`createBus`) — o singleton é global e um teste
 * não pode herdar ouvinte do outro.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createBus } from '../src/core/events.js';

/* ===== comportamento clássico (não pode ter regredido) ===== */

test('on/emit/off continuam valendo pra evento exato', () => {
  const bus = createBus();
  const vistos = [];
  const h = (p) => vistos.push(p);

  bus.on('route:change', h);
  bus.emit('route:change', { path: '/home' });
  bus.off('route:change', h);
  bus.emit('route:change', { path: '/sobre' });

  assert.deepEqual(vistos, [{ path: '/home' }]);
});

test('on devolve uma função que cancela a inscrição', () => {
  const bus = createBus();
  let n = 0;
  const cancelar = bus.on('x', () => n++);
  bus.emit('x');
  cancelar();
  bus.emit('x');
  assert.equal(n, 1);
});

test('once dispara uma vez só', () => {
  const bus = createBus();
  let n = 0;
  bus.once('x', () => n++);
  bus.emit('x');
  bus.emit('x');
  assert.equal(n, 1);
});

test('um handler que lança não impede os demais', () => {
  const bus = createBus();
  const vistos = [];
  bus.on('x', () => { throw new Error('boom'); });
  bus.on('x', () => vistos.push('sobrevivi'));
  bus.emit('x');
  assert.deepEqual(vistos, ['sobrevivi']);
});

/* ===== curinga global ===== */

test("'*' recebe todos os eventos", () => {
  const bus = createBus();
  const vistos = [];
  bus.on('*', (payload, meta) => vistos.push(meta.event));

  bus.emit('route:change', {});
  bus.emit('arsenal:item-selected', {});
  bus.emit('toast', {});

  assert.deepEqual(vistos, ['route:change', 'arsenal:item-selected', 'toast']);
});

test("'*' recebe o nome do evento no meta — sem isso o histórico é inútil", () => {
  const bus = createBus();
  let capturado = null;
  bus.on('*', (payload, meta) => { capturado = { meta, payload }; });
  bus.emit('arsenal:item-selected', { id: 'ah64d' });

  assert.equal(capturado.meta.event, 'arsenal:item-selected');
  assert.deepEqual(capturado.payload, { id: 'ah64d' });
});

test('ouvinte global quebrado não derruba o ouvinte exato', () => {
  /* O caso real: telemetria com bug não pode impedir a troca de rota. */
  const bus = createBus();
  const navegou = [];
  bus.on('*', () => { throw new Error('telemetria quebrada'); });
  bus.on('route:change', (p) => navegou.push(p.path));

  bus.emit('route:change', { path: '/arsenal' });
  assert.deepEqual(navegou, ['/arsenal']);
});

/* ===== curinga por prefixo ===== */

test("'ns:*' recebe só os eventos daquele namespace", () => {
  const bus = createBus();
  const vistos = [];
  bus.on('arsenal:*', (p, meta) => vistos.push(meta.event));

  bus.emit('arsenal:item-selected', {});
  bus.emit('arsenal:filtro', {});
  bus.emit('route:change', {});

  assert.deepEqual(vistos, ['arsenal:item-selected', 'arsenal:filtro']);
});

test('exato, prefixo e global recebem o mesmo evento', () => {
  const bus = createBus();
  const ordem = [];
  bus.on('arsenal:item-selected', () => ordem.push('exato'));
  bus.on('arsenal:*', () => ordem.push('prefixo'));
  bus.on('*', () => ordem.push('global'));

  bus.emit('arsenal:item-selected', {});
  assert.deepEqual(ordem, ['exato', 'prefixo', 'global']);
});

test('off cancela curinga do mesmo jeito que evento exato', () => {
  const bus = createBus();
  let n = 0;
  const h = () => n++;

  bus.on('arsenal:*', h);
  bus.emit('arsenal:x');
  bus.off('arsenal:*', h);
  bus.emit('arsenal:y');

  bus.on('*', h);
  bus.emit('qualquer');
  bus.off('*', h);
  bus.emit('outro');

  assert.equal(n, 2);
});

test('prefixo não casa evento de namespace parecido', () => {
  const bus = createBus();
  const vistos = [];
  bus.on('arsenal:*', (p, meta) => vistos.push(meta.event));
  bus.emit('arsenalzinho:x', {});
  assert.deepEqual(vistos, []);
});

/* ===== emitir padrão é bug de quem chamou ===== */

test('emitir "*" lança — é padrão de inscrição, não evento', () => {
  const bus = createBus();
  assert.throws(() => bus.emit('*', {}), /padrão de inscrição/);
});

test('emitir "ns:*" lança pelo mesmo motivo', () => {
  const bus = createBus();
  assert.throws(() => bus.emit('arsenal:*', {}), /padrão de inscrição/);
});

/* ===== reentrância e limpeza ===== */

test('um handler pode se desinscrever durante o emit', () => {
  const bus = createBus();
  const ordem = [];
  const a = () => { ordem.push('a'); bus.off('x', b); };
  const b = () => ordem.push('b');
  bus.on('x', a);
  bus.on('x', b);

  /* `b` ainda roda nesta rodada (a iteração é sobre uma cópia) e some na
   * próxima — o que importa é não corromper o loop no meio. */
  bus.emit('x');
  bus.emit('x');
  assert.deepEqual(ordem, ['a', 'b', 'a']);
});

test('contarOuvintes soma exatos, prefixos e globais', () => {
  const bus = createBus();
  bus.on('arsenal:item-selected', () => {});
  bus.on('arsenal:*', () => {});
  bus.on('*', () => {});
  bus.on('route:change', () => {});

  assert.equal(bus.contarOuvintes('arsenal:item-selected'), 3);
  assert.equal(bus.contarOuvintes('route:change'), 2);
  assert.equal(bus.contarOuvintes('nada:disso'), 1);
});

test('clear zera exatos, prefixos e globais', () => {
  const bus = createBus();
  let n = 0;
  bus.on('x', () => n++);
  bus.on('x:*', () => n++);
  bus.on('*', () => n++);
  bus.clear();
  bus.emit('x:y');
  assert.equal(n, 0);
});
