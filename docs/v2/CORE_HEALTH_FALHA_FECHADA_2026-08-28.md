# Contrato — a sonda de saúde responde, não levanta

**Data:** 2026-08-28
**Fase:** 7 — Observability · Core health (`v2/core/saude.js`)
**Verificação:** `test/v2/saude-falha-fechada.test.js`

## Por que isto importa agora

O diagnóstico da Plataforma passou a **agregar** saúdes: a alpha.20 juntou a do
Task Manager, e há trabalho em curso para juntar a do Event Bus. Um agregado é
tão robusto quanto a sonda mais frágil que ele chama — e uma que estoura derruba
o agregado inteiro, não só a sua própria linha.

## Os três defeitos

### 1. A sonda podia levantar em vez de responder

`verificar()` chamava `boot.diagnostico()` sem guarda. Um Boot que rebenta ao
ser perguntado fazia a exceção subir para quem perguntou.

Este é o pior modo de falha possível **neste** componente: quem chama uma sonda
de saúde pergunta *"está saudável?"* para **decidir o que fazer**. Recebendo uma
exceção, o supervisor que devia reagir ao `unhealthy` morre junto com aquilo que
ia diagnosticar.

E não é lacuna de intenção. `avaliarSaude` já falha fechado para **qualquer**
retrato inválido — `null`, texto, número —, o que mostra que a robustez era o
desenho. O que faltava era o caminho do **lançamento**, que escapava por cima
dessa proteção em vez de passar por dentro dela.

O motivo distingue os dois casos, porque são problemas diferentes:

```
o diagnóstico do Boot levantou: <mensagem>   ← código a rebentar
retrato ausente                              ← ausência de retrato
```

### 2. O relatório dizia `undefined`

Um retrato sem `fase` produzia a linha **`"Core não está no ar: undefined"`** —
a não-mensagem clássica — e ainda fazia o campo `fase` **desaparecer do JSON**,
porque `undefined` não serializa: quem lesse o relatório não via sequer que
havia uma fase para saber.

O módulo já tinha a palavra certa: o caminho do retrato ausente usa
`'desconhecida'`. Passou a usá-la aqui também. A fase legítima continua intacta
— há teste a cobrar que a guarda não engole o valor bom.

### 3. O runtime não honrava o tipo que ele próprio declara

`saude.d.ts` declara `contagem` como **obrigatória**:

```ts
export interface HealthSnapshot {
  …
  contagem: { modulos: number; falhas: number; eventosOrfaos: number; referenciasOrfas: number };
}
```

E **todo** caminho de erro a omitia. Um consumidor TypeScript — `plataforma.ts`
é um — escreve `s.contagem.modulos` confiando no tipo e apanha um `TypeError`
**exatamente quando o sistema já está doente**, que é o pior momento para o
diagnóstico morrer.

Zero é a contagem honesta nesses caminhos: não se observou nada. A alternativa
— afrouxar o `.d.ts` para `contagem?` — empurraria a guarda para cada consumidor
e tornaria o tipo mais fraco em troca de não consertar nada.

## O que **não** mudou

Os vereditos. `parado` continua `unhealthy`; `no-ar` sem módulo continua sem
readiness; falha de módulo continua a degradar o diagnóstico **sem** derrubar o
veredito — a regra de isolamento do [`V2_HEALTH.md`](./V2_HEALTH.md). E a sonda
continua a consultar o Boot **a cada chamada**: um Boot que rebenta e depois
recupera tem de ser visto a recuperar, e cachear o `unhealthy` deixaria o sistema
marcado como doente para sempre. Há teste para isso.

## Verificação

`test/v2/saude-falha-fechada.test.js` — **13 testes**. Os 7 originais de
`test/v2/saude.test.js` ficam intactos e verdes.

**A prova de que apanham o defeito:** corridos contra o `saude.js` anterior,
**11 dos 13 falham**. Os 2 que passam nos dois são as guardas de regressão — a
fase legítima que continua intacta, e o bloco que cobra tudo o que a saúde já
garantia. Passar nos dois casos é o que se espera delas.

| gate | resultado |
|---|---:|
| `npm test` | `1422/1422` |
| `test/security/*` | `81/81` |
| `npm run v2:integracao` | `58/58` |
| `tipos:ts` · `tipos:v2` | 0 erros |
| `build`, `verificar-nexus`, catálogos, tabela de estabilidade | verdes |

## Coordenação

Esta entrega **não toca** em nenhum ficheiro dos PRs abertos no momento
(`bus.js`, `bus.d.ts`, `plataforma.ts`, `runtime-manager-group.js`,
`module-registry-health-check.mjs`, `hx-beacon.*`). `plataforma.ts` é
**consumidor** de `saude.js` e está a ser alterado noutra frente: como a
mudança aqui só torna a sonda incapaz de levantar, ela reforça esse trabalho em
vez de competir com ele.

## O que isto **não** faz

Não muda os estados de health, não cria supervisão, não reinicia nada, não
concede autoridade e não toca no `retry` da Fase 03 — que continua a depender de
uma decisão de política por classe de evento que não foi tomada.
