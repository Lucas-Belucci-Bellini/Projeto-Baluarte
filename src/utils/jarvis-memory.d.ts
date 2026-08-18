/**
 * JARVIS Memory — persistência das conversas em IndexedDB.
 *
 * Dois stores: `sessions` (a conversa) e `messages` (as falas, indexadas por
 * sessão).
 *
 * ── O que o tipo preserva ───────────────────────────────────────────────────
 * **Nenhuma função aqui rejeita.** Toda operação tem `catch` que cai para um
 * espelho em memória — se o IndexedDB falhar (modo privativo, cota, navegador
 * sem suporte), o JARVIS continua conversando e perde tudo no reload. É decisão
 * do módulo, e `isUsingFallback()` é como a tela conta isso ao operador.
 *
 * Por isso os retornos são `Promise<T>` e não `Promise<T | null>`: a falha não
 * vira valor ausente, vira armazenamento volátil.
 */

/** Uma conversa. `mode` é o motor em uso ('local', 'nuvem'…). */
export interface JarvisSession {
  readonly id: string;
  readonly title: string;
  readonly mode: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

/**
 * Quem falou.
 *
 * É união fechada de propósito: os três valores são os que a página grava, e
 * manter isso alinhado com o `role` do `jarvis-engine` é o que permite passar a
 * conversa direto para os motores sem conversão nem asserção.
 */
export type JarvisRole = 'user' | 'jarvis' | 'tool';

/**
 * Uma fala da conversa.
 *
 * `id` é atribuído pelo IndexedDB (autoIncrement) ou pelo espelho em memória —
 * é opcional porque a mensagem existe antes de ser gravada.
 */
export interface JarvisMessage {
  readonly id?: number;
  readonly sessionId: string;
  /** `'user'` e `'jarvis'` são espelhados no Nexus; `'tool'` não. */
  readonly role: JarvisRole;
  readonly text: string;
  readonly ts: number;
}

/** O que `updateSession` aceita mudar. `updatedAt` é sempre reescrito. */
export type JarvisSessionPatch = Partial<Pick<JarvisSession, 'title' | 'mode'>>;

/** Cria e persiste uma conversa. Título vazio vira "Nova conversa". */
export function createSession(
  title?: string | null,
  mode?: string | null,
): Promise<JarvisSession>;

/** As conversas, da mais recentemente atualizada para a mais antiga. */
export function listSessions(): Promise<JarvisSession[]>;

/** Atualiza a conversa e carimba `updatedAt`. Id inexistente é no-op. */
export function updateSession(id: string, patch: JarvisSessionPatch): Promise<void>;

/** Apaga a conversa **e** as mensagens dela. */
export function deleteSession(id: string): Promise<void>;

/**
 * Grava uma fala e toca o `updatedAt` da sessão.
 *
 * Mensagem de conversa (`user`/`jarvis`, não `tool`) é espelhada no Nexus em
 * best-effort: o IndexedDB é local e morre com limpeza de dados. A falha do
 * espelho **não** falha a gravação.
 */
export function addMessage(
  sessionId: string,
  role: JarvisRole,
  text: string,
): Promise<JarvisMessage>;

/** As falas de uma conversa, em ordem cronológica. */
export function getMessages(sessionId: string): Promise<JarvisMessage[]>;

/** Todas as falas de todas as conversas (para o recall entre sessões). */
export function getAllMessages(): Promise<JarvisMessage[]>;

/** Esvazia os dois stores. */
export function clearAll(): Promise<void>;

/**
 * O banco caiu para o espelho em memória?
 *
 * `true` significa que a conversa **não sobrevive ao reload** — é o que a tela
 * precisa dizer ao operador em vez de fingir persistência.
 */
export function isUsingFallback(): boolean;
