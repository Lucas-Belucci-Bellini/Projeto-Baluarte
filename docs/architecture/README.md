# 🏛️ docs/architecture/

Documentos de arquitetura do Baluarte. Cada um responde **uma** pergunta:

> "Se eu for mexer nisso daqui, o que posso quebrar?"

Isso é o critério de aceitação de um documento desta pasta. Um texto que
descreve a estrutura mas não diz o que quebra ao mexer nela não paga o custo de
existir — o mapa já está no `CLAUDE.md`.

| Documento | Estado | Responde |
|---|---|---|
| [`overview.md`](./overview.md) | ✅ escrito | O que é o Baluarte hoje, quais são as camadas e o que atravessa quais fronteiras |
| [`v2-vision.md`](./v2-vision.md) | ✅ escrito (**bússola, não obra**) | Para onde a V2 vai — e o que **não** fazer até o congelamento da V1 fechar (base `v1.3.8`, [ADR-010](./decisions/ADR-010-ponto-de-congelamento-efetivo-da-v1.md)) |
| [`v2/`](./v2/) | ✅ revisado | Arquitetura-alvo da V2 (#539/#540): definido, proposto, pendente e conflitos |
| [`decisions/`](./decisions/) | ✅ 10 ADRs | Decisões fechadas, com o contexto que as gerou |
| `core.md` | ⬜ a escrever | Router, state, storage, events, permissions, flags: contratos e quem depende de quem |
| [`events.md`](./events.md) | ✅ **gerado** | Catálogo dos eventos do bus e quem escuta cada um — `npm run gen-catalogo-eventos`, cobrado pelo CI |
| [`storage.md`](./storage.md) | ✅ **gerado** | Chaves, esquemas, classes de dado e como migrar sem perder o do operador — `npm run gen-catalogo-storage`, cobrado pelo CI |
| `jarvis.md` | ⬜ a escrever | Orquestrador, memória, tools, providers, limites |
| `security.md` | ⬜ a escrever | Fronteiras: sandbox do terminal, permissões, sanitização, política de segredo |
| `nexus.md` | ⬜ *provavelmente não* | Já coberto por [`../NEXUS-CONTRATO.md`](../NEXUS-CONTRATO.md), [`../NEXUS-DECISOES.md`](../NEXUS-DECISOES.md) e [`../NEXUS-INVENTARIO.md`](../NEXUS-INVENTARIO.md) |

Os `⬜` estão listados de propósito: a issue [#420](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/420)
pediu a pasta inteira, e prometer oito documentos escrevendo oito parágrafos
rasos seria pior do que dizer o que ainda não existe. Cada um entra quando a
frente correspondente da [fila de hardening](../HARDENING-1.0.0.md) for
executada — aí há o que contar.

## Decisões (ADRs)

Formato curto e datado, mesmo espírito do [`../NEXUS-DECISOES.md`](../NEXUS-DECISOES.md):
uma decisão registrada é **fechada**. Reabrir exige um ADR novo revogando o
anterior, nunca edição silenciosa do existente.

- [ADR-001](./decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md) — A 1.0.0 é um ponto de congelamento, não a versão final (ponto efetivo: `v1.3.8`, [ADR-010](./decisions/ADR-010-ponto-de-congelamento-efetivo-da-v1.md))
- [ADR-002](./decisions/ADR-002-permissoes-deny-by-default.md) — Acesso é negado por omissão e permissão precisa ser declarada
- [ADR-003](./decisions/ADR-003-congelamento-e-manutencao-da-v1.md) — O que "congelar a V1" significa na prática (numeração, o que o `main` aceita, o app travado na 1.x)
- [ADR-004](./decisions/ADR-004-stack-poliglota-por-responsabilidade.md) — Stack poliglota por responsabilidade (parcialmente revista pelo ADR-005)
- [ADR-005](./decisions/ADR-005-v2-app-typescript-backend-poliglota.md) — V2 como aplicativo, frontend TypeScript e backend Python/Rust/C++
- [ADR-006](./decisions/ADR-006-disponibilizacao-somente-app.md) — Disponibilização somente como aplicativo durante a reconstrução
- [ADR-007](./decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md) — Dois núcleos: Core de Orquestração em TypeScript e Runtime/Host em Rust, com tabela de donos
- [ADR-008](./decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md) — Execução híbrida por fronteira de processo (módulos in-process, Python em processo, C++ como biblioteca condicionada)
- [ADR-009](./decisions/ADR-009-comunicacao-por-fronteira.md) — Comunicação por fronteira: IPC do shell, stdio para chamada curta e fila durável para trabalho longo
- [ADR-010](./decisions/ADR-010-ponto-de-congelamento-efetivo-da-v1.md) — O ponto de congelamento efetivo da V1 é a `v1.3.8` (a 1.0.0 nunca foi publicada)

## Namespace de tags e releases

Contrato dos nomes que identificam o que foi publicado. Nenhum workflow depende
dele para funcionar: ele existe para que documentação e diagnóstico leiam o
histórico do jeito certo.

| Namespace | Papel | Quem cria |
| --- | --- | --- |
| `v<versão>` | **namespace público** das releases: é o nome que aparece em `/releases` e em `/releases/latest`, e marca a versão web e do launcher | `electron-builder`, ao publicar (`desktop/package.json` → `publish: github`, `releaseType: release`) |
| `desktop-v<versão>` | **marcador opcional de disparo** do workflow Desktop Release (`.github/workflows/desktop-release.yml`) | push de tag, quando houver permissão para empurrar tags |
| `mobile-v<versão>` | namespace do app Android (Capacitor) | `.github/workflows/mobile-release.yml` |

**Como ler.** Para saber *o que foi publicado*, consulte **releases**; para saber
*o que acionou o build*, consulte **workflow runs**. Tags `desktop-v*` não são
registro histórico obrigatório: de 1.3.5 em diante elas não existem, porque o
proxy git da sessão recusa push de tag (HTTP 403) e o build foi disparado por
`workflow_dispatch`. A ausência não afeta os artefatos nem o `electron-updater` —
o próprio `docs/releases/v1.3.5.md` e o `docs/releases/v1.3.8.md` registram o
desvio.

Consequência para a base congelada: a tag `v1.3.8` é **leve**, e a referência
canônica da V1 congelada é o commit `7cce9d42`, não o nome da tag
([ADR-010](./decisions/ADR-010-ponto-de-congelamento-efetivo-da-v1.md)).
