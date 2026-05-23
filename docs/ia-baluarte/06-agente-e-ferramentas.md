# 06 — Agente e Ferramentas (controlar o site)

Aqui o Baluarte deixa de ser um chatbot e vira um **agente de IA**: ele
controla as ferramentas do próprio site. A base é o **Function Calling**
(chamada de funções / *tools*).

## O conceito

A IA **não clica na tela**. Você entrega a ela uma lista de funções que o
site sabe executar. Quando o usuário diz *"faça uma porta AND e ligue a
entrada A na porta 1"*, a IA responde com um **comando estruturado (JSON)**:

```json
{ "funcao": "conectarFio", "argumentos": { "origem": "entrada_A", "destino": "porta_AND_1" } }
```

Seu código intercepta esse comando e roda a função real no site.

## Passo A — Expor as funções do site

Cada ferramenta do Baluarte publica funções controláveis. Exemplo com o
**Logic Sim** (que no Baluarte real é o motor em
`src/utils/logic-sim-engine.js` — `addComponent`, `addWire`):

```js
window.BaluarteSimulador = {
  adicionarComponente: (tipo, x, y) => { /* cria porta AND/OR/NOT… */ },
  conectarFio: (deId, paraId) => { /* desenha o fio entre os pinos */ }
};
```

## Passo B — Declarar as ferramentas para a IA

```js
const ferramentasDisponiveis = [
  {
    name: "adicionarComponente",
    description: "Adiciona uma porta lógica ou chip no simulador de circuitos.",
    parameters: {
      type: "OBJECT",
      properties: {
        tipo: { type: "STRING", description: "AND, OR, NOT, XOR, DFF…" },
        x: { type: "NUMBER" }, y: { type: "NUMBER" }
      },
      required: ["tipo"]
    }
  },
  {
    name: "conectarFio",
    description: "Liga a saída de um componente à entrada de outro.",
    parameters: {
      type: "OBJECT",
      properties: {
        deComponenteId: { type: "STRING" },
        paraComponenteId: { type: "STRING" }
      },
      required: ["deComponenteId", "paraComponenteId"]
    }
  }
];
```

## Passo C — Executar a ação

1. Usuário: *"como faço uma porta AND com duas entradas?"*
2. IA responde com `adicionarComponente(tipo: "AND")`.
3. Seu código roda `window.BaluarteSimulador.adicionarComponente("AND", 100, 200)`.
4. A IA continua no chat: *"Instalei a porta AND. Agora ligue a entrada…"*.

## Escalabilidade: catálogo central de ferramentas

O site **ganha funções novas o tempo todo**. Para não mexer no código da IA a
cada função nova, mantém-se um **catálogo central**. Toda função registrada
ali fica automaticamente disponível para a IA.

```js
// docs de referência — futura central de controle do agente
export const catalogoBaluarte = {
  adicionarComponente: {
    descricao: "Coloca uma porta lógica na tela do simulador.",
    executar: (dados) => window.BaluarteSimulador.adicionarComponente(dados.tipo)
  },
  criarGraficoOnda: {
    descricao: "Gera um gráfico de análise de onda do circuito atual.",
    executar: (dados) => window.Graficos.gerarOnda(dados.frequencia)
  },
  exportarParaPDF: {
    descricao: "Exporta o conteúdo atual em PDF.",
    executar: () => window.Arquivos.salvarPDF()
  }
  // cada função nova do site entra aqui
};
```

**Fluxo automático:**
1. Ao iniciar o chat, o sistema lê o catálogo e manda as **descrições** para a
   IA — ela "descobre" tudo que o site sabe fazer (mesmo o que entrou há 5 min).
2. Se a IA pedir `exportarParaPDF`, o código acha esse nome no catálogo e roda
   `.executar()`.

Assim o usuário pode encadear comandos:
> *"monte um circuito somador, gere o gráfico de onda e exporte em PDF"* — a IA
> aciona as três funções em sequência.

## Integração no site existente (Vercel)

Como o Baluarte já está na Vercel, há duas formas de plugar o motor:

- **Sem servidor (preferido):** WebLLM no navegador (doc 3) + este catálogo de
  ferramentas em JS puro. Combina com a stack atual do site.
- **Com Serverless:** uma rota de API na Vercel (Vercel AI SDK) que gerencia o
  histórico e habilita *tools* + busca web. Mais robusto, porém adiciona
  backend ao projeto.

> **Importante:** o Baluarte é **JS puro, sem React**. O Vercel AI SDK e o
> hook `useChat` assumem React/Next. Se formos por esse lado, ou adaptamos a
> chamada à API "na mão" (fetch), ou isolamos numa parte React. O caminho que
> mais respeita a stack atual é **WebLLM + catálogo de ferramentas em JS puro**.

## Próximos detalhes
- Como a IA **lê** o estado de todas as funções sem quebrar → doc 7.
- Como ela decide entre site / internet / dedução → doc 8.
