/**
 * Estado global de leitura — "painel de diagnóstico" do Baluarte (doc 07).
 *
 * Cada função do site publica um resumo do que está acontecendo (setStatus);
 * a IA lê apenas um SNAPSHOT em texto (somente leitura) e nunca escreve aqui.
 * Ações que mudam o site são separadas e explícitas — via as ferramentas do
 * agente (jarvis-tools.js), nunca pela leitura de estado.
 *
 * Exposto em window.BaluarteStatus para transparência/depuração.
 */

const state = {
  funcaoAtual: null
};

if (typeof window !== 'undefined') {
  window.BaluarteStatus = state;
}

/** Publica/atualiza o resumo de uma função. `summary` deve ser dado simples. */
export function setStatus(key, summary) {
  if (!key) return;
  state[key] = (summary && typeof summary === 'object')
    ? { ...summary }
    : { value: summary };
}

/** Remove o resumo de uma função (ex.: ao desmontar a página). */
export function clearStatus(key) {
  if (key in state) delete state[key];
}

/** Marca qual função/rota está ativa no momento. */
export function setCurrentFunction(route) {
  state.funcaoAtual = route || null;
}

/** Cópia serializável do estado (somente leitura). */
export function getStatusSnapshot() {
  try {
    return JSON.parse(JSON.stringify(state));
  } catch {
    return { funcaoAtual: state.funcaoAtual };
  }
}

/** Estado em texto, pronto para injetar como contexto da IA. */
export function getStatusText() {
  try {
    return JSON.stringify(getStatusSnapshot(), null, 2);
  } catch {
    return '{}';
  }
}
