# Ecosystem Discovery — Round 010

## Objetivo

Construir o primeiro catálogo de capacidades de domínio do ecossistema antes de criar qualquer infraestrutura cross-project ou Supabase compartilhado.

## Regra

Uma capability só entra no Knowledge Mesh quando houver evidência de que o projeto realmente a implementa. Não inferir uma capability apenas pelo nome do projeto ou por documentação genérica.

## Catálogo inicial

| Projeto | Domínio | Capability candidata | Evidência de implementação | Estado |
|---|---|---|---|---|
| TaxForge | tributário/empresarial | cenários e análise fiscal | código/documentação do TaxForge | candidata forte |
| TaxForge | engenharia do produto | auditoria/quality gate | MCP operacional | local, não Mesh |
| Veritas | lógica digital | análise de circuitos / tabelas-verdade | funcionalidades do projeto | candidata |
| ARK | resiliência | análise de risco/ambiente | domínio do projeto | candidata |
| AEGIS | engenharia | investigação/evidência/validação | domínio do projeto | candidata |
| DailyPlanner | produtividade | tarefas/agenda | domínio do projeto | candidata |
| Baluarte | plataforma | orquestração de módulos/eventos | Nexus implementado | infraestrutura |

## O que NÃO foi feito

- nenhum banco cross-project criado;
- nenhuma tabela Mesh criada no Supabase;
- nenhum acesso direto entre bancos concedido;
- nenhum projeto declarado provider de outro sem contrato;
- nenhum MCP convertido automaticamente em capability Mesh.

## Próximo passo

Para cada capability candidata, localizar a implementação concreta e definir:

1. input mínimo;
2. output mínimo;
3. origem/proveniência;
4. autorização necessária;
5. versão do contrato;
6. consumidor real;
7. provider real.

A primeira capability que tiver consumidor + provider concretos será usada para desenhar o primeiro contrato Mesh vertical.

## Continuidade

Próximo ponto: `docs/ECOSYSTEM-DISCOVERY-ROUND-010.md` + `docs/ECOSYSTEM-CONTINUATION-STATE.md`.
