/**
 * Transporte por stdio — contra PROCESSO REAL, não contra duplo de `spawn`.
 *
 * `criarRuntimeStdio` é a quarta peça deste repositório encontrada pronta,
 * documentada (`docs/v2/V2_RUNTIME_STDIO.md`) e **desligada**: busca textual pelos
 * importadores não achou nenhum — nem de produção, nem de teste. Peça sem
 * consumidor não tem retrato: ninguém sabia se ela funcionava.
 *
 * Os duplos de `spawn` (a opção `spawnFn` existe para isso) provariam o formato
 * das mensagens e mais nada. O que só um processo de verdade expõe é o
 * comportamento de I/O: resposta inválida, processo que morre com requisição em
 * voo, reaproveitamento do filho. É onde estava o defeito que este arquivo pegou.
 *
 * O par é `node` falando o protocolo — não o binário Rust, que exige `cargo`.
 * Isto prova o **lado Core** da fronteira; o lado Rust é medido pelo
 * `npm run v2:runtime`, que não roda em máquina sem `cargo`.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { criarRuntimeStdio } from '../../v2/core/runtime-stdio.js';

/** Responde a cada linha recebida com o que `responder` avaliar. */
const ECO = (responder) => `
  const readline = require('node:readline');
  const rl = readline.createInterface({ input: process.stdin });
  rl.on('line', (linha) => {
    const pedido = JSON.parse(linha);
    process.stdout.write(${responder} + '\\n');
  });
`;

/**
 * Um Runtime de mentira que fala o protocolo de verdade: uma linha JSON entra,
 * uma linha JSON sai. `process.execPath` é o próprio node — spawnar o
 * executável direto evita o `.cmd` que o Node 24 recusa no Windows
 * (CVE-2024-27980), armadilha já paga neste repositório.
 */
function runtimeFalso(corpo) {
  return criarRuntimeStdio({
    executable: process.execPath,
    args: ['-e', corpo],
    root: '/raiz-de-teste'
  });
}

test('autorizar faz ida e volta por um processo real', async () => {
  const t = runtimeFalso(ECO(`JSON.stringify({ status: 'authorized', modulos: [pedido.envelope.modulos[0].modulo], op: pedido.op })`));
  try {
    const r = await t.autorizar({ versao: 1, modulos: [{ modulo: 'alpha', permissoes: ['READ_FILES'] }] });
    assert.equal(r.status, 'authorized');
    assert.deepEqual(r.modulos, ['alpha']);
    /* O `op` volta ecoado: prova que a linha ESCRITA tinha o verbo do contrato,
     * e não só que a resposta foi lida. */
    assert.equal(r.op, 'authorize', 'o verbo do protocolo precisa ir na linha');
  } finally {
    await t.fechar();
  }
});

test('lerArquivo envia modulo e path, como manda o contrato', async () => {
  const t = runtimeFalso(ECO(`JSON.stringify({ status: 'ok', op: pedido.op, modulo: pedido.modulo, path: pedido.path })`));
  try {
    const r = await t.lerArquivo({ versao: 1, modulos: [] }, 'alpha', 'hello.txt');
    assert.equal(r.op, 'read_file');
    assert.equal(r.modulo, 'alpha');
    assert.equal(r.path, 'hello.txt');
  } finally {
    await t.fechar();
  }
});

test('a raiz confiável chega ao processo por BALUARTE_RUNTIME_ROOT', async () => {
  /* O contrato diz que o manifesto NÃO escolhe a raiz física: quem a fornece é
   * o processo pai, por variável de ambiente. Sem esta asserção, o Core poderia
   * parar de passá-la e só o Rust notaria — em produção. */
  const t = criarRuntimeStdio({
    executable: process.execPath,
    args: ['-e', ECO(`JSON.stringify({ raiz: process.env.BALUARTE_RUNTIME_ROOT })`)],
    root: '/raiz-confiavel'
  });
  try {
    const r = await t.autorizar({ versao: 1, modulos: [] });
    assert.equal(r.raiz, '/raiz-confiavel');
  } finally {
    await t.fechar();
  }
});

test('resposta inválida REJEITA — não pendura o chamador', async () => {
  /* O defeito que este arquivo encontrou. `parseResposta` lançava dentro do
   * handler de `line`, e `pending` já tinha sido zerado uma linha antes: o erro
   * subia como exceção não capturada E a promessa nunca assentava. Um Runtime
   * que respondesse lixo penduraria o Core em silêncio — o mesmo formato do
   * "init que trava não pendura o Baluarte", agora na fronteira.
   *
   * Sem o conserto este teste não falha: ele TRAVA até o teto do runner. */
  const t = runtimeFalso(`
    const readline = require('node:readline');
    readline.createInterface({ input: process.stdin })
      .on('line', () => process.stdout.write('nao sou json\\n'));
  `);
  try {
    await assert.rejects(
      () => t.autorizar({ versao: 1, modulos: [] }),
      /resposta do Runtime inválida/
    );
  } finally {
    await t.fechar();
  }
});

test('resposta que não é objeto também rejeita', async () => {
  /* `JSON.parse("[1,2,3]")` não lança — a guarda de tipo é que barra. Array
   * passaria por "JSON válido" e viraria uma resposta sem `status`. */
  const t = runtimeFalso(ECO(`JSON.stringify([1, 2, 3])`));
  try {
    await assert.rejects(
      () => t.autorizar({ versao: 1, modulos: [] }),
      /resposta do Runtime/
    );
  } finally {
    await t.fechar();
  }
});

test('processo que morre com requisição em voo rejeita, e não fica pendurado', async () => {
  /* Runtime que cai no meio do pedido é o caso operacional real: sem o handler
   * de `exit`, o chamador esperaria para sempre por um processo que não existe
   * mais. */
  const t = runtimeFalso(`
    const readline = require('node:readline');
    readline.createInterface({ input: process.stdin }).on('line', () => process.exit(3));
  `);
  try {
    await assert.rejects(
      () => t.autorizar({ versao: 1, modulos: [] }),
      /Runtime encerrou/
    );
  } finally {
    await t.fechar();
  }
});

test('só uma requisição em voo por processo, como o contrato limita', async () => {
  const t = runtimeFalso(ECO(`JSON.stringify({ status: 'ok' })`));
  try {
    const primeira = t.autorizar({ versao: 1, modulos: [] });
    await assert.rejects(
      () => t.autorizar({ versao: 1, modulos: [] }),
      /já possui uma requisição em voo/
    );
    await primeira;
  } finally {
    await t.fechar();
  }
});

test('o processo é reaproveitado entre requisições sequenciais', async () => {
  /* `iniciar()` é idempotente por desenho. Se cada chamada spawnasse de novo, o
   * custo por requisição viraria o de um processo — e o contador abaixo, que
   * vive DENTRO do filho, reiniciaria em 1. */
  const t = runtimeFalso(`
    let n = 0;
    const readline = require('node:readline');
    readline.createInterface({ input: process.stdin }).on('line', () => {
      n += 1;
      process.stdout.write(JSON.stringify({ status: 'ok', n }) + '\\n');
    });
  `);
  try {
    assert.equal((await t.autorizar({ versao: 1, modulos: [] })).n, 1);
    assert.equal((await t.autorizar({ versao: 1, modulos: [] })).n, 2, 'o processo foi respawnado');
  } finally {
    await t.fechar();
  }
});

test('executable e root são obrigatórios', () => {
  /* `root` é a raiz confiável. Deixá-la implícita é como o confinamento de
   * caminho começa a vazar — por isso ela é exigida na construção, não no uso. */
  assert.throws(() => criarRuntimeStdio({ root: '/r' }), /executable/);
  assert.throws(() => criarRuntimeStdio({ executable: 'x' }), /root/);
});
