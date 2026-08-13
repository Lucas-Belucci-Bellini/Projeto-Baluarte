# Triagem das issues abertas — gate da 1.0.0

**Levantamento de 2026-08-09 · 53 issues abertas.**

Este documento existe por causa de **uma** pergunta do gate da 1.0.0
([`HARDENING-1.0.0.md`](./HARDENING-1.0.0.md#-o-gate-da-100--o-que-fecha-a-versão)):

> não dá para afirmar que a 1.0.0 é sólida sem saber se alguma delas descreve
> algo quebrado no que está marcado **estável**.

Não é para ser uma classificação bonita das 53. É para responder aquilo, e o
resto é o que sobrou do caminho. **A decisão de fechar issue é do operador** —
aqui não fechei nenhuma.

## A resposta

**Nenhuma das 53 issues abertas descreve um defeito no que está marcado
`estavel`.**

O que é `estavel` hoje (de `src/core/politica.js`, a mesma tabela que o README
publica): `core` · `arsenal` · `biblioteca` · `calculadoras` · `cripto` · `pwa`.

Três issues *pareciam* contradizer isso — são justamente as de título alarmante
que a `HARDENING-1.0.0.md` citou pelo nome. As três se dissolvem quando se lê o
corpo:

| Issue | O título sugere | O corpo diz |
|---|---|---|
| **#197** `resolver o editor de codigo` | bug | é o **editor**, que está `beta`. Beta não é promessa da 1.0.0 — é exatamente para isso que o nível existe. |
| **#307** `arrumar (supabase)` | bug | não é conserto: é pedido para **reformular o Supabase num "banco universal"** (perfis profundos, bookmarks de mídia, sync entre desktop e web). Isso é **V2** — arquitetura de dados, #420/#422. |
| **#210** `temos que arrumar` | bug | é um **log de build da Vercel colado**, de 13/06, de uma branch que não existe mais. Os três alertas dele estão mortos: não há `.gitmodules` no repo (o aviso de submódulo era espúrio), `engines.node` já é `24.x` (o aviso era sobre `>=18`), e o terceiro era performance de cache do runner, não do produto. |

O `#210` merece uma nota: ele é o motivo de a triagem ter sido **promovida** de
"pode esperar a 1.1" para o gate. Valeu a promoção — mas o que ela achou foi
que o alarme era falso, e isso é um resultado, não um desperdício. Uma issue
chamada "temos que arrumar" custou dois meses de dúvida porque ninguém tinha
lido o corpo dela.

## O resto, agrupado

**🔒 Guarda-chuva — não fechar (9):** #420 · #422 · #248 · #240 · #238 · #222 ·
#231 · #195 · #406. São referência viva; estão listadas como tal no `CLAUDE.md`.

**📖 Conteúdo narrativo (13):** #372 (mangá das Crônicas) e os capítulos #373–#383.
São rascunho de história, não código. Não tocam o gate.

**🧪 Fora do que a 1.0.0 promete (beta/experimental) (11):** #197 (editor) ·
#356, #403 (músicas → `media`) · #310, #207, #262 (3D) · #316, #340, #348, #369
(IA) · #204, #200, #203 (ferramentas do Núcleo). Nenhuma trava o congelamento,
porque nenhuma dessas superfícies foi prometida como estável.

**🚀 Expansão do que é estável — mas expansão, não conserto (2):** #398
(masterplan da wiki de armas) e #386 (biblioteca total dos modpacks + 3D).
Tocam `arsenal`, que **é** estável, mas pedem mais alcance, não reparo. Pela
ADR-001 isso é depois do congelamento → #422.

**✅ Candidatas a fechar — o trabalho parece já ter entrado (6):**

| Issue | Por que parece resolvida |
|---|---|
| **#258** encolher a sidebar, seção IA vira uma entrada só | **feito**: `src/layout/sidebar.js:41-47` colapsou as 11 ferramentas em `/git-nexus` ("Núcleo de IA"), com o comentário citando #231/#238. |
| **#307** (1º comentário: "arranque da tela os botões e abas") | mesmo trabalho acima. O pedido de V2 que sobra é outro assunto. |
| **#210** | alarme falso, ver acima. |
| **#360** `ei` | não é tarefa — é um elogio ("adorei que vc colocou as úscs"). |
| **#323**, **#338** | fechar a **v0.4.0**. A numeração foi refeita pela ADR-003; a 0.4.0 não existe mais como alvo. |
| **#259** próxima release do app com o novo design | o redesign #246 entrou; a release que a substitui é a **1.0.0** do gate. |

**💭 Ideias soltas, sem escopo definido (12):** #186 · #193 · #194 · #196 · #205 ·
#208 · #291 · #246 · #405 (esta última é a migração Nexus, já rastreada junto
com #406). Não bloqueiam nada. Se virarem produto, o destino é o #422.

## O que isso destrava

O item **"Triagem das 53 issues abertas"** do gate pode ser marcado assim que o
operador concordar com a leitura acima. Com ele marcado, o único bloqueio que
sobra para a tag `v1.0.0` é a **release local do app** (sessão com a máquina —
[`HANDOFF-LOCAL.md` §A0](./HANDOFF-LOCAL.md#a0)), porque a 1.0.0 é a última
versão que o app instala sozinho e a mudança do `autoDownload` precisa estar
*dentro* dela.
