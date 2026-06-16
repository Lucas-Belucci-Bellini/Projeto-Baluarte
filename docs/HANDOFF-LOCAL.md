# 🤝 Handoff — trabalho pra uma sessão LOCAL (com skills)

> **Por que este doc existe.** Parte do desenvolvimento do Baluarte roda numa
> sessão **remota** (container na nuvem). Algumas capacidades vivem **só na
> máquina do operador** e não chegam ao remoto:
>
> - **Skills de design/animação** — plugin `freshtechbro/claudedesignskills`
>   (Three.js, GSAP ScrollTrigger, Anime.js, Vanta, Lottie, R3F, Barba.js…),
>   adicionado via `/plugin marketplace add` no Claude Code local.
> - **Motor real do GitNexus** — pacote npm `gitnexus` (tree-sitter/LadybugDB
>   nativos) + as skills/MCP do gitnexus; roda local na porta **4747**.
> - **Build/teste do app desktop** — Electron, módulos nativos, instaladores por SO.
>
> Então a divisão de trabalho (ideia do operador) é: **a sessão remota faz o web
> verificável + prepara; uma sessão LOCAL pega este doc e executa o que depende
> das skills/da máquina.**

## Como usar (sessão local)

1. Abra este repo no **Claude Code local** (onde as skills estão instaladas).
2. Leia este doc + as issues guarda-chuva: **#238** (app completo / site leve),
   **#222** (app desktop M0→M6), **#231** (JARVIS ↔ Git Nexus skills),
   **#195** (redesign 3D/imersivo), **#232** (runtimes próprios / M4).
3. Execute as tarefas abaixo invocando as skills (`/<skill>`) onde indicado.

---

## A. Design & animação — skills do `claudedesignskills`

> **Regra do mega-plano (#238):** **web = leve.** No site, use só técnicas leves
> (GSAP ScrollTrigger, Anime.js sutil, Lottie pequeno). **3D pesado** (Three.js,
> Vanta, R3F) entra **só no app**, atrás de `window.baluarte.native`.

- [ ] **Refinar o scroll-reveal** (`src/utils/scroll-reveal.js` já existe, na mão):
      usar a skill **GSAP ScrollTrigger** pra parallax sutil e reveals encadeados —
      sem trocar por lib pesada no web.
- [ ] **Home — hero 3D do app**: skill **Three.js** pra uma cena mais rica **só no
      app** (`window.baluarte.native`); na web continua o WebGL leve atual.
- [ ] **Microinterações**: **Anime.js** / **Lottie** em ícones, CTAs e badges
      (leves) nas páginas já redesenhadas (/perfil, /sobre, Seção Militar).
- [ ] **Transições de página**: avaliar **Barba.js** — provavelmente **app-only**
      (pesa). Medir antes.
- [ ] Continuar as **ondas do redesign #195** com as skills: Onda 2 (Geo/Tático:
      radar, mapa, geopulse, triangulação, visão — usar as skills de canvas/HUD),
      Onda 3 (Elites, Dossiê, Arsenal, Enciclopédia).

## B. App / Git Nexus real — M3c & M4 (precisa da máquina)

> O launcher **já é um "cliente bridge"** do gitnexus (M3a/M3b: detecta a 4747,
> consome o grafo via a ponte IPC). Falta o lado nativo. Refs no README do
> upstream: `gitnexus serve` sobe um servidor HTTP na 4747 que a UI auto-detecta.

- [ ] **M3c — o app sobe o motor sozinho.** Hoje `desktop/src/nexus.js` tem
      `maybeStart()` opt-in via env `BALUARTE_NEXUS_CMD`. Fazer o app rodar
      `gitnexus serve` por padrão. Opções:
      - `npm i -g gitnexus` (+ `GITNEXUS_SKIP_OPTIONAL_GRAMMARS=1` p/ install rápido) e spawnar o bin;
      - `npx -y gitnexus@latest serve` (cold-start mais lento);
      - imagem Docker oficial `ghcr.io/abhigyanpatwari/gitnexus` (porta 4747).
      - **Aceite:** no launcher, `/git-nexus` fica **verde** + grafo real (o
        operador já provou isso rodando `gitnexus serve` manual).
- [ ] **M4 — runtimes próprios** (RFC #232): provisionar Node 22 + Python 3.11
      numa pasta do app (preflight), pra zero-setup; nunca tocar no sistema.
- [ ] **gitnexus no próprio Claude Code local**: `npx gitnexus analyze` no repo
      + `npx gitnexus setup` → dá ao agente os 16 tools MCP de grafo (context,
      impact, rename…) pra trabalhar com consciência arquitetural.
- [ ] **Publicar releases**: subir a versão em `desktop/package.json` →
      Actions → **Desktop Release** → Run workflow → instaladores Win/Mac/Linux.

## C. Mega-plano #238 — app completo / site leve (qualquer sessão)

- [ ] **Fase 1 — medir** o bundle web (rollup-visualizer): achar os chunks
      pesados (git-nexus ~441 KB, arsenal-expandido ~420 KB, jarvis-brain, ML).
- [ ] **Fase 2 — gate + code-split**: pôr as features pesadas (IA, Git Nexus)
      atrás de `window.baluarte.native`; no web puro vira teaser "baixe o app" e
      o chunk pesado **não é baixado**. Piloto sugerido: Git Nexus.

---

## O que a sessão REMOTA já deixou pronto (não refazer)

- **App desktop** M0→M3b: launcher carrega a produção, auto-update, casca
  (splash/tray/deep-link), ponte IPC allowlisted, detecção do motor (M3a) e
  consumo do grafo real (M3b). **Release v0.1.0 publicada.**
- **Página `/baixar`** (detecta SO, baixa o instalador certo).
- **JARVIS ↔ Git Nexus**: 5 skills (`nexus_impact/context/path/deps/rename`).
- **Redesign #195**: /perfil (Dossiê do Operador), /sobre (timeline), e as **12
  páginas da Seção Militar** (via `militar.css`).
- **Scroll-reveal global** (`src/utils/scroll-reveal.js`) — base pra GSAP refinar.
- **Logo** trocado pelo selo vermelho (favicon, boot, sidebar, header, ícone do app).
- RFCs/issues: #222, #231, #232, #238.

## Arquivos-chave

| Arquivo | O quê |
|---|---|
| `desktop/src/nexus.js` | detecção + spawn opt-in do motor (M3c parte daqui) |
| `desktop/src/ipc.js` | ponte allowlisted (handlers `nexus:*`) |
| `src/utils/jarvis-nexus-tools.js` | skills do Nexus no JARVIS |
| `src/utils/scroll-reveal.js` | base do scroll-reveal (GSAP refina) |
| `GitNexus-1.6.7/` | cópia vendorizada do motor (excluída do Vercel) |
