/**
 * O vertical slice com Runtime NATIVO — a cadeia do
 * `docs/v2/V2_VERTICAL_SLICE.md` percorrida com o processo Rust de verdade.
 *
 *   Registry → Runtime authorization → Runtime session
 *            → init → start → RUNNING → stop → dispose → Runtime close
 *
 * Essa cadeia já era testada, mas **nunca com um Runtime real**. O entrypoint da
 * V2 injeta um Host cujo `abrir` chama `criarGrantRuntime` — autorização sem
 * transporte, porque no navegador não há processo com quem falar. Todo teste até
 * aqui usou espião ou duplo. Então a propriedade "um módulo só entra em
 * `running` depois de abrir seu Runtime" era verdadeira sobre um Runtime que
 * nunca tinha existido.
 *
 * Aqui o `abrir` monta o envelope com `criarCargaRuntime` e manda `authorize`
 * pelo transporte, ao binário. Quem decide se o módulo sobe é o Rust.
 *
 * O par é o binário de verdade, então o arquivo é condicional — e diz em voz
 * alta quando não roda.
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';
import { criarCiclo } from '../../v2/core/ciclo.js';
import { criarLifecycleRuntime } from '../../v2/core/module-runtime-lifecycle.js';
import { criarCargaRuntime } from '../../v2/core/runtime-bootstrap.js';
import { criarRuntimeStdio } from '../../v2/core/runtime-stdio.js';
import { definirDestino, coletor } from '../../v2/core/log.js';

const EXE = process.platform === 'win32' ? 'baluarte-runtime.exe' : 'baluarte-runtime';
const BINARIO = [
  join('v2', 'runtime', 'target', 'release', EXE),
  join('v2', 'runtime', 'target', 'debug', EXE)
].find((c) => existsSync(c)) ?? null;

const SEM_BINARIO = BINARIO
  ? false
  : 'binário do Runtime ausente — rode `cargo build --release --manifest-path v2/runtime/Cargo.toml`';

const mod = (id, lifecycle = {}, permissions = []) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  permissions, lifecycle
});

/**
 * Monta a cadeia inteira com as peças reais e o Runtime nativo.
 *
 * `conceder` só é chamado para quem a lista pedir: declarar não é receber, e o
 * teste precisa dos dois casos.
 */
async function montarSlice({ modulos, concedidos = [] }) {
  definirDestino(coletor().destino);

  const raiz = await mkdtemp(join(tmpdir(), 'baluarte-slice-'));
  const registry = criarRegistry();
  modulos.forEach((m) => registry.registrar(m));
  registry.selar();

  const permissoes = criarPermissoes();
  permissoes.conhecerModulos(registry.listar().map((id) => registry.modulo(id)));
  for (const [modulo, permissao] of concedidos) {
    permissoes.conceder(modulo, permissao, { origem: 'teste' });
  }

  const transporte = criarRuntimeStdio({ executable: String(BINARIO), root: raiz });
  const fechados = [];

  /* O `abrir` que fala com o Rust. É o ponto inteiro deste arquivo: quem
   * autoriza não é mais uma função local, é o processo do outro lado. */
  const host = criarLifecycleRuntime(registry, {
    abrir: async (reg, perm, id) => {
      const resposta = await transporte.autorizar(criarCargaRuntime(reg, perm));
      if (resposta.status !== 'authorized' || !resposta.modulos?.includes(id)) {
        throw new Error(`Runtime recusou "${id}": ${JSON.stringify(resposta)}`);
      }
    },
    fechar: async (id) => { fechados.push(id); }
  }, permissoes);

  const deps = {
    storage: { get: () => undefined, set: () => true },
    permissoes,
    /* A alça que o módulo recebe. Repare que ela leva `modulo` como parâmetro —
     * é o CONTEXTO que o preenche com o id do próprio módulo, e é por isso que
     * o módulo não consegue nomear outro. */
    runtime: { lerArquivo: (modulo, caminho) => transporte.lerArquivo(criarCargaRuntime(registry, permissoes), modulo, caminho) }
  };
  const ciclo = criarCiclo(registry, deps, { runtime: host });

  return {
    raiz, registry, permissoes, transporte, host, ciclo, fechados,
    envelope: () => criarCargaRuntime(registry, permissoes),
    async limpar() {
      await transporte.fechar();
      await rm(raiz, { recursive: true, force: true });
    }
  };
}

test('a cadeia inteira sobe com o Runtime nativo autorizando', { skip: SEM_BINARIO }, async () => {
  const s = await montarSlice({
    modulos: [mod('alpha', {}, ['READ_FILES'])],
    concedidos: [['alpha', 'READ_FILES']]
  });
  try {
    const r = await s.ciclo.subir();

    assert.equal(r.ok, true, `subida falhou: ${JSON.stringify(r.falhas)}`);
    assert.deepEqual(r.vivos, ['alpha']);
    /* A propriedade do contrato: `running` exige sessão aberta — e desta vez a
     * sessão foi aberta pelo processo Rust, não por uma função local. */
    assert.deepEqual(s.host.abertas(), ['alpha'], 'a sessão precisa ter sido aberta de verdade');

    await s.ciclo.descer();
    assert.deepEqual(s.fechados, ['alpha'], 'descer tem de fechar a sessão');
    assert.deepEqual(s.host.abertas(), []);
  } finally {
    await s.limpar();
  }
});

test('o Runtime nativo confina o módulo à raiz dele', { skip: SEM_BINARIO }, async () => {
  /* Autorizar não basta: o slice só vale se a autorização de fato delimitar o
   * que o módulo alcança. Quem recusa o `..` é o Rust, do outro lado. */
  const s = await montarSlice({
    modulos: [mod('alpha', {}, ['READ_FILES'])],
    concedidos: [['alpha', 'READ_FILES']]
  });
  try {
    await mkdir(join(s.raiz, 'alpha'), { recursive: true });
    await writeFile(join(s.raiz, 'alpha', 'hello.txt'), 'BALUARTE-V2');
    await writeFile(join(s.raiz, 'secret.txt'), 'NAO-PODE');

    await s.ciclo.subir();
    const env = s.envelope();

    const dentro = await s.transporte.lerArquivo(env, 'alpha', 'hello.txt');
    assert.equal(Buffer.from(dentro.bytes ?? []).toString('utf8'), 'BALUARTE-V2');

    const fora = await s.transporte.lerArquivo(env, 'alpha', '../secret.txt');
    assert.equal(fora.status, 'error', 'escape de caminho tem de ser recusado pelo Runtime');

    await s.ciclo.descer();
  } finally {
    await s.limpar();
  }
});

test('o MÓDULO lê pelo próprio init, e só dentro da raiz dele', { skip: SEM_BINARIO }, async () => {
  /* Este é o teste que fecha "módulo nativo". Nos anteriores quem lia arquivo
   * era o teste; aqui quem lê é o `init` do módulo, pela alça que o contexto
   * entrega — a cadeia de USO, não só a de autorização. */
  let lido = null;
  let fuga = null;

  const s = await montarSlice({
    modulos: [mod('alpha', {
      init: async (ctx) => {
        const r = await ctx.runtime.lerArquivo('hello.txt');
        lido = Buffer.from(r.bytes ?? []).toString('utf8');
        /* O módulo TENTA escapar da própria raiz. Quem recusa é o Rust. */
        fuga = await ctx.runtime.lerArquivo('../secret.txt');
      }
    }, ['READ_FILES'])],
    concedidos: [['alpha', 'READ_FILES']]
  });
  try {
    await mkdir(join(s.raiz, 'alpha'), { recursive: true });
    await writeFile(join(s.raiz, 'alpha', 'hello.txt'), 'BALUARTE-V2');
    await writeFile(join(s.raiz, 'secret.txt'), 'NAO-PODE');

    const r = await s.ciclo.subir();
    assert.equal(r.ok, true, `subida falhou: ${JSON.stringify(r.falhas)}`);
    assert.equal(lido, 'BALUARTE-V2', 'o init do módulo precisa ter lido pelo Runtime');
    assert.equal(fuga?.status, 'error', 'o módulo não pode escapar da própria raiz');

    await s.ciclo.descer();
  } finally {
    await s.limpar();
  }
});

test('a alça do módulo não aceita nomear outro módulo', { skip: SEM_BINARIO }, async () => {
  /* A propriedade que o `id` fechado por closure garante. Se `lerArquivo`
   * aceitasse um módulo, `alpha` leria a raiz de `beta` — e o confinamento por
   * módulo seria convenção, não garantia. A asserção é sobre a ARIDADE: a alça
   * do contexto recebe caminho, e só. */
  let aridade = null;
  const s = await montarSlice({
    modulos: [mod('alpha', { init: async (ctx) => { aridade = ctx.runtime.lerArquivo.length; } }, ['READ_FILES'])],
    concedidos: [['alpha', 'READ_FILES']]
  });
  try {
    await s.ciclo.subir();
    assert.equal(aridade, 1, 'a alça do módulo tem de receber só o caminho');
    await s.ciclo.descer();
  } finally {
    await s.limpar();
  }
});

test('declarar não é receber: sem concessão o Runtime não dá READ_FILES', { skip: SEM_BINARIO }, async () => {
  /* O módulo declara `READ_FILES` e não recebe nada. O envelope sai com a lista
   * de permissões vazia, e é o Rust quem passa a recusar a leitura — a mesma
   * regra do Permission System, agora cobrada do outro lado da fronteira. */
  const s = await montarSlice({ modulos: [mod('alpha', {}, ['READ_FILES'])] });
  try {
    await mkdir(join(s.raiz, 'alpha'), { recursive: true });
    await writeFile(join(s.raiz, 'alpha', 'hello.txt'), 'BALUARTE-V2');

    const r = await s.ciclo.subir();
    /* Grant vazio é autorização disponível: o módulo SOBE, como no navegador.
     * Sem isto, deny-by-default viraria deny-tudo. */
    assert.equal(r.ok, true, 'grant vazio não pode derrubar módulo correto');

    const negado = await s.transporte.lerArquivo(s.envelope(), 'alpha', 'hello.txt');
    assert.equal(negado.status, 'error', 'sem READ_FILES concedido, a leitura tem de ser negada');

    await s.ciclo.descer();
  } finally {
    await s.limpar();
  }
});
