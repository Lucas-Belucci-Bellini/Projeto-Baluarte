import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(fileURLToPath(new URL('..', import.meta.url)));
const page = readFileSync(join(raiz, 'src', 'pages', 'jarvis.ts'), 'utf8');
const main = readFileSync(join(raiz, 'src', 'main.js'), 'utf8');
const sidebar = readFileSync(join(raiz, 'src', 'layout', 'sidebar.ts'), 'utf8');
const nexus = readFileSync(join(raiz, 'docs', 'nexus', 'dominios.json'), 'utf8');
const consoleSource = readFileSync(join(raiz, 'src', 'utils', 'jarvis-mark-xiii.ts'), 'utf8');
const styles = readFileSync(join(raiz, 'src', 'styles', 'fase19.css'), 'utf8');
const performanceScript = readFileSync(join(raiz, 'scripts', 'jarvis-performance.mjs'), 'utf8');
const packageJson = readFileSync(join(raiz, 'package.json'), 'utf8');

test('a página real do JARVIS monta o console Mark XIII integrado ao shell', () => {
  assert.match(page, /createMarkXiiiConsole/);
  assert.match(page, /markXiiiConsole\.root/);
  assert.match(page, /markXiiiConsole\?\.dispose\(\)/);
  assert.match(consoleSource, /dataset: \{ visibility: 'integrated-v1'/);
  assert.match(consoleSource, /NÚCLEO DE IA · ASTROLÁBIO SONORO/);
  assert.match(consoleSource, /aria-label.*Visualização reativa do Núcleo Mark XIII/);
});

test('a entrada visual do shell e o router apontam para a mesma página integrada', () => {
  assert.match(main, /router\.register\('\/jarvis', lazy\(\(\) => import\('\.\/pages\/jarvis\.ts'\), 'jarvisPage'\)\)/);
  assert.match(sidebar, /path: '\/jarvis', label: 'Núcleo de IA'/);
  assert.match(nexus, /src\/utils\/jarvis-mark-xiii\.ts/);
});

test('o console Mark XIII possui animação, telemetria, presença musical e fallback de movimento', () => {
  assert.match(consoleSource, /requestAnimationFrame\(draw\)/);
  assert.match(consoleSource, /prefers-reduced-motion/);
  assert.match(consoleSource, /setMusic\(connected/);
  assert.match(consoleSource, /onMusic/);
  assert.match(styles, /\.jv-mark-xiii/);
  assert.match(styles, /\.jv-mark-xiii\[data-music="true"\]/);
});

test('o console possui orçamento adaptativo e benchmark reproduzível', () => {
  assert.match(consoleSource, /lowMemoryDevice/);
  assert.match(consoleSource, /performanceQuality/);
  assert.match(consoleSource, /measuredFps/);
  assert.match(consoleSource, /particleCount/);
  assert.match(consoleSource, /dataset\.performance/);
  assert.match(performanceScript, /REDUCED_MOTION/);
  assert.match(performanceScript, /jv-mark-xiii/);
  assert.match(packageJson, /jarvis:performance/);
});
