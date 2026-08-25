/**
 * O relatório de configuração dizia duas coisas falsas.
 *
 * Nenhuma delas é vazamento — a redação do segredo mora em
 * `test/security/config-secret-contract.test.js`. Estas são erros de
 * correção no que o relatório AFIRMA, e ambas mandam quem lê para o lugar
 * errado, que num diagnóstico é o defeito inteiro:
 *
 *   1. uma variável DEFINIDA mas recusada era reportada como "não definida",
 *      mandando o operador definir o que ele já tinha definido;
 *   2. `origem` dava o crédito à variável de ambiente só por ela existir —
 *      mesmo com o valor recusado e o padrão em vigor. Quem lesse isso ia
 *      mexer na variável e não veria nada mudar, porque não era ela que
 *      mandava.
 *
 * Presente-e-recusada é um TERCEIRO estado, diferente de ausente. Tratá-lo
 * como ausente era a raiz das duas.
 */

import assert from 'node:assert/strict';
import test from 'node:test';
import { criarConfig } from '../../v2/core/config.js';

/* Um valor com forma de segredo, para o teste do problema único ser realista. */
const CHAVE = 'sk-live-51H8xQ2eZvKYlo';

test('variável DEFINIDA mas recusada não é reportada como ausente', () => {
  /* O defeito que mandava o operador definir o que ele já tinha definido. */
  const c = criarConfig(
    [{ chave: 'a:url', tipo: 'url', env: 'API_URL', obrigatorio: true }],
    { API_URL: 'nao-e-url' },
  );
  const texto = c.validacao().problemas.join(' | ');
  assert.ok(!texto.includes('não está definida'), `a mensagem mente: ${texto}`);
  assert.match(texto, /não é url válido/);
  assert.equal(c.validacao().ok, false, 'continua a reprovar a subida');
});

test('variável AUSENTE continua a ser reportada como ausente', () => {
  /* O outro lado da mesma moeda: a mensagem antiga estava certa neste caso, e
   * o conserto não podia levá-la junto. */
  const c = criarConfig(
    [{ chave: 'a:url', tipo: 'url', env: 'API_URL', obrigatorio: true }], {},
  );
  assert.match(c.validacao().problemas.join(' | '), /API_URL não está definida/);
});

test('um problema por chave recusada, não dois que se contradizem', () => {
  const c = criarConfig(
    [{ chave: 'a:tok', tipo: 'numero', env: 'TOK', segredo: true }],
    { TOK: CHAVE },
  );
  assert.equal(c.validacao().problemas.length, 1, c.validacao().problemas.join(' | '));
});

test('a origem deixa de dar o crédito à variável que foi recusada', () => {
  /* Antes bastava a variável existir para levar o crédito, mesmo com o valor
   * recusado e o padrão em vigor. Quem lesse isso ia mexer na variável e não
   * veria nada mudar, porque não era ela que mandava. */
  const c = criarConfig(
    [{ chave: 'a:teto', tipo: 'numero', env: 'TETO', padrao: 100 }],
    { TETO: 'nao-e-numero' },
  );
  const linha = c.paraDiagnostico().find((x) => x.chave === 'a:teto');
  assert.equal(c.ler('a:teto'), 100, 'o padrão é que está em vigor');
  assert.equal(linha.origem, 'padrão');
  assert.equal(linha.envRejeitada, 'TETO', 'a tentativa recusada é a informação');
});

test('a origem continua a creditar o ambiente quando o valor é aceite', () => {
  const c = criarConfig(
    [{ chave: 'a:teto', tipo: 'numero', env: 'TETO', padrao: 100 }],
    { TETO: '250' },
  );
  const linha = c.paraDiagnostico().find((x) => x.chave === 'a:teto');
  assert.equal(linha.origem, 'env:TETO');
  assert.equal(linha.envRejeitada, undefined, 'não houve recusa a assinalar');
});

test('sem variável declarada, a origem é o padrão e não há recusa', () => {
  const c = criarConfig([{ chave: 'a:x', tipo: 'numero', padrao: 7 }], {});
  const linha = c.paraDiagnostico().find((x) => x.chave === 'a:x');
  assert.equal(linha.origem, 'padrão');
  assert.equal(linha.envRejeitada, undefined);
});
