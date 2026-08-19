import type { PlanResolution } from './billing.js';
import type { EvidenceInput } from './evidence.js';

function required(value: string, field: string): string {
  const normalized = value.trim();
  if (!normalized) throw new TypeError(`${field} é obrigatório`);
  return normalized;
}

export function planResolutionToEvidence(
  resolution: PlanResolution,
  retrievedAt: string,
): EvidenceInput {
  const accountId = required(resolution.accountId, 'resolution.accountId');
  const workspaceId = required(resolution.workspaceId, 'resolution.workspaceId');
  const assignmentId = resolution.assignment?.id ?? 'none';
  const claimKey = `billing.plan.${accountId}.${workspaceId}`;
  const id = `evidence:${claimKey}:${assignmentId}`;
  const statement = resolution.plan
    ? `Workspace ${workspaceId} usa o plano ${resolution.plan.id} para a conta ${accountId}.`
    : `Workspace ${workspaceId} não possui plano ativo resolvido para a conta ${accountId}.`;
  return {
    id,
    claimKey,
    statement,
    source: {
      uri: `baluarte://billing/assignments/${assignmentId}`,
      title: 'Resolução interna de plano do Baluarte',
      publisher: 'Projeto Baluarte',
      revision: resolution.plan ? String(resolution.plan.version) : 'none',
    },
    retrievedAt,
    confidence: 1,
    status: 'verified',
    moduleId: 'v2.billing',
    collector: 'billing-catalog',
  };
}
