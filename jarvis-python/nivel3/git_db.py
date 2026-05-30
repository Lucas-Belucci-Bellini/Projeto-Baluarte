"""
Jarvis - Nível 3: Git como Banco de Dados
Cada interação, memória e evento do Jarvis vira um commit.
O repositório Git é o histórico versionado de toda a vida do Jarvis.
"""

import json
import os
from datetime import datetime
from pathlib import Path
from git import Repo, InvalidGitRepositoryError
from dotenv import load_dotenv

load_dotenv()

DB_REPO_PATH = Path(os.getenv("JARVIS_DB_PATH", Path.home() / ".jarvis-db"))
REMOTE_URL   = os.getenv("JARVIS_DB_REMOTE", "")  # ex: git@github.com:user/jarvis-db.git


class GitDB:
    """
    Repositório Git que age como banco de dados append-only.

    Estrutura do repo:
    .jarvis-db/
    ├── sessions/
    │   └── YYYY-MM-DD/
    │       └── HH-MM-SS_usuario.json   ← transcrição de sessão
    ├── memory/
    │   └── usuario.json                ← fatos persistentes
    ├── events/
    │   └── YYYY-MM-DD.jsonl            ← log de eventos do dia
    └── index.json                      ← índice geral
    """

    def __init__(self):
        self.repo_path = DB_REPO_PATH
        self.repo = self._init_repo()

    def _init_repo(self) -> Repo:
        if self.repo_path.exists():
            try:
                repo = Repo(self.repo_path)
                print(f"[GIT-DB] Repo existente: {self.repo_path}")
                return repo
            except InvalidGitRepositoryError:
                pass

        self.repo_path.mkdir(parents=True, exist_ok=True)
        repo = Repo.init(self.repo_path)

        # configura identidade local
        repo.config_writer().set_value("user", "name", "J.A.R.V.I.S.").release()
        repo.config_writer().set_value("user", "email", "jarvis@baluarte.local").release()

        # commit inicial
        readme = self.repo_path / "README.md"
        readme.write_text("# Jarvis DB\nBanco de dados versionado do J.A.R.V.I.S.\n")
        (self.repo_path / "sessions").mkdir(exist_ok=True)
        (self.repo_path / "memory").mkdir(exist_ok=True)
        (self.repo_path / "events").mkdir(exist_ok=True)

        index_path = self.repo_path / "index.json"
        index_path.write_text(json.dumps({
            "created": datetime.now().isoformat(),
            "sessions": 0,
            "events": 0
        }, indent=2))

        repo.index.add(["README.md", "index.json"])
        repo.index.commit("init: Jarvis DB inicializado")

        if REMOTE_URL:
            repo.create_remote("origin", REMOTE_URL)
            print(f"[GIT-DB] Remote configurado: {REMOTE_URL}")

        print(f"[GIT-DB] Novo repo criado: {self.repo_path}")
        return repo

    # ──────────────── Commit de sessão ────────────────

    def commit_session(self, user: str, messages: list[dict], summary: str = ""):
        """Salva transcrição completa de uma sessão como commit."""
        now = datetime.now()
        day_dir = self.repo_path / "sessions" / now.strftime("%Y-%m-%d")
        day_dir.mkdir(parents=True, exist_ok=True)

        fname = f"{now.strftime('%H-%M-%S')}_{user}.json"
        fpath = day_dir / fname

        data = {
            "user": user,
            "started": now.isoformat(),
            "summary": summary,
            "message_count": len(messages),
            "messages": messages
        }
        fpath.write_text(json.dumps(data, ensure_ascii=False, indent=2))

        rel = str(fpath.relative_to(self.repo_path))
        self.repo.index.add([rel])
        msg = f"session({user}): {len(messages)} msgs — {now.strftime('%d/%m %H:%M')}"
        if summary:
            msg += f"\n\n{summary}"

        commit = self.repo.index.commit(msg)
        print(f"[GIT-DB] Sessão commitada: {commit.hexsha[:8]}")
        return commit.hexsha

    # ──────────────── Commit de memória ────────────────

    def commit_memory(self, user: str, facts: dict):
        """Salva fatos persistentes do usuário."""
        mem_dir = self.repo_path / "memory"
        mem_dir.mkdir(exist_ok=True)

        fpath = mem_dir / f"{user}.json"
        fpath.write_text(json.dumps(facts, ensure_ascii=False, indent=2))

        rel = str(fpath.relative_to(self.repo_path))
        self.repo.index.add([rel])
        commit = self.repo.index.commit(f"memory({user}): {len(facts)} fatos atualizados")
        print(f"[GIT-DB] Memória commitada: {commit.hexsha[:8]}")
        return commit.hexsha

    # ──────────────── Log de eventos ────────────────

    def log_event(self, event_type: str, data: dict):
        """Appenda um evento ao log do dia (sem commit — batch diário)."""
        events_dir = self.repo_path / "events"
        events_dir.mkdir(exist_ok=True)

        today = datetime.now().strftime("%Y-%m-%d")
        fpath = events_dir / f"{today}.jsonl"

        entry = json.dumps({
            "ts": datetime.now().isoformat(),
            "type": event_type,
            **data
        }, ensure_ascii=False)

        with open(fpath, "a", encoding="utf-8") as f:
            f.write(entry + "\n")

    def commit_daily_events(self):
        """Commita o log de eventos do dia. Chamar 1x por dia."""
        today = datetime.now().strftime("%Y-%m-%d")
        fpath = self.repo_path / "events" / f"{today}.jsonl"
        if not fpath.exists():
            return

        rel = str(fpath.relative_to(self.repo_path))
        self.repo.index.add([rel])
        commit = self.repo.index.commit(f"events({today}): log diário")
        print(f"[GIT-DB] Eventos do dia commitados: {commit.hexsha[:8]}")
        return commit.hexsha

    # ──────────────── Histórico ────────────────

    def history(self, limit: int = 20) -> list[dict]:
        """Retorna os últimos commits do DB."""
        return [
            {
                "hash": c.hexsha[:8],
                "msg": c.message.strip(),
                "date": datetime.fromtimestamp(c.committed_date).strftime("%d/%m %H:%M"),
                "author": c.author.name
            }
            for c in list(self.repo.iter_commits())[:limit]
        ]

    # ──────────────── Sync com remote ────────────────

    def push(self):
        """Envia commits para o remote (se configurado)."""
        if not REMOTE_URL:
            return
        try:
            origin = self.repo.remote("origin")
            origin.push()
            print("[GIT-DB] Push para remote concluído.")
        except Exception as e:
            print(f"[GIT-DB] Erro no push: {e}")

    def pull(self):
        """Sincroniza do remote."""
        if not REMOTE_URL:
            return
        try:
            origin = self.repo.remote("origin")
            origin.pull()
            print("[GIT-DB] Pull do remote concluído.")
        except Exception as e:
            print(f"[GIT-DB] Erro no pull: {e}")
