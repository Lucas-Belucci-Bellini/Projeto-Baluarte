# Contrato — o segredo não sai pelo relatório de configuração

**Data:** 2026-08-24
**Fase:** 6 — Configuration (matriz de fases)
**Implementação:** `v2/core/config.js` ·
**Verificação:** `test/security/config-secret-contract.test.js`, `test/v2/config-diagnostico.test.js`

## O que o módulo promete, e onde não cumpria

O cabeçalho do `config.js` é explícito sobre o objetivo:

> *"O objetivo é que o caminho acidental — logar o objeto de config inteiro,
> mandar o diagnóstico para alguém, serializar num relatório — **não consiga**
> vazar."*

`paraDiagnostico()` cumpria: segredo sai como `••••••••`, com a informação que
interessa (se está definido) e sem a que não interessa a ninguém (o valor).
`toJSON` delega nele, então serializar também estava coberto.

**`validacao()` não estava.** E ela é, por desenho, o caminho mais acidental que
existe: o próprio código diz que *"config errada é falha de boot, não surpresa em
runtime"* — ou seja, é a coisa que se lê e se loga exatamente quando algo
correu mal.

## Os três defeitos

Todos nas mesmas poucas linhas do laço de declaração.

### 1. O valor bruto do segredo entrava na mensagem

```js
problemas.push(`${d.env}="${bruto}" não é ${d.tipo} válido (chave "${d.chave}")`);
```

Sem distinção por `segredo`. Medido antes do conserto:

```
DSN não é url válido      → DSN="postgres//operador:SENHA_REAL@db.interno/baluarte"
TOK não é numero válido   → TOK="sk-live-51H8xQ2eZvKYlo"
FLAG não é booleano válido → FLAG="xoxb-9f3a-SEGREDO-DE-WEBHOOK"
```

### 2. O valor convertido do segredo entrava pela faixa

```js
problemas.push(`"${d.chave}" = ${valor} > máximo ${d.max}`);
```

Outro caminho, mesmo resultado: `"app:pin" = 31415926 > máximo 9999`.

### 3. E a mensagem ainda mentia

Uma variável **definida** mas recusada caía no ramo do ausente e produzia
`"a:dsn" é obrigatória e DSN não está definida` — mandando o operador definir o
que ele já tinha definido, e contradizendo a linha anterior do mesmo relatório.

## Por que os 19 testes que já existiam não apanharam

Eles cobrem segredos — e cobrem bem: recusa de padrão, `ler()` que barra,
`revelar()` como única saída, máscara no diagnóstico, recorte por módulo.

Mas **todos usam `tipo: 'texto'`**, e `converter(v, 'texto')` devolve
`String(v)`: para um valor definido, nunca falha. O ramo da recusa jamais era
percorrido com um segredo. Os testes novos usam `url`, `numero` e `booleano` —
que é precisamente onde moram a DSN com senha, a chave `sk-live-…` e o token de
webhook.

Isso não é azar: é o teste ter seguido a forma do tipo mais comum em vez da
forma do caminho de erro.

## O conserto

**O corte é por declaração, não por mensagem.** O valor do **não-segredo
continua** a aparecer — é assim que se acha uma variável mal escrita
(`TETO="8OOO"`), e esconder tudo tornaria o diagnóstico inútil no caso comum.
Dois testes cobram exatamente isso, para o conserto não virar cegueira.

Para o segredo, a mensagem nomeia **a variável e o problema**, nunca o valor:

```
DSN não é url válido (chave "a:dsn") — valor omitido por ser segredo
"a:pin" está acima do máximo 9999 — valor omitido por ser segredo
```

Nomear a variável é obrigatório: sem isso o operador sabe que há um problema e
não sabe onde mexer, que é meio caminho para ele começar a imprimir a config.

### O terceiro estado

Presente-e-recusada não é ausente. Passa a ser um estado próprio, e é a raiz dos
defeitos 3 e do que se segue:

- a mensagem de "não está definida" só sai quando a variável está **mesmo**
  ausente (o teste que já existia para esse caso continua verde);
- só há **um** problema por chave recusada, não dois que se contradizem;
- **`origem` deixa de dar o crédito a quem foi recusado.** Antes bastava a
  variável existir para levar o crédito, mesmo com o valor rejeitado e o padrão
  em vigor — quem lesse isso ia mexer na variável e não veria nada mudar. Agora
  `origem` diz de onde veio o valor **que está em vigor**, e um campo novo
  `envRejeitada` nomeia a tentativa recusada, porque a tentativa é a informação.

```
antes:  { origem: "env:TETO",  valor: 100 }          ← mente: 100 é o padrão
agora:  { origem: "padrão", envRejeitada: "TETO", valor: 100 }
```

## ⚠️ O alcance real, sem exagero

`v2/core/config.js` é importado **apenas pelo seu próprio teste**. Não está
ligado ao boot, e a Fase 6 está marcada `Parcial` precisamente por isso.

Então **não houve vazamento em produção** — isto é um defeito latente,
consertado antes de o módulo ser ligado, que é quando ele passaria a ser real.
Dizer outra coisa seria inflar a gravidade; não consertar por isso seria pior,
porque o momento de ligar é o momento em que ninguém revisita estas linhas.

## Onde os testes vivem, e porquê

Separados de propósito:

- **`test/security/config-secret-contract.test.js`** (8) — a redação. Este
  diretório tem um portão dedicado (`Security Contracts`) que dispara em
  qualquer mudança sob `test/security/**`, então enfraquecer uma asserção de
  redação passa a acender uma luz própria.
- **`test/v2/config-diagnostico.test.js`** (6) — a correção do que o relatório
  afirma. Não é segurança, e pô-lo no diretório de segurança sujaria o que
  aquele diretório significa.

Os 19 testes originais de `test/v2/config.test.js` ficam intactos e verdes.

### A prova de que os testes apanham o defeito

Um teste que passa antes e depois não prova nada. Corridos contra o `config.js`
anterior: **9 dos 14 falham**, e são exatamente os que descrevem os defeitos. Os
5 que passam nos dois são as guardas de regressão — o não-segredo que continua a
mostrar o valor, a ausente que continua reportada como ausente, a origem que
continua a creditar o ambiente aceite — e passar nos dois casos é o que se
espera delas.

| gate | resultado |
|---|---:|
| `npm test` | `1409/1409` |
| `npm run v2:integracao` | `58/58` |
| `tipos:ts` · `tipos:v2` | 0 erros |
| `build`, `verificar-nexus`, catálogos, tabela de estabilidade | verdes |

## O que isto **não** faz

Não liga o `config.js` ao boot, não move constante nenhuma para ele, não declara
config de módulo e não cria fonte única. Isso é o resto da Fase 6, e fazê-lo de
carona num conserto de vazamento seria alargar o âmbito sem o pedir.
