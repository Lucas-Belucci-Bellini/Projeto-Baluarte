import http, { type IncomingMessage, type Server, type ServerResponse } from 'node:http';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { parseSpotifySoloistPlayback, type SpotifySoloistPlaybackSnapshot } from '../src/utils/jarvis-spotify-soloist';

const execFileAsync = promisify(execFile);
const DEFAULT_HOST = '127.0.0.1';
const DEFAULT_PORT = 18791;
const DEFAULT_CTL_BINARY = 'soloist';
const MAX_RESPONSE_BYTES = 64 * 1024;
const COMMAND_TIMEOUT_MS = 4_000;

interface ExecResult {
  readonly stdout: string | Buffer;
  readonly stderr: string | Buffer;
}

export interface SpotifySoloistCtlRunner {
  (args: readonly string[]): Promise<ExecResult>;
}

export interface SpotifySoloistBridgeOptions {
  readonly host?: string;
  readonly port?: number;
  readonly allowedOrigin?: string;
  readonly bridgeToken?: string;
  readonly ctlBinary?: string;
  readonly dataDir?: string;
  readonly wsEndpoint?: string;
  readonly runner?: SpotifySoloistCtlRunner;
}

interface BridgeState extends SpotifySoloistPlaybackSnapshot {
  readonly source: 'spotify-soloist';
  readonly readOnly: true;
}

function envPositiveInteger(name: string, fallback: number): number {
  const value = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function normalizeHostname(value: string): string {
  return value.toLowerCase().replace(/^\[/, '').replace(/\]$/, '');
}

function assertLoopbackHost(value: string): string {
  const hostname = normalizeHostname(value.trim());
  if (!['127.0.0.1', 'localhost', '::1'].includes(hostname)) throw new Error('SPOTIFY_SOLOIST_BRIDGE_LOOPBACK_REQUIRED');
  return hostname;
}

function assertLoopbackWs(value: string): string {
  const candidate = value.trim();
  const match = candidate.match(/^(?:ws:\/\/)?(127\.0\.0\.1|localhost|\[::1\]|::1):(\d{1,5})$/i);
  if (!match) throw new Error('SPOTIFY_SOLOIST_WS_LOOPBACK_REQUIRED');
  const port = Number(match[2]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('SPOTIFY_SOLOIST_WS_PORT_INVALID');
  return `${match[1]}:${port}`;
}

function allowedOrigin(request: IncomingMessage, configuredOrigin: string | null): string | null {
  const origin = request.headers.origin;
  if (typeof origin !== 'string') return null;
  if (configuredOrigin) return origin === configuredOrigin ? origin : null;
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin) ? origin : null;
}

function writeJson(response: ServerResponse, status: number, body: Record<string, unknown>, origin: string | null = null): void {
  if (origin) response.setHeader('access-control-allow-origin', origin);
  response.setHeader('vary', 'Origin');
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('cache-control', 'no-store');
  response.statusCode = status;
  response.end(JSON.stringify(body));
}

function tokenMatches(expected: string | null, received: string | undefined): boolean {
  return expected !== null && typeof received === 'string' && received.length > 0 && expected === received;
}

function safeEnv(): NodeJS.ProcessEnv {
  const childEnv = { ...process.env };
  delete childEnv.SOLOIST_API_KEY;
  delete childEnv.SPOTIFY_SOLOIST_API_KEY;
  delete childEnv.SPOTIFY_SOLOIST_KEY;
  return childEnv;
}

function ctlArgs(options: SpotifySoloistBridgeOptions): string[] {
  const args: string[] = [];
  if (options.dataDir) args.push('--data-dir', options.dataDir);
  if (options.wsEndpoint) args.push('--ws', assertLoopbackWs(options.wsEndpoint));
  args.push('now', '--json');
  return args;
}

function defaultRunner(binary: string): SpotifySoloistCtlRunner {
  return async (args) => {
    const result = await execFileAsync(binary, [...args], {
      cwd: process.cwd(),
      env: safeEnv(),
      timeout: COMMAND_TIMEOUT_MS,
      maxBuffer: MAX_RESPONSE_BYTES,
      windowsHide: true,
    });
    return { stdout: result.stdout, stderr: result.stderr };
  };
}

function decodeSnapshot(stdout: string): SpotifySoloistPlaybackSnapshot | null {
  if (Buffer.byteLength(stdout, 'utf8') > MAX_RESPONSE_BYTES) return null;
  try {
    return parseSpotifySoloistPlayback(JSON.parse(stdout) as unknown);
  } catch {
    return null;
  }
}

function safeState(snapshot: SpotifySoloistPlaybackSnapshot): BridgeState {
  return Object.freeze({ ...snapshot, source: 'spotify-soloist', readOnly: true });
}

export function createSpotifySoloistBridge(options: SpotifySoloistBridgeOptions = {}): {
  readonly server: Server;
  readonly listen: () => Promise<{ readonly address: string; readonly port: number }>;
  readonly close: () => Promise<void>;
} {
  const host = assertLoopbackHost(options.host ?? process.env.BALUARTE_SOLOIST_BRIDGE_HOST ?? DEFAULT_HOST);
  const port = options.port ?? envPositiveInteger('BALUARTE_SOLOIST_BRIDGE_PORT', DEFAULT_PORT);
  const configuredOrigin = options.allowedOrigin ?? process.env.BALUARTE_ALLOWED_ORIGIN ?? null;
  const bridgeToken = options.bridgeToken ?? process.env.BALUARTE_SOLOIST_BRIDGE_TOKEN ?? null;
  const runner = options.runner ?? defaultRunner(options.ctlBinary ?? process.env.SOLOIST_CTL_BINARY ?? DEFAULT_CTL_BINARY);
  const args = ctlArgs({
    ...options,
    dataDir: options.dataDir ?? process.env.SOLOIST_DATA_DIR,
    wsEndpoint: options.wsEndpoint ?? process.env.SOLOIST_WS_ENDPOINT,
  });

  const server = http.createServer((request, response) => {
    void handleRequest(request, response);
  });

  async function handleRequest(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const origin = allowedOrigin(request, configuredOrigin);
    const method = request.method ?? 'GET';
    const path = request.url?.split('?')[0] ?? '/';

    if (method === 'OPTIONS') {
      if (!origin) return writeJson(response, 403, { ok: false, error: 'origin_not_allowed' });
      response.setHeader('access-control-allow-origin', origin);
      response.setHeader('access-control-allow-methods', 'GET, OPTIONS');
      response.setHeader('access-control-allow-headers', 'accept, x-baluarte-bridge-token');
      response.setHeader('vary', 'Origin');
      response.statusCode = 204;
      response.end();
      return;
    }

    if (request.headers.origin && !origin) {
      return writeJson(response, 403, { ok: false, error: 'origin_not_allowed' });
    }
    if (path === '/health' && method === 'GET') {
      return writeJson(response, 200, {
        ok: true,
        service: 'spotify-soloist-bridge',
        mode: 'read-only',
        authority: 'not-authorized',
        tokenConfigured: bridgeToken !== null,
      }, origin);
    }
    if (path !== '/v1/spotify/playback' || method !== 'GET') {
      return writeJson(response, 404, { ok: false, error: 'route_not_found' }, origin);
    }
    const receivedToken = Array.isArray(request.headers['x-baluarte-bridge-token'])
      ? request.headers['x-baluarte-bridge-token'][0]
      : request.headers['x-baluarte-bridge-token'];
    if (!tokenMatches(bridgeToken, receivedToken)) {
      return writeJson(response, bridgeToken === null ? 503 : 401, {
        ok: false,
        error: bridgeToken === null ? 'bridge_token_not_configured' : 'bridge_token_invalid',
      }, origin);
    }

    try {
      const result = await runner(args);
      const snapshot = decodeSnapshot(String(result.stdout));
      if (!snapshot) return writeJson(response, 502, { ok: false, error: 'soloist_response_invalid' }, origin);
      return writeJson(response, 200, { ok: true, ...safeState(snapshot) }, origin);
    } catch {
      return writeJson(response, 503, { ok: false, error: 'soloist_unavailable' }, origin);
    }
  }

  return {
    server,
    listen: () => new Promise((resolve) => server.listen(port, host, () => {
      const address = server.address();
      const actualPort = typeof address === 'object' && address !== null ? address.port : port;
      resolve({ address: host, port: actualPort });
    })),
    close: () => new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())),
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bridge = createSpotifySoloistBridge();
  const address = await bridge.listen();
  console.log(`[baluarte] Spotify Soloist bridge read-only em http://${address.address}:${address.port}`);
  console.log('[baluarte] API key permanece somente no processo de inicialização do daemon Soloist; nunca é lida pela ponte.');
}
