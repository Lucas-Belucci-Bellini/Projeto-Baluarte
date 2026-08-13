import test from 'node:test';
import assert from 'node:assert/strict';
import { criarLifecycleRuntime } from '../../v2/core/module-runtime-lifecycle.js';

function registry(selado = true) {
  return { selado, modulo: id => id === 'alpha' ? { id } : null };
}

test('abre o Runtime uma vez para módulo ativo', async () => {
  const chamadas = [];
  const runtime = { abrir: async (_r, _p, id) => chamadas.push(['abrir', id]), fechar: async id => chamadas.push(['fechar', id]) };
  const ciclo = criarLifecycleRuntime(registry(), runtime, {});
  await ciclo.abrir('alpha');
  await ciclo.abrir('alpha');
  assert.deepEqual(chamadas, [['abrir', 'alpha']]);
  assert.deepEqual(ciclo.abertas(), ['alpha']);
});

test('Runtime é aberto antes do lifecycle do módulo', async () => {
  const eventos = [];
  const runtime = { abrir: async () => eventos.push('runtime:open'), fechar: async () => eventos.push('runtime:close') };
  const ciclo = criarLifecycleRuntime(registry(), runtime, {});
  await ciclo.abrir('alpha');
  eventos.push('module:init');
  eventos.push('module:start');
  await ciclo.fechar('alpha');
  assert.deepEqual(eventos, ['runtime:open', 'module:init', 'module:start', 'runtime:close']);
});

test('falha ao abrir Runtime não marca sessão como aberta', async () => {
  const runtime = { abrir: async () => { throw new Error('runtime down'); }, fechar: async () => {} };
  const ciclo = criarLifecycleRuntime(registry(), runtime, {});
  await assert.rejects(() => ciclo.abrir('alpha'), /runtime down/);
  assert.deepEqual(ciclo.abertas(), []);
});

test('fecha o Runtime e limpa o registro mesmo com erro', async () => {
  const runtime = { abrir: async () => {}, fechar: async () => { throw new Error('falha'); } };
  const ciclo = criarLifecycleRuntime(registry(), runtime, {});
  await ciclo.abrir('alpha');
  await assert.rejects(() => ciclo.fechar('alpha'), /falha/);
  assert.deepEqual(ciclo.abertas(), []);
});

test('recusa registry não selado e módulo inexistente', async () => {
  const runtime = { abrir: async () => {}, fechar: async () => {} };
  await assert.rejects(() => criarLifecycleRuntime(registry(false), runtime, {}).abrir('alpha'), /registry precisa estar selado/);
  await assert.rejects(() => criarLifecycleRuntime(registry(), runtime, {}).abrir('missing'), /módulo não ativo/);
});
