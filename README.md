# ⬡ Projeto Baluarte — Mark XIII

Plataforma web narrativa, militar e de ferramentas técnicas de **Lucas Belucci
Bellini**.

**Stack (não negociável):** JavaScript puro (ES2022) + HTML5 + CSS3 + Vite 5.
Sem TypeScript. Sem framework. Sem JSX.

> Esta é a 13ª iteração do projeto. As 12 anteriores quebraram por TypeScript,
> stubs incompletos ou HTMLs gigantes inline. O Mark XIII foi construído
> incrementalmente em **21 fases** — cada uma entregando algo funcional — até a
> **v1.0.0**. A partir dela, a **v2.0.0** expande a plataforma com novas
> ferramentas, mais conteúdo e um catálogo militar completo.

---

## Como rodar

### Windows (duplo-clique)

```
start.bat
```

### Qualquer plataforma (terminal)

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

### Build de produção

```bash
npm run build      # gera dist/
npm run preview    # serve dist/ para teste
```

**Requisitos:** Node.js 18+ (testado com 22). O deploy de produção roda no
Vercel, reconstruído a partir da branch `main`.

---

## O que tem no Baluarte

São **36 rotas**, todas implementadas. O menu lateral organiza tudo em 6 grupos.

### Operações
- **Ponte de Comando** — painel inicial com status do sistema.
- **Hub de Ferramentas** — catálogo navegável de todas as ferramentas.

### Ferramentas
- **Editor de Código** — 26 linguagens, multi-abas, runners JS/HTML/CSS/MD e
  edição estilo VS Code (auto-fechamento de pares, auto-indentação, `Ctrl+/`,
  mover/duplicar linha).
- **Terminal Web** — 60+ comandos POSIX-like, filesystem virtual, pipes.
- **Calculadoras** — científica, numérica (IEEE 754) e o hub com financeira,
  conversores, estatística, engenharia e saúde.
- **Tabela Verdade** — parser lógico, Mapa de Karnaugh e Quine-McCluskey.
- **Lab de Cripto** — César, Base64/32, SHA, AES-GCM, Vigenère, Atbash, OTP.
- **Esteganografia** — esconde/revela texto em imagens via LSB (Canvas), com
  opção de cifrar com AES-256 antes de esconder. Exporta PNG sem perda.
- **Lab de Regex** — tester com destaque de matches e cheatsheet.
- **Gerador de Gráficos** — 12 tipos em Canvas 2D puro.
- **Símbolos** — 1200+ caracteres Unicode pesquisáveis.
- **Logic Sim** — simulador de lógica digital interativo (14 portas, fios,
  propagação em tempo real, realimentação).
- **Portas Lógicas** — enciclopédia de lógica digital: símbolos, tabelas verdade,
  blocos construtivos e catálogo de CIs 7400/4000.
- **Código Morse** — texto ↔ Morse, áudio por oscilador e flash visual.

### Conhecimento
- **Biblioteca** — as Crônicas da Baluarte (24 arcos, 1127 capítulos).
- **Academia** — 16 linguagens de programação + recursos externos de estudo.
- **Robótica** — currículo de 12 módulos, do básico ao avançado.
- **Universo** — 10 universos narrativos cruzados.
- **Tabela Periódica** — 118 elementos.
- **Modpack Minecraft** e **Guia para Montar PC**.

### Mídia
- **Visualizador FFT** — 6 modos via Web Audio; capta microfone, arquivo,
  oscilador e o áudio do próprio PC.
- **Media Hub** — player local de áudio/vídeo/imagem.
- **Central de Vídeos** — playlists temáticas.
- **Arquivo de Memes** — catálogo curado dos memes de 2016.
- **Cinema** — acervo de filmes com player embutido.

### Tático
- **Arsenal** — catálogo militar completo: armas leves, artilharia, defesa
  aérea, aeronaves, frota naval, drones e veículos (251 itens, 15 categorias).
- **Elites** — 26 equipes operacionais ALFA→ZULU.
- **CiberSeg** — enciclopédia de cibersegurança.
- **Economia** — cotações de câmbio e cripto ao vivo.

### Sistema
- **J.A.R.V.I.S.** — assistente em 4 modos (local, Claude API, Ollama, agente).
- **IA Proprietária Mark 11** — sistema de Skills modular.
- **Perfil** — identidade do operador, estatísticas e configurações.
- **Sobre o Projeto** — a história das 13 iterações.

---

## Arquitetura

```
Projeto-Baluarte/
├── index.html                SPA shell + <link> de todos os CSS
├── vite.config.js            Build Vite 5
├── public/
│   ├── manifest.json         PWA
│   └── sw.js                 Service Worker (stale-while-revalidate, versionado)
└── src/
    ├── main.js               Bootstrap: registra as 36 rotas + monta o shell
    ├── core/                 Engine
    │   ├── router.js         Router SPA por hash (#/home, #/arsenal…)
    │   ├── state.js          Store reativo
    │   ├── events.js         Event bus pub/sub
    │   └── storage.js        localStorage com fallback em memória
    ├── layout/               header, sidebar, shell
    ├── pages/                Uma função por rota → retorna HTMLElement
    ├── data/                 Datasets (arsenal, academia, fanfic.json…)
    ├── utils/                Engines e helpers (h(), fft-engine, logic-sim…)
    └── styles/               Design system — Material 3 Dark + Neon
```

Cada página é uma função pura que devolve um `HTMLElement`, montado pelo `h()`
— um helper de ~30 linhas em `utils/helpers.js`. Não há virtual DOM nem
framework.

---

## Stack (não negociável)

- **Frontend:** JavaScript ES2022 (módulos ESM nativos), HTML5, CSS3.
- **Build:** Vite 5.
- **Persistência:** localStorage + IndexedDB (J.A.R.V.I.S.).
- **Cripto:** Web Crypto API nativa.
- **Áudio:** Web Audio API nativa.
- **Gráficos:** Canvas 2D puro.
- **Fontes:** Inter + JetBrains Mono.
- **Design:** Material 3 Dark + Neon (cyan `#00f0ff` / magenta `#ff00aa`).

---

## Histórico de versões

O **v1.0.0** consolidou 21 fases incrementais (Foundation, Editor, Terminal,
Calculadoras, Cripto, Arsenal, Biblioteca, Elites, FFT, Universo, PWA, JARVIS,
IDE + IA Proprietária). Cada fase fechou com tag e Release no GitHub.

A **v2.0.0** está em desenvolvimento na branch `v2.0.0` e adiciona, entre
outras coisas: o Logic Sim interativo, a Enciclopédia de Lógica Digital, o
gerador de Código Morse, o Arquivo de Memes, o Cinema, o currículo de Robótica,
o Arsenal como catálogo militar completo, a edição estilo VS Code no editor e a
captura do áudio do PC no FFT.

---

## Regras de ouro

1. **Nada de TypeScript.** Nunca — 12 versões anteriores quebraram por isso.
2. **Nada de JSX/React/Vue.** JavaScript puro + funções que retornam `HTMLElement`.
3. **Só fecha quando funciona no navegador** — não basta compilar.
4. **Trabalho incremental e versionado** no GitHub.

---

## Contato

Repositório: <https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte>
