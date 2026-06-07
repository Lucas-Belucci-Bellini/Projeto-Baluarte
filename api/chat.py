"""Função serverless (Vercel) — núcleo de IA do Baluarte (modo Servidor).

Roda no MESMO domínio do site, então não há mixed-content nem URL separada.
POST /api/chat  { messages: [{role, content}], system }  ->  { resposta }

Usa Gemini com busca no Google (grounding). Requer a env GEMINI_API_KEY
definida nas Environment Variables do projeto na Vercel.
"""

import json
import os
from http.server import BaseHTTPRequestHandler

MODEL = os.environ.get("BALUARTE_MODEL", "gemini-2.5-flash")
SYSTEM_DEFAULT = (
    "Você é o J.A.R.V.I.S., núcleo de IA do Projeto Baluarte Mark XIII, "
    "assistente do operador Lucas Belucci Bellini. Responda em português, de "
    "forma clara e tática. Use o dossiê do Baluarte fornecido no contexto para "
    "falar do universo; para fatos recentes do mundo real, use a busca integrada."
)


def _generate(messages, system):
    from google import genai
    from google.genai import types

    client = genai.Client()  # usa GEMINI_API_KEY do ambiente
    contents = []
    for m in messages:
        role = "model" if m.get("role") in ("assistant", "model", "jarvis") else "user"
        contents.append(
            types.Content(role=role, parts=[types.Part.from_text(text=m.get("content", ""))])
        )
    config = types.GenerateContentConfig(
        system_instruction=system or SYSTEM_DEFAULT,
        tools=[types.Tool(google_search=types.GoogleSearch())],
        temperature=0.3,
    )
    resp = client.models.generate_content(model=MODEL, contents=contents, config=config)
    return resp.text or "(resposta vazia)"


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
        if not os.environ.get("GEMINI_API_KEY"):
            return self._json(200, {"resposta": "[Defina GEMINI_API_KEY nas Environment Variables do projeto na Vercel e faça redeploy.]"})
        try:
            n = int(self.headers.get("Content-Length", 0))
            data = json.loads(self.rfile.read(n) or b"{}")
        except Exception:
            return self._json(400, {"resposta": "[erro: corpo inválido]"})
        try:
            texto = _generate(data.get("messages", []), data.get("system"))
            self._json(200, {"resposta": texto})
        except Exception as e:  # noqa: BLE001 — devolve o erro ao cliente
            self._json(200, {"resposta": f"[erro no servidor da IA: {e}]"})
