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

/* ===== BLINDAGEM DO MOTOR NATIVO (Zero Crash Policy) =====================
 * O node-llama-cpp pode estourar em DOIS momentos: no `require` (módulo
 * ausente) ou — o caso clássico de ABI — dentro de `getLlama()`/`loadModel()`
 * (ERR_DLOPEN_FAILED, NODE_MODULE_VERSION mismatch, ELF/arch errado). A regra:
 * NENHUM desses erros pode subir e derrubar o app. O interceptador captura,
 * CLASSIFICA, marca o motor como FATAL (não re-tenta nesta sessão — falha 1x,
 * cai no fallback pra sempre, rápido) e loga estruturado com a correção. O
 * status() passa a responder na hora {available:false, fatal:true, hint} e o
 * site vira a chave pro WebLLM sem o usuário perceber. */
const _native = { state: 'unknown', reason: '', code: '', hint: '' };

function classifyNativeError(e) {
  const msg = String((e && e.message) || e);
  const code = (e && e.code) || '';
  if (code === 'ERR_DLOPEN_FAILED' ||
      /ERR_DLOPEN_FAILED|dlopen|invalid ELF header|wrong ELF class|specified module could not be found|mach-o file, but is an incompatible architecture/i.test(msg)) {
    return { code: 'ERR_DLOPEN_FAILED', hint: 'binário nativo incompatível com o ABI do Electron — `npx electron-rebuild -m node_modules/node-llama-cpp` (ou reinstalar o app) resolve' };
  }
  if (/NODE_MODULE_VERSION|compiled against a different Node\.js version/i.test(msg)) {
    return { code: 'NODE_MODULE_VERSION', hint: 'node-llama-cpp compilado pra outra versão de Node/Electron — `npx electron-rebuild` resolve' };
  }
  if (code === 'MODULE_NOT_FOUND' || /Cannot find module/i.test(msg)) {
    return { code: 'MODULE_NOT_FOUND', hint: 'dependência opcional node-llama-cpp não instalada neste build — nada a fazer, o WebLLM assume' };
  }
  return { code: code || 'NATIVE_INIT_FAILED', hint: 'falha ao inicializar o motor nativo — se persistir, `npx electron-rebuild` e reinstalar o modelo' };
}

/** Intercepta a falha: classifica, desativa o nativo NESTA sessão e loga. */
function markNativeFatal(e, onde) {
  if (_native.state === 'fatal') return;   // já interceptado — não repete o log
  const c = classifyNativeError(e);
  _native.state = 'fatal';
  _native.reason = String((e && e.message) || e).slice(0, 300);
  _native.code = c.code;
  _native.hint = c.hint;
  /* LOG ESTRUTURADO — aparece no console de dev / terminal do app */
  console.warn(
    '[hermes][motor-nativo] ⚠ FALHOU e foi DESATIVADO nesta sessão (zero-crash).\n' +
    `  · onde:     ${onde}\n` +
    `  · código:   ${_native.code}\n` +
    `  · motivo:   ${_native.reason}\n` +
    `  · correção: ${_native.hint}\n` +
    '  · fallback: o WebLLM (navegador) JÁ assumiu o controle — o app segue 100% funcional.'
  );
}

function llamaModule() {
  if (_llamaMod !== null) return _llamaMod;
  if (_native.state === 'fatal') { _llamaMod = false; return _llamaMod; }
  try {
    _llamaMod = require('node-llama-cpp');
    if (_native.state === 'unknown') _native.state = 'ok';
  } catch (e) {
    _llamaMod = false;
    markNativeFatal(e, "require('node-llama-cpp')");
  }
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
  /* FATAL responde na hora (sem re-tentar nada): o site vira pro WebLLM já. */
  if (_native.state === 'fatal') {
    return { available: false, fatal: true, engine: 'webllm', reason: _native.reason, code: _native.code, hint: _native.hint };
  }
  if (!llamaModule()) {
    if (_native.state === 'fatal') {
      return { available: false, fatal: true, engine: 'webllm', reason: _native.reason, code: _native.code, hint: _native.hint };
    }
    return { available: false, engine: 'webllm', reason: 'node-llama-cpp não instalado' };
  }
  if (_dl.active) return { available: false, downloading: true, pct: _dl.pct };
  const mp = _modelPath || findLocalModel();
  if (mp) return { available: true, engine: 'native', model: path.basename(mp), backend: 'llama.cpp' };
  return { available: false, engine: 'webllm', reason: 'modelo não baixado', canDownload: !!modelUrl(), error: _dl.error || undefined };
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
  if (!mod) throw new Error('MOTOR_NATIVO_INDISPONIVEL: ' + (_native.hint || 'node-llama-cpp não instalado'));
  _modelPath = _modelPath || await ensureModel();
  if (_model) return _model;
  /* AQUI é onde o mismatch de ABI costuma estourar de verdade (o require passa,
   * mas o binding nativo falha ao carregar). Interceptado → fatal → fallback. */
  try {
    const llama = await mod.getLlama();
    _model = await llama.loadModel({ modelPath: _modelPath });
    _native.state = 'ok';
    return _model;
  } catch (e) {
    markNativeFatal(e, 'getLlama()/loadModel() — carga do binding nativo');
    throw new Error('MOTOR_NATIVO_INDISPONIVEL: ' + _native.hint);
  }
}

/**
 * Gera um turno. `messages` é a conversa do núcleo de agente; usamos o template
 * de chat do modelo (LlamaChatSession) com o system do agente.
 */
async function generate(payload = {}) {
  const { system = '', messages = [], temperature = 0.2, maxTokens = 1024 } = payload;
  if (_native.state === 'fatal') {
    /* resposta imediata — o renderer troca pro WebLLM sem esperar timeout */
    throw new Error('MOTOR_NATIVO_INDISPONIVEL: ' + _native.hint);
  }
  const mod = llamaModule();
  const model = await getModel();
  let context;
  try {
    context = await model.createContext();
    const session = new mod.LlamaChatSession({ contextSequence: context.getSequence(), systemPrompt: system });
    const history = messages.slice(0, -1);
    const last = messages[messages.length - 1];
    if (history.length && typeof session.setChatHistory === 'function') {
      session.setChatHistory(history.map((m) => ({ type: m.role === 'assistant' ? 'model' : 'user', text: m.content })));
    }
    const text = await session.prompt((last && last.content) || '', { temperature, maxTokens });
    return { text: text || '' };
  } catch (e) {
    /* runtime nativo caiu em pleno voo (contexto/sessão/prompt) → intercepta */
    if (!/MOTOR_NATIVO_INDISPONIVEL/.test(String(e && e.message))) {
      markNativeFatal(e, 'generate() — runtime do llama.cpp');
    }
    throw new Error('MOTOR_NATIVO_INDISPONIVEL: ' + (_native.hint || String(e && e.message)));
  } finally {
    try { if (context) await context.dispose(); } catch { /* ok */ }
  }
}

module.exports = { status, generate };
