import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getLastJarvisContextObservation,
  recordJarvisContextObservation,
  selectContextMessages,
} from '../src/utils/jarvis-context.js';
import { getToolSchemas, registerTool, unregisterTool } from '../src/utils/jarvis-tools.js';

function names(query) {
  return getToolSchemas({ query }).map((schema) => schema.name);
}

test('budget preserva a pergunta mais recente e sinaliza truncamento', () => {
  const result = selectContextMessages([
    { role: 'user', text: 'turno antigo '.repeat(500) },
    { role: 'jarvis', text: 'resposta antiga '.repeat(500) },
    { role: 'user', text: 'pergunta atual preservada' },
  ], { maxCharacters: 1_000, maxMessages: 3 });

  assert.equal(result.messages.at(-1)?.text, 'pergunta atual preservada');
  assert.equal(result.metrics.truncated, true);
  assert.ok(result.metrics.characters <= 1_000);
});

test('observação de contexto é bounded e não mantém campos livres', () => {
  recordJarvisContextObservation({
    mode: 'x'.repeat(100),
    messages: 4.8,
    characters: 8_000.9,
    truncated: true,
    preparationMs: 70_000,
  });
  assert.deepEqual(getLastJarvisContextObservation(), {
    mode: 'x'.repeat(32),
    messages: 4,
    characters: 8_000,
    truncated: true,
    preparationMs: 60_000,
  });
});

test('schemas completos continuam disponíveis e são cacheados por padrão', () => {
  const first = getToolSchemas();
  const second = getToolSchemas();
  assert.ok(first.length >= 13);
  assert.deepEqual(first.map((schema) => schema.name), second.map((schema) => schema.name));
  assert.ok(first.some((schema) => schema.name === 'create_skill'));
});

test('cache de schemas invalida quando ferramenta dinâmica muda', () => {
  const name = 'lazy_probe_tool';
  unregisterTool(name);
  assert.equal(registerTool({
    name,
    description: 'Ferramenta de teste local',
    input_schema: { type: 'object', properties: {} },
    run: () => ({ ok: true }),
  }), true);
  assert.ok(getToolSchemas().some((schema) => schema.name === name));
  assert.ok(getToolSchemas({ query: name }).some((schema) => schema.name === name));
  assert.equal(unregisterTool(name), true);
  assert.ok(!getToolSchemas().some((schema) => schema.name === name));
});

test('foco de arsenal mantém essenciais e seleciona somente domínio reconhecido', () => {
  const selected = names('procure um rifle no arsenal');
  assert.ok(selected.includes('navigate'));
  assert.ok(selected.includes('system_status'));
  assert.ok(selected.includes('read_site_state'));
  assert.ok(selected.includes('recall_memory'));
  assert.ok(selected.includes('search_arsenal'));
  assert.ok(!selected.includes('open_editor'));
});

test('foco desconhecido não reduz capacidade silenciosamente', () => {
  assert.deepEqual(names('pergunta sem domínio reconhecido'), getToolSchemas().map((schema) => schema.name));
});

test('foco de skills inclui skills dinâmicas e operações de aprendizagem', () => {
  const selected = names('aprenda uma nova habilidade');
  assert.ok(selected.includes('create_skill'));
  assert.ok(selected.includes('list_skills'));
  assert.ok(selected.includes('delete_skill'));
});
