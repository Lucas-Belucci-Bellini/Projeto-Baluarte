# Histórico de commits — `main` 1–200
**Snapshot:** `13360e596eb6bb9351c984d25cea67e7d1bef76b`
**Escopo:** commits alcançáveis a partir de `main`, numerados do mais antigo para o mais recente
> A numeração é local ao escopo da `main`; não é um número nativo do GitHub. Os dados abaixo são extraídos do grafo Git, sem interpretação manual dos nomes de arquivos.

## Commit 1 — `072850b01138d199be472a1d6d26813dfddf82a5`
**Link:** [072850b01138](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/072850b01138d199be472a1d6d26813dfddf82a5)
**Data do autor:** `2026-05-07T23:33:36-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `(root)`
**Resumo:** Initial commit
**Arquivos afetados:** 1
### Arquivos criados

- `README.md`

---

## Commit 2 — `03340a59cf011c9478229540d5c0aa98026a75f6`
**Link:** [03340a59cf01](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/03340a59cf011c9478229540d5c0aa98026a75f6)
**Data do autor:** `2026-05-08T13:42:52+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `072850b01138d199be472a1d6d26813dfddf82a5`
**Resumo:** feat(fase-1): foundation do Mark XIII — SPA shell, router, layout, Home e Hub de Ferramentas
**Corpo da mensagem:**

feat(fase-1): foundation do Mark XIII — SPA shell, router, layout, Home e Hub de Ferramentas

Entrega da Fase 1 (Foundation) do Projeto Baluarte Mark XIII.

Stack:
- JavaScript ES2022 puro (sem TypeScript, sem framework)
- Vite 5 como dev server e bundler
- HTML5 + CSS3 com design tokens (Material 3 Dark + Neon cyan/magenta)
- ESM nativo, módulos pequenos e focados

Estrutura entregue (20 módulos, ~3.4k linhas):
- index.html         · SPA shell com boot screen
- public/            · manifest.json, sw.js (skeleton), offline.html
- src/styles/        · 6 CSS (variables, reset, base, components, layout, animations)
- src/core/          · router (hash SPA), state (Proxy store), events (bus), storage (LS+fallback)
- src/layout/        · header (HUD + clock), sidebar (13 rotas, collapsible), shell
- src/pages/         · home (Ponte de Comando), ferramentas (35 cards / 7 cats / busca), placeholder
- src/utils/         · helpers (h, $, $$, debounce, throttle, etc.)
- src/main.js        · bootstrap + registro das 13 rotas

Critérios da Fase 1 atingidos:
- npm run build limpo (20 módulos, 27kB JS / 27kB CSS gzipped 10kB / 5.6kB)
- npm run dev sobe em ~200ms na porta 5173
- Sidebar com 13 rotas funcionais (2 ativas + 11 placeholders elegantes)
- Hub de Ferramentas com 35 cards filtráveis por categoria + busca textual
- Layout responsivo (sidebar vira drawer overlay em < 900px)
- PWA manifest pronto (Service Worker registrado em modo passivo)
- Atalho Ctrl+B colapsa sidebar
- Sem TypeScript, sem JSX, sem framework

Próxima fase: Ferramentas Técnicas (Editor 26 langs, Terminal 60+ cmds, Calculadoras, Cripto, Gráficos).
**Arquivos afetados:** 27
### Arquivos criados

- `.gitignore`
- `index.html`
- `package.json`
- `public/manifest.json`
- `public/offline.html`
- `public/sw.js`
- `src/core/events.js`
- `src/core/router.js`
- `src/core/state.js`
- `src/core/storage.js`
- `src/layout/header.js`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`
- `src/pages/home.js`
- `src/styles/animations.css`
- `src/styles/base.css`
- `src/styles/components.css`
- `src/styles/layout.css`
- `src/styles/reset.css`
- `src/styles/variables.css`
- `src/utils/helpers.js`
- `start.bat`
- `vite.config.js`
### Arquivos modificados

- `README.md`

---

## Commit 3 — `41a5c8d32cc880a10c269d43ca4891f887331871`
**Link:** [41a5c8d32cc8](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/41a5c8d32cc880a10c269d43ca4891f887331871)
**Data do autor:** `2026-05-08T14:02:33+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `03340a59cf011c9478229540d5c0aa98026a75f6`
**Resumo:** docs(specs): adiciona apontadores para Obsidian Vault no Google Drive
**Corpo da mensagem:**

docs(specs): adiciona apontadores para Obsidian Vault no Google Drive

Cria estrutura docs/specs/ com README e drive-index.md indicando o
Google Drive (pasta GIT HUB/Obsidian Vault) como fonte de verdade
para todas as fases do projeto.

- docs/README.md: explica o propósito da pasta docs/
- docs/specs/README.md: fluxo de leitura via Drive MCP, instruções
- docs/specs/drive-index.md: catálogo de IDs estáveis do Drive

Status: WIP. Lucas ainda está fazendo upload da estrutura completa
em GIT HUB/Obsidian Vault/. Index será reindexado quando o upload
terminar.

Esta pasta NÃO entra no build de produção (Vite só empacota src/+public/).
**Arquivos afetados:** 3
### Arquivos criados

- `docs/README.md`
- `docs/specs/README.md`
- `docs/specs/drive-index.md`

---

## Commit 4 — `1745d47927b41fd266f9b53874f19a458748e3f0`
**Link:** [1745d47927b4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1745d47927b41fd266f9b53874f19a458748e3f0)
**Data do autor:** `2026-05-10T02:49:55+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `41a5c8d32cc880a10c269d43ca4891f887331871`
**Resumo:** feat(fase-1.5): sync com versão local — adiciona 17 rotas placeholder + toast system
**Corpo da mensagem:**

feat(fase-1.5): sync com versão local — adiciona 17 rotas placeholder + toast system

Fase 1.5 (sync) — fecha o gap entre a Fase 1 entregue e a versão local
do Lucas em "Drive: GIT HUB/Nova pasta (2)/Projeto Baluarte/" (que tinha
mais rotas pré-registradas).

Mudanças:
- src/utils/toast.js (novo): sistema de notificação flutuante,
  inscreve-se no evento 'toast' do bus
- src/styles/components.css: estilo .toast (com variantes success,
  warning, danger, magenta) + responsivo mobile
- src/main.js: registra 17 rotas placeholder novas, total agora 30
  (2 ativas + 11 principais + 17 ferramentas) + initToast()
- src/pages/_placeholder.js: 17 entradas novas no ROUTE_INFO com
  título, ícone, fase (2-21) e descrição
- src/pages/ferramentas.js: mapa TOOL_ROUTES { id → rota } +
  cards do Hub agora navegam pra rota real (router.navigate)
  em vez de alert(). Tools sem rota dedicada exibem toast.
- src/layout/sidebar.js: footer atualizado para "v0.1.5 · Fase 1/21"
- README.md: roadmap expandido de 5 para 21 fases
- package.json: bump para 0.1.5

Roadmap revisado (21 fases):
- 1: Foundation ✅
- 1.5: Sync (esta) ✅
- 2-10: Ferramentas técnicas (Editor, Terminal, Calcs, Cripto,
        Gráficos, Símbolos, Regex)
- 11-17: Conteúdo + Mídia + Universo
- 18: PWA + Auth + Perfil
- 19-20: Economia + JARVIS
- 21: Editor → IDE + IA Proprietária Mark 11

Verificação:
- npm run build: 21 módulos, 31KB JS / 28KB CSS gzipped
- npm run dev: sobe em ~200ms, HTTP 200, toast.js carrega
**Arquivos afetados:** 8
### Arquivos criados

- `src/utils/toast.js`
### Arquivos modificados

- `README.md`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`
- `src/styles/components.css`

---

## Commit 5 — `fa78d6eb247c35630607b3eb4eabfe8f9cf97567`
**Link:** [fa78d6eb247c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fa78d6eb247c35630607b3eb4eabfe8f9cf97567)
**Data do autor:** `2026-05-10T03:15:00+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1745d47927b41fd266f9b53874f19a458748e3f0`
**Resumo:** feat(fase-2): Editor de Código com 26 linguagens, tabs, runners e persist
**Corpo da mensagem:**

feat(fase-2): Editor de Código com 26 linguagens, tabs, runners e persist

Fase 2 entregue. Novo módulo /editor (rota + página) com:

Funcionalidades:
- Multi-tabs com persistência em localStorage (namespace baluarte:editor:state)
- 26 linguagens: JS, TS, JSX, TSX, HTML, CSS, SCSS, JSON, YAML, MD, XML,
  Python, Java, C, C++, C#, Go, Rust, Ruby, PHP, SQL, Bash, PowerShell,
  Lua, Swift, Kotlin
- Syntax highlight próprio (regex-based, ~120 linhas, sem dep externa)
- Runners com sandbox iframe:
  - JS: console capturado (log/warn/error/info) + try/catch automático
  - HTML: srcdoc direto no iframe
  - CSS: wrap em template HTML demo
  - Markdown: render simples (heading, bold, italic, code, links, listas)
- Line numbers sincronizados com scroll
- Atalhos: Ctrl+Enter (run), Ctrl+S (save), Ctrl+T (nova tab), Ctrl+W (fechar)
- Tab inserts 2 espaços; Shift+Tab outdenta
- Dois clicks na tab para renomear
- Char count na toolbar

Arquivos novos:
- src/data/editor-langs.js (26 linguagens com config completa)
- src/utils/syntax-highlight.js (highlighter por regex)
- src/utils/editor-engine.js (tabs, persist, runner JS/HTML/CSS/MD)
- src/pages/editor.js (UI: tabs bar + toolbar + editor area + preview)
- src/styles/editor.css (estilos com Material 3 Dark + Neon)

Arquivos modificados:
- src/main.js: registra /editor como rota funcional, remove de TOOL_ROUTES
- src/pages/ferramentas.js: card 'editor' marcado como phase 1 (pronto)
- src/pages/_placeholder.js: remove entrada /editor
- src/layout/sidebar.js: CURRENT_PHASE=2, footer v0.2.0
- index.html: link editor.css
- package.json: bump 0.2.0
- README.md: marca Fase 2 como entregue

Verificação:
- npm run build: 26 módulos, 53KB JS / 34KB CSS gzipped (18.6KB / 6.8KB)
- npm run dev: sobe em ~200ms, HTTP 200 em todas rotas e assets
- Editor abre em /editor, 3 tabs default (demo.js, demo.html, README.md)
- Persistência testada (recarrega mantendo conteúdo)
**Arquivos afetados:** 12
### Arquivos criados

- `src/data/editor-langs.js`
- `src/pages/editor.js`
- `src/styles/editor.css`
- `src/utils/editor-engine.js`
- `src/utils/syntax-highlight.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 6 — `2318c81089d525262a51e3f0d4db2d9f78a51276`
**Link:** [2318c81089d5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2318c81089d525262a51e3f0d4db2d9f78a51276)
**Data do autor:** `2026-05-10T00:24:27-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `072850b01138d199be472a1d6d26813dfddf82a5 fa78d6eb247c35630607b3eb4eabfe8f9cf97567`
**Resumo:** Merge pull request #1 from Lucas-Belucci-Bellini/claude/obsidian-vault-database-Xv3xC
**Corpo da mensagem:**

Merge pull request #1 from Lucas-Belucci-Bellini/claude/obsidian-vault-database-Xv3xC

Fase 1 — Foundation (Mark XIII): SPA shell, router, layout, Home e Hub de Ferramentas
**Arquivos afetados:** 0

---

## Commit 7 — `4e6eb1ae8652b0931b4153884e51570f5abad042`
**Link:** [4e6eb1ae8652](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4e6eb1ae8652b0931b4153884e51570f5abad042)
**Data do autor:** `2026-05-10T03:32:05+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `fa78d6eb247c35630607b3eb4eabfe8f9cf97567`
**Resumo:** feat(fase-3): Terminal Web com 60+ comandos, VFS persistente, pipes e history
**Corpo da mensagem:**

feat(fase-3): Terminal Web com 60+ comandos, VFS persistente, pipes e history

Fase 3 entregue na branch fase-3 (criada a partir de fase-2).

Funcionalidades:
- 67 comandos POSIX-like organizados em 6 categorias:
  · Help/Sistema: help, man, clear, cls, exit, history, alias, unalias,
    env, export, unset, whoami, hostname, uname, date, uptime, which, type
  · Filesystem: pwd, cd, ls, ll, tree, mkdir, rmdir, rm, touch, cat,
    echo, printf, head, tail, cp, mv, find, du, stat, file
  · Texto: grep, wc, sort, uniq, rev, tac, cut, tr
  · Cripto: base64, sha256sum (Web Crypto API), md5sum (info)
  · Numéricos: seq, expr, bc, true, false, yes
  · Easter eggs: banner, cowsay, fortune
  · Sistema fake: ps, kill, df, free, ping
  · Baluarte: open (navega rotas), status, reboot, vfs (reset/size)

Engine:
- Parser de linha com tokenização respeitando aspas/escape
- Pipes: cmd1 | cmd2 | cmd3
- Redirects: > (sobrescreve), >> (append)
- Encadeamento: cmd1 && cmd2
- Múltiplos por ;
- Expansão de variáveis $VAR e ${VAR}
- Aliases (ll = 'ls -la' por padrão)
- History persistente em localStorage (até 200 entradas)
- Autocomplete por Tab (comandos + paths)
- Cores ANSI básicas (30-97)

VFS (filesystem virtual):
- Estrutura inicial com /home/lucas (README.md, notas.txt, docs/, src/),
  /etc (hostname, motd), /tmp, /var/log/system.log, /bin
- Persistente em localStorage (namespace baluarte:vfs:tree)
- Operações: mkdir, writeFile, appendFile, readFile, unlink, rename, copy
- Helpers: normalizePath, dirname, basename, resolve, exists, listDir

Atalhos:
- Setas ↑/↓ para histórico
- Tab para autocomplete (1 match completa, 2+ lista)
- Ctrl+L para limpar tela
- Ctrl+C para cancelar comando

Arquivos novos:
- src/utils/vfs.js (~280 linhas, FS em memória + persist)
- src/data/terminal-commands.js (~620 linhas, 67 comandos)
- src/utils/terminal-engine.js (~250 linhas, parser + executor)
- src/pages/terminal.js (~280 linhas, UI)
- src/styles/terminal.css (~140 linhas, estilo CRT/scanline)

Arquivos modificados:
- src/main.js: importa terminalPage, registra /terminal como funcional,
  remove de TOOL_ROUTES placeholder, bump banner para v0.3.0
- src/pages/ferramentas.js: card 'terminal' phase 1 (pronto)
- src/pages/_placeholder.js: remove entrada /terminal
- src/layout/sidebar.js: CURRENT_PHASE=3, footer v0.3.0
- index.html: link terminal.css
- package.json: bump 0.3.0
- README.md: marca Fase 3 como entregue

Verificação:
- npm run build: 31 módulos, 82KB JS / 37KB CSS gzipped (29KB / 7.2KB)
- npm run dev: sobe em ~210ms, HTTP 200 em todos assets
- Comandos testáveis: ls, cat README.md, echo $USER, find / -name '*.md',
  grep -i operador notas.txt, wc -l var/log/system.log,
  cat /etc/motd | tr 'a-z' 'A-Z',
  echo 'hello' > tmp/test.txt && cat tmp/test.txt,
  banner, cowsay 'Olá!', fortune, status

Estratégia de versionamento (mudança requested):
- Branches retroativas criadas: fase-1, fase-1.5, fase-2
- Esta branch: fase-3 (a partir de fase-2)
- Próximas fases continuarão em branches próprias
**Arquivos afetados:** 12
### Arquivos criados

- `src/data/terminal-commands.js`
- `src/pages/terminal.js`
- `src/styles/terminal.css`
- `src/utils/terminal-engine.js`
- `src/utils/vfs.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 8 — `d0a76ac249a40178f54cd3df75f7f34b22568289`
**Link:** [d0a76ac249a4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d0a76ac249a40178f54cd3df75f7f34b22568289)
**Data do autor:** `2026-05-10T11:37:11+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `4e6eb1ae8652b0931b4153884e51570f5abad042`
**Resumo:** feat(fase-4): Calculadora Científica + Numérica com IEEE 754
**Corpo da mensagem:**

feat(fase-4): Calculadora Científica + Numérica com IEEE 754

Fase 4 entregue na branch fase-4.

Calculadora Científica (/calc-cientifica):
- Parser de expressão recursivo descendente (suporta +, -, *, /, %, ^,
  parênteses, fatorial !, unário -)
- Funções: sin, cos, tan e inversas; sinh, cosh, tanh; log, ln, log2,
  exp; sqrt, cbrt, abs, floor, ceil, round, sign, factorial
- Constantes: π, e, φ (phi)
- Modo angular: deg ↔ rad (toggle no display)
- Memória: M+, M-, MR, MC, MS + variável 'ans' (último resultado)
- Histórico persistente (até 30 entradas, click para reusar)
- 4 painéis: Padrão, Trig, Log/Exp, Memória
- Atalhos: Enter (=), Backspace, Esc (AC), todos os operadores

Calculadora Numérica (/calc-numerica):
- Display simultâneo em 4 bases: DEC, BIN, HEX, OCT
- Bit grid clicável (8/16/32 bits) — alterna bit a bit
- Operações bit-a-bit: AND, OR, XOR, NOT, NAND, NOR, XNOR, shift << >>
- Aritmética: +, -, *, /, %
- Two's complement automático para negativos
- IEEE 754 visualizer:
  · Single (32 bits): sinal | expoente (8) | mantissa (23)
  · Double (64 bits): sinal | expoente (11) | mantissa (52)
  · HEX hexadecimal de cada formato
  · Input direto de float
- Tamanho de bits configurável (8/16/32)

Engine compartilhado (src/utils/calc-engine.js):
- evaluate(expr, opts) → { value, error? }
- toBase, fromBase com two's complement
- bitOps: and, or, xor, not, nand, nor, xnor, shl, shr, sar
- ieee754(value, 'single' | 'double')
- formatResult com notação científica para extremos

Arquivos novos:
- src/utils/calc-engine.js (~280 linhas, parser + helpers)
- src/pages/calc-cientifica.js (~370 linhas, UI + 4 painéis)
- src/pages/calc-numerica.js (~370 linhas, UI + bit grid + IEEE)
- src/styles/calc.css (~430 linhas, design unificado)

Arquivos modificados:
- src/main.js: registra /calc-cientifica e /calc-numerica
- src/pages/ferramentas.js: cards marcados phase 1
- src/pages/_placeholder.js: remove entradas
- src/layout/sidebar.js: CURRENT_PHASE=4, footer v0.4.0
- index.html: link calc.css
- package.json: bump 0.4.0
- README.md: marca Fase 4 como entregue

Verificação:
- npm run build: 35 módulos, 101KB JS / 47KB CSS gzipped (35KB / 8.6KB)
- npm run dev: ~210ms, HTTP 200 em todos assets
- Comandos testáveis:
  · sin(pi/2) = 1
  · log(100) = 2
  · 2^10 = 1024
  · 5! = 120
  · 0xFF AND 0xF0 = 240
  · 42 em binário = 101010
**Arquivos afetados:** 11
### Arquivos criados

- `src/pages/calc-cientifica.js`
- `src/pages/calc-numerica.js`
- `src/styles/calc.css`
- `src/utils/calc-engine.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 9 — `5dc82d9ee57c735497f667247ad1e0976cc398e1`
**Link:** [5dc82d9ee57c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5dc82d9ee57c735497f667247ad1e0976cc398e1)
**Data do autor:** `2026-05-10T12:23:18+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d0a76ac249a40178f54cd3df75f7f34b22568289`
**Resumo:** feat(fase-5): Hub /calculadoras com 5 calculadoras especializadas
**Corpo da mensagem:**

feat(fase-5): Hub /calculadoras com 5 calculadoras especializadas

Fase 5 entregue na branch fase-5.

Hub /calculadoras com 5 painéis em tabs (state persistido em localStorage):

1. FINANCEIRA (5 widgets)
   - Juros simples (VF = VP × (1 + i × n))
   - Juros compostos com aporte (VF = VP × (1+i)ⁿ + PMT × ((1+i)ⁿ-1)/i)
   - Parcelamento Price (PMT = VP × i × (1+i)ⁿ / ((1+i)ⁿ-1))
   - VPL e TIR (Newton-Raphson) para fluxos de caixa
   - Conversão de taxa: anual ↔ mensal ↔ diária

2. CONVERSORES (10 categorias, 80+ unidades)
   - Comprimento (m, km, mi, ft, in, yd, nmi, ly, au, μm, nm)
   - Massa (kg, g, mg, t, lb, oz, st, ct)
   - Temperatura (°C, °F, K) com fórmulas custom
   - Volume (L, mL, m³, gal, qt, pt, cup, tbsp, tsp, floz)
   - Energia (J, kJ, cal, kcal, Wh, kWh, eV, BTU, ftlb)
   - Tempo (s, ms, μs, ns, min, h, d, wk, mo, y)
   - Dados (B, KiB/MiB/GiB binário + KB/MB/GB decimal + bit)
   - Velocidade (m/s, km/h, mph, ft/s, kn, mach, c)
   - Pressão (Pa, hPa, kPa, MPa, bar, atm, psi, mmHg)
   - Ângulo (rad, deg, grad, turn, arcmin, arcsec)
   - UX: click em qualquer linha para definir como fonte

3. ESTATÍSTICA
   - Descritiva: n, soma, média, mediana, moda, min/max, amplitude,
     desvio populacional + amostral, variância, Q1/Q3/IQR, CV%
   - Regressão linear: equação, Pearson r, R², classificação (forte/moderado/fraco), predição

4. ENGENHARIA (5 widgets)
   - Lei de Ohm: 2 conhecidos resolvem V/I/R/P (cascata automática)
   - Divisor de tensão (V_out + corrente + potências)
   - Resistor color code (4 bandas) com display visual
   - Frequência ↔ comprimento de onda (luz, som ar/água/aço)
   - Lei de Stevin (pressão hidrostática)

5. SAÚDE (5 widgets)
   - IMC com classificação OMS (8 faixas com emoji)
   - TMB Mifflin-St Jeor + GET com 5 níveis de atividade + déficit/superávit
   - Macros (P/C/G) com 6 perfis (Equilíbrio, Corte, Resistência, Endurance, Mediterrâneo, Ceto)
   - FC máxima + 5 zonas de treino Karvonen
   - Hidratação diária (35-45 ml/kg conforme atividade)

Arquivos novos:
- src/pages/calculadoras/index.js (hub com tabs)
- src/pages/calculadoras/financeira.js
- src/pages/calculadoras/conversores.js
- src/pages/calculadoras/estatistica.js
- src/pages/calculadoras/engenharia.js
- src/pages/calculadoras/saude.js
- src/styles/calculadoras.css (~340 linhas)

Arquivos modificados:
- src/main.js: registra /calculadoras como rota funcional, banner v0.5.0
- src/pages/ferramentas.js: cards calc-financeira/conversores/estatistica/engenharia/saude phase 1
- src/pages/_placeholder.js: remove entrada
- src/layout/sidebar.js: CURRENT_PHASE=5, footer v0.5.0
- index.html: link calculadoras.css
- package.json: bump 0.5.0
- README.md: marca Fase 5 como entregue

Verificação:
- npm run build: 42 módulos, 136KB JS / 54KB CSS gzipped (44KB / 9.5KB)
- Cada widget reativo (recalcula on input)
**Arquivos afetados:** 14
### Arquivos criados

- `src/pages/calculadoras/conversores.js`
- `src/pages/calculadoras/engenharia.js`
- `src/pages/calculadoras/estatistica.js`
- `src/pages/calculadoras/financeira.js`
- `src/pages/calculadoras/index.js`
- `src/pages/calculadoras/saude.js`
- `src/styles/calculadoras.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 10 — `1eaa9e3978f9e0fce762beba975b3cbc0b670ea2`
**Link:** [1eaa9e3978f9](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1eaa9e3978f9e0fce762beba975b3cbc0b670ea2)
**Data do autor:** `2026-05-10T09:24:30-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2318c81089d525262a51e3f0d4db2d9f78a51276 d0a76ac249a40178f54cd3df75f7f34b22568289`
**Resumo:** Merge pull request #8 from Lucas-Belucci-Bellini/fase-4
**Corpo da mensagem:**

Merge pull request #8 from Lucas-Belucci-Bellini/fase-4

Fase 4
**Arquivos afetados:** 0

---

## Commit 11 — `fa3abc7c615d6db987dedcd99158498fe6af0883`
**Link:** [fa3abc7c615d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fa3abc7c615d6db987dedcd99158498fe6af0883)
**Data do autor:** `2026-05-10T12:29:53+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `5dc82d9ee57c735497f667247ad1e0976cc398e1`
**Resumo:** feat(fase-6): Tabela Verdade + Mapa de Karnaugh com Quine-McCluskey
**Corpo da mensagem:**

feat(fase-6): Tabela Verdade + Mapa de Karnaugh com Quine-McCluskey

Fase 6 entregue na branch fase-6.

Página /tabela-verdade com:

Parser de expressões lógicas:
- Operadores: NOT (!~¬), AND (&&&*∧), OR (|||+∨), XOR (^⊕),
  IMPLIES (->→=>), IFF (<->↔<=>)
- Constantes: 0/1, TRUE/FALSE
- Postfix prime: A' = NOT A
- Variáveis A-Z (case-insensitive)
- Concatenação implícita: AB = A AND B
- Parser recursivo com precedence climbing

Tabela verdade:
- Até 8 variáveis (256 linhas)
- Sticky header
- Linhas verdadeiras destacadas
- Status: contagem de verdadeiras/falsas

Mapa de Karnaugh:
- 2 vars: 2x2
- 3 vars: 2x4 (BC nas colunas)
- 4 vars: 4x4 (AB nas linhas, CD nas colunas)
- Ordem Gray code (linhas/colunas adjacentes diferem em 1 bit)
- Células 1 destacadas

Formas canônicas e simplificação:
- SOP canônica (Sum of Products) a partir dos minterms
- POS canônica (Product of Sums) a partir dos maxterms
- SOP minimizada via Quine-McCluskey:
  · Combina implicantes que diferem em 1 bit
  · Encontra prime implicants
  · Cobertura: essential prime implicants + greedy

Recursos extras:
- 11 exemplos prontos (AND, OR, XOR, Maioria 3, Mux 2:1, Half/Full adder, etc.)
- AST canônica em formato Unicode (∧ ∨ ¬ ⊕ → ↔)
- Validação de sintaxe com mensagem amigável
- Help table com toda a sintaxe
- Persistência da última expressão

Arquivos novos:
- src/utils/logic-parser.js (~310 linhas: tokenize, parse, eval, QM, K-map)
- src/pages/tabela-verdade.js (~290 linhas: UI completa)
- src/styles/tabela-verdade.css (~250 linhas)

Arquivos modificados:
- src/main.js: registra /tabela-verdade, banner v0.6.0
- src/pages/ferramentas.js: card phase 1
- src/pages/_placeholder.js: remove entrada
- src/layout/sidebar.js: CURRENT_PHASE=6, footer v0.6.0
- index.html: link tabela-verdade.css
- package.json: bump 0.6.0
- README.md: marca Fase 6 como entregue

Verificação:
- npm run build: 45 módulos, 149KB JS / 59KB CSS gzipped (48KB / 10KB)
- Expressões testáveis:
  · A AND B
  · (A·B) + (B·C) + (A·C)  → maioria de 3
  · A XOR B  → half adder sum
  · (A·B) + (Cin·(A XOR B))  → full adder Cout
  · A OR NOT A  → tautologia (sempre 1)
**Arquivos afetados:** 10
### Arquivos criados

- `src/pages/tabela-verdade.js`
- `src/styles/tabela-verdade.css`
- `src/utils/logic-parser.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 12 — `5ad30e0bfae631c2f26009f5f66b155011a84738`
**Link:** [5ad30e0bfae6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5ad30e0bfae631c2f26009f5f66b155011a84738)
**Data do autor:** `2026-05-10T12:36:15+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `fa3abc7c615d6db987dedcd99158498fe6af0883`
**Resumo:** feat(fase-7): Lab Cripto P1 — César, Base64/32/Hex, SHA, Morse
**Corpo da mensagem:**

feat(fase-7): Lab Cripto P1 — César, Base64/32/Hex, SHA, Morse

Fase 7 entregue na branch fase-7. Hub /cripto com 4 abas (P2 na Fase 8).

CÉSAR (caesar.js):
- Encode/decode com shift 0-25
- Brute force: gera 26 candidatos
- Score "português-ish" (heurística de bigramas comuns: de, os, qu, ar, etc.)
- Ranking ordenado por score, click no candidato aplica o shift

BASE64 / BASE32 / HEX (base.js):
- Encode simultâneo nas 3 bases
- Suporte UTF-8 (encodeURIComponent na conversão Base64)
- Decoder unificado com seletor de formato
- Botões de copiar individuais
- Validação com erro visual

HASH (hash.js):
- SHA-1, SHA-256, SHA-384, SHA-512 simultâneos via crypto.subtle
- MD5 mostra mensagem informativa (Web Crypto não suporta)
- Cada hash tem botão de copiar
- Mostra tamanho em bytes/hex chars

MORSE (morse.js):
- Encode bidirecional com tabela completa (ITU + acentos PT-BR + 18 pontuações)
- Áudio via Web Audio API (OscillatorNode senoidal):
  · WPM ajustável (5-40)
  · Frequência ajustável (200-1500 Hz)
  · Timing PARIS standard (1200/wpm = 1 dit em ms)
  · Envelope com ataque/release suave
- Stop button para interromper
- AudioContext lazy + auto-resume

ENGINE (cripto-engine.js):
- caesarEncode/Decode/Bruteforce + ptScore
- toBase64/fromBase64 (com UTF-8), toBase32/fromBase32, toHex/fromHex
- hashText/allHashes (Web Crypto)
- toMorse/fromMorse + playMorse/stopMorse

Arquivos novos:
- src/data/morse-code.js (tabela completa)
- src/utils/cripto-engine.js (~250 linhas)
- src/pages/cripto/index.js (hub com 4 tabs + 4 placeholder F8)
- src/pages/cripto/caesar.js
- src/pages/cripto/base.js
- src/pages/cripto/hash.js
- src/pages/cripto/morse.js
- src/styles/cripto.css (~280 linhas)

Arquivos modificados:
- src/main.js: registra /cripto, banner v0.7.0
- src/pages/ferramentas.js: cripto-cesar/base/hash phase 1, novo cripto-morse, cripto-aes/misto F8
- src/pages/_placeholder.js: remove entrada
- src/layout/sidebar.js: CURRENT_PHASE=7, footer v0.7.0
- index.html: link cripto.css
- package.json: bump 0.7.0
- README.md: marca Fase 7 como entregue

Verificação:
- npm run build: 53 módulos, 162KB JS / 64KB CSS gzipped (52KB / 11KB)
- César: shift 3, "BALUARTE" → "EDOXDUWH"
- Base64: "Hello" → "SGVsbG8="
- SHA-256("Hello Baluarte") = hash deterministico
- Morse: "SOS" → "... --- ..."
**Arquivos afetados:** 15
### Arquivos criados

- `src/data/morse-code.js`
- `src/pages/cripto/base.js`
- `src/pages/cripto/caesar.js`
- `src/pages/cripto/hash.js`
- `src/pages/cripto/index.js`
- `src/pages/cripto/morse.js`
- `src/styles/cripto.css`
- `src/utils/cripto-engine.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 13 — `43a85e4103582bcb0afdd34582b7ec0fec9c44e2`
**Link:** [43a85e410358](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/43a85e4103582bcb0afdd34582b7ec0fec9c44e2)
**Data do autor:** `2026-05-10T21:36:10+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `5ad30e0bfae631c2f26009f5f66b155011a84738`
**Resumo:** feat(fase-8): Lab Cripto P2 — AES-GCM, Vigenère, Atbash, OTP
**Corpo da mensagem:**

feat(fase-8): Lab Cripto P2 — AES-GCM, Vigenère, Atbash, OTP

Fase 8 entregue na branch fase-8. Hub /cripto agora com 8 abas ativas
organizadas em 4 grupos: Clássicas, Encoding, Hash, Moderna, Comunicação.

AES-GCM (aes.js):
- Encriptação simétrica autenticada AES-256
- Senha → PBKDF2-SHA256 (100k iter) → chave 256-bit
- Salt 16B + IV 12B aleatórios por operação
- Output: base64(salt | iv | ciphertext+tag)
- Botão "gerar senha forte" (24B random → base64 → 32 chars)
- Botão "usar no decrypt" copia cipher+senha para decoder
- Detecta senha incorreta via falha do GCM auth tag

Vigenère (vigenere.js):
- Cifra polialfabética com chave repetida
- Visualização da chave esticada alinhada com o texto
- Preserva case e não-letras
- Encode e decode lado a lado

Atbash (atbash.js):
- Substituição A↔Z, B↔Y, …, M↔N
- Involução: aplicar 2x retorna ao original
- Tabela visual de substituição (26 pares coloridos cyan/magenta)

OTP / One-Time Pad (otp.js):
- XOR byte a byte com chave aleatória
- Validação: chave ≥ mensagem
- Geração de chave random do tamanho exato (crypto.getRandomValues)
- Input/output em base64
- Decoder simétrico (XOR é involução)
- Aviso sobre as 3 condições de Shannon

Engine (cripto-engine.js):
- vigenereEncode/Decode
- atbash (involução)
- randomBytes (Uint8Array via crypto.getRandomValues)
- otpEncode (XOR puro)
- bytesToBase64/base64ToBytes, textToBytes/bytesToText
- aesEncrypt/Decrypt + deriveKey (PBKDF2 + AES-GCM)

Hub /cripto reorganizado:
- 8 tabs ativas (sem mais "F8 locked")
- Tooltip mostra o grupo (Clássicas/Encoding/Hash/Moderna/Comunicação)
- Header lista todas as 8 ferramentas

Hub de Ferramentas:
- cripto-aes, cripto-vigenere, cripto-atbash, cripto-otp → phase 1
- Substitui o card antigo "cripto-misto" por 3 cards separados
- TOOL_ROUTES atualizado

Arquivos novos:
- src/pages/cripto/aes.js (~110 linhas)
- src/pages/cripto/vigenere.js (~80 linhas)
- src/pages/cripto/atbash.js (~50 linhas)
- src/pages/cripto/otp.js (~150 linhas)

Arquivos modificados:
- src/utils/cripto-engine.js: +130 linhas (AES, Vigenère, Atbash, OTP, byte helpers)
- src/pages/cripto/index.js: 8 tabs em 5 grupos
- src/styles/cripto.css: atbash-table + vigenere-stretch
- src/pages/ferramentas.js: cards e TOOL_ROUTES
- src/main.js: banner v0.8.0
- src/layout/sidebar.js: CURRENT_PHASE=8, footer v0.8.0
- package.json: bump 0.8.0
- README.md: marca Fase 8 ✅

Verificação:
- npm run build: 57 módulos, 173KB JS / 64KB CSS gzipped (55KB / 11KB)
- AES roundtrip: encrypt(text, pass) → decrypt(cipher, pass) = text
- Vigenère key=OMEGA, "BALUARTE" → "PNRAALPS"
- Atbash("BALUARTE") = "YZOFZIGV", aplicar 2x retorna original
- OTP: gera chave random do tamanho, encrypt/decrypt simétrico
**Arquivos afetados:** 12
### Arquivos criados

- `src/pages/cripto/aes.js`
- `src/pages/cripto/atbash.js`
- `src/pages/cripto/otp.js`
- `src/pages/cripto/vigenere.js`
### Arquivos modificados

- `README.md`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/cripto/index.js`
- `src/pages/ferramentas.js`
- `src/styles/cripto.css`
- `src/utils/cripto-engine.js`

---

## Commit 14 — `5fc1b0578d601f7865f43a376321f09b80f4265e`
**Link:** [5fc1b0578d60](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5fc1b0578d601f7865f43a376321f09b80f4265e)
**Data do autor:** `2026-05-13T23:00:42+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `43a85e4103582bcb0afdd34582b7ec0fec9c44e2`
**Resumo:** feat(fase-9): Gerador de Gráficos com 12 tipos em Canvas 2D puro
**Corpo da mensagem:**

feat(fase-9): Gerador de Gráficos com 12 tipos em Canvas 2D puro

Fase 9 entregue na branch fase-9. Página /graficos com gerador completo.

12 tipos de gráfico:
- line: linha com pontos e glow neon
- bar: barras verticais com gradient + valores opcionais
- hbar: barras horizontais
- pie: pizza com labels percentuais
- donut: pizza com centro recortado + total agregado
- area: linha com fill gradient
- radar: polígono regular com grade radial
- scatter: dispersão (x,y) com eixos calibrados
- bubble: dispersão com tamanho variável (x,y,r)
- heatmap: matriz com gradient cyan→magenta + valores opcionais
- histogram: 10 bins automáticos
- gauge: medidor semicircular com gradient e valor central

Engine (chart-engine.js):
- 5 paletas (neon, ocean, sunset, forest, mono)
- DPR-aware: usa window.devicePixelRatio pra Retina/HiDPI
- Cálculo de "nice max" pra escalas legíveis
- Formatação de números (k, M, científica)
- Grid + eixos automáticos
- Shadow blur pra glow neon
- Gradients lineares e radiais

UI (/graficos):
- 12 botões de tipo em grid (icon + label)
- Toolbar: título, paleta, toggles grid/labels/values, export PNG
- Editor JSON de dados com validação
- Preset por tipo (auto-loaded ao trocar tipo)
- Botão "reset" pra preset
- Preview ao vivo com debounce
- Re-render automático no resize
- Exportação PNG via canvas.toDataURL

Arquivos novos:
- src/utils/chart-engine.js (~530 linhas, 12 draw functions + helpers)
- src/pages/graficos.js (~190 linhas, UI completa)
- src/styles/graficos.css (~170 linhas)

Arquivos modificados:
- src/main.js: importa graficosPage, registra /graficos, banner v0.9.0
- src/pages/ferramentas.js: card graficos phase 1
- src/pages/_placeholder.js: remove entrada
- src/layout/sidebar.js: CURRENT_PHASE=9, footer v0.9.0
- index.html: link graficos.css
- package.json: bump 0.9.0
- README.md: marca Fase 9 ✅

Verificação:
- npm run build: 60 módulos, 189KB JS / 68KB CSS gzipped (60KB / 11KB)
- Cada tipo testado com preset apropriado
- Persistência funcional
- Export PNG sem perda
**Arquivos afetados:** 10
### Arquivos criados

- `src/pages/graficos.js`
- `src/styles/graficos.css`
- `src/utils/chart-engine.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 15 — `563043c4fdd44b025b1df75a6ee5785c91399d8d`
**Link:** [563043c4fdd4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/563043c4fdd44b025b1df75a6ee5785c91399d8d)
**Data do autor:** `2026-05-13T23:07:29+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `5fc1b0578d601f7865f43a376321f09b80f4265e`
**Resumo:** feat(fase-10): Hub de Símbolos (1200+ Unicode) + Lab de Regex
**Corpo da mensagem:**

feat(fase-10): Hub de Símbolos (1200+ Unicode) + Lab de Regex

Fase 10 entregue na branch fase-10. Duas páginas novas.

HUB DE SÍMBOLOS (/simbolos):
- 14 categorias: Setas, Matemática, Lógica & Conjuntos, Geometria,
  Estrelas, Moedas, Música, Grego, Caixa & Linhas, Cartas & Jogos,
  Astronomia, Místico, Diversos, Pontuação
- 1200+ caracteres Unicode catalogados via ranges + custom
- Filtro por categoria (chips com contagem)
- Busca por símbolo, code point (hex) ou nome
- Favoritos persistidos (até 30, shift+click pra alternar)
- Click copia para clipboard com toast informativo
- Code point exibido em cada tile (U+XXXX)
- Categoria especial "Favoritos" sempre acessível

LAB DE REGEX (/regex):
- Input: padrão + flags (g, i, m, s, u, y) + texto + replacement
- Output:
  · Texto com matches highlighted (mark colorida)
  · Cards de matches com grupos numerados e nomeados
  · Replace preview em tempo real
  · Posição de cada match (@index)
- Validação inline com mensagem de erro do JS RegExp
- 10 exemplos prontos: Email, URL, CPF, Telefone BR, Data, Hex color,
  Palavra repetida, Grupo nomeado, Lookahead, IPv4
- Cheatsheet sticky com 6 seções: Âncoras, Classes, Quantificadores,
  Grupos, Lookahead/behind, Flags
- Persistência completa

Arquivos novos:
- src/data/symbols.js (~210 linhas, 14 categorias com helpers)
- src/pages/simbolos.js (~150 linhas)
- src/pages/regex.js (~280 linhas)
- src/styles/simbolos.css (~110 linhas)
- src/styles/regex.css (~210 linhas)

Arquivos modificados:
- src/main.js: importa e registra /simbolos e /regex, banner v0.10.0
- src/pages/ferramentas.js: cards simbolos e regex phase 1
- src/pages/_placeholder.js: remove ambas entradas
- src/layout/sidebar.js: CURRENT_PHASE=10, footer v0.10.0
- index.html: links simbolos.css e regex.css
- package.json: bump 0.10.0
- README.md: marca Fase 10 ✅

Verificação:
- npm run build: 65 módulos, 203KB JS / 74KB CSS gzipped (66KB / 12KB)
- Símbolos: 1200+ caracteres acessíveis, busca por "star" retorna ★☆✦…
- Regex: email pattern detecta 2 matches em texto de exemplo
**Arquivos afetados:** 12
### Arquivos criados

- `src/data/symbols.js`
- `src/pages/regex.js`
- `src/pages/simbolos.js`
- `src/styles/regex.css`
- `src/styles/simbolos.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 16 — `7f7a6404fe81b8a1fb11f93c63e70df4567adbba`
**Link:** [7f7a6404fe81](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7f7a6404fe81b8a1fb11f93c63e70df4567adbba)
**Data do autor:** `2026-05-14T11:52:55+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `563043c4fdd44b025b1df75a6ee5785c91399d8d`
**Resumo:** feat(fase-11): Arsenal (148 itens) + 6 doutrinas táticas
**Corpo da mensagem:**

feat(fase-11): Arsenal (148 itens) + 6 doutrinas táticas

Fase 11 entregue na branch fase-11. Página /arsenal com catálogo
completo e manuais de doutrina.

CATÁLOGO (148 itens):
- 15 Pistolas (M9, Glock 17, SIG P226, Desert Eagle, 1911, etc.)
- 12 Submetralhadoras (MP5, MP7, P90, UMP45, Vector, AS Val, etc.)
- 28 Rifles (M4, HK416, AK-47/74/12, FAMAS, SCAR, Tavor, G36, IA2,
  FAL, G3, M14, Mk14, SR-25, SVD, M110, AR-10, CAR-15, AKS-74U, Bren 2)
- 15 Snipers (Barrett M82, M107, CheyTac M200, TAC-50, Remington 700,
  AWM, M40A6, M24, VSS, KSVK, OSV-96, SSG 69, PSG-1, AS50, Voere SDP)
- 10 Shotguns (Mossberg 590, Remington 870, Benelli M4, SPAS-12, KSG,
  Saiga-12, AA-12, Pancor Jackhammer, etc.)
- 12 Metralhadoras (M249, M240B, M2, PKM, DShK, NSV, MG3, MG5, Mk48,
  Negev, Minimi Mk3, M134 Minigun)
- 15 Lança-projéteis (M203, M320, GP-25, AT4, M72 LAW, RPG-7, Carl
  Gustaf, Javelin, NLAW, Mk19, AGS-17, Stinger, SA-7, Igla-S, Spike)
- 22 Armas brancas (KA-BAR, F-S, Gerber Mk II, Tomahawk SOG, Katana,
  Kukri, Karambit, Bowie, Gladius, Yari, Smatchet, etc.)
- 15 Experimentais do universo Baluarte (Plasma Lance Mk IV, Pulse
  Rifle BLT-9, Coilgun Saga, Railgun Mk III, Cryo-Beam SHIVA,
  Particle Beam THOR, Photon Sword VANADIS, Jaeger Mk II, etc.)
- 24 Veículos (Abrams, Leopard 2A7, T-14 Armata, Bradley, Stryker,
  Humvee, Apache, Mi-28, F-35, Su-57, A-10, Osprey, Arleigh Burke,
  Sub Virginia, Reaper, Bayraktar, Mecha Lightframe, Jaeger Mk II,
  Capsule Pod ORBITER)

Cada arma com: nome, origem, ano, calibre, alcance efetivo (m),
peso (kg), equipe Baluarte associada (ALFA-SIERRA), tier (S/A/B/C),
notas operacionais.

UI da página:
- 2 tabs: Catálogo / Doutrinas
- Busca textual em todos os campos
- 11 chips de categoria (Tudo + 10 cats) com contagem
- Filtros: equipe (18 opções) + tier (4 opções)
- Layout split: lista + detalhe sticky
- Painel de detalhes com header colorido por categoria,
  estats grid, notas, botão "exportar ficha JSON"

DOUTRINAS (6 manuais):
- CQB · Close-Quarters Battle (stack, slicing, 3D, Cooper)
- Overwatch (sniper-spotter, mil-dot, hide, PID)
- Fireteam (TL/AR/GR/RM, wedge, buddy team, tríades)
- Breach (det cord, Hooligan, shotgun, thermite, flash-bang)
- EVAC (TCCC, M-A-R-C-H, tourniquet, fireman carry)
- Recon (LZ, OP, SALUTE, NODS, PRC-117G)

Arquivos novos:
- src/data/arsenal.js (~390 linhas, 148 armas/veículos + 6 doutrinas)
- src/pages/arsenal.js (~280 linhas, UI completa)
- src/styles/arsenal.css (~310 linhas)

Arquivos modificados:
- src/main.js: registra /arsenal, remove de PRINCIPAL_ROUTES placeholder
- src/pages/_placeholder.js: remove entrada
- src/pages/ferramentas.js: cards arsenal-ref e doutrina phase 1
- src/layout/sidebar.js: /arsenal phase 1, CURRENT_PHASE=11, footer v0.11.0
- index.html: link arsenal.css
- package.json: bump 0.11.0
- README.md: marca Fase 11 ✅

Verificação:
- npm run build: 68 módulos, 242KB JS / 80KB CSS gzipped (78KB / 13KB)
- 148 entradas catalogadas (catálogo principal "armas + veículos")
- 6 doutrinas com 30 itens táticos no total
**Arquivos afetados:** 10
### Arquivos criados

- `src/data/arsenal.js`
- `src/pages/arsenal.js`
- `src/styles/arsenal.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 17 — `1397c5bd33ba7176cc965fe66e4f532cfca07bf2`
**Link:** [1397c5bd33ba](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1397c5bd33ba7176cc965fe66e4f532cfca07bf2)
**Data do autor:** `2026-05-14T16:59:02+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `7f7a6404fe81b8a1fb11f93c63e70df4567adbba`
**Resumo:** feat(fase-12): Biblioteca das Crônicas da Baluarte (24 arcos)
**Corpo da mensagem:**

feat(fase-12): Biblioteca das Crônicas da Baluarte (24 arcos)

Fase 12 entregue na branch fase-12. Página /biblioteca com 24 arcos
narrativos + viewer completo.

ARCOS (24, código OTAN):
- ALFA · Despertar do Núcleo (origem)
- BRAVO · Sinal de Phobos (DOOM)
- CHARLIE · Vermelho de Reach (Halo)
- DELTA · Onda Vermelha (Pacific Rim)
- ECHO · Sistema Aberto (Solo Leveling)
- FOXTROT · Lâminas de Vanadis (Vanadis)
- GOLF · O Pacto da Sombra (conspiração)
- HOTEL · Cidade Cinza (urbano)
- INDIA · Frequência 11 (horror)
- JULIETT · Operadores no Vazio (espaço)
- KILO · Aço e Plasma (batalha campal)
- LIMA · Coração do Núcleo (tecnologia)
- MIKE · Resposta TITAN (mecha)
- NOVEMBER · Convergência de Linhas (estratégia)
- OSCAR · Memória do Vacuum (IA JARVIS)
- PAPA · Última Mensagem (perda)
- QUEBEC · Crucible (treinamento)
- ROMEO · Eclipse do Comando (traição)
- SIERRA · Saída Silenciosa (exfil)
- TANGO · O Décimo Terceiro (origem Mark XIII)
- UNIFORM · Arquitetos do Esquecimento (arqueologia)
- VICTOR · Travessia (Arifureta)
- WHISKEY · Aurora 2046 (futuro)
- ZULU · Onde os Deuses Sangram (arco final)

Cada arco: id, code OTAN, universe, tags, sinopse, cover (Unicode),
equipe associada, lista de capítulos com conteúdo narrativo.
Total: ~30 capítulos com aberturas escritas (esqueletos prontos pra
expandir com texto do Drive).

VIEWER (/biblioteca):
- Layout split: lista de arcos + viewer
- Banner "Retomar leitura" com último capítulo lido
- Busca textual em título/código/sinopse/tags
- Filtro por universo
- Toggle "só favoritos"
- Toolbar do viewer:
  · Favoritar arco (estrela)
  · Tema dark/sépia
  · Fonte ajustável (13-22px) com slider
- Header do arco com cover, universo, código, sinopse, tags
- Lista de capítulos como tabs
- Corpo do capítulo com tipografia serif/sans + indent
- Navegação prev/next com contador (1/3)
- Progress persistido em localStorage:
  · selectedArc, selectedChapter
  · progress[arcId] = { lastChapter, lastVisit }
  · bookmarks[]
  · fontSize, theme

Arquivos novos:
- src/data/cronicas.js (~290 linhas, 24 arcos com chapters)
- src/pages/biblioteca.js (~260 linhas, UI viewer)
- src/styles/biblioteca.css (~270 linhas)

Arquivos modificados:
- src/main.js: registra /biblioteca, remove de PRINCIPAL_ROUTES
- src/pages/_placeholder.js: remove entrada
- src/layout/sidebar.js: /biblioteca phase 1, CURRENT_PHASE=12, footer v0.12.0
- index.html: link biblioteca.css
- package.json: bump 0.12.0
- README.md: marca Fase 12 ✅

Verificação:
- npm run build: 71 módulos, 266KB JS / 85KB CSS gzipped (87KB / 13KB)
- 24 arcos visíveis, busca funcional
- Retomar leitura persiste após reload
- Tema sépia muda fundo e cor do texto
**Arquivos afetados:** 9
### Arquivos criados

- `src/data/cronicas.js`
- `src/pages/biblioteca.js`
- `src/styles/biblioteca.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`

---

## Commit 18 — `0bdaf602072565b3384693d1cf10c252f6d4cc4a`
**Link:** [0bdaf6020725](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0bdaf602072565b3384693d1cf10c252f6d4cc4a)
**Data do autor:** `2026-05-14T21:57:11+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1397c5bd33ba7176cc965fe66e4f532cfca07bf2`
**Resumo:** feat(fase-13): Elites — 26 equipes ALFA-ZULU com fichas completas
**Corpo da mensagem:**

feat(fase-13): Elites — 26 equipes ALFA-ZULU com fichas completas

Fase 13 entregue na branch fase-13. Página /elites com 26 equipes
do Baluarte, código alfabeto OTAN.

26 EQUIPES:
- ALFA · Vanguarda da Manhã · CQB / Assalto urbano · Lucas
- BRAVO · Guardas do Limiar · Combate paranormal
- CHARLIE · Linha de Reach · Inserção aérea (baixa)
- DELTA · Pacto do Drift · Drift / Mecha (Jaeger Mk II)
- ECHO · Caçadores do Gate · Operações dimensionais (classified)
- FOXTROT · Lordes da Lâmina · Caça HVT (Vanadis)
- GOLF · Olhos do Pacto · CiberSeg / SIGINT
- HOTEL · Andarilhos Cinzas · Stealth / Exfiltração
- INDIA · Frequência Zero · Combate paranormal (standby)
- JULIETT · Operadores Orbitais · Ops orbitais
- KILO · Linha de Plasma · Operações de cerco
- LIMA · Coração do Núcleo · Pesquisa/engenharia (classified)
- MIKE · Mortar TITAN · Apoio pesado long-range
- NOVEMBER · Mesa Vermelha · Comando e coordenação
- OSCAR · Casa Vazia · IA / JARVIS (classified)
- PAPA · Última Mensagem · CSAR / busca e resgate (reserva)
- QUEBEC · A Forja · Treinamento e seleção (Crucible)
- ROMEO · Eclipse · Contra-inteligência interna (classified)
- SIERRA · Pegadas no Pó · Reconhecimento profundo
- TANGO · Décimo Terceiro · Engenharia do Núcleo (Lucas)
- UNIFORM · Arquitetos · Arqueologia anômala (standby)
- VICTOR · Travessia · Operações dimensionais (reserva)
- WHISKEY · Aurora · Reconstrução pós-conflito
- X-RAY · Diagnóstico · Medicina de combate
- YANKEE · Solo de Vanadis · Operador solo (classified)
- ZULU · Cataloga-Sangue · Arquivo de divindades

Cada ficha tem:
- código + nome operacional + cor distintiva
- especialidade · líder · número de membros · ano de formação · base
- lema (italic, destaque magenta)
- status (5 níveis: ativa, standby, reserva, baixa, classified)
- descrição narrativa
- lista de equipamento típico (armas do Arsenal F11)
- operações notáveis (referência aos arcos das Crônicas F12)
- link "ler arco" → /biblioteca se houver

UI da página:
- Filtros: status, especialidade, busca textual
- Grid responsivo de cards com border-left colorido (cor da equipe)
- Painel sticky de ficha detalhada à direita
- Cada card mostra: cover, código, nome, status badge, especialidade, lema, meta

Cross-linking:
- Cada equipe linka pro arco correspondente nas Crônicas (Fase 12)
- Equipes referenciam armas do Arsenal (Fase 11)
- Universo Baluarte cresce em rede

Arquivos novos:
- src/data/elites.js (~330 linhas, 26 fichas completas)
- src/pages/elites.js (~190 linhas, UI com filtros + detail)
- src/styles/elites.css (~220 linhas, cards coloridos por equipe)

Arquivos modificados:
- src/main.js: registra /elites, remove de PRINCIPAL_ROUTES, banner v0.13.0
- src/pages/_placeholder.js: remove entrada
- src/layout/sidebar.js: /elites phase 1, CURRENT_PHASE=13, footer v0.13.0
- index.html: link elites.css
- package.json: bump 0.13.0
- README.md: marca Fase 13 ✅

Verificação:
- npm run build: 74 módulos, 286KB JS / 90KB CSS gzipped (93KB / 14KB)
- 26 cards visíveis, filtros funcionando
- Cross-link biblioteca→elites→arsenal operacional
**Arquivos afetados:** 9
### Arquivos criados

- `src/data/elites.js`
- `src/pages/elites.js`
- `src/styles/elites.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`

---

## Commit 19 — `458c1de0a05a9d078171f1633a65b45705cd90fa`
**Link:** [458c1de0a05a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/458c1de0a05a9d078171f1633a65b45705cd90fa)
**Data do autor:** `2026-05-14T22:03:30+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `0bdaf602072565b3384693d1cf10c252f6d4cc4a`
**Resumo:** feat(fase-14): CiberSeg (35 entradas) + Academia (10 linguagens)
**Corpo da mensagem:**

feat(fase-14): CiberSeg (35 entradas) + Academia (10 linguagens)

Fase 14 entregue na branch fase-14. Duas páginas novas:
/ciberseg (enciclopédia ataque & defesa) + /academia (10 langs).

CIBERSEG (35 entradas em 8 categorias):
- Recon (4): OSINT, DNS footprinting, port scan, banner grabbing
- Exploit (6): SQLi, XSS, CSRF, Buffer Overflow, RCE, Privesc
- Malware (4): Ransomware, RAT, Keylogger, Rootkit
- Rede (4): MITM, DDoS, Wi-Fi cracking, DNS spoofing
- Cripto (3): Rainbow tables, Padding Oracle, Side-channel timing
- Defesa (4): Defense in Depth, Zero Trust, EDR, Threat Hunting
- OPSEC (3): Anonimato, identidades operacionais, metadata scrubbing
- Forense (3): memória, disco, network forensics

Cada entry: título, severidade (crítico/alto/médio/baixo/info),
descrição, ferramentas, mitigação.
- 5 níveis de severity com cores
- Filtros: categoria, severidade, busca
- Painel sticky de detalhes com tools chips
- Link "Lab de Cripto" para cruzar com Fase 7+8

ACADEMIA (10 linguagens):
- JavaScript, Python, Rust, Go, TypeScript, C++, Java, C#, Kotlin, Swift
- Cada linguagem: nome, ano, criador, paradigma, summary, why
- 2-4 módulos por linguagem com código real exemplo
- Botão "abrir no Editor" injeta a tab no Editor de Código (Fase 2)
  e navega — cross-link Editor↔Academia funcional
- Cards laterais com seletor de linguagem (cor de marca)
- Header com info + sections (Sobre, Por que aprender, Módulos)

Arquivos novos:
- src/data/ciberseg.js (~150 linhas, 35 entries)
- src/data/academia.js (~270 linhas, 10 langs com módulos)
- src/pages/ciberseg.js (~190 linhas)
- src/pages/academia.js (~160 linhas)
- src/styles/ciberseg.css (~150 linhas)
- src/styles/academia.css (~160 linhas)

Arquivos modificados:
- src/main.js: registra /ciberseg + /academia, remove de PRINCIPAL_ROUTES
- src/pages/_placeholder.js: remove ambas entradas
- src/layout/sidebar.js: /ciberseg + /academia phase 1, v0.14.0
- index.html: links CSS
- package.json: bump 0.14.0
- README.md: marca Fase 14 ✅

Verificação:
- npm run build: 80 módulos, 313KB JS / 96KB CSS gzipped (103KB / 14KB)
- 35 entries de ciberseg navegáveis com filtros
- 10 linguagens com cross-link funcional para Editor
**Arquivos afetados:** 12
### Arquivos criados

- `src/data/academia.js`
- `src/data/ciberseg.js`
- `src/pages/academia.js`
- `src/pages/ciberseg.js`
- `src/styles/academia.css`
- `src/styles/ciberseg.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`

---

## Commit 20 — `bcbd0ac716522645615ad7202392ca5797a91783`
**Link:** [bcbd0ac71652](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bcbd0ac716522645615ad7202392ca5797a91783)
**Data do autor:** `2026-05-15T02:59:06+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `458c1de0a05a9d078171f1633a65b45705cd90fa`
**Resumo:** fix(fase-13+14): SPECIALTIES dinâmico, cross-link arco, extensão de arquivo
**Corpo da mensagem:**

fix(fase-13+14): SPECIALTIES dinâmico, cross-link arco, extensão de arquivo

Varredura nas Fases 13 e 14 identificou 3 bugs (1 crítico, 2 leves):

FASE 13 — Elites
- src/data/elites.js: SPECIALTIES hard-coded com 18 entradas perdia
  12 das 26 especialidades reais (ECHO, KILO, LIMA, MIKE, OSCAR, ROMEO,
  TANGO, UNIFORM, VICTOR, WHISKEY, YANKEE, ZULU). Agora derivado
  dinamicamente de EQUIPES via Set + sort.
- src/pages/elites.js: botão "Ler arco" navegava pra /biblioteca mas
  não pré-selecionava o arco da equipe. Agora salva
  biblioteca:state.selectedArc + selectedChapter via storage helper
  antes do navigate, e o texto do botão mostra o nome real do arco.
  Import findArc de cronicas.js.

FASE 14 — Academia
- src/pages/academia.js: bug crítico — tabs criadas no Editor usavam
  lang.id como extensão de arquivo: javascript-1.javascript,
  python-1.python (errado). Agora importa getLang de editor-langs.js
  e usa langDef.ext (.js, .py, .ts, .rs, .go, etc).
- Refatora pra usar storage.get/set ao invés de localStorage cru,
  evitando duplicar a lógica de namespace e parsing JSON.
- Toast agora mostra o nome real do arquivo gerado.

Verificação:
- npm run build limpo (80 módulos, 313KB JS / 96KB CSS)
- Filtro Elites agora lista todas as 26 especialidades únicas
- Cross-link Elites→Biblioteca abre direto no arco correto
- Cross-link Academia→Editor cria tab com nome correto (ex: rust-1.rs)
**Arquivos afetados:** 3
### Arquivos modificados

- `src/data/elites.js`
- `src/pages/academia.js`
- `src/pages/elites.js`

---

## Commit 21 — `1b1c274e009e7f7079247e0d1e67c03c1b06a28a`
**Link:** [1b1c274e009e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1b1c274e009e7f7079247e0d1e67c03c1b06a28a)
**Data do autor:** `2026-05-15T03:08:03+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `bcbd0ac716522645615ad7202392ca5797a91783`
**Resumo:** feat(fase-15): Visualizador FFT (6 modos) + Media Hub
**Corpo da mensagem:**

feat(fase-15): Visualizador FFT (6 modos) + Media Hub

Fase 15 entregue na branch fase-15. Duas páginas novas.

VISUALIZADOR FFT (/fft):
Engine Web Audio API (~340 linhas):
- AudioContext + AnalyserNode + GainNode
- 6 modos de visualização em Canvas 2D:
  1. bars       — espectro tradicional, gradient cyan→magenta
  2. line       — curva de resposta em frequência com fill gradient
  3. waveform   — domínio do tempo, magenta com glow
  4. radial     — barras polares (180 bins) com anel central
  5. spectrogram — waterfall scrolling com gradient dark→cyan→magenta→orange
  6. particles  — 120 partículas reagindo a bandas FFT
- DPR-aware (HiDPI nítido)
- Fontes: microfone (sem feedback), arquivo audio/vídeo, oscilador
- Controles:
  · FFT size: 512/1024/2048/4096/8192
  · Smoothing 0-0.99
  · Gain 0-2
  · Tom de teste 50-5000 Hz
- Unmount watcher: hashchange para fora de /fft fecha mic/oscillator
  e revoga URLs (sem leaks)

MEDIA HUB (/media):
- Carrega áudio/vídeo/imagens via input multi-file
- Drag-and-drop com zona destacada
- Lista lateral com tipo, tamanho, ícone colorido por tipo
- Player embutido:
  · Audio: <audio controls>
  · Video: <video controls> max 60vh
  · Image: <img> max 70vh com background dark
- Botão "Visualizar FFT →" cross-link com /fft
- URLs Object revogadas no unmount (sem memory leak)
- Tudo em memória (não persiste — esperado)

Arquivos novos:
- src/utils/fft-engine.js (~340 linhas)
- src/pages/fft.js (~210 linhas)
- src/pages/media.js (~220 linhas)
- src/styles/fft.css (~90 linhas)
- src/styles/media.css (~140 linhas)

Arquivos modificados:
- src/main.js: registra /fft + /media, remove de TOOL_ROUTES, banner v0.15.0
- src/pages/_placeholder.js: remove entradas /fft + /media
- src/pages/ferramentas.js: cards fft, media-hub, audio-fft → phase 1
- src/layout/sidebar.js: CURRENT_PHASE=15, footer v0.15.0
- index.html: links fft.css + media.css
- package.json: bump 0.15.0
- README.md: marca Fase 15 ✅

Verificação:
- npm run build: 85 módulos, 328KB JS / 100KB CSS gzipped (108KB / 15KB)
- /fft modes mudam sem reconectar fonte
- /media: drag-and-drop adiciona, cross-link FFT funciona
- Mic não cria feedback (gain desconectado do destination)
**Arquivos afetados:** 12
### Arquivos criados

- `src/pages/fft.js`
- `src/pages/media.js`
- `src/styles/fft.css`
- `src/styles/media.css`
- `src/utils/fft-engine.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 22 — `fa96c0d158a44cb3dce0ed5adabf757931f0f13b`
**Link:** [fa96c0d158a4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fa96c0d158a44cb3dce0ed5adabf757931f0f13b)
**Data do autor:** `2026-05-15T03:17:24+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1b1c274e009e7f7079247e0d1e67c03c1b06a28a`
**Resumo:** feat(fase-16): Central de Vídeos + Universo Hub (10 universos)
**Corpo da mensagem:**

feat(fase-16): Central de Vídeos + Universo Hub (10 universos)

Fase 16 entregue na branch fase-16. Duas páginas novas.

CENTRAL DE VÍDEOS (/videos):
- 5 playlists temáticas:
  · Tutoriais de Operações (CQB, Overwatch, Fireteam, EVAC)
  · Crônicas em Vídeo (adaptações dos arcos ALFA-ECHO)
  · Equipamento Mark XIII (Plasma Lance, Coilgun, Jaeger, ORBITER)
  · Diário de Desenvolvimento (sem TS, autópsia das 12 Marks, arquitetura Vite)
  · Som & Trilha (Tema Núcleo, Drift, Coro Vanadis)
- 18 vídeos catalogados com YouTube embed
- Marca "assistido" persistido (✓ verde)
- Busca textual nas playlists
- Player com aspect-ratio 16:9, info da playlist + tags
- Cross-link com /media para arquivos locais
- Persistência de estado completo

UNIVERSO HUB (/universo):
- 10 universos: 2 core (Baluarte, Convergência Divina) + 8 crossovers:
  · Baluarte (ALFA, equipes, Núcleo)
  · DOOM (BRAVO, demônios, Phobos)
  · Halo (CHARLIE, Reach, Spartans)
  · Pacific Rim (DELTA, Kaiju, Jaeger)
  · Solo Leveling (ECHO, gates, Sistema)
  · Madan no Vanadis (FOXTROT, 7 Lordes)
  · Arifureta (VICTOR, travessia)
  · Horror Cósmico (INDIA, Frequência 11)
  · Arknights Endfield (JULIETT, Talos II)
  · Convergência Divina (ZULU, 11 entidades)
- Cada universo: tagline, summary, key facts, facções, ameaças, mídia, arcos
- Cards com cor de marca + ícone Unicode
- Detail view com seções coloridas e link direto pros arcos das Crônicas
- Cross-link: click no arco abre /biblioteca pré-selecionado

Arquivos novos:
- src/data/videos.js (5 playlists, 18 vídeos)
- src/data/universos.js (10 universos com lore completa)
- src/pages/videos.js (~220 linhas)
- src/pages/universo.js (~160 linhas)
- src/styles/videos.css (~130 linhas)
- src/styles/universo.css (~180 linhas)

Arquivos modificados:
- src/main.js: registra /videos + /universo, banner v0.16.0
- src/pages/_placeholder.js: remove ambas entradas
- src/pages/ferramentas.js: card videos phase 1 + TOOL_ROUTES.universo
- src/layout/sidebar.js: /universo phase 1, CURRENT_PHASE=16
- index.html: links CSS
- package.json: bump 0.16.0
- README.md: marca Fase 16 ✅

Verificação:
- npm run build: 91 módulos, 345KB JS / 106KB CSS gzipped (113KB / 15KB)
- 18 vídeos navegáveis com YouTube embeds
- 10 universos com cross-link funcional para Crônicas
**Arquivos afetados:** 13
### Arquivos criados

- `src/data/universos.js`
- `src/data/videos.js`
- `src/pages/universo.js`
- `src/pages/videos.js`
- `src/styles/universo.css`
- `src/styles/videos.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 23 — `6ddd6e845e82e29c6670ca7cbf0f1dd4001024aa`
**Link:** [6ddd6e845e82](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6ddd6e845e82e29c6670ca7cbf0f1dd4001024aa)
**Data do autor:** `2026-05-15T03:28:30+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `fa96c0d158a44cb3dce0ed5adabf757931f0f13b`
**Resumo:** feat(fase-17): Tabela Periódica + Modpack + Guia PC + Logic Sim
**Corpo da mensagem:**

feat(fase-17): Tabela Periódica + Modpack + Guia PC + Logic Sim

Fase 17 entregue na branch fase-17. 4 ferramentas novas em 1 fase pesada.

TABELA PERIÓDICA (/tabela-periodica):
- 118 elementos catalogados (Z, símbolo, nome, massa, grupo, período, categoria)
- 11 categorias coloridas: alcalino, alcalino-terroso, transição, pós-transição,
  metaloide, não-metal, halogênio, gás nobre, lantanídeo, actinídeo, desconhecido
- Grid 18×10 responsivo com marcadores L/A para lantanídeos/actinídeos
- Filtro por categoria (dim os outros)
- Detalhe: massa, período, grupo, configuração eletrônica (algoritmo Madelung)

MODPACK MINECRAFT (/modpack):
- 60+ mods catalogados em 9 categorias:
  Tech, Magia, Exploração, Combate, Construção, Storage, World Gen,
  Performance, Utility
- Tier system S/A/B/C (popularidade + impacto)
- Cards com border-left colorido por categoria
- Filtros: categoria, tier, busca textual
- Inclui: AE2, Refined Storage, Mekanism, Create, Botania, Tinkers,
  Sodium, JEI, Curios, Twilight Forest, Apotheosis, Ice and Fire...

GUIA PARA MONTAR PC (/guia-pc):
- 4 presets de build:
  · Orçamento (R$ 4-5k): Ryzen 5 5600 + RTX 3060 1080p
  · Gamer 1440p (R$ 8-12k): Ryzen 7 7700X + RTX 4070 Ti SUPER
  · Content Creator (R$ 15-25k): Ryzen 9 7950X3D + RTX 4080
  · Workstation/ML (R$ 30k+): Threadripper PRO + 2× RTX 4090
- Tutorial de 7 passos: preparação, montagem na mobo, gabinete, GPU,
  cabos, primeiro boot, stress test
- Lista de peças por build com tipo e modelo recomendado
- Dica específica por preset

LOGIC SIM (/logic-sim):
- 7 portas lógicas básicas: AND, OR, NOT, XOR, NAND, NOR, XNOR
- Inputs A/B clicáveis (toggle 0/1) com saída calculada em real-time
- Visualização do circuito: input → gate → output
- Tabela verdade completa da porta selecionada
- Cross-link com /tabela-verdade para expressões compostas

Arquivos novos:
- src/data/periodic.js (~150 linhas, 118 elementos)
- src/data/modpack.js (~190 linhas, 60 mods + 4 presets PC + 7 portas)
- src/pages/tabela-periodica.js (~150 linhas)
- src/pages/modpack.js (~120 linhas)
- src/pages/guia-pc.js (~120 linhas)
- src/pages/logic-sim.js (~140 linhas)
- src/styles/fase17.css (~390 linhas, unificado)

Arquivos modificados:
- src/main.js: registra 4 rotas novas, banner v0.17.0
- src/pages/_placeholder.js: remove 4 entradas
- src/pages/ferramentas.js: cards tabela-periodica, modpack-mc, guia-pc phase 1
- src/layout/sidebar.js: CURRENT_PHASE=17, footer v0.17.0
- index.html: link fase17.css
- package.json: bump 0.17.0
- README.md: marca Fase 17 ✅

Verificação:
- npm run build: 98 módulos, 375KB JS / 116KB CSS gzipped (124KB / 17KB)
- 4 páginas navegáveis
- Tabela periódica responsiva (min-width 720px com overflow-x)
**Arquivos afetados:** 14
### Arquivos criados

- `src/data/modpack.js`
- `src/data/periodic.js`
- `src/pages/guia-pc.js`
- `src/pages/logic-sim.js`
- `src/pages/modpack.js`
- `src/pages/tabela-periodica.js`
- `src/styles/fase17.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 24 — `82772a07544d9bc3d55c1f2a45dacf5486de1b84`
**Link:** [82772a07544d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/82772a07544d9bc3d55c1f2a45dacf5486de1b84)
**Data do autor:** `2026-05-15T00:30:57-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `1eaa9e3978f9e0fce762beba975b3cbc0b670ea2 6ddd6e845e82e29c6670ca7cbf0f1dd4001024aa`
**Resumo:** Merge Fases 1.5 → 17 (#22)
**Corpo da mensagem:**

Merge Fases 1.5 → 17 (#22)

Mergeia 16 fases incrementais (1.5 → 17) em main.

Stack: JS puro + Vite. 98 módulos. ~14.500 linhas.
25 rotas ativas: Editor, Terminal, Calculadoras, Cripto, Gráficos,
Símbolos, Regex, Arsenal (148 itens), Biblioteca (24 arcos),
Elites (26 equipes), CiberSeg (35), Academia (10 langs), FFT (6 modos),
Media Hub, Vídeos, Universo (10), Tabela Periódica (118 elementos),
Modpack (60+), Guia PC, Logic Sim.

Próximas: F18 (PWA + Auth + Perfil), F19 (Economia + JARVIS chat),
F20 (JARVIS completo), F21 (Editor → IDE + IA Mark 11).
**Arquivos afetados:** 0

---

## Commit 25 — `95eafdbfcbaca0238d752a424bb9bf3a308c3160`
**Link:** [95eafdbfcbac](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/95eafdbfcbaca0238d752a424bb9bf3a308c3160)
**Data do autor:** `2026-05-15T12:03:19+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `6ddd6e845e82e29c6670ca7cbf0f1dd4001024aa`
**Resumo:** feat(fase-18): PWA offline-first + Shadow Bridge auth + Perfil
**Corpo da mensagem:**

feat(fase-18): PWA offline-first + Shadow Bridge auth + Perfil

Fase 18 entregue na branch fase-18.

SERVICE WORKER (public/sw.js):
- Substitui o skeleton da Fase 1 por implementação completa
- Estratégia stale-while-revalidate:
  · Cache primeiro (resposta rápida)
  · Update em background
- Core assets pré-cacheados no install (/, index.html, manifest, offline.html)
- Navegação: network-first com fallback offline.html
- Versionamento de cache (baluarte-v0.18.0): activate limpa caches antigos
- Mensagens: SKIP_WAITING, CLEAR_CACHE

SHADOW BRIDGE (/shadow + auth-engine.js):
- Autenticação client-side SHA-256 × 100 iterações + salt aleatório (16B)
- 3 estados: setup inicial / login / sessão ativa
- Setup: senha → 100× SHA-256 → hash + salt armazenados (nunca texto plano)
- Login: comparação constant-time anti-timing-attack
- Sessão: token aleatório 32B, TTL de 4 horas
- Reset completo disponível
- isAuthenticated() exportado para outras páginas consultarem

PERFIL (/perfil):
- Cartão de identidade: avatar, nome, callsign, badges (clearance,
  equipes, status Shadow Bridge)
- 6 estatísticas do projeto
- 4 links rápidos (GitHub externo + rotas internas)
- Configurações:
  · Nome e callsign editáveis (persistido)
  · Toggle "Reduzir animações" (aplica classe .reduce-motion global)
  · Toggle "Confirmar ações destrutivas"
  · Botão "Limpar todos os dados locais" (apaga namespace baluarte:)

Arquivos novos:
- src/utils/auth-engine.js (~140 linhas, SHA-256×100 + sessão)
- src/pages/shadow.js (~190 linhas, 3 estados)
- src/pages/perfil.js (~200 linhas)
- src/styles/fase18.css (~290 linhas)

Arquivos modificados:
- public/sw.js: skeleton → SW completo stale-while-revalidate
- src/main.js: registra /shadow + /perfil, banner v0.18.0
- src/pages/_placeholder.js: remove /perfil e /shadow
- src/layout/sidebar.js: /perfil + /shadow phase 1, CURRENT_PHASE=18
- index.html: link fase18.css
- package.json: bump 0.18.0
- README.md: marca Fase 18 ✅

Verificação:
- npm run build: 102 módulos, 384KB JS / 121KB CSS gzipped (127KB / 17KB)
- SW registra e cacheia (offline-first funcional)
- Shadow Bridge: setup → login → sessão 4h, reset
- Perfil persiste config, toggle reduce-motion funciona
**Arquivos afetados:** 11
### Arquivos criados

- `src/pages/perfil.js`
- `src/pages/shadow.js`
- `src/styles/fase18.css`
- `src/utils/auth-engine.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `public/sw.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`

---

## Commit 26 — `502f08586c3afb183368ef705b882c1df4511a51`
**Link:** [502f08586c3a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/502f08586c3afb183368ef705b882c1df4511a51)
**Data do autor:** `2026-05-15T19:44:33+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `95eafdbfcbaca0238d752a424bb9bf3a308c3160`
**Resumo:** feat(fase-19): Economia (cotações live) + JARVIS chat
**Corpo da mensagem:**

feat(fase-19): Economia (cotações live) + JARVIS chat

Fase 19 entregue na branch fase-19.

ECONOMIA (/economia):
- Câmbio via AwesomeAPI: 8 pares (USD, EUR, GBP, BTC, ARS, JPY, CAD, CNY)
- Cripto via CoinGecko: 8 moedas (BTC, ETH, SOL, ADA, BNB, XRP, DOGE, DOT)
- Cards com cotação, variação %, high/low, preço USD
- Conversor rápido entre qualquer par de moedas
- Atualização manual (botão refresh) + auto-load inicial
- Promise.allSettled — falha de uma API não derruba a outra
- Timeout de 10s nas chamadas

src/utils/economia-api.js:
- fetchWithTimeout (AbortController)
- fetchCurrencies / fetchCrypto
- formatadores BRL/USD/Pct

JARVIS CHAT (/jarvis):
2 modos (4 completos na Fase 20):
- LOCAL: assistente de regras que conhece o Baluarte
  · Navegação por voz: "abra o editor", "vai pro arsenal"
  · Consultas: equipes, armas, arcos, universos, status
  · 30+ rotas mapeadas por palavra-chave
- CLAUDE API: chamada direta a api.anthropic.com
  · Header anthropic-dangerous-direct-browser-access
  · Seletor de modelo (Sonnet 4.6 / Opus 4.7 / Haiku 4.5)
  · API key em localStorage (com aviso de segurança)

UI do chat:
- Bubbles operador/JARVIS com avatares
- Indicador de digitação animado
- Memória de conversa persistente (100 msgs)
- Painel de configuração colapsável
- Enter envia, Shift+Enter quebra linha
- Modo local navega automaticamente quando detecta intenção

src/utils/jarvis-engine.js:
- processLocal (regras + ações de navegação)
- processClaude (API direta)
- loadHistory/saveHistory/clearHistory
- loadConfig/saveConfig

Arquivos novos:
- src/utils/economia-api.js (~110 linhas)
- src/utils/jarvis-engine.js (~250 linhas)
- src/pages/economia.js (~230 linhas)
- src/pages/jarvis.js (~230 linhas)
- src/styles/fase19.css (~330 linhas)

Arquivos modificados:
- src/main.js: registra /economia + /jarvis, banner v0.19.0
- src/pages/_placeholder.js: remove ambas entradas
- src/pages/ferramentas.js: cards cotacoes + jarvis phase 1
- src/layout/sidebar.js: /economia + /jarvis phase 1, CURRENT_PHASE=19
- index.html: link fase19.css
- package.json: bump 0.19.0
- README.md: marca Fase 19 ✅

Verificação:
- npm run build: 107 módulos, 402KB JS / 126KB CSS gzipped (132KB / 18KB)
- Economia carrega cotações (requer conexão)
- JARVIS modo local: navega e consulta dados do Baluarte
- JARVIS modo Claude: pronto, requer API key do usuário
**Arquivos afetados:** 12
### Arquivos criados

- `src/pages/economia.js`
- `src/pages/jarvis.js`
- `src/styles/fase19.css`
- `src/utils/economia-api.js`
- `src/utils/jarvis-engine.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/ferramentas.js`

---

## Commit 27 — `c6d0a71dfd3a30eade619005c7f9d0e3ffd1e3b8`
**Link:** [c6d0a71dfd3a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c6d0a71dfd3a30eade619005c7f9d0e3ffd1e3b8)
**Data do autor:** `2026-05-15T19:52:31+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `502f08586c3afb183368ef705b882c1df4511a51`
**Resumo:** feat(fase-20): JARVIS completo — 4 modos, agente com ferramentas, IndexedDB
**Corpo da mensagem:**

feat(fase-20): JARVIS completo — 4 modos, agente com ferramentas, IndexedDB

Fase 20 entregue na branch fase-20. JARVIS expandido de 2 para 4 modos.

4 MODOS:
- LOCAL: assistente de regras (já existia) — navega e consulta offline
- CLAUDE: Claude API direta (já existia) — conversa livre
- OLLAMA (novo): modelo local via http://localhost:11434/api/chat
  · 100% privado, sem custo
  · URL e modelo configuráveis
  · Erro tratado se Ollama não estiver rodando
- AGENTE (novo): Claude API + tool-use
  · Loop de até 6 turnos de ferramentas
  · 7 ferramentas: navigate, search_arsenal, get_equipe, get_arco,
    calculate, open_editor, system_status
  · Cada chamada de ferramenta aparece no chat como chip

MEMÓRIA INDEXEDDB (jarvis-memory.js):
- Substitui o localStorage simples da Fase 19
- Banco baluarte-jarvis com 2 stores: sessions + messages
- Múltiplas sessões de conversa independentes
- Index bySession para busca rápida de mensagens
- Fallback em memória se IndexedDB falhar (badge MEMÓRIA VOLÁTIL)
- createSession, listSessions, updateSession, deleteSession,
  addMessage, getMessages, clearAll

FERRAMENTAS DO AGENTE (jarvis-tools.js):
- TOOL_SCHEMAS no formato Claude tool-use
- runTool() executa a implementação local
- navigate → router.navigate
- search_arsenal → busca no Arsenal
- get_equipe / get_arco → fichas de Elites/Crônicas
- calculate → calc-engine
- open_editor → cria tab no Editor
- system_status → status do Baluarte

UI reescrita (/jarvis):
- Layout split: sidebar de sessões + área de chat
- Sessões: criar, trocar, apagar (renomeadas pela 1ª mensagem)
- 4 modos selecionáveis em grid com descrição
- Tool calls visíveis como chips amarelos inline
- Config por modo (API key, modelo, Ollama URL/modelo)

Arquivos novos:
- src/utils/jarvis-memory.js (~170 linhas, IndexedDB + fallback)
- src/utils/jarvis-tools.js (~190 linhas, 7 ferramentas)

Arquivos modificados:
- src/utils/jarvis-engine.js: +processOllama, +processAgent (loop tool-use)
- src/pages/jarvis.js: reescrita completa (4 modos + sessões)
- src/styles/fase19.css: +estilos sessões, modos, tool-call chips
- src/main.js: banner v0.20.0
- src/layout/sidebar.js: CURRENT_PHASE=20, footer v0.20.0
- package.json: bump 0.20.0
- README.md: marca Fase 20 ✅

Verificação:
- npm run build: 109 módulos, 413KB JS / 129KB CSS gzipped (136KB / 18KB)
- 4 modos selecionáveis
- Sessões persistem em IndexedDB
- Agente: loop de ferramentas funcional (requer API key)
**Arquivos afetados:** 9
### Arquivos criados

- `src/utils/jarvis-memory.js`
- `src/utils/jarvis-tools.js`
### Arquivos modificados

- `README.md`
- `package.json`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/jarvis.js`
- `src/styles/fase19.css`
- `src/utils/jarvis-engine.js`

---

## Commit 28 — `c835301be089fb39b1c9e3b6591566088ce3ad37`
**Link:** [c835301be089](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c835301be089fb39b1c9e3b6591566088ce3ad37)
**Data do autor:** `2026-05-15T16:57:16-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `82772a07544d9bc3d55c1f2a45dacf5486de1b84 c6d0a71dfd3a30eade619005c7f9d0e3ffd1e3b8`
**Resumo:** Merge pull request #28 from Lucas-Belucci-Bellini/fase-20
**Corpo da mensagem:**

Merge pull request #28 from Lucas-Belucci-Bellini/fase-20

Fase 20
**Arquivos afetados:** 0

---

## Commit 29 — `04e526065c36fdf0a9c8f50573f7e072b453acd2`
**Link:** [04e526065c36](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/04e526065c36fdf0a9c8f50573f7e072b453acd2)
**Data do autor:** `2026-05-16T01:04:53+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `c6d0a71dfd3a30eade619005c7f9d0e3ffd1e3b8`
**Resumo:** feat(fase-21): v1.0.0 — IDE, IA Mark 11, Crônicas reais e Ponte Shadow oculta
**Corpo da mensagem:**

feat(fase-21): v1.0.0 — IDE, IA Mark 11, Crônicas reais e Ponte Shadow oculta

- IA Proprietária Mark 11: sistema de Skills (SKILL.md) com 7 skills built-in.
- Editor de Código com integração VFS (filesystem compartilhado com o Terminal).
- Fan fic "Onde os Deuses Sangram" integrada à Biblioteca — 4 partes e 16
  capítulos reais, marcados como saga canônica.
- Ponte Shadow retirada de toda a navegação visível. O acesso passa a ser
  por um gateway oculto, autenticado por SHA-256 iterado x100; apenas o
  hash do código de acesso vive no código-fonte.
- Nova página "Sobre o Projeto": história Mark I -> v1.0.0, mapa do site e
  aviso de obra em andamento.
- Home e README atualizados para v1.0.0; 31 rotas; placeholders eliminados.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 19
### Arquivos criados

- `src/data/fanfic.json`
- `src/data/skills.js`
- `src/pages/ia-proprietaria.js`
- `src/pages/sobre.js`
- `src/styles/fase21.css`
- `src/utils/shadow-gate.js`
### Arquivos modificados

- `README.md`
- `index.html`
- `package.json`
- `src/data/cronicas.js`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/_placeholder.js`
- `src/pages/biblioteca.js`
- `src/pages/editor.js`
- `src/pages/ferramentas.js`
- `src/pages/home.js`
- `src/pages/shadow.js`

---

## Commit 30 — `c356dd003f4098d8506a853c752990d84b2a83d4`
**Link:** [c356dd003f40](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c356dd003f4098d8506a853c752990d84b2a83d4)
**Data do autor:** `2026-05-16T08:14:58-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c835301be089fb39b1c9e3b6591566088ce3ad37 04e526065c36fdf0a9c8f50573f7e072b453acd2`
**Resumo:** Merge pull request #29 — Fase 21/21 (v1.0.0)
**Corpo da mensagem:**

Merge pull request #29 — Fase 21/21 (v1.0.0)

Baluarte Mark XIII v1.0.0 — IDE, IA Proprietária Mark 11, Crônicas reais e Ponte Shadow oculta. Consolida as 21 fases no main.
**Arquivos afetados:** 0

---

## Commit 31 — `b72aa1d6261865f7d6de80d353e928298cfc794e`
**Link:** [b72aa1d62618](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b72aa1d6261865f7d6de80d353e928298cfc794e)
**Data do autor:** `2026-05-16T11:20:17+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `04e526065c36fdf0a9c8f50573f7e072b453acd2`
**Resumo:** chore: adiciona package-lock.json para builds reproduzíveis
**Corpo da mensagem:**

chore: adiciona package-lock.json para builds reproduzíveis

Gerado pelo npm install — trava a versão do Vite (única dependência de
build) para que o npm install resolva sempre o mesmo conjunto.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 1
### Arquivos criados

- `package-lock.json`

---

## Commit 32 — `60415dce25477deec5d17b2d239516f3ce910ce2`
**Link:** [60415dce2547](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/60415dce25477deec5d17b2d239516f3ce910ce2)
**Data do autor:** `2026-05-16T09:10:22-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c356dd003f4098d8506a853c752990d84b2a83d4 b72aa1d6261865f7d6de80d353e928298cfc794e`
**Resumo:** Merge pull request #30 from Lucas-Belucci-Bellini/fase-21
**Corpo da mensagem:**

Merge pull request #30 from Lucas-Belucci-Bellini/fase-21

chore: adiciona package-lock.json para builds reproduzíveis
**Arquivos afetados:** 0

---

## Commit 33 — `ea551648004c2a72262c37f7a19a8a90249ed6c2`
**Link:** [ea551648004c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ea551648004c2a72262c37f7a19a8a90249ed6c2)
**Data do autor:** `2026-05-16T12:24:40+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `b72aa1d6261865f7d6de80d353e928298cfc794e`
**Resumo:** fix(biblioteca): descreve as Crônicas como 24 arcos e 200+ capítulos
**Corpo da mensagem:**

fix(biblioteca): descreve as Crônicas como 24 arcos e 200+ capítulos

A saga "Onde os Deuses Sangram" tem 24 arcos e mais de 200 capítulos
no Vault. Corrige a descrição na Biblioteca e na página Sobre — que
diziam "4 partes" — e deixa explícito que o site integra os arcos do
Vault aos poucos, a cada versão.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 3
### Arquivos modificados

- `src/data/cronicas.js`
- `src/pages/biblioteca.js`
- `src/pages/sobre.js`

---

## Commit 34 — `6af938061be48fff9b5e97e957703089d18a6c7e`
**Link:** [6af938061be4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6af938061be48fff9b5e97e957703089d18a6c7e)
**Data do autor:** `2026-05-16T12:24:57+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `60415dce25477deec5d17b2d239516f3ce910ce2 ea551648004c2a72262c37f7a19a8a90249ed6c2`
**Resumo:** Merge fase-21 — Crônicas: 24 arcos e 200+ capítulos + lockfile
**Arquivos afetados:** 0

---

## Commit 35 — `e2d240f4c6e4082a8cc18144b525ed7be1901b0e`
**Link:** [e2d240f4c6e4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e2d240f4c6e4082a8cc18144b525ed7be1901b0e)
**Data do autor:** `2026-05-16T09:39:07-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `6af938061be48fff9b5e97e957703089d18a6c7e`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram.md`

---

## Commit 36 — `f39c2c4cf18664cad1d4ee19c849b6e37ba64c99`
**Link:** [f39c2c4cf186](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f39c2c4cf18664cad1d4ee19c849b6e37ba64c99)
**Data do autor:** `2026-05-16T09:39:32-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `e2d240f4c6e4082a8cc18144b525ed7be1901b0e`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Equipes ALFA e BRAVO e CHARLIE e DELTA e ECHO e Foxtrott e Golf e Hotel e India e  Juliett e Kilo e Mike e November e Oscar e Papa e Quebec e Romeo.md`

---

## Commit 37 — `812ad5d623a2ae4ebfb444e127f32436b491b4f7`
**Link:** [812ad5d623a2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/812ad5d623a2ae4ebfb444e127f32436b491b4f7)
**Data do autor:** `2026-05-16T09:39:53-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f39c2c4cf18664cad1d4ee19c849b6e37ba64c99`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 1).md`

---

## Commit 38 — `071481a4ab51d307f1756ef23a52adaad6bd0986`
**Link:** [071481a4ab51](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/071481a4ab51d307f1756ef23a52adaad6bd0986)
**Data do autor:** `2026-05-16T09:40:13-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `812ad5d623a2ae4ebfb444e127f32436b491b4f7`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 2).md`

---

## Commit 39 — `2e9ab10717ff2150676b6ea16df07ba9ef20cde7`
**Link:** [2e9ab10717ff](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2e9ab10717ff2150676b6ea16df07ba9ef20cde7)
**Data do autor:** `2026-05-16T09:40:29-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `071481a4ab51d307f1756ef23a52adaad6bd0986`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).md`

---

## Commit 40 — `395202de23db5d4532d41c4f5ae2109ab3a93cad`
**Link:** [395202de23db](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/395202de23db5d4532d41c4f5ae2109ab3a93cad)
**Data do autor:** `2026-05-16T09:41:18-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2e9ab10717ff2150676b6ea16df07ba9ef20cde7`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram.pdf`

---

## Commit 41 — `2490069dba6c08f426e4b6ccf0ee90c5f3fede03`
**Link:** [2490069dba6c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2490069dba6c08f426e4b6ccf0ee90c5f3fede03)
**Data do autor:** `2026-05-16T09:41:34-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `395202de23db5d4532d41c4f5ae2109ab3a93cad`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Equipes ALFA e BRAVO e CHARLIE e DELTA e ECHO e Foxtrott e Golf e Hotel e India e  Juliett e Kilo e Mike e November e Oscar e Papa e Quebec e Romeo (1).pdf`

---

## Commit 42 — `16e88205460500cec5b302b007cb15e7e2d99ea1`
**Link:** [16e882054605](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/16e88205460500cec5b302b007cb15e7e2d99ea1)
**Data do autor:** `2026-05-16T09:41:54-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2490069dba6c08f426e4b6ccf0ee90c5f3fede03`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 1).pdf`

---

## Commit 43 — `897d5be3575f2aef8daf8449f7e0ec3bdfa6b3b7`
**Link:** [897d5be3575f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/897d5be3575f2aef8daf8449f7e0ec3bdfa6b3b7)
**Data do autor:** `2026-05-16T09:42:25-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `16e88205460500cec5b302b007cb15e7e2d99ea1`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 2).pdf`

---

## Commit 44 — `b2ab75a48a5d744c30cac0bb9d60980e27649715`
**Link:** [b2ab75a48a5d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b2ab75a48a5d744c30cac0bb9d60980e27649715)
**Data do autor:** `2026-05-16T09:42:56-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `897d5be3575f2aef8daf8449f7e0ec3bdfa6b3b7`
**Resumo:** Add files via upload
**Arquivos afetados:** 1
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).pdf`

---

## Commit 45 — `4ce3ee8dda70d0b95e5319349c6df48d31ea60e6`
**Link:** [4ce3ee8dda70](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4ce3ee8dda70d0b95e5319349c6df48d31ea60e6)
**Data do autor:** `2026-05-16T09:43:11-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b2ab75a48a5d744c30cac0bb9d60980e27649715`
**Resumo:** Add files via upload
**Arquivos afetados:** 0

---

## Commit 46 — `139e3dc22529e8cd311b003cf87a51b68f16f518`
**Link:** [139e3dc22529](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/139e3dc22529e8cd311b003cf87a51b68f16f518)
**Data do autor:** `2026-05-16T13:10:29+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `ea551648004c2a72262c37f7a19a8a90249ed6c2`
**Resumo:** feat(biblioteca): integra a saga completa "Onde os Deuses Sangram"
**Corpo da mensagem:**

feat(biblioteca): integra a saga completa "Onde os Deuses Sangram"

A fan fic inteira entra no site — 24 arcos, 1127 capítulos — extraída
dos 4 markdowns do Vault enviados ao repositório.

- fanfic.json regenerado com a saga completa (24 arcos / 1127 caps).
- cronicas.js: a saga (~5 MB) carrega sob demanda via loadSaga()
  (fetch de fanfic.json?url) — fica fora do bundle JS.
- biblioteca.js: leitor assíncrono — arcos de cenário aparecem na hora,
  a saga canônica entra no topo ao carregar; contagem de capítulos
  dinâmica no cabeçalho.
- sobre.js: descrição da Biblioteca atualizada.
- Bundle JS caiu para 438 KB; a saga vira um asset separado.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 4
### Arquivos modificados

- `src/data/cronicas.js`
- `src/data/fanfic.json`
- `src/pages/biblioteca.js`
- `src/pages/sobre.js`

---

## Commit 47 — `83fd8c48c8600ef573036f084030b4e123c413ad`
**Link:** [83fd8c48c860](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/83fd8c48c8600ef573036f084030b4e123c413ad)
**Data do autor:** `2026-05-16T13:10:45+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `4ce3ee8dda70d0b95e5319349c6df48d31ea60e6 139e3dc22529e8cd311b003cf87a51b68f16f518`
**Resumo:** Merge fase-21 — saga completa Onde os Deuses Sangram (24 arcos, 1127 capítulos)
**Arquivos afetados:** 0

---

## Commit 48 — `5dc173a0c14297258f4ec9f63a4933c332b78fbf`
**Link:** [5dc173a0c142](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5dc173a0c14297258f4ec9f63a4933c332b78fbf)
**Data do autor:** `2026-05-17T12:32:15+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `83fd8c48c8600ef573036f084030b4e123c413ad`
**Resumo:** fix(v2.0.0): Service Worker versionado + sourcemaps off em produção
**Corpo da mensagem:**

fix(v2.0.0): Service Worker versionado + sourcemaps off em produção

Início do Bloco 0 (diagnóstico e correções da v2.0.0):
- sw.js: VERSION agora é baluarte-v2.0.0. Como muda a cada release, o
  navegador instala o SW novo, que limpa os caches das versões antigas
  — evita servir assets velhos após um deploy (provável causa da quebra
  observada no Vercel).
- vite.config.js: sourcemap desligado no build de produção.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 2
### Arquivos modificados

- `public/sw.js`
- `vite.config.js`

---

## Commit 49 — `c619e78646df58a5392d15ea84d5c4d17758cbd4`
**Link:** [c619e78646df](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c619e78646df58a5392d15ea84d5c4d17758cbd4)
**Data do autor:** `2026-05-17T12:36:59+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `5dc173a0c14297258f4ec9f63a4933c332b78fbf`
**Resumo:** fix(v2.0.0): limpa Hub de Ferramentas e completa a sidebar
**Corpo da mensagem:**

fix(v2.0.0): limpa Hub de Ferramentas e completa a sidebar

Bloco 0 (diagnóstico e correções):
- ferramentas.js: remove chaves duplicadas no TOOL_ROUTES (media-hub e
  fft apareciam 2x) e o mapeamento morto `universo`; a contagem de
  ferramentas virou dinâmica (estava "35" fixo, com 38 reais).
- sidebar.js: todas as ~30 rotas agora aparecem no menu, em 6 grupos
  (antes só 13 — as ferramentas só davam pra achar pelo Hub). Corrige a
  reclamação de "coisa que devia ter e não tem".

A auditoria estática de todas as páginas não achou bug de runtime.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 2
### Arquivos modificados

- `src/layout/sidebar.js`
- `src/pages/ferramentas.js`

---

## Commit 50 — `c32bef4b22b3717040db475605955527ed38b53b`
**Link:** [c32bef4b22b3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c32bef4b22b3717040db475605955527ed38b53b)
**Data do autor:** `2026-05-17T18:01:45+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `c619e78646df58a5392d15ea84d5c4d17758cbd4`
**Resumo:** fix(v2.0.0): centraliza a versão e corrige dados desatualizados/fora de lugar
**Corpo da mensagem:**

fix(v2.0.0): centraliza a versão e corrige dados desatualizados/fora de lugar

Etapa 1 (teste & correção):
- Novo src/data/version.js — fonte única da versão do projeto (2.0.0).
- O JARVIS mostrava "Fase: 19/21 · v0.19.0" chumbado e o comando `status`
  do terminal mostrava "Fase: 3/21" com módulos como offline. Os dois
  agora usam VERSION e refletem o estado real do sistema.
- LOGIC_GATES saiu de data/modpack.js (estava no arquivo do modpack do
  Minecraft, fora de lugar) para o novo src/data/logic-gates.js.
- shell.js: mapa de títulos de página completo (todas as ~30 rotas).
- sidebar e main.js passam a usar a versão central.
- package.json em 2.0.0.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 10
### Arquivos criados

- `src/data/logic-gates.js`
- `src/data/version.js`
### Arquivos modificados

- `package.json`
- `src/data/modpack.js`
- `src/data/terminal-commands.js`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/logic-sim.js`
- `src/utils/jarvis-engine.js`

---

## Commit 51 — `8938b0045aab9ca98883e394c9d7beda00dcffe4`
**Link:** [8938b0045aab](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8938b0045aab9ca98883e394c9d7beda00dcffe4)
**Data do autor:** `2026-05-17T22:58:01+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `c32bef4b22b3717040db475605955527ed38b53b`
**Resumo:** feat(v2.0.0): Digital Logic Sim — simulador interativo de verdade
**Corpo da mensagem:**

feat(v2.0.0): Digital Logic Sim — simulador interativo de verdade

Etapa 2 (parte 1):
- Novo motor logic-sim-engine.js: modelo de circuito (componentes +
  fios) e simulação por propagação iterativa que estabiliza circuitos
  com realimentação (travas e flip-flops montados com portas).
- logic-sim.js reescrito como canvas interativo: adiciona componentes
  da paleta, arrasta, liga saída->entrada com fios, alterna as entradas
  IN, simulação em tempo real. Salva/carrega o circuito em localStorage.
- 10 componentes: IN, CLOCK, OUT, NOT, AND, OR, NAND, NOR, XOR, XNOR.
- 3 circuitos de exemplo: AND, meio-somador e trava SR.

Antes /logic-sim era só um demo de uma porta por vez.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 4
### Arquivos criados

- `src/styles/logic-sim.css`
- `src/utils/logic-sim-engine.js`
### Arquivos modificados

- `index.html`
- `src/pages/logic-sim.js`

---

## Commit 52 — `81d03f1480591199e218f0726d7e01e1de7a3b11`
**Link:** [81d03f148059](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/81d03f1480591199e218f0726d7e01e1de7a3b11)
**Data do autor:** `2026-05-17T23:00:23+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `8938b0045aab9ca98883e394c9d7beda00dcffe4`
**Resumo:** feat(v2.0.0): FFT captura o áudio do sistema (o som do PC)
**Corpo da mensagem:**

feat(v2.0.0): FFT captura o áudio do sistema (o som do PC)

Etapa 2 (parte 2): nova fonte "Áudio do PC" no Visualizador FFT, via
navigator.mediaDevices.getDisplayMedia({ audio: true }). O usuário
escolhe a aba/tela, marca "compartilhar áudio", e o espectro reage ao
som do sistema — junto com microfone, arquivo e oscilador de teste.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/fft.js`
- `src/utils/fft-engine.js`

---

## Commit 53 — `03702e286c9f53dbeb5e0105df36a5d8bdfa9577`
**Link:** [03702e286c9f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/03702e286c9f53dbeb5e0105df36a5d8bdfa9577)
**Data do autor:** `2026-05-18T04:30:49+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `81d03f1480591199e218f0726d7e01e1de7a3b11`
**Resumo:** fix(v2.0.0): conserta Tabela Verdade, header e perfil desatualizados
**Corpo da mensagem:**

fix(v2.0.0): conserta Tabela Verdade, header e perfil desatualizados

- fase17.css: remove regras órfãs .logic-input/.logic-output do antigo
  Logic Sim que colidiam com a tabela-verdade.css e quebravam o layout
- header.js: troca "FASE 01/05" pela versão central (version.js)
- perfil.js: estatísticas usam VERSION; remove badge que vazava a
  existência da Shadow Bridge

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 3
### Arquivos modificados

- `src/layout/header.js`
- `src/pages/perfil.js`
- `src/styles/fase17.css`

---

## Commit 54 — `cce09dcad32cffc1f6964dff95101c671eb777b1`
**Link:** [cce09dcad32c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cce09dcad32cffc1f6964dff95101c671eb777b1)
**Data do autor:** `2026-05-18T11:57:15+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `03702e286c9f53dbeb5e0105df36a5d8bdfa9577`
**Resumo:** feat(v2.0.0): gerador de Código Morse + Arquivo de Memes 2016
**Corpo da mensagem:**

feat(v2.0.0): gerador de Código Morse + Arquivo de Memes 2016

- /morse: página dedicada texto↔Morse, áudio (oscilador Web Audio),
  flash visual sincronizado, WPM/tom ajustáveis, tabela de referência
- /memes: catálogo curado de 30 memes de 2016 com filtro e busca
- liga ambas no router, sidebar, títulos e CSS; atualiza contagens

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 12
### Arquivos criados

- `src/data/memes.js`
- `src/pages/memes.js`
- `src/pages/morse.js`
- `src/styles/memes.css`
- `src/styles/morse.css`
### Arquivos modificados

- `index.html`
- `src/data/morse-code.js`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`
- `src/pages/perfil.js`

---

## Commit 55 — `3b2acc48a1443e7212b524b93852f5e679b0d80e`
**Link:** [3b2acc48a144](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3b2acc48a1443e7212b524b93852f5e679b0d80e)
**Data do autor:** `2026-05-18T12:00:49+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `cce09dcad32cffc1f6964dff95101c671eb777b1`
**Resumo:** feat(v2.0.0): expande a Academia — 16 linguagens + recursos de ajuda
**Corpo da mensagem:**

feat(v2.0.0): expande a Academia — 16 linguagens + recursos de ajuda

- adiciona C, SQL, Ruby, PHP, Lua e Bash (10 → 16 linguagens)
- nova seção "Onde Tirar Dúvidas e Estudar": 18 links externos
  agrupados em dúvidas, cursos grátis, documentação e prática

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 3
### Arquivos modificados

- `src/data/academia.js`
- `src/pages/academia.js`
- `src/styles/academia.css`

---

## Commit 56 — `fa6a5fcd2e5cf7513ec1f7464bfd00705d9a65a1`
**Link:** [fa6a5fcd2e5c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fa6a5fcd2e5cf7513ec1f7464bfd00705d9a65a1)
**Data do autor:** `2026-05-18T12:03:41+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3b2acc48a1443e7212b524b93852f5e679b0d80e`
**Resumo:** feat(v2.0.0): Logic Sim — BUFFER + portas de 3 entradas
**Corpo da mensagem:**

feat(v2.0.0): Logic Sim — BUFFER + portas de 3 entradas

- motor generalizado para N entradas (applyGate sobre vetor)
- novas portas: BUFFER, AND3, OR3, NAND3, NOR3, XOR3, XNOR3
- ports de entrada distribuídos uniformemente na lateral do componente

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/logic-sim.js`
- `src/utils/logic-sim-engine.js`

---

## Commit 57 — `4c74d58761170e1660f3fa29aff0b6893cb92a5c`
**Link:** [4c74d5876117](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4c74d58761170e1660f3fa29aff0b6893cb92a5c)
**Data do autor:** `2026-05-18T09:08:13-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c32bef4b22b3717040db475605955527ed38b53b fa6a5fcd2e5cf7513ec1f7464bfd00705d9a65a1`
**Resumo:** Merge v2.0.0 — Logic Sim, Morse, Memes, Academia, correções
**Corpo da mensagem:**

Merge v2.0.0 — Logic Sim, Morse, Memes, Academia, correções

Gerador de Código Morse, Arquivo de Memes 2016, Academia expandida (16 linguagens + links de ajuda), Logic Sim com BUFFER e portas de 3 entradas, FFT capta áudio do PC, e correções de Tabela Verdade / dados desatualizados.
**Arquivos afetados:** 0

---

## Commit 58 — `30d2a11319bb37c5f8c4b09ced6d6d458b25fcf6`
**Link:** [30d2a11319bb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/30d2a11319bb37c5f8c4b09ced6d6d458b25fcf6)
**Data do autor:** `2026-05-18T17:00:45+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `fa6a5fcd2e5cf7513ec1f7464bfd00705d9a65a1`
**Resumo:** feat(v2.0.0): Arsenal vira catálogo militar completo
**Corpo da mensagem:**

feat(v2.0.0): Arsenal vira catálogo militar completo

- 5 categorias novas: Artilharia, Defesa Aérea, Aeronaves, Naval,
  Drones/VANT — 68 entradas reais (251 itens em 15 categorias)
- ficha de detalhe flexível: campo `specs` opcional para itens que
  não se encaixam no grid calibre/alcance/peso (aeronaves, navios…)

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 2
### Arquivos modificados

- `src/data/arsenal.js`
- `src/pages/arsenal.js`

---

## Commit 59 — `dedaa212aad18c9c9f294abb9abed92691de8e8a`
**Link:** [dedaa212aad1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/dedaa212aad18c9c9f294abb9abed92691de8e8a)
**Data do autor:** `2026-05-18T17:04:09+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `30d2a11319bb37c5f8c4b09ced6d6d458b25fcf6`
**Resumo:** feat(v2.0.0): editor com edição estilo VS Code
**Corpo da mensagem:**

feat(v2.0.0): editor com edição estilo VS Code

- auto-fechamento de pares ()[]{}""''`` + wrap da seleção
- pula sobre o fechamento e backspace apaga par vazio
- Enter com auto-indentação (abre bloco entre chaves)
- Tab/Shift+Tab indenta/desindenta o bloco selecionado inteiro
- Ctrl+/ comenta · Alt+↑↓ move linha · Shift+Alt+↑↓ duplica

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 1
### Arquivos modificados

- `src/pages/editor.js`

---

## Commit 60 — `9878f816a3a727e1aeac3a508d65b1a5a8b1e4c1`
**Link:** [9878f816a3a7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9878f816a3a727e1aeac3a508d65b1a5a8b1e4c1)
**Data do autor:** `2026-05-18T17:10:51+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `dedaa212aad18c9c9f294abb9abed92691de8e8a`
**Resumo:** feat(v2.0.0): Enciclopédia de Lógica Digital (/portas)
**Corpo da mensagem:**

feat(v2.0.0): Enciclopédia de Lógica Digital (/portas)

- 8 portas fundamentais com símbolo SVG (forma ANSI/MIL), expressão
  booleana e tabela verdade
- 9 blocos construtivos: meio/somador completo, mux, demux, decoder,
  latch SR, flip-flops D/JK/T
- catálogo de 46 circuitos integrados das séries 7400 (TTL) e 4000 (CMOS)
- nota sobre universalidade NAND/NOR

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 8
### Arquivos criados

- `src/data/logic-circuits.js`
- `src/pages/portas.js`
- `src/styles/portas.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/perfil.js`

---

## Commit 61 — `87dab36aea6ba24ad431e012995dba651029a604`
**Link:** [87dab36aea6b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/87dab36aea6ba24ad431e012995dba651029a604)
**Data do autor:** `2026-05-18T17:13:12+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `9878f816a3a727e1aeac3a508d65b1a5a8b1e4c1`
**Resumo:** feat(v2.0.0): página de Robótica — currículo do básico ao avançado
**Corpo da mensagem:**

feat(v2.0.0): página de Robótica — currículo do básico ao avançado

12 módulos (história, anatomia, tipos, sensores, atuadores, eletrônica,
cinemática, controle PID, ROS, visão computacional, IA, ética) com rail
de navegação + painel de tópicos-chave.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 8
### Arquivos criados

- `src/data/robotica.js`
- `src/pages/robotica.js`
- `src/styles/robotica.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/perfil.js`

---

## Commit 62 — `a1a30ec1a640990965dc7e973a285dc82862dd52`
**Link:** [a1a30ec1a640](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a1a30ec1a640990965dc7e973a285dc82862dd52)
**Data do autor:** `2026-05-18T17:16:37+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `87dab36aea6ba24ad431e012995dba651029a604`
**Resumo:** feat(v2.0.0): aba de Cinema — catálogo de filmes do acervo
**Corpo da mensagem:**

feat(v2.0.0): aba de Cinema — catálogo de filmes do acervo

- /filmes: 20 filmes da pasta Drive com player modal embutido
  (drive.google.com/.../preview), busca e cartazes
- títulos identificados (Batman, Godzilla, Transformers, Ben 10…)
  catalogados; demais entram como "Vídeo do Acervo"

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 8
### Arquivos criados

- `src/data/filmes.js`
- `src/pages/filmes.js`
- `src/styles/filmes.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/perfil.js`

---

## Commit 63 — `b1434c917233d0005c7ea4b2d39603a4e77964f0`
**Link:** [b1434c917233](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b1434c917233d0005c7ea4b2d39603a4e77964f0)
**Data do autor:** `2026-05-18T18:40:04+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `a1a30ec1a640990965dc7e973a285dc82862dd52`
**Resumo:** docs(v2.0.0): reescreve o README para o estado atual
**Corpo da mensagem:**

docs(v2.0.0): reescreve o README para o estado atual

Atualiza o README para refletir as 36 rotas, o catálogo de
funcionalidades por seção, a arquitetura atual e o histórico v1.0.0 →
v2.0.0. Remove informações obsoletas da fase inicial.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 1
### Arquivos modificados

- `README.md`

---

## Commit 64 — `2c9c92e3102a602ea3888b1f1a61801a0c4f18c1`
**Link:** [2c9c92e3102a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2c9c92e3102a602ea3888b1f1a61801a0c4f18c1)
**Data do autor:** `2026-05-18T15:41:46-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4c74d58761170e1660f3fa29aff0b6893cb92a5c b1434c917233d0005c7ea4b2d39603a4e77964f0`
**Resumo:** Merge v2.0.0 (cont.) — Arsenal militar, editor VS Code, portas, robótica, cinema
**Corpo da mensagem:**

Merge v2.0.0 (cont.) — Arsenal militar, editor VS Code, portas, robótica, cinema

Arsenal como catálogo militar completo (251 itens, 15 categorias), editor com edição estilo VS Code, Enciclopédia de Lógica Digital, currículo de Robótica, Cinema do Baluarte e README reescrito.
**Arquivos afetados:** 0

---

## Commit 65 — `995b6af37684f047c4de22c395dc62167ee782e5`
**Link:** [995b6af37684](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/995b6af37684f047c4de22c395dc62167ee782e5)
**Data do autor:** `2026-05-18T18:44:20+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `b1434c917233d0005c7ea4b2d39603a4e77964f0`
**Resumo:** feat(v2.0.0): expande a CiberSeg — +20 técnicas (35 → 55 entradas)
**Corpo da mensagem:**

feat(v2.0.0): expande a CiberSeg — +20 técnicas (35 → 55 entradas)

Adiciona SSRF, path traversal, desserialização insegura, worm, botnet,
cryptojacking, DDoS, ARP/DNS spoofing, quebra de Wi-Fi, força bruta,
rainbow tables, WAF, IDS/IPS, Zero Trust, MFA, SIEM e mais.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 1
### Arquivos modificados

- `src/data/ciberseg.js`

---

## Commit 66 — `d5c743b7edad6735fa4ce36dc73049bfd45002d9`
**Link:** [d5c743b7edad](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d5c743b7edad6735fa4ce36dc73049bfd45002d9)
**Data do autor:** `2026-05-18T18:47:57+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `995b6af37684f047c4de22c395dc62167ee782e5`
**Resumo:** feat(v2.0.0): expande o Modpack — +18 mods de Minecraft
**Corpo da mensagem:**

feat(v2.0.0): expande o Modpack — +18 mods de Minecraft

Adiciona Powah!, Alex's Mobs, Epic Fight, Better Combat, Mowzie's
Mobs, Supplementaries, Sophisticated Backpacks, Embeddium, REI, FTB
Quests e mais, cobrindo todas as 9 categorias.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 1
### Arquivos modificados

- `src/data/modpack.js`

---

## Commit 67 — `f7ad95b59f59f45900504b59f61b76d7dc5c4d92`
**Link:** [f7ad95b59f59](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f7ad95b59f59f45900504b59f61b76d7dc5c4d92)
**Data do autor:** `2026-05-18T18:51:51+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d5c743b7edad6735fa4ce36dc73049bfd45002d9`
**Resumo:** feat(v2.0.0): expande o Universo — +5 mundos crossover
**Corpo da mensagem:**

feat(v2.0.0): expande o Universo — +5 mundos crossover

Adiciona Warhammer 40.000, Mobile Suit Gundam, Neon Genesis
Evangelion, Mass Effect e Cyberpunk (10 → 15 universos), cada um
ligado a uma equipe do Baluarte.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 1
### Arquivos modificados

- `src/data/universos.js`

---

## Commit 68 — `36c5aabf839c412172f8b40e2c72d89a53c63ff8`
**Link:** [36c5aabf839c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/36c5aabf839c412172f8b40e2c72d89a53c63ff8)
**Data do autor:** `2026-05-18T18:54:10-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2c9c92e3102a602ea3888b1f1a61801a0c4f18c1 f7ad95b59f59f45900504b59f61b76d7dc5c4d92`
**Resumo:** Merge v2.0.0 — Etapa 3: expansão de datasets (CiberSeg, Modpack, Universo)
**Corpo da mensagem:**

Merge v2.0.0 — Etapa 3: expansão de datasets (CiberSeg, Modpack, Universo)

Expansão de datasets: CiberSeg (35→55), Modpack (~78 mods) e Universo (10→15 mundos crossover).
**Arquivos afetados:** 0

---

## Commit 69 — `1c67c2f48ddcafb7dcdf9fb3bd185cdfe03d0c15`
**Link:** [1c67c2f48ddc](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1c67c2f48ddcafb7dcdf9fb3bd185cdfe03d0c15)
**Data do autor:** `2026-05-18T21:56:29+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `36c5aabf839c412172f8b40e2c72d89a53c63ff8`
**Resumo:** feat: JSON Studio — valida, formata e minifica JSON
**Corpo da mensagem:**

feat: JSON Studio — valida, formata e minifica JSON

Tira o JSON do roadmap e entrega como página real (/json-studio):
validação com erro em linha/coluna, formatação e minificação,
árvore navegável e estatísticas da estrutura.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 8
### Arquivos criados

- `src/pages/json-studio.js`
- `src/styles/json-studio.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`
- `src/pages/perfil.js`

---

## Commit 70 — `d6218f05bcdf15bddcbdc61b049e19e55d021c9b`
**Link:** [d6218f05bcdf](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d6218f05bcdf15bddcbdc61b049e19e55d021c9b)
**Data do autor:** `2026-05-18T21:58:56+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1c67c2f48ddcafb7dcdf9fb3bd185cdfe03d0c15`
**Resumo:** feat: esteganografia na CiberSeg + carreiras na Academia
**Corpo da mensagem:**

feat: esteganografia na CiberSeg + carreiras na Academia

- CiberSeg: entrada detalhada sobre esteganografia (LSB, metadados,
  concatenação de arquivos, phishing visual) e como se proteger
- Academia: seção "Programar Não É Só Código" com 14 carreiras de
  tecnologia e o quanto cada uma envolve (ou não) código

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 4
### Arquivos modificados

- `src/data/academia.js`
- `src/data/ciberseg.js`
- `src/pages/academia.js`
- `src/styles/academia.css`

---

## Commit 71 — `ee03ed48828b282e095eeb8a127d7d3435a4dce4`
**Link:** [ee03ed48828b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ee03ed48828b282e095eeb8a127d7d3435a4dce4)
**Data do autor:** `2026-05-18T18:59:38-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `36c5aabf839c412172f8b40e2c72d89a53c63ff8 d6218f05bcdf15bddcbdc61b049e19e55d021c9b`
**Resumo:** Merge — JSON Studio + esteganografia + carreiras de tecnologia
**Corpo da mensagem:**

Merge — JSON Studio + esteganografia + carreiras de tecnologia

JSON Studio (validação, formatação, minificação, árvore), entrada de esteganografia na CiberSeg e seção "Programar Não É Só Código" na Academia.
**Arquivos afetados:** 0

---

## Commit 72 — `4e2d5c7da507586c756737b50010d64c3e12a2ee`
**Link:** [4e2d5c7da507](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4e2d5c7da507586c756737b50010d64c3e12a2ee)
**Data do autor:** `2026-05-18T22:08:30+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `ee03ed48828b282e095eeb8a127d7d3435a4dce4`
**Resumo:** fix: cd do terminal não mudava de diretório
**Corpo da mensagem:**

fix: cd do terminal não mudava de diretório

Os comandos recebem uma cópia rasa do contexto ({ ...ctx, stdin }),
então o setCwd via `this.cwd = p` alterava a cópia descartável e a
mudança de diretório se perdia. Agora setCwd é uma arrow function que
fecha sobre o ctx real. Adiciona também o alias `dir` → `ls`.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 1
### Arquivos modificados

- `src/utils/terminal-engine.js`

---

## Commit 73 — `56aee476b4426147e5d70d22036c293c1de05cfe`
**Link:** [56aee476b442](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/56aee476b4426147e5d70d22036c293c1de05cfe)
**Data do autor:** `2026-05-18T19:08:50-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ee03ed48828b282e095eeb8a127d7d3435a4dce4 4e2d5c7da507586c756737b50010d64c3e12a2ee`
**Resumo:** Merge — fix: cd do terminal
**Corpo da mensagem:**

Merge — fix: cd do terminal

fix: cd do terminal não mudava de diretório
**Arquivos afetados:** 0

---

## Commit 74 — `326d8a4c3be7751ffc36641e216ee9397e544704`
**Link:** [326d8a4c3be7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/326d8a4c3be7751ffc36641e216ee9397e544704)
**Data do autor:** `2026-05-18T22:11:45+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `56aee476b4426147e5d70d22036c293c1de05cfe`
**Resumo:** feat: Rádio de Frequências (/radio)
**Corpo da mensagem:**

feat: Rádio de Frequências (/radio)

Receptor de rádio sintetizado via Web Audio — 100% offline. Dial
percorre a banda 87.5–108 MHz: estática entre estações, sinal trava
ao sintonizar uma das 7 estações (tom, acorde, sweep, baliza Morse).
Visor com medidor de sinal, volume e atalhos para cada estação.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 7
### Arquivos criados

- `src/pages/radio.js`
- `src/styles/radio.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/perfil.js`

---

## Commit 75 — `51bbd091ed3258375d67b118e6bd5d4c4207ea94`
**Link:** [51bbd091ed32](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/51bbd091ed3258375d67b118e6bd5d4c4207ea94)
**Data do autor:** `2026-05-18T19:12:08-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `56aee476b4426147e5d70d22036c293c1de05cfe 326d8a4c3be7751ffc36641e216ee9397e544704`
**Resumo:** Merge — feat: Rádio de Frequências
**Corpo da mensagem:**

Merge — feat: Rádio de Frequências

feat: Rádio de Frequências
**Arquivos afetados:** 0

---

## Commit 76 — `238e3744ac9b4c5c9f858988c80678ffc6807016`
**Link:** [238e3744ac9b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/238e3744ac9b4c5c9f858988c80678ffc6807016)
**Data do autor:** `2026-05-18T22:24:18+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `51bbd091ed3258375d67b118e6bd5d4c4207ea94`
**Resumo:** feat: QR Code Studio com codificador próprio
**Corpo da mensagem:**

feat: QR Code Studio com codificador próprio

Tira o QR Code Studio do roadmap. Codificador de QR implementado do
zero (src/utils/qr-encoder.js): campo de Galois GF(256), correção de
erro Reed-Solomon, modo byte UTF-8, nível L, versões 1-4, máscara 0.
Verificado estruturalmente. A página gera o QR em Canvas, ajusta o
tamanho e exporta PNG.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 9
### Arquivos criados

- `src/pages/qr-studio.js`
- `src/styles/qr-studio.css`
- `src/utils/qr-encoder.js`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`
- `src/pages/perfil.js`

---

## Commit 77 — `a7764f2e587cf6302de1550f414569b1efeb77cc`
**Link:** [a7764f2e587c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a7764f2e587cf6302de1550f414569b1efeb77cc)
**Data do autor:** `2026-05-18T19:24:40-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `51bbd091ed3258375d67b118e6bd5d4c4207ea94 238e3744ac9b4c5c9f858988c80678ffc6807016`
**Resumo:** Merge — feat: QR Code Studio com codificador próprio
**Corpo da mensagem:**

Merge — feat: QR Code Studio com codificador próprio

feat: QR Code Studio com codificador próprio
**Arquivos afetados:** 0

---

## Commit 78 — `2acdd4cc91b3118b7bbba8986512a3629a65fd2e`
**Link:** [2acdd4cc91b3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2acdd4cc91b3118b7bbba8986512a3629a65fd2e)
**Data do autor:** `2026-05-19T03:00:16+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `a7764f2e587cf6302de1550f414569b1efeb77cc`
**Resumo:** feat: aba de Música (/musicas)
**Corpo da mensagem:**

feat: aba de Música (/musicas)

Central de Música com a faixa em destaque do Lucas em loop infinito
(via IFrame API do Spotify — reinicia perto do fim) + a playlist do
Spotify embutida. Fallback para embed simples se a API não carregar.

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 7
### Arquivos criados

- `src/pages/musicas.js`
- `src/styles/musicas.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/perfil.js`

---

## Commit 79 — `b3f58836a8eb891823d767aa7141b0f85f217fbd`
**Link:** [b3f58836a8eb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b3f58836a8eb891823d767aa7141b0f85f217fbd)
**Data do autor:** `2026-05-19T00:00:38-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `a7764f2e587cf6302de1550f414569b1efeb77cc 2acdd4cc91b3118b7bbba8986512a3629a65fd2e`
**Resumo:** Merge — feat: aba de Música (faixa em loop + playlist)
**Corpo da mensagem:**

Merge — feat: aba de Música (faixa em loop + playlist)

feat: aba de Música com faixa em loop + playlist
**Arquivos afetados:** 0

---

## Commit 80 — `eb8673d27d55011ad26822ea0d3bb5c4c835b934`
**Link:** [eb8673d27d55](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/eb8673d27d55011ad26822ea0d3bb5c4c835b934)
**Data do autor:** `2026-05-19T03:08:55+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `b3f58836a8eb891823d767aa7141b0f85f217fbd`
**Resumo:** feat: Git Helper — cheatsheet de comandos + .gitignore
**Corpo da mensagem:**

feat: Git Helper — cheatsheet de comandos + .gitignore

Tira mais um item do roadmap. Página /git-helper: 27 comandos Git
essenciais agrupados em 6 categorias (clique copia) e 3 modelos de
.gitignore (Node, Python, sistema/editores).

https://claude.ai/code/session_01GE5Bun5kuF9GQKCMoFnVQz
**Arquivos afetados:** 9
### Arquivos criados

- `src/data/git-helper.js`
- `src/pages/git-helper.js`
- `src/styles/git-helper.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`
- `src/pages/perfil.js`

---

## Commit 81 — `bad5f98ab6048b9796fed2ad0246ba98e3e9b327`
**Link:** [bad5f98ab604](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bad5f98ab6048b9796fed2ad0246ba98e3e9b327)
**Data do autor:** `2026-05-19T00:09:20-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b3f58836a8eb891823d767aa7141b0f85f217fbd eb8673d27d55011ad26822ea0d3bb5c4c835b934`
**Resumo:** Merge — feat: Git Helper (cheatsheet + .gitignore)
**Corpo da mensagem:**

Merge — feat: Git Helper (cheatsheet + .gitignore)

feat: Git Helper — cheatsheet de comandos Git + .gitignore
**Arquivos afetados:** 0

---

## Commit 82 — `730d7f8b63a742c81f6d837374e8a4ad5042700e`
**Link:** [730d7f8b63a7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/730d7f8b63a742c81f6d837374e8a4ad5042700e)
**Data do autor:** `2026-05-19T03:36:12+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `bad5f98ab6048b9796fed2ad0246ba98e3e9b327`
**Resumo:** feat: Rádio — modo Online com estações reais (Radio Browser API)
**Corpo da mensagem:**

feat: Rádio — modo Online com estações reais (Radio Browser API)

Adiciona um alternador Sintetizador/Online em /radio. O modo Online
busca estações de rádio reais na Radio Browser API (por nome, país e
gênero) e toca o stream num elemento <audio>, tratando streams fora
do ar e o bloqueio de mixed content (HTTP em site HTTPS).

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 3
### Arquivos criados

- `src/utils/radio-api.js`
### Arquivos modificados

- `src/pages/radio.js`
- `src/styles/radio.css`

---

## Commit 83 — `68bc62da1518446c5c587078c02e6e45e5edc641`
**Link:** [68bc62da1518](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/68bc62da1518446c5c587078c02e6e45e5edc641)
**Data do autor:** `2026-05-19T03:57:16+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `730d7f8b63a742c81f6d837374e8a4ad5042700e`
**Resumo:** feat: Hub de Ferramentas — 8 ferramentas novas + selo NOVO
**Corpo da mensagem:**

feat: Hub de Ferramentas — 8 ferramentas novas + selo NOVO

Adiciona ao catálogo as páginas-ferramenta que faltavam: Rádio, Logic
Sim, Lógica Digital, CiberSeg, Academia, Robótica, Música e Cinema
(38 → 46 ferramentas). Cada uma ganha um selo "NOVO" para destacar as
adições recentes. Corrige o JSON Studio, que aparecia como ROADMAP
mesmo já entregue na v2.0.0.

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/ferramentas.js`
- `src/styles/layout.css`

---

## Commit 84 — `2bef2ef5d344fe9f9c4aa2f79007e5a365a053e0`
**Link:** [2bef2ef5d344](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2bef2ef5d344fe9f9c4aa2f79007e5a365a053e0)
**Data do autor:** `2026-05-19T01:10:19-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `bad5f98ab6048b9796fed2ad0246ba98e3e9b327 68bc62da1518446c5c587078c02e6e45e5edc641`
**Resumo:** Merge — próximos passos: Rádio Online + Hub de Ferramentas
**Corpo da mensagem:**

Merge — próximos passos: Rádio Online + Hub de Ferramentas

Item 1 da punch-list (Rádio modo Online via Radio Browser API) e expansão do Hub de Ferramentas (38 → 46 ferramentas, selo NOVO).
**Arquivos afetados:** 0

---

## Commit 85 — `7849a53226f5bc3f77c6fe00b9d7e0d8be0e3999`
**Link:** [7849a53226f5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7849a53226f5bc3f77c6fe00b9d7e0d8be0e3999)
**Data do autor:** `2026-05-19T08:03:17+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `2bef2ef5d344fe9f9c4aa2f79007e5a365a053e0`
**Resumo:** feat: QR Code Studio — leitura por câmera, modelos e versões maiores
**Corpo da mensagem:**

feat: QR Code Studio — leitura por câmera, modelos e versões maiores

Item 2 da punch-list. O /qr-studio ganha um modo Ler, que lê QR Codes
pela câmera via BarcodeDetector (com aviso se o navegador não tiver a
API), e modelos de Wi-Fi, vCard e e-mail no modo Gerar. O codificador
agora faz interleaving multi-bloco e suporta versões 1–6 (capacidade
~134 bytes, antes ~78). Validado com round-trip de decodificação.

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 4
### Arquivos modificados

- `src/pages/ferramentas.js`
- `src/pages/qr-studio.js`
- `src/styles/qr-studio.css`
- `src/utils/qr-encoder.js`

---

## Commit 86 — `7e32dea74c573b82a47c95c329b9664bcee12d9c`
**Link:** [7e32dea74c57](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7e32dea74c573b82a47c95c329b9664bcee12d9c)
**Data do autor:** `2026-05-19T08:10:42+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `7849a53226f5bc3f77c6fe00b9d7e0d8be0e3999`
**Resumo:** feat: Editor — painel Find & Replace (Ctrl+F / Ctrl+H)
**Corpo da mensagem:**

feat: Editor — painel Find & Replace (Ctrl+F / Ctrl+H)

Item 3 da punch-list. O /editor ganha um painel de busca e
substituição: localizar com contador de ocorrências, navegar
anterior/próximo, diferenciar maiúsculas, substituir a ocorrência
atual ou todas. Abre com Ctrl+F (localizar) e Ctrl+H (substituir),
fecha com Esc.

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 3
### Arquivos modificados

- `src/pages/editor.js`
- `src/pages/ferramentas.js`
- `src/styles/editor.css`

---

## Commit 87 — `c72b4f498244d961629b5f98b78aefc3d55826db`
**Link:** [c72b4f498244](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c72b4f498244d961629b5f98b78aefc3d55826db)
**Data do autor:** `2026-05-19T08:16:49+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `7e32dea74c573b82a47c95c329b9664bcee12d9c`
**Resumo:** fix: Terminal — auditoria de comandos + aliases estilo PowerShell
**Corpo da mensagem:**

fix: Terminal — auditoria de comandos + aliases estilo PowerShell

Item 4 da punch-list. Correções: comandos encadeados por ';' agora
saem em linhas separadas (antes concatenavam — 'echo a; echo b' dava
'ab'); 'head -n 0' / 'tail -n 0' respeitam o zero em vez de cair no
padrão 10; remove a função morta splitByOperator; limpa o ternário
sem efeito do echo. Adiciona aliases estilo PowerShell (dir, gci, gc,
sl, gl, copy, move, del, ren, sls, gps, write…).

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 3
### Arquivos modificados

- `src/data/terminal-commands.js`
- `src/pages/ferramentas.js`
- `src/utils/terminal-engine.js`

---

## Commit 88 — `b1bdd922c42daf4ed4de844503a6d38c1466254d`
**Link:** [b1bdd922c42d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b1bdd922c42daf4ed4de844503a6d38c1466254d)
**Data do autor:** `2026-05-19T05:19:45-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2bef2ef5d344fe9f9c4aa2f79007e5a365a053e0 c72b4f498244d961629b5f98b78aefc3d55826db`
**Resumo:** Merge — próximos passos: QR Studio, Find & Replace, auditoria do Terminal
**Corpo da mensagem:**

Merge — próximos passos: QR Studio, Find & Replace, auditoria do Terminal

Itens 2, 3 e 4 da punch-list: QR Code Studio (câmera + modelos + versões maiores), Find & Replace no Editor e auditoria do Terminal com aliases PowerShell.
**Arquivos afetados:** 0

---

## Commit 89 — `7e37c213b15baa9b0d1be47c96067ff79c1e4628`
**Link:** [7e37c213b15b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7e37c213b15baa9b0d1be47c96067ff79c1e4628)
**Data do autor:** `2026-05-19T08:32:35+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `b1bdd922c42daf4ed4de844503a6d38c1466254d`
**Resumo:** feat: Logic Sim — flip-flops D/JK/T e salvar/abrir circuitos
**Corpo da mensagem:**

feat: Logic Sim — flip-flops D/JK/T e salvar/abrir circuitos

Item 5 da punch-list. O motor agora suporta componentes com várias
saídas e lógica sequencial: flip-flops D, JK e T disparados na borda
de subida do clock (Q e Q̄). simulate() estabiliza o combinacional,
atualiza os flip-flops nas bordas e re-propaga. Os fios passaram a
guardar a porta de saída de origem (fromPort). Adiciona UI de salvar
e reabrir circuitos no localStorage e um exemplo de D flip-flop.
Validado com 17 testes do motor (set/reset/toggle/hold).

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 4
### Arquivos modificados

- `src/pages/ferramentas.js`
- `src/pages/logic-sim.js`
- `src/styles/logic-sim.css`
- `src/utils/logic-sim-engine.js`

---

## Commit 90 — `d623b5e9400daef3b2974c9dfd834367826b0c94`
**Link:** [d623b5e9400d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d623b5e9400daef3b2974c9dfd834367826b0c94)
**Data do autor:** `2026-05-19T08:39:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `7e37c213b15baa9b0d1be47c96067ff79c1e4628`
**Resumo:** feat: Color Studio — conversor de cores, paletas, gradiente e contraste
**Corpo da mensagem:**

feat: Color Studio — conversor de cores, paletas, gradiente e contraste

Item 6 da punch-list — última ferramenta do roadmap sem página. Nova
rota /color-studio: conversor HEX/RGB/HSL/OKLCH, gerador de paletas
(tons e harmonias), construtor de gradiente com CSS pronto e
verificador de contraste WCAG (AA/AAA). O card 'colorpicker' do Hub
sai de ROADMAP para PRONTO. Site vai de 41 para 42 rotas.

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 8
### Arquivos criados

- `src/pages/color-studio.js`
- `src/styles/color-studio.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`
- `src/pages/perfil.js`

---

## Commit 91 — `9948f6d9578a396a262578241d8659dc6d083616`
**Link:** [9948f6d9578a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9948f6d9578a396a262578241d8659dc6d083616)
**Data do autor:** `2026-05-19T08:42:18+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d623b5e9400daef3b2974c9dfd834367826b0c94`
**Resumo:** perf: code-splitting do bundle com manualChunks (datasets + páginas)
**Corpo da mensagem:**

perf: code-splitting do bundle com manualChunks (datasets + páginas)

Item 7 da punch-list. Separa src/data e src/pages em chunks próprios.
O JS deixa de ser um arquivo único de ~590 KB e vira três (núcleo
~11 KB, data ~228 KB, pages ~371 KB), todos abaixo do limite de
500 KB — o aviso de chunk grande some, o download fica paralelo e o
cache mais granular.

https://claude.ai/code/session_01G4P3tZ9WT3QXyfDNDp1XiW
**Arquivos afetados:** 1
### Arquivos modificados

- `vite.config.js`

---

## Commit 92 — `f53654d6ffada045e1f6c76fb24c768096b8cb81`
**Link:** [f53654d6ffad](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f53654d6ffada045e1f6c76fb24c768096b8cb81)
**Data do autor:** `2026-05-23T14:10:31-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b1bdd922c42daf4ed4de844503a6d38c1466254d 9948f6d9578a396a262578241d8659dc6d083616`
**Resumo:** Merge — próximos passos: Logic Sim flip-flops, Color Studio, code-splitting
**Corpo da mensagem:**

Merge — próximos passos: Logic Sim flip-flops, Color Studio, code-splitting

Itens 5, 6 e 7 da punch-list: flip-flops D/JK/T no Logic Sim, página Color Studio e code-splitting do bundle. Punch-list do PROXIMOS-PASSOS.md concluída.
**Arquivos afetados:** 0

---

## Commit 93 — `1312dccde0a492ed348f5397a78b28fcdd913faa`
**Link:** [1312dccde0a4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1312dccde0a492ed348f5397a78b28fcdd913faa)
**Data do autor:** `2026-05-23T22:16:50+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `f53654d6ffada045e1f6c76fb24c768096b8cb81`
**Resumo:** feat: Esteganografia — esconde/revela texto em imagens (LSB) com AES opcional
**Corpo da mensagem:**

feat: Esteganografia — esconde/revela texto em imagens (LSB) com AES opcional

Nova ferramenta do Hub (categoria Criptografia), seguindo o doc 09 do plano
da IA Baluarte — a peça independente que pode entrar antes da IA. Esconde texto
no bit menos significativo (LSB) dos canais RGB via Canvas, 100% no navegador, e
exporta PNG sem perda. Senha opcional cifra a mensagem com AES-256 (reaproveita
a engine de /cripto) antes de escondê-la. Inclui detecção de "sem mensagem",
checagem de capacidade e avisos sobre JPEG/redes sociais.

Rota /esteganografia registrada; entradas na sidebar, no Hub e no título da página.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 8
### Arquivos criados

- `src/pages/esteganografia.js`
- `src/styles/esteganografia.css`
### Arquivos modificados

- `README.md`
- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`

---

## Commit 94 — `eae1876ef5aac7e3ffcce79caf36bbe406331afe`
**Link:** [eae1876ef5aa](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/eae1876ef5aac7e3ffcce79caf36bbe406331afe)
**Data do autor:** `2026-05-24T03:11:32+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1312dccde0a492ed348f5397a78b28fcdd913faa`
**Resumo:** feat: J.A.R.V.I.S. — modo Navegador (WebLLM), IA real 100% no cliente
**Corpo da mensagem:**

feat: J.A.R.V.I.S. — modo Navegador (WebLLM), IA real 100% no cliente

Adiciona o 5º modo do J.A.R.V.I.S. seguindo os docs 02/03 do plano da IA
Baluarte: um LLM real rodando no navegador via WebLLM (WebGPU), sem servidor e
sem API key, offline após o 1º download do modelo. É o "núcleo Mark XIII" que o
Lucas marcou como caminho preferido (sem API externa).

- src/utils/jarvis-webllm.js: motor com import dinâmico lazy do WebLLM (CDN
  esm.run — fora do bundle), streaming token-a-token, callback de progresso do
  download e checagem de WebGPU. 3 modelos (Phi-3 mini, Qwen2.5-Coder, Llama-3-8B).
- jarvis.js: modo "Navegador" no seletor, envio com streaming (bolha que cresce)
  e progresso de carga do modelo, painel de config com escolha de modelo.
- jarvis-engine.js: default webllmModel. README e card do Hub atualizados (5 modos).

A memória/"apagar" reaproveita as sessões em IndexedDB já existentes.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 5
### Arquivos criados

- `src/utils/jarvis-webllm.js`
### Arquivos modificados

- `README.md`
- `src/pages/ferramentas.js`
- `src/pages/jarvis.js`
- `src/utils/jarvis-engine.js`

---

## Commit 95 — `3cefa4a98ca3c1795cf90aebaaa687844aef33b9`
**Link:** [3cefa4a98ca3](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3cefa4a98ca3c1795cf90aebaaa687844aef33b9)
**Data do autor:** `2026-05-24T03:22:31+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `eae1876ef5aac7e3ffcce79caf36bbe406331afe`
**Resumo:** feat: J.A.R.V.I.S. — respostas com código realçado e perfil engenheiro (doc 05)
**Corpo da mensagem:**

feat: J.A.R.V.I.S. — respostas com código realçado e perfil engenheiro (doc 05)

Evolui o chat para criador de código, seguindo o doc 05 do plano da IA Baluarte:

- Respostas do J.A.R.V.I.S. agora renderizam blocos markdown (```lang) como
  código com realce de sintaxe, reaproveitando o highlighter do site
  (syntax-highlight.js + editor-langs.js) em vez de uma lib nova. Cada bloco tem
  botão "Copiar". highlight() escapa o HTML antes de colorir (seguro p/ saída da IA).
- Novo seletor "Perfil da IA": Tático (conversa) ou Engenheiro de código, que
  troca o system prompt para um de engenheiro de software sênior (estilo Baluarte:
  JS puro, sem framework/TS).
- Combina com o modelo de código Qwen2.5-Coder já disponível no modo Navegador.

O streaming do WebLLM continua em texto puro e re-renderiza com realce ao concluir.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/jarvis.js`
- `src/styles/fase19.css`

---

## Commit 96 — `eda6869b9a93d4463799fe554dbdd654eaaf5663`
**Link:** [eda6869b9a93](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/eda6869b9a93d4463799fe554dbdd654eaaf5663)
**Data do autor:** `2026-05-24T04:54:24-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f53654d6ffada045e1f6c76fb24c768096b8cb81`
**Resumo:** Delete Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).md
**Arquivos afetados:** 1
### Arquivos removidos

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).md`

---

## Commit 97 — `46c6d7a8f5d06af4f21e86d3eeadd35d4f103e46`
**Link:** [46c6d7a8f5d0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/46c6d7a8f5d06af4f21e86d3eeadd35d4f103e46)
**Data do autor:** `2026-05-24T04:54:31-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `eda6869b9a93d4463799fe554dbdd654eaaf5663`
**Resumo:** Delete Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).pdf
**Arquivos afetados:** 1
### Arquivos removidos

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).pdf`

---

## Commit 98 — `4ee8833b4e963811712d4c9703c22dbf0f975855`
**Link:** [4ee8833b4e96](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4ee8833b4e963811712d4c9703c22dbf0f975855)
**Data do autor:** `2026-05-24T04:55:39-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `46c6d7a8f5d06af4f21e86d3eeadd35d4f103e46`
**Resumo:** Add files via upload
**Arquivos afetados:** 2
### Arquivos criados

- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).md`
- `Crônicas da Baluarte_ Onde os Deuses Sangram (continuação 3).pdf`

---

## Commit 99 — `23a3b52e62ce8d6a61393c938a210b4494d1e989`
**Link:** [23a3b52e62ce](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/23a3b52e62ce8d6a61393c938a210b4494d1e989)
**Data do autor:** `2026-05-24T08:14:36+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3cefa4a98ca3c1795cf90aebaaa687844aef33b9`
**Resumo:** feat: J.A.R.V.I.S. — estado global de leitura + tool de estado (docs 06/07)
**Corpo da mensagem:**

feat: J.A.R.V.I.S. — estado global de leitura + tool de estado (docs 06/07)

Fecha o ciclo "a IA lê o estado e age via ferramentas":

- src/utils/baluarte-status.js: estado global de leitura (window.BaluarteStatus).
  Cada função publica um resumo (setStatus); a IA lê só um snapshot em texto —
  nunca escreve. Inclui funcaoAtual (rota ativa, ligada no shell).
- jarvis.js: injeta o snapshot do estado como contexto oculto (somente leitura)
  no systemPrompt de cada chamada aos modos de IA (Navegador/Claude/Ollama/Agente),
  sem persistir.
- jarvis-tools.js: nova ferramenta read_site_state para o agente consultar o
  estado vivo sob demanda; system_status agora usa a VERSION real.
- editor.js e color-studio.js publicam seus resumos (linguagem/linhas/chars;
  cor atual/contraste) — exemplos do padrão, fácil de expandir às demais funções.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 6
### Arquivos criados

- `src/utils/baluarte-status.js`
### Arquivos modificados

- `src/layout/shell.js`
- `src/pages/color-studio.js`
- `src/pages/editor.js`
- `src/pages/jarvis.js`
- `src/utils/jarvis-tools.js`

---

## Commit 100 — `275cd56ec6a2f1968446f6a373fba767dc7a7419`
**Link:** [275cd56ec6a2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/275cd56ec6a2f1968446f6a373fba767dc7a7419)
**Data do autor:** `2026-05-24T08:19:04+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `23a3b52e62ce8d6a61393c938a210b4494d1e989`
**Resumo:** feat: J.A.R.V.I.S. — catálogo central de ferramentas + controle (doc 06)
**Corpo da mensagem:**

feat: J.A.R.V.I.S. — catálogo central de ferramentas + controle (doc 06)

- jarvis-tools.js vira um catálogo central extensível: além dos built-ins,
  registerTool() permite que outras partes do site registrem ferramentas em
  runtime, que ficam automaticamente disponíveis ao agente via getToolSchemas().
- Nova ferramenta de CONTROLE set_color: define a cor ativa do Color Studio e
  abre a ferramenta (mesmo padrão seguro de open_editor — storage + navigate).
- jarvis-engine: o modo agente passa a montar tools via getToolSchemas(), então
  ferramentas registradas dinamicamente entram sem editar o engine.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/utils/jarvis-engine.js`
- `src/utils/jarvis-tools.js`

---

## Commit 101 — `3e2967dc957ff19e7e214a044d9a17b67c002014`
**Link:** [3e2967dc957f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3e2967dc957ff19e7e214a044d9a17b67c002014)
**Data do autor:** `2026-05-24T08:19:51+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `275cd56ec6a2f1968446f6a373fba767dc7a7419`
**Resumo:** feat: J.A.R.V.I.S. — perfil "Núcleo" com raciocínio em 3 camadas (doc 08)
**Corpo da mensagem:**

feat: J.A.R.V.I.S. — perfil "Núcleo" com raciocínio em 3 camadas (doc 08)

Adiciona o 3º perfil de IA com o system prompt do doc 08: decisão em camadas
(1) site/estado/ferramentas → (2) busca web → (3) dedução lógica, com formato
de hipótese baseada em evidências e proibição de alucinar.

Camadas 1 e 3 ficam completas no stack atual (estado de leitura + ferramentas do
agente + prompt). A camada 2 (busca web real) depende do backend Python/Gemini
(plano B, doc 04) — o prompt instrui a declarar indisponibilidade quando não houver.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/pages/jarvis.js`

---

## Commit 102 — `77360d2668f459a8cfe224d91f77bea97a6afb8e`
**Link:** [77360d2668f4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/77360d2668f459a8cfe224d91f77bea97a6afb8e)
**Data do autor:** `2026-05-24T08:24:56+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3e2967dc957ff19e7e214a044d9a17b67c002014`
**Resumo:** feat: estado de leitura expandido — Logic Sim, Tabela Verdade, Terminal (doc 07)
**Corpo da mensagem:**

feat: estado de leitura expandido — Logic Sim, Tabela Verdade, Terminal (doc 07)

Mais funções publicam seu resumo em window.BaluarteStatus para a IA ler:
- Logic Sim: nº de componentes e fios (no choke point save()).
- Tabela Verdade: expressão atual (em refresh()).
- Terminal: diretório atual e último comando (em runLine()).

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos modificados

- `src/pages/logic-sim.js`
- `src/pages/tabela-verdade.js`
- `src/pages/terminal.js`

---

## Commit 103 — `b915ec79e87b38b4af00afcdd8f2992c6ee0f405`
**Link:** [b915ec79e87b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b915ec79e87b38b4af00afcdd8f2992c6ee0f405)
**Data do autor:** `2026-05-24T08:28:33+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `77360d2668f459a8cfe224d91f77bea97a6afb8e`
**Resumo:** feat: backend Python opcional (Gemini + busca web) + modo Servidor (doc 04)
**Corpo da mensagem:**

feat: backend Python opcional (Gemini + busca web) + modo Servidor (doc 04)

Realiza o "plano B" do doc 04 e completa a camada 2 (busca web) do doc 08,
de forma ADITIVA — sem reescrever o site:

- backend/ (server.py FastAPI + Gemini com Google Search, stateless; +
  requirements.txt + README). Não entra no build estático (Vite só empacota
  src/ + public/); roda à parte e o site fala por URL configurável.
- J.A.R.V.I.S. ganha o 6º modo "Servidor": processServer() chama o backend
  (mesmo padrão do Ollama). Config com URL do servidor e instruções.
- Atualiza textos para 6 modos (página, Hub, README).

O modo Servidor é o único com busca web real; os demais (Navegador/WebLLM,
Ollama) seguem 100% locais/cliente. A chave Gemini fica só no servidor.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 7
### Arquivos criados

- `backend/README.md`
- `backend/requirements.txt`
- `backend/server.py`
### Arquivos modificados

- `README.md`
- `src/pages/ferramentas.js`
- `src/pages/jarvis.js`
- `src/utils/jarvis-engine.js`

---

## Commit 104 — `4636d89b817946c68a2f6aa7b9ab00521810cd73`
**Link:** [4636d89b8179](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4636d89b817946c68a2f6aa7b9ab00521810cd73)
**Data do autor:** `2026-05-24T13:48:07+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `b915ec79e87b38b4af00afcdd8f2992c6ee0f405`
**Resumo:** chore: ignora artefatos Python do backend (__pycache__, *.pyc)
**Corpo da mensagem:**

chore: ignora artefatos Python do backend (__pycache__, *.pyc)

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `.gitignore`

---

## Commit 105 — `557cbfeb445d4a8666ae79060735309d155ceafe`
**Link:** [557cbfeb445d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/557cbfeb445d4a8666ae79060735309d155ceafe)
**Data do autor:** `2026-05-24T14:31:49+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `4636d89b817946c68a2f6aa7b9ab00521810cd73`
**Resumo:** feat: estado de leitura — Regex, QR Studio e Calc Numérica (doc 07)
**Corpo da mensagem:**

feat: estado de leitura — Regex, QR Studio e Calc Numérica (doc 07)

Mais funções publicam resumo em window.BaluarteStatus para a IA ler:
- Regex: padrão e flags atuais (em render()).
- QR Studio: modo ativo gerar/ler (em setMode()).
- Calc Numérica: valor e largura de bits (em refreshDisplays()).

Cobertura do estado sobe para 8 funções (rumo às "20+" do doc 07).

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos modificados

- `src/pages/calc-numerica.js`
- `src/pages/qr-studio.js`
- `src/pages/regex.js`

---

## Commit 106 — `d09349d0a55aa79c72e521a46ce0db05158f7cd6`
**Link:** [d09349d0a55a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d09349d0a55aa79c72e521a46ce0db05158f7cd6)
**Data do autor:** `2026-05-24T14:35:31+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `557cbfeb445d4a8666ae79060735309d155ceafe`
**Resumo:** feat: estado de leitura — Cripto, JSON Studio, Morse, Símbolos (doc 07)
**Corpo da mensagem:**

feat: estado de leitura — Cripto, JSON Studio, Morse, Símbolos (doc 07)

Mais 4 funções publicam resumo em window.BaluarteStatus:
- Cripto: cifra ativa (setActive).
- JSON Studio: tamanho do conteúdo (revalidate; import com alias para não
  colidir com o setStatus local do painel).
- Morse: modo (codificar/decodificar) e nº de caracteres (render).
- Símbolos: categoria e busca atuais (render).

Cobertura sobe para 12 funções publicando estado para a IA ler.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 4
### Arquivos modificados

- `src/pages/cripto/index.js`
- `src/pages/json-studio.js`
- `src/pages/morse.js`
- `src/pages/simbolos.js`

---

## Commit 107 — `f23222a01bbce9140872d0dda387e0f79070a57d`
**Link:** [f23222a01bbc](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f23222a01bbce9140872d0dda387e0f79070a57d)
**Data do autor:** `2026-05-24T14:42:11+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `d09349d0a55aa79c72e521a46ce0db05158f7cd6`
**Resumo:** feat: estado de leitura — FFT e Esteganografia (doc 07)
**Corpo da mensagem:**

feat: estado de leitura — FFT e Esteganografia (doc 07)

- FFT: modo visual + fonte de áudio ativa (getSourceType) ao trocar de modo.
- Esteganografia: dimensões da imagem portadora ao carregá-la.

Fecha a cobertura nas telas com estado real: 14 funções publicam em
window.BaluarteStatus. As demais rotas são conteúdo/referência estáticos.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/esteganografia.js`
- `src/pages/fft.js`

---

## Commit 108 — `e861c8decc9df0b1d071ce54e58926407e1b5c66`
**Link:** [e861c8decc9d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e861c8decc9df0b1d071ce54e58926407e1b5c66)
**Data do autor:** `2026-05-24T16:09:11-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4ee8833b4e963811712d4c9703c22dbf0f975855 f23222a01bbce9140872d0dda387e0f79070a57d`
**Resumo:** Merge — IA Baluarte: esteganografia + J.A.R.V.I.S. agente (6 modos) + backend (#46)
**Corpo da mensagem:**

Merge — IA Baluarte: esteganografia + J.A.R.V.I.S. agente (6 modos) + backend (#46)

Esteganografia (LSB+AES); J.A.R.V.I.S. com 6 modos (Local, Navegador/WebLLM, Claude, Ollama, Servidor/Gemini+web, Agente); criador de código (doc 05); estado de leitura em 14 funções (doc 07); catálogo de ferramentas + controle (doc 06); raciocínio em 3 camadas (doc 08); backend Python opcional (doc 04). Plano docs/ia-baluarte/ implementado.
**Arquivos afetados:** 0

---

## Commit 109 — `47150cc3ed15e57360e7e7f052fcabc533b7b703`
**Link:** [47150cc3ed15](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/47150cc3ed15e57360e7e7f052fcabc533b7b703)
**Data do autor:** `2026-05-24T19:24:51+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `e861c8decc9df0b1d071ce54e58926407e1b5c66`
**Resumo:** fix: J.A.R.V.I.S. mais robusto — timeouts, erros de setup acionáveis, teste de conexão
**Corpo da mensagem:**

fix: J.A.R.V.I.S. mais robusto — timeouts, erros de setup acionáveis, teste de conexão

Resolve o "⚠ Erro: Servidor da IA inacessível" virar uma parede:
- Timeout (AbortController) nas chamadas de Servidor e Ollama; mensagem clara
  ao estourar, em vez de travar.
- Erros de setup/conexão (servidor/ollama fora do ar, sem API key, sem WebGPU)
  agora são um aviso "⚙" acionável, com botão "↩ Responder agora no modo Local"
  (que sempre funciona) — não um "⚠ Erro" assustador.
- Botão "Testar conexão" na config do modo Servidor: checa /health e diz se a
  GEMINI_API_KEY está configurada.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/jarvis.js`
- `src/utils/jarvis-engine.js`

---

## Commit 110 — `bf85f154358030c8b6d0ab0f1849226b0d25bdc3`
**Link:** [bf85f1543580](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bf85f154358030c8b6d0ab0f1849226b0d25bdc3)
**Data do autor:** `2026-05-24T16:27:06-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `e861c8decc9df0b1d071ce54e58926407e1b5c66 47150cc3ed15e57360e7e7f052fcabc533b7b703`
**Resumo:** Merge — J.A.R.V.I.S. mais robusto: timeouts, erros acionáveis, teste de conexão (#47)
**Corpo da mensagem:**

Merge — J.A.R.V.I.S. mais robusto: timeouts, erros acionáveis, teste de conexão (#47)

Timeouts em Servidor/Ollama; erros de setup viram aviso acionável com fallback p/ modo Local; botão de testar conexão (item 3 do pedido).
**Arquivos afetados:** 0

---

## Commit 111 — `bd74daeaa720cf5c82e4e51eb9fd3b82bf6f65c1`
**Link:** [bd74daeaa720](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bd74daeaa720cf5c82e4e51eb9fd3b82bf6f65c1)
**Data do autor:** `2026-05-24T19:29:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `bf85f154358030c8b6d0ab0f1849226b0d25bdc3`
**Resumo:** feat: Biblioteca — leitura contínua da fan fic (item 2a)
**Corpo da mensagem:**

feat: Biblioteca — leitura contínua da fan fic (item 2a)

Melhora o leitor das Crônicas para leitura corrida da saga:
- Anterior/Próximo agora cruza para o arco vizinho ao chegar no fim/início de
  um arco (gotoAdjacentChapter), em vez de parar numa parede.
- Setas ← → do teclado trocam de capítulo (sem interferir em campos de texto).
- Ao trocar de capítulo, rola ao topo automaticamente.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/pages/biblioteca.js`

---

## Commit 112 — `702011a519f03a583fa197fae838fdff7bd6ba8f`
**Link:** [702011a519f0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/702011a519f03a583fa197fae838fdff7bd6ba8f)
**Data do autor:** `2026-05-24T19:31:41+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `bd74daeaa720cf5c82e4e51eb9fd3b82bf6f65c1`
**Resumo:** feat: J.A.R.V.I.S. — no erro de conexão, oferecer trocar para o modo Navegador
**Corpo da mensagem:**

feat: J.A.R.V.I.S. — no erro de conexão, oferecer trocar para o modo Navegador

Quando um modo que precisa de setup falha (Servidor/Ollama fora do ar), o aviso
agora traz um botão destacado "⬡ Usar modo Navegador (sem servidor)" que troca o
modo, recoloca a mensagem no campo e foca — além do "↩ Responder no modo Local".
O modo Navegador (WebLLM) roda a IA no próprio navegador, sem backend.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/pages/jarvis.js`

---

## Commit 113 — `83b98a72bc630bce5330e549ddf62ca91ef845b1`
**Link:** [83b98a72bc63](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/83b98a72bc630bce5330e549ddf62ca91ef845b1)
**Data do autor:** `2026-05-24T19:36:19+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `702011a519f03a583fa197fae838fdff7bd6ba8f`
**Resumo:** feat: Elites — exibe todos os integrantes de cada equipe (item 2b)
**Corpo da mensagem:**

feat: Elites — exibe todos os integrantes de cada equipe (item 2b)

Antes só apareciam líder + contagem. Agora a ficha da equipe lista TODOS os
membros (o pedido do Lucas: "todo mundo das equipes para as pessoas verem").

- scripts/gen-elites-rosters.mjs: parser best-effort que extrai os rosters do
  .md gigante das Equipes (segmenta por equipe, limpa markdown e descarta
  fragmentos de biografia/colunas de tabela/veículos). Repetível.
- src/data/elites-rosters.js: rosters gerados (ALFA, BRAVO, CHARLIE, DELTA,
  ECHO, FOXTROTT, GOLF, HOTEL, INDIA por enquanto — as demais mantêm líder+contagem).
- elites.js: nova seção "★ Integrantes (N)" com chips de nome no detalhe.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 4
### Arquivos criados

- `scripts/gen-elites-rosters.mjs`
- `src/data/elites-rosters.js`
### Arquivos modificados

- `src/pages/elites.js`
- `src/styles/elites.css`

---

## Commit 114 — `38075c498559b44ace600b3ee82d1d1527b9fadd`
**Link:** [38075c498559](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/38075c498559b44ace600b3ee82d1d1527b9fadd)
**Data do autor:** `2026-05-25T00:37:45+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `83b98a72bc630bce5330e549ddf62ca91ef845b1`
**Resumo:** feat: atualiza dados da fan fic — arco "O Despertar do Monarca" (item 1)
**Corpo da mensagem:**

feat: atualiza dados da fan fic — arco "O Despertar do Monarca" (item 1)

A continuação 3.md cresceu; o arco 24 do fanfic.json estava defasado.
- scripts/gen-fanfic-from-md.mjs: gerador que parseia um .md de continuação
  (H1=arco, H2=capítulo, H3=subtítulo, parágrafos) e regenera SÓ o arco de
  título correspondente no fanfic.json — arcos 1–23 ficam intactos.
- Arco "O Despertar do Monarca": 91 → 101 capítulos, com o conteúdo completo
  e limpo (sem markdown nos blocos). Atualização repetível.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos criados

- `scripts/gen-fanfic-from-md.mjs`
### Arquivos modificados

- `src/data/fanfic.json`

---

## Commit 115 — `0bada3c80940d832f828116d8ddd0a5d81ef424b`
**Link:** [0bada3c80940](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0bada3c80940d832f828116d8ddd0a5d81ef424b)
**Data do autor:** `2026-05-25T00:39:28+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `38075c498559b44ace600b3ee82d1d1527b9fadd`
**Resumo:** feat: Biblioteca — busca de capítulos + lista rolável
**Corpo da mensagem:**

feat: Biblioteca — busca de capítulos + lista rolável

Com arcos de 100+ capítulos (ex.: "O Despertar do Monarca"), a lista de
capítulos ficava enorme e inutilizável. Agora:
- Campo de busca (aparece quando há >10 capítulos) que filtra por número ou
  título, com contador "X de N".
- A lista de capítulos tem altura máxima e rola, em vez de ocupar a tela toda.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/biblioteca.js`
- `src/styles/biblioteca.css`

---

## Commit 116 — `3895999c658aa03846868bacf27f04c2db82c47a`
**Link:** [3895999c658a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3895999c658aa03846868bacf27f04c2db82c47a)
**Data do autor:** `2026-05-24T21:39:56-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `bf85f154358030c8b6d0ab0f1849226b0d25bdc3 0bada3c80940d832f828116d8ddd0a5d81ef424b`
**Resumo:** Merge — fan fic (dados + leitura/busca), Elites com integrantes, IA robusta (#48)
**Corpo da mensagem:**

Merge — fan fic (dados + leitura/busca), Elites com integrantes, IA robusta (#48)

Item 1 (fan fic: arco "O Despertar do Monarca" 91→101 caps); 2a (leitura contínua + busca de capítulos + lista rolável); 2b (Elites com todos os integrantes); reforço de robustez da IA (trocar p/ Navegador, timeouts, testar conexão).
**Arquivos afetados:** 0

---

## Commit 117 — `d5459450cac23a67732edc14aa8aef845a2f675a`
**Link:** [d5459450cac2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d5459450cac23a67732edc14aa8aef845a2f675a)
**Data do autor:** `2026-05-25T00:44:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3895999c658aa03846868bacf27f04c2db82c47a`
**Resumo:** fix: J.A.R.V.I.S. — explica mixed-content do modo Servidor e sempre oferece fallback
**Corpo da mensagem:**

fix: J.A.R.V.I.S. — explica mixed-content do modo Servidor e sempre oferece fallback

O modo Servidor não funciona no site publicado (HTTPS) chamando um backend
http:// local — o navegador bloqueia (mixed content). Agora:
- processServer detecta esse caso e dá uma mensagem clara (use o modo Navegador,
  ou rode o site localmente, ou hospede o backend com HTTPS).
- Qualquer falha em modo não-local mostra os botões "⬡ Usar modo Navegador
  (sem servidor)" e "↩ modo Local", não só os erros conhecidos.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/jarvis.js`
- `src/utils/jarvis-engine.js`

---

## Commit 118 — `6408c84e51f6e86fff3b95afc78622c32a12dd0a`
**Link:** [6408c84e51f6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6408c84e51f6e86fff3b95afc78622c32a12dd0a)
**Data do autor:** `2026-05-24T21:45:28-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `3895999c658aa03846868bacf27f04c2db82c47a d5459450cac23a67732edc14aa8aef845a2f675a`
**Resumo:** Merge — modo Servidor: explica bloqueio HTTPS e oferece modo Navegador (#49)
**Corpo da mensagem:**

Merge — modo Servidor: explica bloqueio HTTPS e oferece modo Navegador (#49)

processServer detecta mixed-content (HTTPS→http local) com mensagem clara; qualquer falha não-local oferece os botões Navegador/Local.
**Arquivos afetados:** 0

---

## Commit 119 — `36a029dc773b4bc24585ae6923695f1bb132981d`
**Link:** [36a029dc773b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/36a029dc773b4bc24585ae6923695f1bb132981d)
**Data do autor:** `2026-05-25T02:47:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `6408c84e51f6e86fff3b95afc78622c32a12dd0a`
**Resumo:** feat: backend deployável com HTTPS (Render/Docker) para o modo Servidor
**Corpo da mensagem:**

feat: backend deployável com HTTPS (Render/Docker) para o modo Servidor

Para o modo Servidor funcionar no site PUBLICADO (HTTPS), o backend precisa
estar hospedado com HTTPS (o navegador bloqueia backend http:// local).

- server.py: respeita HOST/PORT do ambiente (hosts injetam PORT, exigem 0.0.0.0).
- render.yaml (raiz): blueprint do Render — cria o serviço a partir de backend/,
  buildCommand/startCommand prontos, healthCheck /health, GEMINI_API_KEY (sync:false).
- backend/Dockerfile + .dockerignore: container universal (Railway, Fly, Cloud Run…).
- backend/README.md: guia passo-a-passo de deploy (Render blueprint e Docker) +
  por que precisa de HTTPS + como apontar a URL no modo Servidor.
- jarvis.js: dica do modo Servidor menciona a URL pública HTTPS.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 6
### Arquivos criados

- `backend/.dockerignore`
- `backend/Dockerfile`
- `render.yaml`
### Arquivos modificados

- `backend/README.md`
- `backend/server.py`
- `src/pages/jarvis.js`

---

## Commit 120 — `0da99d369a512dddfe647362485d219dfffe3102`
**Link:** [0da99d369a51](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0da99d369a512dddfe647362485d219dfffe3102)
**Data do autor:** `2026-05-24T23:48:23-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `6408c84e51f6e86fff3b95afc78622c32a12dd0a 36a029dc773b4bc24585ae6923695f1bb132981d`
**Resumo:** Merge — backend deployável com HTTPS (Render + Docker) para o modo Servidor (#50)
**Corpo da mensagem:**

Merge — backend deployável com HTTPS (Render + Docker) para o modo Servidor (#50)

server.py respeita HOST/PORT; render.yaml (blueprint Render); backend/Dockerfile; guia de deploy no README; dica do modo Servidor atualizada.
**Arquivos afetados:** 0

---

## Commit 121 — `ba07dc0489bd984cd982a5edb5f6a1b056ad5557`
**Link:** [ba07dc0489bd](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ba07dc0489bd984cd982a5edb5f6a1b056ad5557)
**Data do autor:** `2026-05-25T02:51:32+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `0da99d369a512dddfe647362485d219dfffe3102`
**Resumo:** fix: modo Servidor — mensagem de mixed-content mostra a URL atual e onde colar a pública
**Corpo da mensagem:**

fix: modo Servidor — mensagem de mixed-content mostra a URL atual e onde colar a pública

O erro agora deixa claro que a URL configurada ainda é o backend local http://
e instrui a colar a URL pública https:// (do backend hospedado) no campo
"URL DO SERVIDOR" — a causa real quando o erro reaparece após o deploy.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/utils/jarvis-engine.js`

---

## Commit 122 — `3a41a1e81f802032b7f621c4832239cb48f56878`
**Link:** [3a41a1e81f80](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3a41a1e81f802032b7f621c4832239cb48f56878)
**Data do autor:** `2026-05-24T23:51:54-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0da99d369a512dddfe647362485d219dfffe3102 ba07dc0489bd984cd982a5edb5f6a1b056ad5557`
**Resumo:** Merge — mensagem do modo Servidor mais clara sobre a URL (#51)
**Corpo da mensagem:**

Merge — mensagem do modo Servidor mais clara sobre a URL (#51)

Mensagem de mixed-content do modo Servidor agora mostra a URL local atual e instrui a colar a URL pública https:// no campo de configuração.
**Arquivos afetados:** 0

---

## Commit 123 — `22b627a87da41cd0354595c71d0b9eb1d12ffbbd`
**Link:** [22b627a87da4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/22b627a87da41cd0354595c71d0b9eb1d12ffbbd)
**Data do autor:** `2026-05-25T02:59:26+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3a41a1e81f802032b7f621c4832239cb48f56878`
**Resumo:** docs: botão Deploy to Render + quickstart no README do backend
**Corpo da mensagem:**

docs: botão Deploy to Render + quickstart no README do backend

Facilita o caso A (ainda não deployado): botão de 1 clique que lê o render.yaml,
mais checklist curto (chave Gemini → deploy → env → colar URL no modo Servidor).

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `backend/README.md`

---

## Commit 124 — `6474331768caf7185f785c0f24a7b6a397387b38`
**Link:** [6474331768ca](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6474331768caf7185f785c0f24a7b6a397387b38)
**Data do autor:** `2026-05-24T23:59:43-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `3a41a1e81f802032b7f621c4832239cb48f56878 22b627a87da41cd0354595c71d0b9eb1d12ffbbd`
**Resumo:** Merge — botão Deploy to Render + quickstart do backend (#52)
**Corpo da mensagem:**

Merge — botão Deploy to Render + quickstart do backend (#52)

Botão Deploy to Render (1 clique, lê render.yaml) + checklist de deploy no README do backend.
**Arquivos afetados:** 0

---

## Commit 125 — `afe1a28c9ed503cf7e75812dd94c6c4071cc5988`
**Link:** [afe1a28c9ed5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/afe1a28c9ed503cf7e75812dd94c6c4071cc5988)
**Data do autor:** `2026-05-25T05:34:07+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `6474331768caf7185f785c0f24a7b6a397387b38`
**Resumo:** feat: Central de Vídeos — novo vídeo em "Som & Trilha"
**Corpo da mensagem:**

feat: Central de Vídeos — novo vídeo em "Som & Trilha"

Adiciona "Back To Earth — Assassin's Creed [GMV]" (TeaTime, ytId vyQwj7_l2N0)
à playlist Som & Trilha, a pedido do operador.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/data/videos.js`

---

## Commit 126 — `672634f97fe5014cf17fb23c0d49030d4e731d79`
**Link:** [672634f97fe5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/672634f97fe5014cf17fb23c0d49030d4e731d79)
**Data do autor:** `2026-05-25T02:34:25-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `6474331768caf7185f785c0f24a7b6a397387b38 afe1a28c9ed503cf7e75812dd94c6c4071cc5988`
**Resumo:** Merge — novo vídeo em Som & Trilha (#53)
**Corpo da mensagem:**

Merge — novo vídeo em Som & Trilha (#53)

Vídeo "Back To Earth — Assassin's Creed [GMV]" (TeaTime, vyQwj7_l2N0) na playlist Som & Trilha.
**Arquivos afetados:** 0

---

## Commit 127 — `76674abb40c06425930c6188a45badbef6a8132b`
**Link:** [76674abb40c0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/76674abb40c06425930c6188a45badbef6a8132b)
**Data do autor:** `2026-05-25T05:35:46+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `672634f97fe5014cf17fb23c0d49030d4e731d79`
**Resumo:** feat: modo Navegador (WebLLM) — modelos menores/rápidos + default mais leve
**Corpo da mensagem:**

feat: modo Navegador (WebLLM) — modelos menores/rápidos + default mais leve

Resposta à lentidão: adiciona Llama 3.2 1B (~1 GB) e Qwen2.5 0.5B (~0,6 GB) como
opções mais rápidas, e torna o Llama 3.2 1B o default (era Phi-3 ~2 GB). Modelos
menores baixam e respondem bem mais rápido; o usuário pode escolher na config.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/utils/jarvis-engine.js`
- `src/utils/jarvis-webllm.js`

---

## Commit 128 — `0d63c6b905a1809fb35372f0148592da6dbb0f0c`
**Link:** [0d63c6b905a1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0d63c6b905a1809fb35372f0148592da6dbb0f0c)
**Data do autor:** `2026-05-25T02:36:03-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `672634f97fe5014cf17fb23c0d49030d4e731d79 76674abb40c06425930c6188a45badbef6a8132b`
**Resumo:** Merge — WebLLM com modelos mais rápidos (#54)
**Corpo da mensagem:**

Merge — WebLLM com modelos mais rápidos (#54)

Adiciona Llama 3.2 1B e Qwen2.5 0.5B (mais rápidos) ao WebLLM e torna o Llama 3.2 1B o default — resposta à lentidão.
**Arquivos afetados:** 0

---

## Commit 129 — `1dba49a41f010a8bc97cf96fe1a98b68a81793bb`
**Link:** [1dba49a41f01](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1dba49a41f010a8bc97cf96fe1a98b68a81793bb)
**Data do autor:** `2026-05-25T06:31:12+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `0d63c6b905a1809fb35372f0148592da6dbb0f0c`
**Resumo:** feat: modo Servidor embutido na Vercel (api/ serverless) — tudo no mesmo site
**Corpo da mensagem:**

feat: modo Servidor embutido na Vercel (api/ serverless) — tudo no mesmo site

Caminho 2 (pedido do Lucas): o backend roda como função serverless no próprio
projeto Vercel, no mesmo domínio do site — sem mixed-content, sem URL separada.

- api/chat.py (POST → Gemini + Google Search) e api/health.py (GET → status),
  formato BaseHTTPRequestHandler da Vercel; requirements.txt (raiz) p/ as funções.
- vercel.json: maxDuration 60s na função de chat (cabe a busca do Gemini).
- jarvis-engine: resolveServerBase() — no site publicado (HTTPS) usa /api por
  padrão (mesmo se a URL salva for local); só URL https:// externa é usada como tal.
- modo Servidor: URL vazia = backend embutido (/api); dica e placeholder atualizados.
- backend/README: passo a passo Vercel (definir GEMINI_API_KEY + redeploy).

Só falta o usuário definir GEMINI_API_KEY nas Environment Variables da Vercel.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 7
### Arquivos criados

- `api/chat.py`
- `api/health.py`
- `requirements.txt`
- `vercel.json`
### Arquivos modificados

- `backend/README.md`
- `src/pages/jarvis.js`
- `src/utils/jarvis-engine.js`

---

## Commit 130 — `9fbed227da7b931ff9e8c409dbffd22f0732f179`
**Link:** [9fbed227da7b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9fbed227da7b931ff9e8c409dbffd22f0732f179)
**Data do autor:** `2026-05-25T19:19:46+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1dba49a41f010a8bc97cf96fe1a98b68a81793bb`
**Resumo:** feat: links fixos na sidebar — canal do YouTube + site LLBR Innovations
**Corpo da mensagem:**

feat: links fixos na sidebar — canal do YouTube + site LLBR Innovations

- #1: link sempre visível para o canal @Spartan_Gamer_BR.
- #4: link de divulgação do outro site (llbr-innovations-constructions.vercel.app).
Ambos no rodapé da sidebar, abrindo em nova aba.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/layout/sidebar.js`
- `src/styles/layout.css`

---

## Commit 131 — `3768e5e46e24ec1fd589ac190e07767c1da56d1f`
**Link:** [3768e5e46e24](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3768e5e46e24ec1fd589ac190e07767c1da56d1f)
**Data do autor:** `2026-05-25T16:22:48-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0d63c6b905a1809fb35372f0148592da6dbb0f0c 9fbed227da7b931ff9e8c409dbffd22f0732f179`
**Resumo:** Merge — modo Servidor embutido na Vercel (api/) + links da sidebar (#55)
**Corpo da mensagem:**

Merge — modo Servidor embutido na Vercel (api/) + links da sidebar (#55)

Backend do modo Servidor como função serverless na Vercel (api/chat.py, api/health.py, requirements.txt, vercel.json) + resolveServerBase usando /api no site publicado. Inclui links fixos da sidebar (canal YouTube + LLBR Innovations).
**Arquivos afetados:** 0

---

## Commit 132 — `a6e5a9c786306ff23221de64d3a0f70da0890200`
**Link:** [a6e5a9c78630](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a6e5a9c786306ff23221de64d3a0f70da0890200)
**Data do autor:** `2026-05-25T19:27:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3768e5e46e24ec1fd589ac190e07767c1da56d1f`
**Resumo:** feat: sistema de temas (#5) — 6 paletas de acento selecionáveis
**Corpo da mensagem:**

feat: sistema de temas (#5) — 6 paletas de acento selecionáveis

- src/utils/theme.js: temas (Neon, Âmbar, Matrix, Tático, Violeta, Gelo) que
  sobrescrevem as variáveis de cor de acento (+ variantes soft/edge/glow
  derivadas) no <html>. "Neon" remove overrides e volta ao CSS base. Persistido.
- main.js: applyTheme do tema salvo no boot.
- Perfil → Configurações: seletor de temas com swatches.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 4
### Arquivos criados

- `src/utils/theme.js`
### Arquivos modificados

- `src/main.js`
- `src/pages/perfil.js`
- `src/styles/fase18.css`

---

## Commit 133 — `c068c91b98726838e32f2f2e135592701c12ca42`
**Link:** [c068c91b9872](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c068c91b98726838e32f2f2e135592701c12ca42)
**Data do autor:** `2026-05-25T16:28:26-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `3768e5e46e24ec1fd589ac190e07767c1da56d1f a6e5a9c786306ff23221de64d3a0f70da0890200`
**Resumo:** Merge — sistema de temas (#56)
**Corpo da mensagem:**

Merge — sistema de temas (#56)

6 temas de acento (Neon, Âmbar, Matrix, Tático, Violeta, Gelo) selecionáveis no Perfil, aplicados via CSS variables no boot.
**Arquivos afetados:** 0

---

## Commit 134 — `c5718b88d1e08676e4521cff89139e0c8d444bf1`
**Link:** [c5718b88d1e0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c5718b88d1e08676e4521cff89139e0c8d444bf1)
**Data do autor:** `2026-05-25T19:30:21+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `c068c91b98726838e32f2f2e135592701c12ca42`
**Resumo:** feat: Rádio Online — mais países e estações (#2)
**Corpo da mensagem:**

feat: Rádio Online — mais países e estações (#2)

- COUNTRY_OPTIONS: de 13 para ~50 países (Américas, Europa, Ásia/Oceania,
  África/Oriente Médio).
- GENRE_OPTIONS: +16 gêneros (90s, funk, samba, forró, pagode, country, blues,
  soul, salsa, k-pop, anime, ambient, oldies, punk, indie…).
- Limite de estações por busca: 40 → 100.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/radio.js`
- `src/utils/radio-api.js`

---

## Commit 135 — `f0968132c31033799031e0957bc049bf5938543f`
**Link:** [f0968132c310](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f0968132c31033799031e0957bc049bf5938543f)
**Data do autor:** `2026-05-25T16:30:44-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `c068c91b98726838e32f2f2e135592701c12ca42 c5718b88d1e08676e4521cff89139e0c8d444bf1`
**Resumo:** Merge — Rádio Online com mais países e estações (#57)
**Corpo da mensagem:**

Merge — Rádio Online com mais países e estações (#57)

Rádio: ~50 países, +16 gêneros, limite de estações 40→100.
**Arquivos afetados:** 0

---

## Commit 136 — `e53c36810499ce0f9ac1482217a92f3059930426`
**Link:** [e53c36810499](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e53c36810499ce0f9ac1482217a92f3059930426)
**Data do autor:** `2026-05-25T19:32:56+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `f0968132c31033799031e0957bc049bf5938543f`
**Resumo:** feat: Central de Vídeos — playlists de música embutidas (#6)
**Corpo da mensagem:**

feat: Central de Vídeos — playlists de música embutidas (#6)

- Suporte a embed de PLAYLIST do YouTube (source 'youtube-playlist' + playlistId)
  via /embed/videoseries?list=...
- Nova seção "Músicas (Playlists)" com as 2 playlists do operador.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/data/videos.js`
- `src/pages/videos.js`

---

## Commit 137 — `9a47c426bd2a8def19d2c40fb79eff216b21aabb`
**Link:** [9a47c426bd2a](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9a47c426bd2a8def19d2c40fb79eff216b21aabb)
**Data do autor:** `2026-05-25T16:33:17-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f0968132c31033799031e0957bc049bf5938543f e53c36810499ce0f9ac1482217a92f3059930426`
**Resumo:** Merge — playlists de música na Central de Vídeos (#58)
**Corpo da mensagem:**

Merge — playlists de música na Central de Vídeos (#58)

Embed de playlist do YouTube + seção "Músicas (Playlists)" com as 2 playlists do operador.
**Arquivos afetados:** 0

---

## Commit 138 — `6f51bf94be5c172d5a9067abfefb521951f53b71`
**Link:** [6f51bf94be5c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6f51bf94be5c172d5a9067abfefb521951f53b71)
**Data do autor:** `2026-05-25T19:38:38+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `e53c36810499ce0f9ac1482217a92f3059930426`
**Resumo:** feat: TV do Baluarte — 16 canais com grade horária (#7)
**Corpo da mensagem:**

feat: TV do Baluarte — 16 canais com grade horária (#7)

Nova rota /tv (grupo Mídia + Hub). Cada canal é uma das 16 playlists do YouTube.
- Abre tocando o canal "no ar agora" (definido pela hora, rotação pelos 16 canais).
- Lista de canais (1–16) para trocar; tela 16:9 com o player da playlist.
- "Programação de hoje": grade 0–23h (hora → canal), com a hora atual destacada;
  clicar numa faixa sintoniza aquele canal.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 8
### Arquivos criados

- `src/data/tv.js`
- `src/pages/tv.js`
- `src/styles/tv.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`

---

## Commit 139 — `1f00d2cd2401ef45246bd83f6f0189c3f3098bb6`
**Link:** [1f00d2cd2401](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1f00d2cd2401ef45246bd83f6f0189c3f3098bb6)
**Data do autor:** `2026-05-25T16:38:58-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `9a47c426bd2a8def19d2c40fb79eff216b21aabb 6f51bf94be5c172d5a9067abfefb521951f53b71`
**Resumo:** Merge — TV do Baluarte com 16 canais e grade (#59)
**Corpo da mensagem:**

Merge — TV do Baluarte com 16 canais e grade (#59)

Rota /tv: 16 canais (playlists), canal no ar por hora, lista de canais e grade de programação do dia.
**Arquivos afetados:** 0

---

## Commit 140 — `21f1f03d3cf6041884468da9ad80ba70af4c1efc`
**Link:** [21f1f03d3cf6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/21f1f03d3cf6041884468da9ad80ba70af4c1efc)
**Data do autor:** `2026-05-25T19:40:29+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `1f00d2cd2401ef45246bd83f6f0189c3f3098bb6`
**Resumo:** fix: playlists do YouTube — usar youtube.com (não nocookie) no videoseries
**Corpo da mensagem:**

fix: playlists do YouTube — usar youtube.com (não nocookie) no videoseries

O domínio youtube-nocookie.com não resolve /embed/videoseries?list= (playlists),
resultando em "This video is unavailable". Troca para www.youtube.com no embed
de playlist da Central de Vídeos (#6) e da TV (#7). Vídeo único segue em nocookie.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/tv.js`
- `src/pages/videos.js`

---

## Commit 141 — `dc4539f720370f5309e69de09c7c1a751f021925`
**Link:** [dc4539f72037](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/dc4539f720370f5309e69de09c7c1a751f021925)
**Data do autor:** `2026-05-25T16:40:49-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `1f00d2cd2401ef45246bd83f6f0189c3f3098bb6 21f1f03d3cf6041884468da9ad80ba70af4c1efc`
**Resumo:** Merge — fix playlists do YouTube (videoseries) (#60)
**Corpo da mensagem:**

Merge — fix playlists do YouTube (videoseries) (#60)

Embed de playlist (videoseries) passa a usar www.youtube.com em vez de nocookie, corrigindo "This video is unavailable" na Central de Vídeos e na TV.
**Arquivos afetados:** 0

---

## Commit 142 — `3d0ce03278a5b2dc5720112ca24e8dacd29e3423`
**Link:** [3d0ce03278a5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/3d0ce03278a5b2dc5720112ca24e8dacd29e3423)
**Data do autor:** `2026-05-25T19:44:02+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `21f1f03d3cf6041884468da9ad80ba70af4c1efc`
**Resumo:** feat: Caixa de Ferramentas (#3 — Lote 1: 5 utilidades)
**Corpo da mensagem:**

feat: Caixa de Ferramentas (#3 — Lote 1: 5 utilidades)

Nova rota /utilidades (grupo Ferramentas + Hub) com 5 mini-ferramentas JS puro:
gerador de senhas (Web Crypto + força), gerador de UUID v4 em massa, contador
de texto (chars/palavras/linhas/tempo de leitura), conversor timestamp↔data
(fusos + "agora") e calculadora de porcentagem (3 modos).

Primeiro de 5 lotes rumo às 25 ferramentas.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 7
### Arquivos criados

- `src/pages/utilidades.js`
- `src/styles/utilidades.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`

---

## Commit 143 — `f6a2340de3c76d87d0f41b14230ec3b766101cfc`
**Link:** [f6a2340de3c7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f6a2340de3c76d87d0f41b14230ec3b766101cfc)
**Data do autor:** `2026-05-25T16:44:30-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `dc4539f720370f5309e69de09c7c1a751f021925 3d0ce03278a5b2dc5720112ca24e8dacd29e3423`
**Resumo:** Merge — Caixa de Ferramentas, Lote 1 (#61)
**Corpo da mensagem:**

Merge — Caixa de Ferramentas, Lote 1 (#61)

Rota /utilidades com 5 utilidades (senhas, UUID, contador de texto, timestamp↔data, porcentagem). Lote 1 de 5 das 25 ferramentas.
**Arquivos afetados:** 0

---

## Commit 144 — `346ec621916d21681fcd5490c8fd16926019bad2`
**Link:** [346ec621916d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/346ec621916d21681fcd5490c8fd16926019bad2)
**Data do autor:** `2026-05-25T19:48:02+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `3d0ce03278a5b2dc5720112ca24e8dacd29e3423`
**Resumo:** feat: Caixa de Ferramentas (#3 — Lote 2: +5 utilidades = 10/25)
**Corpo da mensagem:**

feat: Caixa de Ferramentas (#3 — Lote 2: +5 utilidades = 10/25)

Adiciona à /utilidades: Diff de Texto (LCS por linha), Lorem Ipsum, Número por
Extenso (pt-BR), Base64 de Imagem (file → data URI + preview) e Sorteador/Roleta
(sortear 1 / embaralhar). Tudo JS puro.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos modificados

- `src/pages/ferramentas.js`
- `src/pages/utilidades.js`
- `src/styles/utilidades.css`

---

## Commit 145 — `b89fbd263897e82b9bce075f06e7f43dab6cd070`
**Link:** [b89fbd263897](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b89fbd263897e82b9bce075f06e7f43dab6cd070)
**Data do autor:** `2026-05-25T16:48:24-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `f6a2340de3c76d87d0f41b14230ec3b766101cfc 346ec621916d21681fcd5490c8fd16926019bad2`
**Resumo:** Merge — Caixa de Ferramentas, Lote 2 (#62)
**Corpo da mensagem:**

Merge — Caixa de Ferramentas, Lote 2 (#62)

+5 utilidades (diff de texto, lorem ipsum, número por extenso, base64 de imagem, sorteador). 10/25.
**Arquivos afetados:** 0

---

## Commit 146 — `72e37d0837d1892df44bfb24e7c3960fe351ed87`
**Link:** [72e37d0837d1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/72e37d0837d1892df44bfb24e7c3960fe351ed87)
**Data do autor:** `2026-05-25T19:54:54+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `346ec621916d21681fcd5490c8fd16926019bad2`
**Resumo:** feat: Caixa de Ferramentas (#3 — Lote 3: +5 = 15/25)
**Corpo da mensagem:**

feat: Caixa de Ferramentas (#3 — Lote 3: +5 = 15/25)

Adiciona à /utilidades: Conversor de Caso (UPPER/lower/Título/camel/snake/kebab),
Gerador de Slug, Tabela ASCII (32–126, lookup), Números Romanos (↔) e
Calculadora de Datas (diferença + somar/subtrair dias). Tudo JS puro.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos modificados

- `src/pages/ferramentas.js`
- `src/pages/utilidades.js`
- `src/styles/utilidades.css`

---

## Commit 147 — `cb3d6882a987b84e6684f7b83b468957b8d2c3d9`
**Link:** [cb3d6882a987](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cb3d6882a987b84e6684f7b83b468957b8d2c3d9)
**Data do autor:** `2026-05-25T16:55:16-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `b89fbd263897e82b9bce075f06e7f43dab6cd070 72e37d0837d1892df44bfb24e7c3960fe351ed87`
**Resumo:** Merge — Caixa de Ferramentas, Lote 3 (#63)
**Corpo da mensagem:**

Merge — Caixa de Ferramentas, Lote 3 (#63)

+5 utilidades (conversor de caso, slug, tabela ASCII, romanos, calculadora de datas). 15/25.
**Arquivos afetados:** 0

---

## Commit 148 — `f3fdf6e6053ee66f670852ee38d5bc654a41d31f`
**Link:** [f3fdf6e6053e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/f3fdf6e6053ee66f670852ee38d5bc654a41d31f)
**Data do autor:** `2026-05-25T19:56:58+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `cb3d6882a987b84e6684f7b83b468957b8d2c3d9`
**Resumo:** fix: Rádio Online — usar all.api (round-robin) da Radio Browser
**Corpo da mensagem:**

fix: Rádio Online — usar all.api (round-robin) da Radio Browser

Os mirrors fixos estavam majoritariamente fora do ar (de2/nl1/at1 sem resposta),
quebrando a busca de estações ("não encontra"). Passa a usar
all.api.radio-browser.info como primário (round-robin oficial, sempre vivo),
com de1/fi1/nl1/de2 como fallback.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/utils/radio-api.js`

---

## Commit 149 — `fb01c4489c4c9df50e7bdfb87f98bf612178853a`
**Link:** [fb01c4489c4c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fb01c4489c4c9df50e7bdfb87f98bf612178853a)
**Data do autor:** `2026-05-25T19:59:16+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `f3fdf6e6053ee66f670852ee38d5bc654a41d31f`
**Resumo:** feat: Central de Vídeos — playlists de música viram 139 vídeos individuais
**Corpo da mensagem:**

feat: Central de Vídeos — playlists de música viram 139 vídeos individuais

A pedido do operador, a seção "Músicas" agora lista os vídeos das 2 playlists
como faixas individuais (com título), em vez de embed de playlist.
- scripts/gen-musicas-yt.mjs: extrai id+título dos vídeos das playlists
  (ytInitialData) → src/data/musicas-yt.js (139 faixas). Repetível.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos criados

- `scripts/gen-musicas-yt.mjs`
- `src/data/musicas-yt.js`
### Arquivos modificados

- `src/data/videos.js`

---

## Commit 150 — `4522f3a964660655324e2402e437ae679153128a`
**Link:** [4522f3a96466](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4522f3a964660655324e2402e437ae679153128a)
**Data do autor:** `2026-05-25T19:59:36+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `fb01c4489c4c9df50e7bdfb87f98bf612178853a`
**Resumo:** feat: TV — canais avançam e dão loop (autoplay + loop na playlist)
**Corpo da mensagem:**

feat: TV — canais avançam e dão loop (autoplay + loop na playlist)

Embed de playlist já avança para o próximo vídeo ao fim de cada um; adiciona
loop=1 para o canal reiniciar ao fim da playlist e nunca parar.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/pages/tv.js`

---

## Commit 151 — `8e86382eefc67fde8f7985201e704378c35b7149`
**Link:** [8e86382eefc6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/8e86382eefc67fde8f7985201e704378c35b7149)
**Data do autor:** `2026-05-25T16:59:59-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `cb3d6882a987b84e6684f7b83b468957b8d2c3d9 4522f3a964660655324e2402e437ae679153128a`
**Resumo:** Merge — fix Rádio + músicas individuais + loop da TV (#64)
**Corpo da mensagem:**

Merge — fix Rádio + músicas individuais + loop da TV (#64)

Rádio usa all.api (round-robin); músicas viram 139 vídeos individuais; TV avança + loop nos canais.
**Arquivos afetados:** 0

---

## Commit 152 — `18d437275a4dcb7c46e3c70ca8dcf73d12c0fe4f`
**Link:** [18d437275a4d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/18d437275a4dcb7c46e3c70ca8dcf73d12c0fe4f)
**Data do autor:** `2026-05-25T20:03:10+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `4522f3a964660655324e2402e437ae679153128a`
**Resumo:** feat: Caixa de Ferramentas (#3 — Lote 4: +5 = 20/25)
**Corpo da mensagem:**

feat: Caixa de Ferramentas (#3 — Lote 4: +5 = 20/25)

Adiciona à /utilidades: Validador + Gerador de CPF/CNPJ, conversor px↔rem,
Relógio Mundial (8 fusos), e Markdown → HTML (preview + fonte). Tudo JS puro.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos modificados

- `src/pages/ferramentas.js`
- `src/pages/utilidades.js`
- `src/styles/utilidades.css`

---

## Commit 153 — `9a2707d7588e726764ede75558dbffcc8aafe503`
**Link:** [9a2707d7588e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9a2707d7588e726764ede75558dbffcc8aafe503)
**Data do autor:** `2026-05-25T17:03:39-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `8e86382eefc67fde8f7985201e704378c35b7149 18d437275a4dcb7c46e3c70ca8dcf73d12c0fe4f`
**Resumo:** Merge — Caixa de Ferramentas, Lote 4 (#65)
**Corpo da mensagem:**

Merge — Caixa de Ferramentas, Lote 4 (#65)

+5 utilidades (CPF/CNPJ validar+gerar, px↔rem, relógio mundial, Markdown→HTML). 20/25.
**Arquivos afetados:** 0

---

## Commit 154 — `a36a120692e06757f400aab313b76ec672440121`
**Link:** [a36a120692e0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a36a120692e06757f400aab313b76ec672440121)
**Data do autor:** `2026-05-26T00:15:12+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `9a2707d7588e726764ede75558dbffcc8aafe503`
**Resumo:** feat: Caixa de Ferramentas (#3 — Lote 5: +5 = 25/25 ✅)
**Corpo da mensagem:**

feat: Caixa de Ferramentas (#3 — Lote 5: +5 = 25/25 ✅)

Fecha as 25 ferramentas: Texto↔Binário, JSON↔CSV, Regra de Três, Conversor de
Bytes (B→TB) e Frequência de Palavras. Tudo JS puro, em /utilidades.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos modificados

- `src/pages/ferramentas.js`
- `src/pages/utilidades.js`
- `src/styles/utilidades.css`

---

## Commit 155 — `37fc04bca0f5caaad7f10fa0cf4dd7ade859e725`
**Link:** [37fc04bca0f5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/37fc04bca0f5caaad7f10fa0cf4dd7ade859e725)
**Data do autor:** `2026-05-26T00:15:12+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `a36a120692e06757f400aab313b76ec672440121`
**Resumo:** feat: remove vídeos de música + rádio com +39 países e só streams HTTPS
**Corpo da mensagem:**

feat: remove vídeos de música + rádio com +39 países e só streams HTTPS

- Central de Vídeos: remove 8 vídeos da seção Músicas (lista do operador).
- Rádio: +39 países (89 no total), incl. Irã, Afeganistão e Coreia do Norte.
- Rádio: no site HTTPS, lista só estações com stream HTTPS (as http:// são
  bloqueadas pelo navegador e não tocam) — toca em qualquer rede.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/data/videos.js`
- `src/utils/radio-api.js`

---

## Commit 156 — `bb69e85e73b4e7b9eec6d305eae27ccd8fe76172`
**Link:** [bb69e85e73b4](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/bb69e85e73b4e7b9eec6d305eae27ccd8fe76172)
**Data do autor:** `2026-05-25T21:15:42-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `9a2707d7588e726764ede75558dbffcc8aafe503 37fc04bca0f5caaad7f10fa0cf4dd7ade859e725`
**Resumo:** Merge — #3 25/25 + remoção de vídeos + rádio (89 países, HTTPS) (#66)
**Corpo da mensagem:**

Merge — #3 25/25 + remoção de vídeos + rádio (89 países, HTTPS) (#66)

#3 completo (25 ferramentas em /utilidades); remove 8 vídeos de música; rádio com 89 países (Irã, Afeganistão, Coreia do Norte) e filtro de streams HTTPS.
**Arquivos afetados:** 0

---

## Commit 157 — `926445cf84c698101327443cef083ae6ab49bdba`
**Link:** [926445cf84c6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/926445cf84c698101327443cef083ae6ab49bdba)
**Data do autor:** `2026-05-26T00:17:20+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `bb69e85e73b4e7b9eec6d305eae27ccd8fe76172`
**Resumo:** feat: Central de Música — seção "Músicas" com faixa do Spotify
**Corpo da mensagem:**

feat: Central de Música — seção "Músicas" com faixa do Spotify

Adiciona a faixa 4WZYBWngq9ODEqPB05WW7S numa nova seção "♫ Músicas" (grid,
estruturada para receber mais faixas). A playlist 5wVc... que o operador pediu
já era a playlist em destaque da página.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 2
### Arquivos modificados

- `src/pages/musicas.js`
- `src/styles/musicas.css`

---

## Commit 158 — `94ca69525eb128697ca6b5a365931f2c4ccbe241`
**Link:** [94ca69525eb1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/94ca69525eb128697ca6b5a365931f2c4ccbe241)
**Data do autor:** `2026-05-25T21:17:41-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `bb69e85e73b4e7b9eec6d305eae27ccd8fe76172 926445cf84c698101327443cef083ae6ab49bdba`
**Resumo:** Merge — seção Músicas (Spotify) na Central de Música (#67)
**Corpo da mensagem:**

Merge — seção Músicas (Spotify) na Central de Música (#67)

Seção "Músicas" na Central de Música com a faixa 4WZY... do Spotify; playlist 5wVc já estava em destaque.
**Arquivos afetados:** 0

---

## Commit 159 — `d727f7e163fb1b25ecb389b640ace931f230351c`
**Link:** [d727f7e163fb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d727f7e163fb1b25ecb389b640ace931f230351c)
**Data do autor:** `2026-05-26T00:21:18+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `94ca69525eb128697ca6b5a365931f2c4ccbe241`
**Resumo:** feat: remove funks da seção Músicas dos vídeos
**Corpo da mensagem:**

feat: remove funks da seção Músicas dos vídeos

Filtra 4 faixas de funk (Parado no Bailão, MC Pogba, MC VV, pagodão DJ/MC) das
playlists de música — a pedido do operador ("sem os funks"). Pisadinha/sertanejo
(Bruno e Barretto, Barões da Pisadinha) foram mantidos por não serem funk.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 1
### Arquivos modificados

- `src/data/videos.js`

---

## Commit 160 — `9364ec9d373610d6d8eb4058fbc12c929713d723`
**Link:** [9364ec9d3736](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9364ec9d373610d6d8eb4058fbc12c929713d723)
**Data do autor:** `2026-05-25T21:21:38-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `94ca69525eb128697ca6b5a365931f2c4ccbe241 d727f7e163fb1b25ecb389b640ace931f230351c`
**Resumo:** Merge — sem funk na seção Músicas dos vídeos (#68)
**Corpo da mensagem:**

Merge — sem funk na seção Músicas dos vídeos (#68)

Remove 4 funks da seção Músicas dos vídeos (127 faixas restantes); mantém pisadinha/sertanejo.
**Arquivos afetados:** 0

---

## Commit 161 — `07eb13256890ed3a159cd6afe81abe6d5c169a85`
**Link:** [07eb13256890](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/07eb13256890ed3a159cd6afe81abe6d5c169a85)
**Data do autor:** `2026-05-26T19:34:44+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `9364ec9d373610d6d8eb4058fbc12c929713d723`
**Resumo:** feat: Central de Vídeos — músicas organizadas por gênero + remove 5 vídeos
**Corpo da mensagem:**

feat: Central de Vídeos — músicas organizadas por gênero + remove 5 vídeos

- Remove mais 5 vídeos da seção Músicas (lista do operador).
- "Baita mexida": a seção Músicas única vira 9 playlists por gênero — Sertanejo,
  Forró & Pisadinha, Pagode & Samba, Rock, Pop & Internacional, Eletrônica,
  Rap & Geek, Trilhas & Hinos e Outras.
- scripts/classify-musicas.mjs: classifica cada faixa por artista/palavra-chave
  e grava o campo `genero` em musicas-yt.js; videos.js agrupa por gênero.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos criados

- `scripts/classify-musicas.mjs`
### Arquivos modificados

- `src/data/musicas-yt.js`
- `src/data/videos.js`

---

## Commit 162 — `9bbbb46a42c5950f5966ec01b706ba147be7d62b`
**Link:** [9bbbb46a42c5](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9bbbb46a42c5950f5966ec01b706ba147be7d62b)
**Data do autor:** `2026-05-26T16:35:07-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `9364ec9d373610d6d8eb4058fbc12c929713d723 07eb13256890ed3a159cd6afe81abe6d5c169a85`
**Resumo:** Merge — músicas por gênero + 5 remoções (#69)
**Corpo da mensagem:**

Merge — músicas por gênero + 5 remoções (#69)

Músicas dos vídeos organizadas em 9 playlists por gênero (Sertanejo, Forró, Pagode, Rock, Pop, Eletrônica, Rap & Geek, Trilhas & Hinos, Outras) + remove 5 vídeos.
**Arquivos afetados:** 0

---

## Commit 163 — `45a15bec7e27ee489aac4b9d2a0a364da721f533`
**Link:** [45a15bec7e27](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/45a15bec7e27ee489aac4b9d2a0a364da721f533)
**Data do autor:** `2026-05-26T19:47:03+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `9bbbb46a42c5950f5966ec01b706ba147be7d62b`
**Resumo:** feat: Jogos de Aprendizado — aba /jogos com 3 jogos (JS, HTML, CSS)
**Corpo da mensagem:**

feat: Jogos de Aprendizado — aba /jogos com 3 jogos (JS, HTML, CSS)

Nova rota /jogos (grupo Conhecimento + Hub) com 3 jogos educativos JS puro:
- JavaScript: "Qual a saída?" — prevê o resultado do snippet (12 desafios).
- HTML: "Qual o HTML certo?" — múltipla escolha (10 desafios).
- CSS: "Acerte o Layout" — Flexbox (justify-content/align-items) batendo com o
  alvo, com preview ao vivo (6 níveis).
Abas, pontuação, progressão e tela de fim com "jogar de novo".

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 8
### Arquivos criados

- `src/data/jogos.js`
- `src/pages/jogos.js`
- `src/styles/jogos.css`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`

---

## Commit 164 — `89a1ff40c1581d9ba92f2e2aa76eb36e9278dc73`
**Link:** [89a1ff40c158](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/89a1ff40c1581d9ba92f2e2aa76eb36e9278dc73)
**Data do autor:** `2026-05-26T16:47:29-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `9bbbb46a42c5950f5966ec01b706ba147be7d62b 45a15bec7e27ee489aac4b9d2a0a364da721f533`
**Resumo:** Merge — Jogos de Aprendizado (JS, HTML, CSS) (#70)
**Corpo da mensagem:**

Merge — Jogos de Aprendizado (JS, HTML, CSS) (#70)

Aba /jogos com 3 jogos educativos: JavaScript (qual a saída), HTML (múltipla escolha) e CSS (flexbox/acerte o layout), com pontuação e progressão.
**Arquivos afetados:** 0

---

## Commit 165 — `ea924557f09b8e02778078f45cececeec38f36a4`
**Link:** [ea924557f09b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ea924557f09b8e02778078f45cececeec38f36a4)
**Data do autor:** `2026-05-28T17:58:43+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `89a1ff40c1581d9ba92f2e2aa76eb36e9278dc73`
**Resumo:** feat: TV — 18 novos canais (17–34); canal 25 com ordem reversa
**Corpo da mensagem:**

feat: TV — 18 novos canais (17–34); canal 25 com ordem reversa

- src/data/tv.js: adiciona canais 17–34 (mantém 17=18 e 32=33 conforme lista).
  Canal 25 ganha campo videoIds com a playlist invertida.
- src/pages/tv.js: tune() agora detecta videoIds e monta embed em sequência
  (primeiro vídeo + playlist=resto) para respeitar ordem custom.
- src/pages/ferramentas.js: descrição do card TV passa de "16 canais"
  para "34 canais".

Total: 34 canais em rotação.

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 3
### Arquivos modificados

- `src/data/tv.js`
- `src/pages/ferramentas.js`
- `src/pages/tv.js`

---

## Commit 166 — `2a596429efc00e953e8395b1fea0b949d5cb5084`
**Link:** [2a596429efc0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2a596429efc00e953e8395b1fea0b949d5cb5084)
**Data do autor:** `2026-05-28T20:33:47-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `89a1ff40c1581d9ba92f2e2aa76eb36e9278dc73 ea924557f09b8e02778078f45cececeec38f36a4`
**Resumo:** Merge — TV: 34 canais (#87)
**Corpo da mensagem:**

Merge — TV: 34 canais (#87)

feat: TV — 18 novos canais (17–34); canal 25 em ordem reversa
**Arquivos afetados:** 0

---

## Commit 167 — `085e36a85ad07d5c228ef3a30ebc24f73fe209c0`
**Link:** [085e36a85ad0](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/085e36a85ad07d5c228ef3a30ebc24f73fe209c0)
**Data do autor:** `2026-05-29T00:04:50+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `ea924557f09b8e02778078f45cececeec38f36a4`
**Resumo:** feat: Radar Tático — console range-Doppler (Tier 0: mock/replay/bridge)
**Corpo da mensagem:**

feat: Radar Tático — console range-Doppler (Tier 0: mock/replay/bridge)

Nova rota /radar com console radar real-time. Funciona sem hardware
(modo MOCK gera 3 alvos sintéticos animados); modos REPLAY (fixture)
e BRIDGE (WebSocket ws://127.0.0.1:8765/radar) ficam disponíveis pra
plugar hardware depois:
- Roteador com firmware Nexmon CSI (BCM43455 / Asus / TP-Link / RPi)
- ESP32 com firmware ESP32-CSI-Tool (sensor dedicado ~R$30)
- RTL-SDR como receptor de radar passivo bistático (usa Wi-Fi do
  roteador como iluminador)
- Hardware PLFM_RADAR (vendor branch já importada)

Arquitetura escolhida porque o navegador NÃO acessa a antena do
roteador diretamente (sandbox de segurança). A bridge local em Python
expõe os dados via WebSocket pra UI.

Mudanças:
- src/utils/radar-dsp.js — FFT radix-2, janela Hann, magnitude (lin/dB),
  DC notch, MTI single-pulse, CFAR-CA 2D, conversão range↔metros e
  doppler↔velocidade (modelo FMCW 5.8 GHz default).
- src/utils/radar-source.js — MockSource (sintetiza alvos),
  ReplaySource (estub), BridgeSource (WebSocket).
- src/pages/radar.js — console: range-Doppler heatmap, waterfall,
  lista de detecções com SNR/range/velocidade, controles (CFAR k,
  MTI, DC notch, freeze, mode switch), status bar (FPS, target count,
  frame, link).
- src/styles/radar.css — visual tático ciano/magenta com canvas
  pixelated, sliders e toggles.
- Rota /radar registrada em main.js, sidebar (grupo Tático), shell
  (page title), index.html (CSS link), e ferramentas hub (card novo
  na categoria visualização).

https://claude.ai/code/session_01JKotzZeJhrvWCaxy5Dx7Vs
**Arquivos afetados:** 9
### Arquivos criados

- `src/pages/radar.js`
- `src/styles/radar.css`
- `src/utils/radar-dsp.js`
- `src/utils/radar-source.js`
### Arquivos modificados

- `index.html`
- `src/layout/shell.js`
- `src/layout/sidebar.js`
- `src/main.js`
- `src/pages/ferramentas.js`

---

## Commit 168 — `fae36ab7224ef3fafb965564c0bdf681022f095c`
**Link:** [fae36ab7224e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/fae36ab7224ef3fafb965564c0bdf681022f095c)
**Data do autor:** `2026-05-28T21:18:09-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2a596429efc00e953e8395b1fea0b949d5cb5084 085e36a85ad07d5c228ef3a30ebc24f73fe209c0`
**Resumo:** Merge — Radar Tático: console range-Doppler (#88)
**Corpo da mensagem:**

Merge — Radar Tático: console range-Doppler (#88)

feat: Radar Tático — console range-Doppler (Tier 0: mock/replay/bridge)
**Arquivos afetados:** 0

---

## Commit 169 — `500f5574b3b7372b6d50cdbc24a038c10ce8c922`
**Link:** [500f5574b3b7](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/500f5574b3b7372b6d50cdbc24a038c10ce8c922)
**Data do autor:** `2026-05-29T10:49:46+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `fae36ab7224ef3fafb965564c0bdf681022f095c`
**Resumo:** feat: Arcade (hub + contas + ranking), Code Quest (17 linguagens) e radar acústico no celular
**Corpo da mensagem:**

feat: Arcade (hub + contas + ranking), Code Quest (17 linguagens) e radar acústico no celular

Jogos (/jogos):
- vira um HUB: escolhe o jogo (não abre direto), conta nome+senha (hash SHA-256),
  XP/nível/patente, ranking local e 'continuar de onde parou'.
- Code Quest: jogo grande multi-linguagem (17 trilhas, campanha + treino).
- mantém JS/HTML/CSS integrados à pontuação.

Radar (/radar):
- modo ACÚSTICO: funciona no celular sem hardware (Doppler ~19kHz via mic+speaker),
  reusa o pipeline DC-notch/MTI/CFAR/heatmap/waterfall.
- ajustes responsivos para telas pequenas.

Docs:
- docs/MEGA-PLANO.md: radar no celular, integração dos repos #71-#86 e plano do Jarvis (4 repos).

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 9
### Arquivos criados

- `docs/MEGA-PLANO.md`
- `src/data/code-quest.js`
- `src/utils/players-engine.js`
### Arquivos modificados

- `src/layout/sidebar.js`
- `src/pages/jogos.js`
- `src/pages/radar.js`
- `src/styles/jogos.css`
- `src/styles/radar.css`
- `src/utils/radar-source.js`

---

## Commit 170 — `abf501180e669fe28f606b110ea1572122e110e5`
**Link:** [abf501180e66](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/abf501180e669fe28f606b110ea1572122e110e5)
**Data do autor:** `2026-05-29T07:54:26-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `fae36ab7224ef3fafb965564c0bdf681022f095c 500f5574b3b7372b6d50cdbc24a038c10ce8c922`
**Resumo:** Merge — Arcade + Code Quest + Radar acústico (#89)
**Corpo da mensagem:**

Merge — Arcade + Code Quest + Radar acústico (#89)

Arcade (hub + contas + ranking) · Code Quest (17 linguagens) · Radar acústico no celular
**Arquivos afetados:** 0

---

## Commit 171 — `c8004ebf73b9fb64fdf8d18f7bd1e8953966dd09`
**Link:** [c8004ebf73b9](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c8004ebf73b9fb64fdf8d18f7bd1e8953966dd09)
**Data do autor:** `2026-05-29T10:59:14+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `abf501180e669fe28f606b110ea1572122e110e5`
**Resumo:** feat(radar): rastreio multi-alvo (tracker alfa-beta) — 1ª integração dos repos #71-#86
**Corpo da mensagem:**

feat(radar): rastreio multi-alvo (tracker alfa-beta) — 1ª integração dos repos #71-#86

Extrai o conceito do passiveRadar (multitarget_kalman_tracker.py) como módulo JS
puro: src/utils/radar-tracker.js. As detecções do CFAR viram alvos persistentes
com ID, velocidade suavizada (filtro alfa-beta), rastro e estado coasting.

Sem inchar a main com os ~500MB dos vendors — só o conceito vira código.

- radar.js: pipeline CFAR -> tracker.update() -> overlay de trilhas + lista com IDs
- radar.css: estilo de alvo em coasting
- docs/MEGA-PLANO.md: marca o tracker como 1º conceito integrado

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 4
### Arquivos criados

- `src/utils/radar-tracker.js`
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `src/pages/radar.js`
- `src/styles/radar.css`

---

## Commit 172 — `a0f1d1863a78c26400236852b2d46ae89ed33408`
**Link:** [a0f1d1863a78](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/a0f1d1863a78c26400236852b2d46ae89ed33408)
**Data do autor:** `2026-05-29T07:59:39-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `abf501180e669fe28f606b110ea1572122e110e5 c8004ebf73b9fb64fdf8d18f7bd1e8953966dd09`
**Resumo:** Merge — Radar: rastreio multi-alvo (tracker alfa-beta) (#90)
**Corpo da mensagem:**

Merge — Radar: rastreio multi-alvo (tracker alfa-beta) (#90)

Radar: rastreio multi-alvo (tracker alfa-beta) — 1ª integração dos repos #71–#86
**Arquivos afetados:** 0

---

## Commit 173 — `90b5e3861974f3351e39a1767dc70765913d46da`
**Link:** [90b5e3861974](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/90b5e3861974f3351e39a1767dc70765913d46da)
**Data do autor:** `2026-05-29T11:05:45+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `a0f1d1863a78c26400236852b2d46ae89ed33408`
**Resumo:** feat(radar): modo PASSIVO (cross-ambiguidade) — 2ª integração dos repos #71-#86
**Corpo da mensagem:**

feat(radar): modo PASSIVO (cross-ambiguidade) — 2ª integração dos repos #71-#86

Conceito do espectre/passiveRadar como JS puro:
- radar-dsp.js: crossAmbiguity() — CAF pelo 'algoritmo de batches', com suporte a I/Q.
- radar-source.js: PassiveSource — sintetiza iluminador + ecos complexos móveis e
  roda a CAF real a cada frame (verificado: pico no range/Doppler corretos).
- radar.js: botão de modo PASSIVO.
- docs/MEGA-PLANO.md: 2º conceito integrado.

Sem inchar a main; trocar a sintese por SDR real e so plugar no modo BRIDGE.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 4
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `src/pages/radar.js`
- `src/utils/radar-dsp.js`
- `src/utils/radar-source.js`

---

## Commit 174 — `ae04187f701f1567d8bd95e0f019cb1c7e068754`
**Link:** [ae04187f701f](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/ae04187f701f1567d8bd95e0f019cb1c7e068754)
**Data do autor:** `2026-05-29T08:06:11-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `a0f1d1863a78c26400236852b2d46ae89ed33408 90b5e3861974f3351e39a1767dc70765913d46da`
**Resumo:** Merge — Radar: modo PASSIVO (cross-ambiguidade) (#91)
**Corpo da mensagem:**

Merge — Radar: modo PASSIVO (cross-ambiguidade) (#91)

Radar: modo PASSIVO (cross-ambiguidade) — 2ª integração dos repos #71–#86
**Arquivos afetados:** 0

---

## Commit 175 — `1dafbde68fdf3ae16b6bf128d6ec9a18b3e3f4d5`
**Link:** [1dafbde68fdf](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/1dafbde68fdf3ae16b6bf128d6ec9a18b3e3f4d5)
**Data do autor:** `2026-05-29T11:10:58+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ae04187f701f1567d8bd95e0f019cb1c7e068754`
**Resumo:** feat(geo): GeoPulse — trilha de localização (/geo) — 3ª integração dos repos #71-#86
**Corpo da mensagem:**

feat(geo): GeoPulse — trilha de localização (/geo) — 3ª integração dos repos #71-#86

Conceito do geopulse (tess1o/geopulse) como JS puro:
- geo-tracker.js: watchPosition + Haversine, acumula pontos, estatísticas, persiste a trilha.
- pages/geopulse.js: página /geo com mapa da trajetória (canvas), stats e lista de pontos.
- rota /geo + item no menu (Tático) + geopulse.css + link no index.html.
- docs/MEGA-PLANO.md: 3º conceito integrado.

Funciona no celular (Geolocation API). Sem backend.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 7
### Arquivos criados

- `src/pages/geopulse.js`
- `src/styles/geopulse.css`
- `src/utils/geo-tracker.js`
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `index.html`
- `src/layout/sidebar.js`
- `src/main.js`

---

## Commit 176 — `43d010d4cd3cba2c9ee744dec2daac5071e193c7`
**Link:** [43d010d4cd3c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/43d010d4cd3cba2c9ee744dec2daac5071e193c7)
**Data do autor:** `2026-05-29T08:11:20-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `ae04187f701f1567d8bd95e0f019cb1c7e068754 1dafbde68fdf3ae16b6bf128d6ec9a18b3e3f4d5`
**Resumo:** Merge — GeoPulse: trilha de localização (/geo) (#92)
**Corpo da mensagem:**

Merge — GeoPulse: trilha de localização (/geo) (#92)

GeoPulse: trilha de localização (/geo) — 3ª integração dos repos #71–#86
**Arquivos afetados:** 0

---

## Commit 177 — `dde9f671821da961ebe8cc85660ad8413f1a039a`
**Link:** [dde9f671821d](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/dde9f671821da961ebe8cc85660ad8413f1a039a)
**Data do autor:** `2026-05-29T11:18:55+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `43d010d4cd3cba2c9ee744dec2daac5071e193c7`
**Resumo:** feat(find): Onde Estou? — posição indoor por impressão acústica (/find) — 4ª integração #71-#86
**Corpo da mensagem:**

feat(find): Onde Estou? — posição indoor por impressão acústica (/find) — 4ª integração #71-#86

Conceito do find (schollz/find) como JS puro:
- fingerprint-engine.js: aprende assinaturas por local e classifica por cosseno (+confiança).
- pages/find.js: captura a impressão ACÚSTICA do ambiente (mic + tom de prova ~19kHz),
  grava por cômodo e responde 'onde estou' com ranking de confiança.
- rota /find + item no menu (Tático) + find.css + link no index.html.
- docs/MEGA-PLANO.md: 4º conceito integrado.

Motor verificado em Node (classifica o local certo). Funciona no celular, sem backend.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 7
### Arquivos criados

- `src/pages/find.js`
- `src/styles/find.css`
- `src/utils/fingerprint-engine.js`
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `index.html`
- `src/layout/sidebar.js`
- `src/main.js`

---

## Commit 178 — `35f6ae31d43c1804dcc43bd9dfde13ee07ce839c`
**Link:** [35f6ae31d43c](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/35f6ae31d43c1804dcc43bd9dfde13ee07ce839c)
**Data do autor:** `2026-05-29T08:19:40-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `43d010d4cd3cba2c9ee744dec2daac5071e193c7 dde9f671821da961ebe8cc85660ad8413f1a039a`
**Resumo:** Merge — Onde Estou?: posição indoor por impressão acústica (/find) (#93)
**Corpo da mensagem:**

Merge — Onde Estou?: posição indoor por impressão acústica (/find) (#93)

Onde Estou?: posição indoor por impressão acústica (/find) — 4ª integração dos repos #71–#86
**Arquivos afetados:** 0

---

## Commit 179 — `9bf1ae391a184b373b940fc3bf0c6527960ccf74`
**Link:** [9bf1ae391a18](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/9bf1ae391a184b373b940fc3bf0c6527960ccf74)
**Data do autor:** `2026-05-29T16:58:22+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `35f6ae31d43c1804dcc43bd9dfde13ee07ce839c`
**Resumo:** feat(tri): Triangulação por rumos (/triangulacao) — 5ª integração dos repos #71-#86
**Corpo da mensagem:**

feat(tri): Triangulação por rumos (/triangulacao) — 5ª integração dos repos #71-#86

Conceito dos repos alexflint/triangulation e vandroogenbroeck/triangulation:
- triangulation.js: interseção de rumos por mínimos quadrados (equações normais 2x2),
  resíduo RMS, ruído gaussiano e distância. (motor já existia; verificado em Node)
- pages/triangulacao.js: demo interativa (arraste o alvo; estações medem ângulo com
  ruído; estimativa por mínimos quadrados desenhada no campo).
- rota /triangulacao + menu (Tático) + triangulacao.css + link no index.html.
- docs/MEGA-PLANO.md: 5º conceito integrado.

Verificado: sem ruído acerta exato (resíduo 0); com 3° o erro médio ~13 px.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 7
### Arquivos criados

- `src/pages/triangulacao.js`
- `src/styles/triangulacao.css`
- `src/utils/triangulation.js`
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `index.html`
- `src/layout/sidebar.js`
- `src/main.js`

---

## Commit 180 — `50f5ec64dcc9d22df2873bde63a78173dda1a520`
**Link:** [50f5ec64dcc9](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/50f5ec64dcc9d22df2873bde63a78173dda1a520)
**Data do autor:** `2026-05-29T13:59:21-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `35f6ae31d43c1804dcc43bd9dfde13ee07ce839c 9bf1ae391a184b373b940fc3bf0c6527960ccf74`
**Resumo:** Merge — Triangulação por rumos (/triangulacao) (#94)
**Corpo da mensagem:**

Merge — Triangulação por rumos (/triangulacao) (#94)

Triangulação por rumos (/triangulacao) — 5ª integração dos repos #71–#86
**Arquivos afetados:** 0

---

## Commit 181 — `c5fcf5d07a8139eadfb239ecd681e39a29482e9a`
**Link:** [c5fcf5d07a81](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/c5fcf5d07a8139eadfb239ecd681e39a29482e9a)
**Data do autor:** `2026-05-29T17:05:07+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `50f5ec64dcc9d22df2873bde63a78173dda1a520`
**Resumo:** feat(jarvis): humanizador de respostas (avoid-ai-writing) — Jarvis P1
**Corpo da mensagem:**

feat(jarvis): humanizador de respostas (avoid-ai-writing) — Jarvis P1

Conceito do conorbronsdon/avoid-ai-writing como JS puro:
- src/utils/jarvis-style.js: humanize() remove aberturas-clichê, frases de
  preenchimento, vocabulário inflado e fechos genéricos (pt-BR + inglês);
  detect() audita os padrões. Swaps em pt são sensíveis a gênero. Verificado em Node.
- jarvis.js: aplica humanize() só na PROSA exibida (renderRich) — não toca em
  blocos de código; toggle 'Humanizar respostas' no painel (default ligado),
  display-only (histórico mantém o original).
- docs/MEGA-PLANO.md: marca o P1 do Jarvis como feito.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 3
### Arquivos criados

- `src/utils/jarvis-style.js`
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `src/pages/jarvis.js`

---

## Commit 182 — `51d09b17381e322f831fcf02d471f8ea06a876f2`
**Link:** [51d09b17381e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/51d09b17381e322f831fcf02d471f8ea06a876f2)
**Data do autor:** `2026-05-29T14:05:32-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `50f5ec64dcc9d22df2873bde63a78173dda1a520 c5fcf5d07a8139eadfb239ecd681e39a29482e9a`
**Resumo:** Merge — Jarvis: humanizador de respostas (avoid-ai-writing) (#95)
**Corpo da mensagem:**

Merge — Jarvis: humanizador de respostas (avoid-ai-writing) (#95)

Jarvis: humanizador de respostas (avoid-ai-writing) — P1
**Arquivos afetados:** 0

---

## Commit 183 — `7e93981791171b8151dcf37a4f3a0f4830df38b6`
**Link:** [7e9398179117](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/7e93981791171b8151dcf37a4f3a0f4830df38b6)
**Data do autor:** `2026-05-29T17:09:56+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `51d09b17381e322f831fcf02d471f8ea06a876f2`
**Resumo:** feat(jarvis): memória entre conversas (claude-mem) — Jarvis P2
**Corpo da mensagem:**

feat(jarvis): memória entre conversas (claude-mem) — Jarvis P2

Conceito do thedotmack/claude-mem como JS puro:
- src/utils/jarvis-recall.js: summarizeSession() resume cada conversa em 1 linha;
  recall() acha os resumos mais relevantes (TF-IDF + cosseno). Verificado em Node.
- jarvis-memory.js: getAllMessages() (corpus entre sessões).
- jarvis.js: antes de chamar a IA, injeta os resumos relevantes de conversas
  anteriores no systemPrompt (disclosure progressivo = econômico em tokens);
  toggle 'Memória entre conversas' (default ligado) + chip '🧠 lembrei de N'.
- docs/MEGA-PLANO.md: P2 do Jarvis feito.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 4
### Arquivos criados

- `src/utils/jarvis-recall.js`
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `src/pages/jarvis.js`
- `src/utils/jarvis-memory.js`

---

## Commit 184 — `58e557fd7a242f57a6c7eda951e1ef5e19421d37`
**Link:** [58e557fd7a24](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/58e557fd7a242f57a6c7eda951e1ef5e19421d37)
**Data do autor:** `2026-05-29T14:10:20-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `51d09b17381e322f831fcf02d471f8ea06a876f2 7e93981791171b8151dcf37a4f3a0f4830df38b6`
**Resumo:** Merge — Jarvis: memória entre conversas (claude-mem) (#96)
**Corpo da mensagem:**

Merge — Jarvis: memória entre conversas (claude-mem) (#96)

Jarvis: memória entre conversas (claude-mem) — P2
**Arquivos afetados:** 0

---

## Commit 185 — `cce35aae43b186a6c6cbdb3a3b8acbc4db07095e`
**Link:** [cce35aae43b1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cce35aae43b186a6c6cbdb3a3b8acbc4db07095e)
**Data do autor:** `2026-05-29T17:14:21+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `58e557fd7a242f57a6c7eda951e1ef5e19421d37`
**Resumo:** feat(jarvis): modo Agente reforçado (hermes-agent) — Jarvis P3
**Corpo da mensagem:**

feat(jarvis): modo Agente reforçado (hermes-agent) — Jarvis P3

Validado: hermes-agent (MIT) e hermes-web-ui (6.6k★) são públicos.
Conceito do hermes-agent (skills + memória procedural + mais ferramentas):
- jarvis-tools.js: 'navigate' agora conhece TODAS as páginas novas (jogos, radar,
  geo, find, triangulacao, jarvis, color-studio, qr-studio, etc.).
- nova ferramenta 'recall_memory': o agente busca em conversas anteriores
  (liga o P2 ao agente — memória procedural). Síncrona, via cache do corpus.
- jarvis-recall.js: cache do corpus (setMemoryCache/getMemoryCache).
- jarvis.js: preenche o cache no load e a cada envio.
- docs/MEGA-PLANO.md: P3 feito; acesso aos 4 repos confirmado.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 4
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `src/pages/jarvis.js`
- `src/utils/jarvis-recall.js`
- `src/utils/jarvis-tools.js`

---

## Commit 186 — `32ab507a6c6016c8d3ded48649640f2135d99bb3`
**Link:** [32ab507a6c60](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/32ab507a6c6016c8d3ded48649640f2135d99bb3)
**Data do autor:** `2026-05-29T14:14:46-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `58e557fd7a242f57a6c7eda951e1ef5e19421d37 cce35aae43b186a6c6cbdb3a3b8acbc4db07095e`
**Resumo:** Merge — Jarvis: modo Agente reforçado (hermes-agent) (#97)
**Corpo da mensagem:**

Merge — Jarvis: modo Agente reforçado (hermes-agent) (#97)

Jarvis: modo Agente reforçado (hermes-agent) — P3
**Arquivos afetados:** 0

---

## Commit 187 — `5a52c489125149eb01d88235539df063f93f7309`
**Link:** [5a52c4891251](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/5a52c489125149eb01d88235539df063f93f7309)
**Data do autor:** `2026-05-29T17:17:06+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `32ab507a6c6016c8d3ded48649640f2135d99bb3`
**Resumo:** feat(jarvis): UI do chat polida (hermes-web-ui) — Jarvis P4 (completa os 4 repos)
**Corpo da mensagem:**

feat(jarvis): UI do chat polida (hermes-web-ui) — Jarvis P4 (completa os 4 repos)

Conceito do hermes-web-ui (padrões de UI, sem importar o código Vue):
- botão 'copiar' nas respostas do J.A.R.V.I.S.
- tool-calls EXPANSÍVEIS (<details>): clique mostra input + result.
- docs/MEGA-PLANO.md: P4 feito → as 4 fases do Jarvis concluídas.

Fecha a integração dos 4 repositórios do Jarvis (avoid-ai-writing, claude-mem,
hermes-agent, hermes-web-ui).

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 2
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `src/pages/jarvis.js`

---

## Commit 188 — `2f58838038bb0a83737e4a8990734be41a38a0b4`
**Link:** [2f58838038bb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2f58838038bb0a83737e4a8990734be41a38a0b4)
**Data do autor:** `2026-05-29T14:17:27-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `32ab507a6c6016c8d3ded48649640f2135d99bb3 5a52c489125149eb01d88235539df063f93f7309`
**Resumo:** Merge — Jarvis: UI do chat polida (hermes-web-ui) — P4 (#98)
**Corpo da mensagem:**

Merge — Jarvis: UI do chat polida (hermes-web-ui) — P4 (#98)

Jarvis: UI do chat polida (hermes-web-ui) — P4 (completa os 4 repos)
**Arquivos afetados:** 0

---

## Commit 189 — `0f86682d5228e855a79cfc849309c18542608967`
**Link:** [0f86682d5228](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0f86682d5228e855a79cfc849309c18542608967)
**Data do autor:** `2026-05-29T22:05:30+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2f58838038bb0a83737e4a8990734be41a38a0b4`
**Resumo:** feat(llm): Mini-LLM do Zero (/llm-lab) — LLM client-side que treina e gera
**Corpo da mensagem:**

feat(llm): Mini-LLM do Zero (/llm-lab) — LLM client-side que treina e gera

Inspirado nos repos de 'LLM from scratch' (vendorizados como referência em vendor/*).
Roda 100% no navegador, em JS puro:
- src/utils/llm-mini.js: NeuralBigram (treina por gradiente; softmax+cross-entropy+
  backprop manual; loss cai ao vivo — verificado 3.30→1.98) e NgramModel (ordem 1-4).
- src/pages/llm-lab.js (/llm-lab): corpus + treino animado (curva de loss) + geração
  com temperatura + explicação didática.
- rota /llm-lab + menu (Sistema) + llm-lab.css + link no index.html.
- docs/MEGA-PLANO.md: seção 8 + lista dos repos vendorizados.

Nota honesta: treinar um LLM grande (GPU/PyTorch) não roda em site estático;
este é o 'do zero' que de fato funciona no navegador.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 19
### Arquivos criados

- `src/pages/llm-lab.js`
- `src/styles/llm-lab.css`
- `src/utils/llm-mini.js`
- `vendor/martinbraquet-llm/.coveragerc`
- `vendor/martinbraquet-llm/demo/finetuning.ipynb`
- `vendor/martinbraquet-llm/demo/from_scratch.ipynb`
- `vendor/martinbraquet-llm/demo/readme_snippets.ipynb`
- `vendor/martinbraquet-llm/llm/tests/data/prince/805f20d7ef74c5b2/meta.pkl`
- `vendor/martinbraquet-llm/llm/tests/prompt.txt`
- `vendor/martinbraquet-llm/llm/tests/results/test1/ckpt.pt`
- `vendor/martinbraquet-llm/llm/tests/training_data.txt`
- `vendor/martinbraquet-llm/scripts/release.sh`
- `vendor/martinbraquet-llm/scripts/runpod/install.sh`
- `vendor/martinbraquet-llm/scripts/runpod/rsync.sh`
- `vendor/martinbraquet-llm/scripts/runpod/ssh.sh`
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `index.html`
- `src/layout/sidebar.js`
- `src/main.js`

---

## Commit 190 — `b321f3b27f91ab9c422b5bece99eb5b1dd78c2ab`
**Link:** [b321f3b27f91](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/b321f3b27f91ab9c422b5bece99eb5b1dd78c2ab)
**Data do autor:** `2026-05-29T22:06:31+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `0f86682d5228e855a79cfc849309c18542608967`
**Resumo:** chore: remove vendor/ da branch de trabalho (mantido só nas branches vendor/*)
**Arquivos afetados:** 12
### Arquivos removidos

- `vendor/martinbraquet-llm/.coveragerc`
- `vendor/martinbraquet-llm/demo/finetuning.ipynb`
- `vendor/martinbraquet-llm/demo/from_scratch.ipynb`
- `vendor/martinbraquet-llm/demo/readme_snippets.ipynb`
- `vendor/martinbraquet-llm/llm/tests/data/prince/805f20d7ef74c5b2/meta.pkl`
- `vendor/martinbraquet-llm/llm/tests/prompt.txt`
- `vendor/martinbraquet-llm/llm/tests/results/test1/ckpt.pt`
- `vendor/martinbraquet-llm/llm/tests/training_data.txt`
- `vendor/martinbraquet-llm/scripts/release.sh`
- `vendor/martinbraquet-llm/scripts/runpod/install.sh`
- `vendor/martinbraquet-llm/scripts/runpod/rsync.sh`
- `vendor/martinbraquet-llm/scripts/runpod/ssh.sh`

---

## Commit 191 — `d3799faf9da1b84481b493bca28860cf2a019125`
**Link:** [d3799faf9da1](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/d3799faf9da1b84481b493bca28860cf2a019125)
**Data do autor:** `2026-05-29T19:07:06-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `2f58838038bb0a83737e4a8990734be41a38a0b4 b321f3b27f91ab9c422b5bece99eb5b1dd78c2ab`
**Resumo:** Merge — Mini-LLM do Zero (/llm-lab) (#104)
**Corpo da mensagem:**

Merge — Mini-LLM do Zero (/llm-lab) (#104)

Mini-LLM do Zero (/llm-lab) — LLM client-side que treina e gera
**Arquivos afetados:** 0

---

## Commit 192 — `e15daecde8e66ff9d3affe9fe8bf2f0a786eb1fa`
**Link:** [e15daecde8e6](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/e15daecde8e66ff9d3affe9fe8bf2f0a786eb1fa)
**Data do autor:** `2026-05-29T22:09:40+00:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `d3799faf9da1b84481b493bca28860cf2a019125`
**Resumo:** feat(jarvis): WebLLM reforçado — baixar/pré-carregar modelo + temperatura
**Corpo da mensagem:**

feat(jarvis): WebLLM reforçado — baixar/pré-carregar modelo + temperatura

2ª frente do 'Jarvis de verdade' (LLM real no navegador via WebGPU):
- jarvis-webllm.js: preloadWebLLM() (baixa/aquece o modelo sem gerar) e
  getLoadedModel(); temperature + max_tokens na geração.
- jarvis.js: no modo Navegador, botão 'Baixar/carregar modelo' com barra de
  progresso + status, e slider de TEMPERATURA. 1ª resposta deixa de travar.
- docs/MEGA-PLANO.md: WebLLM reforçado.

https://claude.ai/code/session_01CSpVWhtyNRKvTvDq8Y5Pmm
**Arquivos afetados:** 3
### Arquivos modificados

- `docs/MEGA-PLANO.md`
- `src/pages/jarvis.js`
- `src/utils/jarvis-webllm.js`

---

## Commit 193 — `45949a9edc6bb102b16e71c6d27156782de5f8ba`
**Link:** [45949a9edc6b](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/45949a9edc6bb102b16e71c6d27156782de5f8ba)
**Data do autor:** `2026-05-29T19:10:01-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `d3799faf9da1b84481b493bca28860cf2a019125 e15daecde8e66ff9d3affe9fe8bf2f0a786eb1fa`
**Resumo:** Merge — Jarvis: WebLLM reforçado (baixar modelo + temperatura) (#105)
**Corpo da mensagem:**

Merge — Jarvis: WebLLM reforçado (baixar modelo + temperatura) (#105)

Jarvis: WebLLM reforçado — baixar/pré-carregar modelo + temperatura
**Arquivos afetados:** 0

---

## Commit 194 — `cd0afc61f4cceccfcef893fdf29476ec2bc714d8`
**Link:** [cd0afc61f4cc](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/cd0afc61f4cceccfcef893fdf29476ec2bc714d8)
**Data do autor:** `2026-05-30T03:48:42+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `45949a9edc6bb102b16e71c6d27156782de5f8ba`
**Resumo:** feat(jarvis): Nível 1 Python — câmera, reconhecimento facial e voz
**Corpo da mensagem:**

feat(jarvis): Nível 1 Python — câmera, reconhecimento facial e voz

Módulos locais Python do Jarvis integrados ao projeto:
- camera_motion.py: detecta movimento e acorda o sistema
- face_recognition_module.py: identifica usuários pela câmera
- voice_command.py: wake word + comandos por voz
- jarvis.py: pipeline completo integrado

https://claude.ai/code/session_01YTeCzbzYaLtoV1uhYpvMEf
**Arquivos afetados:** 6
### Arquivos criados

- `jarvis-python/README.md`
- `jarvis-python/nivel1/camera_motion.py`
- `jarvis-python/nivel1/face_recognition_module.py`
- `jarvis-python/nivel1/jarvis.py`
- `jarvis-python/nivel1/requirements.txt`
- `jarvis-python/nivel1/voice_command.py`

---

## Commit 195 — `4ddac309b0fbfb63bfd23826aadee6b030c73286`
**Link:** [4ddac309b0fb](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/4ddac309b0fbfb63bfd23826aadee6b030c73286)
**Data do autor:** `2026-05-30T00:49:08-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `45949a9edc6bb102b16e71c6d27156782de5f8ba cd0afc61f4cceccfcef893fdf29476ec2bc714d8`
**Resumo:** feat(jarvis): Nível 1 Python — câmera, reconhecimento facial e voz
**Corpo da mensagem:**

feat(jarvis): Nível 1 Python — câmera, reconhecimento facial e voz

feat(jarvis): Nível 1 Python — câmera, reconhecimento facial e voz
**Arquivos afetados:** 0

---

## Commit 196 — `14823873558659b929c1b889b6e554fee89a04fb`
**Link:** [148238735586](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/14823873558659b929c1b889b6e554fee89a04fb)
**Data do autor:** `2026-05-30T03:56:50+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `cd0afc61f4cceccfcef893fdf29476ec2bc714d8`
**Resumo:** feat: reorganiza sidebar em 10 grupos + página /roadmap
**Corpo da mensagem:**

feat: reorganiza sidebar em 10 grupos + página /roadmap

Sidebar:
- Divide "Ferramentas" (19 itens) em 6 grupos temáticos
- Grupos: Início, IA & Jarvis, Código & Dev, Ciência & Lógica,
  Segurança & Cripto, Criativo & Visual, Conhecimento,
  Mídia & Entretenimento, Campo & Tático, Sistema
- Corrige ícones duplicados (◉, ⚙, ⚿, ◫, ▦)
- Adiciona /roadmap ao grupo Início

Roadmap:
- Nova página /roadmap com estado atual e próximos passos
- Seção Jarvis por níveis (1-4) com status visual
- Seção site por área com feito/a seguir
- Seção visão final em pipeline visual

https://claude.ai/code/session_01YTeCzbzYaLtoV1uhYpvMEf
**Arquivos afetados:** 5
### Arquivos criados

- `src/pages/roadmap.js`
- `src/styles/roadmap.css`
### Arquivos modificados

- `index.html`
- `src/layout/sidebar.js`
- `src/main.js`

---

## Commit 197 — `477efd75430178bfd93aed0c8d614abbe9c14a8c`
**Link:** [477efd754301](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/477efd75430178bfd93aed0c8d614abbe9c14a8c)
**Data do autor:** `2026-05-30T00:57:14-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `4ddac309b0fbfb63bfd23826aadee6b030c73286 14823873558659b929c1b889b6e554fee89a04fb`
**Resumo:** feat: reorganiza sidebar em 10 grupos + página /roadmap
**Corpo da mensagem:**

feat: reorganiza sidebar em 10 grupos + página /roadmap

feat: reorganiza sidebar em 10 grupos + página /roadmap
**Arquivos afetados:** 0

---

## Commit 198 — `6b95d63b46dcf4db34053b5efda9a03d9fa47120`
**Link:** [6b95d63b46dc](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/6b95d63b46dcf4db34053b5efda9a03d9fa47120)
**Data do autor:** `2026-05-30T04:00:04+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `14823873558659b929c1b889b6e554fee89a04fb`
**Resumo:** feat: sentinel — registro oculto de acessos (hx-beacon)
**Corpo da mensagem:**

feat: sentinel — registro oculto de acessos (hx-beacon)

Módulo hx-beacon.js: captura IP, localização, fingerprint,
timestamp e rota de cada sessão única, envia via sendBeacon
para endpoint privado configurável. Sem bloqueio de carregamento,
sem dados de email, 1 registro por sessão por fingerprint.

https://claude.ai/code/session_01YTeCzbzYaLtoV1uhYpvMEf
**Arquivos afetados:** 2
### Arquivos criados

- `src/utils/hx-beacon.js`
### Arquivos modificados

- `src/main.js`

---

## Commit 199 — `2dff45db029e0edf597a3ab30d199ab1f7c3a5b6`
**Link:** [2dff45db029e](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/2dff45db029e0edf597a3ab30d199ab1f7c3a5b6)
**Data do autor:** `2026-05-30T01:01:10-03:00`
**Autor:** Lucas Belucci Bellini `<lucasbb2007@gmail.com>`
**Pais:** `477efd75430178bfd93aed0c8d614abbe9c14a8c 6b95d63b46dcf4db34053b5efda9a03d9fa47120`
**Resumo:** feat: sentinel — registro oculto de acessos
**Corpo da mensagem:**

feat: sentinel — registro oculto de acessos

feat: sentinel — registro oculto de acessos
**Arquivos afetados:** 0

---

## Commit 200 — `0fbeab11a0d2720b16962d487c9737cf67e46607`
**Link:** [0fbeab11a0d2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/0fbeab11a0d2720b16962d487c9737cf67e46607)
**Data do autor:** `2026-05-30T04:02:37+00:00`
**Autor:** Claude `<noreply@anthropic.com>`
**Pais:** `6b95d63b46dcf4db34053b5efda9a03d9fa47120`
**Resumo:** docs: guia de configuração do sentinel (somente planilha)
**Corpo da mensagem:**

docs: guia de configuração do sentinel (somente planilha)

Instruções para ativar hx-beacon via Google Sheets + Apps Script.
Registra acessos na planilha sem notificações externas.

https://claude.ai/code/session_01YTeCzbzYaLtoV1uhYpvMEf
**Arquivos afetados:** 1
### Arquivos criados

- `jarvis-python/SENTINEL_SETUP.md`

---
