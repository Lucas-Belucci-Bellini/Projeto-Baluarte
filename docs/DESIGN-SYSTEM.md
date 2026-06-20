# 🎨 Design System — Projeto Baluarte (Mark XIII)

> **Por que este doc existe.** A direção do operador (#246, #196, #207, #195) é dar
> uma **nova cara** ao site e **fechar o design antes de seguir com as funções** —
> pra tudo que vier ser construído em cima de uma base visual consistente. Este é o
> **contrato visual** do Baluarte: tokens, componentes e diretrizes. Toda página/
> feature nova deve sair daqui (nunca cores/spacings "na mão").

**Estética:** *Material 3 Dark + Neon tático/cinematográfico* (HUD). Ciano↔magenta
sobre fundo quase-preto, com **glow** e **profundidade**. Referências do operador:
Rockstar VI (imersivo/cinematográfico), Steam (organização de muito conteúdo),
Claude Code (consistência/limpeza), + Figma do #246 (charts, **coolicons**, CrowStudy)
e moodboard do Pinterest.

> ⚠️ **Figma do #246:** são *community files* — o Figma MCP exige **acesso de edição**
> pra ler. Pra extrair deles direto, o operador precisa **duplicar/compartilhar** os
> arquivos como editor. Enquanto isso, este doc define a direção a partir dos tokens
> reais do repo + recursos open-source (coolicons é MIT).

---

## 1. Princípios

1. **Web leve / App pesado (#238).** Conteúdo, narrativa e ferramentas leves no web;
   3D pesado, IA e motor real no app (gated por `window.baluarte.native`). O design
   precisa ser bonito **sem** depender do que é pesado.
2. **Tokens primeiro.** Cor, espaço, raio, sombra, tipografia, transição → **sempre**
   via variável de `variables.css`. Nada de hex/px solto em página.
3. **Só visual, sem quebrar.** Glow/profundidade via `box-shadow`, pseudo-elementos e
   `background-clip` — sem mexer em layout/JS quando o objetivo é estético.
4. **Acessível.** Respeitar `prefers-reduced-motion` (já global), contraste AA,
   foco visível (outline ciano), navegação por teclado.
5. **Coeso.** Um título neon, um card, um tile, um chip — os mesmos em todo o site.

---

## 2. Tokens (fonte: `src/styles/variables.css`)

### Cores
| Papel | Token | Valor |
|---|---|---|
| Fundo | `--color-bg` / `--color-bg-elevated` | `#0a0a0a` / `#0f1419` |
| Superfícies | `--color-surface` `…-2` `…-3` | `#112233` → `#1c2e47` |
| **Marca ciano** | `--color-cyan` (+`-soft`/`-edge`) | `#00f0ff` |
| **Marca magenta** | `--color-magenta` (+`-soft`/`-edge`) | `#ff00aa` |
| Texto | `--color-text-primary/secondary/muted` | `#e6f1ff` `#93a4bf` `#5a6b85` |
| Estados | `--color-success/warning/danger/info` | `#00ff88` `#ffaa00` `#ff3355` `#66ddff` |

**Regra de uso:** ciano = ação/destaque primário; magenta = acento/segundo plano
(impacto, "contínuo", risco alto); estados só pra status real. Gradiente de marca:
`linear-gradient(92deg, #e6f1ff, var(--color-cyan) 60%, var(--color-magenta) 118%)`.

### Tipografia
- **Sans:** Inter (`--font-sans`/`--font-display`). **Mono:** JetBrains Mono (`--font-mono`) — dados, código, HUD, métricas.
- Escala: `--font-size-xs…display` (11→48px). Pesos: 300–700. Tracking: `--tracking-*`.

### Espaço / Raio / Sombra / Movimento
- Espaço: escala 4px (`--space-2xs…3xl`). Raio: `--radius-xs…pill`.
- Sombra: `--shadow-sm/md/lg` + **glow** `--shadow-glow-cyan(-strong)` / `-magenta(-strong)`.
- Transições: `--transition-fast/base/slow` (cubic-bezier padrão).
- Layout: `--header-height` 56 · `--sidebar-width` 240/64 · `--content-max-width` 1440 · z-index escalonado.

---

## 3. Componentes & padrões (a "linguagem" do redesign já aplicada)

> Estes são os padrões que as Ondas de redesign (#242–#244, #251–#255) firmaram. Reusar,
> não reinventar. Folha de referência: `militar.css` (bloco "Polish cinematográfico").

- **Atmosfera global** — `.bx-atmosphere` (`src/utils/atmosphere.js` + `atmosphere.css`): UMA camada de fundo montada 1x pelo shell, atrás de TODO o app — auroras volumétricas que respiram + raios de luz + grid HUD à deriva + vinheta. É o que dá o "nível Spline" (#262) pra todas as páginas **de uma vez**, sem peso (só CSS, `pointer-events:none`, reduced-motion ok). Heróis de página entram **por cima** dela.
- **Header de página = painel HUD** — `.page-header` ganhou barra de acento luminosa à esquerda (`::before`) + linha de varredura animada embaixo (`::after`), global em `components.css` → todas as ~68 páginas com `.page-header` viram "painel de comando" sem editar página.
- **Título de página** — `.page-header__title`: degradê neon + `drop-shadow` (agora global em `components.css`).
- **Card** (`.card` e variantes de página) — fundo em gradiente sutil, borda fina; **hover = `translateY(-2/3px)` + `--shadow-glow-cyan` + borda `--color-cyan-edge`**. Magenta para o "segundo eixo".
- **Tile / stat** — valor em mono com `text-shadow` ciano; barra de acento no topo (`::before` gradiente).
- **Moldura HUD** — cantos luminosos via `::before/::after` (ver `/fft`, `/radar`) pra canvas/scopes/telas.
- **Tabs** (cockpit) — `.gn-cock__tab`: pill, ativa com `--color-cyan-soft` + glow.
- **Chip / badge** — pill com borda neon; ativo em `--color-cyan-soft`.
- **Botão** — `.btn` (+`--primary`/`--magenta`/`--ghost`): hover com glow.
- **Timeline** — espinha em gradiente ciano→magenta, nós com glow.
- **Tabela** — header mono em maiúsculas, hover de linha com tinta ciano leve.
- **Scroll-reveal** — global, leve (IntersectionObserver), respeita reduced-motion.

---

## 4. Iconografia → adotar **coolicons** (do #246)

**Hoje:** `src/utils/icons.js` tem ícones de linha SVG por rota + **fallback em emoji/glifo**
na sidebar e em vários cards — visual inconsistente.

**Direção:** padronizar num set **único de linha**: **coolicons** (≈430 ícones, MIT,
open-source — dá pra usar sem o Figma, via os SVGs do projeto). Diretrizes:
- Stroke ~1.5px, `currentColor` (herda a cor do contexto → glow ciano de graça).
- Tamanhos: 16 (inline), 20 (sidebar/botão), 24 (headers/cards).
- Plano de migração (incremental, 1 PR por área): (1) registrar os SVGs do coolicons num
  mapa em `icons.js`; (2) trocar a sidebar; (3) cards/headers; (4) aposentar os emojis.
- **Emoji só** onde for semântico/lúdico (ex.: bandeiras em país, 🎮 jogos) — decisão caso a caso.

---

## 5. Data-viz / charts (ref. Figma "Full charts components")

Tudo **canvas 2D puro** (sem lib pesada no web). Diretrizes:
- Linhas/barras: gradiente ciano→magenta; grid em `rgba(255,255,255,.06)`; eixos em `--color-text-muted`.
- Glow sutil nas séries (`shadow-glow-cyan` leve); tooltip em `--color-surface` + borda neon.
- Mono pros números. Páginas-alvo: `/graficos`, `/economia`, `/dolar`, `/poder-militar`, stats das calculadoras, `/fft`.

---

## 6. Imagens (moodboard Pinterest)

- Usar imagens com **overlay** escuro (gradiente pra `--color-bg`) pra manter legibilidade e coesão.
- Capas/heros: tratamento duotone ciano/magenta quando fizer sentido; sempre `loading="lazy"`.
- **Peso:** web leve — preferir SVG/CSS a imagens grandes; imagem pesada/decorativa rica → app.
- Guardar um moodboard (links/refs) numa issue dedicada conforme o operador for curando o Pinterest.

---

## 7. Redesign profundo dos flagships (#246/#196) — diretrizes

Ordem de impacto (escopo do #246): **`/home` · `/perfil` · `/arsenal` · `/biblioteca`**.
Além do polish já aplicado, "ir mais fundo" = **layout + hierarquia + componentes**:
- **Densidade estilo Steam** pra muito conteúdo (Arsenal 251 itens, 26 equipes, 24 arcos):
  filtros sticky, grid responsivo, "prateleiras" horizontais, cards com capa/typed-meta.
- **Hero cinematográfico** (home já tem 3D WebGL) — reforçar CTAs, métricas reais, prateleiras.
- **Hierarquia clara**: 1 título neon por página, seções com título em degradê, respiro (space-lg+).
- **Estado vazio / loading** consistentes (orbe + texto muted).
- **Mobile-first**: testar em ≤600px; sidebar vira drawer; grids colapsam.

### Cenas Spline (#262) → efeito nativo (o operador quer o site **no nível** delas)
As 25 cenas são o **alvo visual**, não embeds (o runtime Spline é pesado/dep externa).
Recriamos o "nível" nativamente (CSS/WebGL/canvas) — e o slot Spline real fica de
bônus (`spline-scenes.js`, se o operador exportar `.splinecode`). Mapa de tradução:

| Referência (#262) | Efeito nativo (sem dep) | Onde |
| --- | --- | --- |
| *Futuristic Rays Background* | raios volumétricos (conic `@property`) | atmosfera global + herói home |
| *text animation-Holographic* | título holográfico animado | `.page-header__title` / `.hv2-title` |
| *AI Landing* / *Sci-fi Spaceship* | herói WebGL (galáxia + arc-reactor) | `hero-webgl.js` |
| *The Eternal ARC* / *Retro circuit loop* | anéis/orbe + grid HUD | Núcleo de IA / cockpit |
| *Orbital View of Arrakis* | esfera/órbita em canvas | `/universo` |
| *AI Bot Bento UI* | grid **bento** com glow | home / flagships |
| *Heart Health HUD* / *3D Diagram* | moldura HUD (cantos + scanline) | `/perfil`, scopes |
| *Boxes Hover* / *Connecting Card* | cards glassy com lift + glow | padrão de card (seção 3) |

---

## 8. Como usar (checklist por feature/página)

- [ ] Partir destes tokens/componentes (sem hex/px solto).
- [ ] Título via `.page-header__title`; cards/tiles/tabs nos padrões da seção 3.
- [ ] Ícones do set único (coolicons) — não misturar emoji aleatório.
- [ ] Verificar no navegador (skill `run-projeto-baluarte` / Playwright), inclusive ≤600px e reduced-motion.
- [ ] Web leve: nada de dependência pesada no caminho do web (gate o pesado por `window.baluarte.native`).

---

## Refs
#195 (redesign) · #246 (mega redesign / Figma+Pinterest) · #196 (UI Rockstar/Steam/Claude) ·
#207 (3D imersivo — **local**, Three.js) · #238 (web leve/app pesado). Tokens: `src/styles/variables.css`.
