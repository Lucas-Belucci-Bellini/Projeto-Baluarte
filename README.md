# ⬡ Projeto Baluarte — Mark XIII

Plataforma web narrativa/militar de Lucas Belucci Bellini.
**Stack:** JavaScript puro (ES2022) + HTML5 + CSS3 + Vite. Sem TypeScript. Sem framework.

> Esta é a 13ª iteração do projeto. As 12 anteriores quebraram por TypeScript, stubs incompletos ou HTMLs gigantes inline. O Mark XIII é construído incrementalmente em **5 fases**, cada uma entregando algo funcional e versionado por tag/release no GitHub.

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

**Requisitos:** Node.js 18+ (testado com 22).

---

## Roadmap em 21 fases

Cada fase fecha com `tag` e `Release` no GitHub para permitir rollback.

| Fase | Tag | Conteúdo | Status |
|---|---|---|---|
| 1 | `v0.1.0-fase1` | Foundation: SPA shell, router, layout, Home, Hub de Ferramentas | ✅ |
| 1.5 | `v0.1.5-sync` | Sync: 17 rotas placeholder extras + sistema de toast | ✅ |
| 2 | `v0.2.0` | Editor de Código (26 langs, runners, tabs) | ✅ |
| 3 | `v0.3.0` | Terminal Web (60+ comandos, VFS, pipes) | ✅ |
| 4 | `v0.4.0` | Calc Científica + Numérica (IEEE 754) | ✅ |
| 5 | `v0.5.0` | Calculadoras (Financeira, Conv, Estat, Eng, Saúde) | ✅ |
| 6 | `v0.6.0` | Tabela Verdade + Mapa de Karnaugh | ✅ |
| 7 | `v0.7.0` | Lab Cripto P1 (César, Base64, SHA, Morse) | ✅ |
| 8 | `v0.8.0` | Lab Cripto P2 (AES-GCM, Vigenère, Atbash, OTP) | ✅ |
| 9 | `v0.9.0` | Gerador de Gráficos (Canvas 2D, 12 tipos) | ✅ |
| 10 | `v0.10.0` | Símbolos (1200+ Unicode) + Lab de Regex | ✅ |
| 11 | `v0.11.0` | Arsenal (159 armas + veículos + doutrina) | ✅ |
| 12 | `v0.12.0` | Biblioteca (24 arcos, viewer, retomar leitura) | ✅ |
| 13 | `v0.13.0` | Elites (26 equipes ALFA→ZULU, fichas) | ✅ |
| 14 | `v0.14.0` | CiberSeg + Academia (10 langs com tutoriais) | ⏳ |
| 15 | `v0.15.0` | Visualizador FFT + Media Hub (scanner local) | ⏳ |
| 16 | `v0.16.0` | Central de Vídeos + Universo Hub | ⏳ |
| 17 | `v0.17.0` | Tabela Periódica + Modpack MC + Guia PC + Logic Sim | ⏳ |
| 18 | `v0.18.0` | PWA offline + Shadow Bridge auth + Perfil | ⏳ |
| 19 | `v0.19.0` | Economia + Cotações + JARVIS (chat básico) | ⏳ |
| 20 | `v0.20.0` | JARVIS completo (4 modos, agente, memória) | ⏳ |
| 21 | `v1.0.0` | Editor → IDE completa + IA Proprietária Mark 11 | ⏳ |

---

## Arquitetura

```
Projeto-Baluarte/
├── package.json              Vite + scripts
├── vite.config.js            Dev server porta 5173
├── index.html                SPA shell (1 div #app)
├── start.bat                 Inicializador Windows
├── public/
│   ├── manifest.json         PWA
│   ├── sw.js                 Service Worker (skeleton — ativa na Fase 5)
│   └── offline.html          Fallback offline
└── src/
    ├── main.js               Bootstrap: registra rotas + monta shell
    ├── styles/               Design system (Material 3 Dark Neon)
    │   ├── variables.css     Tokens (cyan #00f0ff, magenta #ff00aa)
    │   ├── reset.css
    │   ├── base.css          Tipografia (Inter + JetBrains Mono)
    │   ├── components.css    Botões, cards, inputs, chips
    │   ├── layout.css        Header + Sidebar + shell responsivo
    │   └── animations.css    Glow neon, transições
    ├── core/                 Engine
    │   ├── router.js         SPA hash router (#/home, #/ferramentas...)
    │   ├── state.js          Store reativo (Proxy + listeners)
    │   ├── events.js         Event Bus pub/sub
    │   └── storage.js        localStorage com fallback in-memory
    ├── layout/
    │   ├── header.js         Status Infinity Dreadnought + clock
    │   ├── sidebar.js        Navegação 13 páginas, collapsible
    │   └── shell.js          Page wrapper
    ├── pages/
    │   ├── home.js           Ponte de Comando (cards de status)
    │   ├── ferramentas.js    Hub de Ferramentas (35 cards, busca, 7 cats)
    │   └── _placeholder.js   "Em Desenvolvimento — Fase X"
    ├── data/                 (populado nas próximas fases)
    └── utils/
        └── helpers.js        debounce, formatters, $, $$
```

---

## Stack (não negociável)

- **Frontend**: JavaScript ES2022 (módulos ESM nativos), HTML5, CSS3
- **Build**: Vite 5
- **Backend** (Fase 5): Node.js 22 + Express + Socket.IO (J.A.R.V.I.S.)
- **Persistência**: localStorage + IndexedDB (Fase 5)
- **Crypto**: Web Crypto API nativa
- **Audio**: Web Audio API nativa
- **Charts**: Canvas 2D puro
- **Syntax highlight**: Prism.js standalone (única dep externa, só na Fase 2)
- **Fontes**: Inter + JetBrains Mono
- **Design**: Material 3 Dark + Neon (cyan/magenta)

---

## Regras de ouro

1. **Nada de TypeScript.** Nunca. (12 versões anteriores quebraram por TS.)
2. **Nada de JSX/React/Vue.** Vanilla JS + funções que retornam `HTMLElement`.
3. **Cada fase só fecha quando testada no browser** — não basta compilar.
4. **Cada fase = 1 tag + 1 Release no GitHub** para rollback fácil.

---

## Contato

Lucas Belucci Bellini — Brasil
