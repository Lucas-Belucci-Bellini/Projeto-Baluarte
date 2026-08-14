export type BuiltInPermissionId =
  | 'app.navegar'
  | 'arsenal.read'
  | 'elites.read'
  | 'cronicas.read'
  | 'ferramentas.calcular'
  | 'editor.write'
  | 'sistema.diagnostico'
  | 'ferramentas.write'
  | 'jarvis.memoria.ler'
  | 'jarvis.skills.escrever'
  | 'jarvis.skills.ler'
  | 'jarvis.skills.executar';

export type PermissionId = string;

export const PERMISSAO_POR_TOOL: Readonly<Record<string, BuiltInPermissionId>>;
export const PERMISSAO_PADRAO: BuiltInPermissionId;

export interface DynamicToolPermission {
  readonly permissao?: string;
}

export function permissaoDe(name: string, dinamica?: DynamicToolPermission): PermissionId;
