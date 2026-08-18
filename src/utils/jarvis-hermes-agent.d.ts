import type { JarvisConfig, JarvisMessage, JarvisToolCallback } from './jarvis-engine.js';

/** O modelo padrão do agente local — Hermes 2 Pro, forte em tool-calling. */
export declare const HERMES_AGENT_DEFAULT: string;

export interface HermesAgentCallbacks {
  /** Texto e fração (0..1) do download/carga do modelo — mesmos dois do WebLLM. */
  onProgress?: (text: string, fraction: number) => void;
  onToken?: (partial: string) => void;
}

export declare function processHermesAgent(
  messages: readonly JarvisMessage[],
  config: JarvisConfig,
  onTool: JarvisToolCallback,
  callbacks?: HermesAgentCallbacks,
): Promise<string>;
