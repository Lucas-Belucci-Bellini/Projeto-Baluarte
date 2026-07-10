/**
 * Hermes LOCAL da máquina — cliente OpenAI-compatível (#340, fatia 4).
 *
 * Conecta o Baluarte a QUALQUER servidor de LLM rodando na máquina do
 * operador que exponha o endpoint padrão `/v1/chat/completions`:
 *   · LM Studio               http://localhost:1234/v1
 *   · Ollama (modo OpenAI)    http://localhost:11434/v1
 *   · text-generation-webui   http://localhost:5000/v1
 *   · llamafile / LocalAI / vLLM…
 *
 * 100% privado: o prompt vai direto do navegador pro processo local — nada
 * passa por nuvem. ÁUDIO: a resposta flui pelo pipeline normal do Núcleo,
 * então com "voz on" o texto do Hermes vira fala automaticamente
 * (ElevenLabs quando há chave; speechSynthesis como fallback) — ver
 * `jarvis-voice.js`. Nada a configurar aqui.
 *
 * Config (persistida em `jarvis:config` via storage):
 *   hermesLocalUrl   — base do endpoint (default LM Studio :1234/v1)
 *   hermesLocalModel — nome do modelo ('' = o que o servidor tiver carregado)
 */

export const HERMES_LOCAL_DEFAULT_URL = 'http://localhost:1234/v1';

/** Atalhos de servidor local conhecidos (comando "hermes <preset>" no Núcleo). */
export const HERMES_LOCAL_PRESETS = [
  { id: 'lmstudio', label: 'LM Studio', url: 'http://localhost:1234/v1' },
  { id: 'ollama', label: 'Ollama (modo OpenAI)', url: 'http://localhost:11434/v1' },
  { id: 'textgen', label: 'text-generation-webui', url: 'http://localhost:5000/v1' }
];

function base(config) {
  return ((config && config.hermesLocalUrl) || HERMES_LOCAL_DEFAULT_URL).replace(/\/$/, '');
}

/** Site HTTPS só alcança http:// quando é localhost (origem confiável no
 * navegador). Qualquer outro http:// seria bloqueado como mixed content —
 * avisa antes, com a correção. */
function guardMixedContent(url) {
  if (typeof location !== 'undefined' && location.protocol === 'https:' &&
      /^http:\/\//i.test(url) && !/^http:\/\/(localhost|127\.0\.0\.1)[:/]/i.test(url)) {
    throw new Error(
      `A URL "${url}" é http:// e o site é HTTPS — o navegador bloqueia (mixed content). ` +
      'Use http://localhost:<porta>/v1 (permitido) ou uma URL https://.');
  }
}

/** fetch com timeout (mesmo padrão do jarvis-engine). */
async function fetchTimeout(url, options = {}, ms = 30000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...options, signal: ctrl.signal });
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('timeout');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function erroServidorFora(url) {
  return new Error(
    `Hermes local inacessível em ${url}. O servidor está rodando? ` +
    'LM Studio: aba Developer → Start Server (ligue "Enable CORS"). ' +
    'Ollama: rode com OLLAMA_ORIGINS="*" (ou a origem do site). ' +
    'Diga "hermes url <endereço>" pra apontar pra outra porta, ou "hermes status" pra testar.');
}

/**
 * Lista os modelos disponíveis no servidor local (GET /models).
 * @returns {Promise<string[]>} ids dos modelos
 */
export async function listHermesLocalModels(config) {
  const url = base(config);
  guardMixedContent(url);
  let res;
  try {
    res = await fetchTimeout(`${url}/models`, {}, 6000);
  } catch {
    throw erroServidorFora(url);
  }
  if (!res.ok) throw new Error(`Hermes local: HTTP ${res.status} em ${url}/models — a URL termina em /v1?`);
  const data = await res.json();
  return (data.data || []).map((m) => m.id).filter(Boolean);
}

/** Health check simples: alcançável + quantos modelos. */
export async function healthHermesLocal(config) {
  const models = await listHermesLocalModels(config);
  return { ok: true, url: base(config), models };
}

/**
 * Envia a conversa pro Hermes local e devolve o texto da resposta.
 * Aceita mensagens no formato do /jarvis ({role:'jarvis'|'user', text}) E no
 * do Núcleo ({role:'assistant'|'user', content}).
 * @returns {Promise<string>}
 */
export async function processHermesLocal(messages, config) {
  const url = base(config);
  guardMixedContent(url);

  const body = {
    model: (config && config.hermesLocalModel) || 'local',
    stream: false,
    messages: [
      { role: 'system', content: (config && config.systemPrompt) || '' },
      ...messages.map((m) => ({
        role: (m.role === 'jarvis' || m.role === 'assistant') ? 'assistant' : 'user',
        content: m.text != null ? m.text : (m.content || '')
      }))
    ]
  };

  let res;
  try {
    /* timeout largo: a 1ª chamada pode carregar o modelo na GPU/RAM. */
    res = await fetchTimeout(`${url}/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body)
    }, 120000);
  } catch (e) {
    if (e.message === 'timeout') {
      throw new Error('Hermes local demorou demais (2 min). O modelo pode estar carregando na 1ª chamada — tente de novo. Se persistir, veja o console do servidor local.');
    }
    throw erroServidorFora(url);
  }

  if (!res.ok) {
    let detail = `HTTP ${res.status}`;
    try {
      const err = await res.json();
      detail = err.error?.message || err.error || detail;
    } catch { /* corpo não-JSON */ }
    if (res.status === 404) detail += ` — confira se a URL base termina em /v1 (atual: ${url})`;
    throw new Error(`Hermes local: ${detail}`);
  }

  const data = await res.json();
  const texto = data.choices?.[0]?.message?.content;
  return (texto && texto.trim()) || '(resposta vazia)';
}
