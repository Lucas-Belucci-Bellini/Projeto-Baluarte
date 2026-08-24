import {
  BillingCatalog,
  normalizePlanAssignment,
  normalizeUsageEvent,
  type Plan,
  type PlanAssignment,
  type UsageEvent,
  UsageLedger,
} from './billing.js';
import {
  BillingPersistenceError,
  type BillingDriver,
  type BillingPersistenceErrorCode,
} from './billing-driver.js';
import {
  buildBillingMutationAudit,
  evaluateBillingPreflight,
  NOOP_BILLING_MUTATION_OBSERVER,
  type BillingMutationAuditReason,
  type BillingMutationObserver,
  type BillingMutationOutcome,
  type BillingMutationStatusClass,
  type BillingPreflightReason,
  type BillingPreflightResult,
} from './billing-foundation.js';

export type WorkspaceRole = 'owner' | 'admin' | 'dev' | 'user';

export interface WorkspaceRecord {
  readonly id: string;
  readonly accountId: string;
  readonly slug: string;
  readonly displayName: string;
}

export interface WorkspaceMember {
  readonly workspaceId: string;
  readonly userId: string;
  readonly role: WorkspaceRole;
}

export interface UsageWriteRequest extends UsageEvent {
  readonly actorUserId: string;
}

export interface PreflightUsageResult {
  readonly usage: UsageEvent;
  readonly preflight: BillingPreflightResult | null;
  readonly replayed: boolean;
}

export interface BillingAssignmentUsageTransaction {
  readonly assignment: PlanAssignment;
  readonly usage: UsageWriteRequest;
}

export interface BillingAssignmentUsageResult {
  readonly assignment: PlanAssignment;
  readonly usage: UsageEvent;
}

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} é obrigatório`);
  return normalized;
}

function sameUsagePayload(left: UsageEvent, right: UsageEvent): boolean {
  return left.accountId === right.accountId
    && left.workspaceId === right.workspaceId
    && left.feature === right.feature
    && left.quantity === right.quantity
    && left.timestamp === right.timestamp
    && left.source === right.source
    && JSON.stringify(Object.entries(left.metadata).sort()) === JSON.stringify(Object.entries(right.metadata).sort());
}

function preflightErrorCode(reason: BillingPreflightReason): BillingPersistenceErrorCode {
  switch (reason) {
    case 'plan-unavailable':
      return 'PLAN_NOT_FOUND';
    case 'entitlement-missing':
      return 'ENTITLEMENT_REQUIRED';
    case 'limit-missing':
      return 'LIMIT_NOT_CONFIGURED';
    case 'limit-exceeded':
      return 'LIMIT_EXCEEDED';
    case 'invalid-limit':
      return 'INVALID_LIMIT';
    case 'invalid-input':
      return 'INVALID_STATE';
    case 'allowed':
      return 'INVALID_STATE';
  }
}

class AsyncMutex {
  private tail: Promise<void> = Promise.resolve();

  async run<TResult>(task: () => TResult | Promise<TResult>): Promise<TResult> {
    const previous = this.tail;
    let release!: () => void;
    this.tail = new Promise<void>((resolve) => { release = resolve; });
    await previous;
    try {
      return await task();
    } finally {
      release();
    }
  }
}

export class BillingPersistenceAdapter implements BillingDriver {
  readonly catalog: BillingCatalog;
  readonly ledger: UsageLedger;
  private readonly workspaces = new Map<string, WorkspaceRecord>();
  private readonly members = new Map<string, WorkspaceMember>();
  private readonly usageMutex = new AsyncMutex();
  private readonly mutationObserver: BillingMutationObserver;

  constructor(
    catalog = new BillingCatalog(),
    ledger = new UsageLedger(),
    mutationObserver: BillingMutationObserver = NOOP_BILLING_MUTATION_OBSERVER,
  ) {
    this.catalog = catalog;
    this.ledger = ledger;
    this.mutationObserver = mutationObserver;
  }

  private observeMutation(
    outcome: BillingMutationOutcome,
    reason: BillingMutationAuditReason,
    statusClass: BillingMutationStatusClass,
    requestedQuantity: number,
    requestIdPresent: boolean,
  ): void {
    this.mutationObserver.observe(buildBillingMutationAudit({
      operation: 'append-usage',
      outcome,
      reason,
      statusClass,
      requestedQuantity,
      requestIdPresent,
    }));
  }

  createWorkspace(workspace: WorkspaceRecord): WorkspaceRecord {
    const normalized: WorkspaceRecord = Object.freeze({
      id: required(workspace.id, 'workspace.id'),
      accountId: required(workspace.accountId, 'workspace.accountId'),
      slug: required(workspace.slug, 'workspace.slug').toLowerCase(),
      displayName: required(workspace.displayName, 'workspace.displayName'),
    });
    if (this.workspaces.has(normalized.id)) {
      throw new BillingPersistenceError('DUPLICATE_RESOURCE', `workspace.id duplicado: ${normalized.id}`);
    }
    if ([...this.workspaces.values()].some((item) => item.accountId === normalized.accountId && item.slug === normalized.slug)) {
      throw new BillingPersistenceError('DUPLICATE_RESOURCE', `workspace.slug duplicado: ${normalized.slug}`);
    }
    this.workspaces.set(normalized.id, normalized);
    this.addMember({ workspaceId: normalized.id, userId: normalized.accountId, role: 'owner' });
    return normalized;
  }

  addMember(member: WorkspaceMember): WorkspaceMember {
    const normalized: WorkspaceMember = Object.freeze({
      workspaceId: required(member.workspaceId, 'member.workspaceId'),
      userId: required(member.userId, 'member.userId'),
      role: member.role,
    });
    if (!this.workspaces.has(normalized.workspaceId)) {
      throw new BillingPersistenceError('WORKSPACE_NOT_FOUND', `workspace não encontrado: ${normalized.workspaceId}`);
    }
    const key = `${normalized.workspaceId}:${normalized.userId}`;
    if (this.members.has(key)) {
      throw new BillingPersistenceError('DUPLICATE_RESOURCE', `membership duplicado: ${key}`);
    }
    this.members.set(key, normalized);
    return normalized;
  }

  isMember(workspaceId: string, userId: string): boolean {
    return this.members.has(`${required(workspaceId, 'workspaceId')}:${required(userId, 'userId')}`);
  }

  getWorkspace(workspaceId: string, actorUserId: string): WorkspaceRecord {
    const id = required(workspaceId, 'workspaceId');
    const workspace = this.workspaces.get(id);
    if (!workspace) {
      throw new BillingPersistenceError('WORKSPACE_NOT_FOUND', `workspace não encontrado: ${id}`);
    }
    if (!this.isMember(id, actorUserId)) {
      throw new BillingPersistenceError('MEMBERSHIP_REQUIRED', 'ator não é membro do workspace');
    }
    return workspace;
  }

  resolvePlan(accountId: string, workspaceId: string, actorUserId: string, at?: string) {
    const workspace = this.getWorkspace(workspaceId, actorUserId);
    const account = required(accountId, 'accountId');
    if (workspace.accountId !== account) {
      throw new BillingPersistenceError('ACCOUNT_MISMATCH', 'accountId não corresponde ao workspace');
    }
    return this.catalog.resolve(account, workspace.id, at);
  }

  registerPlan(plan: Plan): Plan {
    return this.catalog.registerPlan(plan);
  }

  assignPlan(assignment: PlanAssignment): PlanAssignment {
    const workspace = this.workspaces.get(required(assignment.workspaceId, 'assignment.workspaceId'));
    if (!workspace) {
      throw new BillingPersistenceError('WORKSPACE_NOT_FOUND', `workspace não encontrado: ${assignment.workspaceId}`);
    }
    if (workspace.accountId !== required(assignment.accountId, 'assignment.accountId')) {
      throw new BillingPersistenceError('ACCOUNT_MISMATCH', 'assignment.accountId não corresponde ao workspace');
    }
    return this.catalog.assignPlan(assignment);
  }

  async assignPlanAndAppendUsage(
    assignment: PlanAssignment,
    request: UsageWriteRequest,
  ): Promise<BillingAssignmentUsageResult> {
    return this.usageMutex.run(() => {
      const workspace = this.workspaces.get(required(request.workspaceId, 'usage.workspaceId'));
      if (!workspace) {
        throw new BillingPersistenceError('WORKSPACE_NOT_FOUND', `workspace não encontrado: ${request.workspaceId}`);
      }
      if (workspace.accountId !== required(request.accountId, 'usage.accountId')) {
        throw new BillingPersistenceError('ACCOUNT_MISMATCH', 'usage.accountId não corresponde ao workspace');
      }
      if (workspace.id !== required(assignment.workspaceId, 'assignment.workspaceId')) {
        throw new BillingPersistenceError('ACCOUNT_MISMATCH', 'assignment.workspaceId não corresponde ao usage.workspaceId');
      }
      if (workspace.accountId !== required(assignment.accountId, 'assignment.accountId')) {
        throw new BillingPersistenceError('ACCOUNT_MISMATCH', 'assignment.accountId não corresponde ao workspace');
      }
      if (!this.isMember(workspace.id, request.actorUserId)) {
        throw new BillingPersistenceError('MEMBERSHIP_REQUIRED', 'ator não é membro do workspace');
      }
      const normalizedAssignment = normalizePlanAssignment(assignment);
      if (!this.catalog.hasPlanVersion(normalizedAssignment.planId, normalizedAssignment.planVersion)) {
        throw new BillingPersistenceError('PLAN_NOT_FOUND', 'plano e versão não estão registrados');
      }
      const normalizedUsage = normalizeUsageEvent(request);
      const existingUsage = this.ledger.findByIdempotencyKey(normalizedUsage.idempotencyKey);
      if (existingUsage && !sameUsagePayload(existingUsage, normalizedUsage)) {
        throw new BillingPersistenceError('IDEMPOTENCY_CONFLICT', 'idempotencyKey já foi usada com um payload diferente');
      }
      if (existingUsage) {
        if (this.catalog.hasAssignment(normalizedAssignment.id)) {
          return { assignment: normalizedAssignment, usage: existingUsage };
        }
        throw new BillingPersistenceError('INVALID_STATE', 'replay exige assignment já persistida');
      }
      if (this.catalog.hasAssignment(normalizedAssignment.id) || this.ledger.hasEventId(normalizedUsage.id)) {
        throw new BillingPersistenceError('DUPLICATE_RESOURCE', 'assignment ou usage.id já existe');
      }
      const persistedAssignment = this.catalog.assignPlan(normalizedAssignment);
      const persistedUsage = this.ledger.append(normalizedUsage);
      return { assignment: persistedAssignment, usage: persistedUsage };
    });
  }

  async appendUsageWithPreflight(
    request: UsageWriteRequest,
    requiredEntitlement: string | null = null,
  ): Promise<PreflightUsageResult> {
    return this.usageMutex.run(() => {
      const workspace = this.workspaces.get(required(request.workspaceId, 'usage.workspaceId'));
      if (!workspace) {
        throw new BillingPersistenceError('WORKSPACE_NOT_FOUND', `workspace não encontrado: ${request.workspaceId}`);
      }
      if (workspace.accountId !== required(request.accountId, 'usage.accountId')) {
        throw new BillingPersistenceError('ACCOUNT_MISMATCH', 'usage.accountId não corresponde ao workspace');
      }
      if (!this.isMember(request.workspaceId, request.actorUserId)) {
        throw new BillingPersistenceError('MEMBERSHIP_REQUIRED', 'ator não é membro do workspace');
      }

      const normalized = normalizeUsageEvent(request);
      const existing = this.ledger.findByIdempotencyKey(normalized.idempotencyKey);
      if (existing && !sameUsagePayload(existing, normalized)) {
        this.observeMutation('rejected', 'idempotency-conflict', '4xx', normalized.quantity, true);
        throw new BillingPersistenceError(
          'IDEMPOTENCY_CONFLICT',
          'idempotencyKey já foi usada com um payload diferente',
        );
      }
      if (existing) {
        this.observeMutation('replayed', 'replayed', '2xx', normalized.quantity, true);
        return { usage: existing, preflight: null, replayed: true };
      }
      if (this.ledger.hasEventId(normalized.id)) {
        this.observeMutation('rejected', 'duplicate-resource', '4xx', normalized.quantity, true);
        throw new BillingPersistenceError('DUPLICATE_RESOURCE', 'usage.id já existe');
      }

      const resolution = this.catalog.resolve(
        normalized.accountId,
        normalized.workspaceId,
        normalized.timestamp,
      );
      const preflight = evaluateBillingPreflight({
        plan: resolution.plan,
        feature: normalized.feature,
        requiredEntitlement,
        consumed: this.ledger.total(normalized.accountId, normalized.workspaceId, normalized.feature),
        requested: normalized.quantity,
      });
      if (!preflight.allowed) {
        this.observeMutation('rejected', preflight.reason, '4xx', normalized.quantity, true);
        throw new BillingPersistenceError(
          preflightErrorCode(preflight.reason),
          `billing preflight rejeitado: ${preflight.reason}`,
        );
      }

      const usage = this.ledger.append(normalized);
      this.observeMutation('committed', 'allowed', '2xx', usage.quantity, true);
      return { usage, preflight, replayed: false };
    });
  }

  async appendUsage(request: UsageWriteRequest): Promise<UsageEvent> {
    return this.usageMutex.run(() => {
      const workspace = this.workspaces.get(required(request.workspaceId, 'usage.workspaceId'));
      if (!workspace) {
        throw new BillingPersistenceError('WORKSPACE_NOT_FOUND', `workspace não encontrado: ${request.workspaceId}`);
      }
      if (workspace.accountId !== required(request.accountId, 'usage.accountId')) {
        throw new BillingPersistenceError('ACCOUNT_MISMATCH', 'usage.accountId não corresponde ao workspace');
      }
      if (!this.isMember(request.workspaceId, request.actorUserId)) {
        throw new BillingPersistenceError('MEMBERSHIP_REQUIRED', 'ator não é membro do workspace');
      }
      const existing = this.ledger.findByIdempotencyKey(request.idempotencyKey);
      if (existing && !sameUsagePayload(existing, request)) {
        throw new BillingPersistenceError(
          'IDEMPOTENCY_CONFLICT',
          'idempotencyKey já foi usada com um payload diferente',
        );
      }
      return this.ledger.append(request);
    });
  }

  listUsage(workspaceId: string, actorUserId: string): readonly UsageEvent[] {
    if (!this.isMember(workspaceId, actorUserId)) {
      throw new BillingPersistenceError('MEMBERSHIP_REQUIRED', 'ator não é membro do workspace');
    }
    return this.ledger.list().filter((event) => event.workspaceId === workspaceId);
  }
}
