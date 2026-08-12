import test from 'node:test';
import assert from 'node:assert/strict';
import { criarCargaRuntime, criarGrantRuntime } from '../../v2/core/runtime-bootstrap.js';

function registryFake(modulos) {
  const mapa = new Map(modulos.map((m) => [m.id, m]));
  return {
    selado: true,
    listar: () => [...mapa.keys()],
    modulo: (id) => mapa.get(id) ?? null
  };
}

function permissoesFake(concedidas) {
  return {
    avaliar(modulo, permissao) {
      return concedidas[modulo]?.includes(permissao) ? 'ok' : 'negada';
    }
  };
}

test('cria carga somente com concessões efetivas', () => {
  const registry = registryFake([{ id: 'alpha' }, { id: 'beta' }]);
  const permissoes = permissoesFake({ alpha: ['READ_FILES'], beta: [] });

  assert.deepEqual(criarCargaRuntime(registry, permissoes), {
    versao: 1,
    modulos: [
      { modulo: 'alpha', permissoes: ['READ_FILES'] },
      { modulo: 'beta', permissoes: [] }
    ]
  });
});

test('não cria carga antes do registry estar selado', () => {
  const registry = { selado: false };
  assert.throws(
    () => criarCargaRuntime(registry, permissoesFake({})),
    /registry precisa estar selado/
  );
});

test('grant lazy só aceita módulo ativo', () => {
  const registry = registryFake([{ id: 'alpha' }]);
  const permissoes = permissoesFake({ alpha: ['READ_FILES'] });

  assert.deepEqual(criarGrantRuntime(registry, permissoes, 'alpha'), {
    modulo: 'alpha',
    permissoes: ['READ_FILES']
  });
  assert.throws(
    () => criarGrantRuntime(registry, permissoes, 'missing'),
    /módulo não ativo/
  );
});

test('permissão declarada mas não concedida não atravessa a ponte', () => {
  const registry = registryFake([{ id: 'alpha' }]);
  const permissoes = permissoesFake({ alpha: [] });

  assert.deepEqual(criarCargaRuntime(registry, permissoes), {
    versao: 1,
    modulos: [{ modulo: 'alpha', permissoes: [] }]
  });
});
