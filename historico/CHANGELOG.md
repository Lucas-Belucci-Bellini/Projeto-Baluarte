# 📜 Histórico de Alterações — Projeto Baluarte

Registro do que entra no `main`. Fluxo de segurança: **antes de cada merge** é
criada uma branch de backup (`backup/AAAA-MM-DD-...`); **depois** registra-se
aqui o que mudou.

---

## 2026-07-03

### 🧠 Hermes AGENTE LOCAL — sem API, sem chave (#310/#231)
- 🎯 **O operador quer o Hermes como agente de verdade, local, sem depender da API.** As três metades já existiam soltas no site — juntei: (1) o **Nous Hermes rodando local** (WebLLM/WebGPU, sem servidor/sem chave), (2) as **ferramentas do JARVIS** (navigate, arsenal, editor, memória, skills auto-criadas…), (3) o **loop ReAct** que antes só falava com a API do Claude.
- 🧩 **Núcleo de agente independente de modelo** (`jarvis-agent-core.js`): fala o protocolo de **function-calling nativo do Nous Hermes** (`<tools>` no sistema, `<tool_call>{…}</tool_call>` do modelo, `<tool_response>` de volta). Serve QUALQUER cérebro de chat — WebLLM agora, **motor embutido do app depois** — pela mesma interface `brain({system,messages})`.
- ⬢ **Novo modo no JARVIS: "Hermes (agente local)"** (`jarvis-hermes-agent.js`): default no **Nous Hermes 2 Pro (Mistral 7B)**, afinado pra tool-use (chave de modelo própria — não herda o Llama fraco do modo Navegador). Tool-calls aparecem no chat; 1º uso baixa o modelo, depois roda offline. Zero API, zero chave.
- 🖥️ **Site + app**: no app (Chromium do Electron) roda via WebLLM já; a **Fatia 2** troca o cérebro pelo **motor embutido (llama.cpp/GGUF)** sem browser — mesmo núcleo de agente.
- ✅ Verificado: teste unitário do núcleo (emite `<tool_call>` → executa ferramenta real → recebe `<tool_response>` → resposta final); UI do modo no navegador (modelo default = Hermes 2 Pro, seletor/baixador, tool-call visível); build limpo.

### 🌠 Entrada "cascata cybertroniana" + herói ASTROLÁBIO 3D + pill de tema (#246)
- 🚪 **Entrada nova do site e do app** (mockup Fable 5 V2, `Baluarte_Fable.html`): overlay de boot com **chuva de glifos procedurais** (canvas 2D), **sigilo astrolábio girando** (SVG, 3 camadas) e wordmark que **decodifica de glifos pra BALUARTE**. Duração **6,5s** (o operador pediu mais tempo que os 3,6s do mockup) — clique/Esc pula; `prefers-reduced-motion` = saída rápida sem chuva. Cores 100% via tokens (a entrada segue o tema ativo). O app herda (Launcher carrega o site).
- 🔭 **Herói do home = astrolábio 3D nativo**: variante nova `'astrolabe'` no harness WebGL **sem dependência** (`hero-webgl.js`) — icosaedro duplo (arestas + casca wireframe), **3 anéis inclinados + grande halo**, campo de partículas, **vagalumes dourados** e 14 estilhaços tetraédricos, com giro majestoso e parallax. Nada de Three.js (~600KB poupados — web leve, #238). A cena Spline do home só entra por `?spline=URL`.
- ✦ **Herói no layout do mockup**: cantos com **colchetes ✦**, divisor `— ✦ —`, MARK XIII **itálico serifado espaçado**, CTAs **pill** (primária gradiente com brilho, "Baixar o app" outline com blur, "Núcleo de IA" ghost), HUD `NÚCLEO 3D · WEBGL · NÍVEL ÔMEGA`.
- 🎨 **Pill de tema flutuante** (canto inferior direito, global): troca rápida **Ouro/Rubi/Esmeralda** sem sair da página, sincronizada com o picker do `/perfil` (evento `baluarte:theme`); a lista completa de temas segue no perfil.
- ✅ Verificado no navegador (Playwright): entrada visível decodificando → some sozinha aos 6,5s → **skip por clique ok**; astrolábio renderizando atrás do título; pill troca pro rubi (mundo inteiro muda); smoke test + build limpos. 🛡️ Backup: branch de trabalho.

### 💎 Temas de fábula: Esmeralda & Rubi + tokenização total das folhas (#246)
- 🎭 **Dois temas novos do mockup Fable 5 V2** (objeto `THEMES` do `Baluarte Fable.dc.html`): **Esmeralda** (`#2fbf8f`, fundo verde-abissal `#0a1210`) e **Rubi** (`#c8556d`, fundo vinho `#140a0f`) — no picker do `/perfil`, ao lado do **Ouro** (padrão). Diferente dos temas de acento, eles carregam um **kit completo** (`vars` em `theme.js`): fundo, painéis, texto pergaminho e bordas — trocam o mundo, não só a cor. O tema salvo sincroniza na nuvem como antes.
- 🧱 **Tokenização em massa das folhas por página**: as 277 ocorrências de ouro **hardcoded** que a varredura anterior deixou em 64 folhas viraram tokens (`#d4a24e`→`var(--color-cyan)`, `rgba(212,162,78,α)`→`color-mix(… α%)`). Agora **todas** as páginas (arsenal, editor, militar, jogos…) seguem qualquer tema **e qualquer universo** — os raios WebGL dos heróis, chips, abas e até o syntax highlighting do editor mudam junto. Tint do fundo do `body` também tokenizado.
- ✅ Verificado no navegador (Playwright): ciclo ouro→rubi→esmeralda→ouro limpa e aplica os kits certinho (tokens conferidos no `<html>`); screenshots do `/home`, `/arsenal`, `/editor` e `/militar` em rubi/esmeralda; build limpo. Site + app (herda online). 🛡️ Backup: branch de trabalho.

## 2026-07-02

### 👑 Ouro de Fábula em TODAS as páginas — varredura total do neon + vidro de fábula (#246)
- 🧹 **Varredura em massa**: as ~460 ocorrências de neon hardcoded que os tokens não alcançavam (`#00f0ff`/`#ff00aa` e rgba/0x equivalentes) foram convertidas pro dourado (`#d4a24e`/`#e8c07a`) em **105 arquivos** — todas as ~80 folhas por-página (arsenal, biblioteca, radio, editor, jogos, cripto…), os JS (canvas/gráficos/engines/highlight do editor) e o `cerebro.json` (cores dos nós do grafo). Zero neon remanescente (`grep` = 0).
- 🫙 **Vidro de fábula global**: o componente `.card` (usado no site inteiro) ganhou o **grão de ruído dourado** por cima do gradiente — os painéis de todas as páginas ficam com a textura do mockup. CTAs do herói (`hv2-btn`) agora **serifados** (Cormorant, como no mockup).
- ✅ Verificado no navegador (Playwright, 4 páginas de amostra: arsenal/biblioteca/editor/radio): tudo no ouro — até o syntax highlighting do editor; build limpo. Site + app (herda online). 🛡️ Backup: branch de trabalho.


### 👑 Reskin "Ouro de Fábula" — estética Fable 5 V2 no site inteiro (e no app) (#246)
- 🎨 **Nova estética oficial** (do mockup `Baluarte Fable.dc.html`, branch `Redesign-Baluarte-3D`, pasta **Fable 5 V2**): fundo **violeta-escuro** (#0e0c16) + acento **DOURADO** (#d4a24e/#e8c07a) + texto **pergaminho** (#f4ecdd) + serifas (**Cormorant Garamond** títulos, **Spectral** corpo, **IBM Plex Mono** HUD) + **grão de ruído** global (assinatura tátil, `body::after`).
- 🧱 **Reskin via tokens**: `variables.css` re-tokenizado (nomes `--color-cyan`/`--color-magenta` mantidos por compatibilidade → hoje ouro/ouro-claro); o site inteiro (~80 folhas), os **heróis WebGL** (`heroSkinColors()`), a **aurora/efeitos** e os gradientes seguem automático. Neons hardcoded remanescentes (títulos holográficos, raios, botões, métricas) convertidos pro dourado em `home-v2/components/immersive/effects/base`.
- 🖥️ **Site + app**: o app (Baluarte Launcher) carrega o site → **herda o visual online na hora**; o fallback offline embutido atualiza no próximo build de release (`extraResources ../dist`).
- ✅ Verificado no navegador (Playwright, screenshots `/home` e `/militar`): título BALUARTE serifado dourado com sheen, sidebar/HUD/CTAs/métricas no ouro, painéis violeta, grão sutil; build limpo. Próximas fatias do mockup: temas **rubi/esmeralda** (como skins), cursor customizado, núcleo 3D "astrolábio" (icosaedro+anéis+vagalumes) no harness WebGL próprio, transição "virar página". `docs/DESIGN-SYSTEM.md` atualizado. 🛡️ Backup: branch de trabalho.

## 2026-06-28

### 🗃️ Centro Militar — camada de curadoria no Supabase (dado nosso sobre a Wikipédia) (#246)
- 🎯 Nova tabela **`public.mil_curation`** (aplicada via MCP no banco oficial) que sobrepõe a Wikipédia com **dado nosso** por frente: **nota do operador**, **destaque** e **ordem**. O hub aplica isso (`.is-featured` + bloco `.mil-note`) por cima do extrato da Wikipédia.
- 🔐 **RLS**: **leitura pública** (anon/authenticated SELECT — o hub é público); **escrita só por `service_role`** (dashboard/MCP), sem policy de write pra anon. Verificado por `curl`: anon **GET → 200** (lê) · anon **POST → 401** (bloqueado).
- 🧱 Novo `src/utils/mil-curation.js` (`fetchMilCuration` via `dbSelect`, best-effort — sem Supabase/offline o hub funciona igual) + CSS de destaque/nota. Semeadas as 14 frentes (ordem + 2 notas + 1 destaque de exemplo). Edição via dashboard/MCP (`update mil_curation …`). Plano: `docs/CENTRO-MILITAR.md`.
- ✅ Verificado: build limpo; overlay (destaque + nota) aplica no DOM; leitura anônima confirmada. 🛡️ Backup: branch de trabalho.

### 🎖️ Centro Militar — 13 frentes militares + Arsenal num hub só (Wikipédia ao vivo) (#246)
- 🧭 **Consolidação**: as **13 páginas militares** da sidebar (+ Arsenal) viraram **uma página estilo Wikipédia** em **`/militar` ("Centro Militar")** — índice "Conteúdo" (sticky) + **14 seções**. A **sidebar enxugou de 13 itens → 1**; as páginas individuais **seguem registradas** e acessíveis pelo hub (botão "abrir página completa →") e por URL — **nada removido**.
- 🌐 **Conteúdo vivo da Wikipédia**: cada seção puxa um **extrato da Wikipédia** sob demanda (IntersectionObserver, web leve) via `src/utils/wikipedia.js` (`fetchWikiSummary`, REST API CORS + cache memória/localStorage TTL 7d). **Best-effort**: se a Wikipédia não responder, mostra link pro artigo (zero erro). Conteúdo **CC BY-SA 4.0**, sempre **creditado e linkado**.
- 🧱 Novos `src/pages/militar.js` + `src/styles/centro-militar.css`; rota em `main.js`, título no shell, ícone (`/militar`→shield), sidebar. **Sem dependência nova, sem Cloudflare** (a API da Wikipédia já é CORS-friendly); Supabase fica pra curadoria nossa numa fatia futura. Plano em **`docs/CENTRO-MILITAR.md`**.
- ✅ Verificado no navegador (Playwright): hub renderiza (hero + índice 14 + 14 seções), sidebar militar = 1 entrada, degradação graciosa quando o fetch falha; build limpo. 🛡️ Backup: branch de trabalho.

### ⬆️ Toolchain — site e app no Node 24
- 🟢 **Node 22 → 24** em todo o projeto: `engines.node` do **site** (`package.json`: `22.x → 24.x`) e do **app** (`desktop/package.json`: novo `engines.node: 24.x`). Vercel lê o `engines` → passa a buildar/rodar a web no Node 24.
- 🤖 **CI**: `desktop-release.yml` (build dos instaladores) `node 22 → 24` e `cambio.yml` (cron do câmbio) `node 20 → 24`.
- 📌 `.nvmrc` (raiz + `desktop/`) = `24` pra fixar a versão no dev local. Build de produção limpo; JSONs válidos. *Obs.: o Electron empacota o próprio Node (preso ao major do Electron) — isto sobe o Node do **toolchain/CI**, não troca o runtime interno do Electron.*

### 🎨 Iconografia — sidebar 100% no set de linha (Design System §4 · #246)
- 🧭 **Toda a navegação lateral agora usa o set único de ícones de linha** (`src/utils/icons.js`, traço + `currentColor`). Caíam no fallback de emoji só **2** rotas — `/git-nexus` ("Núcleo de IA", o flagship da IA) com 🔗 e `/baixar` ("Baixar o App") com ⬇. Mapeei as duas em `iconByPath` e desenhei os ícones `nexus` (grafo/hub) e `download` no mesmo grid 24×24 dos demais.
- 🔻 **Rodapé da sidebar coerente também**: os glifos soltos do botão **Instalar app** (⬇), do link do **YouTube** (▶) e do **LLBR Innovations** (⬡) viraram ícones de linha (`download`/`play`/`hex`), com regra de tamanho/alinhamento em `layout.css` (some o rótulo quando recolhida).
- ✅ Verificado no navegador (Playwright): **75/75** itens da sidebar com SVG de linha, **zero** fallback de emoji, 3 ícones no rodapé; build limpo. É o passo 2 ("trocar a sidebar") do plano incremental de adoção do coolicons do Design System (§4); cards/headers ficam pra próxima fatia. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · LightRays WebGL no herói (#246)
- 🌟 **Fundo WebGL de "god-rays" (porta do LightRays)** — novo `src/utils/hero-rays.js`: fragment shader de **quad de tela cheia**, WebGL 1.0 **sem dependência** (não usa OGL), feixes de luz descendo de uma fonte no topo modulados por ruído animado, na cor do universo ativo, blending aditivo. Roda **web+app** (é dependency-free como o `hero-webgl`, então não precisou gatear pro app).
- 🔌 Ligado no `buildImmersiveHero` via `variant: 'lightrays'` (mesma API/ciclo de vida do `createHeroWebGL`: fallback 2D, reduced-motion = 1 quadro, pausa com aba oculta, auto-resize/encerra). Aplicado na **`/tecnologia-militar`** como vitrine.
- ✅ Verificado no navegador (Playwright + screenshot): o shader compila e os raios renderizam atrás do título holográfico, texto legível; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · SoftAurora nos heróis imersivos (#246)
- 🌌 **Camada de aurora (porta do SoftAurora)** ligada no `buildImmersiveHero` → **~20 páginas flagship** ganham, de uma vez, blobs de cor (ciano/magenta/violeta) respirando à deriva atrás do conteúdo do herói, com `mix-blend: screen` pra somar luz. Herda o acento do universo via `--bx-accent/2`. Novo `.fx-aurora` em `effects.css`.
- 🪶 CSS puro, `pointer-events:none`, **reduced-motion congela**; entra em z-index 1 (atrás do conteúdo, que é z-4) e **some quando o Spline carrega** (junto de canvas/rays/grid). Verificado no navegador (Playwright + screenshot `/arsenal`): aurora compõe atrás da galáxia WebGL sem prejudicar a leitura; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · TiltedCard nos cards das prateleiras (#246)
- 🃏 **Inclinação 3D que segue o cursor (porta do TiltedCard)** nos cards das prateleiras do `/home` (Arsenal/Universos/Crônicas, 36 cards): o cartão gira em `rotateX/rotateY` conforme a posição do cursor (+ leve `scale`) e volta ao plano no leave — tátil, estilo "prateleira Steam" (Design System §7). Novo `attachTilt(el)` em `effects.js` + `.fx-tilt` (transição suave, `preserve-3d`).
- 🛡️ Robusto: rotação **clampada** a ±amplitude (sem flip se o evento vier fora dos limites); **reduced-motion** deixa o card estático; sem dep. Verificado no navegador (Playwright): 36/36 cards com tilt, `transform` setado dentro da faixa (±11°) e limpo no leave; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla · DecryptedText global nos títulos (#246)
- 🔓 **Revelação "decifrando" (porta do DecryptedText) ligada no site inteiro**: a cada navegação, os títulos de página (`.page-header__title`, **56 páginas**) embaralham os caracteres e revelam da esquerda pra direita — cara de HUD, combina com o Baluarte. Hook único em `shell.renderPage` (junto do scroll-reveal); `effects.js` ganhou `decryptText(el)` + `decryptTitles(root)`.
- 🪶 JS puro, sem dep; `setInterval` que se encerra sozinho (sem leak); **reduced-motion** deixa o texto intacto; **a11y**: o texto real fica em `aria-label` durante o efeito e o título assenta exato. Verificado no navegador (Playwright): efeito roda e o título volta ao original sem corrupção; build limpo. 🛡️ Backup: branch de trabalho.

### ✨ react-bits → efeitos vanilla (Fatia 0 · #246)
- 🧪 **Estudo + decisão**: o [react-bits](https://github.com/DavidHDev/react-bits) é **React 19** + stack WebGL/GSAP pesada e **licença MIT + Commons Clause** (proíbe redistribuir os componentes, mesmo portados). Em vez de adotar React (quebraria *sem-framework* + *web leve* #238), a direção é **estudar e reimplementar os efeitos em vanilla** com os tokens do Baluarte, creditando o autor. Plano e mapa de portabilidade em **`docs/REACT-BITS.md`**.
- 🧱 **Camada de efeitos**: novos `src/utils/effects.js` + `src/styles/effects.css` (registrada no boot), sem dependência, com `prefers-reduced-motion`. Primeiros 2 efeitos portados: **ShinyText** (`.fx-shiny`, varredura de brilho em texto, CSS puro) e **SpotlightCard** (`attachSpotlight()` + `.fx-spotlight`, brilho radial que segue o cursor em cartões).
- 🏠 **PoC no `/home`**: `fx-shiny` no kicker do herói + spotlight nas 7 células do bento. Verificado no navegador (Playwright): efeitos ligados, CSS vars atualizando no cursor, build limpo. Os ~53 efeitos WebGL (Aurora/Galaxy/Plasma…) ficam pra trilha app/lazy gated (#238). 🛡️ Backup: branch de trabalho.

### 🎨 Iconografia — flagship `/home`: cards/headers no set de linha (Design System §4 · #246)
- 🏠 **Passo 3 (cards/headers)** começando pelo flagship: os glifos/emojis dos **CTAs do herói** (⚙/⬇/🔗 → `gear`/`download`/`nexus`), dos **eyebrows das células do bento** (◈/🔗/⬇/⌖/📖/◆/⚡ → `chart`/`nexus`/`download`/`eye`/`book`/`diamond`/`grid`), dos **tiles de acesso rápido** (agora via `iconForPath(path)`, reusando o mapa por rota) e dos **títulos de prateleira** (🔫/🌌/📖 → `crosshair`/`star`/`book`) viraram ícones de linha do set único.
- 🎯 **Emoji preservado onde é semântico** (Design System §4): os selos de SO 🪟🍎🐧 do card "Baluarte Launcher" e o `⬡` decorativo do HUD do herói ficam.
- ✅ Verificado no navegador (Playwright): 8/8 tiles, 7 eyebrows, 3 títulos de prateleira e 3 CTAs com SVG de linha, **zero** emoji residual nessas áreas; build limpo. 🛡️ Backup: branch de trabalho.

## 2026-06-24

### 🧠 Omega Prism · Fatia 1 (banco) — Segundo Cérebro + Memória por usuário (#231)
- 🗄️ Migrations **`0006_knowledge`** (`knowledge_notes`: notas com `tags`/`links`) + **`0007_memories`** (`memories`: fatos "lembre que…", estilo supermemory) — **por usuário, RLS dono-só** (`auth.uid() = user_id`), igual `profiles`. Aplicadas no Supabase oficial.
- 🔐 Verificado (REST anon): **GET → 200 `[]`** (não vaza) · **POST → 401** (RLS bloqueia) nas duas; estrutura: RLS on + **4 policies (CRUD dono)** cada.
- 🧱 É a **espinha** do Omega Prism (L1 Conhecimento + L2 Memória, do `docs/OMEGA-PRISM.md`): a base pra `/cerebro` e `/memoria` saírem do localStorage e virarem **por-usuário, cross-device**. Próximo incremento: cliente (`jarvis-brain` ganha backend Supabase) + UI.

### 🧠 Omega Prism · Fatia 1 (cliente) — Memória do JARVIS por usuário, cross-device (#231)
- ☁️ A **Memória do JARVIS** (`/memoria`) agora **sincroniza com a sua conta**: logado, os fatos "lembre que…" salvam na tabela `memories` do Supabase e **voltam em qualquer dispositivo**. Deslogado segue **100% local** (localStorage) — **zero regressão**.
- 🧩 Novo `src/core/memory-cloud.js` (CRUD por usuário, sem SDK, igual ao padrão `user-prefs`) + `jarvis-brain` ganhou `syncUserMemories()` e espelha `addMemory`/`deleteMemory`/`clearMemories` na nuvem **best-effort** (a API síncrona não muda — UI nunca trava esperando rede).
- 🔀 **Mescla as 3 origens** sem duplicar (dedup por texto): local + **conta (sua, na nuvem)** + repo (`jarvis-memory`). Botão **☁️ Conta** no `/memoria` (logado: sincroniza; deslogado: leva ao `/perfil`); ao abrir logado, puxa a conta sozinho.
- 🪶 Web leve (#238): sem deps, best-effort, degrada em silêncio. Verificado: build limpo + smoke ok; a página renderiza com o botão **☁️ Conta**. O round-trip real depende de estar logado (testável no preview/produção). 🛡️ Backup: branch de trabalho.

### 🌐 Omega Prism · Fatia 1 na web — `/memoria` e `/cerebro` acessíveis no navegador (#231)
- 🔓 **`/memoria` (Memória) e `/cerebro` (Segundo Cérebro) agora abrem na WEB** — antes caíam no teaser "Núcleo de IA roda no app". O `docs/OMEGA-PRISM.md` põe L1 Conhecimento + L2 Memória na coluna **web (leve)**, e a Fatia 1 ("100% web, verificável") **só fecha** se dá pra logar → criar memória → ver em outro dispositivo. Isto destrava o cliente da nuvem do PR anterior pra valer no navegador.
- 🧱 **Sem regressão no app**: novo `lazyLeve(tab, …)` no `main.js` — na **web** renderiza a página real (leve); no **app** (`window.baluarte.native`) segue caindo no **cockpit unificado** do Núcleo na aba certa. O pesado (grafo 3D, JARVIS, ML, Mini-LLM, `codemap-symbols`) **continua app-only** via `lazyNexus`.
- 🪶 **Boot segue leve (#238)**: o `index` quase não mudou (193,4→193,7 KB) e os chunks pesados continuam **separados/lazy**; `/memoria` e `/cerebro` puxam o `jarvis-brain` (10 KB gz) só quando abertos. Verificado no navegador (Playwright): as duas rotas renderizam a página real (header + grafo/ferramentas), **sem teaser**; build limpo. 🛡️ Backup: `backup/2026-06-24-pre-omega-fatia1`.

### 🐛 Navegação robusta — falha de carregamento não vira "404 falso" (rumo ao JARVIS)
- 🧭 **Causa:** as páginas carregam sob demanda (`import()` lazy). Se o chunk falha (deploy novo trocou os hashes, cache velho do app/PWA, ou soluço de rede), o roteador caía no `route:error` e mostrava **"Rota não encontrada"** — enganoso (a rota existe; o que falhou foi *carregar*). Foi o que apareceu em `/musicas` no app.
- 🔁 **Auto-recuperação:** quando um chunk falha e há **internet**, o app recarrega **1× sozinho** (pega `index.html` + chunks frescos) com guarda anti-loop (zera ao carregar ok). Resolve deploy novo sem o usuário fazer nada.
- 🩹 **Mensagem certa:** se não der pra recuperar (offline), mostra **"Falha ao carregar"** + botão **Recarregar** — não mais "rota não existe".
- 🧰 **Service worker:** bump `baluarte-v2.0.0` → `v2.0.1` pra invalidar caches velhos.
- 🛡️ **Por que importa pro JARVIS:** ele vai navegar/usar as ferramentas; agora uma falha de carregamento é **recuperável e clara**, não um erro mudo/404 falso. Auditoria: os **75 itens do menu batem com rotas reais** (nenhum link quebrado). Verificado: smoke ok; `loadErrorPage` renderiza "Falha ao carregar"; build limpo.

## 2026-06-23

### 🔵 Login com Google no `/perfil` + estética sincronizada por usuário (#291)
- 🔵 Botão **"Entrar com Google"** na nova seção **Conta** do `/perfil`: a pessoa conecta/cria a conta Google e fica logada (deslogado → botão; logado → nome/e-mail/avatar + "Sair").
- ☁ **Estética por usuário na nuvem**: trocar **tema** ou **skin de universo** logado salva no perfil; abrir o `/perfil` logado **aplica a estética salva** (volta em qualquer dispositivo). Inicializa o perfil com a estética atual se estiver vazio.
- 🪶 Sem SDK/deps (usa `supabase-auth.js`/`user-prefs.js`). Verificado no navegador: seção Conta + botão com o "G" colorido renderizam; build limpo. O round-trip real do Google depende do **setup do provider no painel** (passos no `docs/SUPABASE.md`).
- 🛡️ Backup: branch de trabalho.

### 👤 Contas de usuário — fundação (login Google + preferências na nuvem) (#291)
- 🔐 **Tabela `profiles` + RLS dono-só** no Supabase (migration `0005`): cada usuário logado terá a **sua estética** (tema + skin de universo), **favoritos** e nome salvos na nuvem, restaurados em qualquer dispositivo. Cada um lê/escreve **só a própria linha** (`auth.uid() = id`); trigger `handle_new_user` cria o perfil no cadastro. Aplicada e verificada (policies/trigger/RLS on; anon GET → `[]`; anon insert → **401**).
- 🧩 **Cliente de auth sem SDK** (web leve #238): `src/core/supabase-auth.js` (login **Google** via `/auth/v1/authorize`, sessão em localStorage + refresh, captura do retorno OAuth no boot tratando o hash-routing) + `src/core/user-prefs.js` (`loadProfile`/`saveProfile`). Verificado offline: o parsing do retorno OAuth decodifica o JWT e guarda a sessão (`{id,email,meta}`), limpa o hash; smoke do boot ok.
- 🛡️ Higiene: revogado o `EXECUTE` da função de trigger `handle_new_user` (igual à `0003`), pra não expor como RPC. Advisors seguem só com os by-design (`bump_visits`/`bump_view`) + o toggle de Auth.
- 📄 `docs/SUPABASE.md`: schema `profiles` + **passos do Google no painel** (parte do operador) + fluxo de auth.
- ⏭️ Próxima fatia: botão "Entrar com Google" no `/perfil` + sincronizar tema/universo/favoritos por usuário (testável ao vivo após o setup do Google). 🛡️ Backup: branch de trabalho.

## 2026-06-22

### 🗄️ Página `/banco` — Painel do Banco (Baluarte ao vivo) (#291)
- 📊 Nova rota **`/banco`** (sidebar → Sistema): painel que lê **números reais do Supabase** por leitura pública (RLS) — **visitas**, **páginas vistas** (total + distintas), **top páginas** (com barras) e **posts no mural**. Faz toda a fundação do banco aparecer no próprio site, sem abrir o dashboard.
- 🪶 Read-only, sem dependências (chunk **3.2 kB / 1.4 kB gz**, lazy). Degrada em silêncio se o banco não responder (tiles viram "—" + aviso). Ícone de linha próprio na sidebar (`database`).
- ✅ Verificado no navegador: header/tiles/seções renderizam; estado de indisponível confirmado (o browser do sandbox de teste não alcança o banco — popula em produção, igual ao contador de acessos). Build limpo.

### 📊 Métricas reais — views por página no banco (#291)
- 👁 **Contagem de views por página** gravada no Supabase (reusa `site_stats`, chaves `view:/rota`), exibida no **Home** (linha "PÁGINAS · N páginas vistas · top /rota") e numa **tile do `/perfil`** ("Páginas vistas"). Número real, global e durável.
- 🔐 **Escrita anônima SEGURA + validada**: nova função `bump_view(rota)` (`SECURITY DEFINER`) incrementa a chave da rota e **valida a rota** (`^/[a-z0-9/_-]{0,63}$`) pra não criar chave-lixo. Verificado por REST: incrementa (1→2), rota inválida → **400 "rota invalida"**, escrita direta → **401** (RLS). Migration `0004_page_views`.
- 🪶 **web leve (#238)**: o cliente (`page-views.js`) conta **1×/rota/sessão** (guard em `sessionStorage`) no `route:change`; depois só lê. ~1 KB no boot.
- 🛟 **Zero regressão**: sem Supabase/aplicação/offline, as métricas somem sem ruído (linha oculta no Home, tile some no `/perfil`). Verificado: build limpo + degradação graciosa quando o banco não responde.
- 🛡️ Backup: branch de trabalho preservada.

### 🛡️ Banco — hardening: fecha a exposição do event-trigger `rls_auto_enable` (#291)
- 🔒 **Migration `0003_db_hardening` aplicada**: revoga o `EXECUTE` (anon/authenticated/public) da função `rls_auto_enable()`. Auditando o banco, descobri que ela é um **event trigger** (`ensure_rls`, em `ddl_command_end`) que **liga RLS automaticamente em toda tabela nova** do `public` — ótimo trilho de segurança, mas que **não precisava ficar exposta como RPC** (`/rest/v1/rpc/rls_auto_enable`). Revogar **não quebra** o gatilho (event trigger roda como dono).
- ✅ **Resultado:** os **2 avisos** do advisor de segurança pra essa função **sumiram** (5→3 lints). Os 2 restantes do `bump_visits` são **by-design** (escrita anônima segura do contador) e o de "leaked password" é toggle de Auth. Verificado: `has_function_privilege('anon',…)` → `false` depois; `bump_visits` mantém o anon.
- 📄 `docs/SUPABASE.md` atualizado (migration `0003` + SQL copy-paste + explicação do event trigger + status dos advisors). Auditoria completa do schema (tabelas/policies/funções/event triggers) feita via MCP.
- 🛡️ Backup: branch de trabalho preservada.

### 🎧 Música — "Meu Acervo" offline, toca em qualquer rede (#291 §3)
- 🎵 Nova seção **Meu Acervo** no topo da `/musicas`: você **adiciona seus próprios arquivos de áudio** (arrastar ou escolher) e eles tocam **offline, em qualquer rede** — inclusive nas que bloqueiam Spotify/YouTube. Cumpre o objetivo norteador do operador ("ouvir em qualquer lugar, **independente do WiFi**"), que embed de serviço externo nunca garante.
- 🗄️ Os arquivos ficam **só no aparelho** (IndexedDB) — nada sobe pra rede, nada pesa no bundle (#238 web leve). Player nativo `<audio>` com playlist, **próxima/anterior**, **repetir lista** e **remover**; a lista e a preferência de loop persistem.
- 🆕 `src/utils/offline-audio.js` (store IndexedDB: add/list/get/remove/clear, sem dependências) + seção em `src/pages/musicas.js` + estilos no padrão dos tokens (`musicas.css`).
- ✅ Verificado no navegador: a seção renderiza após o herói (badge "offline · qualquer rede", dropzone, player, lista) e o **round-trip no IndexedDB funciona** (adicionar → listar → ler blob 4096 B → remover). Build limpo (chunk `musicas` 19.6 kB / 7.3 kB gz).
- ⏭️ Próximo da §3 (separado): proxy serverless pro **Rádio** ao vivo e cache de áudio no service worker. 🛡️ Backup: branch de trabalho preservada.

### 🗄️ Migration do contador aplicada no banco + `docs/SUPABASE.md` (#291)
- ✅ **`0002_site_stats` aplicada no projeto Supabase oficial** (via MCP): a tabela `site_stats` e a função `bump_visits()` agora **existem de fato** — então a linha **"👁 N visitas ao Baluarte"** no Home passa a mostrar número real. Antes a migration estava só versionada no repo, **não aplicada** (era o bloqueio anotado em #290/#291).
- 🔐 **Verificado ponta-a-ponta como anônimo** (REST pública): leitura do contador → **200**; `rpc/bump_visits` → **200** (incrementa); **escrita direta na tabela → 401** (RLS bloqueia). Contador **zerado** ao final (as visitas reais começam limpas).
- 📄 **`docs/SUPABASE.md`** (novo) — fonte única do backend: projeto/credenciais (públicas por design), **postura RLS**, estado das migrations, **3 jeitos de aplicar** (dashboard · MCP · CLI), o **SQL copy-paste** de `0001`/`0002`, verificação por `curl` e o passo do login OTP (#288). Atende ao pedido da **#291 §2**.
- ⚠️ **Advisor (registrado pra revisar)**: existe uma função pré-existente `public.rls_auto_enable()` (SECURITY DEFINER, executável por anon) que **não vem das migrations do repo** — origem a checar. O aviso sobre `bump_visits()` ser executável por anon é **intencional** (escrita anônima segura).
- 🛡️ Sem mudança de código de runtime (doc + changelog); a aplicação da migration é no banco. Branch de trabalho preservada como backup.

### 🗄️ Contador de acessos no banco oficial (Supabase) — primeira escrita pública
- 👁 **Contador global de acessos** gravado no Supabase, exibido na célula "Vigilância · ao vivo" do Home (`N visitas ao Baluarte`). Número **real**, global, cross-device e durável — não o localStorage por-navegador.
- 🔐 **Escrita anônima SEGURA**: o visitante não escreve na tabela (RLS sem policy de escrita). Ele só chama a função `bump_visits()` (`SECURITY DEFINER`) via RPC; a leitura do total é pública. Migration versionada em `supabase/migrations/0002_site_stats.sql`.
- 🪶 **web = leve** (#238): um RPC minúsculo **1×/sessão** (guard em `sessionStorage`); depois só lê. Cliente ganhou `dbRpc()` em `src/core/supabase.js`.
- 🛟 **Zero regressão**: se o Supabase não estiver configurado, a tabela ainda não aplicada, ou der erro (offline), a linha some sem ruído. **Requer aplicar a migration** no banco (dashboard SQL Editor ou MCP local) pra o número aparecer.

### 📦 App desktop 0.2.0 — "novo visual + Núcleo de IA" (abertura do release · #259)
- ⬆️ **Bump do Baluarte Launcher `0.1.1` → `0.2.0`** (`desktop/package.json` + lock). Abre a release que leva ao usuário do app o **redesign cinematográfico** (#195) e o **Núcleo de IA** (#231).
- 🧭 **Sidebar enxuta** (#258): a seção "IA & Jarvis" (12 entradas) virou **uma só** — `🔗 Núcleo de IA → /git-nexus`. As ferramentas (JARVIS, Conselho, APIs, Dashboard, ML, Mini-LLM, Cérebro, Memória, Terminal-IA, Segurança, IA Proprietária) abrem como **abas** no cockpit; rotas legadas redirecionam com `?tab=` (#256/#257, já no `main`).
- 🌐 **Online o app já mostra o novo design** (carrega a produção). O **fallback offline** é o `../dist`, rebuildado pelo próprio workflow de release — então sai atualizado.
- 🚀 **Publicação**: `Desktop Release` (Actions) corta instaladores Win/Mac/Linux e a release `v0.2.0`; `electron-updater` atualiza os apps `0.1.1`. A página `/baixar` lê a release em runtime (passa a mostrar v0.2.0 sozinha).
- 🛡️ Branch do release preservada como ponto de retorno: `claude/release-app-v0.2.0`.

### Banco oficial (Supabase) — Mural sai do localStorage pro banco
- 🗄️ **Primeiro dado oficial no Supabase**: o `/mural` agora lê do banco (Postgres) em vez de só localStorage. Tabela `mural_posts` com **RLS**: leitura **pública**, escrita **só do operador** (travada pelo e-mail no JWT — mesmo que alguém se cadastre, não posta).
- 🪶 **web = leve (#238)**: sem SDK — cliente próprio (`src/core/supabase.js`) fala direto com a REST/Auth por `fetch` (peso ~zero). Config por env (`VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`) com fallback no projeto oficial; a *publishable key* é pública por design (o RLS protege).
- 🔁 **Zero regressão**: sem Supabase configurado, o mural cai no modo local (localStorage + commit no repo) de antes.
- ✅ Verificado contra o banco real: leitura anônima → 200; **escrita anônima → 401 (RLS bloqueia)**; a página lista o post semente e mostra o cadeado "publicação restrita ao operador". Migration versionada em `supabase/migrations/0001_mural_posts.sql`. Build limpo.
- ⏭️ **Próximo passo**: login do dono (magic-link/OTP) pra publicar pelo site — exige 1 ajuste no painel do Supabase (documentado no PR).
- 🛡️ Backup: `backup/2026-06-22-pre-merge-supabase-mural`.

### Fix — scroll volta ao topo ao trocar de página
- 🐛 Navegar entre páginas **mantinha o scroll onde estava** (você caía no meio da página nova). Causa: o reset usava `mainInner.scrollTop = 0`, mas o scroller real é a **janela** (o `<body>`), então era no-op.
- ✅ Agora um `scrollToTop()` zera window/`<html>`/`<body>`/`.main__inner` e **repete no próximo frame** (cobre o reflow quando o chunk lazy da página monta). Verificado: 4/4 navegações voltam ao topo; sem erros de console.
- 🛡️ Backup: `backup/2026-06-22-pre-merge-scroll-to-top`.

### Redesign #246 — barra de progresso de leitura
- 📊 Uma barra fina no topo **enche conforme a página rola**, tingida pelo **acento do universo ativo** (coesa com #281/#282/#284). Some (opacity 0) em páginas que não rolam.
- 🪶 Leve: **1** listener de `scroll` no window (rAF-throttled) + `MutationObserver(childList)` pra re-medir quando a página troca; o `scaleX(var(--sp))` acompanha o scroll 1:1 (sem transição no transform). Folha própria (`scroll-progress.css`) ligada no `index.html`; montada 1x pelo shell.
- ✅ Verificado: enche com o scroll (`--sp` acompanha `window.scrollY`), recolore no DOOM (vermelho/laranja), sem erros de console. Build limpo.
- 🛡️ Backup: `backup/2026-06-22-pre-merge-scroll-progress`.

## 2026-06-21

### Redesign #246 — spotlight nos cards (segue o cursor)
- ✨ Os cards compartilhados (`.card`) ganham um **brilho radial que segue o cursor** no hover, tingido pelo **acento do universo ativo** (coeso com #281/#282). Complementa o lift+glow do hover e o tilt 3D das ferramentas.
- 🪶 Leve por construção: **UM** listener delegado no root (não por card), throttled por `requestAnimationFrame`, que só escreve `--mx`/`--my` quando o cursor está sobre um card; o visual mora no CSS (`.card::after`, `mix-blend-mode: screen`). Variante `.card--magenta` usa o acento secundário. Respeita `prefers-reduced-motion` (nem monta).
- ✅ Verificado em `/portas` (20 cards): o glow segue o cursor, texto 100% legível, só o card sob o cursor acende, sem erros de console. Build limpo.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-card-spotlight`.

### Redesign #246 — herói WebGL reativo ao universo
- 🎨 Os acentos do **herói 3D** (campo de partículas + core + anéis) agora **seguem a skin de universo** por padrão — novo `heroSkinColors()` lê `--color-cyan`/`--color-magenta`, igual à atmosfera global (#281). Trocar de universo recolore os heróis **junto** com o fundo → coesão total (DOOM = vermelho/laranja, etc.).
- Páginas que passam `accent`/`accent2` explícitos (biblioteca, jogos, git-nexus-gate) **mantêm** a cor própria. `home`/`perfil` deixaram de fixar cyan/magenta e agora seguem a skin (com fallback Baluarte).
- ✅ Verificado: default inalterado (cyan/magenta); DOOM recolore o herói (`--color-cyan` → `#e01510`); sem erros de console em home/perfil/universo. Build limpo.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-hero-universe`.

### Redesign #246 — atmosfera global reativa ao universo
- 🎨 O fundo imersivo global (auroras + raios + grid HUD, em toda página) agora **segue a skin de universo ativa**: as cores saem de `--color-cyan`/`--color-magenta` (definidas pelo `universe-theme.js`) via `color-mix`, então **trocar de universo recolore a atmosfera inteira** — DOOM vira vermelho/laranja, Halo azul/verde, Cyberpunk magenta/ciano… Antes eram cores fixas (cyan/magenta).
- 🛡️ Fallbacks reproduzem o visual padrão (Baluarte `#00f0ff`/`#ff00aa`) onde a var não existir; `color-mix` já é usado no projeto (suporte ok). Verificado: default inalterado (`#00f0ff`), DOOM recolore (`#e01510`). `prefers-reduced-motion` já congela as animações da atmosfera.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-atmosphere-universe`.

### Redesign #246 — transição de entrada de página (route transition)
- 🎞️ Toda navegação agora faz a tela nova **deslizar pro lugar** (leve subida + escala, 480ms) — polish global que dá continuidade entre rotas. Disparo automático (o router cria um elemento novo por rota) no ponto único `renderPage` (`src/layout/shell.js`).
- 🛡️ **Só `transform` (sem `opacity`)** de propósito: em páginas pesadas (carregar o chunk + montar o herói WebGL) a thread principal trava por um instante e atrasaria o início da animação; animando `opacity` a partir de 0, a tela ficaria **em branco** até liberar. Com só transform a página fica **sempre 100% visível** (no pior caso aparece 18px abaixo e desliza). Respeita `prefers-reduced-motion`.
- ✅ Verificado no navegador: `opacity` = 1 durante toda a navegação (home→universo/poder-militar/regex), `transform` assenta na identidade, conteúdo intacto, sem erros de console.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-route-transition`.

### JARVIS ↔ Nexus #231 — skills de NÍVEL DE FUNÇÃO
- 🧠 **5 novas skills** do JARVIS sobre o **grafo de chamadas** (`codemap-symbols.json`: 1137 funções / 2457 chamadas), além das 5 por arquivo:
  - `nexus_fn_impact` — o que quebra se mudar a função X (chamadores diretos + transitivos) + nível de risco;
  - `nexus_fn_context` — quem chama X e o que X chama;
  - `nexus_fn_path` — cadeia de chamadas A → … → B;
  - `nexus_fn_deps` — o que X chama (transitivo);
  - `nexus_fn_hot` — funções mais chamadas (hotspots), no projeto ou por arquivo.
- ♻️ Reusa o **mesmo motor** (`buildGraph`/`nexusImpact`/`nexusContext`/`nexusPath`) — a forma de nó/aresta dos símbolos é igual à do codemap. Resolver de função aceita `nome`, `arquivo::nome` ou trecho; em nome ambíguo escolhe a mais chamada e avisa.
- 📦 **App-only**: o `codemap-symbols.json` (461 KB) fica em chunk dinâmico (cockpit/JARVIS), **fora do boot da web**. Build limpo; lógica validada (`h()` = 364 afetadas/CRÍTICO; `boot → … → h` em 2 saltos; hotspots batem com `topCalled`).
- 🛡️ Backup: `backup/2026-06-21-pre-merge-fn-skills`.

### Mega-plano #238 · Fase 2 — CSS split (boot mais leve) + verificação do gate
- ✂️ **CSS code-split por rota**: o boot carregava **TODAS** as ~83 folhas via `<link>` no `index.html` (1 bundle de **398 KB / 55 KB gz** em toda página). Agora o boot só traz a **fundação + shell + componentes + folhas realmente compartilhadas**; cada folha específica de página é importada pelo **próprio módulo da página** (`import '../styles/x.css'`) e o Vite faz o split — ela sai do caminho inicial e só baixa quando a rota abre.
  - **Boot CSS: 398 KB → 194 KB raw · 55 KB → 29.5 KB gz (−46%)**, em *toda* navegação. 42 folhas movidas pra 42 chunks por rota.
  - Folhas **multi-página** (militar, cripto, calc, fase17–19, arsenal, elites, biblioteca, logic-sim, portas, morse, editor, terminal, gráficos, símbolos…) ficaram **globais** de propósito (mover quebraria páginas que dependem delas).
  - 🗑️ Removida `home3d.css` (órfã — nenhum módulo referenciava `.page-home3d`/`.h3-*`).
  - ✅ Conferido no navegador sem regressão: home, ferramentas, regex, git-nexus (teaser), calculadoras, jogos e o controle poder-militar (militar.css global) — todos estilizados.
- 🔒 **Gate do Núcleo de IA verificado** (já estava no código): a rota `/git-nexus` passa pelo gate leve; o chunk pesado (`git-nexus` **438 KB / ~49 KB gz**) **não** é referenciado pelo entry do boot e só baixa no app. O `syncRepoMemories` do boot está gateado por `isNative()`. Fase 2 do #238 fechada.
- 🛡️ Backup: `backup/2026-06-21-pre-merge-css-split`.

## 2026-06-20

### Redesign #246 — onda de energia (pulso) no herói WebGL
- 💓 **Pulso de energia**: um anel de brilho sai do núcleo pra fora (~3.4s/pulso), realçando as partículas/anéis por onde passa — feito no vertex shader (uniform `uWave` + `smoothstep` no raio), com leve aumento de tamanho do ponto no anel. Dá um "batimento" vivo à cena.
- 🌐 Vale pra **todas** as 5 variantes (galaxy/planet/reactor/helix/scope) sem custo extra (1 uniform por frame). `prefers-reduced-motion` congela num quadro.
- ✅ Build limpo; conferido no navegador (universo, sem erros de console).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-pulse`.

### Redesign #246 — efeitos: "power-on" no herói + parallax mais vivo
- ⚡ **Animação de entrada ("power-on")**: todo herói WebGL agora **liga** ao montar — ~900ms de zoom-in (a câmera afasta e mergulha) + fade-in de brilho (novo uniform `uIntensity` no shader, ease cúbico). Dá um arranque cinematográfico em cada troca de página. `prefers-reduced-motion` entra direto no estado final.
- 🖱️ **Parallax do ponteiro mais forte** (faixa ampliada) + **deriva sutil** (sin/cos lento) pra cena respirar sozinha mesmo sem mouse.
- 🌐 Vale pra **todas** as cenas (galaxy/planet/reactor/helix/scope), em todos os flagships, de graça.
- ✅ Build limpo; estado final conferido no navegador (home Spline + universo planet em brilho cheio após o intro).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-fx`.

### Redesign #246 — novas variantes 3D (helix / scope) + espalhadas pelos flagships
- 🧬 **`hero-webgl.js` +2 variantes**: **`helix`** (dupla hélice/DNA com degraus, girando) e **`scope`** (anéis concêntricos + graduação + mira, varrendo no próprio plano via `rotZ`). Junto com galaxy/planet/reactor, são **5 tipos** de cena nativa.
- 🗂️ **Distribuídas pra dar variedade**: `/biblioteca` → **helix** (fios narrativos), `/arsenal` → **scope** (mira/alvo), `/ferramentas` → **reactor**. `/universo` planet e Núcleo de IA reactor seguem.
- 🪪 **`/perfil`**: ganhou fundo 3D **scope** (canvas WebGL atrás do dossiê, `pf-hero__canvas`, opacity 0.8) com fallback 2D e auto-limpeza — sem perder o card de identidade.
- ✅ Build limpo; helix/scope/reactor conferidos no navegador (biblioteca, arsenal, ferramentas, perfil).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-variants-2`.

### Redesign #246 — variantes de herói WebGL nativas (planet / reactor)
- 🪐 **`hero-webgl.js` ganhou `variant`**: além do `galaxy` (padrão), agora tem **`planet`** (globo holográfico com meridianos/paralelos + anel orbital + campo de estrelas — ref. "Orbital View of Arrakis") e **`reactor`** (anéis concêntricos + cruzados + núcleo pulsante — ref. "circuit loop / Eternal ARC"). Mesmo renderer (point-sprites aditivos), geometria por `buildGeometry(variant)`.
- 🌍 **`/universo`** → herói `planet` (globo girando + anel orbital, eixo Y).
- 🔗 **Núcleo de IA** (`/git-nexus` gate) → herói `reactor` (reator de anéis), substituindo o header simples. Continua leve (só o herói WebGL, ~nada perto do grafo pesado app-only).
- 🔌 `buildImmersiveHero({ variant })` repassa pro engine; `galaxy` segue idêntico (home/perfil/arsenal/etc. inalterados).
- ✅ Build limpo; planet e reactor conferidos no navegador (headless ANGLE).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-variants`.

### Spline 3D #246 — cena REAL na home (embed público my.spline.design)
- 🌀 **Home com cena Spline de verdade**: "Retrofuturistic circuit loop" (#262) entra como fundo do herói — emblema/circuito neon atrás do wordmark holográfico BALUARTE. Escolha do operador (a única das 3 cenas free que serve de fundo; "Boxes Hover" e "Connecting Card" são designs fechados, descartadas).
- 🧩 **`spline-embed.js` agora aceita embed público** (`my.spline.design/<slug>/`) via `<iframe>` decorativo (`pointer-events:none`, lazy, revela no load ou em ≤3,5s), além do `<spline-viewer>` (`.splinecode`). Resolve o caso real: exportar `.splinecode` é pago; o **Share/Public** é free (com selo "Built with Spline"). `sceneFor` passou a aceitar `my.spline.design`.
- 🛟 Fallback intacto: sem cena / `prefers-reduced-motion` / falha → fica o herói WebGL (galáxia + raios). `#/home?spline=<url my.spline.design>` testa qualquer cena na hora.
- ⚖️ Exceção consciente ao "web leve" (#238): o operador quis a cena 3D na home web; é lazy + fallback. Verificado no navegador (headless ANGLE) — cena pinta, has-spline ativa.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-home-spline-real`.

### Redesign #246 — heróis imersivos em 17 páginas de conteúdo (militar + mídia)
- 🪖 **11 páginas militares** trocaram o `.page-hero`/header simples pelo **herói imersivo** (`buildImmersiveHero`): forças armadas, forças especiais, poder militar, tecnologia militar, organização militar, orçamentos militares, história militar, guerras & conflitos, batalhas históricas, táticas & estratégias, armas por país. Tabelas/timelines/grids seguem **intactos** abaixo; contadores dinâmicos preservados.
- 🎬 **6 páginas de mídia** idem: cinema (filmes), central de música, TV, central de vídeos, rádio, media hub. Descrições com spans/contadores dinâmicos preservadas (desc como array de nós).
- 🎛️ Cada herói tem título holográfico + galáxia WebGL + raios + grid HUD + kicker/HUD textual; auto-limpa ao trocar de rota; respeita `prefers-reduced-motion`. Sem CTAs nas militares (páginas de dado) pra manter o import enxuto.
- ✅ Build limpo; conferido no navegador (forças armadas, tecnologia militar, cinema, rádio) — heróis + conteúdo OK, sem erros de console (só um cert externo).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-content-heroes`.

### Redesign #246 — heróis imersivos em /arsenal e /ferramentas
- ⌖ **`/arsenal`** (flagship #246 nº3) e ⚙ **`/ferramentas`** (hub) ganharam o **herói imersivo** (`buildImmersiveHero`): galáxia WebGL + raios + grid HUD + título holográfico + CTAs cruzadas. Tabs/filtros/catálogo (251 itens) e o grid de ferramentas seguem **intactos** logo abaixo.
- ✅ Com isso, os **4 flagships do #246** (home, perfil, arsenal, biblioteca) + universo, elites, sobre, dossie estão no nível imersivo; toda página tem a atmosfera global.
- 🚫 `/git-nexus` (gate) mantido **leve** de propósito (#238: web leve) — já tem orbe próprio + atmosfera global; não puxa o herói WebGL.
- ✅ Build limpo; heróis conferidos no navegador (`/arsenal`, `/ferramentas`).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-flagship-heroes-3`.

### Redesign #246 — heróis imersivos em /elites, /sobre e /dossie
- ◆ **`/elites`**, ◇ **`/sobre`** e ▣ **`/dossie`** trocaram o header padrão pelo **herói imersivo** (`buildImmersiveHero`): galáxia WebGL + raios + grid HUD + título holográfico + kicker + CTAs (cruzando pra Arsenal/Dossiê/Roadmap/Núcleo/Universos). Contadores dinâmicos (equipes operacionais) e todo o conteúdo seguem intactos abaixo.
- 🎛️ Slots Spline reaproveitados (`elites`, `sobre`) — testáveis via `?spline=`.
- 🚫 `/baixar` mantido com o herói próprio (anel/“core” + detecção de SO) — a atmosfera global já o cobre.
- ✅ Build limpo; heróis conferidos no navegador (`/elites`, `/sobre`, `/dossie`).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-flagship-heroes-2`.

### Redesign #246 — kit de herói imersivo reusável + flagships /universo e /biblioteca
- 🦾 **`src/utils/immersive.js` + `immersive.css` (novos)**: `buildImmersiveHero({...})` generaliza o herói "Command Deck" da home pra qualquer flagship em **uma chamada** — herói WebGL (galáxia + arc-reactor, com fallback 2D) + raios + grid HUD + título holográfico + kicker + descrição + CTAs + **slot Spline** opcional. Parametrizável por `--bx-accent`. **Auto-limpa** ao sair do DOM (MutationObserver destrói WebGL/Spline) — a página não gerencia ciclo de vida. Respeita `prefers-reduced-motion`.
- 🌌 **`/universo`**: header antigo → **herói imersivo** (galáxia, "Hub de Universos / MULTIVERSO BALUARTE", HUD, CTAs p/ Crônicas e Elites). Cards de universo seguem abaixo, intactos.
- 📖 **`/biblioteca`**: header antigo → **herói imersivo** (acento violeta, "Crônicas da Baluarte / ONDE OS DEUSES SANGRAM", contador de capítulos dinâmico preservado, CTA p/ Universos).
- 🎛️ Slots Spline novos em `spline-scenes.js` (`biblioteca`, `elites`, `sobre`) — testáveis via `?spline=`.
- ✅ Build limpo; heróis conferidos no navegador (`/universo`, `/biblioteca`).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-flagship-heroes`.

### Redesign #246 — camada imersiva GLOBAL (atmosfera + header HUD em todo o site)
- 🌌 **Atmosfera global** (`src/utils/atmosphere.js` + `src/styles/atmosphere.css`): uma única camada de fundo, montada 1x pelo shell, **atrás de todo o app** — auroras volumétricas que respiram + raios de luz (conic `@property`) + grid HUD à deriva + vinheta de foco. Leva o "nível Spline" (refs do #262) pra **todas as páginas de uma vez**. Decisão do operador: as 25 cenas Spline são **referência** (alvo visual), recriadas **nativamente** — sem peso (só CSS, `pointer-events:none`, `z-index:-1`, reduced-motion ok).
- 🎛️ **Header de página vira painel HUD** (`.page-header` em `components.css`): barra de acento luminosa à esquerda (`::before`) + linha de varredura animada embaixo (`::after`). Sem caixa de fundo (nunca briga com heróis próprios) → as **~68 páginas** com `.page-header` viram "painel de comando" **sem editar página**.
- 📐 **Design System atualizado** (`docs/DESIGN-SYSTEM.md`): documenta a atmosfera global, o header HUD e um **mapa "cena Spline (#262) → efeito nativo"** (raios, holográfico, herói WebGL, bento, moldura HUD…). Contrato do redesign profundo.
- ✅ Build limpo; verificado no navegador em `/home`, `/arsenal`, `/ferramentas`, `/regex`, `/biblioteca` (atmosfera + header consistentes, conteúdo legível).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-global-immersive`.

### Redesign #246 — raios volumétricos no herói da home (nível Spline, nativo)
- 🌠 **Camada de raios volumétricos** no herói da `/home` (`.hv2-hero__rays`): leques de luz (ciano→violeta→magenta) varrendo do topo, animados com `@property --hv2-ray` (conic suave), mascarados pra somar com a galáxia WebGL sem competir com o título. Ref. "Futuristic Rays Background" (#262).
- ⚖️ **Só CSS + 1 nó no DOM** (sem peso de runtime, sem dep): aproxima o "nível Spline" pedido pelo operador mesmo **sem** cena `.splinecode`. Some junto com canvas/grid/scanline quando uma cena Spline carrega; respeita `prefers-reduced-motion` (raios estáticos).
- ✅ Build limpo; herói verificado no navegador.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-hero-rays`.

### Spline 3D #246/#207 — integração pronta (cenas reais no nível pedido)
- 🌌 **`src/utils/spline-embed.js` (novo)**: embute cenas 3D do **Spline** via o web component `<spline-viewer>` (CDN), **lazy** (IntersectionObserver), com **fallback seguro** (sem URL / falha / `prefers-reduced-motion` → fica o herói WebGL atual) e **timeout** de 14s.
- 🎛️ **`src/data/spline-scenes.js` (novo)**: slot de cena por página (`home/perfil/gitNexus/universo/arsenal/baixar`) — basta colar a URL `.splinecode`. Também aceita teste na hora via `#/home?spline=<url do spline.design>` (restrito ao domínio do Spline).
- 🏠 **Home** ligada: se houver cena, ela entra **por cima** do herói (no load some o canvas/grid); sem cena, nada muda (fallback). Config vazia por padrão → produção intacta.
- ⚖️ Aceite consciente do peso (decisão do operador no #246): o runtime do Spline é pesado; por isso é lazy + fallback. As páginas das cenas escolhidas estão no estudo #262.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-spline-embed`.

### Redesign #246 — /perfil no estilo "Command Deck" (rollout flagship 1)
- 🪪 **A `/perfil` (Dossiê do Operador) ganhou a linguagem da nova home**: hero com **HUD** (grid + scanline + colchetes luminosos nos cantos), **nome holográfico animado**, e os **stats em bento** (barra de acento no topo + glow/lift). Só visual — toda a função (config, temas, skins de universo) intacta.
- ✅ Build limpo; verificado no navegador (full-page). Primeiro flagship do rollout profundo do redesign.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-perfil-hud`.

### Redesign #246 — título holográfico animado em todas as páginas
- ✨ **A assinatura da nova home se espalhou pro site**: o `.page-header__title` global (em `components.css`) virou um **degradê holográfico animado** (ciano→roxo→magenta, shimmer lento) — então **todas** as páginas com header padrão ganham o mesmo título da home. Respeita `prefers-reduced-motion` (anima só pra quem permite).
- 🧹 Removidos os overrides de título estático (biblioteca, universo, academia e o bloco das 12 páginas militares) → herdam o holográfico global, ficando uniforme.
- ✅ Build limpo; verificado no navegador.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-holo-titles`.

### Home nova "Command Deck" #246/#195 — promovida a oficial
- 🚀 **A `/home` foi repaginada do zero** (aprovada pelo operador): hero com **título holográfico** animado sobre fundo **HUD** (grid em movimento + scanline + colchetes nos cantos) + **grid bento** (métricas count-up, Núcleo de IA com orbe, baixar app, vigilância ao vivo, crônica/equipe em destaque, acesso rápido) + **prateleiras** com scroll-snap.
- 🪶 Leve: CSS/canvas + herói WebGL reusado (cai no campo 2D sem WebGL), JS puro; respeita `prefers-reduced-motion`. `src/pages/home.js` reescrito + `src/styles/home-v2.css`.
- 🧹 Removido o scaffolding de preview (`home-v2.js`); `/home-3d` e `/home2` viram alias da home oficial. O `home3d.css` antigo fica órfão (limpeza futura).
- ✅ Verificado (Playwright + build): `/home` com título holográfico, 7 células bento e 3 prateleiras. É a 1ª página da nova linguagem que vai se espalhar pras demais.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-home-command-deck`.

### Design System #246/#195 — contrato visual (diretrizes "design first")
- 📐 **`docs/DESIGN-SYSTEM.md` (novo)**: o contrato visual do Baluarte — tokens (de `variables.css`), componentes/padrões já firmados (título neon, cards glow/lift, moldura HUD, tabs, chips, timelines), e **diretrizes** pra iconografia (adotar **coolicons**, MIT), data-viz/charts, imagens (moodboard Pinterest) e o redesign profundo dos flagships (`/home`, `/perfil`, `/arsenal`, `/biblioteca`). Base pra "fechar o design antes de seguir com as funções".
- 🔗 `CLAUDE.md` aponta pro doc (continuidade — todo design novo sai dele).
- ℹ️ Os 3 Figma do #246 são *community files* e o Figma MCP exige acesso de edição; pra extrair direto, o operador precisa duplicar/compartilhar como editor. O doc define a direção a partir dos tokens reais + recursos open-source enquanto isso.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-design-system`.

### Núcleo de IA #231 — Etapa 3: aba linkável + lembra a última aba
- 🔗 **Trocar de aba no cockpit sincroniza a URL** (`#/git-nexus?tab=<id>`) via `history.replaceState` — sem disparar navegação/re-render. A aba fica **linkável** e **sobrevive ao reload**.
- 💾 **Lembra a última aba**: reabrir o Núcleo de IA (pela sidebar, sem `?tab=`) restaura a última aba usada (`storage` em `nexus:lastTab`); prioridade = rota legada/deep-link > última aba > Grafo.
- ✅ Verificado (Playwright, app): trocar p/ "Segundo Cérebro" → URL `?tab=cerebro`; reabrir `/git-nexus` → volta na aba Cérebro. Build limpo.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-nucleo-ia-e3`.

### Núcleo de IA #231/#238 — Etapa 2: navegação unificada (IA app-only)
- 🧭 **A seção IA & JARVIS foi unificada no Núcleo de IA.** A sidebar agora tem **uma entrada só** ("🔗 Núcleo de IA" → `/git-nexus`); as 11 ferramentas abrem como **abas** dentro do cockpit.
- 🔀 **Rotas legadas redirecionam pro cockpit na aba certa**: `/jarvis`, `/conselho`, `/apis`, `/jarvis-dashboard`, `/aprendizado`, `/llm-lab`, `/cerebro`, `/memoria`, `/terminal-ia`, `/seguranca`, `/ia-proprietaria` → caem no Núcleo de IA na aba correspondente (bookmarks antigos seguem funcionando). **Deep-link** também via `#/git-nexus?tab=<id>`.
- 📱 **IA é app-only** (alinhado ao #238): no app abre o cockpit; na **web** essas rotas mostram o teaser "baixe o app" (o teaser foi reescrito pra refletir o Núcleo de IA — grafo + JARVIS + memória + cérebro + ML + Mini-LLM).
- ✅ Verificado (Playwright): web `/memoria` → teaser "O Núcleo de IA roda no app", sidebar sem `/jarvis` e com "Núcleo de IA"; app `/jarvis` → cockpit na aba JARVIS, deep-link `?tab=memoria` → aba Memória. Build limpo.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-nucleo-ia-nav`.

### Núcleo de IA #231/#238 — Etapa 1: cockpit com abas (fusão da seção IA)
- 🧩 **O Git Nexus virou o "Núcleo de IA"**: dentro do app, agora é um **cockpit com barra de abas** (`src/pages/git-nexus-cockpit.js`). Aba **Grafo de Código** = a experiência completa atual; + 11 abas das ferramentas IA (**J.A.R.V.I.S., Conselho de IAs, Central de APIs, Dashboard, ML da Memória, Mini-LLM, Segundo Cérebro, Memória, Terminal-IA, Segurança, IA Proprietária**), cada uma **carregada sob demanda** (dynamic import) e montada reusando o render que já existe — **sem reescrever nenhuma feature**.
- 🚪 O gate (`git-nexus-gate.js`) no app passou a carregar o cockpit (na web segue o teaser; cockpit é app-only, alinhado ao #238). Etapa **aditiva**: as rotas individuais (`/jarvis`, `/memoria`, …) seguem funcionando — a unificação de navegação/rotas vem nas próximas etapas (incremental, 1 PR por etapa).
- ✅ Verificado no app (Playwright + `window.baluarte.native`): 12 abas; Grafo carrega por padrão; abas Memória e JARVIS carregam sob demanda. Build de produção limpo (cockpit é chunk leve; cada ferramenta só baixa ao abrir a aba).
- 🛡️ Backup: `backup/2026-06-20-pre-merge-nucleo-ia-cockpit`.

### Redesign #195 — Onda Ferramentas (devtools) + título neon global
- 🎛️ **Fecha o redesign do site**: a regra base `.page-header__title` (em `components.css`) virou o **título neon ciano→magenta com glow** padrão — então **todas** as ~18 páginas de ferramentas (`/editor`, `/terminal`, `/calc-cientifica`, `/calc-numerica`, `/calculadoras`, `/tabela-verdade`, `/cripto`, `/esteganografia`, `/graficos`, `/simbolos`, `/color-studio`, `/regex`, `/json-studio`, `/qr-studio`, `/git-helper`, `/logic-sim`, `/portas`, `/morse`) e qualquer página sem regra própria ganharam o título do redesign de uma vez. Páginas com regra escopada (especificidade maior) seguem mandando na sua.
- ✨ **Glow/lift nos cards/painéis/tiles dos devtools** (escopado por classe única): `.calc-tile`, `.conv-cat`, `.symbol-tile`, `.cs-card`/`.cs-swatch`, `.cripto-tile`, `.porta-card`, `.regex-input-card`/`.regex-match-card`, `.qr-read__panel`, `.logic-card`/`.logic-input-card`, `.steg-panel`, `.morse-panel`, `.kmap__cell`. Título do `/regex` (que usa `.sec-title`) também em degradê. Só visual — nada de layout/estrutura/JS.
- ✅ Verificado no navegador (Playwright + Vite): `/calculadoras`, `/simbolos`, `/color-studio`, `/regex`, `/editor`. Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-20-pre-merge-redesign-devtools`.

## 2026-06-19

### Redesign #195 — Onda Referência + Economia + Hubs (/tabela-periodica, /modpack, /guia-pc, /economia, /dolar, /ferramentas, /utilidades)
- 🧪 **7 páginas de referência/economia/hubs ganharam o polish cinematográfico** — só visual (glow/profundidade/degradê), nada de layout/estrutura/JS.
- ✨ títulos em degradê neon nas 7; **`/tabela-periodica`** com células brilhando no hover; **`/modpack`** com cards em lift+glow; **`/guia-pc`** com presets em glow e aba ativa; **`/economia`** com cards de cotação em lift+glow, valor com brilho e seções em degradê; **`/dolar`** com moedas em glow e valores brilhando; **`/ferramentas`** com título neon (`.fh-title`) e cards com glow ciano somado; **`/utilidades`** com cards em lift+glow e stats brilhando.
- ✅ Verificado no navegador (Playwright + Vite). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-ref-hubs`.

### Redesign #195 — Onda Catálogo & Lazer (/ciberseg, /robotica, /filmes, /memes, /jogos, /batalha-naval)
- 🗂️ **6 páginas de catálogo/lazer ganharam o polish cinematográfico** — só visual (glow/profundidade/degradê), nada de layout/estrutura/JS.
- ✨ títulos em degradê neon nas 6; **`/ciberseg`** com linhas (hover/ativa) em glow e títulos de seção/detalhe em degradê; **`/robotica`** com módulos em glow no hover, item do rail ativo brilhando e título do módulo em degradê; **`/filmes`** com cards em lift+glow e pôster com leve zoom; **`/memes`** com cards em lift+glow (mantendo a cor do tier) e filtro ativo brilhando; **`/jogos`** (escopado em `.page-arcade`) com cards em lift+glow e aba ativa; **`/batalha-naval`** com título do tabuleiro em degradê e grade com leve glow.
- ✅ Verificado no navegador (Playwright + Vite). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-catalogo`.

### Redesign #195 — Onda Mídia (/fft, /radio, /musicas, /media, /videos, /tv)
- 🎬 **As 6 páginas de mídia/áudio ganharam o polish cinematográfico** — só visual (glow/profundidade/degradê), nada de layout/estrutura/JS.
- ✨ títulos em degradê neon nas 6; **`/fft`** com moldura HUD (cantos luminosos) no canvas + modo ativo com glow; **`/radio`** com display de frequência brilhando + estações/resultados com glow no hover; **`/musicas`** com faixa ativa em acento magenta+glow; **`/media`** com linhas e dropzone neon; **`/videos`** com playlist/linha ativa em glow e títulos em degradê; **`/tv`** com tela em moldura luminosa, canal ativo com glow e slot "agora" com acento.
- ✅ Verificado no navegador (Playwright + Vite) nas 6 rotas. Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-conteudo` (mesmo lote do PR #252).

### Redesign #195 — Onda Conteúdo (/biblioteca, /universo, /academia)
- 📚 **As 3 páginas de conteúdo/aprendizado ganharam o polish cinematográfico** (mesma linguagem do `militar.css` e das Ondas 2-3): só visual (glow/profundidade/degradê via `box-shadow`, pseudo-elementos e `background-clip`), **nada** de layout/estrutura/JS mudou.
- ✨ **`/biblioteca`**: título e títulos do leitor (arco/capítulo) em degradê neon; cards de arco com lift+glow e capa com leve zoom no hover; faixa de acento luminoso no "continuar lendo"; busca com foco neon. **`/universo`**: título/seções em degradê, cards com lift+glow e ícone brilhando na cor do mundo, detalhe com glow. **`/academia`**: título e nome da linguagem em degradê, cards (linguagens/módulos/recursos/carreiras) com glow+lift, títulos de seção em degradê.
- ✅ Verificado no navegador (Playwright + Vite): as 3 páginas com título neon e cards repaginados. Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-19-pre-merge-redesign-conteudo`.

### Mega-plano #238 — Fase 2: gate do Git Nexus (web leve, app completo)
- 🚪 **Git Nexus agora é gated por `window.baluarte.native`**: a rota `/git-nexus` passa por um **gate leve** (`src/pages/git-nexus-gate.js`, só importa `helpers`+`router`). Na **web** mostra um **teaser** "abre no app" com CTA pro `/baixar` e atalho pro Raio-X do Código (`/codigo`); no **app desktop** faz `import()` da experiência completa sob demanda.
- 📦 **Bundle**: a rota `/git-nexus` na web caiu de **~438 KB → 3.15 KB** (gz 1.39). O chunk pesado `git-nexus` (438 KB / 48.8 KB gz — grafo 3D + `codemap` + `codemap-symbols` ~460 KB + `jarvis-brain`) **só baixa dentro do launcher**. O `codemap-symbols.json` (461 KB) sai inteiro do caminho web.
- 🪶 **Boot da web mais leve**: o pré-aquecimento `syncRepoMemories()` do boot (que arrastava `jarvis-brain`→`codemap`/`cerebro`) agora roda **só no app**; na web, `/memoria` e `/aprendizado` já sincronizam sob demanda ao abrir.
- 🧩 **`git-nexus.js` intocado** (a implementação completa segue idêntica ao main): o gate vive em arquivo separado de propósito — evita renomear o arquivo analisado, o que reabriria alertas pré-existentes do CodeQL por mudança de fingerprint de caminho.
- ✅ Verificado no navegador (Playwright): web → teaser sem o canvas pesado; com `window.baluarte.native` → grafo 3D + console carregam. Build limpo; CI verde (CodeQL js/python + Vercel).
- 🛡️ Backup: `backup/2026-06-19-pre-merge-gitnexus-gate`.

## 2026-06-16

### App desktop #222 — M3c: o launcher sobe o motor do GitNexus sozinho (código)
- 🧠 **`desktop/src/nexus.js` reescrito**: `maybeStart()` deixou de ser opt-in (`BALUARTE_NEXUS_CMD`) e agora **sobe `gitnexus serve --port 4747` por padrão**. Se já há um motor no ar, só conecta (não duplica). Senão, tenta uma **cadeia de estratégias** até uma ficar saudável (polling no `/api/health`): `BALUARTE_NEXUS_CMD` (override) → cópia vendorizada via Electron-as-Node → bin `gitnexus` global → `npx -y gitnexus@latest serve`.
- 🔌 Desligável com `BALUARTE_NEXUS_DISABLE=1`; `stderr` do motor encaminhado pro console (`[nexus]`) pra depurar o aceite local; `stop()` encerra o filho no quit.
- 📋 **Mapeada a superfície real do `gitnexus serve`** (lendo a cópia vendorizada): REST de leitura (`/api/graph`, `/api/search`, `/api/processes`, `/api/clusters`) + Cypher (`POST /api/query`) **e** ponte **MCP-over-HTTP** (`POST /api/mcp`) por onde saem as 16 tools — base do próximo marco (**M3d**, plugar tudo na ponte IPC).
- ⚠️ **Aceite é LOCAL** (sem Electron/máquina no remoto): instalar o motor + `gitnexus analyze` num repo → no launcher `/git-nexus` fica verde + grafo real. Passos em `desktop/README.md` e `docs/HANDOFF-LOCAL.md`. Sintaxe verificada (`node --check`); build web intacto.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-nexus-m3c`.

### Redesign #195 — páginas leves (/projetos, /roadmap, /mural)
- 🪶 **As 3 páginas leves restantes ganharam o estilo cinematográfico** — `/projetos`, `/roadmap` e `/mural` — fechando o grosso da fila de redesign remota da #240.
- ✨ **O que ganhou glow/profundidade**: títulos (de página, hero e seção) em **degradê neon** ciano→magenta com brilho; **cards** com fundo em gradiente e glow no hover (projetos sobem, posts do mural deslizam com acento luminoso); cards de nível/site do Roadmap com *lift* + glow; foco neon na caixa de composição do Mural; tags com borda neon. **Só visual — nada de layout/estrutura/JS mudou.**
- ✅ Verificado no navegador (Playwright + Vite dev): `/projetos` (grid de cards + título neon), `/roadmap` (hero/seções neon, cards de nível) e `/mural` (título neon, composer). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-redesign-leves`.

### Redesign #195 — Onda 3: Campo & Tático (cards/leitor)
- 🎖 **As páginas de Campo & Tático ganharam o estilo cinematográfico** — `/elites`, `/dossie` e `/enciclopedia-militar` repaginadas na mesma linguagem que o `/arsenal` (que já havia recebido o polish do redesign), fechando a Onda 3.
- ✨ **O que ganhou glow/profundidade**: títulos de página e de seção em **degradê neon** ciano→magenta com brilho; **cards** com fundo em gradiente, *lift* e glow no hover (Elites deslizam, Enciclopédia sobe); **painéis de leitor/detalhe** com brilho radial e nome/título da seção em degradê; **sumário/navegação** com item ativo em acento esquerdo luminoso e hover deslizante; **timeline** da Enciclopédia com nós luminosos; barras de ranking brilhando; *stat tiles* e tags com brilho/borda neon. **Só visual — nada de layout/estrutura/JS mudou.**
- ✅ Verificado no navegador (Playwright + Vite dev): `/elites` (cards + detalhe "Vanguarda da Manhã" com brilho), `/enciclopedia-militar` (título neon, nav ativa, cards "Ramos das Forças"), `/dossie` (título/leitor repaginados) e `/arsenal` (já no estilo, conferido pra coesão). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-redesign-onda3`.

### Redesign #195 — Onda 2: Geo/Tático (6 páginas num PR)
- 🛰 **As 6 páginas Geo/Tático ganharam o estilo cinematográfico do redesign** — `/radar`, `/mapa`, `/geopulse`, `/triangulacao`, `/find` e `/visao` — cada uma na sua folha dedicada (`radar.css`, `mapa.css`, `geopulse.css`, `triangulacao.css`, `find.css`, `visao.css`), com uma linguagem visual **HUD** compartilhada.
- ✨ **O que ganhou glow/profundidade**: títulos em degradê neon ciano→magenta com brilho; **moldura HUD** (colchetes luminosos nos cantos) emoldurando os módulos de canvas/scope (Range-Doppler, Waterfall, Trajetória, Campo de rumos, viewport do Mapa e da Câmera); *stat tiles* com barra de acento no topo, valor brilhando e *lift* no hover; *scope heads* com **linha de varredura animada** ("sensor ao vivo"); botões/modos/estações ativos com glow; linhas de detecção/pontos/locais com acento luminoso; barras de confiança e resultado de localização com brilho neon. **Só visual — nada de layout/estrutura/JS mudou** (tudo via pseudo-elementos e box-shadow, no espírito "leve" do #238).
- ✅ Verificado no navegador (Playwright + Vite dev): `/radar` (scopes com moldura HUD + título neon), `/triangulacao` (stat tiles com acento, "4 estações" ativo com glow, campo com colchetes), `/find` (painéis emoldurados) e `/geopulse` (6 stats com barra de acento + scope "Trajetória" com cantos HUD ciano). Build de produção limpo.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-redesign-onda2`.

### Scroll-reveal global — todas as páginas ganham movimento (leve)
- ✨ **Os blocos de cada página entram suavemente** conforme aparecem na viewport (fade + slide). Inspirado nas skills de animação (AOS / GSAP ScrollTrigger), mas em **~40 linhas e zero dependência** (IntersectionObserver) — alinhado ao "site leve" (#238).
- ⚙️ `src/utils/scroll-reveal.js` + `reveal.css`, plugado no `renderPage()` do shell → roda a cada navegação, em **todas as páginas**. Pula a `/home` (a cena WebGL já tem movimento), respeita `prefers-reduced-motion`, e revela tudo na hora se não houver suporte (conteúdo nunca fica preso invisível).
- ✅ Verificado (Playwright): /perfil revela os blocos (acima da dobra na hora, o resto ao rolar); /home pulada; /radar (canvas) intacto (512px).
- 🤝 **`docs/HANDOFF-LOCAL.md` (novo)**: playbook pra uma sessão **local** (com as skills do `claudedesignskills` + `gitnexus`) pegar e executar o que esta sessão remota não consegue — design 3D pesado, motor real do GitNexus (M3c), runtimes (M4). A divisão de trabalho que o operador propôs.
- 🛡️ Backup: `backup/2026-06-16-pre-merge-scroll-reveal`.

## 2026-06-15

### Redesign #195 — Onda 1: Seção Militar inteira (12 páginas num PR)
- ⚔️ **`militar.css` repaginada** com um *layer* de polish cinematográfico que eleva **as 12 páginas da Seção Militar de uma vez** (Forças Armadas, Orçamentos, Rankings de Poder, Arsenal Expandido, Forças Especiais, Organização, Tecnologia, Táticas, História, Armas por País, Guerras, Batalhas) — uma única folha compartilhada, máximo de alavancagem.
- ✨ **O que ganhou glow/profundidade**: títulos em degradê neon; *stat tiles* com barra de acento no topo, valor com brilho e *lift* no hover; todos os cards com glow ciano no hover; barras de progresso/orçamento brilhando; nós das timelines (História, Guerras) luminosos; linhas de tabela com tinta ciano; abas/filtros ativos com glow; inputs com foco neon. **Só visual — nada de layout/estrutura mudou.**
- ✅ Verificado no navegador (Playwright): Rankings de Poder, Forças Armadas (stats + tabela) e História Militar (timeline) renderizando no novo estilo.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-militar-wave1`.

### Redesign #195 — /sobre repaginada (linha do tempo cinematográfica)
- 📖 **`/sobre` redesenhada** no estilo do redesign (a página também não tinha CSS dedicado). Destaque pra **linha do tempo** da jornada do projeto (Mark I → v1.0.0): virou uma **espinha vertical com brilho** ciano→magenta, nós luminosos e tags em pílula — o último marco em magenta.
- 🗺 **Mapa do site** com cards de glow/lift e ícones brilhantes; seção **educacional** repaginada; e o aviso **"em construção"** num painel com acento âmbar e listras diagonais.
- 🎨 Novo `src/styles/sobre.css` (CSS-only, sem mexer na lógica/conteúdo) usando os design tokens — consistente com home, Git Nexus e /perfil.
- ✅ Verificado no navegador (Playwright): hero, 6 marcos na timeline, 16 cards do mapa, 5 itens educacionais e o painel final.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-sobre-redesign`.

### Redesign #195 — /perfil vira o "Dossiê do Operador"
- 🪪 **`/perfil` reconstruída** no estilo cinematográfico do redesign. A página estava praticamente sem estilo (classes `perfil-*` sem CSS); agora tem um **dossiê imersivo**: emblema **Ω** num anel ciano→magenta girando, nome em degradê, callsign com status "● ONLINE", badges de clearance (OMEGA/ALFA/TANGO) e bio, sobre um fundo com brilho radial + grid e **parallax sutil do brilho com o mouse**.
- 📊 **Cards de estatística** com número em degradê mono, glow e *lift* no hover; **acesso rápido** em cards com glow magenta; **configurações** (nome, callsign, 27 temas/universos em pílulas, toggles, zona de perigo) repaginadas e mantidas 100% funcionais.
- 🎨 Novo `src/styles/perfil.css` usando os design tokens (cores de marca, `--shadow-glow-*`, raios, espaçamentos) — consistente com a home e o Git Nexus.
- ✅ Verificado no navegador (Playwright): hero + emblema, 6 stats, 4 atalhos, 27 swatches de tema/universo, tudo renderizando.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-perfil-redesign`.

### JARVIS ganha o Git Nexus como skills (#231, inspirado no OpenJarvis)
- 🧠 **O JARVIS agora entende o código.** Pergunte *"o que quebra se eu mexer no `helpers.js`?"* e ele chama a skill `nexus_impact` e responde **"risco CRÍTICO, 115 arquivos afetados"** — usando o grafo de conhecimento do Git Nexus, não um chute.
- 🧩 **5 skills novas** registradas no catálogo de ferramentas do agente (`src/utils/jarvis-nexus-tools.js`), no padrão de "skills" do OpenJarvis: `nexus_impact` (raio de explosão + risco), `nexus_context` (quem importa / o que importa), `nexus_path` (caminho entre dois arquivos), `nexus_deps` (dependências), `nexus_rename` (usos que um rename tocaria).
- ♻️ **Reusa o motor que já existe**: cada skill resolve o alvo em linguagem natural (`search`) e chama as funções do `git-nexus-engine` (`nexusImpact`/`nexusContext`/`nexusPath`/`nexusRename`) sobre o `codemap.json`. Grafo montado uma vez (lazy) e reusado. Tudo JS puro, na web.
- 🔌 Plugado via `import` no `jarvis-engine.js` — entram automaticamente no `getToolSchemas()` que vai pro modelo; o loop de tool-call do agente já sabe executá-las.
- ✅ Verificado no navegador (Playwright + Vite dev): as 5 skills no catálogo, `impact helpers` = CRÍTICO/115, `context router` = 26 importadores, `path home→helpers` = 1 salto, `rename helpers` = 112 usos, e alvo inexistente devolvendo erro gracioso.
- 🛡️ Backup: `backup/2026-06-15-pre-merge-jarvis-nexus-skills`.

### Launcher v0.1.1 — ícone do app vira o selo vermelho + bump de versão
- 🔴 **Ícone do launcher trocado pelo selo vermelho**: o `desktop/build/icon.png` ainda era o arc-reactor ciano que eu gerei no M0; agora é o selo (renderizado de `public/logo.svg` num quadrado escuro 1024², com brilho). É o ícone que aparece na barra de tarefas, no atalho e na janela. `build/make-icon.mjs` reescrito pra gerar o ícone a partir do logo do projeto.
- 🎬 **Telas do launcher no mesmo selo**: splash de abertura e tela offline agora mostram o selo vermelho (antes era o arc-reactor em CSS). `logo.svg` copiado pra `desktop/src/` pro app empacotado achar; CSP da splash liberou `img-src`.
- 🩹 **Bug do M0 corrigido**: o `offline.html` estava em `desktop/` (fora de `src/`), então o `main.js` (`__dirname/offline.html`) não o achava **e** ele nem entrava no pacote (`files: src/**/*`). Movido pra `desktop/src/offline.html` — o fallback offline agora funciona de verdade.
- 🔖 `desktop/package.json`: **0.1.0 → 0.1.1**. As releases do GitHub são chaveadas por versão; re-rodar o workflow com a **mesma** versão só atualiza a release existente (mantém a data original). Subir a versão = a próxima execução cria uma release **nova** (`v0.1.1`) com data atual, instaladores frescos **e o ícone novo**.
- ℹ️ A v0.1.0 já está publicada e funcional (`.exe`/`.dmg`/`.AppImage`); a página `/baixar` já serve ela. O ícone novo entra na v0.1.1.
- ✅ Verificado no navegador (Playwright): ícone 1024² renderizado; splash e offline carregando o selo (CSP ok).

### Novo logo — selo arcano vermelho (Baluarte Mark XIII)
- 🔴 **Logo trocado** pelo selo do operador (`19KMF01.svg` → `public/logo.svg`): movido pra `public/` (onde o Vite serve) e **recolorido pra vermelho** (`#ff1f3a`) — o arquivo veio traçado em preto (`fill="#000000"`) e sumiria no fundo escuro.
- 🧩 Fiado em **todos os pontos de marca**: favicon (aba do navegador), tela de boot, topo da sidebar ("Mark XIII") e o brand do header. Glifo `⬡` antigo aposentado nesses lugares; cada um ganhou um leve glow vermelho.
- ℹ️ O ícone do PWA (manifest) ficou como estava (hexágono com fundo escuro) — o selo é detalhado e transparente, não rende bem como ícone de instalação quadrado; dá pra fazer uma versão própria depois se quiser.
- ✅ Verificado no navegador (Playwright): `/logo.svg` servido, vermelho, e renderizando na sidebar.

### Release do app: workflow disparável + publicação direta (#222)
- 🚀 **`desktop-release.yml` agora dispara também por `workflow_dispatch`** (botão "Run workflow" na aba Actions, ou via API) — além da tag `desktop-v*`. Permite cortar a 1ª release sem depender de push de tag.
- 📦 **`releaseType: 'release'`** no electron-builder: a release sai **publicada** (não rascunho), então vira a "latest" e a página `/baixar` a enxerga automaticamente.

### Página de download do app (estilo Steam/Claude) (#222)
- ⬇ **Nova página `/baixar`**: a pessoa clica e baixa o **Baluarte Launcher** num clique, sem entender nada de programação. Detecta o **sistema operacional** (Windows/macOS/Linux) e oferece o instalador certo como CTA principal; as outras plataformas ficam como opções secundárias.
- 🔗 **Sempre a última versão**: busca a **release mais recente** do GitHub em runtime (API), casa o asset por extensão (`.exe`/`.dmg`/`.AppImage`) e aponta direto pro download — nada hardcoded. Some "v" duplicado e mostra **tamanho + versão**.
- 🌫️ **Degradação graciosa**: se ainda não houver instalador publicado (ou offline/rate-limit), mostra "build em breve" com link pro GitHub — nunca quebra.
- 🎨 Visual no estilo do projeto: núcleo arc-reactor animado, CTA em degradê ciano→magenta, cards de "por que o app" e notas de instalação por SO (SmartScreen/Gatekeeper/AppImage).
- 🧭 Entrou no menu lateral ("Baixar o App", logo abaixo da Ponte de Comando).
- ✅ Verificado no navegador (Playwright): com release simulada = baixa o `.exe` certo (v0.1.0 · 74.9 MB); sem release = estado "em breve".
- 🛡️ Backup: `backup/2026-06-15-pre-merge-pagina-download`.

## 2026-06-14

### App desktop (Baluarte Launcher) — M3b: orbe roda no grafo REAL do motor (#222)
- 🧠 **Grafo de verdade no orbe 3D**: no Baluarte Launcher, a `/git-nexus` busca o grafo real do motor (`nexus:graph` → `/api/repos` + `/api/graph` do 1º repo analisado) e o **mesmo pipeline** (comunidades, PageRank, impacto, centralidade) passa a rodar nele — via `fromEngineGraph()` que converte `{nodes, relationships}` do GitNexus pro formato do `analyze()`. **Sem fork**: na web (sem launcher) ou se não houver repo analisado, segue no `codemap.json`.
- 🔌 **Handler `nexus:graph`** na ponte IPC (M2) + `nexus.graph()` no desktop (pega o 1º repo de `/api/repos`, busca `/api/graph?repo=…`, timeout maior).
- 🏷️ A dica do grafo vira "grafo REAL do motor" quando o motor alimenta a cena.
- ✅ Verificado no navegador (Playwright): web = codemap (187 arquivos, badge oculto); launcher simulado com grafo do motor = orbe renderiza os 44 nós/78 arestas reais, comunidades e "mais central/importado" calculados sobre eles, badge verde, dica "grafo REAL".
- 🧱 Falta a **fatia nativa (M3c)**: empacotar o motor + nativos (`electron-rebuild`) e subir a 4747 por padrão — aí o aceite é ponta-a-ponta na máquina.
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m3b`.

### App desktop (Baluarte Launcher) — M3a: detecção do motor real do GitNexus (#222)
- 🔌 **`desktop/src/nexus.js`**: detecta o **motor real** do GitNexus (servidor Express do pacote `gitnexus` na **4747**) via `GET /api/health` + `/api/info`. Spawn opt-in por enquanto (`BALUARTE_NEXUS_CMD`), sem shell e com args fixos; encerra junto com o app.
- 🧩 **Handler `nexus:status`** plugado na allowlist da ponte IPC (M2) — devolve `{ available, url, version?, nodeVersion?, spawned }`.
- 🟢 **Badge na página `/git-nexus`**: dentro do **Baluarte Launcher**, mostra **verde** "Motor real do GitNexus conectado · vX" ou **âmbar** "Motor local indisponível — usando o mapa de build". Na **web** (sem `window.baluarte`) o badge fica oculto e a página segue com o `codemap.json` — degradação graciosa, sem fork.
- ✅ Verificado no navegador (Playwright): web = badge oculto e página intacta; launcher simulado = badge âmbar (off) e verde (live, v1.6.7) renderizando sob o header.
- 🧱 Próxima fatia (**M3b**): empacotar o motor + nativos (`tree-sitter` ×11, `onnxruntime-node`, `@ladybugdb/core`) com `electron-rebuild` e consumir o **grafo real** (`/api/graph`).
- 🛡️ Backup: `backup/2026-06-14-pre-merge-desktop-m3a`.

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
