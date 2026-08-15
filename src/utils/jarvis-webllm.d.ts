import type { JarvisConfig, JarvisMessage } from './jarvis-engine.js';

export interface WebLLMModel {
  readonly id: string;
  readonly label: string;
}

export declare const WEBLLM_MODELS: readonly WebLLMModel[];
export declare const DEFAULT_WEBLLM_MODEL: string;

export interface WebLLMCallbacks {
  onProgress?: (text: string) => void;
  onToken?: (partial: string) => void;
}

export function getLoadedModel(): string | null;
export function processWebLLM(messages: readonly JarvisMessage[], config: JarvisConfig, callbacks?: WebLLMCallbacks): Promise<string>;
