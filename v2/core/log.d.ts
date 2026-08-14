export interface ModuleLogger {
  readonly modulo: string;
  debug(message: string, fields?: Record<string, unknown>): void;
  info(message: string, fields?: Record<string, unknown>): void;
  aviso(message: string, fields?: Record<string, unknown>): void;
  erro(
    message: string,
    error?: unknown,
    fields?: Record<string, unknown>,
  ): void;
  medir<T>(message: string, operation: () => Promise<T>): Promise<T>;
}

export function criarLog(moduleId: string): ModuleLogger;
