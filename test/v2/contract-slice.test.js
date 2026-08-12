import test from 'node:test';
import assert from 'node:assert/strict';
import { criarCargaRuntime } from '../../v2/core/runtime-bootstrap.js';
import { criarLifecycleRuntime } from '../../v2/core/module-runtime-lifecycle.js';

function registryFake() {
  const modulos = new Map([['alpha', { id: 'alpha', versao: '1.0.0' }]]);
  return { selado: true, listar: () => [...modulos.keys()], modulo: (id) => modulos.get(id) ?? null };
}

function permissions() {
  return { avaliar: (_id, capacidade) => capacidade === 'READ_FILES' ? 'ok' : 'negada' };
}

test('contract: registry -> permissions -> runtime -> lifecycle', async () => {
  const registry = registryFake();
  const permissoes = permissions();
  const envelope = criarCargaRuntime(registry, permissoes);

  assert.equal(envelope.versao, 1);
  assert.deepEqual(envelope.modulos, [{ modulo: 'alpha', permissoes: ['READ_FILES'] }]);

  const eventos = [];
  const runtime = {
    abrir: async (_registry, _permissions, id) => eventos.push(`runtime:open:${id}`),
    fechar: async (id) => eventos.push(`runtime:close:${id}`)
  };
  const lifecycle = criarLifecycleRuntime(registry, runtime, permissoes);

  await lifecycle.abrir('alpha');
  eventos.push('module:init');
  eventos.push('module:start');
  await lifecycle.fechar('alpha');

  assert.deepEqual(eventos, [
    'runtime:open:alpha',
    'module:init',
    'module:start',
    'runtime:close:alpha'
  ]);
});

test('contract: denied capability never enters runtime envelope', () => {
  const registry = registryFake();
  const denied = { avaliar: () => 'negada' };
  assert.deepEqual(criarCargaRuntime(registry, denied), {
    versao: 1,
    modulos: [{ modulo: 'alpha', permissoes: [] }]
  });
});
