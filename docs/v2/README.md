# 📐 docs/v2/ — a documentação da reconstrução

> **Esta pasta existe porque o plano da V2 estava só em issue, e sessão nova não
> acha issue por conta própria.**
>
> Aconteceu de verdade: uma sessão remota procurou `V2_MASTER_PLAN.md`, não achou
> arquivo nenhum, e reportou ao operador que o documento *"não existia"* — duas
> vezes. Ele existia: era a **[issue #423](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423)**,
> fixada no topo do repositório. O `CLAUDE.md` já avisa que *"o que precisa
> sobreviver mora no repo **e** nas issues"*; o problema é que quem chega lendo o
> repositório não sabe qual issue abrir.

## De onde veio cada arquivo

O conteúdo é do operador, escrito na #423. A transcrição para cá **não é cópia
decorativa**: a partir daqui estes arquivos são a versão de trabalho, e a issue
fica como origem e lugar de discussão — mesma relação que os ADRs têm com as
conversas que os geraram.

| Arquivo | Estado | Origem |
| --- | --- | --- |
| [`V2_MASTER_PLAN.md`](./V2_MASTER_PLAN.md) | ✅ transcrito | corpo da #423 (26 seções) |
| [`V2_RULES.md`](./V2_RULES.md) | ✅ transcrito | comentário 2 da #423 (40 regras) |
| [`V2_DECISION_LOG.md`](./V2_DECISION_LOG.md) | ✅ escrito | comentário 4 da #423 — **decisões que não estão no corpo do plano** |
| [`V2_ARCHITECTURE.md`](./V2_ARCHITECTURE.md) | ✅ **proposta** | os 17 sistemas com decisão manter/refatorar/construir, medido no repo; aguarda 4 decisões do operador |
| [`V2_STACK.md`](./V2_STACK.md) | ✅ **proposta** | resposta à diretriz de reavaliar linguagens: três, com responsabilidade separada |
| [`V2_MODULE_RULES.md`](./V2_MODULE_RULES.md) | ✅ escrito | especificação do Module Manifest; espelha `v2/core/manifest.js` |
| [`V2_TESTING_RULES.md`](./V2_TESTING_RULES.md) | ✅ escrito | 10 regras, cada uma de um defeito real da construção |
| [`V2_CODING_STANDARDS.md`](./V2_CODING_STANDARDS.md) | ✅ escrito | 12 padrões, mesma origem — mais as convenções mecânicas |
| `V2_SECURITY_RULES.md` | ⬜ a escrever | o que já vale está em `V2_CODING_STANDARDS.md` §10 e no `config.js` |
| `V2_AI_RULES.md` | ⬜ a escrever | |
| `V2_DATA_RULES.md` | ⬜ a escrever | prioridade alta — ver a Decisão 5 do log; a fundação SQL já existe em `v2/data/` |
| `V2_GIT_RULES.md` | ⬜ a escrever | |
| `V2_DEPENDENCY_RULES.md` | ⬜ a escrever | |

Os que faltam **não foram criados vazios de propósito**. A Regra 17 e a §23 do
plano dizem a mesma coisa por ângulos diferentes — *preparar ≠ implementar*, *não
implementar o futuro antes da hora* —, e arquivos-esqueleto seriam exatamente o
oposto: lugares onde alguém, daqui a um mês, não sabe se está lendo uma decisão
ou um placeholder.

O critério para escrever um deles é ter **material real**: os três últimos da
lista de prontos existem porque a construção da fundação produziu erros concretos
que se perderiam se não fossem registrados. Nenhum foi escrito por completude.

## A ordem que o plano manda seguir

```
arquitetura → Core → Module System → contratos → migração → módulos grandes
```

Nada de módulo grande antes da fundação. A §26 do plano detalha os 11 passos
antes de tocar em código, e a Regra 28 resume o ritmo: *pequena alteração → teste
→ revisão → próxima*.

## Onde a construção está

A reconstrução **começou**, por autorização direta do operador ("pode começar a
construir a V2", "pode trabalhar diretamente no `main`"). O que existe em código:

| | |
| --- | --- |
| [`v2/core/`](../../v2/core/) | 11 arquivos: manifest, registry, contexto, ciclo, boot, bus, log, config, api, métricas, trabalho |
| [`v2/modules/`](../../v2/modules/) | `cripto` (**nativo** — o caso de prova da ergonomia), `editor` e `militar` (adaptadores, servem página da V1) |
| [`v2/data/`](../../v2/data/) | fundação SQL append-only + fila de tarefas; worker Python |
| [`v2/harness/`](../../v2/harness/) | banco de prova — router e navegador **de verdade**, no CI |

A V1 continua **não congelada**: falta a tag `v1.0.0` e a release local do app
(ADR-001). Por isso `src/main.js` segue intocado — a V2 tem endereço próprio e
não toma o site. Estado da V1: [`../HARDENING-1.0.0.md`](../HARDENING-1.0.0.md).

O portão antes de qualquer commit está no fim de
[`V2_CODING_STANDARDS.md`](./V2_CODING_STANDARDS.md).
