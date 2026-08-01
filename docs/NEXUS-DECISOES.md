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
