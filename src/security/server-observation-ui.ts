import {
  fetchServerObservation,
  type ServerObservationHttpRequest,
  type ServerObservationHttpResult,
} from './server-observation-http.js';
import type { RuntimeObservation } from '../layout/runtime-observation.js';

export const SERVER_OBSERVATION_UI_CONTRACT_VERSION = 'server-observation-ui/v1' as const;

export interface ServerObservationUiRequest
  extends Omit<ServerObservationHttpRequest, 'endpoint'> {
  readonly serverUrl?: string;
  readonly locationOrigin?: string;
}

export interface ServerObservationUiResult {
  readonly contractVersion: typeof SERVER_OBSERVATION_UI_CONTRACT_VERSION;
  readonly result: ServerObservationHttpResult;
  readonly observation: RuntimeObservation;
}

function browserOrigin(value: string | undefined): string | null {
  const source = value ?? (typeof location !== 'undefined' ? location.origin : '');
  if (!source) return null;
  try {
    const origin = new URL(source);
    if (origin.protocol !== 'http:' && origin.protocol !== 'https:') return null;
    return origin.origin;
  } catch {
    return null;
  }
}

function validBase(value: string): URL | null {
  try {
    const base = new URL(value);
    if (base.protocol !== 'http:' && base.protocol !== 'https:') return null;
    if (base.username || base.password || base.search || base.hash) return null;
    return base;
  } catch {
    return null;
  }
}

/**
 * Resolve the only two supported deployment shapes:
 * the same-origin Vercel adapter in HTTPS and the explicit FastAPI endpoint
 * used by local development or a separately configured server.
 */
export function resolveServerObservationEndpoint(
  serverUrl = '',
  locationOrigin?: string,
): string | null {
  const configured = serverUrl.trim().replace(/\/$/, '');
  if (!configured) {
    const origin = browserOrigin(locationOrigin);
    if (origin?.startsWith('https://')) return `${origin}/api/observability`;
    return 'http://127.0.0.1:8000/observability/observe';
  }

  const base = validBase(configured);
  if (!base) return null;
  const pathname = base.pathname.replace(/\/$/, '');
  if (pathname === '/api' || pathname.endsWith('/api')) {
    return `${base.origin}${pathname}/observability`;
  }
  return `${base.origin}${pathname}/observability/observe`;
}

function observationFor(result: ServerObservationHttpResult): RuntimeObservation {
  if (result.outcome !== 'observed') {
    const attempted = result.transport.attempted;
    return Object.freeze({
      source: 'runtime-observed',
      connection: attempted ? 'disconnected' : 'unknown',
      health: attempted ? 'failed' : 'unknown',
      severity: attempted ? 'critical' : 'info',
      fallback: attempted ? 'blocked' : 'unknown',
      authority: 'not-authorized',
      detail: `server-observation=${result.transport.reasonCode}`,
    });
  }

  const { projection } = result;
  const healthy = projection.health === 'healthy' && projection.fallback === 'available';
  const critical = projection.fallback === 'blocked';
  return Object.freeze({
    source: 'runtime-observed',
    connection: 'connected',
    health: healthy ? 'healthy' : critical ? 'failed' : 'degraded',
    severity: healthy ? 'none' : critical ? 'critical' : 'warning',
    fallback: projection.fallback,
    authority: 'not-authorized',
    detail: `server-observation=${projection.state};reasons=${projection.reasonCodes.join(',') || 'none'}`,
  });
}

export function projectServerObservationHttpToRuntime(
  result: ServerObservationHttpResult,
): RuntimeObservation {
  return observationFor(result);
}

export async function fetchServerObservationForUi(
  request: ServerObservationUiRequest = {},
): Promise<ServerObservationUiResult> {
  const {
    serverUrl,
    locationOrigin,
    ...httpRequest
  } = request;
  const endpoint = resolveServerObservationEndpoint(serverUrl, locationOrigin);
  const result = await fetchServerObservation({
    ...httpRequest,
    ...(endpoint ? { endpoint } : {}),
  });
  return Object.freeze({
    contractVersion: SERVER_OBSERVATION_UI_CONTRACT_VERSION,
    result,
    observation: observationFor(result),
  });
}
