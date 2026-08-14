/**
 * Smoke test de TODAS as rotas do site.
 *
 * Abre cada rota registrada num Chromium de verdade, contra o build de
 * produção, e diz quais estão verdes. É o que responde "o site inteiro ainda
 * funciona?" sem alguém clicar em 97 telas.
 *
 * As rotas são DESCOBERTAS de `src/main.js`, nunca listadas à mão: quando o
 * site passar de 97 para 150 rotas, o teste cresce sozinho. Lista manual
 * envelhece calada — e a rota nova, que é justamente a mais provável de estar
 * quebrada, seria a que ninguém testa.
 *
 * O que conta como VERMELHO (falha o processo):
 *   - erro de JavaScript na página (o defeito que apaga a tela);
 *   - rota que cai em "não encontrada" — registrada mas sem página;
 *   - tela que renderiza quase nada (menos de 60 caracteres de texto);
 *   - timeout.
 *
 * O que conta como AVISO (não falha): falha de rede para host externo. APIs de
 * terceiros caem, e o bot existe pra vigiar o SITE, não a internet. Amarelo que
 * falha vira alarme que ninguém lê.
 *
 * Rodar:  npm run smoke            (sobe o preview sozinho)
 *         BASE=http://... npm run smoke   (contra um deploy existente)
 */

import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const PORTA = Number(process.env.PORTA || 4173);
const BASE = process.env.BASE || `http://127.0.0.1:${PORTA}`;
const ESPERA = Number(process.env.ESPERA_MS || 900);
const TEXTO_MINIMO = 60;

/* No CI o Playwright resolve o Chromium sozinho. `CHROME_PATH` existe pra
 * ambiente que já tem navegador instalado e não quer baixar outro. */
const CHROME = process.env.CHROME_PATH || undefined;

function rotasRegistradas() {
  /* `ROTAS=/a,/b` roda só as indicadas — pra investigar uma rota vermelha sem
   * esperar as outras 96. */
  if (process.env.ROTAS) return process.env.ROTAS.split(',').map((r) => r.trim());
  const main = readFileSync(join(raiz, 'src/main.js'), 'utf8');
  return [...main.matchAll(/^router\.register\('([^']+)'/gm)].map((m) => m[1]);
}

/** Host externo: falha dele é aviso, não defeito do site. */
const externo = (url) => !url.startsWith(BASE) && !url.startsWith('/');

/* As rotas /api/* são funções serverless da Vercel. Elas NÃO existem no
 * `vite preview`, então dão 404 em qualquer rodada local ou de CI que não seja
 * contra um deploy de verdade. Sem esta exceção, /memoria ficaria vermelha
 * para sempre por um motivo que não é defeito — e alarme que mente sempre é
 * alarme que ninguém lê. Passe COM_BACKEND=1 ao rodar contra a Vercel. */
const COM_BACKEND = process.env.COM_BACKEND === '1';
const backendAusente = (url) => !COM_BACKEND && url.replace(BASE, '').startsWith('/api/');

/* O Chromium ecoa toda falha de recurso como `console.error`. Esse eco não
 * pode ser classificado de novo: a decisão externo/interno já foi tomada no
 * evento da requisição, e contar duas vezes transformava aviso em vermelho.
 * Foi o que deixou /economia, /mapa e /memoria falsamente vermelhas na
 * primeira rodada real do vigia. */
const ecoDeRecurso = (texto) => /Failed to load resource|net::ERR_/i.test(texto);

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

async function auditar(rotas) {
  const nav = await chromium.launch({ ...(CHROME ? { executablePath: CHROME } : {}), args: ['--no-sandbox'] });
  const linhas = [];

  for (const rota of rotas) {
    const pag = await nav.newPage({ viewport: { width: 1440, height: 900 } });
    const erros = [];
    const avisos = [];
    const classificar = (url, descricao) => {
      const alvo = (externo(url) || backendAusente(url)) ? avisos : erros;
      alvo.push(descricao);
    };

    /* `console.error` da própria aplicação é DIAGNÓSTICO, não sintoma: a
     * página pode ter tratado a falha e seguido em pé. Tratar como vermelho
     * fez /economia e /mapa falharem duas rodadas seguidas com o site
     * funcionando. Entra como aviso e aparece no relatório — sinal preservado,
     * alarme honesto. O que apaga a tela é exceção não capturada, e essa
     * continua vermelha. */
    pag.on('console', (m) => {
      if (m.type() !== 'error') return;
      if (ecoDeRecurso(m.text())) return;          // já classificado no evento da requisição
      avisos.push(`console: ${m.text().slice(0, 200)}`);
    });
    /* `pageerror` é exceção não capturada: sempre vermelho, sem exceção. É o
     * defeito que apaga a tela. */
    pag.on('pageerror', (e) => erros.push(`JS: ${String(e.message).slice(0, 200)}`));
    pag.on('requestfailed', (r) => classificar(r.url(), `rede: ${r.url().slice(0, 90)} — ${r.failure()?.errorText}`));
    /* 404/500 NÃO são `requestfailed` — a requisição completou. Sem isto, uma
     * rota que serve erro do próprio site passava por verde. */
    pag.on('response', (r) => {
      if (r.status() < 400) return;
      classificar(r.url(), `HTTP ${r.status()}: ${r.url().slice(0, 90)}`);
    });

    const t0 = Date.now();
    try {
      await pag.goto(`${BASE}/#${rota}`, { waitUntil: 'load', timeout: 30000 });
      await pag.waitForTimeout(ESPERA);
      const info = await pag.evaluate(() => {
        const alvo = document.querySelector('main') || document.body;
        const texto = (alvo.innerText || '').trim();
        /* Detecção ESTRUTURAL, não por texto: o 404 e o "falha ao carregar" do
         * router renderizam `.empty-state` com o título próprio. Procurar a
         * expressão no innerText inteiro acusava página legítima — a
         * enciclopédia de lógica digital caiu assim, porque o conteúdo dela
         * cita a frase. */
        const vazia = alvo.querySelector('.empty-state__title');
        const rotuloVazio = (vazia?.innerText || '').trim();
        return {
          texto: texto.length,
          nos: alvo.querySelectorAll('*').length,
          titulo: (document.querySelector('h1, .page-title')?.innerText || '').trim().slice(0, 60),
          naoEncontrada: /rota não encontrada|falha ao carregar/i.test(rotuloVazio),
        };
      });

      let estado = 'verde';
      if (info.naoEncontrada) estado = 'NAO-ENCONTRADA';
      else if (info.texto < TEXTO_MINIMO) estado = 'QUASE-VAZIA';
      else if (erros.length) estado = 'ERRO-JS';

      linhas.push({ rota, estado, ms: Date.now() - t0, ...info, erros: [...new Set(erros)], avisos: [...new Set(avisos)] });
    } catch (e) {
      linhas.push({ rota, estado: 'TIMEOUT', ms: Date.now() - t0, texto: 0, nos: 0, titulo: '',
                    erros: [String(e.message).slice(0, 160)], avisos: [] });
    }
    await pag.close();
  }

  await nav.close();
  return linhas;
}

function relatorio(linhas) {
  const conta = {};
  for (const l of linhas) conta[l.estado] = (conta[l.estado] ?? 0) + 1;
  const vermelhas = linhas.filter((l) => l.estado !== 'verde');
  const lentas = [...linhas].sort((a, b) => b.ms - a.ms).slice(0, 8);

  const md = [
    '# Smoke das rotas — Projeto Baluarte',
    '',
    `Rodado em ${new Date().toISOString()} · **${linhas.length} rotas** descobertas de \`src/main.js\`.`,
    '',
    `| Estado | Rotas |`, '|---|---:|',
    ...Object.entries(conta).map(([e, n]) => `| ${e === 'verde' ? '🟢 verde' : `🔴 ${e}`} | ${n} |`),
    '',
  ];

  if (vermelhas.length) {
    md.push('## 🔴 O que está vermelho', '');
    for (const l of vermelhas) {
      md.push(`### \`${l.rota}\` — ${l.estado}`, '');
      md.push(`- texto renderizado: ${l.texto} caracteres · ${l.nos} nós · ${l.ms} ms`);
      for (const e of l.erros.slice(0, 4)) md.push(`- \`${e}\``);
      md.push('');
    }
  } else {
    md.push('## 🟢 Todas as rotas verdes', '');
  }

  const comAviso = linhas.filter((l) => l.avisos.length);
  if (comAviso.length) {
    md.push('## 🟡 Avisos (host externo — não falham o teste)', '');
    for (const l of comAviso.slice(0, 10)) md.push(`- \`${l.rota}\`: ${l.avisos[0]}`);
    md.push('');
  }

  md.push('## As 8 rotas mais lentas', '', '| Rota | ms | texto |', '|---|---:|---:|');
  for (const l of lentas) md.push(`| \`${l.rota}\` | ${l.ms} | ${l.texto} |`);
  md.push('');

  return { md: md.join('\n'), vermelhas };
}

/* ============================== execução ==================================== */

const rotas = rotasRegistradas();
console.log(`smoke: ${rotas.length} rotas descobertas em src/main.js`);

let servidor = null;
if (!process.env.BASE) {
  if (!existsSync(join(raiz, 'dist'))) {
    console.error('smoke: não há dist/. Rode `npm run build` antes, ou passe BASE=<url>.');
    process.exit(1);
  }
  servidor = spawn(process.execPath, [join(raiz, 'node_modules/vite/bin/vite.js'), 'preview', '--port', String(PORTA), '--host', '127.0.0.1'],
    { cwd: raiz, stdio: 'ignore', detached: false });
  if (!await esperarPreview(BASE)) {
    console.error('smoke: o preview não subiu.');
    servidor.kill();
    process.exit(1);
  }
}

const linhas = await auditar(rotas);
const { md, vermelhas } = relatorio(linhas);

mkdirSync(join(raiz, 'relatorios'), { recursive: true });
writeFileSync(join(raiz, 'relatorios/smoke-rotas.md'), md);
writeFileSync(join(raiz, 'relatorios/smoke-rotas.json'), JSON.stringify(linhas, null, 1));

servidor?.kill();

console.log(md.split('\n').slice(0, 12).join('\n'));

/* O log do CI precisa bastar pra diagnosticar. Sem isto, "2 rotas vermelhas"
 * obrigava a baixar o artifact pra descobrir o motivo — e a primeira coisa que
 * se quer saber quando o alarme toca é POR QUÊ. */
if (vermelhas.length) {
  console.error(`\n✗ ${vermelhas.length} rota(s) vermelha(s):\n`);
  for (const l of vermelhas) {
    console.error(`  ${l.rota} — ${l.estado} · ${l.texto} caracteres · ${l.ms} ms`);
    for (const e of l.erros.slice(0, 5)) console.error(`      ${e}`);
    for (const a of l.avisos.slice(0, 3)) console.error(`      (aviso) ${a}`);
  }
  console.error(`\nrelatório completo: relatorios/smoke-rotas.md`);
  process.exit(1);
}
console.log(`\nrelatório: relatorios/smoke-rotas.md`);
console.log('\n✓ todas as rotas verdes.');
