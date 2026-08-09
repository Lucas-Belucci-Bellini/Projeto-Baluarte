/**
 * Testes da política do Baluarte (#420) — o conteúdo que os motores de
 * permissão, storage e flags cobram.
 *
 * O teste mais importante deste arquivo é `nenhum esquema declarado apaga dado
 * legado`. Ele existe porque a armadilha é real e silenciosa: declarar um
 * esquema numa chave que já tem dado gravado faz o storage tratar esse dado como
 * "versão 0". Sem `migrar`, `get()` devolve o fallback — e as abas do editor do
 * operador somem no primeiro deploy, sem erro nenhum no console. Na máquina de
 * quem programa isso nunca aparece: lá o dado já nasceu versionado.
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  PERMISSOES, PADRAO_OPERADOR, ESQUEMAS, FLAGS, aplicarPolitica, estadoPolitica
} from '../src/core/politica.js';
import * as permissoes from '../src/core/permissions.js';
import * as flags from '../src/core/flags.js';
import { get, set, clearAll, esquemaDe } from '../src/core/storage.js';

beforeEach(() => {
  permissoes.limpar();
  flags.limpar();
  clearAll();
});

/* ===== A armadilha do dado legado ===== */

test('nenhum esquema declarado apaga dado legado', () => {
  /* Grava como o Baluarte gravava ANTES do envelope existir: valor cru, sem
   * versão. É exatamente o que está no navegador do operador hoje. */
  const legado = {};
  for (const e of ESQUEMAS) {
    legado[e.chave] = { marcador: `valor-antigo-de-${e.chave}`, n: 42 };
    set(e.chave, legado[e.chave]);
  }

  aplicarPolitica();

  for (const e of ESQUEMAS) {
    assert.deepEqual(
      get(e.chave), legado[e.chave],
      `"${e.chave}" perdeu o dado legado ao ganhar esquema — falta o migrar identidade`
    );
  }
});

test('todo esquema declarado tem migração — versionar sem migrar descarta dado', () => {
  aplicarPolitica();
  for (const e of ESQUEMAS) {
    assert.ok(esquemaDe(e.chave), `"${e.chave}" devia estar registrada`);
    assert.ok(
      esquemaDe(e.chave).migrar,
      `"${e.chave}" está versionada sem migrar() — dado antigo cairia no fallback`
    );
  }
});

test('nenhuma chave é classificada como secreto — o frontend é público', () => {
  /* Se um dia alguém classificar uma chave como `secreto`, o storage recusa a
   * gravação e a página quebra. Melhor descobrir aqui. */
  for (const e of ESQUEMAS) {
    assert.notEqual(e.classe, 'secreto', `"${e.chave}" não pode ser gravada no navegador`);
  }
});

/* ===== O padrão do operador ===== */

test('o padrão do operador não concede capacidade restrita nova por curinga', () => {
  aplicarPolitica();

  /* Estas quatro são `restrito` e NÃO estão na lista explícita do padrão. Se um
   * dia entrarem sem alguém decidir, é porque o curinga vazou. */
  for (const id of ['terminal.executar', 'arquivos.ler', 'arquivos.escrever', 'rede.chamar']) {
    assert.equal(permissoes.checar(id), false, `"${id}" não podia vir concedida de fábrica`);
  }
});

test('o padrão concede tudo que é leitura e escrita', () => {
  aplicarPolitica();
  for (const p of PERMISSOES) {
    if (p.risco === 'restrito') continue;
    assert.equal(permissoes.checar(p.id), true, `"${p.id}" (${p.risco}) devia estar concedida`);
  }
});

test('as três capacidades restritas que a UI já expunha continuam funcionando', () => {
  /* Hardening não pode quebrar em silêncio o que o operador já usava. */
  aplicarPolitica();
  for (const id of ['jarvis.memoria.ler', 'jarvis.skills.escrever', 'jarvis.skills.executar']) {
    assert.equal(permissoes.checar(id), true, `"${id}" já existia na interface e não podia sumir`);
  }
});

test('o padrão só cita restrito pelo nome inteiro, nunca por curinga', () => {
  /* Um `'algo.*'` nesta lista alcançaria permissões restritas criadas no
   * futuro — sem ninguém decidir. O único curinga permitido é o `'*'`, que por
   * construção exclui restrito. */
  for (const pedido of PADRAO_OPERADOR) {
    if (pedido === '*') continue;
    assert.ok(!pedido.includes('*'), `"${pedido}" usa curinga e pode alcançar restrito no futuro`);
  }
});

/* ===== Persistência da escolha do operador ===== */

test('revogação do operador sobrevive ao boot seguinte', () => {
  aplicarPolitica();
  assert.equal(permissoes.checar('jarvis.skills.escrever'), true);

  permissoes.revogar('jarvis.skills.escrever', { origem: 'operador' });

  /* Segundo boot, do zero, lendo o que ficou gravado. */
  permissoes.limpar();
  flags.limpar();
  aplicarPolitica();

  assert.equal(
    permissoes.checar('jarvis.skills.escrever'), false,
    'o padrão de fábrica não pode ressuscitar o que o operador tirou'
  );
});

test('o primeiro boot semeia, o segundo restaura', () => {
  const a = aplicarPolitica();
  assert.equal(a.primeiroBoot, true);

  permissoes.limpar();
  flags.limpar();
  const b = aplicarPolitica();
  assert.equal(b.primeiroBoot, false);
});

test('permissão que deixou de existir não é restaurada', () => {
  aplicarPolitica();
  permissoes.limpar();
  flags.limpar();
  /* Simula um Baluarte mais novo onde `rede.chamar` foi removida do catálogo. */
  permissoes.declararTodas(PERMISSOES.filter((p) => p.id !== 'ferramentas.calcular'));
  const salvo = get('permissoes');
  const { descartadas } = permissoes.importar(salvo);
  assert.ok(descartadas.includes('ferramentas.calcular'));
});

/* ===== Flags ===== */

test('nenhuma flag experimental vem ligada — a promessa da 1.0.0', () => {
  aplicarPolitica();
  for (const f of flags.listar()) {
    if (f.nivel !== 'experimental') continue;
    assert.equal(f.ativo, false, `"${f.id}" é experimental e não pode nascer ligada`);
  }
});

test('flag app-only fica desligada na web e ligada no app', () => {
  aplicarPolitica({ ambiente: 'web' });
  assert.equal(flags.ativo('gitNexus'), false);

  flags.limpar();
  permissoes.limpar();
  aplicarPolitica({ ambiente: 'app' });
  assert.equal(flags.ativo('gitNexus'), true);
});

test('?flags= liga um experimento sem persistir', () => {
  aplicarPolitica({ search: '?flags=mcp' });
  assert.equal(flags.ativo('mcp'), true);

  flags.limpar();
  permissoes.limpar();
  aplicarPolitica();
  assert.equal(flags.ativo('mcp'), false, 'override de URL não podia ter ficado gravado');
});

/* ===== Integridade do catálogo ===== */

test('não há id de permissão duplicado', () => {
  const ids = PERMISSOES.map((p) => p.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('não há id de flag duplicado', () => {
  const ids = FLAGS.map((f) => f.id);
  assert.equal(new Set(ids).size, ids.length);
});

test('não há chave de storage duplicada', () => {
  const chaves = ESQUEMAS.map((e) => e.chave);
  assert.equal(new Set(chaves).size, chaves.length);
});

test('toda permissão tem descrição — a lista é lida por humanos no /diagnostico', () => {
  for (const p of PERMISSOES) {
    assert.ok(p.descricao && p.descricao.length > 5, `"${p.id}" sem descrição útil`);
  }
});

test('aplicarPolitica é idempotente', () => {
  aplicarPolitica();
  const antes = estadoPolitica();
  aplicarPolitica();
  const depois = estadoPolitica();
  assert.deepEqual(depois.permissoes.concedidas, antes.permissoes.concedidas);
  assert.equal(depois.flags.length, antes.flags.length);
});

test('estadoPolitica devolve o que o /diagnostico precisa', () => {
  aplicarPolitica();
  const e = estadoPolitica();
  assert.equal(e.permissoes.declaradas.length, PERMISSOES.length);
  assert.equal(e.flags.length, FLAGS.length);
  assert.equal(e.esquemas.length, ESQUEMAS.length);
  assert.ok(Array.isArray(e.porNivel.estavel));
  assert.equal(e.ambiente, 'web');
});
