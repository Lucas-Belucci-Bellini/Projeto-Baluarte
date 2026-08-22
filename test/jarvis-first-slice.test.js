import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { getBaluarteBriefing, selectContextMessages } from '../src/utils/jarvis-context.js';
import { buildNewsBriefingPrompt, deduplicateNews, normalizeNewsItem } from '../src/utils/news-briefing.js';
import { createOpenClawBridge } from '../scripts/openclaw-bridge.mjs';
import briefing from '../v2/modules/briefing/module.js';
import evidence from '../v2/modules/evidence/module.js';
import { criarRegistry } from '../v2/core/registry.js';
import { criarVerticalSlice } from '../v2/core/vertical-slice.js';

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address())));
}

function close(server) {
  return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
}

test('contexto do JARVIS é cacheado e possui variante compacta', () => {
  const fullA = getBaluarteBriefing();
  const fullB = getBaluarteBriefing();
  const compact = getBaluarteBriefing({ compact: true });
  assert.equal(fullA, fullB);
  assert.ok(compact.length < fullA.length);
  assert.match(fullA, /DOSSIÊ DO BALUARTE/);
});

test('janela de contexto limita mensagens e caracteres', () => {
  const result = selectContextMessages([
    { role: 'user', text: 'primeira mensagem' },
    { role: 'jarvis', text: 'resposta longa '.repeat(30) },
    { role: 'user', text: 'última pergunta' },
  ], { maxCharacters: 1000, maxMessages: 2 });
  assert.equal(result.metrics.messages, 2);
  assert.ok(result.metrics.characters <= 1000);
  assert.equal(result.metrics.truncated, true);
});

test('camada de notícias rejeita item sem fonte/URL e deduplica candidatos', () => {
  assert.equal(normalizeNewsItem({ title: 'sem fonte', url: 'https://example.com' }), null);
  const first = normalizeNewsItem({ source: 'Fonte A', url: 'https://example.com/a', title: 'Título A', publishedAt: '2026-08-14T12:00:00Z' }, '2026-08-14T13:00:00Z');
  const second = normalizeNewsItem({ source: 'Fonte A', url: 'https://example.com/a', title: 'Título A', publishedAt: '2026-08-14T12:00:00Z' }, '2026-08-14T13:00:00Z');
  assert.ok(first);
  assert.ok(second);
  assert.equal(deduplicateNews([first, second]).length, 1);
  assert.match(buildNewsBriefingPrompt({ topic: 'segurança', limit: 4 }), /não envie mensagens/i);
});

test('bridge OpenClaw encaminha chat para upstream fake e bloqueia origem externa', async () => {
  let received = null;
  const upstream = http.createServer((request, response) => {
    let body = '';
    request.on('data', (chunk) => { body += chunk; });
    request.on('end', () => {
      received = JSON.parse(body);
      response.setHeader('content-type', 'application/json');
      response.end(JSON.stringify({ choices: [{ message: { content: 'resposta fake' } }] }));
    });
  });
  const upstreamAddress = await listen(upstream);
  const bridge = createOpenClawBridge({ gatewayUrl: `http://127.0.0.1:${upstreamAddress.port}`, timeoutMs: 2000 });
  const bridgeAddress = await bridge.listen(0);
  try {
    const health = await fetch(`http://127.0.0.1:${bridgeAddress.port}/health`);
    assert.equal(health.status, 200);
    const response = await fetch(`http://127.0.0.1:${bridgeAddress.port}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'http://localhost:5173' },
      body: JSON.stringify({ messages: [{ role: 'user', content: 'teste' }] }),
    });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).choices[0].message.content, 'resposta fake');
    assert.equal(received.messages[0].content, 'teste');
    const blocked = await fetch(`http://127.0.0.1:${bridgeAddress.port}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
      body: JSON.stringify({ messages: [] }),
    });
    assert.equal(blocked.status, 403);
  } finally {
    await bridge.close();
    await close(upstream);
  }
});

test('manifesto briefing entra no Registry e vertical slice abre/fecha Runtime', async () => {
  const registry = criarRegistry();
  assert.equal(registry.registrar(briefing), true);
  const selo = registry.selar();
  assert.equal(selo.ok, true);
  assert.deepEqual(registry.listar(), ['briefing']);
  const opened = [];
  const closed = [];
  const runtime = {
    abrir: async (_registry, _permissions, id) => { opened.push(id); },
    fechar: async (id) => { closed.push(id); },
  };
  const slice = criarVerticalSlice(registry, {}, runtime);
  await slice.iniciar('briefing');
  assert.equal(slice.estado('briefing'), 'running');
  await slice.parar('briefing');
  assert.equal(slice.estado('briefing'), 'stopped');
  assert.deepEqual(opened, ['briefing']);
  assert.deepEqual(closed, ['briefing']);
});


test('Briefing liga candidatos novos à Evidence compartilhada sem duplicar o store', () => {
  const stored = new Map();
  const events = [];
  const metrics = [];
  evidence.lifecycle.init({ log: { debug: () => {} } });
  briefing.lifecycle.init({
    storage: {
      get: (key, fallback) => stored.has(key) ? stored.get(key) : fallback,
      set: (key, value) => stored.set(key, value),
    },
    log: {
      info: () => {},
      aviso: () => {},
      erro: () => {},
    },
    metricas: { contar: (name, fields) => metrics.push({ name, fields }) },
    bus: { emit: (event, payload) => events.push({ event, payload }) },
    evidence: evidence.api,
  });

  const item = {
    source: 'Fonte de teste',
    url: 'https://example.test/briefing/1',
    title: 'Notícia de teste com proveniência',
    publishedAt: '2026-08-20T10:00:00.000Z',
    capturedAt: '2026-08-20T10:05:00.000Z',
    language: 'pt-BR',
    topics: ['v2'],
    summary: 'Resumo local para o teste.',
    confidence: 0.9,
  };
  const result = briefing.api.ingest([item, item]);

  assert.equal(result.ok, true);
  assert.equal(result.total, 1);
  assert.equal(result.evidenceLinked, 1);
  assert.equal(result.evidenceErrors, 0);
  const linkedEvidence = evidence.api.listByModule('briefing')[0];
  assert.equal(evidence.api.listByModule('briefing').length, 1);
  assert.equal(linkedEvidence?.claimKey, `briefing:${result.items[0].id}:article`);
  assert.equal(linkedEvidence?.moduleId, 'briefing');
  assert.deepEqual(events, [
    { event: 'briefing:atualizado', payload: { total: 1, evidenceLinked: 1, evidenceErrors: 0 } },
  ]);
  assert.equal(metrics[0].name, 'briefing_ingestao');
  assert.deepEqual(briefing.api.health(), {
    ok: true,
    status: 'ready',
    items: 1,
    evidence: 'linked',
    evidenceLinked: 1,
    evidenceErrors: 0,
  });
  briefing.lifecycle.dispose();
  evidence.lifecycle.dispose();
});


test('Briefing permanece utilizável sem Evidence e sinaliza a capacidade ausente', () => {
  const stored = new Map();
  briefing.lifecycle.init({
    storage: {
      get: (key, fallback) => stored.has(key) ? stored.get(key) : fallback,
      set: (key, value) => stored.set(key, value),
    },
    log: { info: () => {}, aviso: () => {}, erro: () => {} },
  });
  const result = briefing.api.ingest([{
    source: 'Fonte local',
    url: 'https://example.test/briefing/fallback',
    title: 'Candidato sem Evidence ativa',
  }]);
  assert.equal(result.ok, true);
  assert.equal(result.evidenceLinked, 0);
  assert.equal(result.evidenceErrors, 0);
  assert.equal(briefing.api.health().evidence, 'not-configured');
  briefing.lifecycle.dispose();
});
