/**
 * Academia do Baluarte (Fase 14).
 *
 * 10 linguagens de programação com tutoriais offline + desafios.
 */

export const LANGS_ACADEMY = [
  {
    id: 'javascript',
    name: 'JavaScript',
    icon: 'JS',
    color: '#f7df1e',
    paradigm: 'Multi-paradigma',
    year: 1995,
    creator: 'Brendan Eich',
    summary: 'Linguagem do navegador. Hoje roda em servidor (Node.js), desktop (Electron), mobile (React Native).',
    why: 'É a única que roda nativamente no browser. Indispensável pra web.',
    modules: [
      { title: 'Variáveis e tipos', code: `let nome = "Lucas";\nconst clearance = "OMEGA";\nlet ativo = true;\nconst missoes = ["ALFA", "BRAVO", "DELTA"];\nconsole.log(\`\${nome}: \${missoes.length} missões\`);` },
      { title: 'Funções', code: `// Arrow + destructuring\nconst saudar = ({ nome, equipe }) => \`\${equipe}: \${nome} reportando\`;\nconsole.log(saudar({ nome: "Charlie", equipe: "ALFA" }));` },
      { title: 'Async / await', code: `async function buscarDados() {\n  const r = await fetch('/api/status');\n  const data = await r.json();\n  return data.online;\n}` },
      { title: 'Classes', code: `class Operador {\n  constructor(nome, equipe) {\n    this.nome = nome;\n    this.equipe = equipe;\n  }\n  reportar() {\n    return \`\${this.equipe}: \${this.nome} ok\`;\n  }\n}` }
    ]
  },
  {
    id: 'python',
    name: 'Python',
    icon: 'PY',
    color: '#3776ab',
    paradigm: 'Multi-paradigma',
    year: 1991,
    creator: 'Guido van Rossum',
    summary: 'Linguagem de propósito geral conhecida pela legibilidade. Dominante em ciência de dados, IA, automação.',
    why: 'Sintaxe limpa, ecossistema gigante (numpy, pytorch, requests). Ideal pra protótipos rápidos.',
    modules: [
      { title: 'Variáveis e tipos', code: `nome = "Lucas"\nclearance = "OMEGA"\nativo = True\nmissoes = ["ALFA", "BRAVO", "DELTA"]\nprint(f"{nome}: {len(missoes)} missões")` },
      { title: 'List comprehensions', code: `quadrados = [x**2 for x in range(10)]\npares = [n for n in range(20) if n % 2 == 0]\nprint(quadrados, pares)` },
      { title: 'Classes e dataclasses', code: `from dataclasses import dataclass\n\n@dataclass\nclass Operador:\n    nome: str\n    equipe: str\n    ativo: bool = True\n\nop = Operador("Charlie", "ALFA")\nprint(op)` },
      { title: 'Async (asyncio)', code: `import asyncio\n\nasync def main():\n    await asyncio.sleep(0.1)\n    print("ok")\n\nasyncio.run(main())` }
    ]
  },
  {
    id: 'rust',
    name: 'Rust',
    icon: 'RS',
    color: '#ce422b',
    paradigm: 'Multi-paradigma (systems)',
    year: 2010,
    creator: 'Graydon Hoare / Mozilla',
    summary: 'Linguagem de sistemas com segurança de memória sem garbage collector. Ownership + borrow checker.',
    why: 'Performance de C/C++ sem buffer overflows. Concurrency segura. Adotada por Microsoft, Linux kernel.',
    modules: [
      { title: 'Variáveis e tipos', code: `fn main() {\n    let nome: &str = "Lucas";\n    let clearance = "OMEGA";\n    let missoes: Vec<&str> = vec!["ALFA", "BRAVO"];\n    println!("{}: {} missões", nome, missoes.len());\n}` },
      { title: 'Ownership', code: `fn main() {\n    let s = String::from("hello");\n    let s2 = s.clone();          // ownership preservada\n    // let bad = s; would move s\n    println!("{} {}", s, s2);\n}` },
      { title: 'Structs e impl', code: `struct Operador { nome: String, equipe: String }\n\nimpl Operador {\n    fn reportar(&self) -> String {\n        format!("{}: {} ok", self.equipe, self.nome)\n    }\n}` },
      { title: 'Result / Option', code: `fn dividir(a: f64, b: f64) -> Result<f64, &'static str> {\n    if b == 0.0 { Err("div/0") } else { Ok(a / b) }\n}\nmatch dividir(10.0, 2.0) {\n    Ok(v) => println!("{}", v),\n    Err(e) => println!("erro: {}", e),\n}` }
    ]
  },
  {
    id: 'go',
    name: 'Go',
    icon: 'GO',
    color: '#00add8',
    paradigm: 'Concorrente / procedural',
    year: 2009,
    creator: 'Google (Pike, Thompson, Griesemer)',
    summary: 'Compilada, concorrente nativa via goroutines. Sintaxe minimalista. Backend e infra.',
    why: 'Goroutines + channels. Cross-compile fácil. Kubernetes, Docker, Hugo são em Go.',
    modules: [
      { title: 'Hello + tipos', code: `package main\nimport "fmt"\n\nfunc main() {\n    nome := "Lucas"\n    missoes := []string{"ALFA", "BRAVO"}\n    fmt.Printf("%s: %d missões\\n", nome, len(missoes))\n}` },
      { title: 'Goroutines + channels', code: `package main\nimport ("fmt"; "time")\n\nfunc trabalho(id int, ch chan<- string) {\n    time.Sleep(time.Millisecond * 100)\n    ch <- fmt.Sprintf("worker %d done", id)\n}\n\nfunc main() {\n    ch := make(chan string, 3)\n    for i := 1; i <= 3; i++ {\n        go trabalho(i, ch)\n    }\n    for i := 0; i < 3; i++ { fmt.Println(<-ch) }\n}` },
      { title: 'Structs e métodos', code: `type Operador struct {\n    Nome   string\n    Equipe string\n}\n\nfunc (o *Operador) Reportar() string {\n    return fmt.Sprintf("%s: %s ok", o.Equipe, o.Nome)\n}` }
    ]
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    icon: 'TS',
    color: '#3178c6',
    paradigm: 'Multi-paradigma (tipado)',
    year: 2012,
    creator: 'Microsoft',
    summary: 'Superset de JavaScript com tipagem estática. Compila para JS puro.',
    why: 'Catches bugs em compile-time. Refactor seguro. IntelliSense rico. Padrão na maioria das stacks web.',
    modules: [
      { title: 'Interfaces e tipos', code: `interface Operador {\n  nome: string;\n  equipe: \"ALFA\" | \"BRAVO\" | \"CHARLIE\";\n  ativo?: boolean;\n}\n\nconst op: Operador = { nome: \"Lucas\", equipe: \"ALFA\" };` },
      { title: 'Generics', code: `function ultimo<T>(arr: T[]): T | undefined {\n  return arr[arr.length - 1];\n}\nconst n = ultimo([1, 2, 3]);    // number | undefined\nconst s = ultimo([\"a\", \"b\"]);  // string | undefined` },
      { title: 'Type guards', code: `function isNumber(x: unknown): x is number {\n  return typeof x === \"number\";\n}\n\nfunction processar(v: unknown) {\n  if (isNumber(v)) {\n    console.log(v.toFixed(2));\n  }\n}` }
    ]
  },
  {
    id: 'cpp',
    name: 'C++',
    icon: 'C+',
    color: '#00599c',
    paradigm: 'Multi-paradigma (systems)',
    year: 1985,
    creator: 'Bjarne Stroustrup',
    summary: 'Extensão de C com OOP, templates, RAII. Linguagem de jogos, sistemas, alto desempenho.',
    why: 'Controle total + abstrações de alto nível. Padrão em engines (Unreal, Unity nativo), HFT, OS.',
    modules: [
      { title: 'Hello', code: `#include <iostream>\n#include <string>\n\nint main() {\n    std::string nome = "Lucas";\n    std::cout << "Operador " << nome << "\\n";\n    return 0;\n}` },
      { title: 'Smart pointers (RAII)', code: `#include <memory>\n\nstruct Operador { std::string nome; };\n\nauto op = std::make_unique<Operador>("Lucas");\n// destruído automaticamente ao sair de escopo` },
      { title: 'Templates', code: `template<typename T>\nT maximo(const T& a, const T& b) {\n    return (a > b) ? a : b;\n}\n\nint main() {\n    std::cout << maximo(3, 7);\n    std::cout << maximo(2.5, 1.8);\n}` }
    ]
  },
  {
    id: 'java',
    name: 'Java',
    icon: 'JV',
    color: '#ed8b00',
    paradigm: 'OOP',
    year: 1995,
    creator: 'James Gosling / Sun',
    summary: 'JVM-based, "write once run anywhere". Enterprise heavyweight.',
    why: 'Android, fintech, sistemas grandes. JVM rica (Kotlin, Scala, Clojure).',
    modules: [
      { title: 'Classes', code: `public class Operador {\n    private String nome;\n    private String equipe;\n    \n    public Operador(String nome, String equipe) {\n        this.nome = nome;\n        this.equipe = equipe;\n    }\n    \n    public String reportar() {\n        return equipe + ": " + nome + " ok";\n    }\n}` },
      { title: 'Streams', code: `import java.util.*;\nimport java.util.stream.*;\n\nList<Integer> nums = List.of(1, 2, 3, 4, 5);\nint soma = nums.stream()\n    .filter(n -> n % 2 == 0)\n    .mapToInt(Integer::intValue)\n    .sum();` }
    ]
  },
  {
    id: 'csharp',
    name: 'C#',
    icon: 'C#',
    color: '#239120',
    paradigm: 'Multi-paradigma',
    year: 2000,
    creator: 'Microsoft / Anders Hejlsberg',
    summary: 'OOP com features modernas (LINQ, async/await nativo, records, patterns). .NET 8 é cross-platform.',
    why: 'Unity (games), .NET enterprise, F# nas costas. Hejlsberg trouxe TypeScript depois.',
    modules: [
      { title: 'Records (C# 9+)', code: `public record Operador(string Nome, string Equipe);\n\nvar op = new Operador("Lucas", "ALFA");\nConsole.WriteLine(op);  // imprime estruturado` },
      { title: 'LINQ', code: `var operacionais = equipes\n    .Where(e => e.Status == "ativa")\n    .OrderBy(e => e.Code)\n    .Select(e => e.Name)\n    .ToList();` }
    ]
  },
  {
    id: 'kotlin',
    name: 'Kotlin',
    icon: 'KT',
    color: '#7f52ff',
    paradigm: 'Multi-paradigma',
    year: 2011,
    creator: 'JetBrains',
    summary: 'JVM moderna. Padrão atual para Android. Mais concisa que Java.',
    why: 'Null safety, coroutines, expressões funcionais. Multiplatform (iOS, web, native).',
    modules: [
      { title: 'Data classes', code: `data class Operador(val nome: String, val equipe: String, val ativo: Boolean = true)\n\nval op = Operador("Lucas", "ALFA")\nprintln(op)  // toString automático\nprintln(op.copy(equipe = "BRAVO"))` },
      { title: 'Null safety', code: `var nome: String? = null  // pode ser null\nnome?.length              // só executa se não-null\nval tam = nome?.length ?: 0  // Elvis operator` },
      { title: 'Coroutines', code: `import kotlinx.coroutines.*\n\nfun main() = runBlocking {\n    val deferred = async { fetch() }\n    val resultado = deferred.await()\n}` }
    ]
  },
  {
    id: 'swift',
    name: 'Swift',
    icon: 'SW',
    color: '#fa7343',
    paradigm: 'Multi-paradigma',
    year: 2014,
    creator: 'Apple / Chris Lattner',
    summary: 'Linguagem da Apple para iOS, macOS, watchOS, tvOS, visionOS. Substitui Objective-C.',
    why: 'Único caminho oficial para iOS nativo. ARC + safety. Server-side via Vapor.',
    modules: [
      { title: 'Structs e protocolos', code: `protocol Reportavel {\n    func reportar() -> String\n}\n\nstruct Operador: Reportavel {\n    let nome: String\n    let equipe: String\n    \n    func reportar() -> String {\n        return "\\(equipe): \\(nome) ok"\n    }\n}` },
      { title: 'Optionals', code: `var nome: String? = nil\nif let n = nome { print(n) }\nlet seguro = nome ?? "default"` },
      { title: 'Async/await', code: `func buscarStatus() async throws -> String {\n    let url = URL(string: "...")!\n    let (data, _) = try await URLSession.shared.data(from: url)\n    return String(data: data, encoding: .utf8) ?? ""\n}` }
    ]
  }
];

LANGS_ACADEMY.push(
  {
    id: 'c',
    name: 'C',
    icon: 'C',
    color: '#5c6bc0',
    paradigm: 'Procedural (systems)',
    year: 1972,
    creator: 'Dennis Ritchie / Bell Labs',
    summary: 'A linguagem-mãe dos sistemas. Compilada, próxima do hardware, sem garbage collector. Base do Unix, Linux e de quase todo sistema operacional.',
    why: 'Aprender C é entender como o computador funciona de verdade — ponteiros, memória, stack e heap. É o alicerce de C++, Rust, Go e Python (o interpretador é em C).',
    modules: [
      { title: 'Hello e tipos', code: `#include <stdio.h>\n\nint main(void) {\n    char nome[] = "Lucas";\n    int missoes = 3;\n    printf("Operador %s: %d missoes\\n", nome, missoes);\n    return 0;\n}` },
      { title: 'Ponteiros', code: `int x = 42;\nint *p = &x;     // p aponta para x\nprintf("%d\\n", *p);  // 42 (desreferencia)\n*p = 100;        // altera x atraves do ponteiro\nprintf("%d\\n", x);   // 100` },
      { title: 'Structs', code: `struct Operador {\n    char nome[32];\n    int  clearance;\n};\n\nstruct Operador op = { "Lucas", 9 };\nprintf("%s nivel %d\\n", op.nome, op.clearance);` },
      { title: 'Alocação dinâmica', code: `#include <stdlib.h>\n\nint *v = malloc(5 * sizeof(int));\nfor (int i = 0; i < 5; i++) v[i] = i * i;\nfree(v);   // sempre libere o que alocou` }
    ]
  },
  {
    id: 'sql',
    name: 'SQL',
    icon: 'SQL',
    color: '#e38c00',
    paradigm: 'Declarativa (consulta)',
    year: 1974,
    creator: 'Donald Chamberlin / Raymond Boyce (IBM)',
    summary: 'Linguagem para consultar e manipular bancos de dados relacionais — PostgreSQL, MySQL, SQLite, SQL Server.',
    why: 'Todo sistema sério guarda dados. SQL é universal: você descreve O QUE quer e o banco descobre COMO buscar. Habilidade obrigatória pra qualquer dev.',
    modules: [
      { title: 'SELECT', code: `SELECT nome, equipe, clearance\nFROM operadores\nWHERE clearance >= 7\nORDER BY clearance DESC\nLIMIT 10;` },
      { title: 'JOIN', code: `SELECT o.nome, e.codinome\nFROM operadores o\nJOIN equipes e ON e.id = o.equipe_id\nWHERE e.status = 'ativa';` },
      { title: 'Agregações', code: `SELECT equipe_id,\n       COUNT(*)        AS total,\n       AVG(clearance)  AS media\nFROM operadores\nGROUP BY equipe_id\nHAVING COUNT(*) > 3;` },
      { title: 'INSERT / UPDATE', code: `INSERT INTO operadores (nome, equipe_id, clearance)\nVALUES ('Lucas', 1, 9);\n\nUPDATE operadores\nSET clearance = 10\nWHERE nome = 'Lucas';` }
    ]
  },
  {
    id: 'ruby',
    name: 'Ruby',
    icon: 'RB',
    color: '#cc342d',
    paradigm: 'OOP (tudo é objeto)',
    year: 1995,
    creator: 'Yukihiro "Matz" Matsumoto',
    summary: 'Linguagem dinâmica desenhada para a felicidade do programador. Famosa pelo framework Ruby on Rails.',
    why: 'Sintaxe expressiva e elegante — código que se lê quase como inglês. Rails ainda acelera muito a criação de aplicações web.',
    modules: [
      { title: 'Variáveis e saída', code: `nome = "Lucas"\nmissoes = ["ALFA", "BRAVO", "DELTA"]\nputs "#{nome}: #{missoes.size} missoes"` },
      { title: 'Métodos e blocos', code: `def saudar(nome)\n  "Operador #{nome} reportando"\nend\n\nputs saudar("Charlie")\n[1, 2, 3].each { |n| puts n * 10 }` },
      { title: 'Classes', code: `class Operador\n  attr_accessor :nome, :equipe\n\n  def initialize(nome, equipe)\n    @nome = nome\n    @equipe = equipe\n  end\n\n  def reportar\n    "#{@equipe}: #{@nome} ok"\n  end\nend` },
      { title: 'Iteradores funcionais', code: `nums = (1..10).to_a\npares = nums.select { |n| n.even? }\ndobro = nums.map  { |n| n * 2 }\nsoma  = nums.reduce(0) { |a, n| a + n }` }
    ]
  },
  {
    id: 'php',
    name: 'PHP',
    icon: 'PHP',
    color: '#777bb4',
    paradigm: 'Multi-paradigma (web)',
    year: 1995,
    creator: 'Rasmus Lerdorf',
    summary: 'Linguagem de servidor que move boa parte da web. WordPress, Wikipedia e o Facebook original rodam em PHP.',
    why: 'O PHP 8 é rápido e moderno. Roda em qualquer hospedagem barata e o framework Laravel é um dos melhores do mercado.',
    modules: [
      { title: 'Variáveis e echo', code: `<?php\n$nome = "Lucas";\n$missoes = 3;\necho "Operador $nome: $missoes missoes\\n";` },
      { title: 'Funções', code: `<?php\nfunction reportar(string $nome, string $equipe): string {\n    return "$equipe: $nome ok";\n}\n\necho reportar("Charlie", "ALFA");` },
      { title: 'Arrays associativos', code: `<?php\n$operador = [\n    "nome" => "Lucas",\n    "equipe" => "ALFA",\n    "clearance" => 9,\n];\nforeach ($operador as $chave => $valor) {\n    echo "$chave: $valor\\n";\n}` },
      { title: 'Classes', code: `<?php\nclass Operador {\n    public function __construct(\n        public string $nome,\n        public string $equipe\n    ) {}\n\n    public function reportar(): string {\n        return "{$this->equipe}: {$this->nome} ok";\n    }\n}` }
    ]
  },
  {
    id: 'lua',
    name: 'Lua',
    icon: 'LUA',
    color: '#3a4fb0',
    paradigm: 'Multi-paradigma (scripting)',
    year: 1993,
    creator: 'PUC-Rio — Roberto Ierusalimschy',
    summary: 'Linguagem de script leve e embarcável, criada no Brasil (PUC-Rio). Roteiriza jogos e aplicativos.',
    why: 'Orgulho nacional. Roda dentro do Roblox, World of Warcraft, Neovim e Redis — é pequena, veloz e fácil de embutir.',
    modules: [
      { title: 'Variáveis e tipos', code: `local nome = "Lucas"\nlocal missoes = { "ALFA", "BRAVO", "DELTA" }\nprint(nome .. ": " .. #missoes .. " missoes")` },
      { title: 'Funções', code: `local function reportar(nome, equipe)\n  return equipe .. ": " .. nome .. " ok"\nend\n\nprint(reportar("Charlie", "ALFA"))` },
      { title: 'Tables', code: `local operador = {\n  nome = "Lucas",\n  equipe = "ALFA",\n  clearance = 9,\n}\nfor chave, valor in pairs(operador) do\n  print(chave, valor)\nend` },
      { title: 'Metatables', code: `local Vetor = {}\nVetor.__index = Vetor\n\nfunction Vetor.novo(x, y)\n  return setmetatable({ x = x, y = y }, Vetor)\nend\n\nfunction Vetor:soma(o)\n  return Vetor.novo(self.x + o.x, self.y + o.y)\nend` }
    ]
  },
  {
    id: 'bash',
    name: 'Bash',
    icon: 'SH',
    color: '#4eaa25',
    paradigm: 'Script de shell',
    year: 1989,
    creator: 'Brian Fox / GNU',
    summary: 'O shell padrão do Linux. Automatiza tarefas, encadeia programas e administra servidores pelo terminal.',
    why: 'Quem mexe com Linux, servidores ou DevOps vive no terminal. Bash é a cola que junta todas as ferramentas.',
    modules: [
      { title: 'Variáveis', code: `#!/bin/bash\nnome="Lucas"\nmissoes=3\necho "Operador $nome: $missoes missoes"\necho "Data: $(date +%F)"` },
      { title: 'Condicionais', code: `#!/bin/bash\nclearance=9\nif [ "$clearance" -ge 7 ]; then\n  echo "Acesso OMEGA liberado"\nelse\n  echo "Acesso negado"\nfi` },
      { title: 'Loops', code: `#!/bin/bash\nfor equipe in ALFA BRAVO DELTA; do\n  echo "Equipe $equipe pronta"\ndone\n\nfor arquivo in *.txt; do\n  echo "Processando $arquivo"\ndone` },
      { title: 'Funções e pipes', code: `#!/bin/bash\nreportar() {\n  echo "$2: $1 ok"\n}\nreportar "Charlie" "ALFA"\n\n# conta arquivos .js no diretorio\nls *.js | wc -l` }
    ]
  }
);

export const TOTAL_LANGS = LANGS_ACADEMY.length;

export function findLang(id) {
  return LANGS_ACADEMY.find((l) => l.id === id) || null;
}

/**
 * Recursos externos de aprendizado — onde tirar dúvidas, estudar de graça,
 * consultar documentação e treinar. Links verificados e estáveis.
 */
export const LEARNING_RESOURCES = [
  {
    group: 'Tire suas dúvidas',
    note: 'Comunidades onde você pergunta e alguém responde.',
    links: [
      { name: 'Stack Overflow', url: 'https://stackoverflow.com', desc: 'O maior repositório de perguntas e respostas de programação do mundo.' },
      { name: 'Stack Overflow em Português', url: 'https://pt.stackoverflow.com', desc: 'Versão em português — pergunte sem medo do inglês.' },
      { name: 'r/learnprogramming', url: 'https://www.reddit.com/r/learnprogramming/', desc: 'Comunidade do Reddit dedicada a quem está começando.' },
      { name: 'DEV Community', url: 'https://dev.to', desc: 'Artigos, tutoriais e discussões escritas por desenvolvedores.' }
    ]
  },
  {
    group: 'Cursos gratuitos',
    note: 'Trilhas completas de graça, do zero ao avançado.',
    links: [
      { name: 'freeCodeCamp', url: 'https://www.freecodecamp.org', desc: 'Currículo enorme e gratuito com certificados — web, dados, Python.' },
      { name: 'The Odin Project', url: 'https://www.theodinproject.com', desc: 'Trilha full-stack open-source, projeto após projeto.' },
      { name: 'CS50 (Harvard)', url: 'https://cs50.harvard.edu/x/', desc: 'O lendário curso de introdução à ciência da computação de Harvard.' },
      { name: 'Curso em Vídeo', url: 'https://www.cursoemvideo.com', desc: 'Cursos gratuitos em português do prof. Gustavo Guanabara.' },
      { name: 'Khan Academy', url: 'https://pt.khanacademy.org/computing', desc: 'Computação e programação explicadas do começo, em português.' }
    ]
  },
  {
    group: 'Documentação e referência',
    note: 'Onde consultar como as coisas funcionam de verdade.',
    links: [
      { name: 'MDN Web Docs', url: 'https://developer.mozilla.org/pt-BR/', desc: 'A referência definitiva de HTML, CSS e JavaScript (Mozilla).' },
      { name: 'W3Schools', url: 'https://www.w3schools.com', desc: 'Tutoriais curtos com exemplos editáveis no navegador.' },
      { name: 'DevDocs', url: 'https://devdocs.io', desc: 'Documentação de dezenas de linguagens reunida e pesquisável.' },
      { name: 'roadmap.sh', url: 'https://roadmap.sh', desc: 'Mapas visuais do que estudar para cada carreira de dev.' }
    ]
  },
  {
    group: 'Pratique programando',
    note: 'Exercícios e desafios para fixar o que aprendeu.',
    links: [
      { name: 'Exercism', url: 'https://exercism.org', desc: 'Exercícios com mentoria gratuita em mais de 70 linguagens.' },
      { name: 'Codewars', url: 'https://www.codewars.com', desc: 'Desafios (katas) com ranking e soluções da comunidade.' },
      { name: 'LeetCode', url: 'https://leetcode.com', desc: 'Problemas de algoritmos — o padrão para entrevistas técnicas.' },
      { name: 'Beecrowd', url: 'https://judge.beecrowd.com', desc: 'Juiz online brasileiro (ex-URI) com centenas de problemas.' },
      { name: 'Advent of Code', url: 'https://adventofcode.com', desc: 'Quebra-cabeças de programação lançados todo mês de dezembro.' }
    ]
  }
];

/**
 * Programar não é só escrever código. A área de tecnologia tem muitos
 * papéis — e até "programar" envolve ler, depurar, projetar e comunicar.
 */
export const TECH_INTRO =
  'Muita gente acha que trabalhar com tecnologia é passar o dia digitando ' +
  'código. Não é. Programar de verdade é, na maior parte do tempo, LER código, ' +
  'CAÇAR bugs, PROJETAR soluções, conversar com pessoas e tomar decisões. E o ' +
  'campo é enorme: há carreiras inteiras de TI que quase não tocam em código. ' +
  'Escolha pelo que você gosta de fazer, não pelo estereótipo.';

export const TECH_CARREIRAS = [
  { nome: 'Front-end', codigo: 'Muito código', desc: 'Constrói a interface que o usuário vê e usa — HTML, CSS, JavaScript. Mistura código com olhar para design.' },
  { nome: 'Back-end', codigo: 'Muito código', desc: 'Cuida do servidor, da lógica de negócio e dos bancos de dados — a parte que o usuário não vê.' },
  { nome: 'Mobile', codigo: 'Muito código', desc: 'Desenvolve aplicativos para celular (Android, iOS), lidando com telas pequenas e recursos limitados.' },
  { nome: 'DevOps / SRE', codigo: 'Código + infra', desc: 'Automatiza deploys, monitora sistemas e mantém tudo no ar de forma confiável. Mais scripts e infraestrutura que app.' },
  { nome: 'QA / Testes', codigo: 'Pouco a médio código', desc: 'Garante a qualidade: encontra bugs, escreve testes e pensa em tudo que pode dar errado.' },
  { nome: 'Cibersegurança', codigo: 'Código + análise', desc: 'Protege sistemas e dados, investiga ataques e pensa como um invasor para defender melhor.' },
  { nome: 'Ciência / Análise de Dados', codigo: 'Código + estatística', desc: 'Transforma montanhas de dados em decisões. Mais matemática, estatística e perguntas certas que software.' },
  { nome: 'UX / UI Design', codigo: 'Quase nenhum código', desc: 'Projeta como o produto deve ser usado e como deve parecer, para que seja fácil e agradável.' },
  { nome: 'Product Manager', codigo: 'Nenhum código', desc: 'Decide O QUE construir e por quê. Conversa com usuários, prioriza e alinha o time — não programa.' },
  { nome: 'Gestão / Tech Lead', codigo: 'Pouco código', desc: 'Lidera pessoas e decisões técnicas. Quanto mais sênior, menos código e mais comunicação e estratégia.' },
  { nome: 'Documentação Técnica', codigo: 'Quase nenhum código', desc: 'Escreve manuais, tutoriais e referências claras. Une domínio técnico com talento para escrever.' },
  { nome: 'Suporte Técnico', codigo: 'Nenhum a pouco código', desc: 'Ajuda usuários a resolver problemas. Porta de entrada comum na área, exige paciência e didática.' },
  { nome: 'Game Design', codigo: 'Pouco código', desc: 'Projeta as regras, a progressão e a diversão de um jogo — diferente de programar o jogo.' },
  { nome: 'Banco de Dados', codigo: 'Código especializado (SQL)', desc: 'Modela, otimiza e protege os dados. Especialidade própria, com SQL no centro.' }
];
