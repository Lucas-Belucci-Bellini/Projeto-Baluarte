/**
 * Sonda de vazamento — as rotas pesadas soltam o que pegaram? (#420)
 *
 * O `core/ciclo-vida.js` existe para isto: uma página registra `aoSair(...)` e o
 * router executa a limpeza ao trocar de rota. O que faltava era **cobrar**.
 *
 * ── Por que não medir heap ───────────────────────────────────────────────────
 * Heap depois de GC é o instrumento óbvio e o pior: o número oscila com o
 * coletor, com o cache de imagem, com o JIT. Para virar sinal confiável precisa
 * de limiar grande, e limiar grande não pega vazamento pequeno — que é
 * justamente o que se acumula em cem trocas de rota. O heap é medido e
 * **reportado**, mas não reprova nada.
 *
 * ── O que reprova ────────────────────────────────────────────────────────────
 * Contadores determinísticos, instrumentados ANTES do boot:
 *
 *   `setInterval`  — timer que a página abriu e não fechou continua rodando
 *                    para sempre, gastando CPU numa tela que nem está aberta;
 *   `AudioContext` — contexto de áudio não fechado segura hardware, e o
 *                    navegador limita quantos existem por aba.
 *
 * Se o número de ativos **cresce a cada ciclo** de entrar-e-sair, é vazamento —
 * e não tem interpretação alternativa. Um número alto e ESTÁVEL é legítimo (a
 * página abre 3 timers e fecha 3); o que acusa é a inclinação.
 *
 * Escopo (decidido em #420): as rotas mais pesadas, não o site inteiro. Se vier
 * limpo, o item fecha; se acusar, vira item próprio com o vazamento nomeado.
 *
 * Rodar:  npm run sonda-memoria
 */

import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORTA || 4175);
const BASE = process.env.BASE || `http://127.0.0.1:${PORTA}`;
const CHROME = process.env.CHROME_PATH || undefined;
const CICLOS = Number(process.env.CICLOS || 6);
const ESPERA = Number(process.env.ESPERA_MS || 900);

/* As pesadas: WebGL, canvas com laço de animação, áudio e mapa. */
const ROTAS = (process.env.ROTAS || '/home,/cerebro,/radio,/visao,/mapa')
  .split(',').map((r) => r.trim());

/* Instrumentação injetada antes de qualquer script da página. Sobrevive à
 * navegação por hash (é o mesmo documento), que é exatamente o percurso medido. */
const INSTRUMENTO = `
  window.__sonda = { intervalos: new Set(), audios: 0, audiosFechados: 0, quadros: 0 };

  /* requestAnimationFrame é o padrão dominante nestas páginas — 12 delas rodam
   * laço de animação. Um laço que não é cancelado ao sair continua queimando
   * CPU numa tela fechada, e cada visita deixa MAIS um rodando. Não dá pra
   * contar "laços ativos" (rAF não tem identidade estável), então mede-se o que
   * importa de verdade: **quantos quadros são pedidos enquanto se está FORA da
   * rota**. Zero é o esperado. */
  const _raf = window.requestAnimationFrame;
  window.requestAnimationFrame = function (cb) {
    window.__sonda.quadros += 1;
    return _raf.call(this, cb);
  };

  const _setInterval = window.setInterval;
  const _clearInterval = window.clearInterval;
  window.setInterval = function (...a) {
    const id = _setInterval.apply(this, a);
    window.__sonda.intervalos.add(id);
    return id;
  };
  window.clearInterval = function (id) {
    window.__sonda.intervalos.delete(id);
    return _clearInterval.call(this, id);
  };

  const CtxAudio = window.AudioContext || window.webkitAudioContext;
  if (CtxAudio) {
    const Envolvido = function (...a) {
      const ctx = new CtxAudio(...a);
      window.__sonda.audios += 1;
      const _close = ctx.close.bind(ctx);
      ctx.close = () => { window.__sonda.audiosFechados += 1; return _close(); };
      return ctx;
    };
    Envolvido.prototype = CtxAudio.prototype;
    window.AudioContext = Envolvido;
    if (window.webkitAudioContext) window.webkitAudioContext = Envolvido;
  }
`;

const medir = (pag) => pag.evaluate(() => ({
  intervalos: window.__sonda ? window.__sonda.intervalos.size : -1,
  audiosAbertos: window.__sonda ? window.__sonda.audios - window.__sonda.audiosFechados : -1,
  heapMB: performance.memory ? +(performance.memory.usedJSHeapSize / 1048576).toFixed(1) : null
}));

/** Quadros pedidos por segundo ENQUANTO se está fora da rota. Deve ser ~0. */
const quadrosOciosos = async (pag, janelaMs = 600) => {
  const antes = await pag.evaluate(() => window.__sonda.quadros);
  await pag.waitForTimeout(janelaMs);
  const depois = await pag.evaluate(() => window.__sonda.quadros);
  return Math.round(((depois - antes) / janelaMs) * 1000);
};

async function esperarPreview(url, tentativas = 40) {
  for (let i = 0; i < tentativas; i += 1) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (r.ok) return true;
    } catch { /* subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

async function sondar(nav, rota) {
  const pag = await nav.newPage({ viewport: { width: 1280, height: 800 } });
  await pag.addInitScript(INSTRUMENTO);
  const erros = [];
  pag.on('pageerror', (e) => erros.push(String(e.message).slice(0, 120)));

  /* Carrega uma vez e descarta a primeira medição: o primeiro ciclo inclui
   * inicialização única (fontes, workers, cache) que não é vazamento. */
  await pag.goto(`${BASE}/#/sobre`, { waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(ESPERA);

  const amostras = [];
  for (let i = 0; i < CICLOS; i += 1) {
    await pag.evaluate((r) => { location.hash = r; }, rota);
    await pag.waitForTimeout(ESPERA);
    await pag.evaluate(() => { location.hash = '/sobre'; });   // sai da rota
    await pag.waitForTimeout(ESPERA);
    const m = await medir(pag);
    m.quadrosOciosos = await quadrosOciosos(pag);
    amostras.push(m);
  }

  await pag.close();

  const base = amostras[0];
  const fim = amostras[amostras.length - 1];
  /* Inclinação por ciclo, ignorando o primeiro (aquecimento). */
  const porCiclo = (campo) => (fim[campo] - base[campo]) / Math.max(1, amostras.length - 1);

  return {
    rota,
    amostras,
    erros,
    intervalosPorCiclo: porCiclo('intervalos'),
    audiosPorCiclo: porCiclo('audiosAbertos'),
    quadrosOciososFim: fim.quadrosOciosos,
    quadrosPorCiclo: porCiclo('quadrosOciosos'),
    heapInicio: base.heapMB,
    heapFim: fim.heapMB
  };
}

/* ============================== execução ==================================== */

let servidor = null;
if (!process.env.BASE) {
  if (!existsSync(join(raiz, 'dist'))) {
    console.error('sonda: não há dist/. Rode `npm run build` antes.');
    process.exit(1);
  }
  servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--host', '127.0.0.1'],
    { cwd: raiz, stdio: 'ignore' });
  if (!await esperarPreview(BASE)) {
    console.error('sonda: o preview não subiu.');
    servidor.kill();
    process.exit(1);
  }
}

const nav = await chromium.launch({
  ...(CHROME ? { executablePath: CHROME } : {}),
  args: ['--no-sandbox', '--enable-precise-memory-info']
});

console.log(`sonda de memória: ${ROTAS.length} rotas × ${CICLOS} ciclos de entrar-e-sair\n`);

const resultados = [];
for (const rota of ROTAS) {
  const r = await sondar(nav, rota);
  resultados.push(r);
  const serieT = r.amostras.map((a) => a.intervalos).join('→');
  const serieQ = r.amostras.map((a) => a.quadrosOciosos).join('→');
  console.log(
    `${rota.padEnd(11)} timers ${serieT.padEnd(14)} · ` +
    `quadros/s fora da rota ${serieQ.padEnd(22)} · ` +
    `áudio +${r.audiosPorCiclo.toFixed(1)}/ciclo · heap ${r.heapInicio ?? '?'}→${r.heapFim ?? '?'} MB`
  );
  for (const e of r.erros.slice(0, 2)) console.log(`   ⚠ JS: ${e}`);
}

await nav.close();
if (servidor) servidor.kill();

/* ===== Veredito ===== */

/* Meio timer por ciclo já é inclinação: em 100 trocas de rota são 50 timers
 * vivos. Zero é o esperado; a folga existe só para ruído de medição. */
const LIMITE = 0.5;

/* Quadros pedidos numa tela que nem está aberta: acima disso é laço esquecido.
 * A folga existe porque o shell pode animar algo global (o próprio /sobre tem
 * revelação em scroll); o que acusa é a INCLINAÇÃO, não o valor absoluto. */
const LIMITE_QUADROS_POR_CICLO = 5;

const vazando = resultados.filter(
  (r) => r.intervalosPorCiclo > LIMITE
      || r.audiosPorCiclo > LIMITE
      || r.quadrosPorCiclo > LIMITE_QUADROS_POR_CICLO
);
const comErro = resultados.filter((r) => r.erros.length);

console.log('\n' + '─'.repeat(64));

if (comErro.length) {
  console.error('🔴 exceção de JS durante a sondagem:');
  for (const r of comErro) console.error(`   ${r.rota}: ${r.erros[0]}`);
  process.exit(1);
}
if (vazando.length) {
  console.error('🔴 recurso acumulando a cada entrar-e-sair:');
  for (const r of vazando) {
    console.error(`   ${r.rota}: timers +${r.intervalosPorCiclo.toFixed(1)}/ciclo · áudio +${r.audiosPorCiclo.toFixed(1)}/ciclo · quadros ociosos +${r.quadrosPorCiclo.toFixed(1)}/ciclo`);
    console.error(`     timers:  ${r.amostras.map((a) => a.intervalos).join(' → ')}`);
    console.error(`     quadros: ${r.amostras.map((a) => a.quadrosOciosos).join(' → ')}`);
  }
  console.error('\n   A página abre o recurso e não registra a limpeza em `aoSair()`.');
  process.exit(1);
}
console.log('🟢 nenhuma rota pesada acumula timer, laço de animação ou áudio entre visitas.');
console.log('   (heap é informativo — oscila com o coletor e não reprova nada)');
