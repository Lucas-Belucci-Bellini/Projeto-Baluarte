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

test('a rota aponta para a view PRÓPRIA, não para a página da V1', () => {
  /* É o que distingue módulo nativo de adaptador. */
  assert.deepEqual(manifesto.routes.map((r) => r.path), ['/cripto']);
  const fonte = ler('v2/modules/cripto/module.js');
  assert.match(fonte, /import\('\.\/view\.js'\)/);
  assert.ok(!/src\/pages/.test(fonte), 'o módulo nativo ainda aponta para a V1');
});

test('a chave de storage MUDOU — e a divergência é deliberada', () => {
  /* A versão adaptadora deste módulo herdava `cripto:active` da V1. O módulo
   * nativo usa `cripto:painel`, e isso não é descuido:
   *
   * A V1 tem oito painéis; este módulo tem dois. O valor guardado lá ("morse",
   * "vigenere") não significa nada aqui, então herdar a chave seria herdar um
   * dado que o novo código não sabe interpretar — e cair no fallback em silêncio,
   * que é exatamente o modo de falha que esta arquitetura combate.
   *
   * Nada se perde: a V1 continua lendo `cripto:active`, porque a V1 continua
   * existindo. São dois módulos, dois namespaces. */
  assert.deepEqual(manifesto.storage.map((s) => s.key), ['cripto:painel']);

  const politica = ler('src/core/politica.js');
  assert.match(politica, /chave: 'cripto:active'/,
    'a V1 deixou de declarar a própria chave — revise esta decisão');
});

test('a estabilidade é BETA, não estável — código novo não nasce maduro', () => {
  /* A V1 declara `cripto: estavel` e tem razão: são 27 testes sobre oito
   * painéis rodando há tempo. Este módulo é código novo com escopo estreito.
   * Carimbá-lo de `estavel` por herança seria emprestar credibilidade que ele
   * ainda não tem — e `estavel`, pela definição em vigor, promete previsível,
   * testado, recuperável e seguro. */
  assert.equal(manifesto.stability, 'beta');
});

test('declara permissão nenhuma — e isso é uma afirmação, não esquecimento', () => {
  /* Regra 11, permissão mínima. Cifrar texto digitado não toca arquivo, rede
   * nem banco. Se um dia /cripto passar a ler arquivo, este teste vira o lugar
   * onde alguém percebe que precisa declarar. */
  assert.deepEqual(normalizar(manifesto).permissions, []);
  const src = ler('src/utils/cripto-engine.js');
  assert.ok(!src.includes('fetch('), 'o motor passou a usar rede — revise permissions');
});

test('emite o que faz, sem o conteúdo do que cifrou', () => {
  /* Evento carregando texto cifrado vazaria pelo caminho de quem observa —
   * qualquer módulo com `bus.on('*')` veria. O evento diz que aconteceu e o
   * tamanho; o conteúdo fica no módulo. */
  const n = normalizar(manifesto);
  assert.deepEqual(n.events.emits, ['cripto:cifrou', 'cripto:decifrou']);
  assert.deepEqual(n.events.consumes, []);

  /* A checagem no código-fonte precisa ser PRECISA, não aproximada: a primeira
   * versão desta asserção reprovava `{ tamanho: entrada.value.length }`, que é
   * justamente a forma correta. Regex grosseira em teste de segurança dá os dois
   * erros possíveis — reprova o certo e, quando afrouxada, aprova o errado.
   *
   * Aqui: extrai cada `emit(...)` e confere que o payload só tem `tamanho`. */
  const view = ler('v2/modules/cripto/view.js');
  const emits = [...view.matchAll(/bus\?\.emit\((.*?)\);/g)].map((m) => m[1]);
  assert.equal(emits.length, 2, `esperava 2 emits na view, achei ${emits.length}`);

  for (const chamada of emits) {
    assert.ok(/\{\s*tamanho:/.test(chamada), `payload sem tamanho: ${chamada}`);
    assert.ok(!/senha/.test(chamada), `senha no evento: ${chamada}`);
    /* `entrada.value` só pode aparecer seguido de `.length`. */
    assert.ok(!/entrada\.value(?!\.length)/.test(chamada), `conteúdo cru no evento: ${chamada}`);
  }
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
