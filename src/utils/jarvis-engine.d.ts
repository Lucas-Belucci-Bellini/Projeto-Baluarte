export interface JarvisMessage {
  readonly role: 'user' | 'jarvis' | 'tool' | 'system';
  readonly text: string;
}

export interface JarvisConfig {
  readonly mode?: string;
  readonly systemPrompt?: string;
  readonly [key: string]: unknown;
}

export function loadConfig(): JarvisConfig;
export function processServer(
  messages: readonly JarvisMessage[],
  config?: JarvisConfig,
): Promise<string>;
