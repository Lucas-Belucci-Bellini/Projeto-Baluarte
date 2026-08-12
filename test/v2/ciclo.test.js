/**
 * Ciclo de vida — subida, descida e isolamento de falha.
 *
 * O que estes testes protegem, do mais grave ao menos:
 *
 * 1. **Descida em ordem inversa.** `ui` desmonta antes de `core`. Subir e descer
 *    na mesma ordem é o erro clássico, e ele só aparece no desligamento — que é
 *    quando ninguém está olhando.
 * 2. **`init` que trava não pendura o Baluarte.** Sem teto, os módulos seguintes
 *    nunca iniciam e não há erro nenhum: metade do sistema no ar, em silêncio.
 * 3. **Falha isolada.** Módulo que quebra ao iniciar desativa a si e a quem
 *    depende dele; o resto sobe.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarCiclo } from '../../v2/core/ciclo.js';
import { definirDestino, coletor } from '../../v2/core/log.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';

/* O decisor entra aqui porque `criarContexto` recusa montar um módulo que
 * declara permissão sem ter a quem perguntar. Sem política: nada concedido —
 * que é o padrão do sistema, não uma escolha do teste. */
const deps = {
  storage: { get: () => undefined, set: () => true },
  permissoes: criarPermissoes()
};

const mod = (id, lifecycle = {}, extra = {}) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  lifecycle, ...extra
});

function montar(...mods) {
  const r = criarRegistry();
  mods.forEach((m) => r.registrar(m));
  const selo = r.selar();
  return { registry: r, selo };
}

let col;
beforeEach(() => { col = coletor(); definirDestino(col.destino); });

/* ═══════════ subida ═══════════ */

test('init e start rodam, nessa ordem, e o módulo fica vivo', async () => {
  const passos = [];
  const { registry } = montar(mod('a', {
    init: () => passos.push('init'),
    start: () => passos.push('start')
  }));

  const ciclo = criarCiclo(registry, deps);
  const r = await ciclo.subir();

  assert.deepEqual(passos, ['init', 'start']);
  assert.equal(r.ok, true);
  assert.deepEqual(r.vivos, ['a']);
  assert.equal(ciclo.fase, 'no-ar');
});

test('módulo sem lifecycle sobe sem reclamar — todas as fases são opcionais', async () => {
  const { registry } = montar(mod('sem-nada'));
  const r = await criarCiclo(registry, deps).subir();
  assert.deepEqual(r.vivos, ['sem-nada']);
});

test('o contexto chega ao init já recortado pelo manifesto', async () => {
  let recebido;
  const { registry } = montar(mod('cripto',
    { init: (ctx) => { recebido = ctx; } },
    { permissions: ['NETWORK'], storage: [{ key: 'cripto:p', version: 1, class: 'local' }] }
  ));
  await criarCiclo(registry, deps).subir();

  assert.equal(recebido.modulo, 'cripto');
  /* Declarou NETWORK e NÃO recebeu: sem política, nada é concedido. A versão
   * anterior deste teste afirmava `true` aqui — cobrando o defeito de que
   * declarar era receber. */
  assert.equal(recebido.pode('NETWORK'), false);
  assert.equal(recebido.pode('DATABASE'), false);
  assert.deepEqual(recebido.declarado.permissoes, ['NETWORK'], 'o teto continua sendo o manifesto');
  assert.deepEqual(recebido.storage.chaves(), ['cripto:p']);
});

test('a ordem de subida respeita a dependência', async () => {
  const ordem = [];
  const { registry } = montar(
    mod('ui', { init: () => ordem.push('ui') }, { dependencies: ['core'] }),
    mod('core', { init: () => ordem.push('core') })
  );
  await criarCiclo(registry, deps).subir();
  assert.deepEqual(ordem, ['core', 'ui']);
});

/* ═══════════ isolamento na subida ═══════════ */

test('init que explode desativa o módulo e o resto sobe (§6)', async () => {
  const { registry } = montar(
    mod('bom', { init: () => {} }),
    mod('ruim', { init: () => { throw new Error('não deu'); } }),
    mod('outro', { init: () => {} })
  );
  const r = await criarCiclo(registry, deps).subir();

  assert.deepEqual(r.vivos.sort(), ['bom', 'outro']);
  assert.equal(r.falhas.length, 1);
  assert.equal(r.falhas[0].modulo, 'ruim');
  assert.match(r.falhas[0].motivo, /não deu/);
});

test('quem depende de um init falho também não sobe', async () => {
  const iniciou = [];
  const { registry } = montar(
    mod('base', { init: () => { throw new Error('caiu'); } }),
    mod('dependente', { init: () => iniciou.push('dependente') }, { dependencies: ['base'] }),
    mod('livre', { init: () => iniciou.push('livre') })
  );
  const r = await criarCiclo(registry, deps).subir();

  assert.deepEqual(iniciou, ['livre'], 'o dependente iniciou com a base morta');
  assert.deepEqual(r.vivos, ['livre']);
  assert.equal(r.falhas.length, 2);
  assert.match(r.falhas.find((f) => f.modulo === 'dependente').motivo, /dependência falhou/);
});

test('módulo que falha no start recebe dispose para limpar o que o init criou', async () => {
  /* Sem isto, cada falha vaza timer, listener ou conexão. */
  let limpou = false;
  const { registry } = montar(mod('meio-feito', {
    init: () => {},
    start: () => { throw new Error('start ruim'); },
    dispose: () => { limpou = true; }
  }));
  await criarCiclo(registry, deps).subir();
  assert.equal(limpou, true, 'o dispose não foi chamado — recurso vazado');
});

test('erro é registrado com o módulo, não só devolvido', async () => {
  const { registry } = montar(mod('ruim', { init: () => { throw new TypeError('x'); } }));
  await criarCiclo(registry, deps).subir();

  const [erro] = col.de('erro');
  assert.equal(erro.campos.modulo, 'ruim');
  assert.equal(erro.campos.erroTipo, 'TypeError');
});

/* ═══════════ teto de tempo ═══════════ */

test('init que nunca resolve vira falha ATRIBUÍDA, não trava', async () => {
  /* O modo de falha que mais dói: sem teto, os seguintes nunca iniciam e não há
   * erro nenhum — metade do sistema no ar, em silêncio. */
  const { registry } = montar(
    mod('pendura', { init: () => new Promise(() => {}) }),
    mod('depois', { init: () => {} })
  );
  const r = await criarCiclo(registry, deps, { tetoInitMs: 60 }).subir();

  assert.deepEqual(r.vivos, ['depois'], 'o módulo seguinte não subiu');
  assert.match(r.falhas[0].motivo, /não terminou em 60ms/);
});

test('init assíncrono normal passa sem ser cortado', async () => {
  const { registry } = montar(mod('lento', {
    init: () => new Promise((ok) => setTimeout(ok, 20))
  }));
  const r = await criarCiclo(registry, deps, { tetoInitMs: 500 }).subir();
  assert.deepEqual(r.vivos, ['lento']);
});

/* ═══════════ descida ═══════════ */

test('a descida é na ordem INVERSA da subida', async () => {
  /* `ui` desmonta antes de `core`, senão desmonta usando um core já morto. */
  const ordem = [];
  const { registry } = montar(
    mod('ui', { dispose: () => ordem.push('ui') }, { dependencies: ['core'] }),
    mod('core', { dispose: () => ordem.push('core') })
  );
  const ciclo = criarCiclo(registry, deps);
  await ciclo.subir();
  await ciclo.descer();

  assert.deepEqual(ordem, ['ui', 'core']);
});

test('stop roda antes de dispose', async () => {
  const passos = [];
  const { registry } = montar(mod('a', {
    stop: () => passos.push('stop'),
    dispose: () => passos.push('dispose')
  }));
  const ciclo = criarCiclo(registry, deps);
  await ciclo.subir();
  await ciclo.descer();
  assert.deepEqual(passos, ['stop', 'dispose']);
});

test('dispose que explode NÃO impede os outros de rodarem', async () => {
  /* Desligamento que aborta no meio deixa metade dos módulos vivos, e aí não há
   * como tentar de novo. */
  const limpos = [];
  const { registry } = montar(
    mod('a', { dispose: () => limpos.push('a') }),
    mod('b', { dispose: () => { throw new Error('dispose ruim'); } }),
    mod('c', { dispose: () => limpos.push('c') })
  );
  const ciclo = criarCiclo(registry, deps);
  await ciclo.subir();
  const r = await ciclo.descer();

  assert.deepEqual(limpos.sort(), ['a', 'c'], 'um dispose ruim impediu os outros');
  assert.equal(r.ok, false);
  assert.equal(r.problemas[0].modulo, 'b');
});

test('depois de descer, o ciclo volta a "parado" e pode subir de novo', async () => {
  let vezes = 0;
  const { registry } = montar(mod('a', { init: () => { vezes += 1; } }));
  const ciclo = criarCiclo(registry, deps);

  await ciclo.subir();
  await ciclo.descer();
  assert.equal(ciclo.fase, 'parado');
  assert.deepEqual(ciclo.vivos(), []);

  await ciclo.subir();
  assert.equal(vezes, 2);
});

test('subir duas vezes seguidas é erro, não subida dupla', async () => {
  const { registry } = montar(mod('a'));
  const ciclo = criarCiclo(registry, deps);
  await ciclo.subir();
  await assert.rejects(() => ciclo.subir(), /já está/);
});

test('descer sem ter subido é erro', async () => {
  const { registry } = montar(mod('a'));
  await assert.rejects(() => criarCiclo(registry, deps).descer(), /não no ar/);
});

/* ═══════════ com os módulos reais ═══════════ */

test('os três módulos reais sobem e descem sem falha', async () => {
  const [cripto, editor, militar] = await Promise.all([
    import('../../v2/modules/cripto/module.js'),
    import('../../v2/modules/editor/module.js'),
    import('../../v2/modules/militar/module.js')
  ]);
  const { registry } = montar(cripto.default, editor.default, militar.default);
  const ciclo = criarCiclo(registry, deps);

  const subida = await ciclo.subir();
  assert.equal(subida.ok, true, JSON.stringify(subida.falhas));
  assert.equal(subida.vivos.length, 3);

  const descida = await ciclo.descer();
  assert.equal(descida.ok, true);
});
