#!/usr/bin/env node
/**
 * Driver do Projeto Baluarte — sobe o site (vite) e o dirige via Playwright.
 *
 * Uso (a partir da raiz do repositório):
 *   node .claude/skills/run-projeto-baluarte/driver.mjs smoke
 *   node .claude/skills/run-projeto-baluarte/driver.mjs shot '#/editor' /tmp/editor.png
 *   node .claude/skills/run-projeto-baluarte/driver.mjs eval '#/home' 'document.title'
 *
 * O vite dev server (porta 5173) é iniciado automaticamente se não estiver
 * de pé; se já estiver, é reaproveitado. O Chromium do Playwright é procurado
 * em CHROME_PATH, depois em /opt/pw-browsers (container do Claude Code).
 */
import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const raiz = join(dirname(fileURLToPath(import.meta.url)), '..', '..', '..');

function loadPlaywright() {
  /* playwright local → global do container (instalado em /opt/node22) */
  for (const p of ['playwright', '/opt/node22/lib/node_modules/playwright']) {
    try { return require(p); } catch { /* tenta o próximo */ }
  }
  throw new Error('playwright não encontrado — instale com: npm i -g playwright');
}

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const base = '/opt/pw-browsers';
  if (fs.existsSync(base)) {
    for (const d of fs.readdirSync(base)) {
      const p = `${base}/${d}/chrome-linux/chrome`;
      if (fs.existsSync(p)) return p;
    }
  }
  return undefined; /* deixa o playwright usar o navegador dele */
}

const PORT = 5173;
const BASE = `http://localhost:${PORT}/`;

async function ensureServer() {
  try { await fetch(BASE); return; } catch { /* não está de pé — sobe */ }
  const child = spawn(process.execPath, [join(raiz, 'node_modules/vite/bin/vite.js'), '--port', String(PORT), '--strictPort'], {
    cwd: raiz,
    stdio: 'ignore',
    detached: true
  });
  child.unref();
  for (let i = 0; i < 40; i++) {
    await new Promise((r) => setTimeout(r, 500));
    try { await fetch(BASE); return; } catch { /* ainda subindo */ }
  }
  throw new Error(`vite não subiu na porta ${PORT} — veja se "npm install" foi feito`);
}

async function withPage(fn) {
  await ensureServer();
  const { chromium } = loadPlaywright();
  const browser = await chromium.launch({
    executablePath: findChrome(),
    args: ['--no-sandbox', '--disable-gpu']
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  try {
    return await fn(page);
  } finally {
    await browser.close();
  }
}

const [cmd, arg1, arg2] = process.argv.slice(2);

if (cmd === 'shot') {
  /* screenshot de qualquer rota do site */
  const rota = arg1 || '#/home';
  const out = arg2 || '/tmp/baluarte.png';
  await withPage(async (page) => {
    await page.goto(BASE + rota, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800); /* animações de entrada */
    await page.screenshot({ path: out });
    console.log('screenshot:', out);
  });
} else if (cmd === 'eval') {
  /* avalia uma expressão JS dentro da página e imprime o resultado */
  await withPage(async (page) => {
    await page.goto(BASE + (arg1 || '#/home'), { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    const result = await page.evaluate(arg2 || 'document.title');
    console.log(JSON.stringify(result, null, 2));
  });
} else if (cmd === 'smoke') {
  /* teste rápido de saúde: boot + Editor de Código (regressões do #197) */
  await withPage(async (page) => {
    await page.goto(BASE + '#/home', { waitUntil: 'networkidle' });
    console.log('boot ok · título:', await page.title());

    await page.goto(BASE + '#/editor', { waitUntil: 'networkidle' });
    await page.waitForSelector('.editor-textarea');
    await page.selectOption('.editor-toolbar__lang', 'java');
    await page.fill('.editor-textarea', 'public class Main {\n  int x = 42;\n}');
    await page.waitForTimeout(300);

    const html = await page.$eval('.editor-highlight code', (el) => el.innerHTML);
    if (/<span [^>]*<span/.test(html)) throw new Error('highlight gerou HTML quebrado');
    if (!html.includes('tk--number')) throw new Error('números sem cor no highlight');
    console.log('editor: highlight ok (números coloridos, HTML íntegro)');

    await page.click('.editor-textarea');
    await page.keyboard.press('Control+End');
    await page.keyboard.press('Enter');
    await page.keyboard.type('sou', { delay: 50 });
    await page.waitForSelector('.editor-autocomplete', { state: 'visible' });
    await page.keyboard.press('Tab');
    const val = await page.inputValue('.editor-textarea');
    if (!val.includes('System.out.println();')) throw new Error('snippet sout não expandiu');
    console.log('editor: autocomplete ok (sou + Tab → System.out.println)');

    console.log('SMOKE OK');
  });
} else {
  console.log(`Driver do Projeto Baluarte — comandos:
  smoke                       teste rápido (boot + editor: highlight e autocomplete)
  shot <rota> <saida.png>     screenshot de uma rota   ex: shot '#/editor' /tmp/e.png
  eval <rota> <expressao>     roda JS na página        ex: eval '#/home' 'document.title'
As rotas do site são por hash: '#/home', '#/editor', '#/arsenal', '#/codigo'…`);
}
