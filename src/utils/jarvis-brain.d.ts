export interface MemoryInput {
  readonly text: string;
  readonly source?: string;
}

export function codeContext(): string;
export function addMemory(input: MemoryInput): void;
