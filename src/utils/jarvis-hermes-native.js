/**
 * Cérebro NATIVO do Hermes agente (Fatia 2, app desktop — issue #310/#231).
 *
 * Quando o Baluarte roda DENTRO do Launcher (Electron) e o motor embutido
 * (llama.cpp/GGUF) está disponível, o agente usa ELE em vez do WebLLM: sem
 * navegador, sem WebGPU, modelos maiores. É a mesma interface `brain({system,
 * messages})` do núcleo de agente — só muda quem gera o texto.
 *
 * A ponte é o funil seguro do preload: `window.baluarte.invoke(canal, payload)`.
 * Canais (registrados em desktop/src/ipc.js → desktop/src/hermes.js):
 *   - 'hermes:status'   → { available, model?, backend? }
 *   - 'hermes:generate' → { text }   (payload: { system, messages, temperature, maxTokens })
 * Tudo degrada com elegância: sem app / sem motor → { available:false } e o
 * agente cai no WebLLM automaticamente.
 */

/** Roda dentro do Launcher? (ponte nativa presente) */
function hasBridge() {
  return typeof window !== 'undefined' && window.baluarte && window.baluarte.native === true
    && typeof window.baluarte.invoke === 'function';
}

/** Status do motor embutido. Nunca lança — devolve {available:false} no que falhar. */
export async function nativeHermesStatus() {
  if (!hasBridge()) return { available: false };
  try {
    const st = await window.baluarte.invoke('hermes:status', {});
    return st && typeof st === 'object' ? st : { available: false };
  } catch {
    return { available: false };
  }
}

/** Cérebro pro núcleo de agente usando o motor embutido do app. */
export function makeNativeBrain() {
  return async ({ system, messages }) => {
    const out = await window.baluarte.invoke('hermes:generate', {
      system, messages, temperature: 0.2, maxTokens: 1024
    });
    return (out && (out.text || out.content)) || '';
  };
}
