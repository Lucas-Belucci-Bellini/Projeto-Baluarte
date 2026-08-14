/**
 * Compatibilidade temporária para consumidores JavaScript durante a migração.
 * A implementação canônica está em `permissions.ts`.
 */
export {
  PermissionError,
  RISCOS,
  checar,
  conceder,
  declarar,
  declararTodas,
  descrever,
  exigir,
  estado,
  existe,
  exportar,
  importar,
  limpar,
  listar,
  permissions,
  protegido,
  revogar,
  ultimasDecisoes,
} from './permissions.ts';
