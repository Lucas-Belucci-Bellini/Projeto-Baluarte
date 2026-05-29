/**
 * Code Quest — banco de questões do "jogo enorme de linguagens".
 *
 * Cada linguagem é uma trilha (id, label, ícone, cor) com várias questões de
 * múltipla escolha. Formato de questão:
 *   { q, code?, options:[...], answer:<índice>, explain? }
 *
 * É só adicionar mais objetos/linguagens aqui — a engine em pages/jogos.js
 * monta tudo automaticamente (trilhas individuais + campanha geral).
 */

export const CODE_QUEST = [
  {
    id: 'python', label: 'Python', icon: '🐍', color: '#3776ab',
    questions: [
      { q: 'Qual a saída?', code: 'print(2 ** 3)', options: ['6', '8', '9', '23'], answer: 1, explain: '** é potência: 2³ = 8.' },
      { q: 'Qual a saída?', code: 'print(type([]))', options: ["<class 'list'>", 'list', "<type 'list'>", 'array'], answer: 0, explain: 'type() devolve <class \'list\'> no Python 3.' },
      { q: 'Qual a saída?', code: 'print(7 // 2)', options: ['3.5', '3', '4', '1'], answer: 1, explain: '// é divisão inteira (piso): 3.' },
      { q: 'Qual a saída?', code: 'print(bool([]))', options: ['True', 'False', 'None', '[]'], answer: 1, explain: 'Lista vazia é "falsy".' },
      { q: 'Qual a saída?', code: 'print("ab" * 2)', options: ['abab', 'ab2', 'aabb', 'Erro'], answer: 0, explain: 'String * int repete a string.' },
      { q: 'Qual a saída?', code: 'x = {1, 2, 2, 3}\nprint(len(x))', options: ['4', '3', '2', 'Erro'], answer: 1, explain: 'set elimina duplicatas → {1,2,3}.' },
      { q: 'Como se escreve um comentário?', options: ['// comentário', '# comentário', '/* comentário */', '-- comentário'], answer: 1, explain: 'Python usa # para comentário de linha.' }
    ]
  },
  {
    id: 'javascript', label: 'JavaScript', icon: '⌨', color: '#f7df1e',
    questions: [
      { q: 'Qual a saída?', code: 'console.log(typeof NaN)', options: ['"NaN"', 'number', 'undefined', 'object'], answer: 1, explain: 'NaN é do tipo number (ironia clássica).' },
      { q: 'Qual a saída?', code: 'console.log(1 + "1")', options: ['2', '11', '"11"', 'NaN'], answer: 1, explain: 'number + string → concatena: "11".' },
      { q: 'Qual a saída?', code: 'console.log([1, 2, 3].map(x => x * 2))', options: ['[2, 4, 6]', '[1, 4, 9]', '[1, 2, 3]', 'Erro'], answer: 0, explain: 'map dobra cada elemento.' },
      { q: 'Qual a saída?', code: 'console.log(0.1 + 0.2 === 0.3)', options: ['true', 'false', '0.3', 'NaN'], answer: 1, explain: 'Ponto flutuante: 0.1+0.2 = 0.30000000000000004.' },
      { q: 'Qual a saída?', code: 'console.log(!!"")', options: ['true', 'false', '""', 'undefined'], answer: 1, explain: 'String vazia é falsy → !! vira false.' },
      { q: 'Qual a forma de declarar uma constante?', options: ['var x = 1', 'const x = 1', 'let x := 1', 'final x = 1'], answer: 1, explain: 'const declara ligação imutável.' }
    ]
  },
  {
    id: 'java', label: 'Java', icon: '☕', color: '#e76f00',
    questions: [
      { q: 'Qual a saída?', code: 'System.out.println(7 / 2);', options: ['3.5', '3', '4', '3.0'], answer: 1, explain: 'int / int = divisão inteira → 3.' },
      { q: 'Qual palavra herda de uma classe?', options: ['extends', 'implements', 'inherits', 'super'], answer: 0, explain: 'extends para herança; implements para interfaces.' },
      { q: 'Qual a saída?', code: 'System.out.println(5 % 2);', options: ['0', '1', '2', '2.5'], answer: 1, explain: '% é o resto da divisão: 1.' },
      { q: 'Assinatura correta do ponto de entrada?', options: ['void main()', 'public static void main(String[] args)', 'static main(args)', 'function main()'], answer: 1, explain: 'A JVM procura public static void main(String[]).' },
      { q: 'Quantos bytes tem um char (UTF-16)?', options: ['1', '2', '4', '8'], answer: 1, explain: 'char em Java é UTF-16 = 2 bytes.' }
    ]
  },
  {
    id: 'c', label: 'C', icon: '🔧', color: '#a8b9cc',
    questions: [
      { q: 'Qual a saída?', code: 'printf("%d", 5 / 2);', options: ['2', '2.5', '3', 'Erro'], answer: 0, explain: 'Divisão inteira trunca para 2.' },
      { q: 'Quanto vale sizeof(char)?', options: ['1', '2', '4', 'depende'], answer: 0, explain: 'sizeof(char) é sempre 1 por definição.' },
      { q: 'O operador unário & antes de uma variável devolve o…', options: ['valor', 'endereço de memória', 'tipo', 'tamanho'], answer: 1, explain: '&x é o endereço (address-of).' },
      { q: 'Acessar arr[3] em "int arr[3];" causa…', options: ['Erro de compilação', 'Comportamento indefinido', 'Retorna 0', 'Exceção tratável'], answer: 1, explain: 'Acesso fora dos limites é undefined behavior em C.' },
      { q: 'Qual função imprime no console?', options: ['printf', 'cout', 'print', 'echo'], answer: 0, explain: 'printf, de <stdio.h>.' }
    ]
  },
  {
    id: 'cpp', label: 'C++', icon: '➕', color: '#00599c',
    questions: [
      { q: 'Qual a saída?', code: 'std::cout << 3 + 4;', options: ['7', '34', '3 4', 'Erro'], answer: 0, explain: '+ soma antes de imprimir: 7.' },
      { q: 'Como se declara uma referência?', options: ['int& r = x;', 'int* r = x;', 'ref int r;', 'int r&;'], answer: 0, explain: 'int& é referência; int* é ponteiro.' },
      { q: 'O operador new devolve…', options: ['o valor', 'um ponteiro', 'uma referência', 'void'], answer: 1, explain: 'new aloca e devolve ponteiro para o objeto.' },
      { q: 'Qual o tamanho inicial de "std::vector<int> v;"?', options: ['0', '1', 'indefinido', 'Erro'], answer: 0, explain: 'Vector começa vazio: size() == 0.' },
      { q: 'Qual inicia um comentário de linha?', options: ['//', '#', '--', '%'], answer: 0, explain: '// para linha, /* */ para bloco.' }
    ]
  },
  {
    id: 'csharp', label: 'C#', icon: '#️⃣', color: '#9b4f96',
    questions: [
      { q: 'Qual a saída?', code: 'Console.WriteLine(10 % 3);', options: ['0', '1', '3', '3.33'], answer: 1, explain: 'Resto de 10/3 é 1.' },
      { q: 'Palavra-chave de constante de compilação?', options: ['const', 'final', 'static only', 'let'], answer: 0, explain: 'const (valor fixo em compilação); readonly em runtime.' },
      { q: 'O que "var" faz?', options: ['Infere o tipo em compilação', 'Cria sempre object', 'É dinâmico em runtime', 'Erro'], answer: 0, explain: 'var é tipagem estática inferida.' },
      { q: 'Prefixo de interpolação de string?', options: ['$"..."', 'f"..."', '`...`', '&"..."'], answer: 0, explain: '$"{x}" interpola variáveis.' }
    ]
  },
  {
    id: 'typescript', label: 'TypeScript', icon: '🟦', color: '#3178c6',
    questions: [
      { q: 'O que o TypeScript adiciona ao JavaScript?', options: ['Tipagem estática', 'Um runtime próprio', 'Garbage collector', 'Threads nativas'], answer: 0, explain: 'TS é JS + tipos, compilado para JS.' },
      { q: 'O que acontece?', code: 'let x: number = "a";', options: ['Roda normal', 'Erro de compilação', 'x vira NaN', 'x vira undefined'], answer: 1, explain: 'Atribuir string a number falha na checagem.' },
      { q: 'O que define a forma de um objeto?', options: ['interface', 'enum', 'namespace', 'decorator'], answer: 0, explain: 'interface (ou type) descreve a forma.' },
      { q: 'O tipo "any"…', options: ['Desliga a checagem de tipos', 'Força number', 'É um array', 'Causa erro'], answer: 0, explain: 'any aceita qualquer coisa (use com cuidado).' }
    ]
  },
  {
    id: 'go', label: 'Go', icon: '🐹', color: '#00add8',
    questions: [
      { q: 'Qual a saída?', code: 'fmt.Println(len("go"))', options: ['1', '2', '3', 'Erro'], answer: 1, explain: '"go" tem 2 bytes/caracteres.' },
      { q: 'Como declarar+atribuir de forma curta?', options: [':=', 'let', 'dim', 'auto'], answer: 0, explain: 'x := 5 declara e infere o tipo.' },
      { q: 'Go tem classes?', options: ['Sim', 'Não — usa structs e métodos', 'Só com generics', 'Apenas interfaces'], answer: 1, explain: 'Sem classes; composição com structs.' },
      { q: 'Qual palavra inicia uma goroutine?', options: ['async', 'go', 'thread', 'spawn'], answer: 1, explain: 'go f() roda concorrente.' }
    ]
  },
  {
    id: 'rust', label: 'Rust', icon: '🦀', color: '#dea584',
    questions: [
      { q: 'Variáveis em Rust, por padrão, são…', options: ['mutáveis', 'imutáveis', 'globais', 'nulas'], answer: 1, explain: 'let cria binding imutável; use mut para mudar.' },
      { q: 'Como tornar uma variável mutável?', options: ['var', 'mut', 'let!', 'mutable'], answer: 1, explain: 'let mut x = 1;' },
      { q: 'O sistema de ownership previne principalmente…', options: ['Vazamentos e data races', 'Lentidão', 'Recursão infinita', 'Erros de digitação'], answer: 0, explain: 'Garante segurança de memória sem GC.' },
      { q: 'println! é um(a)…', options: ['função', 'macro', 'método', 'palavra-chave'], answer: 1, explain: 'O ! indica macro.' }
    ]
  },
  {
    id: 'php', label: 'PHP', icon: '🐘', color: '#777bb4',
    questions: [
      { q: 'Qual a saída?', code: 'echo 2 . 2;', options: ['4', '22', '2.2', 'Erro'], answer: 1, explain: '. é concatenação → "22".' },
      { q: 'Como começa o nome de uma variável?', options: ['@', '$', '#', '&'], answer: 1, explain: 'Toda variável em PHP usa $.' },
      { q: 'O operador === compara…', options: ['valor e tipo', 'só o valor', 'atribui', 'sempre true'], answer: 0, explain: '=== é igualdade estrita (valor + tipo).' },
      { q: 'Qual tag abre código PHP?', options: ['<?php', '<%', '{{', '<script>'], answer: 0, explain: '<?php ... ?>' }
    ]
  },
  {
    id: 'ruby', label: 'Ruby', icon: '💎', color: '#cc342d',
    questions: [
      { q: 'Qual a saída?', code: 'puts [1, 2, 3].sum', options: ['6', '123', '[1, 2, 3]', 'Erro'], answer: 0, explain: 'sum soma os elementos: 6.' },
      { q: 'O que é nil?', options: ['O número 0', 'Ausência de valor (null)', 'Sempre false', 'String vazia'], answer: 1, explain: 'nil representa "nada".' },
      { q: 'Qual a saída?', code: 'puts "ab".upcase', options: ['AB', 'ab', 'Ab', 'Erro'], answer: 0, explain: 'upcase deixa maiúsculo.' },
      { q: 'Qual prefixo cria um símbolo?', options: ['@', ':', '$', '#'], answer: 1, explain: ':nome é um símbolo.' }
    ]
  },
  {
    id: 'kotlin', label: 'Kotlin', icon: '🟪', color: '#7f52ff',
    questions: [
      { q: 'Diferença entre val e var?', options: ['val é imutável; var é mutável', 'var é imutável', 'São iguais', 'val é global'], answer: 0, explain: 'val = read-only; var = reatribuível.' },
      { q: 'Qual a saída?', code: 'println("Hi".length)', options: ['1', '2', '3', 'Hi'], answer: 1, explain: '"Hi" tem 2 caracteres.' },
      { q: 'Operador de chamada segura (null-safe)?', options: ['?.', '!.', '??', '.?'], answer: 0, explain: 'a?.b retorna null em vez de NPE.' },
      { q: 'O que "fun" declara?', options: ['variável', 'função', 'classe', 'pacote'], answer: 1, explain: 'fun nome() { }' }
    ]
  },
  {
    id: 'swift', label: 'Swift', icon: '🕊', color: '#f05138',
    questions: [
      { q: 'O que "let" declara?', options: ['uma constante', 'uma variável mutável', 'uma função', 'um opcional'], answer: 0, explain: 'let = constante; var = variável.' },
      { q: 'Qual a saída?', code: 'print(2 + 3)', options: ['5', '23', 'Erro', '2+3'], answer: 0, explain: 'Soma normal: 5.' },
      { q: 'Qual símbolo marca um tipo opcional?', options: ['?', '!', '*', '&'], answer: 0, explain: 'Int? pode conter nil.' },
      { q: 'O que "var" declara?', options: ['constante', 'variável', 'tipo', 'protocolo'], answer: 1, explain: 'var é reatribuível.' }
    ]
  },
  {
    id: 'sql', label: 'SQL', icon: '🗃', color: '#336791',
    questions: [
      { q: 'Qual comando LÊ dados de uma tabela?', options: ['SELECT', 'INSERT', 'UPDATE', 'DROP'], answer: 0, explain: 'SELECT ... FROM ...' },
      { q: 'Como contar todas as linhas?', options: ['SUM(*)', 'COUNT(*)', 'LEN(*)', 'TOTAL(*)'], answer: 1, explain: 'COUNT(*) conta linhas.' },
      { q: 'Como apagar uma tabela inteira (estrutura)?', options: ['DELETE TABLE', 'DROP TABLE', 'REMOVE TABLE', 'CLEAR TABLE'], answer: 1, explain: 'DROP TABLE remove a tabela; DELETE remove linhas.' },
      { q: 'Cláusula para filtrar linhas?', options: ['WHERE', 'IF', 'FILTER', 'WHEN'], answer: 0, explain: 'WHERE condição.' },
      { q: 'O que combina linhas de duas tabelas?', options: ['MERGE', 'JOIN', 'LINK', 'BIND'], answer: 1, explain: 'JOIN ... ON ...' }
    ]
  },
  {
    id: 'bash', label: 'Bash', icon: '🐚', color: '#4eaa25',
    questions: [
      { q: 'Qual a saída?', code: 'echo $((2 + 3))', options: ['5', '2+3', '23', 'Erro'], answer: 0, explain: '$(( )) avalia aritmética.' },
      { q: 'Qual comando lista arquivos?', options: ['dir', 'ls', 'list', 'show'], answer: 1, explain: 'ls lista o diretório.' },
      { q: 'Como se lê o valor de uma variável VAR?', options: ['$VAR', '&VAR', '@VAR', '%VAR'], answer: 0, explain: 'echo $VAR' },
      { q: 'O que é "#!/bin/bash" na 1ª linha?', options: ['Comentário comum', 'Shebang (define o interpretador)', 'Erro', 'Variável'], answer: 1, explain: 'Shebang diz qual programa executa o script.' },
      { q: 'Qual símbolo encadeia a saída de um comando na entrada de outro?', options: ['>', '|', '&', '<'], answer: 1, explain: '| é o pipe.' }
    ]
  },
  {
    id: 'html', label: 'HTML', icon: '🔶', color: '#e34f26',
    questions: [
      { q: 'Qual é o maior título?', options: ['<h6>', '<head>', '<h1>', '<title>'], answer: 2, explain: '<h1> é o título de maior nível.' },
      { q: 'Qual tag cria um link?', options: ['<a>', '<link>', '<href>', '<url>'], answer: 0, explain: '<a href="...">texto</a>' },
      { q: 'Qual tag exibe uma imagem?', options: ['<image>', '<img>', '<pic>', '<src>'], answer: 1, explain: '<img src="..." alt="...">' },
      { q: 'Como se escreve um comentário em HTML?', options: ['// ...', '<!-- ... -->', '/* ... */', '# ...'], answer: 1, explain: '<!-- comentário -->' },
      { q: 'Qual tag cria uma lista NUMERADA?', options: ['<ul>', '<ol>', '<li>', '<dl>'], answer: 1, explain: '<ol> = ordered list.' }
    ]
  },
  {
    id: 'css', label: 'CSS', icon: '🎨', color: '#1572b6',
    questions: [
      { q: 'Qual propriedade muda a cor do texto?', options: ['font-color', 'color', 'text-color', 'fgcolor'], answer: 1, explain: 'color: red;' },
      { q: 'Qual prefixo seleciona uma classe?', options: ['#', '.', '*', '@'], answer: 1, explain: '.classe { } — # é id.' },
      { q: 'Num flex container, o que centraliza na horizontal?', options: ['align-items: center', 'justify-content: center', 'text-align: center', 'float: center'], answer: 1, explain: 'justify-content alinha no eixo principal.' },
      { q: 'Qual ESCONDE o elemento removendo o espaço dele?', options: ['visibility: hidden', 'display: none', 'opacity: 0', 'z-index: -1'], answer: 1, explain: 'display:none tira do fluxo; os outros mantêm o espaço.' }
    ]
  }
];

/** Total de questões em todas as trilhas (útil para UI). */
export const CODE_QUEST_TOTAL = CODE_QUEST.reduce((n, t) => n + t.questions.length, 0);
