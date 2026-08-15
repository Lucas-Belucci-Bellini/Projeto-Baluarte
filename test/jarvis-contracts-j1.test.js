import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  SESSION_MODES,
  hasSecretLikeKey,
  isConversationRequest,
  isJarvisMessage,
  isJarvisPublicConfig,
  isJarvisSession,
  isSessionMode,
} from '../src/utils/jarvis-contracts.ts';
import {
  createFakeAdapter,
  createFakeAdapters,
  textFromAdapterEvents,
} from '../src/utils/jarvis-contracts-fakes.ts';

const config = {
  mode: 'local',
  systemPrompt: 'teste',
  memoryOn: false,
  humanize: false,
  skillsOn: false,
};
const session = {
  id: 's-1',
  title: 'Sessão J1',
  mode: 'local',
  createdAt: 100,
  updatedAt: 100,
};
const message = {
  id: 'm-1',
  sessionId: 's-1',
  role: 'user',
  text: 'olá',
  ts: 100,
};

void SESSION_MODES;

test('J1 aceita todos os modos oficiais e rejeita modo desconhecido', () => {
  for (const mode of SESSION_MODES) assert.equal(isSessionMode(mode), true);
  assert.equal(isSessionMode('modo-inventado'), false);
  assert.equal(isSessionMode(null), false);
});

test('J1 valida mensagem, sessão, configuração e request completos', () => {
  assert.equal(isJarvisMessage(message), true);
  assert.equal(isJarvisSession(session), true);
  assert.equal(isJarvisPublicConfig(config), true);
  assert.equal(isConversationRequest({ text: 'olá', session, messages: [message], config, context: {} }), true);
});

test('J1 rejeita payloads incompletos ou roles inválidas', () => {
  assert.equal(isJarvisMessage({ ...message, role: 'operator' }), false);
  assert.equal(isJarvisMessage({ ...message, ts: Number.NaN }), false);
  assert.equal(isJarvisSession({ ...session, mode: 'desconhecido' }), false);
  assert.equal(isJarvisPublicConfig({ ...config, memoryOn: 'yes' }), false);
  assert.equal(isConversationRequest({ text: 'x', session, messages: [{ ...message, role: 'operator' }], config, context: {} }), false);
});

test('J1 identifica chaves com aparência de segredo fora do contrato público', () => {
  assert.equal(hasSecretLikeKey({ openclawToken: 'não persistir' }), true);
  assert.equal(hasSecretLikeKey({ mode: 'local', model: 'fake' }), false);
});

test('fake J1 produz progresso, tool call, tokens e resposta determinística', async () => {
  const events = await createFakeAdapter({
    mode: 'agente',
    reply: 'resposta determinística',
    progress: [0.25, 1],
    toolCall: { name: 'system_status', input: {}, permission: 'sistema.diagnostico', result: { ok: true, text: 'ok' } },
  }).converse({ text: 'teste', session, messages: [message], config: { ...config, mode: 'agente' }, context: {} });
  assert.deepEqual(events.filter((event) => event.kind === 'progress').map((event) => event.progress), [0.25, 1]);
  assert.equal(events.some((event) => event.kind === 'tool-call'), true);
  assert.equal(textFromAdapterEvents(events), 'resposta determinística');
});

test('fake J1 mantém falha de permissão como evento estruturado', async () => {
  const events = await createFakeAdapter({ mode: 'openclaw', failure: { reason: 'permission', error: 'envio bloqueado' } }).converse({ text: 'não enviar', session, messages: [message], config: { ...config, mode: 'openclaw' }, context: {} });
  assert.deepEqual(events, [{ kind: 'failure', reason: 'permission', error: 'envio bloqueado' }]);
});

test('fake J1 transforma abort em timeout e não acessa rede', async () => {
  const controller = new AbortController();
  controller.abort();
  const events = await createFakeAdapter({ mode: 'hermes', delayMs: 10 }).converse({ text: 'teste', session, messages: [message], config: { ...config, mode: 'hermes' }, context: {} }, controller.signal);
  assert.equal(events[0]?.kind, 'failure');
  assert.equal(events[0]?.reason, 'timeout');
});

test('J1 cria um adapter fake para cada modo oficial', () => {
  assert.equal(createFakeAdapters().size, SESSION_MODES.length);
});
