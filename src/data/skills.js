/**
 * IA Proprietária Mark 11 — Sistema de Skills (Fase 21).
 *
 * Cada Skill é uma capacidade modular descrita em formato SKILL.md:
 * frontmatter (nome, trigger, categoria) + corpo markdown com instruções.
 *
 * Skills built-in abaixo. O usuário pode criar/editar as suas via UI;
 * estas ficam persistidas em localStorage.
 */

export const SKILL_CATEGORIES = [
  { id: 'core',      label: 'Núcleo',        color: '#d4a24e' },
  { id: 'dev',       label: 'Desenvolvimento', color: '#00ff88' },
  { id: 'research',  label: 'Pesquisa',      color: '#e8c07a' },
  { id: 'creative',  label: 'Criativo',      color: '#ffaa00' },
  { id: 'ops',       label: 'Operações',     color: '#66ddff' }
];

export const BUILTIN_SKILLS = [
  {
    id: 'baluarte-navigator',
    name: 'Baluarte Navigator',
    category: 'core',
    trigger: 'Quando o operador pede para abrir, navegar ou ir a uma seção do Baluarte.',
    version: '1.0.0',
    body: `# Baluarte Navigator

## Propósito
Navegar pelas 30+ rotas do Baluarte Mark XIII a partir de linguagem natural.

## Como funciona
1. Identifica a intenção de navegação na mensagem do operador.
2. Mapeia o termo para a rota correspondente (hash-based router).
3. Executa router.navigate(rota).

## Rotas conhecidas
- /home, /ferramentas, /editor, /terminal
- /calc-cientifica, /calc-numerica, /calculadoras
- /tabela-verdade, /cripto, /graficos, /simbolos, /regex
- /arsenal, /biblioteca, /elites, /ciberseg, /academia
- /fft, /media, /videos, /universo
- /tabela-periodica, /modpack, /guia-pc, /logic-sim
- /perfil, /economia, /jarvis, /ia-proprietaria, /sobre

## Exemplo
> "abra o arsenal" → navigate('/arsenal')`
  },
  {
    id: 'code-runner',
    name: 'Code Runner',
    category: 'dev',
    trigger: 'Quando há um snippet de código JS/HTML/CSS para executar.',
    version: '1.0.0',
    body: `# Code Runner

## Propósito
Executar código em sandbox isolado (iframe) e capturar a saída.

## Linguagens com runner
- **JavaScript**: console capturado (log/warn/error/info) + try/catch
- **HTML**: render direto via srcdoc
- **CSS**: wrap em template demo
- **Markdown**: render para HTML

## Segurança
- Sempre iframe sandbox="allow-scripts"
- Sem acesso ao DOM principal
- Sem acesso a cookies/storage do app

## Limitações
- Sem rede dentro do sandbox por padrão
- Linguagens compiladas: só syntax highlight (Fase futura: WASM)`
  },
  {
    id: 'lore-keeper',
    name: 'Lore Keeper',
    category: 'research',
    trigger: 'Perguntas sobre arcos, equipes, universos ou personagens das Crônicas.',
    version: '1.0.0',
    body: `# Lore Keeper

## Propósito
Consultar e cruzar o universo narrativo do Baluarte.

## Bases de dados
- **Crônicas**: 24 arcos (ALFA → ZULU)
- **Elites**: 26 equipes operacionais
- **Universos**: 10 (Baluarte + 8 crossovers + Convergência)
- **Arsenal**: 148 armas/veículos

## Cruzamentos possíveis
- Equipe → arco das Crônicas relacionado
- Universo → arcos + facções + ameaças
- Arma → equipe que a utiliza

## Princípio
Manter consistência canônica. Não inventar fatos fora do estabelecido.`
  },
  {
    id: 'crypto-analyst',
    name: 'Crypto Analyst',
    category: 'dev',
    trigger: 'Quando há texto cifrado para analisar ou cifrar.',
    version: '1.0.0',
    body: `# Crypto Analyst

## Propósito
Análise e operação de cifras clássicas e modernas.

## Capacidades
- **Clássicas**: César (+ brute force), Vigenère, Atbash
- **Encoding**: Base64, Base32, Hex
- **Hash**: SHA-1/256/384/512 (Web Crypto)
- **Moderna**: AES-GCM (PBKDF2), One-Time Pad
- **Comunicação**: Morse (+ áudio)

## Heurística de criptoanálise
- César: score de bigramas PT pra rankear shifts
- Vigenère: Kasiski/Friedman para textos longos
- Frequência de letras para substituição simples`
  },
  {
    id: 'skill-author',
    name: 'Skill Author',
    category: 'core',
    trigger: 'Quando o operador quer criar ou modificar uma skill.',
    version: '1.0.0',
    body: `# Skill Author

## Propósito
Meta-skill: cria e edita outras skills do sistema Mark 11.

## Formato SKILL.md
Cada skill tem:
- **Frontmatter**: id, name, category, trigger, version
- **Body**: markdown com Propósito, Como funciona, Exemplos

## Boas práticas
1. Trigger claro e específico (quando ativar).
2. Propósito em uma frase.
3. Instruções acionáveis, não teoria.
4. Exemplos concretos.

## Princípio do Mark 11
Skills são modulares e componíveis. Uma skill não deve duplicar
o que outra já faz — deve referenciar.`
  },
  {
    id: 'narrative-forge',
    name: 'Narrative Forge',
    category: 'creative',
    trigger: 'Pedidos de escrita criativa ou expansão de arcos das Crônicas.',
    version: '1.0.0',
    body: `# Narrative Forge

## Propósito
Expandir capítulos das Crônicas da Baluarte mantendo tom e canon.

## Tom
- Militar, tenso, conciso
- Frases curtas em momentos de ação
- Foco no operador Lucas Belucci Bellini

## Estrutura de capítulo
1. Gancho de abertura (1 parágrafo)
2. Desenvolvimento (situação tática)
3. Virada ou revelação
4. Gancho para o próximo

## Crossovers
Respeitar as regras de cada universo (DOOM, Halo, Pacific Rim,
Solo Leveling, Vanadis, Arifureta). Não misturar mecânicas
incompatíveis sem justificativa narrativa.`
  },
  {
    id: 'system-doctor',
    name: 'System Doctor',
    category: 'ops',
    trigger: 'Diagnóstico de problemas, status do sistema, dúvidas técnicas do Baluarte.',
    version: '1.0.0',
    body: `# System Doctor

## Propósito
Diagnóstico e status do Baluarte Mark XIII.

## Checagens
- Versão e fase atual
- Rotas registradas vs ativas
- Service Worker (PWA offline)
- localStorage / IndexedDB (uso)

## Stack de referência
- JS puro ES2022, sem TypeScript, sem framework
- Vite 5 como bundler
- 21 fases incrementais, cada uma com tag e branch

## Princípio
Nunca usar TypeScript (regra que veio das 12 falhas anteriores).`
  }
];

/**
 * Renderiza uma skill como texto SKILL.md completo (frontmatter + body).
 */
export function skillToMarkdown(skill) {
  return [
    '---',
    `id: ${skill.id}`,
    `name: ${skill.name}`,
    `category: ${skill.category}`,
    `version: ${skill.version || '1.0.0'}`,
    `trigger: ${skill.trigger}`,
    '---',
    '',
    skill.body
  ].join('\n');
}
