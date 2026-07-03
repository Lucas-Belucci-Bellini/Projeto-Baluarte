# 🎨 Design System — Projeto Baluarte (Mark XIII)

> **Por que este doc existe.** A direção do operador (#246, #196, #207, #195) é dar
> uma **nova cara** ao site e **fechar o design antes de seguir com as funções** —
> pra tudo que vier ser construído em cima de uma base visual consistente. Este é o
> **contrato visual** do Baluarte: tokens, componentes e diretrizes. Toda página/
> feature nova deve sair daqui (nunca cores/spacings "na mão").

**Estética (ATUAL — "Ouro de Fábula", Fable 5 V2):** fundo **violeta-escuro**
(`#0e0c16`) + acento **DOURADO** (`#d4a24e`/`#e8c07a`) + texto **pergaminho**
(`#f4ecdd`), tipografia **serifada** (Cormorant Garamond nos títulos, Spectral no
corpo, IBM Plex Mono no HUD), **grão de ruído** global e glow quente. Fonte do
design: branch `Redesign-Baluarte-3D` → `…Fable 5 V2/Baluarte Fable.dc.html`
(mockup do Claude Design). ⚠️ Os nomes de token `--color-cyan`/`--color-magenta`
foram **mantidos por compatibilidade** (~80 folhas + `heroSkinColors()`/efeitos):
hoje **cyan = ouro** e **magenta = ouro-claro**. Skins de universo seguem por cima.

*Estética anterior (histórico):* Material 3 Dark + Neon ciano↔magenta (HUD).
Referências do operador: Rockstar VI (imersivo/cinematográfico), Steam (organização
de muito conteúdo), Claude Code (consistência/limpeza), Figma do #246 (charts,
**coolicons**, CrowStudy), moodboard do Pinterest e react-bits (efeitos).

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

### Cores (Ouro de Fábula — tema padrão)
| Papel | Token | Valor |
|---|---|---|
| Fundo | `--color-bg` / `--color-bg-elevated` | `#0e0c16` / `#141020` |
| Superfícies | `--color-surface` `…-2` `…-3` | `#1d1729` → `#2c2340` |
| **Acento (ouro)** | `--color-cyan` (+`-soft`/`-edge`) | `#d4a24e` |
| **Acento 2 (ouro-claro)** | `--color-magenta` (+`-soft`/`-edge`) | `#e8c07a` |
| Texto (pergaminho) | `--color-text-primary/secondary/muted` | `#f4ecdd` `#a89a80` `#77694f` |
| Estados | `--color-success/warning/danger/info` | `#3ddc84` `#ffaa00` `#ff3355` `#e8c07a` |

**Regra de uso:** acento = ação/destaque primário; acento 2 = segundo plano
(impacto, "contínuo"); estados só pra status real. **NUNCA** hardcode a cor numa
folha de página: use o token ou, pra alfa, `color-mix(in srgb, var(--color-cyan) N%, transparent)`
— é isso que deixa **todas** as páginas seguirem os temas e os universos.

### Temas de fábula (`src/utils/theme.js`, picker em `/perfil`)
Do mockup Fable 5 V2 (objeto `THEMES` do `Baluarte Fable.dc.html`):
- **Ouro** (padrão, id `neon` por compat de storage) — os valores do CSS base acima.
- **Esmeralda** — `#2fbf8f`/`#8fd4b4`, fundo `#0a1210`, kit completo em `vars`.
- **Rubi** — `#c8556d`/`#e0a06d`, fundo `#140a0f`, kit completo em `vars`.

Temas de fábula carregam `vars` (fundo/painéis/texto/bordas) além do acento —
trocam o **mundo**, não só a cor. Os demais (Âmbar/Matrix/Tático/Violeta/Gelo) só
trocam acento. Universos (`universe-theme.js`) continuam por cima de qualquer tema.

### Tipografia
- **Corpo:** Spectral (`--font-sans`). **Títulos:** Cormorant Garamond (`--font-display`). **Mono:** IBM Plex Mono (`--font-mono`) — dados, código, HUD, métricas.
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
