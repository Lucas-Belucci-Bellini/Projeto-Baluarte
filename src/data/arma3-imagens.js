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

export const MOTIVO_SEM_IMG = {
  'sem-picture-no-config':
    'o config desta classe não aponta nenhuma imagem — não há o que extrair',
  'paa-nao-extraido':
    'o config aponta um .paa que não saiu do PBO (DLC cifrado em .ebo, ou mod fora da sessão do dump)',
  'icone-por-nome':
    'o config declara um NOME de ícone (`iconMan`), e a tabela CfgVehicleIcons que traduz nome em imagem ainda não foi dumpada',
};

/* O texto do `title`, com um padrão para motivo que a base traga e este módulo
 * ainda não conheça. Nunca inventa imagem: ausência continua ausência. */
export function motivoSemImagem(codigo) {
  return MOTIVO_SEM_IMG[codigo] || 'sem ícone extraído';
}
