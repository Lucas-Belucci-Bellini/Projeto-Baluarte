# 04 — Método 2: Servidor Python + Busca na Web

Plano B (mais capaz que o WebLLM puro): um **servidor Python** que controla a
conversa e consegue **pesquisar na internet** antes de responder (RAG /
busca web). O navegador barra buscas diretas (CORS), então quem faz a
pesquisa é o servidor.

Duas variações:

## Variação A — Ollama (modelo local, sem API externa)

Roda o modelo na sua própria máquina, de graça e sem limites.

```bash
# instala o Ollama e baixa um modelo
ollama run llama3
```

O JS (ou Python) chama `http://localhost:11434/api/generate`.

- **Vantagens:** grátis, sem limite de mensagens, controle total, dados locais.
- **Desvantagem:** para outras pessoas usarem pela internet, é preciso um
  servidor com GPU dedicada (caro). Bom para uso pessoal do Lucas na máquina.

## Variação B — Servidor Python + Gemini (busca no Google nativa)

A API do Google Gemini permite **pesquisar no Google em tempo real** de forma
nativa. Bom quando a IA precisa de documentação/código atualizado.

### Instalação

```bash
pip install fastapi uvicorn google-genai requests
```

### `server.py` (referência — com histórico, busca web e limpar memória)

> Correções em relação ao rascunho: as URLs do `fetch` no front devem apontar
> para `http://127.0.0.1:8000/enviar` e `/limpar`.

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI()
app.add_middleware(CORSMiddleware, allow_origins=["*"],
                   allow_methods=["*"], allow_headers=["*"])

# Configure a variável de ambiente GEMINI_API_KEY (chave gratuita do Google AI Studio)
client = genai.Client()

SYSTEM = ("Você é o núcleo do Baluarte. Quando precisar de código atualizado "
          "ou informação recente, use a busca na internet integrada.")

historico = [types.Content(role="user", parts=[types.Part.from_text(text=SYSTEM)])]

class Msg(BaseModel):
    texto: str

@app.post("/enviar")
async def enviar(req: Msg):
    historico.append(types.Content(role="user", parts=[types.Part.from_text(text=req.texto)]))
    config = types.GenerateContentConfig(
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.3  # mais baixo = mais preciso para código
    )
    resp = client.models.generate_content(
        model="gemini-2.5-flash", contents=historico, config=config
    )
    historico.append(types.Content(role="model", parts=[types.Part.from_text(text=resp.text)]))
    return {"resposta": resp.text}

@app.post("/limpar")
async def limpar():
    global historico
    historico = [types.Content(role="user", parts=[types.Part.from_text(text=SYSTEM)])]
    return {"status": "memória apagada"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
```

### Frontend (chamadas corretas)

```js
// enviar
const r = await fetch("http://127.0.0.1:8000/enviar", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ texto })
});
const { resposta } = await r.json();

// limpar memória
await fetch("http://127.0.0.1:8000/limpar", { method: "POST" });
```

## Como rodar

1. `python server.py` (liga o servidor da IA).
2. Abrir o site/HTML que chama as rotas acima.
3. Testar pedindo algo que dependa de busca: *"busque a doc atualizada da
   biblioteca X e me dê um exemplo"*.

## Quando usar A vs B

| Critério | Ollama (A) | Gemini (B) |
|---|---|---|
| Custo | Grátis (sua máquina) | Grátis no plano básico, com limites |
| Busca na web | Não nativa | **Sim, nativa (Google Search)** |
| Sem chave de API | Sim | Não (precisa de GEMINI_API_KEY) |
| Acesso público fácil | Não (precisa GPU na nuvem) | Sim |

> **Para o Baluarte:** o WebLLM (doc 3) atende o "sem API / no navegador". O
> servidor Python entra se quisermos busca web de verdade e respostas mais
> fortes. Os dois podem coexistir (motor trocável).
