# Diagnóstico — `Supabase Preview`, o único vermelho do `main`

**Data:** 2026-08-23
**Origem:** [`HANDOFF-REMOTO.md`](../HANDOFF-REMOTO.md), fila item 3
**Estado:** diagnosticado; **a correção é decisão do operador** (Regra 26)

O `HANDOFF-REMOTO.md` registrou que diagnosticar isto exigia token de acesso ao
projeto Supabase, e que reconciliar podia exigir ação no dashboard — por isso o
item ficou parado desde 16/08. Esta sessão remota teve o conector Supabase
ligado, então o diagnóstico saiu. **Nada foi aplicado, alterado ou apagado no
banco**: tudo abaixo é leitura.

## A mensagem

> `Remote migration versions not found in local migrations directory`

Ela está **certa**, e não é defeito de credencial nem de rede.

## Os números

Projeto `hcwzsxdcvmswebunznak` (`Lucas-Belucci-Bellini's Project`, us-west-2,
Postgres 17.6).

| onde | migrations |
|---|---|
| banco remoto | **98** |
| `Projeto-Baluarte/supabase/migrations/` | 17 |
| `Veritas/supabase/migrations/` | 14 |
| versões remotas que não existem em **nenhum** dos dois repositórios | **82** |

O recorte por repositório:

- das 17 do Baluarte, **15** batem com o remoto e **2 não existem lá**;
- das 14 do Veritas, **1** bate com o remoto e **13 não existem lá** — apesar de
  o remoto ter migrations com os **mesmos nomes**, sob carimbos diferentes.

## A causa

**Duas causas somadas, e nenhuma delas é técnica no sentido de "tem bug".**

**1. Um banco, vários produtos.** O mesmo projeto Supabase atende Projeto
Baluarte, Veritas, TaxForge e mais — o histórico remoto tem `veritas_circuit_*`,
`taxforge_*`, `room_001_*` e `create_academic_report_domain` ao lado das
migrations do Baluarte. A integração do Supabase com o GitHub compara o
histórico **inteiro** do banco com o diretório **deste** repositório. Enquanto
outro repositório escrever no mesmo banco, essa comparação não tem como fechar:
o vermelho é estrutural, não um estado passageiro.

**2. As migrations não são aplicadas a partir dos arquivos.** O caso do Veritas
prova: existe remotamente `veritas_circuit_projects` sob a versão `20260814184308`,
e no repositório o arquivo é `20260814183500_veritas_circuit_projects.sql`. Mesmo
nome, carimbo diferente — o padrão se repete em 13 dos 14 arquivos. Isso é a
assinatura de migration aplicada pelo dashboard/API/MCP, que carimba a versão do
momento da aplicação, em vez de `supabase db push`, que usa o carimbo do nome do
arquivo. Depois disso o arquivo versionado e a linha em
`supabase_migrations.schema_migrations` nunca mais se reconhecem.

## O achado que importa mais que o vermelho

Duas migrations do Baluarte estão no repositório e **não foram aplicadas**.
Confirmado por consulta ao catálogo do banco, não por dedução:

| migration | o que promete | o que o banco diz |
|---|---|---|
| `20260819060000_billing_foundation.sql` | schema `billing` com `workspaces`, `workspace_members`, `plans`, `plan_assignments`, `usage_events` e cinco policies | **o schema `billing` não existe** — nenhuma tabela |
| `20260820090000_security_definer_search_path_hardening.sql` | `create or replace` de `veritas_is_project_owner`, `veritas_can_collaborate`, `veritas_can_edit_project`, entre outras | as três **não existem** |

O caso do billing é o mais sério: `v2/data/billing-foundation.ts`,
`billing-persistence.ts` e os contratos em
[`BILLING_FOUNDATION_CONTRACT_2026-08-21.md`](./BILLING_FOUNDATION_CONTRACT_2026-08-21.md)
descrevem uma fundação que **não tem banco atrás**. O que existe remotamente é
outra coisa, aplicada antes e com outro nome:
`create_billing_entitlements_foundation` (`20260814151418`).

O caso do hardening é mais sutil e vale registrar sem exagerar: as funções
`veritas_*` que **existem** no banco (`veritas_add_circuit_collaborator`,
`veritas_create_circuit_room`, `veritas_remove_circuit_collaborator`,
`veritas_room_is_allowed`, `veritas_sync_circuit_project`) são todas `SECURITY
INVOKER` com `search_path=public, pg_temp` fixo — ou seja, **já endurecidas**,
por outro caminho (`harden_security_definer_search_paths`, `20260814144509`, e
`harden_veritas_authorization_surface`, `20260821022900`). A migration local não
é a única fonte dessa proteção; ela é uma variante paralela que nunca subiu.

## As saídas — e por que nenhuma é minha para escolher

Isto é ambiguidade arquitetural com dado real em jogo, então vale a Regra 26:
documentar e pedir decisão em vez de inventar.

**(a) Separar os bancos por produto.** Baluarte, Veritas e TaxForge com projetos
Supabase próprios. É a única saída que torna a verificação verde *por
construção* e a única alinhada com o isolamento do §6 do plano-mestre. É também
a mais cara: migrar dado existente, refazer chaves e revisar o que hoje
atravessa produtos dentro do mesmo `public`.

**(b) Eleger um repositório dono do schema.** Um repositório passa a conter as 98
migrations e é o único que aplica; os outros só leem. Mais barato que (a) e
resolve o vermelho, mas mantém o acoplamento que (a) desfaz — e exige disciplina
permanente de todo mundo aplicar por `supabase db push`, que é exatamente a
disciplina que já falhou 82 vezes.

**(c) Desligar a integração Supabase↔GitHub neste repositório.** Honesta se a
decisão for "o banco não é governado por este repositório". Um check que não pode
ficar verde ensina a ignorar vermelho — e o `HANDOFF-REMOTO.md` já registra o
preço disso: o `main` passou dias vermelho sem ninguém ver.

**Independente da escolha**, as duas migrations não aplicadas continuam sendo um
problema à parte: ou sobem, ou saem do repositório, ou ganham um comentário
dizendo que descrevem intenção e não estado. Hoje elas afirmam um estado que o
banco não tem — e `v2/data/billing-*.ts` acredita nelas.

## O que não foi feito, de propósito

Nenhum `apply_migration`, nenhum `db push`, nenhuma escrita em
`supabase_migrations.schema_migrations`, nenhuma branch de preview criada ou
apagada. Reconciliar histórico de migration em banco compartilhado por três
produtos é ação irreversível sobre dado de produção; ela pertence ao operador,
depois de escolher entre (a), (b) e (c).

## Como reproduzir

```
mcp Supabase → list_projects            # ref hcwzsxdcvmswebunznak
mcp Supabase → list_migrations          # 98 versões
ls supabase/migrations | sed 's/_.*//'  # 17 no Baluarte
```

E, para as duas migrations não aplicadas:

```sql
select count(*) from information_schema.schemata where schema_name = 'billing';
select proname from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname like 'veritas%';
```
