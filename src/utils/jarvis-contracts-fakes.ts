import type {
  AdapterEvent,
  ConversationRequest,
  JarvisAdapter,
  SessionMode,
  ToolCallEvent,
} from './jarvis-contracts.js';
import { isConversationRequest } from './jarvis-contracts.js';

export interface FakeAdapterOptions {
  readonly mode: SessionMode;
  readonly reply?: string;
  readonly progress?: readonly number[];
  readonly toolCall?: ToolCallEvent;
  readonly failure?: { readonly reason: AdapterEvent['reason']; readonly error: string };
  readonly delayMs?: number;
}

function abortError(): Error {
  return new Error('fake adapter aborted');
}

async function wait(delayMs: number, signal?: AbortSignal): Promise<void> {
  if (delayMs <= 0) return;
  if (signal?.aborted) throw abortError();
  await new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, delayMs);
    const onAbort = (): void => {
      clearTimeout(timer);
      reject(abortError());
    };
    signal?.addEventListener('abort', onAbort, { once: true });
  });
}

export function createFakeAdapter(options: FakeAdapterOptions): JarvisAdapter {
  return {
    mode: options.mode,
    async converse(request: ConversationRequest, signal?: AbortSignal): Promise<readonly AdapterEvent[]> {
      if (!isConversationRequest(request)) {
        return [{ kind: 'failure', reason: 'setup', error: 'conversation request inválida' }];
      }
      try {
        await wait(options.delayMs ?? 0, signal);
      } catch {
        return [{ kind: 'failure', reason: 'timeout', error: 'fake adapter abortado' }];
      }
      if (options.failure) return [{ kind: 'failure', reason: options.failure.reason, error: options.failure.error }];
      const events: AdapterEvent[] = [];
      options.progress?.forEach((progress) => events.push({ kind: 'progress', progress }));
      if (options.toolCall) events.push({ kind: 'tool-call', toolCall: options.toolCall });
      const reply = options.reply ?? `fake:${options.mode}:${request.text}`;
      if (reply) {
        for (const token of reply.split(' ')) events.push({ kind: 'token', text: `${token} ` });
        events.push({ kind: 'reply', text: reply });
      }
      return events;
    },
  };
}

export function createFakeAdapters(reply = 'resposta fake'): ReadonlyMap<SessionMode, JarvisAdapter> {
  const modes: readonly SessionMode[] = [
    'local', 'webllm', 'hermes-agente', 'claude', 'ollama', 'hermes-local',
    'noticias', 'servidor', 'hermes', 'claude-servidor', 'openclaw', 'agente',
  ];
  return new Map(modes.map((mode) => [mode, createFakeAdapter({ mode, reply })]));
}

export function textFromAdapterEvents(events: readonly AdapterEvent[]): string {
  const reply = events.find((event) => event.kind === 'reply');
  if (reply?.text) return reply.text;
  return events.filter((event) => event.kind === 'token').map((event) => event.text ?? '').join('').trim();
}
