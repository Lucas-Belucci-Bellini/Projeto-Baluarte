# #248 — 📒 Manual de operação & continuidade do Baluarte — comece por aqui (NÃO FECHAR)

> **Status:** open · **Criada:** 2026-06-18 · **Atualizada:** 2026-06-18 · **Comentários:** 0
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/248
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

> ## ⚠️ NÃO FECHAR esta issue
> Ela é **referência viva**: explica *como* o Baluarte é desenvolvido, *as regras*
> e *como continuar* — pra qualquer sessão que **não tenha o histórico desta
> conversa** nem as skills/máquina do operador. Fechar = perder o mapa.
>
> **Como começar uma nova conversa:** *"continue o Baluarte — leia a issue desta
> (Manual) + a #240 (roadmap), pegue o próximo item da fila certa e siga o fluxo
> padrão."*

---

## 1. Por que este manual existe

O desenvolvimento do Baluarte acontece em **dois tipos de sessão**, e elas **não
compartilham contexto automaticamente**:

- **🟢 Sessão REMOTA** (container na nuvem, ex.: Claude Code na web/app). Vê **só**
  este repositório clonado na hora. **Não** herda o histórico de conversas
  anteriores, **não** tem a máquina do operador e **não** tem as skills locais.
- **🖥 Sessão LOCAL** (Claude Code na máquina do operador). Tem as **~500 skills**
  instaladas pelo operador (design/3D, gitnexus, etc.), pode **rodar o app
  desktop (Electron)** e o **motor real do GitNexus** (porta 4747).

Como cada conversa começa "do zero" de contexto, **tudo que precisa sobreviver
entre sessões mora no repositório e nas issues** — não na memória do agente.
Os três pilares de continuidade são:

| Onde | O quê |
|---|---|
| **`CLAUDE.md`** (raiz) | contexto curto que **toda** sessão lê automaticamente |
| **`docs/HANDOFF-LOCAL.md`** | tarefas que dependem das skills/máquina → preparadas pelo remoto, executadas pelo local |
| **Issues #240 + esta** | roadmap (fila de continuação) + manual (regras/como trabalhar) |

---

## 2. Como eu trabalho (fluxo padrão, por feature)

1. **Branch própria** por feature (ex.: `claude/git-nexus-m3d-tools`). Nunca commitar direto no `main`.
2. **Commit** com mensagem descritiva (`feat(#NNN): …`, em pt-BR, no estilo do `historico/CHANGELOG.md`).
3. **PR como _draft_** → descrição diz o que mudou, o que foi verificado no remoto e o que falta validar local.
4. **CI verde** antes de mergear (CodeQL "Analisar js/python" + preview do Vercel). Backup branch (`backup/AAAA-MM-DD-…`) **antes** do merge.
5. **Merge** → **atualizar `historico/CHANGELOG.md`** (o changelog registra só o que **entra no `main`**; PR que fica draft ainda **não** entra no changelog).
6. **Verificar UI no navegador** quando mudo algo visual — skill `run-projeto-baluarte` (sobe Vite + Playwright; `smoke`, `shot `, `eval  `).

> Decisões que são do operador (escopo, política de merge, em qual branch
> empurrar) eu **pergunto** antes de agir, em vez de assumir.

---

## 3. Regras técnicas do projeto

- **JS puro (ES2022)**, **sem TypeScript** e **sem framework**. Vite 5 só empacota. Deploy estático no **Vercel**.
- **Roteamento por hash** (`#/editor`, `#/git-nexus`…), uma página por rota em `src/pages/`.
- **Mega-plano #238 — web leve / app pesado:** o site é vitrine **leve** (conteúdo + ferramentas leves); o **app desktop** é o **completo** (IA, Git Nexus, motor real, 3D pesado). Tudo que pesa fica **atrás de `window.baluarte.native`** → no navegador vira teaser "baixe o app" (`/baixar`) e o chunk pesado idealmente nem é baixado.
- **Ponte nativa segura:** o renderer **nunca** fala direto com o motor (4747); passa pela **ponte IPC allowlisted** do Electron (`desktop/src/ipc.js` → `desktop/src/nexus.js`).

---

## 4. Divisão REMOTO × LOCAL (o que cada sessão pode fazer)

**🟢 Remota faz (verificável na nuvem):** páginas web, lógica JS pura, redesign
leve, builds (`npm run build`), screenshots de rota, **código** da ponte/desktop
(verificado por `node --check` + build), preparação de handoffs.

**🖥 Local faz (precisa da máquina/skills):** rodar o app Electron, subir/validar
o **motor real** do GitNexus, design **3D pesado** (Three.js/Vanta/R3F via
skills), empacotar instaladores, e o **aceite** das features nativas que o remoto
só deixou "code-ready".

> Regra de ouro: **a sessão remota faz o web verificável + prepara; a sessão
> local pega o `HANDOFF-LOCAL.md` e executa o que depende das skills/da máquina.**

---

## 5. As skills do operador (~500 locais) — o que isso significa

O operador instalou **~500 skills** no Claude Code **local** (ex.: o marketplace
`freshtechbro/claudedesignskills` — Three.js, GSAP ScrollTrigger, Anime.js,
Vanta, Lottie, R3F, Barba.js… — mais o `gitnexus` e muitas outras). **Sessões
remotas não herdam essas skills.**

O que cada sessão deve fazer:

- **Descobrir as suas próprias skills** — elas aparecem nos *system reminders* e no
  menu `/`. Use as que servem; não invente nomes.
- **Não bloquear** por falta de skill: se a tarefa precisa de uma skill que só
  existe local, **registre em `docs/HANDOFF-LOCAL.md`** (seção A/B) e siga com o
  que dá pra fazer no remoto.
- **Skills que ESTA sessão remota enxerga** (úteis aqui): `run-projeto-baluarte`
  (rodar/screenshot/smoke do site), `verify`, `code-review`, `simplify`,
  `security-review`, `deep-research`, `update-config`. Há ainda MCPs conectados
  (GitHub, Vercel, Figma, Notion, Google, etc.).

- [ ] **(tarefa pra uma sessão LOCAL)** catalogar nesta issue as skills locais
  **relevantes ao Baluarte** (nome + pra que serve), já que só o local as enxerga.
  Assim o remoto sabe exatamente o que delegar no handoff.

---

## 6. Mapa do repositório

- `src/pages/` — uma página por rota · `src/styles/` — 1 CSS por página + tokens em `variables.css`.
- `src/core/` — router (hash), eventos, estado, storage · `src/layout/` — shell, sidebar, header.
- `src/utils/` — helpers, `jarvis-engine`/`jarvis-tools`, `git-nexus-engine`, `git-nexus-client` (ponte do motor real), `scroll-reveal`…
- `desktop/` — app Electron (`main`, `preload`, `nexus`, `ipc`) + workflow de release.
- `historico/CHANGELOG.md` — registro do que entra no `main`.
- `GitNexus-1.6.7/` — cópia vendorizada do motor (excluída do deploy Vercel).

---

## 7. Estado atual (jun/2026) — fotografia

**✅ Entregue (não refazer):** Home (herói 3D WebGL sem dep) · Git Nexus (orbe 3D
+ Console + grafo real do motor, M3b) · App desktop **Baluarte Launcher** M0→M3b
(auto-update, casca, ponte IPC, release v0.1.x) · `/baixar` · JARVIS↔Nexus (5
skills) · Redesign #195 (perfil/sobre + 12 págs militares + **Ondas 2 e 3** +
**páginas leves**) · scroll-reveal global · logo selo vermelho.

**🛠 Em voo (jun/2026):** **M3d — tools do motor real no app.**
- **Fatia REST** (`query`/`cypher`/`fluxos`/`clusters`) → **PR #247 (draft)**,
  branch `claude/git-nexus-m3d-tools`. Verificado no remoto (node --check, build
  web, fallback web/teaser no navegador). **Falta o aceite local** (motor no ar +
  repo analisado → comandos devolvem dados reais). Por isso está **draft**.
- **Próxima fatia (MCP):** tools "profundas" (`context/impact/detect_changes/
  rename` com confiança) via **MCP-over-HTTP** (`POST /api/mcp`, JSON-RPC).

**⏭ Próximos (ver #240 e `HANDOFF-LOCAL.md`):** mega-plano #238 Fase 1 (medir
bundle) e Fase 2 (gate do Git Nexus) · M3c **aceite local** · M4 runtimes (#232)
· JARVIS↔Nexus nível de função · design 3D pesado (skills locais).

---

## 8. Issues que NÃO devem ser fechadas (referências vivas)

- **esta** (Manual) · **#240** (Roadmap mestre / fila de continuação)
- **#238** (mega-plano app/site) · **#222** (app desktop M0→M6) · **#231**
  (JARVIS↔Git Nexus) · **#232** (M4 runtimes) · **#195** (redesign)

Essas são **guarda-chuva**: vão sendo atualizadas (checkboxes/comentários), não
fechadas, porque guardam o plano e o histórico de decisões.

---

## 9. Checklist pra próxima sessão (qualquer uma)

- [ ] Ler `CLAUDE.md` + esta issue + #240.
- [ ] Escolher a fila certa (🟢 remota se for web; 🖥 local se precisa de skills/máquina) e pegar o **próximo item não-marcado**.
- [ ] Seguir o **fluxo padrão** (seção 2). Verificar UI no navegador quando for visual.
- [ ] Ao terminar: marcar o item em #240, atualizar `CHANGELOG.md` (se mergeou) e/ou `HANDOFF-LOCAL.md` (se preparou algo pro local).
- [ ] **Não fechar** as issues guarda-chuva.

🤖 Gerado com [Claude Code](https://claude.com/claude-code)
