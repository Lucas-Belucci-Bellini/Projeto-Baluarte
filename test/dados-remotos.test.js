/**
 * Os datasets que ficam fora do bundle falham direito (#420).
 *
 * `arsenal` e `biblioteca` estão marcados **estáveis**, e os dois dependem de
 * arquivos buscados em runtime (a base de armas do Arma 3 tem ~1,9 MB crus; a
 * saga das Crônicas, mais de mil capítulos). Isso os coloca numa categoria
 * diferente do resto de `src/data/`: um dataset **importado** quebrado falha o
 * build e alguém conserta antes de publicar; um dataset **buscado** quebrado
 * falha na cara do operador.
 *
 * Três modos de falha são cobrados aqui, e o segundo é o que ninguém vê vindo:
 *
 *   ausente/malformado → mensagem que diz QUAL dataset, não `SyntaxError`
 *   forma errada       → JSON *válido* sem o campo esperado resolvia
 *                        `undefined`, e o `.filter()` de quem chamou estourava
 *                        com "Cannot read properties of undefined" — erro que
 *                        não menciona dataset nenhum
 *   pendurado          → sem teto, a tela fica em "carregando…" para sempre
 */

import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { buscarDataset, carregadorDeDataset } from '../src/core/dados-remotos.js';

const fetchReal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchReal; });

const respostaOk = (corpo) => () => Promise.resolve({
  ok: true, status: 200, json: () => Promise.resolve(corpo)
});

/** `fetch` que nunca responde mas honra o abort — servidor pendurado.
 *  O `manterVivo` compensa o timer unref'd do `AbortSignal.timeout` em Node
 *  (ver a nota em `test/supabase-timeout.test.js`). */
const fetchQuePendura = () => (_u, o = {}) => new Promise((_r, rejeitar) => {
  const manterVivo = setTimeout(() => {}, 5000);
  const encerrar = (e) => { clearTimeout(manterVivo); rejeitar(e); };
  const sinal = o.signal;
  if (!sinal) return;
  const erro = () => Object.assign(new Error('abortado'), { name: 'TimeoutError' });
  if (sinal.aborted) return encerrar(erro());
  sinal.addEventListener('abort', () => encerrar(erro()));
});

/* ===== Pendurar ===== */

test('desiste quando o servidor pendura, em vez de esperar para sempre', async () => {
  globalThis.fetch = fetchQuePendura();
  const t0 = Date.now();
  await assert.rejects(
    () => buscarDataset('/x.json', { timeoutMs: 300, rotulo: 'a base de teste' }),
    (err) => {
      assert.match(err.message, /a base de teste não respondeu em/i);
      return true;
    }
  );
  assert.ok(Date.now() - t0 < 3000, 'o teto não valeu');
});

test('o teto padrão existe mesmo sem timeoutMs explícito', async () => {
  let recebeu = null;
  globalThis.fetch = (_u, o) => { recebeu = o; return Promise.reject(new TypeError('x')); };
  await buscarDataset('/x.json').catch(() => {});
  assert.ok(recebeu?.signal, 'chamou fetch sem AbortSignal');
});

/* ===== Quebrado ===== */

test('HTTP de erro diz qual dataset e qual status', async () => {
  globalThis.fetch = () => Promise.resolve({ ok: false, status: 404, json: () => Promise.resolve(null) });
  await assert.rejects(
    () => buscarDataset('/x.json', { rotulo: 'a base de veículos' }),
    /a base de veículos respondeu HTTP 404/
  );
});

test('JSON malformado vira mensagem legível, não SyntaxError cru', async () => {
  globalThis.fetch = () => Promise.resolve({
    ok: true, status: 200, json: () => Promise.reject(new SyntaxError('Unexpected token <'))
  });
  await assert.rejects(
    () => buscarDataset('/x.json', { rotulo: 'a saga' }),
    (err) => {
      assert.match(err.message, /a saga não é um JSON válido/i);
      assert.ok(!/SyntaxError|Unexpected token/.test(err.message), `erro cru vazou: ${err.message}`);
      return true;
    }
  );
});

/* ===== Forma errada — o buraco sutil ===== */

test('JSON válido SEM o campo esperado rejeita em vez de resolver undefined', async () => {
  /* Este era o caso silencioso: `d.armas` de `{ total: 10 }` é `undefined`,
   * a promessa RESOLVIA, e o erro só aparecia lá na frente, sem contexto. */
  globalThis.fetch = respostaOk({ total: 10 });
  await assert.rejects(
    () => buscarDataset('/x.json', { campo: 'armas', rotulo: 'o arsenal' }),
    /o arsenal veio sem o campo "armas"/
  );
});

test('campo presente é extraído normalmente', async () => {
  globalThis.fetch = respostaOk({ armas: [{ nome: 'a' }] });
  assert.deepEqual(await buscarDataset('/x.json', { campo: 'armas' }), [{ nome: 'a' }]);
});

test('campo presente mas vazio NÃO é tratado como ausente', async () => {
  /* Lista vazia é um resultado legítimo; só `undefined` é ausência. */
  globalThis.fetch = respostaOk({ armas: [] });
  assert.deepEqual(await buscarDataset('/x.json', { campo: 'armas' }), []);
});

test('sem `campo`, devolve o dataset inteiro', async () => {
  globalThis.fetch = respostaOk({ a: 1, b: 2 });
  assert.deepEqual(await buscarDataset('/x.json'), { a: 1, b: 2 });
});

/* ===== O cache não pode guardar fracasso ===== */

test('sucesso é cacheado — uma requisição por sessão', async () => {
  let idas = 0;
  globalThis.fetch = () => { idas += 1; return respostaOk({ ok: true })(); };
  const carregar = carregadorDeDataset('/x.json');

  await carregar();
  await carregar();
  await carregar();
  assert.equal(idas, 1, 'foi à rede mais de uma vez');
});

test('falha NÃO é cacheada — o "tentar de novo" precisa tentar de novo', async () => {
  /* Se o fracasso ficasse em cache, o primeiro erro condenaria a sessão inteira
   * e o botão "falhou — tentar de novo" mentiria. */
  let idas = 0;
  globalThis.fetch = () => {
    idas += 1;
    return idas === 1
      ? Promise.reject(new TypeError('rede caiu'))
      : respostaOk({ ok: true })();
  };
  const carregar = carregadorDeDataset('/x.json');

  await assert.rejects(() => carregar());
  assert.deepEqual(await carregar(), { ok: true }, 'a segunda tentativa devia ter ido à rede');
  assert.equal(idas, 2);
});
