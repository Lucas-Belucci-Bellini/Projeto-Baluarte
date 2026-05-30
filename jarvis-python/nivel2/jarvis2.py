"""
Jarvis - Nível 2: Sistema Integrado com LLM + Memória
Pipeline: Movimento → Rosto → Voz → LLM → Resposta em voz
"""

import sys
import threading
import time
from pathlib import Path
from rich.console import Console
from rich.panel import Panel
from rich.text import Text

# adiciona nível 1 ao path
sys.path.insert(0, str(Path(__file__).parent.parent / "nivel1"))

from camera_motion import MotionDetector
from face_recognition_module import FaceRecognizer
from voice_command import VoiceCommand
from memory import Memory
from llm_client import LLMClient, Backend

console = Console()


class Jarvis2:
    def __init__(self, backend: str = None):
        self.motion   = MotionDetector(sensitivity=500)
        self.face     = FaceRecognizer()
        self.voice    = VoiceCommand(wake_word="jarvis")
        self.llm      = LLMClient(backend=backend)
        self.memory   = Memory(user="default")
        self.active   = False
        self.busy     = False
        self._setup()

    def _setup(self):
        self.motion.on_motion(self._on_motion)
        self.face.on_recognition(self._on_face)

        # comandos diretos (sem LLM)
        self.voice.register_command("lembrar",    self._cmd_lembrar,    "salva um fato na memória")
        self.voice.register_command("limpar memória", self._cmd_limpar, "limpa histórico da sessão")
        self.voice.register_command("desligar",   self._cmd_desligar,   "desliga o Jarvis")

        # tudo mais vai pro LLM
        self.voice.fallback = self._llm_respond

    def _on_motion(self):
        if not self.active:
            self.active = True
            self.voice.speak("Presença detectada.")

    def _on_face(self, name: str):
        if name != "Desconhecido":
            if self.memory.user != name:
                self.memory = Memory(user=name)
            self.voice.speak(f"Bem-vindo, {name}.")
        else:
            self.voice.speak("Rosto não reconhecido.")

    def _llm_respond(self, text: str):
        if self.busy:
            return
        self.busy = True
        try:
            self.memory.add("user", text)

            system = self.llm.build_system(
                user=self.memory.user,
                facts=self.memory.get_facts_prompt()
            )

            console.print(f"\n[cyan]▸ Usuário:[/cyan] {text}")

            tokens = []
            def on_token(t):
                tokens.append(t)

            response = self.llm.chat(
                messages=self.memory.get_context(),
                system=system,
                stream_cb=on_token if self.llm.backend != Backend.OFFLINE else None
            )

            self.memory.add("assistant", response)
            console.print(f"[magenta]◉ Jarvis:[/magenta] {response}\n")
            self.voice.speak(response)

            # auto-resumo quando histórico ficar grande
            if self.memory.message_count >= 30:
                self._summarize()

        except Exception as e:
            self.voice.speak("Tive um problema ao processar.")
            console.print_exception()
        finally:
            self.busy = False

    def _summarize(self):
        """Pede ao LLM um resumo do histórico para compactar o contexto."""
        try:
            msgs = self.memory.get_context()
            summary_prompt = "Faça um resumo muito conciso (3-5 linhas) desta conversa, focando nos pontos mais importantes e decisões tomadas."
            system = self.llm.build_system(user=self.memory.user)
            summary = self.llm.chat(
                messages=msgs + [{"role": "user", "content": summary_prompt}],
                system=system
            )
            self.memory.set_summary(summary)
            self.memory.clear_session()
            # reinjetar resumo como contexto
            self.memory.add("assistant", f"[Resumo da conversa anterior: {summary}]")
            console.print("[yellow]Memória compactada.[/yellow]")
        except Exception:
            pass

    def _cmd_lembrar(self, text: str):
        self.voice.speak("O que devo lembrar? Diga: lembrar chave valor")
        resp = self.voice._listen()
        if resp:
            parts = resp.split(maxsplit=1)
            if len(parts) == 2:
                self.memory.remember(parts[0], parts[1])
                self.voice.speak(f"Anotado: {parts[0]} é {parts[1]}")
            else:
                self.voice.speak("Formato: lembrar [chave] [valor]")

    def _cmd_limpar(self, _):
        self.memory.clear_session()
        self.voice.speak("Histórico da sessão limpo.")

    def _cmd_desligar(self, _):
        self.voice.speak("Encerrando. Até logo.")
        self.voice.stop()

    def _print_header(self):
        console.print(Panel(
            Text.assemble(
                ("J.A.R.V.I.S.  ", "bold cyan"),
                ("Nível 2\n", "cyan"),
                ("LLM: ", "dim"), (self.llm.backend.value, "yellow"),
                ("  ·  Modelo: ", "dim"), (self.llm.model, "yellow"), ("\n", ""),
                ("Wake word: ", "dim"), ('"jarvis"', "green"), ("\n", ""),
                ("Memória: ", "dim"), (str(self.memory.message_count), "green"),
                (" msgs · ", "dim"),
                (str(len(self.memory._facts)), "green"), (" fatos", "dim")
            ),
            title="⬡ BALUARTE",
            border_style="cyan"
        ))

    def start(self):
        self._print_header()

        if not self.face.known_names:
            nome = console.input("[yellow]Nenhum rosto registrado. Seu nome: [/yellow]")
            self.face.register_face(nome)
            self.memory = Memory(user=nome)

        threading.Thread(target=self.face.start, daemon=True).start()
        self.voice.start_background()
        self.motion.start()


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="Jarvis Nível 2")
    p.add_argument("--backend", choices=["claude", "ollama", "offline"],
                   default=None, help="Backend LLM (padrão: claude)")
    args = p.parse_args()

    jarvis = Jarvis2(backend=args.backend)
    jarvis.start()
