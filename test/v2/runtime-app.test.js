/**
 * O adaptador que leva o Runtime ao renderer.
 *
 * O que ele protege, do mais grave ao menos:
 *
 * 1. **Fora do app, não existe.** Devolver um adaptador na web daria aos módulos
 *    uma alça que sempre falha — pior do que não ter alça. `null` faz
 *    `deps.runtime` ficar indefinido e o contexto volta a ser o de antes.
 * 2. **Ambiente meio montado é ausência, não disponibilidade.** `native` sem
 *    `invoke` (ou o contrário) é ponte quebrada, e ponte quebrada tratada como
 *    pronta vira erro em tempo de uso, longe da causa.
 * 3. **O envelope é remontado a cada chamada.** Concessão muda em runtime;
 *    envelope congelado no boot responderia sobre o passado — revogar não
 *    alcançaria o módulo.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { criarRuntimeApp } from '../../v2/core/runtime-app.js';
import { criarRegistry } from '../../v2/core/registry.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';

function montar() {
  const registry = criarRegistry();
  registry.registrar({
    id: 'alpha', name: 'Alpha', version: '1.0.0',
    routes: [{ path: '/a', view: () => Promise.resolve({}) }],
    permissions: ['READ_FILES'], lifecycle: {}
  });
  registry.selar();
  const permissoes = criarPermissoes();
  permissoes.conhecerModulos(registry.listar().map((id) => registry.modulo(id)));
  return { registry, permissoes };
}

/** Ponte de mentira com a forma do `window.baluarte` do preload. */
function ponteFalsa() {
  const chamadas = [];
  return {
    chamadas,
    ponte: {
      native: true,
      invoke: async (canal, payload) => {
        chamadas.push({ canal, payload });
        return { status: 'file', bytes: [66, 65] };
      }
    }
  };
}

test('sem app, o adaptador não existe', () => {
  const { registry, permissoes } = montar();
  assert.equal(criarRuntimeApp(registry, permissoes, undefined), null, 'navegador puro');
  assert.equal(criarRuntimeApp(registry, permissoes, {}), null, 'objeto sem native');
});

test('ambiente meio montado conta como ausente', () => {
  /* `native` sem `invoke` é ponte quebrada. Tratá-la como pronta empurraria o
   * erro para a hora do uso, dentro do `init` de um módulo — longe da causa. */
  const { registry, permissoes } = montar();
  assert.equal(criarRuntimeApp(registry, permissoes, { native: true }), null);
  assert.equal(criarRuntimeApp(registry, permissoes, { invoke: async () => ({}) }), null);
  assert.equal(
    criarRuntimeApp(registry, permissoes, { native: 'sim', invoke: async () => ({}) }),
    null,
    'native tem de ser true, não apenas verdadeiro'
  );
});

test('no app, lerArquivo vira invoke no canal runtime:ler', async () => {
  const { registry, permissoes } = montar();
  const { ponte, chamadas } = ponteFalsa();
  const rt = criarRuntimeApp(registry, permissoes, ponte);
  assert.ok(rt, 'dentro do app o adaptador tem de existir');

  const r = await rt.lerArquivo('alpha', 'hello.txt');
  assert.equal(Buffer.from(r.bytes).toString('utf8'), 'BA');

  assert.equal(chamadas.length, 1);
  assert.equal(chamadas[0].canal, 'runtime:ler');
  assert.equal(chamadas[0].payload.modulo, 'alpha');
  assert.equal(chamadas[0].payload.path, 'hello.txt');
  assert.equal(chamadas[0].payload.envelope.versao, 1);
});

test('o envelope acompanha a concessão, não o boot', async () => {
  /* A asserção que dá nome ao arquivo. Se o envelope fosse montado uma vez, a
   * segunda chamada carregaria a foto da primeira: conceder depois do boot não
   * alcançaria o módulo, e revogar tampouco. */
  const { registry, permissoes } = montar();
  const { ponte, chamadas } = ponteFalsa();
  const rt = criarRuntimeApp(registry, permissoes, ponte);

  await rt.lerArquivo('alpha', 'a.txt');
  assert.deepEqual(chamadas[0].payload.envelope.modulos[0].permissoes, [], 'declarar não é receber');

  permissoes.conceder('alpha', 'READ_FILES', { origem: 'teste' });
  await rt.lerArquivo('alpha', 'b.txt');
  assert.deepEqual(
    chamadas[1].payload.envelope.modulos[0].permissoes,
    ['READ_FILES'],
    'a concessão posterior tem de aparecer'
  );

  permissoes.revogar('alpha', 'READ_FILES', { origem: 'teste' });
  await rt.lerArquivo('alpha', 'c.txt');
  assert.deepEqual(
    chamadas[2].payload.envelope.modulos[0].permissoes,
    [],
    'revogar também tem de alcançar'
  );
});
