# 📁 docs/

Documentação interna do **Projeto Baluarte**. **NÃO vai para o build de produção** — Vite só empacota `src/` + `public/`.

| Pasta | Propósito |
|---|---|
| [`architecture/`](./architecture/) | Arquitetura e decisões (ADRs). Cada documento responde "se eu mexer aqui, o que quebra?" |
| [`specs/`](./specs/) | Apontadores para o Obsidian Vault no Google Drive (fonte de verdade do projeto) |

Fase atual: [`HARDENING-1.0.0.md`](./HARDENING-1.0.0.md) — a fila executável da issue #420.

A fonte de verdade dos requisitos, lore e schemas é o **Google Drive** do Lucas — o Claude lê via MCP. Esta pasta `docs/specs/` contém apenas o índice (IDs do Drive) e o README explicando o fluxo.

Outras pastas podem aparecer aqui no futuro.
