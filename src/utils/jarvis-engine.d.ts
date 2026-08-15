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
export function processServer(
  messages: readonly JarvisMessage[],
  config?: JarvisConfig,
): Promise<string>;
