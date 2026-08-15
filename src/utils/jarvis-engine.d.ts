export interface JarvisChartData {
  readonly labels: readonly string[];
  readonly values: readonly number[];
}

export interface JarvisChartPayload {
  readonly type: string;
  readonly title: string;
  readonly data: JarvisChartData;
}

export type JarvisLocalAction =
  | { readonly type: 'chart'; readonly payload: JarvisChartPayload }
  | { readonly type: 'navigate'; readonly payload: string };

export interface JarvisLocalResult {
  readonly text: string;
  readonly action?: JarvisLocalAction;
}

export interface JarvisMessage {
  readonly role: 'user' | 'jarvis' | 'tool' | 'system';
  readonly text: string;
}

export interface JarvisConfig {
  mode?: string;
  systemPrompt?: string;
  apiKey?: string;
  model?: string;
  serverUrl?: string;
  ollamaUrl?: string;
  [key: string]: unknown;
}

export function loadConfig(): JarvisConfig;
export function saveConfig(config: JarvisConfig): void;
export function resolveServerBase(serverUrl?: string): string;
export function processLocal(message: string): JarvisLocalResult;
export function getBaluarteBriefing(): string;
export function processServer(
  messages: readonly JarvisMessage[],
  config?: JarvisConfig,
): Promise<string>;
