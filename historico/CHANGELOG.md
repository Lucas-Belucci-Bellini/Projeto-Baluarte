# 📜 Histórico de Alterações — Projeto Baluarte

Registro do que entra no `main`. Fluxo de segurança: **antes de cada merge** é
criada uma branch de backup (`backup/AAAA-MM-DD-...`); **depois** registra-se
aqui o que mudou.

---

## 2026-06-08

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
