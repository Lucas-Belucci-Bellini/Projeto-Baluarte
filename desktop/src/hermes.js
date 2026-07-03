// Motor Hermes EMBUTIDO (Fatia 2 — issue #310/#231): roda o Nous Hermes LOCAL
// no app, sem navegador/WebGPU e sem API, via node-llama-cpp (GGUF).
//
// SEGURO POR PADRÃO: tudo aqui é lazy e guardado. Se a dependência nativa
// `node-llama-cpp` ou um arquivo .gguf não estiverem presentes, `status()`
// devolve { available:false } e o app segue normal (o agente cai no WebLLM).
// Assim este arquivo pode ser commitado sem quebrar o build do instalador —
// o motor "acende" quando uma sessão LOCAL adicionar a dep + o modelo
// (ver docs/HANDOFF-LOCAL.md).
//
// Contrato exposto via ipc.js (allowlist):
//   'hermes:status'   -> { available, model?, backend? }
//   'hermes:generate' -> { text }   payload { system, messages, temperature, maxTokens }

const fs = require('fs');
const path = require('path');

let _llamaMod = null;      // módulo node-llama-cpp (ou false se ausente)
let _model = null;         // modelo carregado (cache)
let _modelPath = null;

/** Tenta carregar o node-llama-cpp uma vez. Ausente → false (sem quebrar). */
function llamaModule() {
  if (_llamaMod !== null) return _llamaMod;
  try { _llamaMod = require('node-llama-cpp'); }
  catch { _llamaMod = false; }
  return _llamaMod;
}

/** Acha um .gguf: env BALUARTE_HERMES_MODEL, ou o 1º .gguf em pastas conhecidas. */
function findModelPath() {
  const envp = process.env.BALUARTE_HERMES_MODEL;
  if (envp && fs.existsSync(envp)) return envp;
  const dirs = [];
  try { const { app } = require('electron'); dirs.push(path.join(app.getPath('userData'), 'models')); } catch { /* fora do electron */ }
  if (process.resourcesPath) dirs.push(path.join(process.resourcesPath, 'models'));
  dirs.push(path.join(__dirname, '..', 'models'));
  for (const d of dirs) {
    try {
      if (!fs.existsSync(d)) continue;
      const gguf = fs.readdirSync(d).find((f) => f.toLowerCase().endsWith('.gguf'));
      if (gguf) return path.join(d, gguf);
    } catch { /* segue */ }
  }
  return null;
}

async function status() {
  const mod = llamaModule();
  if (!mod) return { available: false, reason: 'node-llama-cpp não instalado' };
  const mp = _modelPath || findModelPath();
  if (!mp) return { available: false, reason: 'nenhum .gguf encontrado (env BALUARTE_HERMES_MODEL ou pasta models/)' };
  return { available: true, model: path.basename(mp), backend: 'llama.cpp' };
}

async function getModel() {
  const mod = llamaModule();
  if (!mod) throw new Error('node-llama-cpp não instalado');
  _modelPath = _modelPath || findModelPath();
  if (!_modelPath) throw new Error('nenhum modelo .gguf encontrado');
  if (_model) return _model;
  const llama = await mod.getLlama();
  _model = await llama.loadModel({ modelPath: _modelPath });
  return _model;
}

/**
 * Gera um turno. `messages` é a conversa do núcleo de agente (roles user/
 * assistant, com <tool_call>/<tool_response> embutidos como texto). Usamos o
 * template de chat do modelo (LlamaChatSession) com o system do agente.
 */
async function generate(payload = {}) {
  const { system = '', messages = [], temperature = 0.2, maxTokens = 1024 } = payload;
  const mod = llamaModule();
  const model = await getModel();
  const context = await model.createContext();
  try {
    const session = new mod.LlamaChatSession({
      contextSequence: context.getSequence(),
      systemPrompt: system
    });
    const history = messages.slice(0, -1);
    const last = messages[messages.length - 1];
    if (history.length && typeof session.setChatHistory === 'function') {
      session.setChatHistory(history.map((m) => ({
        type: m.role === 'assistant' ? 'model' : 'user',
        text: m.content
      })));
    }
    const prompt = (last && last.content) || '';
    const text = await session.prompt(prompt, { temperature, maxTokens });
    return { text: text || '' };
  } finally {
    try { await context.dispose(); } catch { /* ok */ }
  }
}

module.exports = { status, generate };
