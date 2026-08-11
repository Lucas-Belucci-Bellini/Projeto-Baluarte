/**
 * Quanto o Core da V2 realmente CUSTA — medido, não estimado.
 *
 * Este arquivo existe por causa de uma pergunta que não se responde por gosto:
 * *"o Core deveria estar em outra linguagem?"*. Antes de comparar linguagens é
 * preciso saber **qual é o trabalho**. Um Core que gasta microssegundos por
 * operação não melhora com linguagem mais rápida; um que gasta milissegundos
 * por evento, melhora.
 *
 * O que se mede aqui é o caminho real, não um microbenchmark inventado: subir o
 * sistema, validar manifestos, selar o registro, despachar eventos e escalonar
 * tarefas — nas quantidades que o Baluarte tem hoje e nas que ele pretende ter.
 *
 * Rodar:  node v2/bench/core-js.mjs
 */

import { criarRegistry } from '../core/registry.js';
import { criarBoot } from '../core/boot.js';
import { criarBus } from '../core/bus.js';
import { criarMetricas } from '../core/metricas.js';
import { criarEscalonador } from '../core/trabalho.js';
import { criarResolvedorApi } from '../core/api.js';
import { criarPermissoes } from '../core/permissoes.js';
import { validar, normalizar } from '../core/manifest.js';
import { definirDestino, definirNivelMinimo } from '../core/log.js';

/* Silencia o log: medir o console é medir o terminal. */
definirDestino(() => {});
definirNivelMinimo('erro');

const fmt = (n) => (n >= 1 ? `${n.toFixed(3)} ms` : `${(n * 1000).toFixed(1)} µs`);

/** @param {string} nome @param {number} vezes @param {() => any} fn */
function medir(nome, vezes, fn) {
  fn(); fn();                       // aquece o JIT — senão mede-se a compilação
  const t0 = performance.now();
  for (let i = 0; i < vezes; i++) fn();
  const total = performance.now() - t0;
  console.log(`  ${nome.padEnd(46)} ${fmt(total / vezes).padStart(11)}/op   (${vezes}x, ${total.toFixed(1)} ms)`);
  return total / vezes;
}

const modulo = (i) => ({
  id: `mod-${i}`, name: `Módulo ${i}`, version: '1.0.0',
  description: 'gerado para medição', stability: 'beta', icon: '•',
  routes: [{ path: `/mod-${i}`, view: () => Promise.resolve({}) }],
  nav: { section: 'x', order: i },
  storage: [{ key: `mod-${i}:estado`, version: 1, class: 'local' }],
  events: { emits: [`mod-${i}:pronto`], consumes: ['core:boot'] },
  permissions: i % 3 === 0 ? ['NETWORK'] : [],
  lifecycle: { init: () => {}, dispose: () => {} }
});

const routerFalso = () => ({ n: 0, register() { this.n++; } });

function montar(qtd) {
  const registry = criarRegistry();
  for (let i = 0; i < qtd; i++) registry.registrar(modulo(i));
  registry.selar();
  const metricas = criarMetricas();
  return criarBoot(registry, {
    storage: { get: () => undefined, set: () => true },
    bus: criarBus(), metricas,
    trabalho: criarEscalonador({ limite: 8 }, { metricas }),
    apis: criarResolvedorApi(registry),
    permissoes: criarPermissoes()
  }, { router: routerFalso() });
}

const resultados = {};

console.log('\n═══ 1. Validação de manifesto (por módulo) ═══');
const m1 = normalizar(modulo(1));
resultados.validar = medir('validar() um manifesto', 200_000, () => validar(m1));

console.log('\n═══ 2. Selar o registro — ordenação topológica + colisões ═══');
for (const n of [10, 100, 1000]) {
  const mods = Array.from({ length: n }, (_, i) => modulo(i));
  resultados[`selar${n}`] = medir(`selar() com ${n} módulos`, n > 500 ? 200 : 2000, () => {
    const r = criarRegistry();
    for (const m of mods) r.registrar(m);
    r.selar();
  });
}

console.log('\n═══ 3. Boot completo — init de todos + registro de rotas ═══');
for (const n of [10, 100, 1000]) {
  const b = montar(n);
  const t0 = performance.now();
  await b.subir();
  const t = performance.now() - t0;
  console.log(`  boot com ${String(n).padEnd(4)} módulos`.padEnd(48) + `${t.toFixed(2)} ms`.padStart(11));
  resultados[`boot${n}`] = t;
  await b.descer();
}

console.log('\n═══ 4. Event Bus — o "sistema nervoso" ═══');
const bus = criarBus();
let recebidos = 0;
for (let i = 0; i < 20; i++) bus.on(`ev:${i}`, () => { recebidos++; });
bus.on('*', () => { recebidos++; });
const carga = { id: 'abc-123', valor: 42, texto: 'um payload realista', lista: [1, 2, 3] };
resultados.emit = medir('emit() com 1 ouvinte direto + 1 curinga', 500_000,
  () => bus.emit('ev:7', carga, { origem: 'bench' }));

console.log('\n═══ 5. Escalonador — tarefas assíncronas ═══');
{
  const e = criarEscalonador({ limite: 8, tetoFila: 200_000 }, { metricas: criarMetricas() });
  const N = 50_000;
  const t0 = performance.now();
  await Promise.all(Array.from({ length: N }, (_, i) =>
    e.enfileirar('bench', 't', () => i * 2)));
  const t = performance.now() - t0;
  console.log(`  ${String(N)} tarefas triviais`.padEnd(48) + `${(t * 1000 / N).toFixed(1)} µs`.padStart(11) + `   (${t.toFixed(0)} ms total)`);
  resultados.tarefa = t / N;
}

console.log('\n═══ 6. Permissões — a consulta que roda em todo acesso ═══');
{
  const p = criarPermissoes();
  p.conhecerModulos([{ id: 'm', permissions: ['NETWORK'] }]);
  p.conceder('m', 'NETWORK', { origem: 'bench' });
  resultados.pode = medir('pode() concedida', 2_000_000, () => p.pode('m', 'NETWORK'));
}

console.log('\n═══ RESUMO ═══');
console.log(`  O Core gasta ${fmt(resultados.emit)} por evento e ${fmt(resultados.validar)} por manifesto.`);
console.log(`  Subir 1000 módulos leva ${resultados.boot1000.toFixed(0)} ms — uma vez, no boot.`);
console.log(`  Uma consulta de permissão custa ${fmt(resultados.pode)}.\n`);
