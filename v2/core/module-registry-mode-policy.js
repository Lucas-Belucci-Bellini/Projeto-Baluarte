/**
 * Política fake server-side local para modos do Module Registry.
 *
 * Este arquivo é uma fixture determinística para testar a fronteira de decisão
 * antes de Supabase/RLS. A identidade é escolhida pelo chamador server-side da
 * fixture; nenhum campo de papel vindo do request é aceito como autoridade.
 * Não há rede, storage, token, claim, persistência ou efeito operacional.
 */

/** @typedef {'user'|'admin'|'dev'|'owner'} ModuleModeRole */
/** @typedef {'active'|'maintenance'|'disabled'} ModuleMode */
/** @typedef {{id: string, mode: ModuleMode, reason: string, requestId?: string, actorRole?: string}} ModuleModeRequest */
/** @typedef {{id: string, mode: ModuleMode, reason: string, requestId: string, actorRole?: string}} AuthorizedModuleModeRequest */
/** @typedef {{allowed: false, reason: string, requestId?: string} | {allowed: true, requestId: string, actorId: string, actorRole: ModuleModeRole, approvedBy: string}} ModuleModeDecision */

export const MODULE_MODE_POLICY_VERSION = 'module-registry-mode-policy/v1';
export const MODULE_MODE_FIXTURE_SOURCE = 'server-test-fixture';

/** @type {readonly ModuleModeRole[]} */
export const MODULE_MODE_ROLES = Object.freeze(['user', 'admin', 'dev', 'owner']);
/** @type {readonly ModuleMode[]} */
export const MODULE_MODES = Object.freeze(['active', 'maintenance', 'disabled']);

const DEFAULT_IDENTITIES = Object.freeze([
  Object.freeze({ id: 'fixture-user', role: 'user', source: MODULE_MODE_FIXTURE_SOURCE }),
  Object.freeze({ id: 'fixture-admin', role: 'admin', source: MODULE_MODE_FIXTURE_SOURCE }),
  Object.freeze({ id: 'fixture-dev', role: 'dev', source: MODULE_MODE_FIXTURE_SOURCE }),
  Object.freeze({ id: 'fixture-owner', role: 'owner', source: MODULE_MODE_FIXTURE_SOURCE }),
]);

const MODES_BY_ROLE = /** @type {Readonly<Record<ModuleModeRole, readonly ModuleMode[]>>} */ (
  Object.freeze({
    user: Object.freeze([]),
    dev: Object.freeze(['active', 'maintenance']),
    admin: Object.freeze(['active', 'maintenance', 'disabled']),
    owner: Object.freeze(['active', 'maintenance', 'disabled']),
  })
);

/** @type {Readonly<Record<Exclude<ModuleModeRole, 'user'>, string>>} */
const APPROVER_BY_ROLE = Object.freeze({
  dev: 'fixture-admin',
  admin: 'fixture-owner',
  owner: 'fixture-owner',
});

const DENY_REASONS = Object.freeze([
  'identity-unknown',
  'request-invalid',
  'module-id-missing',
  'mode-invalid',
  'reason-missing',
  'request-id-invalid',
  'role-mode-denied',
]);

/** @param {{id: string, role: ModuleModeRole, source: string}} value */
function copy(value) {
  return Object.freeze({ ...value });
}

/** @param {string} reason @param {unknown} request @returns {ModuleModeDecision} */
function deny(reason, request) {
  /** @type {{allowed: false, reason: string, requestId?: string}} */
  const result = {
    allowed: false,
    reason,
  };
  if (request !== null && typeof request === 'object' && !Array.isArray(request)) {
    const candidate = /** @type {{requestId?: unknown}} */ (request);
    if (typeof candidate.requestId === 'string' && candidate.requestId.trim() !== '') {
      result.requestId = candidate.requestId;
    }
  }
  return Object.freeze(result);
}

/** @param {{id: string, role: ModuleModeRole, source: string}} identity @param {AuthorizedModuleModeRequest} request @returns {ModuleModeDecision} */
function allow(identity, request) {
  return Object.freeze({
    allowed: true,
    requestId: request.requestId,
    actorId: identity.id,
    actorRole: identity.role,
    approvedBy: APPROVER_BY_ROLE[/** @type {Exclude<ModuleModeRole, 'user'>} */ (identity.role)],
  });
}

/** @param {unknown} request @returns {string|null} */
function validateRequest(request) {
  if (request === null || typeof request !== 'object' || Array.isArray(request)) {
    return 'request-invalid';
  }
  const candidate = /** @type {Record<string, unknown>} */ (request);
  if (typeof candidate.id !== 'string' || candidate.id.trim() === '') {
    return 'module-id-missing';
  }
  if (
    typeof candidate.mode !== 'string'
    || !(/** @type {readonly string[]} */ (MODULE_MODES)).includes(candidate.mode)
  ) {
    return 'mode-invalid';
  }
  if (typeof candidate.reason !== 'string' || candidate.reason.trim() === '') {
    return 'reason-missing';
  }
  if (typeof candidate.requestId !== 'string' || candidate.requestId.trim() === '') {
    return 'request-id-invalid';
  }
  return null;
}

/**
 * Cria uma política determinística e in-memory para a autoridade futura.
 *
 * A política retorna a decisão no formato consumível por
 * `criarModuleRegistryHealth(..., { authorize })`, mas não altera o Registry.
 */
export function criarModuleModePolicy() {
  /** @type {Map<string, {id: string, role: ModuleModeRole, source: string}>} */
  const identities = new Map(DEFAULT_IDENTITIES.map((identity) => [identity.id, identity]));

  /** @returns {ReadonlyArray<{id: string, role: ModuleModeRole, source: string}>} */
  function identidades() {
    return Object.freeze([...identities.values()].map(copy));
  }

  /** @param {string} id */
  function identidade(id) {
    const identity = identities.get(id);
    return identity ? copy(identity) : null;
  }

  /** @param {ModuleModeRole} role */
  function modosPermitidos(role) {
    return Object.freeze([...(MODES_BY_ROLE[role] ?? [])]);
  }

  /**
   * @param {string} identityId — selecionado pela fixture server-side
   * @param {unknown} request — pedido do adaptador de modos
   */
  /** @param {string} identityId @param {unknown} request @returns {ModuleModeDecision} */
  function decidir(identityId, request) {
    const identity = identities.get(identityId);
    if (!identity) return deny('identity-unknown', request);

    const validationError = validateRequest(request);
    if (validationError) return deny(validationError, request);

    const validRequest = /** @type {ModuleModeRequest} */ (request);
    if (!MODES_BY_ROLE[identity.role].includes(validRequest.mode)) {
      return deny('role-mode-denied', validRequest);
    }

    const authorizedRequest = /** @type {AuthorizedModuleModeRequest} */ (validRequest);
    return allow(identity, authorizedRequest);
  }

  /**
   * Devolve um callback fechado sobre uma identidade server-side da fixture.
   * O request pode conter actorRole malicioso; ele é deliberadamente ignorado.
   * @param {string} identityId
   */
  /** @param {string} identityId @returns {(request: ModuleModeRequest) => ModuleModeDecision} */
  function authorizeAs(identityId) {
    return (request) => decidir(identityId, request);
  }

  return Object.freeze({
    contractVersion: MODULE_MODE_POLICY_VERSION,
    source: MODULE_MODE_FIXTURE_SOURCE,
    roles: MODULE_MODE_ROLES,
    modes: MODULE_MODES,
    identidades,
    identidade,
    modosPermitidos,
    decidir,
    authorizeAs,
    denyReasons: DENY_REASONS,
  });
}
