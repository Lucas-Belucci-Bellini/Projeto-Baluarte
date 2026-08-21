/**
 * Wrapper de compatibilidade para o contexto otimizado do JARVIS.
 * A implementação canônica está em `jarvis-context.ts`.
 */
export {
  getBaluarteBriefing,
  getJarvisRuntimeContext,
  invalidateBaluarteBriefing,
  selectContextMessages,
  recordJarvisContextObservation,
  getLastJarvisContextObservation,
  findJarvisCapability,
} from './jarvis-context.ts';
