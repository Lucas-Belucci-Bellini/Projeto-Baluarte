# Supabase Ingestion Hardening — V2

## Auditoria somente leitura

As RPCs de ingestão atuais (`ingest_event`, `ingest_memory`, `ingest_stat`) validam `slug + ingest_key` via `nexus.resolve_tenant()` e executam como `SECURITY DEFINER` com `search_path` explícito.

### Controles existentes

- `resolve_tenant()` compara a chave enviada com o hash armazenado usando `crypt()`.
- `ingest_event()` grava somente o `tenant_id` retornado pela resolução.
- `ingest_memory()` grava somente o `tenant_id` retornado pela resolução.
- `ingest_stat()` grava somente o `tenant_id` retornado pela resolução e usa chave determinística para a PK legada.
- `comms_rate_limit()` limita inserts de `global_comms` por `user_id` a 2 segundos.

### Riscos a tratar antes de ampliar automação

A credencial de ingestão está disponível ao cliente web por desenho. Portanto ela deve ser tratada como **credencial de ingestão pública**, não como segredo administrativo.

As funções de ingestão ainda não apresentam, nesta auditoria, limites explícitos de:

- tamanho de payload JSON;
- tamanho de texto de memória;
- quantidade/tamanho de tags;
- tamanho de `event_type`, `source` e `metrica`;
- limites de valor numérico;
- frequência de chamadas por tenant/chave.

Isso não prova uma vulnerabilidade explorável, mas deixa uma superfície potencial de abuso/consumo de recursos.

## Decisão

Não alterar as funções de produção nesta etapa.

Antes de qualquer migration de hardening, definir testes e limites compatíveis com os consumidores atuais e avaliar um rate limit específico por tenant para as três RPCs de ingestão.

## Regra para agentes

Bots especialistas não devem receber a chave de ingestão nem acesso direto de escrita ao banco de produção. Alterações de RPC/RLS devem passar por PR, CI e revisão de segurança.
