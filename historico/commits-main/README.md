# Índice do histórico de commits da `main`

**Snapshot gerado:** `13360e596eb6bb9351c984d25cea67e7d1bef76b`
**Total:** `1989` commits alcançáveis a partir de `main`
**Gerado em:** `2026-08-28T01:54:05+00:00`

> Este diretório é um ledger técnico exaustivo. O documento narrativo de marcos continua em [`../CHANGELOG.md`](../CHANGELOG.md); esta série registra cada commit e os arquivos afetados, inclusive mudanças que não são releases.

## Blocos

| Intervalo | Arquivo |
|---:|---|
| 1–200 | [`commits-main-0001-0200.md`](commits-main-0001-0200.md) |
| 201–400 | [`commits-main-0201-0400.md`](commits-main-0201-0400.md) |
| 401–600 | [`commits-main-0401-0600.md`](commits-main-0401-0600.md) |
| 601–800 | [`commits-main-0601-0800.md`](commits-main-0601-0800.md) |
| 801–1000 | [`commits-main-0801-1000.md`](commits-main-0801-1000.md) |
| 1001–1200 | [`commits-main-1001-1200.md`](commits-main-1001-1200.md) |
| 1201–1400 | [`commits-main-1201-1400.md`](commits-main-1201-1400.md) |
| 1401–1600 | [`commits-main-1401-1600.md`](commits-main-1401-1600.md) |
| 1601–1800 | [`commits-main-1601-1800.md`](commits-main-1601-1800.md) |
| 1801–1989 | [`commits-main-1801-1989.md`](commits-main-1801-1989.md) |

## Reproduzir

A geração deve ser feita em uma branch documental, depois de `git fetch origin --prune`, com o snapshot de `origin/main` confirmado. O procedimento não consulta rede, não modifica código e não deve ser executado por schedule automático.

```bash
git fetch origin --prune
git rev-parse origin/main
python3 scripts/gerar-historico-commits.py
```

Se novos commits fizerem o último bloco ultrapassar 200 entradas, o gerador preserva a numeração e abre o bloco seguinte. A atualização deve entrar por uma PR documental independente, com diff e `git diff --check` revisados.
