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

import { storage } from '../core/storage.js';

const WEBLLM_CDN = 'https://esm.run/@mlc-ai/web-llm';
const KEY_SEM_F16 = 'webllm:semF16';   // a GPU já provou que não tem shader-f16

export const WEBLLM_MODELS = [
  { id: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', label: 'Llama 3.2 1B (~1 GB · rápido)' },
  { id: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 0.5B (~0,6 GB · o mais rápido)' },
  { id: 'Phi-3-mini-4k-instruct-q4f16_1-MLC', label: 'Phi-3 mini (~2 GB · equilibrado)' },
  { id: 'Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC', label: 'Qwen2.5 Coder 1.5B (código)' },
  { id: 'Llama-3-8B-Instruct-q4f16_1-MLC', label: 'Llama 3 8B (~4 GB · mais capaz, lento)' },
  /* Nous Hermes — a "IA da hermes" rodando 100% no navegador (WebGPU). */
  { id: 'Hermes-3-Llama-3.2-3B-q4f16_1-MLC', label: 'Nous Hermes 3 · 3B (~2,5 GB · hermes leve)' },
  { id: 'Hermes-2-Pro-Mistral-7B-q4f16_1-MLC', label: 'Nous Hermes 2 Pro · Mistral 7B (~4,5 GB · hermes)' },
  { id: 'Hermes-3-Llama-3.1-8B-q4f16_1-MLC', label: 'Nous Hermes 3 · Llama 3.1 8B (~5 GB · hermes, mais novo)' },
  /* Variantes q4f32 — GPUs SEM shader-f16 (o auto-fallback também usa estas). */
  { id: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', label: 'Llama 3.2 1B · f32 (GPU sem f16)' },
  { id: 'Hermes-3-Llama-3.2-3B-q4f32_1-MLC', label: 'Nous Hermes 3 · 3B · f32 (GPU sem f16)' },
  { id: 'Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC', label: 'Nous Hermes 2 Pro · 8B · f32 (GPU sem f16)' }
];

/* ===== GPUs sem shader-f16 (ex.: integradas antigas) =====================
 * Os modelos q4f16 exigem a extensão WebGPU shader-f16; sem ela o load morre
 * com "requires WebGPU extension shader-f16". Cada q4f16 tem um gêmeo q4f32
 * que roda em qualquer WebGPU (um pouco maior, mesmo modelo). O fallback:
 * detecta o erro 1x → troca pro gêmeo → grava a lição pro futuro. */
function gemeoF32(modelId) {
  const direto = modelId.replace('q4f16_1', 'q4f32_1');
  /* o Hermes-2-Pro Mistral-7B não tem gêmeo f32 publicado — usa o da família */
  if (/^Hermes-2-Pro-Mistral-7B/.test(modelId)) return 'Hermes-2-Pro-Llama-3-8B-q4f32_1-MLC';
  return direto !== modelId ? direto : null;
}
function erroSemF16(e) { return /shader-f16/i.test(String((e && e.message) || e)); }

export const DEFAULT_WEBLLM_MODEL = WEBLLM_MODELS[0].id;

/** WebGPU está disponível neste navegador? */
export function isWebGPUAvailable() {
  return typeof navigator !== 'undefined' && 'gpu' in navigator;
}

let activeEngine = null;
let activeModel = null;

/** Cria (ou reutiliza) o engine WebLLM para o modelo pedido. */
async function getEngine(modelId, onProgress) {
  /* GPU já provou não ter f16? Vai direto pro gêmeo f32 (sem falhar de novo). */
  if (storage.get(KEY_SEM_F16, false) && modelId.includes('q4f16_1')) {
    const g = gemeoF32(modelId);
    if (g) { if (onProgress) onProgress(`GPU sem shader-f16 → usando ${g}`, 0); modelId = g; }
  }
  if (activeEngine && activeModel === modelId) return activeEngine;

  let webllm;
  try {
    webllm = await import(/* @vite-ignore */ WEBLLM_CDN);
  } catch {
    throw new Error('Não consegui carregar a biblioteca WebLLM. Verifique a conexão.');
  }

  const criar = (id) => webllm.CreateMLCEngine(id, {
    initProgressCallback: (report) => {
      if (onProgress) onProgress(report.text || '', report.progress || 0);
    }
  });

  let engine;
  try {
    engine = await criar(modelId);
  } catch (e) {
    const g = erroSemF16(e) ? gemeoF32(modelId) : null;
    if (!g) throw e;
    /* 1ª vez nesta GPU: aprende a lição, avisa e tenta o gêmeo f32. */
    storage.set(KEY_SEM_F16, true);
    console.warn(`[webllm] GPU sem shader-f16 — trocando ${modelId} → ${g} (lição gravada).`);
    if (onProgress) onProgress(`Sua GPU não tem shader-f16 → trocando pro modelo f32 (${g})…`, 0);
    engine = await criar(g);
    modelId = g;
  }

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

/**
 * "Cérebro" pro núcleo de AGENTE (jarvis-agent-core): completa um turno a partir
 * de {system, messages} e devolve o texto puro do modelo — SEM streaming, pra
 * parsear os <tool_call> com segurança. Baixa temperatura = tool-calls estáveis.
 * @param {string} modelId  modelo WebLLM (Nous Hermes recomendado p/ tool use)
 * @param {{onProgress?:Function}} cbs  progresso do download na 1ª carga
 */
export function makeWebLLMBrain(modelId, cbs = {}) {
  if (!isWebGPUAvailable()) {
    throw new Error('Seu navegador não suporta WebGPU. Use Chrome ou Edge atualizados (ou o app desktop).');
  }
  const id = modelId || DEFAULT_WEBLLM_MODEL;
  return async ({ system, messages }) => {
    const engine = await getEngine(id, cbs.onProgress);
    const chat = [{ role: 'system', content: system }, ...messages];
    const res = await engine.chat.completions.create({
      messages: chat, stream: false, temperature: 0.2, max_tokens: 1024
    });
    return res.choices?.[0]?.message?.content || '';
  };
}
