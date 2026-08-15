import type { PermissionEntry, Risco } from './permissions.js';
import type { Ambiente, Nivel, ResolvedFlag } from './flags.js';
import type { StorageSchemaState } from './storage.js';
export interface PermissionView extends PermissionEntry { readonly concedida: boolean; }
export interface PermissionStateView { readonly declaradas: readonly PermissionView[]; readonly concedidas: readonly string[]; readonly porRisco: Readonly<Record<Risco, number>>; }
export interface PolicyState { readonly permissoes: PermissionStateView; readonly esquemas: readonly StorageSchemaState[]; readonly flags: readonly ResolvedFlag[]; readonly porNivel: Readonly<Record<Nivel, readonly string[]>>; readonly ambiente: Exclude<Ambiente, 'ambos'>; }
export interface PolicyContext { readonly ambiente?: Exclude<Ambiente, 'ambos'>; readonly search?: string; }
export function aplicarPolitica(context?: PolicyContext): { readonly permissoes: number; readonly esquemas: number; readonly flags: number; readonly primeiroBoot: boolean };
export function estadoPolitica(): PolicyState;
