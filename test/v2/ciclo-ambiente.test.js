/**
 * `ambiente` deixa de ser palavra e vira regra.
 *
 * O manifesto da V2 declara `ambiente` desde sempre e o `manifest.js` valida o
 * valor — mas **ninguém nunca perguntou**. A regra do mega-plano #238 ("web
 * leve, app completo") era honra, não mecanismo: um módulo declarado `app` subia
 * na web exatamente como qualquer outro. É a mesma doença do `starting`:
 * vocabulário sem produtor.
 *
 * A V1 já cobrava isso em `src/core/flags.ts`. Isto traz a mesma regra para a V2.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarCiclo, pertenceAoAmbiente } from '../../v2/core/ciclo.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';
import { definirDestino, coletor } from '../../v2/core/log.js';

const deps = {
  storage: { get: () => undefined, set: () => true },
  permissoes: criarPermissoes()
};

const mod = (id, ambiente, lifecycle = {}) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  ...(ambiente ? { ambiente } : {}),
  lifecycle
});

function montar(...mods) {
  const r = criarRegistry();
  mods.forEach((m) => r.registrar(m));
  r.selar();
  return r;
}

beforeEach(() => { definirDestino(coletor().destino); });

/* ═══════════ a regra, isolada ═══════════ */

test('a regra: `ambos` combina com tudo, dos dois lados', () => {
  assert.equal(pertenceAoAmbiente('ambos', 'web'), true);
  assert.equal(pertenceAoAmbiente('ambos', 'app'), true);
  /* Ciclo sem ambiente declarado (`ambos`) não filtra ninguém — é como todo
   * consumidor existente roda hoje. */
  assert.equal(pertenceAoAmbiente('app', 'ambos'), true);
  assert.equal(pertenceAoAmbiente('web', 'ambos'), true);
});

test('a regra: declarado e atual diferentes NÃO combinam', () => {
  assert.equal(pertenceAoAmbiente('app', 'web'), false);
  assert.equal(pertenceAoAmbiente('web', 'app'), false);
});

test('a regra: manifesto sem `ambiente` conta como `ambos`', () => {
  /* `ambiente` é opcional no manifesto, e ausência não pode virar exclusão:
   * módulo que nunca opinou sobre ambiente sobe em qualquer um. */
  assert.equal(pertenceAoAmbiente(undefined, 'web'), true);
  assert.equal(pertenceAoAmbiente(undefined, 'app'), true);
});

/* ═══════════ a regra, aplicada pelo ciclo ═══════════ */

test('na web, um módulo de app é ignorado — e nenhuma fase dele roda', async () => {
  /* A asserção que dá nome ao arquivo. Antes disto o `passos` ficava cheio: o
   * módulo de app executava `init` e `start` na web, e o único sinal de que
   * estava no lugar errado era o manifesto — que ninguém lia. */
  const passos = [];
  const registry = montar(
    mod('so-app', 'app', { init: () => passos.push('init'), start: () => passos.push('start') }),
    mod('ambos', 'ambos')
  );
  const ciclo = criarCiclo(registry, deps, { ambiente: 'web' });
  const r = await ciclo.subir();

  assert.deepEqual(passos, [], 'nenhuma fase do módulo de app pode rodar na web');
  assert.deepEqual(r.ignorados, ['so-app']);
  assert.deepEqual(r.vivos, ['ambos']);
});

test('ignorado NÃO é falha: o boot continua ok', async () => {
  /* Somar `ignorados` a `falhas` faria `ok` virar false num boot perfeitamente
   * correto, e o operador procuraria defeito onde há regra cumprida. */
  const registry = montar(mod('so-app', 'app'));
  const r = await criarCiclo(registry, deps, { ambiente: 'web' }).subir();
  assert.equal(r.ok, true);
  assert.deepEqual(r.falhas, []);
  assert.deepEqual(r.ignorados, ['so-app']);
});

test('no app, o módulo de app sobe — a regra corta dos dois lados', async () => {
  /* Sem esta, um filtro que barrasse TUDO passaria no teste anterior. */
  const registry = montar(mod('so-app', 'app', { init: () => {} }));
  const r = await criarCiclo(registry, deps, { ambiente: 'app' }).subir();
  assert.deepEqual(r.vivos, ['so-app']);
  assert.deepEqual(r.ignorados, []);
});

test('sem `ambiente` no ciclo, nada é filtrado — o comportamento de sempre', async () => {
  /* Compatibilidade: todo consumidor existente constrói o ciclo sem esta opção.
   * Se o padrão filtrasse, o filtro novo quebraria quem não pediu por ele. */
  const registry = montar(mod('so-app', 'app'), mod('so-web', 'web'));
  const r = await criarCiclo(registry, deps).subir();
  assert.deepEqual([...r.vivos].sort(), ['so-app', 'so-web']);
  assert.deepEqual(r.ignorados, []);
});

test('quem depende de um módulo ignorado não cai em cascata', async () => {
  /* Ausência por REGRA não é ausência por defeito. Tratar as duas igual faria um
   * módulo perfeitamente válido ser desativado na web porque um irmão de app não
   * estava lá — e a mensagem diria "dependência falhou", que seria mentira. */
  const registry = montar(
    mod('so-app', 'app'),
    { ...mod('depende', 'ambos', { init: () => {} }), dependencies: ['so-app'] }
  );
  const r = await criarCiclo(registry, deps, { ambiente: 'web' }).subir();

  assert.deepEqual(r.ignorados, ['so-app']);
  assert.deepEqual(r.vivos, ['depende'], 'o dependente não pode cair por regra de ambiente');
  assert.deepEqual(r.falhas, []);
});
