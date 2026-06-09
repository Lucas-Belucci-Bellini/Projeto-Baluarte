"""Função serverless (Vercel) — modo Hermes (servidor).

Roda no MESMO domínio do site. É um PROXY para um provedor que hospeda os
modelos Nous Hermes (por padrão o OpenRouter). Os pesos rodam no provedor (com
GPU); a Vercel só intermedia e guarda a chave. Assim o Hermes funciona em
QUALQUER device, sem WebGPU — e até os modelos grandes (70B/405B) ficam usáveis.

POST /api/hermes  { messages:[{role,content}], system, model? }  ->  { resposta }

Requer OPENROUTER_API_KEY (crie em https://openrouter.ai/keys) nas Environment
Variables do projeto na Vercel. Opcional: HERMES_MODEL e HERMES_ENDPOINT.
Só usa a biblioteca padrão do Python (urllib) — sem dependências.
"""

import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

ENDPOINT = os.environ.get("HERMES_ENDPOINT", "https://openrouter.ai/api/v1/chat/completions")
MODEL = os.environ.get("HERMES_MODEL", "nousresearch/hermes-3-llama-3.1-70b")
SYSTEM_DEFAULT = (
    "Você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte Mark XIII (modelo "
    "Nous Hermes), assistente do operador Lucas Belucci Bellini. Responda em "
    "português, de forma clara e tática. Use o dossiê do Baluarte fornecido no "
    "contexto para falar do universo."
)


def _api_key():
    return os.environ.get("OPENROUTER_API_KEY") or os.environ.get("HERMES_API_KEY")


def _generate(messages, system, model):
    msgs = [{"role": "system", "content": system or SYSTEM_DEFAULT}]
    for m in messages:
        role = "assistant" if m.get("role") in ("assistant", "model", "jarvis") else "user"
        msgs.append({"role": role, "content": m.get("content", "")})

    payload = json.dumps({
        "model": model or MODEL,
        "messages": msgs,
        "temperature": 0.4,
        "max_tokens": 1024,
    }).encode("utf-8")

    req = urllib.request.Request(ENDPOINT, data=payload, method="POST")
    req.add_header("Content-Type", "application/json")
    req.add_header("Authorization", "Bearer " + _api_key())
    # Recomendado pelo OpenRouter (atribuição); inofensivo para outros provedores.
    req.add_header("HTTP-Referer", "https://projeto-baluarte.vercel.app")
    req.add_header("X-Title", "Projeto Baluarte")

    with urllib.request.urlopen(req, timeout=55) as r:
        data = json.loads(r.read().decode("utf-8"))
    return (data["choices"][0]["message"]["content"] or "(resposta vazia)")


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
        if not _api_key():
            return self._json(200, {"resposta": "[Defina OPENROUTER_API_KEY nas Environment Variables da Vercel e faça redeploy. Crie a chave grátis em https://openrouter.ai/keys]"})
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._json(400, {"resposta": "[erro: corpo inválido]"})
        try:
            texto = _generate(data.get("messages", []), data.get("system"), data.get("model"))
            self._json(200, {"resposta": texto})
        except urllib.error.HTTPError as e:  # erro do provedor
            detail = e.read().decode("utf-8", "ignore")[:300]
            self._json(200, {"resposta": f"[erro do provedor Hermes: HTTP {e.code} — {detail}]"})
        except Exception as e:  # noqa: BLE001
            self._json(200, {"resposta": f"[erro no servidor Hermes: {e}]"})
