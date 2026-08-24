/**
 * A ponte do app desktop para o Runtime nativo.
 *
 * O `desktop/` não tinha teste nenhum até aqui — é uma ilha CommonJS que
 * ninguém importava. Este arquivo existe porque a ponte tem lógica de verdade
 * (resolução de caminho, degradação, preguiça), e lógica sem teste no processo
 * `main` do Electron é o pior lugar possível para descobrir um defeito.
 *
 * O módulo foi escrito sem `require('electron')` justamente para poder ser
 * exercitado aqui, em Node puro — a mesma disciplina que o `hermes.js` já
 * seguia. A raiz confiável entra injetada.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const exigir = createRequire(import.meta.url);
const { criarRuntime, candidatosBinario, candidatosTransporte, EXE } =
  exigir('../../desktop/src/runtime.js');

/* O binário só existe depois de um `cargo build`. A suíte não compila Rust — quem
 * compila é o `v2-runtime-e2e.yml` — então o teste de ponta a ponta abaixo é
 * condicional, e diz em voz alta quando não roda. Skip silencioso é cobertura
 * imaginária: parece verde e não mediu nada. */
const BINARIO = candidatosBinario().find((c) => existsSync(c)) ?? null;

test('sem binário, status degrada com motivo — e não estoura', () => {
  /* É o estado normal hoje: nenhuma release empacota o binário. Uma ponte que
   * lança aqui transformaria "recurso ausente" em "app quebrado", e o `main` do
   * Electron é onde isso custa mais caro. */
  const r = criarRuntime({ raiz: '/tmp/x', acharBinario: () => null });
  const s = r.status();
  assert.equal(s.disponivel, false);
  assert.match(s.motivo, /binário do Runtime não encontrado/);
});

test('com binário mas sem transporte, o motivo aponta o transporte', () => {
  /* Dois modos de ausência com causas diferentes. Um motivo genérico mandaria
   * quem lê procurar o binário quando o que falta é o `v2/core/` no pacote. */
  const r = criarRuntime({
    raiz: '/tmp/x',
    acharBinario: () => '/fake/baluarte-runtime',
    acharTransporte: () => null
  });
  const s = r.status();
  assert.equal(s.disponivel, false);
  assert.match(s.motivo, /transporte/);
  assert.equal(s.binario, '/fake/baluarte-runtime');
});

test('com as duas peças, status fica disponível', () => {
  const r = criarRuntime({
    raiz: '/tmp/x',
    acharBinario: () => '/fake/bin',
    acharTransporte: () => '/fake/transporte.js'
  });
  assert.deepEqual(r.status(), { disponivel: true, binario: '/fake/bin' });
});

test('a ponte é preguiçosa: construir não procura nem sobe processo', async () => {
  /* Se `criarRuntime` spawnasse na construção, todo arranque do app pagaria por
   * um recurso que a maioria das sessões não usa. */
  let procurou = 0;
  const r = criarRuntime({
    raiz: '/tmp/x',
    acharBinario: () => { procurou += 1; return null; },
    acharTransporte: () => null
  });
  assert.equal(procurou, 0, 'a construção não pode sequer procurar o binário');
  r.status();
  assert.equal(procurou, 1);
  /* E operar sem as peças falha com a causa dita, em vez de pendurar. */
  await assert.rejects(() => r.autorizar({ versao: 1, modulos: [] }), /Runtime indisponível/);
});

test('raiz é obrigatória', () => {
  /* A raiz confiável é o que confina o Runtime a um diretório. Deixá-la
   * implícita é como o confinamento começa a vazar — por isso é exigida na
   * construção, não no uso. */
  assert.throws(() => criarRuntime({}), /raiz/);
});

test('o repositório é o ÚLTIMO candidato do transporte', () => {
  /* Em app empacotado o caminho do repositório não existe; se a ordem
   * invertesse, a busca dependeria de um diretório que só existe na máquina de
   * quem desenvolve. */
  const c = candidatosTransporte();
  assert.ok(c.length >= 1);
  assert.match(c[c.length - 1], /v2[\\/]core[\\/]runtime-stdio\.js$/);
});

test('o nome do executável acompanha a plataforma', () => {
  assert.equal(EXE, process.platform === 'win32' ? 'baluarte-runtime.exe' : 'baluarte-runtime');
});

test('ponta a ponta pelo módulo do desktop, contra o binário real', {
  skip: BINARIO
    ? false
    : 'binário do Runtime ausente — rode `cargo build --release --manifest-path v2/runtime/Cargo.toml`'
}, async () => {
  /* O que os testes acima NÃO provam: que a ponte fala com o Runtime. Aqui ela
   * atravessa a fronteira inteira — módulo do desktop -> transporte ESM (por
   * `import()` dinâmico a partir de CommonJS) -> processo Rust. */
  const raiz = await mkdtemp(join(tmpdir(), 'baluarte-desktop-'));
  await mkdir(join(raiz, 'alpha'), { recursive: true });
  await writeFile(join(raiz, 'alpha', 'hello.txt'), 'BALUARTE-V2');

  const r = criarRuntime({ raiz, acharBinario: () => BINARIO });
  try {
    const envelope = { versao: 1, modulos: [{ modulo: 'alpha', permissoes: ['READ_FILES'] }] };

    const ok = await r.autorizar(envelope);
    assert.equal(ok.status, 'authorized');

    const arquivo = await r.ler(envelope, 'alpha', 'hello.txt');
    assert.equal(Buffer.from(arquivo.bytes ?? []).toString('utf8'), 'BALUARTE-V2');

    /* A política do Runtime, não o transporte: `..` tem de ser recusado do outro
     * lado da fronteira. */
    const fuga = await r.ler(envelope, 'alpha', '../secret.txt');
    assert.equal(fuga.status, 'error');
  } finally {
    await r.fechar();
    await rm(raiz, { recursive: true, force: true });
  }
});
