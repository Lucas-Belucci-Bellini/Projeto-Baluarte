# Baluarte V2 — Evidence Map

> Registro verificável para transformar branches/commits em conhecimento arquitetural. Um nome de branch isolado nunca é tratado como autoridade.

## Escopo

Primeira amostra verificável da família V2, usando commits reais do `main` e seus diffs/relatos de verificação.

## Evidência 1 — Plataforma operacional / entrypoint

- Commit: `1f7d0ec679bdc2792ee34124f278b1f77b9f70d8`
- Área: `v2/harness` + integração da plataforma
- Evidência: `v2/harness/main.js` passou a usar `criarPlataforma`, em vez de dirigir `boot` diretamente.
- Funções observáveis: supervisor, saúde, lifecycle, estado de partida e parada.
- Verificação registrada no commit: tipos TS 0, tipos V2 0, build 0, 884/884 testes, integração V2 14/14.
- Classificação: **V2 Runtime / Platform orchestration**
- Confiança: **alta** — há alteração de código, teste e resultado de verificação registrados.

## Evidência 2 — Contrato Manifest → Registry → Permission → Runtime

- Commit: `9c3375df8f9fce65ab4277abc5326ecca18a7376`
- Área: cadeia de contratos da V2.
- Evidência: teste de contrato exercita as quatro peças reais, incluindo manifesto, registry, permissões e runtime-bootstrap.
- Funções observáveis: validação/normalização, teto de concessão, poda de permissões não declaradas, carga do registry e lifecycle.
- Verificação registrada: 893/893 testes, tipos TS 0, tipos V2 0.
- Classificação: **V2 Core / Contracts + Permissions + Runtime boundary**
- Confiança: **alta**.

## Evidência 3 — Typecheck e portão de integração

- Commit: `31e6512dfbcab80f6cf4b9f08ccb6a3efa01f2fb`
- Área: CI / V2 type safety.
- Evidência: `tipos:v2` foi levado de 61 erros a zero sem relaxar strict/checkJs/noImplicitAny; o portão de integração voltou a ser executado.
- Classificação: **V2 CI / Type safety**
- Confiança: **alta**.

## Evidência 4 — Catálogos de eventos e storage

- Commit: `5a19299ef0414f54ab4ea5facef2a7d34b15d2b8`
- Área: geração/verificação de catálogos.
- Evidência: geradores passaram a enxergar `.ts`, normalizar separadores e reconhecer chamadas tipadas; catálogos retornaram a 19 eventos em 8 namespaces e 72 chaves.
- Classificação: **V2 Data/Contracts tooling + CI**
- Confiança: **alta**.

## Evidência 5 — Handoff remoto

- Commit: `e8e4a515ca40b6198ff491c002b1d732f3e9b626`
- Área: processo de verificação remota.
- Evidência: documentação registra o que depende de Linux/CI e os bloqueios de verificações locais.
- Classificação: **Engineering workflow / Verification**
- Confiança: **alta**.

## Regra de interpretação

Uma branch só será ligada a um subsistema quando houver pelo menos uma evidência concreta entre:

1. diff/arquivos do commit;
2. documentação do subsistema;
3. testes que exercitam o comportamento;
4. workflow/CI relacionado;
5. linhagem explícita para outro commit/branch.

## Próxima expansão

1. mapear os commits mais recentes das famílias `v2/*` e seus arquivos;
2. separar Runtime, Core Contracts, CI, UI, Data e Integrations;
3. repetir o método para `claude/*`;
4. registrar confiança por mapeamento;
5. só então consolidar o mapa definitivo `branch → subsystem → docs → implementation → tests`.

## Limite atual

Este documento é um mapa de evidência, não uma lista completa das branches. Não marca branches como obsoletas e não autoriza exclusões.
