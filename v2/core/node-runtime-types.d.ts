declare module 'node:child_process' {
  interface WritableStdin {
    destroyed: boolean;
    write(data: string, callback?: (error?: Error | null) => void): boolean;
    end(): void;
  }
  interface ReadableStdout {}
  interface ChildProcess {
    stdin: WritableStdin;
    stdout: ReadableStdout;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'exit', listener: (code: number | null, signal: string | null) => void): this;
  }
  interface SpawnOptions {
    cwd?: string;
    env?: Record<string, string | undefined>;
    stdio?: ['pipe', 'pipe', 'pipe'];
  }
  export function spawn(executable: string, args?: string[], options?: SpawnOptions): ChildProcess;
}

declare module 'node:readline' {
  interface ReadlineInterface {
    on(event: 'line', listener: (line: string) => void): this;
    close(): void;
  }
  export function createInterface(options: {input: unknown}): ReadlineInterface;
}

declare const process: { env: Record<string, string | undefined> };
