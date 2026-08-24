# Ecosystem Discovery — Round 004

**Data:** 2026-08-17
**Status:** descoberta, sem migração de banco nesta rodada

## Objetivo

Verificar se o contrato Nexus atual do Baluarte já oferece uma base segura para a futura Knowledge Mesh e identificar o primeiro caso real de consumo entre projetos.

## Descobertas

### 1. Nexus já possui uma fronteira de contrato

`src/nexus/orquestrador.js` compõe manifestos, valida major do contrato, dependências, ciclos, colisões de rotas e destaques. Falhas são detectadas antes da montagem do sistema.

### 2. Regra de isolamento já existe

`docs/NEXUS-CONTRATO.md` estabelece que um domínio não conhece outro domínio diretamente. Integração interna deve ocorrer pelo core/barramento/dados, e não por imports entre repositórios irmãos.

### 3. Isso é reutilizável para o futuro Mesh, mas não é o Mesh

O Nexus resolve composição de módulos do Baluarte. A Knowledge Mesh futura precisa resolver descoberta/autorização/consumo de capacidades entre projetos independentes. Não devemos misturar os dois contratos.

### 4. TaxForge tem um domínio de consumo potencialmente amplo

O TaxForge trabalha com cenários, premissas, evidências, fornecedores, contratos, margem, preço e capital de giro. Portanto pode ser um consumidor de capacidades externas, mas ainda não foi comprovada uma dependência que exija uma integração agora.

## Decisão

Não criar tabelas de Mesh nem APIs de cross-project nesta rodada.

Primeiro definir a fronteira:

`Nexus interno -> módulos Baluarte`

`Knowledge Mesh -> capacidades entre projetos`

## Próximo passo

Investigar os manifestos/contratos reais dos projetos candidatos, começando por Veritas e TaxForge, procurando uma capability que tenha:

1. provider implementado;
2. necessidade real do consumidor;
3. contrato mínimo claro;
4. autorização/proveniência definíveis;
5. benefício sem duplicar módulo.

Quando os cinco critérios forem satisfeitos, construir somente o primeiro fluxo vertical ponta a ponta.
