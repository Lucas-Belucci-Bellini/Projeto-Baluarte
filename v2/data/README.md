# v2/data — fundação da camada de dados

Schema da Data Layer e da fila de tarefas. **Postgres puro**, sem extensão e sem
serviço adicional — a decisão está em [`../../docs/v2/V2_STACK.md`](../../docs/v2/V2_STACK.md).

```
migrations/001_fundacao.sql   o schema
test_fundacao.sql             as garantias, verificáveis
```

## Rodar a verificação

Precisa de um Postgres — qualquer um serve, inclusive um efêmero:

```sh
# subir um descartável (não roda como root)
D=/tmp/pgd; rm -rf $D; mkdir -p $D; chown nobody $D; chmod 700 $D
su -s /bin/sh nobody -c "PATH=/usr/lib/postgresql/16/bin:\$PATH initdb -D $D -U baluarte --auth=trust"
su -s /bin/sh nobody -c "PATH=/usr/lib/postgresql/16/bin:\$PATH pg_ctl -D $D -o '-p 55432 -k /tmp' -l /tmp/pg.log start"

PG="psql -h /tmp -p 55432 -U baluarte -d postgres"
$PG -v ON_ERROR_STOP=1 -f migrations/001_fundacao.sql
$PG -v ON_ERROR_STOP=1 -f test_fundacao.sql      # 6 garantias; erro = falha
```

> Ainda **não está no CI**. O workflow da V1 não sobe banco, e pendurar um
> serviço no pipeline que está congelando a 1.0.0 seria mexer onde não se deve.
> Entra junto com o primeiro serviço Python.

## O que foi verificado (Postgres 16.13, 2026-08-10)

| | Garantia |
| --- | --- |
| ✓ | contradição entre fontes **coexiste** e aparece na view `afirmacao_conflito` |
| ✓ | `afirmacao` é append-only por **trigger** — `UPDATE` do valor levanta exceção |
| ✓ | substituir aponta `substituida_por`; a afirmação antiga continua legível |
| ✓ | tarefa com dependência pendente **não** é reivindicável |
| ✓ | lease vencido volta à fila; acima do teto vira `FAILED` em vez de girar |
| ✓ | prioridade ordena a fila |

E o teste de concorrência, que é o que sustenta "múltiplos bots em paralelo":

```
500 tarefas · 8 workers simultâneos
→ 500 reivindicadas · 0 na fila · 8 workers distintos · 0 pegas mais de uma vez
```

## As três decisões que moldam o schema

**Afirmação é log, não registro.** Se um bot achar algo hoje e outra fonte
contradisser em seis meses, `UPDATE` apagaria a pergunta *"quem disse o quê"*.
Contradição não é erro a resolver na escrita — é fato sobre o mundo. A view
`afirmacao_conflito` só é possível porque nada foi sobrescrito.

**A imutabilidade é trava, não convenção.** Um trigger recusa alterar
`valor`, `entidade`, `atributo`, `fonte` ou `coletor`; `estado` e
`substituida_por` seguem editáveis porque são o ciclo de verificação, não o que
foi afirmado. Convenção não sobrevive ao primeiro bot com pressa.

**Sem broker.** `SELECT … FOR UPDATE SKIP LOCKED` dá N workers em paralelo sem
Redis, sem Celery e sem coordenação externa. Um componente a menos para operar,
fazer backup e ver quebrar — e a escala atual não justifica mais que isso.
Reabre-se quando a taxa de reivindicação virar gargalo medido.

## O worker

`../services/tarefas/` consome esta fila. Testes contra Postgres real:

```sh
pip install -r ../services/tarefas/requirements.txt
BALUARTE_TEST_DSN="postgresql://baluarte@/postgres?host=/tmp&port=55432" \
  python3 -m pytest ../services/tarefas -q --timeout=25
```

## O que ainda não existe

Fundação, não módulos (§23 do plano — *preparar ≠ implementar*):
- **ingestão**: normalização, deduplicação, classificação
- **busca**: full-text e `pgvector`, quando houver consulta real para medir
- **migração** de `src/data/` (21k linhas de JS) para tabelas

## Evidence Layer — primeiro slice V2

O contrato local `evidence.ts` e o módulo `../modules/evidence/module.js` já foram implementados. Eles validam proveniência, confidence, datas, status e ciclo de supersessão sem rede, banco ou dependência de frontend. O store em memória existe para testar o contrato e o lifecycle; ele não substitui a migration Postgres nem autoriza ingestão automática.

A persistência deve ser adicionada somente quando houver adapter, política de tenancy, testes de concorrência e estratégia de retenção. Até lá, a migration SQL continua sendo fundação preparada, não uma implementação acoplada ao navegador.

A fila local `EvidenceStore.reviewQueue()` centraliza a seleção bounded de evidências `pending` para revisão. Ela preserva a ordem append-only, permite escopo opcional por módulo, congela a projeção e redige statement, URI, publisher e collector. O Wiki Zomboid delega a essa política, mas mantém seu formato legado de seis campos. A fila não altera status, não cria persistência e não substitui revisão humana server-side; o contrato está em [`../../docs/v2/EVIDENCE_REVIEW_QUEUE_CONTRACT_2026-08-25.md`](../../docs/v2/EVIDENCE_REVIEW_QUEUE_CONTRACT_2026-08-25.md).


A busca local `EvidenceStore.search({ query, moduleId?, status?, limit? })` complementa as projeções de retenção, auditoria e revisão. Ela percorre somente os metadados `id`, `claimKey`, `moduleId` e `source.revision`, preserva a ordem append-only, limita o retorno a 100 itens e entrega `returned`, `available` e `truncated`. A projeção é congelada e não inclui `statement`, URI, publisher ou collector.

Esta busca é diagnóstica e read-only: não autentica fonte, não promove status, não resolve ownership/tenancy, não grava banco e não é full-text, ranking ou `pgvector`. O contrato está em [`../../docs/v2/EVIDENCE_SEARCH_CONTRACT_2026-08-26.md`](../../docs/v2/EVIDENCE_SEARCH_CONTRACT_2026-08-26.md). A busca persistente permanece condicionada a consulta real, benchmark, adapter, retenção, RLS e staging aprovados.
