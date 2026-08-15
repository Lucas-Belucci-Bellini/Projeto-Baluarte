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
  readonly role: 'user' | 'assistant' | 'jarvis' | 'tool' | 'system';
  readonly text?: string;
  readonly content?: string;
}

export type JarvisConversation = JarvisMessage[];
export type JarvisToolCallback = (name: string, input: unknown, result: Record<string, unknown> | null) => void;

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
export function processServer(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processClaude(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processOllama(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processHermes(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processClaudeServer(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processOpenClaw(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processAgent(messages: readonly JarvisMessage[], config?: JarvisConfig, onTool?: JarvisToolCallback): Promise<string>;
