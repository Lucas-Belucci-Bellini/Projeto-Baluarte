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
  /** Pergunta atual usada apenas para seleção lazy conservadora de schemas. */
  toolFocus?: string;
  [key: string]: unknown;
}

/**
 * O que o `/health` do backend responde.
 *
 * `hasKey` é o que a tela do modo Servidor usa para dizer "online · chave
 * Gemini OK" contra "online · falta GEMINI_API_KEY" — as duas coisas são
 * "online", e confundi-las manda o operador procurar defeito no lugar errado.
 * O índice aberto existe porque o backend pode acrescentar campos sem que este
 * arquivo saiba.
 */
export type ServerHealthConnection = 'unknown' | 'connected' | 'disconnected';
export type ServerHealthState = 'unknown' | 'healthy' | 'degraded' | 'failed' | 'exhausted';
export type ServerHealthSeverity = 'none' | 'info' | 'warning' | 'critical';
export type ServerHealthFallback = 'available' | 'degraded' | 'blocked' | 'unknown';

export interface ServerHealth {
  readonly contractVersion?: 'server-health/v1' | string;
  readonly source?: 'runtime-observed' | string;
  readonly connection?: ServerHealthConnection;
  readonly health?: ServerHealthState;
  readonly severity?: ServerHealthSeverity;
  readonly fallback?: ServerHealthFallback;
  readonly authority?: 'not-authorized' | string;
  readonly service?: string;
  readonly detail?: string;
  readonly ok?: boolean;
  readonly model?: string;
  readonly hasKey?: boolean;
  readonly [chave: string]: unknown;
}

export function loadConfig(): JarvisConfig;
export function saveConfig(config: JarvisConfig): void;
export function resolveServerBase(serverUrl?: string): string;

/**
 * Bate no `/health` do backend.
 *
 * **Rejeita** quando o servidor está fora ou responde não-2xx — é assim que a
 * tela distingue "offline" de "online sem chave", que não são o mesmo aviso.
 */
export function healthCheckServer(serverUrl?: string): Promise<ServerHealth>;

/** O histórico salvo. `[]` quando o storage não tem nada utilizável. */
export function loadHistory(): JarvisMessage[];
/** Guarda o histórico, cortado nas últimas 100 mensagens. */
export function saveHistory(history: readonly JarvisMessage[]): void;
export function clearHistory(): void;

export function processLocal(message: string): JarvisLocalResult;

/**
 * Resumo do universo Baluarte para injetar como contexto da IA.
 *
 * `compact` encurta o briefing — a página o usa em todos os modos **menos** os
 * de agente, que precisam do texto inteiro para escolher ferramenta.
 */
export function getBaluarteBriefing(options?: { readonly compact?: boolean }): string;

/**
 * Briefing de notícias com busca web. Recebe a **pergunta**, não a conversa.
 *
 * Somente leitura: não envia nem publica nada.
 */
export function processNewsBriefing(question: string, config?: JarvisConfig): Promise<string>;

export function processServer(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processClaude(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processOllama(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processHermes(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processClaudeServer(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processOpenClaw(messages: readonly JarvisMessage[], config?: JarvisConfig): Promise<string>;
export function processAgent(messages: readonly JarvisMessage[], config?: JarvisConfig, onTool?: JarvisToolCallback): Promise<string>;
