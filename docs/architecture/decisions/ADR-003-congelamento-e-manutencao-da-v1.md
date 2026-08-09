# ADR-003 — O que "congelar a V1" significa na prática

**Data:** 2026-08-09 · **Estado:** aceita · **Contexto:** [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420) · **Depende de:** [ADR-001](./ADR-001-1.0.0-como-ponto-de-congelamento.md)

## O problema

O ADR-001 decidiu que a 1.0.0 é um **ponto de congelamento**. Faltava dizer o que
isso quer dizer no dia seguinte à tag: o que ainda pode entrar no `main`, o que o
app desktop faz, e onde funcionalidade nova passa a morar.

Sem essa regra escrita, "congelado" degrada sozinho. O caminho é conhecido: entra
uma correção, depois uma correção *com uma melhoriazinha junto*, depois uma
funcionalidade "pequena" — e seis meses depois existem duas versões vivas se
desenvolvendo em paralelo, que é exatamente o que o congelamento queria evitar.

## A decisão

### 1. Numeração

A V1 congelada é a **1.0.0**. A V2 será a **2.0.0**.

O `package.json` dizia `2.0.0` — numeração interna do Mark XIII, nunca publicada
(o repositório **não tinha nenhuma tag git**). Renumerado para `1.0.0-rc` durante
a fase de hardening, e vira `1.0.0` no congelamento.

### 2. Depois da tag `v1.0.0`, o `main` recebe só:

- correção de bug;
- correção de segurança;
- atualização de dado (Arsenal, Arma 3, câmbio — os pipelines automáticos seguem);
- documentação.

**Não recebe:** funcionalidade nova, refatoração arquitetural, mudança de
dependência que não seja correção de segurança. Isso tudo vai para a
`architecture/v2`.

### 3. O app desktop trava na V1

O Baluarte Launcher carrega a produção e se auto-atualiza. A partir da 1.0.0 ele
fica **preso na linha 1.x**: recebe correção, não recebe funcionalidade. A V2 vai
ter release própria quando existir — o operador não é migrado sem decidir.

### 4. A régua para decidir

Quando não estiver claro se algo entra na 1.x ou vai para a V2:

> **Isso conserta algo que está quebrado na 1.0.0, ou adiciona algo que ela nunca
> teve?**

Conserta → 1.x. Adiciona → V2. Não existe terceira resposta, e "é rapidinho" não
é argumento — o custo do congelamento não é o tamanho da mudança, é ter duas
versões vivas ao mesmo tempo.

## Por quê

**Uma linha-base só serve enquanto for estável.** O valor da 1.0.0 é poder dizer
"temos isto funcionando" quando a V2 der problema. Uma 1.0.0 que continua
recebendo funcionalidade não é linha-base, é uma segunda frente de trabalho — e
duas frentes ao mesmo tempo é como as versões Mark anteriores quebraram.

**Travar o app é o que torna o congelamento real para quem usa.** Se o launcher
continuar puxando tudo que entra na produção, "congelado" vira só uma palavra no
repositório: o operador segue recebendo mudança.

## Consequências

- Precisa existir a tag `v1.0.0`. Sem ela não há para onde voltar, e a decisão do
  ADR-001 fica sem objeto.
- A branch `architecture/v2` abre **depois** da tag, não antes (ver o gate em
  [`../v2-vision.md`](../v2-vision.md)).
- Ideia de funcionalidade que aparecer durante o congelamento vai para a
  [#422](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/422),
  não para o `main`.
- O `desktop/package.json` tem versionamento próprio (`0.9.2`) e precisa de uma
  sessão **local** para alinhar e publicar a release da 1.0.0 — está na fila de
  [`../../HANDOFF-LOCAL.md`](../../HANDOFF-LOCAL.md).
- Três arquivos carregam o número da versão (`package.json`, `src/data/version.js`,
  `public/sw.js`) e não conseguem se importar. `test/versao.test.js` cobra que
  concordem — a divergência do Service Worker já causou "cache velho servido após
  deploy" duas vezes.

## O que revogaria esta decisão

Descobrir na 1.0.0 um defeito cuja correção **exige** mudança arquitetural. Aí a
correção não cabe na regra da seção 4, e é preciso escolher explicitamente entre
antecipar parte da V2 ou conviver com o defeito — com ADR novo dizendo qual foi.
