# #258 — 🧭 Encolher a sidebar: seção IA & JARVIS vira só "Git Nexus" (Núcleo de IA)

> **Status:** open · **Criada:** 2026-06-20 · **Atualizada:** 2026-06-20 · **Comentários:** 0
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/258
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

## Objetivo
A seção **IA & Jarvis** da sidebar tem hoje **12 entradas** (Git Nexus, J.A.R.V.I.S., Conselho de IAs, Central de APIs, Jarvis Dashboard, ML da Memória, Mini-LLM do Zero, Segundo Cérebro, Memória do JARVIS, Terminal-IA, Segurança do Agente, IA Proprietária) — polui o menu. A ideia é **deixar uma entrada só** ("Git Nexus" / Núcleo de IA); as ferramentas viram **abas** dentro do cockpit do Git Nexus.

Faz parte da **fusão da seção IA no Git Nexus** (#231/#238) — decisão do operador: *cockpit com abas reusando código, incremental, IA app-only*.

## Estado atual
- ✅ **Etapa 1 (cockpit)** — #256 (mergeado): Git Nexus virou um cockpit com 12 abas (Grafo de Código + as 11 ferramentas), cada aba carregada sob demanda reusando o render existente.
- 🟡 **Etapa 2 (navegação)** — **PR #257** (em revisão): **é exatamente este pedido.**
  - [x] Sidebar: as 12 entradas de IA colapsam em **uma só** (`/git-nexus`).
  - [x] Rotas legadas (`/jarvis`, `/conselho`, `/apis`, `/jarvis-dashboard`, `/aprendizado`, `/llm-lab`, `/cerebro`, `/memoria`, `/terminal-ia`, `/seguranca`, `/ia-proprietaria`) → caem no cockpit na aba certa (bookmarks seguem). Deep-link `#/git-nexus?tab=`.
  - [x] IA app-only (#238): na web essas rotas mostram o teaser; no app abrem o cockpit.

> Ou seja: assim que o **#257** mergear, a sidebar já fica com **uma entrada só** nessa seção. Esta issue documenta o plano e os refinamentos que sobram.

## Decisão pendente — rótulo da entrada
A entrada única hoje (no #257) está como **"Núcleo de IA"**. O pedido foi "deixar só o **Git Nexus**". Definir:
- [ ] **Rótulo**: "Git Nexus" **ou** "Núcleo de IA"? (recomendo **Núcleo de IA** — reflete que é o hub de IA inteiro; mas é só trocar a string em `src/layout/sidebar.js` se preferir "Git Nexus".)
- [ ] **Grupo**: manter o cabeçalho de grupo "IA & Jarvis" com 1 item, ou remover o cabeçalho e deixar a entrada solta? (recomendo manter o cabeçalho por consistência visual com os outros grupos.)

## Refinamentos que faltam (próximas etapas, incremental)
- [ ] **Cross-links internos** que ainda apontam pras rotas antigas, garantir que abram a aba certa do cockpit:
  - Home → "Acesso rápido" (tiles `/jarvis`, `/aprendizado`, `/git-nexus`) e o rodapé do Git Nexus ("as 4 ferramentas": `/memoria`, `/cerebro`, `/aprendizado`, `/codigo`).
  - Como as rotas legadas já redirecionam pro cockpit (#257), os links funcionam; só vale revisar pra deep-linkar na aba (`?tab=`) em vez de cair no grafo.
- [ ] **Ícone** da entrada única (hoje 🔗) — confirmar.
- [ ] **Estado/UX do cockpit** (Etapa 3): lembrar a última aba aberta; refinar os headers aninhados (cada ferramenta traz o próprio `page-header`); sincronizar a aba ativa com a URL (`?tab=`) ao trocar de aba.
- [ ] **Sidebar colapsada** (modo ícone): garantir que a entrada única fica boa no estado recolhido.

## Arquivos
- `src/layout/sidebar.js` — `NAV_GROUPS`, grupo "IA & Jarvis".
- `src/pages/git-nexus-cockpit.js` — o cockpit (abas).
- `src/pages/git-nexus-gate.js` — gate web(teaser)/app(cockpit).
- `src/main.js` — `lazyNexus(tab)` + registro das rotas legadas.

## Refs
#231 (JARVIS↔Git Nexus) · #238 (app completo / site leve) · #256 (cockpit) · #257 (navegação unificada).

🤖 Gerado com [Claude Code](https://claude.com/claude-code)
