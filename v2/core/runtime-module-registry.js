/** Central catalog for modules managed by the V2 Runtime. */

/** @typedef {Record<string, unknown>} RuntimeModuleMetadata */
/** @typedef {RuntimeModuleMetadata & {id: string}} RuntimeModuleEntry */
/** @typedef {{registrar: (id: string, metadata?: RuntimeModuleMetadata) => RuntimeModuleEntry, selar: () => void, estaSelado: () => boolean, obter: (id: string) => RuntimeModuleEntry | undefined, listar: () => RuntimeModuleEntry[]}} RuntimeModuleRegistry */

/** @returns {RuntimeModuleRegistry} */
export function criarRuntimeModuleRegistry() {
  /** @type {Map<string, RuntimeModuleEntry>} */
  const entries = new Map();
  let sealed = false;

  /** @param {string} id @param {RuntimeModuleMetadata} [metadata] */
  function registrar(id, metadata = {}) {
    if (sealed) throw new Error('Registry de Runtime selado');
    if (!id || entries.has(id)) throw new Error(`Módulo inválido ou duplicado: ${id}`);
    const entry = { id, ...metadata };
    entries.set(id, entry);
    return entry;
  }

  function selar() { sealed = true; }
  function estaSelado() { return sealed; }
  /** @param {string} id */
  function obter(id) { return entries.get(id); }
  function listar() { return [...entries.values()].map(entry => ({ ...entry })); }

  return { registrar, selar, estaSelado, obter, listar };
}
