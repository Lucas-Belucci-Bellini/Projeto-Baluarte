/**
 * Critical Path Test — a jornada, não as telas (#420).
 *
 * O `smoke` já abre as 99 rotas e diz quais pintam. Mas ele abre **cada uma
 * numa aba nova**, e é justamente isso que o deixa cego para a classe de defeito
 * mais chata de um SPA: o estado que corrompe *entre* navegações. Uma página que
 * abre sozinha e quebra depois de você ter passado por outras três é verde no
 * smoke e vermelha para quem usa.
 *
 * Este teste percorre UMA sessão contínua, como o operador faz:
 *
 *     boot → home → arsenal → home → editor (escreve) → terminal (comando)
 *          → volta no editor (o que escrevi ainda está lá?)
 *          → diagnóstico (revoga permissão) → RELOAD → a escolha sobreviveu?
 *
 * Cada passo afirma **estado**, não pixel. É o teste que, daqui a um ano, diz se
 * a 1.0.0 congelada ainda funciona — que é a razão de a linha-base existir
 * (ADR-001).
 *
 * O que é VERMELHO: exceção não capturada em qualquer ponto da jornada, ou uma
 * afirmação de estado que falhou.
 * O que é AVISO: falha de rede para host externo. Mesma regra do smoke — alarme
 * que mente é alarme que ninguém lê.
 *
 * Rodar:  npm run caminho-critico
 *         BASE=http://... npm run caminho-critico
 */

import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORTA || 4174);
const BASE = process.env.BASE || `http://127.0.0.1:${PORTA}`;
const CHROME = process.env.CHROME_PATH || undefined;
const ESPERA = Number(process.env.ESPERA_MS || 700);

const externo = (url) => !url.startsWith(BASE) && !url.startsWith('/');

/* ===== Coletor da jornada ===== */

const passos = [];
const errosJs = [];
const avisos = [];

function afirmar(descricao, condicao, detalhe = '') {
  passos.push({ descricao, ok: !!condicao, detalhe });
  console.log(`  ${condicao ? '✓' : '✗'} ${descricao}${detalhe && !condicao ? ` — ${detalhe}` : ''}`);
}

async function esperarPreview(url, tentativas = 40) {
  for (let i = 0; i < tentativas; i += 1) {
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(1500) });
      if (r.ok) return true;
    } catch { /* ainda subindo */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  return false;
}

/* ===== A jornada ===== */

async function jornada(pag) {
  const ir = async (rota) => {
    await pag.goto(`${BASE}/#${rota}`, { waitUntil: 'load', timeout: 30000 });
    await pag.waitForTimeout(ESPERA);
  };
  const navegarNaSPA = async (rota) => {
    /* Troca de rota SEM recarregar — é assim que o operador navega, e é o
     * caminho em que o estado pode vazar de uma página para a outra. */
    await pag.evaluate((r) => { location.hash = r; }, rota);
    await pag.waitForTimeout(ESPERA);
  };
  const textoDaTela = () => pag.evaluate(() => {
    const alvo = document.querySelector('main') || document.body;
    return (alvo.innerText || '').trim();
  });

  /* ── 1. Boot ────────────────────────────────────────────────────────────── */
  console.log('\n1. boot');
  await ir('/home');
  afirmar('a home renderiza', (await textoDaTela()).length > 60);

  const politica = await pag.evaluate(() => ({
    permissoes: localStorage.getItem('baluarte:permissoes'),
    flags: localStorage.getItem('baluarte:flags')
  }));
  afirmar('a política gravou as permissões no boot', !!politica.permissoes,
    `permissoes=${politica.permissoes}`);
  afirmar('as permissões saem no envelope versionado',
    /"__bv"\s*:\s*1/.test(politica.permissoes || ''), politica.permissoes?.slice(0, 60));

  /* ── 2. Navegação de ida e volta ────────────────────────────────────────── */
  console.log('\n2. navegação');
  await navegarNaSPA('/arsenal');
  const arsenal = await textoDaTela();
  afirmar('o arsenal abre pela navegação interna', arsenal.length > 60, `${arsenal.length} chars`);

  await navegarNaSPA('/home');
  afirmar('a home continua inteira na volta', (await textoDaTela()).length > 60);

  /* ── 3. Estado que precisa sobreviver à navegação ───────────────────────── */
  console.log('\n3. estado entre rotas');
  await navegarNaSPA('/editor');
  await pag.waitForSelector('textarea.editor-textarea', { state: 'attached', timeout: 30000 });
  const marca = `baluarte-caminho-critico-${Date.now()}`;
  const escreveu = await pag.evaluate((txt) => {
    const ta = document.querySelector('textarea');
    if (!ta) return false;
    ta.value = txt;
    ta.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  }, marca);
  afirmar('o editor aceita escrita', escreveu);

  await pag.waitForTimeout(ESPERA);
  await navegarNaSPA('/terminal');
  const terminalAbriu = (await textoDaTela()).length > 40;
  afirmar('o terminal abre depois do editor', terminalAbriu);

  await navegarNaSPA('/editor');
  await pag.waitForSelector('textarea.editor-textarea', { state: 'attached', timeout: 30000 });
  const sobreviveu = await pag.evaluate((txt) => {
    const gravado = localStorage.getItem('baluarte:editor:state') || '';
    const naTela = [...document.querySelectorAll('textarea')].some((t) => t.value.includes(txt));
    return { gravado: gravado.includes(txt), naTela };
  }, marca);
  afirmar('o que foi escrito no editor sobreviveu à ida e volta',
    sobreviveu.gravado || sobreviveu.naTela, JSON.stringify(sobreviveu));

  /* ── 4. Persistência real: sobrevive ao RELOAD ──────────────────────────── */
  console.log('\n4. persistência através do reload');
  await ir('/diagnostico');
  afirmar('o diagnóstico abre', (await textoDaTela()).includes('Diagnóstico'));

  /* Estado ABSOLUTO, nunca relativo.
   *
   * A primeira versão desta etapa comparava o estado depois do reload com
   * `!antes` — e passava com a persistência quebrada, porque nesse caso o boot
   * re-semeia o padrão e o valor "volta ao que era", que a comparação relativa
   * não distingue de "nunca mudou". Um teste que passa com o defeito presente é
   * pior do que não ter teste. Aqui o alvo é fixado: **revoga, recarrega, e
   * exige NEGADA** — não há leitura ambígua. */
  const lerPermissao = () => pag.evaluate(() => {
    const item = [...document.querySelectorAll('.diag-item')]
      .find((el) => el.querySelector('code')?.textContent === 'arsenal.read');
    if (!item) return null;
    return { concedida: !!item.querySelector('.diag-selo--ok') };
  });
  const clicarPermissao = async () => {
    await pag.evaluate(() => {
      [...document.querySelectorAll('.diag-item')]
        .find((el) => el.querySelector('code')?.textContent === 'arsenal.read')
        ?.querySelector('.diag-btn')?.click();
    });
    await pag.waitForTimeout(300);
  };

  const inicial = await lerPermissao();
  afirmar('achou a permissão arsenal.read no painel', inicial !== null);

  if (inicial && !inicial.concedida) await clicarPermissao();   // parte sempre de "concedida"
  afirmar('arsenal.read começa concedida (padrão do operador)',
    (await lerPermissao())?.concedida === true);

  await clicarPermissao();                                       // revoga
  afirmar('o clique revoga na hora', (await lerPermissao())?.concedida === false);

  /* `reload()` explícito, e não `goto()` para a mesma rota: navegar para uma
   * URL que difere só no fragmento é navegação *no mesmo documento* — o
   * JavaScript não recarrega, o heap continua vivo e o teste leria o estado em
   * memória achando que leu o estado persistido. Foi assim que esta afirmação
   * passou verde com a persistência quebrada, na primeira versão. */
  await pag.reload({ waitUntil: 'load', timeout: 30000 });
  await pag.waitForTimeout(ESPERA);
  const apos = await lerPermissao();
  afirmar('a revogação sobreviveu ao reload — não voltou pelo padrão de fábrica',
    apos?.concedida === false, `concedida=${apos?.concedida}`);

  /* Devolve o estado: o teste não deixa o navegador sujo se rodar contra um
   * perfil persistente. */
  await clicarPermissao();
  afirmar('a permissão volta ao ligar de novo', (await lerPermissao())?.concedida === true);

  /* ── 5. Volta ao começo, tudo ainda de pé ───────────────────────────────── */
  console.log('\n5. fim da jornada');
  await navegarNaSPA('/home');
  afirmar('a home ainda renderiza no fim da jornada', (await textoDaTela()).length > 60);
}

/* ============================== execução ==================================== */

let servidor = null;
if (!process.env.BASE) {
  if (!existsSync(join(raiz, 'dist'))) {
    console.error('caminho-crítico: não há dist/. Rode `npm run build` antes, ou passe BASE=<url>.');
    process.exit(1);
  }
  servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--host', '127.0.0.1'],
    { cwd: raiz, stdio: 'ignore' });
  if (!await esperarPreview(BASE)) {
    console.error('caminho-crítico: o preview não subiu.');
    servidor.kill();
    process.exit(1);
  }
}

const nav = await chromium.launch({ ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox'] });
const pag = await nav.newPage({ viewport: { width: 1440, height: 900 } });

/* `pageerror` é exceção não capturada: vermelho em qualquer ponto da jornada.
 * Falha de rede externa é aviso — mesma regra do smoke. */
pag.on('pageerror', (e) => errosJs.push(String(e.message).slice(0, 200)));
pag.on('requestfailed', (r) => {
  const linha = `${r.url().slice(0, 90)} — ${r.failure()?.errorText}`;
  (externo(r.url()) ? avisos : errosJs).push(`rede: ${linha}`);
});

let explodiu = null;
try {
  await jornada(pag);
} catch (e) {
  explodiu = e;
} finally {
  await nav.close();
  if (servidor) servidor.kill();
}

/* ===== Veredito ===== */

const falhas = passos.filter((p) => !p.ok);
console.log('\n' + '─'.repeat(60));
console.log(`caminho crítico: ${passos.length - falhas.length}/${passos.length} afirmações`);
if (avisos.length) console.log(`avisos (host externo, não falham): ${avisos.length}`);

if (explodiu) {
  console.error(`\n🔴 a jornada explodiu: ${explodiu.message}`);
  process.exit(1);
}
if (errosJs.length) {
  console.error('\n🔴 erro de JavaScript durante a jornada:');
  for (const e of errosJs.slice(0, 8)) console.error(`   ${e}`);
  process.exit(1);
}
if (falhas.length) {
  console.error('\n🔴 afirmações que falharam:');
  for (const f of falhas) console.error(`   ${f.descricao}${f.detalhe ? ` — ${f.detalhe}` : ''}`);
  process.exit(1);
}
console.log('\n🟢 a jornada inteira passou — estado íntegro do boot ao fim.');
