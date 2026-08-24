#!/usr/bin/env python3
"""Benchmark de resiliência do monitor de commits.

O teste cria um repositório Git temporário com 5.000 commits distribuídos nos
últimos sete dias e executa o mesmo caminho de agregação usado pelo endpoint do
Jarvis DB. Nada é escrito no repositório do projeto nem no JARVIS_DB real.
"""
from __future__ import annotations

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
COUNT = int(os.environ.get("COMMIT_LOAD_COUNT", "5000"))


def rss_mib() -> float:
    """Retorna o pico de RSS do processo em MiB no Linux."""
    return resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / 1024


def fast_import_repo(path: Path, count: int) -> None:
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
    previous_mark: int | None = None
    try:
        for index in range(1, count + 1):
            # Mantém todos os commits dentro de uma semana, com uma cadência
            # determinística que exercita todos os buckets de 14 dias.
            committed_at = now - ((count - index) * 7 * 86400 // count)
            message = f"load-test commit {index}/{count}\n"
            content = f"commit={index}\n".encode()
            lines = [
                b"commit refs/heads/main\n",
                f"mark :{index}\n".encode(),
                f"author Load Test <load-test@example.invalid> {committed_at} +0000\n".encode(),
                f"committer Load Test <load-test@example.invalid> {committed_at} +0000\n".encode(),
                f"data {len(message.encode())}\n".encode(),
                message.encode(),
            ]
            if previous_mark is not None:
                lines.append(f"from :{previous_mark}\n".encode())
            lines.extend([
                b"M 100644 inline load.txt\n",
                f"data {len(content)}\n".encode(),
                content,
            ])
            process.stdin.write(b"".join(lines))
            previous_mark = index
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


def main() -> None:
    if COUNT < 5_000:
        raise SystemExit("COMMIT_LOAD_COUNT deve ser pelo menos 5000")

    sys.path.insert(0, str(BACKEND))
    import server  # noqa: PLC0415 — importa o módulo real do backend para o benchmark
    from git import Repo  # noqa: PLC0415

    with tempfile.TemporaryDirectory(prefix="baluarte-commit-load-") as temp_dir:
        repo_path = Path(temp_dir) / "git-db"
        generation_start = time.perf_counter()
        fast_import_repo(repo_path, COUNT)
        generation_ms = (time.perf_counter() - generation_start) * 1000
        repo = Repo(repo_path)
        head = repo.commit("refs/heads/main").hexsha

        server._activity_cache = None
        rss_before = rss_mib()
        wall_start = time.perf_counter()
        cpu_start = time.process_time()
        activity, truncated = server._cached_commit_activity(repo, head)
        first_wall_ms = (time.perf_counter() - wall_start) * 1000
        first_cpu_ms = (time.process_time() - cpu_start) * 1000
        first_rss_delta = max(0.0, rss_mib() - rss_before)

        cached_samples: list[float] = []
        for _ in range(10):
            sample_start = time.perf_counter()
            cached_activity, cached_truncated = server._cached_commit_activity(repo, head)
            cached_samples.append((time.perf_counter() - sample_start) * 1000)
            if cached_activity != activity or cached_truncated != truncated:
                raise AssertionError("cache retornou uma série diferente da primeira consulta")

        total = sum(item["count"] for item in activity)
        expected_days = 14
        if len(activity) != expected_days:
            raise AssertionError(f"esperava {expected_days} buckets, recebi {len(activity)}")
        if total != COUNT:
            raise AssertionError(f"esperava {COUNT} commits agregados, recebi {total}")
        if truncated:
            raise AssertionError("5.000 commits foram truncados antes de completar a carga mínima")
        if len(cached_activity) > expected_days:
            raise AssertionError("cache retornou mais pontos visuais que a janela do gráfico")

        cached_p95 = statistics.quantiles(cached_samples, n=20)[18] if len(cached_samples) >= 2 else cached_samples[0]
        wall_seconds = first_wall_ms / 1000
        cpu_utilization = (first_cpu_ms / 1000 / wall_seconds * 100) if wall_seconds else 0.0
        print(f"commits={COUNT}")
        print(f"generation_ms={generation_ms:.2f}")
        print(f"first_aggregation_ms={first_wall_ms:.2f}")
        print(f"first_aggregation_cpu_ms={first_cpu_ms:.2f}")
        print(f"first_aggregation_cpu_utilization_pct={cpu_utilization:.2f}")
        print(f"first_aggregation_rss_delta_mib={first_rss_delta:.2f}")
        print(f"process_peak_rss_mib={rss_mib():.2f}")
        print(f"cached_p50_ms={statistics.median(cached_samples):.4f}")
        print(f"cached_p95_ms={cached_p95:.4f}")
        print(f"activity_days={len(activity)}")
        print(f"activity_total={total}")
        print(f"activity_capacity={server.ACTIVITY_MAX_COMMITS}")
        print(f"activity_truncated={truncated}")
        print("resilience=PASS")


if __name__ == "__main__":
    main()
