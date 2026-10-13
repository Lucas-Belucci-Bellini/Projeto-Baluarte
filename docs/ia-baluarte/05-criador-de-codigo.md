# 05 — Evoluir o Chat para um Criador de Código

A ideia do Lucas: começar com um chat de conversa e **depois evoluir para um
criador de código**. É o mesmo caminho que o ChatGPT e o Claude seguiram —
primeiro dominaram a conversa, depois a programação.

Para essa evolução, mexe-se em três partes:

## 1. Trocar o "cérebro" (o modelo)

Modelos de conversa geral (Llama-3-8B) funcionam, mas existem modelos
**especializados em código** que também rodam no navegador:
- **Qwen2.5-Coder** (ex.: `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC`).
- **CodeLlama**.

São treinados para entender lógica, sintaxe e corrigir bugs. No WebLLM, isso
é **trocar uma linha** (o `modelId`).

## 2. Mudar a interface (mostrar código bonito)

Texto puro quebra o visual do código. Adicione **realce de sintaxe**:
- **Prism.js** ou **Highlight.js** — colorem blocos de código (funções,
  strings, números), como no VS Code.
- Botão **"Copiar código"** automático em cada bloco.

> O Baluarte já tem um Editor de Código com realce próprio
> (`src/utils/syntax-highlight.js`). Dá para reaproveitar esse realce nas
> respostas da IA, em vez de trazer uma lib nova.

## 3. Mudar o prompt do sistema

Trocar a instrução para algo como:

```
Você é um engenheiro de software sênior. Responda com código limpo,
otimizado e com comentários explicativos. Prefira as ferramentas e o
estilo do próprio Projeto Baluarte (JavaScript puro, sem framework).
```

## O pulo do gato: usar o Editor do próprio site

O Baluarte **já tem um criador de código** (`/editor`). Então a IA **não
precisa pesquisar na internet como escrever um algoritmo** — ela usa a IDE do
site. Duas ferramentas-chave (detalhadas no doc 6):

- `obterCodigoAtual()` — a IA **lê** o que está no editor para te ajudar
  ("por que meu código dá erro?").
- `injetarCodigoNoEditor(novoCodigo)` — a IA **escreve** direto no editor, em
  vez de só cuspir texto no chat.

E se o editor tiver botões de **Executar/Compilar/Formatar**, a IA pode
acioná-los (`window.BaluarteEditor.compilar()`) e ler o resultado para dizer
se funcionou. Isso transforma o Baluarte num **Copilot/Cursor pessoal**.

## Resumo da evolução

| Parte | De | Para |
|---|---|---|
| Modelo | conversa geral | modelo de código (Qwen2.5-Coder) |
| Interface | texto puro | realce de sintaxe + copiar |
| Prompt | assistente geral | engenheiro de software |
| Fonte | inventar do zero | **usar o Editor do Baluarte** |
