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
import logging
from pathlib import Path
from datetime import datetime, timedelta, timezone

from fastapi import FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from google import genai
from google.genai import types

from claims_adapter import observe_bearer_claims
from health_contract import project_server_health
from transport_security import (
    CORS_EXPOSE_HEADERS,
    CORS_HEADERS,
    CORS_METHODS,
    configured_allowed_origins,
    configured_claims_rate_limiter,
    emit_claims_audit,
    origin_allowed,
    rate_limit_headers,
    transport_key,
)

app = FastAPI(title="Núcleo Baluarte — IA Backend")

_ALLOWED_ORIGINS = configured_allowed_origins()
_CLAIMS_RATE_LIMITER = configured_claims_rate_limiter()
_CLAIMS_AUDIT_LOGGER = logging.getLogger("baluarte.server_claims")

# CORS explícito: nenhuma origem, credencial, método ou header wildcard.
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(_ALLOWED_ORIGINS),
    allow_credentials=False,
    allow_methods=list(CORS_METHODS),
    allow_headers=list(CORS_HEADERS),
    expose_headers=list(CORS_EXPOSE_HEADERS),
    max_age=600,
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
    """Liveness + prontidão observada, sem claims server-side."""
    return project_server_health(
        model=MODEL,
        has_key=bool(os.environ.get("GEMINI_API_KEY")),
    )


@app.get("/claims/observe")
def claims_observe(
    request: Request,
    authorization: str | None = Header(default=None),
    x_request_id: str | None = Header(default=None),
):
    """Observa claims por fonte server-side; nunca concede autorização."""
    origin = request.headers.get("origin")
    origin_is_allowed = origin_allowed(origin, _ALLOWED_ORIGINS)
    remote_host = request.client.host if request.client is not None else None
    rate = _CLAIMS_RATE_LIMITER.check(transport_key(remote_host, origin))
    request_id_present = bool(x_request_id and x_request_id.strip())
    if not rate.allowed:
        emit_claims_audit(
            _CLAIMS_AUDIT_LOGGER,
            status_code=429,
            origin_is_allowed=origin_is_allowed,
            rate_limited=True,
            decision="not-authorized",
            request_id_present=request_id_present,
        )
        return JSONResponse(
            status_code=429,
            content={
                "contractVersion": "server-claims/v1",
                "decision": "not-authorized",
                "authority": "not-authorized",
                "error": "rate_limited",
            },
            headers=rate_limit_headers(rate),
        )

    snapshot = observe_bearer_claims(
        authorization,
        base_url=os.environ.get("SUPABASE_URL"),
        anon_key=os.environ.get("SUPABASE_ANON_KEY"),
    )
    emit_claims_audit(
        _CLAIMS_AUDIT_LOGGER,
        status_code=200,
        origin_is_allowed=origin_is_allowed,
        rate_limited=False,
        decision=snapshot["decision"],
        request_id_present=request_id_present,
    )
    return JSONResponse(content=snapshot, headers=rate_limit_headers(rate))


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
COMMIT_LIMIT_MAX = 100  # janela textual; não limita a capacidade agregada do gráfico
ACTIVITY_DAYS = 14
# Requisito: 5.000 commits/semana. Duas semanas + margem de 2x.
ACTIVITY_MAX_COMMITS = 20_000
_activity_cache: tuple[str, list[dict], bool] | None = None


def _bounded_limit(value: int, default: int = 30) -> int:
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        parsed = default
    return max(1, min(parsed, COMMIT_LIMIT_MAX))


def _tail_lines(path: Path, limit: int) -> list[str]:
    """Lê somente as últimas linhas de um JSONL, sem materializar o arquivo inteiro."""
    if limit <= 0:
        return []
    chunks: list[bytes] = []
    newline_count = 0
    with path.open("rb") as stream:
        position = stream.seek(0, 2)
        while position > 0 and newline_count <= limit:
            size = min(64 * 1024, position)
            position -= size
            stream.seek(position)
            chunk = stream.read(size)
            chunks.append(chunk)
            newline_count += chunk.count(b"\\n")
    data = b"".join(reversed(chunks))
    lines = data.splitlines()[-limit:]
    return [line.decode("utf-8", errors="replace") for line in lines]


def _commit_payload(commit) -> dict:
    return {
        "sha": commit.hexsha,
        "hash": commit.hexsha[:8],
        "message": commit.message.strip()[:80],
        "date": datetime.fromtimestamp(commit.committed_date).strftime("%d/%m %H:%M"),
        "author": commit.author.name,
    }


def _commit_activity(repo, days: int = ACTIVITY_DAYS) -> tuple[list[dict], bool]:
    """Agrupa commits recentes por dia com teto explícito de leitura."""
    today = datetime.now(timezone.utc).date()
    first_day = today - timedelta(days=days - 1)
    buckets = {first_day + timedelta(days=index): 0 for index in range(days)}
    start = datetime.combine(first_day, datetime.min.time(), tzinfo=timezone.utc)
    sampled = 0
    for commit in repo.iter_commits(max_count=ACTIVITY_MAX_COMMITS, since=start):
        committed_day = datetime.fromtimestamp(commit.committed_date, timezone.utc).date()
        if committed_day in buckets:
            buckets[committed_day] += 1
        sampled += 1
    truncated = sampled >= ACTIVITY_MAX_COMMITS
    return ([{"date": day.isoformat(), "count": count} for day, count in buckets.items()], truncated)


def _cached_commit_activity(repo, head: str) -> tuple[list[dict], bool]:
    global _activity_cache
    if _activity_cache is not None and _activity_cache[0] == head:
        return _activity_cache[1], _activity_cache[2]
    activity, truncated = _commit_activity(repo)
    _activity_cache = (head, activity, truncated)
    return activity, truncated


def _db_exists():
    return JARVIS_DB.exists()


@app.get("/jarvis-db/status")
def jarvis_db_status():
    """Status geral do Git DB do Jarvis."""
    if not _db_exists():
        return {"online": False, "path": str(JARVIS_DB)}

    sessions_count = sum(1 for _ in JARVIS_DB.glob("sessions/**/*.json"))
    users = [p.stem for p in (JARVIS_DB / "memory").glob("*.json")] if (JARVIS_DB / "memory").exists() else []
    events_today = 0
    today_log = JARVIS_DB / "events" / f"{datetime.now().strftime('%Y-%m-%d')}.jsonl"
    if today_log.exists():
        with today_log.open("rb") as stream:
            events_today = sum(1 for _ in stream)

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
    for line in _tail_lines(log_file, _bounded_limit(limit, default=50)):
        try:
            events.append(json.loads(line))
        except Exception:
            continue

    return {"date": target, "events": events}


@app.get("/jarvis-db/commits")
def jarvis_commits(limit: int = 30, after: str | None = None):
    """Últimos commits do Git DB, com cursor incremental e atividade agregada."""
    if not _db_exists():
        raise HTTPException(404, "Jarvis DB não encontrado")
    try:
        from git import Repo

        repo = Repo(JARVIS_DB)
        bounded_limit = _bounded_limit(limit)
        head = repo.head.commit.hexsha
        if after:
            try:
                repo.commit(after)
            except Exception as error:
                raise HTTPException(400, "Cursor de commit inválido") from error
            revisions = repo.git.rev_list(
                "HEAD", f"^{after}", f"--max-count={bounded_limit + 1}"
            ).splitlines()
            commits = [repo.commit(revision) for revision in revisions if revision]
        else:
            commits = list(repo.iter_commits(max_count=bounded_limit + 1))

        has_more = len(commits) > bounded_limit
        commits = commits[:bounded_limit]
        activity, activity_truncated = _cached_commit_activity(repo, head)
        return {
            "head": head,
            "hasMore": has_more,
            "commits": [_commit_payload(commit) for commit in commits],
            "activity": activity,
            "activityTruncated": activity_truncated,
        }
    except HTTPException:
        raise
    except Exception as error:
        raise HTTPException(500, str(error)) from error


if __name__ == "__main__":
    import uvicorn

    # Hosts (Render/Railway/Fly) injetam PORT e exigem bind em 0.0.0.0.
    host = os.environ.get("HOST", "127.0.0.1")
    port = int(os.environ.get("PORT", "8000"))
    uvicorn.run(app, host=host, port=port)
