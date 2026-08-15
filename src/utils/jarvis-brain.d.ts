export interface MemoryInput {
  readonly text: string;
  readonly source?: string;
  readonly tags?: readonly string[];
}

export interface JarvisMemory {
  readonly id: string;
  readonly text: string;
  readonly source: string;
  readonly tags: readonly string[];
  readonly ts: number;
  readonly conceptIds?: readonly string[];
  readonly codeIds?: readonly string[];
  readonly score?: number;
  readonly cloud?: boolean;
}

export function codeContext(): string;
export function addMemory(input: MemoryInput): JarvisMemory | null;
export function searchMemories(query: string, limit?: number): readonly JarvisMemory[];
export function getMemories(): readonly JarvisMemory[];
export function clearMemories(): void;
export function memoryContext(query: string, limit?: number): string;
export function conceptLabel(id: string): string;
export function captureConversation(text: string): JarvisMemory | null;
export function captureReply(text: string): JarvisMemory | null;
