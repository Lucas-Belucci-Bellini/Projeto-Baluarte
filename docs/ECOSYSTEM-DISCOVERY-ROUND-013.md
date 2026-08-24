# Ecosystem Discovery — Round 013

**Data:** 2026-08-17

## Objetivo

Auditar as fronteiras reais de autenticação, autorização e comunicação remota do Baluarte antes de criar qualquer transporte do Knowledge Mesh.

## Achados verificados

### 1. Autenticação

`src/core/supabase-auth.js` usa Supabase Auth por `fetch`, mantém a sessão localmente, renova `access_token` com `refresh_token` e identifica o usuário pelo `sub` do JWT. A própria implementação documenta que a segurança real do acesso aos dados depende do RLS do Supabase.

### 2. Global Comms

`src/core/comms.js` usa `dbFetch`, Supabase Realtime e autenticação para operar a tabela `global_comms`. Leitura de histórico ocorre por REST; escrita exige usuário autenticado; o registro leva `user_id`, autor e texto. Esse mecanismo continua classificado como **Global Comms**, não como transporte do Knowledge Mesh.

### 3. Fronteira de API/MCP

A busca do repositório não forneceu evidência suficiente de uma External API/MCP do Baluarte que possa ser tratada como gateway de capabilities cross-project. Portanto, essa fronteira permanece **não confirmada** e não será criada por inferência.

### 4. Regra de segurança

O frontend pode carregar um JWT do próprio usuário, mas não deve ser usado como autoridade para decidir acesso entre projetos. A autorização cross-project deverá ocorrer em backend/RPC/RLS ou outra fronteira verificável, com mínimo privilégio e escopo explícito.

## Estado do Mesh após Round 013

```text
Baluarte
  ├─ Auth real: confirmado
  ├─ Supabase/RLS boundary: confirmado como camada de segurança existente
  ├─ Global Comms: confirmado, mas NÃO é Mesh
  ├─ Event Bus: confirmado, interno
  ├─ Nexus: confirmado, interno
  └─ Cross-project API/MCP gateway: ainda não confirmado
```

## Próximo trabalho — Round 014

1. Inventariar os contratos e capabilities já implementados nos seis projetos usando arquivos e interfaces concretos.
2. Priorizar TaxForge como consumidor candidato.
3. Verificar se existe algum provider real em Veritas, ARK ou AEGIS que satisfaça uma necessidade já existente do TaxForge.
4. Se nenhum par real existir, registrar a ausência em vez de fabricar uma integração.
5. Se um par existir, documentar somente o contrato mínimo: capability, input, output, provenance e autorização.
6. Não criar migrations do Supabase até esse contrato existir.

## Regra permanente

Não confundir infraestrutura interna do Baluarte com a rede de capabilities entre projetos. O Mesh deve ser aditivo, mínimo e baseado em casos reais.
