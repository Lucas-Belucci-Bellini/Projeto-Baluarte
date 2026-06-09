/**
 * JARVIS Council — várias IAs trabalhando juntas, compartilhando a memória.
 *
 * Faz a mesma pergunta a vários "membros" (JARVIS Local, Gemini/servidor e o
 * modelo do Navegador/Hermes se estiver carregado), cada um recebendo o MESMO
 * contexto compartilhado (dossiê + memória durável + estado vivo do site), e
 * depois sintetiza uma resposta de consenso. O resultado volta para a memória,
 * então o conselho também alimenta o cérebro comum.
 */

import { loadConfig, processLocal, processServer, processHermes, getBaluarteBriefing } from './jarvis-engine.js';
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

/**
 * Roda o conselho.
 * @param {string} question
 * @param {{onMember?:(m)=>void}} cbs  chamado a cada membro que responde
 * @returns {Promise<{members:Array, consensus:string}>}
 */
export async function runCouncil(question, { onMember } = {}) {
  const ctx = sharedContext(question);
  const cfg = loadConfig();
  const base = (cfg && cfg.systemPrompt) || 'Você é o J.A.R.V.I.S. do Projeto Baluarte. Seja direto e técnico.';
  const members = [];
  const announce = (m) => { members.push(m); if (onMember) onMember(m); return m; };

  /* Membro 1 — JARVIS Local (instantâneo, fundamentado nos dados do site) */
  try {
    const r = processLocal(question);
    announce({ id: 'local', name: 'JARVIS Local', text: r.text || '', ok: true });
  } catch {
    announce({ id: 'local', name: 'JARVIS Local', text: '(falhou)', ok: false });
  }

  /* Membros assíncronos (em paralelo) */
  const tasks = [];

  /* Membro 2 — Gemini (servidor), com web + contexto compartilhado */
  tasks.push((async () => {
    try {
      const reply = await processServer(
        [{ role: 'user', text: question }],
        { ...cfg, systemPrompt: `${base}\n\n${ctx}\n\nVocê é um MEMBRO do conselho de IAs. Dê sua própria resposta, fundamentada. Outros membros responderão em paralelo.` }
      );
      announce({ id: 'gemini', name: 'Gemini (web)', text: reply, ok: true });
    } catch {
      announce({ id: 'gemini', name: 'Gemini (web)', text: '(servidor indisponível)', ok: false });
    }
  })());

  /* Membro 3 — Navegador/Hermes, só se um modelo já estiver carregado */
  const loaded = getLoadedModel();
  if (loaded) {
    tasks.push((async () => {
      try {
        const reply = await processWebLLM(
          [{ role: 'user', text: question }],
          { webllmModel: loaded, systemPrompt: `${base}\n\n${ctx}\n\nVocê é um MEMBRO do conselho de IAs do Baluarte.` }
        );
        announce({ id: 'webllm', name: 'Navegador · ' + loaded.split('-')[0], text: reply, ok: true });
      } catch {
        announce({ id: 'webllm', name: 'Navegador', text: '(falhou)', ok: false });
      }
    })());
  }

  /* Membro 4 — Hermes (servidor): Nous Hermes via Vercel→OpenRouter (qualquer device) */
  tasks.push((async () => {
    try {
      const reply = await processHermes(
        [{ role: 'user', text: question }],
        { ...cfg, systemPrompt: `${base}\n\n${ctx}\n\nVocê é um MEMBRO do conselho de IAs do Baluarte (modelo Nous Hermes).` }
      );
      const ok = !!reply && !reply.startsWith('[') && !reply.startsWith('(');
      announce({ id: 'hermes', name: 'Hermes (servidor)', text: reply, ok });
    } catch {
      announce({ id: 'hermes', name: 'Hermes (servidor)', text: '(indisponível)', ok: false });
    }
  })());

  await Promise.all(tasks);

  /* Síntese — o moderador (Gemini) combina o melhor de cada membro */
  const usable = members.filter((m) => m.ok && m.text && !m.text.startsWith('(') && !m.text.startsWith('['));
  let consensus = '';
  if (usable.length <= 1) {
    consensus = usable[0]?.text || 'Nenhum membro respondeu.';
  } else {
    const body = usable.map((m) => `### ${m.name}\n${m.text}`).join('\n\n');
    try {
      consensus = await processServer(
        [{ role: 'user', text: `Pergunta do operador:\n${question}\n\nRespostas dos membros do conselho:\n\n${body}` }],
        { ...cfg, systemPrompt: 'Você é o MODERADOR de um conselho de IAs do Projeto Baluarte. Sintetize UMA resposta final consensual, aproveitando o melhor de cada membro e apontando concordâncias e divergências relevantes. Seja direto e objetivo; não repita as respostas na íntegra.' }
      );
    } catch {
      consensus = usable.map((m) => `• ${m.name}: ${m.text}`).join('\n\n');
    }
  }

  /* O conselho joga TUDO na memória compartilhada: a pergunta E as respostas
   * geradas (cada membro + o consenso), ligadas ao Cérebro e ao Raio-X. */
  const trim = (t) => String(t || '')
    .replace(/```[\s\S]*?```/g, ' [código] ')
    .replace(/\s+/g, ' ').trim().slice(0, 400);
  const qShort = question.replace(/\s+/g, ' ').trim().slice(0, 80);
  try { captureConversation(question); } catch { /* ok */ }
  try {
    for (const m of usable) {
      addMemory({ text: `Conselho — ${m.name} sobre "${qShort}": ${trim(m.text)}`, source: 'conselho' });
    }
    if (consensus) {
      addMemory({ text: `Conselho — consenso sobre "${qShort}": ${trim(consensus)}`, source: 'conselho' });
    }
  } catch { /* memória é best-effort */ }

  return { members, consensus };
}
