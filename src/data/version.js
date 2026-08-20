/**
 * Versão central do Baluarte — fonte única de verdade.
 * Qualquer lugar que exiba a versão do projeto deve importar daqui,
 * para nunca mais haver número de versão desatualizado chumbado no código.
 *
 * ⚠️ Dois lugares NÃO conseguem importar daqui e precisam ser mudados junto:
 *   - `package.json` (npm não lê JS)
 *   - `public/sw.js`  (não passa pelo bundler — é servido cru)
 * O teste `test/versao.test.js` cobra que os três estejam de acordo. Ele existe
 * porque a promessa acima já foi quebrada duas vezes, e a segunda deixou todo
 * mundo preso em cache velho (ver o cabeçalho do `sw.js`).
 *
 * A linha pública 1.0.0 foi pulada; a linha de produto segue com releases semânticas.
 */
export const VERSION = '1.2.6';
export const CODENAME = 'Mark XIII';
