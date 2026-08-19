/**
 * Observabilidade e decisão de fallback do Module Registry.
 *
 * Este adaptador não inicia módulos, concede permissões nem substitui RLS.
 * Ele traduz o estado do Runtime Health para uma decisão operacional isolável.
 */

/**
 * @typedef {'registered'|'healthy'|'degraded'|'quarantined'|'maintenance'|'disabled'|'unregistered'} RegistryModuleMode
 */

/**
 * @typedef {{
 *   id: string,
 *   mode: RegistryModuleMode,
 *   status: 'unknown'|'healthy'|'failed'|'exhausted'|'unregistered',
 *   restarts: number,
 *   podeReiniciar: boolean,
 *   ultimoErro?: string,
 * }} RegistryHealthEntry
 */

/**
 * @typedef {{allowed: true, requestId?: string, actorId?: string, actorRole?: string, approvedBy?: string}} RegistryModeDecision
 * @typedef {{type: 'registry.mode.changed', id: string, mode: 'active'|'maintenance'|'disabled', reason: string, requestId?: string, actorId?: string, actorRole?: string, approvedBy?: string, timestamp: number}} RegistryModeAuditEntry
 * @param {{listar: () => string[], modulo: (id: string) => unknown}} registry
 * @param {{estado: (id: string) => {status: 'unknown'|'healthy'|'failed'|'exhausted', restarts?: number[], lastError?: unknown}, podeReiniciar: (id: string) => boolean, incidentes?: () => unknown[]}} runtimeHealth
 * @param {{authorize?: (request: {id: string, mode: 'active'|'maintenance'|'disabled', reason: string, requestId?: string}) => boolean|RegistryModeDecision, audit?: (entry: RegistryModeAuditEntry) => void, clock?: () => number, requireAudit?: boolean, maxAuditEntries?: number}} [options]
 */
export function criarModuleRegistryHealth(registry, runtimeHealth, options = {}) {
  const overrides = new Map();
  const authorize = options.authorize ?? (() => false);
  const audit = options.audit;
  const clock = options.clock ?? (() => Date.now());
  const requireAudit = options.requireAudit === true;
  const maxAuditEntries = options.maxAuditEntries ?? 100;
  const requests = new Map();
  /** @type {RegistryModeAuditEntry[]} */
  const auditEntries = [];
  if (requireAudit && typeof audit !== 'function') {
    throw new TypeError('auditoria server-side obrigatória');
  }
  /** @param {string} id @returns {RegistryModuleMode} */
  function modo(id) {
    if (!registry?.modulo(id)) return 'unregistered';
    const override = overrides.get(id);
    if (override) return override;
    const estado = runtimeHealth.estado(id);
    if (estado.status === 'healthy') return 'healthy';
    if (estado.status === 'failed') return 'degraded';
    if (estado.status === 'exhausted') return 'quarantined';
    return 'registered';
  }

  /** @param {string} id */
  function podeAtivar(id) {
    if (!registry?.modulo(id)) return false;
    const mode = modo(id);
    if (mode === 'maintenance' || mode === 'disabled' || mode === 'quarantined') return false;
    return runtimeHealth.podeReiniciar(id);
  }

  /** @param {unknown} value @param {string} name */
  function exigirTexto(value, name) {
    if (typeof value !== 'string' || value.trim() === '') {
      throw new Error(`${name} obrigatório para auditoria server-side`);
    }
    return value;
  }

  /** @param {string} id @param {'active'|'maintenance'|'disabled'} mode @param {string} reason @param {{requestId?: string}} context */
  function definirModo(id, mode, reason, context = {}) {
    if (!registry?.modulo(id)) throw new Error(`módulo não registrado: "${id}"`);
    if (!['active', 'maintenance', 'disabled'].includes(mode)) {
      throw new Error(`modo operacional inválido: "${mode}"`);
    }
    if (typeof reason !== 'string' || reason.trim() === '') {
      throw new Error('maintenance/disabled exige motivo');
    }

    const request = {
      id,
      mode,
      reason,
      ...(context.requestId ? { requestId: context.requestId } : {}),
    };
    if (requireAudit && !request.requestId) {
      throw new Error('requestId obrigatório para auditoria server-side');
    }

    if (request.requestId && requests.has(request.requestId)) {
      const previous = requests.get(request.requestId);
      if (previous.id !== id || previous.mode !== mode || previous.reason !== reason) {
        throw new Error('requestId já usado para uma solicitação diferente');
      }
      return modo(id);
    }

    const decision = authorize(request);
    const allowed = decision === true
      || (typeof decision === 'object' && decision !== null && decision.allowed === true);
    if (!allowed) {
      throw new Error('autorização server-side necessária para mudar modo');
    }

    /** @type {RegistryModeDecision} */
    const details = typeof decision === 'object' && decision !== null
      ? decision
      : { allowed: true };
    if (requireAudit) {
      exigirTexto(details.requestId, 'requestId da decisão');
      if (details.requestId !== request.requestId) {
        throw new Error('requestId da decisão não corresponde à solicitação');
      }
      exigirTexto(details.actorId, 'actorId');
      exigirTexto(details.actorRole, 'actorRole');
      exigirTexto(details.approvedBy, 'approvedBy');
    }

    /** @type {RegistryModeAuditEntry} */
    const entry = {
      type: 'registry.mode.changed',
      id,
      mode,
      reason,
      timestamp: clock(),
      ...(request.requestId ? { requestId: request.requestId } : {}),
      ...(details.actorId ? { actorId: details.actorId } : {}),
      ...(details.actorRole ? { actorRole: details.actorRole } : {}),
      ...(details.approvedBy ? { approvedBy: details.approvedBy } : {}),
    };
    audit?.(entry);
    auditEntries.push({ ...entry });
    if (auditEntries.length > maxAuditEntries) {
      auditEntries.splice(0, auditEntries.length - maxAuditEntries);
    }

    if (mode === 'active') overrides.delete(id);
    else overrides.set(id, mode);
    if (request.requestId) requests.set(request.requestId, { ...request });
    return modo(id);
  }

  /** @param {string} id @returns {RegistryHealthEntry} */
  function entrada(id) {
    const mode = modo(id);
    if (mode === 'unregistered') {
      return {
        id,
        mode,
        status: 'unregistered',
        restarts: 0,
        podeReiniciar: false,
      };
    }

    const estado = runtimeHealth.estado(id);
    /** @type {RegistryHealthEntry} */
    const entry = {
      id,
      mode,
      status: estado.status,
      restarts: estado.restarts?.length ?? 0,
      podeReiniciar: podeAtivar(id),
    };
    if (estado.lastError instanceof Error) entry.ultimoErro = estado.lastError.message;
    else if (estado.lastError !== undefined) entry.ultimoErro = String(estado.lastError);
    return entry;
  }

  function resumo() {
    return registry.listar().sort().map(entrada);
  }

  function incidentes() {
    return typeof runtimeHealth.incidentes === 'function'
      ? runtimeHealth.incidentes()
      : [];
  }

  function auditoria() {
    return auditEntries.map((entry) => ({ ...entry }));
  }

  return { modo, podeAtivar, definirModo, resumo, incidentes, auditoria };
}
