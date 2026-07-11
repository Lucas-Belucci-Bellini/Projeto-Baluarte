"""Função serverless (Vercel) — Voz do J.A.R.V.I.S. pelo SERVIDOR (#340).

Camada segura da ElevenLabs: a `xi-api-key` vive SÓ nas envs do Vercel — o
navegador nunca a vê. Complementa (não substitui) o modo local do site, em que
o operador cola a própria chave com "voz chave <key>". Com a env configurada,
QUALQUER visitante ganha a voz ElevenLabs sem chave nenhuma.

POST /api/voz
  body: { "text": "fala até 600 chars", "lang": "pt-BR" (opcional) }
  -> audio/mpeg (MP3 da voz de referência do J.A.R.V.I.S.)

GET  /api/voz               -> { ok, configured, agent }        (health)
GET  /api/voz?signed=1      -> { ok, signed_url }   (WebSocket do agente
                               conversacional — requer ELEVENLABS_AGENT_ID)

Envs (Vercel → Settings → Environment Variables):
  ELEVENLABS_API_KEY   — a chave sk_… (permissões: Text to Speech; p/ o agente,
                         Conversational AI). NUNCA como NEXT_PUBLIC_/VITE_.
  ELEVENLABS_VOICE_ID  — opcional (default: voz de referência do operador)
  ELEVENLABS_AGENT_ID  — opcional (só pro ?signed=1 do agente de voz)

Sem a env, responde 503 explicando — o site cai no speechSynthesis. Só stdlib.
"""

import json
import os
import urllib.error
import urllib.parse
import urllib.request
from http.server import BaseHTTPRequestHandler

API_KEY = os.environ.get("ELEVENLABS_API_KEY", "")
VOICE_ID = os.environ.get("ELEVENLABS_VOICE_ID") or "Gubgw9l4dtIoQA9YZHgx"
AGENT_ID = os.environ.get("ELEVENLABS_AGENT_ID", "")
BASE = "https://api.elevenlabs.io"


class handler(BaseHTTPRequestHandler):
    def _cors(self):
        self.send_header("access-control-allow-origin", "*")
        self.send_header("access-control-allow-headers", "content-type")

    def _json(self, code, obj):
        body = json.dumps(obj).encode()
        self.send_response(code)
        self.send_header("content-type", "application/json")
        self._cors()
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):  # noqa: N802 (CORS preflight)
        self._json(204, {})

    def do_GET(self):  # noqa: N802
        query = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(query)
        if "signed" not in params:
            self._json(200, {"ok": True, "configured": bool(API_KEY), "agent": bool(AGENT_ID)})
            return
        # signed URL do agente conversacional (WS sem expor a chave no browser)
        if not API_KEY or not AGENT_ID:
            self._json(503, {"ok": False, "error": "configure ELEVENLABS_API_KEY e ELEVENLABS_AGENT_ID nas envs do Vercel"})
            return
        req = urllib.request.Request(
            f"{BASE}/v1/convai/conversation/get_signed_url?agent_id={urllib.parse.quote(AGENT_ID)}",
            headers={"xi-api-key": API_KEY},
        )
        try:
            with urllib.request.urlopen(req, timeout=8) as r:
                data = json.loads(r.read().decode() or "{}")
            self._json(200, {"ok": True, "signed_url": data.get("signed_url")})
        except urllib.error.HTTPError as e:
            self._json(502, {"ok": False, "error": f"elevenlabs HTTP {e.code}"})
        except Exception:  # noqa: BLE001
            self._json(502, {"ok": False, "error": "falha ao obter a signed URL"})

    def do_POST(self):  # noqa: N802
        if not API_KEY:
            self._json(503, {"ok": False, "error": "função não configurada (ELEVENLABS_API_KEY nas envs do Vercel)"})
            return
        try:
            length = int(self.headers.get("content-length") or 0)
            data = json.loads(self.rfile.read(length).decode() or "{}")
        except (ValueError, json.JSONDecodeError):
            self._json(400, {"ok": False, "error": "JSON inválido"})
            return

        text = str(data.get("text") or "").strip()[:600]  # mesmo teto do front
        if not text:
            self._json(400, {"ok": False, "error": "campo 'text' obrigatório"})
            return

        req = urllib.request.Request(
            f"{BASE}/v1/text-to-speech/{VOICE_ID}",
            method="POST",
            data=json.dumps({
                "text": text,
                "model_id": "eleven_multilingual_v2",
                "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.25},
            }).encode(),
            headers={
                "xi-api-key": API_KEY,
                "content-type": "application/json",
                "accept": "audio/mpeg",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=25) as r:
                audio = r.read()
            self.send_response(200)
            self.send_header("content-type", "audio/mpeg")
            self.send_header("cache-control", "no-store")
            self._cors()
            self.end_headers()
            self.wfile.write(audio)
        except urllib.error.HTTPError as e:
            self._json(502, {"ok": False, "error": f"elevenlabs HTTP {e.code} (chave/quota?)"})
        except Exception:  # noqa: BLE001
            self._json(502, {"ok": False, "error": "falha no TTS"})
