/**
 * Smoke E2E do Runtime: Core -> binário Rust, pela fronteira de verdade.
 *
 * ── Por que este script mudou ────────────────────────────────────────────────
 * Ele reimplementava o protocolo à mão: `spawn` próprio, `JSON.stringify(req)`
 * + `\n` próprio, buffer de linhas próprio, teto próprio. Havia portanto DUAS
 * implementações do mesmo protocolo no repositório — esta, e o transporte
 * declarado em `v2/core/runtime-stdio.js`.
 *
 * A consequência não era estética. O transporte tinha **zero consumidores**
 * justamente porque o único código que falava com o binário passava por fora
 * dele; e este smoke, que é o portão E2E do CI (`v2-runtime-e2e.yml`), ficava
 * verde provando o protocolo DESTE ARQUIVO, não o do transporte. O transporte
 * podia estar quebrado sem que nada acusasse — e estava: uma resposta inválida
 * pendurava o chamador para sempre.
 *
 * Agora o smoke usa `criarRuntimeStdio`. Com isso o portão passa a exercitar a
 * peça que o resto do sistema usaria, e a fronteira medida aqui é a mesma que a
 * V2 atravessa.
 */

import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { criarRuntimeStdio } from '../v2/core/runtime-stdio.js';

const root = await mkdtemp(join(tmpdir(), 'baluarte-runtime-'));
const moduleRoot = join(root, 'alpha');
await mkdir(moduleRoot, { recursive: true });
await writeFile(join(moduleRoot, 'hello.txt'), 'BALUARTE-V2');

const binary = process.platform === 'win32'
  ? 'v2/runtime/target/debug/baluarte-runtime.exe'
  : 'v2/runtime/target/debug/baluarte-runtime';

/* `root` é a raiz confiável; quem a fornece é o processo pai, e o transporte a
 * repassa em `BALUARTE_RUNTIME_ROOT`. O manifesto não escolhe raiz física. */
const runtime = criarRuntimeStdio({ executable: binary, root });

const envelope = {
  versao: 1,
  modulos: [{ modulo: 'alpha', permissoes: ['READ_FILES'] }]
};

try {
  const authorized = await runtime.autorizar(envelope);
  if (authorized.status !== 'authorized' || !authorized.modulos?.includes('alpha')) {
    throw new Error(`authorize inesperado: ${JSON.stringify(authorized)}`);
  }

  const file = await runtime.lerArquivo(envelope, 'alpha', 'hello.txt');
  const content = Buffer.from(file.bytes ?? []).toString('utf8');
  if (file.status !== 'file' || content !== 'BALUARTE-V2') {
    throw new Error(`read_file inesperado: ${JSON.stringify(file)}`);
  }

  /* A asserção que não é sobre transporte, e sim sobre a POLÍTICA do Runtime:
   * `..` tem de ser recusado pelo lado Rust. Um transporte que funcionasse e um
   * confinamento que vazasse dariam, juntos, um smoke verde e um sistema aberto. */
  const escape = await runtime.lerArquivo(envelope, 'alpha', '../secret.txt');
  if (escape.status !== 'error') {
    throw new Error(`escape não foi recusado: ${JSON.stringify(escape)}`);
  }

  console.log('V2 Runtime smoke: OK (pelo transporte de verdade)');
} finally {
  await runtime.fechar();
  await rm(root, { recursive: true, force: true });
}
