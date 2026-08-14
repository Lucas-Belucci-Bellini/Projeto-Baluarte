export interface RepoMemoryEntry {
  readonly text: string;
  readonly source?: string;
  readonly conceptIds?: readonly string[];
  readonly codeIds?: readonly string[];
  readonly ts?: number;
  readonly [key: string]: unknown;
}

export interface RepoSaveResult {
  readonly ok?: boolean;
  readonly skip?: boolean;
  readonly dup?: boolean;
  readonly total?: number;
  readonly error?: string;
  readonly [key: string]: unknown;
}

export function repoEnabled(): boolean | null;
export function saveEntry(entry: RepoMemoryEntry): Promise<RepoSaveResult>;
export function listEntries(): Promise<RepoMemoryEntry[]>;
