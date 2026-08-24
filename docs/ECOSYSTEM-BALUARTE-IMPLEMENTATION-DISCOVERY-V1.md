# Ecosystem — Baluarte Implementation Discovery V1

> Checkpoint de implementação real. Não confundir arquitetura planejada com infraestrutura já pronta.

## Data

2026-08-17

## Objetivo

Verificar quais primitivas da V2 já possuem implementação concreta no `main` e quais ainda são apenas arquitetura/documentação.

## Evidências encontradas

### Event Bus — IMPLEMENTADO

`src/core/events.ts` contém um `EventBus` real com:

- `on`
- `once`
- `off`
- `emit`
- `clear`
- contagem de ouvintes
- listeners exatos
- listeners por prefixo
- listeners globais
- isolamento de exceções dos handlers

Existe wrapper JavaScript de compatibilidade em `src/core/events.js`.

**Classificação:** implementação concreta de Core, reutilizável internamente; ainda não é automaticamente um Event Bus distribuído do Mesh.

### Dados remotos — IMPLEMENTADO

`src/core/dados-remotos.js` é uma porta única para datasets externos ao bundle, com timeout, validação de forma e cache que não preserva falhas.

**Classificação:** primitive de ingestão/carregamento do frontend. Não é ainda um Data Layer multi-projeto.

### Comunicação global — IMPLEMENTADO

`src/core/comms.js` usa Supabase REST + Realtime para `global_comms`, com autenticação e envio sujeito a RLS/rate limit.

**Classificação:** comunicação de usuário existente. Não reutilizar diretamente como transporte do Mesh; semântica e segurança são diferentes.

## O que NÃO foi comprovado nesta rodada

- Module Registry externo pronto para terceiros.
- Permission Manager do Mesh pronto como serviço.
- Event Bus distribuído entre repositórios.
- External API/MCP de capabilities do ecossistema pronto.
- Evidence Layer compartilhada entre projetos.

O V2 Master Plan descreve essas responsabilidades como arquitetura-alvo, mas a implementação concreta precisa ser auditada arquivo por arquivo antes de declarar uma primitive pronta.

## Decisão

Não criar uma segunda implementação de Event Bus.

O Event Bus existente é candidato a ser a base do transporte interno do Baluarte. Para comunicação entre processos/projetos, devemos criar posteriormente um adapter/bridge com contrato próprio, em vez de expor o objeto `EventBus` diretamente.

Também não tratar `global_comms` como Mesh transport.

## Próxima investigação

1. localizar Module Registry/contract/lifecycle real;
2. localizar Permission enforcement real;
3. localizar Storage/Supabase boundary e testes;
4. localizar MCP/API do Baluarte;
5. mapear necessidade externa concreta do TaxForge;
6. só então desenhar o primeiro bridge de capability.

## Regra de continuidade

A fonte de verdade para retomada é `docs/ECOSYSTEM-CONTINUATION-STATE.md`. Este documento contém a evidência detalhada desta rodada.
