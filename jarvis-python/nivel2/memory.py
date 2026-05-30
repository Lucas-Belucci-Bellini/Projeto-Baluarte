"""
Jarvis - Nível 2: Memória de Contexto
Armazena o histórico de conversas por usuário e sessão.
Persiste em JSON para sobreviver a reinicializações.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from collections import deque


MEMORY_DIR = Path(__file__).parent / "memory_store"
MAX_MESSAGES = 40       # máximo de mensagens no contexto ativo
SUMMARY_THRESHOLD = 30  # resume quando chegar nesse número


class Memory:
    def __init__(self, user: str = "default", max_messages: int = MAX_MESSAGES):
        self.user = user
        self.max_messages = max_messages
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")
        self._history: deque = deque(maxlen=max_messages)
        self._facts: dict = {}   # fatos persistentes sobre o usuário
        self._session_summary: str = ""

        MEMORY_DIR.mkdir(exist_ok=True)
        self._load()

    # ──────────────── Histórico de mensagens ────────────────

    def add(self, role: str, content: str):
        """Adiciona mensagem ao histórico. role: 'user' | 'assistant'"""
        self._history.append({
            "role": role,
            "content": content,
            "ts": datetime.now().isoformat()
        })
        self._save()

    def get_context(self) -> list[dict]:
        """Retorna histórico no formato esperado pela API (sem timestamp)."""
        return [{"role": m["role"], "content": m["content"]} for m in self._history]

    def clear_session(self):
        """Limpa histórico da sessão atual mas mantém fatos."""
        self._history.clear()
        self._session_summary = ""
        self._save()

    # ──────────────── Fatos persistentes ────────────────

    def remember(self, key: str, value: str):
        """Salva um fato sobre o usuário (persistente entre sessões)."""
        self._facts[key] = {"value": value, "updated": datetime.now().isoformat()}
        self._save()
        print(f"[MEMÓRIA] Lembrei: {key} = {value}")

    def recall(self, key: str) -> str | None:
        """Recupera um fato salvo."""
        entry = self._facts.get(key)
        return entry["value"] if entry else None

    def get_facts_prompt(self) -> str:
        """Retorna fatos como texto para injetar no system prompt."""
        if not self._facts:
            return ""
        lines = [f"- {k}: {v['value']}" for k, v in self._facts.items()]
        return "O que você sabe sobre este usuário:\n" + "\n".join(lines)

    def set_summary(self, summary: str):
        self._session_summary = summary
        self._save()

    @property
    def message_count(self) -> int:
        return len(self._history)

    # ──────────────── Persistência ────────────────

    def _path(self) -> Path:
        return MEMORY_DIR / f"{self.user}.json"

    def _save(self):
        data = {
            "user": self.user,
            "facts": self._facts,
            "session_summary": self._session_summary,
            "history": list(self._history),
            "last_updated": datetime.now().isoformat()
        }
        with open(self._path(), "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

    def _load(self):
        p = self._path()
        if not p.exists():
            return
        try:
            with open(p, encoding="utf-8") as f:
                data = json.load(f)
            self._facts = data.get("facts", {})
            self._session_summary = data.get("session_summary", "")
            for msg in data.get("history", [])[-self.max_messages:]:
                self._history.append(msg)
            print(f"[MEMÓRIA] {len(self._history)} mensagens + {len(self._facts)} fatos carregados para '{self.user}'")
        except Exception as e:
            print(f"[MEMÓRIA] Erro ao carregar: {e}")
