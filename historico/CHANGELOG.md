# 📜 Histórico de Alterações — Projeto Baluarte

Registro do que entra no `main`. Fluxo de segurança: **antes de cada merge** é
criada uma branch de backup (`backup/AAAA-MM-DD-...`); **depois** registra-se
aqui o que mudou.

---

## 2026-06-14

### App desktop (Baluarte Launcher) — M2: ponte IPC allowlisted (#222)
- 🔐 **Fronteira de segurança renderer↔nativo** (`desktop/src/ipc.js`): toda chamada nativa passa por **um funil único** `window.baluarte.invoke(channel, payload)` → canal `baluarte:invoke` no main, validado por três camadas: **remetente** (só a janela principal), **allowlist** explícita de canais, e **payload** validado por cada handler. O renderer nunca recebe `ipcRenderer` cru, FS ou `require`.
- 🧩 **Canais do M2** (a UI da web pode usar em "modo nativo"): `ping`, `app:info` (nome/versão/plataforma/arch/online), `app:openExternal` (abre link http/https no navegador, validado contra `file:`/`javascript:`), `app:reload`.
- 🧱 É o encaixe pronto pro **M3**: os handlers `nexus.*` (motor real do GitNexus) plugam direto na allowlist, sem reabrir a fronteira.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m2`.

### App desktop (Baluarte Launcher) — M1: casca de launcher (#222)
- 🪟 **Splash de abertura** (`splash.html`): núcleo arc-reactor animado enquanto o hub carrega; some quando a página fica pronta (com trava de segurança de 12s pra nunca prender).
- 🔔 **System tray**: ícone na bandeja com menu (Mostrar / Recarregar / Sair). **Fechar a janela minimiza pra bandeja** (estilo Steam/launcher) — o app só encerra de fato no "Sair"; clicar no ícone alterna mostrar/esconder. `before-quit` garante que Cmd+Q / shutdown saem mesmo (não ficam presos na bandeja).
- 🔗 **Deep-link `baluarte://<rota>`**: instância única (`requestSingleInstanceLock`) + handlers de `open-url` (macOS) e `second-instance`/argv (Win/Linux). Ex.: `baluarte://git-nexus` foca a janela e navega pra `#/git-nexus`. A rota é **sanitizada** antes de entrar na URL (sem injeção).
- 🟢 **Indicador de conexão (online/offline)**: o preload relata `navigator.onLine`; o estado aparece na **bandeja** (tooltip + linha "Conectado ao hub" / "Offline (modo local)") e no **título** da janela. A UI da web pode ler `window.baluarte.isOnline()`.
- 🔒 Postura de segurança mantida (isolamento, sem nodeIntegration, sandbox, navegação presa às origens confiáveis).
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m1`.

### App desktop (Baluarte Launcher) — M0: esqueleto Electron + auto-update (#222)
- 🚀 **Novo diretório `desktop/`**: o começo do **launcher nativo** em Electron, o caminho pra rodar as versões pesadas que o site estático não roda (o motor real do GitNexus em `GitNexus-1.6.7/` é Node nativo — tree-sitter, LadybugDB — e não cabe no Vercel). Plano completo no RFC da issue **#222**.
- 🌐 **Conexão com a web**: a janela carrega a **mesma UI Vite da produção** (`projeto-baluarte.vercel.app`) — o deploy web já é o canal de atualização instantâneo da interface. **Fallback offline** embutido (`../dist` → `resources/web`, e `offline.html` em último caso).
- 🔄 **Auto-update da casca**: `electron-updater` apontando pras **GitHub Releases**; workflow `desktop-release.yml` builda Win/Mac/Linux e publica os instaladores numa tag `desktop-v*`. Loop: `build → tag → instalador na Release → app se atualiza sozinho`.
- 🔒 **Segurança desde o M0**: `contextIsolation`, sem `nodeIntegration`, sandbox, navegação/links presos às origens confiáveis. `window.baluarte.native` deixa a UI detectar quando roda dentro do launcher (pro "modo nativo" futuro).
- 🎨 Ícone arc-reactor (ciano/magenta) gerado sem dependência (`build/make-icon.mjs`).
- 📦 `desktop/` excluído do deploy Vercel (`.vercelignore`); runtime dep (`electron-updater`) sem vulnerabilidades — os alertas do `npm audit` são todos do toolchain de build (electron-builder), que não vai pro app.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m0`.

### Home — herói 3D imersivo em WebGL (#195)
- 🌌 **Hero WebGL**: a home agora abre com uma cena 3D de verdade — **nebulosa volumétrica de 3.600 partículas** (disco galáctico + halo) renderizada em **WebGL 1.0 puro, sem dependência**, com *blending* aditivo (brilho real) nas cores do projeto (ciano/magenta/branco).
- 💠 **Núcleo arc-reactor estilo JARVIS**: 5 anéis 3D de orbes luminosos girando em eixos diferentes + ponto central pulsante no miolo da nebulosa. (Render como *point-sprites* porque `gl.LINES` com espessura é ignorado na maioria das GPUs — assim o núcleo lê nítido sobre a nebulosa.)
- 🎥 **Câmera que se move como o JARVIS**: orbita com o **parallax do mouse** e **mergulha com o scroll** (*fly-through*), além da auto-rotação contínua.
- ♿ **Degradação graciosa**: se o WebGL não compilar/existir, cai automaticamente no campo de partículas 2D antigo (`hero3d.js`); respeita `prefers-reduced-motion` (assenta a cena, não gira) e pausa com a aba oculta. *Frame loop* auto-dimensionável e auto-encerrável (robusto a remontagem do router).
- ✅ Verificado no navegador (Playwright/WebGL): `is-webgl` ativo, contexto `webgl`, nebulosa + anéis renderizando atrás do título.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-hero-webgl`.

### Git Nexus — Console com as ferramentas do GitNexus (#204/#195)
- 🖥 **Console do Nexus**: terminal na página que traz as **4 ferramentas canônicas do GitNexus** sobre o grafo (arquivos ou funções), em JS puro:
  - **`context <X>`** — definição + quem chama/importa + o que chama/importa.
  - **`impact <X> [down]`** — raio de explosão com **nível de risco** (BAIXO→CRÍTICO, como o GitNexus exige antes de editar). Ex: `impact helpers` = risco CRÍTICO, 115 afetados.
  - **`path <A> <B>`** — menor caminho de chamadas/imports entre dois símbolos.
  - **`rename <X>`** — quantos usos um rename seguro tocaria (entende o grafo, não é find-and-replace). Ex: `rename toast` = 50 usos.
  - **`query <texto>`** (ou texto livre) — busca no grafo.
  Cada resultado vem com chips clicáveis que selecionam o nó no orbe 3D.
- ✅ Verificado no navegador (Playwright): as 5 ferramentas respondendo, badges de risco (BAIXO/CRÍTICO) aparecendo.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-gitnexus-console`.

## 2026-06-13

### Git Nexus — drill-down por arquivo + herança + codemap atualizado (#204/#195)
- 🔎 **Drill-down**: no modo Arquivos, ao selecionar um arquivo aparece o botão "ƒ ver as N funções deste arquivo →" que abre um **grafo 3D focado** só nas funções daquele arquivo + suas conexões de 1 salto (quem elas chamam / quem as chama). Migalha "← arquivos" pra voltar. Navegação em dois níveis, como no GitNexus.
- 🧬 **Herança (EXTENDS)**: o extrator agora capta `class X extends Y` e emite arestas EXTENDS (além de CALLS) — ex: `ReplaySource → MockSource` no radar.
- 🔄 **`codemap.json` regenerado**: estava defasado (08/06, 158 arquivos); agora reflete o `src/` atual — **187 arquivos**, 438 imports, incluindo as páginas novas (aprendizado, git-nexus, apis…) e o `jarvis-brain.js`. O grafo de arquivos do Git Nexus e do Raio-X passam a mostrar o site de hoje.
- ✅ Verificado no navegador (Playwright): drill-down de `jarvis-brain.js` (20 funções, 78 chamadas), seleção de função no foco, e volta aos 187 arquivos.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-gitnexus-drill`.

### Git Nexus — nível de FUNÇÕES (call graph 3D) (#204/#195)
- ƒ **Toggle "Arquivos / Funções"** no Git Nexus: além do grafo de arquivos+imports, agora tem o grafo das **principais funções/classes + as chamadas entre elas** — o nível profundo que faltava do GitNexus.
- 🧬 **`scripts/gen-symbols.mjs` novo** (build-time, sem dependências): parser leve que extrai de `src/` **1137 funções/classes** e **2456 chamadas** (call graph), gerando `src/data/codemap-symbols.json`. Rastreia parênteses para não se confundir com params desestruturados.
- 🌐 No modo Funções, o mesmo orbe 3D mostra as **240 funções mais conectadas**: comunidades = clusters de funções que se chamam, PageRank = funções mais centrais, e **impacto = cadeia de chamadas** (quem quebra se você mudar a função). Ex: `addMemory` é chamada por 7, chama 6, e afeta 8 funções na cadeia.
- 🔎 Busca, seleção e painel adaptados (mostra kind/arquivo/linha da função).
- ⚙️ `npm run gen-symbols` / `gen-codemap` adicionados aos scripts.
- ✅ Verificado no navegador (Playwright): troca de modo, orbe de funções girando, seleção mostrando call-chain e impacto.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-gitnexus-funcoes`.

### Git Nexus em 3D — orbe que gira como o JARVIS (#195/#204)
- 🌐 **Grafo do Git Nexus agora é 3D** (pedido do operador no #195: "tem que ter isso em 3D o jeito que ele se organiza, e ele tem que se mover igual ao jarvis"). `git-nexus-graph3d.js` novo: orbe de nós que **se auto-organiza por forças em 3D**, projetado em perspectiva no canvas, **girando sozinho** (vivo, estilo núcleo do JARVIS) — referência das imagens que o operador anexou.
- ✨ Profundidade real: nós perto = maiores/brilhantes, longe = menores/apagados; glow por comunidade, tamanho por centralidade; pintura ordenada por profundidade.
- 🕹️ **Arraste para girar** (com inércia), hover realça a vizinhança, clique seleciona → painel de impacto. Tudo em Canvas 2D puro (sem WebGL/Three) — roda leve no navegador e na Vercel.
- ♿ Respeita `prefers-reduced-motion` (assenta o orbe e não gira sozinho).
- ✅ Verificado no navegador (Playwright): orbe girando (assinatura de pixels muda entre frames), seleção de `helpers.js` mostrando impacto de 92 arquivos em 3D.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-gitnexus-3d`.

### Redesign — polish do Git Nexus + Arsenal (#195/#204)
- 🔗 **Git Nexus mais cinematográfico**: brilho (glow) nos nós do grafo, realce mais forte no hover, fundo do grafo com brilhos radiais + vinheta e título em degradê.
- 🔫 **Arsenal alinhado ao redesign** (só visual, lógica intocada): título em degradê, linhas com glow e acento cyan no hover/seleção, painel de detalhe com fundo cyan e nome em degradê, abas em pílula.
- 🖼️ Screenshots do Git Nexus enviados ao operador.
- ✅ Verificado no navegador (Playwright): grafo com glow, Arsenal com 251 linhas e seleção realçada.

### Redesign — Hub de Ferramentas (#195, página 1/N)
- ⚙ **`/ferramentas` redesenhada** no estilo do redesign: título em degradê, busca proeminente, chips de categoria com **cor própria por categoria** e contagem, e os 51 cards com **acento colorido**, badges NOVO/PRONTO/ROADMAP e **tilt 3D no hover**. Os dados/rotas/busca foram preservados — só a camada visual mudou.
- 🧭 **#195 segue aberto como guarda-chuva** do redesign (a pedido do operador): as páginas serão redesenhadas aos poucos, uma por PR. Esta é a primeira página de conteúdo depois da Home.
- 🐛 Estado da página (grid/busca/filtro) virou **local por invocação** (era global — a página é instanciada 2x e o filtro atualizava o grid errado).
- ✅ Verificado no navegador (Playwright): 51 cards, filtro cripto → 9, busca "morse" → 1, tilt no hover.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-ferramentas`.

### Redesign — rodada 2: atmosfera + 3D manipulável + scrollytelling (#195)
- 🌆 **Grid de horizonte (synthwave / GTA-VI)** no herói: chão em perspectiva que recua até um horizonte com brilho, linhas "voando" em direção ao observador — fundo animado que dá profundidade cinematográfica (`hero3d.js`).
- 🕹️ **Emblema 3D manipulável**: agora dá pra **arrastar para girar** o emblema, com inércia — ideia literal do #195 ("objetos 3D manipuláveis").
- 📜 **Scrollytelling**: ao rolar, o herói recua e desbota suavemente (parallax de scroll).
- ⌨️ **Tipografia cyberpunk**: efeito glitch/scramble revelando o kicker "NÚCLEO INFINITY DREADNOUGHT" ao abrir.
- ♿ Tudo respeita `prefers-reduced-motion` (grid estático, sem glitch/inércia).
- ✅ Verificado no navegador (Playwright): grid desenhando (49k px no chão), arraste girando o emblema (102°), scroll desbotando as camadas, glitch assentando no texto.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-redesign-r2`.

### Redesign 3D promovido a Home oficial (#195/#196)
- 🏠 **A `/home` agora é o visual 3D imersivo** (a pedido do operador — "promover pra Home oficial"). O herói cinematográfico (campo de partículas 3D + emblema giratório + título em degradê) substitui a home antiga, com saudação ao operador e CTAs para Ferramentas e J.A.R.V.I.S.
- 🔭 **Conteúdo da home antiga integrado ao novo visual**: os painéis de **Vigilância** (log de eventos ao vivo) e **Infraestrutura** (status do sistema) foram redesenhados no estilo do herói, em vez de descartados — agora citam Git Nexus e ML.
- 🗂️ Mantém as **prateleiras estilo Steam** (Arsenal/Equipes/Universos/Crônicas com tilt 3D), métricas reais com count-up e acesso rápido (agora com Git Nexus e ML no topo).
- ♻️ **Limpeza**: a rota de preview `/home-3d` foi aposentada (vira alias da home, pra não quebrar links antigos), o item "Ponte 3D · preview" saiu do menu e o `home3d.js` foi removido (o código vive na `home.js`).
- ✅ Verificado no navegador (Playwright): herói com partículas, sem badge de preview, métricas reais, Vigilância (5) + Infra (5) integradas, 4 prateleiras com 48 cards, alias `/home-3d` funcionando.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-home-oficial`.

### Git Nexus — núcleo unificado de código (#204/#194)
- 🔗 **`/git-nexus` novo**: integração do GitNexus ao site, do jeito que **realmente roda na Vercel**. O GitNexus original é um servidor Node na porta 4747 (tree-sitter nativo, onnxruntime, LadybugDB) — não sobe num site estático, e a versão "WASM no navegador" que o README promete não existe no código. Então reimplementei os **conceitos** dele em **JS puro**: taxonomia de nós/arestas de código, **comunidades** (clusters não-supervisionados), **análise de impacto** (quem é afetado se um arquivo mudar) e **centralidade (PageRank)**.
- 🧩 **Funde as 4 ferramentas** que viviam separadas, agora conversando pelo grafo: 🔬 Raio-X do Código (o grafo), 🧠 Memória do JARVIS (memórias ligadas a cada arquivo), 🕸️ Segundo Cérebro (conceitos) e 📈 Mini-LLM/ML (as comunidades são "assuntos do código" descobertos sozinho — o mesmo princípio do `/aprendizado`).
- 🗺️ **Visualização interativa** (`git-nexus-graph.js`): grafo force-directed em canvas, nós coloridos por comunidade e dimensionados por centralidade; passar o mouse realça a vizinhança, clicar abre o painel de impacto/dependências/memória do arquivo. Busca por nome.
- 🧠 **Motor** (`git-nexus-engine.js`): puro e determinístico, sobre o `codemap.json` (158 arquivos, 350 imports). Detecta 5 comunidades (pages, utils, subsistemas terminal e radar…), aponta `helpers.js` como mais central, e calcula que mudá-lo afeta 92 arquivos.
- 🔄 **Não-destrutivo**: as 4 páginas originais seguem acessíveis; o Git Nexus é o novo hub que as une. Item "🔗 Git Nexus" no topo do menu IA & Jarvis.
- ✅ Verificado no navegador (Playwright) e no Node (motor determinístico).
- 🛡️ Backup: `backup/2026-06-13-pre-merge-git-nexus`.

### Deploy da Vercel consertado — bundle das funções + submódulos (#210)
- 🚑 **Deploy estava FALHANDO**: o build do front (Vite) passava, mas o bundle das funções Python (`api/`) estourava o limite de **245 MB** da Lambda (489,96 MB) — o builder empacotava o repositório inteiro, incluindo pastas enormes commitadas (`Humanity always first` 172 MB, `GitNexus-1.6.7` 139 MB, `.obsidian` 43 MB, `.smart-env` 19 MB) e os PDFs das Crônicas (~30 MB). Nada disso é usado pelo site (os dados de runtime ficam em `src/data/*`).
- 📦 **`.vercelignore` novo**: exclui esse peso morto do deploy (não-destrutivo — os arquivos continuam no repositório). O bundle cai de ~490 MB para ~60 MB.
- 🧹 **Submódulos-fantasma removidos**: `gemini-cli`, `hermes-agent` e `NawfalMotii79-PLFM_RADAR-…` eram gitlinks órfãos (sem `.gitmodules`) — causavam o aviso "Failed to fetch one or more git submodules". Eram pastas vazias e nada no código os importava (só havia menções de inspiração em comentários).
- ⬆️ **Node fixado em `22.x`** no `package.json` (era `>=18`) — remove o aviso da Vercel sobre upgrade automático de major e torna o build reproduzível.
- ✅ Verificado: `vite build` continua passando e as funções Python compilam; nenhum código de runtime busca os arquivos excluídos.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-deploy-fix`.

### Página piloto do redesign 3D imersivo (#195/#196)
- 🧊 **`/home-3d` — Ponte de Comando 3D (preview)** nova: página **piloto** do redesign, **não-disruptiva** (não toca na `/home` atual; tem badge "PREVIEW" e link "↩ ver a Home atual"). Junta o que os dois issues pedem — 3D imersivo e interativo (#195) com fidelidade cinematográfica + organização de conteúdo estilo Steam (#196) — em **JS/CSS puro, zero dependência** (consistência técnica).
- ✨ **Herói cinematográfico**: campo de partículas 3D em canvas (`hero3d.js`, perspectiva + parallax de mouse + constelação), emblema giratório em CSS 3D (anéis cyan/magenta), título em degradê com glow, HUD ao vivo (relógio + status) e CTAs.
- 🎚️ **Faixa de métricas reais** com contagem animada (Arsenal 251 · Equipes 26 · Arcos 24 · Capítulos 33 · Universos 21).
- 🗂️ **Prateleiras estilo Steam** (scroll horizontal, cards com **tilt 3D no hover**) alimentadas por **dados reais**: Arsenal, Equipes de Elite (cor por equipe), Universos (ícone/cor) e Crônicas. Mais grade de **acesso rápido**.
- ♿ **Leve e acessível**: respeita `prefers-reduced-motion`, pausa o canvas com a aba oculta, scroll-reveal das seções e limpeza de rAF/observers ao sair da página. O loop do herói se auto-dimensiona e se auto-encerra (imune a remontagem da página).
- ✅ Verificado no navegador (Playwright): partículas desenhando, métricas reais, 4 prateleiras com 12 cards cada (M9 Beretta, ALFA "Vanguarda da Manhã", universo Baluarte…), parallax e reveal funcionando. Screenshots do herói e das prateleiras.
- 🛡️ Backup: `backup/2026-06-13-pre-merge-home3d`.

### Painel de Machine Learning da Memória (#193/#194)
- 📈 **`/aprendizado` — Machine Learning da Memória** nova (menu IA & Jarvis): painel onde dá pra **ver o aprendizado de máquina do site acontecer** sobre o banco de memórias (conversas + respostas + deliberações do conselho). Tudo roda no navegador e é **🔒 somente leitura** sobre a memória (como o #193 pede — ninguém altera o banco por aqui).
- 🧩 **Assuntos descobertos sozinho** (`memory-ml.js` novo): **k-means não-supervisionado** sobre vetores TF-IDF (cosseno, init k-means++ determinístico) — o site lê as memórias e descobre os temas sem ninguém rotular. Controle deslizante de 2 a 8 assuntos.
- 📊 **Curva de aprendizado** (vocabulário acumulado, lei de Heaps), **ranking TF-IDF** dos termos aprendidos e **donut por origem** dos dados — todos no motor de gráficos em canvas do site.
- ⚙️ **Treinar modelo ao vivo**: a rede neural bigrama (`llm-mini.js`, gradiente de verdade) aprende a "falar" a partir das próprias memórias e mostra a **loss caindo** em tempo real (curva animada) + geração no estilo do Baluarte.
- 🔗 **Conexões** com o **Segundo Cérebro** (`/cerebro`) e o **Git Nexus / Raio-X** (`/codigo`) — fecha o ciclo que o #194 pede (ML junto do knowledge graph e do código).
- ◐ Sem memórias suficientes no navegador, o painel aprende sobre um corpus de demonstração (rotulado) e oferece sincronizar o banco versionado do repositório.
- ✅ Verificado no navegador (Playwright): k-means rende 4→6 assuntos coerentes ao mover o controle, os 3 gráficos desenham, o treino derruba a loss (3.40 → 2.27, −33%) e a geração responde. Motor `memory-ml.js` testado direto (k-means determinístico).
- 🛡️ Backup: `backup/2026-06-13-pre-merge-ml-memoria`.

## 2026-06-11

### Claude (servidor) vira modo do JARVIS e membro do Conselho (#200, parte 2)
- 🛰 **Modo novo no `/jarvis`**: "Claude (servidor)" — conversa com o Claude pelo `/api/claude`, com a chave na Vercel (nunca no navegador). É só escolher o modo no ⚙ e conversar.
- ⚖️ **Conselho de IAs com mais um membro**: o Claude (servidor) agora delibera junto com JARVIS Local, Gemini e Hermes, recebendo o mesmo contexto compartilhado (dossiê + memória durável + estado do site). Sem chave no servidor, ele degrada para "⚠ Indisponível." sem quebrar o conselho.
- 🧑‍⚖️ **Moderador-reserva do consenso**: se o Hermes (moderador titular) falhar na síntese, o Claude assume; o Gemini segue como última reserva.
- ✅ Verificado no navegador (Playwright + mock do `/api` no contrato real): resposta do Claude no chat do JARVIS, card "Claude (servidor)" no Conselho e consenso fechado "por Claude (reserva)" com Gemini/Hermes fora do ar.
- 🛡️ Backup: `backup/2026-06-11-pre-merge-claude-conselho`.

### Central de APIs + Claude no servidor (#200)
- 🔑 **`/apis` — Central de APIs** nova (menu IA & Jarvis): detecta, testa e gerencia as IAs do site num painel só. **Detecção no servidor**: o `/api/health` agora informa quais chaves existem na Vercel (só existe/não-existe — o valor nunca sai do servidor) e **qual env** a chave Claude usa. **Testes por provedor**: JARVIS Local, Claude (navegador, 1 token), Claude (servidor), Gemini, Hermes e Ollama, com latência e erro legível. **Cofre local**: chaves nomeadas mascaradas no localStorage (👁/copiar/excluir) e botão "Usar no JARVIS" que vira a apiKey do modo Claude.
- 🤖 **`/api/claude` novo**: Claude pelo servidor do site — a chave fica nas Environment Variables da Vercel, nunca no navegador. A detecção aceita **nome personalizado** (ex: `Claude_Fable`): qualquer env com valor `sk-ant-…` ou nome contendo claude/anthropic. Antes, essas chaves na Vercel eram invisíveis pro site (o código só lia GEMINI_API_KEY/OPENROUTER_API_KEY).
- ✅ Verificado no navegador (Playwright) rodando os handlers serverless reais com chaves falsas: detecção achou `Claude_Fable`, teste do `/claude` chegou na Anthropic (401 esperado), cofre mascara o valor e configura o JARVIS.
- 🎲 **Aleatoriedade forte em todos os ids persistidos** (achado real do CodeQL neste PR): `uid()` e os geradores de id do jarvis-brain/tools/skills/memory, mural, academia e gerar-código trocaram `Math.random` por `crypto.getRandomValues` (novo `randHex()` em helpers). Restou só o alerta antigo do `h(html:)` (padrão deliberado do site, documentado no código) — dá pra dispensar em Security → Code scanning.
- 🛡️ Backup: `backup/2026-06-11-pre-merge-apis`.

### Agente do Google removido de vez
- 🗑️ A pedido do operador (não vai mais mexer no portfólio, não precisa de agente puxando do Google): **removido o workflow `sync-cronicas.yml`** (que rodava sob demanda) **e os 4 scripts** que liam do Google Docs (`sync-cronicas.mjs`, `gen-fanfic-from-docs.mjs`, `gen-dossie-from-doc.mjs`, `gen-elites-rosters.mjs`). O cron de 12h já tinha sido desligado em 10/06; agora não sobra **nenhuma** automação de coleta do Google.
- ✅ Os dados já sincronizados continuam no repo (`cronicas.js`, `dossie.json`, `fanfic.json`, `elites*`), então as páginas seguem funcionando — só não se atualizam mais sozinhas. `gen-fanfic-from-md.mjs` (lê markdown local, não Google) foi mantido. Restam só os workflows `cambio.yml` (cotações) e `codeql.yml` (segurança).
- 🛡️ Backup: `backup/2026-06-11-remove-google-agent`.

### Arsenal: 2813 armas + correção de nomenclatura
- 🔫 **+184 famílias/variantes reais** adicionadas (todas dados públicos, sem inventar): infantaria 1003, blindados 361, artilharia 155, aéreo 524, naval 231, mísseis 366, drones 173 → **2813** no total (era 2629). Inclui NGSW (SIG MCX-Spear/XM7), HK433, Gepárd/NTW-20, MAC-10/11, caças da WWII (P-38, P-40, F6F Hellcat, Ki-84, Macchi C.205), Kfir/Nesher/Cheetah, fragatas Constellation/F125/F126, "3 T" navais (Talos/Terrier/Tartar), SAMs britânicos (Sea Dart/Sea Wolf/Bloodhound), MQ-28 Ghost Bat, Eurodrone, etc.
- 🔤 **Nomes corrigidos** no gerador (`joinName`): marcas/palavras agora recebem espaço — **Glock 17**, **SIG Sauer P226**, **MRAP MaxxPro**, **CheyTac M200 Intervention**, **MRAP RG-33/M-ATV/JLTV** — enquanto designadores reais seguem colados (**AKM**, **M16A1**, **MP5SD**, **CZ 75**). Regra nova: sufixo que é Palavra (Maiúscula+minúsculas) ou base com sigla de 4+ letras → separa.
- 🧹 Variante redundante do **DShK** removida (gerava "DShKDShKM"); suporte a **nome absoluto** com prefixo `*` no gerador (variante que não concatena com a base).

### Skill de execução pra agentes + CodeQL manual
- 🤖 **`.claude/skills/run-projeto-baluarte/`** novo: ensina o Claude Code (e qualquer agente futuro) a rodar e dirigir o site sozinho. O `driver.mjs` sobe o vite e controla um navegador de verdade: `smoke` (boot + regressões do editor #197), `shot` (screenshot de qualquer rota) e `eval` (roda JS dentro da página). Verificado de ponta a ponta neste container.
- 🛡️ **`codeql.yml` + `workflow_dispatch`**: os commits automáticos do câmbio não disparam CodeQL (push de bot), então a main fica sem análise e o check dos PRs seguintes marca alerta **antigo** como "novo" (foi o que aconteceu no PR #199). Agora dá pra re-analisar a main manualmente na aba Actions.

### Editor de Código consertado + autocomplete estilo VS Code (#197)
- 🐛 **Highlight quebrado corrigido**: o realce de sintaxe estourava em qualquer código Java/JS com números — o regex de keywords casava com o `class=` do HTML que o próprio highlighter gerava (por isso o código aparecia todo de uma cor só no print do issue). `syntax-highlight.js` foi reescrito como **tokenizador de passada única**: nunca re-escaneia HTML gerado, então números, strings, comentários e keywords saem sempre certos.
- ⌨️ **Autocomplete IntelliSense** (`editor-autocomplete.js` novo): dropdown perto do cursor enquanto digita, com **snippets** (gatilhos rápidos tipo VS Code/IntelliJ: `psvm`, `sout`, `fori` no Java; `log`, `func`, `fetch` no JS; `ifmain` no Python; `html5`, `flexcenter`…), **keywords** da linguagem e **palavras do próprio arquivo**. `↑↓` navega · `Tab`/`Enter` aceita · `Esc` fecha · `Ctrl+Espaço` abre manual. Snippets multi-linha respeitam a indentação e deixam o cursor no `$0`. Novos gatilhos: é só editar `src/data/editor-snippets.js`.
- 🎨 Chamadas de função ganharam cor própria (`tk--func`, verde), como no VS Code.
- ✅ Testado de ponta a ponta no navegador (Playwright): highlight íntegro, `psvm`/`sout` expandindo e cursor caindo dentro dos parênteses.
- 🛡️ Backup: `backup/2026-06-11-pre-merge-editor`.

## 2026-06-10

### #186 (fase 4): documentação do bootstrap + contagem dinâmica de rotas
- 💬 `main.js`: cabeçalho reescrito como guia (fluxo do boot + como adicionar uma rota com `lazy()`); `icons.js`: instruções de como adicionar um ícone. Comentários defasados ("31/46 rotas") removidos.
- 🔢 `router.count()` novo: o console do boot agora mostra o número **real** de rotas (dinâmico — nunca mais desatualiza).

### Coleta bruta (#190/#191) + sem agente do Google + CodeQL (#192)
- 🥩 **Coleta de dados BRUTA** (pedido do operador no #190): a captura automática agora guarda **tudo, integral e sem filtros** — sem filtro de saudação/tamanho, sem remover blocos de código, preservando quebras de linha; pergunta, resposta e deliberações do Conselho inteiras (teto de segurança de 4000 chars/memória e 2000 memórias locais — o histórico completo segue no repositório).
- 🛑 **Agente do Google Docs desligado**: o cron de 12h do `sync-cronicas.yml` foi removido a pedido — a sincronização das Crônicas agora é **só manual** (botão "Run workflow" na aba Actions).
- 🛡️ **CodeQL** (`.github/workflows/codeql.yml`, issue #192): análise de segurança do GitHub para o JS do site e o Python do `api/`, em todo push/PR no main (único template aplicável da lista — os de deploy não servem, o site deploya na Vercel).
- 🛡️ Backup: `backup/2026-06-10-pre-merge-bruto`.

## 2026-06-08

### Banco de Dados visível na Memória (#190)
- 🗄️ `/memoria` ganhou a visão **Banco de Dados (repo)**: detalhamento das memórias **por origem** (conversa/resposta/conselho/…) + links direto pro **`banco.json`** e pros **commits** da branch `jarvis-memory` no GitHub — pra ver o **"1 commit por pergunta"** acontecendo. O núcleo do #190 (salvar pergunta+resposta no repo, compartilhado/retroalimentado, lido por todas as IAs/Cérebro/Raio-X) já existia.

### #186 (fase 3): documentação do layout + storage
- 💬 Comentei a camada de **layout**: `shell.renderPage` (o ponto único de troca de tela — pipeline mount → nav → título → estado), `sidebar.NAV_GROUPS` (passo a passo de como adicionar um item ao menu) e `navItem`; + nota no `storage.js` sobre o fallback em memória (modo privado). Núcleo + roteador + layout agora documentados; #186 segue aberto (páginas/utils nas próximas fases).

### #186 (fase 2): documentação do núcleo
- 💬 Comentei a fundo os módulos-núcleo que todo contribuidor usa primeiro: `h()` em `helpers.js` (chaves especiais `className`/`style`/`dataset`/`on*`/`html` + cada ramo do corpo), o event bus (`events.js`: retorno de cancelamento + isolamento de erros no `emit`) e o store (`state.js`: corrigido o cabeçalho — é merge raso + listeners, não Proxy). Issue #186 segue aberto (próximas fases: páginas/utils).

### Mural — rede social leve (#187) + docs do roteador (#186)
- 📣 **Mural** (`/mural`, issue #187): rede social leve — recados salvos no localStorage **e** commitados no repositório (`mural/posts.json` via `api/social.py`, branch `jarvis-memory`), então ficam **compartilhados e versionados**, sem backend/login. Sem `GITHUB_TOKEN`, fica só local (single-device).
- 💬 **#186 (fase):** comentários explicativos no `router.js` (compile/match). O core já tinha cabeçalhos JSDoc; o guia para contribuidores está em `CONTRIBUTING.md`.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-mural`.

### Git Nexus ao vivo (#189) + Guia de contribuição (#186)
- 🗺️ **Raio-X — Git Nexus ao vivo** (`/codigo`, issue #189): botão que lê o repositório **inteiro agora** pela API do GitHub (não o `codemap` pré-gerado) — métricas ao vivo + todos os arquivos por pasta, marcando os novos (🆕). Sem token (API pública).
- 💬 **`CONTRIBUTING.md`** (issue #186, fase 1): guia de arquitetura e convenções para futuros contribuidores (pastas, helpers, como adicionar página, sistema de IA, envs, fluxo de git). O código já tem cabeçalhos JSDoc; comentários por módulo seguem em fases.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-nexus`.

### Álbuns Musicais (#185)
- 💿 **Álbuns** na Música (`/musicas`, issue #185): seção data-driven (`src/data/albuns.js`) com cartões de álbum (capa + artista + ano + faixas); clicar numa faixa toca o player embutido (Spotify/SoundCloud). Exemplo incluso ("Hinos do Imperador" W40K, com a capa que o operador enviou).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-albuns`.

### Conselho: Hermes sintetiza + Fontes de Detecção no radar (#183)
- ⚖️ **Conselho de IAs:** o **Hermes** vira o **moderador** que dá a resposta final (navegador → servidor); o **Gemini** passa a ser só reserva (ele estourava o limite de tokens). Membro que cai por limite mostra "⚠ Limite de tokens atingido" (não o 429 cru) e o moderador avisa isso no consenso. A página mostra por quem o consenso foi sintetizado.
- 📡 **Radar — Fontes de Detecção** (`/radar`, issue #183): painel de fusão multi-sensor ligando as fontes reais que o site já tem (`/visao`, `/geo`, `/ciberseg`, `/triangulacao`, satélites) — o radar não depende de antena dedicada.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-conselho-hermes`.

### Música: "Suas Faixas" por URL (#184) + #182 já estava feito
- ➕ **Suas Faixas** (`/musicas`, issue #184): adicione faixas do **Spotify ou SoundCloud** colando o link — salvas localmente (neste navegador), com player embutido e botão de remover. (Tocar Spotify completo só com Premium logado — limite do Spotify, não do site.)
- ✅ **#182** ("guardar memórias num repo, commit por dado, acessível por todas as IAs") já estava implementado: é a Memória versionada no repositório (`api/memory.py` + branch `jarvis-memory`). Fechado como concluído.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-184`.

### Batalha Naval (#181) + Sobrepor em segundo plano
- 🚢 **Batalha Naval** (`/batalha-naval`): jogo clássico vs. computador — frota posicionada automaticamente, IA de "caça" (ao acertar mira nas células vizinhas), tabuleiros 10×10, afunde a frota inimiga antes que ela afunde a sua. Resolve o issue #181.
- 📌 **Sobrepor em segundo plano:** janelas sobrepostas com áudio/vídeo nativo agora usam a **Media Session API** → controles na tela de bloqueio e reprodução em segundo plano no celular (melhor ainda como PWA instalado). Players em iframe (SoundCloud) seguem a própria media session.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-batalha`.

### Sobrepor — janelas flutuantes que mantêm a página viva
- 📌 Botão **Sobrepor** no header: fixa a página atual numa **janela flutuante** (arrastável por mouse/toque, minimizável) que **sobrevive à navegação**. Assim o rádio/música continua tocando enquanto você lê a Biblioteca — tudo numa guia só. A página é movida para fora do `main` (mas dentro do `<body>`), então o roteador não a destrói. `src/layout/overlay.js` + `pinCurrentPage()` no shell.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-sobrepor`.

### OpenClaw conectado ao JARVIS e ao Conselho
- 🐾 Conector **OpenClaw** (assistente self-hosted, igual ao modo Ollama): modo "OpenClaw" no JARVIS + **membro automático no Conselho** quando a URL é configurada. `processOpenClaw` com URL/endpoint configuráveis e parsing tolerante a vários formatos.
- 🔎 Honestidade: o gateway nativo do OpenClaw é **RPC** (não um chat-completions OpenAI); o conector espera um endpoint compatível — nativo ou via **bridge**. Setup e o caminho do bridge em `docs/OPENCLAW.md`.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-openclaw`.

### Memória versionada no repositório (commit por pergunta)
- 🗄️ A memória do JARVIS pode ser guardada **dentro do repo**, na branch **`jarvis-memory`** (`memoria/banco.json`): toda memória nova vira um **commit**, e a IA **busca** nela antes de responder. `api/memory.py` (stdlib) commita/lê via API do GitHub; `jarvis-repo-memory.js` faz saves **serializados** e **gateados**; `jarvis-brain` mescla repo+local em recall, `/cerebro` e `/codigo`.
- Branch dedicada de propósito: **1 commit por pergunta NÃO redeploya** o site (que vive no `main`). Botão **☁️ Repo** em `/memoria`. Requer `GITHUB_TOKEN` (fine-grained PAT, Contents: write) — ver `docs/MEMORIA-REPO.md`.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-memoria-repo`.

### Conselho de IAs grava tudo na memória
- ⚖️🧠 O **Conselho** (`/conselho`) agora grava na memória **a pergunta E as respostas geradas** — cada membro usável + o consenso (source `conselho`), ligados ao Segundo Cérebro e ao Raio-X. Antes só a pergunta e um resumo do tópico entravam.

### Hermes no servidor (Vercel → OpenRouter)
- 🧠 **`api/hermes.py`** (Vercel, só stdlib): proxy para o Nous Hermes via OpenRouter. Os pesos rodam no provedor (GPU); a Vercel intermedia e guarda a chave — igual ao `api/chat.py` com o Gemini. Funciona em **qualquer device, sem WebGPU**; até 70B/405B. (Rodar os pesos na própria Vercel não dá: serverless é CPU-only.)
- 🤖 Novo modo **"Hermes (servidor)"** no JARVIS + membro **automático** no Conselho de IAs (quando `OPENROUTER_API_KEY` estiver definida).
- 📄 `docs/HERMES-VERCEL.md` com o passo a passo (chave grátis em openrouter.ai/keys).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-hermes-vercel`.

### Conselho de IAs + Hermes no navegador
- ⚖️ **Conselho de IAs** (`/conselho`): várias IAs respondem **juntas** (JARVIS Local + Gemini + modelo do Navegador/Hermes se carregado), todas com o **mesmo contexto compartilhado** (dossiê + memória durável + estado vivo do site); um moderador sintetiza o **consenso**, que volta para a memória — realiza "IAs trabalhando juntas" e "páginas conversando via memória".
- 🧠 **Nous Hermes no navegador:** Hermes 3 (3B/8B) e Hermes 2 Pro (Mistral 7B) no modo Navegador (WebLLM/WebGPU) — a IA da Hermes rodando 100% no site, offline após baixar. O agente hermes (skills auto-criadas) já rodava.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-conselho`.

### Arsenal 2631 — infantaria moderna + classes navais
- ⚔️ **Arsenal 2468 → 2631 armas:** fabricantes de pistolas/fuzis modernos, fuzis de serviço da OTAN/regionais, snipers/SMG/MG modernos; classes navais (destróieres/fragatas/submarinos/anfíbios por nação); treinadores e helicópteros modernos; hipersônicos e drones de IA. Rumo a 3560.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-arsenal2631`.

### Arsenal 2468 — leva histórica/regional
- ⚔️ **Arsenal 2189 → 2468 armas:** famílias da 1ª/2ª Guerra e Guerra Fria (fuzis de ferrolho/semiauto, SMG/MG históricas, AT clássicos; tanques pioneiros; artilharia histórica; caças a pistão/jato e plataformas derivadas de comerciais; couraçados/porta-aviões e combatentes modernos; bombas/mísseis guiados; UCAV/FPV). Rumo a 3560.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-arsenal2468`.

### Arsenal 2189 + Gerador de Código conectado à memória
- ⚔️ **Arsenal 1393 → 2189 armas:** +2 levas de famílias reais no gerador (Infantaria 746 · Blindados 314 · Artilharia 118 · Aéreo 422 · Naval 155 · Mísseis 305 · Drones 129). Rumo a 3560 = continuar adicionando famílias.
- 🧬 **Gerador de Código × Memória:** ao gerar, o pedido vira memória durável (ligada ao Segundo Cérebro e ao Raio-X) — mesmo sistema do Terminal-IA (que já captura input + resposta da IA).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-arsenal2189`.

### Lote de 5 frentes — memória da IA, PWA, Arsenal 1393, Sponsio, Gerador de Código
- 🧠 **Memória da resposta da IA:** o JARVIS memoriza também as próprias respostas (não só o que o operador escreve) — `captureReply` nos modos de IA e no Terminal-IA.
- 📱 **PWA mobile:** botão "Instalar app" (`src/utils/pwa.js`) — instala na tela inicial do celular; o service worker já faz cache offline real (o "sistema móvel").
- ⚔️ **Arsenal 671 → 1393:** +~140 famílias reais no gerador (`scripts/gen-arsenal.mjs`). Rumo a 3560 = continuar adicionando famílias.
- 🛡️ **Segurança do Agente (Sponsio):** `src/utils/jarvis-guard.js` vETA cada chamada de ferramenta do agente (safe/caution/block) antes de executar, bloqueia o perigoso e registra; página `/seguranca`.
- 🧬 **Gerador de Código** (`/gerar-codigo`): o site + a IA (Gemini) criam código a partir de um pedido, com realce e abrir no Editor.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-lote5`.

### Auto-captura de conversas → memória viva (PR #179)
- 🧠 **`jarvis-brain.captureConversation()`**: toda mensagem do chat e do Terminal-IA vira memória durável (`source: conversa`/`terminal`), com filtro leve de ruído.
- 🔗 **`linkCode()`**: memórias se ligam também a arquivos do `codemap` → no **Raio-X** (`/codigo`) os arquivos comentados ganham halo roxo + contagem no tooltip.
- 🕸️ **Segundo Cérebro**: memórias entram como nós (cap nas 50 mais recentes para legibilidade).
- 📓 **`/memoria`**: badge de origem (manual / conversa / terminal) por memória.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-autocaptura`.

### Terminal-IA — o "terminal do Claude Code" (PR #178)
- 💻 **`/terminal-ia`**: REPL com comandos `:go` (navega p/ qualquer página), `:mem` (memória durável), `:code` (codemap/Raio-X), `:chart` (gráficos), `:brain` (Segundo Cérebro), `:help`, `:clear` + histórico (↑↓).
- 🤖 Texto livre → JARVIS (Gemini) com briefing + memória no contexto; fallback determinístico no modo local. Reaproveita `jarvis-engine`, `jarvis-brain`, `site-capabilities` e `chart-engine` (zero duplicação).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-terminal`.

### Memória durável do JARVIS (supermemory) — PR #177
- 🧠 **`src/utils/jarvis-brain.js`**: memória durável (localStorage) de fatos curados ("lembre que ..."), ligados automaticamente aos conceitos do Segundo Cérebro; `searchMemories`/`memoryContext`/`memoryStats` + `codeContext()` (resumo do `codemap` → JARVIS raciocina mais rápido sobre o próprio código).
- 📓 **`/memoria`**: ver/buscar/adicionar/apagar memórias, com chips dos conceitos ligados (clicáveis).
- 🤖 **JARVIS**: modo local grava/recupera por voz ("lembre que ...", "o que você sabe sobre ..."); modos de IA recebem memória + estrutura do código no contexto.
- 🕸️ **Segundo Cérebro**: memórias entram como **nós** (`tipo: memoria`) ligados aos seus conceitos — o cérebro cresce com a memória.
- 💻 `projetos/terminal-ia/`: base e plano prontos para o próximo front.
- 🛡️ Backup: `backup/2026-06-08-pre-merge-memoria`.

### Leitor OCR + Raio-X 3D + JARVIS consciente (issue #175) — PR #176
- 👁️ **Leitor OCR** (`/ocr`): extrai texto de imagens 100% no navegador (Tesseract.js via CDN) — upload, arrastar, colar (Ctrl+V) e câmera. Substitui o PaddleOCR.
- 🧊 **Raio-X do Código em 3D**: grafo force-directed agora em 3D (esfera de Fibonacci), projeção em perspectiva com auto-rotação + arraste para girar e profundidade real.
- 🤖 **JARVIS (issue #175):** passa a conhecer **cada página/ferramenta** do site via `src/data/site-capabilities.js` (derivado do menu — auto-atualizado), então a navegação local alcança qualquer rota; e agora **desenha gráficos** — modo local ("gráfico de barras: jan 10, fev 20") e modos de IA via bloco `chart` renderizado como imagem (motor de `/graficos`).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-pr176`.

### Auto-análise + Segundo Cérebro + Arsenal 671
- ⚔ **Arsenal Expandido:** migrado para gerador de famílias-semente (`scripts/gen-arsenal.mjs` → `src/data/arsenal-expandido.json`), expandido de 140 para **671 armas** reais (Infantaria 273 · Blindados 105 · Artilharia 30 · Aéreo 125 · Naval 37 · Mísseis 68 · Drones 33).
- 🩻 **Raio-X do Código** (`/codigo`): auto-análise do próprio site — grafo força-dirigida de **158 arquivos, 39.121 linhas, 350 imports** (`scripts/gen-codemap.mjs` → `src/data/codemap.json`).
- 📁 **Aba Projetos** (`/projetos`): índice de tudo feito com o Claude Code (`src/data/projetos.json`) + convenção de pasta única `projetos/<nome>/`.
- 🧠 **Segundo Cérebro** (`/cerebro`): knowledge graph (29 nós, 41 conexões) ligando domínios ↔ projetos ↔ conceitos ↔ fontes; canvas interativo com clique-para-navegar (espírito GitNexus, 100% no navegador).
- 🛡️ Backup: `backup/2026-06-08-pre-merge-cerebro`.

## 2026-06-07

### PR #174 — Arsenal Expandido vira banco de dados (44 → 140 armas)
- ⚔ **Arsenal Expandido:** dados movidos para `src/data/arsenal-expandido-db.js` (banco extensível), expandidos de ~44 para **140 armas** reais.
- 🛩 Nova categoria **Drones**. Total: Infantaria 35 · Blindados 19 · Artilharia 13 · Aéreo 23 · Naval 16 · Mísseis 23 · Drones 11.
- 🛡️ Backup: `backup/2026-06-07-pre-merge-pr174`.

### PR #173 — +5 universos (21 skins) + Banco de dados e Enciclopédia Militar
- 🌌 **Universos:** +Monsterverse, Titanfall, God of War, Devil May Cry, Fate (16 → 21 skins).
- 🎖️ **Seção Militar:** novo banco de dados `src/data/militar-db.js` (13 categorias) + página `/enciclopedia-militar` navegável.
- 🛡️ Backup: `backup/2026-06-07-pre-merge-pr173`.

### PR #172 — JARVIS com IA real (Gemini) + Repaginação por Universos
- 🤖 **JARVIS** modo Servidor com **Gemini 2.5 Flash + busca no Google** (key server-side); dossiê do Baluarte injetado no contexto.
- 🌌 **Motor de Universos:** 16 skins completos (cor/tipografia/formas/atmosfera) com identidades autênticas das franquias.
- 🎯 Menu com **~65 ícones de linha** que herdam a cor do universo.
- 🛡️ Backups: `backup/2026-06-07-jarvis-universos-1/2/3`.

### PR #166 — JARVIS Skills + Dossiê + Radar do Câmbio + Música + fix cap 21
- 🧬 **JARVIS Skills auto-criadas** (sandbox de 3 camadas, persistência, UI).
- ▣ **Dossiê das Forças** (`/dossie`) gerado dos Google Docs.
- 💹 **Radar do Câmbio** (`/dolar`): Dólar/Euro/BTC, banco + relatórios a cada 12h.
- 🎵 **Música:** 30 faixas do SoundCloud com loop ao clicar.
- 🔧 **Crônicas:** Capítulo 21 de "A Névoa e o Aço".

### PRs #163 / #165 — Crônicas vivas + integrações
- 📖 Sincronização automática das **Crônicas** com os Google Docs (a cada 12h).
- 🔌 Doc de **integrações futuras** (hermes-agent, gemini-cli, radar).
