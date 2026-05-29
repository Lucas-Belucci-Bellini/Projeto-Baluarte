# 🗺️ Mega-Plano — Arcade, Radar no celular, Jarvis e integração dos repositórios

> Documento-mestre da continuação do **Projeto Baluarte Mark XIII**.
> Cobre: a nova **seção de jogos (Arcade)**, o **jogo enorme de linguagens
> (Code Quest)**, o **radar funcionando no celular**, o plano da **IA Jarvis**
> com os 4 repositórios indicados, e a estratégia para **integrar os 16
> repositórios de radar/tracking** (PRs #71–#86) no site.
>
> Stack (não negociável): **JavaScript puro + HTML + CSS + Vite**. Sem
> framework, sem TypeScript. Tudo client-side e offline-first quando possível.

---

## 0. Como trabalhamos (ponto de retorno)

- Todo trabalho é feito na branch **`claude/dazzling-gates-WK4rE`**.
- A cada entrega: **commit → push → Pull Request (draft) para a `main`**.
- O **PR é o ponto de retorno**: a `main` continua estável e você só funde
  (merge) quando aprovar. Assim nunca se perde um estado bom.
- Rodar localmente: `npm install` → `npm run dev` (abre em `localhost:5173`).
  Build de produção: `npm run build`.

---

## 1. ✅ Entregue nesta leva

### 1.1 Arcade Baluarte — a nova seção de jogos (`/jogos`)
Antes, `/jogos` **abria direto** no jogo de JavaScript. Agora é um **hub**:

- **Menu de jogos** (cartões) — você escolhe o que jogar, não abre nada sozinho.
- **Conta com nome + senha** (`src/utils/players-engine.js`): a senha é
  guardada com hash SHA-256×100 (reaproveita o `auth-engine.js`), nunca em texto
  puro. Dá para **sair e voltar depois** que o progresso continua.
- **Pontuação, XP e nível** com patentes (Recruta → Marechal).
- **Ranking** local entre as contas do navegador (ordenado por pontos).
- **Continuar de onde parou** (a campanha do Code Quest salva a posição).
- **Responsivo** para celular.

> Arquivos: `src/pages/jogos.js`, `src/utils/players-engine.js`,
> `src/data/code-quest.js`, `src/styles/jogos.css`.

### 1.2 Code Quest — o jogo enorme de linguagens
Jogo novo dentro do Arcade para **aprender programação jogando**:

- **17 trilhas** (Python, JavaScript, Java, C, C++, C#, TypeScript, Go, Rust,
  PHP, Ruby, Kotlin, Swift, SQL, Bash, HTML, CSS).
- **Modo Campanha** (todas as linguagens em sequência) e **Treino** (uma
  linguagem só).
- Cada acerto vale 10 pontos → vira XP → sobe de nível no ranking.
- Banco de questões em `src/data/code-quest.js` — **fácil de expandir**: é só
  adicionar objetos/linguagens; a engine monta tudo sozinha.

### 1.3 Radar no celular — modo ACÚSTICO
O console de radar agora tem o modo **🎙 ACÚSTICO**, que **funciona em qualquer
celular sem hardware extra**:

- O alto-falante emite um tom quase inaudível (~19 kHz) e o microfone capta o
  eco. Movimento desloca a frequência (**efeito Doppler**) → o radar destaca
  alvos em movimento de verdade (passar a mão, andar perto, etc.).
- Reaproveita todo o pipeline existente (DC-notch, MTI, CFAR-CA, heatmap,
  waterfall) — só trocou a **fonte** de dados.
- Layout do radar ajustado para telas pequenas.

> Arquivos: `src/utils/radar-source.js` (classe `AcousticSource`),
> `src/pages/radar.js`, `src/styles/radar.css`.
> **Como testar:** abra `/radar` no celular → toque em **ACÚSTICO** → permita o
> microfone → mexa a mão perto do aparelho e veja os blips.

---

## 2. 📡 Radar — mega-plano para o celular (roadmap completo)

O objetivo é um radar que funcione **do desktop ao celular**, do "sem hardware"
até SDR de verdade. Em camadas (tiers):

| Tier | Nome | O que é | Hardware | Status |
|------|------|---------|----------|--------|
| A | **Acústico (CW Doppler)** | speaker+mic em ~19 kHz | nenhum (só o celular) | ✅ feito (v1) |
| A+ | **Acústico calibrado** | varre 17–20 kHz e escolhe a faixa mais limpa; mostra **velocidade real** em m/s (`v = c·Δf / (2·f₀)`, c≈343 m/s) | nenhum | ⏳ próximo |
| B | **Sensores do aparelho** | acelerômetro/giroscópio (DeviceMotion) + bússola + GPS → overlay de movimento e mapa | nenhum | ⏳ |
| C | **Bridge por Wi-Fi (PWA)** | o celular vira tela/controle e conecta via WebSocket num servidor em casa rodando `tools/radar-bridge` | PC + SDR/ESP32 | ⏳ |
| D | **SDR real** | RTL-SDR / HackRF: radar passivo e FMCW de verdade pelo bridge | SDR | ⏳ |
| E | **SAR / imagem** | imageamento (ground-based SAR) | SDR + trilho | 🔭 futuro |

### Próximos passos do radar (ordem sugerida)
1. **A+ Calibração acústica**: sweep de frequência no start; readout de
   velocidade em m/s; controle de frequência/volume na UI.
2. **Gravação/replay**: gravar uma sessão acústica em JSON (`/public/radar/…`)
   e alimentar o modo REPLAY (hoje é estub).
3. **B Sensores**: módulo `radar-motion.js` lendo `devicemotion` →
   "radar inercial" + bússola.
4. **C Bridge LAN + PWA**: documentar o protocolo do `tools/radar-bridge`
   (pacote JSON `{index,timestamp,rows,cols,mag}`) e empacotar como PWA para o
   celular instalar e conectar no servidor de casa.
5. **D/E**: portar algoritmos dos repositórios vendored (ver §3).

---

## 3. 🧩 Integração dos 16 repositórios de radar/tracking (PRs #71–#86)

Os PRs **#71–#86** adicionam, cada um, **um repositório inteiro de terceiros**
em `vendor/<nome>`. Alguns são **enormes** (PLFM_RADAR ~185 MB, RuView ~154 MB,
SDR-GB-SAR ~92 MB). Somados passam de **500 MB**.

### Recomendação (importante)
**Não fundir os repositórios gigantes na `main`.** O site é um app Vite estático
(deploy na Vercel) — meio gigabyte de código de terceiros incharia o repo,
deixaria o clone lento e não agregaria nada ao site publicado. Em vez disso:

1. **Manter como referência** (deixar os PRs como rascunho/fechados, ou mover
   para uma branch `reference/` ou submódulos git) — sem ir para a `main`.
2. **Extrair os algoritmos** que interessam para **módulos JS pequenos e sem
   dependências** dentro de `src/utils/` (igual o `radar-dsp.js` já fez,
   "inspirado no PLFM_RADAR").
3. Cada repo vira **uma ideia/feature** do radar, não um peso morto.

### Mapa: repositório → o que aproveitar → onde
| PR | Repositório | Técnica | Vira no Baluarte |
|----|-------------|---------|------------------|
| #71 | PLFM_RADAR | FMCW range-Doppler | refinar `radar-dsp.js` (já inspirado nele) |
| #72 | RuView | visualização/UI | ideias para os scopes/heatmap |
| #73 | espectre | radar **passivo** (RTL-SDR) | modo passivo via bridge (Tier D) |
| #74 | passiveRadar | cross-ambiguity passivo | algoritmo de referência do bridge |
| #75 | SDR-GB-SAR | **SAR** terrestre | modo imagem (Tier E) |
| #76 | samGNSS/radar | GNSS | posicionamento |
| #77 | navtrack | plataforma de GPS tracking | conceitos de tracking/servidor |
| #78 | tracktor | rastreio de veículos | UI de frota/trajeto |
| #79/#80 | triangulation (×2) | triangulação / AoA | localização multi-sensor |
| #81 | intrinsic-triangulations | geometria/malha | (opcional) malha de mapa |
| #82 | TriWild | malha 2D robusta | (opcional) |
| #83 | r4ven | geo/IP + câmera (web) | demo de geolocalização (com privacidade) |
| #84 | find (schollz) | posição **indoor** por Wi-Fi | modo de localização interna |
| #85 | geopulse | linha do tempo de localização | histórico de movimento |
| #86 | GPS-Tracker (PHP) | servidor de rastreio GPS | referência de backend de tracking |

> Decisão pendente sua: confirmo o fechamento dos 16 PRs de vendor e sigo pela
> via "extrair conceitos em módulos pequenos"? (recomendado)

---

## 4. 🤖 Jarvis — plano com os 4 repositórios

**Estado atual (já funciona bastante):** `/jarvis` tem **6 modos** (local,
WebLLM no navegador, Claude API, Ollama, Servidor/Gemini, Agente), **memória de
conversas em IndexedDB** e **tool-use** no modo agente.
Arquivos: `src/pages/jarvis.js`, `src/utils/jarvis-engine.js`,
`jarvis-memory.js`, `jarvis-tools.js`, `jarvis-webllm.js`, `backend/server.py`,
`api/chat.py`.

Os 4 repositórios indicados encaixam assim:

| Repositório | O que é | Como usar no Jarvis | Fase |
|-------------|---------|---------------------|------|
| **conorbronsdon/avoid-ai-writing** | "skill" que detecta/remove padrões de texto de IA (43 categorias) | **Humanizador**: portar o detector para `src/utils/jarvis-style.js` e passar a resposta do Jarvis por ele → português mais natural | **P1** (rápido, isolado) |
| **thedotmack/claude-mem** | memória persistente (resumo + busca semântica) | Evoluir o `jarvis-memory.js`: resumo de sessão, recall por relevância, "disclosure progressivo" para gastar menos tokens | **P2** |
| **NousResearch/hermes-agent** | framework de agente / function-calling (formato Hermes) | Reforçar o **modo Agente**: laço de tool-use e schema de funções mais robustos | **P3** |
| **EKKOLearnAI/hermes-web-ui** | UI web de chat | Polir a interface do Jarvis (streaming, componentes de mensagem) | **P4** |

> ⚠️ Verificar acesso: `claude-mem` e `avoid-ai-writing` são públicos (confirmado).
> Os dois `hermes-*` precisam ser validados (podem ser privados/404) antes de
> depender deles — se não abrirem, busco equivalentes públicos.

**Primeira tarefa recomendada (P1):** o **humanizador** do `avoid-ai-writing` —
é client-side, sem servidor, melhora todos os modos e dá para entregar rápido.

---

## 5. 🎮 Code Quest — expansão do "jogo de todas as linguagens"

- **Mais questões**: meta de 15–20 por linguagem (hoje ~5).
- **Novos tipos**: "preencha a lacuna", "ordene as linhas", "ache o bug",
  "qual a saída" (texto livre, como o jogo de JS).
- **Dificuldade**: trilhas Fácil/Médio/Difícil e faixas (belts) por linguagem.
- **Engajamento**: desafio diário, conquistas/medalhas, sequência (streak).
- **Ranking online (opcional)**: sincronizar pontos com o backend quando ele
  estiver no ar (hoje o ranking é local por navegador).

---

## 6. ✅ Backlog priorizado (próximos passos)

1. **Jarvis P1 — humanizador** (`jarvis-style.js`) — rápido e de alto impacto.
2. **Radar A+ — calibração acústica + velocidade em m/s**.
3. **Code Quest — dobrar o banco de questões + tipo "ache o bug"**.
4. **Decisão sobre os 16 PRs de vendor** (fechar e extrair conceitos).
5. **Radar B — sensores do celular** (acelerômetro/bússola/GPS).
6. **Jarvis P2 — memória estilo claude-mem**.
7. **Radar C — bridge por Wi-Fi + PWA** (celular ↔ servidor de casa).

> Diga qual item puxar primeiro que eu sigo — cada um vira uma branch + PR.
