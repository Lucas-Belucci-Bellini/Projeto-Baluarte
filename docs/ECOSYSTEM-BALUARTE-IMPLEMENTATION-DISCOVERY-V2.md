# Baluarte — Implementation Discovery V2

> Registro de continuidade. Esta rodada verifica implementação concreta no `main`; não trata apenas o Master Plan como implementação.

## Descobertas verificadas

### Event Bus

`src/core/events.ts` existe e exporta `EventBus`/`createBus` e uma instância `bus`.

Capacidades concretas verificadas:

- `on`
- `once`
- `off`
- `emit`
- `clear`
- `contarOuvintes`
- listeners exatos, por prefixo e globais
- rejeição de padrões curinga usados como evento de emissão
- isolamento de exceções dos handlers

Conclusão: **implementação real existente**, mas é um bus local/in-process. Não tratá-lo ainda como transporte interprojeto.

### Lifecycle

`src/core/ciclo-vida.js` implementa `aoSair`, `encerrar` e `pendentes`, usando `WeakMap` e limpeza reversa dos recursos registrados.

Conclusão: **implementação real existente**, relevante para lifecycle de módulos/páginas, mas não é ainda o Module Registry do ecossistema.

### Nexus / Orquestrador

`src/nexus/orquestrador.js` implementa composição de manifestos de domínio.

O código concreto já verifica:

- versão major do contrato;
- nomes duplicados;
- dependências ausentes;
- ciclos de dependência;
- ordem de inicialização;
- colisão de rotas;
- validade de `load` das rotas;
- ownership de destaques;
- inicialização dos módulos em ordem;
- isolamento de falhas de `iniciar()`.

Conclusão: **esta é a peça concreta mais próxima do Module Registry/contract que procuramos**. Ainda precisamos localizar os manifestos (`baluarte.module.js` ou equivalentes), seus testes e o contrato documentado para saber exatamente o que pode ser reaproveitado como fronteira do Mesh.

## O que ainda NÃO foi comprovado

- registry persistente de capabilities do ecossistema;
- autorização interprojeto baseada em capability;
- API/MCP externa do Baluarte para requests de outros projetos;
- Evidence Layer como serviço interprojeto;
- Storage compartilhado entre projetos;
- transporte remoto do Event Bus.

## Próximo alvo EXATO

1. localizar todos os manifestos `baluarte.module.js`/equivalentes;
2. ler `docs/NEXUS-CONTRATO.md` e `docs/NEXUS-DECISOES.md`;
3. localizar testes de `src/nexus/orquestrador.js`;
4. mapear quais campos do manifesto poderiam virar metadata de capability sem alterar o contrato atual;
5. em paralelo, mapear uma necessidade externa concreta do TaxForge;
6. não criar tabela ou migration do Mesh até existir consumidor + provider + interface.

## Regra de arquitetura

O Mesh deve usar as primitivas já existentes quando elas forem adequadas. Não criar um segundo Event Bus, segundo lifecycle manager ou segundo module orchestrator apenas para o ecossistema.

## Data

2026-08-17
