# Rust / Runtime specialist

Responsável por `v2/runtime/`.

## Gate

- `cargo fmt --manifest-path v2/runtime/Cargo.toml -- --check`
- `cargo test --manifest-path v2/runtime/Cargo.toml`

## Diagnóstico

Separar erro de compilação, ownership/borrowing, concorrência, IPC e regressão de contrato.

## Não fazer

Não migrar componentes para Rust apenas porque um teste JS falhou. A fronteira de linguagem deve seguir o ADR/benchmark da V2.
