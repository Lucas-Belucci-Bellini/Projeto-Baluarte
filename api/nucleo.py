"""Função serverless (Vercel) — comandos do Núcleo Mark XIII (v0.5.0 · #340).

O funil que liga o MUNDO EXTERNO (agente de voz da ElevenLabs, automações,
apps) ao site AO VIVO, sem servidor próprio:

    POST /api/nucleo  →  valida X-Nucleo-Token  →  INSERT em nucleo_events
                          (Supabase, service key)  →  Realtime empurra pro
                          site  →  o Núcleo reage na hora.

POST /api/nucleo
  headers: X-Nucleo-Token: <NUCLEO_TOKEN>
  body:    { "text": "mostrar corpo total", "source": "voz", "type": "command" }
  -> { ok: true, id }

GET /api/nucleo -> { ok: true, configured: bool }   (health, sem token)

Envs (Vercel → Settings → Environment Variables):
  NUCLEO_TOKEN               — o segredo que o chamador manda no header
  SUPABASE_SERVICE_ROLE_KEY  — service role key (NUNCA vai pro cliente).
                               Aceita também o nome SUPABASE_SERVICE_KEY.
  SUPABASE_URL               — opcional (default: projeto oficial)

Sem as envs, responde 503 explicando — nada quebra. Só stdlib.
"""

import json
import os
import urllib.error
import urllib.request
from http.server import BaseHTTPRequestHandler

SUPABASE_URL = (os.environ.get("SUPABASE_URL") or "https://hcwzsxdcvmswebunznak.supabase.co").rstrip("/")
# nome padrão do Supabase primeiro (já existe no Vercel); fallback pro alias curto
SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_SERVICE_KEY", "")
TOKEN = os.environ.get("NUCLEO_TOKEN", "")

TYPES = {"command", "telemetry", "biometric", "system", "response"}


def _insert_event(ev):
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/nucleo_events",
        method="POST",
        data=json.dumps(ev).encode(),
        headers={
            "apikey": SERVICE_KEY,
            "authorization": f"Bearer {SERVICE_KEY}",
            "content-type": "application/json",
            "prefer": "return=representation",
        },
    )
    with urllib.request.urlopen(req, timeout=8) as r:
        rows = json.loads(r.read().decode() or "[]")
    return rows[0]["id"] if rows else None


class handler(BaseHTTPRequestHandler):
    def _send(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self.send_header("access-control-allow-origin", "*")
        self.send_header("access-control-allow-headers", "content-type, x-nucleo-token")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):  # noqa: N802 (CORS preflight)
        self._send(204, {})

    def do_GET(self):  # noqa: N802
        self._send(200, {"ok": True, "configured": bool(TOKEN and SERVICE_KEY)})

    def do_POST(self):  # noqa: N802
        if not TOKEN or not SERVICE_KEY:
            self._send(503, {"ok": False, "error": "função não configurada (NUCLEO_TOKEN/SUPABASE_SERVICE_KEY nas envs do Vercel)"})
            return
        sent = self.headers.get("x-nucleo-token", "")
        if sent != TOKEN:
            self._send(401, {"ok": False, "error": "token inválido"})
            return
        try:
            length = int(self.headers.get("content-length") or 0)
            data = json.loads(self.rfile.read(length).decode() or "{}")
        except (ValueError, json.JSONDecodeError):
            self._send(400, {"ok": False, "error": "JSON inválido"})
            return

        text = str(data.get("text") or "").strip()[:500]
        ev_type = data.get("type") if data.get("type") in TYPES else "command"
        source = str(data.get("source") or "api").strip()[:40] or "api"
        if ev_type == "command" and not text:
            self._send(400, {"ok": False, "error": "campo 'text' obrigatório em comandos"})
            return

        payload = data.get("payload") if isinstance(data.get("payload"), dict) else {}
        if text:
            payload = {**payload, "text": text}

        try:
            ev_id = _insert_event({"type": ev_type, "source": source, "payload": payload})
            self._send(200, {"ok": True, "id": ev_id})
        except urllib.error.HTTPError as e:
            self._send(502, {"ok": False, "error": f"supabase HTTP {e.code}"})
        except Exception:  # noqa: BLE001 — resposta limpa, sem stack pro cliente
            self._send(502, {"ok": False, "error": "falha ao gravar o evento"})
