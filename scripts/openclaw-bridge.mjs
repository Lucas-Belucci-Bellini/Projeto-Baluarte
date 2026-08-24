#!/usr/bin/env node

import http from 'node:http';
import { timingSafeEqual } from 'node:crypto';

const DEFAULT_GATEWAY_URL = 'http://127.0.0.1:18789';
const DEFAULT_BRIDGE_HOST = '127.0.0.1';
const DEFAULT_BRIDGE_PORT = 18790;
const DEFAULT_TIMEOUT_MS = 60000;
const MAX_BODY_BYTES = 256 * 1024;

function envNumber(name, fallback) {
  const value = Number.parseInt(process.env[name] || '', 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function gatewayUrl() {
  return (process.env.OPENCLAW_GATEWAY_URL || DEFAULT_GATEWAY_URL).replace(/\/$/, '');
}

function allowedOrigin(request, configuredOverride = null) {
  const origin = request.headers.origin;
  const configured = (configuredOverride ?? process.env.BALUARTE_ALLOWED_ORIGIN ?? '').trim();
  if (!origin) return null;
  if (configured && origin === configured) return origin;
  if (configuredOverride !== null) return null;
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin)) return origin;
  return null;
}

function tokensMatch(expected, received) {
  if (typeof expected !== 'string' || typeof received !== 'string') return false;
  const expectedBytes = Buffer.from(expected);
  const receivedBytes = Buffer.from(received);
  if (expectedBytes.length !== receivedBytes.length) return false;
  return timingSafeEqual(expectedBytes, receivedBytes);
}

function normalizedHostname(hostname) {
  return String(hostname || '').toLowerCase().replace(/^\[/, '').replace(/\]$/, '');
}

function assertHarnessLoopbackUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error('harness_upstream_invalid_url');
  }
  const host = normalizedHostname(parsed.hostname);
  const loopback = host === 'localhost' || host === '127.0.0.1' || host === '::1';
  if (!loopback || !['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password) {
    throw new Error('harness_upstream_must_be_loopback');
  }
  return parsed.toString().replace(/\/$/, '');
}

function writeJson(response, status, body, origin = null) {
  if (origin) response.setHeader('access-control-allow-origin', origin);
  response.setHeader('vary', 'Origin');
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.statusCode = status;
  response.end(JSON.stringify(body));
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    let size = 0;
    let text = '';
    request.setEncoding('utf8');
    request.on('data', (chunk) => {
      size += Buffer.byteLength(chunk);
      if (size > MAX_BODY_BYTES) {
        reject(new Error('payload_too_large'));
        request.destroy();
        return;
      }
      text += chunk;
    });
    request.on('end', () => {
      try {
        resolve(JSON.parse(text || '{}'));
      } catch {
        reject(new Error('invalid_json'));
      }
    });
    request.on('error', reject);
  });
}

function authHeaders() {
  const token = process.env.OPENCLAW_GATEWAY_TOKEN;
  const password = process.env.OPENCLAW_GATEWAY_PASSWORD;
  if (token) return { authorization: `Bearer ${token}` };
  if (password) return { 'x-openclaw-password': password };
  return {};
}

function safeError(error) {
  if (error?.message === 'timeout') return 'OpenClaw timeout';
  if (error?.message === 'payload_too_large') return 'Payload excede o limite do bridge';
  return 'OpenClaw indisponível';
}

export function createOpenClawBridge(options = {}) {
  const upstream = options.gatewayUrl || gatewayUrl();
  const timeoutMs = options.timeoutMs || envNumber('OPENCLAW_TIMEOUT_MS', DEFAULT_TIMEOUT_MS);
  const configuredOrigin = options.allowedOrigin ?? null;
  const requiredBridgeToken = options.requiredBridgeToken ?? null;
  const fetchImpl = options.fetchImpl || fetch;
  const handler = async (request, response) => {
    const origin = allowedOrigin(request, configuredOrigin);
    const method = request.method || 'GET';
    const path = request.url || '/';

    if (method === 'OPTIONS') {
      if (!origin) return writeJson(response, 403, { ok: false, error: 'origin_not_allowed' });
      response.setHeader('access-control-allow-origin', origin);
      response.setHeader('access-control-allow-methods', 'GET, POST, OPTIONS');
      response.setHeader('access-control-allow-headers', 'content-type');
      response.setHeader('vary', 'Origin');
      response.statusCode = 204;
      response.end();
      return;
    }

    if (path === '/health' && method === 'GET') {
      return writeJson(response, 200, {
        ok: true,
        mode: options.healthMode || 'read-only-bridge',
        ...(options.authority ? { authority: options.authority } : {}),
      }, origin);
    }

    if (path !== '/v1/chat/completions' || method !== 'POST') {
      return writeJson(response, 404, { ok: false, error: 'route_not_found' }, origin);
    }

    if (request.headers.origin && !origin) {
      return writeJson(response, 403, { ok: false, error: 'origin_not_allowed' });
    }

    if (requiredBridgeToken !== null) {
      const receivedToken = Array.isArray(request.headers['x-baluarte-bridge-token'])
        ? request.headers['x-baluarte-bridge-token'][0]
        : request.headers['x-baluarte-bridge-token'];
      if (typeof receivedToken !== 'string' || receivedToken.length === 0) {
        return writeJson(response, 401, { ok: false, error: 'bridge_token_required' }, origin);
      }
      if (!tokensMatch(requiredBridgeToken, receivedToken)) {
        return writeJson(response, 401, { ok: false, error: 'bridge_token_invalid' }, origin);
      }
    }

    let payload;
    try {
      payload = await readJson(request);
    } catch (error) {
      return writeJson(response, 400, { ok: false, error: safeError(error) }, origin);
    }

    if (!payload || typeof payload !== 'object' || !Array.isArray(payload.messages)) {
      return writeJson(response, 400, { ok: false, error: 'messages_required' }, origin);
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const upstreamResponse = await fetchImpl(`${upstream}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...authHeaders() },
        body: JSON.stringify({
          model: payload.model || 'openclaw',
          stream: false,
          messages: payload.messages,
        }),
        signal: controller.signal,
      });
      const text = await upstreamResponse.text();
      if (!upstreamResponse.ok) {
        return writeJson(response, upstreamResponse.status, { ok: false, error: 'openclaw_http_error' }, origin);
      }
      response.statusCode = 200;
      if (origin) response.setHeader('access-control-allow-origin', origin);
      response.setHeader('vary', 'Origin');
      response.setHeader('content-type', 'application/json; charset=utf-8');
      response.end(text);
    } catch (error) {
      return writeJson(response, 502, { ok: false, error: safeError(error) }, origin);
    } finally {
      clearTimeout(timer);
    }
  };

  const server = http.createServer((request, response) => {
    void handler(request, response);
  });
  return {
    server,
    handler,
    listen(port = envNumber('BALUARTE_OPENCLAW_BRIDGE_PORT', DEFAULT_BRIDGE_PORT), host = process.env.BALUARTE_OPENCLAW_BRIDGE_HOST || DEFAULT_BRIDGE_HOST) {
      return new Promise((resolve) => server.listen(port, host, () => resolve(server.address())));
    },
    close() {
      return new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    },
  };
}

export function createOpenClawHarnessBridge(options = {}) {
  const bridgeToken = options.bridgeToken || process.env.BALUARTE_OPENCLAW_HARNESS_TOKEN;
  if (!bridgeToken) throw new Error('harness_bridge_token_required');
  const upstream = assertHarnessLoopbackUrl(
    options.gatewayUrl || process.env.BALUARTE_OPENCLAW_HARNESS_GATEWAY_URL || DEFAULT_GATEWAY_URL,
  );
  const allowedOriginValue = options.allowedOrigin
    || process.env.BALUARTE_OPENCLAW_HARNESS_ORIGIN
    || 'http://localhost:5173';
  if (!/^https?:\/\/[^/]+$/i.test(allowedOriginValue)) {
    throw new Error('harness_origin_invalid');
  }
  return createOpenClawBridge({
    ...options,
    gatewayUrl: upstream,
    allowedOrigin: allowedOriginValue,
    requiredBridgeToken: bridgeToken,
    healthMode: 'harness-only',
    authority: 'not-authorized',
  });
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const bridge = createOpenClawBridge();
  await bridge.listen();
  console.log(`[baluarte] OpenClaw bridge em http://${process.env.BALUARTE_OPENCLAW_BRIDGE_HOST || DEFAULT_BRIDGE_HOST}:${envNumber('BALUARTE_OPENCLAW_BRIDGE_PORT', DEFAULT_BRIDGE_PORT)}`);
}
