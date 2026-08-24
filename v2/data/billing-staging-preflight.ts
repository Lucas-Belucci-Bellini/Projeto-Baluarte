import {
  BillingConfigError,
  createBillingReadDriverFromConfig,
  loadBillingReadConfig,
  type BillingConfigSource,
} from './billing-config.js';
import {
  validateBillingStagingActivation,
  type BillingStagingActivationInput,
} from './billing-activation.js';
import type { BillingHttpReadDriver, BillingHttpTransport } from './billing-http-read-driver.js';
import type { BillingReadObserver } from './billing-observability.js';

export type BillingStagingPreflightStatus = 'disabled' | 'blocked' | 'ready';

export interface BillingStagingPreflightReport {
  readonly status: BillingStagingPreflightStatus;
  readonly failedChecks: readonly string[];
  readonly configurationErrorCode?: string;
}

export interface BillingStagingPreflightInput {
  readonly source: BillingConfigSource;
  readonly activation: Omit<BillingStagingActivationInput, 'config'> & {
    readonly approvedProjectHost: string;
  };
  readonly transport: BillingHttpTransport;
  readonly observer?: BillingReadObserver;
}

export interface BillingStagingPreflightResult {
  readonly report: BillingStagingPreflightReport;
  readonly driver: BillingHttpReadDriver | null;
}

export function prepareBillingStagingReadDriver(input: BillingStagingPreflightInput): BillingStagingPreflightResult {
  let config;
  try {
    config = loadBillingReadConfig(input.source);
  } catch (error) {
    if (error instanceof BillingConfigError) {
      return Object.freeze({
        report: Object.freeze({ status: 'blocked', failedChecks: [], configurationErrorCode: error.code }),
        driver: null,
      });
    }
    throw error;
  }
  if (!config) {
    return Object.freeze({
      report: Object.freeze({ status: 'disabled', failedChecks: [] }),
      driver: null,
    });
  }
  const activation = validateBillingStagingActivation({ ...input.activation, config });
  if (!activation.allowed) {
    return Object.freeze({
      report: Object.freeze({ status: 'blocked', failedChecks: activation.failedChecks }),
      driver: null,
    });
  }
  return Object.freeze({
    report: Object.freeze({ status: 'ready', failedChecks: [] }),
    driver: createBillingReadDriverFromConfig(config, input.transport, input.observer),
  });
}
