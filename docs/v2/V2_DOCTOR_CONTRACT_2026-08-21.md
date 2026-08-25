# V2 Doctor Contract — 2026-08-21

**Status:** EXPANDED CATALOG — local read-only diagnosis
**Repository:** `Lucas-Belucci-Bellini/Projeto-Baluarte`  
**Base SHA:** `e171b7f4dcf86810da5981442d1b65a2684b3fcc`
**Addendum:** Event Bus latency benchmark check added 2026-08-25
**Scope:** classify known gates; never repair, configure, deploy or mask

## 1. Purpose

O `verify:v2` doctor deve oferecer uma fotografia operacional honesta do checkout. Ele não substitui os gates oficiais, não executa migrations, não cria staging, não instala dependências, não mata processos, não altera arquivos e não chama serviços externos. Seu trabalho é classificar evidências já disponíveis.

> **`blocked-known` não é `green`, e `unknown` não é `blocked-known`. O doctor preserva a incerteza em vez de convertê-la em sucesso.**

## 2. States

| State | Meaning | Example | Exit contribution |
|---|---|---|---|
| `green` | Command or evidence completed successfully | TypeScript strict check exits 0 | Does not fail the report |
| `failed` | A command ran and found a real failure | Test or build exits non-zero | Fails the doctor |
| `blocked-known` | A gate is known to be blocked by a documented environment/toolchain limitation | Rust Cargo 1.75.0 with `edition2024` metadata; declared `google-genai` SDK absent for optional Python transport | Reported separately; does not become green |
| `unknown` | Evidence is missing, stale, unavailable or not safely classifiable | Remote CI not queried or result incomplete | Fails the doctor unless explicitly requested as inventory-only |
| `not-run` | The doctor intentionally did not execute the gate | Remote write or destructive operation | Must explain why |

The default process exit code is `0` only when there are no `failed` or `unknown` records. A `blocked-known` record keeps the report non-green and must be visible in the summary. The doctor may expose an `--inventory-only` mode for planning, but that mode must not be confused with validation.

## 3. Required record shape

Every check returns a bounded record containing `id`, `category`, `state`, `command` or evidence source, `exitCode` when applicable, `reasonCode`, `summary` and `observedAt`. Raw tokens, credentials, full environment variables, IP addresses, file contents with secrets and unbounded logs are excluded from the report.

## 4. Minimum catalog

The expanded catalog now contains 22 bounded records: 16 safe local commands, 5 gates intentionally marked `not-run` because they write artifacts or start a local harness, and one Rust runtime record classified from the observed Cargo toolchain. It covers event catalog, Nexus, TypeScript strict, V2 TypeScript, npm tests, the Event Bus latency benchmark, Python contracts, local security contracts, build, V2 integration, smoke, critical path, Python compilation and Rust runtime. The doctor may read local metadata for these checks, but it must not reimplement their assertions or claim that a skipped command passed. The Event Bus benchmark is a safe observability command: a green result means that the instrument executed and its bounded self-consistency checks passed; it does not mean that a production latency budget or hardware target was met.

Remote CI is represented as `unknown` unless a complete, current result is intentionally supplied. An optional dependency absence is `blocked-known` only when it matches the declared environment contract exactly; unrelated command failures remain `failed`. Build, harness integration, smoke, critical path and Python compilation are `not-run` in the doctor because the official runner already owns their execution and artifact cleanup. Supabase, staging, RLS and distributed provider readiness remain `not-run` or `blocked-known` according to the evidence; the doctor never provisions or writes to them.

## 5. Rollback and safety

The doctor has no rollback side effects because it performs no mutation. If a future implementation discovers a stale process, it reports the condition and points to the existing operator command; it does not kill the process automatically. If a check cannot be safely classified, it returns `unknown`.

— **Manus AI**
