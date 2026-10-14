# #231 — JARVIS ↔ Git Nexus: o grafo de código como skills do JARVIS (inspirado no OpenJarvis)

> **Status:** open · **Criada:** 2026-06-15 · **Atualizada:** 2026-06-15 · **Comentários:** 0
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/231
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

## Contexto / inspiração

O operador apontou o **[OpenJarvis](https://github.com/open-jarvis/OpenJarvis)** (Stanford, Apache-2.0) como algo legal pra somar ao Git Nexus. O OpenJarvis é um **framework de agentes de IA local-first** — o framework em si (Python/Rust/Ollama) **não roda no site estático** (mesma parede do GitNexus). Mas o **coração** dele casa perfeito com o que já temos: o **Skills System** — agentes **descobrem e chamam ferramentas** de um catálogo (padrão `agentskills.io`) e as **compõem**.

Acontece que o nosso JARVIS **já é** um agente de tools, e o Git Nexus **já tem** as ferramentas de grafo. Falta **ligar os dois**: registrar o Git Nexus como **skills chamáveis** pelo JARVIS.

## O que já existe (não precisa criar)

**JARVIS** (`src/utils/jarvis-tools.js`):
- Registro dinâmico de tools: `registerTool(tool)`, `runTool(name, input)`, `getToolSchemas()`, `initSkills()`.
- Já cria skills em runtime (`create_skill`/`registerSkillAsTool`) — ou seja, já é "OpenJarvis-like".

**Git Nexus** (`src/utils/git-nexus-engine.js`):
- `nexusContext(graph, id)` — definição + quem chama/importa + o que chama/importa.
- `nexusImpact(graph, id, dir)` — raio de explosão.
- `riskLevel(n)` — BAIXO→CRÍTICO.
- `nexusPath(graph, a, b)` — menor caminho entre dois símbolos.
- `nexusRename(graph, id)` — usos que um rename tocaria.
- `search(graph, query)` — resolve um nome humano ("helpers.js") num nó do grafo.

## Proposta — registrar 5 skills do Nexus no catálogo do JARVIS

Um módulo novo (ex.: `src/utils/jarvis-nexus-tools.js`) que, no boot do JARVIS (`initSkills`), monta o grafo (`analyze(codemap).graph` / `symbolSubmap`) e faz `registerTool(...)` de:

| Skill (tool) | O que faz | Engine |
|---|---|---|
| `nexus_impact` | "o que quebra se eu mudar X?" → nível de risco + nº de afetados + lista | `search` → `nexusImpact` + `riskLevel` |
| `nexus_context` | quem chama/importa X e o que X chama/importa | `search` → `nexusContext` |
| `nexus_path` | menor caminho de chamadas/imports entre A e B | `search` ×2 → `nexusPath` |
| `nexus_deps` | dependências diretas/transitivas de X | `search` → `nexusImpact(dir:'down')` |
| `nexus_rename` | quantos usos um rename seguro de X tocaria | `search` → `nexusRename` |

Cada tool recebe um alvo em texto, usa `search` pra resolver o id, chama a função do engine e devolve um JSON curto que o JARVIS verbaliza.

## Exemplo de conversa

> **Operador:** "o que quebra se eu mexer no helpers.js?"
> **JARVIS** *(chama `nexus_impact({ target: "helpers.js" })`)* → "Risco **CRÍTICO**: 115 arquivos dependem de `helpers.js` (47 diretos). Os mais expostos: `router.js`, `home.js`, `git-nexus.js`… Quer o caminho de algum até ele?"

## Onde mexer (pequeno e verificável)

1. `jarvis-nexus-tools.js` (novo): monta o grafo 1×, define os 5 schemas + executores, `registerTool` no `initSkills`.
2. Resolver alvo: `search(graph, q)` → 1º resultado (ou pede desambiguação).
3. Verbalização: cada executor devolve `{ risk, affected, top, ... }`; o prompt do JARVIS já sabe falar resultados de tool.
- Tudo em **JS puro**, roda na web, **verificável** (Playwright: perguntar ao JARVIS e ver a tool-call).

## Camadas futuras (não nesta fatia)

- **Desktop (launcher):** um agente estilo OpenJarvis dirige o **motor real** do GitNexus na 4747 (consultas Cypher de verdade), não só o codemap.
- **Optimization loop:** registrar traces de uso das skills (o que o operador pergunta / o que ajuda) pra melhorar as respostas — exatamente o "learning loop" do OpenJarvis.

## Fora de escopo

Não vamos vendorizar o framework OpenJarvis (Python/Rust/Ollama) — é o **padrão de skills** que importamos, aplicado às ferramentas que já temos.

---
Decisão do operador: **planejar primeiro** (esta issue). Quando quiser, eu construo a 1ª fatia (os 5 `nexus_*` como skills do JARVIS).

https://claude.ai/code/session_01S1j1HX2j1zEJoPxTuek3yM
