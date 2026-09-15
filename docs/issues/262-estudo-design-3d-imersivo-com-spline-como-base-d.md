# #262 — 🌌 Estudo: design 3D imersivo com Spline como base do novo visual das páginas

> **Status:** open · **Criada:** 2026-06-20 · **Atualizada:** 2026-06-20 · **Comentários:** 1
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/262
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

> Estudo pedido pelo operador: ~23 cenas 3D do **Spline** (community) como base pro
> redesign 3D/imersivo das páginas (liga com #207, #246, #195). Eu **cataloguei** cada
> cena (pelo nome — não consigo ver o 3D em si pelo ambiente remoto) e estudei **como
> integrar** + **o que dá pra criar** em cada página. Confirme visualmente as que curtir.

## ⚖️ Restrição que guia tudo (#238 + #207)
Spline roda via **WebGL** (runtime tipo Three.js) — é **pesado**. Pela regra **web leve /
app pesado**, 3D imersivo pesado é **trilha do app/local** (#207 já está na fila 🖥 do #240).
Então a estratégia por superfície:

- **Web (leve):** **poster** estático (imagem/vídeo curto export do Spline) como herói;
  carregar a cena Spline **só sob interação/lazy** e idealmente **gated** (`window.baluarte.native`);
  sempre com fallback e respeitando `prefers-reduced-motion`.
- **App (pesado, nativo):** cenas Spline interativas completas — onde o imersivo brilha.
- **Sessão LOCAL** (skills 3D do `claudedesignskills`) faz a integração pesada; o **remoto**
  prepara o scaffolding (componente gated + poster + slots por página).

## 🔌 Como integrar (opções)
1. **``** (web component, via CDN `@splinetool/viewer`) — mais simples; embrulhar num wrapper JS puro gated + `loading="lazy"` + poster.
2. **`@splinetool/runtime`** (npm) — controle fino (interagir com objetos da cena); é lib, não framework (ok no projeto), mas pesa → app.
3. **Export estático** (PNG/MP4/WebM) do Spline — pro **web leve** (herói "fake-3D" sem custo de runtime).
4. **Export GLTF** → reusar no nosso próprio WebGL/Three (trilha local) se quiser independência do Spline.

**Orçamento:** nada de runtime Spline no caminho inicial do web; 1 cena pesada por vez, lazy; medir antes de promover.

## 🗂️ Catálogo das cenas → uso sugerido no Baluarte
| Cena | Link | Onde usaria |
|---|---|---|
| AI Landing page web design 3D Animation | [↗](https://app.spline.design/community/file/07bc94d9-099e-4b76-a3fa-98d4f2902f58) | **Herói da /home** (Ponte de Comando) — app |
| Sci-fi Spaceship Landing Page Idea | [↗](https://app.spline.design/community/file/561feb0b-35ec-46a7-a3de-19ab7c3d80a4) | Herói alternativo /home / /universo |
| Futuristic Rays Background | [↗](https://app.spline.design/community/file/3850edd4-caa2-4a7e-bf60-1d08268d9714) | Fundo de herói (leve como poster) — várias páginas |
| Gridcorp | [↗](https://app.spline.design/community/file/59017495-063f-4bc6-b299-eaeacea31e93) | Fundo HUD / grid tático |
| The Eternal ARC | [↗](https://app.spline.design/community/file/3afbbf73-d552-4dcc-a0fb-73d369a63e71) | **Núcleo de IA / Git Nexus** (orbe) |
| Retrofuturistic circuit loop | [↗](https://app.spline.design/community/file/bdbc84fd-3666-4d9e-8cad-b843bf5660ee) | Git Nexus / Robótica / CiberSeg |
| 3D Diagram | [↗](https://app.spline.design/community/file/f7f4d237-3d25-4ff9-826a-e171ea1eb2ed) | Grafo do Git Nexus / /graficos / /economia |
| AI Bot Bento UI | [↗](https://app.spline.design/community/file/fe56b75f-bd8a-48bc-8aa4-146694fb6d47) | J.A.R.V.I.S. / Núcleo de IA (bento) |
| Heart Health HUD – Futuristic UI | [↗](https://app.spline.design/community/file/0c1cb369-d2a2-4378-b602-bebb96884976) | **/perfil** (Dossiê) / dashboards HUD |
| Connecting Card | [↗](https://app.spline.design/community/file/aa06bcbf-929d-41c6-97a5-1f1590169b77) | Cards de perfil/equipe (/elites, /perfil) |
| Boxes Hover | [↗](https://app.spline.design/community/file/a1f156f7-ef01-42d1-bf7b-5be1b7967b0a) | Grades de cards hover-reativas (hubs) |
| Cloner On-hover Lightning | [↗](https://app.spline.design/community/file/0bdd0046-2349-4ecb-afd4-04365b24e51f) | **/shadow** (auth) / efeitos de hover |
| text animation-Holographic | [↗](https://app.spline.design/community/file/17689182-aeb2-498e-af2f-a02392999355) | Títulos holográficos / boot / heróis |
| Tick Tock - Interactive Landing | [↗](https://app.spline.design/community/file/b9896ad5-e197-4971-9be5-72a184a062f5) | Landing interativa / seção destaque |
| Orbital View of Arrakis | [↗](https://app.spline.design/community/file/fbb436a3-5a3e-4c63-9d5c-7cd8fe92ce11) | **/universo** / /mapa / /geo (planeta orbital) |
| Futuristic Laboratory Scene | [↗](https://app.spline.design/community/file/227f7318-dd45-4b12-94bc-a9d832938171) | /tecnologia-militar / /robotica |
| Ducati XDiavel | [↗](https://app.spline.design/community/file/4a57794f-5c68-4e5b-afca-25ec452d0aaa) | Showcase de veículo → /arsenal / arsenal-expandido |
| Newton's Cradle | [↗](https://app.spline.design/community/file/d1402bbe-ad0b-4a72-80ee-c5e4bb0a39b3) | /portas /logic-sim /calc (física/lógica) |
| Pandemonium Chaos Artwork | [↗](https://app.spline.design/community/file/7d448f04-c6c5-47ab-bb6f-ec0e25f1ffeb) | 404 / tela de erro / arte de fundo |
| Prime sharing | [↗](https://app.spline.design/community/file/f30ae3e2-0df6-482a-9cf5-713fab9338f8) | /media /mural (compartilhamento) |
| SPLYN – Desktop Mockup (Front/Side) | [↗](https://app.spline.design/community/file/8f2c4fe1-1b7b-469a-86e5-2cc18ad0a44a) · [↗](https://app.spline.design/community/file/55a8cafd-17da-4857-8e21-eaad97087e2a) | **/baixar** (mockup do launcher no desktop) |
| SPLYN – Phone Mockup | [↗](https://app.spline.design/community/file/8ea5661b-7137-4e8f-92af-008344003dfe) | /baixar (mockup mobile) / PWA |

## 🧭 O que dá pra criar (síntese)
- **Heróis 3D por seção** (home, universo, núcleo de IA, perfil, arsenal) — a "nova cara" imersiva.
- **Orbe/grafo do Núcleo de IA** trocando o WebGL atual por uma cena Spline rica (no app).
- **Backgrounds HUD** (rays/grid/circuit) como camada de profundidade atrás do conteúdo.
- **Showcases** (Ducati→arsenal, laboratório→tecnologia, Arrakis→universo) — vitrine por tema.
- **/baixar** com mockup 3D do launcher (SPLYN) — página de download "estilo produto".
- **Títulos holográficos** e estados (404/boot) com personalidade.

## 🗺️ Plano faseado
- [ ] **F0 — Curadoria (operador):** marcar nesta issue quais cenas entram e em quais páginas (confirmar visualmente).
- [ ] **F1 — Scaffolding (remoto):** componente `spline-embed` JS puro — **gated** por `window.baluarte.native`, com **poster** (img/vídeo) + lazy + `prefers-reduced-motion` + fallback. Sem runtime no boot.
- [ ] **F2 — Posters no web (remoto):** export estático das cenas escolhidas como herói leve (web) — a "cara nova" sem custo de WebGL.
- [ ] **F3 — Cenas interativas no app (🖥 local):** integrar ``/runtime nas páginas escolhidas; medir bundle/FPS; promover só o que passar no orçamento.
- [ ] **F4 — Opcional:** GLTF → nosso WebGL/Three (independência do Spline) na trilha local.

## ⚠️ Riscos / a verificar
- **Performance/bundle** (runtime Spline + assets): medir; manter web leve.
- **Licença/atribuição** das cenas community (Spline costuma permitir remix, mas **confirmar** cada uma e creditar o autor).
- **Dependência externa** (CDN/Spline) — ter poster/fallback se a cena não carregar.
- **Acessibilidade**: sempre poster estático + respeitar reduced-motion.

## Refs
#207 (3D imersivo) · #246 (mega redesign) · #195 (redesign) · #238 (web leve/app pesado) · [`docs/DESIGN-SYSTEM.md`](../blob/main/docs/DESIGN-SYSTEM.md). Trilha de execução pesada: 🖥 local (`docs/HANDOFF-LOCAL.md`).

🤖 Gerado com [Claude Code](https://claude.com/claude-code)
