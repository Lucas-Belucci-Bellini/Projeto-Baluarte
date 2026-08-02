/**
 * Extração do Arma 3 — lado WEB (0.9.1).
 *
 * Adaptador fino sobre o funil `window.baluarte.invoke('arma3:*')`. O poder real
 * mora no app (`desktop/src/arma3.js`, com as regras de segurança); aqui só se
 * conversa com ele.
 *
 * Na web pura nada disso existe — e é assim que tem de ser (regra do #238: o
 * pesado e o nativo ficam no app). Quem chamar sem a ponte recebe uma mensagem
 * dizendo onde a capacidade mora, não um erro genérico.
 */

const temPonte = () =>
  typeof window !== 'undefined' && !!window.baluarte &&
  window.baluarte.native === true && typeof window.baluarte.invoke === 'function';

const invocar = async (canal, payload) => {
  const r = await window.baluarte.invoke(canal, payload || {});
  /* O funil devolve `{ok, data|error}`; desembrulhar aqui evita que cada
   * chamador repita a mesma conferência e esqueça o caso de erro. */
  if (r && r.ok === false) throw new Error(r.error || 'falha no app');
  return r && Object.prototype.hasOwnProperty.call(r, 'data') ? r.data : r;
};

const semPonte = () =>
  new Error('A extração do Arma 3 só roda no app (Baluarte Launcher) — ele precisa '
    + 'do log do jogo e do clone do repositório na máquina.');

/** A capacidade existe nesta sessão? Nunca lança. */
export const extracaoDisponivel = () => temPonte();

/**
 * Panorama: o que o jogo já dumpou, se o repo aceita commit, se há Python.
 * Nunca lança — é chamado no render e não pode derrubar a tela.
 */
export async function statusExtracao() {
  if (!temPonte()) return { disponivel: false };
  try {
    return { disponivel: true, ...(await invocar('arma3:status')) };
  } catch (e) {
    return { disponivel: true, erro: String(e.message || e) };
  }
}

/**
 * Roda os parsers para as etapas pedidas. Demorado (minutos) — quem chamar
 * precisa mostrar que está trabalhando.
 * @param {string[]} etapas  vazio = todas
 */
export function extrairArma3(etapas = []) {
  if (!temPonte()) throw semPonte();
  return invocar('arma3:extrair', { etapas });
}

/**
 * Commita a pasta de saída num ramo próprio.
 * `empurrar` é opt-in de propósito: sem ele o commit fica local, para o
 * operador conferir antes de mandar.
 */
export function entregarArma3({ etapas = [], ramo, empurrar = false, observacao } = {}) {
  if (!temPonte()) throw semPonte();
  return invocar('arma3:entregar', { etapas, ramo, empurrar, observacao });
}
