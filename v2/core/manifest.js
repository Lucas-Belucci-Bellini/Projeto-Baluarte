/**
 * Manifesto de permissões do Core V2.
 *
 * Lista fechada das capacidades que um módulo pode declarar. Corresponde 1:1
 * às operações que o Runtime Bridge sabe conceder (`v2/runtime/CONTRACT.md`
 * só define `ReadFile` hoje). Não adicionar permissão aqui só porque pode ser
 * útil para um módulo futuro — regra 4 do contrato do Runtime.
 */
export const PERMISSOES = Object.freeze(['READ_FILES']);
