import {
  projectServerValidatedSession,
  type ServerValidatedSessionProjection,
} from './server-validated-session.js';
import type { ServerObservationEnvelope } from '../layout/server-observation.js';

export const SERVER_OBSERVATION_HTTP_CONTRACT_VERSION = 'server-observation-http/v1' as const;
export const DEFAULT_SERVER_OBSERVATION_TIMEOUT_MS = 2_500;
export const MIN_SERVER_OBSERVATION_TIMEOUT_MS = 100;
export const MAX_SERVER_OBSERVATION_TIMEOUT_MS = 10_000;

export type ServerObservationHttpReasonCode =
  | 'observed'
  | 'configuration-missing'
  | 'invalid-endpoint'
  | 'timeout'
  | 'network-error'
  | 'server-rate-limited'
  | 'http-error'
  | 'invalid-response';

export interface ServerObservationHttpTransport {
  readonly attempted: boolean;
  readonly statusCode: number | null;
  readonly reasonCode: ServerObservationHttpReasonCode;
}

export interface ServerObservationHttpResult {
  readonly contractVersion: typeof SERVER_OBSERVATION_HTTP_CONTRACT_VERSION;
  readonly outcome: 'observed' | 'unavailable';
  readonly projection: ServerValidatedSessionProjection;
  readonly transport: ServerObservationHttpTransport;
  readonly authority: 'not-authorized';
  readonly publicPromotionAllowed: false;
}

export interface ServerObservationHttpRequest {
  readonly endpoint?: string;
  readonly accessToken?: string;
  readonly requestId?: string;
  readonly origin?: string;
  readonly timeoutMs?: number;
  readonly fetcher?: typeof fetch;
}

function emptyProjection(): ServerValidatedSessionProjection {
  return projectServerValidatedSession(null);
}

function result(
  outcome: ServerObservationHttpResult['outcome'],
  reasonCode: ServerObservationHttpReasonCode,
  attempted: boolean,
  statusCode: number | null,
  projection: ServerValidatedSessionProjection = emptyProjection(),
): ServerObservationHttpResult {
  return Object.freeze({
    contractVersion: SERVER_OBSERVATION_HTTP_CONTRACT_VERSION,
    outcome,
    projection,
    transport: Object.freeze({ attempted, statusCode, reasonCode }),
    authority: 'not-authorized',
    publicPromotionAllowed: false,
  });
}

function validEndpoint(value: string | undefined): URL | null {
  if (!value || value.trim() === '') return null;
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.username || url.password || url.hash || url.search) return null;
    return url;
  } catch {
    return null;
  }
}

function timeoutValue(value: number | undefined): number {
  if (!Number.isFinite(value)) return DEFAULT_SERVER_OBSERVATION_TIMEOUT_MS;
  return Math.min(
    MAX_SERVER_OBSERVATION_TIMEOUT_MS,
    Math.max(MIN_SERVER_OBSERVATION_TIMEOUT_MS, Math.trunc(value as number)),
  );
}

function headerValue(value: string | undefined): string | null {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : null;
}

function isEnvelope(value: unknown): value is ServerObservationEnvelope {
  if (typeof value !== 'object' || value === null) return false;
  const root = value as Record<string, unknown>;
  return root.contractVersion === 'server-observation/v1'
    && root.source === 'server-observed'
    && root.authority === 'not-authorized';
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

function isHttpStatus(value: number): boolean {
  return Number.isInteger(value) && value >= 100 && value <= 599;
}

export async function fetchServerObservation(
  request: ServerObservationHttpRequest,
): Promise<ServerObservationHttpResult> {
  const endpoint = validEndpoint(request.endpoint);
  if (!request.endpoint) return result('unavailable', 'configuration-missing', false, null);
  if (!endpoint) return result('unavailable', 'invalid-endpoint', false, null);

  const fetcher = request.fetcher ?? globalThis.fetch;
  if (typeof fetcher !== 'function') return result('unavailable', 'network-error', false, null);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutValue(request.timeoutMs));
  const headers = new Headers();
  const accessToken = headerValue(request.accessToken);
  const requestId = headerValue(request.requestId);
  const origin = headerValue(request.origin);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (requestId) headers.set('X-Request-ID', requestId);
  if (origin) headers.set('Origin', origin);

  try {
    const response = await fetcher(endpoint, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });
    const statusCode = isHttpStatus(response.status) ? response.status : null;
    if (response.status === 429) return result('unavailable', 'server-rate-limited', true, statusCode);
    if (!response.ok) return result('unavailable', 'http-error', true, statusCode);

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      return result('unavailable', 'invalid-response', true, statusCode);
    }
    if (!isEnvelope(payload)) return result('unavailable', 'invalid-response', true, statusCode);

    return result(
      'observed',
      'observed',
      true,
      statusCode,
      projectServerValidatedSession(payload),
    );
  } catch (error: unknown) {
    return result('unavailable', isAbortError(error) ? 'timeout' : 'network-error', true, null);
  } finally {
    clearTimeout(timeout);
  }
}
