import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  envelopeRuntime,
  snapshotRuntime,
  validarEnvelopeRuntime
} from '../../v2/core/runtime-bridge.js';

function permissoesFake() {
  const concedidas = new Set(['modulo-a:READ_FILES', 'modulo-a:NETWORK']);
  return {
    avaliar(modulo, permissao) {
      return concedidas.has(`${modulo}:${permissao}`) ? 'ok' : 'negada';
    }
  };
}

test('snapshotRuntime transporta apenas permissões concedidas', () => {
  assert.deepEqual(
    snapshotRuntime(permissoesFake(), 'modulo-a'),
    { modulo: 'modulo-a', permissoes: ['READ_FILES', 'NETWORK'] }
  );
});

test('envelopeRuntime cria envelope versionado e serializável', () => {
  const envelope = envelopeRuntime([
    { modulo: 'modulo-a', permissoes: ['READ_FILES'] },
    { modulo: 'modulo-b', permissoes: [] }
  ]);
  assert.deepEqual(envelope, {
    versao: 1,
    modulos: [
      { modulo: 'modulo-a', permissoes: ['READ_FILES'] },
      { modulo: 'modulo-b', permissoes: [] }
    ]
  });
  assert.deepEqual(JSON.parse(JSON.stringify(envelope)), envelope);
});

test('envelopeRuntime rejeita módulo duplicado', () => {
  assert.throws(
    () => envelopeRuntime([
      { modulo: 'modulo-a', permissoes: [] },
      { modulo: 'modulo-a', permissoes: [] }
    ]),
    /grant duplicado/
  );
});

test('validarEnvelopeRuntime rejeita versão incompatível', () => {
  const resultado = validarEnvelopeRuntime({ versao: 2, modulos: [] });
  assert.equal(resultado.ok, false);
  assert.match(resultado.erros[0], /versão/);
});

test('validarEnvelopeRuntime rejeita capacidade desconhecida', () => {
  const resultado = validarEnvelopeRuntime({
    versao: 1,
    modulos: [{ modulo: 'modulo-a', permissoes: ['READ_FILES', 'ROOT_ACCESS'] }]
  });
  assert.equal(resultado.ok, false);
  assert.match(resultado.erros[0], /desconhecida/);
});

test('validarEnvelopeRuntime rejeita permissão duplicada', () => {
  const resultado = validarEnvelopeRuntime({
    versao: 1,
    modulos: [{ modulo: 'modulo-a', permissoes: ['READ_FILES', 'READ_FILES'] }]
  });
  assert.equal(resultado.ok, false);
  assert.match(resultado.erros[0], /duplicada/);
});
