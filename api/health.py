"""Função serverless (Vercel) — health check + detecção de APIs (issue #200).

GET /api/health -> {
  ok, model, hasKey,                       # campos antigos (compatibilidade)
  keys: {                                  # detecção de chaves (só booleanos —
    gemini: bool,                          #  o VALOR nunca sai do servidor)
    hermes: bool,
    claude: bool, claudeEnv: "NOME" | null # qual env a chave Claude usa
  },
  models: { gemini, hermes, claude }
}

A detecção da chave Claude aceita nomes personalizados (ex: "Claude_Fable"):
qualquer env cujo valor comece com "sk-ant-" ou cujo nome contenha
claude/anthropic. Mesma lógica de api/claude.py (duplicada de propósito —
cada função serverless é isolada).
"""

import json
import os
from http.server import BaseHTTPRequestHandler

_NAO_CHAVE = ("MODEL", "ENDPOINT", "VERSION")


def project_health(model, has_key):
    """Projeta liveness e prontidão sem expor segredos ou claims."""
    return {
        "contractVersion": "server-health/v1",
        "source": "runtime-observed",
        "connection": "connected",
        "health": "healthy" if has_key else "degraded",
        "severity": "none" if has_key else "warning",
        "fallback": "available" if has_key else "degraded",
        "authority": "not-authorized",
        "ok": True,
        "service": "jarvis-backend",
        "model": model,
        "hasKey": has_key,
        "detail": "health endpoint + Gemini key observados" if has_key else "health endpoint observado; chave Gemini ausente",
    }


def find_claude_key():
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


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        claude_key, claude_env = find_claude_key()
        model = os.environ.get("BALUARTE_MODEL", "gemini-2.5-flash")
        has_key = bool(os.environ.get("GEMINI_API_KEY"))
        body = json.dumps({
            **project_health(model, has_key),
            "keys": {
                "gemini": bool(os.environ.get("GEMINI_API_KEY")),
                "hermes": bool(os.environ.get("OPENROUTER_API_KEY") or os.environ.get("HERMES_API_KEY")),
                "claude": bool(claude_key),
                "claudeEnv": claude_env,
            },
            "models": {
                "gemini": model,
                "hermes": os.environ.get("HERMES_MODEL", "nousresearch/hermes-3-llama-3.1-70b"),
                "claude": os.environ.get("CLAUDE_MODEL") or os.environ.get("ANTHROPIC_MODEL") or "claude-sonnet-4-6",
            },
        }).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
