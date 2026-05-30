"""
Jarvis - Nível 3: Bridge para n8n
Dispara webhooks no n8n para automações externas:
- Notificações
- Google Drive / Sheets
- Integrações com APIs externas
- Pipelines de dados
"""

import os
import json
import threading
import requests
from datetime import datetime
from dotenv import load_dotenv

load_dotenv()

N8N_BASE = os.getenv("N8N_BASE_URL", "http://localhost:5678")
N8N_TOKEN = os.getenv("N8N_API_TOKEN", "")

# Webhooks registrados no n8n (configure em N8N_WEBHOOKS_* no .env)
WEBHOOKS = {
    "sessao":    os.getenv("N8N_WEBHOOK_SESSAO",   f"{N8N_BASE}/webhook/jarvis-sessao"),
    "evento":    os.getenv("N8N_WEBHOOK_EVENTO",   f"{N8N_BASE}/webhook/jarvis-evento"),
    "alerta":    os.getenv("N8N_WEBHOOK_ALERTA",   f"{N8N_BASE}/webhook/jarvis-alerta"),
    "memoria":   os.getenv("N8N_WEBHOOK_MEMORIA",  f"{N8N_BASE}/webhook/jarvis-memoria"),
    "drive":     os.getenv("N8N_WEBHOOK_DRIVE",    f"{N8N_BASE}/webhook/jarvis-drive"),
}


class N8nBridge:
    def __init__(self, enabled: bool = True):
        self.enabled = enabled and bool(N8N_BASE)
        self._queue: list[dict] = []
        self._lock = threading.Lock()

        if self.enabled:
            print(f"[N8N] Bridge ativa → {N8N_BASE}")
        else:
            print("[N8N] Bridge desativada (N8N_BASE_URL não configurado)")

    def _send(self, webhook_key: str, payload: dict, async_: bool = True):
        if not self.enabled:
            return

        url = WEBHOOKS.get(webhook_key)
        if not url:
            return

        payload["_ts"] = datetime.now().isoformat()
        payload["_source"] = "jarvis"

        headers = {"Content-Type": "application/json"}
        if N8N_TOKEN:
            headers["Authorization"] = f"Bearer {N8N_TOKEN}"

        def _do():
            try:
                r = requests.post(url, json=payload, headers=headers, timeout=5)
                if r.status_code >= 400:
                    print(f"[N8N] Erro {r.status_code} em '{webhook_key}'")
            except requests.exceptions.ConnectionError:
                print(f"[N8N] n8n indisponível — evento '{webhook_key}' descartado")
            except Exception as e:
                print(f"[N8N] Erro inesperado: {e}")

        if async_:
            threading.Thread(target=_do, daemon=True).start()
        else:
            _do()

    # ──────────────── Eventos do Jarvis ────────────────

    def notify_session_end(self, user: str, message_count: int, summary: str, git_hash: str = ""):
        """Dispara ao final de uma sessão — pode gravar no Drive, enviar resumo etc."""
        self._send("sessao", {
            "user": user,
            "messages": message_count,
            "summary": summary,
            "git_commit": git_hash,
            "hora": datetime.now().strftime("%H:%M")
        })

    def notify_event(self, event_type: str, data: dict):
        """Evento genérico — motion, face_detected, command etc."""
        self._send("evento", {"type": event_type, **data})

    def notify_alert(self, title: str, body: str, level: str = "info"):
        """Alerta para o usuário via n8n (email, Telegram, etc.)."""
        self._send("alerta", {"title": title, "body": body, "level": level})

    def sync_memory_to_drive(self, user: str, facts: dict):
        """Envia memória do usuário para o Google Drive via n8n."""
        self._send("drive", {
            "action": "update_memory",
            "user": user,
            "facts": facts,
            "count": len(facts)
        })

    def notify_memory_update(self, user: str, key: str, value: str):
        """Avisa n8n que um fato novo foi salvo."""
        self._send("memoria", {
            "user": user,
            "key": key,
            "value": value
        })


# ──────────────── Template de workflow n8n ────────────────

N8N_WORKFLOW_TEMPLATE = {
    "name": "Jarvis Pipeline",
    "nodes": [
        {
            "name": "Webhook Sessão",
            "type": "n8n-nodes-base.webhook",
            "parameters": {"path": "jarvis-sessao", "responseMode": "lastNode"},
            "position": [240, 300]
        },
        {
            "name": "Salvar no Google Sheets",
            "type": "n8n-nodes-base.googleSheets",
            "parameters": {
                "operation": "append",
                "sheetId": "{{SEU_SHEET_ID}}",
                "range": "sessoes!A:F",
                "values": {
                    "values": [[
                        "={{$json.user}}",
                        "={{$json.messages}}",
                        "={{$json.summary}}",
                        "={{$json.git_commit}}",
                        "={{$json._ts}}"
                    ]]
                }
            },
            "position": [460, 300]
        },
        {
            "name": "Webhook Alerta",
            "type": "n8n-nodes-base.webhook",
            "parameters": {"path": "jarvis-alerta", "responseMode": "lastNode"},
            "position": [240, 500]
        },
        {
            "name": "Enviar Email",
            "type": "n8n-nodes-base.emailSend",
            "parameters": {
                "toEmail": "lucasbb2007@gmail.com",
                "subject": "=[JARVIS] {{$json.title}}",
                "text": "={{$json.body}}"
            },
            "position": [460, 500]
        }
    ],
    "connections": {
        "Webhook Sessão": {"main": [[{"node": "Salvar no Google Sheets"}]]},
        "Webhook Alerta": {"main": [[{"node": "Enviar Email"}]]}
    }
}


def export_n8n_template(path: str = "n8n_workflow.json"):
    """Exporta o template de workflow para importar no n8n."""
    with open(path, "w", encoding="utf-8") as f:
        json.dump(N8N_WORKFLOW_TEMPLATE, f, ensure_ascii=False, indent=2)
    print(f"[N8N] Template exportado: {path}")
    print("[N8N] Importe em: n8n → Workflows → Import from file")


if __name__ == "__main__":
    export_n8n_template()
