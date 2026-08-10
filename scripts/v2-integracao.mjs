/**
 * A fundação da V2 ainda dirige o router REAL da V1?
 *
 * Guarda dois defeitos que já aconteceram e que **nenhum teste com mock pega**:
 *
 * 1. `view` devolvendo o namespace do módulo em vez do elemento da página. As
 *    rotas registram, o `count()` bate, e a tela fica vazia — falha silenciosa
 *    da pior espécie, porque tudo indica sucesso.
 * 2. Esquecer que o router **anuncia** (`route:change`) em vez de montar. Mesmo
 *    sintoma: 17 rotas registradas, nada na tela.
 *
 * Roda contra o banco de prova (`v2/harness/`), que existe só para isto.
 */

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';

const PORTA = Number(process.env.PORTA_V2 ?? 4193);
const BASE = `http://127.0.0.1:${PORTA}`;

const servidor = spawn('npx', ['vite', '--port', String(PORTA), '--host', '127.0.0.1'],
  { cwd: process.cwd(), stdio: 'ignore' });

const esperarServidor = async () => {
  for (let i = 0; i < 60; i++) {
    try { if ((await fetch(BASE, { signal: AbortSignal.timeout(1500) })).ok) return true; } catch { /* subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
};

const passos = [];
const conferir = (descricao, condicao, detalhe = '') => {
  passos.push({ descricao, ok: !!condicao });
  console.log(`  ${condicao ? '✓' : '✗'} ${descricao}${!condicao && detalhe ? ` — ${detalhe}` : ''}`);
};

let navegador;
try {
  if (!await esperarServidor()) {
    console.error('vite não subiu');
    process.exit(1);
  }

  /* `CHROME_PATH` cobre o ambiente que já tem o Chromium instalado fora do
   * cache do Playwright (contêiner de desenvolvimento); no CI o
   * `playwright install` põe no lugar padrão e a variável não existe. */
  navegador = await chromium.launch({
    args: ['--no-sandbox'],
    ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {})
  });
  const pagina = await (await navegador.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
  const errosJs = [];
  pagina.on('pageerror', (e) => errosJs.push(e.message));

  await pagina.goto(`${BASE}/v2/harness/index.html#/cripto`, { waitUntil: 'load', timeout: 40000 });
  await pagina.waitForFunction(() => window.__v2, null, { timeout: 25000 }).catch(() => {});
  await pagina.waitForTimeout(2500);

  const v2 = await pagina.evaluate(() => window.__v2);

  conferir('o boot da V2 roda no navegador', v2 && !v2.erro, v2?.erro);
  conferir('os 3 módulos sobem sem falha',
    v2?.resultado?.vivos?.length === 3 && v2?.resultado?.falhas?.length === 0,
    JSON.stringify(v2?.resultado?.falhas ?? []));
  conferir('as 17 rotas chegam ao router REAL da V1',
    v2?.resultado?.rotas === 17 && v2?.totalRotas === 17,
    `boot=${v2?.resultado?.rotas} router=${v2?.totalRotas}`);
  conferir('a navegação vem do manifesto',
    v2?.resultado?.nav?.length === 3, String(v2?.resultado?.nav?.length));

  /* O nome longo prova a fonte: a sidebar da V1 diz "Lab de Cripto"; o manifesto
   * diz "Lab de Criptografia". Se aparecer o curto, alguém voltou a ler da V1. */
  const textoNav = await pagina.locator('#nav').innerText().catch(() => '');
  conferir('o nome vem do manifesto, não da sidebar da V1',
    /Lab de Criptografia/.test(textoNav), textoNav.slice(0, 80));

  /* O DEFEITO 1: se `view` devolver o módulo, isto fica vazio. */
  const conteudo = await pagina.locator('#saida').innerText().catch(() => '');
  conferir('a página real da V1 RENDERIZA pelo boot da V2',
    conteudo.length > 100 && !/falhou|não é um nó/.test(conteudo), conteudo.slice(0, 90));

  /* O DEFEITO 2: navegar exercita o route:change de novo. */
  await pagina.evaluate(() => { window.location.hash = '#/arsenal'; });
  await pagina.waitForTimeout(1800);
  const conteudo2 = await pagina.locator('#saida').innerText().catch(() => '');
  conferir('navegar para outra rota do mesmo módulo funciona',
    conteudo2.length > 100 && conteudo2 !== conteudo, conteudo2.slice(0, 70));

  conferir('nenhum erro de JS', errosJs.length === 0, errosJs.slice(0, 2).join(' | '));
} finally {
  await navegador?.close().catch(() => {});
  servidor.kill();
}

const falhas = passos.filter((p) => !p.ok);
console.log(`\n${passos.length - falhas.length}/${passos.length}`);
if (falhas.length) {
  console.error('\n🔴 A fundação da V2 parou de dirigir o router da V1.');
  console.error('   Ver docs/v2/V2_MODULE_RULES.md — "view devolve o ELEMENTO".');
  process.exit(1);
}
