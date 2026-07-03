// Motor Hermes EMBUTIDO (#310/#231) — roda o Nous Hermes LOCAL no app, sem
// navegador/WebGPU e sem API, via node-llama-cpp (GGUF).
//
// SEGURO POR PADRÃO: tudo lazy e guardado. Sem `node-llama-cpp` (dep opcional)
// ou sem um .gguf, `status()` devolve { available:false } e o app cai no WebLLM.
// Assim o build do instalador nunca quebra.
//
// INSTALADOR PEQUENO: o modelo NÃO vai embutido — é baixado no 1º uso pra
// `userData/models` (env `BALUARTE_HERMES_MODEL_URL`, com um default do Nous
// Hermes 2 Pro Q4_K_M). Um .gguf colocado à mão (ou empacotado) tem prioridade.
//
// Contrato via ipc.js (allowlist):
//   'hermes:status'   -> { available, downloading?, pct?, model?, backend? }
//   'hermes:generate' -> { text }

const fs = require('fs');
const path = require('path');
const https = require('https');

const DEFAULT_MODEL_URL =
  'https://huggingface.co/NousResearch/Hermes-2-Pro-Mistral-7B-GGUF/resolve/main/Hermes-2-Pro-Mistral-7B.Q4_K_M.gguf';

let _llamaMod = null;      // node-llama-cpp (ou false se ausente)
let _model = null;         // modelo carregado (cache)
let _modelPath = null;
const _dl = { active: false, pct: 0, error: '' };   // estado do download

function llamaModule() {
  if (_llamaMod !== null) return _llamaMod;
  try { _llamaMod = require('node-llama-cpp'); }
  catch { _llamaMod = false; }
  return _llamaMod;
}

function modelsDir() {
  try { const { app } = require('electron'); return path.join(app.getPath('userData'), 'models'); }
  catch { return path.join(__dirname, '..', 'models'); }
}

/** .gguf já presente (env, userData/models, resources/models, ../models). */
function findLocalModel() {
  const envp = process.env.BALUARTE_HERMES_MODEL;
  if (envp && fs.existsSync(envp)) return envp;
  const dirs = [modelsDir()];
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

function modelUrl() {
  return (process.env.BALUARTE_HERMES_MODEL_URL || DEFAULT_MODEL_URL).trim();
}

async function status() {
  if (!llamaModule()) return { available: false, reason: 'node-llama-cpp não instalado' };
  if (_dl.active) return { available: false, downloading: true, pct: _dl.pct };
  const mp = _modelPath || findLocalModel();
  if (mp) return { available: true, model: path.basename(mp), backend: 'llama.cpp' };
  return { available: false, reason: 'modelo não baixado', canDownload: !!modelUrl(), error: _dl.error || undefined };
}

/* GET seguindo redirects (HuggingFace redireciona pro CDN), streaming pro disco. */
function download(url, dest, onPct) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'ProjetoBaluarte/0.3' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        res.resume(); return download(res.headers.location, dest, onPct).then(resolve, reject);
      }
      if (res.statusCode !== 200) { res.resume(); return reject(new Error('HTTP ' + res.statusCode)); }
      const total = parseInt(res.headers['content-length'] || '0', 10);
      let got = 0;
      const tmp = dest + '.part';
      const out = fs.createWriteStream(tmp);
      res.on('data', (c) => { got += c.length; if (total) onPct(Math.round(got / total * 100)); });
      res.pipe(out);
      out.on('finish', () => out.close(() => { try { fs.renameSync(tmp, dest); resolve(dest); } catch (e) { reject(e); } }));
      out.on('error', reject);
    });
    req.on('error', reject);
  });
}

/** Garante um modelo local: usa o que existe, senão baixa (1x). */
async function ensureModel() {
  const local = findLocalModel();
  if (local) return local;
  const url = modelUrl();
  if (!url) throw new Error('nenhum modelo .gguf e sem BALUARTE_HERMES_MODEL_URL');
  if (_dl.active) throw new Error('modelo ainda baixando');
  const dir = modelsDir();
  try { fs.mkdirSync(dir, { recursive: true }); } catch { /* ok */ }
  const dest = path.join(dir, url.split('/').pop().split('?')[0] || 'hermes.gguf');
  _dl.active = true; _dl.pct = 0; _dl.error = '';
  try {
    await download(url, dest, (p) => { _dl.pct = p; });
    return dest;
  } catch (e) {
    _dl.error = String(e.message || e); throw e;
  } finally {
    _dl.active = false;
  }
}

async function getModel() {
  const mod = llamaModule();
  if (!mod) throw new Error('node-llama-cpp não instalado');
  _modelPath = _modelPath || await ensureModel();
  if (_model) return _model;
  const llama = await mod.getLlama();
  _model = await llama.loadModel({ modelPath: _modelPath });
  return _model;
}

/**
 * Gera um turno. `messages` é a conversa do núcleo de agente; usamos o template
 * de chat do modelo (LlamaChatSession) com o system do agente.
 */
async function generate(payload = {}) {
  const { system = '', messages = [], temperature = 0.2, maxTokens = 1024 } = payload;
  const mod = llamaModule();
  const model = await getModel();
  const context = await model.createContext();
  try {
    const session = new mod.LlamaChatSession({ contextSequence: context.getSequence(), systemPrompt: system });
    const history = messages.slice(0, -1);
    const last = messages[messages.length - 1];
    if (history.length && typeof session.setChatHistory === 'function') {
      session.setChatHistory(history.map((m) => ({ type: m.role === 'assistant' ? 'model' : 'user', text: m.content })));
    }
    const text = await session.prompt((last && last.content) || '', { temperature, maxTokens });
    return { text: text || '' };
  } finally {
    try { await context.dispose(); } catch { /* ok */ }
  }
}

module.exports = { status, generate };
