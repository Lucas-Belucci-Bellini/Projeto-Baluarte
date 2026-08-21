import assert from 'node:assert/strict';
import test from 'node:test';
import { observeServerClaims } from '../src/layout/server-claims-observation.ts';
import {
  OPENCLAW_MAX_MESSAGES,
  OPENCLAW_MAX_PAYLOAD_BYTES,
  preflightOpenClawServerRequest,
} from '../src/security/openclaw-server-policy.ts';

const NOW = 1_700_000_000_000;

function freshClaims(scopes = ['platform:observe']) {
  return observeServerClaims({
    issuer: 'https://auth.example',
    subject: 'subject-local-test',
    audience: 'baluarte',
    scopes,
    issuedAt: NOW - 1_000,
    expiresAt: NOW + 30_000,
    requestId: 'request-local-test',
    source: 'server-validated',
    authenticated: true,
  }, {
    expectedIssuer: 'https://auth.example',
    expectedAudience: 'baluarte',
    nowMs: NOW,
  });
}

test('claims ausentes são negadas sem efeito de rede', () => {
  const decision = preflightOpenClawServerRequest(null, {
    operation: 'chat',
    messageCount: 1,
    payloadBytes: 128,
  });
  assert.equal(decision.decision, 'denied');
  assert.ok(decision.reasons.includes('claims-missing'));
  assert.equal(decision.authority, 'not-authorized');
  assert.equal(decision.publicPromotionAllowed, false);
});

test('claims frescas com scopes atuais não liberam OpenClaw', () => {
  const decision = preflightOpenClawServerRequest(freshClaims(), {
    operation: 'chat',
    messageCount: 2,
    payloadBytes: 512,
  }, { runtimeAuthority: 'authorized' });
  assert.equal(decision.decision, 'not-ready');
  assert.ok(decision.reasons.includes('scope-missing'));
  assert.ok(decision.reasons.includes('policy-not-configured'));
  assert.equal(decision.reasons.includes('operation-not-allowed'), false);
});

test('claims inválidas e expiradas permanecem negadas', () => {
  const claims = observeServerClaims({
    issuer: 'https://auth.example',
    subject: 'subject-local-test',
    audience: 'baluarte',
    scopes: ['module:read'],
    issuedAt: NOW - 120_000,
    expiresAt: NOW - 60_000,
    source: 'client-observed',
    authenticated: true,
  }, {
    expectedIssuer: 'https://auth.example',
    expectedAudience: 'baluarte',
    nowMs: NOW,
  });
  const decision = preflightOpenClawServerRequest(claims, {
    operation: 'chat',
    messageCount: 1,
    payloadBytes: 256,
  });
  assert.equal(decision.decision, 'denied');
  assert.ok(decision.reasons.includes('claims-untrusted'));
  assert.ok(decision.reasons.includes('claims-stale'));
});

test('operações e tool calls não podem passar pelo preflight', () => {
  const claims = freshClaims();
  for (const operation of ['tool-call', 'webhook', 'external-action', 'unknown']) {
    const decision = preflightOpenClawServerRequest(claims, {
      operation,
      messageCount: 1,
      payloadBytes: 256,
      hasToolCalls: operation === 'tool-call',
    });
    assert.equal(decision.decision, 'denied');
    assert.ok(decision.reasons.includes('operation-not-allowed'));
  }
});

test('limites de payload e mensagens são bounded e negados', () => {
  const decision = preflightOpenClawServerRequest(freshClaims(), {
    operation: 'chat',
    messageCount: OPENCLAW_MAX_MESSAGES + 1,
    payloadBytes: OPENCLAW_MAX_PAYLOAD_BYTES + 1,
  });
  assert.equal(decision.decision, 'denied');
  assert.ok(decision.reasons.includes('message-count-invalid'));
  assert.ok(decision.reasons.includes('payload-too-large'));
  assert.equal(decision.summary.messageCount, OPENCLAW_MAX_MESSAGES);
  assert.equal(decision.summary.payloadBytes, OPENCLAW_MAX_PAYLOAD_BYTES);
});

test('saída não expõe subject, issuer, token, prompt ou URL', () => {
  const secret = 'token-super-secreto-prompt-privado';
  const decision = preflightOpenClawServerRequest(freshClaims(), {
    operation: 'chat',
    messageCount: 1,
    payloadBytes: 128,
  });
  const serialized = JSON.stringify(decision);
  assert.equal(serialized.includes(secret), false);
  assert.equal(serialized.includes('subject-local-test'), false);
  assert.equal(serialized.includes('auth.example'), false);
  assert.equal(serialized.includes('openclaw:chat'), false);
  assert.deepEqual(Object.keys(decision.summary).sort(), ['hasToolCalls', 'messageCount', 'payloadBytes']);
  assert.equal(decision.authority, 'not-authorized');
  assert.equal(decision.publicPromotionAllowed, false);
});
