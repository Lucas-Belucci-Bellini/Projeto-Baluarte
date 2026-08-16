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
import { createRequire } from 'node:module';
import path from 'node:path';

const PORTA = Number(process.env.PORTA_V2 ?? 4193);
const BASE = `http://127.0.0.1:${PORTA}`;

/* O vite é dependência DESTE repo, então chamamos o bin dele com o próprio
 * Node, em vez de passar por `npx`.
 *
 * Não é preferência de estilo: no Windows o `npx` é `npx.cmd`, e o Node 24
 * recusa spawnar `.cmd` (correção do CVE-2024-27980). Isto morria em
 * `spawn npx ENOENT` antes de abrir o navegador — ou seja, o portão de
 * integração da V2 nunca rodou nesta plataforma. Chamar o bin direto elimina o
 * wrapper de vez, é mais rápido (sem a resolução do npx) e usa a versão fixada
 * no lockfile em vez do que o npx resolver na hora.
 */
const require = createRequire(import.meta.url);
/* O `bin/vite.js` não está no mapa `exports` do pacote, então resolvê-lo direto
 * dá ERR_PACKAGE_PATH_NOT_EXPORTED. Ancoramos no `package.json` (que o vite
 * exporta) e caminhamos a partir da raiz — assim o hoisting do npm continua
 * sendo respeitado, em vez de presumir `./node_modules/vite`. */
const viteBin = (() => {
  try {
    return path.join(path.dirname(require.resolve('vite/package.json')), 'bin', 'vite.js');
  } catch {
    return path.join(process.cwd(), 'node_modules', 'vite', 'bin', 'vite.js');
  }
})();

const servidor = spawn(process.execPath, [viteBin, '--port', String(PORTA), '--host', '127.0.0.1'],
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

/* Navega e espera a CONDIÇÃO, não o relógio.
 *
 * As três navegações abaixo dormiam um tempo fixo (900ms, 900ms, 1800ms) e só
 * então liam `#saida`. Isso mede a máquina, não o sistema: a view do briefing é
 * a única importada sob demanda com orçamento de 900ms, e numa máquina onde a
 * primeira transformação do Vite passa disso o portão reprova um módulo que
 * está correto — falso vermelho, indistinguível de defeito de verdade.
 *
 * O predicado é o MESMO que o `conferir` avalia depois; em caso de estouro
 * devolvemos o texto real da tela, para a mensagem de falha continuar sendo o
 * conteúdo encontrado e não um "timeout" genérico. Espera por condição só
 * remove falso vermelho: se a tela nunca ficar certa, reprova igual.
 */
const navegarAte = async (pagina, hash, pronto, arg = null, limite = 15000) => {
  await pagina.evaluate((h) => { window.location.hash = h; }, hash);
  await pagina.waitForFunction(pronto, arg, { timeout: limite, polling: 100 }).catch(() => {});
  return pagina.locator('#saida').innerText().catch(() => '');
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
  conferir('os 4 módulos sobem sem falha',
    v2?.resultado?.vivos?.length === 4 && v2?.resultado?.falhas?.length === 0,
    JSON.stringify(v2?.resultado?.falhas ?? []));
  conferir('as 18 rotas chegam ao router REAL da V1',
    v2?.resultado?.rotas === 18 && v2?.totalRotas === 18,
    `boot=${v2?.resultado?.rotas} router=${v2?.totalRotas}`);
  conferir('a navegação vem do manifesto',
    v2?.resultado?.nav?.length === 4, String(v2?.resultado?.nav?.length));

  /* O nome longo prova a fonte: a sidebar da V1 diz "Lab de Cripto"; o manifesto
   * diz "Lab de Criptografia". Se aparecer o curto, alguém voltou a ler da V1. */
  const textoNav = await pagina.locator('#nav').innerText().catch(() => '');
  conferir('o nome vem do manifesto, não da sidebar da V1',
    /Lab de Criptografia/.test(textoNav), textoNav.slice(0, 80));

  const briefingNaTela = await navegarAte(pagina, '#/briefing', () => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return /Briefing de Notícias/.test(t) && /módulo experimental V2/i.test(t);
  });
  conferir('a superfície de briefing V2 renderiza',
    /Briefing de Notícias/.test(briefingNaTela) && /módulo experimental V2/i.test(briefingNaTela), briefingNaTela.slice(0, 90));

  /* O DEFEITO 1: se `view` devolver o módulo em vez do elemento, isto fica
   * vazio. A asserção é de IDENTIDADE, não de tamanho — a versão anterior media
   * `length > 100` e reprovou quando a view nativa (mais enxuta que a página da
   * V1) passou a renderizar. Limiar de tamanho é asserção fraca: aprova
   * qualquer coisa grande e reprova o certo quando ele encolhe. */
  const conteudo = await navegarAte(pagina, '#/cripto', () => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return /Lab de Criptografia/.test(t) && /AES-GCM/.test(t);
  });
  conferir('a view NATIVA da V2 renderiza',
    /Lab de Criptografia/.test(conteudo) && /AES-GCM/.test(conteudo)
      && !/falhou|não é um nó/.test(conteudo),
    conteudo.slice(0, 90));

  /* O módulo nativo usa ctx.trabalho e ctx.metricas — que só existem se o boot
   * os injetou. Clicar é o que prova; renderizar não prova nada disso. */
  await pagina.fill('.cripto-entrada', 'texto de prova');
  await pagina.fill('input[type=password]', 'senha-de-prova');
  await pagina.getByRole('button', { name: 'SHA-256' }).click();
  await pagina.waitForTimeout(1200);
  const hashNaTela = await pagina.locator('.cripto-saida').innerText().catch(() => '');
  conferir('o módulo EXECUTA usando o contexto (escalonador + métricas)',
    /^[0-9a-f]{64}$/.test(hashNaTela.trim()), hashNaTela.slice(0, 70));

  const metricas = await pagina.evaluate(() => window.__v2?.metricas?.());
  conferir('a execução foi medida pelo módulo',
    !!metricas?.contadores?.cripto_hash, JSON.stringify(metricas?.contadores ?? {}).slice(0, 80));

  /* ── permissões, no navegador ───────────────────────────────────────────
   * `militar` declara NETWORK. Sem política, o banco de prova não concede nada
   * — e é isso que "deny-by-default" tem que significar quando o sistema está
   * de fato no ar, não só num teste de unidade. */
  const permAntes = await pagina.evaluate(() => window.__v2?.permissoes?.());
  const militarAntes = permAntes?.find((x) => x.modulo === 'militar');
  conferir('declarar não é receber: militar sobe com NETWORK negada',
    militarAntes?.declaradas?.includes('NETWORK') === true
      && militarAntes?.concedidas?.length === 0
      && militarAntes?.pendentes?.includes('NETWORK') === true,
    JSON.stringify(militarAntes ?? null));

  /* E a concessão precisa alcançar um módulo que JÁ está no ar — se `pode()`
   * fosse fotografia do init, isto continuaria negado. */
  const depoisDeConceder = await pagina.evaluate(() => {
    window.__v2.conceder('militar', 'NETWORK');
    return window.__v2.diagnostico().modulos.find((m) => m.id === 'militar');
  });
  conferir('conceder alcança módulo já no ar',
    depoisDeConceder?.concedidas?.includes('NETWORK') === true,
    JSON.stringify(depoisDeConceder?.concedidas ?? null));

  const depoisDeRevogar = await pagina.evaluate(() => {
    window.__v2.revogar('militar', 'NETWORK');
    return window.__v2.diagnostico().modulos.find((m) => m.id === 'militar');
  });
  conferir('revogar também alcança — senão "revogar" é enfeite',
    depoisDeRevogar?.concedidas?.length === 0,
    JSON.stringify(depoisDeRevogar?.concedidas ?? null));

  /* Um módulo ADAPTADOR (militar → páginas da V1) continua funcionando: a V2
   * serve os dois mundos enquanto a migração acontece. */
  const conteudo2 = await navegarAte(pagina, '#/arsenal', (anterior) => {
    const t = document.getElementById('saida')?.innerText ?? '';
    return t.length > 100 && t !== anterior;
  }, conteudo);
  conferir('módulo adaptador ainda serve a página da V1',
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
