/**
 * Auditoria profunda, grupo a grupo (docs/nexus/grupos-auditoria.json).
 *
 * O vigia (`npm run smoke`) responde "a tela abre?". Este responde "a tela está
 * BOA?" — que é outra pergunta, e é a que precisa ser feita 97 vezes antes da
 * 1.0.0.
 *
 * O que ele mede, por tela, sem opinião:
 *
 *  - VAZAMENTO: navega pra tela, sai dela e volta pra home, e conta o que
 *    SOBREVIVEU — listener de window/document, setInterval não limpo,
 *    AudioContext aberto e observer não desconectado. É o defeito clássico de
 *    SPA: não aparece em teste de tela única, só depois de o operador circular
 *    pelo site e a aba ficar lenta;
 *  - PESO: quanto de JS a rota baixou além do boot, medido na rede;
 *  - ACESSIBILIDADE: h1 único, campo sem rótulo, imagem sem alt, botão sem
 *    nome — o mínimo que separa "funciona" de "utilizável";
 *  - ESTREITO: a tela sobrevive a 390 px sem estourar a largura;
 *  - RENDER: tempo até a tela ter conteúdo.
 *
 * Rodar:  npm run auditar 1        (grupo 1)
 *         npm run auditar 1,2,3    (vários)
 *         ROTAS=/home npm run auditar
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORTA || 4173);
const BASE = process.env.BASE || `http://127.0.0.1:${PORTA}`;
const CHROME = process.env.CHROME_PATH || undefined;

const grupos = JSON.parse(readFileSync(join(raiz, 'docs/nexus/grupos-auditoria.json'), 'utf8'));

function alvos() {
  if (process.env.ROTAS) return { nome: 'avulso', rotas: process.env.ROTAS.split(',').map((r) => r.trim()) };
  const ids = (process.argv[2] || '1').split(',').map((n) => Number(n.trim()));
  const escolhidos = grupos.grupos.filter((g) => ids.includes(g.id));
  if (!escolhidos.length) {
    console.error(`Grupo não encontrado. Disponíveis: ${grupos.grupos.map((g) => `${g.id}=${g.nome}`).join(' · ')}`);
    process.exit(1);
  }
  return {
    nome: escolhidos.map((g) => `${g.id}. ${g.nome}`).join(' + '),
    rotas: escolhidos.flatMap((g) => g.rotas),
  };
}

/* Instrumentação injetada ANTES de qualquer script da página.
 *
 * Medir vazamento em SPA é fácil de fazer errado. A primeira versão deste
 * espião contava toda chamada de `requestAnimationFrame` como vazamento e
 * concluiu que as 10 telas do grupo 1 vazavam — o que é falso: rAF é de uma
 * tomada só, não cancelar não vaza nada. Mesma armadilha do alarme que mente.
 *
 * O que realmente sobrevive à troca de rota, e por isso é o que se mede:
 *
 *  - listener em `window`/`document` — os de elemento morrem junto com o DOM
 *    da página; os do objeto global ficam para sempre;
 *  - `setInterval` não limpo — continua disparando na tela seguinte;
 *  - LOOP de animação vivo — não a contagem de rAF, e sim se ainda há quadro
 *    sendo pedido DEPOIS de sair da tela;
 *  - AudioContext não fechado — segura o microfone e a saída de som;
 *  - observer não desconectado.
 */
const ESPIAO = `
window.__espiao = { globais: 0, intervals: 0, audio: 0, observers: 0, quadros: 0 };

/* Só listener de window/document: os de elemento vão embora com o DOM.
 *
 * \`{ once: true }\` precisa de tratamento próprio: o navegador remove o listener
 * sozinho depois do primeiro disparo, SEM passar por \`removeEventListener\` — o
 * contador ingênuo nunca decrementava e acusava vazamento em quem estava
 * limpando certo. Foi o que fez /radar e /triangulacao aparecerem vazando: as
 * duas usam \`hashchange\` com \`once\` para se despedir, que é correto. */
for (const alvo of [window, document]) {
  const _add = alvo.addEventListener.bind(alvo);
  const _rem = alvo.removeEventListener.bind(alvo);
  alvo.addEventListener = function (tipo, fn, opts) {
    window.__espiao.globais++;
    const umaVez = opts === true ? false : !!(opts && opts.once);
    if (umaVez && typeof fn === 'function') {
      const original = fn;
      fn = function (...ev) { window.__espiao.globais--; return original.apply(this, ev); };
    }
    return _add(tipo, fn, opts);
  };
  alvo.removeEventListener = function (...a) { window.__espiao.globais--; return _rem(...a); };
}

const _si = window.setInterval, _ci = window.clearInterval;
window.setInterval = function (...a) { window.__espiao.intervals++; return _si.apply(window, a); };
window.clearInterval = function (...a) { window.__espiao.intervals--; return _ci.apply(window, a); };

/* Conta QUADROS pedidos, pra medir se o loop continua vivo depois da troca. */
const _raf = window.requestAnimationFrame;
window.requestAnimationFrame = function (cb) {
  return _raf.call(window, (t) => { window.__espiao.quadros++; return cb(t); });
};

if (window.AudioContext) {
  const _AC = window.AudioContext;
  window.AudioContext = function (...a) {
    window.__espiao.audio++;
    const ctx = new _AC(...a);
    const _close = ctx.close.bind(ctx);
    ctx.close = function (...b) { window.__espiao.audio--; return _close(...b); };
    return ctx;
  };
}

for (const O of ['IntersectionObserver', 'MutationObserver', 'ResizeObserver']) {
  if (!window[O]) continue;
  const _O = window[O];
  window[O] = function (...a) {
    window.__espiao.observers++;
    const obs = new _O(...a);
    const _dis = obs.disconnect.bind(obs);
    obs.disconnect = function () { window.__espiao.observers--; return _dis(); };
    return obs;
  };
}
`;

async function auditarRota(nav, rota) {
  const pag = await nav.newPage({ viewport: { width: 1440, height: 900 } });
  await pag.addInitScript(ESPIAO);

  /* O peso é medido na PRIMEIRA visita, durante o aquecimento: na segunda o
   * chunk já está em cache e a rota apareceria com 0 kB. */
  let bytesJs = 0;
  let medindoPeso = false;
  const problemas = [];
  pag.on('response', async (r) => {
    if (!medindoPeso) return;
    if (!r.url().startsWith(BASE)) return;
    if (!/\.js(\?|$)/.test(r.url())) return;
    try { bytesJs += (await r.body()).length; } catch { /* já descartado */ }
  });
  pag.on('pageerror', (e) => problemas.push(`exceção: ${String(e.message).slice(0, 140)}`));

  /* 1) boot na home e RODADA DE AQUECIMENTO.
   *
   * A medição ingênua — linha de base logo após o boot, uma ida e volta,
   * comparar — dá falso positivo: o site liga a telemetria do Nexus 3 s depois
   * do boot, e ela registra dois listeners globais que caíam dentro da janela
   * medida. Todas as 10 telas do grupo 1 apareceram "vazando globais+2" por
   * causa disso.
   *
   * A rodada dupla resolve sem precisar conhecer cada caso: o que é de uma vez
   * só acontece no aquecimento e sai da conta; o que é POR NAVEGAÇÃO se repete
   * na rodada medida e aparece. */
  await pag.goto(`${BASE}/#/home`, { waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(4000);              // passa dos 3 s da telemetria
  medindoPeso = true;
  await pag.goto(`${BASE}/#${rota}`, { waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(1200);
  medindoPeso = false;
  await pag.goto(`${BASE}/#/home`, { waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(1200);

  const base = await pag.evaluate(() => ({ ...window.__espiao }));

  /* 2) entra na rota — agora valendo */
  const t0 = Date.now();
  await pag.goto(`${BASE}/#${rota}`, { waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(1500);
  const ms = Date.now() - t0;

  const tela = await pag.evaluate(() => {
    const alvo = document.querySelector('main') || document.body;
    const semRotulo = [...alvo.querySelectorAll('input,select,textarea')].filter((c) => {
      if (c.type === 'hidden') return false;
      /* Sem caixa de layout = fora da árvore de acessibilidade: um leitor de
       * tela nunca chega nele. É o caso do `input type=file` escondido atrás de
       * um botão (`/ocr`), padrão comum e correto — cobrar rótulo dele seria
       * alarme falso. `getClientRects()` e não `offsetParent`, que também é
       * nulo em elemento `position: fixed` — esse aparece e precisa de rótulo. */
      if (!c.getClientRects().length) return false;
      return !c.labels?.length && !c.getAttribute('aria-label') && !c.getAttribute('aria-labelledby')
        && !c.getAttribute('placeholder') && !c.getAttribute('title');
    }).length;
    return {
      texto: (alvo.innerText || '').trim().length,
      h1: alvo.querySelectorAll('h1').length,
      semRotulo,
      imgSemAlt: [...alvo.querySelectorAll('img')].filter((i) => !i.hasAttribute('alt')).length,
      botaoSemNome: [...alvo.querySelectorAll('button')].filter(
        (b) => !(b.innerText || '').trim() && !b.getAttribute('aria-label') && !b.getAttribute('title')).length,
    };
  });

  /* 3) tela estreita: a largura não pode estourar */
  await pag.setViewportSize({ width: 390, height: 844 });
  await pag.waitForTimeout(600);
  const estouraLargura = await pag.evaluate(() =>
    document.documentElement.scrollWidth > document.documentElement.clientWidth + 2);
  await pag.setViewportSize({ width: 1440, height: 900 });

  /* 4) sai da rota — o que sobrar aqui sobreviveu de verdade */
  await pag.goto(`${BASE}/#/home`, { waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(1500);
  const depois = await pag.evaluate(() => ({ ...window.__espiao }));

  /* Loop vivo: zera o contador de quadros e vê se alguém ainda pede quadro
   * meio segundo DEPOIS de a tela ter saído. A home tem animação própria, e a
   * linha de base cuida disso — o que interessa é o excedente. */
  const quadrosSoltos = await pag.evaluate(async () => {
    window.__espiao.quadros = 0;
    await new Promise((r) => setTimeout(r, 500));
    return window.__espiao.quadros;
  });

  const vazou = {};
  for (const k of ['globais', 'intervals', 'audio', 'observers']) {
    const delta = depois[k] - base[k];
    if (delta > 0) vazou[k] = delta;
  }

  await pag.close();
  return { rota, ms, kbJs: Math.round(bytesJs / 1024), ...tela, estouraLargura, vazou, quadrosSoltos, problemas };
}

/* ============================== execução ==================================== */

const { nome, rotas } = alvos();
console.log(`auditoria: ${nome} — ${rotas.length} telas\n`);

const servidor = process.env.BASE ? null
  : spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--host', '127.0.0.1'], { cwd: raiz, stdio: 'ignore' });
if (servidor) {
  for (let i = 0; i < 40; i += 1) {
    try { if ((await fetch(BASE, { signal: AbortSignal.timeout(1500) })).ok) break; } catch { /* subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
}

const nav = await chromium.launch({ ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox'] });
const linhas = [];
for (const rota of rotas) {
  const l = await auditarRota(nav, rota);
  linhas.push(l);
  const sinais = [
    Object.keys(l.vazou).length ? `vaza ${Object.entries(l.vazou).map(([k, v]) => `${k}+${v}`).join(' ')}` : '',
    l.quadrosSoltos > 40 ? `loop vivo após sair (${l.quadrosSoltos} quadros/0,5s)` : '',
    l.h1 !== 1 ? `h1=${l.h1}` : '',
    l.semRotulo ? `${l.semRotulo} campo(s) sem rótulo` : '',
    l.imgSemAlt ? `${l.imgSemAlt} img sem alt` : '',
    l.botaoSemNome ? `${l.botaoSemNome} botão sem nome` : '',
    l.estouraLargura ? 'estoura em 390px' : '',
    l.problemas.length ? l.problemas[0] : '',
  ].filter(Boolean);
  console.log(`  ${l.rota.padEnd(22)} ${String(l.kbJs).padStart(5)} kB · ${String(l.ms).padStart(5)} ms  ${sinais.join(' · ') || 'ok'}`);
}
await nav.close();
servidor?.kill();

mkdirSync(join(raiz, 'relatorios'), { recursive: true });
const arquivo = join(raiz, `relatorios/auditoria-grupo-${(process.argv[2] || 'avulso').replace(/,/g, '-')}.json`);
writeFileSync(arquivo, JSON.stringify({ grupo: nome, gerado: new Date().toISOString(), telas: linhas }, null, 1));

const comVazamento = linhas.filter((l) => Object.keys(l.vazou).length);
const comA11y = linhas.filter((l) => l.h1 !== 1 || l.semRotulo || l.imgSemAlt || l.botaoSemNome);
const pesadas = [...linhas].sort((a, b) => b.kbJs - a.kbJs).slice(0, 3);

console.log(`\nvazamento: ${comVazamento.length}/${linhas.length} · acessibilidade: ${comA11y.length}/${linhas.length}`
  + ` · estreito: ${linhas.filter((l) => l.estouraLargura).length}/${linhas.length}`);
console.log(`mais pesadas: ${pesadas.map((l) => `${l.rota} ${l.kbJs} kB`).join(' · ')}`);
console.log(`\nrelatório: ${arquivo.replace(raiz + '/', '')}`);
