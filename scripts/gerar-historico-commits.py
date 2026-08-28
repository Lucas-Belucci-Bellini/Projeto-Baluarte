#!/usr/bin/env python3
"""Generate an exhaustive, block-indexed commit history for the Baluarte repository."""
from __future__ import annotations

import datetime as dt
import pathlib
import subprocess

REPO = pathlib.Path(__file__).resolve().parents[1]
OUT = REPO / "historico" / "commits-main"
BLOCK_SIZE = 200
REPO_URL = "https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte"


def git(*args: str, raw: bool = False) -> str:
    result = subprocess.run(
        ["git", "-C", str(REPO), *args],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    )
    return result.stdout.decode("utf-8", errors="replace") if raw else result.stdout.decode("utf-8")


def one_line(value: str) -> str:
    return " ".join(value.strip().split())


def md_text(value: str) -> str:
    return value.replace("\\", "\\\\").replace("`", "\\`")


def parse_name_status(sha: str) -> list[tuple[str, str, str | None]]:
    raw = subprocess.run(
        ["git", "-C", str(REPO), "diff-tree", "--root", "-r", "--no-commit-id", "--name-status", "-M", "-C", "-z", sha],
        check=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
    ).stdout.decode("utf-8", errors="replace")
    tokens = raw.split("\x00")
    entries: list[tuple[str, str, str | None]] = []
    i = 0
    while i < len(tokens):
        status = tokens[i]
        i += 1
        if not status:
            continue
        code = status[0]
        if code in {"R", "C"}:
            if i + 1 >= len(tokens):
                break
            old_path, new_path = tokens[i], tokens[i + 1]
            i += 2
            entries.append((status, old_path, new_path))
        else:
            if i >= len(tokens):
                break
            path = tokens[i]
            i += 1
            entries.append((status, path, None))
    return entries


def render_entry(number: int, sha: str) -> str:
    fmt = "%H%x00%aI%x00%an%x00%ae%x00%P%x00%s%x00%B"
    fields = git("show", "-s", f"--format={fmt}", sha, raw=True).split("\x00", 6)
    full_sha, authored, author, email, parents, subject, body = fields
    body = "\n".join(line.rstrip() for line in body.splitlines()).rstrip()
    entries = parse_name_status(sha)
    lines = [
        f"## Commit {number} — `{full_sha}`",
        f"**Link:** [{full_sha[:12]}]({REPO_URL}/commit/{full_sha})",
        f"**Data do autor:** `{authored}`",
        f"**Autor:** {md_text(author)} `<{email}>`",
        f"**Pais:** `{parents or '(root)'}`",
        f"**Resumo:** {md_text(subject)}",
    ]
    if body.strip() and body.strip() != subject.strip():
        lines.extend(["**Corpo da mensagem:**", "", body.rstrip()])
    lines.extend([f"**Arquivos afetados:** {len(entries)}"])
    grouped: dict[str, list[tuple[str, str | None]]] = {}
    for status, old_path, new_path in entries:
        grouped.setdefault(status[0], []).append((old_path, new_path))
    labels = {
        "A": "Arquivos criados",
        "M": "Arquivos modificados",
        "D": "Arquivos removidos",
        "R": "Arquivos renomeados",
        "C": "Arquivos copiados",
        "T": "Arquivos com tipo alterado",
        "U": "Arquivos não mesclados",
    }
    for code in ("A", "M", "D", "R", "C", "T", "U"):
        values = grouped.get(code, [])
        if not values:
            continue
        lines.extend([f"### {labels[code]}", ""])
        for old_path, new_path in values:
            if new_path is None:
                lines.append(f"- `{md_text(old_path)}`")
            else:
                lines.append(f"- `{md_text(old_path)}` → `{md_text(new_path)}`")
    return "\n".join(lines) + "\n"


def render_block(start: int, commits: list[tuple[int, str]], snapshot: str) -> str:
    end = commits[-1][0]
    lines = [
        f"# Histórico de commits — `main` {start}–{end}",
        f"**Snapshot:** `{snapshot}`",
        "**Escopo:** commits alcançáveis a partir de `main`, numerados do mais antigo para o mais recente",
        "> A numeração é local ao escopo da `main`; não é um número nativo do GitHub. Os dados abaixo são extraídos do grafo Git, sem interpretação manual dos nomes de arquivos.",
        "",
    ]
    for number, sha in commits:
        lines.append(render_entry(number, sha))
        lines.append("---\n")
    return "\n".join(lines).rstrip() + "\n"


def main() -> None:
    snapshot = git("rev-parse", "HEAD").strip()
    commit_shas = [line.strip() for line in git("rev-list", "--reverse", "HEAD").splitlines() if line.strip()]
    commits = list(enumerate(commit_shas, start=1))
    OUT.mkdir(parents=True, exist_ok=False)
    block_files: list[tuple[int, int, str]] = []
    for offset in range(0, len(commits), BLOCK_SIZE):
        block = commits[offset : offset + BLOCK_SIZE]
        start, end = block[0][0], block[-1][0]
        filename = f"commits-main-{start:04d}-{end:04d}.md"
        (OUT / filename).write_text(render_block(start, block, snapshot), encoding="utf-8")
        block_files.append((start, end, filename))
    index_lines = [
        "# Índice do histórico de commits da `main`",
        "",
        f"**Snapshot gerado:** `{snapshot}`",
        f"**Total:** `{len(commits)}` commits alcançáveis a partir de `main`",
        f"**Gerado em:** `{dt.datetime.now(dt.timezone.utc).isoformat(timespec='seconds')}`",
        "",
        "> Este diretório é um ledger técnico exaustivo. O documento narrativo de marcos continua em [`../CHANGELOG.md`](../CHANGELOG.md); esta série registra cada commit e os arquivos afetados, inclusive mudanças que não são releases.",
        "",
        "## Blocos",
        "",
        "| Intervalo | Arquivo |",
        "|---:|---|",
    ]
    for start, end, filename in block_files:
        index_lines.append(f"| {start}–{end} | [`{filename}`]({filename}) |")
    index_lines.extend([
        "",
        "## Reproduzir",
        "",
        "A geração deve ser feita em uma branch documental, depois de `git fetch origin --prune`, com o snapshot de `origin/main` confirmado. O procedimento não consulta rede, não modifica código e não deve ser executado por schedule automático.",
        "",
        "```bash",
        "git fetch origin --prune",
        "git rev-parse origin/main",
        "python3 scripts/gerar-historico-commits.py",
        "```",
        "",
        "Se novos commits fizerem o último bloco ultrapassar 200 entradas, o gerador preserva a numeração e abre o bloco seguinte. A atualização deve entrar por uma PR documental independente, com diff e `git diff --check` revisados.",
        "",
    ])
    (OUT / "README.md").write_text("\n".join(index_lines), encoding="utf-8")
    print(f"snapshot={snapshot}")
    print(f"commits={len(commits)}")
    print(f"blocks={len(block_files)}")
    for start, end, filename in block_files:
        print(f"block={start}-{end} file={filename}")


if __name__ == "__main__":
    main()
