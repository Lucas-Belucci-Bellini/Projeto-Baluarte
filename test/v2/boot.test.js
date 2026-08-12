/**
 * O teste que a própria proposta definiu como critério de pronto.
 *
 * `V2_ARCHITECTURE.md` §8, escrito antes de existir código:
 *
 *   "Verificável por teste: criar um módulo de mentira, registrar, ver aparecer
 *    na navegação e nas rotas — SEM EDITAR NENHUM ARQUIVO DO CORE. Enquanto esse
 *    teste não passar, o Module System não está pronto."
 *
 * É o que separa o manifesto de ser fonte da verdade e ser documentação. Se
 * amanhã alguém acrescentar um `router.register()` avulso em algum lugar, este
 * arquivo não pega — mas o dia em que o Core parar de derivar do Registry, o
 * primeiro teste daqui cai.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarBoot } from '../../v2/core/boot.js';
import { definirDestino, coletor } from '../../v2/core/log.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';

/* FUNÇÃO, não constante: o decisor guarda estado (tetos, concessões, trilha), e
 * um único objeto compartilhado entre testes é o defeito de singleton que a V2
 * evita de propósito — o teste do módulo A veria a concessão do teste do B. */
const criarDeps = () => ({
  storage: { get: () => undefined, set: () => true },
  permissoes: criarPermissoes()
});

/** Router de mentira com a mesma superfície do da V1. */
function routerFalso() {
  const registradas = new Map();
  return {
    registradas,
    register: (path, view) => registradas.set(path, view)
  };
}

const mod = (id, extra = {}) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  ...extra
});

function montar(mods, adaptadores, opcoes) {
  const registry = criarRegistry();
  mods.forEach((m) => registry.registrar(m));
  registry.selar();
  return criarBoot(registry, criarDeps(), adaptadores, opcoes);
}

let col;
beforeEach(() => { col = coletor(); definirDestino(col.destino); });

/* ═══════════ o critério de pronto ═══════════ */

test('CRITÉRIO: um módulo novo aparece em rotas e navegação sem tocar no Core', async () => {
  const router = routerFalso();
  let navRecebida = null;

  /* Este objeto é a única coisa que o "autor do módulo" escreve. */
  const inventado = {
    id: 'radar', name: 'Radar Tático', version: '0.1.0',
    icon: '📡', stability: 'experimental',
    nav: { section: 'ferramentas', order: 5 },
    routes: [{ path: '/radar', view: () => Promise.resolve({}) }]
  };

  const boot = montar([inventado], { router, renderNav: (n) => { navRecebida = n; } });
  const r = await boot.subir();

  assert.equal(r.ok, true, JSON.stringify(r.falhas));
  assert.ok(router.registradas.has('/radar'), 'a rota não chegou ao router');
  assert.equal(navRecebida.length, 1);
  assert.deepEqual(
    { nome: navRecebida[0].nome, icone: navRecebida[0].icone, path: navRecebida[0].path },
    { nome: 'Radar Tático', icone: '📡', path: '/radar' }
  );
});

test('o nome vem de UMA fonte — rota e navegação não podem divergir', async () => {
  /* O defeito da V1 medido: 22 rotas com label diferente entre sidebar.js e
   * shell.js. Aqui só existe `name`, então divergir é impossível. */
  const router = routerFalso();
  let nav;
  const boot = montar(
    [mod('cripto', { name: 'Lab de Criptografia' })],
    { router, renderNav: (n) => { nav = n; } }
  );
  await boot.subir();

  assert.equal(nav[0].nome, 'Lab de Criptografia');
  assert.equal(nav[0].path, '/cripto');
  assert.ok(router.registradas.has(nav[0].path), 'o caminho da nav não é uma rota real');
});

/* ═══════════ módulo quebrado não vira rota ═══════════ */

test('módulo que falha no init NÃO ganha rota', async () => {
  /* Sem isto, o módulo quebrado continua navegável e falha no clique — longe da
   * causa, que é o pior lugar para um erro aparecer. */
  const router = routerFalso();
  const boot = montar([
    mod('bom'),
    mod('ruim', { lifecycle: { init: () => { throw new Error('caiu'); } } })
  ], { router });

  const r = await boot.subir();

  assert.ok(router.registradas.has('/bom'));
  assert.equal(router.registradas.has('/ruim'), false, 'rota de módulo morto foi registrada');
  assert.equal(r.rotas, 1);
  assert.equal(r.falhas.length, 1);
});

test('módulo morto também some da navegação', async () => {
  let nav;
  const boot = montar([
    mod('vivo'),
    mod('morto', { lifecycle: { init: () => { throw new Error('x'); } } })
  ], { router: routerFalso(), renderNav: (n) => { nav = n; } });

  await boot.subir();
  assert.deepEqual(nav.map((i) => i.modulo), ['vivo']);
});

test('a omissão da rota é registrada, não silenciosa', async () => {
  const boot = montar([mod('ruim', { lifecycle: { init: () => { throw new Error('x'); } } })],
    { router: routerFalso() });
  await boot.subir();

  const avisos = col.de('aviso').filter((r) => r.msg.includes('rota omitida'));
  assert.equal(avisos.length, 1);
  assert.equal(avisos[0].campos.rota, '/ruim');
});

/* ═══════════ ordem: módulos antes de rotas ═══════════ */

test('a rota só existe DEPOIS de o módulo estar no ar', async () => {
  /* Registrar antes do init abriria uma janela em que dá para navegar para um
   * módulo que ainda não iniciou. */
  const ordem = [];
  const router = {
    register: (p) => ordem.push(`registra ${p}`)
  };
  const boot = montar(
    [mod('a', { lifecycle: { init: () => ordem.push('init a') } })],
    { router }
  );
  await boot.subir();
  assert.deepEqual(ordem, ['init a', 'registra /a']);
});

/* ═══════════ vários módulos ═══════════ */

test('módulo com 15 rotas registra as 15', async () => {
  const router = routerFalso();
  const militar = (await import('../../v2/modules/militar/module.js')).default;
  const boot = montar([militar], { router });
  const r = await boot.subir();

  assert.equal(r.rotas, 15);
  assert.ok(router.registradas.has('/militar'));
  assert.ok(router.registradas.has('/arsenal'));
});

test('os três módulos reais bootam: 17 rotas, 3 entradas de navegação', async () => {
  const router = routerFalso();
  let nav;
  const [cripto, editor, militar] = await Promise.all([
    import('../../v2/modules/cripto/module.js'),
    import('../../v2/modules/editor/module.js'),
    import('../../v2/modules/militar/module.js')
  ]);

  const boot = montar([cripto.default, editor.default, militar.default],
    { router, renderNav: (n) => { nav = n; } });
  const r = await boot.subir();

  assert.equal(r.ok, true, JSON.stringify(r.falhas));
  assert.equal(router.registradas.size, 17);
  assert.equal(nav.length, 3);
});

/* ═══════════ diagnóstico ═══════════ */

test('diagnostico() mostra o que está no ar, derivado — sem procurar em canto nenhum', async () => {
  const boot = montar([
    mod('militar', { permissions: ['NETWORK'], storage: [{ key: 'militar:x', version: 1, class: 'local' }] })
  ], { router: routerFalso() });
  await boot.subir();

  const d = boot.diagnostico();
  assert.equal(d.fase, 'no-ar');
  assert.equal(d.modulos.length, 1);
  assert.deepEqual(d.modulos[0].permissoes, ['NETWORK']);
  assert.deepEqual(d.modulos[0].chaves, ['militar:x']);
  assert.deepEqual(d.modulos[0].rotas, ['/militar']);
});

test('diagnostico() lista as falhas e os eventos órfãos', async () => {
  const boot = montar([
    mod('ruim', { lifecycle: { init: () => { throw new Error('x'); } } }),
    mod('ouve', { events: { emits: [], consumes: ['ninguem:emite'] } })
  ], { router: routerFalso() });
  await boot.subir();

  const d = boot.diagnostico();
  assert.equal(d.falhas[0].modulo, 'ruim');
  assert.deepEqual(d.eventosOrfaos, [{ evento: 'ninguem:emite', escutadoPor: ['ouve'] }]);
});

/* ═══════════ descida ═══════════ */

test('descer desmonta tudo e o diagnóstico reflete', async () => {
  const limpos = [];
  const boot = montar([mod('a', { lifecycle: { dispose: () => limpos.push('a') } })],
    { router: routerFalso() });
  await boot.subir();
  await boot.descer();

  assert.deepEqual(limpos, ['a']);
  assert.equal(boot.diagnostico().fase, 'parado');
  assert.deepEqual(boot.diagnostico().modulos, []);
});

/* ═══════════ observabilidade no retrato ═══════════ */

test('diagnostico() junta métricas, apis e uso — UMA fonte', async () => {
  /* A /diagnostico da V1 vasculha cinco lugares pra montar isso. Aqui o retrato
   * é derivado do registro e das dependências injetadas. */
  const { criarMetricas } = await import('../../v2/core/metricas.js');
  const { criarResolvedorApi } = await import('../../v2/core/api.js');
  const { criarRegistry } = await import('../../v2/core/registry.js');
  const { criarBoot } = await import('../../v2/core/boot.js');

  const registry = criarRegistry();
  registry.registrar(mod('editor', { api: { abrirAba: () => 'ok' } }));
  registry.registrar(mod('jarvis', { dependencies: ['editor'] }));
  registry.selar();

  const metricas = criarMetricas();
  const apis = criarResolvedorApi(registry);
  const boot = criarBoot(registry, { ...criarDeps(), metricas, apis }, { router: routerFalso() });
  await boot.subir();

  metricas.paraModulo('editor').contar('salvou');
  apis.usar('jarvis', ['editor'], 'editor').abrirAba();

  const d = boot.diagnostico();
  assert.equal(d.metricas.contadores.salvou['modulo=editor'], 1);
  assert.deepEqual(d.apis, [{ modulo: 'editor', versao: 1, metodos: ['abrirAba'] }]);
  assert.equal(d.usoDeApi['editor.abrirAba'], 1);
});

test('sem métricas injetadas o retrato diz null, não finge zero', async () => {
  /* `{}` faria parecer "medido e vazio"; null diz "não há medição". */
  const boot = montar([mod('a')], { router: routerFalso() });
  await boot.subir();
  assert.equal(boot.diagnostico().metricas, null);
});
