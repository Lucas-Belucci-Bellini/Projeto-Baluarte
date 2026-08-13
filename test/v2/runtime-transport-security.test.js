import test from 'node:test';
import assert from 'node:assert/strict';
import { chamarRuntime, serializarCargaRuntime } from '../../v2/core/runtime-transport.js';

test('a fronteira de transporte não carrega raiz física nem objetos do Core', async () => {
  let recebido;
  const grants = [{ modulo: 'wiki', permissoes: ['READ_FILES'] }];

  await chamarRuntime({
    enviar(payload) {
      recebido = JSON.parse(payload);
      return JSON.stringify({
        versao: 1,
        resultados: [{ modulo: 'wiki', ok: true }]
      });
    }
  }, grants);

  assert.deepEqual(recebido, {
    versao: 1,
    modulos: [{ modulo: 'wiki', permissoes: ['READ_FILES'] }]
  });
  assert.equal(Object.hasOwn(recebido, 'raiz'), false);
  assert.equal(Object.hasOwn(recebido.modulos[0], 'raiz'), false);
});

test('serialização não preserva referências ou propriedades externas ao contrato', () => {
  const grant = {
    modulo: 'wiki',
    permissoes: ['READ_FILES'],
    raiz: '/nao-deve-atravessar',
    contexto: { segredo: true },
    callback: () => 'nao-deve-atravessar'
  };

  assert.deepEqual(JSON.parse(serializarCargaRuntime([grant])), {
    versao: 1,
    modulos: [{ modulo: 'wiki', permissoes: ['READ_FILES'] }]
  });
});

test('a resposta do Runtime continua sendo validada antes de retornar ao consumidor', async () => {
  await assert.rejects(
    chamarRuntime({
      enviar() {
        return JSON.stringify({ versao: 2, resultados: [] });
      }
    }, []),
    /versão de resposta não suportada/
  );
});
