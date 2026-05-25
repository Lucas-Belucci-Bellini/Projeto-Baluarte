"""Função serverless (Vercel) — health check do backend de IA.
GET /api/health -> { ok, model, hasKey }  (hasKey diz se GEMINI_API_KEY existe)
"""

import json
import os
from http.server import BaseHTTPRequestHandler


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = json.dumps({
            "ok": True,
            "model": os.environ.get("BALUARTE_MODEL", "gemini-2.5-flash"),
            "hasKey": bool(os.environ.get("GEMINI_API_KEY")),
        }).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
