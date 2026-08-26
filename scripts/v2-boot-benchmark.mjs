/**
 * Benchmark local do boot real da Plataforma V2.
 *
 * Usa o banco de prova existente em v2/harness/ e observa a partida real da
 * Plataforma, sem recriar o Core, sem alterar o harness e sem tocar no router V1.
 * Mede tanto a duração interna exposta por `partida.duracaoMs` quanto o tempo
 * observado no browser até o estado `window.__v2` estar disponível.
 *
 * Rodar: npm run bench:v2:boot
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';
import { performance } from 'node:perf_hooks';

const raiz = process.cwd();
const PORTA = Number(process.env.V2_BOOT_BENCH_PORT || 4185);
const BASE = `http://127.0.0.1:${PORTA}/v2/harness/index.html#/cripto`;
const REPETICOES = Number(process.env.V2_BOOT_BENCH_REPS || 5);
const TIMEOUT_MS = Number(process.env.V2_BOOT_BENCH_TIMEOUT_MS || 25000);

async function esperarServidor(url, tentativas = 40) {
  for (let tentativa = 0; tentativa < tentativas; tentativa += 1) {
    try {
      const resposta = await fetch(url, { signal: AbortSignal.timeout(1500) });
      const corpo = await resposta.text();
      if (resposta.ok && corpo.includes('Baluarte V2') && corpo.includes('id="saida"')) return true;
    } catch { /* servidor ainda subindo */ }
    await new Promise((pronto) => setTimeout(pronto, 500));
  }
  return false;
}

function percentil(valores, p) {
  const ordenados = [...valores].sort((a, b) => a - b);
  const indice = Math.max(0, Math.ceil(ordenados.length * p) - 1);
  return Number(ordenados[indice].toFixed(3));
}

function resumo(valores) {
  return {
    p50Ms: percentil(valores, 0.5),
    p95Ms: percentil(valores, 0.95),
    mediaMs: Number((valores.reduce((soma, valor) => soma + valor, 0) / valores.length).toFixed(3)),
    maxMs: Number(Math.max(...valores).toFixed(3)),
  };
}

function iniciarPreview() {
  const require = createRequire(import.meta.url);
  const viteBin = (() => {
    try {
      return path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
    } catch {
      return path.join(raiz, 'node_modules', 'vite', 'bin', 'vite.js');
    }
  })();
  return spawn(process.execPath, [viteBin, '--port', String(PORTA), '--strictPort', '--host', '127.0.0.1'], {
    cwd: raiz,
    stdio: 'ignore',
    detached: false,
  });
}

async function medirPartida(browser, repeticao) {
  const contexto = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const pagina = await contexto.newPage();
  const inicioBrowser = performance.now();
  const erros = [];
  pagina.on('pageerror', (erro) => erros.push(String(erro.message).slice(0, 200)));
  try {
    await pagina.goto(BASE, { waitUntil: 'domcontentloaded', timeout: TIMEOUT_MS });
    await pagina.waitForFunction(() => globalThis.__v2?.partida, null, { timeout: TIMEOUT_MS });
    const observacao = await pagina.evaluate(() => ({
      partida: globalThis.__v2.partida,
      resultado: globalThis.__v2.resultado,
      rotas: globalThis.__v2.totalRotas,
      erros: globalThis.__v2.diagnostico?.()?.boot?.falhas ?? [],
    }));
    const browserReadyMs = performance.now() - inicioBrowser;
    if (erros.length) throw new Error(`erro JS não capturado: ${erros[0]}`);
    if (observacao.partida.estado !== 'ready') {
      throw new Error(`estado de partida não é ready: ${JSON.stringify(observacao.partida)}`);
    }
    if (!Number.isFinite(observacao.partida.duracaoMs) || observacao.partida.duracaoMs < 0) {
      throw new Error(`duracaoMs inválida: ${JSON.stringify(observacao.partida)}`);
    }
    if (observacao.resultado?.vivos?.length !== 7 || observacao.resultado?.falhas?.length !== 0) {
      throw new Error(`módulos V2 inesperados: ${JSON.stringify(observacao.resultado)}`);
    }
    if (observacao.rotas !== 20 || observacao.erros.length !== 0) {
      throw new Error(`rotas ou falhas do boot inesperadas: ${JSON.stringify(observacao)}`);
    }
    return {
      repeticao,
      estado: observacao.partida.estado,
      bootMs: Number(observacao.partida.duracaoMs.toFixed(3)),
      browserReadyMs: Number(browserReadyMs.toFixed(3)),
      modulos: observacao.resultado.vivos.length,
      rotas: observacao.rotas,
    };
  } finally {
    await contexto.close().catch(() => {});
  }
}

if (!Number.isInteger(REPETICOES) || REPETICOES < 1 || REPETICOES > 10) {
  throw new Error('V2_BOOT_BENCH_REPS deve ser um inteiro entre 1 e 10');
}
if (!Number.isInteger(TIMEOUT_MS) || TIMEOUT_MS < 1000 || TIMEOUT_MS > 60000) {
  throw new Error('V2_BOOT_BENCH_TIMEOUT_MS deve estar entre 1000 e 60000');
}

let preview;
let browser;
try {
  preview = iniciarPreview();
  if (!await esperarServidor(`${BASE}`)) {
    throw new Error(`preview não subiu em http://127.0.0.1:${PORTA}`);
  }
  browser = await chromium.launch({ args: ['--no-sandbox'] });
  const amostras = [];
  for (let repeticao = 1; repeticao <= REPETICOES; repeticao += 1) {
    amostras.push(await medirPartida(browser, repeticao));
  }

  const resultado = {
    benchmark: 'v2-boot-real-local',
    estado: 'passou',
    alvo: 'v2/harness/index.html#/cripto',
    repeticoes: REPETICOES,
    timeoutMs: TIMEOUT_MS,
    amostras,
    metricas: {
      bootInterno: resumo(amostras.map((amostra) => amostra.bootMs)),
      browserReady: resumo(amostras.map((amostra) => amostra.browserReadyMs)),
    },
    invariantes: {
      modulosVivos: 7,
      falhasBoot: 0,
      rotasV1: 20,
      estado: 'ready',
    },
    interpretacao: 'diagnostico local; sem threshold, SLA ou budget de producao',
  };
  console.log(JSON.stringify(resultado, null, 2));
} finally {
  await browser?.close();
  preview?.kill();
}
