/**
 * JARVIS Council — várias IAs trabalhando juntas, compartilhando a memória.
 *
 * Faz a mesma pergunta a vários "membros" (JARVIS Local, Gemini, Hermes no
 * navegador/servidor, Claude no servidor, OpenClaw), todos com o MESMO contexto
 * (dossiê + memória durável + estado do site), e sintetiza um consenso.
 *
 * Sintetizador (resposta final): o HERMES é o moderador — primeiro o modelo no
 * navegador (sem limites), depois o Hermes servidor; o Claude (servidor) e o
 * Gemini ficam de reserva (o Gemini costuma estourar o limite de tokens). Se um
 * membro não responde por limite, o moderador é avisado e diz isso. O resultado
 * volta para a memória.
 */

import { loadConfig, processLocal, processServer, processHermes, processClaudeServer, processOpenClaw, getBaluarteBriefing } from './jarvis-engine.js';
import { processWebLLM, getLoadedModel } from './jarvis-webllm.js';
import { memoryContext, captureConversation, addMemory } from './jarvis-brain.js';
import { getStatusText } from './baluarte-status.js';

/** Contexto comum a todos os membros — é aqui que eles "compartilham a memória". */
function sharedContext(question) {
  let mem = '';
  try { mem = memoryContext(question); } catch { /* ok */ }
  let status = '';
  try { status = getStatusText(); } catch { /* ok */ }
  return [
    getBaluarteBriefing(),
    mem,
    status ? '## ESTADO ATUAL DO SITE (somente leitura)\n' + status : ''
  ].filter(Boolean).join('\n\n');
}

/** Detecta erro/limite de tokens e devolve mensagem limpa em vez do erro cru. */
function memberResult(reply) {
  const r = String(reply || '').trim();
  if (!r) return { text: '(sem resposta)', ok: false };
  if (/429|RESOURCE_EXHAUSTED|quota|rate.?limit|exceeded|too many requests/i.test(r)) {
    return { text: '⚠ Limite de tokens atingido — não conseguiu responder.', ok: false, rateLimited: true };
  }
  if (r.startsWith('[')) return { text: '⚠ Indisponível.', ok: false };
  if (r.startsWith('(')) return { text: r, ok: false };
  return { text: r, ok: true };
}

const SYNTH_SYS =
  'Você é o MODERADOR de um conselho de IAs do Projeto Baluarte (de preferência o Nous Hermes). '
  + 'Sintetize UMA resposta final consensual, aproveitando o melhor de cada membro e apontando '
  + 'concordâncias e divergências relevantes. Se algum membro NÃO respondeu (ex.: o Gemini por '
  + 'limite de tokens), diga isso explicitamente em uma linha. Seja direto; não repita as respostas na íntegra.';

const isBad = (r) => !r || typeof r !== 'string' || !r.trim()
  || r.startsWith('[') || r.startsWith('(') || /429|RESOURCE_EXHAUSTED|quota|exceeded/i.test(r);

/** Sintetizador: Hermes (navegador → servidor) primeiro; Claude e Gemini de reserva. */
async function synthesize(question, body, cfg) {
  const msg = [{ role: 'user', text: `Pergunta do operador:\n${question}\n\n${body}` }];

  const loaded = getLoadedModel();
  if (loaded) {
    try { const r = await processWebLLM(msg, { webllmModel: loaded, systemPrompt: SYNTH_SYS }); if (!isBad(r)) return { text: r, by: 'Hermes (navegador)' }; } catch { /* segue */ }
  }
  try { const r = await processHermes(msg, { ...cfg, systemPrompt: SYNTH_SYS }); if (!isBad(r)) return { text: r, by: 'Hermes (servidor)' }; } catch { /* segue */ }
  try { const r = await processClaudeServer(msg, { ...cfg, systemPrompt: SYNTH_SYS }); if (!isBad(r)) return { text: r, by: 'Claude (reserva)' }; } catch { /* segue */ }
  try { const r = await processServer(msg, { ...cfg, systemPrompt: SYNTH_SYS }); if (!isBad(r)) return { text: r, by: 'Gemini (reserva)' }; } catch { /* segue */ }
  return null;
}

/**
 * Roda o conselho.
 * @param {string} question
 * @param {{onMember?:(m)=>void}} cbs
 * @returns {Promise<{members:Array, consensus:string, synthesizedBy:string}>}
 */
export async function runCouncil(question, { onMember } = {}) {
  const ctx = sharedContext(question);
  const cfg = loadConfig();
  const base = (cfg && cfg.systemPrompt) || 'Você é o J.A.R.V.I.S. do Projeto Baluarte. Seja direto e técnico.';
  const members = [];
  const announce = (m) => { members.push(m); if (onMember) onMember(m); return m; };
  const memberSys = (papel) => `${base}\n\n${ctx}\n\nVocê é um MEMBRO do conselho de IAs do Baluarte${papel ? ' (' + papel + ')' : ''}. Dê sua própria resposta, fundamentada.`;

  /* Membro 1 — JARVIS Local (instantâneo, fundamentado nos dados do site) */
  try {
    const r = processLocal(question);
    announce({ id: 'local', name: 'JARVIS Local', text: r.text || '', ok: true });
  } catch {
    announce({ id: 'local', name: 'JARVIS Local', text: '(falhou)', ok: false });
  }

  const tasks = [];

  /* Membro 2 — Gemini (servidor/web) */
  tasks.push((async () => {
    try {
      const reply = await processServer([{ role: 'user', text: question }], { ...cfg, systemPrompt: memberSys() });
      const r = memberResult(reply);
      announce({ id: 'gemini', name: 'Gemini (web)', text: r.text, ok: r.ok, rateLimited: r.rateLimited });
    } catch {
      announce({ id: 'gemini', name: 'Gemini (web)', text: '⚠ Indisponível.', ok: false });
    }
  })());

  /* Membro 3 — Hermes no Navegador (se um modelo estiver carregado) */
  const loaded = getLoadedModel();
  if (loaded) {
    tasks.push((async () => {
      try {
        const reply = await processWebLLM([{ role: 'user', text: question }], { webllmModel: loaded, systemPrompt: memberSys('modelo no navegador') });
        const r = memberResult(reply);
        announce({ id: 'webllm', name: 'Navegador · ' + loaded.split('-')[0], text: r.text, ok: r.ok });
      } catch {
        announce({ id: 'webllm', name: 'Navegador', text: '⚠ Indisponível.', ok: false });
      }
    })());
  }

  /* Membro 4 — Hermes (servidor): Nous Hermes via Vercel→OpenRouter */
  tasks.push((async () => {
    try {
      const reply = await processHermes([{ role: 'user', text: question }], { ...cfg, systemPrompt: memberSys('modelo Nous Hermes') });
      const r = memberResult(reply);
      announce({ id: 'hermes', name: 'Hermes (servidor)', text: r.text, ok: r.ok, rateLimited: r.rateLimited });
    } catch {
      announce({ id: 'hermes', name: 'Hermes (servidor)', text: '⚠ Indisponível.', ok: false });
    }
  })());

  /* Membro 5 — Claude (servidor): Anthropic via /api/claude, chave na Vercel
   * (issue #200). Sem chave, o endpoint responde "[...]" → "⚠ Indisponível." */
  tasks.push((async () => {
    try {
      const reply = await processClaudeServer([{ role: 'user', text: question }], { ...cfg, systemPrompt: memberSys('modelo Claude da Anthropic') });
      const r = memberResult(reply);
      announce({ id: 'claude-servidor', name: 'Claude (servidor)', text: r.text, ok: r.ok, rateLimited: r.rateLimited });
    } catch {
      announce({ id: 'claude-servidor', name: 'Claude (servidor)', text: '⚠ Indisponível.', ok: false });
    }
  })());

  /* Membro 6 — OpenClaw (self-hosted): só entra se a URL estiver configurada. */
  if (cfg && cfg.openclawUrl) {
    tasks.push((async () => {
      try {
        const reply = await processOpenClaw([{ role: 'user', text: question }], { ...cfg, systemPrompt: memberSys('assistente OpenClaw') });
        const r = memberResult(reply);
        announce({ id: 'openclaw', name: 'OpenClaw', text: r.text, ok: r.ok });
      } catch {
        announce({ id: 'openclaw', name: 'OpenClaw', text: '⚠ Indisponível.', ok: false });
      }
    })());
  }

  await Promise.all(tasks);

  /* ===== Síntese — o HERMES é o moderador (Gemini só de reserva) ===== */
  const usable = members.filter((m) => m.ok && m.text);
  const failed = members.filter((m) => !m.ok);
  const rateNote = failed.some((f) => f.rateLimited)
    ? '\n\n⚠ O Gemini não respondeu (limite de tokens atingido).' : '';
  let consensus = '';
  let synthesizedBy = '';
  if (usable.length === 0) {
    consensus = 'Nenhum membro conseguiu responder agora.' + rateNote;
  } else if (usable.length === 1) {
    consensus = usable[0].text + rateNote;
  } else {
    const body = 'Respostas dos membros do conselho:\n\n'
      + usable.map((m) => `### ${m.name}\n${m.text}`).join('\n\n')
      + (failed.length ? '\n\n## Membros que NÃO responderam\n' + failed.map((m) => `- ${m.name}${m.rateLimited ? ': limite de tokens atingido' : ''}`).join('\n') : '');
    const syn = await synthesize(question, body, cfg);
    if (syn) { consensus = syn.text; synthesizedBy = syn.by; }
    else { consensus = usable.map((m) => `• ${m.name}: ${m.text}`).join('\n\n') + rateNote; }
  }

  /* O conselho joga TUDO na memória compartilhada: pergunta + respostas geradas
   * em texto INTEGRAL (coleta bruta, issue #190) — só com teto de segurança. */
  const trim = (t) => String(t || '').trim().slice(0, 4000);
  const qShort = question.replace(/\s+/g, ' ').trim().slice(0, 80);
  try { captureConversation(question); } catch { /* ok */ }
  try {
    for (const m of usable) addMemory({ text: `Conselho — ${m.name} sobre "${qShort}": ${trim(m.text)}`, source: 'conselho' });
    if (consensus) addMemory({ text: `Conselho — consenso sobre "${qShort}": ${trim(consensus)}`, source: 'conselho' });
  } catch { /* memória é best-effort */ }

  return { members, consensus, synthesizedBy };
}
