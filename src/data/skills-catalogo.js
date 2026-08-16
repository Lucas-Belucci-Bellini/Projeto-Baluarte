/**
 * Catálogo de skills do Projeto Baluarte — ARQUIVO GERADO.
 *
 * Não edite à mão: rode `npm run gen-catalogo-skills`.
 * Fonte: `.claude/skills/*​/SKILL.md`.
 *
 * Serve pro J.A.R.V.I.S. saber o que o PROJETO sabe fazer, do mesmo jeito que
 * `site-capabilities.js` faz ele saber quais páginas existem.
 */

/** @typedef {{ id: string, nome: string, descricao: string, exemplos: string[] }} Skill */

/** @type {Skill[]} */
export const SKILLS = [
  {
    "id": "gitnexus-cli",
    "nome": "gitnexus cli",
    "descricao": "Use when the user needs to run GitNexus CLI commands like analyze/index a repo, check status, clean the index, generate a wiki, or list indexed repos",
    "exemplos": [
      "Index this repo",
      "Reanalyze the codebase",
      "Generate a wiki"
    ]
  },
  {
    "id": "gitnexus-debugging",
    "nome": "gitnexus debugging",
    "descricao": "Use when the user is debugging a bug, tracing an error, or asking why something fails",
    "exemplos": [
      "Why is X failing?",
      "Where does this error come from?",
      "Trace this bug"
    ]
  },
  {
    "id": "gitnexus-exploring",
    "nome": "gitnexus exploring",
    "descricao": "Use when the user asks how code works, wants to understand architecture, trace execution flows, or explore unfamiliar parts of the codebase",
    "exemplos": [
      "How does X work?",
      "What calls this function?",
      "Show me the auth flow"
    ]
  },
  {
    "id": "gitnexus-guide",
    "nome": "gitnexus guide",
    "descricao": "Use when the user asks about GitNexus itself — available tools, how to query the knowledge graph, MCP resources, graph schema, or workflow reference",
    "exemplos": [
      "What GitNexus tools are available?",
      "How do I use GitNexus?"
    ]
  },
  {
    "id": "gitnexus-impact-analysis",
    "nome": "gitnexus impact analysis",
    "descricao": "Use when the user wants to know what will break if they change something, or needs safety analysis before editing code",
    "exemplos": [
      "Is it safe to change X?",
      "What depends on this?",
      "What will break?"
    ]
  },
  {
    "id": "gitnexus-refactoring",
    "nome": "gitnexus refactoring",
    "descricao": "Use when the user wants to rename, extract, split, move, or restructure code safely",
    "exemplos": [
      "Rename this function",
      "Extract this into a module",
      "Refactor this class"
    ]
  },
  {
    "id": "run-projeto-baluarte",
    "nome": "run projeto baluarte",
    "descricao": "Rodar, buildar, testar ou tirar screenshot do site Projeto Baluarte. Use quando pedirem para \"rodar o site\", \"subir o servidor\", \"tirar screenshot da página X\", \"verificar se a página Y funciona\" ou rodar o smoke test (boot + editor de código)",
    "exemplos": []
  }
];

/** Texto compacto pro briefing do JARVIS (uma linha por skill). */
export function skillsBriefing() {
  if (SKILLS.length === 0) return '';
  const linhas = SKILLS.map((s) => `- **${s.id}** — ${s.descricao}`);
  return `## HABILIDADES DO PROJETO (${SKILLS.length})\n${linhas.join('\n')}`;
}
