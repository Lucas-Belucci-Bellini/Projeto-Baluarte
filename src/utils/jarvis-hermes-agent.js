/**
 * Hermes AGENTE LOCAL (issue #310 / #231) — junta as três metades que já
 * existiam soltas no site:
 *   1. o modelo Nous Hermes rodando LOCAL (WebLLM/WebGPU, sem API, sem chave);
 *   2. as ferramentas do JARVIS (navigate, arsenal, editor, memória, skills…);
 *   3. o loop ReAct (núcleo de agente), que antes só falava com a API do Claude.
 *
 * Resultado: um agente de verdade, 100% local, no site. O app usa o MESMO
 * núcleo com o motor embutido (llama.cpp) — ver `jarvis-hermes-native.js`.
 */

import { bus } from '../core/events.js';
import { runLocalAgent } from './jarvis-agent-core.js';
import { makeWebLLMBrain, DEFAULT_WEBLLM_MODEL } from './jarvis-webllm.js';
import { nativeHermesStatus, makeNativeBrain } from './jarvis-hermes-native.js';
import { getToolSchemas, runTool } from './jarvis-tools.js';
import { getBaluarteBriefing } from './jarvis-engine.js';

/* Melhor modelo local pra tool-use: Nous Hermes 2 Pro (Mistral 7B) é afinado
   pra function-calling. Cai pro que o operador escolheu, senão o Pro. */
export const HERMES_AGENT_DEFAULT = 'Hermes-2-Pro-Mistral-7B-q4f16_1-MLC';

/**
 * Roda o agente Hermes local no navegador.
 * @param {Array<{role:string,text?:string,content?:string}>} messages  conversa
 * @param {object} config  { systemPrompt, webllmModel }
 * @param {(name,args,result)=>void} onToolCall  pra UI (mostra a ferramenta)
 * @param {{onProgress?:Function, onTurn?:Function}} cbs
 */
export async function processHermesAgent(messages, config = {}, onToolCall, cbs = {}) {
  /* No app com motor embutido → usa ELE (sem navegador/WebGPU, modelos maiores).
   * Fora disso → Hermes local no navegador (WebLLM). Mesmo núcleo de agente.
   *
   * BLINDAGEM (#310): a escolha do motor é publicada em `hermes:engine` (o HUD
   * do Núcleo mostra MOTOR: NATIVO/WEB) e o cérebro nativo é embrulhado num
   * interceptador — se o runtime nativo falhar EM PLENO VOO (ABI, dlopen…),
   * a chave vira pro WebLLM na hora, na MESMA conversa, sem estourar erro
   * pro usuário (zero-crash, fallback invisível). */
  const webModel = config.hermesAgentModel || HERMES_AGENT_DEFAULT;
  const makeWeb = () => makeWebLLMBrain(webModel, { onProgress: cbs.onProgress });

  let brain;
  const native = await nativeHermesStatus();
  if (native.available) {
    if (cbs.onProgress) cbs.onProgress(`motor embutido: ${native.model || 'Hermes'} `, 1);
    bus.emit('hermes:engine', { engine: 'native', model: native.model || 'GGUF' });
    const nativeBrain = makeNativeBrain();
    let webBrain = null;   // fallback preguiçoso: só carrega se precisar
    let nativeErr = null;  // guarda a falha do nativo pra não sumir no fallback
    brain = async (args) => {
      if (!webBrain) {
        try {
          return await nativeBrain(args);
        } catch (e) {
          /* Interceptador: motor nativo caiu → vira a chave AGORA. */
          nativeErr = e;
          console.warn(
            '[hermes] ⚠ motor NATIVO falhou em pleno voo — fallback IMEDIATO pro WebLLM.\n' +
            `  · motivo:   ${String(e && e.message).slice(0, 200)}\n` +
            '  · correção: se for ABI do Electron, `npx electron-rebuild -m node_modules/node-llama-cpp` resolve.\n' +
            '  · estado:   o WebLLM assumiu o controle desta conversa; nada foi perdido.'
          );
          bus.emit('hermes:engine', { engine: 'webllm', reason: 'falha do motor nativo', hint: String(e && e.message) });
          webBrain = makeWeb();
        }
      }
      try {
        return await webBrain(args);
      } catch (e2) {
        /* FALHA DUPLA: sem isto o motivo do nativo sumia e o operador só via o
         * erro do WebLLM (foi o que aconteceu no aceite on-device). */
        if (nativeErr) {
          throw new Error(
            `${String(e2 && e2.message)}\n(o motor NATIVO também falhou antes: ` +
            `${String(nativeErr.message).slice(0, 140)} — diga "motor" pra detalhes)`);
        }
        throw e2;
      }
    };
  } else {
    if (native.fatal) {
      /* O main já interceptou e desativou o nativo — loga a razão + correção. */
      console.warn(
        '[hermes] ⚠ motor nativo INDISPONÍVEL (interceptado no app).\n' +
        `  · código:   ${native.code || '—'}\n` +
        `  · motivo:   ${native.reason || '—'}\n` +
        `  · correção: ${native.hint || 'npx electron-rebuild'}\n` +
        '  · estado:   WebLLM no controle — experiência intacta.'
      );
    }
    bus.emit('hermes:engine', { engine: 'webllm', reason: native.reason, hint: native.hint });
    brain = makeWeb();
  }
  const persona =
    (config.systemPrompt || 'Você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte Mark XIII. Responda em português, de forma clara e tática.') +
    '\n\n' + getBaluarteBriefing();

  return runLocalAgent({
    brain,
    tools: getToolSchemas(),
    exec: runTool,
    persona,
    messages,
    onToolCall,
    onTurn: cbs.onTurn,
    maxTurns: 6
  });
}

export { DEFAULT_WEBLLM_MODEL };
