// Gera desktop/build/icon.png a partir do logo do projeto (public/logo.svg):
// o selo vermelho centralizado num quadrado escuro 1024×1024, com brilho. O
// electron-builder deriva daí os ícones de cada plataforma (.ico/.icns/png).
//
// É um helper de build (não vai pro app). Requer Chromium via Playwright:
//   npm i -D playwright && npx playwright install chromium
// Rode da pasta desktop/:  node build/make-icon.mjs
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(path.join(here, '..', '..', 'public', 'logo.svg'), 'utf8');
const out = path.join(here, 'icon.png');

const html = `<!doctype html><html><head><style>
  html, body { margin: 0; }
  svg { height: 770px; width: auto; display: block; }
</style></head><body>
  <div style="width:1024px;height:1024px;display:grid;place-items:center;
    background:radial-gradient(circle at 50% 42%, #15121d 0%, #06080d 72%);">
    <div style="filter:drop-shadow(0 0 40px rgba(255,31,58,.5));">${svg}</div>
  </div>
</body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: 'networkidle' });
await page.screenshot({ path: out });
await browser.close();
console.log('icon.png gerado de public/logo.svg →', out);
