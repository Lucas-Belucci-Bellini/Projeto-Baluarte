# Baluarte — TaxForge ↔ ARK Discovery v1

## Objetivo

Registrar a primeira análise de compatibilidade entre um consumidor potencial (TaxForge) e um provider potencial (ARK), sem declarar uma integração antes de existir necessidade e contrato comprovados.

## TaxForge: capacidade observada

O TaxForge possui uma API HTTP/Vercel e um MCP server. A camada MCP atual é voltada principalmente a auditoria/qualidade do próprio repositório: `repositoryAudit`, `roadmapStatus`, `coverageReport`, `runQualityGate`, `runE2E` e `vercelDiagnose`. Portanto, o MCP existente não é ainda um gateway de consumo de capabilities externas.

O domínio do produto, porém, possui áreas que lidam com risco de fornecedores, contratos, evidências, relatórios e dados empresariais. Isso torna investigação de risco operacional um candidato plausível, mas ainda não uma integração confirmada.

## ARK: capability observada

O ARK possui um feed público de hazards que normaliza dados GDACS e USGS, preservando source, source event id, coordenadas, tipo, nível de alerta, magnitude, timestamps e source URL. O snapshot usa cache e possui status por fonte.

Candidate capability:

`ark.hazards.public_snapshot`

Essa capability deve ser considerada somente para dados públicos/curados. A camada privada do ARCA não deve ser exposta pelo Mesh.

## Compatibilidade

### Hipótese

TaxForge poderia consultar inteligência pública de hazards para enriquecer uma investigação de continuidade operacional de uma região/fornecedor.

### Status

`CANDIDATE — NOT PROVEN`

Ainda não existe evidência suficiente no código atual para afirmar que uma tela ou workflow do TaxForge já exige essa consulta. Não implementar uma chamada cross-project nesta etapa.

## Payload mínimo proposto para futura validação

```json
{
  "region": {
    "countryCode": "BR",
    "latitude": -23.31,
    "longitude": -51.16,
    "radiusKm": 100
  },
  "hazardTypes": ["EQ", "FL", "WF", "VO", "DR"],
  "observedAfter": "2026-08-01T00:00:00Z"
}
```

Nenhum nome de empresa, fornecedor, contrato, receita, CNPJ ou outro dado empresarial deve atravessar esse boundary.

## Saída mínima futura

- normalized events
- source
- source event id
- hazard type
- alert level
- coordinates
- observedAt
- sourceUpdatedAt
- source URL
- freshness/cache status
- limitations

## Decisão

Não criar migration do Mesh e não alterar os bancos dos projetos ainda.

Próximo trabalho: verificar se existe no TaxForge um workflow real que possa consumir esse resultado. Se não existir, abandonar esta integração como POC e continuar o capability discovery com outros pares.

## Evidência técnica

- TaxForge: `mcp-server/src/operations.ts`
- TaxForge: `api/index.ts`
- ARK: `apps/arca-resilience/server/publicHazards.ts`

## Checkpoint

`TaxForge MCP audit → ARK public hazard capability → validar consumer real no TaxForge → somente então contrato cross-project.`
