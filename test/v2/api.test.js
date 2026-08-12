/**
 * Contratos entre módulos.
 *
 * O que estes testes protegem é o que separa "comunicação por contrato" de
 * "importar o arquivo do outro":
 *
 * 1. **Chamar exige declarar.** Se `usar()` funcionasse sem `dependencies[]`, o
 *    grafo de dependências seria ficção — e com ele a ordem de subida e o corte
 *    em cascata.
 * 2. **A culpa tem dono.** Uma api que levanta precisa dizer de quem é; senão o
 *    log culpa quem chamou e a investigação começa no módulo errado.
 * 3. **A superfície é congelada.** Devolver a api crua deixaria o chamador
 *    remendar o módulo alheio — que é exatamente o que se está saindo.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarResolvedorApi, ErroContrato, ErroApiModulo } from '../../v2/core/api.js';
import { criarContexto } from '../../v2/core/contexto.js';
import { normalizar } from '../../v2/core/manifest.js';

const mod = (id, extra = {}) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  ...extra
});

function montar(...mods) {
  const registry = criarRegistry();
  mods.forEach((m) => registry.registrar(m));
  const selo = registry.selar();
  return { registry, selo, apis: criarResolvedorApi(registry) };
}

/* ═══════════ chamar exige declarar ═══════════ */

test('módulo que DECLAROU a dependência usa a api', () => {
  const { apis } = montar(
    mod('editor', { api: { abrirAba: (n) => `aba:${n}` } }),
    mod('jarvis', { dependencies: ['editor'] })
  );
  const editor = apis.usar('jarvis', ['editor'], 'editor');
  assert.equal(editor.abrirAba('a.js'), 'aba:a.js');
});

test('módulo que NÃO declarou é recusado, com instrução', () => {
  /* Sem isto, dependência vira invisível e o Registry não tem como ordenar a
   * subida nem cortar em cascata. */
  const { apis } = montar(
    mod('editor', { api: { abrirAba: () => 1 } }),
    mod('jarvis')
  );
  assert.throws(() => apis.usar('jarvis', [], 'editor'), ErroContrato);
  try { apis.usar('jarvis', [], 'editor'); } catch (e) {
    assert.match(e.message, /dependencies\[\]/, 'o erro devia dizer como consertar');
  }
});

test('usar() na própria api é erro — é import, não contrato', () => {
  const { apis } = montar(mod('a', { api: { x: () => 1 } }));
  assert.throws(() => apis.usar('a', ['a'], 'a'), /não precisa de usar\(\)/);
});

test('módulo sem api declarada dá erro claro, não objeto vazio', () => {
  /* Objeto vazio faria `alvo.metodo()` estourar como "not a function" longe da
   * causa real, que é "esse módulo não oferece api". */
  const { apis } = montar(mod('mudo'), mod('quer', { dependencies: ['mudo'] }));
  assert.throws(() => apis.usar('quer', ['mudo'], 'mudo'), /não oferece api/);
});

/* ═══════════ versão ═══════════ */

test('versão compatível passa', () => {
  const { apis } = montar(
    mod('a', { api: { f: () => 'ok' }, apiVersion: 2 }),
    mod('b', { dependencies: ['a'] })
  );
  assert.equal(apis.usar('b', ['a'], 'a', { versao: 2 }).f(), 'ok');
});

test('versão incompatível falha NA RESOLUÇÃO, com os dois números', () => {
  /* Falhar aqui, e não num `undefined is not a function` seis frames adiante. */
  const { apis } = montar(
    mod('a', { api: { f: () => 1 }, apiVersion: 1 }),
    mod('b', { dependencies: ['a'] })
  );
  try {
    apis.usar('b', ['a'], 'a', { versao: 2 });
    assert.fail('devia recusar');
  } catch (e) {
    assert.ok(e instanceof ErroContrato);
    assert.match(e.message, /v2/);
    assert.match(e.message, /v1/);
  }
});

test('quem não exige versão funciona com o padrão', () => {
  const { apis } = montar(mod('a', { api: { f: () => 1 } }), mod('b', { dependencies: ['a'] }));
  assert.equal(apis.usar('b', ['a'], 'a').f(), 1);
});

test('apiVersion sem api é recusada pelo validador', () => {
  /* Versão de contrato que não existe é quase sempre resto de remoção. */
  const { selo } = montar(mod('a', { apiVersion: 3 }));
  assert.equal(selo.ok, false);
  assert.match(selo.recusados[0].motivo, /apiVersion.*sem .api./);
});

/* ═══════════ a culpa tem dono ═══════════ */

test('api que levanta é atribuída ao DONO, preservando a causa', () => {
  const original = new TypeError('quebrou lá dentro');
  const { apis } = montar(
    mod('editor', { api: { abrirAba: () => { throw original; } } }),
    mod('jarvis', { dependencies: ['editor'] })
  );
  const editor = apis.usar('jarvis', ['editor'], 'editor');

  try {
    editor.abrirAba();
    assert.fail('devia propagar');
  } catch (e) {
    assert.ok(e instanceof ErroApiModulo);
    assert.equal(e.dono, 'editor');
    assert.equal(e.metodo, 'abrirAba');
    assert.equal(e.causa, original, 'perdeu o erro original');
    assert.match(e.message, /editor\.abrirAba/);
  }
});

test('api ASSÍNCRONA que rejeita também é atribuída', async () => {
  /* Sem o catch na promessa, a regra valeria só para o caminho síncrono — e
   * quase toda api de verdade é assíncrona. */
  const { apis } = montar(
    mod('rede', { api: { buscar: () => Promise.reject(new Error('502')) } }),
    mod('wiki', { dependencies: ['rede'] })
  );
  const rede = apis.usar('wiki', ['rede'], 'rede');

  await assert.rejects(() => rede.buscar(), (e) => {
    assert.ok(e instanceof ErroApiModulo);
    assert.equal(e.dono, 'rede');
    assert.equal(e.causa.message, '502');
    return true;
  });
});

test('a falha é registrada com dono E chamador', () => {
  const erros = [];
  const registry = criarRegistry();
  [mod('a', { api: { f: () => { throw new Error('x'); } } }), mod('b', { dependencies: ['a'] })]
    .forEach((m) => registry.registrar(m));
  registry.selar();

  const apis = criarResolvedorApi(registry, {
    log: { erro: (_msg, _err, campos) => erros.push(campos), debug: () => {} }
  });
  try { apis.usar('b', ['a'], 'a').f(); } catch { /* esperado */ }

  assert.equal(erros.length, 1);
  assert.deepEqual({ dono: erros[0].dono, chamador: erros[0].chamador }, { dono: 'a', chamador: 'b' });
});

/* ═══════════ a superfície é isolada ═══════════ */

test('a api devolvida é CONGELADA — o chamador não remenda o dono', () => {
  const { apis } = montar(
    mod('a', { api: { f: () => 'original' } }),
    mod('b', { dependencies: ['a'] })
  );
  const superficie = apis.usar('b', ['a'], 'a');

  assert.throws(() => { superficie.f = () => 'trocado'; }, TypeError);
  assert.equal(superficie.f(), 'original');
});

test('remendar a superfície não afeta o módulo dono', () => {
  const original = { f: () => 'do dono' };
  const { apis } = montar(mod('a', { api: original }), mod('b', { dependencies: ['a'] }));
  const s1 = apis.usar('b', ['a'], 'a');
  try { delete s1.f; } catch { /* congelado */ }

  assert.equal(apis.usar('b', ['a'], 'a').f(), 'do dono');
  assert.equal(original.f(), 'do dono');
});

test('campo de api que não é função é ignorado, não exposto quebrado', () => {
  const { apis } = montar(
    mod('a', { api: { f: () => 1, constante: 42 } }),
    mod('b', { dependencies: ['a'] })
  );
  const s = apis.usar('b', ['a'], 'a');
  assert.deepEqual(Object.keys(s), ['f']);
});

/* ═══════════ observabilidade ═══════════ */

test('uso() conta as chamadas por dono.metodo', () => {
  const { apis } = montar(
    mod('a', { api: { f: () => 1, g: () => 2 } }),
    mod('b', { dependencies: ['a'] })
  );
  const s = apis.usar('b', ['a'], 'a');
  s.f(); s.f(); s.g();
  assert.deepEqual(apis.uso(), { 'a.f': 2, 'a.g': 1 });
});

test('catalogo() lista quem oferece o quê, com versão', () => {
  const { apis } = montar(
    mod('a', { api: { f: () => 1 }, apiVersion: 3 }),
    mod('sem-api')
  );
  assert.deepEqual(apis.catalogo(), [{ modulo: 'a', versao: 3, metodos: ['f'] }]);
});

/* ═══════════ pelo contexto, que é como o módulo vê ═══════════ */

test('ctx.usar() só existe quando o resolvedor é injetado', () => {
  const semApis = criarContexto(
    normalizar({ id: 'x', name: 'X', version: '1.0.0' }),
    { storage: { get: () => undefined, set: () => true } }
  );
  assert.equal('usar' in semApis, false, 'capacidade ausente não deve existir no objeto');
});

test('ctx.usar() carrega as dependências do próprio manifesto', () => {
  /* O módulo não passa a lista: ele TEM uma. Deixar o chamador informar as
   * próprias dependências seria deixá-lo mentir. */
  const { registry, apis } = montar(
    mod('editor', { api: { abrirAba: (n) => `aba:${n}` } }),
    mod('jarvis', { dependencies: ['editor'] })
  );
  const ctx = criarContexto(registry.modulo('jarvis'), {
    storage: { get: () => undefined, set: () => true },
    apis
  });

  assert.equal(ctx.usar('editor').abrirAba('x'), 'aba:x');
  assert.throws(() => ctx.usar('militar'), ErroContrato);
  assert.deepEqual(ctx.declarado.depende, ['editor']);
});
