/**
 * Compatibilidade temporária para consumidores JavaScript durante a migração.
 * A implementação canônica está em `storage.ts`.
 */
export {
  CLASSES,
  clearAll,
  estadoEsquemas,
  esquemaDe,
  get,
  registrarEsquema,
  remove,
  set,
  storage,
  versaoGravada,
} from './storage.ts';
