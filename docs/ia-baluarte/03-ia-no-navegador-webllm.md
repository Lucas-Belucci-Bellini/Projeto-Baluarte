# 03 — Método 1: IA 100% no Navegador (WebLLM)

**Caminho preferido do Lucas: sem API externa, a IA roda no próprio site.**

Navegadores modernos conseguem carregar e executar um modelo de linguagem
inteiro na **GPU/CPU do usuário** usando **WebGPU** + **WebAssembly**. A
biblioteca **WebLLM** (projeto MLC) faz isso em JavaScript.

## Vantagens × Desvantagens

| Vantagens | Desvantagens |
|---|---|
| Custo **zero** de servidor | 1º acesso baixa um modelo grande (~1,5–4 GB) |
| Funciona **offline** depois de baixado | Exige PC/celular minimamente potente |
| **Privacidade total** (nada sai do navegador) | Precisa de navegador com WebGPU (Chrome/Edge) |

> Alternativa mais leve à WebLLM: **Transformers.js** (Hugging Face).

## Requisitos

- Navegador **Chrome ou Edge atualizados** (melhor suporte a WebGPU).
- O site precisa rodar via servidor (não abrir o arquivo direto). No Baluarte
  isso já está resolvido — o Vite/Vercel servem via HTTP/HTTPS.
- Espaço em cache no navegador do usuário para guardar o modelo.

## Escolha do modelo

IDs de modelos comprimidos (quantizados) que rodam no navegador:
- `Llama-3-8B-Instruct-q4f16_1-MLC` — bom para conversa geral (~4 GB).
- `Phi-3-mini-4k-instruct-q4f16_1-MLC` — leve e rápido (~2 GB).
- `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC` — focado em **código** (ver doc 5).

Para começar, um modelo leve (Phi-3-mini ou Qwen 1.5B) baixa mais rápido e
funciona em mais máquinas.

## Código de referência (HTML único)

> Correções em relação ao rascunho original: o import do esm.run precisa do
> caminho do pacote; a função é `CreateMLCEngine` (não "CreateCreate…").

```html
<script type="module">
  import * as webllm from "https://esm.run/@mlc-ai/web-llm";

  const statusDiv = document.getElementById("status");
  const modelId = "Phi-3-mini-4k-instruct-q4f16_1-MLC";
  let engine;

  let chatHistory = [
    { role: "system", content: "Você é o núcleo do Baluarte. Responde em português." }
  ];

  async function inicializarIA() {
    try {
      engine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report) => { statusDiv.innerText = report.text; }
      });
      statusDiv.innerText = "IA pronta!";
    } catch (erro) {
      statusDiv.innerText = "Seu navegador não suporta WebGPU. Use Chrome/Edge atualizados.";
      console.error(erro);
    }
  }

  async function enviarMensagem(texto) {
    chatHistory.push({ role: "user", content: texto });
    const chunks = await engine.chat.completions.create({
      messages: chatHistory,
      stream: true
    });
    let resposta = "";
    for await (const chunk of chunks) {
      resposta += chunk.choices[0]?.delta?.content || "";
      // atualizar a bolha da IA na tela com `resposta`
    }
    chatHistory.push({ role: "assistant", content: resposta });
  }

  inicializarIA();
</script>
```

## Via npm (quando integrar ao Vite do Baluarte)

```bash
npm install @mlc-ai/web-llm
```

```js
import * as webllm from "@mlc-ai/web-llm";
```

## Como encaixar no Baluarte

- Vira o motor da página `/jarvis` ou `/ia-proprietaria`.
- A barra de status do site (estilo "inicializando núcleo") é perfeita para
  mostrar o progresso do download do modelo (`initProgressCallback`).
- **Limitação importante:** sozinho, o WebLLM não busca na internet nem
  controla o site. Para isso, ver docs 6, 7 e 8 (agente + ferramentas).
