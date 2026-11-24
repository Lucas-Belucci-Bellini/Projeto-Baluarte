# docs/architecture/v2/

Arquitetura-alvo da V2 do Baluarte. Esta pasta existe para responder, em um
lugar só, **como a V2 é organizada, o que já está decidido e o que ainda
depende de decisão** — issues [#540](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/540)
e [#539](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/539).

| Documento | Estado | Responde |
| --- | --- | --- |
| [`arquitetura-alvo.md`](./arquitetura-alvo.md) | ✅ revisado | Qual é a estrutura-alvo da V2, por que cada peça existe, o que está decidido, proposto e pendente |
| [`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md) | 🟣 estudo (registro) | Alternativas de D5/D6/D7, quatro arquiteturas completas, custos medidos × estimados, critérios de falsificação e o que falta medir |
| [`auditoria-evidencias-d5-d6-d7.md`](./auditoria-evidencias-d5-d6-d7.md) | 🔍 auditoria (registro) | Reprodução independente dos benchmarks, estado real dos protótipos e checagem da ARQ-1 eixo por eixo; não aprova nada |
| [`plano-prontidao-arq1.md`](./plano-prontidao-arq1.md) | ✅ executado (registro) | Os sete ajustes, a separação entre aprovação arquitetural e prontidão operacional, critérios verificáveis e portões P0–P5 |
| [`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md) | 🟣 proposta (registro) | Opções e recomendação para D5/D6/D7 (linguagem do Core, forma dos componentes, comunicação) |
| [`../../v2/V2_ARCHITECTURE.md`](../../v2/V2_ARCHITECTURE.md) | ✅ histórico | Como o Module System nasceu (diagnóstico da V1, manifesto, ordem de construção) |
| [`../decisions/`](../decisions/) | ✅ ADRs 001–009 | Decisões fechadas, com contexto, alternativas e consequências |

## Hierarquia

1. [`../../ARCHITECTURE-INDEX.md`](../../ARCHITECTURE-INDEX.md) — mapa do repositório e ordem de leitura.
2. Este README — escopo da pasta e status.
3. [`arquitetura-alvo.md`](./arquitetura-alvo.md) — **fonte única** da arquitetura-alvo; separa definido, proposto, pendente e conflito.
4. [`analise-decisoes-d5-d6-d7.md`](./analise-decisoes-d5-d6-d7.md) — estudo técnico que sustenta D5/D6/D7; não é decisão.
5. [`auditoria-evidencias-d5-d6-d7.md`](./auditoria-evidencias-d5-d6-d7.md) — auditoria independente das evidências do estudo; também não é decisão.
6. [`plano-prontidao-arq1.md`](./plano-prontidao-arq1.md) — os critérios e portões (P0–P5) que sustentaram a aprovação de D5/D6/D7; não decide.
7. [`proposta-core-e-fronteiras.md`](./proposta-core-e-fronteiras.md) — dossier de D5/D6/D7; registro das opções, aprovado em 2026-11-24 (a redação vigente é a dos ADRs).
8. [`../decisions/`](../decisions/) — ADRs fechados (001–009). O canônico aponta para eles; não os substitui.
9. [`../../v2/V2_ARCHITECTURE.md`](../../v2/V2_ARCHITECTURE.md) — histórico do Module System; não é a arquitetura-alvo.

Regra de precedência: quando o canônico e um documento antigo divergirem, o
canônico vence **somente** se a divergência estiver registrada em §17. Caso
contrário, é conflito a resolver — não escolha automática. Nem o estudo, nem a
auditoria, nem o plano, nem a proposta criam decisão: só ADR aprovado pelo
operador cria. Desde 2026-11-24, D5, D6 e D7 são ADRs (007, 008, 009) — os quatro
documentos de apoio continuam como registro da análise, não como fonte de
decisão.

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
| [ADR-001](../decisions/ADR-001-1.0.0-como-ponto-de-congelamento.md) | A 1.0.0 é ponto de congelamento, não versão final — ponto efetivo: `v1.3.8` ([ADR-010](../decisions/ADR-010-ponto-de-congelamento-efetivo-da-v1.md)) |
| [ADR-002](../decisions/ADR-002-permissoes-deny-by-default.md) | Acesso negado por omissão; permissão declarada |
| [ADR-003](../decisions/ADR-003-congelamento-e-manutencao-da-v1.md) | O que “congelar a V1” significa na prática |
| [ADR-004](../decisions/ADR-004-stack-poliglota-por-responsabilidade.md) | Stack poliglota por responsabilidade (parcialmente revista) |
| [ADR-005](../decisions/ADR-005-v2-app-typescript-backend-poliglota.md) | V2 como app, frontend TypeScript, backend Python/Rust/C++ |
| [ADR-006](../decisions/ADR-006-disponibilizacao-somente-app.md) | Disponibilização somente como aplicativo durante a reconstrução |
| [ADR-007](../decisions/ADR-007-dois-nucleos-core-orquestracao-host-runtime.md) | Dois núcleos: Core de Orquestração (TS) e Runtime/Host (Rust), com tabela de donos (D5) |
| [ADR-008](../decisions/ADR-008-execucao-hibrida-por-fronteiras-de-processo.md) | Execução híbrida por fronteira de processo: módulos in-process, Python em processo, C++ como biblioteca (D6) |
| [ADR-009](../decisions/ADR-009-comunicacao-por-fronteira.md) | Comunicação por fronteira: IPC do shell, stdio para chamada curta, fila durável para trabalho longo (D7) |
| [ADR-010](../decisions/ADR-010-ponto-de-congelamento-efetivo-da-v1.md) | Ponto de congelamento efetivo da V1: a `v1.3.8`, com vigência em 2026-11-24 — a 1.0.0 nunca foi publicada |

## Pendências abertas

O documento canônico mantém a lista completa em
[§16 — Decisões pendentes](./arquitetura-alvo.md#16-decisões-pendentes) e
[§17 — Conflitos e divergências](./arquitetura-alvo.md#17-conflitos-e-divergências-abertos).
D5, D6 e D7 foram fechados em 2026-11-24. As mais bloqueantes agora são
persistência (D8, ⛔), shell do aplicativo (D13, ⛔) e, na sequência de
empacotamento, D9/D10. A aprovação de D5/D6/D7 **não** concluiu prontidão
operacional: Windows, empacotamento, supervisor, encerramento multiplataforma e
distribuição do Python seguem como trabalho a construir, sob os portões P1–P5 do
[plano](./plano-prontidao-arq1.md).

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
