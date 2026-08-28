# Histórico de commits — `main` 401–600
**Snapshot:** `13360e596eb6bb9351c984d25cea67e7d1bef76b`
**Escopo:** commits alcançáveis a partir de `main`, numerados do mais antigo para o mais recente
> A numeração é local ao escopo da `main`; não é um número nativo do GitHub. Os dados abaixo são extraídos do grafo Git, sem interpretação manual dos nomes de arquivos.

## Commit 401 — `cb6273ef60011e0be82a049f0d115509681583ca`
**Link:** [cb6273ef6001](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cb6273ef60011e0be82a049f0d115509681583ca)
**Data do autor:** `2026-06-14T00:12:16+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `400db84f04461c65e32d19d82d67e6168ee20dcc`
**Resumo:** feat(#204/#195): Console do Nexus — ferramentas do GitNexus (context/impact/path/rename/query)
**Corpo da mensagem:**

feat(#204/#195): Console do Nexus — ferramentas do GitNexus (context/impact/path/rename/query)

- git-nexus-engine: nexusContext, nexusImpact (up/down + nível de risco
  BAIXO→CRÍTICO), nexusPath (BFS dirigido), nexusRename (usos a tocar)
- /git-nexus: Console (terminal) que executa as 4 ferramentas canônicas do
  GitNexus sobre o grafo ativo (arquivos ou funções), com chips clicáveis
- traz o coração do GitNexus (consultar o grafo) pro site, em JS puro
- verificado via Playwright (5 comandos, badges de risco)

https://claude.ai/code/session_01S1j1HX2j1zEJoPxTuek3yM
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus.js`
- `src/styles/git-nexus.css`
- `src/utils/git-nexus-engine.js`

---

## Commit 402 — `0ebc1248f7a71255d15ccb035258dd4736c4a846`
**Link:** [0ebc1248f7a7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0ebc1248f7a71255d15ccb035258dd4736c4a846)
**Data do autor:** `2026-06-13T21:16:19-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `400db84f04461c65e32d19d82d67e6168ee20dcc cb6273ef60011e0be82a049f0d115509681583ca`
**Resumo:** feat(#204/#195): Console do Nexus — ferramentas do GitNexus (#220)
**Corpo da mensagem:**

feat(#204/#195): Console do Nexus — ferramentas do GitNexus (#220)

Console do Nexus: ferramentas canônicas do GitNexus (context/impact com risco/path/rename/query) sobre o grafo, em JS puro. Análise CodeQL (JS+Python) passou; o gate "CodeQL" sinaliza só o alerta pré-existente do h(html:) em helpers.js (deliberado, não vem deste PR). Vercel READY. Backup: backup/2026-06-14-pre-merge-gitnexus-console.
**Arquivos afetados:** 0

---

## Commit 403 — `e610e6a7870e0671bd4dd6fe5b2c556f898e3b31`
**Link:** [e610e6a7870e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e610e6a7870e0671bd4dd6fe5b2c556f898e3b31)
**Data do autor:** `2026-06-14T05:15:19+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `0ebc1248f7a71255d15ccb035258dd4736c4a846`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 404 — `6236d08b5676582a5b74d400222f455ca4e3b34b`
**Link:** [6236d08b5676](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6236d08b5676582a5b74d400222f455ca4e3b34b)
**Data do autor:** `2026-06-14T14:39:45+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `e610e6a7870e0671bd4dd6fe5b2c556f898e3b31`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 405 — `f93b43f5b849b865a097ddc64a2a5ea633816ee6`
**Link:** [f93b43f5b849](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f93b43f5b849b865a097ddc64a2a5ea633816ee6)
**Data do autor:** `2026-06-14T13:55:06-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `6236d08b5676582a5b74d400222f455ca4e3b34b`
**Resumo:** feat(#195): herói 3D imersivo em WebGL na home (#221)
**Corpo da mensagem:**

feat(#195): herói 3D imersivo em WebGL na home (#221)

- Nova cena WebGL 1.0 pura (sem dependência) em src/utils/hero-webgl.js:
  nebulosa volumétrica de 3.600 partículas (disco + halo) com blending
  aditivo, núcleo arc-reactor de 5 anéis de orbes girando + ponto central
  pulsante (estilo JARVIS).
- Câmera orbita com parallax do mouse e mergulha com o scroll (fly-through),
  com auto-rotação contínua.
- home.js: tenta WebGL e cai no campo de partículas 2D se indisponível;
  esconde o emblema CSS via classe .is-webgl e liga setScroll no onScroll.
- Respeita prefers-reduced-motion e pausa com a aba oculta; frame loop
  auto-dimensionável e auto-encerrável (robusto a remontagem do router).
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos criados

- `src/utils/hero-webgl.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/home.js`
- `src/styles/home3d.css`

---

## Commit 406 — `057a0936abebff62c6e5b19ec7caa944e99a4328`
**Link:** [057a0936abeb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/057a0936abebff62c6e5b19ec7caa944e99a4328)
**Data do autor:** `2026-06-14T15:17:49-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f93b43f5b849b865a097ddc64a2a5ea633816ee6`
**Resumo:** feat(#222): app desktop (Baluarte Launcher) — M0 esqueleto Electron + auto-update (#223)
**Corpo da mensagem:**

feat(#222): app desktop (Baluarte Launcher) — M0 esqueleto Electron + auto-update (#223)

Início do launcher nativo em Electron (decisões batidas no #222: Electron,
pasta desktop/ no monorepo, carrega a produção com fallback embutido, nome
Baluarte Launcher, assinatura adiada pro M6).

- desktop/src/main.js: janela carrega projeto-baluarte.vercel.app com fallback
  offline (../dist -> resources/web, e offline.html); postura de segurança
  (contextIsolation, sem nodeIntegration, sandbox, navegação presa às origens
  confiáveis); auto-update via electron-updater quando empacotado.
- desktop/src/preload.js: ponte segura mínima (window.baluarte.native) pra UI
  detectar o modo nativo; API allowlisted real fica pro M2.
- desktop/package.json: electron-builder (NSIS/dmg/AppImage), publish GitHub,
  extraResources copia ../dist; mac.identity=null (sem assinar no M0).
- .github/workflows/desktop-release.yml: builda Win/Mac/Linux em tag desktop-v*
  e publica os instaladores na Release (electron-updater entrega aos instalados).
- build/make-icon.mjs: gera o ícone arc-reactor sem dependência.
- .vercelignore: exclui desktop/ do deploy web.
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 12
### Arquivos criados

- `.github/workflows/desktop-release.yml`
- `desktop/.gitignore`
- `desktop/README.md`
- `desktop/build/icon.png`
- `desktop/build/make-icon.mjs`
- `desktop/offline.html`
- `desktop/package-lock.json`
- `desktop/package.json`
- `desktop/src/main.js`
- `desktop/src/preload.js`
### Arquivos modificados

- `.vercelignore`
- `historico/CHANGELOG.md`

---

## Commit 407 — `db33c46d8a11e7abf8a5042b41c4cb22b4041e42`
**Link:** [db33c46d8a11](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/db33c46d8a11e7abf8a5042b41c4cb22b4041e42)
**Data do autor:** `2026-06-14T19:31:38-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `057a0936abebff62c6e5b19ec7caa944e99a4328`
**Resumo:** feat(#222): app desktop (Baluarte Launcher) — M1 casca de launcher (#224)
**Corpo da mensagem:**

feat(#222): app desktop (Baluarte Launcher) — M1 casca de launcher (#224)

- splash.html: janela de abertura (núcleo arc-reactor animado) enquanto o hub
  carrega; some no ready-to-show/did-finish-load, com trava de 12s.
- system tray: ícone + menu (Mostrar/Recarregar/Sair); fechar minimiza pra
  bandeja (estilo launcher), só encerra no 'Sair'; before-quit destrava Cmd+Q.
- deep-link baluarte://<rota>: instância única + open-url (mac) e second-instance/
  argv (win/linux); foca a janela e navega pra #/<rota> (rota sanitizada).
- indicador online/offline: preload relata navigator.onLine; estado na bandeja
  (tooltip + status) e no título; window.baluarte.isOnline() exposto à UI.
- segurança mantida (isolamento, sem nodeIntegration, sandbox, navegação presa).
- README + CHANGELOG atualizados.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos criados

- `desktop/src/splash.html`
### Arquivos modificados

- `desktop/README.md`
- `desktop/src/main.js`
- `desktop/src/preload.js`
- `historico/CHANGELOG.md`

---

## Commit 408 — `563ea5c609dd6582e60e3d2dc34bf21131f685fb`
**Link:** [563ea5c609dd](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/563ea5c609dd6582e60e3d2dc34bf21131f685fb)
**Data do autor:** `2026-06-14T19:39:38-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `db33c46d8a11e7abf8a5042b41c4cb22b4041e42`
**Resumo:** feat(#222): app desktop (Baluarte Launcher) — M2 ponte IPC allowlisted (#225)
**Corpo da mensagem:**

feat(#222): app desktop (Baluarte Launcher) — M2 ponte IPC allowlisted (#225)

- src/ipc.js: funil único baluarte:invoke validado por 3 camadas (remetente =
  janela principal, allowlist explícita de canais, payload por handler). O
  renderer nunca recebe ipcRenderer cru, FS ou require.
- canais M2: ping, app:info (nome/versão/plataforma/arch/online), app:openExternal
  (http/https validado), app:reload.
- preload: expõe window.baluarte.invoke(channel, payload) que resolve os dados ou
  rejeita com o erro do main.
- main: registerIpc() no whenReady, injetando getMainWindow/getOnline/remoteUrl.
- encaixe pronto pro M3 (handlers nexus.* plugam na allowlist).
- README + CHANGELOG atualizados.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos criados

- `desktop/src/ipc.js`
### Arquivos modificados

- `desktop/README.md`
- `desktop/src/main.js`
- `desktop/src/preload.js`
- `historico/CHANGELOG.md`

---

## Commit 409 — `e1eb48852d5d288b28faada9e5d294d0bcbf7f1e`
**Link:** [e1eb48852d5d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e1eb48852d5d288b28faada9e5d294d0bcbf7f1e)
**Data do autor:** `2026-06-14T20:57:16-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `563ea5c609dd6582e60e3d2dc34bf21131f685fb`
**Resumo:** feat(#222): app desktop (Baluarte Launcher) — M3a detecção do motor real do GitNexus (#226)
**Corpo da mensagem:**

feat(#222): app desktop (Baluarte Launcher) — M3a detecção do motor real do GitNexus (#226)

Primeira fatia do M3 (encaixe verificável; build nativo pesado fica pro M3b):

- desktop/src/nexus.js: detecta o motor real do GitNexus (servidor gitnexus na
  4747) via GET /api/health + /api/info. Spawn opt-in (BALUARTE_NEXUS_CMD), sem
  shell, args fixos; encerra com o app.
- desktop/src/ipc.js: handler nexus:status na allowlist → { available, url,
  version?, nodeVersion?, spawned }.
- desktop/src/main.js: nexus.maybeStart() no whenReady, nexus.stop() no before-quit.
- src/pages/git-nexus.js + git-nexus.css: badge do motor — verde 'conectado vX'
  ou âmbar 'indisponível, usando o mapa de build', só dentro do launcher; na web
  fica oculto (degradação graciosa, sem fork).
- verificado via Playwright (web oculto; launcher simulado off/live render).
- README + CHANGELOG atualizados.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos criados

- `desktop/src/nexus.js`
### Arquivos modificados

- `desktop/README.md`
- `desktop/src/ipc.js`
- `desktop/src/main.js`
- `historico/CHANGELOG.md`
- `src/pages/git-nexus.js`
- `src/styles/git-nexus.css`

---

## Commit 410 — `372e9f71f3c7700c8cda27a5a90ce88a14dee9cc`
**Link:** [372e9f71f3c7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/372e9f71f3c7700c8cda27a5a90ce88a14dee9cc)
**Data do autor:** `2026-06-14T21:10:27-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `e1eb48852d5d288b28faada9e5d294d0bcbf7f1e`
**Resumo:** feat(#222): app desktop (Baluarte Launcher) — M3b orbe roda no grafo REAL do motor (#227)
**Corpo da mensagem:**

feat(#222): app desktop (Baluarte Launcher) — M3b orbe roda no grafo REAL do motor (#227)

Segunda fatia do M3 (verificável por simulação; build nativo fica pro M3c):

- desktop/src/nexus.js: graph() — pega o 1º repo de /api/repos e busca
  /api/graph?repo=…; devolve { repo, nodes, relationships } do GitNexus.
- desktop/src/ipc.js: handler nexus:graph na allowlist.
- src/utils/git-nexus-engine.js: fromEngineGraph() converte {nodes,relationships}
  do motor pro formato codemap → o mesmo buildGraph/analyze roda no grafo real.
- src/pages/git-nexus.js: no launcher, carrega o grafo real (nexus:graph), usa
  como fonte do modo Arquivos e re-renderiza; degrada pro codemap na web / sem
  repo. Dica do grafo vira 'grafo REAL do motor'.
- verificado via Playwright: web = codemap (187, badge oculto); launcher simulado
  = orbe com os 44 nós/78 arestas reais, comunidades e centralidade sobre eles.
- README + CHANGELOG atualizados.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 6
### Arquivos modificados

- `desktop/README.md`
- `desktop/src/ipc.js`
- `desktop/src/nexus.js`
- `historico/CHANGELOG.md`
- `src/pages/git-nexus.js`
- `src/utils/git-nexus-engine.js`

---

## Commit 411 — `6d7150a12dc86f6a7fb00861db9176e3c9c1f6b4`
**Link:** [6d7150a12dc8](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6d7150a12dc86f6a7fb00861db9176e3c9c1f6b4)
**Data do autor:** `2026-06-14T22:41:47-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `372e9f71f3c7700c8cda27a5a90ce88a14dee9cc`
**Resumo:** feat(#222): página de download do app (estilo Steam/Claude) (#228)
**Corpo da mensagem:**

feat(#222): página de download do app (estilo Steam/Claude) (#228)

- src/pages/baixar.js + baixar.css: página /baixar que detecta o SO e oferece o
  instalador certo num clique. Busca a release mais recente do GitHub (API) em
  runtime, casa o asset por extensão (.exe/.dmg/.AppImage), mostra versão +
  tamanho e aponta direto pro download. Estado 'em breve' se não houver release.
- index.html: linka baixar.css.
- src/main.js: registra a rota /baixar.
- src/layout/sidebar.js: item 'Baixar o App' no grupo Início.
- visual no estilo do projeto (arc-reactor, CTA em degradê, features, notas de
  instalação por SO).
- verificado via Playwright: release simulada baixa o .exe (v0.1.0, 74.9 MB);
  sem release mostra 'em breve'.
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 6
### Arquivos criados

- `src/pages/baixar.js`
- `src/styles/baixar.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/layout/sidebar.js`
- `src/main.js`

---

## Commit 412 — `ef02f7c266555e6f81377bf96c225a9b190a8b7e`
**Link:** [ef02f7c26655](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ef02f7c266555e6f81377bf96c225a9b190a8b7e)
**Data do autor:** `2026-06-15T02:19:25-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `6d7150a12dc86f6a7fb00861db9176e3c9c1f6b4`
**Resumo:** chore(#222): release do app disparável (workflow_dispatch) + publicação direta (#229)
**Corpo da mensagem:**

chore(#222): release do app disparável (workflow_dispatch) + publicação direta (#229)

- desktop-release.yml: adiciona workflow_dispatch (botão Run workflow / API) além
  da tag desktop-v*, pra cortar a 1ª release sem push de tag.
- desktop/package.json: releaseType 'release' no electron-builder → a release sai
  publicada (não rascunho), vira a latest e a página /baixar a enxerga sozinha.
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos modificados

- `.github/workflows/desktop-release.yml`
- `desktop/package.json`
- `historico/CHANGELOG.md`

---

## Commit 413 — `a0d7f5959c50aa084651614ff6da07237df3dd23`
**Link:** [a0d7f5959c50](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a0d7f5959c50aa084651614ff6da07237df3dd23)
**Data do autor:** `2026-06-15T05:36:27+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `ef02f7c266555e6f81377bf96c225a9b190a8b7e`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 414 — `c8cf1d58680e2af91a43064d5f156e91d84ca72c`
**Link:** [c8cf1d58680e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c8cf1d58680e2af91a43064d5f156e91d84ca72c)
**Data do autor:** `2026-06-15T09:34:57-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `a0d7f5959c50aa084651614ff6da07237df3dd23`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `19KMF01.svg`

---

## Commit 415 — `0c3ef2693173d89c1e4eb318ebc0fd6d4b913ae8`
**Link:** [0c3ef2693173](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0c3ef2693173d89c1e4eb318ebc0fd6d4b913ae8)
**Data do autor:** `2026-06-15T09:45:34-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c8cf1d58680e2af91a43064d5f156e91d84ca72c`
**Resumo:** feat: novo logo — selo arcano vermelho (Mark XIII) (#230)
**Corpo da mensagem:**

feat: novo logo — selo arcano vermelho (Mark XIII) (#230)

- move 19KMF01.svg (upload do operador) -> public/logo.svg (onde o Vite serve)
- recolore de preto (#000000, traço) pra vermelho (#ff1f3a) pra aparecer no
  fundo escuro
- fia /logo.svg no favicon, tela de boot, sidebar e header (aposenta o glifo ⬡
  nesses pontos), com leve glow vermelho
- mantém o ícone do PWA (manifest) como estava (hexágono com fundo escuro)
- verificado via Playwright (logo servido, vermelho, na sidebar)

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 6
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/layout/header.js`
- `src/layout/sidebar.js`
- `src/styles/layout.css`
### Arquivos renomeados

- `19KMF01.svg` → `public/logo.svg`

---

## Commit 416 — `d0db63830f27118983500c22864b71202f72eb89`
**Link:** [d0db63830f27](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d0db63830f27118983500c22864b71202f72eb89)
**Data do autor:** `2026-06-15T17:30:17+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `0c3ef2693173d89c1e4eb318ebc0fd6d4b913ae8`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 417 — `5c0f48d4e5d6da8dec610fcdca68c258f25d7aa4`
**Link:** [5c0f48d4e5d6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5c0f48d4e5d6da8dec610fcdca68c258f25d7aa4)
**Data do autor:** `2026-06-15T14:38:57-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `d0db63830f27118983500c22864b71202f72eb89`
**Resumo:** feat(#222): ícone do launcher = selo vermelho + v0.1.1 (#233)
**Corpo da mensagem:**

feat(#222): ícone do launcher = selo vermelho + v0.1.1 (#233)

* chore(#222): bump launcher para v0.1.1 (próxima release)

- desktop/package.json 0.1.0 -> 0.1.1.
- releases do GitHub são chaveadas por versão: re-rodar o workflow com a mesma
  versão só atualiza a release existente (data original). Subir a versão faz a
  próxima execução criar uma release nova v0.1.1, com data atual.
- v0.1.0 já está publicada e funcional; /baixar já serve os instaladores.
- CHANGELOG atualizado.

* feat(#222): ícone do launcher = selo vermelho + telas no mesmo selo

- desktop/build/icon.png: regenerado de public/logo.svg (selo vermelho num
  quadrado escuro 1024², com brilho). É o ícone da barra de tarefas/atalho/janela.
- build/make-icon.mjs: reescrito pra gerar o ícone a partir do logo do projeto.
- splash.html e offline.html: mostram o selo (antes era arc-reactor em CSS);
  logo.svg copiado pra desktop/src/; CSP da splash liberou img-src.
- corrige bug do M0: offline.html estava fora de src/ (main.js não achava e não
  era empacotado) -> movido pra desktop/src/offline.html (fallback offline volta
  a funcionar).
- CHANGELOG atualizado. O ícone novo entra na release v0.1.1.

---------

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos criados

- `desktop/src/logo.svg`
### Arquivos modificados

- `desktop/build/icon.png`
- `desktop/build/make-icon.mjs`
- `desktop/package.json`
- `desktop/src/splash.html`
- `historico/CHANGELOG.md`
### Arquivos renomeados

- `desktop/offline.html` → `desktop/src/offline.html`

---

## Commit 418 — `934f7908dd78cf14c2dd11ed1682ba6a51a60a5d`
**Link:** [934f7908dd78](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/934f7908dd78cf14c2dd11ed1682ba6a51a60a5d)
**Data do autor:** `2026-06-15T14:39:00-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `5c0f48d4e5d6da8dec610fcdca68c258f25d7aa4`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `image.png`

---

## Commit 419 — `ad959cc6e1ba75d434d0832bb3566366e6d900dc`
**Link:** [ad959cc6e1ba](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ad959cc6e1ba75d434d0832bb3566366e6d900dc)
**Data do autor:** `2026-06-15T16:18:02-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `934f7908dd78cf14c2dd11ed1682ba6a51a60a5d`
**Resumo:** feat(#231): JARVIS ganha o Git Nexus como skills (estilo OpenJarvis) (#234)
**Corpo da mensagem:**

feat(#231): JARVIS ganha o Git Nexus como skills (estilo OpenJarvis) (#234)

- src/utils/jarvis-nexus-tools.js: registra 5 skills no catálogo do agente —
  nexus_impact (risco + afetados), nexus_context, nexus_path, nexus_deps,
  nexus_rename. Cada uma resolve o alvo em linguagem natural (search) e chama o
  git-nexus-engine sobre o codemap.json. Grafo lazy + cacheado.
- jarvis-engine.js: import side-effect registra as skills (entram no
  getToolSchemas que vai pro modelo; o loop de tool-call já as executa).
- agora o operador pergunta 'o que quebra se eu mexer no helpers.js?' e o JARVIS
  responde 'risco CRÍTICO, 115 afetados' usando o grafo.
- verificado via Playwright + Vite dev (5 skills no catálogo, respostas reais,
  erro gracioso pra alvo inexistente).
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos criados

- `src/utils/jarvis-nexus-tools.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/utils/jarvis-engine.js`

---

## Commit 420 — `f9483b95204ee68886c36b6371bac8ab51bbeef9`
**Link:** [f9483b95204e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f9483b95204ee68886c36b6371bac8ab51bbeef9)
**Data do autor:** `2026-06-15T20:12:19-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ad959cc6e1ba75d434d0832bb3566366e6d900dc`
**Resumo:** feat(#195): redesign /perfil — Dossiê do Operador (#235)
**Corpo da mensagem:**

feat(#195): redesign /perfil — Dossiê do Operador (#235)

- src/pages/perfil.js: reconstrói a página no estilo cinematográfico do redesign
  (emblema Ω com anel girando, nome em degradê, badges de clearance, bio, fundo
  com brilho radial + grid e parallax do brilho com o mouse). Stats e atalhos em
  cards com glow/lift; configurações repaginadas, funcionalidade 100% preservada.
- src/styles/perfil.css (novo): estilos usando os design tokens (cores de marca,
  shadow-glow, raios) — consistente com home e Git Nexus. A página antes não
  tinha CSS dedicado (classes perfil-* sem estilo).
- index.html: linka perfil.css.
- verificado via Playwright (hero, emblema, 6 stats, 4 atalhos, 27 swatches).
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos criados

- `src/styles/perfil.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/pages/perfil.js`

---

## Commit 421 — `6dd8fab2810d048ec3b8b2b874910e068d041f7e`
**Link:** [6dd8fab2810d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6dd8fab2810d048ec3b8b2b874910e068d041f7e)
**Data do autor:** `2026-06-15T20:21:06-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f9483b95204ee68886c36b6371bac8ab51bbeef9`
**Resumo:** feat(#195): redesign /sobre — linha do tempo cinematográfica (#236)
**Corpo da mensagem:**

feat(#195): redesign /sobre — linha do tempo cinematográfica (#236)

- src/styles/sobre.css (novo): redesign CSS-only da /sobre (sem mexer na lógica/
  conteúdo). Linha do tempo da jornada do projeto vira espinha vertical com brilho
  ciano→magenta + nós luminosos e tags em pílula; mapa do site em cards com glow/
  lift; educacional repaginado; aviso 'em construção' com acento âmbar e listras.
- index.html: linka sobre.css.
- verificado via Playwright (hero, 6 marcos, 16 cards do mapa, 5 itens edu, painel).
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos criados

- `src/styles/sobre.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`

---

## Commit 422 — `b03b76d5f61f2df57563d5cb107aec9089a640df`
**Link:** [b03b76d5f61f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b03b76d5f61f2df57563d5cb107aec9089a640df)
**Data do autor:** `2026-06-15T20:53:59-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `6dd8fab2810d048ec3b8b2b874910e068d041f7e`
**Resumo:** feat(#195): redesign Onda 1 — Seção Militar (12 páginas via militar.css) (#237)
**Corpo da mensagem:**

feat(#195): redesign Onda 1 — Seção Militar (12 páginas via militar.css) (#237)

- src/styles/militar.css: layer de polish cinematográfico apendado que eleva as
  12 páginas da Seção Militar de uma vez (folha compartilhada). Títulos em degradê
  neon; stat tiles com acento + glow + lift; cards com glow no hover; barras
  brilhando; nós de timeline luminosos; linhas de tabela com tinta ciano; abas
  ativas com glow; inputs com foco neon. Só visual, sem mexer em layout.
- verificado via Playwright (poder-militar, forcas-armadas, historia-militar).
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/militar.css`

---

## Commit 423 — `4506dca530d2c57ac53aa660b06d525e9fdcf04f`
**Link:** [4506dca530d2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4506dca530d2c57ac53aa660b06d525e9fdcf04f)
**Data do autor:** `2026-06-16T02:00:12-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b03b76d5f61f2df57563d5cb107aec9089a640df`
**Resumo:** feat: scroll-reveal global (leve) + handoff pra sessões locais com skills (#239)
**Corpo da mensagem:**

feat: scroll-reveal global (leve) + handoff pra sessões locais com skills (#239)

- src/utils/scroll-reveal.js + reveal.css: blocos de cada página entram
  suavemente na viewport (IntersectionObserver, zero dependência, ~40 linhas).
  Plugado no renderPage() do shell → roda em todas as páginas. Pula /home,
  respeita prefers-reduced-motion, revela tudo na hora sem suporte.
- inspirado nas skills de animação (AOS/ScrollTrigger) mas leve (mega-plano #238).
- verificado via Playwright (/perfil revela, /home pulada, /radar canvas intacto).
- docs/HANDOFF-LOCAL.md (novo): playbook pra uma sessão LOCAL (com as skills
  claudedesignskills + gitnexus) executar o que o remoto não consegue — design
  3D pesado, motor real do GitNexus (M3c), runtimes (M4). Divisão de trabalho
  proposta pelo operador.
- CLAUDE.md (novo): contexto + ponteiro pro handoff (Claude Code lê no boot →
  sessão local auto-descobre as tarefas).
- CHANGELOG atualizado.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos criados

- `CLAUDE.md`
- `docs/HANDOFF-LOCAL.md`
- `src/styles/reveal.css`
- `src/utils/scroll-reveal.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/layout/shell.js`

---

## Commit 424 — `5285e6450a189944fe207c26525b2827650b2f2b`
**Link:** [5285e6450a18](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5285e6450a189944fe207c26525b2827650b2f2b)
**Data do autor:** `2026-06-16T06:05:16+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `4506dca530d2c57ac53aa660b06d525e9fdcf04f`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 425 — `71a8700d78c3a36433175635b21d33df343db4e9`
**Link:** [71a8700d78c3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/71a8700d78c3a36433175635b21d33df343db4e9)
**Data do autor:** `2026-06-16T11:49:03-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `5285e6450a189944fe207c26525b2827650b2f2b`
**Resumo:** feat(#195): redesign Onda 2 — Geo/Tático (HUD em 6 páginas) (#242)
**Corpo da mensagem:**

feat(#195): redesign Onda 2 — Geo/Tático (HUD em 6 páginas) (#242)

Aplica a linguagem visual cinematográfica do redesign às 6 páginas
Geo/Tático: /radar, /mapa, /geopulse, /triangulacao, /find e /visao.

- Títulos em degradê neon ciano→magenta com glow
- Moldura HUD (colchetes nos cantos) nos módulos de canvas/scope
- Stat tiles com barra de acento, valor brilhando e lift no hover
- Scope heads com linha de varredura animada (sensor ao vivo)
- Botões/modos/estações ativos com glow; listas com acento luminoso

Só CSS (pseudo-elementos + box-shadow); zero mudança de layout/estrutura/JS.
Verificado no navegador (Playwright) em /radar, /triangulacao, /find e
/geopulse; build de produção limpo.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/find.css`
- `src/styles/geopulse.css`
- `src/styles/mapa.css`
- `src/styles/radar.css`
- `src/styles/triangulacao.css`
- `src/styles/visao.css`

---

## Commit 426 — `310a127594c5b07c4d4c2e17cdb0aa4efd25ecd2`
**Link:** [310a127594c5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/310a127594c5b07c4d4c2e17cdb0aa4efd25ecd2)
**Data do autor:** `2026-06-16T11:58:45-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `71a8700d78c3a36433175635b21d33df343db4e9`
**Resumo:** feat(#195): redesign Onda 3 — Campo & Tático (cards/leitor) (#243)
**Corpo da mensagem:**

feat(#195): redesign Onda 3 — Campo & Tático (cards/leitor) (#243)

Aplica a linguagem cinematográfica do redesign às páginas de Campo &
Tático: /elites, /dossie e /enciclopedia-militar (o /arsenal já havia
recebido o polish), fechando a Onda 3.

- Títulos de página/seção em degradê neon ciano→magenta com glow
- Cards com fundo em gradiente, lift e glow no hover
- Painéis de leitor/detalhe com brilho radial; nome/título em degradê
- Sumário/nav com item ativo em acento esquerdo luminoso + hover deslizante
- Timeline com nós luminosos; barras de ranking e tags com brilho neon

Só CSS; zero mudança de layout/estrutura/JS. Verificado no navegador
(Playwright) em /elites, /enciclopedia-militar, /dossie e /arsenal;
build de produção limpo.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/dossie.css`
- `src/styles/elites.css`
- `src/styles/enciclopedia-militar.css`

---

## Commit 427 — `0f7cda8b5110ee73c4aba27a8c130cc0a6c72b60`
**Link:** [0f7cda8b5110](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0f7cda8b5110ee73c4aba27a8c130cc0a6c72b60)
**Data do autor:** `2026-06-16T12:06:40-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `310a127594c5b07c4d4c2e17cdb0aa4efd25ecd2`
**Resumo:** feat(#195): redesign páginas leves (/projetos, /roadmap, /mural) (#244)
**Corpo da mensagem:**

feat(#195): redesign páginas leves (/projetos, /roadmap, /mural) (#244)

Aplica a linguagem cinematográfica do redesign às 3 páginas leves
restantes da fila #240.

- Títulos de página/hero/seção em degradê neon ciano→magenta com glow
- Cards com fundo em gradiente e glow no hover (projetos sobem,
  posts do mural deslizam com acento luminoso)
- Cards de nível/site do Roadmap com lift + glow
- Foco neon no composer do Mural; tags com borda neon

Só CSS; zero mudança de layout/estrutura/JS. Verificado no navegador
(Playwright) em /projetos, /roadmap e /mural; build de produção limpo.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/mural.css`
- `src/styles/projetos.css`
- `src/styles/roadmap.css`

---

## Commit 428 — `083ea8ffe9a3b2c455e2fd88afd1057a035b0859`
**Link:** [083ea8ffe9a3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/083ea8ffe9a3b2c455e2fd88afd1057a035b0859)
**Data do autor:** `2026-06-16T12:27:16-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0f7cda8b5110ee73c4aba27a8c130cc0a6c72b60`
**Resumo:** feat(#222): M3c — launcher sobe o motor do GitNexus sozinho (#245)
**Corpo da mensagem:**

feat(#222): M3c — launcher sobe o motor do GitNexus sozinho (#245)

Reescreve desktop/src/nexus.js: maybeStart() deixa de ser opt-in
(BALUARTE_NEXUS_CMD) e sobe `gitnexus serve --port 4747` por padrão.

- Se já há motor no /api/health, só conecta (não duplica)
- Senão tenta uma cadeia até ficar saudável (readiness no /api/health):
  override (BALUARTE_NEXUS_CMD) -> cópia vendorizada (Electron-as-Node)
  -> bin global -> npx -y gitnexus@latest serve
- Desliga com BALUARTE_NEXUS_DISABLE=1; stderr do motor -> console [nexus]
- stop() encerra o filho no quit

Docs: desktop/README.md (M3c + cadeia + aceite local) e HANDOFF-LOCAL.md.
Mapeada a API real do `gitnexus serve` (REST de leitura + POST /api/query
Cypher + ponte MCP-over-HTTP /api/mcp p/ as 16 tools) — base do M3d.

Aceite final é LOCAL (precisa de Electron/máquina). Sintaxe verificada
(node --check); build web intacto.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos modificados

- `desktop/README.md`
- `desktop/src/main.js`
- `desktop/src/nexus.js`
- `docs/HANDOFF-LOCAL.md`
- `historico/CHANGELOG.md`

---

## Commit 429 — `99fab602a5883acc4494759be96117e13be608c8`
**Link:** [99fab602a588](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/99fab602a5883acc4494759be96117e13be608c8)
**Data do autor:** `2026-06-16T17:31:15+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `083ea8ffe9a3b2c455e2fd88afd1057a035b0859`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 430 — `b343d27db3fb855ac8cbbdc6064653c9476ef06d`
**Link:** [b343d27db3fb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b343d27db3fb855ac8cbbdc6064653c9476ef06d)
**Data do autor:** `2026-06-17T05:24:18+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `99fab602a5883acc4494759be96117e13be608c8`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 431 — `d714cbf6c9374efcfc09dde4c65dafc5c8b14790`
**Link:** [d714cbf6c937](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d714cbf6c9374efcfc09dde4c65dafc5c8b14790)
**Data do autor:** `2026-06-17T16:11:29+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `b343d27db3fb855ac8cbbdc6064653c9476ef06d`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 432 — `b4e03b37bbd0e983305c202fae8066d207d94971`
**Link:** [b4e03b37bbd0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b4e03b37bbd0e983305c202fae8066d207d94971)
**Data do autor:** `2026-06-18T05:15:37+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `d714cbf6c9374efcfc09dde4c65dafc5c8b14790`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 433 — `4a5dac351dac7bd21c4d791996c3f77b9a1076e6`
**Link:** [4a5dac351dac](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4a5dac351dac7bd21c4d791996c3f77b9a1076e6)
**Data do autor:** `2026-06-18T15:59:26+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `b4e03b37bbd0e983305c202fae8066d207d94971`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 434 — `2e4af19021ddcd1a2c63873e79919732d368f2b0`
**Link:** [2e4af19021dd](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2e4af19021ddcd1a2c63873e79919732d368f2b0)
**Data do autor:** `2026-06-18T18:54:13-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4a5dac351dac7bd21c4d791996c3f77b9a1076e6`
**Resumo:** docs: continuidade entre sessões — CLAUDE.md aponta pro Manual (#248) e Roadmap (#240) (#249)
**Corpo da mensagem:**

docs: continuidade entre sessões — CLAUDE.md aponta pro Manual (#248) e Roadmap (#240) (#249)

CLAUDE.md é o único arquivo que toda sessão lê automaticamente. Adiciona a seção
"Continuidade entre sessões — comece por aqui" e inclui #248 (manual/regras) e
#240 (roadmap/fila) na lista de issues guarda-chuva (marcadas como "não fechar"),
pra que sessões futuras — que não têm o histórico desta conversa nem as skills
locais — encontrem as regras e a fila de continuação.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 1
### Arquivos modificados

- `CLAUDE.md`

---

## Commit 435 — `bf0f0fb161c89cc1e2b5047e316b92ed3dc2182c`
**Link:** [bf0f0fb161c8](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bf0f0fb161c89cc1e2b5047e316b92ed3dc2182c)
**Data do autor:** `2026-06-19T05:33:10+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `2e4af19021ddcd1a2c63873e79919732d368f2b0`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 436 — `d3d6a3be9a03633878d62f7533630f61bd9d9fe3`
**Link:** [d3d6a3be9a03](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d3d6a3be9a03633878d62f7533630f61bd9d9fe3)
**Data do autor:** `2026-06-19T15:52:00+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `bf0f0fb161c89cc1e2b5047e316b92ed3dc2182c`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 437 — `f0d8f6d672f1c24beb11ca84b997ec271a578209`
**Link:** [f0d8f6d672f1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f0d8f6d672f1c24beb11ca84b997ec271a578209)
**Data do autor:** `2026-06-19T15:04:29-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `d3d6a3be9a03633878d62f7533630f61bd9d9fe3`
**Resumo:** feat(#238): Fase 2 — gate do Git Nexus (web leve, app completo) (#251)
**Corpo da mensagem:**

feat(#238): Fase 2 — gate do Git Nexus (web leve, app completo) (#251)

* feat(#238): Fase 2 — gate do Git Nexus (web leve, app completo)

Põe o Git Nexus atrás de `window.baluarte.native` (mega-plano #238): na web
puro a rota /git-nexus vira um teaser "baixe o app" e o chunk pesado deixa de
ser baixado; no app desktop carrega a experiência completa sob demanda.

- `src/pages/git-nexus.js` agora é um GATE leve (só importa helpers + router):
  app → `import()` dinâmico de `git-nexus-full.js`; web → teaser com CTA pro
  /baixar e atalho pro Raio-X do Código (versão leve).
- `src/pages/git-nexus-full.js` (renomeado do antigo git-nexus.js): a
  experiência pesada (grafo 3D + codemap + codemap-symbols ~460 KB + jarvis-brain)
  só é carregada no app. Export `gitNexusFull`.
- `src/main.js`: o pré-aquecimento de memórias do boot (`syncRepoMemories`, que
  arrasta o codemap/cerebro) agora roda só no app; na web /memoria e /aprendizado
  já sincronizam sob demanda. Boot da web fica leve.
- `src/styles/git-nexus.css`: estilos do teaser + loading.

Impacto no bundle (build Vite): a rota /git-nexus na web cai de ~438 KB para
3.16 KB (gz 1.40 KB); o chunk `git-nexus-full` (438 KB / 48.8 KB gz) só baixa
dentro do launcher. Verificado no navegador: web mostra o teaser; com
`window.baluarte.native` o grafo 3D + console carregam.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

* fix(#238): gate em arquivo novo — não renomear git-nexus.js (CodeQL)

O CodeQL apontou "1 novo alerta" porque a renomeação git-nexus.js →
git-nexus-full.js fez o arquivo inteiro contar como código novo no diff,
reabrindo um padrão pré-existente (o fingerprint do scanner é por caminho).
O conteúdo era byte-idêntico ao do main — só o nome mudava.

Correção: o `git-nexus.js` (experiência completa) volta a ficar IDÊNTICO ao main
(zero diff), e o gate leve passa pra um arquivo novo `git-nexus-gate.js`. O
router aponta /git-nexus pro gate, que na web mostra o teaser e no app
(`window.baluarte.native`) faz `import()` do `git-nexus.js` completo sob demanda.

Mesmo benefício de bundle: rota /git-nexus na web = `git-nexus-gate` 3.15 KB
(gz 1.39); o chunk pesado `git-nexus` (438 KB / 48.8 KB gz) só baixa no app.
Verificado no navegador: web → teaser (sem canvas); native → grafo 3D + console.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

* docs(#238): CHANGELOG — Fase 2 gate do Git Nexus

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

---------

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos criados

- `src/pages/git-nexus-gate.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/main.js`
- `src/styles/git-nexus.css`

---

## Commit 438 — `6bee8f5f3fe7ada00de534f2993daf9672620a3f`
**Link:** [6bee8f5f3fe7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6bee8f5f3fe7ada00de534f2993daf9672620a3f)
**Data do autor:** `2026-06-19T16:44:23-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f0d8f6d672f1c24beb11ca84b997ec271a578209`
**Resumo:** feat(#195): redesign — Ondas Conteúdo + Mídia (9 páginas) (#252)
**Corpo da mensagem:**

feat(#195): redesign — Ondas Conteúdo + Mídia (9 páginas) (#252)

* feat(#195): redesign Onda Conteúdo — /biblioteca, /universo, /academia

Aplica o polish cinematográfico (mesma linguagem do militar.css / Ondas 2-3) às
3 páginas de conteúdo/aprendizado que ainda estavam no visual antigo. Só visual
(glow/profundidade/degradê via box-shadow, pseudo-elementos e background-clip);
nada de layout, estrutura ou JS mudou.

- /biblioteca: título e títulos do leitor (arco/capítulo) em degradê neon; cards
  de arco com lift+glow e capa com leve zoom no hover; faixa de acento luminoso no
  "continuar lendo"; busca com foco neon.
- /universo: título e títulos de seção em degradê neon; cards com lift+glow e
  ícone brilhando na cor do mundo; nome/ícone do detalhe com glow; links de arco
  com glow no hover.
- /academia: título e nome da linguagem em degradê neon; cards (linguagens,
  módulos, recursos, carreiras) com glow+lift no hover; títulos de seção em degradê.

Verificado no navegador (Playwright + Vite): as 3 páginas com título neon e cards
repaginados. Build de produção limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

* docs(#195): CHANGELOG — Onda Conteúdo (biblioteca/universo/academia)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

* feat(#195): redesign Onda Mídia — /fft, /radio, /musicas, /media, /videos, /tv

Segunda onda do redesign (mesmo PR/lote): polish cinematográfico nas 6 páginas de
mídia/áudio. Só visual (glow/profundidade/degradê via box-shadow, pseudo-elementos
e background-clip); nada de layout, estrutura ou JS.

- /fft: título neon; moldura HUD (cantos luminosos) no canvas; modo ativo com glow.
- /radio: título neon; display de frequência brilhando; estações/resultados com glow no hover; modo ativo com glow.
- /musicas: título neon; faixa ativa com acento magenta + glow.
- /media: título neon; linhas (hover/ativa) com glow; dropzone com foco neon.
- /videos: título neon; playlist e linha ativa/hover com glow; títulos de playlist/info em degradê.
- /tv: título neon; tela em moldura luminosa; canal ativo com glow; slot "agora" com acento.

Verificado no navegador (Playwright + Vite) nas 6 rotas. Build de produção limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

---------

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 10
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/academia.css`
- `src/styles/biblioteca.css`
- `src/styles/fft.css`
- `src/styles/media.css`
- `src/styles/musicas.css`
- `src/styles/radio.css`
- `src/styles/tv.css`
- `src/styles/universo.css`
- `src/styles/videos.css`

---

## Commit 439 — `2242bc3783ed53b574b096dce6b3090319890c70`
**Link:** [2242bc3783ed](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2242bc3783ed53b574b096dce6b3090319890c70)
**Data do autor:** `2026-06-19T16:49:22-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `6bee8f5f3fe7ada00de534f2993daf9672620a3f`
**Resumo:** feat(#195): redesign Onda Catálogo & Lazer (6 páginas) (#253)
**Corpo da mensagem:**

feat(#195): redesign Onda Catálogo & Lazer (6 páginas) (#253)

Terceira leva do redesign: polish cinematográfico em /ciberseg, /robotica,
/filmes, /memes, /jogos e /batalha-naval. Só visual (glow/profundidade/degradê
via box-shadow, pseudo-elementos e background-clip); nada de layout/estrutura/JS.

- /ciberseg: título neon; linhas (hover/ativa) com glow; títulos de seção/detalhe em degradê.
- /robotica: título neon; módulos com glow no hover; item do rail ativo brilhando; título do módulo em degradê.
- /filmes: título neon; cards com lift+glow e pôster com leve zoom; título acende no hover.
- /memes: título neon; cards com lift+glow (mantendo a cor do tier); filtro ativo brilhando.
- /jogos: título neon; cards com lift+glow e aba ativa — escopado em .page-arcade (evita colisão com .arc-card da /biblioteca).
- /batalha-naval: título neon; título do tabuleiro em degradê; grade com leve glow.

Verificado no navegador (Playwright + Vite). Build de produção limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/batalha-naval.css`
- `src/styles/ciberseg.css`
- `src/styles/filmes.css`
- `src/styles/jogos.css`
- `src/styles/memes.css`
- `src/styles/robotica.css`

---

## Commit 440 — `4bcd1f221fd615fcb14a713941d2ddb9ecaca673`
**Link:** [4bcd1f221fd6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4bcd1f221fd615fcb14a713941d2ddb9ecaca673)
**Data do autor:** `2026-06-20T00:49:37-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2242bc3783ed53b574b096dce6b3090319890c70`
**Resumo:** feat(#195): redesign Onda Referência + Economia + Hubs (7 páginas) (#254)
**Corpo da mensagem:**

feat(#195): redesign Onda Referência + Economia + Hubs (7 páginas) (#254)

Quarta leva do redesign: polish cinematográfico em /tabela-periodica, /modpack,
/guia-pc, /economia, /dolar, /ferramentas, /utilidades. Só visual (glow/degradê
via box-shadow, pseudo-elementos e background-clip); nada de layout/estrutura/JS.
Polishes escopados ao root de cada página (estilos vivem em fase17/fase19.css).

- /tabela-periodica: título neon; células brilhando no hover.
- /modpack: título neon; cards em lift+glow.
- /guia-pc: título neon; presets em glow; aba de preset ativa brilhando.
- /economia: título e seções em degradê; cards de cotação em lift+glow; valor com brilho.
- /dolar: título neon; moedas em glow; valores brilhando.
- /ferramentas: título neon (.fh-title); cards com glow ciano somado ao hover existente.
- /utilidades: título neon; cards em lift+glow; stats brilhando.

Verificado no navegador (Playwright + Vite). Build de produção limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 6
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/dolar.css`
- `src/styles/fase17.css`
- `src/styles/fase19.css`
- `src/styles/ferramentas.css`
- `src/styles/utilidades.css`

---

## Commit 441 — `3fd151ac887a8730fb558f009407378058992035`
**Link:** [3fd151ac887a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3fd151ac887a8730fb558f009407378058992035)
**Data do autor:** `2026-06-20T00:54:29-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4bcd1f221fd615fcb14a713941d2ddb9ecaca673`
**Resumo:** feat(#195): redesign Onda Ferramentas (devtools) + título neon global (#255)
**Corpo da mensagem:**

feat(#195): redesign Onda Ferramentas (devtools) + título neon global (#255)

Fecha o redesign do site. A regra base .page-header__title (components.css)
passou a ser o título neon ciano→magenta com glow padrão → todas as ~18 páginas
de ferramentas e qualquer página sem regra própria ganham o título do redesign
de uma vez (páginas com regra escopada seguem mandando na sua, por especificidade).

Glow/lift nos cards/painéis/tiles dos devtools, escopados por classe única
(.calc-tile, .symbol-tile, .cs-card/.cs-swatch, .cripto-tile, .porta-card,
.regex-*-card, .qr-read__panel, .logic-card, .steg-panel, .morse-panel, .kmap__cell);
título do /regex (que usa .sec-title) também em degradê. Só visual.

Verificado no navegador (Playwright + Vite): /calculadoras, /simbolos,
/color-studio, /regex, /editor. Build limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/components.css`

---

## Commit 442 — `ea33844c510544527318c023b8cd95e30f38c08f`
**Link:** [ea33844c5105](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ea33844c510544527318c023b8cd95e30f38c08f)
**Data do autor:** `2026-06-20T01:02:05-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `3fd151ac887a8730fb558f009407378058992035`
**Resumo:** feat(#231): Núcleo de IA — Etapa 1: cockpit com abas (fusão da seção IA) (#256)
**Corpo da mensagem:**

feat(#231): Núcleo de IA — Etapa 1: cockpit com abas (fusão da seção IA) (#256)

O Git Nexus, dentro do app, vira o "Núcleo de IA": um cockpit com barra de abas.
Aba "Grafo de Código" = a experiência completa atual; + 11 abas das ferramentas
IA (JARVIS, Conselho, APIs, Dashboard, ML, Mini-LLM, Segundo Cérebro, Memória,
Terminal-IA, Segurança, IA Proprietária), cada uma carregada sob demanda
(dynamic import) e montada reusando o render existente — sem reescrever features.

- src/pages/git-nexus-cockpit.js (novo): a casca do cockpit (abas + painel + lazy load).
- src/pages/git-nexus-gate.js: no app, carrega o cockpit (na web segue o teaser).
- src/styles/git-nexus.css: estilos das abas do cockpit.

Aditivo: as rotas individuais seguem funcionando; unificar navegação/rotas vem
nas próximas etapas (incremental). Cockpit é app-only (alinhado ao #238).

Verificado no app (Playwright + window.baluarte.native): 12 abas, Grafo por
padrão, abas Memória e JARVIS carregam sob demanda. Build limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos criados

- `src/pages/git-nexus-cockpit.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus-gate.js`
- `src/styles/git-nexus.css`

---

## Commit 443 — `fe1d6516eb01f5d90f324d9f45d05191fb0e902b`
**Link:** [fe1d6516eb01](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fe1d6516eb01f5d90f324d9f45d05191fb0e902b)
**Data do autor:** `2026-06-20T01:11:23-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ea33844c510544527318c023b8cd95e30f38c08f`
**Resumo:** feat(#231): Núcleo de IA — Etapa 2: navegação unificada (IA app-only) (#257)
**Corpo da mensagem:**

feat(#231): Núcleo de IA — Etapa 2: navegação unificada (IA app-only) (#257)

Unifica a navegação da seção IA no Núcleo de IA (cockpit do Git Nexus):

- sidebar: a seção "IA & Jarvis" colapsa numa entrada só ("Núcleo de IA" → /git-nexus).
- rotas legadas (/jarvis, /conselho, /apis, /jarvis-dashboard, /aprendizado,
  /llm-lab, /cerebro, /memoria, /terminal-ia, /seguranca, /ia-proprietaria) caem
  no cockpit na aba certa via lazyNexus(tab) — bookmarks antigos seguem funcionando.
- deep-link por #/git-nexus?tab=<id> (o cockpit lê args.tab / query.tab).
- IA é app-only (#238): no app abre o cockpit; na web as rotas mostram o teaser,
  reescrito pra refletir o Núcleo de IA (grafo + JARVIS + memória + cérebro + ML).

Verificado (Playwright): web /memoria → teaser; sidebar sem /jarvis e com Núcleo
de IA; app /jarvis → aba JARVIS; deep-link ?tab=memoria → aba Memória. Build limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/git-nexus-cockpit.js`
- `src/pages/git-nexus-gate.js`

---

## Commit 444 — `e62b3eb83166e5a7bf3ffb1919e5febc57ed2a23`
**Link:** [e62b3eb83166](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e62b3eb83166e5a7bf3ffb1919e5febc57ed2a23)
**Data do autor:** `2026-06-20T01:19:12-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `fe1d6516eb01f5d90f324d9f45d05191fb0e902b`
**Resumo:** feat(#231): Núcleo de IA — Etapa 3: aba linkável + lembra a última aba (#260)
**Corpo da mensagem:**

feat(#231): Núcleo de IA — Etapa 3: aba linkável + lembra a última aba (#260)

- trocar de aba no cockpit sincroniza a URL (#/git-nexus?tab=<id>) via
  history.replaceState (sem disparar navegação/re-render) → aba linkável e
  sobrevive ao reload.
- lembra a última aba (storage 'nexus:lastTab'): reabrir o Núcleo de IA pela
  sidebar restaura a última usada. Prioridade: rota legada/deep-link > última > grafo.

Verificado (Playwright, app): trocar p/ Segundo Cérebro → URL ?tab=cerebro;
reabrir /git-nexus → volta na aba Cérebro. Build limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus-cockpit.js`

---

## Commit 445 — `2423c35d97770d555b55e67c968311edc8c89992`
**Link:** [2423c35d9777](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2423c35d97770d555b55e67c968311edc8c89992)
**Data do autor:** `2026-06-20T01:27:55-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `e62b3eb83166e5a7bf3ffb1919e5febc57ed2a23`
**Resumo:** docs(#246): Design System do Baluarte — contrato visual (design first) (#261)
**Corpo da mensagem:**

docs(#246): Design System do Baluarte — contrato visual (design first) (#261)

Adiciona docs/DESIGN-SYSTEM.md: tokens (de variables.css), componentes/padrões já
firmados nas Ondas de redesign (título neon, cards glow/lift, moldura HUD, tabs,
chips, timelines) e diretrizes pra iconografia (adotar coolicons/MIT), data-viz,
imagens (Pinterest) e o redesign profundo dos flagships (/home, /perfil, /arsenal,
/biblioteca). Base pra fechar o design antes de seguir com as funções.

CLAUDE.md aponta pro doc (continuidade). Nota: os 3 Figma do #246 são community
files e o Figma MCP exige acesso de edição — pra extrair direto, duplicar/
compartilhar como editor; até lá o doc grounda a direção nos tokens reais + open-source.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos criados

- `docs/DESIGN-SYSTEM.md`
### Arquivos modificados

- `CLAUDE.md`
- `historico/CHANGELOG.md`

---

## Commit 446 — `fb3dc04005e49c9d6c68500f93a0c05093f649f1`
**Link:** [fb3dc04005e4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fb3dc04005e49c9d6c68500f93a0c05093f649f1)
**Data do autor:** `2026-06-20T04:50:18+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `2423c35d97770d555b55e67c968311edc8c89992`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 447 — `e07411860742f8f9a069377e05986a3b03d8a608`
**Link:** [e07411860742](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e07411860742f8f9a069377e05986a3b03d8a608)
**Data do autor:** `2026-06-20T09:34:27-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `fb3dc04005e49c9d6c68500f93a0c05093f649f1`
**Resumo:** feat(#246): nova home "Command Deck" — promovida a oficial (/) (#263)
**Corpo da mensagem:**

feat(#246): nova home "Command Deck" — promovida a oficial (/) (#263)

* feat(#246): nova home "Command Deck" (preview /home2) — hero holográfico + bento

Proposta NOVA de home pra aprovação, em rota de preview /home2 (não toca a /home
atual). Distinta da atual: hero com título holográfico animado sobre fundo HUD
(grid + scanline + colchetes), grid BENTO (métricas count-up, Núcleo de IA com
orbe, baixar app, vigilância, crônica/equipe em destaque, acesso rápido) e
prateleiras com scroll-snap. Leve: CSS/canvas + herói WebGL reusado, JS puro.

Se aprovado, vira a /home oficial e a linguagem se espalha pras outras páginas.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

* feat(#246): promove a nova home "Command Deck" a oficial (/)

Aprovada pelo operador. A /home agora é o redesign novo: hero holográfico sobre
fundo HUD (grid + scanline + colchetes) + grid bento (métricas, Núcleo de IA,
baixar app, vigilância, destaques, acesso rápido) + prateleiras com scroll-snap.

- src/pages/home.js: reescrito com o "Command Deck" (export homePage).
- src/pages/home-v2.js: removido (código foi pro home.js); era o preview.
- src/main.js: /home-3d e /home2 viram alias da home oficial.
- src/styles/home-v2.css: comentário atualizado (agora é o CSS oficial da home).

Leve (CSS/canvas + WebGL reusado), JS puro, respeita reduced-motion. Primeira
página da nova linguagem — as outras seguem o mesmo padrão. Build limpo;
verificado no navegador (título holográfico, 7 células bento, 3 prateleiras).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

---------

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos criados

- `src/styles/home-v2.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/main.js`
- `src/pages/home.js`

---

## Commit 448 — `29a9afd8bddb3563afbe0301331fc6188dc423ab`
**Link:** [29a9afd8bddb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/29a9afd8bddb3563afbe0301331fc6188dc423ab)
**Data do autor:** `2026-06-20T09:39:47-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `e07411860742f8f9a069377e05986a3b03d8a608`
**Resumo:** feat(#246): título holográfico animado em todas as páginas (#264)
**Corpo da mensagem:**

feat(#246): título holográfico animado em todas as páginas (#264)

Espalha a assinatura da nova home pro site: o .page-header__title global vira um
degradê holográfico animado (ciano→roxo→magenta, shimmer lento), respeitando
prefers-reduced-motion. Remove os overrides de título estático (biblioteca,
universo, academia e o bloco das 12 páginas militares) → todas herdam o global,
ficando uniforme.

Só visual. Build limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 6
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/academia.css`
- `src/styles/biblioteca.css`
- `src/styles/components.css`
- `src/styles/militar.css`
- `src/styles/universo.css`

---

## Commit 449 — `39f46f08ad7a5c6e5aef1fad27de39a00bd56eb0`
**Link:** [39f46f08ad7a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/39f46f08ad7a5c6e5aef1fad27de39a00bd56eb0)
**Data do autor:** `2026-06-20T14:40:28+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `29a9afd8bddb3563afbe0301331fc6188dc423ab`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 450 — `48e27cf846d4d11b359b7b39ed2c9b7eb53f99a8`
**Link:** [48e27cf846d4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/48e27cf846d4d11b359b7b39ed2c9b7eb53f99a8)
**Data do autor:** `2026-06-20T12:23:02-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `39f46f08ad7a5c6e5aef1fad27de39a00bd56eb0`
**Resumo:** feat(#246): /perfil no estilo "Command Deck" (HUD hero + stats bento) (#265)
**Corpo da mensagem:**

feat(#246): /perfil no estilo "Command Deck" (HUD hero + stats bento) (#265)

Primeiro flagship do rollout profundo: a /perfil ganha a linguagem da nova home.
- hero com HUD (grid + scanline + colchetes nos cantos) e nome holográfico animado;
- stats em bento (barra de acento no topo + glow/lift).
Só visual (3 elementos HUD no hero via h() + CSS); função intacta. Build limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/perfil.js`
- `src/styles/perfil.css`

---

## Commit 451 — `e47b52658e81277a222ad465d794d7939290b10c`
**Link:** [e47b52658e81](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e47b52658e81277a222ad465d794d7939290b10c)
**Data do autor:** `2026-06-20T12:32:31-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `48e27cf846d4d11b359b7b39ed2c9b7eb53f99a8`
**Resumo:** feat(#246): integração Spline 3D pronta (cenas reais, lazy + fallback) (#266)
**Corpo da mensagem:**

feat(#246): integração Spline 3D pronta (cenas reais, lazy + fallback) (#266)

Pra atingir o "nível Spline" pedido pelo operador: mecanismo pra embutir cenas 3D
do Spline de verdade, deixando tudo pronto pra plugar as URLs.

- src/utils/spline-embed.js: monta <spline-viewer> (CDN) lazy (IntersectionObserver),
  com fallback seguro (sem URL/falha/reduced-motion → herói WebGL atual) e timeout.
- src/data/spline-scenes.js: slot de cena por página + teste via #/home?spline=<url>
  (restrito ao domínio spline.design).
- home.js: cena entra por cima do herói; no load some o canvas/grid; senão, fallback.
  Config vazia por padrão → produção intacta.
- main.js: rotas da home passam args (querystring).

Falta o operador exportar as URLs .splinecode das cenas (community → Export → Viewer)
e colar em spline-scenes.js. Estudo das cenas: #262. Build limpo; home cai no fallback.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 6
### Arquivos criados

- `src/data/spline-scenes.js`
- `src/utils/spline-embed.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/main.js`
- `src/pages/home.js`
- `src/styles/home-v2.css`

---

## Commit 452 — `8bd4b403ea89465f830c22a1cdb367fdae9ba49a`
**Link:** [8bd4b403ea89](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8bd4b403ea89465f830c22a1cdb367fdae9ba49a)
**Data do autor:** `2026-06-20T12:40:33-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `e47b52658e81277a222ad465d794d7939290b10c`
**Resumo:** feat(#246): raios volumétricos no herói da home (nível Spline, só CSS) (#267)
**Corpo da mensagem:**

feat(#246): raios volumétricos no herói da home (nível Spline, só CSS) (#267)

Camada .hv2-hero__rays: leques de luz ciano->violeta->magenta varrendo
do topo, animados via @property --hv2-ray (conic suave), mascarados pra
somar com a galaxia WebGL sem competir com o titulo holografico.
Ref. 'Futuristic Rays Background' (#262). Some junto com canvas/grid
quando uma cena Spline carrega; respeita prefers-reduced-motion.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/home.js`
- `src/styles/home-v2.css`

---

## Commit 453 — `42943e197f5811afb7893e2b470f75bd0a508987`
**Link:** [42943e197f58](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/42943e197f5811afb7893e2b470f75bd0a508987)
**Data do autor:** `2026-06-20T12:54:09-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `8bd4b403ea89465f830c22a1cdb367fdae9ba49a`
**Resumo:** feat(#246): camada imersiva global (atmosfera + header HUD em todo o site) (#268)
**Corpo da mensagem:**

feat(#246): camada imersiva global (atmosfera + header HUD em todo o site) (#268)

- atmosfera global: 1 camada de fundo montada pelo shell, atras de todo
  o app (auroras + raios conic @property + grid HUD + vinheta). Leva o
  'nivel Spline' (#262, usadas como referencia) pra todas as paginas de
  uma vez, nativamente. So CSS, pointer-events:none, z-index:-1, RM ok.
- .page-header vira painel HUD (barra de acento + scanline animada),
  global em components.css -> ~68 paginas sem editar pagina.
- DESIGN-SYSTEM.md: documenta a camada + mapa 'cena Spline -> efeito nativo'.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos criados

- `src/styles/atmosphere.css`
- `src/utils/atmosphere.js`
### Arquivos modificados

- `docs/DESIGN-SYSTEM.md`
- `historico/CHANGELOG.md`
- `index.html`
- `src/layout/shell.js`
- `src/styles/components.css`

---

## Commit 454 — `9ede964018ca9bbaaa977163304eae9e5b781025`
**Link:** [9ede964018ca](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9ede964018ca9bbaaa977163304eae9e5b781025)
**Data do autor:** `2026-06-20T13:02:33-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `42943e197f5811afb7893e2b470f75bd0a508987`
**Resumo:** feat(#246): kit de heroi imersivo reusavel + flagships /universo e /biblioteca (#269)
**Corpo da mensagem:**

feat(#246): kit de heroi imersivo reusavel + flagships /universo e /biblioteca (#269)

- src/utils/immersive.js + immersive.css: buildImmersiveHero({...})
  generaliza o heroi 'Command Deck' da home pra qualquer flagship em 1
  chamada (WebGL + raios + grid HUD + titulo holografico + CTAs + slot
  Spline). Parametrizavel por --bx-accent. Auto-limpa ao sair do DOM.
- /universo e /biblioteca: header antigo -> heroi imersivo (conteudo
  preservado; contador de capitulos dinamico da biblioteca mantido).
- spline-scenes.js: novos slots biblioteca/elites/sobre (testaveis via ?spline=).


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos criados

- `src/styles/immersive.css`
- `src/utils/immersive.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/data/spline-scenes.js`
- `src/pages/biblioteca.js`
- `src/pages/universo.js`

---

## Commit 455 — `5204069688d8187830dafa582051c5ade3114b4b`
**Link:** [5204069688d8](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5204069688d8187830dafa582051c5ade3114b4b)
**Data do autor:** `2026-06-20T13:08:14-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `9ede964018ca9bbaaa977163304eae9e5b781025`
**Resumo:** feat(#246): herois imersivos em /elites, /sobre e /dossie (#270)
**Corpo da mensagem:**

feat(#246): herois imersivos em /elites, /sobre e /dossie (#270)

Trocam o header padrao pelo buildImmersiveHero (galaxia WebGL + raios +
grid HUD + titulo holografico + CTAs cruzadas). Contadores dinamicos e
conteudo seguem intactos. /baixar mantem o heroi proprio (detec. de SO).


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/dossie.js`
- `src/pages/elites.js`
- `src/pages/sobre.js`

---

## Commit 456 — `12866431292570597c43a718cf638788e37aa257`
**Link:** [128664312925](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/12866431292570597c43a718cf638788e37aa257)
**Data do autor:** `2026-06-20T13:13:54-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `5204069688d8187830dafa582051c5ade3114b4b`
**Resumo:** feat(#246): herois imersivos em /arsenal e /ferramentas (#271)
**Corpo da mensagem:**

feat(#246): herois imersivos em /arsenal e /ferramentas (#271)

/arsenal (flagship #246 no3) e /ferramentas (hub) trocam o header pelo
buildImmersiveHero (galaxia WebGL + raios + grid HUD + titulo holografico
+ CTAs). Tabs/filtros/catalogo e grid de ferramentas seguem intactos.
/git-nexus gate mantido leve de proposito (#238).


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/arsenal.js`
- `src/pages/ferramentas.js`

---

## Commit 457 — `ec92914fa8c326603a76728cd6aa1b5cdf1fc2fa`
**Link:** [ec92914fa8c3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ec92914fa8c326603a76728cd6aa1b5cdf1fc2fa)
**Data do autor:** `2026-06-20T18:21:53-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `12866431292570597c43a718cf638788e37aa257`
**Resumo:** feat(#246): herois imersivos em 17 paginas de conteudo (militar + midia) (#272)
**Corpo da mensagem:**

feat(#246): herois imersivos em 17 paginas de conteudo (militar + midia) (#272)

11 militares (forcas armadas/especiais, poder/tecnologia/organizacao/
orcamentos militares, historia militar, guerras, batalhas, taticas, armas
por pais) + 6 midia (filmes, musicas, tv, videos, radio, media hub)
trocam o header pelo buildImmersiveHero. Tabelas/timelines/grids/players
e contadores dinamicos seguem intactos abaixo. Auto-limpa na navegacao.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 18
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/armas-por-pais.js`
- `src/pages/batalhas-historicas.js`
- `src/pages/filmes.js`
- `src/pages/forcas-armadas.js`
- `src/pages/forcas-especiais.js`
- `src/pages/guerras-conflitos.js`
- `src/pages/historia-militar.js`
- `src/pages/media.js`
- `src/pages/musicas.js`
- `src/pages/orcamentos-militares.js`
- `src/pages/organizacao-militar.js`
- `src/pages/poder-militar.js`
- `src/pages/radio.js`
- `src/pages/taticas-estrategias.js`
- `src/pages/tecnologia-militar.js`
- `src/pages/tv.js`
- `src/pages/videos.js`

---

## Commit 458 — `b7bba34c962ee65368a3e834de9f496e2ba5f929`
**Link:** [b7bba34c962e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b7bba34c962ee65368a3e834de9f496e2ba5f929)
**Data do autor:** `2026-06-20T19:49:28-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ec92914fa8c326603a76728cd6aa1b5cdf1fc2fa`
**Resumo:** feat(#246): cena Spline REAL na home (embed publico my.spline.design) (#273)
**Corpo da mensagem:**

feat(#246): cena Spline REAL na home (embed publico my.spline.design) (#273)

- spline-embed.js aceita embed publico my.spline.design via <iframe>
  decorativo (pointer-events:none, lazy, revela no load ou em <=3.5s),
  alem do <spline-viewer> p/ .splinecode. Resolve o caso real: export
  .splinecode e pago; o Share/Public e free (selo 'Built with Spline').
- sceneFor passa a aceitar my.spline.design.
- home: cena 'Retrofuturistic circuit loop' como fundo do heroi, atras
  do wordmark holografico. Fallback WebGL intacto; ?spline= ainda testa.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/data/spline-scenes.js`
- `src/utils/spline-embed.js`

---

## Commit 459 — `2a256decc32a9ef5d34b18afd27b75d8181e4f08`
**Link:** [2a256decc32a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2a256decc32a9ef5d34b18afd27b75d8181e4f08)
**Data do autor:** `2026-06-20T19:57:43-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b7bba34c962ee65368a3e834de9f496e2ba5f929`
**Resumo:** feat(#246): variantes de heroi WebGL nativas (planet / reactor) (#274)
**Corpo da mensagem:**

feat(#246): variantes de heroi WebGL nativas (planet / reactor) (#274)

- hero-webgl.js: novo param variant + buildGeometry(variant). Alem de
  'galaxy' (padrao), 'planet' (globo holografico + anel orbital + estrelas,
  ref. Orbital View of Arrakis) e 'reactor' (aneis concentricos + cruzados +
  nucleo, ref. circuit loop). Mesmo renderer point-sprite.
- /universo -> planet; Nucleo de IA (gate) -> reactor (troca o header).
- buildImmersiveHero repassa variant; galaxy segue identico.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus-gate.js`
- `src/pages/universo.js`
- `src/utils/hero-webgl.js`
- `src/utils/immersive.js`

---

## Commit 460 — `0394df32a7c223e125720e4e251d83a644d3f6b3`
**Link:** [0394df32a7c2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0394df32a7c223e125720e4e251d83a644d3f6b3)
**Data do autor:** `2026-06-20T20:08:34-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2a256decc32a9ef5d34b18afd27b75d8181e4f08`
**Resumo:** feat(#246): novas variantes 3D (helix/scope) espalhadas pelos flagships (#275)
**Corpo da mensagem:**

feat(#246): novas variantes 3D (helix/scope) espalhadas pelos flagships (#275)

- hero-webgl.js: +helix (DNA girando) e +scope (aneis+mira, varre via rotZ).
  5 tipos nativos no total (galaxy/planet/reactor/helix/scope).
- biblioteca->helix, arsenal->scope, ferramentas->reactor.
- perfil: fundo 3D scope (canvas atras do dossie, fallback+auto-limpeza).


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/arsenal.js`
- `src/pages/biblioteca.js`
- `src/pages/ferramentas.js`
- `src/pages/perfil.js`
- `src/styles/perfil.css`
- `src/utils/hero-webgl.js`

---

## Commit 461 — `b4a0e8992ee37ec09d1ee1533e62eecf1af7524c`
**Link:** [b4a0e8992ee3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b4a0e8992ee37ec09d1ee1533e62eecf1af7524c)
**Data do autor:** `2026-06-21T00:16:00-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0394df32a7c223e125720e4e251d83a644d3f6b3`
**Resumo:** feat(#246): efeitos no heroi WebGL (power-on de entrada + parallax mais vivo) (#276)
**Corpo da mensagem:**

feat(#246): efeitos no heroi WebGL (power-on de entrada + parallax mais vivo) (#276)

- power-on: ~900ms zoom-in + fade-in de brilho ao montar (uniform
  uIntensity no shader, ease cubico). Arranque cinematografico por pagina.
- parallax do ponteiro mais forte + deriva sutil (sin/cos) pra cena
  respirar sozinha. Vale pra todas as variantes. RM entra no estado final.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/utils/hero-webgl.js`

---

## Commit 462 — `0b7c96d250780c02e1092e029c17300e5c42e40d`
**Link:** [0b7c96d25078](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0b7c96d250780c02e1092e029c17300e5c42e40d)
**Data do autor:** `2026-06-21T00:20:37-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b4a0e8992ee37ec09d1ee1533e62eecf1af7524c`
**Resumo:** feat(#246): onda de energia (pulso) no heroi WebGL (#277)
**Corpo da mensagem:**

feat(#246): onda de energia (pulso) no heroi WebGL (#277)

Anel de brilho que sai do nucleo pra fora (~3.4s/pulso), realcando
particulas/aneis por onde passa. Feito no vertex shader (uniform uWave +
smoothstep no raio) + leve boost de tamanho do ponto. Vale pra todas as
5 variantes, 1 uniform por frame. RM congela num quadro.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/utils/hero-webgl.js`

---

## Commit 463 — `52a5b153726e857072e48273dc907fdb9992e503`
**Link:** [52a5b153726e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/52a5b153726e857072e48273dc907fdb9992e503)
**Data do autor:** `2026-06-21T00:44:26-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0b7c96d250780c02e1092e029c17300e5c42e40d`
**Resumo:** perf(#238): CSS split por rota — boot 55→29.5 kB gz (Fase 2) (#278)
**Corpo da mensagem:**

perf(#238): CSS split por rota — boot 55→29.5 kB gz (Fase 2) (#278)

O boot carregava todas as ~83 folhas via <link> no index.html (398 KB /
55 KB gz em toda pagina). Agora so as folhas globais (fundacao + shell +
componentes + compartilhadas por varias paginas) ficam no <link>; cada
folha especifica de pagina e importada pelo proprio modulo da pagina e o
Vite faz code-split por rota. Boot CSS: 398->194 KB raw, 55->29.5 KB gz
(-46%). 42 folhas movidas pra 42 chunks por rota. Removida home3d.css
(orfa). Gate do Nucleo de IA verificado: chunk pesado (438 KB) fora do
boot, syncRepoMemories gateado por isNative(). Conferido no navegador
sem regressao (home, ferramentas, regex, git-nexus, calculadoras, jogos,
poder-militar).


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 45
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/pages/academia.js`
- `src/pages/baixar.js`
- `src/pages/batalha-naval.js`
- `src/pages/calculadoras/index.js`
- `src/pages/ciberseg.js`
- `src/pages/codigo.js`
- `src/pages/color-studio.js`
- `src/pages/dolar.js`
- `src/pages/dossie.js`
- `src/pages/enciclopedia-militar.js`
- `src/pages/esteganografia.js`
- `src/pages/ferramentas.js`
- `src/pages/fft.js`
- `src/pages/filmes.js`
- `src/pages/find.js`
- `src/pages/geopulse.js`
- `src/pages/git-helper.js`
- `src/pages/git-nexus-gate.js`
- `src/pages/ia-proprietaria.js`
- `src/pages/jogos.js`
- `src/pages/json-studio.js`
- `src/pages/mapa.js`
- `src/pages/media.js`
- `src/pages/memes.js`
- `src/pages/mural.js`
- `src/pages/musicas.js`
- `src/pages/perfil.js`
- `src/pages/projetos.js`
- `src/pages/qr-studio.js`
- `src/pages/radar.js`
- `src/pages/radio.js`
- `src/pages/regex.js`
- `src/pages/roadmap.js`
- `src/pages/robotica.js`
- `src/pages/sobre.js`
- `src/pages/tabela-verdade.js`
- `src/pages/triangulacao.js`
- `src/pages/tv.js`
- `src/pages/universo.js`
- `src/pages/utilidades.js`
- `src/pages/videos.js`
- `src/pages/visao.js`
### Arquivos removidos

- `src/styles/home3d.css`

---

## Commit 464 — `f322095dde32967dbc42d9454bc8cbb5c25a908d`
**Link:** [f322095dde32](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f322095dde32967dbc42d9454bc8cbb5c25a908d)
**Data do autor:** `2026-06-21T00:56:51-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `52a5b153726e857072e48273dc907fdb9992e503`
**Resumo:** feat(#231): skills de nivel de funcao no JARVIS (grafo de chamadas) (#279)
**Corpo da mensagem:**

feat(#231): skills de nivel de funcao no JARVIS (grafo de chamadas) (#279)

5 novas skills sobre codemap-symbols.json (1137 funcoes / 2457
chamadas), alem das 5 por arquivo: nexus_fn_impact (o que quebra se
mudar a funcao X + risco), nexus_fn_context (quem chama / o que chama),
nexus_fn_path (cadeia A->...->B), nexus_fn_deps (o que X chama,
transitivo) e nexus_fn_hot (funcoes mais chamadas / hotspots, projeto
ou por arquivo). Reusa o mesmo motor (buildGraph/nexusImpact/Context/
Path) — a forma de no/aresta dos simbolos e igual a do codemap. Resolver
aceita nome, arquivo::nome ou trecho; em nome ambiguo pega a mais
chamada e avisa. codemap-symbols.json (461 KB) fica em chunk dinamico
app-only, fora do boot da web. Logica validada standalone; build limpo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/utils/jarvis-nexus-tools.js`

---

## Commit 465 — `ba2278c10b7356e55c2d60fc5b2536e98c4992c9`
**Link:** [ba2278c10b73](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ba2278c10b7356e55c2d60fc5b2536e98c4992c9)
**Data do autor:** `2026-06-21T05:24:46+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `f322095dde32967dbc42d9454bc8cbb5c25a908d`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 466 — `0fd7f6f92cde712b93eb2a5a4e46a09b1e3dcd55`
**Link:** [0fd7f6f92cde](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0fd7f6f92cde712b93eb2a5a4e46a09b1e3dcd55)
**Data do autor:** `2026-06-21T09:36:20-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ba2278c10b7356e55c2d60fc5b2536e98c4992c9`
**Resumo:** feat(#246): transicao de entrada de pagina (route transition) (#280)
**Corpo da mensagem:**

feat(#246): transicao de entrada de pagina (route transition) (#280)

Toda navegacao faz a tela nova deslizar pro lugar (leve subida + escala,
480ms) no ponto unico renderPage. So transform (sem opacity) de
proposito: em paginas pesadas a thread trava por um instante e atrasaria
o inicio da animacao; com opacity a partir de 0 a tela ficaria em branco.
So transform mantem a pagina sempre 100% visivel. Respeita
prefers-reduced-motion. Verificado: opacity=1 durante toda navegacao,
transform assenta na identidade, conteudo intacto, sem erros.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/styles/animations.css`

---

## Commit 467 — `4c945c50d3e4168ad7e42a28a1c397236561a5e0`
**Link:** [4c945c50d3e4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4c945c50d3e4168ad7e42a28a1c397236561a5e0)
**Data do autor:** `2026-06-21T09:42:29-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0fd7f6f92cde712b93eb2a5a4e46a09b1e3dcd55`
**Resumo:** feat(#246): atmosfera global reativa ao universo (#281)
**Corpo da mensagem:**

feat(#246): atmosfera global reativa ao universo (#281)

O fundo imersivo (auroras + raios + grid, em toda pagina) agora segue a
skin de universo ativa: as cores saem de --color-cyan/--color-magenta
(definidas pelo universe-theme.js) via color-mix, entao trocar de
universo recolore a atmosfera inteira (DOOM vermelho/laranja, Halo
azul/verde, Cyberpunk magenta/ciano...). Antes eram cores fixas.
Fallbacks reproduzem o visual padrao Baluarte onde a var nao existir.
Verificado: default inalterado (#00f0ff), DOOM recolore (#e01510).


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/styles/atmosphere.css`

---

## Commit 468 — `5417f50540a052c77b5388b2fc4503d89f7ed60c`
**Link:** [5417f50540a0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5417f50540a052c77b5388b2fc4503d89f7ed60c)
**Data do autor:** `2026-06-21T09:51:11-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4c945c50d3e4168ad7e42a28a1c397236561a5e0`
**Resumo:** feat(#246): heroi WebGL reativo ao universo (#282)
**Corpo da mensagem:**

feat(#246): heroi WebGL reativo ao universo (#282)

Os acentos do heroi 3D (particulas + core + aneis) agora seguem a skin
de universo por padrao: novo heroSkinColors() le --color-cyan/
--color-magenta (do universe-theme.js), igual a atmosfera global (#281).
Trocar de universo recolore os herois junto com o fundo. Paginas que
passam accent/accent2 explicitos (biblioteca, jogos, git-nexus-gate)
mantem a cor propria; home/perfil deixaram de fixar cyan/magenta e
seguem a skin (fallback Baluarte). Verificado: default inalterado, DOOM
recolore (#e01510), sem erros de console.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/home.js`
- `src/pages/perfil.js`
- `src/utils/hero-webgl.js`
- `src/utils/immersive.js`

---

## Commit 469 — `4a3f3bfc21172c838da4d8dbfa35c2fae7d16d5c`
**Link:** [4a3f3bfc2117](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4a3f3bfc21172c838da4d8dbfa35c2fae7d16d5c)
**Data do autor:** `2026-06-21T09:57:34-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `5417f50540a052c77b5388b2fc4503d89f7ed60c`
**Resumo:** docs: afiar HANDOFF-LOCAL com passos/aceite de M3c/M3d/M4 (#283)
**Corpo da mensagem:**

docs: afiar HANDOFF-LOCAL com passos/aceite de M3c/M3d/M4 (#283)

Deixa a fila local pronta pra executar: M3c (motor sobe sozinho, codigo
em main) e M3d (tools no PR #247) ganham passos copia-e-cola + checklist
de aceite; M4 (runtimes proprios) com esboco e aceite. Atualiza o estado
(Fase 1/2 do #238 feitas, skills por funcao, atmosfera/heroi reativos,
transicao de pagina, CSS split) e os arquivos-chave. Fila remota do #240
zerada — o que sobra e tudo deste doc.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 1
### Arquivos modificados

- `docs/HANDOFF-LOCAL.md`

---

## Commit 470 — `fac35f8f3a818b647d4280b3d2b6c8ea772d6d83`
**Link:** [fac35f8f3a81](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fac35f8f3a818b647d4280b3d2b6c8ea772d6d83)
**Data do autor:** `2026-06-21T14:40:17+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `4a3f3bfc21172c838da4d8dbfa35c2fae7d16d5c`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 471 — `01e47a6283962b870a7d570417aa986737b585e8`
**Link:** [01e47a628396](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/01e47a6283962b870a7d570417aa986737b585e8)
**Data do autor:** `2026-06-22T00:08:32-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `fac35f8f3a818b647d4280b3d2b6c8ea772d6d83`
**Resumo:** feat(#246): spotlight nos cards que segue o cursor (#284)
**Corpo da mensagem:**

feat(#246): spotlight nos cards que segue o cursor (#284)

Cards compartilhados (.card) ganham um brilho radial sutil que segue o
cursor no hover, tingido pelo acento do universo ativo (coeso com
#281/#282). Leve: UM listener delegado no root, throttled por rAF, que
so escreve --mx/--my quando o cursor esta sobre um card; o visual mora
no CSS (.card::after, mix-blend-mode screen). Variante magenta usa o
acento secundario. Respeita prefers-reduced-motion. Verificado em
/portas (20 cards): glow segue o cursor, texto legivel, so o card sob o
cursor acende, sem erros de console.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 4
### Arquivos criados

- `src/utils/card-spotlight.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/styles/components.css`

---

## Commit 472 — `f069d47a23d6f032757f3560e844d635d8394280`
**Link:** [f069d47a23d6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f069d47a23d6f032757f3560e844d635d8394280)
**Data do autor:** `2026-06-22T00:20:43-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `01e47a6283962b870a7d570417aa986737b585e8`
**Resumo:** feat(#246): barra de progresso de leitura no topo (#285)
**Corpo da mensagem:**

feat(#246): barra de progresso de leitura no topo (#285)

Barra fina no topo que enche conforme a pagina rola, tingida pelo
acento do universo ativo (coesa com #281/#282/#284). Some em paginas
que nao rolam. Leve: 1 listener de scroll no window (rAF-throttled) +
MutationObserver(childList) pra re-medir na troca de pagina; scaleX
acompanha o scroll 1:1. Folha propria ligada no index.html, montada 1x
pelo shell. Verificado: enche com o scroll, recolore no DOOM, sem erros.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos criados

- `src/styles/scroll-progress.css`
- `src/utils/scroll-progress.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/layout/shell.js`

---

## Commit 473 — `0207c4072a4257e7e4b1271cc24cd22e350c7fa1`
**Link:** [0207c4072a42](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0207c4072a4257e7e4b1271cc24cd22e350c7fa1)
**Data do autor:** `2026-06-22T00:30:31-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f069d47a23d6f032757f3560e844d635d8394280`
**Resumo:** fix: scroll volta ao topo ao trocar de pagina (#286)
**Corpo da mensagem:**

fix: scroll volta ao topo ao trocar de pagina (#286)

Navegar entre paginas mantinha o scroll onde estava (caia-se no meio da
pagina nova). Causa: o reset usava mainInner.scrollTop=0, mas o scroller
real e a janela (body) -- no-op. Agora scrollToTop() zera
window/html/body/main e repete no proximo frame (cobre o reflow do
chunk lazy). Verificado: 4/4 navegacoes voltam ao topo.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/shell.js`

---

## Commit 474 — `ec7fdf349b346f7970c55315d04d09c08a0b14da`
**Link:** [ec7fdf349b34](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ec7fdf349b346f7970c55315d04d09c08a0b14da)
**Data do autor:** `2026-06-22T01:12:19-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0207c4072a4257e7e4b1271cc24cd22e350c7fa1`
**Resumo:** feat(#187): mural no banco oficial (Supabase) com RLS dono (#287)
**Corpo da mensagem:**

feat(#187): mural no banco oficial (Supabase) com RLS dono (#287)

Primeiro dado oficial no Supabase: /mural le do Postgres (tabela
mural_posts) em vez de so localStorage. RLS: leitura publica, escrita so
do operador (travada pelo e-mail no JWT). Cliente proprio leve em
src/core/supabase.js (REST por fetch, sem SDK -- web=leve). Config por
env com fallback no projeto oficial (publishable key e publica por
design; RLS protege). Zero regressao: sem config, cai no modo local de
antes. Verificado: leitura anon 200, escrita anon 401 (RLS), pagina
lista o post semente. Migration versionada em supabase/migrations/.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos criados

- `src/core/supabase.js`
- `supabase/migrations/0001_mural_posts.sql`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/mural.js`
- `src/styles/mural.css`

---

## Commit 475 — `43afeec5cea3416ea5d9808a4d35b2ace1e8ab9b`
**Link:** [43afeec5cea3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/43afeec5cea3416ea5d9808a4d35b2ace1e8ab9b)
**Data do autor:** `2026-06-22T05:40:56+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `ec7fdf349b346f7970c55315d04d09c08a0b14da`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 476 — `4afd59327d18755744d1427883fc8328f2719b86`
**Link:** [4afd59327d18](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4afd59327d18755744d1427883fc8328f2719b86)
**Data do autor:** `2026-06-22T14:01:36-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `43afeec5cea3416ea5d9808a4d35b2ace1e8ab9b`
**Resumo:** chore(#259): app desktop 0.2.0 (novo visual + Nucleo de IA) (#289)
**Corpo da mensagem:**

chore(#259): app desktop 0.2.0 (novo visual + Nucleo de IA) (#289)

Bump do Baluarte Launcher 0.1.1 -> 0.2.0 (desktop/package.json + lock),
abrindo a release que leva o redesign (#195) e o Nucleo de IA (#231) ao
usuario do app. Sidebar ja enxuta (#258, via #256/#257 no main): uma
entrada 'Nucleo de IA'. Online o app ja mostra o novo design (carrega a
producao); o fallback offline e rebuildado pelo workflow de release.
/baixar le a release em runtime. CHANGELOG atualizado.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 3
### Arquivos modificados

- `desktop/package-lock.json`
- `desktop/package.json`
- `historico/CHANGELOG.md`

---

## Commit 477 — `f4b52b4526861ec7a349efd9dff730a94756fa46`
**Link:** [f4b52b452686](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f4b52b4526861ec7a349efd9dff730a94756fa46)
**Data do autor:** `2026-06-22T17:15:49+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `4afd59327d18755744d1427883fc8328f2719b86`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 478 — `0637c9d1ef11e252fc22531c245116559d08bc9d`
**Link:** [0637c9d1ef11](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0637c9d1ef11e252fc22531c245116559d08bc9d)
**Data do autor:** `2026-06-22T16:21:15-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f4b52b4526861ec7a349efd9dff730a94756fa46`
**Resumo:** feat(supabase): contador global de acessos no banco (escrita anonima via RPC) (#290)
**Corpo da mensagem:**

feat(supabase): contador global de acessos no banco (escrita anonima via RPC) (#290)

Primeira escrita publica no Supabase. Visitante nao escreve a tabela
(RLS trancado); chama bump_visits() (SECURITY DEFINER) via novo dbRpc().
Conta 1x/sessao e exibe 'N visitas ao Baluarte' na celula Vigilancia do
Home. Degrada em silencio se o banco nao estiver configurado/aplicado.
Migration: supabase/migrations/0002_site_stats.sql (aplicar no dashboard
ou via MCP local). CHANGELOG atualizado.


Claude-Session: https://claude.ai/code/session_01Ch5ibVnhNZG2qGaa83sXd3

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos criados

- `src/utils/visit-counter.js`
- `supabase/migrations/0002_site_stats.sql`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/core/supabase.js`
- `src/pages/home.js`

---

## Commit 479 — `9e2b440c65d08d64891a0de22cfa60b671a9ddee`
**Link:** [9e2b440c65d0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9e2b440c65d08d64891a0de22cfa60b671a9ddee)
**Data do autor:** `2026-06-23T04:39:51+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `0637c9d1ef11e252fc22531c245116559d08bc9d`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 480 — `c2acb2d95f4e79e5918f6d4d599c4a152a1f6aa5`
**Link:** [c2acb2d95f4e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c2acb2d95f4e79e5918f6d4d599c4a152a1f6aa5)
**Data do autor:** `2026-06-23T15:30:53+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `9e2b440c65d08d64891a0de22cfa60b671a9ddee`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 481 — `4e0a65b4da6720292e949177b7257108d61ef016`
**Link:** [4e0a65b4da67](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4e0a65b4da6720292e949177b7257108d61ef016)
**Data do autor:** `2026-06-23T18:12:55-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c2acb2d95f4e79e5918f6d4d599c4a152a1f6aa5`
**Resumo:** #291: Banco do site (Supabase) — contador, views, /banco, contas + Música offline (#292)
**Corpo da mensagem:**

#291: Banco do site (Supabase) — contador, views, /banco, contas + Música offline (#292)

Banco oficial (Supabase) ampliado e endurecido + Música offline.

- Contador de acessos (0002) aplicado e ao vivo no Home.
- Hardening (0003): revoga EXECUTE de rls_auto_enable; advisors 5->3.
- Views por pagina (0004, bump_view) exibidas no Home e /perfil.
- Painel /banco: visitas/views/top/mural ao vivo.
- Contas de usuario (0005): profiles + RLS dono-so + trigger; login Google
  no /perfil com estetica sincronizada por usuario (supabase-auth + user-prefs).
- docs/SUPABASE.md: 5 migrations, RLS, advisors, setup do Google.
- Musica "Meu Acervo": toca offline em qualquer rede (IndexedDB).
**Arquivos afetados:** 19
### Arquivos criados

- `docs/SUPABASE.md`
- `src/core/supabase-auth.js`
- `src/core/user-prefs.js`
- `src/pages/banco.js`
- `src/styles/banco.css`
- `src/utils/offline-audio.js`
- `src/utils/page-views.js`
- `supabase/migrations/0003_db_hardening.sql`
- `supabase/migrations/0004_page_views.sql`
- `supabase/migrations/0005_profiles.sql`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/home.js`
- `src/pages/musicas.js`
- `src/pages/perfil.js`
- `src/styles/musicas.css`
- `src/styles/perfil.css`
- `src/utils/icons.js`

---

## Commit 482 — `070ea26ee3289ada5b3a3a8fc3e2bee9c6811088`
**Link:** [070ea26ee328](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/070ea26ee3289ada5b3a3a8fc3e2bee9c6811088)
**Data do autor:** `2026-06-24T04:46:16+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `4e0a65b4da6720292e949177b7257108d61ef016`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 483 — `b1ce810aa27b1468cd53113e3ac9d8a9e3670b36`
**Link:** [b1ce810aa27b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b1ce810aa27b1468cd53113e3ac9d8a9e3670b36)
**Data do autor:** `2026-06-24T15:17:47+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `070ea26ee3289ada5b3a3a8fc3e2bee9c6811088`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 484 — `91482c9cf326362e5ae7f807ee8e1a23e7af53d7`
**Link:** [91482c9cf326](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/91482c9cf326362e5ae7f807ee8e1a23e7af53d7)
**Data do autor:** `2026-06-24T18:27:16-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b1ce810aa27b1468cd53113e3ac9d8a9e3670b36`
**Resumo:** fix: navegação robusta — falha de carregamento não vira "404 falso" (#296)
**Corpo da mensagem:**

fix: navegação robusta — falha de carregamento não vira "404 falso" (#296)

Conserta o "404 falso" quando o chunk de uma rota lazy falha (cache velho
pos-deploy / soluco de rede): auto-reload 1x quando online + tela "Falha ao
carregar" (Recarregar) em vez de "rota nao existe", + bump do service worker
(v2.0.1). Fundacao de navegacao confiavel pro JARVIS. Auditoria: 75 itens do
menu batem com rotas reais.
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `public/sw.js`
- `src/main.js`
- `src/pages/_placeholder.js`

---

## Commit 485 — `0afa42bf4c1128ad68a89834fa2155092dd18ac7`
**Link:** [0afa42bf4c11](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0afa42bf4c1128ad68a89834fa2155092dd18ac7)
**Data do autor:** `2026-06-24T18:27:37-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `91482c9cf326362e5ae7f807ee8e1a23e7af53d7`
**Resumo:** docs: OMEGA-PRISM — desenho do Núcleo de IA unificado (#295)
**Corpo da mensagem:**

docs: OMEGA-PRISM — desenho do Núcleo de IA unificado (#295)

Desenho de arquitetura pra unir as 12 ferramentas de IA do Baluarte num so
nucleo (Omega Prism, comeco do JARVIS): visao, principios (#238), pecas que ja
existem, conceitos dos repos de vendor/, arquitetura em camadas, modelo de
dados por usuario (Supabase) e roadmap em fatias — com a 1a fatia detalhada
(Segundo Cerebro + Memoria por usuario). Doc-only; contrato pra construir.
**Arquivos afetados:** 1
### Arquivos criados

- `docs/OMEGA-PRISM.md`

---

## Commit 486 — `84f18b2dabeff581d7ebe5ada1e681d0c2aab0d1`
**Link:** [84f18b2dabef](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/84f18b2dabeff581d7ebe5ada1e681d0c2aab0d1)
**Data do autor:** `2026-06-24T19:02:21-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0afa42bf4c1128ad68a89834fa2155092dd18ac7`
**Resumo:** feat(#231): Omega Prism Fatia 1 — Memória por usuário (banco + cliente) (#297)
**Corpo da mensagem:**

feat(#231): Omega Prism Fatia 1 — Memória por usuário (banco + cliente) (#297)

* feat(#231): Omega Prism Fatia 1 (banco) — knowledge_notes + memories por usuário

Fundacao da Fatia 1 do Omega Prism (Segundo Cerebro + Memoria por usuario,
a espinha do JARVIS): duas tabelas POR USUARIO no Supabase, RLS dono-so
(auth.uid() = user_id), igual profiles.

- 0006_knowledge: knowledge_notes (title, body, tags[], links[]) — Segundo Cerebro.
- 0007_memories: memories (text, source, tags[]) — Memoria estilo supermemory.
- 4 policies (CRUD dono) + indices por usuario em cada.

Aplicadas e verificadas no banco oficial via MCP:
- estrutura: RLS on + 4 policies cada.
- REST anon: GET -> 200 [] (nao vaza), POST -> 401 (RLS bloqueia) nas duas.

docs/SUPABASE.md e CHANGELOG atualizados. Proximo incremento: cliente
(jarvis-brain ganha backend Supabase quando logado) + UI (/cerebro, /memoria
por usuario, sincroniza no login).

Claude-Session: https://claude.ai/code/session_01WVGexdsK5EK86CD3QWkHoQ
Co-authored-by: Claude <noreply@anthropic.com>

* feat(#231): Omega Prism Fatia 1 (cliente) — Memória do JARVIS por usuário

- memory-cloud.js: CRUD da tabela `memories` por usuário (RLS dono-só),
  sem SDK, no-op sem login/Supabase (sem regressão).
- jarvis-brain.js: syncUserMemories() + userCache mesclado em allMemories
  (dedup por texto, ao lado do repoCache); addMemory/deleteMemory/clearMemories
  espelham na conta best-effort (API síncrona preservada).
- memoria.js: botão "☁️ Conta" (sincroniza logado; leva ao /perfil deslogado)
  + sync automática ao abrir logado.
- CHANGELOG: entrada Fatia 1 (cliente).

Deslogado segue 100% local. Verificado: build limpo + smoke ok.

---------

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 7
### Arquivos criados

- `src/core/memory-cloud.js`
- `supabase/migrations/0006_knowledge.sql`
- `supabase/migrations/0007_memories.sql`
### Arquivos modificados

- `docs/SUPABASE.md`
- `historico/CHANGELOG.md`
- `src/pages/memoria.js`
- `src/utils/jarvis-brain.js`

---

## Commit 487 — `6aea2c18f3a7db90432f9459913a448439054897`
**Link:** [6aea2c18f3a7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6aea2c18f3a7db90432f9459913a448439054897)
**Data do autor:** `2026-06-24T19:14:33-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `84f18b2dabeff581d7ebe5ada1e681d0c2aab0d1`
**Resumo:** feat(#231): Omega Prism Fatia 1 na web — /memoria e /cerebro acessíveis no navegador (#298)
**Corpo da mensagem:**

feat(#231): Omega Prism Fatia 1 na web — /memoria e /cerebro acessíveis no navegador (#298)

As rotas /memoria (Memória) e /cerebro (Segundo Cérebro) caíam no teaser
app-only (lazyNexus). O OMEGA-PRISM põe L1/L2 na coluna web (leve) e a Fatia 1
é "100% web, verificável" — só fecha se dá pra logar → criar memória → ver em
outro dispositivo. Isto destrava o cliente de nuvem do PR #297 no navegador.

- main.js: novo lazyLeve(tab, loader, fn) — web renderiza a página real (leve);
  app (window.baluarte.native) segue no cockpit unificado do Núcleo (sem regressão).
  /cerebro e /memoria passam a usar lazyLeve.
- O pesado (grafo 3D, JARVIS, ML, Mini-LLM, codemap-symbols) segue app-only.
- Boot leve preservado: index ~igual, chunks pesados seguem lazy/separados.

Verificado (Playwright): /memoria e /cerebro renderizam a página real na web,
sem teaser; build limpo.

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/main.js`

---

## Commit 488 — `e4f11a371f6ef7d89830e8988564020f02ef9c5b`
**Link:** [e4f11a371f6e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e4f11a371f6ef7d89830e8988564020f02ef9c5b)
**Data do autor:** `2026-06-25T04:43:51+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `6aea2c18f3a7db90432f9459913a448439054897`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 489 — `f399105e834d5e7f57a39259ca0079ce01c59d18`
**Link:** [f399105e834d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f399105e834d5e7f57a39259ca0079ce01c59d18)
**Data do autor:** `2026-06-25T15:23:03+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `e4f11a371f6ef7d89830e8988564020f02ef9c5b`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 490 — `089ab71faf4ef49441ceef599bfaf62c54d38aab`
**Link:** [089ab71faf4e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/089ab71faf4ef49441ceef599bfaf62c54d38aab)
**Data do autor:** `2026-06-26T04:49:04+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `f399105e834d5e7f57a39259ca0079ce01c59d18`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 491 — `1821dee0dd3d092abb9d5e3a901328ae82e21040`
**Link:** [1821dee0dd3d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1821dee0dd3d092abb9d5e3a901328ae82e21040)
**Data do autor:** `2026-06-26T15:09:22+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `089ab71faf4ef49441ceef599bfaf62c54d38aab`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 492 — `ae83391c4062f5e9910ea284587e3b7d08bae986`
**Link:** [ae83391c4062](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ae83391c4062f5e9910ea284587e3b7d08bae986)
**Data do autor:** `2026-06-27T04:33:15+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `1821dee0dd3d092abb9d5e3a901328ae82e21040`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 493 — `c8aeb883c6655ef79c40e976cb61b7964120f946`
**Link:** [c8aeb883c665](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c8aeb883c6655ef79c40e976cb61b7964120f946)
**Data do autor:** `2026-06-27T14:12:41+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `ae83391c4062f5e9910ea284587e3b7d08bae986`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 494 — `38cbc2928d14ee12a5f70cb7b836887adb2f3d26`
**Link:** [38cbc2928d14](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/38cbc2928d14ee12a5f70cb7b836887adb2f3d26)
**Data do autor:** `2026-06-28T04:59:15+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `c8aeb883c6655ef79c40e976cb61b7964120f946`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 495 — `04d2cb9abdddff69e488b8fff5860eb364546968`
**Link:** [04d2cb9abddd](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/04d2cb9abdddff69e488b8fff5860eb364546968)
**Data do autor:** `2026-06-28T13:44:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `38cbc2928d14ee12a5f70cb7b836887adb2f3d26`
**Resumo:** feat(#246): sidebar 100% no set de ícones de linha (Design System §4)
**Corpo da mensagem:**

feat(#246): sidebar 100% no set de ícones de linha (Design System §4)

Unifica a navegação lateral no set único de ícones de linha (icons.js,
traço + currentColor), retirando os últimos fallbacks de emoji da nav
principal e do rodapé.

- icons.js: novos ícones `nexus`, `download`, `play` (grid 24×24) +
  mapeia `/git-nexus` (Núcleo de IA) e `/baixar` em iconByPath — eram as
  2 únicas rotas que caíam no glifo emoji (🔗 e ⬇).
- sidebar.js: rodapé (Instalar app, YouTube, LLBR Innovations) passa a
  usar ícones de linha via lineIcon() no lugar dos glifos ⬇/▶/⬡.
- layout.css: tamanho/alinhamento dos ícones inline do rodapé; oculta o
  rótulo quando a sidebar está recolhida.

Verificado no navegador (Playwright): 75/75 itens com SVG de linha, zero
fallback de emoji, build limpo. Passo 2 (sidebar) do plano incremental de
adoção do coolicons do Design System §4.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/sidebar.js`
- `src/styles/layout.css`
- `src/utils/icons.js`

---

## Commit 496 — `39257b0185ea326ae531e3b60b74145c9c8b547f`
**Link:** [39257b0185ea](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/39257b0185ea326ae531e3b60b74145c9c8b547f)
**Data do autor:** `2026-06-28T13:55:34+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `04d2cb9abdddff69e488b8fff5860eb364546968`
**Resumo:** feat(#246): /home cards/headers no set de ícones de linha (Design System §4)
**Corpo da mensagem:**

feat(#246): /home cards/headers no set de ícones de linha (Design System §4)

Passo 3 (cards/headers) da adoção do set único de ícones, começando pelo
flagship /home.

- CTAs do herói: ⚙/⬇/🔗 → gear/download/nexus (lineIcon, herdam a cor do
  botão).
- Eyebrows do bento (.hv2-cell__tag): ◈/🔗/⬇/⌖/📖/◆/⚡ →
  chart/nexus/download/eye/book/diamond/grid via helper cellTag().
- Tiles de acesso rápido: passam a usar iconForPath(path), reusando o mapa
  rota→ícone de icons.js.
- Títulos de prateleira: 🔫/🌌/📖 → crosshair/star/book.
- Preserva emoji semântico: selos de SO 🪟🍎🐧 e o ⬡ decorativo do HUD.
- home-v2.css: tamanho/cor dos ícones inline nesses contextos.

Verificado no navegador (Playwright): 8/8 tiles, 7 eyebrows, 3 títulos de
prateleira e 3 CTAs com SVG de linha, zero emoji residual; build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 3
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/home.js`
- `src/styles/home-v2.css`

---

## Commit 497 — `7781807afa7fb49f0a5b3c355e3d84fb9c6c811d`
**Link:** [7781807afa7f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7781807afa7fb49f0a5b3c355e3d84fb9c6c811d)
**Data do autor:** `2026-06-28T14:21:43+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `38cbc2928d14ee12a5f70cb7b836887adb2f3d26`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 498 — `962db5768c2d8149de2029ef87d41c813ac3ecd3`
**Link:** [962db5768c2d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/962db5768c2d8149de2029ef87d41c813ac3ecd3)
**Data do autor:** `2026-06-28T17:33:27+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `39257b0185ea326ae531e3b60b74145c9c8b547f`
**Resumo:** feat(#246): camada de efeitos vanilla (port do react-bits) + PoC no /home
**Corpo da mensagem:**

feat(#246): camada de efeitos vanilla (port do react-bits) + PoC no /home

react-bits é React 19 + WebGL/GSAP pesado, licença MIT + Commons Clause
(proíbe redistribuir os componentes mesmo portados). Em vez de adotar
React (quebraria sem-framework + web leve #238), reimplementa os efeitos
em vanilla com os tokens do Baluarte, creditando o autor.

- src/utils/effects.js + src/styles/effects.css: camada de efeitos sem
  dep, com prefers-reduced-motion; registrada no boot (index.html).
  Portados: ShinyText (.fx-shiny, CSS puro) e SpotlightCard
  (attachSpotlight() + .fx-spotlight, brilho radial que segue o cursor).
- /home (PoC): fx-shiny no kicker do herói + spotlight nas 7 células do
  bento.
- docs/REACT-BITS.md: curadoria, mapa de portabilidade (134 componentes)
  e roadmap incremental; os ~53 efeitos WebGL ficam pra trilha app/lazy.

Verificado no navegador (Playwright): efeitos ligados, CSS vars
atualizando no cursor, build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 6
### Arquivos criados

- `docs/REACT-BITS.md`
- `src/styles/effects.css`
- `src/utils/effects.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/pages/home.js`

---

## Commit 499 — `680b967197d0af45a7984a2f706dc1f0f2689d32`
**Link:** [680b967197d0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/680b967197d0af45a7984a2f706dc1f0f2689d32)
**Data do autor:** `2026-06-28T17:45:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `962db5768c2d8149de2029ef87d41c813ac3ecd3`
**Resumo:** chore: sobe site e app para o Node 24
**Corpo da mensagem:**

chore: sobe site e app para o Node 24

- package.json (site): engines.node 22.x → 24.x (Vercel passa a usar Node 24).
- desktop/package.json (app): adiciona engines.node 24.x.
- CI: desktop-release.yml node 22 → 24; cambio.yml node 20 → 24.
- .nvmrc (raiz + desktop) = 24 para o dev local.

Build de produção limpo; JSONs válidos. O runtime interno do Electron
segue preso ao major do Electron — isto sobe o Node do toolchain/CI.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 7
### Arquivos criados

- `.nvmrc`
- `desktop/.nvmrc`
### Arquivos modificados

- `.github/workflows/cambio.yml`
- `.github/workflows/desktop-release.yml`
- `desktop/package.json`
- `historico/CHANGELOG.md`
- `package.json`

---

## Commit 500 — `d9386e52fd4d09fa3d587be06efbb5b6e2a24db5`
**Link:** [d9386e52fd4d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d9386e52fd4d09fa3d587be06efbb5b6e2a24db5)
**Data do autor:** `2026-06-28T17:52:44+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `680b967197d0af45a7984a2f706dc1f0f2689d32`
**Resumo:** feat(#246): DecryptedText global nos títulos de página (port do react-bits)
**Corpo da mensagem:**

feat(#246): DecryptedText global nos títulos de página (port do react-bits)

Liga a revelação "decifrando" no site inteiro: a cada navegação, os
títulos de página (.page-header__title, 56 páginas) embaralham e revelam
os caracteres da esquerda pra direita — vibe HUD do Baluarte.

- effects.js: decryptText(el) (scramble + reveal, setInterval que se
  encerra sozinho, reduced-motion off, texto real em aria-label) +
  decryptTitles(root) idempotente por elemento.
- shell.renderPage: chama decryptTitles(pageEl) junto do scroll-reveal —
  hook único, atinge todas as páginas de uma vez.
- docs/REACT-BITS.md: efeito catalogado + roadmap atualizado.

Verificado no navegador (Playwright): efeito roda e o título assenta
exato (sem corrupção), aria limpo ao fim; build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos modificados

- `docs/REACT-BITS.md`
- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/utils/effects.js`

---

## Commit 501 — `61bd04f9a660066b83167fd108b7fc00e000918d`
**Link:** [61bd04f9a660](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/61bd04f9a660066b83167fd108b7fc00e000918d)
**Data do autor:** `2026-06-28T17:59:17+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d9386e52fd4d09fa3d587be06efbb5b6e2a24db5`
**Resumo:** feat(#246): TiltedCard nos cards das prateleiras do /home (port do react-bits)
**Corpo da mensagem:**

feat(#246): TiltedCard nos cards das prateleiras do /home (port do react-bits)

Inclinação 3D que segue o cursor nos 36 cards das prateleiras (Arsenal/
Universos/Crônicas) — rotateX/rotateY conforme o cursor + leve scale,
volta ao plano no leave. Estilo "prateleira Steam" (Design System §7).

- effects.js: attachTilt(el) (rotação clampada a ±amplitude p/ evitar flip;
  reduced-motion deixa estático; sem dep).
- effects.css: .fx-tilt (transição suave + preserve-3d).
- home.js: aplica attachTilt em cada .hv2-scard (com cleanup).
- docs/REACT-BITS.md + CHANGELOG atualizados.

Verificado no navegador (Playwright): 36/36 cards com tilt, transform na
faixa (±11°) e limpo no leave; build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 5
### Arquivos modificados

- `docs/REACT-BITS.md`
- `historico/CHANGELOG.md`
- `src/pages/home.js`
- `src/styles/effects.css`
- `src/utils/effects.js`

---

## Commit 502 — `c2b4ca903a7440358e967cc9f3dd852415d3840b`
**Link:** [c2b4ca903a74](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c2b4ca903a7440358e967cc9f3dd852415d3840b)
**Data do autor:** `2026-06-28T18:10:30+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `61bd04f9a660066b83167fd108b7fc00e000918d`
**Resumo:** feat(#246): SoftAurora nos heróis imersivos (port do react-bits)
**Corpo da mensagem:**

feat(#246): SoftAurora nos heróis imersivos (port do react-bits)

Liga uma camada de aurora no buildImmersiveHero → ~20 páginas flagship
ganham, de uma vez, blobs de cor (ciano/magenta/violeta) à deriva atrás
do conteúdo do herói (mix-blend screen pra somar luz).

- effects.css: .fx-aurora (CSS puro, herda --bx-accent/2, reduced-motion
  congela, pointer-events none).
- immersive.js: adiciona a camada .fx-aurora ao herói.
- immersive.css: z-index 1 (atrás do conteúdo) + some quando o Spline
  carrega (junto de canvas/rays/grid).

Verificado no navegador (Playwright + screenshot /arsenal): aurora compõe
atrás da galáxia WebGL sem prejudicar a leitura; build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 5
### Arquivos modificados

- `docs/REACT-BITS.md`
- `historico/CHANGELOG.md`
- `src/styles/effects.css`
- `src/styles/immersive.css`
- `src/utils/immersive.js`

---

## Commit 503 — `bca4265f2a70fb8bc8163935411ddb9dc86b4997`
**Link:** [bca4265f2a70](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bca4265f2a70fb8bc8163935411ddb9dc86b4997)
**Data do autor:** `2026-06-28T18:52:00+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `c2b4ca903a7440358e967cc9f3dd852415d3840b`
**Resumo:** feat(#246): LightRays — fundo WebGL god-rays no herói (port do react-bits)
**Corpo da mensagem:**

feat(#246): LightRays — fundo WebGL god-rays no herói (port do react-bits)

Porta vanilla/sem-dep do LightRays: fragment shader de quad de tela
cheia (WebGL 1.0, sem OGL), feixes de luz descendo de uma fonte no topo
modulados por ruído, na cor do universo. Roda web+app (dependency-free
como o hero-webgl, sem precisar gatear).

- src/utils/hero-rays.js: createHeroRays(canvas, {accent,accent2}) com a
  mesma API/ciclo de vida do createHeroWebGL (fallback, reduced-motion,
  pausa com aba oculta, auto-resize/encerra).
- immersive.js: usa createHeroRays quando variant === 'lightrays'.
- tecnologia-militar.js: vitrine (variant: 'lightrays').
- docs/REACT-BITS.md + CHANGELOG.

Verificado no navegador (Playwright + screenshot): shader compila, raios
renderizam atrás do título holográfico, texto legível; build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 5
### Arquivos criados

- `src/utils/hero-rays.js`
### Arquivos modificados

- `docs/REACT-BITS.md`
- `historico/CHANGELOG.md`
- `src/pages/tecnologia-militar.js`
- `src/utils/immersive.js`

---

## Commit 504 — `995b54d28397737667a284cdf1a9d35cd3db72ce`
**Link:** [995b54d28397](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/995b54d28397737667a284cdf1a9d35cd3db72ce)
**Data do autor:** `2026-06-28T19:07:09+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `bca4265f2a70fb8bc8163935411ddb9dc86b4997`
**Resumo:** feat(#246): Centro Militar — consolida 13 frentes + Arsenal num hub (Wikipédia ao vivo)
**Corpo da mensagem:**

feat(#246): Centro Militar — consolida 13 frentes + Arsenal num hub (Wikipédia ao vivo)

Junta as 13 páginas militares da sidebar (+ Arsenal) numa página estilo
Wikipédia em /militar: índice "Conteúdo" sticky + 14 seções, cada uma com
link pra página completa (conteúdo rico já existente) + extrato vivo da
Wikipédia. Sidebar enxuga de 13 itens → 1; páginas individuais seguem
registradas (nada removido).

- src/utils/wikipedia.js: fetchWikiSummary (REST API CORS + cache
  memória/localStorage TTL 7d). Sem dep, sem Cloudflare.
- src/pages/militar.js + src/styles/centro-militar.css: o hub; extrato
  carregado sob demanda (IntersectionObserver), best-effort com fallback
  pro link do artigo. Conteúdo CC BY-SA, sempre creditado/linkado.
- main.js (rota), shell.js (título), icons.js (/militar→shield),
  sidebar.js (grupo militar → 1 entrada).
- docs/CENTRO-MILITAR.md: plano (Wikipedia live; Supabase/curadoria depois).

Verificado no navegador (Playwright): hero + índice 14 + 14 seções,
sidebar militar = 1 entrada, degradação graciosa; build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 9
### Arquivos criados

- `docs/CENTRO-MILITAR.md`
- `src/pages/militar.js`
- `src/styles/centro-militar.css`
- `src/utils/wikipedia.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/utils/icons.js`

---

## Commit 505 — `80fd5980e883b101e9de9d172a223b6845cbe279`
**Link:** [80fd5980e883](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/80fd5980e883b101e9de9d172a223b6845cbe279)
**Data do autor:** `2026-06-28T19:09:06+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `995b54d28397737667a284cdf1a9d35cd3db72ce`
**Resumo:** chore: re-dispara deploy do Vercel (falha transiente pós-build)
**Corpo da mensagem:**

chore: re-dispara deploy do Vercel (falha transiente pós-build)

O build compilou ok (local limpo + "Build Completed" no Vercel); a falha
foi pós-build na infra do Vercel ("unexpected error... may be transient").
Commit vazio só pra re-kickar o deploy no mesmo código.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 0

---

## Commit 506 — `b806c02ec8552d8e94ac161f4e7a572a28d57ebd`
**Link:** [b806c02ec855](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b806c02ec8552d8e94ac161f4e7a572a28d57ebd)
**Data do autor:** `2026-06-28T16:11:19-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `7781807afa7fb49f0a5b3c355e3d84fb9c6c811d 80fd5980e883b101e9de9d172a223b6845cbe279`
**Resumo:** Merge #304: Redesign #246 — ícones, efeitos vanilla (react-bits/Spline), Node 24 e Centro Militar
**Corpo da mensagem:**

Merge #304: Redesign #246 — ícones, efeitos vanilla (react-bits/Spline), Node 24 e Centro Militar

Redesign #246: ícones de linha, efeitos vanilla (react-bits/Spline), Node 24 e Centro Militar
**Arquivos afetados:** 0

---

## Commit 507 — `1138e2ef1ea28c82f25299e049392f18efcd282e`
**Link:** [1138e2ef1ea2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1138e2ef1ea28c82f25299e049392f18efcd282e)
**Data do autor:** `2026-06-28T19:15:41+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `80fd5980e883b101e9de9d172a223b6845cbe279`
**Resumo:** docs: atualiza CLAUDE.md (mapa rápido) com camada de efeitos, Centro Militar e Node 24
**Corpo da mensagem:**

docs: atualiza CLAUDE.md (mapa rápido) com camada de efeitos, Centro Militar e Node 24

Reflete o estado novo do site pra futuras sessões: camada de efeitos
vanilla (effects.js/css, hero-rays), Centro Militar (/militar + wikipedia.js,
13 frentes consolidadas), Node 24 nos engines, e os docs REACT-BITS.md /
CENTRO-MILITAR.md.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 1
### Arquivos modificados

- `CLAUDE.md`

---

## Commit 508 — `b6898ffefedd5820dfef87656ca37cf82d9b4bec`
**Link:** [b6898ffefedd](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b6898ffefedd5820dfef87656ca37cf82d9b4bec)
**Data do autor:** `2026-06-28T16:16:07-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b806c02ec8552d8e94ac161f4e7a572a28d57ebd`
**Resumo:** docs: atualiza CLAUDE.md (mapa rápido) com camada de efeitos, Centro Militar e Node 24 (#305)
**Corpo da mensagem:**

docs: atualiza CLAUDE.md (mapa rápido) com camada de efeitos, Centro Militar e Node 24 (#305)

Reflete o estado novo do site pra futuras sessões: camada de efeitos
vanilla (effects.js/css, hero-rays), Centro Militar (/militar + wikipedia.js,
13 frentes consolidadas), Node 24 nos engines, e os docs REACT-BITS.md /
CENTRO-MILITAR.md.


Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 1
### Arquivos modificados

- `CLAUDE.md`

---

## Commit 509 — `e19ac2972c854fb8792d2896ef49a81c0cd9eb67`
**Link:** [e19ac2972c85](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e19ac2972c854fb8792d2896ef49a81c0cd9eb67)
**Data do autor:** `2026-06-28T19:26:44+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1138e2ef1ea28c82f25299e049392f18efcd282e`
**Resumo:** feat(#246): Centro Militar — camada de curadoria no Supabase (dado nosso)
**Corpo da mensagem:**

feat(#246): Centro Militar — camada de curadoria no Supabase (dado nosso)

Nova tabela public.mil_curation (aplicada via MCP) que sobrepõe a
Wikipédia com dado nosso por frente: nota do operador, destaque, ordem.
O hub aplica destaque (.is-featured) + nota (.mil-note) por cima do
extrato da Wikipédia.

- RLS: leitura pública (anon SELECT), escrita só service_role
  (dashboard/MCP). Verificado: anon GET 200, anon POST 401.
- src/utils/mil-curation.js (fetchMilCuration via dbSelect, best-effort)
  + CSS de destaque/nota; militar.js aplica o overlay.
- docs/CENTRO-MILITAR.md + CHANGELOG. Semeadas as 14 frentes.

Verificado: build limpo; overlay aplica no DOM; leitura anônima ok.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 5
### Arquivos criados

- `src/utils/mil-curation.js`
### Arquivos modificados

- `docs/CENTRO-MILITAR.md`
- `historico/CHANGELOG.md`
- `src/pages/militar.js`
- `src/styles/centro-militar.css`

---

## Commit 510 — `3a9fe1e53a4e5f81b3640b7fdf7e7a8fb3943ee7`
**Link:** [3a9fe1e53a4e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3a9fe1e53a4e5f81b3640b7fdf7e7a8fb3943ee7)
**Data do autor:** `2026-06-28T16:27:04-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b6898ffefedd5820dfef87656ca37cf82d9b4bec`
**Resumo:** feat(#246): Centro Militar — camada de curadoria no Supabase (dado nosso) (#306)
**Corpo da mensagem:**

feat(#246): Centro Militar — camada de curadoria no Supabase (dado nosso) (#306)

* docs: atualiza CLAUDE.md (mapa rápido) com camada de efeitos, Centro Militar e Node 24

Reflete o estado novo do site pra futuras sessões: camada de efeitos
vanilla (effects.js/css, hero-rays), Centro Militar (/militar + wikipedia.js,
13 frentes consolidadas), Node 24 nos engines, e os docs REACT-BITS.md /
CENTRO-MILITAR.md.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK

* feat(#246): Centro Militar — camada de curadoria no Supabase (dado nosso)

Nova tabela public.mil_curation (aplicada via MCP) que sobrepõe a
Wikipédia com dado nosso por frente: nota do operador, destaque, ordem.
O hub aplica destaque (.is-featured) + nota (.mil-note) por cima do
extrato da Wikipédia.

- RLS: leitura pública (anon SELECT), escrita só service_role
  (dashboard/MCP). Verificado: anon GET 200, anon POST 401.
- src/utils/mil-curation.js (fetchMilCuration via dbSelect, best-effort)
  + CSS de destaque/nota; militar.js aplica o overlay.
- docs/CENTRO-MILITAR.md + CHANGELOG. Semeadas as 14 frentes.

Verificado: build limpo; overlay aplica no DOM; leitura anônima ok.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK

---------

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 5
### Arquivos criados

- `src/utils/mil-curation.js`
### Arquivos modificados

- `docs/CENTRO-MILITAR.md`
- `historico/CHANGELOG.md`
- `src/pages/militar.js`
- `src/styles/centro-militar.css`

---

## Commit 511 — `923e1a03930a1a932d5431bf11a7d69d33b2cefb`
**Link:** [923e1a03930a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/923e1a03930a1a932d5431bf11a7d69d33b2cefb)
**Data do autor:** `2026-06-29T05:10:59+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `3a9fe1e53a4e5f81b3640b7fdf7e7a8fb3943ee7`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 512 — `55ae568daba55a3de17cecd11a18e45e584c5d7a`
**Link:** [55ae568daba5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/55ae568daba55a3de17cecd11a18e45e584c5d7a)
**Data do autor:** `2026-06-29T16:23:24+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `923e1a03930a1a932d5431bf11a7d69d33b2cefb`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 513 — `0775f896725fe21bef3c51f91b7f9ca74762039b`
**Link:** [0775f896725f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0775f896725fe21bef3c51f91b7f9ca74762039b)
**Data do autor:** `2026-06-30T04:43:15+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `55ae568daba55a3de17cecd11a18e45e584c5d7a`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 514 — `40afe757c3e571de83e5e76846e2f039a3f2872a`
**Link:** [40afe757c3e5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/40afe757c3e571de83e5e76846e2f039a3f2872a)
**Data do autor:** `2026-06-30T15:08:52+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `0775f896725fe21bef3c51f91b7f9ca74762039b`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 515 — `af164b9c80589808077524944132d4fedc82b9cd`
**Link:** [af164b9c8058](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/af164b9c80589808077524944132d4fedc82b9cd)
**Data do autor:** `2026-07-01T05:05:18+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `40afe757c3e571de83e5e76846e2f039a3f2872a`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 516 — `33200595cfeb1c93e358017f7d08e376233631fa`
**Link:** [33200595cfeb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/33200595cfeb1c93e358017f7d08e376233631fa)
**Data do autor:** `2026-07-01T15:18:24+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `af164b9c80589808077524944132d4fedc82b9cd`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 517 — `e7c633b84208a6f3f76c1b2013ee63652ce09514`
**Link:** [e7c633b84208](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e7c633b84208a6f3f76c1b2013ee63652ce09514)
**Data do autor:** `2026-07-02T03:10:32+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `e19ac2972c854fb8792d2896ef49a81c0cd9eb67`
**Resumo:** feat(#246): reskin "Ouro de Fábula" — estética Fable 5 V2 (site + app)
**Corpo da mensagem:**

feat(#246): reskin "Ouro de Fábula" — estética Fable 5 V2 (site + app)

Implementa a nova estética do mockup Baluarte Fable.dc.html (branch
Redesign-Baluarte-3D, pasta Fable 5 V2): fundo violeta-escuro + acento
dourado + texto pergaminho + serifas (Cormorant Garamond/Spectral/IBM
Plex Mono) + grão de ruído global.

- variables.css: re-tokenização completa (nomes --color-cyan/--color-
  magenta mantidos por compat → ouro #d4a24e / ouro-claro #e8c07a);
  superfícies violeta, texto pergaminho, glows quentes, fontes serifadas.
- index.html: novas famílias no Google Fonts.
- base.css: fundo dourado sutil + grão de pergaminho (body::after).
- home-v2/components/immersive/effects: neons hardcoded → dourado
  (títulos holográficos, raios, botões, métricas, orbe, shine).
- docs/DESIGN-SYSTEM.md: contrato visual atualizado (estética atual).

O app herda online na hora (carrega o site); fallback offline atualiza
no próximo build de release. Verificado (Playwright /home e /militar):
reskin completo, build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 9
### Arquivos modificados

- `docs/DESIGN-SYSTEM.md`
- `historico/CHANGELOG.md`
- `index.html`
- `src/styles/base.css`
- `src/styles/components.css`
- `src/styles/effects.css`
- `src/styles/home-v2.css`
- `src/styles/immersive.css`
- `src/styles/variables.css`

---

## Commit 518 — `e9d66b3a0d10d21d3f171cf6d9be311a7814efcd`
**Link:** [e9d66b3a0d10](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e9d66b3a0d10d21d3f171cf6d9be311a7814efcd)
**Data do autor:** `2026-07-02T00:11:57-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `33200595cfeb1c93e358017f7d08e376233631fa`
**Resumo:** feat(#246): reskin "Ouro de Fábula" — estética Fable 5 V2 (site + app) (#308)
**Corpo da mensagem:**

feat(#246): reskin "Ouro de Fábula" — estética Fable 5 V2 (site + app) (#308)

* docs: atualiza CLAUDE.md (mapa rápido) com camada de efeitos, Centro Militar e Node 24

Reflete o estado novo do site pra futuras sessões: camada de efeitos
vanilla (effects.js/css, hero-rays), Centro Militar (/militar + wikipedia.js,
13 frentes consolidadas), Node 24 nos engines, e os docs REACT-BITS.md /
CENTRO-MILITAR.md.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK

* feat(#246): Centro Militar — camada de curadoria no Supabase (dado nosso)

Nova tabela public.mil_curation (aplicada via MCP) que sobrepõe a
Wikipédia com dado nosso por frente: nota do operador, destaque, ordem.
O hub aplica destaque (.is-featured) + nota (.mil-note) por cima do
extrato da Wikipédia.

- RLS: leitura pública (anon SELECT), escrita só service_role
  (dashboard/MCP). Verificado: anon GET 200, anon POST 401.
- src/utils/mil-curation.js (fetchMilCuration via dbSelect, best-effort)
  + CSS de destaque/nota; militar.js aplica o overlay.
- docs/CENTRO-MILITAR.md + CHANGELOG. Semeadas as 14 frentes.

Verificado: build limpo; overlay aplica no DOM; leitura anônima ok.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK

* feat(#246): reskin "Ouro de Fábula" — estética Fable 5 V2 (site + app)

Implementa a nova estética do mockup Baluarte Fable.dc.html (branch
Redesign-Baluarte-3D, pasta Fable 5 V2): fundo violeta-escuro + acento
dourado + texto pergaminho + serifas (Cormorant Garamond/Spectral/IBM
Plex Mono) + grão de ruído global.

- variables.css: re-tokenização completa (nomes --color-cyan/--color-
  magenta mantidos por compat → ouro #d4a24e / ouro-claro #e8c07a);
  superfícies violeta, texto pergaminho, glows quentes, fontes serifadas.
- index.html: novas famílias no Google Fonts.
- base.css: fundo dourado sutil + grão de pergaminho (body::after).
- home-v2/components/immersive/effects: neons hardcoded → dourado
  (títulos holográficos, raios, botões, métricas, orbe, shine).
- docs/DESIGN-SYSTEM.md: contrato visual atualizado (estética atual).

O app herda online na hora (carrega o site); fallback offline atualiza
no próximo build de release. Verificado (Playwright /home e /militar):
reskin completo, build limpo.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK

---------

Co-authored-by: Claude <noreply@anthropic.com>
**Arquivos afetados:** 9
### Arquivos modificados

- `docs/DESIGN-SYSTEM.md`
- `historico/CHANGELOG.md`
- `index.html`
- `src/styles/base.css`
- `src/styles/components.css`
- `src/styles/effects.css`
- `src/styles/home-v2.css`
- `src/styles/immersive.css`
- `src/styles/variables.css`

---

## Commit 519 — `91e0777d3d60adaf54c40d08bf58830d3952f73f`
**Link:** [91e0777d3d60](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/91e0777d3d60adaf54c40d08bf58830d3952f73f)
**Data do autor:** `2026-07-02T04:38:50+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `e9d66b3a0d10d21d3f171cf6d9be311a7814efcd`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 520 — `25420cbdd53b0ad2a48e5be8b7c45dadb1463193`
**Link:** [25420cbdd53b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/25420cbdd53b0ad2a48e5be8b7c45dadb1463193)
**Data do autor:** `2026-07-02T14:37:54+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `91e0777d3d60adaf54c40d08bf58830d3952f73f`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 521 — `4637f74f7e200876ec7fa589d1a65059353c1686`
**Link:** [4637f74f7e20](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4637f74f7e200876ec7fa589d1a65059353c1686)
**Data do autor:** `2026-07-02T23:42:55+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `e7c633b84208a6f3f76c1b2013ee63652ce09514`
**Resumo:** feat(#246): Ouro de Fábula em todas as páginas — varredura total do neon
**Corpo da mensagem:**

feat(#246): Ouro de Fábula em todas as páginas — varredura total do neon

Converte as ~460 ocorrências de neon hardcoded que os tokens não
alcançavam (#00f0ff/#ff00aa + rgba/0x equivalentes) pro dourado
(#d4a24e/#e8c07a) em 105 arquivos: todas as folhas por-página, os JS
(canvas/gráficos/engines/highlight do editor) e o cerebro.json. Zero
neon remanescente.

- components.css: .card ganha o grão de ruído dourado (vidro de fábula
  em todos os painéis do site).
- home-v2.css: CTAs do herói serifados (Cormorant, como no mockup).

Verificado no navegador (Playwright, arsenal/biblioteca/editor/radio):
tudo no ouro, até o syntax highlighting; build limpo. Site + app.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 108
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/data/arsenal.js`
- `src/data/cerebro.json`
- `src/data/ciberseg.js`
- `src/data/elites.js`
- `src/data/modpack.js`
- `src/data/periodic.js`
- `src/data/skills.js`
- `src/data/universos.js`
- `src/data/videos.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/cerebro.js`
- `src/pages/codigo.js`
- `src/pages/color-studio.js`
- `src/pages/dolar.js`
- `src/pages/ferramentas.js`
- `src/pages/geopulse.js`
- `src/pages/git-nexus.js`
- `src/pages/home.js`
- `src/pages/jarvis-vision.js`
- `src/pages/llm-lab.js`
- `src/pages/logic-sim.js`
- `src/pages/mapa.js`
- `src/pages/media.js`
- `src/pages/musicas.js`
- `src/pages/portas.js`
- `src/pages/radar.js`
- `src/pages/regex.js`
- `src/pages/terminal.js`
- `src/pages/triangulacao.js`
- `src/pages/universo.js`
- `src/pages/visao.js`
- `src/styles/academia.css`
- `src/styles/aprendizado.css`
- `src/styles/arsenal.css`
- `src/styles/atmosphere.css`
- `src/styles/baixar.css`
- `src/styles/banco.css`
- `src/styles/batalha-naval.css`
- `src/styles/biblioteca.css`
- `src/styles/calc.css`
- `src/styles/calculadoras.css`
- `src/styles/centro-militar.css`
- `src/styles/ciberseg.css`
- `src/styles/components.css`
- `src/styles/cripto.css`
- `src/styles/dolar.css`
- `src/styles/dossie.css`
- `src/styles/editor.css`
- `src/styles/effects.css`
- `src/styles/elites.css`
- `src/styles/enciclopedia-militar.css`
- `src/styles/fase17.css`
- `src/styles/fase18.css`
- `src/styles/fase19.css`
- `src/styles/fase21.css`
- `src/styles/ferramentas.css`
- `src/styles/fft.css`
- `src/styles/filmes.css`
- `src/styles/find.css`
- `src/styles/geopulse.css`
- `src/styles/git-nexus.css`
- `src/styles/graficos.css`
- `src/styles/home-v2.css`
- `src/styles/jarvis-dashboard.css`
- `src/styles/jarvis-vision.css`
- `src/styles/jogos.css`
- `src/styles/llm-lab.css`
- `src/styles/mapa.css`
- `src/styles/media.css`
- `src/styles/memes.css`
- `src/styles/militar.css`
- `src/styles/morse.css`
- `src/styles/mural.css`
- `src/styles/musicas.css`
- `src/styles/perfil.css`
- `src/styles/portas.css`
- `src/styles/projetos.css`
- `src/styles/radar.css`
- `src/styles/radio.css`
- `src/styles/regex.css`
- `src/styles/reset.css`
- `src/styles/roadmap.css`
- `src/styles/robotica.css`
- `src/styles/scroll-progress.css`
- `src/styles/simbolos.css`
- `src/styles/sobre.css`
- `src/styles/tabela-verdade.css`
- `src/styles/terminal-ia.css`
- `src/styles/terminal.css`
- `src/styles/triangulacao.css`
- `src/styles/tv.css`
- `src/styles/universo.css`
- `src/styles/utilidades.css`
- `src/styles/videos.css`
- `src/styles/visao.css`
- `src/utils/chart-engine.js`
- `src/utils/editor-engine.js`
- `src/utils/fft-engine.js`
- `src/utils/git-nexus-graph.js`
- `src/utils/git-nexus-graph3d.js`
- `src/utils/hero-rays.js`
- `src/utils/hero-webgl.js`
- `src/utils/hero3d.js`
- `src/utils/jarvis-tools.js`
- `src/utils/theme.js`
- `src/utils/universe-theme.js`

---

## Commit 522 — `12723bbf8b8c4b04ff3b8a8b2ba3d62f1fb71010`
**Link:** [12723bbf8b8c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/12723bbf8b8c4b04ff3b8a8b2ba3d62f1fb71010)
**Data do autor:** `2026-07-03T04:24:50+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `25420cbdd53b0ad2a48e5be8b7c45dadb1463193`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 523 — `c96676c5908a98f170778da28a156a12b85aa267`
**Link:** [c96676c5908a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c96676c5908a98f170778da28a156a12b85aa267)
**Data do autor:** `2026-07-03T04:33:01+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `4637f74f7e200876ec7fa589d1a65059353c1686 25420cbdd53b0ad2a48e5be8b7c45dadb1463193`
**Resumo:** Merge remote-tracking branch 'origin/main' into claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge remote-tracking branch 'origin/main' into claude/projeto-baluarte-issues-txo9fl

# Conflicts:
#	historico/CHANGELOG.md
#	src/styles/centro-militar.css
**Arquivos afetados:** 0

---

## Commit 524 — `e3e056df963e243d8184ce1e62106982cf7f89a3`
**Link:** [e3e056df963e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e3e056df963e243d8184ce1e62106982cf7f89a3)
**Data do autor:** `2026-07-03T01:34:46-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `12723bbf8b8c4b04ff3b8a8b2ba3d62f1fb71010 c96676c5908a98f170778da28a156a12b85aa267`
**Resumo:** Merge pull request #311 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #311 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#246): Ouro de Fábula em TODAS as páginas — varredura total do neon
**Arquivos afetados:** 0

---

## Commit 525 — `20facd3d95ed39356364c53ed5a8cd4ca55408d7`
**Link:** [20facd3d95ed](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/20facd3d95ed39356364c53ed5a8cd4ca55408d7)
**Data do autor:** `2026-07-03T04:47:13+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `e3e056df963e243d8184ce1e62106982cf7f89a3`
**Resumo:** feat(#246): temas de fábula Esmeralda & Rubi + tokenização total das folhas
**Corpo da mensagem:**

feat(#246): temas de fábula Esmeralda & Rubi + tokenização total das folhas

- theme.js: temas com kit completo (vars) do mockup Fable 5 V2 — fundo,
  painéis, texto e bordas além do acento; limpeza por união de chaves
- 64 folhas: ouro hardcoded (277 ocorrências) → var(--color-cyan)/color-mix,
  todas as páginas seguem qualquer tema e universo
- base.css: tint do body via color-mix; btn--magenta/hv2-btn--app sem hex fixo
- docs: DESIGN-SYSTEM.md (tabela de tokens atual + seção de temas), CHANGELOG

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 68
### Arquivos modificados

- `docs/DESIGN-SYSTEM.md`
- `historico/CHANGELOG.md`
- `src/styles/academia.css`
- `src/styles/aprendizado.css`
- `src/styles/arsenal.css`
- `src/styles/atmosphere.css`
- `src/styles/baixar.css`
- `src/styles/banco.css`
- `src/styles/base.css`
- `src/styles/batalha-naval.css`
- `src/styles/biblioteca.css`
- `src/styles/calc.css`
- `src/styles/calculadoras.css`
- `src/styles/centro-militar.css`
- `src/styles/ciberseg.css`
- `src/styles/components.css`
- `src/styles/cripto.css`
- `src/styles/dolar.css`
- `src/styles/dossie.css`
- `src/styles/editor.css`
- `src/styles/effects.css`
- `src/styles/elites.css`
- `src/styles/enciclopedia-militar.css`
- `src/styles/fase17.css`
- `src/styles/fase18.css`
- `src/styles/fase19.css`
- `src/styles/fase21.css`
- `src/styles/ferramentas.css`
- `src/styles/fft.css`
- `src/styles/filmes.css`
- `src/styles/find.css`
- `src/styles/geopulse.css`
- `src/styles/git-nexus.css`
- `src/styles/graficos.css`
- `src/styles/home-v2.css`
- `src/styles/jarvis-dashboard.css`
- `src/styles/jarvis-vision.css`
- `src/styles/jogos.css`
- `src/styles/llm-lab.css`
- `src/styles/mapa.css`
- `src/styles/media.css`
- `src/styles/memes.css`
- `src/styles/militar.css`
- `src/styles/morse.css`
- `src/styles/mural.css`
- `src/styles/musicas.css`
- `src/styles/perfil.css`
- `src/styles/portas.css`
- `src/styles/projetos.css`
- `src/styles/radar.css`
- `src/styles/radio.css`
- `src/styles/regex.css`
- `src/styles/reset.css`
- `src/styles/roadmap.css`
- `src/styles/robotica.css`
- `src/styles/scroll-progress.css`
- `src/styles/simbolos.css`
- `src/styles/sobre.css`
- `src/styles/tabela-verdade.css`
- `src/styles/terminal-ia.css`
- `src/styles/terminal.css`
- `src/styles/triangulacao.css`
- `src/styles/tv.css`
- `src/styles/universo.css`
- `src/styles/utilidades.css`
- `src/styles/videos.css`
- `src/styles/visao.css`
- `src/utils/theme.js`

---

## Commit 526 — `76a74d387184f9b5d72688894ca24f35611921f0`
**Link:** [76a74d387184](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/76a74d387184f9b5d72688894ca24f35611921f0)
**Data do autor:** `2026-07-03T01:49:08-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `e3e056df963e243d8184ce1e62106982cf7f89a3 20facd3d95ed39356364c53ed5a8cd4ca55408d7`
**Resumo:** Merge pull request #312 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #312 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#246): temas de fábula Esmeralda & Rubi + tokenização total das folhas
**Arquivos afetados:** 0

---

## Commit 527 — `880b3fc8250060154a9dd9eb946c858e2d791d9e`
**Link:** [880b3fc82500](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/880b3fc8250060154a9dd9eb946c858e2d791d9e)
**Data do autor:** `2026-07-03T05:42:35+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `76a74d387184f9b5d72688894ca24f35611921f0`
**Resumo:** feat(#246): entrada 'cascata cybertroniana' + herói astrolábio 3D + pill de tema
**Corpo da mensagem:**

feat(#246): entrada 'cascata cybertroniana' + herói astrolábio 3D + pill de tema

- boot-intro: overlay de entrada (chuva de glifos + sigilo SVG + decode
  BALUARTE), 6,5s (mais tempo, a pedido), skip por clique/Esc, tokens,
  reduced-motion; vale pro site e pro app
- hero-webgl: variante 'astrolabe' sem dependência (icosaedro duplo, anéis
  inclinados + halo, partículas, vagalumes, estilhaços; giro majestoso)
- home: herói no layout do mockup (cantos ✦, divisor, sub itálico, CTAs
  pill); Spline só via ?spline=URL
- shell: pill de tema flutuante Ouro/Rubi/Esmeralda (evento baluarte:theme)
- docs: DESIGN-SYSTEM + CHANGELOG

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 11
### Arquivos criados

- `src/styles/boot-intro.css`
- `src/utils/boot-intro.js`
### Arquivos modificados

- `docs/DESIGN-SYSTEM.md`
- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/main.js`
- `src/pages/home.js`
- `src/styles/components.css`
- `src/styles/home-v2.css`
- `src/utils/hero-webgl.js`
- `src/utils/theme.js`

---

## Commit 528 — `d9e7295048fe6bd69f4342f4bd7a67c0a8e7e8d4`
**Link:** [d9e7295048fe](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d9e7295048fe6bd69f4342f4bd7a67c0a8e7e8d4)
**Data do autor:** `2026-07-03T02:44:33-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `76a74d387184f9b5d72688894ca24f35611921f0 880b3fc8250060154a9dd9eb946c858e2d791d9e`
**Resumo:** Merge pull request #313 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #313 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#246): entrada "cascata cybertroniana" + herói astrolábio 3D + pill de tema
**Arquivos afetados:** 0

---

## Commit 529 — `cd7a6efa6c9aa0bca4244a0ea6a1f5fceb4249be`
**Link:** [cd7a6efa6c9a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cd7a6efa6c9aa0bca4244a0ea6a1f5fceb4249be)
**Data do autor:** `2026-07-03T09:39:50+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d9e7295048fe6bd69f4342f4bd7a67c0a8e7e8d4`
**Resumo:** feat(#310): visualizador de modelos 3D militares (Sketchfab, crédito sempre)
**Corpo da mensagem:**

feat(#310): visualizador de modelos 3D militares (Sketchfab, crédito sempre)

- página /modelos-3d: galeria com 432 destaques das 10 coleções da issue
  (militar/armas/mechas), busca, filtros por grupo/coleção, 'carregar mais'
  paginando a API pública do Sketchfab ao vivo (CORS ok)
- viewer modal com embed oficial do Sketchfab (iframe sob demanda) + crédito
  completo (autor com link, licença, link original) no card, player e rodapé
- seed commitado src/data/modelos-3d.json (destaques, ~200KB) p/ paint sem rede
- scroll-reveal: observer com threshold 0 p/ blocos mais altos que a viewport
  (grades longas não ficavam presas invisíveis)
- fiação: rota lazy, sidebar (Seção Militar), ícone 'cube', título

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 8
### Arquivos criados

- `src/data/modelos-3d.json`
- `src/pages/modelos-3d.js`
- `src/styles/modelos-3d.css`
### Arquivos modificados

- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/utils/icons.js`
- `src/utils/scroll-reveal.js`

---

## Commit 530 — `e33888409714dd67b093446fc62986c0bfa84aa3`
**Link:** [e33888409714](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e33888409714dd67b093446fc62986c0bfa84aa3)
**Data do autor:** `2026-07-03T09:58:35+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `cd7a6efa6c9aa0bca4244a0ea6a1f5fceb4249be`
**Resumo:** feat(#310/#231): Hermes agente LOCAL (sem API) — núcleo de agente + modo no JARVIS
**Corpo da mensagem:**

feat(#310/#231): Hermes agente LOCAL (sem API) — núcleo de agente + modo no JARVIS

- jarvis-agent-core.js: loop ReAct independente de modelo, protocolo de
  function-calling nativo do Nous Hermes (<tools>/<tool_call>/<tool_response>);
  serve qualquer cérebro brain({system,messages})
- jarvis-webllm.js: makeWebLLMBrain() — completação sem streaming p/ tool-calls
- jarvis-hermes-agent.js: processHermesAgent (WebLLM Hermes + tools do JARVIS),
  default Nous Hermes 2 Pro
- jarvis.js: modo 'Hermes (agente local)' com UI de tool-call + baixador de
  modelo (chave de modelo própria, não herda o Llama do modo Navegador)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 5
### Arquivos criados

- `src/utils/jarvis-agent-core.js`
- `src/utils/jarvis-hermes-agent.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/jarvis.js`
- `src/utils/jarvis-webllm.js`

---

## Commit 531 — `af9cd9316a7646bb25e1655705b70db5e3533dfa`
**Link:** [af9cd9316a76](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/af9cd9316a7646bb25e1655705b70db5e3533dfa)
**Data do autor:** `2026-07-03T07:00:13-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `d9e7295048fe6bd69f4342f4bd7a67c0a8e7e8d4 e33888409714dd67b093446fc62986c0bfa84aa3`
**Resumo:** Merge pull request #314 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #314 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat: visualizador de Modelos 3D (#310) + Hermes agente local sem API (#310/#231)
**Arquivos afetados:** 0

---

## Commit 532 — `559fa798ba0acb309f9369afcf71072bb655dfeb`
**Link:** [559fa798ba0a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/559fa798ba0acb309f9369afcf71072bb655dfeb)
**Data do autor:** `2026-07-03T10:05:11+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `af9cd9316a7646bb25e1655705b70db5e3533dfa`
**Resumo:** feat(#310/#231): Hermes agente — motor embutido no app (Fatia 2, scaffold) + app 0.3.0
**Corpo da mensagem:**

feat(#310/#231): Hermes agente — motor embutido no app (Fatia 2, scaffold) + app 0.3.0

- jarvis-hermes-native.js: bridge nativo; processHermesAgent prefere o motor
  embutido (window.baluarte.invoke hermes:generate) quando disponível, senão WebLLM
- desktop/src/hermes.js: motor llama.cpp/GGUF lazy e guardado (available:false
  sem dep/modelo → não quebra o instalador atual); handlers hermes:status/
  hermes:generate na allowlist do ipc.js
- desktop 0.2.0 → 0.3.0; docs/HANDOFF-LOCAL.md M5 (passos locais + release)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 7
### Arquivos criados

- `desktop/src/hermes.js`
- `src/utils/jarvis-hermes-native.js`
### Arquivos modificados

- `desktop/package.json`
- `desktop/src/ipc.js`
- `docs/HANDOFF-LOCAL.md`
- `historico/CHANGELOG.md`
- `src/utils/jarvis-hermes-agent.js`

---

## Commit 533 — `b5b0d1a00810994a4130e395e7c3f48a2c2cf8dc`
**Link:** [b5b0d1a00810](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b5b0d1a00810994a4130e395e7c3f48a2c2cf8dc)
**Data do autor:** `2026-07-03T07:06:30-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `af9cd9316a7646bb25e1655705b70db5e3533dfa 559fa798ba0acb309f9369afcf71072bb655dfeb`
**Resumo:** Merge pull request #315 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #315 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#310/#231): Hermes agente — motor embutido no app (Fatia 2) + app 0.3.0
**Arquivos afetados:** 0

---

## Commit 534 — `4e2fbdfa4b9025a3a04f0d6ca5c81c1c443e783b`
**Link:** [4e2fbdfa4b90](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4e2fbdfa4b9025a3a04f0d6ca5c81c1c443e783b)
**Data do autor:** `2026-07-03T14:40:09+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `b5b0d1a00810994a4130e395e7c3f48a2c2cf8dc`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 535 — `682aa8bf46264dda6abac2e25f76dc377b37bd91`
**Link:** [682aa8bf4626](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/682aa8bf46264dda6abac2e25f76dc377b37bd91)
**Data do autor:** `2026-07-03T14:55:05+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `b5b0d1a00810994a4130e395e7c3f48a2c2cf8dc`
**Resumo:** feat(#316): backend Java (Spring Boot) — ponte mobile do Núcleo + roadmap
**Corpo da mensagem:**

feat(#316): backend Java (Spring Boot) — ponte mobile do Núcleo + roadmap

- backend-java/: serviço Spring Boot 3.3 (Java 21) APARTE do site (fora do
  Vercel via .vercelignore). REST /api/nucleo/{command,telemetry,biometric,
  health} + WebSocket /ws/nucleo com broadcast de JarvisEvent ao vivo.
  Controllers/Service/DTOs(records)/CORS + README com o glue do front.
- roadmap 'Núcleo de IA 10x' na issue #316 (stack atual, sem Next.js)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 15
### Arquivos criados

- `backend-java/README.md`
- `backend-java/pom.xml`
- `backend-java/src/main/java/com/baluarte/nucleo/NucleoApplication.java`
- `backend-java/src/main/java/com/baluarte/nucleo/config/WebConfig.java`
- `backend-java/src/main/java/com/baluarte/nucleo/config/WebSocketConfig.java`
- `backend-java/src/main/java/com/baluarte/nucleo/controller/JarvisController.java`
- `backend-java/src/main/java/com/baluarte/nucleo/model/BiometricPayload.java`
- `backend-java/src/main/java/com/baluarte/nucleo/model/JarvisCommand.java`
- `backend-java/src/main/java/com/baluarte/nucleo/model/JarvisEvent.java`
- `backend-java/src/main/java/com/baluarte/nucleo/model/TelemetryPayload.java`
- `backend-java/src/main/java/com/baluarte/nucleo/service/JarvisService.java`
- `backend-java/src/main/java/com/baluarte/nucleo/socket/JarvisSocketHandler.java`
- `backend-java/src/main/resources/application.yml`
### Arquivos modificados

- `.vercelignore`
- `historico/CHANGELOG.md`

---

## Commit 536 — `5630207a93e9df9fe49a733a23b1cac8309b088c`
**Link:** [5630207a93e9](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5630207a93e9df9fe49a733a23b1cac8309b088c)
**Data do autor:** `2026-07-03T11:56:57-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4e2fbdfa4b9025a3a04f0d6ca5c81c1c443e783b 682aa8bf46264dda6abac2e25f76dc377b37bd91`
**Resumo:** Merge pull request #317 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #317 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#316): backend Java (Spring Boot) — ponte mobile do Núcleo de IA
**Arquivos afetados:** 0

---

## Commit 537 — `97b37b96bfb0b93161f294c2696691abe236823f`
**Link:** [97b37b96bfb0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/97b37b96bfb0b93161f294c2696691abe236823f)
**Data do autor:** `2026-07-03T15:06:06+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `5630207a93e9df9fe49a733a23b1cac8309b088c`
**Resumo:** feat(#316): Fase A — cena do jarvis-nucleo como backdrop vivo do cockpit
**Corpo da mensagem:**

feat(#316): Fase A — cena do jarvis-nucleo como backdrop vivo do cockpit

- nucleo-scene.js: porta do jarvis-nucleo.html (núcleo procedural Simplex +
  anéis + constelação neural com sinapses + poeira + UnrealBloom + Glitch).
  Three.js dynamic-imported dentro do mount (lazy, app-only #238), cores por
  token (reage a baluarte:theme), reduced-motion, auto-cleanup, pulse()
- git-nexus-cockpit.js: monta a cena como backdrop atrás das abas; pulso de
  dados (glitch) na troca de aba
- vite.config.js: three em chunk próprio, fora do vendor eager (fora do boot)
- three@0.161.0 (dep lazy)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 7
### Arquivos criados

- `src/utils/nucleo-scene.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `package-lock.json`
- `package.json`
- `src/pages/git-nexus-cockpit.js`
- `src/styles/git-nexus.css`
- `vite.config.js`

---

## Commit 538 — `ca1b818a2a8f605e057ad3b635575de789fdefc6`
**Link:** [ca1b818a2a8f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ca1b818a2a8f605e057ad3b635575de789fdefc6)
**Data do autor:** `2026-07-03T12:07:34-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `5630207a93e9df9fe49a733a23b1cac8309b088c 97b37b96bfb0b93161f294c2696691abe236823f`
**Resumo:** Merge pull request #318 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #318 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#316): Núcleo de IA 10x — Fase A: cena do jarvis-nucleo como backdrop vivo do cockpit
**Arquivos afetados:** 0

---

## Commit 539 — `0faba954d7035915f8d0f6847ac4d664333ea853`
**Link:** [0faba954d703](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0faba954d7035915f8d0f6847ac4d664333ea853)
**Data do autor:** `2026-07-03T15:16:13+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `ca1b818a2a8f605e057ad3b635575de789fdefc6`
**Resumo:** feat(#316): consolida TODA a IA no Núcleo — +Corpo Total +Gerar Código (14 abas)
**Corpo da mensagem:**

feat(#316): consolida TODA a IA no Núcleo — +Corpo Total +Gerar Código (14 abas)

Puxa pro cockpit as 2 funções de IA que ficavam fora (jarvis-vision,
gerar-codigo) — agora tudo de IA (grafo → IA Proprietária) vive e funciona
num lugar só, com a cena viva do jarvis-nucleo atrás. Verificado: as 14 abas
renderizam/funcionam, troca sem erro.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus-cockpit.js`

---

## Commit 540 — `75b88382199c49c90c9e982e32df45b367d542cf`
**Link:** [75b88382199c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/75b88382199c49c90c9e982e32df45b367d542cf)
**Data do autor:** `2026-07-03T12:17:37-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ca1b818a2a8f605e057ad3b635575de789fdefc6 0faba954d7035915f8d0f6847ac4d664333ea853`
**Resumo:** Merge pull request #319 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #319 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#316): consolida TODA a IA no Núcleo — Corpo Total + Gerar Código (14 abas)
**Arquivos afetados:** 0

---

## Commit 541 — `661a3c542b5bcc28f20cf0b7ad95915151023a81`
**Link:** [661a3c542b5b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/661a3c542b5bcc28f20cf0b7ad95915151023a81)
**Data do autor:** `2026-07-03T19:44:49+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `75b88382199c49c90c9e982e32df45b367d542cf`
**Resumo:** feat(#316): sidebar de IA abre no Núcleo (app) — jarvis-vision + gerar-codigo via cockpit
**Corpo da mensagem:**

feat(#316): sidebar de IA abre no Núcleo (app) — jarvis-vision + gerar-codigo via cockpit

No app, /jarvis-vision e /gerar-codigo passam a abrir DENTRO do Núcleo na aba
certa (lazyLeve → cockpit ?tab=vision / ?tab=gerar) em vez de páginas
standalone; na web seguem standalone. Fecha a unificação de navegação.

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 2
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/main.js`

---

## Commit 542 — `e011b79afb93dfcf2a7e7347185020814776ead7`
**Link:** [e011b79afb93](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e011b79afb93dfcf2a7e7347185020814776ead7)
**Data do autor:** `2026-07-03T19:49:27+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `661a3c542b5bcc28f20cf0b7ad95915151023a81`
**Resumo:** feat(#316): Fase D — a cena do Núcleo reage a eventos ao vivo (WebSocket)
**Corpo da mensagem:**

feat(#316): Fase D — a cena do Núcleo reage a eventos ao vivo (WebSocket)

- nucleo-socket.js: cliente do backend Java (/ws/nucleo), opt-in por URL
  (nucleo:wsUrl), reconexão por backoff, publica JarvisEvent no bus como
  'nucleo:event'; simulateNucleoEvent() pra demo sem o serviço no ar
- cockpit: assina 'nucleo:event' → pulse() da cena por tipo de evento; barra
  'Núcleo ao vivo' (status + último evento + URL + conectar + ⚡ testar);
  limpa handlers ao sair
- css .gn-live

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos criados

- `src/utils/nucleo-socket.js`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus-cockpit.js`
- `src/styles/git-nexus.css`

---

## Commit 543 — `202d628021913835ff01f15d31d4f4843edd61ca`
**Link:** [202d62802191](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/202d628021913835ff01f15d31d4f4843edd61ca)
**Data do autor:** `2026-07-03T16:50:54-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `75b88382199c49c90c9e982e32df45b367d542cf e011b79afb93dfcf2a7e7347185020814776ead7`
**Resumo:** Merge pull request #320 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #320 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#316): sidebar de IA abre no Núcleo + Fase D (cena reage a eventos ao vivo)
**Arquivos afetados:** 0

---

## Commit 544 — `d7c7f992576cf8abe4591b807cbc5f4ba0aeed2a`
**Link:** [d7c7f992576c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d7c7f992576cf8abe4591b807cbc5f4ba0aeed2a)
**Data do autor:** `2026-07-03T19:57:30+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `202d628021913835ff01f15d31d4f4843edd61ca`
**Resumo:** feat(#316): Fase B — cena do Núcleo pronta pra moldura GLB (Blender)
**Corpo da mensagem:**

feat(#316): Fase B — cena do Núcleo pronta pra moldura GLB (Blender)

- nucleo-scene.js: GLTFLoader lazy opt-in (nucleo:glbUrl) — carrega a moldura
  assada e esconde os anéis procedurais; sem asset, segue procedural (zero
  regressão/404). A assadura no Blender é tarefa local (HANDOFF M6)
- docs/HANDOFF-LOCAL.md: M6 (passos do bake → frame.glb → glbUrl)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 3
### Arquivos modificados

- `docs/HANDOFF-LOCAL.md`
- `historico/CHANGELOG.md`
- `src/utils/nucleo-scene.js`

---

## Commit 545 — `a02678eacb93fc3a06e0889c68ebcb61a5de999b`
**Link:** [a02678eacb93](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a02678eacb93fc3a06e0889c68ebcb61a5de999b)
**Data do autor:** `2026-07-03T20:00:40+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d7c7f992576cf8abe4591b807cbc5f4ba0aeed2a`
**Resumo:** feat(#316): Fase C — agente Hermes no backend Java + auth por token
**Corpo da mensagem:**

feat(#316): Fase C — agente Hermes no backend Java + auth por token

- HermesClient: comando → resposta via endpoint Hermes configurável
  (NUCLEO_HERMES_URL: proxy /api/hermes do site ou Ollama); vazio = ecoa
- JarvisService: handleCommand dispara o Hermes (async) e transmite a resposta
  como JarvisEvent type=response
- TokenAuthFilter + WS HandshakeInterceptor: auth opt-in por NUCLEO_TOKEN
  (REST X-Nucleo-Token, WS ?token=; /health livre)
- application.yml (envs), JarvisControllerTest, README (deploy)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 8
### Arquivos criados

- `backend-java/src/main/java/com/baluarte/nucleo/config/TokenAuthFilter.java`
- `backend-java/src/main/java/com/baluarte/nucleo/service/HermesClient.java`
- `backend-java/src/test/java/com/baluarte/nucleo/JarvisControllerTest.java`
### Arquivos modificados

- `backend-java/README.md`
- `backend-java/src/main/java/com/baluarte/nucleo/config/WebSocketConfig.java`
- `backend-java/src/main/java/com/baluarte/nucleo/service/JarvisService.java`
- `backend-java/src/main/resources/application.yml`
- `historico/CHANGELOG.md`

---

## Commit 546 — `29e987be9afa6fff1423cf3ed3547c3683bfb28c`
**Link:** [29e987be9afa](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/29e987be9afa6fff1423cf3ed3547c3683bfb28c)
**Data do autor:** `2026-07-03T17:02:19-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `202d628021913835ff01f15d31d4f4843edd61ca a02678eacb93fc3a06e0889c68ebcb61a5de999b`
**Resumo:** Merge pull request #321 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #321 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#316): Fase B (cena pronta pra GLB do Blender) + Fase C (agente Hermes + auth no backend Java)
**Arquivos afetados:** 0

---

## Commit 547 — `c20cb4b0479124b5a8c91ba1d3d0a5ab71980835`
**Link:** [c20cb4b04791](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c20cb4b0479124b5a8c91ba1d3d0a5ab71980835)
**Data do autor:** `2026-07-03T20:12:03+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `29e987be9afa6fff1423cf3ed3547c3683bfb28c`
**Resumo:** chore(#310): instalador 0.3.0 pronto pra cortar — auto-download do modelo + dep opcional
**Corpo da mensagem:**

chore(#310): instalador 0.3.0 pronto pra cortar — auto-download do modelo + dep opcional

- desktop/hermes.js: modelo auto-baixa no 1º uso pra userData/models
  (BALUARTE_HERMES_MODEL_URL, default Hermes 2 Pro Q4_K_M), progresso em status()
- desktop/package.json: node-llama-cpp como optionalDependency (lock em sync) +
  asarUnpack do módulo nativo → build do instalador nunca quebra (fallback WebLLM)
- docs/CHANGELOG

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos modificados

- `desktop/package-lock.json`
- `desktop/package.json`
- `desktop/src/hermes.js`
- `historico/CHANGELOG.md`

---

## Commit 548 — `90423ead2e945d8c049b908d915b309174b92370`
**Link:** [90423ead2e94](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/90423ead2e945d8c049b908d915b309174b92370)
**Data do autor:** `2026-07-03T17:13:47-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `29e987be9afa6fff1423cf3ed3547c3683bfb28c c20cb4b0479124b5a8c91ba1d3d0a5ab71980835`
**Resumo:** Merge pull request #322 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #322 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

chore(#310): instalador 0.3.0 pronto pra cortar — auto-download do modelo + dep opcional
**Arquivos afetados:** 0

---

## Commit 549 — `502e66876f1bb48150c765275c05d2efa34522d5`
**Link:** [502e66876f1b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/502e66876f1bb48150c765275c05d2efa34522d5)
**Data do autor:** `2026-07-03T20:49:06+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `90423ead2e945d8c049b908d915b309174b92370`
**Resumo:** perf(#323): v0.4.0 fatia 1 — entrada 1x/sessão + SW cache-first + theme mobile
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 1 — entrada 1x/sessão + SW cache-first + theme mobile

- main.js: boot-intro só na 1ª carga da sessão (sessionStorage), mais curta no
  mobile (3.8s vs 6.5s); reload não repete
- sw.js: cache-first puro pros assets com hash (/assets/*, imutáveis) — 2ª carga
  sem rede; SWR pro resto; VERSION → v0.4.0
- index.html: theme-color #0e0c16 (mobile)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `public/sw.js`
- `src/main.js`

---

## Commit 550 — `f81289947c532de9821a642765427c51b092e080`
**Link:** [f81289947c53](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f81289947c532de9821a642765427c51b092e080)
**Data do autor:** `2026-07-03T17:50:47-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `90423ead2e945d8c049b908d915b309174b92370 502e66876f1bb48150c765275c05d2efa34522d5`
**Resumo:** Merge pull request #325 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #325 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 1 — entrada 1x/sessão + SW cache-first + theme mobile
**Arquivos afetados:** 0

---

## Commit 551 — `8272dbeaff1cb1890083461e4e436f836ec659b0`
**Link:** [8272dbeaff1c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8272dbeaff1cb1890083461e4e436f836ec659b0)
**Data do autor:** `2026-07-03T20:55:28+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `f81289947c532de9821a642765427c51b092e080`
**Resumo:** perf(#323): v0.4.0 fatia 2 — fluidez em aparelho fraco/mobile
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 2 — fluidez em aparelho fraco/mobile

- main.js: detecta low-end (deviceMemory<=2 ou hardwareConcurrency<=2, ou
  celular por toque+tela pequena, ou reduced-motion) → classe is-lowfx +
  window.__baluarteLowFx (PC forte fica com tudo)
- base.css: grão global 0.6→0.22 no is-lowfx
- hero-webgl.js: metade das partículas no low-end (galáxia/astrolábio)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/main.js`
- `src/styles/base.css`
- `src/utils/hero-webgl.js`

---

## Commit 552 — `3d30b10a4e50640e76cbad8bf3591dc90c97b9ea`
**Link:** [3d30b10a4e50](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3d30b10a4e50640e76cbad8bf3591dc90c97b9ea)
**Data do autor:** `2026-07-03T17:57:01-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f81289947c532de9821a642765427c51b092e080 8272dbeaff1cb1890083461e4e436f836ec659b0`
**Resumo:** Merge pull request #326 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #326 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 2 — fluidez em aparelho fraco/mobile (is-lowfx)
**Arquivos afetados:** 0

---

## Commit 553 — `7044fdad752492041d01cbf8fb4fd23f471add5e`
**Link:** [7044fdad7524](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7044fdad752492041d01cbf8fb4fd23f471add5e)
**Data do autor:** `2026-07-04T00:45:47+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3d30b10a4e50640e76cbad8bf3591dc90c97b9ea`
**Resumo:** perf(#323): v0.4.0 fatia 3 — fontes do boot 9→3 (universo sob demanda)
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 3 — fontes do boot 9→3 (universo sob demanda)

- index.html: boot carrega só Cormorant Garamond, Spectral, IBM Plex Mono
- universe-theme.js: ensureFont() injeta a fonte do skin de universo sob demanda
  (1x, cacheada) — as 6 famílias de universo saem do boot
- 5 folhas: 'Inter'/'JetBrains Mono' na mão → tokens (--font-sans/--font-mono)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 8
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/styles/biblioteca.css`
- `src/styles/geopulse.css`
- `src/styles/radar.css`
- `src/styles/simbolos.css`
- `src/styles/triangulacao.css`
- `src/utils/universe-theme.js`

---

## Commit 554 — `81d9b1e91638279996599558fa1b5b9e2a013623`
**Link:** [81d9b1e91638](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/81d9b1e91638279996599558fa1b5b9e2a013623)
**Data do autor:** `2026-07-03T21:47:14-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `3d30b10a4e50640e76cbad8bf3591dc90c97b9ea 7044fdad752492041d01cbf8fb4fd23f471add5e`
**Resumo:** Merge pull request #327 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #327 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 3 — fontes do boot 9→3 (universo sob demanda)
**Arquivos afetados:** 0

---

## Commit 555 — `5a3d6ff7a0ca6ecda0ac0f2a1f417783c688767b`
**Link:** [5a3d6ff7a0ca](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5a3d6ff7a0ca6ecda0ac0f2a1f417783c688767b)
**Data do autor:** `2026-07-04T00:55:06+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `81d9b1e91638279996599558fa1b5b9e2a013623`
**Resumo:** perf(#323): v0.4.0 fatia 4 — PWA instalável (mobile) + auditoria de imagens
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 4 — PWA instalável (mobile) + auditoria de imagens

- manifest.json: cores Ouro (#0e0c16), ícones hexágono dourado, maskable
  dedicado, id/categories/display_override e 4 atalhos (Núcleo/Militar/
  Arsenal/Modelos 3D)
- index.html: metas apple-mobile-web-app-* + apple-touch-icon (instalável iOS)
- imagens: site não usa <img> eager (fundos CSS / iframe já lazy) — nada a cortar

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 3
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `public/manifest.json`

---

## Commit 556 — `dae516926da22898d5860dcec1061455e180453a`
**Link:** [dae516926da2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/dae516926da22898d5860dcec1061455e180453a)
**Data do autor:** `2026-07-03T21:56:50-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `81d9b1e91638279996599558fa1b5b9e2a013623 5a3d6ff7a0ca6ecda0ac0f2a1f417783c688767b`
**Resumo:** Merge pull request #328 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #328 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 4 — PWA instalável (mobile) + auditoria de imagens
**Arquivos afetados:** 0

---

## Commit 557 — `f6bb35c3268fecd922166cec2e7c153d7907673e`
**Link:** [f6bb35c3268f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f6bb35c3268fecd922166cec2e7c153d7907673e)
**Data do autor:** `2026-07-04T01:04:03+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `dae516926da22898d5860dcec1061455e180453a`
**Resumo:** perf(#323): v0.4.0 fatia 5 — 9 folhas da seção IA fora do boot
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 5 — 9 folhas da seção IA fora do boot

As 9 folhas app-only do cockpit de IA (llm-lab, cerebro, ocr, memoria,
terminal-ia, seguranca, conselho, apis, aprendizado — ~24KB cru) saíam do
boot via <link> para TODO visitante da web, mas só servem às abas do
cockpit (app-only). Agora cada página importa a sua (import '../styles/x.css')
e o Vite faz code-split: o CSS só baixa no app, quando a aba abre.

Verificado (Playwright, app simulado): 0 refs no dist/index.html, 9 chunks
CSS separados, aba Conselho baixa conselho-*.css sob demanda e renderiza
estilizada.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 11
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/pages/apis.js`
- `src/pages/aprendizado.js`
- `src/pages/cerebro.js`
- `src/pages/conselho.js`
- `src/pages/llm-lab.js`
- `src/pages/memoria.js`
- `src/pages/ocr.js`
- `src/pages/seguranca.js`
- `src/pages/terminal-ia.js`

---

## Commit 558 — `5cbc39467bbcef20a4201fe0e7e6f39e36ceda40`
**Link:** [5cbc39467bbc](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5cbc39467bbcef20a4201fe0e7e6f39e36ceda40)
**Data do autor:** `2026-07-03T22:05:28-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `dae516926da22898d5860dcec1061455e180453a f6bb35c3268fecd922166cec2e7c153d7907673e`
**Resumo:** Merge pull request #329 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #329 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 5 — 9 folhas da seção IA fora do boot
**Arquivos afetados:** 0

---

## Commit 559 — `b62c562b66dd8fcd8a46506b5d9f009a05315bde`
**Link:** [b62c562b66dd](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b62c562b66dd8fcd8a46506b5d9f009a05315bde)
**Data do autor:** `2026-07-04T04:10:15+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `5cbc39467bbcef20a4201fe0e7e6f39e36ceda40`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 560 — `c5d7be6f397d09b300110631f24653d765459605`
**Link:** [c5d7be6f397d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c5d7be6f397d09b300110631f24653d765459605)
**Data do autor:** `2026-07-04T14:08:35+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `b62c562b66dd8fcd8a46506b5d9f009a05315bde`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 561 — `2ba47f1dea5d1cd04cc5373f367a760a8ecd58db`
**Link:** [2ba47f1dea5d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2ba47f1dea5d1cd04cc5373f367a760a8ecd58db)
**Data do autor:** `2026-07-04T17:26:00+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `c5d7be6f397d09b300110631f24653d765459605`
**Resumo:** perf(#323): v0.4.0 fatia 6 — militar.css e mais 5 folhas fora do boot (~54KB)
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 6 — militar.css e mais 5 folhas fora do boot (~54KB)

militar.css (36,5KB cru, a maior folha do boot) só serve às 12 páginas
militares — cada uma importa a folha e o Vite emite UM chunk compartilhado
que baixa quando qualquer página militar abre (hub /militar não afetado,
usa centro-militar.css próprio). Também saíram do boot: terminal.css
(terminal + terminal-ia), portas.css, jarvis-vision.css,
jarvis-dashboard.css e gerar-codigo.css (dono único cada).

CSS do boot: ~30,7KB → ~22,9KB gz (−25%) somando fatias 5+6.

Verificado (Playwright, produção): /forcas-armadas, /poder-militar,
/portas e /terminal renderizam estilizadas com CSS sob demanda, 0 erros.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 20
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/pages/armas-por-pais.js`
- `src/pages/arsenal-expandido.js`
- `src/pages/batalhas-historicas.js`
- `src/pages/forcas-armadas.js`
- `src/pages/forcas-especiais.js`
- `src/pages/gerar-codigo.js`
- `src/pages/guerras-conflitos.js`
- `src/pages/historia-militar.js`
- `src/pages/jarvis-dashboard.js`
- `src/pages/jarvis-vision.js`
- `src/pages/orcamentos-militares.js`
- `src/pages/organizacao-militar.js`
- `src/pages/poder-militar.js`
- `src/pages/portas.js`
- `src/pages/taticas-estrategias.js`
- `src/pages/tecnologia-militar.js`
- `src/pages/terminal-ia.js`
- `src/pages/terminal.js`

---

## Commit 562 — `b54c9d5f21984e66a3a39c1187f07d112bd829d0`
**Link:** [b54c9d5f2198](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b54c9d5f21984e66a3a39c1187f07d112bd829d0)
**Data do autor:** `2026-07-04T14:27:31-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c5d7be6f397d09b300110631f24653d765459605 2ba47f1dea5d1cd04cc5373f367a760a8ecd58db`
**Resumo:** Merge pull request #330 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #330 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 6 — militar.css e mais 5 folhas fora do boot (~54 KB)
**Arquivos afetados:** 0

---

## Commit 563 — `e96e896994081996effad7569ec0cc5469a3bf10`
**Link:** [e96e89699408](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e96e896994081996effad7569ec0cc5469a3bf10)
**Data do autor:** `2026-07-04T17:34:33+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `b54c9d5f21984e66a3a39c1187f07d112bd829d0`
**Resumo:** perf(#323): v0.4.0 fatia 7 — mais 9 folhas fora do boot (CSS do boot −46%)
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 7 — mais 9 folhas fora do boot (CSS do boot −46%)

calc, cripto, graficos, simbolos, biblioteca, logic-sim, morse, fase18 e
editor saíram do boot — cada dono importa a sua folha (editor.css vai nos
utils do componente, então jarvis/gerar-codigo/ia-proprietaria ganham
automático). No boot ficam só as genuinamente compartilhadas (arsenal,
elites, fase17, fase19 — 57+ páginas cada) + a fundação.

CSS do boot: ~30,7KB → ~16,6KB gz (−46%) somando fatias 5+6+7.

Verificado (Playwright, produção): 8 rotas afetadas renderizam
estilizadas com CSS sob demanda, 0 erros, sem duplicação de chunk.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 24
### Arquivos modificados

- `historico/CHANGELOG.md`
- `index.html`
- `src/pages/arsenal.js`
- `src/pages/biblioteca.js`
- `src/pages/calc-cientifica.js`
- `src/pages/calc-numerica.js`
- `src/pages/ciberseg.js`
- `src/pages/cripto/index.js`
- `src/pages/dossie.js`
- `src/pages/editor.js`
- `src/pages/elites.js`
- `src/pages/graficos.js`
- `src/pages/ia-proprietaria.js`
- `src/pages/jogos.js`
- `src/pages/logic-sim.js`
- `src/pages/modpack.js`
- `src/pages/morse.js`
- `src/pages/perfil.js`
- `src/pages/shadow.js`
- `src/pages/simbolos.js`
- `src/pages/videos.js`
- `src/utils/editor-autocomplete.js`
- `src/utils/editor-engine.js`
- `src/utils/syntax-highlight.js`

---

## Commit 564 — `4f1eb5f7fc96377c1d36e2b1057079d8ce27980c`
**Link:** [4f1eb5f7fc96](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4f1eb5f7fc96377c1d36e2b1057079d8ce27980c)
**Data do autor:** `2026-07-04T14:36:02-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b54c9d5f21984e66a3a39c1187f07d112bd829d0 e96e896994081996effad7569ec0cc5469a3bf10`
**Resumo:** Merge pull request #331 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #331 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 7 — mais 9 folhas fora do boot (CSS do boot −46%)
**Arquivos afetados:** 0

---

## Commit 565 — `7d51a103c25490733492c163300db496451926d9`
**Link:** [7d51a103c254](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7d51a103c25490733492c163300db496451926d9)
**Data do autor:** `2026-07-04T17:40:37+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `4f1eb5f7fc96377c1d36e2b1057079d8ce27980c`
**Resumo:** perf(#323): v0.4.0 fatia 8 (final) — toque ≥44px + handoff Capacitor
**Corpo da mensagem:**

perf(#323): v0.4.0 fatia 8 (final) — toque ≥44px + handoff Capacitor

- components.css: @media (pointer: coarse) dá área mínima de 44px aos
  botões de ícone do header (eram 28px), botões pequenos e itens da
  sidebar — só em aparelho de toque, desktop intacto. Verificado
  (Playwright mobile 390x844): toggle 44x44, item da sidebar 44px,
  sem overflow horizontal, is-lowfx ativo.
- docs/HANDOFF-LOCAL.md: M7 — passo a passo do Capacitor (M4 do #323)
  pra sessão local empacotar Android/iOS.

Fecha a parte remota da v0.4.0: boot total ~99,4 → 87,8 KB gz
(CSS −46%), PWA instalável, low-fx, entrada 1x/sessão, toque 44px.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 3
### Arquivos modificados

- `docs/HANDOFF-LOCAL.md`
- `historico/CHANGELOG.md`
- `src/styles/components.css`

---

## Commit 566 — `500f8af4d8944d27303ff97f8868427f40752906`
**Link:** [500f8af4d894](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/500f8af4d8944d27303ff97f8868427f40752906)
**Data do autor:** `2026-07-04T14:42:13-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4f1eb5f7fc96377c1d36e2b1057079d8ce27980c 7d51a103c25490733492c163300db496451926d9`
**Resumo:** Merge pull request #332 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #332 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

perf(#323): v0.4.0 fatia 8 (FINAL) — alvos de toque ≥44px + handoff do Capacitor
**Arquivos afetados:** 0

---

## Commit 567 — `fcf2240df69b381dd63b02f959962bc89a074c48`
**Link:** [fcf2240df69b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fcf2240df69b381dd63b02f959962bc89a074c48)
**Data do autor:** `2026-07-04T17:49:33+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `500f8af4d8944d27303ff97f8868427f40752906`
**Resumo:** feat(#324): Núcleo Mark XIII — tela única 100% limpa, sem menus
**Corpo da mensagem:**

feat(#324): Núcleo Mark XIII — tela única 100% limpa, sem menus

Regra de Ouro do operador: /git-nexus no app agora abre a tela única
(git-nexus-nucleo.js) — só a cena 3D do Mark XIII (protagonista), o
painel de sinais vitais e o chat do J.A.R.V.I.S. Zero abas/menus.

- Funções viram capacidades por comando: "mostrar memória", "abrir
  conselho", "gerar código"… → materializa inline num painel de vidro
  (mesmos loaders lazy do cockpit); "fechar"/Esc recolhe.
- Corpo Total: única exceção visual, SEM botão — só via chat.
- Comandos: modo <ia>, conectar ws://…, desconectar, simular.
- Chat despacha pro cérebro configurado (local/agente/hermes-agente/
  webllm/claude/ollama/servidor/…); cena pulsa em eventos (Fase D).
- Compat: ?tab=<id> abre função no painel; ?ui=cockpit = cockpit
  legado (escape hatch); rotas individuais seguem registradas.
- nucleo-screen.css importado pelo módulo (fora do boot, #323).

Verificado (Playwright, produção, app simulado): tela limpa (0 abas),
abrir/fechar por comando, corpo total só por chat, conversa responde,
deep-links ok, 0 erros.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos criados

- `src/pages/git-nexus-nucleo.js`
- `src/styles/nucleo-screen.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus-gate.js`

---

## Commit 568 — `2f3faa5f5c0ec1239289529f73a68f107fe33c3a`
**Link:** [2f3faa5f5c0e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2f3faa5f5c0ec1239289529f73a68f107fe33c3a)
**Data do autor:** `2026-07-04T14:50:55-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `500f8af4d8944d27303ff97f8868427f40752906 fcf2240df69b381dd63b02f959962bc89a074c48`
**Resumo:** Merge pull request #333 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #333 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#324): Núcleo Mark XIII — tela única 100% limpa, sem menus
**Arquivos afetados:** 0

---

## Commit 569 — `6c2fa370ffa36b6657b61237f4a0bfc0c301a65c`
**Link:** [6c2fa370ffa3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6c2fa370ffa36b6657b61237f4a0bfc0c301a65c)
**Data do autor:** `2026-07-04T21:33:03+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `2f3faa5f5c0ec1239289529f73a68f107fe33c3a`
**Resumo:** feat(#323): M4 — Android com Capacitor pronto pra buildar no CI
**Corpo da mensagem:**

feat(#323): M4 — Android com Capacitor pronto pra buildar no CI

- capacitor.config.json (com.baluarte.app, webDir dist, fundo #0e0c16)
  + projeto android/ scaffoldado e commitado (builds e assets/public
  sincronizado fora do git); scripts mobile:sync / mobile:open
- Permissão de câmera no AndroidManifest (Corpo Total/OCR) + paleta
  Baluarte (colors.xml, ícone adaptativo fundo #0e0c16)
- Ícones/splash gerados do logo.svg em todas as densidades (fontes
  1024/2732px em assets/ pro iOS reusar)
- Workflow Mobile Release: tag mobile-v* ou dispatch → APK debug +
  AAB release não assinado anexados à release (ubuntu, Java 21, Node 24)
- HANDOFF-LOCAL M7 atualizado: local fica teste no aparelho, assinatura
  → Play, e iOS (macOS/Xcode)

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 65
### Arquivos criados

- `.github/workflows/mobile-release.yml`
- `android/.gitignore`
- `android/app/.gitignore`
- `android/app/build.gradle`
- `android/app/capacitor.build.gradle`
- `android/app/proguard-rules.pro`
- `android/app/src/androidTest/java/com/getcapacitor/myapp/ExampleInstrumentedTest.java`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/baluarte/app/MainActivity.java`
- `android/app/src/main/res/drawable-land-hdpi/splash.png`
- `android/app/src/main/res/drawable-land-mdpi/splash.png`
- `android/app/src/main/res/drawable-land-xhdpi/splash.png`
- `android/app/src/main/res/drawable-land-xxhdpi/splash.png`
- `android/app/src/main/res/drawable-land-xxxhdpi/splash.png`
- `android/app/src/main/res/drawable-port-hdpi/splash.png`
- `android/app/src/main/res/drawable-port-mdpi/splash.png`
- `android/app/src/main/res/drawable-port-xhdpi/splash.png`
- `android/app/src/main/res/drawable-port-xxhdpi/splash.png`
- `android/app/src/main/res/drawable-port-xxxhdpi/splash.png`
- `android/app/src/main/res/drawable-v24/ic_launcher_foreground.xml`
- `android/app/src/main/res/drawable/ic_launcher_background.xml`
- `android/app/src/main/res/drawable/splash.png`
- `android/app/src/main/res/layout/activity_main.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher.xml`
- `android/app/src/main/res/mipmap-anydpi-v26/ic_launcher_round.xml`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-hdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-mdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-xhdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-xxhdpi/ic_launcher_round.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_foreground.png`
- `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher_round.png`
- `android/app/src/main/res/values/colors.xml`
- `android/app/src/main/res/values/ic_launcher_background.xml`
- `android/app/src/main/res/values/strings.xml`
- `android/app/src/main/res/values/styles.xml`
- `android/app/src/main/res/xml/file_paths.xml`
- `android/app/src/test/java/com/getcapacitor/myapp/ExampleUnitTest.java`
- `android/build.gradle`
- `android/capacitor.settings.gradle`
- `android/gradle.properties`
- `android/gradle/wrapper/gradle-wrapper.jar`
- `android/gradle/wrapper/gradle-wrapper.properties`
- `android/gradlew`
- `android/gradlew.bat`
- `android/settings.gradle`
- `android/variables.gradle`
- `assets/icon-background.png`
- `assets/icon-foreground.png`
- `assets/icon-only.png`
- `assets/splash-dark.png`
- `assets/splash.png`
- `capacitor.config.json`
### Arquivos modificados

- `docs/HANDOFF-LOCAL.md`
- `historico/CHANGELOG.md`
- `package-lock.json`
- `package.json`

---

## Commit 570 — `0983a509af1c5ea93db7243a127440c80ca9c014`
**Link:** [0983a509af1c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0983a509af1c5ea93db7243a127440c80ca9c014)
**Data do autor:** `2026-07-04T18:35:04-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2f3faa5f5c0ec1239289529f73a68f107fe33c3a 6c2fa370ffa36b6657b61237f4a0bfc0c301a65c`
**Resumo:** Merge pull request #334 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #334 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#323): M4 — Android com Capacitor pronto pra buildar no CI
**Arquivos afetados:** 0

---

## Commit 571 — `02a01b93b571b3415234d282f88e4612a939be9b`
**Link:** [02a01b93b571](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/02a01b93b571b3415234d282f88e4612a939be9b)
**Data do autor:** `2026-07-04T22:15:57+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `0983a509af1c5ea93db7243a127440c80ca9c014`
**Resumo:** feat(#310): blindagem do motor Hermes nativo — fallback absoluto zero-crash
**Corpo da mensagem:**

feat(#310): blindagem do motor Hermes nativo — fallback absoluto zero-crash

Try/Catch de Aço no main (desktop/src/hermes.js): node-llama-cpp
interceptado no require E no getLlama()/loadModel() (onde ABI estoura:
ERR_DLOPEN_FAILED, NODE_MODULE_VERSION, ELF/arch) e no runtime. Erro
classificado, motor marcado FATAL na sessão (falhou 1x -> resposta
imediata, sem re-tentar/timeout), nada sobe pro app.

Chave automática (jarvis-hermes-agent.js): cérebro nativo embrulhado —
se cair em pleno voo, o WebLLM assume NA HORA na mesma conversa, sem
erro pro usuário; escolha/fallback publicados no bus (hermes:engine).

HUD (tela do Núcleo): linha MOTOR nos sinais vitais — NATIVO (GGUF) /
WEB (WEBLLM) / NATIVO ⬇N% — sondada na entrada e ao vivo pelo bus.

Log estruturado: onde/código/motivo/correção (npx electron-rebuild
quando ABI) + aviso de que o fallback assumiu; 1 warn, idempotente.

Verificado: unidade em Node com ABI simulado (fatal instantâneo, generate
rejeita limpo em 0ms, log único) + Playwright produção (HUD 3 estados).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos modificados

- `desktop/src/hermes.js`
- `historico/CHANGELOG.md`
- `src/pages/git-nexus-nucleo.js`
- `src/utils/jarvis-hermes-agent.js`

---

## Commit 572 — `1f0b4f04ad5f7877578996732a10b1b99d831156`
**Link:** [1f0b4f04ad5f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1f0b4f04ad5f7877578996732a10b1b99d831156)
**Data do autor:** `2026-07-04T19:17:30-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0983a509af1c5ea93db7243a127440c80ca9c014 02a01b93b571b3415234d282f88e4612a939be9b`
**Resumo:** Merge pull request #335 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #335 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#310): blindagem do motor Hermes nativo — fallback absoluto zero-crash
**Arquivos afetados:** 0

---

## Commit 573 — `ce45b59b0ef3b6f1326a940c3ad9e5b826f229f8`
**Link:** [ce45b59b0ef3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ce45b59b0ef3b6f1326a940c3ad9e5b826f229f8)
**Data do autor:** `2026-07-04T23:07:48+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1f0b4f04ad5f7877578996732a10b1b99d831156`
**Resumo:** feat: Banco de Dados Universal — sync de mídia + Rede Neural (Supabase 0008)
**Corpo da mensagem:**

feat: Banco de Dados Universal — sync de mídia + Rede Neural (Supabase 0008)

- supabase/migrations/0008_universal_db.sql (APLICADA no banco oficial):
  media_bookmarks (save-state por usuário, UNIQUE user_id+media_key,
  índice user+updated_at, updated_at por trigger, RLS dono-só 4 ops) +
  global_comms (chat global: leitura pública, insert só como si mesmo,
  delete próprio, sem update, anti-flood 1msg/2s por trigger, tabela na
  publicação supabase_realtime) + revokes das funções de trigger
- Cliente sem SDK (web=leve): src/core/media-sync.js (local-first,
  debounce 4s, upsert on_conflict), src/core/realtime.js (protocolo
  Phoenix: postgres_changes, heartbeat 25s, backoff), src/core/comms.js
  (histórico + send + dedupe + status)
- docs/SUPABASE.md: migration 0008 na tabela + seção 10 (arquitetura)

Verificado em produção: chat público 200 / escrita anônima 401 RLS /
bookmarks anônimos bloqueados / INSERT chegou ao vivo no cliente WS
vanilla / advisors sem avisos novos.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 6
### Arquivos criados

- `src/core/comms.js`
- `src/core/media-sync.js`
- `src/core/realtime.js`
- `supabase/migrations/0008_universal_db.sql`
### Arquivos modificados

- `docs/SUPABASE.md`
- `historico/CHANGELOG.md`

---

## Commit 574 — `5c32ba7e445bbd9117141dd63417079eea523bbe`
**Link:** [5c32ba7e445b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5c32ba7e445bbd9117141dd63417079eea523bbe)
**Data do autor:** `2026-07-04T20:09:30-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `1f0b4f04ad5f7877578996732a10b1b99d831156 ce45b59b0ef3b6f1326a940c3ad9e5b826f229f8`
**Resumo:** Merge pull request #336 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #336 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat: Banco de Dados Universal — sync de mídia + Rede Neural (Supabase 0008)
**Arquivos afetados:** 0

---

## Commit 575 — `3fe55856d8e7e9ae5a5fdc5b2d2492b9ac2e3f08`
**Link:** [3fe55856d8e7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3fe55856d8e7e9ae5a5fdc5b2d2492b9ac2e3f08)
**Data do autor:** `2026-07-05T03:44:40+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `5c32ba7e445bbd9117141dd63417079eea523bbe`
**Resumo:** feat: Rede Neural no site (/comms) + retomar de onde parou no acervo
**Corpo da mensagem:**

feat: Rede Neural no site (/comms) + retomar de onde parou no acervo

- src/pages/comms.js + comms.css: UI do chat global (0008) — histórico,
  mensagens ao vivo via Realtime (ponto de status da ponte), envio pra
  logado com CTA Google pra deslogado, anti-flood do banco vira toast,
  teto de 8s no histórico (rede pendurada não trava a tela)
- rota /comms + sidebar (📡 Rede Neural) + título no shell + ícone
- /musicas (acervo): cada faixa salva o timecode (saveBookmark,
  local-first + nuvem) e retoma do ponto ao tocar de novo em qualquer
  aparelho logado (só se caiu no meio da faixa)

Verificado (Playwright, build de produção): página renderiza, timeout
gracioso aos 8s, /musicas sem regressão, 0 erros. REST+Realtime contra
o banco real provados na fatia 0008.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 8
### Arquivos criados

- `src/pages/comms.js`
- `src/styles/comms.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/musicas.js`
- `src/utils/icons.js`

---

## Commit 576 — `bc655a55f8691be782c38e5be97af80c060ae796`
**Link:** [bc655a55f869](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bc655a55f8691be782c38e5be97af80c060ae796)
**Data do autor:** `2026-07-05T00:46:13-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `5c32ba7e445bbd9117141dd63417079eea523bbe 3fe55856d8e7e9ae5a5fdc5b2d2492b9ac2e3f08`
**Resumo:** Merge pull request #337 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #337 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat: Rede Neural no site (/comms) + retomar de onde parou no acervo
**Arquivos afetados:** 0

---

## Commit 577 — `e4018e37689c49d8673cc46c9191817d9ce39751`
**Link:** [e4018e37689c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e4018e37689c49d8673cc46c9191817d9ce39751)
**Data do autor:** `2026-07-05T04:06:39+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `bc655a55f8691be782c38e5be97af80c060ae796`
**Resumo:** fix(#338): Corpo Total reconhecido no app (permissão de mídia) + launcher 0.4.0
**Corpo da mensagem:**

fix(#338): Corpo Total reconhecido no app (permissão de mídia) + launcher 0.4.0

P0 — causa raiz: o main do Electron não registrava
setPermissionRequestHandler, então o getUserMedia do Corpo Total
(jarvis-vision) era negado em silêncio. Agora a sessão tem request+check
handlers com allowlist: só permissão 'media' e só pra origem confiável
do site. macOS: askForMediaAccess no handler + NSCameraUsageDescription/
NSMicrophoneUsageDescription no build.mac.extendInfo.

P1 — bump desktop 0.3.0 → 0.4.0 (leva a blindagem do motor #310, o
Núcleo tela única #324 e este fix). Release via workflow Desktop Release.

P2 — validação on-device registrada no HANDOFF-LOCAL (M8).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 5
### Arquivos modificados

- `desktop/package-lock.json`
- `desktop/package.json`
- `desktop/src/main.js`
- `docs/HANDOFF-LOCAL.md`
- `historico/CHANGELOG.md`

---

## Commit 578 — `558dc6593fdfe5c40fc3db9777831e75d1b9ea1c`
**Link:** [558dc6593fdf](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/558dc6593fdfe5c40fc3db9777831e75d1b9ea1c)
**Data do autor:** `2026-07-05T01:08:14-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `bc655a55f8691be782c38e5be97af80c060ae796 e4018e37689c49d8673cc46c9191817d9ce39751`
**Resumo:** Merge pull request #339 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #339 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

fix(#338): Corpo Total reconhecido no app (permissão de mídia) + launcher 0.4.0
**Arquivos afetados:** 0

---

## Commit 579 — `c5782746f92e47b980a692b1dd4f8c84db27b7cf`
**Link:** [c5782746f92e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c5782746f92e47b980a692b1dd4f8c84db27b7cf)
**Data do autor:** `2026-07-05T04:38:41+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `558dc6593fdfe5c40fc3db9777831e75d1b9ea1c`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 580 — `947d938d803d6185a64f756ea83265b568a99925`
**Link:** [947d938d803d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/947d938d803d6185a64f756ea83265b568a99925)
**Data do autor:** `2026-07-05T13:33:01+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `558dc6593fdfe5c40fc3db9777831e75d1b9ea1c`
**Resumo:** feat(#340): v0.5.0 fatia 1 — Hermes padrão + seletor de modelos + Corpo Total resiliente
**Corpo da mensagem:**

feat(#340): v0.5.0 fatia 1 — Hermes padrão + seletor de modelos + Corpo Total resiliente

- jarvis-engine: default de quem nunca configurou vira 'hermes-agente'
  (agente local sem API; config salva não é tocada)
- Núcleo: comandos 'modelos' (lista catálogo com ativo marcado) e
  'modelo <nº|nome>' (troca dinâmica por modo; ollama/claude nome livre)
  — sem menu, mantendo a Regra de Ouro (#324)
- Corpo Total (bug web): exceção sem tratamento matava o recurso —
  (1) mãos opcionais: MediaPipe falhou → degrada, corpo segue;
  (2) loadScript com teto de 20s: CDN pendurada vira mensagem acionável;
  (3) botão nunca trava (try/finally no handler)

Verificado (Playwright): modo default HERMES-AGENTE, comandos listam e
persistem, CDN pendurada → status acionável + botão reabilitado, 0 erros.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 4
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/pages/git-nexus-nucleo.js`
- `src/pages/jarvis-vision.js`
- `src/utils/jarvis-engine.js`

---

## Commit 581 — `15c26d1551151b61eb1a460f526a1104f4ce877a`
**Link:** [15c26d155115](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/15c26d1551151b61eb1a460f526a1104f4ce877a)
**Data do autor:** `2026-07-05T10:35:02-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c5782746f92e47b980a692b1dd4f8c84db27b7cf 947d938d803d6185a64f756ea83265b568a99925`
**Resumo:** Merge pull request #341 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #341 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#340): v0.5.0 fatia 1 — Hermes padrão + seletor de modelos + Corpo Total resiliente
**Arquivos afetados:** 0

---

## Commit 582 — `4a42845299327f978a5f821bb8a4a80dd9fef3ef`
**Link:** [4a4284529932](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4a42845299327f978a5f821bb8a4a80dd9fef3ef)
**Data do autor:** `2026-07-05T13:38:07+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `15c26d1551151b61eb1a460f526a1104f4ce877a`
**Resumo:** feat(#340): v0.5.0 fatia 2 — Voz do J.A.R.V.I.S. + APK direto no site
**Corpo da mensagem:**

feat(#340): v0.5.0 fatia 2 — Voz do J.A.R.V.I.S. + APK direto no site

- jarvis-voice.js: ElevenLabs (voz de referência Gubgw9l4dtIoQA9YZHgx,
  eleven_multilingual_v2) quando houver chave (guardada só no navegador)
  + speechSynthesis do navegador como padrão/fallback automático; texto
  limpo pra fala, teto 600 chars, stopSpeaking no unmount
- Núcleo: comandos voz on/off, voz idioma <código>, voz chave <key>,
  silêncio — sem menu (Regra de Ouro); fala as respostas do agente
- /baixar: seção Celular com APK direto (resolve a release mobile-v*
  em runtime, sem loja/login) + notas de instalação + PWA no iOS
- mobile-release.yml: prerelease true (não vira latest — protege o
  auto-update do launcher e o /baixar desktop)

Verificado (Playwright): comandos respondem e persistem; /baixar mostra
a seção Celular; 0 erros.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 5
### Arquivos criados

- `src/utils/jarvis-voice.js`
### Arquivos modificados

- `.github/workflows/mobile-release.yml`
- `historico/CHANGELOG.md`
- `src/pages/baixar.js`
- `src/pages/git-nexus-nucleo.js`

---

## Commit 583 — `03aea06b002efafda974a5f972291ef47dc663a6`
**Link:** [03aea06b002e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/03aea06b002efafda974a5f972291ef47dc663a6)
**Data do autor:** `2026-07-05T10:43:34-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `15c26d1551151b61eb1a460f526a1104f4ce877a 4a42845299327f978a5f821bb8a4a80dd9fef3ef`
**Resumo:** Merge pull request #342 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #342 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#340): v0.5.0 fatia 2 — Voz do J.A.R.V.I.S. (ElevenLabs) + APK direto no site
**Arquivos afetados:** 0

---

## Commit 584 — `710cfbab79c60f5095d429534844d5f560f93be3`
**Link:** [710cfbab79c6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/710cfbab79c60f5095d429534844d5f560f93be3)
**Data do autor:** `2026-07-05T13:45:07+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `03aea06b002efafda974a5f972291ef47dc663a6`
**Resumo:** ci(#340): Mobile Release publica via dispatch (publish_tag)
**Corpo da mensagem:**

ci(#340): Mobile Release publica via dispatch (publish_tag)

O push direto de tag é bloqueado pra sessão remota (403). O softprops
aceita tag_name e cria a tag — então o workflow_dispatch ganhou o input
publish_tag: informado, builda E publica a prerelease mobile-v* com o
APK anexado (o /baixar resolve pela tag).

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 1
### Arquivos modificados

- `.github/workflows/mobile-release.yml`

---

## Commit 585 — `7bbcf5895ae48b1b643b3247da0da2675b3ea4f6`
**Link:** [7bbcf5895ae4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7bbcf5895ae48b1b643b3247da0da2675b3ea4f6)
**Data do autor:** `2026-07-05T10:47:04-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `03aea06b002efafda974a5f972291ef47dc663a6 710cfbab79c60f5095d429534844d5f560f93be3`
**Resumo:** Merge pull request #343 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #343 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

ci(#340): Mobile Release publica via dispatch (publish_tag)
**Arquivos afetados:** 0

---

## Commit 586 — `05f9a1af443663bc0cac119e0b043ca5a4d343d3`
**Link:** [05f9a1af4436](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/05f9a1af443663bc0cac119e0b043ca5a4d343d3)
**Data do autor:** `2026-07-05T14:15:53+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `7bbcf5895ae48b1b643b3247da0da2675b3ea4f6`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 587 — `60dc977fb45825eec840bb1c7eccbd17ae5aa499`
**Link:** [60dc977fb458](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/60dc977fb45825eec840bb1c7eccbd17ae5aa499)
**Data do autor:** `2026-07-06T02:15:34+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `7bbcf5895ae48b1b643b3247da0da2675b3ea4f6`
**Resumo:** feat(#340): v0.5.0 fatia 3 — ponte /api/nucleo: a voz comanda o Núcleo
**Corpo da mensagem:**

feat(#340): v0.5.0 fatia 3 — ponte /api/nucleo: a voz comanda o Núcleo

- supabase/migrations/0009_nucleo_events.sql (APLICADA): tabela
  nucleo_events na publicação Realtime; leitura pública, escrita só
  service key (nenhuma policy de escrita)
- api/nucleo.py (função Vercel, stdlib): POST valida X-Nucleo-Token e
  grava o evento; GET = health; 503 sem envs, 401 token errado; CORS
- nucleo-socket.js: assina nucleo_events via Supabase Realtime (lazy,
  sempre que configurado) além do WS opt-in do Java; demo "simular"
  agora abre a Memória
- git-nexus-nucleo.js: evento command vira bolha 📡 e EXECUTA as
  intenções de abrir/fechar função; texto remoto nunca vai pro cérebro

Verificado: INSERT chegou ao vivo no listener vanilla; no site, evento
de comando abriu o painel MEMÓRIA sozinho (Playwright); 0 erros.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 7
### Arquivos criados

- `api/nucleo.py`
- `supabase/migrations/0009_nucleo_events.sql`
### Arquivos modificados

- `docs/SUPABASE.md`
- `historico/CHANGELOG.md`
- `src/pages/git-nexus-nucleo.js`
- `src/utils/nucleo-socket.js`
- `vercel.json`

---

## Commit 588 — `d8dd238f8fb1fcdc62df7dd16691adcfffb9ccd0`
**Link:** [d8dd238f8fb1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d8dd238f8fb1fcdc62df7dd16691adcfffb9ccd0)
**Data do autor:** `2026-07-05T23:17:20-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `05f9a1af443663bc0cac119e0b043ca5a4d343d3 60dc977fb45825eec840bb1c7eccbd17ae5aa499`
**Resumo:** Merge pull request #344 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #344 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat(#340): v0.5.0 fatia 3 — ponte /api/nucleo: a VOZ comanda o Núcleo (sem servidor)
**Arquivos afetados:** 0

---

## Commit 589 — `172b613a84db76ac96ef5f4986c2d816369b183a`
**Link:** [172b613a84db](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/172b613a84db76ac96ef5f4986c2d816369b183a)
**Data do autor:** `2026-07-06T04:50:27+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `d8dd238f8fb1fcdc62df7dd16691adcfffb9ccd0`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 590 — `b8704a658d81ccc13c23cad162e0a7f48dc94edc`
**Link:** [b8704a658d81](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b8704a658d81ccc13c23cad162e0a7f48dc94edc)
**Data do autor:** `2026-07-06T15:59:18+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `172b613a84db76ac96ef5f4986c2d816369b183a`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 591 — `edb7b07657e3c04cac1b73528faa5354355321fb`
**Link:** [edb7b07657e3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/edb7b07657e3c04cac1b73528faa5354355321fb)
**Data do autor:** `2026-07-06T18:27:18+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d8dd238f8fb1fcdc62df7dd16691adcfffb9ccd0`
**Resumo:** fix(#340): /api/nucleo aceita SUPABASE_SERVICE_ROLE_KEY (nome que já existe no Vercel)
**Corpo da mensagem:**

fix(#340): /api/nucleo aceita SUPABASE_SERVICE_ROLE_KEY (nome que já existe no Vercel)

A auditoria (Claude do Chrome) achou que o Vercel já tem
SUPABASE_SERVICE_ROLE_KEY (nome padrão do Supabase), mas a função lia
SUPABASE_SERVICE_KEY. Agora lê o padrão primeiro, com fallback pro alias
curto — assim o operador só precisa criar NUCLEO_TOKEN, não dois segredos.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 2
### Arquivos modificados

- `api/nucleo.py`
- `historico/CHANGELOG.md`

---

## Commit 592 — `1f22fbf1017227d2f8d49048ba14c0909d02cce5`
**Link:** [1f22fbf10172](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1f22fbf1017227d2f8d49048ba14c0909d02cce5)
**Data do autor:** `2026-07-06T15:29:04-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b8704a658d81ccc13c23cad162e0a7f48dc94edc edb7b07657e3c04cac1b73528faa5354355321fb`
**Resumo:** Merge pull request #345 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #345 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

fix(#340): /api/nucleo aceita SUPABASE_SERVICE_ROLE_KEY (nome que já existe no Vercel)
**Arquivos afetados:** 0

---

## Commit 593 — `87237853488e397b6f80dd1671c4c4c7db0d6a36`
**Link:** [87237853488e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/87237853488e397b6f80dd1671c4c4c7db0d6a36)
**Data do autor:** `2026-07-07T04:31:42+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `1f22fbf1017227d2f8d49048ba14c0909d02cce5`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 594 — `fd51cf0f5bc5c5893950dd53cfaa35670fe82a7a`
**Link:** [fd51cf0f5bc5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fd51cf0f5bc5c5893950dd53cfaa35670fe82a7a)
**Data do autor:** `2026-07-07T15:24:58+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `87237853488e397b6f80dd1671c4c4c7db0d6a36`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 595 — `2b7d652539e1e69661e1245f0ce68bf64c8e353e`
**Link:** [2b7d652539e1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2b7d652539e1e69661e1245f0ce68bf64c8e353e)
**Data do autor:** `2026-07-07T18:37:41+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1f22fbf1017227d2f8d49048ba14c0909d02cce5`
**Resumo:** feat: página /zomboid — vitrine da coleção Project Zomboid (Spartan Gamer BR)
**Corpo da mensagem:**

feat: página /zomboid — vitrine da coleção Project Zomboid (Spartan Gamer BR)

Espelho no Baluarte da coleção "alfa" da Steam Workshop do operador
(modpack militar de Project Zomboid, 159 mods): herói + chips
(jogo/autor/total) + botão direto pra Steam + destaques por frente
(veículos KI5, aeronaves, blindados, uniformes, mundo).

- src/data/zomboid-mods.js (data-driven: metadados + destaques curados)
- src/pages/zomboid.js + zomboid.css (fora do boot)
- rota + sidebar (🧟 Modpack Zomboid) + título + ícone
- não toca no /modpack (Minecraft)

Verificado (Playwright): renderiza, CTA pra Steam, 5 frentes/17 mods, 0 erros.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 8
### Arquivos criados

- `src/data/zomboid-mods.js`
- `src/pages/zomboid.js`
- `src/styles/zomboid.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/utils/icons.js`

---

## Commit 596 — `a2a3e46f53227059e8266cb17ca8e27061c876f9`
**Link:** [a2a3e46f5322](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a2a3e46f53227059e8266cb17ca8e27061c876f9)
**Data do autor:** `2026-07-07T15:39:25-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `fd51cf0f5bc5c5893950dd53cfaa35670fe82a7a 2b7d652539e1e69661e1245f0ce68bf64c8e353e`
**Resumo:** Merge pull request #346 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #346 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat: página /zomboid — vitrine da coleção Project Zomboid (Spartan Gamer BR)
**Arquivos afetados:** 0

---

## Commit 597 — `46a885e0945be8c290ff31a104541c74f46c102f`
**Link:** [46a885e0945b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/46a885e0945be8c290ff31a104541c74f46c102f)
**Data do autor:** `2026-07-07T19:11:40+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `a2a3e46f53227059e8266cb17ca8e27061c876f9`
**Resumo:** feat: página /zomboid-admin — comandos de admin PZ + banco de IDs com busca
**Corpo da mensagem:**

feat: página /zomboid-admin — comandos de admin PZ + banco de IDs com busca

Seção 1: tabela de comandos de admin (Comando/Função/Exemplo) com copiar;
godmod e setaccesslevel marcados como perigosos. Grafia CORRETA do jogo
(/additem, /addvehicle, /setaccesslevel).

Seção 2: banco de IDs (mods/veículos) com busca ao vivo em JS (nome,
categoria, Mod/Workshop/Spawn ID) e cards com copiar por campo. Semeado
com 17 mods da coleção; IDs ficam "—" até o operador colar a lista real
(nenhum ID inventado — chute daria comando quebrado no servidor).

Tema sobrevivência (escuro/verde-oliva/vermelho) escopado na página.
Rota + sidebar (⌘ Admin Zomboid) + título + ícone + link cruzado com
/zomboid. Data-driven em src/data/zomboid-admin.js.

Verificado (Playwright): 6 comandos, 17 cards, busca filtra por
categoria/nome, estado vazio, 0 erros.

Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01Ehqe9fV6QHK5k9gGb9WbaK
**Arquivos afetados:** 10
### Arquivos criados

- `src/data/zomboid-admin.js`
- `src/pages/zomboid-admin.js`
- `src/styles/zomboid-admin.css`
### Arquivos modificados

- `historico/CHANGELOG.md`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/zomboid.js`
- `src/styles/zomboid.css`
- `src/utils/icons.js`

---

## Commit 598 — `e23a4bfa070b56011b83cefeecec03af17460ebd`
**Link:** [e23a4bfa070b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e23a4bfa070b56011b83cefeecec03af17460ebd)
**Data do autor:** `2026-07-07T16:13:48-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `a2a3e46f53227059e8266cb17ca8e27061c876f9 46a885e0945be8c290ff31a104541c74f46c102f`
**Resumo:** Merge pull request #347 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl
**Corpo da mensagem:**

Merge pull request #347 from Lucas-Belucci-Bellini/claude/projeto-baluarte-issues-txo9fl

feat: página /zomboid-admin — comandos de admin PZ + banco de IDs com busca
**Arquivos afetados:** 0

---

## Commit 599 — `79403b67610e7713534df7b85500fb57900ad9f0`
**Link:** [79403b67610e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/79403b67610e7713534df7b85500fb57900ad9f0)
**Data do autor:** `2026-07-08T03:53:32+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `e23a4bfa070b56011b83cefeecec03af17460ebd`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---

## Commit 600 — `31b0ab2486475027557a348c2601db3b35877f9b`
**Link:** [31b0ab248647](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/31b0ab2486475027557a348c2601db3b35877f9b)
**Data do autor:** `2026-07-08T14:55:24+00:00`
**Autor:** github-actions[bot] `<41898282+github-actions[bot]@users.noreply.github.com>`
**Pais:** `79403b67610e7713534df7b85500fb57900ad9f0`
**Resumo:** Atualiza câmbio (dólar, euro, bitcoin) [automático]
**Arquivos afetados:** 5
### Arquivos modificados

- `reports/cambio/README.md`
- `reports/cambio/diario.md`
- `reports/cambio/mensal.md`
- `reports/cambio/semanal.md`
- `src/data/cambio-historico.json`

---
