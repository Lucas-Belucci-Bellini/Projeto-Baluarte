import test from 'node:test';
import assert from 'node:assert/strict';
import { chamarRuntime, serializarCargaRuntime, validarRespostaRuntime } from '../../v2/core/runtime-transport.js';

test('serializa grants no envelope compatível com o Runtime', () => {
  const payload = serializarCargaRuntime([
    { modulo: 'wiki', permissoes: ['READ_FILES'] }
  ]);
  assert.deepEqual(JSON.parse(payload), {
    versao: 1,
    modulos: [{ modulo: 'wiki', permissoes: ['READ_FILES'] }]
  });
});

test('transportador recebe somente JSON', async () => {
  let recebido;
  const resposta = await chamarRuntime({
    enviar(payload) {
      recebido = payload;
      return JSON.stringify({
        versao: 1,
        resultados: [{ modulo: 'wiki', ok: true }]
      });
    }
  }, [{ modulo: 'wiki', permissoes: ['READ_FILES'] }]);

  assert.equal(typeof recebido, 'string');
  assert.deepEqual(resposta.resultados, [{ modulo: 'wiki', ok: true }]);
});

test('recusa resposta inválida', () => {
  assert.throws(() => validarRespostaRuntime('{"versao":2,"resultados":[]}'), /versão/);
  assert.throws(() => validarRespostaRuntime('{"versao":1}'), /resultados/);
  assert.throws(() => validarRespostaRuntime('não é json'), /JSON válido/);
});

test('não permite transportador ausente', async () => {
  await assert.rejects(
    chamarRuntime(null, []),
    /transport precisa implementar/
  );
});
