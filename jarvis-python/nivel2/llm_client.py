"""
Jarvis - Nível 2: Cliente LLM
Suporta Claude (Anthropic), Ollama (local) e modo offline.
Troca de backend sem mudar o resto do código.
"""

import os
from enum import Enum
from dotenv import load_dotenv

load_dotenv()


class Backend(Enum):
    CLAUDE = "claude"
    OLLAMA = "ollama"
    OFFLINE = "offline"


SYSTEM_PROMPT_BASE = """Você é J.A.R.V.I.S. — assistente pessoal de {user}.

Personalidade:
- Direto, inteligente e levemente sarcástico (como o Jarvis do Tony Stark)
- Respostas curtas por padrão — você está sendo ouvido em voz alta
- Quando precisar de detalhes, dê em tópicos curtos
- Fale em português do Brasil sempre
- Chame o usuário pelo nome quando fizer sentido

Capacidades:
- Responder perguntas e manter contexto da conversa
- Lembrar informações sobre o usuário entre sessões
- Executar comandos do sistema quando solicitado
- Integrar com câmera e reconhecimento de voz (Nível 1)

{facts}

Hoje é {date}. Hora atual: {time}.
"""


class LLMClient:
    def __init__(self, backend: str = None, model: str = None):
        raw = backend or os.getenv("JARVIS_BACKEND", "claude")
        self.backend = Backend(raw.lower())
        self.model = model or self._default_model()
        self._client = None
        self._init_client()

    def _default_model(self) -> str:
        if self.backend == Backend.CLAUDE:
            return "claude-opus-4-8"
        if self.backend == Backend.OLLAMA:
            return os.getenv("JARVIS_OLLAMA_MODEL", "llama3.2")
        return "offline"

    def _init_client(self):
        if self.backend == Backend.CLAUDE:
            try:
                import anthropic
                self._client = anthropic.Anthropic(
                    api_key=os.getenv("ANTHROPIC_API_KEY")
                )
                print(f"[LLM] Backend: Claude ({self.model})")
            except ImportError:
                print("[LLM] anthropic não instalado — usando offline")
                self.backend = Backend.OFFLINE

        elif self.backend == Backend.OLLAMA:
            try:
                import ollama
                self._client = ollama
                print(f"[LLM] Backend: Ollama ({self.model}) — 100% local")
            except ImportError:
                print("[LLM] ollama não instalado — usando offline")
                self.backend = Backend.OFFLINE

        if self.backend == Backend.OFFLINE:
            print("[LLM] Modo offline — respostas locais básicas")

    def build_system(self, user: str, facts: str = "") -> str:
        from datetime import datetime
        now = datetime.now()
        return SYSTEM_PROMPT_BASE.format(
            user=user,
            facts=facts,
            date=now.strftime("%d/%m/%Y"),
            time=now.strftime("%H:%M")
        )

    def chat(self, messages: list[dict], system: str, stream_cb=None) -> str:
        """
        Envia mensagens para o LLM e retorna a resposta.
        stream_cb: callback(token: str) para streaming em tempo real.
        """
        if self.backend == Backend.CLAUDE:
            return self._chat_claude(messages, system, stream_cb)
        if self.backend == Backend.OLLAMA:
            return self._chat_ollama(messages, system, stream_cb)
        return self._chat_offline(messages)

    def _chat_claude(self, messages: list[dict], system: str, stream_cb) -> str:
        try:
            if stream_cb:
                full = ""
                with self._client.messages.stream(
                    model=self.model,
                    max_tokens=512,
                    system=system,
                    messages=messages
                ) as stream:
                    for text in stream.text_stream:
                        full += text
                        stream_cb(text)
                return full
            else:
                resp = self._client.messages.create(
                    model=self.model,
                    max_tokens=512,
                    system=system,
                    messages=messages
                )
                return resp.content[0].text
        except Exception as e:
            return f"Erro de comunicação: {e}"

    def _chat_ollama(self, messages: list[dict], system: str, stream_cb) -> str:
        try:
            all_msgs = [{"role": "system", "content": system}] + messages
            if stream_cb:
                full = ""
                for chunk in self._client.chat(
                    model=self.model,
                    messages=all_msgs,
                    stream=True
                ):
                    token = chunk["message"]["content"]
                    full += token
                    stream_cb(token)
                return full
            else:
                resp = self._client.chat(model=self.model, messages=all_msgs)
                return resp["message"]["content"]
        except Exception as e:
            return f"Ollama indisponível: {e}"

    def _chat_offline(self, messages: list[dict]) -> str:
        last = messages[-1]["content"].lower() if messages else ""
        if any(w in last for w in ["hora", "horas", "tempo"]):
            from datetime import datetime
            return datetime.now().strftime("São %H:%M.")
        if any(w in last for w in ["olá", "oi", "hey"]):
            return "Olá. Como posso ajudar?"
        return "Modo offline. Configure ANTHROPIC_API_KEY ou inicie o Ollama."
