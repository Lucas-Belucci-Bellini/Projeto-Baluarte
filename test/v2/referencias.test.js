/**
 * Referência FRACA — a pendência que a `V2_MODULE_RULES.md` carregava aberta.
 *
 * O contrato só sabia dizer "dependo de" (dura). Faltava dizer "aponto para,
 * e funciono sem" — e a falta tinha caso concreto: o hub militar chama
 * `router.navigate()` para 14 rotas; some uma, o botão vai ao `notFound`
 * calado, sem erro, sem log, e o operador descobre clicando.
 *
 * A distinção não é acadêmica. Ela decide **o que acontece na ausência**:
 *
 *   dura  → o Registry corta em cascata. O módulo não sobe.
 *   fraca → o módulo sobe. O Registry avisa qual link está morto.
 *
 * Declarar uma como a outra dá o pior dos dois: dura demais derruba um módulo
 * que funcionaria; fraca demais deixa subir um módulo que vai quebrar no uso.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { validar, normalizar } from '../../v2/core/manifest.js';
import { criarRegistry } from '../../v2/core/registry.js';
import { criarResolvedorApi } from '../../v2/core/api.js';
import { criarContexto } from '../../v2/core/contexto.js';

const mod = (id, extra = {}) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  ...extra
});

/* ═══════════ o validador ═══════════ */

test('references aceita rotas e módulos', () => {
  const r = validar(mod('hub', { references: { routes: ['/a', '/b'], modules: ['editor'] } }));
  assert.equal(r.ok, true, r.erros.join(' | '));
});

test('rota de referência precisa começar com "/"', () => {
  const r = validar(mod('hub', { references: { routes: ['arsenal'] } }));
  assert.equal(r.ok, false);
  assert.match(r.erros.join(), /references\.routes\[0\]/);
});

test('chave desconhecida em references é ERRO, não é ignorada', () => {
  /* `route` no singular passaria calado e a referência sumiria — que é o modo
   * de falha que este campo existe para acabar. */
  const r = validar(mod('hub', { references: { route: ['/a'] } }));
  assert.equal(r.ok, false);
  assert.match(r.erros.join(), /references\.route.*não existe/);
});

test('o mesmo módulo em dependencies E references é contradição', () => {
  /* Um diz "não funciono sem", o outro diz "funciono sem". Deixar passar
   * obrigaria o Registry a escolher, e a escolha seria arbitrária. */
  const r = validar(mod('hub', { dependencies: ['editor'], references: { modules: ['editor'] } }));
  assert.equal(r.ok, false);
  assert.match(r.erros.join(), /decida se é dura ou fraca/);
});

test('referenciar a si mesmo é recusado', () => {
  const r = validar(mod('hub', { references: { modules: ['hub'] } }));
  assert.equal(r.ok, false);
});

test('normalizar preenche references vazio', () => {
  assert.deepEqual(normalizar(mod('hub')).references, { routes: [], modules: [] });
});

/* ═══════════ a diferença que importa: a ausência ═══════════ */

test('DURA: dependência ausente CORTA o módulo', () => {
  const r = criarRegistry();
  r.registrar(mod('hub', { dependencies: ['fantasma'] }));
  const selo = r.selar();

  assert.deepEqual(r.listar(), [], 'o hub subiu sem a dependência dura');
  assert.equal(selo.recusados.length, 1);
});

test('FRACA: referência ausente NÃO corta — só é reportada', () => {
  const r = criarRegistry();
  r.registrar(mod('hub', { references: { routes: ['/fantasma'], modules: ['ausente'] } }));
  r.selar();

  assert.deepEqual(r.listar(), ['hub'], 'a referência fraca derrubou o módulo');
  assert.deepEqual(r.referenciasOrfas(), [
    { modulo: 'hub', tipo: 'rota', alvo: '/fantasma' },
    { modulo: 'hub', tipo: 'modulo', alvo: 'ausente' }
  ]);
});

test('referência com alvo presente não aparece como órfã', () => {
  const r = criarRegistry();
  r.registrar(mod('hub', { references: { routes: ['/editor'], modules: ['editor'] } }));
  r.registrar(mod('editor'));
  r.selar();
  assert.deepEqual(r.referenciasOrfas(), []);
});

test('referência fraca NÃO manda na ordem de subida', () => {
  /* Se mandasse, seria dependência dura com outro nome — e um ciclo de
   * referências fracas travaria o Registry sem motivo. */
  const r = criarRegistry();
  r.registrar(mod('a', { references: { modules: ['b'] } }));
  r.registrar(mod('b', { references: { modules: ['a'] } }));
  r.selar();

  assert.deepEqual(r.listar(), ['a', 'b'], 'ciclo de referência fraca virou ciclo de verdade');
});

/* ═══════════ ctx.talvez() ═══════════ */

function comApis(...mods) {
  const r = criarRegistry();
  mods.forEach((m) => r.registrar(m));
  r.selar();
  return { registry: r, apis: criarResolvedorApi(r) };
}

const comApi = (id, extra = {}) => mod(id, { api: { oi: () => `oi de ${id}` }, ...extra });

test('talvez() devolve a api quando o alvo está lá', () => {
  const { apis } = comApis(mod('hub', { references: { modules: ['editor'] } }), comApi('editor'));
  assert.equal(apis.talvez('hub', ['editor'], 'editor')?.oi(), 'oi de editor');
});

test('talvez() devolve NULL quando o alvo não está — não levanta', () => {
  const { apis } = comApis(mod('hub', { references: { modules: ['ausente'] } }));
  assert.equal(apis.talvez('hub', ['ausente'], 'ausente'), null);
});

test('talvez() devolve null quando o alvo existe e não oferece api', () => {
  const { apis } = comApis(mod('hub', { references: { modules: ['mudo'] } }), mod('mudo'));
  assert.equal(apis.talvez('hub', ['mudo'], 'mudo'), null);
});

test('talvez() degrada também na INCOMPATIBILIDADE de versão', () => {
  /* O alvo existe e não fala a versão pedida — para quem referencia, é o mesmo
   * que não estar lá. Levantar aqui derrubaria um módulo que declarou funcionar
   * sem, e incompatibilidade de versão é justamente quando isso acontece. */
  const { apis } = comApis(
    mod('hub', { references: { modules: ['editor'] } }),
    comApi('editor', { apiVersion: 2 })
  );
  assert.equal(apis.talvez('hub', ['editor'], 'editor', { versao: 1 }), null);
});

test('talvez() SEM declarar continua sendo erro', () => {
  /* A diferença entre dura e fraca é o que acontece na ausência, não se precisa
   * declarar: referência que ninguém declara é invisível ao Registry, e
   * invisível é o problema que o manifesto existe para resolver. */
  const { apis } = comApis(mod('hub'), comApi('editor'));
  assert.throws(() => apis.talvez('hub', [], 'editor'), /não declarou referenciar/);
});

test('usar() NÃO aceita o que só foi declarado como referência fraca', () => {
  /* O contrário também: quem quer a garantia dura tem que declarar dura. */
  const { apis } = comApis(mod('hub', { references: { modules: ['editor'] } }), comApi('editor'));
  assert.throws(() => apis.usar('hub', [], 'editor'), /não declarou depender/);
});

test('o contexto entrega talvez() usando references.modules', () => {
  const { registry, apis } = comApis(
    mod('hub', { references: { modules: ['editor'] } }), comApi('editor')
  );
  const ctx = criarContexto(normalizar(registry.modulo('hub')), {
    storage: { get: () => undefined, set: () => true }, apis
  });

  assert.equal(ctx.talvez('editor')?.oi(), 'oi de editor');
  /* E não confunde as duas listas: `usar` continua olhando dependencies. */
  assert.throws(() => ctx.usar('editor'), /não declarou depender/);
});

/* ═══════════ o caso real ═══════════ */

test('o hub militar declara as 14 frentes como referência, não dependência', async () => {
  const militar = (await import('../../v2/modules/militar/module.js')).default;
  const n = normalizar(militar);

  assert.deepEqual(n.dependencies, [], 'o hub não funciona sem alguma frente?');
  assert.equal(n.references.routes.length, 14);
  for (const p of n.references.routes) assert.ok(p.startsWith('/'), p);

  /* Hoje as frentes são rotas do PRÓPRIO módulo, então nada fica órfão. A
   * declaração vale mesmo assim: quando uma frente virar módulo separado — que
   * é o rumo —, `referenciasOrfas()` passa a cobrar sozinho, sem ninguém ter de
   * lembrar de acrescentar nada. */
  const r = criarRegistry();
  r.registrar(militar);
  r.selar();
  assert.deepEqual(r.referenciasOrfas(), []);
});
