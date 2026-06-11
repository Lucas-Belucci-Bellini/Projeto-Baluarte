/**
 * Snippets do Editor de Código — gatilhos rápidos estilo VS Code/IntelliJ
 * (issue #197: "tem atalhos e gatilhos rápidos para todos os códigos no VS Code").
 *
 * Cada snippet:
 *   trigger: o que o usuário digita para a sugestão aparecer (ex: "psvm")
 *   detail:  descrição curta exibida à direita no dropdown
 *   body:    código inserido. Convenções:
 *            \t  → um nível de indentação (vira dois espaços)
 *            $0  → onde o cursor fica depois de inserir
 *
 * Como adicionar um snippet: entre na lista da linguagem (ou em GENERIC para
 * valer em todas) e siga o formato acima. As linguagens sem lista própria
 * usam só os GENERIC + keywords.
 */

const JS_SNIPPETS = [
  { trigger: 'log', detail: 'console.log(…)', body: 'console.log($0);' },
  { trigger: 'clg', detail: 'console.log(…)', body: 'console.log($0);' },
  { trigger: 'cerr', detail: 'console.error(…)', body: 'console.error($0);' },
  { trigger: 'fori', detail: 'for clássico', body: 'for (let i = 0; i < $0; i++) {\n\t\n}' },
  { trigger: 'forof', detail: 'for…of', body: 'for (const item of $0) {\n\t\n}' },
  { trigger: 'func', detail: 'function', body: 'function $0() {\n\t\n}' },
  { trigger: 'afn', detail: 'arrow function', body: 'const $0 = () => {\n\t\n};' },
  { trigger: 'iife', detail: 'função auto-executável', body: '(() => {\n\t$0\n})();' },
  { trigger: 'tryc', detail: 'try / catch', body: 'try {\n\t$0\n} catch (e) {\n\tconsole.error(e);\n}' },
  { trigger: 'timeout', detail: 'setTimeout', body: 'setTimeout(() => {\n\t$0\n}, 1000);' },
  { trigger: 'interval', detail: 'setInterval', body: 'setInterval(() => {\n\t$0\n}, 1000);' },
  { trigger: 'fetch', detail: 'fetch + JSON', body: "fetch('$0')\n\t.then((r) => r.json())\n\t.then((data) => console.log(data));" }
];

export const SNIPPETS = {
  javascript: JS_SNIPPETS,
  typescript: JS_SNIPPETS,
  jsx: JS_SNIPPETS,
  tsx: JS_SNIPPETS,

  java: [
    { trigger: 'psvm', detail: 'public static void main', body: 'public static void main(String[] args) {\n\t$0\n}' },
    { trigger: 'main', detail: 'public static void main', body: 'public static void main(String[] args) {\n\t$0\n}' },
    { trigger: 'sout', detail: 'System.out.println', body: 'System.out.println($0);' },
    { trigger: 'souf', detail: 'System.out.printf', body: 'System.out.printf("$0");' },
    { trigger: 'serr', detail: 'System.err.println', body: 'System.err.println($0);' },
    { trigger: 'fori', detail: 'for clássico', body: 'for (int i = 0; i < $0; i++) {\n\t\n}' },
    { trigger: 'foreach', detail: 'for-each', body: 'for (var item : $0) {\n\t\n}' },
    { trigger: 'scanner', detail: 'Scanner de entrada', body: 'Scanner entrada = new Scanner(System.in);$0' },
    { trigger: 'class', detail: 'classe pública', body: 'public class $0 {\n\t\n}' },
    { trigger: 'tryc', detail: 'try / catch', body: 'try {\n\t$0\n} catch (Exception e) {\n\te.printStackTrace();\n}' }
  ],

  python: [
    { trigger: 'def', detail: 'função', body: 'def $0():\n\t' },
    { trigger: 'ifmain', detail: 'if __name__ == "__main__"', body: "if __name__ == '__main__':\n\t$0" },
    { trigger: 'fori', detail: 'for + range', body: 'for i in range($0):\n\t' },
    { trigger: 'forr', detail: 'for + range', body: 'for i in range($0):\n\t' },
    { trigger: 'tryc', detail: 'try / except', body: 'try:\n\t$0\nexcept Exception as e:\n\tprint(e)' },
    { trigger: 'class', detail: 'classe', body: 'class $0:\n\tdef __init__(self):\n\t\tpass' },
    { trigger: 'print', detail: 'print(f"…")', body: "print(f'$0')" }
  ],

  html: [
    { trigger: 'html5', detail: 'esqueleto HTML5', body: '<!DOCTYPE html>\n<html lang="pt-BR">\n<head>\n\t<meta charset="UTF-8">\n\t<title>$0</title>\n</head>\n<body>\n\t\n</body>\n</html>' },
    { trigger: 'div', detail: '<div class="…">', body: '<div class="$0"></div>' },
    { trigger: 'script', detail: '<script>', body: '<script>\n\t$0\n</script>' },
    { trigger: 'link', detail: 'CSS externo', body: '<link rel="stylesheet" href="$0">' },
    { trigger: 'img', detail: '<img src alt>', body: '<img src="$0" alt="">' },
    { trigger: 'btn', detail: '<button>', body: '<button type="button">$0</button>' }
  ],

  css: [
    { trigger: 'flexcenter', detail: 'flex centralizado', body: 'display: flex;\nalign-items: center;\njustify-content: center;$0' },
    { trigger: 'grid', detail: 'grid básico', body: 'display: grid;\ngrid-template-columns: repeat($0, 1fr);\ngap: 16px;' },
    { trigger: 'media', detail: '@media mobile', body: '@media (max-width: 768px) {\n\t$0\n}' },
    { trigger: 'trans', detail: 'transition suave', body: 'transition: all 0.2s ease;$0' }
  ],

  markdown: [
    { trigger: 'code', detail: 'bloco de código', body: '```js\n$0\n```' },
    { trigger: 'link', detail: '[texto](url)', body: '[$0]()' },
    { trigger: 'table', detail: 'tabela 2 colunas', body: '| Coluna | Coluna |\n|--------|--------|\n| $0 | |' }
  ]
};

/** Snippets válidos em qualquer linguagem (nenhum por enquanto — adicione aqui). */
export const GENERIC = [];

/**
 * Lista de snippets de uma linguagem (ou [] se ela não tem lista própria).
 * @param {string} langId - id de editor-langs.js (ex: 'java')
 */
export function snippetsFor(langId) {
  return (SNIPPETS[langId] || []).concat(GENERIC);
}
