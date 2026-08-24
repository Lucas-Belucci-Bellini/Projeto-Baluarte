import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const repoRoot = fileURLToPath(new URL('../..', import.meta.url));
const pageSource = fs.readFileSync(path.join(repoRoot, 'src/pages/jarvis.ts'), 'utf8');
const assetPath = path.join(repoRoot, 'public/jarvis/jarvis-nucleo-browser.webp');

test('pagina JARVIS usa a captura dourada local como fallback visual', () => {
  assert.match(pageSource, /src: '\/jarvis\/jarvis-nucleo-browser\.webp'/);
  assert.match(pageSource, /alt: 'Núcleo dourado J\.A\.R\.V\.I\.S\. do Projeto Baluarte'/);
  assert.doesNotMatch(pageSource, /src: 'https?:\/\//);
});

test('asset visual do navegador existe e tem conteúdo', () => {
  const stat = fs.statSync(assetPath);
  assert.ok(stat.isFile());
  assert.ok(stat.size > 100_000, `asset inesperadamente pequeno: ${stat.size} bytes`);
});
