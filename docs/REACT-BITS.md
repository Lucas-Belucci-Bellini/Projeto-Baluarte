# ✨ react-bits → efeitos vanilla do Baluarte (#246)

> Direção do operador (#246): recriar o visual do site/app usando o
> [**react-bits**](https://github.com/DavidHDev/react-bits) como base de efeitos.
> Este doc é a **curadoria + plano de adoção**, alinhado ao `DESIGN-SYSTEM.md`.

## ⚠️ A restrição que define a estratégia

react-bits é **React 19** + stack pesada (`@react-three/fiber`, `drei`,
`postprocessing`, `rapier`, `three`, `ogl`, `gsap`, `motion`/framer-motion,
`matter-js`). O Baluarte é **JS puro, sem framework, web leve** (#238). Então
**não dá pra usar "como está"** sem quebrar as duas regras-mãe do projeto.

**Licença: MIT + Commons Clause** (© David Haz). Permite usar os efeitos *dentro
do nosso site/app*, mas **proíbe vender/sublicenciar/redistribuir os componentes
em si — inclusive uma versão portada**. Por isso:

- ❌ **Não commitamos o código do react-bits** no repo (nem como vendor).
- ✅ **Estudamos e reimplementamos** os efeitos do zero em **vanilla JS/CSS** com
  os **tokens do Baluarte**, **creditando o autor** no cabeçalho de cada porta.

## 🗺️ Mapa de portabilidade (134 componentes)

| Categoria | Total | WebGL pesado (OGL/Three) | GSAP | CSS/motion → **vanilla leve** |
|---|--:|--:|--:|--:|
| TextAnimations | 23 | 1 | 6 | ~16 |
| Components | 36 | 5 | 11 | ~20 |
| Backgrounds | 45 | **38** | — | ~7 |
| Animations | 30 | ~9 | ~12 | ~9 |

- **~50 são CSS/motion** → portam pra **CSS puro** (mais leves que no react-bits,
  sem framer-motion): vão pro **web**.
- **~29 usam GSAP** → CSS/WAAPI quando der; GSAP só se valer muito a pena.
- **~53 são WebGL** (Aurora, Galaxy, Plasma, LightRays, Threads…) → **pesados**:
  trilha **app/lazy** do #238, ou portar o shader pro nosso harness sem-dep
  (`hero-webgl.js`), **gated** por `window.baluarte.native`.

## 🧱 Camada de efeitos (vanilla)

- `src/utils/effects.js` + `src/styles/effects.css` — efeitos reutilizáveis, sem
  dep, com tokens e `prefers-reduced-motion`. Registrado no boot (`index.html`).

| Efeito (react-bits) | Porta vanilla | Como usar |
|---|---|---|
| ShinyText | `.fx-shiny` (CSS puro) | classe num texto; cor via `--fx-shine-*` |
| SpotlightCard | `attachSpotlight(el)` + `.fx-spotlight` | brilho radial que segue o cursor em cartões |
| DecryptedText | `decryptText(el)` + `decryptTitles(root)` | revelação "decifrando"; ligado **global** nos `.page-header__title` via `shell.renderPage` |
| TiltedCard | `attachTilt(el)` + `.fx-tilt` | inclinação 3D (rotateX/Y ±amp, clampada) que segue o cursor em cartões |

**Aplicado**: `/home` → `fx-shiny` no kicker + spotlight nas células do bento;
**56 páginas** com `.page-header__title` → reveal "decifrando" a cada navegação
(hook único em `shell.renderPage`). Verificado no navegador.

## ✅ Como adicionar um efeito portado

1. Estudar o componente no react-bits (referência **local**, fora do repo).
2. Reimplementar em `effects.css` (e `effects.js` se precisar de JS) com tokens +
   reduced-motion; **creditar o autor** no cabeçalho.
3. Se for **WebGL**, ir pro harness sem-dep e **gatear** por `window.baluarte.native`
   (web mostra fallback/poster; app ativa) — ver `spline-embed.js`/`immersive.js`.
4. Aplicar numa página, **verificar no navegador** (skill `run-projeto-baluarte`).
5. 1 área por PR (igual à adoção dos ícones do #246); atualizar o `CHANGELOG`.

## 🛣️ Roadmap (incremental, via Design System)

- [x] **Fatia 0** — camada `effects.*` + 2 efeitos (ShinyText, SpotlightCard) + PoC no `/home`.
- [x] **Texto · 1ª fatia** — DecryptedText portado e ligado **global** nos títulos de página (56 páginas, reveal a cada navegação).
- [ ] **Texto · resto** — GradientText, RotatingText, TrueFocus p/ headers/destaques específicos.
- [x] **Cartões · 1ª fatia** — TiltedCard portado e aplicado nos cards das prateleiras do `/home` (densidade estilo Steam).
- [ ] **Cartões · resto** — GlareCard, BorderGlow, MagicBento p/ os hubs e demais grades de cartões.
- [ ] **Fundos leves** — os ~7 backgrounds CSS (SoftAurora, Grainient…) como camada de profundidade.
- [ ] **Fundos WebGL (app/lazy)** — Aurora/Galaxy/Plasma/LightRays no harness sem-dep, gated #238.
- [ ] Aposentar graduamente CSS antigo conforme as páginas migram pra esta linguagem.

## Refs
#246 (mega redesign) · #195 (redesign) · #262 (estudo 3D/Spline) · #238 (web leve/app pesado) ·
`docs/DESIGN-SYSTEM.md` (contrato visual). Fonte de inspiração: react-bits © David Haz (MIT + Commons Clause).
