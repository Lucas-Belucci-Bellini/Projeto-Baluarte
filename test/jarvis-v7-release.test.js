import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(fileURLToPath(new URL('..', import.meta.url)));
const nucleo = join(raiz, 'project V2', 'Modelar objeto 3D');
const htmlPath = join(nucleo, 'jarvis-nucleo-v7.html');
const tsPath = join(nucleo, 'jarvis-nucleo-v7.ts');
const jsPath = join(nucleo, 'jarvis-nucleo-v7.js');
const viteConfig = readFileSync(join(raiz, 'vite.config.js'), 'utf8');
const html = readFileSync(htmlPath, 'utf8');
const source = readFileSync(tsPath, 'utf8');
const artifact = readFileSync(jsPath, 'utf8');

test('release 1.2.6 mantém os três artefatos do Núcleo V7', () => {
  assert.equal(existsSync(htmlPath), true);
  assert.equal(existsSync(tsPath), true);
  assert.equal(existsSync(jsPath), true);
});

test('Vite empacota o HTML V7 canônico da pasta Modelar objeto 3D', () => {
  assert.match(viteConfig, /project V2\/Modelar objeto 3D\/jarvis-nucleo-v7\.html/);
  assert.match(html, /<title>NÚCLEO J\.A\.R\.V\.I\.S\. v7/);
  assert.match(html, /<script type="module" src="\.\/jarvis-nucleo-v7\.ts"><\/script>/);
});

test('o visual V7 contém áudio reativo, temas e loop 3D no TypeScript canônico', () => {
  assert.match(source, /class AudioEngine/);
  assert.match(source, /const THEMES/);
  assert.match(source, /THREE\.EffectComposer/);
  assert.match(html, /data-th="0"/);
  assert.match(source, /requestAnimationFrame\(animate\)/);
  assert.match(artifact, /class AudioEngine/);
  assert.match(artifact, /requestAnimationFrame\(animate\)/);
});
