/**
 * O site sobrevive a ficar sem rede? (#420)
 *
 * `pwa` está marcado **estável**, e "recuperável" é uma das quatro palavras da
 * definição de 1.0.0. Um PWA que instala Service Worker e mesmo assim mostra o
 * dinossauro do navegador quando o wi-fi cai não é estável — é decorativo.
 *
 * ── O que este teste sabe sobre a arquitetura ────────────────────────────────
 * O roteamento é por **hash**, então trocar de rota offline NÃO dispara
 * requisição de navegação: o shell já está na memória. O que pode faltar é o
 * **chunk** de uma rota que nunca foi visitada — cada página é um `import()`
 * separado. Por isso o percurso distingue os dois casos, que falham por motivos
 * diferentes e devem degradar de formas diferentes:
 *
 *   rota já visitada  → tem que abrir normalmente (o chunk está em cache)
 *   rota nunca aberta → tem que dizer "falha ao carregar" e seguir de pé;
 *                       tela branca é o defeito
 *
 * Rodar:  npm run prova-offline
 */

import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORTA || 4176);
const BASE = process.env.BASE || `http://127.0.0.1:${PORTA}`;
const CHROME = process.env.CHROME_PATH || undefined;
const ESPERA = Number(process.env.ESPERA_MS || 900);

const passos = [];
function afirmar(descricao, condicao, detalhe = '') {
  passos.push({ descricao, ok: !!condicao, detalhe });
  console.log(`  ${condicao ? '✓' : '✗'} ${descricao}${detalhe && !condicao ? ` — ${detalhe}` : ''}`);
}

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

let servidor = null;
if (!process.env.BASE) {
  if (!existsSync(join(raiz, 'dist'))) {
    console.error('prova-offline: não há dist/. Rode `npm run build` antes.');
    process.exit(1);
  }
  servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--host', '127.0.0.1'],
    { cwd: raiz, stdio: 'ignore' });
  if (!await esperarPreview(BASE)) {
    console.error('prova-offline: o preview não subiu.');
    servidor.kill();
    process.exit(1);
  }
}

const nav = await chromium.launch({ ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox'] });
const ctx = await nav.newContext({ viewport: { width: 1280, height: 800 } });
const pag = await ctx.newPage();

const textoDaTela = () => pag.evaluate(() => {
  const alvo = document.querySelector('main') || document.body;
  return (alvo.innerText || '').trim();
});
const irNaSPA = async (rota) => {
  await pag.evaluate((r) => { location.hash = r; }, rota);
  await pag.waitForTimeout(ESPERA);
};

let explodiu = null;
try {
  /* ── 1. Online: o Service Worker precisa assumir o controle ───────────── */
  console.log('\n1. online — instalando o Service Worker');
  await pag.goto(`${BASE}/#/home`, { waitUntil: 'load', timeout: 30000 });

  /* ⚠️ `navigator.serviceWorker.ready` **nunca resolve** se nenhum SW for
   * registrado — não rejeita, pendura. Sem o teto abaixo, este passo trava o
   * processo inteiro justamente no cenário que o teste existe para detectar (SW
   * ausente), e em CI isso queima o job por timeout em vez de acusar a falha.
   * Teste que trava é pior que teste que falha. */
  const controlou = await pag.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return false;
    const teto = new Promise((r) => setTimeout(() => r('teto'), 15000));
    if (await Promise.race([navigator.serviceWorker.ready, teto]) === 'teto') return false;
    /* O `clients.claim()` do activate pode chegar logo depois do ready. */
    for (let i = 0; i < 40 && !navigator.serviceWorker.controller; i += 1) {
      await new Promise((r) => setTimeout(r, 250));
    }
    return !!navigator.serviceWorker.controller;
  });
  afirmar('o Service Worker assumiu o controle da página', controlou);

  /* Sem SW não há offline: o resto do percurso mediria o cache do navegador, não
   * o do Baluarte. Para de vez, com a causa dita. */
  if (!controlou) throw new Error('o Service Worker não assumiu o controle — sem ele não há prova de offline');

  /* Visita uma rota para o chunk dela entrar em cache — é o que separa
   * "já visitada" de "nunca aberta" no passo offline. */
  await irNaSPA('/sobre');
  afirmar('a rota visitada online renderiza', (await textoDaTela()).length > 60);

  const cacheado = await pag.evaluate(async () => {
    const nomes = await caches.keys();
    let total = 0;
    for (const n of nomes) total += (await (await caches.open(n)).keys()).length;
    return { nomes: nomes.filter((n) => n.startsWith('baluarte-')), total };
  });
  afirmar('o SW guardou recursos em cache', cacheado.total > 0, JSON.stringify(cacheado));

  /* ── 2. Offline ────────────────────────────────────────────────────────── */
  console.log('\n2. offline — a rede caiu');
  await ctx.setOffline(true);

  await pag.reload({ waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(ESPERA);
  const aposReload = await textoDaTela();
  afirmar('o site volta depois de recarregar SEM rede',
    aposReload.length > 60, `${aposReload.length} chars: ${aposReload.slice(0, 80)}`);
  afirmar('não é a tela de erro do navegador',
    !/ERR_INTERNET_DISCONNECTED|No internet|sem conexão com a internet/i.test(aposReload));

  await irNaSPA('/sobre');
  afirmar('rota já visitada abre offline (chunk em cache)',
    (await textoDaTela()).length > 60);

  /* Rota nunca aberta nesta sessão: o chunk não está em cache. O esperado NÃO é
   * funcionar — é degradar dizendo o que houve, em vez de tela branca. */
  await irNaSPA('/tabela-periodica');
  const nuncaAberta = await textoDaTela();
  const degradouBem = nuncaAberta.length > 20;
  afirmar('rota nunca aberta degrada com aviso, não com tela branca',
    degradouBem, `${nuncaAberta.length} chars: ${nuncaAberta.slice(0, 80)}`);

  /* ── 3. De volta ───────────────────────────────────────────────────────── */
  console.log('\n3. a rede voltou');
  await ctx.setOffline(false);
  await irNaSPA('/tabela-periodica');
  await pag.waitForTimeout(ESPERA);
  const voltou = await textoDaTela();
  afirmar('a rota que faltava carrega quando a rede volta',
    voltou.length > 60, `${voltou.length} chars`);

  await irNaSPA('/home');
  afirmar('a home segue inteira no fim', (await textoDaTela()).length > 60);
} catch (e) {
  explodiu = e;
} finally {
  await nav.close();
  if (servidor) servidor.kill();
}

const falhas = passos.filter((p) => !p.ok);
console.log('\n' + '─'.repeat(60));
console.log(`prova de offline: ${passos.length - falhas.length}/${passos.length} afirmações`);

if (explodiu) {
  console.error(`\n🔴 a prova explodiu: ${explodiu.message}`);
  process.exit(1);
}
if (falhas.length) {
  console.error('\n🔴 afirmações que falharam:');
  for (const f of falhas) console.error(`   ${f.descricao}${f.detalhe ? ` — ${f.detalhe}` : ''}`);
  process.exit(1);
}
console.log('\n🟢 o site sobrevive a perder e recuperar a rede.');
