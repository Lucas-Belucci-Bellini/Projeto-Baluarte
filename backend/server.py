"""
Núcleo Baluarte — Backend de IA (Plano IA Baluarte, doc 04 / plano B).

Servidor Python opcional que dá ao J.A.R.V.I.S. um modelo mais capaz e, o
principal, BUSCA NA WEB de verdade (Google Search via Gemini) — a camada 2 do
raciocínio em 3 camadas (doc 08). O navegador não busca direto (CORS), então
quem pesquisa é este servidor.

É STATELESS: o site (que já guarda o histórico por sessão em IndexedDB) envia a
conversa inteira a cada chamada. Assim não há histórico duplicado/dessincronizado.

NÃO faz parte do build estático do site (a Vercel só empacota src/ + public/).
Rode-o à parte; o site fala com ele por uma URL configurável (modo "Servidor").

Como rodar:
    pip install -r requirements.txt
    export GEMINI_API_KEY="sua-chave-do-google-ai-studio"   # Windows: set GEMINI_API_KEY=...
    python server.py
Depois, no site: J.A.R.V.I.S. -> ⚙ -> modo "Servidor" (URL http://127.0.0.1:8000).
"""

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from google import genai
from google.genai import types

app = FastAPI(title="Núcleo Baluarte — IA Backend")

# CORS liberado: o site (localhost:5173 / vercel.app) precisa chamar este servidor.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL = os.environ.get("BALUARTE_MODEL", "gemini-2.5-flash")
DEFAULT_SYSTEM = (
    "Você é o núcleo do Projeto Baluarte Mark XIII. Responda em português. "
    "Quando precisar de informação recente ou documentação atual, use a busca "
    "na internet integrada."
)

_client = None


def client():
    """Cliente Gemini (usa a variável de ambiente GEMINI_API_KEY)."""
    global _client
    if _client is None:
        _client = genai.Client()
    return _client


class Message(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    messages: list[Message] = []
    system: str | None = None


@app.get("/health")
def health():
    return {
        "ok": True,
        "model": MODEL,
        "hasKey": bool(os.environ.get("GEMINI_API_KEY")),
    }


@app.post("/chat")
def chat(req: ChatRequest):
    """Recebe a conversa inteira + system e responde com busca web habilitada."""
    contents = []
    for m in req.messages:
        role = "model" if m.role in ("assistant", "model", "jarvis") else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=m.content)])
        )

    config = types.GenerateContentConfig(
        system_instruction=req.system or DEFAULT_SYSTEM,
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.3,  # mais baixo = mais preciso (código/fatos)
    )

    try:
        resp = client().models.generate_content(
            model=MODEL, contents=contents, config=config
        )
    except Exception as e:  # noqa: BLE001 — devolve o erro ao cliente, não derruba o servidor
        return {"resposta": f"[erro no servidor da IA: {e}]"}

    return {"resposta": resp.text or "(resposta vazia)"}


if __name__ == "__main__":
    import uvicorn

    # Hosts (Render/Railway/Fly) injetam PORT e exigem bind em 0.0.0.0.
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
