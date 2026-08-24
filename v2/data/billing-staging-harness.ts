import type { BillingHttpTransport } from './billing-http-read-driver.js';

export interface StagingWorkspaceRow {
  readonly id: string;
  readonly account_id: string;
  readonly slug: string;
  readonly display_name: string;
}

export interface StagingMembershipRow {
  readonly workspace_id: string;
  readonly user_id: string;
}

export interface StagingPlanRow {
  readonly plan_id: string;
  readonly version: number;
  readonly name: string;
  readonly description: string;
  readonly status: string;
  readonly currency: string;
  readonly billing_period: string;
  readonly price_minor: number;
  readonly trial_days: number;
  readonly entitlements: readonly string[];
  readonly limits: Readonly<Record<string, unknown>>;
  readonly features: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface StagingAssignmentRow {
  readonly id: string;
  readonly account_id: string;
  readonly workspace_id: string;
  readonly plan_id: string;
  readonly plan_version: number;
  readonly status: string;
  readonly effective_from: string;
  readonly effective_to: string | null;
  readonly assigned_at: string;
  readonly source: string;
}

export interface StagingUsageRow {
  readonly id: string;
  readonly idempotency_key: string;
  readonly account_id: string;
  readonly workspace_id: string;
  readonly feature: string;
  readonly quantity: number;
  readonly occurred_at: string;
  readonly source: string;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface StagingBillingDataset {
  readonly workspaces: readonly StagingWorkspaceRow[];
  readonly memberships: readonly StagingMembershipRow[];
  readonly plans: readonly StagingPlanRow[];
  readonly assignments: readonly StagingAssignmentRow[];
  readonly usage: readonly StagingUsageRow[];
}

interface StagingResponse {
  readonly status: number;
  json(): Promise<unknown>;
}

function response(status: number, payload: unknown): StagingResponse {
  return Object.freeze({
    status,
    async json() {
      return payload;
    },
  });
}

function query(url: URL, key: string): string | null {
  return url.searchParams.get(key);
}

function equals(rowValue: string | number, filter: string | null): boolean {
  return filter === null || String(rowValue) === filter.replace(/^eq\./, '');
}

function member(dataset: StagingBillingDataset, userId: string, workspaceId: string): boolean {
  return dataset.memberships.some((item) => item.user_id === userId && item.workspace_id === workspaceId);
}

function principal(init: Readonly<{ readonly headers: Readonly<Record<string, string>> }>): string | null {
  const authorization = init.headers.Authorization ?? '';
  if (!authorization.startsWith('Bearer staging-user:')) return null;
  const userId = authorization.slice('Bearer staging-user:'.length).trim();
  return userId || null;
}

export function createBillingStagingTransport(dataset: StagingBillingDataset): BillingHttpTransport {
  return {
    async request(urlString, init) {
      if (init.headers['Accept-Profile'] !== 'billing') return response(406, { error: 'profile required' });
      const userId = principal(init);
      if (!userId) return response(401, { error: 'session required' });
      const url = new URL(urlString);
      const resource = url.pathname.split('/').filter(Boolean).at(-1);
      if (!resource) return response(404, { error: 'resource missing' });

      if (resource === 'workspaces') {
        const workspaceId = query(url, 'id')?.replace(/^eq\./, '');
        const rows = dataset.workspaces.filter((item) =>
          equals(item.id, query(url, 'id')) && member(dataset, userId, item.id)
          && (workspaceId === null || item.id === workspaceId));
        return response(200, rows);
      }

      if (resource === 'usage_events') {
        const workspaceId = query(url, 'workspace_id')?.replace(/^eq\./, '') ?? '';
        if (!member(dataset, userId, workspaceId)) return response(403, { error: 'membership required' });
        return response(200, dataset.usage.filter((item) => item.workspace_id === workspaceId));
      }

      if (resource === 'plan_assignments') {
        const workspaceId = query(url, 'workspace_id')?.replace(/^eq\./, '') ?? '';
        if (!member(dataset, userId, workspaceId)) return response(403, { error: 'membership required' });
        const accountId = query(url, 'account_id')?.replace(/^eq\./, '') ?? '';
        const at = query(url, 'effective_from')?.replace(/^lte\./, '') ?? new Date().toISOString();
        return response(200, dataset.assignments
          .filter((item) => item.account_id === accountId && item.workspace_id === workspaceId)
          .filter((item) => item.status === 'active')
          .filter((item) => Date.parse(item.effective_from) <= Date.parse(at))
          .sort((left, right) => Date.parse(right.effective_from) - Date.parse(left.effective_from)));
      }

      if (resource === 'plans') {
        return response(200, dataset.plans.filter((item) =>
          item.status === 'active'
          && equals(item.plan_id, query(url, 'plan_id'))
          && equals(item.version, query(url, 'version')),
        ));
      }

      return response(404, { error: 'resource not found' });
    },
  };
}
