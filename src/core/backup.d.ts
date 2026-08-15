export interface BackupEntry {
  readonly versao: number;
  readonly classe: string;
  readonly d: unknown;
}

export interface BaluarteBackup {
  readonly baluarte: 'backup';
  readonly versaoArquivo: number;
  readonly geradoEm: string;
  readonly versaoApp: string;
  readonly chaves: Readonly<Record<string, BackupEntry>>;
}

export interface BackupSummary {
  readonly total: number;
  readonly sensiveis: number;
}

export type BackupValidation =
  | { readonly ok: true }
  | { readonly ok: false; readonly erro: string };

export interface IgnoredBackupEntry {
  readonly chave: string;
  readonly motivo: string;
}

export interface RestoreSummary {
  readonly restauradas: readonly string[];
  readonly ignoradas: readonly IgnoredBackupEntry[];
}

export function montarBackup(): BaluarteBackup;
export function resumoBackup(backup: BaluarteBackup): BackupSummary;
export function validarBackup(obj: unknown): BackupValidation;
export function restaurarBackup(backup: BaluarteBackup): RestoreSummary;
export function nomeDoArquivo(agora?: Date): string;
