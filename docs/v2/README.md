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
| `V2_CODING_STANDARDS.md` | ⬜ a escrever | |
| `V2_SECURITY_RULES.md` | ⬜ a escrever | |
| `V2_MODULE_RULES.md` | ⬜ a escrever | |
| `V2_AI_RULES.md` | ⬜ a escrever | |
| `V2_DATA_RULES.md` | ⬜ a escrever | prioridade alta — ver a Decisão 5 do log |
| `V2_TESTING_RULES.md` | ⬜ a escrever | |
| `V2_GIT_RULES.md` | ⬜ a escrever | |
| `V2_DEPENDENCY_RULES.md` | ⬜ a escrever | |

Os dez em branco **não foram criados vazios de propósito**. A Regra 17 e a §23 do
plano dizem a mesma coisa por ângulos diferentes — *preparar ≠ implementar*, *não
implementar o futuro antes da hora* —, e doze arquivos-esqueleto seriam
exatamente o oposto: doze lugares onde alguém, daqui a um mês, não sabe se está
lendo uma decisão ou um placeholder.

## A ordem que o plano manda seguir

```
arquitetura → Core → Module System → contratos → migração → módulos grandes
```

Nada de módulo grande antes da fundação. A §26 do plano detalha os 11 passos
antes de tocar em código, e a Regra 28 resume o ritmo: *pequena alteração → teste
→ revisão → próxima*.

## O que ainda não começou, e por quê

A V1 **não foi congelada**. Pela ADR-001 e pelo fluxo que o operador definiu, a
reconstrução só começa depois da tag `v1.0.0` e da release local do app. O que
existe aqui até agora é leitura e transcrição — nenhuma linha de código da V2.

Estado da V1: [`../HARDENING-1.0.0.md`](../HARDENING-1.0.0.md).
