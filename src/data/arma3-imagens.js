/* Por que este registro do Arma 3 está sem imagem — em uma frase.
 *
 * A regra do lado do gerador (`scripts/arma3/gerar_imagens_comum.py`) é que
 * todo registro sai com `img` OU `imgAusente`, nunca os dois. `imgAusente` não
 * é um booleano: é o MOTIVO, e cada motivo aponta uma solução diferente. Sem
 * essa distinção "sem ícone" viraria um estado só, e o leitor não saberia se o
 * buraco é do jogo, da nossa extração, ou de um dump que falta.
 *
 * Este módulo existe para o vocabulário ser UM. A tabela morava dentro de
 * `arma3-tutorial.js`; quando a wiki passou a mostrar ícone de veículo, item e
 * soldado, copiar a tabela criaria duas versões da mesma explicação — e a
 * divergência entre elas não faria barulho nenhum, que é o defeito que este
 * repositório mais paga caro (a segunda implementação do Morse em `/cripto`).
 *
 * ⚠️ As CHAVES são as constantes do Python (`SEM_PICTURE`, `NAO_EXTRAIDO`,
 * `POR_NOME`). Duas linguagens, uma lista: quem mudar uma tem de mudar a
 * outra, e `test/arma3-imagens.test.js` cobra isso lendo o `.py`.
 */

/* ⚠️ Estas frases são lidas por QUEM USA A WIKI, não por quem mexe no
 * pipeline. Elas apareciam em 936 artigos de soldado dizendo "a tabela
 * CfgVehicleIcons ainda não foi dumpada" — verdade, e jargão nosso numa tela
 * pública: o leitor não tem o que fazer com isso.
 *
 * O código (`icone-por-nome`) continua carregando a instrução operacional; ela
 * mora no placar de `verificar-arma3`, no `gerar_imagens_comum.py` e no
 * `DUMPS.md`, que é onde quem vai agir procura. Aqui fica o que o leitor
 * precisa saber: se a falta é do jogo, do formato, ou nossa. */
export const MOTIVO_SEM_IMG = {
  'sem-picture-no-config':
    'o Arma 3 não define nenhuma imagem para esta classe',
  'paa-nao-extraido':
    'a imagem existe no jogo, mas está num DLC cifrado que não abre fora dele',
  'icone-por-nome':
    'esta classe usa um símbolo genérico do jogo, que ainda não foi extraído',
};

/* O texto do `title`, com um padrão para motivo que a base traga e este módulo
 * ainda não conheça. Nunca inventa imagem: ausência continua ausência. */
export function motivoSemImagem(codigo) {
  return MOTIVO_SEM_IMG[codigo] || 'sem ícone extraído';
}
