/**
 * Lifecycle ↔ Runtime Host: `running` exige autorização disponível.
 *
 * Item 3 do "próximo bloco" da `docs/v2/V2_PROGRESS.md`.
 *
 * ── O defeito que estes testes existem para impedir ─────────────────────────
 * O contrato de `docs/v2/V2_LIFECYCLE_RUNTIME_CONTRACT.md` sempre disse
 * `Runtime.open → init → start`. O Host por módulo (`criarLifecycleRuntime`)
 * sempre existiu e sempre teve teste. E mesmo assim o ciclo real ia direto ao
 * `init`: buscando os consumidores de produção do Host, havia **um**, o
 * `vertical-slice.js`, que não é o caminho por onde os módulos sobem.
 *
 * O resultado era um módulo `running` cuja autorização nunca tinha sido pedida.
 * Não é um estado errado por pouco: é o retrato afirmando sobre o Runtime uma
 * coisa que o Runtime não sabia.
 *
 * ── Por que o teste do Host sozinho não pegava ──────────────────────────────
 * Porque ele testa o Host, e o Host estava certo. O defeito morava na COSTURA —
 * em quem deveria chamá-lo e não chamava. É a Regra 7 outra vez, por outro
 * ângulo: não adianta a peça ser real se nada a compõe em execução.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { criarRegistry } from '../../v2/core/registry.js';
import { criarCiclo } from '../../v2/core/ciclo.js';
import { criarPermissoes } from '../../v2/core/permissoes.js';
import { criarStatusLifecycle } from '../../v2/core/lifecycle-status.js';
import { criarLifecycleRuntime } from '../../v2/core/module-runtime-lifecycle.js';
import { criarRuntimeHealth } from '../../v2/core/module-runtime-health.js';
import { criarGrantRuntime } from '../../v2/core/runtime-bootstrap.js';
import { definirDestino, coletor } from '../../v2/core/log.js';

const deps = {
  storage: { get: () => undefined, set: () => true },
  permissoes: criarPermissoes()
};

const mod = (id, lifecycle = {}, extra = {}) => ({
  id, name: `M ${id}`, version: '1.0.0',
  routes: [{ path: `/${id}`, view: () => Promise.resolve({}) }],
  lifecycle, ...extra
});

function montar(...mods) {
  const registry = criarRegistry();
  mods.forEach((m) => registry.registrar(m));
  registry.selar();
  return registry;
}

/** Host duplo: registra a ordem e permite recusar a abertura de um módulo. */
function hostEspiao({ recusar = null, aoFechar = null } = {}) {
  const passos = [];
  return {
    passos,
    abertas: () => passos.filter((p) => p.startsWith('abrir:')).map((p) => p.slice(6))
      .filter((id) => !passos.includes(`fechar:${id}`)),
    abrir: async (id) => {
      if (recusar === id) throw new Error(`Runtime recusou autorização para "${id}"`);
      passos.push(`abrir:${id}`);
    },
    fechar: async (id) => {
      passos.push(`fechar:${id}`);
      if (aoFechar === id) throw new Error(`falha ao fechar "${id}"`);
    }
  };
}

let col;
beforeEach(() => { col = coletor(); definirDestino(col.destino); });

/* ═══════════ 1. o Host REAL, na subida real ═══════════
 *
 * Regra 7: o resto do arquivo usa duplo do Host para poder recusar. Este teste
 * existe para que ao menos um caminho passe pelo `criarLifecycleRuntime` de
 * verdade, com registry selado e decisor real — senão os duplos abaixo estariam
 * provando a si mesmos. */

test('o Host real abre antes do init e o ciclo respeita a ordem do contrato', async () => {
  const passos = [];
  const registry = montar(
    mod('a', { init: () => passos.push('init:a'), start: () => passos.push('start:a') })
  );

  const permissoes = criarPermissoes();
  permissoes.conhecerModulos(registry.listar().map((id) => registry.modulo(id)));

  /* O Host real, com a autorização como sessão e sem transporte: o transporte
   * concreto é item posterior da fila. `criarGrantRuntime` é o que levanta se o
   * registry não estiver selado ou o módulo não estiver ativo — é ele que faz
   * "autorização disponível" ser uma pergunta com resposta, não uma suposição. */
  const host = criarLifecycleRuntime(registry, {
    abrir: async (reg, perm, id) => {
      passos.push(`abrir:${id}`);
      criarGrantRuntime(reg, perm, id);
    },
    fechar: async (id) => { passos.push(`fechar:${id}`); }
  }, permissoes);

  const ciclo = criarCiclo(registry, deps, { runtime: host });
  const r = await ciclo.subir();

  assert.deepEqual(r.vivos, ['a']);
  assert.deepEqual(passos, ['abrir:a', 'init:a', 'start:a'],
    'a autorização tem de vir ANTES do init — é a ordem do contrato');
  assert.deepEqual(host.abertas(), ['a'], 'o Host tem de saber que a sessão está aberta');
});

test('a descida fecha o Runtime entre o stop e o dispose', async () => {
  const passos = [];
  const registry = montar(
    mod('a', { stop: () => passos.push('stop:a'), dispose: () => passos.push('dispose:a') })
  );
  const host = hostEspiao();
  const ciclo = criarCiclo(registry, deps, { runtime: host });

  await ciclo.subir();
  passos.length = 0;
  host.passos.length = 0;

  const r = await ciclo.descer();
  assert.equal(r.ok, true);

  /* O Runtime fecha antes do descarte para que os recursos de execução acabem
   * enquanto a instância que os pediu ainda existe. Fechar depois do `dispose`
   * seria liberar recurso de um dono que já não existe. */
  assert.deepEqual(
    [...passos, ...host.passos].sort(),
    ['dispose:a', 'fechar:a', 'stop:a'],
    'as três fases têm de acontecer'
  );
});

test('a ordem stop → fechar → dispose é observável, não suposta', async () => {
  const ordem = [];
  const registry = montar(
    mod('a', { stop: () => ordem.push('stop'), dispose: () => ordem.push('dispose') })
  );
  /* Um Host que escreve na MESMA lista dos hooks é o que separa "as três
   * rodaram" de "as três rodaram nesta ordem". Duas listas comparadas depois não
   * distinguem os dois casos. */
  const host = {
    abrir: async () => { ordem.push('abrir'); },
    fechar: async () => { ordem.push('fechar'); }
  };

  const ciclo = criarCiclo(registry, deps, { runtime: host });
  await ciclo.subir();
  await ciclo.descer();

  assert.deepEqual(ordem, ['abrir', 'stop', 'fechar', 'dispose']);
});

/* ═══════════ 2. autorização indisponível ═══════════ */

test('sem autorização o módulo NÃO vira running — e o init nem roda', async () => {
  const passos = [];
  const registry = montar(
    mod('a', { init: () => passos.push('init:a'), start: () => passos.push('start:a') })
  );
  const host = hostEspiao({ recusar: 'a' });

  const ciclo = criarCiclo(registry, deps, { runtime: host });
  const r = await ciclo.subir();

  assert.equal(r.ok, false);
  assert.deepEqual(r.vivos, [], 'módulo sem autorização não pode ficar vivo');
  /* A asserção que dá nome ao item: `init` NÃO rodou. Um módulo que já executou
   * o próprio `init` e só depois é declarado falho já tocou no sistema — a
   * barreira precisa vir antes, não depois. */
  assert.deepEqual(passos, [], 'nada do módulo pode ter rodado sem autorização');

  const status = criarStatusLifecycle(registry, ciclo);
  assert.equal(status.estadoDo('a'), 'failed');
  assert.equal(status.resumo().running, 0, 'o retrato não pode dizer running');
});

test('a falha do Host é reportada na fase "runtime", não em "init"', async () => {
  const registry = montar(mod('a'));
  const ciclo = criarCiclo(registry, deps, { runtime: hostEspiao({ recusar: 'a' }) });
  const r = await ciclo.subir();

  assert.equal(r.falhas.length, 1);
  /* `init` seria acusar o módulo por algo que aconteceu antes dele existir. Quem
   * lê o diagnóstico decide onde procurar pelo rótulo da fase; rótulo errado
   * manda o operador para o arquivo errado. */
  assert.equal(r.falhas[0].fase, 'runtime');
  assert.equal(r.falhas[0].modulo, 'a');
  assert.match(r.falhas[0].motivo, /recusou autorização/);
});

test('quem depende de um módulo sem autorização também não sobe', async () => {
  const passos = [];
  const registry = montar(
    mod('base'),
    mod('dependente', { init: () => passos.push('init:dependente') }, { dependencies: ['base'] })
  );
  const ciclo = criarCiclo(registry, deps, { runtime: hostEspiao({ recusar: 'base' }) });
  const r = await ciclo.subir();

  assert.deepEqual(r.vivos, []);
  assert.deepEqual(passos, []);
  assert.deepEqual(r.falhas.map((f) => [f.modulo, f.fase]),
    [['base', 'runtime'], ['dependente', 'init']],
    'a cascata existente tem de alcançar a falha de autorização também');
});

test('subida falha fecha o Host — sessão aberta não sobrevive ao módulo', async () => {
  const registry = montar(mod('a', { init: () => { throw new Error('init explodiu'); } }));
  const host = hostEspiao();

  const ciclo = criarCiclo(registry, deps, { runtime: host });
  const r = await ciclo.subir();

  assert.equal(r.vivos.length, 0);
  assert.equal(r.falhas[0].fase, 'init');
  /* O `abrir` deu certo; o `init` é que quebrou. Sem o fechamento aqui a sessão
   * fica aberta para um módulo que não existe — e nada mais vai fechá-la, porque
   * a descida só percorre os VIVOS. */
  assert.deepEqual(host.passos, ['abrir:a', 'fechar:a']);
  assert.deepEqual(host.abertas(), []);
});

test('quando o próprio abrir falha, o fechar seguinte não pode explodir a subida', async () => {
  const registry = montar(mod('a'), mod('b'));
  /* `fechar` de quem nunca abriu é no-op no Host real; aqui o duplo levanta de
   * propósito, para provar que o ciclo não deixa esse erro derrubar a subida dos
   * OUTROS módulos. Erro de limpeza não pode virar falha em cascata. */
  const host = {
    abrir: async (id) => { if (id === 'a') throw new Error('sem autorização'); },
    fechar: async () => { throw new Error('fechar também falhou'); }
  };

  const ciclo = criarCiclo(registry, deps, { runtime: host });
  const r = await ciclo.subir();

  assert.deepEqual(r.vivos, ['b'], 'b não tem nada com o problema de a');
  assert.deepEqual(r.falhas.map((f) => [f.modulo, f.fase]), [['a', 'runtime']],
    'a falha reportada é a da autorização, não a do fechamento');
});

/* ═══════════ 3. teto ═══════════ */

test('Host que não responde não pendura a subida', async () => {
  const passos = [];
  const registry = montar(
    mod('lento', { init: () => passos.push('init:lento') }),
    mod('depois', { init: () => passos.push('init:depois') })
  );
  const host = {
    abrir: async (id) => { if (id === 'lento') await new Promise(() => {}); },
    fechar: async () => {}
  };

  const ciclo = criarCiclo(registry, deps, { runtime: host, tetoInitMs: 60 });
  const r = await ciclo.subir();

  /* Sem teto na abertura, isto nunca termina — e o modo de falhar é o pior
   * possível: metade do sistema no ar, sem erro nenhum. É o mesmo defeito que o
   * teto do `init` já cobria, num caminho que antes não passava por ele. */
  assert.equal(r.falhas.length, 1);
  assert.equal(r.falhas[0].modulo, 'lento');
  assert.equal(r.falhas[0].fase, 'runtime');
  assert.match(r.falhas[0].motivo, /não terminou em 60ms/);
  assert.deepEqual(r.vivos, ['depois'], 'o módulo seguinte tem de subir mesmo assim');
  assert.deepEqual(passos, ['init:depois']);
});

/* ═══════════ 4. o Host é opcional, e a ausência dele não muda nada ═══════════ */

test('sem Host o ciclo se comporta exatamente como antes', async () => {
  const passos = [];
  const registry = montar(
    mod('a', { init: () => passos.push('init'), start: () => passos.push('start'), stop: () => passos.push('stop'), dispose: () => passos.push('dispose') })
  );
  const ciclo = criarCiclo(registry, deps);

  const r = await ciclo.subir();
  assert.deepEqual(r.vivos, ['a']);
  await ciclo.descer();

  assert.deepEqual(passos, ['init', 'start', 'stop', 'dispose']);
});

/* ═══════════ 5. falha ao fechar, na descida ═══════════ */

test('Runtime que falha ao fechar não impede o dispose', async () => {
  const passos = [];
  const registry = montar(
    mod('a', { stop: () => passos.push('stop'), dispose: () => passos.push('dispose') })
  );
  const ciclo = criarCiclo(registry, deps, { runtime: hostEspiao({ aoFechar: 'a' }) });

  await ciclo.subir();
  const r = await ciclo.descer();

  assert.equal(r.ok, false);
  assert.deepEqual(r.problemas.map((p) => [p.modulo, p.fase]), [['a', 'runtime']]);
  /* Desligamento que desiste no primeiro erro vaza o resto: o `dispose` tem de
   * rodar mesmo com o fechamento do Runtime quebrado. */
  assert.deepEqual(passos, ['stop', 'dispose']);
});

test('stop que falha não impede o Runtime de fechar', async () => {
  const registry = montar(mod('a', { stop: () => { throw new Error('stop quebrou'); } }));
  const host = hostEspiao();
  const ciclo = criarCiclo(registry, deps, { runtime: host });

  await ciclo.subir();
  host.passos.length = 0;
  const r = await ciclo.descer();

  assert.deepEqual(r.problemas.map((p) => [p.modulo, p.fase]), [['a', 'stop']]);
  assert.deepEqual(host.passos, ['fechar:a'],
    'o Runtime fecha mesmo com o stop do módulo quebrado — senão o processo vaza');
});

test('o ciclo marca saudável somente depois de runtime, init e start', async () => {
  const registry = montar(mod('a'));
  const health = criarRuntimeHealth();
  const ciclo = criarCiclo(registry, deps, { runtime: hostEspiao(), health });

  assert.equal(health.estado('a').status, 'unknown');
  const r = await ciclo.subir();

  assert.deepEqual(r.vivos, ['a']);
  assert.equal(health.estado('a').status, 'healthy');
  assert.deepEqual(health.estado('a').restarts, []);
});

test('falha de um módulo marca somente ele e preserva a saúde do vizinho', async () => {
  const registry = montar(
    mod('falha', { init: () => { throw new Error('init explodiu'); } }),
    mod('saudavel'),
  );
  const health = criarRuntimeHealth();
  const ciclo = criarCiclo(registry, deps, { runtime: hostEspiao(), health });

  const r = await ciclo.subir();

  assert.deepEqual(r.vivos, ['saudavel']);
  assert.equal(health.estado('falha').status, 'failed');
  assert.equal(health.estado('saudavel').status, 'healthy');
  assert.equal(health.estado('falha').restarts.length, 1);
});

test('falha de dependência também entra no health sem duplicar a causa raiz', async () => {
  const registry = montar(
    mod('base', { init: () => { throw new Error('base caiu'); } }),
    mod('dependente', {}, { dependencies: ['base'] }),
  );
  const health = criarRuntimeHealth();
  const ciclo = criarCiclo(registry, deps, { runtime: hostEspiao(), health });

  const r = await ciclo.subir();

  assert.deepEqual(r.falhas.map((f) => [f.modulo, f.fase]), [
    ['base', 'init'],
    ['dependente', 'init'],
  ]);
  assert.equal(health.estado('base').status, 'failed');
  assert.equal(health.estado('dependente').status, 'failed');
  assert.equal(health.estado('base').restarts.length, 1);
  assert.equal(health.estado('dependente').restarts.length, 1);
});

test('falha durante a descida atualiza health e não impede o restante do cleanup', async () => {
  const registry = montar(mod('a', { stop: () => { throw new Error('stop caiu'); } }));
  const health = criarRuntimeHealth();
  const ciclo = criarCiclo(registry, deps, { runtime: hostEspiao(), health });

  await ciclo.subir();
  const r = await ciclo.descer();

  assert.equal(r.ok, false);
  assert.equal(health.estado('a').status, 'failed');
  assert.equal(ciclo.fase, 'parado');
});

test('erro do observador de health não derruba o lifecycle', async () => {
  const registry = montar(
    mod('a'),
    mod('falha', { init: () => { throw new Error('módulo caiu'); } }),
  );
  const health = {
    marcarSaudavel: () => { throw new Error('health indisponível'); },
    marcarFalha: () => { throw new Error('health indisponível'); },
  };
  const ciclo = criarCiclo(registry, deps, { health });

  const r = await ciclo.subir();

  assert.deepEqual(r.vivos, ['a']);
  assert.deepEqual(r.falhas.map((f) => f.modulo), ['falha']);
});
