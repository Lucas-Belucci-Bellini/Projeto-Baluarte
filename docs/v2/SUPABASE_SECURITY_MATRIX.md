# Supabase Security Matrix — V2

Auditoria somente leitura. Esta matriz registra o estado observado no projeto conectado e não aplica mudanças de produção.

## RLS por tabela

| Tabela | SELECT | INSERT | UPDATE | DELETE | Política para `anon` | Política para `authenticated` |
|---|---:|---:|---:|---:|---|---|
| `global_comms` | 1 | 1 | 0 | 1 | não | sim |
| `juris_doutrina` | 1 | 1 | 1 | 0 | não | sim |
| `knowledge_notes` | 1 | 1 | 1 | 1 | não | sim |
| `media_bookmarks` | 1 | 1 | 1 | 1 | não | sim |
| `memories` | 1 | 1 | 1 | 1 | não | sim |
| `mil_curation` | 1 | 0 | 0 | 0 | sim | sim |
| `mural_posts` | 1 | 1 | 1 | 1 | não | sim |
| `nucleo_events` | 1 | 0 | 0 | 0 | não | não |
| `partes` | 1 | 1 | 1 | 0 | não | sim |
| `pecas` | 1 | 1 | 0 | 0 | não | sim |
| `pecas_versoes` | 1 | 1 | 0 | 0 | não | sim |
| `prazos_eventos` | 1 | 1 | 1 | 0 | não | sim |
| `processo_partes` | 1 | 1 | 0 | 0 | não | sim |
| `processos` | 1 | 1 | 1 | 0 | não | sim |
| `profiles` | 1 | 1 | 1 | 0 | não | sim |
| `site_stats` | 2 | 0 | 0 | 0 | não | sim |
| `tenant_members` | 1 | 0 | 0 | 0 | não | sim |
| `tenants` | 1 | 0 | 0 | 0 | não | sim |

## Grants observados

O catálogo mostra `anon` e `authenticated` com grants amplos de tabela em todas as tabelas públicas acima. Isso não deve ser interpretado isoladamente como acesso efetivo a dados: as tabelas estão protegidas por RLS e as policies determinam quais linhas podem ser afetadas.

## Pontos de atenção

### Alta prioridade para revisão

- `mil_curation`: existe policy explícita para `anon`; confirmar se a leitura pública é intencional.
- `nucleo_events`: possui SELECT policy pública, mas não possui policy explícita para `anon`/`authenticated` na matriz; confirmar o fluxo que depende da leitura.
- `site_stats`: possui duas SELECT policies; confirmar sobreposição e necessidade.
- RPCs `ingest_event`, `ingest_memory` e `ingest_stat`: revisar grants e fronteira de tenant antes de conceder acesso a agentes.
- RPCs `nexus.is_member` e `nexus.resolve_tenant`: revisar completamente porque participam da autorização/tenant resolution.

## Regra para mudanças futuras

Não revogar grants em massa. Primeiro identificar consumidores e testar a política RLS. Toda mudança deve ter migration reversível, teste de autorização e verificação de regressão.

## Classificação provisória

- 🟢 RLS presente e policy restritiva: manter e testar.
- 🟡 leitura pública explícita: confirmar requisito de produto.
- 🟠 grants amplos: reduzir somente após mapear consumidores.
- 🔴 escrita pública efetiva sem uma policy RLS correspondente: investigar imediatamente.

A classificação é provisória até que os consumidores das RPCs e as policies completas sejam mapeados.
