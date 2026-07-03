/**
 * Núcleo de AGENTE independente de modelo (issue #310 / #231 — "Hermes agente
 * local, sem API").
 *
 * O modo "Agente" clássico (`processAgent`) usa o tool-use nativo da API do
 * Claude. Este núcleo faz o MESMO — loop ReAct com as ferramentas do JARVIS —
 * mas sobre QUALQUER "cérebro" de chat (função `brain`), falando o protocolo de
 * function-calling **nativo do Nous Hermes**: as ferramentas vão no sistema
 * dentro de `<tools>…</tools>` e o modelo emite `<tool_call>{…}</tool_call>`;
 * devolvemos o resultado em `<tool_response>{…}</tool_response>`.
 *
 * Assim o mesmo agente roda no **Hermes local do navegador (WebLLM)** e, no app,
 * no **motor embutido (llama.cpp/GGUF)** — zero API, zero chave. `brain` é só:
 *   async ({ system, messages }) => textoDoModelo
 * onde messages = [{ role:'user'|'assistant', content }].
 */

/* Prompt de sistema no formato Hermes function-calling + persona do Baluarte. */
function buildSystem(persona, tools) {
  const specs = tools.map((t) => ({
    name: t.name,
    description: t.description,
    parameters: t.input_schema || { type: 'object', properties: {} }
  }));
  return (
    (persona || 'Você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte Mark XIII. Responda em português, de forma clara e tática.') +
    '\n\nVocê é um modelo com CHAMADA DE FUNÇÕES. As funções disponíveis estão em <tools></tools>. ' +
    'Para consultar/agir no Baluarte, chame uma função emitindo um objeto JSON com "name" e "arguments" dentro de <tool_call></tool_call>. ' +
    'Não invente valores; se faltar dado, use uma função para obtê-lo. Depois que receber os <tool_response>, responda ao operador em português. ' +
    'Se não precisar de função, responda direto.\n' +
    '<tools>\n' + JSON.stringify(specs) + '\n</tools>\n' +
    'Formato de chamada (uma ou mais):\n<tool_call>\n{"name": "nome_da_funcao", "arguments": { }}\n</tool_call>'
  );
}

/* Extrai chamadas de ferramenta da saída do modelo. Tolerante: aceita
   <tool_call>…</tool_call>, cercas ```json e, em último caso, um JSON solto
   com {name, arguments}. */
function parseToolCalls(text) {
  const calls = [];
  const re = /<tool_call>\s*([\s\S]*?)\s*<\/tool_call>/g;
  let m;
  while ((m = re.exec(text)) !== null) {
    const obj = tryJson(m[1]);
    if (obj && obj.name) calls.push({ name: obj.name, arguments: normArgs(obj.arguments) });
  }
  if (calls.length) return calls;

  /* fallback: modelo pequeno pode emitir só o JSON (com/sem cerca) */
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (fenced ? fenced[1] : text).trim();
  if (raw.startsWith('{') && raw.includes('"name"')) {
    const obj = tryJson(raw);
    if (obj && obj.name && (obj.arguments !== undefined || obj.parameters !== undefined)) {
      return [{ name: obj.name, arguments: normArgs(obj.arguments ?? obj.parameters) }];
    }
  }
  return [];
}

function tryJson(s) {
  try { return JSON.parse(s); } catch { /* tenta limpar */ }
  try { return JSON.parse(s.replace(/,\s*([}\]])/g, '$1')); } catch { return null; }
}
function normArgs(a) {
  if (a == null) return {};
  if (typeof a === 'string') { const o = tryJson(a); return o && typeof o === 'object' ? o : {}; }
  return typeof a === 'object' ? a : {};
}

/* Remove qualquer resíduo de protocolo do texto final mostrado ao operador. */
function cleanFinal(text) {
  return String(text || '')
    .replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '')
    .replace(/<\/?tool_response>/g, '')
    .replace(/<\|im_(start|end)\|>/g, '')
    .trim();
}

/**
 * Roda o loop de agente sobre um cérebro de chat qualquer.
 * @param {object} o
 * @param {(a:{system:string,messages:Array})=>Promise<string>} o.brain  gera texto
 * @param {Array} o.tools   schemas {name, description, input_schema}
 * @param {(name:string,args:object)=>any} o.exec   executa a ferramenta (runTool)
 * @param {string} o.persona  persona base (systemPrompt do JARVIS)
 * @param {Array<{role:string,content:string}>} o.messages  conversa (user/assistant)
 * @param {(name:string,args:object,result:any)=>void} [o.onToolCall]
 * @param {(turn:number)=>void} [o.onTurn]  aviso de "pensando" por turno
 * @param {number} [o.maxTurns=6]
 * @returns {Promise<string>} resposta final em texto
 */
export async function runLocalAgent({ brain, tools, exec, persona, messages, onToolCall, onTurn, maxTurns = 6 }) {
  const system = buildSystem(persona, tools);
  const convo = messages.map((m) => ({
    role: m.role === 'assistant' || m.role === 'jarvis' ? 'assistant' : 'user',
    content: m.content != null ? m.content : m.text
  }));

  let finalText = '';
  for (let turn = 0; turn < maxTurns; turn++) {
    if (onTurn) { try { onTurn(turn); } catch { /* ui */ } }
    const out = await brain({ system, messages: convo });
    const calls = parseToolCalls(out);

    if (!calls.length) {
      finalText = cleanFinal(out);
      return finalText || '(sem resposta)';
    }

    /* registra a fala do assistente (com as tool_calls) e executa cada uma */
    convo.push({ role: 'assistant', content: out });
    const responses = [];
    for (const c of calls) {
      let result;
      try { result = exec(c.name, c.arguments); }
      catch (e) { result = { ok: false, error: e.message }; }
      if (onToolCall) { try { onToolCall(c.name, c.arguments, result); } catch { /* ui */ } }
      responses.push(`<tool_response>\n${JSON.stringify({ name: c.name, content: result })}\n</tool_response>`);
    }
    convo.push({ role: 'user', content: responses.join('\n') });
    finalText = cleanFinal(out);
  }
  return finalText || '(limite de turnos do agente atingido)';
}

/* Exporta os helpers pra teste. */
export const _internal = { parseToolCalls, cleanFinal, buildSystem };
