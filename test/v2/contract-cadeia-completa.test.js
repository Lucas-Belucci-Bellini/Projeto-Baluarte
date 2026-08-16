/**
 * Contract test COMPLETO: Manifest → Registry → Permission → Runtime.
 *
 * Item 2 do "próximo bloco" da `docs/v2/V2_PROGRESS.md`.
 *
 * ── Por que existe, se já há um `contract-slice.test.js` ────────────────────
 * Aquele cobre a mesma cadeia, mas com `registryFake()` e um decisor de
 * permissões de duas linhas (`avaliar: () => 'ok' | 'negada'`). É a Regra 7 das
 * `V2_TESTING_RULES.md` em forma pura: **mock prova o mock**. Um registro falso
 * nunca recusa um manifesto inválido, e um decisor falso não tem teto — então
 * as duas invariantes que a cadeia inteira existe para garantir são justamente
 * as que aquele teste não pode ver.
 *
 * Aqui as quatro peças são as REAIS: `validar`/`normalizar` do manifesto (via
 * `registrar`), `criarRegistry`, `criarPermissoes` e a carga de Runtime.
 *
 * ── O que só aparece quando as quatro estão juntas ──────────────────────────
 * Cada peça já tem teste de unidade. O que nenhum deles alcança é a costura:
 *
 *   1. manifesto inválido é recusado no Registry e por isso **nunca** chega ao
 *      envelope do Runtime — a barreira é composta, não local;
 *   2. "declarar ≠ receber" atravessando as quatro: o manifesto declara, a
 *      política concede, e o Runtime só vê o que sobreviveu aos dois;
 *   3. o teto do decisor sai do manifesto REAL normalizado pelo Registry, não
 *      de uma lista escrita à mão no teste.
 */

import test from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarPermissoes, ErroPolitica } from '../../v2/core/permissoes.js';
import { criarCargaRuntime, criarGrantRuntime } from '../../v2/core/runtime-bootstrap.js';
import { criarLifecycleRuntime } from '../../v2/core/module-runtime-lifecycle.js';

/** Manifesto válido mínimo — só o que o validador exige, mais o que o teste usa. */
const manifesto = (id, permissions = []) => ({
  id,
  name: `Módulo ${id}`,
  version: '1.0.0',
  permissions
});

/**
 * Monta a cadeia inteira com as peças reais.
 *
 * O decisor aprende o teto a partir do que o Registry **normalizou e selou** —
 * não de uma lista paralela. Se essa ligação quebrar, os testes abaixo caem, que
 * é o ponto: é ela que faz o manifesto ser a fonte da verdade.
 */
function cadeia(manifestos) {
  const registry = criarRegistry();
  const aceitos = manifestos.map((m) => registry.registrar(m));
  const selo = registry.selar();

  const permissoes = criarPermissoes();
  permissoes.conhecerModulos(registry.listar().map((id) => registry.modulo(id)));

  return { registry, permissoes, selo, aceitos };
}

/* ── 1. manifesto inválido não chega ao Runtime ─────────────────────────── */

test('cadeia: manifesto inválido é recusado no Registry e não aparece no envelope', async () => {
  /* Três erros de uma vez: id não-kebab, name vazio, version não-semver. O
   * validador acumula, e o Registry transforma isso em recusa. */
  const torto = { id: 'Torto', name: '', version: 'nao-e-semver' };
  const { registry, permissoes, selo, aceitos } = cadeia([manifesto('alfa'), torto]);

  assert.deepEqual(aceitos, [true, false], 'o inválido tem de ser recusado no registrar()');
  assert.equal(selo.ok, false);
  assert.equal(selo.recusados.length, 1);
  assert.match(selo.recusados[0].motivo, /manifesto inválido/);

  assert.deepEqual(registry.listar(), ['alfa'], 'só o válido fica ativo');

  const envelope = criarCargaRuntime(registry, permissoes);
  assert.deepEqual(envelope.modulos.map((m) => m.modulo), ['alfa']);

  /* A mesma barreira do outro lado: o lifecycle não abre sessão de Runtime para
   * quem o Registry não ativou. */
  const lifecycle = criarLifecycleRuntime(registry, {
    abrir: async () => assert.fail('não deveria abrir Runtime para módulo recusado'),
    fechar: async () => {}
  }, permissoes);

  await assert.rejects(() => lifecycle.abrir('Torto'), /módulo não ativo/);
});

/* ── 2. declarar ≠ receber, atravessando as quatro peças ────────────────── */

test('cadeia: declarar não é receber — o Runtime só vê o que foi concedido', () => {
  const { registry, permissoes } = cadeia([manifesto('alfa', ['NETWORK', 'READ_FILES'])]);

  /* O manifesto declarou duas. Ninguém concedeu nada ainda. */
  const antes = criarCargaRuntime(registry, permissoes);
  assert.deepEqual(antes.modulos, [{ modulo: 'alfa', permissoes: [] }],
    'declarado e não concedido não pode entrar no envelope');

  permissoes.conceder('alfa', 'NETWORK', { origem: 'teste' });

  const depois = criarCargaRuntime(registry, permissoes);
  assert.deepEqual(depois.modulos, [{ modulo: 'alfa', permissoes: ['NETWORK'] }],
    'só a concedida entra — READ_FILES segue declarada e ausente');
});

test('cadeia: o teto do decisor vem do manifesto, não da política', () => {
  const { permissoes } = cadeia([manifesto('alfa', ['NETWORK'])]);

  /* Conceder além do declarado é erro de política, não concessão silenciosa.
   * Esta é a invariante que o decisor falso do `contract-slice` não tem como
   * ter: sem teto, tudo é concedível. */
  assert.throws(() => permissoes.conceder('alfa', 'DATABASE'), ErroPolitica);

  /* E módulo que o Registry nunca ativou não é sequer conhecido. */
  assert.throws(() => permissoes.conceder('fantasma', 'NETWORK'), ErroPolitica);
});

/* ── 3. a política aplicada contra a cadeia real ────────────────────────── */

test('cadeia: recusa de política não derruba os módulos legítimos', () => {
  const { registry, permissoes } = cadeia([
    manifesto('alfa', ['NETWORK']),
    manifesto('beta') // não declara nada
  ]);

  const { concedidas, recusas } = permissoes.aplicarPolitica({
    alfa: ['NETWORK'],
    beta: ['DATABASE'] // além do teto: beta não declarou
  });

  assert.deepEqual(concedidas, [{ modulo: 'alfa', permissoes: ['NETWORK'] }]);
  assert.equal(recusas.length, 1);
  assert.equal(recusas[0].modulo, 'beta');

  const envelope = criarCargaRuntime(registry, permissoes);
  assert.deepEqual(envelope.modulos, [
    { modulo: 'alfa', permissoes: ['NETWORK'] },
    { modulo: 'beta', permissoes: [] }
  ], 'beta continua no envelope, e continua sem nada');
});

/* ── 4. o envelope é retrato, não cache ─────────────────────────────────── */

test('cadeia: revogar alcança o envelope seguinte', () => {
  const { registry, permissoes } = cadeia([manifesto('alfa', ['NETWORK'])]);
  permissoes.conceder('alfa', 'NETWORK', { origem: 'teste' });

  assert.deepEqual(criarCargaRuntime(registry, permissoes).modulos,
    [{ modulo: 'alfa', permissoes: ['NETWORK'] }]);

  permissoes.revogar('alfa', 'NETWORK', { origem: 'teste' });

  /* Regra 5 das `V2_TESTING_RULES.md`: retrato congelado mente sobre o sistema
   * vivo. Se a carga fosse memoizada, isto seguiria dizendo NETWORK. */
  assert.deepEqual(criarCargaRuntime(registry, permissoes).modulos,
    [{ modulo: 'alfa', permissoes: [] }]);
});

test('cadeia: teto mais estreito poda a concessão e o envelope acompanha', () => {
  const { registry, permissoes } = cadeia([manifesto('alfa', ['NETWORK'])]);
  permissoes.conceder('alfa', 'NETWORK', { origem: 'teste' });

  /* Versão nova do módulo deixa de declarar NETWORK. A concessão é lembrança, o
   * manifesto é autoridade — a lembrança cai. */
  permissoes.conhecerModulos([{ id: 'alfa', permissions: [] }]);

  assert.equal(permissoes.avaliar('alfa', 'NETWORK'), 'nao-declarada');
  assert.deepEqual(criarCargaRuntime(registry, permissoes).modulos,
    [{ modulo: 'alfa', permissoes: [] }]);

  /* As duas asserções acima passam olhando só pelo `avaliar()`, que barra por
   * "não-declarada" mesmo se a concessão continuasse guardada. São DUAS defesas
   * — o teto no `avaliar` e a poda no `conhecerModulos` — e a primeira cobre a
   * segunda.
   *
   * Medido: removendo só a poda, este teste continuava verde. Regra 1 das
   * `V2_TESTING_RULES.md` — defesa não testada individualmente é sorte. O que
   * enxerga a poda sozinha é o estado PERSISTIDO: sem ela, `exportar()` ainda
   * carrega NETWORK, e o `importar()` do próximo arranque a ressuscitaria por
   * baixo de um manifesto que não a declara mais. */
  assert.deepEqual(permissoes.exportar().concedidas, [],
    'a poda tem de limpar o estado exportável, senão o próximo importar() ressuscita');

  const podas = permissoes.ultimasDecisoes().filter((d) => d.acao === 'podar');
  assert.deepEqual(podas.map((d) => [d.modulo, d.permissao, d.origem]),
    [['alfa', 'NETWORK', 'teto']], 'a poda tem de deixar rastro — quem tirou, e por quê');
});

/* ── 5. as pré-condições da costura ─────────────────────────────────────── */

test('cadeia: sem selar o Registry não há carga de Runtime', () => {
  const registry = criarRegistry();
  registry.registrar(manifesto('alfa', ['NETWORK']));
  const permissoes = criarPermissoes();

  /* Selar é o que fixa o conjunto (colisão de rota, id duplicado). Montar a
   * carga antes seria autorizar sobre um conjunto que ainda pode mudar. */
  assert.throws(() => criarCargaRuntime(registry, permissoes), /precisa estar selado/);
  assert.throws(() => criarGrantRuntime(registry, permissoes, 'alfa'), /precisa estar selado/);
});

test('cadeia: grant individual concorda com o envelope completo', () => {
  const { registry, permissoes } = cadeia([
    manifesto('alfa', ['NETWORK', 'READ_FILES']),
    manifesto('beta', ['DATABASE'])
  ]);
  permissoes.conceder('alfa', 'READ_FILES', { origem: 'teste' });
  permissoes.conceder('beta', 'DATABASE', { origem: 'teste' });

  const envelope = criarCargaRuntime(registry, permissoes);
  for (const id of registry.listar()) {
    /* Dois caminhos para a mesma verdade — a subida lazy usa o grant, a subida
     * completa usa o envelope. Divergirem seria autorizar diferente conforme a
     * ordem de carregamento, que é o pior defeito possível nesta camada. */
    assert.deepEqual(
      criarGrantRuntime(registry, permissoes, id).permissoes,
      envelope.modulos.find((m) => m.modulo === id).permissoes,
      `grant e envelope discordam para "${id}"`
    );
  }
});

test('cadeia: a sessão de Runtime recebe o registry selado e o decisor real', async () => {
  const { registry, permissoes } = cadeia([manifesto('alfa', ['NETWORK'])]);
  permissoes.conceder('alfa', 'NETWORK', { origem: 'teste' });

  const vistos = [];
  const lifecycle = criarLifecycleRuntime(registry, {
    abrir: async (reg, perm, id) => {
      /* O que o Runtime recebe tem de ser o par real, não uma cópia inerte:
       * é com ele que a sessão vai decidir o que o módulo alcança. */
      vistos.push({
        selado: reg.selado,
        ativo: Boolean(reg.modulo(id)),
        pode: perm.pode(id, 'NETWORK')
      });
    },
    fechar: async () => {}
  }, permissoes);

  await lifecycle.abrir('alfa');
  assert.deepEqual(vistos, [{ selado: true, ativo: true, pode: true }]);
  assert.deepEqual(lifecycle.abertas(), ['alfa']);
});
