/**
 * O Service Worker novo limpa os caches das versões antigas (#420).
 *
 * `pwa` está marcado **estável**, e o modo de falha aqui já mordeu este projeto
 * duas vezes: cache velho servido depois de um deploy, com o operador vendo o
 * site antigo e nada no console. O `test/versao.test.js` fechou metade disso
 * (garante que a VERSION do `sw.js` acompanha o projeto). Esta é a outra metade:
 * **quando a VERSION muda, o cache anterior some de verdade?**
 *
 * ── Como isto testa o arquivo de verdade ─────────────────────────────────────
 * O `public/sw.js` é servido cru e usa globais de Service Worker (`self`,
 * `caches`), então não dá pra importar. Em vez de reimplementar a lógica no
 * teste — o que testaria uma cópia, não o código —, o arquivo é **executado**
 * num sandbox `vm` com `self` e `caches` de mentira. O handler de `activate` é
 * capturado e chamado com chaves semeadas à mão. É o `sw.js` que roda.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createContext, runInContext } from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const fonte = readFileSync(join(raiz, 'public/sw.js'), 'utf8');

/**
 * Roda o `sw.js` de verdade num sandbox e devolve o que sobrou dos caches
 * depois do `activate`.
 *
 * @param {string[]} chavesExistentes o que já estava no `caches` do navegador
 */
async function ativarComCaches(chavesExistentes) {
  const existentes = new Set(chavesExistentes);
  const apagadas = [];
  const handlers = {};

  const sandbox = {
    self: {
      addEventListener: (nome, fn) => { handlers[nome] = fn; },
      clients: { claim: async () => {} },
      skipWaiting: async () => {},
      location: { origin: 'https://exemplo.test' }
    },
    caches: {
      keys: async () => [...existentes],
      delete: async (k) => { apagadas.push(k); return existentes.delete(k); },
      open: async () => ({ addAll: async () => {}, put: async () => {}, match: async () => undefined })
    },
    fetch: async () => ({ ok: true }),
    URL,
    console
  };
  sandbox.self.self = sandbox.self;

  runInContext(fonte, createContext(sandbox), { filename: 'sw.js' });

  assert.ok(handlers.activate, 'o sw.js não registrou handler de activate');

  let pendente = Promise.resolve();
  await handlers.activate({ waitUntil: (p) => { pendente = p; } });
  await pendente;

  return { sobraram: [...existentes], apagadas };
}

/** A VERSION que o `sw.js` declara hoje. */
const VERSION_ATUAL = (/^const VERSION = '([^']+)';$/m.exec(fonte) || [])[1];

test('o sw.js declara uma VERSION legível', () => {
  assert.ok(VERSION_ATUAL, 'não achei "const VERSION = ..." em public/sw.js');
});

test('os caches da versão atual são preservados', async () => {
  const meus = [`${VERSION_ATUAL}-static`, `${VERSION_ATUAL}-runtime`];
  const { sobraram } = await ativarComCaches(meus);
  assert.deepEqual(sobraram.sort(), meus.sort(), 'o SW apagou o próprio cache');
});

test('caches de uma versão anterior são apagados', async () => {
  const { sobraram, apagadas } = await ativarComCaches([
    `${VERSION_ATUAL}-static`,
    'baluarte-v0.9.1-static',
    'baluarte-v0.9.1-runtime'
  ]);
  assert.deepEqual(sobraram, [`${VERSION_ATUAL}-static`]);
  assert.equal(apagadas.length, 2);
});

/* ===== O caso que a limpeza por prefixo deixava passar ===== */

test('cache de versão cujo nome ESTENDE a atual também é apagado', async () => {
  /* O defeito concreto que isto fecha:
   *
   *   'baluarte-v1.0.0-rc-static'.startsWith('baluarte-v1.0.0')  // true
   *
   * Com limpeza por prefixo, ao subir de `1.0.0-rc` para `1.0.0` os caches da
   * rc sobreviveriam para sempre — invisíveis, ocupando espaço, nunca servidos.
   * O mesmo valeria de `v1.0` para `v1.0.1`.
   *
   * O cenário é montado com a VERSION real do sw.js mais um sufixo: o que
   * importa é a relação de prefixo entre os dois nomes, não os números. */
  const estendeAAtual = `${VERSION_ATUAL}-outra-static`;

  const { apagadas } = await ativarComCaches([
    `${VERSION_ATUAL}-static`,      // meu, fica
    estendeAAtual,                  // de outra versão, tem que sair
    'baluarte-v0.5.0-static'        // antigo óbvio, tem que sair
  ]);

  assert.ok(
    apagadas.includes(estendeAAtual),
    `"${estendeAAtual}" sobreviveu — a limpeza está comparando por PREFIXO em ` +
    'vez de nome exato, e todo pré-lançamento vira lixo permanente'
  );
  assert.ok(apagadas.includes('baluarte-v0.5.0-static'));
  assert.equal(apagadas.length, 2, 'apagou algo além do esperado');
});

test('cache de outra aplicação no mesmo domínio não é tocado', async () => {
  /* A limpeza é escopada por `baluarte-`: apagar cache alheio seria pior que
   * deixar o próprio sujo. */
  const { sobraram } = await ativarComCaches([
    `${VERSION_ATUAL}-static`,
    'workbox-precache-v2',
    'outra-app-v1'
  ]);
  assert.ok(sobraram.includes('workbox-precache-v2'));
  assert.ok(sobraram.includes('outra-app-v1'));
});

test('activate sem nenhum cache antigo não quebra', async () => {
  const { sobraram, apagadas } = await ativarComCaches([]);
  assert.deepEqual(sobraram, []);
  assert.deepEqual(apagadas, []);
});
