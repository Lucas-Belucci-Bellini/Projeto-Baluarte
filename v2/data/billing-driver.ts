import type {
  Plan,
  PlanAssignment,
  PlanResolution,
  UsageEvent,
} from './billing.js';
import type {
  UsageWriteRequest,
  WorkspaceMember,
  WorkspaceRecord,
} from './billing-persistence.js';

export type DriverResult<T> = T | Promise<T>;

export type BillingPersistenceErrorCode =
  | 'WORKSPACE_NOT_FOUND'
  | 'MEMBERSHIP_REQUIRED'
  | 'ACCOUNT_MISMATCH'
  | 'IDEMPOTENCY_CONFLICT'
  | 'DUPLICATE_RESOURCE'
  | 'PLAN_NOT_FOUND'
  | 'INVALID_STATE'
  | 'UPSTREAM_TIMEOUT'
  | 'UPSTREAM_UNAVAILABLE'
  | 'INVALID_RESPONSE';

export class BillingPersistenceError extends Error {
  readonly code: BillingPersistenceErrorCode;
  readonly retryable: boolean;
  readonly publicMessage: string;

  constructor(code: BillingPersistenceErrorCode, message: string, retryable = false) {
    super(message);
    this.name = 'BillingPersistenceError';
    this.code = code;
    this.retryable = retryable;
    this.publicMessage = message;
  }
}

export interface BillingReadDriver {
  getWorkspace(workspaceId: string, actorUserId: string): DriverResult<WorkspaceRecord>;
  resolvePlan(accountId: string, workspaceId: string, actorUserId: string, at?: string): DriverResult<PlanResolution>;
  listUsage(workspaceId: string, actorUserId: string): DriverResult<readonly UsageEvent[]>;
}

export interface BillingDriver extends BillingReadDriver {
  createWorkspace(workspace: WorkspaceRecord): DriverResult<WorkspaceRecord>;
  addMember(member: WorkspaceMember): DriverResult<WorkspaceMember>;
  isMember(workspaceId: string, userId: string): DriverResult<boolean>;
  registerPlan(plan: Plan): DriverResult<Plan>;
  assignPlan(assignment: PlanAssignment): DriverResult<PlanAssignment>;
  appendUsage(request: UsageWriteRequest): DriverResult<UsageEvent>;
}
