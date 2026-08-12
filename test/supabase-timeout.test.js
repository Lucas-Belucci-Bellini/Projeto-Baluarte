/**
 * Ida ao banco tem teto de espera (#420).
 *
 * O modo de falha coberto aqui é o que **não parece falha**: uma rede que
 * *pendura* em vez de recusar. Recusa é fácil — o `fetch` rejeita, o `catch`
 * roda, a UI mostra o erro. Pendurar é o problema: o `await` nunca resolve,
 * nenhum `catch` dispara, nenhum fallback acontece, e o operador fica olhando a
 * tela girar sem nada no console.
 *
 * `dbFetch` é o caminho de TODA ida ao banco (perfil, memórias, telemetria) e
 * mora em `core`, marcado **estável**. "Recuperável" está na definição de 1.0.0,
 * e não há recuperação possível de uma espera infinita.
 *
 * O teste substitui o `fetch` global por um que respeita o `AbortSignal` e nunca
 * resolve sozinho — exatamente como um servidor pendurado se comporta.
 */

import { test, afterEach } from 'node:test';
import assert from 'node:assert/strict';

import { dbFetch } from '../src/core/supabase.js';

const fetchReal = globalThis.fetch;
afterEach(() => { globalThis.fetch = fetchReal; });

/**
 * `fetch` que nunca responde, mas honra o abort — como um servidor pendurado.
 *
 * O `manterVivo` não é enfeite: `AbortSignal.timeout()` em Node usa um timer
 * **unref'd**, que por definição não segura o event loop. Sem nada mais
 * pendente, o processo encerraria ANTES de o abort disparar, e o runner
 * derrubava o arquivo inteiro com "promise still pending". No navegador não
 * existe esse detalhe — é artefato de testar Node com uma API pensada para lá.
 */
function fetchQuePendura() {
  return (_url, opcoes = {}) => new Promise((_resolver, rejeitar) => {
    const manterVivo = setTimeout(() => {}, 5000);
    const encerrar = (e) => { clearTimeout(manterVivo); rejeitar(e); };

    const sinal = opcoes.signal;
    if (!sinal) return;                     // sem sinal, pendura de verdade
    if (sinal.aborted) return encerrar(erroDeAbort(sinal));
    sinal.addEventListener('abort', () => encerrar(erroDeAbort(sinal)));
  });
}

function erroDeAbort(sinal) {
  const e = new Error('abortado');
  /* O `fetch` real rejeita com TimeoutError quando o AbortSignal.timeout dispara. */
  e.name = sinal.reason?.name || 'TimeoutError';
  return e;
}

test('dbFetch desiste quando o servidor pendura — não espera para sempre', async () => {
  globalThis.fetch = fetchQuePendura();

  const t0 = Date.now();
  await assert.rejects(
    () => dbFetch('profiles?select=*', { timeoutMs: 300 }),
    (err) => {
      assert.match(err.message, /não respondeu em/i, `mensagem ilegível: ${err.message}`);
      assert.equal(err.timeout, true, 'deveria marcar que foi timeout');
      return true;
    }
  );
  const gasto = Date.now() - t0;
  assert.ok(gasto < 3000, `demorou ${gasto}ms — o teto não valeu`);
});

test('a mensagem de timeout é legível para o operador, não o erro cru', async () => {
  globalThis.fetch = fetchQuePendura();
  try {
    await dbFetch('profiles', { timeoutMs: 200 });
    assert.fail('devia ter rejeitado');
  } catch (err) {
    /* "TimeoutError" e "AbortError" não dizem nada a quem lê um toast. */
    assert.ok(!/AbortError|TimeoutError/.test(err.message), `erro cru vazou: ${err.message}`);
    assert.match(err.message, /banco/i);
    assert.ok(err.causa, 'a causa original tem que ficar acessível pro diagnóstico');
  }
});

test('falha de rede comum também vira mensagem legível', async () => {
  globalThis.fetch = () => Promise.reject(new TypeError('Failed to fetch'));
  await assert.rejects(
    () => dbFetch('profiles'),
    (err) => {
      assert.match(err.message, /não foi possível falar com o banco/i);
      assert.equal(err.timeout, false);
      return true;
    }
  );
});

test('o teto padrão existe mesmo sem ninguém passar timeoutMs', async () => {
  /* Sem `timeoutMs` explícito, ainda tem que haver um `signal` — senão a
   * proteção só valeria para quem lembrasse de pedir. */
  let recebeu = null;
  globalThis.fetch = (_u, o) => { recebeu = o; return Promise.reject(new TypeError('x')); };
  await dbFetch('profiles').catch(() => {});
  assert.ok(recebeu?.signal, 'dbFetch chamou fetch sem AbortSignal');
});

test('resposta boa continua passando normalmente', async () => {
  globalThis.fetch = () => Promise.resolve({
    ok: true,
    status: 200,
    text: () => Promise.resolve('[{"id":1}]')
  });
  assert.deepEqual(await dbFetch('profiles'), [{ id: 1 }]);
});

test('erro HTTP do banco preserva status e mensagem do servidor', async () => {
  globalThis.fetch = () => Promise.resolve({
    ok: false,
    status: 403,
    text: () => Promise.resolve('{"message":"RLS negou"}')
  });
  await assert.rejects(
    () => dbFetch('profiles'),
    (err) => {
      assert.equal(err.status, 403);
      assert.match(err.message, /RLS negou/);
      return true;
    }
  );
});
