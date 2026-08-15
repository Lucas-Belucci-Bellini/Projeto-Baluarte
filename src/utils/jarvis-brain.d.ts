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
export function syncRepoMemories(): Promise<number>;
export function syncUserMemories(): Promise<number>;
export function addMemory(input: MemoryInput): JarvisMemory | null;
export function searchMemories(query: string, limit?: number): readonly JarvisMemory[];
export function getMemories(): readonly JarvisMemory[];
export function clearMemories(): void;
export function deleteMemory(id: string): void;
export function memoryContext(query: string, limit?: number): string;
export interface MemoryStats {
  readonly total: number;
  readonly byConcept: Readonly<Record<string, number>>;
}

export function memoryStats(): MemoryStats;
export function codeMemoryCounts(): Readonly<Record<string, number>>;
export function conceptLabel(id: string): string;
export function conceptRoute(id: string): string | null;
export function captureConversation(text: string): JarvisMemory | null;
export function captureReply(text: string): JarvisMemory | null;
