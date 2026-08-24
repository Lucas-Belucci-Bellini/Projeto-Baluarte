/**
 * Os totais do acervo de Arma 3, num lugar só.
 *
 * ⚠️ ARQUIVO GERADO (`npm run gen-arma3-totais`): cada número é recontado das
 * bases e o CI falha se divergir do commit. É o que impede a página de anunciar
 * "5.425 veículos" depois de o dump mudar.
 *
 * O módulo existe justamente para a página **não** importar as bases grandes só
 * para contar — importar `arma3-soldados.js` (971 linhas) para mostrar um número
 * no cabeçalho custaria o catálogo inteiro no bundle da rota.
 */

/** Acessórios (miras, silenciadores, apontadores, bipés) no config. */
export const A3ACC_TOTAL: number;
/** Armas canônicas do núcleo embutido. */
export const A3ARM_TOTAL: number;
export const A3CAMP_TOTAL: number;
export const A3CFG_TOTAL_TOPICOS: number;
export const A3CMD_TOTAL: number;
/** Itens da coleção Steam do operador. */
export const A3COL_TOTAL: number;
export const A3DRV_TOTAL: number;
export const A3EQP_TOTAL: number;
/** Carregadores — vêm da mesma base da munição. */
export const A3MAG_TOTAL: number;
export const A3MUN_TOTAL: number;
export const A3SOL_TOTAL: number;
export const A3TER_TOTAL: number;
export const A3TUT_TOTAL: number;
export const A3VAN_TOTAL_TOPICOS: number;
export const A3VEI_TOTAL: number;
export const ARMA3_TOTAL_MODS: number;
