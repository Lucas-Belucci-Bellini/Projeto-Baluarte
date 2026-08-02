# Decisões da migração do Nexus

> Registro curto e datado de cada decisão que muda a forma do Nexus. Existe por
> um motivo prático: sem isso, daqui a três meses alguém abre o mapa, vê um 21º
> domínio e recomeça a discussão do zero — que é justamente o desgaste que a
> migração quer acabar.
>
> Uma decisão aqui é **fechada**. Reabrir exige entrada nova revogando a antiga,
> nunca edição silenciosa da existente.

---

## D-001 — Geo/tático vira o 21º domínio (`baluarte-geo`)

**Data:** 2026-08-01 · **Estado:** aceita · **Contexto:** #405 / #406

### O problema

Seis rotas do site — `/mapa`, `/radar`, `/geo`, `/find`, `/triangulacao`,
`/vanguard` — não cabiam em nenhum dos 20 domínios do plano. Ficariam órfãs no
meio da extração.

### A decisão

Criar **`baluarte-geo`** como 21º domínio, dono das seis. Ele **consome o motor
do Project-Vanguard**, em vez de reimplementar.

### Por quê

O Project-Vanguard **já é esse domínio**: GPS topográfico + computador de tiro,
com `src/engine/` de **zero dependência e zero DOM** — construído exatamente pra
rodar fora do navegador dele. Hoje esse motor está **vendorizado** em
`src/utils/vanguard/` (angles, ballistics, charges, fire-mission, geo, gridref,
mgrs). Cópia vendorizada é duas implementações da mesma física esperando
divergir em silêncio — o erro que o Vanguard proíbe por escrito ("nunca
reimplementar a física em outra linguagem; uma implementação, dois hosts").

As alternativas perdiam:

- **dobrar em `baluarte-tools`** — tools já é o maior domínio (22 rotas); iria a
  28 e viraria o depósito que a migração quer desfazer;
- **deixar no monólito** — só adia, e adia justo a parte com motor externo, que
  é a mais fácil de acoplar por contrato.

### Consequências

- O mapa passa a ter **21 domínios**; o verificador cobra registro de decisão
  para qualquer domínio fora dos 20 originais.
- `src/utils/fingerprint-engine.js` **muda de dono**: estava em `cibersec` por
  associação com o nome "find", mas `/find` é **posicionamento indoor por
  impressão acústica** (schollz/find), não segurança. Vai para `baluarte-geo`
  junto com a página.
- Ao extrair, `src/utils/vanguard/` **deixa de ser cópia** e passa a vir do
  Project-Vanguard. Enquanto isso não acontece, a cópia é a que vale.
- Falta **criar o repositório `baluarte-geo` no GitHub** — os outros 20 já
  existem.

---

## D-002 — Social vai para o `Projeto-Baluarte-Social-Media`

**Data:** 2026-08-01 · **Estado:** aceita · **Contexto:** #405 / #406

### O problema

`/mural` (feed) e `/comms` (Rede Neural, chat em tempo real) são domínio social,
que o plano dos 20 não previu.

### A decisão

As duas rotas vão para o repositório **`Projeto-Baluarte-Social-Media`**, que já
existe. Ele entra na composição final como **externo**: publica rotas pelo mesmo
contrato v1.0.0 que um domínio, mas não é um dos domínios do Nexus.

### Por quê

O repositório existe e é exatamente esse escopo. Abrir um 22º domínio pra duas
rotas seria repetir o motivo da migração — mais superfície pra manter sem ganho.
Dobrar em `baluarte-profile` misturaria identidade do operador com plataforma
social, que têm ciclos de vida diferentes (perfil é local e persistido; social
depende de banco e tempo real).

### Consequências

- O mapa ganha a seção **`externos`**: repositório de fora que possui rota. Todo
  externo é obrigado a declarar a decisão que o trouxe e a forma de integração —
  senão o verificador falha.
- `src/core/comms.js` e `src/core/realtime.js` migram junto: são a plumbing de
  tempo real dessas duas telas, e ninguém mais depende delas.
- Com D-001 e D-002, **as 97 rotas têm dono. Zero lacunas.**

---

## D-003 — A home recebe destaques declarados, não importa dados alheios

**Data:** 2026-08-02 · **Estado:** aceita · **Contexto:** extração do shell

### O problema

`src/pages/home.js` importa quatro datasets de três outros domínios —
`data/arsenal.js` (arsenal), `data/elites.js` (elites), `data/cronicas.js` e
`data/universos.js` (content) — para mostrar contadores e duas prateleiras de
destaque.

Isso quebra a regra que sustenta o Nexus: **um domínio não importa outro
domínio**. E cobra caro por isso: a home é **eager** (primeiro paint), então os
**122 kB** desses datasets entram no bundle do boot da web — contra a regra do
mega-plano #238 de que a web é o lado leve.

### A decisão

O contrato ganha `destaques` (v1.1.0): **quem tem o dado declara o que quer
expor**. A casca só renderiza o que recebe.

### Por quê

As alternativas resolviam metade:

- **mover os 4 datasets pro `baluarte-data`** — some o import cruzado, mas o
  shell continua acoplado ao formato dos dados alheios e os 122 kB seguem no
  boot. Trocaria uma violação visível por uma invisível;
- **home sem destaques** — resolve tudo e destrói a vitrine que a home é.

A escolha inverte o fluxo em vez de mudar o dono do dado. E como `total` vira
número declarado e `itens` vira `() => import(...)`, o contador para de custar
bundle e a prateleira sai do caminho crítico.

### Consequências

- Contrato vai a **1.1.0**. `destaques` é opcional: quem não usa segue em
  1.0.0 sem mudar nada, e o orquestrador só recusa **major** diferente.
- `arsenal`, `elites` e `content` passam a declarar `destaques` e sobem para
  1.1.0. Os outros 18 ficam em 1.0.0 até terem motivo.
- O verificador cobra que a `rota` de um destaque seja do próprio domínio —
  senão "destaque" viraria porta dos fundos pro acoplamento que a regra proíbe.
- Cada repositório carrega o verificador da versão que implementa; não há
  atualização em massa dos 21 por uma mudança que 3 usam.

---

## D-004 — O rótulo do skin de universo é do shell, não do content

**Data:** 2026-08-02 · **Estado:** aceita · **Contexto:** extração do shell

### O problema

`src/utils/universe-theme.js` (shell) importava `UNIVERSOS` do dataset do
**content** para montar o seletor de skin. Do dataset inteiro ele usava três
campos: `id`, `name` e `color` de fallback — a tabela de skin (cores, fonte,
raio) já morava no próprio motor, enumerando cada universo à mão.

Cross-domain import pra pegar um rótulo.

### A decisão

O `label` passa a morar na tabela `SKIN` do shell, junto do resto da
configuração visual. O motor deixa de importar o content.

### Por quê

O que aparece no seletor de skin é **decisão visual da casca**, não conteúdo
narrativo. A tabela já listava todos os ids um a um; o rótulo estava separado
do resto da configuração por conveniência, não por arquitetura.

Usar `destaques` (D-003) aqui não serviria: aquilo é vitrine da home, e o
seletor de skin precisa da lista no boot.

### Consequências

- **Custo declarado: o nome fica duplicado.** Se o content renomear um
  universo, o rótulo do skin não segue sozinho. São 20 rótulos, mudam pouco, e
  a alternativa era a casca depender de um domínio de conteúdo pra se pintar.
- Universo sem entrada na `SKIN` continua caindo no tema padrão, como antes.
