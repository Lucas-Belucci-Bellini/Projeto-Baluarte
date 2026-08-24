export const AUTH_SESSION_DEFAULT_TTL_SECONDS = 3_600;

export interface AuthSessionRecord {
  readonly access_token: string;
  readonly refresh_token: string;
  readonly expires_at: number;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly expiresAt: number;
}

type AuthRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is AuthRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function nonEmptyString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function positiveInteger(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : null;
}

function nowSeconds(now: number): number {
  return Number.isFinite(now) && now >= 0 ? Math.floor(now) : Math.floor(Date.now() / 1000);
}

function expiryFromProvider(record: AuthRecord, now: number): number | null {
  if ('expires_at' in record) return positiveInteger(record.expires_at);
  if (!('expires_in' in record)) return now + AUTH_SESSION_DEFAULT_TTL_SECONDS;
  const expiresIn = positiveInteger(record.expires_in);
  return expiresIn === null ? null : now + expiresIn;
}

export function projectAuthSession(value: unknown, now = Math.floor(Date.now() / 1000)): AuthSessionRecord | null {
  if (!isRecord(value)) return null;
  const accessToken = nonEmptyString(value.access_token);
  const refreshToken = nonEmptyString(value.refresh_token);
  if (!accessToken || !refreshToken) return null;
  const referenceNow = nowSeconds(now);
  const expiresAt = expiryFromProvider(value, referenceNow);
  if (expiresAt === null) return null;
  return Object.freeze({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
  });
}

export function projectStoredAuthSession(value: unknown): AuthSessionRecord | null {
  return projectAuthSession(value, 0);
}

export function projectRefreshSession(
  value: unknown,
  previousRefreshToken: unknown,
  now = Math.floor(Date.now() / 1000),
): AuthSessionRecord | null {
  if (!isRecord(value)) return null;
  const accessToken = nonEmptyString(value.access_token);
  const refreshToken = nonEmptyString(value.refresh_token) ?? nonEmptyString(previousRefreshToken);
  if (!accessToken || !refreshToken) return null;
  const referenceNow = nowSeconds(now);
  const expiresIn = 'expires_in' in value
    ? positiveInteger(value.expires_in)
    : AUTH_SESSION_DEFAULT_TTL_SECONDS;
  const expiresAt = expiresIn === null ? null : referenceNow + expiresIn;
  if (expiresAt === null) return null;
  return Object.freeze({
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresAt,
  });
}

export function toPublicAuthSession(value: AuthSessionRecord | null): AuthSession | null {
  if (!value) return null;
  return Object.freeze({
    accessToken: value.access_token,
    refreshToken: value.refresh_token,
    expiresAt: value.expires_at,
  });
}
