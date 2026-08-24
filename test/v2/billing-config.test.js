import test from 'node:test';
import assert from 'node:assert/strict';
import { BillingConfigError, createBillingReadDriverFromConfig, loadBillingReadConfig } from '../../v2/data/billing-config.ts';

const validSource = {
  BILLING_READ_DRIVER_ENABLED: '1',
  BILLING_READ_ENVIRONMENT: 'staging',
  BILLING_READ_BASE_URL: 'https://billing-staging.example.test',
  BILLING_READ_API_KEY: 'secret-api-key',
  BILLING_READ_ACCESS_TOKEN: 'secret-access-token',
  BILLING_READ_PRINCIPAL_USER_ID: 'user-1',
  BILLING_READ_TIMEOUT_MS: '2500',
};

test('billing read driver is disabled unless explicitly opted in', () => {
  assert.equal(loadBillingReadConfig({}), null);
  assert.equal(loadBillingReadConfig({ BILLING_READ_DRIVER_ENABLED: '0' }), null);
});

test('billing staging config validates required fields and returns normalized values', () => {
  const config = loadBillingReadConfig(validSource);
  assert.equal(config?.environment, 'staging');
  assert.equal(config?.baseUrl, 'https://billing-staging.example.test');
  assert.equal(config?.timeoutMs, 2500);
  assert.equal(config?.principalUserId, 'user-1');
});

test('billing config rejects production or local environments', () => {
  assert.throws(
    () => loadBillingReadConfig({ ...validSource, BILLING_READ_ENVIRONMENT: 'production' }),
    (error) => error instanceof BillingConfigError && error.code === 'INVALID_ENV',
  );
  assert.throws(
    () => loadBillingReadConfig({ ...validSource, BILLING_READ_BASE_URL: 'http://localhost:54321' }),
    (error) => error instanceof BillingConfigError && error.code === 'INVALID_URL',
  );
});

test('billing config rejects missing secrets without echoing their values', () => {
  assert.throws(
    () => loadBillingReadConfig({ ...validSource, BILLING_READ_ACCESS_TOKEN: '' }),
    (error) => error instanceof BillingConfigError
      && error.code === 'MISSING_ENV'
      && !error.message.includes('secret-api-key')
      && !error.message.includes('secret-access-token'),
  );
});

test('billing config validates timeout bounds', () => {
  assert.throws(
    () => loadBillingReadConfig({ ...validSource, BILLING_READ_TIMEOUT_MS: '99' }),
    (error) => error instanceof BillingConfigError && error.code === 'INVALID_TIMEOUT',
  );
  assert.throws(
    () => loadBillingReadConfig({ ...validSource, BILLING_READ_TIMEOUT_MS: '30001' }),
    (error) => error instanceof BillingConfigError && error.code === 'INVALID_TIMEOUT',
  );
});

test('factory builds a server-side read driver from validated staging config', () => {
  const config = loadBillingReadConfig(validSource);
  assert.ok(config);
  const readDriver = createBillingReadDriverFromConfig(config, {
    async request() {
      return { status: 200, async json() { return []; } };
    },
  });
  assert.equal(typeof readDriver.getWorkspace, 'function');
});
