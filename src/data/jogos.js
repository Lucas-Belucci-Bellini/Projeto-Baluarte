/**
 * Jogos de Aprendizado — dados dos 3 jogos (JS, HTML, CSS).
 */

/* JavaScript — "Qual a saída?" (resposta exata, ignora caixa/espaços). */
export const JS_DESAFIOS = [
  { code: "console.log(1 + 1);", resp: "2" },
  { code: "console.log('Olá'.length);", resp: "3" },
  { code: "console.log(2 + '2');", resp: "22" },
  { code: "console.log('5' - 2);", resp: "3" },
  { code: "console.log(typeof null);", resp: "object" },
  { code: "console.log(Boolean(0));", resp: "false" },
  { code: "console.log([1, 2, 3].length);", resp: "3" },
  { code: "console.log('a' < 'b');", resp: "true" },
  { code: "console.log(3 > 2 > 1);", resp: "false" },
  { code: "console.log([1, 2] + [3, 4]);", resp: "1,23,4" },
  { code: "let x = 1;\nconsole.log(x++ + ++x);", resp: "4" },
  { code: "console.log(0.1 + 0.2 === 0.3);", resp: "false" }
];

/* HTML — "Qual o HTML certo?" (múltipla escolha; `certa` = índice). */
export const HTML_DESAFIOS = [
  { pergunta: 'Criar um link para https://baluarte.com', opcoes: ['<a href="https://baluarte.com">ir</a>', '<link to="https://baluarte.com">', '<url>https://baluarte.com</url>', '<a src="https://baluarte.com">'], certa: 0 },
  { pergunta: 'Exibir uma imagem chamada nave.png', opcoes: ['<image>nave.png</image>', '<img src="nave.png" alt="nave">', '<picture>nave.png</picture>', '<img href="nave.png">'], certa: 1 },
  { pergunta: 'Criar uma lista NUMERADA', opcoes: ['<ul>', '<list>', '<ol>', '<dl>'], certa: 2 },
  { pergunta: 'O maior título de uma página', opcoes: ['<h6>', '<title>', '<head>', '<h1>'], certa: 3 },
  { pergunta: 'Quebrar uma linha no texto', opcoes: ['<br>', '<lb>', '<break>', '\\n'], certa: 0 },
  { pergunta: 'Um campo de texto para o usuário digitar', opcoes: ['<text>', '<input type="text">', '<field>', '<textbox>'], certa: 1 },
  { pergunta: 'Deixar um texto em NEGRITO (com semântica)', opcoes: ['<bold>', '<b style>', '<strong>', '<em>'], certa: 2 },
  { pergunta: 'Escrever um comentário no HTML', opcoes: ['// comentário', '/* comentário */', '# comentário', '<!-- comentário -->'], certa: 3 },
  { pergunta: 'Incorporar outro site numa caixa', opcoes: ['<iframe src="...">', '<embed-site>', '<frame href="...">', '<web src="...">'], certa: 0 },
  { pergunta: 'Um botão clicável', opcoes: ['<click>', '<button>Enviar</button>', '<btn>Enviar</btn>', '<input>Enviar</input>'], certa: 1 }
];

/* CSS — "Acerte o Layout" (Flexbox: justify-content + align-items). */
export const CSS_NIVEIS = [
  { dica: 'Itens no início (esquerda/topo).', justify: 'flex-start', align: 'flex-start' },
  { dica: 'Centralize na horizontal.', justify: 'center', align: 'flex-start' },
  { dica: 'Empurre os itens para a direita.', justify: 'flex-end', align: 'flex-start' },
  { dica: 'Centralize tudo (vertical e horizontal).', justify: 'center', align: 'center' },
  { dica: 'Espaço igual entre os itens, alinhados embaixo.', justify: 'space-between', align: 'flex-end' },
  { dica: 'À direita e no fundo (canto inferior direito).', justify: 'flex-end', align: 'flex-end' }
];

export const JUSTIFY_OPCOES = ['flex-start', 'center', 'flex-end', 'space-between'];
export const ALIGN_OPCOES = ['flex-start', 'center', 'flex-end'];
