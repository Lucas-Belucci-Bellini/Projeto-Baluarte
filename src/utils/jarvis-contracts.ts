import type { PermissionId } from './jarvis-permissoes.js';

export const SESSION_MODES = [
  'local',
  'webllm',
  'hermes-agente',
  'claude',
  'ollama',
  'hermes-local',
  'noticias',
  'servidor',
  'hermes',
  'claude-servidor',
  'openclaw',
  'agente',
] as const;

export type SessionMode = (typeof SESSION_MODES)[number];
export type JarvisMessageRole = 'user' | 'jarvis' | 'tool' | 'system';
export type AdapterEventKind = 'reply' | 'token' | 'progress' | 'tool-call' | 'failure';
export type FailureReason = 'setup' | 'network' | 'permission' | 'timeout' | 'model' | 'unknown';

export interface JarvisMessage {
  readonly id: string;
  readonly sessionId: string;
  readonly role: JarvisMessageRole;
  readonly text: string;
  readonly ts: number;
  readonly meta?: Readonly<Record<string, string>>;
}

export interface JarvisSession {
  readonly id: string;
  readonly title: string;
  readonly mode: SessionMode;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/** Configuração permitida na superfície. Segredos ficam fora deste contrato. */
export interface JarvisPublicConfig {
  readonly mode: SessionMode;
  readonly systemPrompt: string;
  readonly memoryOn: boolean;
  readonly humanize: boolean;
  readonly skillsOn: boolean;
  readonly model?: string;
  readonly serverUrl?: string;
  readonly openclawUrl?: string;
}

export interface ConversationContext {
  readonly briefing?: string;
  readonly status?: string;
  readonly memory?: readonly string[];
}

export interface ConversationRequest {
  readonly text: string;
  readonly session: JarvisSession | null;
  readonly messages: readonly JarvisMessage[];
  readonly config: JarvisPublicConfig;
  readonly context: ConversationContext;
}

export interface ToolCallEvent {
  readonly name: string;
  readonly input: Readonly<Record<string, unknown>>;
  readonly result?: ToolResult;
  readonly permission: PermissionId;
  readonly durationMs?: number;
}

export interface ToolResult {
  readonly ok: boolean;
  readonly text?: string;
  readonly error?: string;
}

export interface AdapterEvent {
  readonly kind: AdapterEventKind;
  readonly text?: string;
  readonly progress?: number;
  readonly toolCall?: ToolCallEvent;
  readonly reason?: FailureReason;
  readonly error?: string;
}

export interface JarvisAdapter {
  readonly mode: SessionMode;
  converse(request: ConversationRequest, signal?: AbortSignal): Promise<readonly AdapterEvent[]>;
}

export function isSessionMode(value: unknown): value is SessionMode {
  return typeof value === 'string' && (SESSION_MODES as readonly string[]).includes(value);
}

export function isMessageRole(value: unknown): value is JarvisMessageRole {
  return value === 'user' || value === 'jarvis' || value === 'tool' || value === 'system';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function isJarvisMessage(value: unknown): value is JarvisMessage {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.sessionId === 'string'
    && isMessageRole(value.role)
    && typeof value.text === 'string'
    && typeof value.ts === 'number'
    && Number.isFinite(value.ts);
}

export function isJarvisSession(value: unknown): value is JarvisSession {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string'
    && typeof value.title === 'string'
    && isSessionMode(value.mode)
    && typeof value.createdAt === 'number'
    && typeof value.updatedAt === 'number'
    && Number.isFinite(value.createdAt)
    && Number.isFinite(value.updatedAt);
}

export function isJarvisPublicConfig(value: unknown): value is JarvisPublicConfig {
  if (!isRecord(value)) return false;
  return isSessionMode(value.mode)
    && typeof value.systemPrompt === 'string'
    && typeof value.memoryOn === 'boolean'
    && typeof value.humanize === 'boolean'
    && typeof value.skillsOn === 'boolean'
    && (value.model === undefined || typeof value.model === 'string')
    && (value.serverUrl === undefined || typeof value.serverUrl === 'string')
    && (value.openclawUrl === undefined || typeof value.openclawUrl === 'string');
}

export function isConversationRequest(value: unknown): value is ConversationRequest {
  if (!isRecord(value) || typeof value.text !== 'string' || !Array.isArray(value.messages) || !isJarvisPublicConfig(value.config)) return false;
  if (value.session !== null && !isJarvisSession(value.session)) return false;
  if (!isRecord(value.context)) return false;
  return value.messages.every(isJarvisMessage);
}

export function hasSecretLikeKey(value: unknown): boolean {
  if (!isRecord(value)) return false;
  return Object.keys(value).some((key) => /token|secret|password|api[-_]?key/i.test(key));
}
