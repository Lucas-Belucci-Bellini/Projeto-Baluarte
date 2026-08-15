export interface TerminalIO {
  readonly println: (message: string) => void;
  readonly clear: () => void;
}

export interface TerminalEnvironment {
  [key: string]: string;
}

export interface TerminalContext {
  terminal: TerminalIO;
  cwd: string;
  env: TerminalEnvironment;
  aliases: Record<string, string>;
  history: string[];
  bootedAt: number;
  setCwd: (path: string) => void;
}

export interface TerminalExecutionResult {
  readonly stdout: string;
  readonly stderr: string;
  readonly exit: number;
}

export interface TerminalCommandResult {
  readonly stdout?: string;
  readonly stderr?: string;
  readonly exit?: number;
}

export interface TerminalCommandContext extends TerminalContext {
  readonly stdin: string;
}

export interface TerminalCommand {
  readonly run: (
    args: readonly string[],
    context: TerminalCommandContext,
  ) => string | TerminalCommandResult | Promise<string | TerminalCommandResult>;
}

export function execute(line: string, context: TerminalContext): Promise<TerminalExecutionResult>;
export function autocomplete(prefix: string, context: TerminalContext): readonly string[];
export function createContext(terminal: TerminalIO): TerminalContext;
