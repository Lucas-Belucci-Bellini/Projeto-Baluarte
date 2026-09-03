# #222 — App desktop do Baluarte (Electron) — launcher com web + auto-update p/ rodar as versões pesadas

> **Status:** open · **Criada:** 2026-06-14 · **Atualizada:** 2026-06-15 · **Comentários:** 3
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/222
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

## Contexto

Hoje o site roda como estático no Vercel. Isso nos obrigou a **reimplementar o GitNexus na mão** (regex no build, `codemap.json` como snapshot), porque o motor real dele é **Node nativo** — `GitNexus-1.6.7/` já está no repo (TypeScript, tree-sitter, LadybugDB/`lbug`, scope-resolution) e está **excluído do Vercel** (`.vercelignore`), já que hosting estático não tem disco, processo em background, módulos nativos, nem espaço pro Lambda (limite de 245MB / timeout serverless).

Um **app desktop derruba essa parede**: o processo principal já É Node, então roda o motor de verdade, com acesso a disco e sem limite de Lambda. Pensando como **launcher** (estilo Steam/Epic/RSI): abre o hub, se atualiza sozinho e roda as versões pesadas localmente. **A web vira o hub leve; o app vira a plataforma pesada.** O site na web continua existindo — o desktop é **aditivo**.

> Decisão já batida com o operador: **stack = Electron** (reaproveita o frontend Vite inteiro e roda o motor Node direto; Tauri exigiria empacotar um Node sidecar justo na parte pesada). Modo = **planejar antes de codar** — esta issue é o RFC pra alinhar os detalhes.

---

## Visão (o que o app é)

Um **launcher/hub nativo do Baluarte** que:
1. **Conecta com a web** — abre a mesma UI Vite carregando a produção (`projeto-baluarte.vercel.app`), com fallback offline pro `dist` embutido. O deploy web já é o canal de atualização instantâneo da interface.
2. **Se atualiza sozinho** — a casca nativa + motor se atualizam via `electron-updater` a partir das GitHub Releases.
3. **Roda o pesado local** — GitNexus real, JARVIS com modelos maiores, jogos/3D/WebGPU sem as travas da aba.

---

## Arquitetura

```
┌─────────────────────────── Electron App ───────────────────────────┐
│  Main process (Node)                                                │
│   ├─ janela + tray + deep-link baluarte://                          │
│   ├─ electron-updater  ── checa GitHub Releases ── instala no restart│
│   └─ Motor GitNexus (GitNexus-1.6.7)  ── porta 4747 local / IPC      │
│        tree-sitter · LadybugDB · scope-resolution · embeddings       │
│                                                                      │
│  Preload (contextBridge, allowlist)  ←—— ponte segura ——→            │
│                                                                      │
│  Renderer (a MESMA UI Vite)                                         │
│   ├─ carrega https://projeto-baluarte.vercel.app (remoto)            │
│   └─ fallback: dist embutido (offline)                              │
└─────────────────────────────────────────────────────────────────────┘
```

**Dois canais de atualização (importante):**
| Canal | O que atualiza | Como | Velocidade |
|---|---|---|---|
| Web | UI / conteúdo / páginas | renderer carrega a produção | instantâneo (já temos) |
| Nativo | casca + motor + módulos nativos | `electron-updater` → GitHub Releases | no próximo restart |

**Degradação graciosa:** a página `/git-nexus` detecta se há motor local na 4747 → usa o **grafo real**; senão, cai no `codemap.json` de build. Ou seja, o mesmo código serve web (snapshot) e desktop (motor real) sem fork.

---

## O que destrava (as "versões mais pesadas")

- **GitNexus de verdade:** tree-sitter parseando o código real (não regex), embeddings/ML local, grafo no LadybugDB. O orbe 3D passa a desenhar o grafo **semântico real**.
- **Filesystem:** aponta pra qualquer repo local, indexa e **observa mudanças** (re-indexa sozinho). O codemap deixa de ser snapshot congelado.
- **JARVIS local pesado:** `onnxruntime`/`llama.cpp` no main, modelos maiores, sem timeout serverless nem 245MB de Lambda.
- **Jogos / 3D / WebGPU** sem as travas de aba, com assets grandes locais.

---

## Modelo de segurança (não negociável)

Como o renderer carrega **UI remota** e o main tem **poder nativo** (FS, spawn), a ponte precisa ser fechada:
- `contextIsolation: true`, `nodeIntegration: false`, `sandbox` onde der.
- `contextBridge` expõe só uma **API mínima e allowlisted** (`baluarte.invoke('nexus.context', …)`), nunca `require`/FS cru.
- **Allowlist de origem:** só a produção oficial + `localhost` podem usar a ponte nativa. CSP restrita; bloquear navegação pra fora dos domínios confiáveis.
- Toda chamada nativa validada no main (sem path traversal, sem comando arbitrário).

---

## Atritos honestos (pra não vender ilusão)

- **Assinatura de código** é o custo real, não o código: Windows (SmartScreen) e Mac (notarização Apple). Sem assinar, o usuário vê "app não confiável". Dá pra começar **sem assinar** (uso pessoal) e assinar depois.
- **Módulos nativos** (tree-sitter, onnxruntime) precisam ser recompilados pro ABI do Electron (`electron-rebuild`).
- Passa a **shippar binário pra 3 SOs** (matriz de CI maior).

---

## Roadmap (marcos incrementais)

- [ ] **M0 — Loop de update provado (o coração).** `desktop/` com Electron mínimo que carrega a produção (fallback embutido) + `electron-builder` (NSIS/dmg/AppImage) + `electron-updater` (provider GitHub) + workflow que builda nos 3 SOs em tag `desktop-v*` e publica na Release. **Aceite:** instalo `v0.1.0`, subo `v0.1.1` numa tag, o app baixa e atualiza sozinho no restart.
- [ ] **M1 — Casca de launcher.** Janela estilo launcher (frame custom + splash), system tray, menu, deep-link `baluarte://`, indicador online/offline (modo web vs nativo).
- [ ] **M2 — Ponte segura (IPC).** `contextBridge` com API allowlisted + política de segurança (isolamento, CSP, allowlist de origem).
- [ ] **M3 — Motor real do GitNexus no main.** Trazer `GitNexus-1.6.7/` pro processo principal, `electron-rebuild` dos nativos, subir a 4747. `/git-nexus` usa o grafo real e cai no codemap se não houver motor. **Aceite:** orbe 3D desenha o grafo parseado por tree-sitter.
- [ ] **M4 — Filesystem / indexação viva.** Seletor de repo local + file watcher + re-indexação incremental.
- [ ] **M5 — JARVIS / ML pesado local.** `onnxruntime`/`llama.cpp` no main.
- [ ] **M6 — Assinatura e distribuição pública.** Code signing Windows + notarização Apple (quando distribuir além de uso pessoal).

---

## Decisões em aberto (pra alinhar antes do M0)

1. **Onde mora o app?** Pasta `desktop/` no repo atual (**recomendo** — monorepo, compartilha o frontend Vite sem submódulo; exige excluir `desktop/` do `.vercelignore`) **vs** repo novo `projeto-baluarte-desktop`.
2. **Carregamento default:** produção remota com fallback embutido (**recomendo**) **vs** `dist` sempre embutido.
3. **Nome/identidade do app:** "Baluarte Launcher"? "Baluarte Forge" (já existe o repo `baluarte-forge-construction`)? outro?
4. **Assinar já ou depois?** Começar sem assinar (uso pessoal, aceita o aviso) e assinar no M6, ou já configurar certificados.

---

Relacionado a #195 (redesign 3D/imersivo) — esta issue é o caminho pra levar o GitNexus real e o JARVIS pesado pra dentro de uma experiência nativa.

https://claude.ai/code/session_01S1j1HX2j1zEJoPxTuek3yM
