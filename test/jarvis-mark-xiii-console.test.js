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
const engineTypes = readFileSync(join(raiz, 'src', 'utils', 'jarvis-engine.d.ts'), 'utf8');
const styles = readFileSync(join(raiz, 'src', 'styles', 'fase19.css'), 'utf8');
const performanceScript = readFileSync(join(raiz, 'scripts', 'jarvis-performance.mjs'), 'utf8');
const packageJson = readFileSync(join(raiz, 'package.json'), 'utf8');
const nucleoSocket = readFileSync(join(raiz, 'src', 'utils', 'nucleo-socket.js'), 'utf8');

test('a página real do JARVIS monta o console Mark XIII integrado ao shell', () => {
  assert.match(page, /createMarkXiiiConsole/);
  assert.match(page, /markXiiiConsole\.root/);
  assert.match(page, /disposeMarkXiiiConsole\(\)/);
  assert.match(page, /markXiiiConsole\?\.dispose\(\)/);
  assert.match(consoleSource, /dataset: \{ visibility: 'integrated-v1'/);
  assert.match(consoleSource, /runtimeAuthority: 'not-authorized'/);
  assert.match(consoleSource, /Núcleo visual ativo\. Observação do Runtime pendente\./);
  assert.match(consoleSource, /NÚCLEO DE IA · ASTROLÁBIO SONORO/);
  assert.match(consoleSource, /aria-label.*Visualização reativa do Núcleo Mark XIII/);
});

test('a entrada visual do shell e o router apontam para a mesma página integrada', () => {
  /* A rota é a mesma; quem muda é o peso do que ela carrega (#238): o JARVIS
   * completo só entra no app, e a web recebe o Núcleo V7 sozinho. */
  assert.match(main, /reg\('\/jarvis', \(args\) => \(isNative\(\)/);
  assert.match(main, /import\('\.\/pages\/jarvis\.ts'\)\.then\(\(m\) => m\.jarvisPage\(args\)\)/);
  assert.match(main, /import\('\.\/pages\/jarvis-nucleo\.ts'\)\.then\(\(m\) => m\.jarvisNucleoPage\(args\)\)/);
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
  assert.match(consoleSource, /performanceQuality === 'reduced' \? 40 : 72/);
  assert.match(consoleSource, /dataset\.particles/);
  assert.match(consoleSource, /connectionStride = performanceQuality === 'reduced' \? 4 : 2/);
  assert.match(consoleSource, /dataset\.performance/);
  assert.match(performanceScript, /REDUCED_MOTION/);
  assert.match(performanceScript, /jv-mark-xiii/);
  assert.match(performanceScript, /serviceWorkers: 'block'/);
  assert.match(packageJson, /jarvis:performance/);
});

test('o estado do Runtime chega por observação compartilhada e não vira claim client-side', () => {
  assert.match(page, /import \{ bus \} from '\.\.\/core\/events\.js'/);
  assert.match(page, /bus\.on<\{ connected\?: boolean; detail\?: string \}>\('nucleo:status'/);
  assert.match(page, /source: 'v1-nucleo-event'/);
  assert.match(page, /source: 'runtime-observed'/);
  assert.match(page, /const observedHealth = info\.health/);
  assert.match(page, /const observedSeverity = info\.severity/);
  assert.match(page, /const observedFallback = info\.fallback/);
  assert.match(page, /detail: info\.detail/);
  assert.match(engineTypes, /ServerHealthSeverity/);
  assert.match(engineTypes, /ServerHealthFallback/);
  assert.match(engineTypes, /contractVersion\?: 'server-health\/v1'/);
  assert.match(page, /bus\.on<\{ path\?: string \}>\('route:change'/);
  assert.match(page, /if \(path !== '\/jarvis'\) disposeMarkXiiiConsole\(\)/);
  assert.match(consoleSource, /setRuntimeObservation\(observation/);
  assert.match(consoleSource, /runtimeAuthority: 'not-authorized'/);
  assert.match(consoleSource, /AUTORIDADE/);
  assert.match(consoleSource, /NÃO AUTORIZADA/);
  assert.match(nucleoSocket, /bus\.emit\('nucleo:status'/);
  assert.match(styles, /data-runtime-authority="not-authorized"/);
});
