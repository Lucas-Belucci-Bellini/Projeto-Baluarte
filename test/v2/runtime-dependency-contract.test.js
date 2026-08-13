import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeModuleRegistry } from '../../v2/core/runtime-module-registry.js';
import { criarRuntimeDependencySpec } from '../../v2/core/runtime-dependency-spec.js';
import { validarRuntimeDependencyContract } from '../../v2/core/runtime-dependency-contract.js';

function make(entries) {
  const registry = criarRuntimeModuleRegistry();
  for (const entry of entries) registry.registrar(entry.id, entry);
  registry.selar();
  return registry;
}

test('contrato válido passa', () => {
  const registry = make([{ id: 'db' }, { id: 'api', dependsOn: ['db'] }]);
  const spec = criarRuntimeDependencySpec(registry);
  assert.equal(validarRuntimeDependencyContract({ registry, spec }), true);
});

test('dependência inexistente falha antes do boot', () => {
  const registry = make([{ id: 'api', dependsOn: ['db'] }]);
  const spec = criarRuntimeDependencySpec(registry);
  assert.throws(() => validarRuntimeDependencyContract({ registry, spec }), /Contrato de dependências inválido/);
});

test('ciclo falha antes do boot', () => {
  const registry = make([{ id: 'a', dependsOn: ['b'] }, { id: 'b', dependsOn: ['a'] }]);
  const spec = criarRuntimeDependencySpec(registry);
  assert.throws(() => validarRuntimeDependencyContract({ registry, spec }), /Contrato de dependências inválido/);
});
