/**
 * Exportar e importar o dado do operador (#420).
 *
 * A importação é **a única porta pela qual dado de fora entra no storage**, e
 * por isso ela é o lugar mais fácil de reabrir buracos que já foram fechados.
 * Dois em particular:
 *
 *   - a varredura das 59 chaves fechou "chave sem esquema declarado"; um import
 *     que gravasse chave desconhecida traria isso de volta pela janela;
 *   - `storage.get` recusa dado de versão mais nova porque não dá para
 *     "desmigrar"; o import precisa da mesma recusa, ou o arquivo de um Baluarte
 *     futuro sobrescreveria dado bom com formato que este código não entende.
 *
 * O outro eixo é o backup **não mentir**: se ele diz que exportou, o que voltar
 * tem que ser o que estava lá — inclusive acento, que já mordeu este projeto
 * antes (ver `campo.test.js`).
 */

import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import {
  montarBackup, resumoBackup, validarBackup, restaurarBackup,
  nomeDoArquivo, VERSAO_ARQUIVO
} from '../src/core/backup.js';
import { aplicarPolitica } from '../src/core/politica.js';
import { get, set, clearAll } from '../src/core/storage.js';
import * as permissoes from '../src/core/permissions.js';
import * as flags from '../src/core/flags.js';

beforeEach(() => {
  permissoes.limpar();
  flags.limpar();
  clearAll();
  aplicarPolitica();
});

/* ===== Ida e volta ===== */

test('o que foi exportado volta idêntico — inclusive acento', () => {
  const abas = [{ nome: 'ação.js', conteudo: 'const coração = "único";' }];
  set('editor:state', abas);
  set('ui:theme', 'rubi');

  const backup = montarBackup();
  clearAll();
  aplicarPolitica();
  assert.equal(get('editor:state'), null, 'o clearAll não limpou — o teste não vale');

  restaurarBackup(backup);
  assert.deepEqual(get('editor:state'), abas);
  assert.equal(get('ui:theme'), 'rubi');
});

test('chave sem dado não entra no arquivo — backup não inventa padrão', () => {
  set('ui:theme', 'neon');
  const backup = montarBackup();
  assert.ok('ui:theme' in backup.chaves);
  assert.ok(!('editor:state' in backup.chaves), 'exportou chave que nunca foi gravada');
});

test('o arquivo carrega versão POR CHAVE — é o que a V2 vai precisar', () => {
  set('ui:theme', 'neon');
  const entrada = montarBackup().chaves['ui:theme'];
  assert.equal(typeof entrada.versao, 'number');
  assert.equal(typeof entrada.classe, 'string');
  assert.ok('d' in entrada);
});

test('o arquivo se identifica: nome, versão de formato e versão do app', () => {
  set('ui:theme', 'neon');
  const b = montarBackup();
  assert.equal(b.baluarte, 'backup');
  assert.equal(b.versaoArquivo, VERSAO_ARQUIVO);
  assert.match(b.versaoApp, /\d+\.\d+\.\d+/);
  assert.match(b.geradoEm, /^\d{4}-\d{2}-\d{2}T/);
});

/* ===== A sessão de auth não vai ===== */

test('auth:session NUNCA é exportada', () => {
  /* Token de vida curta: restaurado não devolve login, e num arquivo que o
   * operador manda por e-mail para si mesmo é credencial real vazando. */
  set('auth:session', { access_token: 'jwt-real', refresh_token: 'rt' });
  const b = montarBackup();
  assert.ok(!('auth:session' in b.chaves), 'a sessão vazou para o backup');
});

test('auth:session num arquivo adulterado é ignorada na importação', () => {
  const forjado = {
    baluarte: 'backup', versaoArquivo: 1, geradoEm: '2026-01-01T00:00:00Z', versaoApp: '1.0.0',
    chaves: { 'auth:session': { versao: 1, classe: 'sensivel', d: { access_token: 'injetado' } } }
  };
  const { restauradas, ignoradas } = restaurarBackup(forjado);
  assert.deepEqual(restauradas, []);
  assert.equal(ignoradas[0].chave, 'auth:session');
  assert.equal(get('auth:session'), null, 'gravou uma sessão vinda de arquivo');
});

/* ===== Validação: recusar antes de escrever ===== */

test('recusa o que não é backup do Baluarte', () => {
  assert.equal(validarBackup(null).ok, false);
  assert.equal(validarBackup('texto').ok, false);
  assert.equal(validarBackup({}).ok, false);
  assert.equal(validarBackup({ baluarte: 'outra-coisa' }).ok, false);
  assert.equal(validarBackup({ baluarte: 'backup' }).ok, false, 'passou sem versaoArquivo');
  assert.equal(validarBackup({ baluarte: 'backup', versaoArquivo: 1 }).ok, false, 'passou sem chaves');
});

test('recusa backup de um formato mais novo, dizendo o que fazer', () => {
  const r = validarBackup({ baluarte: 'backup', versaoArquivo: 99, chaves: {} });
  assert.equal(r.ok, false);
  assert.match(r.erro, /99/);
  assert.match(r.erro, /atualize/i);
});

test('aceita um backup de verdade', () => {
  set('ui:theme', 'neon');
  assert.equal(validarBackup(montarBackup()).ok, true);
});

/* ===== A importação não reabre buracos fechados ===== */

test('chave NÃO declarada em politica.js é ignorada, nunca gravada', () => {
  /* A varredura das 59 fechou "chave sem esquema". O import não pode ser a
   * janela por onde isso volta. */
  const forjado = {
    baluarte: 'backup', versaoArquivo: 1, chaves: {
      'inventada:pelo-arquivo': { versao: 1, classe: 'local', d: 'xxx' }
    }
  };
  const { restauradas, ignoradas } = restaurarBackup(forjado);
  assert.deepEqual(restauradas, []);
  assert.match(ignoradas[0].motivo, /não existe/i);
  assert.equal(get('inventada:pelo-arquivo'), null);
});

test('chave gravada em versão MAIOR que a atual é recusada', () => {
  /* Mesmo cuidado do storage.get: não dá pra desmigrar sem destruir. */
  set('ui:theme', 'neon');
  const forjado = {
    baluarte: 'backup', versaoArquivo: 1, chaves: {
      'ui:theme': { versao: 999, classe: 'local', d: 'do-futuro' }
    }
  };
  const { ignoradas } = restaurarBackup(forjado);
  assert.match(ignoradas[0].motivo, /999/);
  assert.equal(get('ui:theme'), 'neon', 'sobrescreveu com dado de versão futura');
});

test('entrada malformada é ignorada sem derrubar a importação inteira', () => {
  const forjado = {
    baluarte: 'backup', versaoArquivo: 1, chaves: {
      'ui:theme': 'isto-devia-ser-objeto',
      'ui:universe': { versao: 1, classe: 'local', d: 'militar' }
    }
  };
  const { restauradas, ignoradas } = restaurarBackup(forjado);
  assert.deepEqual(restauradas, ['ui:universe'], 'a chave boa tinha que passar');
  assert.equal(ignoradas.length, 1);
  assert.equal(get('ui:universe'), 'militar');
});

/* ===== Resumo e nome ===== */

test('o resumo conta as sensíveis — é o que a tela usa pra avisar', () => {
  /* O total NÃO é afirmado como número fixo: `aplicarPolitica()` grava
   * `permissoes` por conta própria, e amarrar o teste a "2" o faria reprovar no
   * dia em que a política ganhasse mais um efeito legítimo. O que a tela precisa
   * acertar é a contagem de SENSÍVEIS, porque é ela que decide se o operador é
   * avisado de que o arquivo carrega chave de API. */
  set('ui:theme', 'neon');            // local
  set('apis:vault', [{ nome: 'x' }]); // sensivel

  const backup = montarBackup();
  const r = resumoBackup(backup);

  assert.equal(r.sensiveis, 1, 'contou errado as sensíveis');
  assert.ok('ui:theme' in backup.chaves && 'apis:vault' in backup.chaves);
  assert.equal(r.total, Object.keys(backup.chaves).length, 'o total tem que bater com o arquivo');
});

test('o nome do arquivo é ordenável por data', () => {
  assert.equal(nomeDoArquivo(new Date('2026-08-10T23:59:00Z')), 'baluarte-backup-2026-08-10.json');
});
