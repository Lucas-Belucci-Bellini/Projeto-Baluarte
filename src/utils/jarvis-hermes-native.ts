/**
 * Cérebro NATIVO do Hermes agente (Fatia 2, app desktop — issue #310/#231).
 *
 * Quando o Baluarte roda DENTRO do Launcher (Electron) e o motor embutido
 * (llama.cpp/GGUF) está disponível, o agente usa ELE em vez do WebLLM: sem
 * navegador, sem WebGPU, modelos maiores. É a mesma interface `brain({system,
 * messages})` do núcleo de agente — só muda quem gera o texto.
 *
 * A ponte é o funil seguro do preload: `window.baluarte.invoke(canal, payload)`.
 * Tudo degrada com elegância: sem app / sem motor → `{ available: false }` e o
 * agente cai no WebLLM automaticamente.
 */

export interface NativeHermesMessage {
  readonly role: string;
  readonly text?: string;
  readonly content?: string;
}

export interface NativeHermesPrompt {
  readonly system?: string;
  readonly messages?: readonly NativeHermesMessage[];
}

export interface NativeHermesStatus {
  readonly available: boolean;
  readonly downloading?: boolean;
  readonly pct?: number;
  readonly model?: string;
  readonly backend?: string;
  readonly fatal?: boolean;
  readonly engine?: string;
  readonly reason?: string;
  readonly code?: string;
  readonly hint?: string;
  readonly [key: string]: unknown;
}

export type NativeHermesBrain = (prompt: NativeHermesPrompt) => Promise<string>;

interface NativeBridge {
  readonly native?: boolean;
  invoke(channel: string, payload?: Readonly<Record<string, unknown>>): Promise<unknown>;
}

declare global {
  interface Window {
    baluarte?: NativeBridge;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getBridge(): NativeBridge | undefined {
  return typeof window !== 'undefined' ? window.baluarte : undefined;
}

/** Roda dentro do Launcher? (ponte nativa presente) */
function hasBridge(): boolean {
  const bridge = getBridge();
  return bridge?.native === true && typeof bridge.invoke === 'function';
}

/** Status do motor embutido. Nunca lança — devolve `{ available: false }`. */
export async function nativeHermesStatus(): Promise<NativeHermesStatus> {
  if (!hasBridge()) return { available: false };
  try {
    const result = await getBridge()?.invoke('hermes:status', {});
    if (!isRecord(result)) return { available: false };
    return {
      ...result,
      available: result.available === true,
    };
  } catch {
    return { available: false };
  }
}

/** Cérebro para o núcleo de agente usando o motor embutido do app. */
export function makeNativeBrain(): NativeHermesBrain {
  return async ({ system = '', messages = [] }: NativeHermesPrompt): Promise<string> => {
    const bridge = getBridge();
    if (!bridge || !hasBridge()) {
      throw new Error('MOTOR_NATIVO_INDISPONIVEL: Baluarte Launcher não está disponível.');
    }

    const result = await bridge.invoke('hermes:generate', {
      system,
      messages,
      temperature: 0.2,
      maxTokens: 1024,
    });
    if (!isRecord(result)) return '';
    if (typeof result.text === 'string') return result.text;
    if (typeof result.content === 'string') return result.content;
    return '';
  };
}
