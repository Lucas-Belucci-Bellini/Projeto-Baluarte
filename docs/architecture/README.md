# 🏛️ docs/architecture/

Documentos de arquitetura do Baluarte. Cada um responde **uma** pergunta:

> "Se eu for mexer nisso daqui, o que posso quebrar?"

Isso é o critério de aceitação de um documento desta pasta. Um texto que
descreve a estrutura mas não diz o que quebra ao mexer nela não paga o custo de
existir — o mapa já está no `CLAUDE.md`.

| Documento | Estado | Responde |
|---|---|---|
| [`overview.md`](./overview.md) | ✅ escrito | O que é o Baluarte hoje, quais são as camadas e o que atravessa quais fronteiras |
| [`v2-vision.md`](./v2-vision.md) | ✅ escrito (**bússola, não obra**) | Para onde a V2 vai — e o que **não** fazer até a 1.0.0 fechar |
| [`decisions/`](./decisions/) | ✅ 3 ADRs | Decisões fechadas, com o contexto que as gerou |
| `core.md` | ⬜ a escrever | Router, state, storage, events, permissions, flags: contratos e quem depende de quem |
| `events.md` | ⬜ a escrever | Catálogo dos eventos do bus e quem escuta cada um |
| `storage.md` | ⬜ a escrever | Chaves, esquemas, classes de dado e como migrar sem perder o do operador |
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

- [ADR-001](./decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md) — A 1.0.0 é um ponto de congelamento, não a versão final
- [ADR-002](./decisions/ADR-002-permissoes-deny-by-default.md) — Acesso é negado por omissão e permissão precisa ser declarada
- [ADR-003](./decisions/ADR-003-congelamento-e-manutencao-da-v1.md) — O que "congelar a V1" significa na prática (numeração, o que o `main` aceita, o app travado na 1.x)
