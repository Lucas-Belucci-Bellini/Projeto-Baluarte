/** Central catalog for modules managed by the V2 Runtime. */
export function criarRuntimeModuleRegistry() {
  const entries = new Map();
  let sealed = false;

  function registrar(id, metadata = {}) {
    if (sealed) throw new Error('Registry de Runtime selado');
    if (!id || entries.has(id)) throw new Error(`Módulo inválido ou duplicado: ${id}`);
    entries.set(id, { id, ...metadata });
    return entries.get(id);
  }

  function selar() { sealed = true; }
  function estaSelado() { return sealed; }
  function obter(id) { return entries.get(id); }
  function listar() { return [...entries.values()].map(entry => ({ ...entry })); }

  return { registrar, selar, estaSelado, obter, listar };
}
