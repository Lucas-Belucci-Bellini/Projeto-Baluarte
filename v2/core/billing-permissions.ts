import type { Plan } from '../data/billing.js';

export interface EntitlementPermission {
  readonly entitlement: string;
  readonly permission: string;
}

export interface PermissionCandidate {
  readonly entitlement: string;
  readonly permission: string;
  readonly source: 'billing-entitlement';
}

export interface PermissionMappingResult {
  readonly grantedCandidates: readonly PermissionCandidate[];
  readonly unmappedEntitlements: readonly string[];
}

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} é obrigatório`);
  return normalized;
}

export function mapEntitlementsToPermissions(
  plan: Plan,
  mappings: readonly EntitlementPermission[],
): PermissionMappingResult {
  const mappingByEntitlement = new Map<string, string>();
  for (const mapping of mappings) {
    const entitlement = required(mapping.entitlement, 'mapping.entitlement');
    const permission = required(mapping.permission, 'mapping.permission');
    const previous = mappingByEntitlement.get(entitlement);
    if (previous && previous !== permission) {
      throw new Error(`entitlement possui mapeamentos conflitantes: ${entitlement}`);
    }
    mappingByEntitlement.set(entitlement, permission);
  }

  const grantedCandidates: PermissionCandidate[] = [];
  const unmappedEntitlements: string[] = [];
  for (const entitlement of plan.entitlements) {
    const permission = mappingByEntitlement.get(entitlement);
    if (!permission) {
      unmappedEntitlements.push(entitlement);
      continue;
    }
    grantedCandidates.push({ entitlement, permission, source: 'billing-entitlement' });
  }
  return Object.freeze({
    grantedCandidates: Object.freeze(grantedCandidates),
    unmappedEntitlements: Object.freeze(unmappedEntitlements),
  });
}
