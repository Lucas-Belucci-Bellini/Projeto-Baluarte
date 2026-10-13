# 02 — Chat Conversacional (a base)

Tudo começa com um chat que **lembra do contexto**. Modelos de linguagem
**não têm memória própria**: você precisa reenviar a conversa inteira a cada
nova pergunta. O "segredo" de um chat inteligente é o **histórico de
mensagens**.

## Formato do histórico

Uma lista (array) de mensagens, cada uma com um papel (`role`) e o texto:

```js
let chatHistory = [
  { role: "system", content: "Você é o núcleo do Baluarte. Responde em português." },
  { role: "user", content: "Olá!" },
  { role: "assistant", content: "Operador, núcleo online. Como posso ajudar?" }
];
```

- `system` — instruções fixas (personalidade/regras). Vai no começo.
- `user` — o que a pessoa digitou.
- `assistant` — o que a IA respondeu.

A cada pergunta nova: empurra `{role:"user", ...}`, manda o array todo pro
modelo, recebe a resposta e empurra `{role:"assistant", ...}`.

## Streaming (efeito "digitando")

Em vez de esperar o texto inteiro, recebe pedaço por pedaço e vai escrevendo
na tela — igual ao ChatGPT. Melhora muito a sensação de velocidade.

```js
const chunks = await engine.chat.completions.create({
  messages: chatHistory,
  stream: true
});
let respostaCompleta = "";
for await (const chunk of chunks) {
  respostaCompleta += chunk.choices[0]?.delta?.content || "";
  aiDiv.innerText = respostaCompleta; // atualiza a bolha a cada pedaço
}
```

## Apagar a memória (requisito do Lucas)

Botão que **zera o histórico**, mantendo só o `system`:

```js
function limparMemoria() {
  chatHistory = [{ role: "system", content: SYSTEM_PROMPT }];
  // limpar a tela do chat também
}
```

## Estados da interface

A UI precisa saber em que estado a IA está, para habilitar/desabilitar campos:
- **carregando o modelo** (no WebLLM, o primeiro acesso baixa arquivos grandes);
- **pensando** (gerando resposta);
- **pronta** (esperando o usuário).

## Onde isso encaixa no Baluarte

A página `/jarvis` (ou `/ia-proprietaria`) já existe e pode ser a casa desse
chat. O histórico vive numa variável JS; o "apagar" é só resetar o array e a
tela. O motor que gera as respostas vem dos docs 3 (WebLLM) ou 4 (servidor).
