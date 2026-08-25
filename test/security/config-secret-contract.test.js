/**
 * Contrato — o segredo não sai pelo relatório de configuração.
 *
 * O cabeçalho do `v2/core/config.js` promete que "o caminho acidental — logar o
 * objeto de config inteiro, mandar o diagnóstico para alguém, serializar num
 * relatório — NÃO CONSIGA vazar". `paraDiagnostico()` cumpria. `validacao()`
 * não: ela é o que se lê quando o boot falha, ou seja o que se loga, e
 * interpolava na mensagem o valor bruto da variável de ambiente.
 *
 * Por que passou despercebido: os testes que já existiam cobrem segredos, mas
 * TODOS com `tipo: 'texto'` — o único tipo cujo conversor não sabe falhar
 * (`String(x)` sempre devolve algo). O caminho da recusa nunca era percorrido
 * com um segredo. Aqui usa-se `url`, `numero` e `booleano`, que é onde moram a
 * DSN com senha, a chave `sk-live-…` e o token de webhook.
 *
 * O corte é por DECLARAÇÃO e não por mensagem: o valor do não-segredo continua
 * a aparecer, porque é assim que se acha uma variável mal escrita, e esconder
 * tudo tornaria o diagnóstico inútil no caso comum. Dois testes cobram isso,
 * para o conserto não se transformar em cegueira.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { criarConfig } from '../../v2/core/config.js';

/* Valores com forma de segredo real, para a asserção falhar de modo legível
 * caso um deles volte a escapar. */
const DSN = 'postgres//operador:SENHA_REAL@db.interno/baluarte';
const CHAVE = 'sk-live-51H8xQ2eZvKYlo';
const TOKEN = 'xoxb-9f3a-SEGREDO-DE-WEBHOOK';

test('segredo com url inválida não entra na mensagem', () => {
  const c = criarConfig(
    [{ chave: 'a:dsn', tipo: 'url', env: 'DSN', segredo: true }],
    { DSN },
  );
  const texto = c.validacao().problemas.join(' | ');
  assert.ok(!texto.includes(DSN), `a DSN vazou: ${texto}`);
  assert.ok(!texto.includes('SENHA_REAL'), `a senha vazou: ${texto}`);
  /* Mas a variável tem de ser nomeada — senão o operador não sabe onde mexer. */
  assert.match(texto, /DSN não é url válido/);
  assert.equal(c.validacao().ok, false);
});

test('segredo com número inválido não entra na mensagem', () => {
  const c = criarConfig(
    [{ chave: 'a:chave', tipo: 'numero', env: 'CHAVE', segredo: true }],
    { CHAVE },
  );
  const texto = c.validacao().problemas.join(' | ');
  assert.ok(!texto.includes(CHAVE), `a chave vazou: ${texto}`);
  assert.match(texto, /valor omitido por ser segredo/);
});

test('segredo com booleano inválido não entra na mensagem', () => {
  const c = criarConfig(
    [{ chave: 'a:flag', tipo: 'booleano', env: 'FLAG', segredo: true }],
    { FLAG: TOKEN },
  );
  const texto = c.validacao().problemas.join(' | ');
  assert.ok(!texto.includes(TOKEN), `o token vazou: ${texto}`);
});

test('o valor do NÃO-segredo continua na mensagem — é como se acha o erro de digitação', () => {
  /* O corte é por declaração, não por mensagem: esconder tudo tornaria o
   * diagnóstico inútil para o caso comum, que é uma variável mal escrita. */
  const c = criarConfig(
    [{ chave: 'a:teto', tipo: 'numero', env: 'TETO', padrao: 10 }],
    { TETO: '8OOO' },
  );
  assert.match(c.validacao().problemas.join(' | '), /TETO="8OOO"/);
});

test('segredo fora da faixa não entrega o valor pela mensagem de limite', () => {
  /* O outro caminho: aqui o valor já passou a conversão, então não é o bruto —
   * é o segredo convertido. Vazava igual. */
  const c = criarConfig(
    [{ chave: 'a:pin', tipo: 'numero', env: 'PIN', segredo: true, max: 9999 }],
    { PIN: '31415926' },
  );
  const texto = c.validacao().problemas.join(' | ');
  assert.ok(!texto.includes('31415926'), `o segredo vazou pela faixa: ${texto}`);
  assert.match(texto, /acima do máximo 9999/);
});

test('segredo abaixo do mínimo também não entrega o valor', () => {
  const c = criarConfig(
    [{ chave: 'a:pin', tipo: 'numero', env: 'PIN', segredo: true, min: 1000 }],
    { PIN: '42' },
  );
  const texto = c.validacao().problemas.join(' | ');
  assert.ok(!/= 42/.test(texto), `o segredo vazou: ${texto}`);
  assert.match(texto, /abaixo do mínimo 1000/);
});

test('o valor do NÃO-segredo continua na mensagem de faixa', () => {
  const c = criarConfig(
    [{ chave: 'a:n', tipo: 'numero', env: 'N', padrao: 5, max: 10 }],
    { N: '99' },
  );
  assert.match(c.validacao().problemas.join(' | '), /"a:n" = 99 > máximo 10/);
});

test('nem o diagnóstico nem a serialização entregam o segredo recusado', () => {
  /* O caminho acidental inteiro, de uma vez: o objeto, o JSON e os problemas. */
  const c = criarConfig(
    [{ chave: 'a:dsn', tipo: 'url', env: 'DSN', segredo: true }],
    { DSN },
  );
  const tudo = JSON.stringify({
    diagnostico: c.paraDiagnostico(),
    serializado: c,
    validacao: c.validacao(),
  });
  assert.ok(!tudo.includes('SENHA_REAL'), `vazou em algum lado: ${tudo}`);
  assert.ok(!tudo.includes(DSN));
});
