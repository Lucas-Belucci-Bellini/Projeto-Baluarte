/**
 * Benchmark local do Event Bus V2.
 *
 * Este é um instrumento de medição, não um gate de CI: números de sandbox
 * variam com CPU, scheduler e versão do Node. O runtime continua usando apenas
 * o resumo bounded de `bus.saude().latencia`; o benchmark mede cenários reais do
 * bus e registra o ambiente para comparação posterior.
 *
 * Rodar:
 *   node scripts/event-bus-latency-benchmark.mjs
 *   BUS_BENCH_N=50000 node scripts/event-bus-latency-benchmark.mjs
 */

import os from 'node:os';
import { criarBus } from '../v2/core/bus.js';

const OPERACOES = boundedInteger(process.env.BUS_BENCH_N, 20_000, 100, 1_000_000);
const AQUECIMENTO = boundedInteger(process.env.BUS_BENCH_WARMUP, 2_000, 10, 100_000);
const fmt = (n, casas = 2) => Number(n.toFixed(casas));

function boundedInteger(raw, fallback, minimo, maximo) {
  const value = raw === undefined ? fallback : Number(raw);
  if (!Number.isInteger(value) || value < minimo) return fallback;
  return Math.min(value, maximo);
}

function montarBus(diretos) {
  const bus = criarBus();
  let recebidos = 0;
  for (let i = 0; i < diretos; i += 1) {
    bus.on('bench:event', () => { recebidos += 1; });
  }
  bus.on('*', () => { recebidos += 1; });
  return { bus, recebidos: () => recebidos };
}

function medirCenario(nome, diretos) {
  const quente = montarBus(diretos);
  for (let i = 0; i < AQUECIMENTO; i += 1) quente.bus.emit('bench:event', { i }, { origem: 'benchmark' });

  /* `limpar()` também remove ouvintes; recriar o bus evita misturar aquecimento
   * com a amostra e mantém a mesma superfície de produção. */
  const medido = montarBus(diretos);
  const inicio = performance.now();
  for (let i = 0; i < OPERACOES; i += 1) {
    medido.bus.emit('bench:event', { i, payload: 'bounded' }, { origem: 'benchmark' });
  }
  const totalMs = performance.now() - inicio;
  const health = medido.bus.saude();
  const esperado = OPERACOES * (diretos + 1);

  if (medido.recebidos() !== esperado) {
    throw new Error(`${nome}: despacho incompleto (${medido.recebidos()}/${esperado})`);
  }
  if (health.latencia.n !== OPERACOES) {
    throw new Error(`${nome}: amostra de latência incompleta (${health.latencia.n}/${OPERACOES})`);
  }

  return {
    nome,
    ouvintesDiretos: diretos,
    operacoes: OPERACOES,
    totalMs: fmt(totalMs, 3),
    mediaExternaUs: fmt((totalMs * 1000) / OPERACOES, 3),
    operacoesPorSegundo: Math.round(OPERACOES / (totalMs / 1000)),
    latenciaInterna: health.latencia,
  };
}

const resultados = [
  medirCenario('1 direto + curinga', 1),
  medirCenario('10 diretos + curinga', 10),
  medirCenario('20 diretos + curinga', 20),
];

console.log(JSON.stringify({
  benchmark: 'v2-event-bus-latency',
  data: new Date().toISOString(),
  node: process.version,
  plataforma: `${process.platform}/${process.arch}`,
  cpu: os.cpus()[0]?.model ?? 'unknown',
  operacoesPorCenario: OPERACOES,
  aquecimentoPorCenario: AQUECIMENTO,
  observacao: 'medição local; não é threshold de produção nem promessa de hardware',
  resultados,
}, null, 2));
