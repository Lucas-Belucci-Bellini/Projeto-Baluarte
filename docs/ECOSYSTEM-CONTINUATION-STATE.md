# Baluarte — Ecosystem Continuation State

> Ponto oficial de retomada entre conversas. Atualizar sempre que uma etapa relevante for concluída.

## Objetivo

Manter no Projeto-Baluarte o estado mínimo necessário para retomar o trabalho do ecossistema sem depender da memória da conversa.

## Repositórios acompanhados

- `Lucas-Belucci-Bellini/taxforge`
- `Lucas-Belucci-Bellini/Ark-Initiative`
- `Lucas-Belucci-Bellini/DailyPlanner`
- `Lucas-Belucci-Bellini/AEGIS`
- `Lucas-Belucci-Bellini/Projeto-Baluarte`
- `Lucas-Belucci-Bellini/Veritas`

## Estado atual — mesh

A arquitetura alvo é uma rede de capacidades coordenada pelo Baluarte, não um banco SQL compartilhado. O primeiro proof-of-concept ainda não foi escolhido: a validação de `TaxForge -> Baluarte -> Veritas` não encontrou consumidor concreto para as capabilities de lógica atualmente verificadas no Veritas.

### Trabalho concluído

- [x] Capability / Knowledge Request / Result contracts
- [x] provider discovery, fallback e authorization boundary
- [x] external references e provenance/evidence
- [x] event envelope inicial e failure states
- [x] Identity & Tenant Contract v1
- [x] auditoria do modelo real de identidade/tenant no Supabase
- [x] confirmação de que `auth.users`, `tenants` e `tenant_members` devem ser reutilizados
- [x] confirmação de que não devemos criar `mesh_users` ou `mesh_tenants`
- [x] RPC body audit
- [x] EXECUTE grants audit das RPCs selecionadas
- [x] RLS audit inicial de `tenants`, `tenant_members`, `juris_doutrina` e Veritas collaborators
- [x] decisão de manter autorização de domínio separada de capability do mesh
- [x] Veritas provider inventory: MCP capabilities verificadas
- [x] validação negativa inicial no TaxForge: nenhuma evidência encontrada de consumo de Boolean evaluation/truth tables/simplification
- [x] discovery inicial nos seis projetos: não criar capability artificial apenas para demonstrar o mesh

## Veritas provider status

Veritas possui capabilities verificadas no MCP, incluindo:

- `veritas.logic.evaluate`
- `veritas.logic.truth_table`
- `veritas.logic.simplify`
- `veritas.logic.karnaugh`
- `veritas.circuit.simulate`

A inspeção atual do TaxForge não encontrou necessidade concreta para essas operações. O AEGIS também se apresenta como agente de investigação/reparo de software, mas o repositório não estabelece ainda uma interface de capability pronta para consumo externo. Portanto, nenhum desses dois deve ser colocado no registry de produção ainda.

## DailyPlanner status

O DailyPlanner continua deliberadamente client-side, com `localStorage`, sem login, backend ou sincronização entre dispositivos. O README recomenda backend/PostgreSQL somente quando houver necessidade multiusuário, sincronização ou lembretes confiáveis. Portanto, não criar Supabase apenas para o mesh agora.

## ARK status

O ARK possui um domínio de hazards/evidências públicas e uma camada privada ARCA. A fronteira pública/privada deve ser preservada. O mapeamento para Supabase e o capability contract ainda precisam ser reconciliados com o estado real da branch/main antes de qualquer migration.

## AEGIS status

AEGIS define um fluxo forte de investigação: observe → entenda → investigue → prove → corrija → teste → verifique → documente. Isso é uma capability arquitetural promissora para o ecossistema, mas o repositório atual é essencialmente a especificação/prompt do agente e não comprova ainda um provider API/MCP estável para outros projetos.

## TaxForge status

TaxForge é o principal consumidor candidato por seu domínio de cenários, evidências, fornecedores, contratos e decisões. A investigação deve procurar uma necessidade que já exista no produto antes de introduzir uma integração externa.

## Próximo passo EXATO

**Continuar capability discovery orientado por necessidade real, mas agora procurar interfaces já existentes e fluxos que possam virar provider/consumer sem inventar dependências.**

Ordem:

1. mapear no TaxForge módulos/serviços que pedem conhecimento ou processamento externo;
2. mapear no ARK capacidades que naturalmente poderiam ser consumidas por outro projeto (sem atravessar a fronteira pública/privada);
3. mapear no AEGIS pontos que poderiam ser expostos como investigação sob contrato, caso exista implementação real além do prompt;
4. mapear no Baluarte serviços já existentes que possam virar primitivas de plataforma;
5. manter DailyPlanner sem banco enquanto o requisito continuar client-side;
6. escolher o primeiro par somente quando houver consumidor + provider + interface real;
7. identificar exatamente os dados e autorização necessários;
8. definir o menor payload e provenance;
9. só então desenhar registry/requests/results para o caso concreto;
10. só depois propor migration não destrutiva no Supabase.

## Regras permanentes

- O Baluarte é o control plane/gateway arquitetural do mesh, mas não é dono dos domínios internos dos projetos.
- Nenhum projeto recebe SQL irrestrito no banco interno de outro projeto.
- Uma capability é publicada como contrato; sua implementação permanece privada.
- Identidade e tenant são avaliados antes da execução de uma capability.
- Fallback entre provedores é autorizado e limitado; não pode virar fan-out recursivo sem controle.
- Proveniência e confiança acompanham resultados que influenciam decisões relevantes.
- Funcionalidades semelhantes não precisam ser idênticas; Plan é opcional onde não fizer sentido.
- A topologia interna é documentação de engenharia privada; segurança real depende de autenticação, autorização, RLS, mínimo privilégio e auditoria.
- Não criar dependências artificiais entre projetos apenas para demonstrar o Mesh.

## Como retomar

Abrir primeiro este arquivo e depois:

- `docs/ECOSYSTEM-INTELLIGENCE-MESH.md`
- `docs/ECOSYSTEM-MESH-SCHEMA-NEXT.md`
- `docs/ECOSYSTEM-MESH-CONTRACTS-V1.md` na branch `docs/ecosystem-mesh-contracts-v1`
- `docs/ECOSYSTEM-VERITAS-PROVIDER-CONTRACT-V1.md`
- `docs/SUPABASE-IDENTITY-TENANT-AUDIT.md`
- `docs/SUPABASE-RPC-BODY-AUDIT-V1.md`
- `docs/SUPABASE-RLS-GRANTS-AUDIT-V1.md`

Depois verificar o estado real dos seis repositórios e do Supabase e continuar pelo **Próximo passo EXATO**.

## Última atualização

2026-08-17
