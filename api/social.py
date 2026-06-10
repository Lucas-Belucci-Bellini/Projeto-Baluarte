"""Função serverless (Vercel) — Mural / rede social leve do Baluarte (issue #187).

Guarda os posts do mural DENTRO do repo (branch jarvis-memory, arquivo
mural/posts.json), com um commit por post — assim o mural é compartilhado entre
quem abre o site, e versionado. Sem backend/banco: usa a API do GitHub.

POST /api/social
  { action: "post", post: {author, text} }  -> { ok, total }
  { action: "list" }                         -> { ok, posts }

Requer GITHUB_TOKEN (fine-grained PAT, Contents: read/write neste repo). Sem o
token, o site usa só o localStorage (mural local). Só usa a stdlib.
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
FILE = os.environ.get("MURAL_FILE", "mural/posts.json")
MAX_POSTS = 500


def _token():
    return os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")


def _req(method, path, body=None):
    data = json.dumps(body).encode("utf-8") if body is not None else None
    r = urllib.request.Request(GH + path, data=data, method=method)
    r.add_header("Authorization", "Bearer " + _token())
    r.add_header("Accept", "application/vnd.github+json")
    r.add_header("X-GitHub-Api-Version", "2022-11-28")
    r.add_header("User-Agent", "Baluarte-Mural")
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


def _put_file(posts, sha, message):
    content = base64.b64encode(json.dumps(posts, ensure_ascii=False).encode("utf-8")).decode("ascii")
    body = {"message": message, "content": content, "branch": BRANCH}
    if sha:
        body["sha"] = sha
    return _req("PUT", f"/repos/{REPO}/contents/{FILE}", body)


def post(p):
    text = (p.get("text") or "").strip()
    if not text:
        return {"ok": False, "error": "vazio"}
    author = (p.get("author") or "Operador").strip()[:40]
    _ensure_branch()
    for attempt in range(3):
        posts, sha = _get_file()
        posts.append({
            "id": p.get("id") or ("p" + str(int(time.time() * 1000))),
            "author": author,
            "text": text[:1000],
            "ts": p.get("ts") or int(time.time() * 1000),
        })
        posts = posts[-MAX_POSTS:]
        try:
            _put_file(posts, sha, f"mural: {author}: {text[:50]}")
            return {"ok": True, "total": len(posts)}
        except urllib.error.HTTPError as e:
            if e.code in (409, 422) and attempt < 2:
                time.sleep(0.4)
                continue
            raise
    return {"ok": False, "error": "conflito de escrita"}


def listing():
    posts, _ = _get_file()
    return {"ok": True, "posts": posts, "total": len(posts)}


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
            return self._json(200, {"ok": False, "error": "GITHUB_TOKEN ausente — mural só local. Defina o token nas envs da Vercel para compartilhar."})
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._json(400, {"ok": False, "error": "corpo inválido"})
        try:
            if data.get("action") == "post":
                self._json(200, post(data.get("post", {})))
            else:
                self._json(200, listing())
        except urllib.error.HTTPError as e:
            self._json(200, {"ok": False, "error": f"GitHub HTTP {e.code}: {e.read().decode('utf-8', 'ignore')[:200]}"})
        except Exception as e:  # noqa: BLE001
            self._json(200, {"ok": False, "error": str(e)})
