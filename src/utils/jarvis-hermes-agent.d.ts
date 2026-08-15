import type { JarvisConfig, JarvisMessage, JarvisToolCallback } from './jarvis-engine.js';

export interface HermesAgentCallbacks {
  onProgress?: (text: string) => void;
  onToken?: (partial: string) => void;
}

export declare function processHermesAgent(
  messages: readonly JarvisMessage[],
  config: JarvisConfig,
  onTool: JarvisToolCallback,
  callbacks?: HermesAgentCallbacks,
): Promise<string>;
