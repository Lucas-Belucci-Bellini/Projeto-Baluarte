# Ecosystem Discovery — Round 006

## Objetivo

Encontrar o primeiro fluxo real do Knowledge Mesh entre os seis projetos, sem criar uma integração artificial.

## Evidência encontrada no TaxForge

O TaxForge já possui MCP e um domínio que inclui cenários, fornecedores, contratos e Evidence. O estado atual documenta explicitamente que MCP existe, mas que o sistema multiagente completo ainda é futuro. O banco atual continua baseado em Drizzle + MySQL/TiDB; não há evidência de Supabase já integrado.

Fluxo de produto relevante:

```text
Dados da empresa
  -> validação
  -> premissas
  -> cenários D1/D2/D3
  -> evidências/confiança
  -> revisão humana
  -> decisão
```

## Consequência para o Mesh

TaxForge é o primeiro consumidor candidato forte, mas ainda não há provider confirmado para uma capability específica.

Não criar ainda:

- tabela de capability;
- tabela de requests;
- bridge de eventos;
- acesso cross-project ao banco;
- migração do TaxForge para Supabase.

## Próxima investigação

1. Inspecionar as ferramentas MCP reais do TaxForge.
2. Mapear cada ferramenta para uma capability candidata.
3. Comparar essas capabilities com ARK, AEGIS, Veritas, DailyPlanner e Baluarte.
4. Procurar o primeiro caso `consumer -> provider` que tenha implementação existente dos dois lados.
5. Somente então desenhar o contrato e a persistência necessária.

## Regra de continuidade

A fonte de verdade para a próxima conversa é este arquivo + `docs/ECOSYSTEM-CONTINUATION-STATE.md`.
