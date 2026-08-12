/**
 * O terminal web não alcança nada real (#420).
 *
 * O terminal está marcado `beta`, então ele não precisa cumprir todos os
 * critérios da 1.0.0 — mas **fuga de sandbox não é dispensável por estar em
 * beta**. Um terminal com 60+ comandos POSIX é a primeira coisa que alguém
 * tenta usar para sair da caixa, e o plano da V2 prevê ligá-lo a um agente e ao
 * MCP. A hora de cobrar a fronteira é antes disso, não depois.
 *
 * O que se cobra aqui:
 *
 *   1. `..` não sobe além da raiz virtual — nem em `cd`, nem em `cat`, nem em
 *      redirecionamento de saída;
 *   2. nenhum comando do catálogo tem caminho para rede, execução de código ou
 *      para a ponte do Launcher;
 *   3. escrever no terminal só mexe na árvore em memória.
 *
 * Roda em Node puro: o VFS é uma árvore de objetos e o `storage` cai no Map em
 * memória fora do navegador. Ou seja, este teste é executado **sem** um
 * filesystem real por perto — o que também prova que o terminal nunca precisou
 * de um.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import * as vfs from '../src/utils/vfs.js';
import { execute, createContext } from '../src/utils/terminal-engine.js';
import { COMMANDS } from '../src/data/terminal-commands.js';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');

/* Terminal falso: coleta o que seria impresso, sem DOM. */
function terminalFalso() {
  const linhas = [];
  return { println: (l) => linhas.push(String(l)), linhas, clear: () => { linhas.length = 0; } };
}

let ctx;
beforeEach(() => {
  vfs.resetVfs();
  ctx = createContext(terminalFalso());
});

const rodar = (linha) => execute(linha, ctx);

/* ===== 1. A raiz virtual é o teto ===== */

test('cd com .. em excesso para na raiz, não sobe além', async () => {
  await rodar('cd /../../../../..');
  assert.equal(ctx.cwd, '/', 'o cwd tinha que ficar preso na raiz virtual');
});

test('normalizePath não produz caminho fora da raiz', () => {
  for (const entrada of [
    '../../../etc/passwd',
    '/../../../etc/passwd',
    '/home/lucas/../../../../root/.ssh/id_rsa',
    '....//....//etc',
    '/a/b/../../../../c'
  ]) {
    const saida = vfs.normalizePath(entrada, '/home/lucas');
    assert.ok(saida.startsWith('/'), `"${entrada}" saiu como "${saida}"`);
    /* O invariante é por SEGMENTO, não por substring: `....` (quatro pontos) é
     * um nome de diretório legítimo e contém ".." sem ser travessia. Confundir
     * os dois foi o primeiro rascunho deste teste — e ele acusou o código certo
     * de errado. */
    const segmentos = saida.split('/').filter(Boolean);
    assert.ok(
      !segmentos.includes('..') && !segmentos.includes('.'),
      `"${entrada}" deixou segmento de travessia em "${saida}"`
    );
  }
});

test('nome de diretório com muitos pontos é nome, não travessia', () => {
  /* `....` não é `..`, e o VFS trata como nome comum — que é o certo. */
  assert.equal(vfs.normalizePath('....', '/home/lucas'), '/home/lucas/....');
  assert.equal(vfs.normalizePath('..', '/home/lucas'), '/home');
  assert.equal(vfs.normalizePath('.', '/home/lucas'), '/home/lucas');
});

test('cat de caminho do sistema real não devolve conteúdo real', async () => {
  /* Estes arquivos EXISTEM na máquina que roda o teste. Se o terminal
   * alcançasse o disco, aqui apareceria o conteúdo deles. */
  for (const alvo of ['/etc/passwd', '../../../../etc/passwd', '/etc/hosts']) {
    const r = await rodar(`cat ${alvo}`);
    assert.ok(
      !/root:|localhost/.test(r.stdout || ''),
      `"${alvo}" devolveu algo que parece o arquivo real: ${r.stdout}`
    );
  }
});

test('ls da raiz mostra a árvore virtual, não a do disco', async () => {
  const r = await rodar('ls /');
  const saida = r.stdout || '';
  /* Pastas que existem no disco de qualquer Linux e NÃO na árvore virtual. */
  for (const real of ['proc', 'sys', 'root', 'boot']) {
    assert.ok(!new RegExp(`\\b${real}\\b`).test(saida), `"${real}" apareceu no ls: ${saida}`);
  }
});

/* ===== 2. Escrever fica dentro da árvore ===== */

test('escrever com .. em excesso cria dentro da raiz virtual, não fora', async () => {
  await rodar('echo invadido > /../../../../tmp/fuga.txt');
  /* O caminho normaliza para /tmp/fuga.txt DENTRO da árvore virtual. */
  const dentro = vfs.readFile('/tmp/fuga.txt');
  assert.equal(dentro, 'invadido');

  /* E o arquivo real de mesmo nome não existe no disco. */
  let existeNoDisco = true;
  try { readFileSync('/tmp/fuga.txt', 'utf8'); } catch { existeNoDisco = false; }
  assert.equal(existeNoDisco, false, 'o terminal escreveu no disco de verdade');
});

test('rm -rf / não alcança nada real', async () => {
  await rodar('rm -rf /');
  /* O processo de teste continua vivo e o disco intacto — o `package.json`
   * deste repositório é a testemunha. */
  assert.ok(readFileSync(join(raiz, 'package.json'), 'utf8').includes('projeto-baluarte'));
});

test('a árvore volta ao estado inicial com resetVfs', async () => {
  await rodar('rm -rf /home');
  vfs.resetVfs();
  assert.ok(vfs.exists('/home/lucas'), 'reset tinha que reconstruir a árvore');
});

/* ===== 3. Nenhum comando alcança o mundo real ===== */

/* Capacidades que um comando de terminal virtual não pode tocar. `location` é
 * exceção declarada: três comandos (`logout`, `reboot`, o de navegação) mexem na
 * rota do site de propósito — é navegação de UI, não acesso a filesystem. */
const PROIBIDO = [
  ['fetch(', 'rede'],
  ['XMLHttpRequest', 'rede'],
  ['WebSocket', 'rede'],
  ['import(', 'carregar código'],
  ['eval(', 'executar código'],
  ['new Function', 'executar código'],
  ['baluarte.invoke', 'ponte do Launcher (arquivo real)'],
  ['requestFileSystem', 'filesystem real'],
  ['showOpenFilePicker', 'filesystem real'],
  ['showSaveFilePicker', 'filesystem real']
];

test('o catálogo de comandos não referencia capacidade proibida', () => {
  const fonte = readFileSync(join(raiz, 'src/data/terminal-commands.js'), 'utf8');
  for (const [trecho, oque] of PROIBIDO) {
    assert.ok(
      !fonte.includes(trecho),
      `terminal-commands.js referencia "${trecho}" (${oque}) — o terminal virtual não pode alcançar isso`
    );
  }
});

test('o motor do terminal também não referencia capacidade proibida', () => {
  const fonte = readFileSync(join(raiz, 'src/utils/terminal-engine.js'), 'utf8');
  for (const [trecho, oque] of PROIBIDO) {
    assert.ok(!fonte.includes(trecho), `terminal-engine.js referencia "${trecho}" (${oque})`);
  }
});

test('o VFS não referencia capacidade proibida', () => {
  const fonte = readFileSync(join(raiz, 'src/utils/vfs.js'), 'utf8');
  for (const [trecho, oque] of PROIBIDO) {
    assert.ok(!fonte.includes(trecho), `vfs.js referencia "${trecho}" (${oque})`);
  }
});

/* ===== 4. A API do VFS é a única porta ===== */

test('todo comando declarado tem run() — nada executa por outro caminho', () => {
  const nomes = Object.keys(COMMANDS);
  assert.ok(nomes.length >= 40, `só ${nomes.length} comandos? o catálogo encolheu`);
  for (const nome of nomes) {
    assert.equal(typeof COMMANDS[nome].run, 'function', `"${nome}" sem run()`);
  }
});

test('comando desconhecido falha, não é repassado a lugar nenhum', async () => {
  const r = await rodar('curl https://exemplo.com');
  assert.notEqual(r.exit, 0);
  assert.match(r.stderr || '', /not found|não encontrado|command/i);
});

test('o terminal roda sem window, document ou disco', async () => {
  /* Este teste inteiro rodou em Node puro. Se o terminal precisasse de
   * navegador ou de filesystem, nada acima teria funcionado. */
  assert.equal(typeof globalThis.window, 'undefined');
  assert.equal(typeof globalThis.document, 'undefined');
  const r = await rodar('pwd');
  assert.equal((r.stdout || '').trim(), ctx.cwd);
});
