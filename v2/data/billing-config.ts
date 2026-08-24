import { BillingHttpReadDriver, type BillingHttpReadDriverOptions, type BillingHttpTransport } from './billing-http-read-driver.js';
import { type BillingReadObserver } from './billing-observability.js';

export type BillingReadEnvironment = 'staging';
export type BillingConfigErrorCode = 'DISABLED' | 'MISSING_ENV' | 'INVALID_ENV' | 'INVALID_URL' | 'INVALID_TIMEOUT';

export class BillingConfigError extends Error {
  readonly code: BillingConfigErrorCode;

  constructor(code: BillingConfigErrorCode, message: string) {
    super(message);
    this.name = 'BillingConfigError';
    this.code = code;
  }
}

export interface BillingConfigSource {
  readonly BILLING_READ_DRIVER_ENABLED?: string;
  readonly BILLING_READ_ENVIRONMENT?: string;
  readonly BILLING_READ_BASE_URL?: string;
  readonly BILLING_READ_API_KEY?: string;
  readonly BILLING_READ_ACCESS_TOKEN?: string;
  readonly BILLING_READ_PRINCIPAL_USER_ID?: string;
  readonly BILLING_READ_TIMEOUT_MS?: string;
}

export interface BillingReadConfig {
  readonly environment: BillingReadEnvironment;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly accessToken: string;
  readonly principalUserId: string;
  readonly timeoutMs: number;
}

function required(source: BillingConfigSource, key: keyof BillingConfigSource): string {
  const value = source[key];
  if (typeof value !== 'string' || !value.trim()) throw new BillingConfigError('MISSING_ENV', `${key} é obrigatório para billing staging`);
  return value.trim();
}

function enabled(source: BillingConfigSource): boolean {
  return source.BILLING_READ_DRIVER_ENABLED === '1' || source.BILLING_READ_DRIVER_ENABLED === 'true';
}

export function loadBillingReadConfig(source: BillingConfigSource): BillingReadConfig | null {
  if (!enabled(source)) return null;
  const environment = required(source, 'BILLING_READ_ENVIRONMENT');
  if (environment !== 'staging') throw new BillingConfigError('INVALID_ENV', 'Billing Read Driver só pode ser habilitado em staging');
  const baseUrl = required(source, 'BILLING_READ_BASE_URL');
  let parsed: URL;
  try {
    parsed = new URL(baseUrl);
  } catch {
    throw new BillingConfigError('INVALID_URL', 'BILLING_READ_BASE_URL inválida');
  }
  if (parsed.protocol !== 'https:' || parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') {
    throw new BillingConfigError('INVALID_URL', 'BILLING_READ_BASE_URL deve ser HTTPS remoto em staging');
  }
  const timeoutRaw = source.BILLING_READ_TIMEOUT_MS ?? '5000';
  const timeoutMs = Number(timeoutRaw);
  if (!Number.isInteger(timeoutMs) || timeoutMs < 100 || timeoutMs > 30000) {
    throw new BillingConfigError('INVALID_TIMEOUT', 'BILLING_READ_TIMEOUT_MS deve estar entre 100 e 30000');
  }
  return Object.freeze({
    environment: 'staging',
    baseUrl: parsed.toString().replace(/\/$/, ''),
    apiKey: required(source, 'BILLING_READ_API_KEY'),
    accessToken: required(source, 'BILLING_READ_ACCESS_TOKEN'),
    principalUserId: required(source, 'BILLING_READ_PRINCIPAL_USER_ID'),
    timeoutMs,
  });
}

export function createBillingReadDriverFromConfig(
  config: BillingReadConfig,
  transport: BillingHttpTransport,
  observer?: BillingReadObserver,
): BillingHttpReadDriver {
  const options: BillingHttpReadDriverOptions = {
    baseUrl: config.baseUrl,
    apiKey: config.apiKey,
    accessToken: config.accessToken,
    principalUserId: config.principalUserId,
    timeoutMs: config.timeoutMs,
    transport,
    ...(observer ? { observer } : {}),
  };
  return new BillingHttpReadDriver(options);
}
