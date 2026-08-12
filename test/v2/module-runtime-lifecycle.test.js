import test from 'node:test';
import assert from 'node:assert/strict';
import { criarLifecycleRuntime } from '../../v2/core/module-runtime-lifecycle.js';

function registry() {
  return {
    selado: true,
    modulo: (id) => id === 'alpha' ? { id } : null
  };
}

test('abre o Runtime uma vez para módulo ativo', async () => {
  const chamadas = [];
  const runtime = {
    abrir: async (_r, _p, id) => chamadas.push(['abrir', id]),
    fechar: async (id) => chamadas.push(['fechar', id])
  };
  const ciclo = criarLifecycleRuntime(registry(), runtime, {});

  await ciclo.abrir('alpha');
  await ciclo.abrir('alpha');

  assert.deepEqual(chamadas, [['abrir', 'alpha']]);
  assert.deepEqual(ciclo.abertas(), ['alpha']);
});

test('fecha o Runtime e limpa o registro mesmo com erro', async () => {
  const runtime = {
    abrir: async () => {},
    fechar: async () => { throw new Error('falha'); }
  };
  const ciclo = criarLifecycleRuntime(registry(), runtime, {});
  await ciclo.abrir('alpha');

  await assert.rejects(() => ciclo.fechar('alpha'), /falha/);
  assert.deepEqual(ciclo.abertas(), []);
});

test('recusa registry não selado e módulo inexistente', async () => {
  const runtime = { abrir: async () => {}, fechar: async () => {} };
  assert.throws(
    () => criarLifecycleRuntime({ selado: false, modulo: () => null }, runtime, {}).abrir('alpha'),
    /registry precisa estar selado/
  );

  await assert.rejects(
    () => criarLifecycleRuntime(registry(), runtime, {}).abrir('missing'),
    /módulo não ativo/
  );
});
