export interface DbFetchOptions {
  readonly method?: string;
  readonly body?: unknown;
  readonly token?: string | null;
  readonly prefer?: string;
  readonly headers?: Readonly<Record<string, string>>;
  readonly timeoutMs?: number;
}

export function supabaseConfigured(): boolean;
export function supabaseUrl(): string;
export function supabaseAnonKey(): string;
export function dbFetch(path: string, options?: DbFetchOptions): Promise<unknown>;
export function dbSelect(table: string, query?: string): Promise<unknown>;
export function dbInsert(table: string, row: unknown, token?: string | null): Promise<unknown>;
export function dbRpc(fn: string, args?: unknown, token?: string | null): Promise<unknown>;
