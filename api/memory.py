"""Função serverless (Vercel) — Memória versionada no repositório.

Guarda a memória do JARVIS DENTRO do repo, numa branch dedicada (jarvis-memory),
para não redeployar o site a cada pergunta. Toda memória nova vira um COMMIT.

POST /api/memory
  { action: "save", entry: {text, source, conceptIds?, codeIds?, ts?} }  -> { ok, total }
  { action: "list" }                                                     -> { ok, entries }

Requer GITHUB_TOKEN (fine-grained PAT com Contents: read/write NESTE repo) nas
Environment Variables da Vercel. Opcionais: GITHUB_REPO, MEMORY_BRANCH.
Só usa a biblioteca padrão (urllib) — sem dependências.
"""

import base64
import json
import os
import time
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

GH = "https://api.github.com"
REPO = os.environ.get("GITHUB_REPO", "Lucas-Belucci-Bellini/Projeto-Baluarte")
BRANCH = os.environ.get("MEMORY_BRANCH", "jarvis-memory")
BASE_BRANCH = os.environ.get("MEMORY_BASE_BRANCH", "main")
FILE = os.environ.get("MEMORY_FILE", "memoria/banco.json")


def _token():
    return os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")


def _req(method, path, body=None):
    url = GH + path
    data = json.dumps(body).encode("utf-8") if body is not None else None
    r = urllib.request.Request(url, data=data, method=method)
    r.add_header("Authorization", "Bearer " + _token())
    r.add_header("Accept", "application/vnd.github+json")
    r.add_header("X-GitHub-Api-Version", "2022-11-28")
    r.add_header("User-Agent", "Baluarte-Memory")
    if data is not None:
        r.add_header("Content-Type", "application/json")
    with urllib.request.urlopen(r, timeout=20) as resp:
        return json.loads(resp.read().decode("utf-8") or "{}")


def _ensure_branch():
    try:
        _req("GET", f"/repos/{REPO}/git/ref/heads/{BRANCH}")
        return
    except urllib.error.HTTPError as e:
        if e.code != 404:
            raise
    base = _req("GET", f"/repos/{REPO}/git/ref/heads/{BASE_BRANCH}")
    _req("POST", f"/repos/{REPO}/git/refs", {"ref": f"refs/heads/{BRANCH}", "sha": base["object"]["sha"]})


def _get_file():
    try:
        data = _req("GET", f"/repos/{REPO}/contents/{FILE}?ref={BRANCH}")
        content = base64.b64decode(data.get("content", "")).decode("utf-8")
        return json.loads(content or "[]"), data.get("sha")
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return [], None
        raise


def _put_file(entries, sha, message):
    content = base64.b64encode(json.dumps(entries, ensure_ascii=False).encode("utf-8")).decode("ascii")
    body = {"message": message, "content": content, "branch": BRANCH}
    if sha:
        body["sha"] = sha
    return _req("PUT", f"/repos/{REPO}/contents/{FILE}", body)


def save(entry):
    text = (entry.get("text") or "").strip()
    if not text:
        return {"ok": False, "error": "vazio"}
    _ensure_branch()
    for attempt in range(3):
        entries, sha = _get_file()
        if any((e.get("text", "").lower() == text.lower()) for e in entries):
            return {"ok": True, "dup": True, "total": len(entries)}
        entries.append({
            "text": text,
            "source": entry.get("source", "repo"),
            "conceptIds": entry.get("conceptIds", []),
            "codeIds": entry.get("codeIds", []),
            "ts": entry.get("ts") or int(time.time() * 1000),
        })
        try:
            _put_file(entries, sha, f"memoria: {text[:60]}")
            return {"ok": True, "total": len(entries)}
        except urllib.error.HTTPError as e:
            if e.code in (409, 422) and attempt < 2:
                time.sleep(0.4)
                continue
            raise
    return {"ok": False, "error": "conflito de escrita"}


def listing():
    entries, _ = _get_file()
    return {"ok": True, "entries": entries, "total": len(entries)}


class handler(BaseHTTPRequestHandler):
    def _json(self, code, obj):
        body = json.dumps(obj).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        self._json(204, {})

    def do_POST(self):
        if not _token():
            return self._json(200, {"ok": False, "error": "GITHUB_TOKEN ausente. Defina um fine-grained PAT (Contents: read/write neste repo) nas envs da Vercel e faça redeploy."})
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._json(400, {"ok": False, "error": "corpo inválido"})
        action = data.get("action", "list")
        try:
            if action == "save":
                self._json(200, save(data.get("entry", {})))
            else:
                self._json(200, listing())
        except urllib.error.HTTPError as e:
            detail = e.read().decode("utf-8", "ignore")[:200]
            self._json(200, {"ok": False, "error": f"GitHub HTTP {e.code}: {detail}"})
        except Exception as e:  # noqa: BLE001
            self._json(200, {"ok": False, "error": str(e)})
