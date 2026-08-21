"""GET /api/claims — observação server-side read-only de claims.

A função usa o adaptador compartilhado de backend. Sem Supabase configurado ou
Bearer validado, responde deny-by-default. Token, subject e metadata não saem.
"""

import json
import os
from http.server import BaseHTTPRequestHandler

from backend.claims_adapter import observe_bearer_claims


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        snapshot = observe_bearer_claims(
            self.headers.get("Authorization"),
            base_url=os.environ.get("SUPABASE_URL"),
            anon_key=os.environ.get("SUPABASE_ANON_KEY"),
        )
        body = json.dumps(snapshot).encode("utf-8")
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(body)
