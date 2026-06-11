"""Função serverless (Vercel) — Claude no servidor (issue #200).

POST /api/claude  { messages: [{role, content}], system, model?, max_tokens? }
                  ->  { resposta }

Igual ao /api/chat (Gemini), mas falando com a API da Anthropic. A chave fica
nas Environment Variables da Vercel — NUNCA no navegador nem no repositório.

DETECÇÃO DA CHAVE (núcleo do issue #200): além dos nomes padrão
(ANTHROPIC_API_KEY, CLAUDE_API_KEY), este endpoint encontra a chave mesmo com
nomes personalizados (ex: "Claude_Fable", "Claude_IA_OPUS"): qualquer env cujo
valor comece com "sk-ant-" ou cujo nome contenha claude/anthropic.

Modelo: env CLAUDE_MODEL (padrão claude-sonnet-4-6); o corpo pode pedir outro
modelo desde que comece com "claude-". Sem dependências externas (urllib).
"""

import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

MODEL_DEFAULT = os.environ.get("CLAUDE_MODEL") or os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-6"
ENDPOINT = "https://api.anthropic.com/v1/messages"

# Nomes que são configuração (não chave) — ignorados na varredura por nome.
_NAO_CHAVE = ("MODEL", "ENDPOINT", "VERSION")


def find_claude_key():
    """Acha a chave da Anthropic no ambiente. Retorna (valor, nome_da_env) ou (None, None).
    (Função duplicada em health.py de propósito — cada função serverless é isolada.)"""
    for name in ("ANTHROPIC_API_KEY", "CLAUDE_API_KEY"):
        if os.environ.get(name):
            return os.environ[name], name
    for name, value in os.environ.items():
        if value and value.startswith("sk-ant-"):
            return value, name
    for name, value in os.environ.items():
        lower = name.lower()
        if value and ("claude" in lower or "anthropic" in lower) and not any(s in name.upper() for s in _NAO_CHAVE):
            return value, name
    return None, None


def _generate(key, messages, system, model, max_tokens):
    contents = []
    for m in messages:
        role = "assistant" if m.get("role") in ("assistant", "model", "jarvis") else "user"
        contents.append({"role": role, "content": str(m.get("content", ""))})
    payload = {
        "model": model,
        "max_tokens": max_tokens,
        "messages": contents,
    }
    if system:
        payload["system"] = system
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "x-api-key": key,
            "anthropic-version": "2023-06-01",
        },
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=60) as res:
        data = json.loads(res.read().decode("utf-8"))
    parts = data.get("content") or []
    texto = "".join(p.get("text", "") for p in parts if p.get("type") == "text")
    return texto or "(resposta vazia)"


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
        key, env_name = find_claude_key()
        if not key:
            return self._json(200, {"resposta": "[Nenhuma chave Claude no servidor. Defina ANTHROPIC_API_KEY nas Environment Variables da Vercel e faça redeploy.]"})
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._json(400, {"resposta": "[erro: corpo inválido]"})

        model = data.get("model") or MODEL_DEFAULT
        if not str(model).startswith("claude-"):
            model = MODEL_DEFAULT
        try:
            max_tokens = max(1, min(int(data.get("max_tokens") or 600), 1024))
        except Exception:
            max_tokens = 600

        try:
            texto = _generate(key, data.get("messages", []), data.get("system"), model, max_tokens)
            self._json(200, {"resposta": texto, "model": model, "env": env_name})
        except urllib.error.HTTPError as e:  # devolve o erro da Anthropic legível
            try:
                detail = json.loads(e.read().decode("utf-8")).get("error", {}).get("message", "")
            except Exception:
                detail = ""
            self._json(200, {"resposta": f"[erro da API Claude: HTTP {e.code} — {detail or e.reason}]"})
        except Exception as e:  # noqa: BLE001 — devolve o erro ao cliente
            self._json(200, {"resposta": f"[erro no servidor da IA: {e}]"})
