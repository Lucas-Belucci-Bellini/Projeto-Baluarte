export type Stability = 'estavel' | 'beta' | 'experimental';
export type DataClass = 'publico' | 'local' | 'sensivel' | 'secreto';
export type Environment = 'web' | 'app' | 'ambos';
export type Permission =
  | 'READ_FILES'
  | 'WRITE_FILES'
  | 'NETWORK'
  | 'DATABASE'
  | 'SYSTEM_INFO'
  | 'USER_DATA'
  | 'EXECUTION';

export const ESTABILIDADES: readonly Stability[];
export const CLASSES: readonly DataClass[];
export const AMBIENTES: readonly Environment[];
export const PERMISSOES: readonly Permission[];

export type ViewLoader = () => Promise<unknown>;
export type StorageMigrator = (
  dados: unknown,
  de: number,
  para: number,
) => unknown;
export type LifecycleHandler = (context: unknown) => unknown | Promise<unknown>;

export interface ModuleRoute {
  path: string;
  view: ViewLoader;
}

export interface ModuleStorageSchema {
  key: string;
  version: number;
  class: DataClass;
  migrate?: StorageMigrator;
}

export interface ModuleEvents {
  emits?: string[];
  consumes?: string[];
}

export interface ModuleReferences {
  routes?: string[];
  modules?: string[];
}

export interface ModuleNavigation {
  section?: string | null;
  order?: number;
}

export interface ModuleManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  stability?: Stability;
  ambiente?: Environment;
  icon?: string;
  routes?: ModuleRoute[];
  nav?: ModuleNavigation;
  dependencies?: string[];
  references?: ModuleReferences;
  permissions?: Permission[];
  storage?: ModuleStorageSchema[];
  events?: ModuleEvents;
  api?: Record<string, unknown>;
  apiVersion?: number;
  lifecycle?: Record<string, LifecycleHandler>;
}

export interface NormalizedModuleManifest extends ModuleManifest {
  description: string;
  stability: Stability;
  ambiente: Environment;
  icon: string;
  routes: ModuleRoute[];
  nav: {
    section: string | null;
    order: number;
  };
  dependencies: string[];
  references: {
    routes: string[];
    modules: string[];
  };
  permissions: Permission[];
  storage: ModuleStorageSchema[];
  events: {
    emits: string[];
    consumes: string[];
  };
  api: Record<string, unknown>;
  lifecycle: Record<string, LifecycleHandler>;
}

export interface ManifestValidation {
  ok: boolean;
  erros: string[];
}

export function validar(entrada: unknown): ManifestValidation;
export function normalizar(manifesto: ModuleManifest): NormalizedModuleManifest;
