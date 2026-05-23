# 07 — Estado Global e Leitura Segura

Requisito do Lucas: a IA precisa **ler** todas as 20+ funções do site para
saber como elas funcionam — **mas sem quebrar nada**. A solução é um padrão
chamado **Estado Global Compartilhado como Leitura (Read-Only Global State)**.

## A ideia

Cada função do site escreve um "resumo" do que está acontecendo num único
objeto JavaScript — o **painel de diagnóstico** do Baluarte. A IA só **lê**
uma cópia em texto desse objeto; ela nunca toca no código-fonte.

```js
// "print" em tempo real de tudo que está aberto no site
window.BaluarteStatus = {
  funcaoAtual: "logic-sim",

  editor: {
    linhasTotais: 42,
    linguagem: "javascript",
    temErro: false
  },

  logicSim: {
    componentes: ["AND", "OR", "DFF"],
    fiosConectados: 3,
    estado: "estável"     // a IA lê isto para diagnosticar
  },

  colorStudio: {
    corAtual: "#00f0ff",
    contraste: "4.7:1"
  }
  // … cada função atualiza seu pedaço
};
```

## Como a IA consome

Quando o usuário manda uma mensagem, o frontend **empacota** o
`window.BaluarteStatus` e envia como **contexto oculto** junto com o texto. A
IA lê isso como um "relatório médico" do site e já sabe, por exemplo, que o
Logic Sim tem 3 fios e que o Editor tem 42 linhas — **sem o usuário ter dito
nada**.

```js
function montarContexto(mensagemDoUsuario) {
  return [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: "ESTADO DO SITE:\n" + JSON.stringify(window.BaluarteStatus, null, 2) },
    { role: "user", content: mensagemDoUsuario }
  ];
}
```

## Por que é seguro

- A IA recebe **apenas uma cópia em texto** (snapshot) dos dados. É
  **impossível** ela alterar o código interno ou corromper o site por aqui.
- Ações que **mudam** o site são separadas e explícitas: só acontecem via as
  **ferramentas** declaradas (doc 6), nunca pela leitura de estado.
- **Leitura ≠ escrita.** Este doc é só leitura/diagnóstico; escrita é o doc 6.

## Como aplicar no Baluarte real

O site usa um estado central em `src/core/state.js` e um event bus
(`src/core/events.js`). O `BaluarteStatus` pode ser alimentado por esses
mecanismos: cada página, ao montar/atualizar, publica seu resumo. Começar
pequeno (2–3 funções: Editor, Logic Sim, Color Studio) e ir expandindo.

> Combinado com o doc 6, isto fecha o ciclo: a IA **lê** o estado (doc 7) e
> **age** via ferramentas (doc 6).
