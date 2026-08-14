/**
 * Compatibilidade temporária para consumidores JavaScript durante a migração.
 * A implementação canônica está em `flags.ts`.
 */
export {
  AMBIENTES,
  NIVEIS,
  ativo,
  ambiente,
  aplicarDaURL,
  configurarAmbiente,
  conectarPersistencia,
  declarar,
  declararTodas,
  definir,
  descrever,
  flags,
  limpar,
  listar,
  porNivel,
  resetar,
} from './flags.ts';
