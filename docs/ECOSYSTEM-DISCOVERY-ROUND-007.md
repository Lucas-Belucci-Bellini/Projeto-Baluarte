# Ecosystem Discovery — Round 007

## Resultado

O TaxForge possui um MCP operacional (`mcp-server/src/server.ts`) com sete tools e três resources. As capacidades encontradas são principalmente operações de engenharia/validação do próprio repositório, não capacidades fiscais compartilháveis.

### Tools observadas

- `repository_audit`
- `roadmap_status`
- `coverage_report`
- `run_quality_gate` (execução protegida por `execute=true`)
- `run_e2e` (execução protegida por `execute=true`)
- `vercel_diagnose`
- `checkpoint_summary`

### Resources observados

- `taxforge://roadmap`
- `taxforge://coverage`
- `taxforge://vercel-audit`

### Conclusão

Essas capacidades não justificam, por si só, um primeiro fluxo TaxForge -> outro projeto. Elas são principalmente ferramentas de operação/qualidade do TaxForge.

As buscas nos repositórios Veritas, AEGIS, ARK e DailyPlanner não encontraram, nesta rodada, um MCP/Tool equivalente que possa ser tratado como provider externo confirmado.

Portanto, ainda NÃO criar uma integração cross-project.

## Próxima investigação

1. Mapear capabilities de domínio, não apenas ferramentas MCP.
2. Procurar interfaces existentes em ARK, AEGIS, Veritas e DailyPlanner que possam responder a uma necessidade concreta do TaxForge.
3. Se não existir provider real, escolher um segundo consumidor/produtor mais promissor antes de construir infraestrutura nova.
4. Manter Supabase fora da implementação até existir um contrato de integração real.

## Regra

`MCP tool != automaticamente capability do Knowledge Mesh`.

Uma capability do Mesh precisa ter domínio, contrato, autorização, provenance e um consumidor/provider concreto.
