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
  const main = readFileSync(join(raiz, 'src/main.js'), 'utf8');
  return [...main.matchAll(/^router\.register\('([^']+)'/gm)].map((m) => m[1]);
}

/** Host externo: falha dele é aviso, não defeito do site. */
const externo = (url) => !url.startsWith(BASE) && !url.startsWith('/');

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
    pag.on('console', (m) => { if (m.type() === 'error') erros.push(m.text().slice(0, 200)); });
    pag.on('pageerror', (e) => erros.push(`JS: ${String(e.message).slice(0, 200)}`));
    pag.on('requestfailed', (r) => {
      const alvo = externo(r.url()) ? avisos : erros;
      alvo.push(`rede: ${r.url().slice(0, 90)} — ${r.failure()?.errorText}`);
    });

    const t0 = Date.now();
    try {
      await pag.goto(`${BASE}/#${rota}`, { waitUntil: 'load', timeout: 30000 });
      await pag.waitForTimeout(ESPERA);
      const info = await pag.evaluate(() => {
        const alvo = document.querySelector('main') || document.body;
        const texto = (alvo.innerText || '').trim();
        return {
          texto: texto.length,
          nos: alvo.querySelectorAll('*').length,
          titulo: (document.querySelector('h1, .page-title')?.innerText || '').trim().slice(0, 60),
          naoEncontrada: /não encontrad|falha ao carregar/i.test(texto),
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
  servidor = spawn('npx', ['vite', 'preview', '--port', String(PORTA), '--host', '127.0.0.1'],
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

console.log(md.split('\n').slice(0, 14).join('\n'));
console.log(`\nrelatório: relatorios/smoke-rotas.md`);

if (vermelhas.length) {
  console.error(`\n✗ ${vermelhas.length} rota(s) vermelha(s): ${vermelhas.map((l) => l.rota).join(', ')}`);
  process.exit(1);
}
console.log('\n✓ todas as rotas verdes.');
