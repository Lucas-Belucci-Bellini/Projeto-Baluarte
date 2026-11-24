# docs/architecture/v2/

Arquitetura-alvo da V2 do Baluarte. Esta pasta existe para responder, em um
lugar só, **como a V2 é organizada, o que já está decidido e o que ainda
depende de decisão** — issues [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540)
e [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539).

| Documento | Estado | Responde |
| --- | --- | --- |
| [`arquitetura-alvo.md`](./arquitetura-alvo.md) | ✅ revisado | Qual é a estrutura-alvo da V2, por que cada peça existe, o que está decidido, proposto e pendente |
| [`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md) | 🟣 proposta | Opções e recomendação para D5/D6/D7 (linguagem do Core, forma dos componentes, comunicação) |
| [`../../v2/V2_ARCHITECTURE.md`](../../v2/V2_ARCHITECTURE.md) | ✅ histórico | Como o Module System nasceu (diagnóstico da V1, manifesto, ordem de construção) |
| [`../decisions/`](../decisions/) | ✅ ADRs 001–006 | Decisões fechadas, com contexto, alternativas e consequências |

## Hierarquia

1. [`../../ARCHITECTURE-INDEX.md`](../../ARCHITECTURE-INDEX.md) — mapa do repositório e ordem de leitura.
2. Este README — escopo da pasta e status.
3. [`arquitetura-alvo.md`](./arquitetura-alvo.md) — **fonte única** da arquitetura-alvo; separa definido, proposto, pendente e conflito.
4. [`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md) — dossier de decisão de D5/D6/D7; não é decisão.
5. [`../decisions/`](../decisions/) — ADRs fechados. O canônico aponta para eles; não os substitui.
6. [`../../v2/V2_ARCHITECTURE.md`](../../v2/V2_ARCHITECTURE.md) — histórico do Module System; não é a arquitetura-alvo.

Regra de precedência: quando o canônico e um documento antigo divergirem, o
canônico vence **somente** se a divergência estiver registrada em §17. Caso
contrário, é conflito a resolver — não escolha automática.

## Regra de leitura

O documento canônico usa quatro marcas:

- ✅ **Definido** — direção confirmada pelo responsável pelo projeto.
- 🟣 **Proposto** — recomendação técnica para discussão, **não aprovada**.
- 🟡 **Pendente** — escolha não feita.
- ⛔ **Conflito aberto** — duas fontes divergem e a resolução é do operador.

Nada marcado como 🟣 ou 🟡 pode ser usado para justificar implementação como se
fosse decisão. A seção 15 da issue #540 é proposta do autor da issue, não
arquitetura aprovada.

## As decisões que sustentam a V2 hoje

| ADR | Decisão |
| --- | --- |
| [ADR-001](../decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md) | A 1.0.0 é ponto de congelamento, não versão final |
| [ADR-002](../decisions/ADR-002-permissoes-deny-by-default.md) | Acesso negado por omissão; permissão declarada |
| [ADR-003](../decisions/ADR-003-congelamento-e-manutencao-da-v1.md) | O que “congelar a V1” significa na prática |
| [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md) | Stack poliglota por responsabilidade (parcialmente revista) |
| [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md) | V2 como app, frontend TypeScript, backend Python/Rust/C++ |
| [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md) | Disponibilização somente como aplicativo durante a reconstrução |

## Pendências abertas

O documento canônico mantém a lista completa em
[§16 — Decisões pendentes](./arquitetura-alvo.md#16-decisões-pendentes) e
[§17 — Conflitos e divergências](./arquitetura-alvo.md#17-conflitos-e-divergências-abertos).
As mais bloqueantes: consolidação dos núcleos (D5), formato dos componentes
(D6), mecanismo de comunicação (D7), persistência (D8, ⛔) e shell do aplicativo
(D13, ⛔).

## Manutenção

- Decisão nova → ADR em [`../decisions/`](../decisions/); o documento aponta para o
  ADR, não o substitui.
- Reabrir decisão fechada exige ADR novo revogando o anterior, nunca edição
  silenciosa.
- O diagrama e a tabela “Ponto de partida real” devem ser atualizados quando o
  código mudar de estado — se divergirem, o documento perde função.
- Este documento **não** é o plano de construção. A ordem de execução está em
  [`../../v2/V2_MASTER_PLAN.md`](../../v2/V2_MASTER_PLAN.md) e nas etapas
  propostas no canônico (§18).
