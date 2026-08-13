declare const process: {
  env: Record<string, string | undefined>;
};

declare module 'node:child_process' {
  interface WritablePipe {
    destroyed: boolean;
    write(data: string, callback: (error?: Error) => void): boolean;
    end(): void;
  }

  interface ReadablePipe {}

  interface RuntimeChild {
    stdin: WritablePipe | null;
    stdout: ReadablePipe | null;
    on(event: 'error', listener: (error: Error) => void): this;
    on(event: 'exit', listener: (code: number | null, signal: string | null) => void): this;
  }

  export function spawn(
    executable: string,
    args: string[],
    options: {
      cwd?: string;
      env?: Record<string, string | undefined>;
      stdio: ['pipe', 'pipe', 'pipe'];
    }
  ): RuntimeChild;
}

declare module 'node:readline' {
  interface Interface {
    on(event: 'line', listener: (line: string) => void): this;
    close(): void;
  }

  export function createInterface(options: { input: unknown }): Interface;
}
