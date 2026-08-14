import { criarMonitorSaude } from './saude.js';
import { criarStatusLifecycle } from './lifecycle-status.js';
import { criarSupervisor } from './supervisor.js';

/** @typedef {'idle'|'starting'|'ready'|'degraded'|'stopping'|'stopped'|'failed'} PlataformaSupervisorState */
/** @typedef {{listar: () => ReadonlyArray<string>, modulo: (id: string) => {name?: string, version?: string} | undefined}} PlataformaRegistry */
/** @typedef {{subir: () => Promise<{falhas: ReadonlyArray<unknown>}>, descer: () => Promise<void>, diagnostico: () => {fase: string, modulos?: unknown[], falhas?: unknown[], eventosOrfaos?: unknown[], referenciasOrfas?: unknown[]}, ciclo: {vivos: () => string[], falhas: () => Array<{modulo: string, fase: string, motivo: string}>, fase: string}} PlataformaBoot */

/** @param {PlataformaRegistry} registry @param {PlataformaBoot} boot */
export function criarPlataforma(registry, boot) {
  if (!registry || typeof registry.listar !== 'function' || typeof registry.modulo !== 'function') throw new TypeError('registry inválido');
  if (!boot || typeof boot.subir !== 'function' || typeof boot.descer !== 'function' || typeof boot.diagnostico !== 'function') throw new TypeError('boot inválido');
  const saudeBase = criarMonitorSaude(boot);
  /** @type {PlataformaSupervisorState} */ let estadoSupervisor = 'idle';
  const saude = {
    verificar: () => saudeBase.verificar(),
    /** @param {PlataformaSupervisorState} estado */ definirEstado: (estado) => { estadoSupervisor = estado; },
    retrato: () => ({ estado: estadoSupervisor, verificacao: saudeBase.verificar() })
  };
  const supervisor = criarSupervisor(boot, saude);
  const lifecycle = criarStatusLifecycle(registry, boot.ciclo);
  function diagnostico() { return { supervisor: supervisor.status(), saude: saude.verificar(), lifecycle: { modulos: lifecycle.retrato(), resumo: lifecycle.resumo() }, boot: boot.diagnostico() }; }
  return { iniciar: () => supervisor.iniciar(), parar: () => supervisor.parar(), diagnostico, supervisor, saude, lifecycle };
}
