import type { NormalizedModuleManifest } from './manifest.js';

export interface ContextStorage {
  get(key: string, fallback?: unknown): unknown;
  set(key: string, value: unknown): boolean;
  chaves(): string[];
}

export interface ModuleContext {
  modulo: string;
  storage: ContextStorage;
  pode(permission: string): boolean;
  exigir(permission: string): true;
  declarado: {
    permissoes: string[];
    chaves: string[];
    emite: string[];
    depende: string[];
    concedidas(): string[];
  };
  [capacidade: string]: unknown;
}

export interface ContextDependencies {
  storage: {
    get(key: string): unknown;
    set(key: string, value: unknown): boolean;
    remove?(key: string): void;
  };
  bus?: unknown;
  apis?: unknown;
  metricas?: {
    paraModulo(id: string): unknown;
  };
  trabalho?: {
    paraModulo(id: string): unknown;
  };
  permissoes?: {
    conhecerModulos(modulos: ReadonlyArray<{ id: string; permissions: string[] }>): void;
    aplicarPolitica(): {
      concedidas: unknown[];
      recusas: Array<{ modulo: string; motivo: string }>;
    };
    retrato(): unknown;
    ultimasDecisoes(limit: number): unknown;
  };
  [dependencia: string]: unknown;
}

/** Nome público preservado para consumidores JSDoc legados. */
export type Deps = ContextDependencies;

export function criarContexto(
  manifesto: NormalizedModuleManifest,
  deps: ContextDependencies,
): ModuleContext;
