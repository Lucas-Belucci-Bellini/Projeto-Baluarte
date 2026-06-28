# 🎖️ Centro Militar — consolidação das frentes militares (#246)

> Ideia do operador: **juntar as ~13 páginas militares + Arsenal numa página só**,
> estilo Wikipédia, puxando conteúdo da **Wikipédia ao vivo** — sidebar mais
> limpa e site com muito mais conteúdo.

## Decisões (do operador)

- **Fonte de dados:** **Wikipédia ao vivo + cache** (REST API, CORS liberado, sem
  proxy). O **Supabase** entra *depois*, só pro que for **nosso** (curadoria /
  edições / anotações) — não pra copiar a Wikipédia.
- **Cloudflare:** **fora do v1** (a API da Wikipédia já é CORS-friendly; não há
  necessidade de proxy/cache server-side por enquanto).
- **Licença:** conteúdo da Wikipédia é **CC BY-SA 4.0** → a UI **sempre credita** a
  Wikipédia e linka o artigo.

## Estado (v1 — Fatias 1 e 2, entregues)

- **Hub `/militar` ("Centro Militar")** — `src/pages/militar.js` + `src/styles/centro-militar.css`.
  Layout estilo Wikipédia: **índice "Conteúdo"** (sticky) + **14 seções**. Cada
  seção: título + ícone, botão **"abrir página completa →"** (a página rica já
  existente), descrição, e um **extrato vivo da Wikipédia** (carregado sob demanda
  via IntersectionObserver, best-effort — se falhar, mostra link pro artigo).
- **`src/utils/wikipedia.js`** — `fetchWikiSummary(title, lang)` com cache
  (memória + localStorage, TTL 7 dias). CORS direto, sem dependência.
- **Sidebar enxuta** — o grupo "Seção Militar" passou de **13 itens → 1** ("Centro
  Militar"). As páginas individuais **seguem registradas** (acessíveis pelo hub e
  por URL direta) — **nada foi removido**.

### Mapa tópico → página → artigo (pt.wikipedia)
`enciclopedia`→/enciclopedia-militar→*Militar* · `forcas-armadas`→/forcas-armadas→*Forças armadas* ·
`orcamentos`→/orcamentos-militares→*Despesa militar* · `poder`→/poder-militar→*Potência militar* ·
`arsenal-exp`→/arsenal-expandido→*Armamento* · `especiais`→/forcas-especiais→*Forças especiais* ·
`organizacao`→/organizacao-militar→*Organização militar* · `tecnologia`→/tecnologia-militar→*Tecnologia militar* ·
`taticas`→/taticas-estrategias→*Tática militar* · `historia`→/historia-militar→*História militar* ·
`armas-pais`→/armas-por-pais→*Arma* · `guerras`→/guerras-conflitos→*Guerra* ·
`batalhas`→/batalhas-historicas→*Batalha* · `arsenal`→/arsenal→*Arsenal*

## Próximas fatias

- [ ] **Conteúdo+** — além do resumo, puxar seções específicas do artigo (Action API
  `extracts`/`sections`) e tabelas (ex.: gastos militares por país) onde fizer sentido.
- [ ] **Supabase (nosso)** — tabela de **curadoria/edições** (notas do operador,
  destaques, ordenação) que sobrepõe o conteúdo da Wikipédia. Prepara migration +
  aplica via dashboard/MCP (split do #291).
- [ ] **Busca** dentro do hub (filtrar seções) e deep-link por seção (`?sec=`).
- [ ] Avaliar **dobrar o conteúdo rico das páginas** dentro do hub (tabs) vs manter
  como link — medir peso (web leve #238).

## Refs
#246 (redesign) · #238 (web leve) · #291 (split Supabase remoto/local) ·
`docs/DESIGN-SYSTEM.md`. Fonte de conteúdo: Wikipédia (CC BY-SA 4.0).
