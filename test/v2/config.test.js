/**
 * Config declarada.
 *
 * O bloco que mais importa é o dos **segredos**. O operador escreveu, com todas
 * as letras: *"não exponha nem copie valores de secrets para código ou
 * commits."* Aqui isso vira invariante testado, não intenção — e o alvo são os
 * caminhos ACIDENTAIS: logar o objeto inteiro, mandar o diagnóstico para
 * alguém, serializar num relatório.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { criarConfig } from '../../v2/core/config.js';

const ok = (c) => { const v = c.validacao(); assert.equal(v.ok, true, v.problemas.join(' | ')); };

/* ═══════════ o básico ═══════════ */

test('padrão vale quando o ambiente não diz nada', () => {
  const c = criarConfig([{ chave: 'banco:timeout', tipo: 'numero', padrao: 8000 }], {});
  ok(c);
  assert.equal(c.ler('banco:timeout'), 8000);
});

test('o ambiente sobrescreve o padrão', () => {
  const c = criarConfig(
    [{ chave: 'banco:timeout', tipo: 'numero', padrao: 8000, env: 'BALUARTE_DB_TIMEOUT' }],
    { BALUARTE_DB_TIMEOUT: '3000' }
  );
  ok(c);
  assert.equal(c.ler('banco:timeout'), 3000, 'veio string do env e devia virar número');
});

test('ler chave não declarada é erro, não undefined', () => {
  /* `undefined` silencioso viraria timeout zero ou URL "undefined" lá na frente,
   * longe da causa. */
  const c = criarConfig([], {});
  assert.throws(() => c.ler('nao:existe'), /não declarada/);
});

test('chave declarada duas vezes é problema de validação', () => {
  const c = criarConfig([
    { chave: 'a:x', tipo: 'numero', padrao: 1 },
    { chave: 'a:x', tipo: 'numero', padrao: 2 }
  ], {});
  assert.equal(c.validacao().ok, false);
});

/* ═══════════ conversão ═══════════ */

test('booleano entende as formas que aparecem de verdade em env', () => {
  const casos = { '1': true, 'true': true, 'sim': true, 'on': true,
                  '0': false, 'false': false, 'nao': false, 'off': false, '': false };
  for (const [entrada, esperado] of Object.entries(casos)) {
    const c = criarConfig([{ chave: 'f:x', tipo: 'booleano', padrao: null, env: 'F' }], { F: entrada });
    assert.equal(c.ler('f:x'), esperado, `"${entrada}" virou ${c.ler('f:x')}`);
  }
});

test('FLAG=0 não vira true — o clássico silencioso', () => {
  /* String "0" é truthy em JS; sem conversão explícita, desligar uma flag pelo
   * ambiente a ligaria. */
  const c = criarConfig([{ chave: 'f:x', tipo: 'booleano', padrao: true, env: 'F' }], { F: '0' });
  assert.equal(c.ler('f:x'), false);
});

test('valor inválido no ambiente vira problema, não silêncio', () => {
  const c = criarConfig(
    [{ chave: 'banco:timeout', tipo: 'numero', padrao: 8000, env: 'T' }],
    { T: 'oito mil' }
  );
  const v = c.validacao();
  assert.equal(v.ok, false);
  assert.match(v.problemas[0], /não é numero válido/);
});

test('url inválida é recusada', () => {
  const c = criarConfig([{ chave: 'api:base', tipo: 'url', padrao: null, env: 'U' }], { U: 'nao-e-url' });
  assert.equal(c.validacao().ok, false);
});

/* ═══════════ faixas e obrigatoriedade ═══════════ */

test('valor fora da faixa é problema', () => {
  const c = criarConfig(
    [{ chave: 'b:t', tipo: 'numero', padrao: 5, min: 100, max: 60000 }], {}
  );
  const v = c.validacao();
  assert.equal(v.ok, false);
  assert.match(v.problemas[0], /< mínimo 100/);
});

test('obrigatória sem origem reprova a subida', () => {
  /* Config errada é falha de boot, não surpresa em runtime. */
  const c = criarConfig(
    [{ chave: 'api:url', tipo: 'url', obrigatorio: true, env: 'API_URL' }], {}
  );
  assert.equal(c.validacao().ok, false);
  assert.match(c.validacao().problemas[0], /API_URL não está definida/);
});

/* ═══════════ segredos — o núcleo ═══════════ */

test('segredo com padrão é RECUSADO na declaração', () => {
  /* Segredo com fallback é segredo escrito no código. Aceitar "só o padrão de
   * dev" é como essas coisas entram no repositório. */
  const c = criarConfig(
    [{ chave: 'api:token', tipo: 'texto', segredo: true, padrao: 'dev-123', env: 'TOKEN' }],
    { TOKEN: 'real' }
  );
  const v = c.validacao();
  assert.equal(v.ok, false);
  assert.match(v.problemas[0], /segredo não pode ter valor no código/);
});

test('ler() recusa segredo — só revelar() entrega', () => {
  /* O nome é feio de propósito: `revelar()` numa revisão chama atenção. */
  const c = criarConfig(
    [{ chave: 'api:token', tipo: 'texto', segredo: true, env: 'TOKEN' }],
    { TOKEN: 'sk-secreta' }
  );
  ok(c);
  assert.throws(() => c.ler('api:token'), /use revelar/);
  assert.equal(c.revelar('api:token'), 'sk-secreta');
});

test('revelar() recusa chave que NÃO é segredo', () => {
  /* Senão `revelar()` viraria o get genérico e perderia o sinal em revisão. */
  const c = criarConfig([{ chave: 'a:x', tipo: 'numero', padrao: 1 }], {});
  assert.throws(() => c.revelar('a:x'), /não é segredo/);
});

test('o segredo NÃO aparece no diagnóstico — só se está definido', () => {
  const c = criarConfig(
    [{ chave: 'api:token', tipo: 'texto', segredo: true, env: 'TOKEN' }],
    { TOKEN: 'sk-secreta' }
  );
  const d = c.paraDiagnostico();
  const linha = d.find((x) => x.chave === 'api:token');
  assert.notEqual(linha.valor, 'sk-secreta');
  assert.equal(linha.valor, '••••••••');
  assert.ok(!JSON.stringify(d).includes('sk-secreta'), 'o segredo vazou no diagnóstico');
});

test('JSON.stringify da config inteira NÃO vaza segredo', () => {
  /* O caminho acidental mais provável: alguém loga o objeto de config. */
  const c = criarConfig(
    [{ chave: 'api:token', tipo: 'texto', segredo: true, env: 'TOKEN' },
     { chave: 'api:base', tipo: 'url', padrao: 'https://x.dev' }],
    { TOKEN: 'sk-vazou-aqui' }
  );
  const serializado = JSON.stringify(c);
  assert.ok(!serializado.includes('sk-vazou-aqui'), `vazou: ${serializado}`);
  assert.ok(serializado.includes('https://x.dev'), 'o não-segredo devia aparecer');
});

test('segredo ausente é reportado sem inventar valor', () => {
  const c = criarConfig([{ chave: 'api:token', tipo: 'texto', segredo: true, env: 'TOKEN' }], {});
  assert.equal(c.validacao().ok, false);
  const linha = c.paraDiagnostico().find((x) => x.chave === 'api:token');
  assert.equal(linha.valor, '(não definido)');
});

/* ═══════════ recorte por módulo ═══════════ */

test('módulo só lê a própria config', () => {
  const c = criarConfig([
    { chave: 'militar:teto', tipo: 'numero', padrao: 6000 },
    { chave: 'banco:teto', tipo: 'numero', padrao: 8000 }
  ], {});
  const m = c.paraModulo('militar');

  assert.equal(m.ler('militar:teto'), 6000);
  assert.throws(() => m.ler('banco:teto'), /não pode ler config de outro/);
  assert.deepEqual(m.chaves(), ['militar:teto']);
});

test('módulo não revela segredo alheio', () => {
  const c = criarConfig([{ chave: 'jarvis:token', tipo: 'texto', segredo: true, env: 'T' }], { T: 'x' });
  const m = c.paraModulo('militar');
  assert.throws(() => m.revelar('jarvis:token'), /não pode revelar segredo de outro/);
});

/* ═══════════ diagnóstico ═══════════ */

test('o diagnóstico diz de ONDE veio cada valor', () => {
  const c = criarConfig([
    { chave: 'a:x', tipo: 'numero', padrao: 1, env: 'AX' },
    { chave: 'a:y', tipo: 'numero', padrao: 2, env: 'AY' }
  ], { AX: '9' });

  const d = c.paraDiagnostico();
  assert.equal(d.find((x) => x.chave === 'a:x').origem, 'env:AX');
  assert.equal(d.find((x) => x.chave === 'a:y').origem, 'padrão');
});
