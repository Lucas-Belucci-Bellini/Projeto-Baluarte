import test from 'node:test';
import assert from 'node:assert/strict';
import { BillingPersistenceError } from '../../v2/data/billing-driver.ts';
import { BillingHttpWriteDriver } from '../../v2/data/billing-http-write-driver.ts';

const options = {
  baseUrl: 'https://billing-staging.example.test',
  apiKey: 'server-api-key',
  accessToken: 'server-access-token',
  principalUserId: 'user-1',
  timeoutMs: 100,
};

const request = {
  id: 'usage-1',
  idempotencyKey: 'request-1',
  accountId: 'account-1',
  workspaceId: 'workspace-1',
  feature: 'JARVIS_MESSAGES_PER_MONTH',
  quantity: 2,
  timestamp: '2026-08-19T00:00:00.000Z',
  source: 'test',
  metadata: { region: 'br' },
  actorUserId: 'user-1',
};

const responseRow = {
  id: 'usage-remote-1',
  idempotency_key: 'request-1',
  account_id: 'account-1',
  workspace_id: 'workspace-1',
  feature: 'JARVIS_MESSAGES_PER_MONTH',
  quantity: 2,
  occurred_at: '2026-08-19T00:00:00.000Z',
  source: 'test',
  metadata: { region: 'br' },
};

function response(status, payload) {
  return { status, async json() { return payload; } };
}

function transportFixture(handler) {
  const calls = [];
  return {
    calls,
    transport: {
      async request(url, init) {
        calls.push({ url, init });
        return handler(url, init, calls.length);
      },
    },
  };
}

test('writes usage server-side with a redacted, scoped PostgREST request', async () => {
  const fixture = transportFixture(async () => response(201, [responseRow]));
  const driver = new BillingHttpWriteDriver({ ...options, transport: fixture.transport });
  const result = await driver.appendUsage(request);
  assert.equal(result.id, 'usage-remote-1');
  assert.equal(fixture.calls.length, 1);
  assert.equal(fixture.calls[0].url, 'https://billing-staging.example.test/rest/v1/usage_events');
  assert.equal(fixture.calls[0].init.method, 'POST');
  assert.equal(fixture.calls[0].init.headers['Content-Profile'], 'billing');
  assert.equal(fixture.calls[0].init.headers.Prefer, 'return=representation');
  assert.deepEqual(JSON.parse(fixture.calls[0].init.body), {
    account_id: 'account-1',
    workspace_id: 'workspace-1',
    feature: 'JARVIS_MESSAGES_PER_MONTH',
    quantity: 2,
    idempotency_key: 'request-1',
    occurred_at: '2026-08-19T00:00:00.000Z',
    source: 'test',
    metadata: { region: 'br' },
  });
  assert.doesNotMatch(fixture.calls[0].url, /server-api-key|server-access-token/);
});

test('rejects a different actor before any network request', async () => {
  const fixture = transportFixture(async () => response(201, [responseRow]));
  const driver = new BillingHttpWriteDriver({ ...options, transport: fixture.transport });
  await assert.rejects(
    () => driver.appendUsage({ ...request, actorUserId: 'outsider' }),
    (error) => error instanceof BillingPersistenceError && error.code === 'MEMBERSHIP_REQUIRED',
  );
  assert.equal(fixture.calls.length, 0);
});

test('maps a PostgREST uniqueness conflict without exposing upstream details', async () => {
  const fixture = transportFixture(async () => response(409, { message: 'secret database detail' }));
  const driver = new BillingHttpWriteDriver({ ...options, transport: fixture.transport });
  await assert.rejects(
    () => driver.appendUsage(request),
    (error) => error instanceof BillingPersistenceError
      && error.code === 'IDEMPOTENCY_CONFLICT'
      && error.publicMessage === 'billing upstream rejeitou a escrita',
  );
  await assert.rejects(() => driver.appendUsage(request), /billing upstream rejeitou a escrita/);
  assert.equal(fixture.calls.length, 2);
});

test('retries one transient upstream failure because usage is idempotent', async () => {
  const fixture = transportFixture(async (_url, _init, attempt) => attempt === 1
    ? response(503, { message: 'temporary' })
    : response(201, responseRow));
  const driver = new BillingHttpWriteDriver({ ...options, transport: fixture.transport });
  const result = await driver.appendUsage(request);
  assert.equal(result.id, 'usage-remote-1');
  assert.equal(fixture.calls.length, 2);
});

test('maps timeout and does not retry beyond the configured attempt limit', async () => {
  const fixture = transportFixture(async (_url, init) => new Promise((resolve, reject) => {
    init.signal.addEventListener('abort', () => {
      const error = new Error('aborted');
      error.name = 'AbortError';
      reject(error);
    });
  }));
  const driver = new BillingHttpWriteDriver({ ...options, transport: fixture.transport, timeoutMs: 100, maxAttempts: 2 });
  await assert.rejects(
    () => driver.appendUsage(request),
    (error) => error instanceof BillingPersistenceError && error.code === 'UPSTREAM_TIMEOUT',
  );
  assert.equal(fixture.calls.length, 2);
});

test('rejects malformed upstream payloads as INVALID_RESPONSE', async () => {
  const fixture = transportFixture(async () => response(201, []));
  const driver = new BillingHttpWriteDriver({ ...options, transport: fixture.transport });
  await assert.rejects(
    () => driver.appendUsage(request),
    (error) => error instanceof BillingPersistenceError && error.code === 'INVALID_RESPONSE',
  );
});
