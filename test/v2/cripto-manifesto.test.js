/**
 * O manifesto de `/cripto` bate com a V1? (caso de prova do Module System)
 *
 * Um manifesto que "parece certo" não prova nada. Estes testes leem os arquivos
 * **reais** da V1 e cobram que o manifesto reproduza o que eles dizem — rota,
 * chave de storage, estabilidade. Se alguém mexer na V1 e o manifesto não
 * acompanhar, isto fica vermelho.
 *
 * O último teste é o mais importante e o mais desconfortável: ele **afirma a
 * divergência atual** entre `sidebar.js` e `shell.js`. Enquanto o defeito
 * existir, ele passa e documenta o defeito com precisão; no dia em que alguém
 * unificar os dois rótulos na V1, ele falha e obriga a atualizar este arquivo.
 * É de propósito — um teste que sabe por que existe é melhor que um comentário
 * que ninguém lê.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import manifesto from '../../v2/modules/cripto/module.js';
import { validar, normalizar } from '../../v2/core/manifest.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '../..');
const ler = (p) => readFileSync(join(raiz, p), 'utf8');

test('o manifesto de /cripto é válido', () => {
  const r = validar(manifesto);
  assert.equal(r.ok, true, r.erros.join(' | '));
});

test('a rota existe de verdade em main.js', () => {
  const main = ler('src/main.js');
  const paths = manifesto.routes.map((r) => r.path);
  assert.deepEqual(paths, ['/cripto']);
  assert.ok(main.includes("router.register('/cripto'"), 'a V1 não registra /cripto');
});

test('a chave de storage é a MESMA que a V1 declara — herda, não reinventa', () => {
  const politica = ler('src/core/politica.js');
  for (const s of manifesto.storage) {
    assert.ok(
      politica.includes(`chave: '${s.key}'`),
      `${s.key} não existe em politica.js — o manifesto inventou uma chave`
    );
    assert.ok(
      politica.includes(`chave: '${s.key}', versao: ${s.version}`),
      `${s.key} está em versão diferente da V1`
    );
  }
});

test('a estabilidade bate com a tabela da V1', () => {
  const politica = ler('src/core/politica.js');
  assert.match(politica, /\{ id: 'cripto', nivel: 'estavel'/);
  assert.equal(manifesto.stability, 'estavel');
});

test('declara permissão nenhuma — e isso é uma afirmação, não esquecimento', () => {
  /* Regra 11, permissão mínima. Cifrar texto digitado não toca arquivo, rede
   * nem banco. Se um dia /cripto passar a ler arquivo, este teste vira o lugar
   * onde alguém percebe que precisa declarar. */
  assert.deepEqual(normalizar(manifesto).permissions, []);
  const src = ler('src/utils/cripto-engine.js');
  assert.ok(!src.includes('fetch('), 'o motor passou a usar rede — revise permissions');
});

test('não emite nem consome evento, como o código', () => {
  const n = normalizar(manifesto);
  assert.deepEqual(n.events.emits, []);
  assert.deepEqual(n.events.consumes, []);
});

test('UM manifesto substitui o que hoje mora em oito arquivos', () => {
  const n = normalizar(manifesto);
  /* Cada campo abaixo é hoje uma declaração separada num arquivo diferente. */
  assert.ok(n.name, 'sidebar.js + shell.js');
  assert.ok(n.icon, 'sidebar.js + icons.js');
  assert.ok(n.routes.length, 'main.js');
  assert.ok(n.storage.length, 'politica.js');
  assert.ok(n.stability, 'politica.js (tabela)');
  assert.ok(n.description, 'site-capabilities.js');
  assert.ok(n.nav.section, 'sidebar.js (agrupamento)');
});

test('DÍVIDA CONHECIDA: sidebar e shell divergem no nome de /cripto', () => {
  /* Este teste falha de propósito quando a V1 for corrigida. Ver o cabeçalho. */
  const sidebar = ler('src/layout/sidebar.js');
  const shell = ler('src/layout/shell.js');

  const naSidebar = sidebar.match(/path: '\/cripto',\s*label: '([^']+)'/)?.[1];
  const noShell = shell.match(/'\/cripto': '([^']+)'/)?.[1];

  assert.equal(naSidebar, 'Lab de Cripto');
  assert.equal(noShell, 'Lab de Criptografia');
  assert.notEqual(naSidebar, noShell, 'a V1 foi corrigida — atualize este teste e o manifesto');

  /* O manifesto resolve escolhendo o rótulo longo: abreviar é decisão de
   * layout, e quem abrevia deve ser o CSS, não o dado. */
  assert.equal(manifesto.name, noShell);
});
