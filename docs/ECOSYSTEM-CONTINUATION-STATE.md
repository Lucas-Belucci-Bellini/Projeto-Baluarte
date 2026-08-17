# Baluarte — Ecosystem Continuation State

> Ponto oficial de retomada do trabalho entre conversas. Atualizar este arquivo sempre que uma etapa relevante do ecossistema for concluída.

## Objetivo

Manter no Projeto-Baluarte o estado mínimo necessário para retomar o trabalho do ecossistema sem depender da memória da conversa.

## Repositórios acompanhados

- `Lucas-Belucci-Bellini/taxforge`
- `Lucas-Belucci-Bellini/Ark-Initiative`
- `Lucas-Belucci-Bellini/DailyPlanner`
- `Lucas-Belucci-Bellini/AEGIS`
- `Lucas-Belucci-Bellini/Projeto-Baluarte`
- `Lucas-Belucci-Bellini/Veritas`

## Fonte de arquitetura

`docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`

Esse documento define a arquitetura conceitual, propriedade dos dados, capacidades opcionais, segurança e ordem geral de construção.

## Estado atual

### Fase A — documentação

- [x] mapa inicial do ecossistema
- [x] definição preliminar dos domínios de dados
- [x] regra de propriedade dos dados
- [x] regra de capacidades opcionais (incluindo Plano opcional no ARK)
- [x] princípio Project Knowledge Mesh
- [x] princípios de segurança e menor privilégio
- [ ] dicionário de dados detalhado por projeto
- [ ] contrato de identidade compartilhada
- [ ] contrato de organização/tenant
- [ ] contrato de referência externa
- [ ] contrato de eventos
- [ ] catálogo versionado de eventos
- [ ] matriz de permissões entre projetos
- [ ] topologia Supabase final

### Fase B — bancos por domínio

Ainda não iniciar a construção completa dos bancos até os contratos acima estarem suficientemente definidos.

Ordem inicial prevista:

1. TaxForge
2. ARK
3. AEGIS
4. Veritas
5. Baluarte
6. DailyPlanner somente quando houver necessidade real de sincronização

### Fase C — integração

Ainda pendente:

- identidade compartilhada;
- organizações;
- referências externas;
- eventos;
- notificações;
- integrações específicas por projeto.

## Próximo passo recomendado

**Construir o dicionário de dados detalhado dos seis projetos dentro do Baluarte, começando pelo TaxForge e avançando projeto por projeto.**

Para cada projeto registrar:

1. tabelas/entidades existentes;
2. entidades que precisam ser criadas;
3. campos e tipos relevantes;
4. relacionamentos;
5. dados sensíveis;
6. proprietário do dado;
7. retenção;
8. RLS/permissões;
9. eventos publicados;
10. referências externas aceitas;
11. dependências com outros projetos;
12. o que explicitamente NÃO deve ser compartilhado.

## Regra de retomada

Ao iniciar uma nova conversa sobre este ecossistema:

1. abrir este arquivo;
2. abrir `docs/ECOSYSTEM-KNOWLEDGE-MESH-MASTERPLAN.md`;
3. verificar o estado da Fase A/B/C;
4. identificar o primeiro item `[ ]` da ordem atual;
5. verificar o estado real dos seis repositórios antes de modificar qualquer coisa;
6. continuar a partir desse ponto;
7. atualizar este arquivo com o próximo ponto de retomada.

## Regra de segurança arquitetural

Nenhum banco deve ser ligado diretamente ao banco interno de outro projeto apenas para acelerar a implementação. A integração deve passar por contratos, referências, APIs/eventos e autorização explícita.

## Regra de projeto

Projetos podem possuir funcionalidades parecidas sem possuírem o mesmo modelo ou a mesma obrigatoriedade. O Baluarte coordena capacidades; cada projeto decide quais capacidades fazem sentido para seu domínio.

## Última instrução de trabalho

**Continuar a análise real dos seis repositórios e transformar o desenho conceitual em contratos concretos dentro do Baluarte antes de construir a topologia final dos Supabase.**

## Última atualização

2026-08-16
