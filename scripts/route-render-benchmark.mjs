/**
 * Benchmark local de renderização das rotas reais do Baluarte.
 *
 * O smoke continua sendo o gate funcional. Este instrumento mede, sem alterar o
 * smoke, o caminho real de cada rota descoberta de src/main.js contra um preview
 * de produção: tempo até DOMContentLoaded e tempo observado após settle bounded.
 * Não define SLA, threshold ou budget de produção.
 *
 * Rodar: npm run bench:routes
 */

import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { createRequire } from 'node:module';
import { performance } from 'node:perf_hooks';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.ROUTE_BENCH_PORT || 4183);
const BASE = `http://127.0.0.1:${PORTA}`;
const REPETICOES = Number(process.env.ROUTE_BENCH_REPS || 3);
const SETTLE_MS = Number(process.env.ROUTE_BENCH_SETTLE_MS || 900);
const TIMEOUT_MS = Number(process.env.ROUTE_BENCH_TIMEOUT_MS || 15000);
const TEXTO_MINIMO = 60;

function descobrirRotas() {
  const main = readFileSync(join(raiz, 'src/main.js'), 'utf8');
  return [...main.matchAll(/^router\.register\('([^']+)'/gm)].map((match) => match[1]);
}

function esperarPreview(url, tentativas = 40) {
  return new Promise(async (resolve) => {
    for (let tentativa = 0; tentativa < tentativas; tentativa += 1) {
      try {
        const resposta = await fetch(url, { signal: AbortSignal.timeout(1500) });
        if (resposta.ok) return resolve(true);
      } catch { /* preview ainda subindo */ }
      await new Promise((pronto) => setTimeout(pronto, 500));
    }
    resolve(false);
  });
}

function percentil(valores, p) {
  const ordenados = [...valores].sort((a, b) => a - b);
  const indice = Math.max(0, Math.ceil(ordenados.length * p) - 1);
  return Number(ordenados[indice].toFixed(3));
}

function resumoTempos(itens, campo) {
  const valores = itens.map((item) => item[campo]);
  return {
    p50Ms: percentil(valores, 0.5),
    p95Ms: percentil(valores, 0.95),
    maxMs: Number(Math.max(...valores).toFixed(3)),
    mediaMs: Number((valores.reduce((soma, valor) => soma + valor, 0) / valores.length).toFixed(3)),
  };
}

async function medirRodada(browser, rotas) {
  const itens = [];
  for (const rota of rotas) {
    const pagina = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    try {
      const erros = [];
      pagina.on('pageerror', (erro) => erros.push(String(erro.message).slice(0, 200)));
      const inicio = performance.now();
      let info;
      let navigationMs = null;
      try {
        const inicioNavegacao = performance.now();
        await pagina.goto(`${BASE}/#${rota}`, {
          waitUntil: 'domcontentloaded',
          timeout: TIMEOUT_MS,
        });
        navigationMs = performance.now() - inicioNavegacao;
        await pagina.waitForTimeout(SETTLE_MS);
        info = await pagina.evaluate(() => {
          const alvo = document.querySelector('main') || document.body;
          const texto = (alvo.innerText || '').trim();
          const vazio = alvo.querySelector('.empty-state__title');
          const rotuloVazio = (vazio?.innerText || '').trim();
          return {
            texto: texto.length,
            nos: alvo.querySelectorAll('*').length,
            naoEncontrada: /rota não encontrada|falha ao carregar/i.test(rotuloVazio),
          };
        });
      } catch (erro) {
        itens.push({
          rota,
          estado: 'falhou',
          navigationMs,
          settledMs: Number((performance.now() - inicio).toFixed(3)),
          texto: 0,
          nos: 0,
          erro: String(erro.message || erro).slice(0, 200),
        });
        continue;
      }

      const estado = erros.length ? 'erro-js' : info.naoEncontrada ? 'nao-encontrada' : info.texto < TEXTO_MINIMO ? 'quase-vazia' : 'verde';
      itens.push({
        rota,
        estado,
        navigationMs: Number(navigationMs.toFixed(3)),
        settledMs: Number((performance.now() - inicio).toFixed(3)),
        texto: info.texto,
        nos: info.nos,
        ...(erros.length ? { erro: erros[0] } : {}),
      });
    } finally {
      await pagina.close().catch(() => {});
    }
  }
  return itens;
}

function iniciarPreview() {
  const viteBin = (() => {
    try {
      return join(dirname(createRequire(import.meta.url).resolve('vite/package.json')), 'bin', 'vite.js');
    } catch {
      return join(raiz, 'node_modules', 'vite', 'bin', 'vite.js');
    }
  })();
  return spawn(process.execPath, [viteBin, 'preview', '--port', String(PORTA), '--strictPort', '--host', '127.0.0.1'], {
    cwd: raiz,
    stdio: 'ignore',
    detached: false,
  });
}

if (!existsSync(join(raiz, 'dist'))) {
  console.error('route benchmark: não há dist/. Rode npm run build antes.');
  process.exit(1);
}
if (!Number.isInteger(REPETICOES) || REPETICOES < 1 || REPETICOES > 10) {
  throw new Error('ROUTE_BENCH_REPS deve ser um inteiro entre 1 e 10');
}
if (!Number.isInteger(SETTLE_MS) || SETTLE_MS < 0 || SETTLE_MS > 5000) {
  throw new Error('ROUTE_BENCH_SETTLE_MS deve estar entre 0 e 5000');
}

const rotas = descobrirRotas();
if (!rotas.length) throw new Error('nenhuma rota foi descoberta em src/main.js');

let preview;
let browser;
try {
  preview = iniciarPreview();
  if (!await esperarPreview(`${BASE}/`)) throw new Error(`preview não subiu em ${BASE}`);
  browser = await chromium.launch({ args: ['--no-sandbox'] });

  const rodadas = [];
  for (let repeticao = 0; repeticao < REPETICOES; repeticao += 1) {
    const inicio = performance.now();
    const itens = await medirRodada(browser, rotas);
    const falhas = itens.filter((item) => item.estado !== 'verde');
    if (itens.length !== rotas.length) throw new Error(`rodada incompleta: ${itens.length}/${rotas.length}`);
    if (falhas.length) {
      throw new Error(`benchmark encontrou ${falhas.length} rota(s) não-verde: ${JSON.stringify(falhas.slice(0, 3))}`);
    }
    rodadas.push({
      repeticao: repeticao + 1,
      totalMs: Number((performance.now() - inicio).toFixed(3)),
      itens,
    });
  }

  const todos = rodadas.flatMap((rodada) => rodada.itens);
  const lentas = [...todos].sort((a, b) => b.settledMs - a.settledMs).slice(0, 8).map((item) => ({
    rota: item.rota,
    settledMs: item.settledMs,
    navigationMs: item.navigationMs,
  }));
  const resultado = {
    benchmark: 'route-render-local',
    estado: 'passou',
    dataset: 'rotas descobertas de src/main.js',
    rotas: rotas.length,
    repeticoes: REPETICOES,
    settleMs: SETTLE_MS,
    timeoutMs: TIMEOUT_MS,
    rodadas: rodadas.map(({ repeticao, totalMs }) => ({ repeticao, totalMs })),
    metricas: {
      navigation: resumoTempos(todos, 'navigationMs'),
      settled: resumoTempos(todos, 'settledMs'),
    },
    oitoMaisLentas: lentas,
    interpretacao: 'diagnostico local; sem threshold, SLA ou budget de producao',
  };
  console.log(JSON.stringify(resultado, null, 2));
} finally {
  await browser?.close();
  preview?.kill();
}
