# 🗺️ Plano Mestre — Baluarte (handoff entre conversas)

> **Pra que serve:** ponte entre conversas do agente. Cada chat começa do zero —
> o que precisa sobreviver mora **no repo** e **nas issues**. Este doc registra
> **onde paramos** e os **planos** das frentes grandes (organização, otimização,
> multi-repo, design/IA). Próximo chat: leia isto + `CLAUDE.md` + issues **#240**
> (roadmap) e **#248** (manual).
>
> _Atualizado em 2026-06-27._

---

## 1. Onde paramos

### Omega Prism — Fatia 1 (Núcleo de IA leve, por usuário)
- ✅ **#297** — Memória do JARVIS na conta (Supabase, por usuário, RLS) → **no `main`**.
- ✅ **#298** — `/memoria` e `/cerebro` acessíveis na web → **no `main`**.
- 🟠 **#299** — **Segundo Cérebro: notas por usuário** (compositor + nós no grafo +
  sync na conta). **Aberto e bloqueado** por **1 alerta CodeQL "high"** que não
  consigo localizar por aqui (a API de code-scanning é gated; o MCP não expõe a
  anotação). Já corrigi 3 suspeitos (tooltip `innerHTML`→DOM; byte NUL no `keyOf`;
  validação UUID p/ request-forgery) e **continua acusando**. **Destrava com a
  anotação exata** (regra + arquivo:linha) da aba _Files changed_ / _Security →
  Code scanning_ da PR. Sem isso, não dá pra fechar com confiança.

### Vendors (referência p/ JARVIS — NÃO vão pro deploy; `vendor/` no `.vercelignore`)
- **#294** (`claude/vendor-omega-prism`) — 5 repos de arquitetura (obsidian-second-brain,
  supermemory, anything-llm, nousresearch-obsidian, quant-mind) **+ Lote 2**:
  `turbovec` (busca vetorial, Rust/Py), `react-bits` (efeitos UI, React/TS),
  `agenthatch` (compilador de agentes, Py). **NÃO-MERGEAR** (referência viva).
- **#301** (`vendor/cl4r1t4s-readonly`) — `CL4R1T4S` (system-prompts) **isolado**
  por ser **AGPL-3.0** + conteúdo adversarial. **Só leitura, fora do JARVIS. NÃO-MERGEAR.**
- **#300** (`claude/codeql-ignore-vendor`) — exclui `vendor/` do CodeQL no `main`.
  **ESTE deve ser mergeado** (limpa o ruído de alertas de terceiros nos PRs).

> ⚠️ Import de repo externo: **`git clone` é bloqueado** no ambiente remoto (proxy
> só serve os repos do dono). Use **tarball via `curl`**:
> `curl -fsSL https://github.com/<owner>/<repo>/archive/refs/heads/<branch>.tar.gz | tar -xz`.

---

## 2. A visão — "de 1.000 pra 250.000"

Subir o **nível** do site **e** do app: design de ponta, Núcleo de IA unificado
(Omega Prism/JARVIS), repositório organizado e os ~22 repos puxando pro **hub**
(`Projeto-Baluarte`). Abaixo, cada frente com **primeiro passo concreto**.

---

## 3. Frentes de trabalho

### A. 🧹 Organizar o repositório (a raiz está "feia/espalhada")
Hoje a raiz tem **27 itens**, vários soltos que não deviam estar lá:
- Fontes narrativas: `Crônicas da Baluarte_*.md` + `.pdf` (8), `Equipes ALFA…*.md/.pdf` (2), `Projeto Baluarte.canvas`.
- Avulsos: `image.png`, `readme.txt`, `start.bat`.

**Estrutura-alvo** (raiz só com o essencial de build/config):
```
/  → index.html, package*.json, vite.config.js, vercel.json, render.yaml,
     requirements.txt, README.md, CLAUDE.md, CONTRIBUTING.md, .gitignore, .vercelignore
/src /public /desktop /docs /vendor        (já existem)
/arquivo/cronicas   ← mover Crônicas*.md/.pdf
/arquivo/equipes    ← mover Equipes ALFA…
/arquivo/canvas     ← Projeto Baluarte.canvas
/arquivo/misc       ← image.png, readme.txt, start.bat
```
**Cuidado:** se mover **código** (não é o caso desta 1ª leva), corrigir imports e
rodar build. **Primeiro passo:** mover só **arquivo morto** (docs-fonte, sem
imports) → atualizar `.vercelignore`/`src/data` se algo referencia → CI verde →
backup branch antes de qualquer merge. Fazer em PRs pequenos por categoria.

### B. ⚡ Otimizar o site (web = leve, #238)
- **Bundles maiores** (do build): `arsenal-expandido` ~420 KB e `codemap-symbols`
  ~425 KB → **code-split / lazy-load** por rota (já há `import()` dinâmico no router).
- Imagens em **WebP/AVIF** (entra o nano-banana, ver E), `loading="lazy"`, `preload`
  só do crítico. Rodar **Lighthouse** no preview e atacar LCP/TBT.
- **Primeiro passo:** medir (Lighthouse no preview da Vercel) + listar os 5 maiores
  chunks e quais rotas os puxam.

### C. 🖥️ App desktop (#222) — "completo" atrás de `window.baluarte.native`
O pesado (LLM, vetores, agentes) **não roda no site estático**. Plano: Electron
expõe uma **ponte** (`window.baluarte.native`) e o web chama as libs nativas:
- `turbovec` (vetores/RAG) e `agenthatch` (agentes) rodam no processo Node/Python do app.
- **Primeiro passo:** definir o contrato da ponte (IPC) `web ⇄ native` p/ "memória
  semântica" e "rodar agente", começando por um stub que só ecoa.

### D. 🕸️ Multi-repo — `Projeto-Baluarte` como HUB
~22 repos do dono. Clusters e o que aproveitar:
| Cluster | Repos | Pro hub |
|---|---|---|
| **Núcleo Baluarte** | Projeto-Baluarte (hub), -DevFlow, -World-Game, -Social-Media, -AI-Contador, baluarte-obra-segura, BALUARTE-FORGE-CONSTRUCTION, LLBR-Innovations-Constructions | módulos/seções do site + app |
| **Portfólio** | Baluarte-Portfolio, Portifolio-Baluarte-…, Lucas-Belucci-Bellini (perfil) | consolidar num só portfólio |
| **IA / 2º cérebro** | AI-second-brain-with-Claude-and-Obsidian | alimenta o Segundo Cérebro/JARVIS |
| **Bots/dados** | stock-analyzer-bot, Cookie-Clicker-Bot | ferramentas (financeiro → AI-Contador) |
| **Jogos** | Recycle-game, Projeto-Baluarte-World-Game, Catacombs-of-Paris-… | seção "jogos" |
| **Estudo/sim** | CHIPS-Digital-Logic-Sim, JAVA-todos-os-codigos | conteúdo técnico |
| **Outros/codinome** | UMBRA-LIMA-ALFA, LOCAL-DE-TRABALHO | avaliar |
| **Testes (ignorar)** | Teste-aula-git, file-D-teste-1-… | descartar/arquivar |

**Primeiro passo:** abrir cada repo relevante (via `mcp__claude-code-remote__list_repos`
+ `add_repo`, e/ou tarball) e preencher "o que extrair" por repo. Trazer código via
**vendor/tarball** ou **portar** (clone externo é bloqueado).

### E. 🎨 cc-nano-banana (geração/edição de imagem) — sobe o nível visual
Skill do Claude Code ([kkoppenhaver/cc-nano-banana](https://github.com/kkoppenhaver/cc-nano-banana))
que liga o **Nano Banana** (Google, geração/edição de imagem) ao agente: comandos
`/generate`, `/edit`, `/diagram`.
- **Requisitos:** Gemini CLI instalado + **chave do Google AI Studio** + instalar a
  skill no diretório de skills do Claude (tarefa de **sessão local/com a skill** —
  ver `docs/HANDOFF-LOCAL.md`).
- **Uso no Baluarte:** arte dos heros, capas das Crônicas, ícones, materiais —
  combustível do **redesign #195/#246** e do salto visual.
- **Primeiro passo (próximo chat, se a skill estiver instalada):** configurar a key,
  testar `/generate` num hero, e padronizar saída em WebP/AVIF (liga com a frente B).

### F. 🔌 Integrações MCP novas (disponíveis no próximo chat)
Mapeamento rápido pro Baluarte (algumas conectam/desconectam):
- **Design:** Figma, Canva, Gamma, Miro/Whimsical (diagramas), Three.js Viewer (3D).
- **Backend/dados:** Supabase (já usado p/ memória/notas), Cloudflare (D1/KV/R2/Workers).
- **Deploy:** Vercel.
- **Conteúdo/ops:** Notion, Google Drive/Calendar/Gmail, Zoom, Spotify.
- **Protótipo/app builders:** Lovable, Base44, Manufact.
- **Outros:** HyperFrames (vídeo), SlidesGPT, Wix, Legal Data Hunter.
- **Primeiro passo:** escolher 2–3 que dão alavanca imediata (provável: **Figma** p/
  design-system do #195, **Supabase** p/ expandir a memória, **Cloudflare** p/ mover
  o pesado pra edge no lugar das Lambdas).

### G. 📚 Issues → documentação
Converter as issues guarda-chuva em docs versionados (sobrevivem melhor que issues):
- Candidatas: **#192** (CodeQL), **#195/#246** (redesign/design-system), **#210**
  (.vercelignore/bundle), **#222** (app), **#231** (JARVIS↔Git Nexus), **#238**
  (mega-plano), **#240** (roadmap), **#248** (manual).
- **Formato sugerido:** `docs/issues/NNN-titulo.md` (ou consolidado em `docs/`), com
  resumo + estado + decisões. **Não fechar** #240/#248/#238/#231/#222/#195 (referência viva).
- **Primeiro passo:** listar issues abertas (`mcp__github__list_issues`) e gerar um
  `docs/issues/` com uma página por issue (começar pelas guarda-chuva).

---

## 4. Pendências bloqueadas (precisam de algo externo)
- **#299** — precisa da **anotação CodeQL** (regra + arquivo:linha) do operador.
- **nano-banana (E)** — precisa de **chave Google AI Studio** + skill instalada (local).

---

## 5. Ordem sugerida pro próximo chat
1. **Mergear #300** (destrava o ruído CodeQL dos vendors).
2. **Fechar #299** assim que vier a anotação.
3. **G — Issues → docs** (barato, dá base de continuidade).
4. **A — Organizar a raiz** (começar pelo arquivo morto).
5. **E + F — design/IA** (nano-banana + Figma) → começar o salto visual (#195).
6. **B + C + D** — otimização, app e multi-repo, em paralelo conforme prioridade.

---

## 6. Branches/PRs abertos desta leva
- `claude/codeql-ignore-vendor` → **#300** (mergear).
- `claude/vendor-omega-prism` → **#294** (referência, não-mergear).
- `vendor/cl4r1t4s-readonly` → **#301** (referência isolada, não-mergear).
- `claude/omega-fatia1-cerebro-notas` → **#299** (bloqueado no CodeQL).
- `claude/plano-mestre` → este doc.
