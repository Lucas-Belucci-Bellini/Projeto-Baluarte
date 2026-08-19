import {
  BillingCatalog,
  type Plan,
  type PlanAssignment,
  type UsageEvent,
  UsageLedger,
} from './billing.js';
import {
  BillingPersistenceError,
  type BillingDriver,
} from './billing-driver.js';

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

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} é obrigatório`);
  return normalized;
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

  constructor(catalog = new BillingCatalog(), ledger = new UsageLedger()) {
    this.catalog = catalog;
    this.ledger = ledger;
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
