# Baluarte — Ecosystem Continuation — 2026-08-17

> Checkpoint permanente para retomar o trabalho do Ecosystem Intelligence Mesh em outra conversa.

## Repositórios acompanhados

- Lucas-Belucci-Bellini/taxforge
- Lucas-Belucci-Bellini/Ark-Initiative
- Lucas-Belucci-Bellini/DailyPlanner
- Lucas-Belucci-Bellini/AEGIS
- Lucas-Belucci-Bellini/Projeto-Baluarte
- Lucas-Belucci-Bellini/Veritas

## O que foi verificado nesta rodada

### DailyPlanner

O estado atual é deliberadamente client-side. A persistência é `localStorage`, há exportação/importação JSON e não existe login, backend ou sincronização entre dispositivos. O próprio README diz que PostgreSQL/autenticação é evolução futura somente se houver necessidade multiusuário ou sincronização.

Conclusão para o Mesh: **DailyPlanner não é consumer/provider de produção neste momento**. Não adicionar Supabase apenas para criar uma integração artificial.

### AEGIS

O repositório atual contém principalmente o prompt/especificação da IA AEGIS. A missão é investigar, diagnosticar, corrigir, testar, verificar e documentar problemas de engenharia. Não foi encontrada uma implementação de backend/capability concreta suficiente para publicar uma capability do AEGIS no registry.

Conclusão para o Mesh: **AEGIS é candidato futuro a provider de investigação/validação, mas ainda não deve ser registrado como capability executável**.

### TaxForge

O documento `TAXFORGE_ESTADO_ATUAL_E_PLANO.md` confirma frontend React/TypeScript, backend Express/tRPC, Drizzle com MySQL/TiDB, simulador IBS/CBS, cenários, produtos/fornecedores/contratos, evidências e MCP. O Supabase ainda não está integrado no código analisado.

O domínio empresarial e o Supplier Risk podem futuramente consumir inteligência externa, mas não existe ainda evidência suficiente para declarar um consumer ARK como integração implementada.

### ARK

ARK possui domínio público de hazards/evidências e uma camada privada ARCA. A fronteira público/privado deve ser preservada. Capabilities candidatas continuam sendo `ark.hazards.public_snapshot`, `ark.hazards.assess` e `ark.evidence.search`, mas ainda não devem ser tratadas como integração de produção sem contrato e autorização validados.

### Veritas

Capabilities MCP verificadas incluem `veritas.logic.evaluate`, `veritas.logic.truth_table`, `veritas.logic.simplify`, `veritas.logic.karnaugh` e `veritas.circuit.simulate`. A inspeção do TaxForge não encontrou consumidor concreto para lógica/circuitos. Portanto, não fabricar integração TaxForge→Veritas.

## Decisão desta rodada

Não existe ainda um primeiro par cross-project suficientemente comprovado para implementar em produção.

Isso é um resultado positivo: evita criar dependências artificiais somente para demonstrar o Mesh.

## Próximo passo EXATO

1. Continuar capability discovery orientado por necessidade real nos seis repositórios.
2. Priorizar capacidades já implementadas e com consumidor evidente.
3. Para cada candidato, identificar implementação, ownership, autorização, RLS e payload mínimo.
4. Escolher o primeiro par somente quando houver necessidade concreta.
5. Definir contrato versionado e provenance/evidence.
6. Só depois desenhar registry/request/result tables.
7. Só depois propor migration não destrutiva no Supabase.

## Regras permanentes

- Baluarte é control plane/gateway arquitetural, não dono dos dados internos dos projetos.
- Não compartilhar SQL irrestrito entre projetos por padrão.
- Capability é contrato; implementação permanece no projeto provider.
- Identidade, tenant e autorização são avaliados antes da execução.
- Dados privados não atravessam o Mesh sem autorização explícita e necessidade legítima.
- Proveniência acompanha resultados relevantes.
- Funcionalidades parecidas não precisam ser obrigatórias ou idênticas em todos os projetos.
- Não criar integrações artificiais.

## Arquivos-base para retomada

- `docs/ECOSYSTEM-CONTINUATION-STATE.md`
- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-NEXT.md`
- `docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`

## Ponto de retomada

**Capability discovery → primeiro par real → contrato → autorização → provenance → registry → Supabase.**
