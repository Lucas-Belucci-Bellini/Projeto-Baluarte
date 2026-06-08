# 💻 Terminal-IA — o "terminal do Claude Code" no site

> Status: **planejado** — base pronta, é só iniciar.

Um terminal (REPL) dentro do site onde o operador digita comandos ou linguagem
natural e o **JARVIS** responde e **age**: navega, consulta dados, roda
ferramentas, lê/escreve memória e analisa o próprio código.

## Por que já está "pronto pra iniciar"
As peças que o Terminal-IA precisa já existem nesta base:

| Peça | Onde | O que entrega ao terminal |
|------|------|---------------------------|
| Mapa do site | `src/data/site-capabilities.js` | `findCapability()` → resolver `:go <destino>` para qualquer rota |
| Memória durável | `src/utils/jarvis-brain.js` | `addMemory/searchMemories/memoryContext` → `:mem` |
| Contexto do código | `jarvis-brain.codeContext()` + `src/data/codemap.json` | `:code <pergunta>` (Raio-X) |
| IA real | `src/utils/jarvis-engine.js` (`processServer` = Gemini, `processLocal`) | texto livre → resposta/ação |
| Gráficos | `src/utils/chart-engine.js` + `emitJarvis` | `:chart` / blocos ```chart``` |
| Segundo Cérebro | `src/data/cerebro.json` | `:brain` para inspecionar conceitos |

## Esboço de comandos
- `:go <destino>` — navega (usa `findCapability`)
- `:mem add <fato>` · `:mem find <termo>` · `:mem list` — memória do JARVIS
- `:code <pergunta>` — pergunta sobre o próprio código (codemap)
- `:chart <tipo>: a 1, b 2` — desenha gráfico
- `:brain <conceito>` — mostra ligações no Segundo Cérebro
- `<texto livre>` — manda pro JARVIS (Gemini) com todo o contexto acima

## Plano de implementação (1 página)
1. `src/pages/terminal-ia.js` (`/terminal-ia`) — REPL: histórico, prompt, parser de `:comandos`, fallback para `processServer`/`processLocal`.
2. `src/styles/terminal-ia.css` — visual de terminal (monoespaçado, cursor).
3. Registrar rota (main/sidebar/shell/index/icons) — grupo **IA & Jarvis**.
4. Reusar `jarvis-brain`, `site-capabilities`, `chart-engine` — sem duplicar lógica.

Convenção do repositório: cada projeto do Claude Code mora em `projetos/<nome>/`.
