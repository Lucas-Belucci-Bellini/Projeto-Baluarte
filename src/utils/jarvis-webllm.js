/**
 * JARVIS WebLLM — motor de IA 100% no navegador (Plano IA Baluarte, doc 03).
 *
 * Roda um modelo de linguagem na GPU/CPU do usuário via WebGPU + WebAssembly,
 * usando a lib WebLLM (projeto MLC). Sem servidor, sem API key, e offline
 * depois que o modelo é baixado (cache do navegador).
 *
 * A lib é carregada sob demanda do CDN (esm.run) só quando este modo é usado —
 * não entra no bundle principal. Requer Chrome/Edge atualizados (WebGPU).
 */

const WEBLLM_CDN = 'https://esm.run/@mlc-ai/web-llm';

export const WEBLLM_MODELS = [
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 1B (~1 GB · rápido)' },
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 0.5B (~0,6 GB · o mais rápido)' },
  { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', label: 'Phi-3 mini (~2 GB · equilibrado)' },
  { id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 Coder 1.5B (código)' },
  { id: 'Llama-3-8B-Instruct-q4f16_1-MLC', label: 'Llama 3 8B (~4 GB · mais capaz, lento)' }
];

export const DEFAULT_WEBLLM_MODEL = WEBLLM_MODELS[0].id;

/** WebGPU está disponível neste navegador? */
export function isWebGPUAvailable() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

let activeEngine = null;
let activeModel = null;

/** Cria (ou reutiliza) o engine WebLLM para o modelo pedido. */
async function getEngine(modelId, onProgress) {
  if (activeEngine && activeModel === modelId) return activeEngine;

  let webllm;
  try {
    webllm = await import(/* @vite-ignore */ WEBLLM_CDN);
  } catch {
    throw new Error('Não consegui carregar a biblioteca WebLLM. Verifique a conexão.');
  }

  const engine = await webllm.CreateMLCEngine(modelId, {
    initProgressCallback: (report) => {
      if (onProgress) onProgress(report.text || '', report.progress || 0);
    }
  });

  activeEngine = engine;
  activeModel = modelId;
  return engine;
}

/** Descarrega o engine (libera memória / força recarregar outro modelo). */
export function resetWebLLM() {
  activeEngine = null;
  activeModel = null;
}

/** Pré-carrega (baixa/aquece) um modelo sem gerar nada — 1ª resposta fica instantânea. */
export async function preloadWebLLM(modelId, onProgress) {
  if (!isWebGPUAvailable()) {
    throw new Error('Seu navegador não suporta WebGPU. Use Chrome ou Edge atualizados.');
  }
  await getEngine(modelId || DEFAULT_WEBLLM_MODEL, onProgress);
  return activeModel;
}

/** Modelo atualmente carregado em memória (ou null). */
export function getLoadedModel() { return activeModel; }

/**
 * Processa a conversa no modo WebLLM, com streaming.
 * @param {Array<{role:string,text:string}>} messages histórico (user/jarvis)
 * @param {object} config  config do JARVIS (systemPrompt, webllmModel)
 * @param {{onProgress?:Function, onToken?:Function}} cbs
 *   onProgress(texto, fração 0..1) durante o download/carga do modelo;
 *   onToken(textoParcialAcumulado) a cada pedaço gerado.
 * @returns {Promise<string>} resposta completa
 */
export async function processWebLLM(messages, config, cbs = {}) {
  if (!isWebGPUAvailable()) {
    throw new Error('Seu navegador não suporta WebGPU. Use Chrome ou Edge atualizados.');
  }

  const modelId = config.webllmModel || DEFAULT_WEBLLM_MODEL;
  const engine = await getEngine(modelId, cbs.onProgress);

  const chat = [
    { role: 'system', content: config.systemPrompt || 'Você é o J.A.R.V.I.S., núcleo do Projeto Baluarte. Responda em português.' },
    ...messages.map((m) => ({
      role: m.role === 'jarvis' ? 'assistant' : 'user',
      content: m.text
    }))
  ];

  const stream = await engine.chat.completions.create({
    messages: chat, stream: true,
    temperature: typeof config.webllmTemp === 'number' ? config.webllmTemp : 0.7,
    max_tokens: 1024
  });
  let full = '';
  for await (const chunk of stream) {
    const delta = chunk.choices?.[0]?.delta?.content || '';
    if (delta) {
      full += delta;
      if (cbs.onToken) cbs.onToken(full);
    }
  }
  return full || '(resposta vazia)';
}
