/**
 * Carregamento dos datasets que ficam FORA do bundle (#420).
 *
 * As bases do Arma 3 e a saga das Crônicas são grandes demais para empacotar
 * (a de armas sozinha tem ~1,9 MB crus) e por isso são buscadas em runtime. Isso
 * as coloca numa categoria diferente do resto de `src/data/`: um dataset
 * importado quebrado **falha o build**, e alguém conserta antes de publicar; um
 * dataset buscado quebrado falha **na cara do operador**.
 *
 * Este módulo é a porta única desse caminho, e ele garante três coisas:
 *
 * 1. **Teto de espera.** Sem timeout, uma rede que pendura deixa a tela em
 *    "carregando…" para sempre — sem erro, sem fallback, sem recuperação. É o
 *    mesmo modo de falha que `core/supabase.js` fechou: pendurar é pior que
 *    recusar, porque não parece defeito, parece lentidão.
 *
 * 2. **Forma conferida.** JSON *válido* com a forma errada era o buraco mais
 *    sutil: `d.armas` de um objeto sem `armas` resolvia `undefined`, e quem
 *    chamasse `.filter()` depois recebia "Cannot read properties of undefined" —
 *    um erro que não diz nada sobre o dataset. Agora a promessa **rejeita** com
 *    o nome do que faltou.
 *
 * 3. **Cache que não guarda fracasso.** A promessa fica em cache no módulo (uma
 *    requisição por sessão), mas a falha limpa o cache — senão o primeiro erro
 *    condenaria a sessão inteira, e o botão "tentar de novo" mentiria.
 */

/* 20 s, não os 8 s do banco: aqui são megabytes, e um teto curto demais
 * transformaria conexão lenta em erro. O teto existe contra rede PENDURADA, não
 * contra rede devagar. */
const TIMEOUT_PADRAO = 20000;

/**
 * Busca um JSON grande com teto de espera e forma conferida.
 *
 * @param {string} url
 * @param {{campo?: string, timeoutMs?: number, rotulo?: string}} [opcoes]
 *        `campo` — se dado, extrai essa chave e exige que ela exista;
 *        `rotulo` — nome legível do dataset para a mensagem de erro.
 * @returns {Promise<any>}
 */
export async function buscarDataset(url, { campo, timeoutMs = TIMEOUT_PADRAO, rotulo } = {}) {
  const nome = rotulo || url;

  let res;
  try {
    res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  } catch (e) {
    const demorou = e && (e.name === 'TimeoutError' || e.name === 'AbortError');
    throw new Error(demorou
      ? `${nome} não respondeu em ${Math.round(timeoutMs / 1000)}s.`
      : `Não foi possível baixar ${nome}: ${e?.message || 'falha de rede'}`);
  }

  if (!res.ok) throw new Error(`${nome} respondeu HTTP ${res.status}.`);

  let dados;
  try {
    dados = await res.json();
  } catch {
    /* Arquivo truncado ou servido como HTML (404 disfarçado de página) — o
     * `SyntaxError` cru não diz qual dataset era. */
    throw new Error(`${nome} não é um JSON válido.`);
  }

  if (campo) {
    if (!dados || dados[campo] === undefined) {
      throw new Error(`${nome} veio sem o campo "${campo}".`);
    }
    return dados[campo];
  }
  return dados;
}

/**
 * Envolve `buscarDataset` num cache de módulo que **não guarda fracasso**.
 *
 * @param {string} url
 * @param {object} [opcoes] mesmas de `buscarDataset`
 * @returns {() => Promise<any>} função de carga, idempotente enquanto der certo
 */
export function carregadorDeDataset(url, opcoes = {}) {
  let promessa = null;
  return function carregar() {
    if (!promessa) {
      promessa = buscarDataset(url, opcoes).catch((err) => {
        promessa = null;      // falhou: a próxima tentativa vai de novo à rede
        throw err;
      });
    }
    return promessa;
  };
}
