import assert from 'node:assert/strict';
import test from 'node:test';
import { JARVIS_V7_PATH, normalizeJarvisV7Url } from '../../src/utils/jarvis-v7-visual.ts';

test('normaliza o artefato V7 relativo para a origem atual', () => {
  const resolved = normalizeJarvisV7Url();
  assert.equal(new URL(resolved).pathname, JARVIS_V7_PATH);
  assert.equal(new URL(resolved).origin, 'http://localhost');
});

test('aceita somente o caminho V7 exacto same-origin', () => {
  const resolved = normalizeJarvisV7Url(`http://localhost${JARVIS_V7_PATH}`);
  assert.equal(resolved, `http://localhost${JARVIS_V7_PATH}`);
});

test('rejeita origem externa, caminho diferente, query e hash', () => {
  const invalidSources = [
    'https://example.com/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html',
    '/project%20V2/Modelar%20objeto%203D/outro.html',
    `${JARVIS_V7_PATH}?remote=1`,
    `${JARVIS_V7_PATH}#remote`,
  ];
  for (const source of invalidSources) {
    assert.throws(() => normalizeJarvisV7Url(source), TypeError);
  }
});

test('rejeita protocolos e entradas vazias', () => {
  for (const source of ['', 'javascript:alert(1)', 'data:text/html,unsafe']) {
    assert.throws(() => normalizeJarvisV7Url(source), TypeError);
  }
});
