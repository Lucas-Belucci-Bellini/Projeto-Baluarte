#!/usr/bin/env python3
"""Teste de estresse do monitor: 1.000.000 de commits em 100 repositórios.

O benchmark usa somente diretórios temporários. Ele não escreve no JARVIS_DB,
não chama a API do GitHub e não altera o checkout do Projeto-Baluarte.
"""
from __future__ import annotations

import gc
import os
import resource
import statistics
import subprocess
import sys
import tempfile
import time
from datetime import datetime, timezone
from pathlib import Path

PROJECT = Path(__file__).resolve().parents[1]
BACKEND = PROJECT / "backend"
REPOSITORIES = int(os.environ.get("STRESS_REPOSITORIES", "100"))
COMMITS_PER_REPOSITORY = int(os.environ.get("STRESS_COMMITS_PER_REPOSITORY", "10000"))
EXPECTED_TOTAL = REPOSITORIES * COMMITS_PER_REPOSITORY
ACTIVITY_DAYS = 14


def rss_mib() -> float:
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024


def run_fast_import(path: Path, count: int, repo_index: int) -> None:
    path.mkdir(parents=True, exist_ok=True)
    subprocess.run(["git", "init", "--quiet", str(path)], check=True)
    now = int(datetime.now(timezone.utc).timestamp())
    process = subprocess.Popen(
        ["git", "-C", str(path), "fast-import", "--quiet"],
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )
    assert process.stdin is not None
    # Uma blob é reutilizada por todos os commits do repositório: o teste mede
    # a escala do histórico, não um volume artificial de arquivos distintos.
    blob = b"x\n"
    process.stdin.write(b"blob\nmark :1\ndata 2\nx\n")
    previous_mark: int | None = None
    try:
        for index in range(1, count + 1):
            committed_at = now - ((count - index) * 7 * 86400 // count)
            message = f"stress repo={repo_index} commit={index}/{count}\n".encode()
            mark = index + 1
            lines = [
                b"commit refs/heads/main\n",
                f"mark :{mark}\n".encode(),
                f"author Stress Test <stress-{repo_index}@example.invalid> {committed_at} +0000\n".encode(),
                f"committer Stress Test <stress-{repo_index}@example.invalid> {committed_at} +0000\n".encode(),
                f"data {len(message)}\n".encode(),
                message,
            ]
            if previous_mark is not None:
                lines.append(f"from :{previous_mark}\n".encode())
            lines.extend([b"M 100644 :1 state.txt\n"])
            process.stdin.write(b"".join(lines))
            previous_mark = mark
        process.stdin.close()
    except Exception:
        process.kill()
        process.wait()
        raise
    stderr = process.stderr.read() if process.stderr is not None else b""
    return_code = process.wait()
    if return_code != 0:
        raise RuntimeError(f"git fast-import falhou ({return_code}): {stderr.decode(errors='replace')}")
    subprocess.run(["git", "-C", str(path), "symbolic-ref", "HEAD", "refs/heads/main"], check=True)


def aggregate(server, paths: list[Path]) -> tuple[int, int, int, list[str]]:
    total = 0
    truncated_repositories = 0
    failed_repositories = 0
    errors: list[str] = []
    for path in paths:
        try:
            from git import Repo

            repo = Repo(path)
            try:
                activity, truncated = server._commit_activity(repo, days=ACTIVITY_DAYS)
            finally:
                repo.close()
            total += sum(item["count"] for item in activity)
            truncated_repositories += int(truncated)
        except Exception as error:  # noqa: BLE001 — falha parcial é parte do teste
            failed_repositories += 1
            errors.append(f"{path.name}: {type(error).__name__}: {error}")
    return total, truncated_repositories, failed_repositories, errors


def measure(server, label: str, paths: list[Path], expected: int) -> dict[str, object]:
    gc.collect()
    rss_before = rss_mib()
    wall_start = time.perf_counter()
    cpu_start = time.process_time()
    total, truncated, failed, errors = aggregate(server, paths)
    wall_ms = (time.perf_counter() - wall_start) * 1000
    cpu_ms = (time.process_time() - cpu_start) * 1000
    cpu_pct = (cpu_ms / (wall_ms or 1)) * 100
    result = {
        "level": label,
        "repositories": len(paths),
        "expected_commits": expected,
        "aggregated_commits": total,
        "truncated_repositories": truncated,
        "failed_repositories": failed,
        "wall_ms": round(wall_ms, 2),
        "cpu_ms": round(cpu_ms, 2),
        "cpu_wall_ratio_pct": round(cpu_pct, 2),
        "rss_delta_mib": round(max(0.0, rss_mib() - rss_before), 2),
        "peak_rss_mib": round(rss_mib(), 2),
        "errors": errors[:3],
    }
    if total != expected or truncated != 0:
        raise AssertionError(f"{label}: agregação incorreta: {result}")
    return result


def main() -> None:
    if REPOSITORIES != 100 or COMMITS_PER_REPOSITORY != 10000:
        raise SystemExit("O cenário de aceitação deve ser STRESS_REPOSITORIES=100 e STRESS_COMMITS_PER_REPOSITORY=10000")

    sys.path.insert(0, str(BACKEND))
    import server  # noqa: PLC0415 — usa a agregação real do backend

    generation_start = time.perf_counter()
    with tempfile.TemporaryDirectory(prefix="baluarte-million-commits-") as temp_dir:
        root = Path(temp_dir)
        paths: list[Path] = []
        for repo_index in range(REPOSITORIES):
            path = root / f"repo-{repo_index:03d}"
            run_fast_import(path, COMMITS_PER_REPOSITORY, repo_index)
            paths.append(path)
        generation_ms = (time.perf_counter() - generation_start) * 1000

        levels = []
        for repo_count in (10, 50, 100):
            levels.append(measure(
                server,
                f"{repo_count}_repos",
                paths[:repo_count],
                repo_count * COMMITS_PER_REPOSITORY,
            ))

        broken = root / "repo-broken"
        broken.mkdir()
        resilient = measure(
            server,
            "100_repos_plus_one_broken",
            paths + [broken],
            EXPECTED_TOTAL,
        )
        if resilient["failed_repositories"] != 1:
            raise AssertionError(f"falha parcial não isolada: {resilient}")

        print(f"repositories={REPOSITORIES}")
        print(f"commits_per_repository={COMMITS_PER_REPOSITORY}")
        print(f"expected_total_commits={EXPECTED_TOTAL}")
        print(f"generation_ms={generation_ms:.2f}")
        for level in levels:
            print(f"level={level}")
        print(f"resilience_level={resilient}")
        print("stress_resilience=PASS")


if __name__ == "__main__":
    main()
