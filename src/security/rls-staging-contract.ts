export type RlsActorRole = 'anonymous' | 'user' | 'admin' | 'dev' | 'owner';
export type RlsAction = 'read' | 'write';
export type RlsDecisionReason =
  | 'anonymous-denied'
  | 'subject-missing'
  | 'tenant-missing'
  | 'tenant-mismatch'
  | 'identity-expired'
  | 'write-role-denied'
  | 'service-role-unverified'
  | 'service-role-allowed'
  | 'policy-allowed';

export interface RlsPolicyRequest {
  readonly action: RlsAction;
  readonly actorRole: RlsActorRole;
  readonly subject: string | null;
  readonly tenantId: string | null;
  readonly resourceTenantId: string | null;
  readonly expiresAt: number | null;
  readonly nowMs: number;
  readonly requestedServiceOperation: boolean;
  readonly serviceRoleVerified: boolean;
  readonly source: 'server' | 'client';
}

export interface RlsPolicyDecision {
  readonly allowed: boolean;
  readonly reason: RlsDecisionReason;
  readonly authority: 'server-policy' | 'not-authorized';
}

const ELEVATED_ROLES: readonly RlsActorRole[] = ['admin', 'dev', 'owner'];

function deny(reason: RlsDecisionReason): RlsPolicyDecision {
  return { allowed: false, reason, authority: 'not-authorized' };
}

export function evaluateLocalRlsPolicy(
  request: RlsPolicyRequest,
): RlsPolicyDecision {
  if (request.requestedServiceOperation) {
    if (request.source !== 'server' || !request.serviceRoleVerified) {
      return deny('service-role-unverified');
    }
    return {
      allowed: true,
      reason: 'service-role-allowed',
      authority: 'server-policy',
    };
  }

  if (request.actorRole === 'anonymous') return deny('anonymous-denied');
  if (request.subject === null || request.subject.trim() === '') return deny('subject-missing');
  if (request.tenantId === null || request.tenantId.trim() === '') return deny('tenant-missing');
  if (request.resourceTenantId === null || request.resourceTenantId.trim() === '') {
    return deny('tenant-missing');
  }
  if (request.tenantId !== request.resourceTenantId) return deny('tenant-mismatch');
  if (request.expiresAt === null || request.expiresAt <= request.nowMs) {
    return deny('identity-expired');
  }
  if (request.action === 'write' && !ELEVATED_ROLES.includes(request.actorRole)) {
    return deny('write-role-denied');
  }

  return { allowed: true, reason: 'policy-allowed', authority: 'server-policy' };
}
