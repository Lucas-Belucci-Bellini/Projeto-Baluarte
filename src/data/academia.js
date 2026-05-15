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

export const TOTAL_LANGS = LANGS_ACADEMY.length;

export function findLang(id) {
  return LANGS_ACADEMY.find((l) => l.id === id) || null;
}
