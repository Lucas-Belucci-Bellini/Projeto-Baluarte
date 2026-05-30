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
import json
import glob
from pathlib import Path
from datetime import datetime

from fastapi import FastAPI, HTTPException
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


# ══════════════════════════════════════════════════════════════════
#  Jarvis DB — endpoints para o site ler o Git DB em tempo real
# ══════════════════════════════════════════════════════════════════

JARVIS_DB = Path(os.environ.get("JARVIS_DB_PATH", Path.home() / ".jarvis-db"))


def _db_exists():
    return JARVIS_DB.exists()


@app.get("/jarvis-db/status")
def jarvis_db_status():
    """Status geral do Git DB do Jarvis."""
    if not _db_exists():
        return {"online": False, "path": str(JARVIS_DB)}

    sessions_count = len(list(JARVIS_DB.glob("sessions/**/*.json")))
    users = [p.stem for p in (JARVIS_DB / "memory").glob("*.json")] if (JARVIS_DB / "memory").exists() else []
    events_today = 0
    today_log = JARVIS_DB / "events" / f"{datetime.now().strftime('%Y-%m-%d')}.jsonl"
    if today_log.exists():
        events_today = sum(1 for _ in open(today_log))

    # último commit via git log
    last_commit = "—"
    try:
        from git import Repo
        repo = Repo(JARVIS_DB)
        c = next(repo.iter_commits(), None)
        if c:
            last_commit = f"{c.message.strip()[:60]} ({datetime.fromtimestamp(c.committed_date).strftime('%d/%m %H:%M')})"
    except Exception:
        pass

    return {
        "online": True,
        "path": str(JARVIS_DB),
        "sessions": sessions_count,
        "users": users,
        "events_today": events_today,
        "last_commit": last_commit,
    }


@app.get("/jarvis-db/sessions")
def jarvis_sessions(limit: int = 20, user: str = None):
    """Lista sessões recentes do Jarvis."""
    if not _db_exists():
        raise HTTPException(404, "Jarvis DB não encontrado")

    files = sorted(JARVIS_DB.glob("sessions/**/*.json"), reverse=True)
    result = []
    for f in files:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            if user and data.get("user") != user:
                continue
            result.append({
                "user":     data.get("user", "—"),
                "started":  data.get("started", ""),
                "messages": data.get("message_count", 0),
                "summary":  data.get("summary", "")[:120],
                "file":     f.name,
            })
            if len(result) >= limit:
                break
        except Exception:
            continue

    return {"sessions": result, "total": len(result)}


@app.get("/jarvis-db/sessions/{filename}")
def jarvis_session_detail(filename: str):
    """Retorna transcrição completa de uma sessão."""
    matches = list(JARVIS_DB.glob(f"sessions/**/{filename}"))
    if not matches:
        raise HTTPException(404, "Sessão não encontrada")
    try:
        return json.loads(matches[0].read_text(encoding="utf-8"))
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/jarvis-db/memory/{user}")
def jarvis_memory(user: str):
    """Fatos persistentes de um usuário."""
    mem_file = JARVIS_DB / "memory" / f"{user}.json"
    if not mem_file.exists():
        return {"user": user, "facts": {}}
    try:
        data = json.loads(mem_file.read_text(encoding="utf-8"))
        return {"user": user, "facts": data}
    except Exception as e:
        raise HTTPException(500, str(e))


@app.get("/jarvis-db/events")
def jarvis_events(date: str = None, limit: int = 50):
    """Eventos do dia (ou de uma data específica)."""
    if not _db_exists():
        raise HTTPException(404, "Jarvis DB não encontrado")

    target = date or datetime.now().strftime("%Y-%m-%d")
    log_file = JARVIS_DB / "events" / f"{target}.jsonl"
    if not log_file.exists():
        return {"date": target, "events": []}

    events = []
    for line in log_file.read_text(encoding="utf-8").splitlines():
        try:
            events.append(json.loads(line))
        except Exception:
            continue

    return {"date": target, "events": events[-limit:]}


@app.get("/jarvis-db/commits")
def jarvis_commits(limit: int = 30):
    """Últimos commits do Git DB."""
    if not _db_exists():
        raise HTTPException(404, "Jarvis DB não encontrado")
    try:
        from git import Repo
        repo = Repo(JARVIS_DB)
        commits = [
            {
                "hash":    c.hexsha[:8],
                "message": c.message.strip()[:80],
                "date":    datetime.fromtimestamp(c.committed_date).strftime("%d/%m %H:%M"),
                "author":  c.author.name,
            }
            for c in list(repo.iter_commits())[:limit]
        ]
        return {"commits": commits}
    except Exception as e:
        raise HTTPException(500, str(e))


if __name__ == "__main__":
    import uvicorn

    # Hosts (Render/Railway/Fly) injetam PORT e exigem bind em 0.0.0.0.
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
