import type { ServerClaimsObservation } from '../layout/server-claims-observation';

export const OPENCLAW_SERVER_POLICY_CONTRACT_VERSION = 'openclaw-server-policy/v1' as const;
export const OPENCLAW_MAX_MESSAGES = 32;
export const OPENCLAW_MAX_PAYLOAD_BYTES = 256 * 1024;

export type OpenClawServerPolicyOperation =
  | 'chat'
  | 'tool-call'
  | 'webhook'
  | 'external-action'
  | 'unknown';

export type OpenClawPolicyReason =
  | 'claims-missing'
  | 'claims-untrusted'
  | 'claims-stale'
  | 'subject-missing'
  | 'audience-mismatch'
  | 'scope-missing'
  | 'authority-not-authorized'
  | 'operation-not-allowed'
  | 'message-count-invalid'
  | 'payload-too-large'
  | 'tool-calls-not-allowed'
  | 'policy-not-configured';

export interface OpenClawServerPolicyRequest {
  readonly operation?: unknown;
  readonly messageCount?: unknown;
  readonly payloadBytes?: unknown;
  readonly hasToolCalls?: unknown;
}

export interface OpenClawServerPolicyOptions {
  readonly runtimeAuthority?: unknown;
}

export interface OpenClawServerPolicyDecision {
  readonly contractVersion: typeof OPENCLAW_SERVER_POLICY_CONTRACT_VERSION;
  readonly decision: 'denied' | 'not-ready';
  readonly operation: OpenClawServerPolicyOperation;
  readonly reasons: readonly OpenClawPolicyReason[];
  readonly summary: {
    readonly messageCount: number;
    readonly payloadBytes: number;
    readonly hasToolCalls: boolean;
  };
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}

const HARD_DENIAL_REASONS = new Set<OpenClawPolicyReason>([
  'claims-missing',
  'claims-untrusted',
  'claims-stale',
  'subject-missing',
  'audience-mismatch',
  'operation-not-allowed',
  'message-count-invalid',
  'payload-too-large',
  'tool-calls-not-allowed',
]);

function normalizeOperation(value: unknown): OpenClawServerPolicyOperation {
  if (value === 'chat' || value === 'tool-call' || value === 'webhook' || value === 'external-action') {
    return value;
  }
  return 'unknown';
}

function boundedInteger(value: unknown, max: number): { value: number; valid: boolean } {
  if (!Number.isInteger(value) || (value as number) < 0) return { value: 0, valid: false };
  return { value: Math.min(value as number, max), valid: (value as number) <= max };
}

function uniqueReasons(reasons: readonly OpenClawPolicyReason[]): OpenClawPolicyReason[] {
  return [...new Set(reasons)];
}

export function preflightOpenClawServerRequest(
  claims: ServerClaimsObservation | null | undefined,
  request: OpenClawServerPolicyRequest | null | undefined,
  options: OpenClawServerPolicyOptions = {},
): OpenClawServerPolicyDecision {
  const input = request ?? {};
  const operation = normalizeOperation(input.operation);
  const messageCount = boundedInteger(input.messageCount, OPENCLAW_MAX_MESSAGES);
  const payloadBytes = boundedInteger(input.payloadBytes, OPENCLAW_MAX_PAYLOAD_BYTES);
  const hasToolCalls = input.hasToolCalls === true;
  const reasons: OpenClawPolicyReason[] = [];

  if (!claims) {
    reasons.push('claims-missing');
  } else {
    if (!claims.identity.trustedSource) reasons.push('claims-untrusted');
    if (!claims.identity.authenticated) reasons.push('claims-untrusted');
    if (!claims.identity.subjectPresent) reasons.push('subject-missing');
    if (!claims.identity.audienceMatched) reasons.push('audience-mismatch');
    if (!claims.validity.fresh) reasons.push('claims-stale');
    if (claims.authority !== 'not-authorized') reasons.push('authority-not-authorized');
    const acceptedScopes: readonly string[] = claims.scopes.accepted;
    if (!acceptedScopes.includes('openclaw:chat')) reasons.push('scope-missing');
  }

  if (options.runtimeAuthority !== 'authorized') reasons.push('authority-not-authorized');
  if (operation !== 'chat') reasons.push('operation-not-allowed');
  if (!messageCount.valid || messageCount.value < 1) reasons.push('message-count-invalid');
  if (!payloadBytes.valid || payloadBytes.value < 1) reasons.push('payload-too-large');
  if (hasToolCalls) reasons.push('tool-calls-not-allowed');
  reasons.push('policy-not-configured');

  const normalizedReasons = uniqueReasons(reasons);
  const denied = normalizedReasons.some((reason) => HARD_DENIAL_REASONS.has(reason));
  return Object.freeze({
    contractVersion: OPENCLAW_SERVER_POLICY_CONTRACT_VERSION,
    decision: denied ? 'denied' : 'not-ready',
    operation,
    reasons: Object.freeze(normalizedReasons),
    summary: Object.freeze({
      messageCount: messageCount.value,
      payloadBytes: payloadBytes.value,
      hasToolCalls,
    }),
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  });
}
