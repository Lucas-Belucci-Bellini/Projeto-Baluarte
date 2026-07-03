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
   * Fora disso → Hermes local no navegador (WebLLM). Mesmo núcleo de agente. */
  let brain;
  const native = await nativeHermesStatus();
  if (native.available) {
    if (cbs.onProgress) cbs.onProgress(`motor embutido: ${native.model || 'Hermes'} `, 1);
    brain = makeNativeBrain();
  } else {
    brain = makeWebLLMBrain(
      config.hermesAgentModel || HERMES_AGENT_DEFAULT,
      { onProgress: cbs.onProgress }
    );
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
