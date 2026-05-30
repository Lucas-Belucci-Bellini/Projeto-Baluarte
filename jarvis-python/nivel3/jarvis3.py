"""
Jarvis - Nível 3: Sistema Completo N1+N2+N3
Pipeline: Câmera → Rosto → Voz → LLM → Memória → Git → n8n
"""

import sys
import threading
import schedule
import time
from pathlib import Path
from datetime import datetime
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.text import Text

sys.path.insert(0, str(Path(__file__).parent.parent / "nivel1"))
sys.path.insert(0, str(Path(__file__).parent.parent / "nivel2"))

from camera_motion import MotionDetector
from face_recognition_module import FaceRecognizer
from voice_command import VoiceCommand
from memory import Memory
from llm_client import LLMClient, Backend
from git_db import GitDB
from n8n_bridge import N8nBridge

console = Console()


class Jarvis3:
    def __init__(self, backend: str = None):
        self.motion = MotionDetector(sensitivity=500)
        self.face   = FaceRecognizer()
        self.voice  = VoiceCommand(wake_word="jarvis")
        self.llm    = LLMClient(backend=backend)
        self.memory = Memory(user="default")
        self.git_db = GitDB()
        self.n8n    = N8nBridge()

        self.active     = False
        self.busy       = False
        self.session_start = datetime.now()

        self._setup()
        self._schedule_tasks()

    def _setup(self):
        self.motion.on_motion(self._on_motion)
        self.face.on_recognition(self._on_face)

        self.voice.register_command("lembrar",        self._cmd_lembrar,  "salva fato na memória")
        self.voice.register_command("histórico git",  self._cmd_git_log,  "mostra últimos commits")
        self.voice.register_command("status",         self._cmd_status,   "status do sistema")
        self.voice.register_command("limpar memória", self._cmd_limpar,   "limpa sessão")
        self.voice.register_command("desligar",       self._cmd_desligar, "desliga o Jarvis")

        self.voice.fallback = self._llm_respond

    def _schedule_tasks(self):
        """Tarefas automáticas agendadas."""
        # commita log de eventos todo dia às 23:55
        schedule.every().day.at("23:55").do(self._daily_commit)
        # sync com n8n a cada 30 min
        schedule.every(30).minutes.do(self._sync_n8n)

        def _run():
            while True:
                schedule.run_pending()
                time.sleep(30)

        threading.Thread(target=_run, daemon=True).start()

    # ──────────────── Eventos ────────────────

    def _on_motion(self):
        if not self.active:
            self.active = True
            self.git_db.log_event("motion_detected", {"ts": datetime.now().isoformat()})
            self.n8n.notify_event("motion", {"user": self.memory.user})
            self.voice.speak("Presença detectada.")

    def _on_face(self, name: str):
        if name != "Desconhecido":
            if self.memory.user != name:
                self._commit_current_session()
                self.memory = Memory(user=name)
                self.session_start = datetime.now()

            self.git_db.log_event("face_recognized", {"user": name})
            self.n8n.notify_event("face_recognized", {"user": name})
            self.voice.speak(f"Bem-vindo, {name}.")
        else:
            self.git_db.log_event("unknown_face", {})
            self.n8n.notify_alert("Rosto desconhecido", "Pessoa não identificada detectada.", "warning")
            self.voice.speak("Rosto não reconhecido.")

    # ──────────────── LLM ────────────────

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

            console.print(f"\n[cyan]▸ {self.memory.user}:[/cyan] {text}")

            response = self.llm.chat(
                messages=self.memory.get_context(),
                system=system
            )

            self.memory.add("assistant", response)
            self.git_db.log_event("interaction", {
                "user": self.memory.user,
                "input": text[:120],
                "output": response[:120]
            })

            console.print(f"[magenta]◉ Jarvis:[/magenta] {response}\n")
            self.voice.speak(response)

            if self.memory.message_count >= 30:
                self._auto_summarize()

        except Exception:
            self.voice.speak("Tive um problema.")
            console.print_exception()
        finally:
            self.busy = False

    def _auto_summarize(self):
        try:
            system = self.llm.build_system(user=self.memory.user)
            summary = self.llm.chat(
                messages=self.memory.get_context() + [{
                    "role": "user",
                    "content": "Faça um resumo conciso desta conversa em 3 linhas."
                }],
                system=system
            )
            self.memory.set_summary(summary)

            git_hash = self.git_db.commit_session(
                user=self.memory.user,
                messages=self.memory.get_context(),
                summary=summary
            )
            self.n8n.notify_session_end(
                user=self.memory.user,
                message_count=self.memory.message_count,
                summary=summary,
                git_hash=git_hash
            )
            self.memory.clear_session()
            self.memory.add("assistant", f"[Resumo anterior: {summary}]")
            console.print("[yellow]Contexto compactado e commitado no Git.[/yellow]")
        except Exception:
            pass

    # ──────────────── Commits automáticos ────────────────

    def _commit_current_session(self):
        if self.memory.message_count < 2:
            return
        try:
            summary = f"Sessão de {self.memory.user} — {self.memory.message_count} mensagens"
            git_hash = self.git_db.commit_session(
                user=self.memory.user,
                messages=self.memory.get_context(),
                summary=summary
            )
            self.git_db.commit_memory(self.memory.user, self.memory._facts)
            self.git_db.push()
            self.n8n.notify_session_end(
                user=self.memory.user,
                message_count=self.memory.message_count,
                summary=summary,
                git_hash=git_hash
            )
        except Exception as e:
            console.print(f"[red]Erro ao commitar sessão: {e}[/red]")

    def _daily_commit(self):
        self.git_db.commit_daily_events()
        self.git_db.push()

    def _sync_n8n(self):
        if self.memory._facts:
            self.n8n.sync_memory_to_drive(self.memory.user, self.memory._facts)

    # ──────────────── Comandos de voz ────────────────

    def _cmd_lembrar(self, text: str):
        self.voice.speak("O que devo lembrar?")
        resp = self.voice._listen()
        if resp:
            parts = resp.split(maxsplit=1)
            if len(parts) == 2:
                self.memory.remember(parts[0], parts[1])
                self.git_db.commit_memory(self.memory.user, self.memory._facts)
                self.n8n.notify_memory_update(self.memory.user, parts[0], parts[1])
                self.voice.speak(f"Anotado e salvo no Git: {parts[0]}.")

    def _cmd_git_log(self, _):
        history = self.git_db.history(limit=5)
        console.print("\n[cyan]Últimos commits do Jarvis DB:[/cyan]")
        t = Table(show_header=True, header_style="bold cyan")
        t.add_column("Hash", style="dim")
        t.add_column("Mensagem")
        t.add_column("Data", style="dim")
        for h in history:
            t.add_row(h["hash"], h["msg"][:60], h["date"])
        console.print(t)
        self.voice.speak(f"{len(history)} commits recentes no banco de dados.")

    def _cmd_status(self, _):
        uptime = datetime.now() - self.session_start
        msg = (f"Sistema ativo há {int(uptime.total_seconds() // 60)} minutos. "
               f"{self.memory.message_count} mensagens na sessão. "
               f"{len(self.memory._facts)} fatos na memória.")
        console.print(f"\n[green]{msg}[/green]")
        self.voice.speak(msg)

    def _cmd_limpar(self, _):
        self._commit_current_session()
        self.memory.clear_session()
        self.voice.speak("Sessão commitada e limpa.")

    def _cmd_desligar(self, _):
        self._commit_current_session()
        self._daily_commit()
        self.voice.speak("Commitando dados e encerrando. Até logo.")
        self.voice.stop()

    # ──────────────── Inicialização ────────────────

    def _print_header(self):
        table = Table.grid(padding=1)
        table.add_row("[cyan]LLM[/cyan]",    f"[yellow]{self.llm.backend.value}[/yellow] · {self.llm.model}")
        table.add_row("[cyan]Git DB[/cyan]",  f"[yellow]{self.git_db.repo_path}[/yellow]")
        table.add_row("[cyan]n8n[/cyan]",     f"[yellow]{'ativo' if self.n8n.enabled else 'desativado'}[/yellow]")
        table.add_row("[cyan]Memória[/cyan]", f"[yellow]{self.memory.message_count}[/yellow] msgs · "
                                              f"[yellow]{len(self.memory._facts)}[/yellow] fatos")

        console.print(Panel(
            table,
            title="[bold cyan]⬡ J.A.R.V.I.S. — Nível 3[/bold cyan]",
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
    p = argparse.ArgumentParser(description="Jarvis Nível 3")
    p.add_argument("--backend", choices=["claude", "ollama", "offline"], default=None)
    args = p.parse_args()

    jarvis = Jarvis3(backend=args.backend)
    jarvis.start()
