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
> Divisão (ideia do operador): **a sessão remota faz o web verificável + prepara;
> uma sessão LOCAL pega este doc e executa o que depende das skills/da máquina.**

## Como usar (sessão local)

1. Abra este repo no **Claude Code local** (onde as skills estão instaladas).
2. Leia este doc + as issues guarda-chuva: **#238** (app completo / site leve),
   **#222** (app desktop M0→M6), **#231** (JARVIS ↔ Git Nexus skills),
   **#195** (redesign 3D/imersivo), **#232** (runtimes próprios / M4) e o
   **roadmap #240** (a fila remota está zerada; o que sobra é tudo daqui).
3. Execute as tarefas invocando as skills (`/<skill>`) onde indicado.

---

## A. Design & animação — skills do `claudedesignskills`

> **Regra do mega-plano (#238):** **web = leve.** No site, só técnicas leves
> (GSAP ScrollTrigger, Anime.js sutil, Lottie pequeno). **3D pesado** (Three.js,
> Vanta, R3F, post-processing) entra **só no app**, atrás de `window.baluarte.native`.
>
> O que o remoto já fez no web (não refazer): herói WebGL com **5 variantes** +
> power-on + pulso de energia + parallax/deriva, **atmosfera global + herói
> reativos ao universo** (recolor por skin), **transição de entrada de página**,
> scroll-reveal global. As ondas 2 e 3 do redesign #195 já entraram (#242/#243).

- [ ] **GSAP ScrollTrigger** refina o `src/utils/scroll-reveal.js` (hoje na mão,
      IntersectionObserver): parallax sutil + reveals encadeados, sem trocar por
      lib pesada no web.
- [ ] **Three.js** — cena 3D mais rica no herói **só no app** (`window.baluarte.native`);
      a web mantém o WebGL leve atual.
- [ ] **Microinterações** Anime.js / Lottie leves em ícones, CTAs e badges das
      flagships (/perfil, /sobre, Seção Militar).
- [ ] **(Opcional, app-only) Bloom/glow** no herói WebGL via post-processing (FBO +
      blur pass) — medir custo antes; é o "wow" 3D que falta e pesa demais pra web.

## B. App / Git Nexus real — M3c · M3d · M4 (precisa da máquina)

> O launcher já é um "cliente bridge" do gitnexus (M3a/M3b: detecta a 4747,
> consome o grafo via a ponte IPC). Falta validar o lado nativo na máquina.

### M3c — o app sobe o motor sozinho · **código em `main`, falta o aceite**

`desktop/src/nexus.js` já sobe `gitnexus serve --port 4747` por padrão (cadeia
override → vendored → bin global → npx, readiness no `/api/health`).

```sh
# 1. ter o motor (escolha UMA):
npm i -g gitnexus                                   # (A) global
#   (B) nada: o fallback npx baixa sozinho
#   (C) docker run -p 4747:4747 ghcr.io/abhigyanpatwari/gitnexus

# 2. analisar UM repo (registra em ~/.gitnexus/registry.json):
cd /caminho/dum/repo && gitnexus analyze

# 3. (sanity, se já houver motor no ar):
curl -s http://127.0.0.1:4747/api/health           # → {"status":"ok"}

# 4. abrir o launcher (ele sobe o motor sozinho se não houver um no ar):
cd desktop && npm start
```

**Aceite:**
- [ ] `/git-nexus` no app: badge **VERDE** + orbe no **grafo real** (não o codemap estático).
- [ ] DevTools → `await window.baluarte.invoke('nexus:status')` → `{ available:true, spawned:true | via:'externo' }`.
- [ ] `BALUARTE_NEXUS_DISABLE=1 npm start` → cai no teaser/codemap (confirma o gate).

Flags: `BALUARTE_NEXUS_CMD` (override do comando) · `BALUARTE_NEXUS_DISABLE=1` (não subir).

### M3d — tools profundas no app · **código no PR #247 (draft), falta o aceite**

O código vive na branch **`claude/git-nexus-m3d-tools` (PR #247)** — **não está em `main`**.
Adiciona `src/utils/git-nexus-client.js` (com fallback pro codemap na web), handlers
IPC `nexus:query/cypher/fluxos/clusters`, a ponte **MCP-over-HTTP** (`POST /api/mcp`,
JSON-RPC) e os REST de leitura (`/api/graph`, `/api/search`, `/api/processes`, `/api/clusters`).

```sh
# 1. motor no ar + repo analisado (M3c acima)
# 2. pegar a branch do PR #247:
git fetch origin claude/git-nexus-m3d-tools && git checkout claude/git-nexus-m3d-tools
# 3. rodar o app:
cd desktop && npm start
# 4. (sanity) o MCP responde?
curl -s -X POST http://127.0.0.1:4747/api/mcp -H 'content-type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

**Aceite:**
- [ ] No Console do `/git-nexus` (no app), `query` / `cypher` / `fluxos` / `clusters`
      devolvem **dados reais** do motor; na web caem no codemap/teaser sem quebrar.
- [ ] Validado → tirar o draft e **mergear o #247**.
- [ ] Depois: plugar as 16 tools profundas de grafo via o mesmo `/api/mcp`.

### M4 — runtimes próprios · **greenfield** (RFC #232)

Objetivo: zero-setup — o app provê Node 22 + Python 3.11 numa pasta dele, **sem
tocar no sistema**.

- [ ] Preflight no `desktop/` que detecta runtimes em `app.getPath('userData')/runtimes/…`;
      se faltar, baixa o tarball oficial por SO/arch e extrai lá.
- [ ] Apontar o spawn do gitnexus (`desktop/src/nexus.js`) pro Node embutido quando existir.
- [ ] Python só se alguma tool do motor exigir (checar o upstream).
- **Aceite:** numa máquina limpa (sem Node/Python globais), abrir o app → `/git-nexus`
  verde **sem nenhum `npm i -g`**.

### M5 — Hermes AGENTE com motor EMBUTIDO no app (#310/#231) · **scaffold em `main`, falta a máquina**

Objetivo: o modo **"Hermes (agente local)"** do JARVIS usar, no app, o motor
**embutido** (llama.cpp/GGUF) em vez do WebLLM — sem navegador/WebGPU, modelos
maiores. O **remoto já deixou tudo pronto e inerte**:
- Front: núcleo de agente (`src/utils/jarvis-agent-core.js`, protocolo Hermes
  `<tool_call>`) + `jarvis-hermes-native.js` (prefere o motor embutido quando
  `hermes:status.available`) + o modo no `/jarvis`. Sem o app, cai no WebLLM.
- App: `desktop/src/hermes.js` (lazy, guardado) + handlers `hermes:status` /
  `hermes:generate` na allowlist do `desktop/src/ipc.js`. **Hoje devolve
  `available:false`** (sem dep/modelo) — por isso NÃO quebra o build atual.

Passos (local):
- [ ] `cd desktop && npm i node-llama-cpp` (compila nativo por SO) e commitar o
      `package-lock.json` novo. Considerar `optionalDependencies` se algum SO da
      matriz de release falhar ao compilar.
- [ ] Fornecer um GGUF do **Nous Hermes** (ex.: `Hermes-2-Pro-Mistral-7B.Q4_K_M.gguf`):
      em dev, apontar `BALUARTE_HERMES_MODEL=/caminho/modelo.gguf`; no instalador,
      empacotar via `extraResources` (`desktop/models/*.gguf` → `resources/models`)
      **ou** baixar no 1º uso pra `app.getPath('userData')/models` (evita instalador gigante).
- [ ] Testar `npm start` no `desktop/`: `/jarvis` → modo "Hermes (agente local)"
      deve mostrar "motor embutido: …" e executar tool-calls sem WebGPU.
      Refinar a geração em `hermes.js` (template de chat / `setChatHistory` conforme
      a API do node-llama-cpp instalado).
- **Aceite:** numa máquina sem WebGPU, o agente Hermes responde e usa ferramentas
  100% local, via o motor embutido.

### M6 — Núcleo de IA: moldura 3D assada no Blender (Fase B do #316) · **cena pronta em `main`**

Objetivo: aliviar CPU/GPU do backdrop do Núcleo — a estrutura complexa
(carcaça/anéis) vem de um `.glb` **pré-assado no Blender** (normais/AO), e o
procedural fica só no que precisa ser vivo (núcleo de partículas + constelação +
bloom). O **remoto já deixou a cena pronta**: `src/utils/nucleo-scene.js` carrega
um GLB **opt-in** (`GLTFLoader` lazy) e esconde os anéis procedurais quando o
asset existe; sem asset, fica no procedural (zero regressão).

Passos (local, precisa do Blender):
- [ ] Modelar a moldura do núcleo no **Blender** (anéis/carcaça) e **bake** de
      normais/AO; exportar **`public/models/nucleo/frame.glb`** (Draco ou meshopt).
- [ ] Apontar a URL: no app/console → `localStorage['baluarte:nucleo:glbUrl'] =
      '/models/nucleo/frame.glb'` (ou plugar num toggle no cockpit). A cena passa
      a usar o GLB e esconde os anéis procedurais.
- [ ] Medir antes/depois (draw calls / triângulos / fps) — alvo 60fps no app.
- **Aceite:** o Núcleo abre com a moldura do GLB (mais leve) + o núcleo/constelação
      procedurais vivos por cima; fps igual ou melhor que o procedural puro.

### M7 — Mobile nativo com Capacitor (M4 do #323 v0.4.0) · **Android pronto pra buildar no CI; falta assinar + iOS**

O **remoto já deixou pronto** (não refazer): `capacitor.config.json`
(com.baluarte.app, webDir dist, fundo `#0e0c16`), projeto **`android/`
scaffoldado e commitado** (Gradle), **permissão de câmera** no
`AndroidManifest.xml` (Corpo Total/OCR), **ícones/splash** gerados do
`logo.svg` em todas as densidades (fontes em `assets/`), scripts
`npm run mobile:sync` / `mobile:open`, e o workflow **Mobile Release**
(`.github/workflows/mobile-release.yml`: tag `mobile-v*` ou Run workflow →
APK debug + AAB release não assinado, anexados à release).

Passos (local):
- [ ] **Rodar o workflow Mobile Release** (Actions → Mobile Release → Run
      workflow) → baixar o `app-debug.apk` e **testar no aparelho**: navegação
      hash, offline básico (SW), câmera no OCR, e o gate (`window.baluarte.native`
      indefinido → experiência web leve, correto pro #238).
- [ ] **Assinatura de produção**: keystore própria → assinar o
      `app-release.aab` → Play Console (faixa interna primeiro).
- [ ] **iOS (precisa de macOS/Xcode)**: `npx cap add ios && npx cap sync ios`
      → ícones (mesmas fontes em `assets/`) → permissão de câmera no
      `Info.plist` (`NSCameraUsageDescription`) → arquivar no Xcode → TestFlight.
- **Aceite:** APK instala e navega offline; câmera funciona no OCR; AAB
      assinado aceito na Play; build iOS arquivado.

### Outros (local)

- [ ] **gitnexus no próprio Claude Code local**: `npx gitnexus analyze` + `npx gitnexus
      setup` → dá ao agente os 16 tools MCP de grafo (context, impact, rename…).
- [ ] **Publicar releases**: `desktop/package.json` já em **0.3.0** (Hermes embutido) →
      Actions → **Desktop Release** → Run workflow (ou push da tag `desktop-v0.3.0`) →
      instaladores Win/Mac/Linux. ⚠️ Faça DEPOIS de fechar o M5 (dep + modelo), senão
      o instalador sai sem o motor embutido (só WebLLM — que já funciona).

## C. Mega-plano #238 — app completo / site leve

- [x] **Fase 1 — medir** ✅ (comentário no #238): boot web ~111 kB gz; pesados lazos por rota.
- [x] **Fase 2 — gate + CSS split** ✅ (#278): Git Nexus atrás de `window.baluarte.native`
      (web = teaser; chunk pesado **438 KB / ~49 kB gz** fora do boot) + CSS split por
      rota (boot CSS **55 → 29.5 kB gz**). Verificado no navegador.

---

## O que a sessão REMOTA já deixou pronto (não refazer)

- **App desktop** M0→M3c: launcher carrega a produção, auto-update, casca
  (splash/tray/deep-link), ponte IPC allowlisted, detecção do motor (M3a), grafo
  real (M3b) e **autostart do motor** (M3c, código). **Release v0.1.0 publicada.**
- **Página `/baixar`** (detecta SO, baixa o instalador certo).
- **JARVIS ↔ Git Nexus** (#231): **5 skills por arquivo** (`nexus_impact/context/path/
  deps/rename`) + **5 skills por função** (`nexus_fn_impact/context/path/deps/hot`, #279,
  sobre `codemap-symbols.json` — 1137 funções).
- **Redesign #195/#246**: /perfil, /sobre, **12 págs da Seção Militar**, Ondas 2 (#242)
  e 3 (#243), páginas leves (#244); herói WebGL (5 variantes + power-on + pulso +
  parallax), **atmosfera + herói reativos ao universo** (#281/#282), **transição de
  entrada de página** (#280), CSS split (#278).
- **Scroll-reveal global** (`src/utils/scroll-reveal.js`) — base pra GSAP refinar.
- **Logo** selo vermelho (favicon, boot, sidebar, header, ícone do app).
- RFCs/issues: #222, #231, #232, #238 · Roadmap **#240** (fila remota zerada).

## Arquivos-chave

| Arquivo | O quê |
|---|---|
| `desktop/src/nexus.js` | detecção + autostart do motor (M3c) — flags `BALUARTE_NEXUS_*` |
| `desktop/src/ipc.js` | ponte allowlisted (handlers `nexus:*`) |
| `src/utils/git-nexus-client.js` | **(no PR #247)** cliente das tools + fallback codemap |
| `src/utils/jarvis-nexus-tools.js` | skills do Nexus no JARVIS (arquivo **e função**) |
| `src/utils/git-nexus-engine.js` | motor de grafo em JS (serve arquivo e função) |
| `src/utils/scroll-reveal.js` | base do scroll-reveal (GSAP refina) |
| `src/utils/hero-webgl.js` | herói WebGL (variantes, pulso, `heroSkinColors()` p/ universo) |
| `src/styles/atmosphere.css` | atmosfera global reativa ao universo |
| `GitNexus-1.6.7/` | cópia vendorizada do motor (excluída do Vercel) |
