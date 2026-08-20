# Platform Observation Transport Contract — 2026-08-20

## Resumo

Este marco cria a primeira fronteira de transporte **read-only** para o diagnóstico `PlatformDiagnostic` da V2. O envelope `platform-observation/v1` permite que uma superfície futura receba um resumo observável com validade temporal, sem transportar o diagnóstico bruto, mensagens de erro, métricas detalhadas, catálogo/uso de APIs, permissões, decisões de permissão, atores, tokens ou comandos operacionais.

> O envelope descreve um retrato redigido. Ele não é um claim de identidade, não concede autorização, não executa fallback e não substitui Auth, RLS ou uma política server-side.

## Contrato

```json
{
  "contractVersion": "platform-observation/v1",
  "source": "v2-platform-diagnostic",
  "capturedAt": 1000000,
  "expiresAt": 1005000,
  "ttlMs": 5000,
  "observation": {
    "source": "v2-platform-diagnostic",
    "connection": "connected",
    "health": "healthy",
    "severity": "none",
    "fallback": "available",
    "authority": "not-authorized",
    "moduleCount": 5,
    "incidentCount": 0
  },
  "summary": {
    "moduleCount": 5,
    "healthyModuleCount": 5,
    "degradedModuleCount": 0,
    "failedModuleCount": 0,
    "incidentCount": 0
  },
  "redaction": {
    "applied": true,
    "fields": [
      "registry.incidentes[].error",
      "boot.falhas[].motivo",
      "boot.metricas",
      "boot.apis",
      "boot.usoDeApi",
      "boot.permissoes",
      "boot.decisoesDePermissao"
    ]
  },
  "authority": "not-authorized"
}
```

O TTL padrão é de cinco segundos e o máximo permitido pelo contrato é de sessenta segundos. Um envelope é válido somente quando `now >= capturedAt`, `now < expiresAt` e `expiresAt - capturedAt === ttlMs`. Não existe tolerância implícita para dados futuros ou expirados.

## Campos transportados e excluídos

| Grupo | Incluído | Motivo |
|---|---|---|
| Versão e origem | `contractVersion`, `source` | Permite identificar a versão e a origem sem inferir autoridade. |
| Validade | `capturedAt`, `expiresAt`, `ttlMs` | Impede tratar uma observação antiga como estado atual. |
| Observação | `connection`, `health`, `severity`, `fallback`, `authority`, contagens | Projeta o contrato compartilhado já usado pelo Mark XIII. |
| Resumo | total de módulos, saudáveis, degradados, falhos e incidentes adversos | Permite telemetria mínima sem expor o Registry bruto. |
| Redaction | `applied: true` e lista de campos omitidos | Torna a ausência de dados sensíveis auditável. |
| Excluído | `PlatformDiagnostic.boot`, `registry`, mensagens de erro, métricas, APIs, permissões e decisões | Evita stack traces, segredos, detalhes operacionais, atores e trilhas de autorização no transporte público. |

A lista redigida é declarativa e não deve ser interpretada como prova de que o envelope possui autoridade. O resumo conta registros `healthy` do Registry como estado normal; somente incidentes adversos entram em `incidentCount`, preservando a regra já estabelecida no adaptador de Runtime Observation.

## Implementação

| Arquivo | Papel |
|---|---|
| `src/layout/platform-observation-transport.ts` | Cria, congela, valida TTL e serializa o envelope. |
| `v2/harness/main.js` | Expõe `platformRuntimeObservationEnvelope()` ao harness ao lado da observação existente. |
| `scripts/v2-integracao.mjs` | Verifica origem, redaction, resumo, TTL e ausência de comandos em duas novas asserções. |
| `test/platform-observation-transport.test.js` | Testa redaction, imutabilidade, validade, expiração, rejeição de TTL e serialização. |
| `docs/v2/PLATFORM_OBSERVATION_TRANSPORT_CONTRACT_2026-08-20.md` | Registra o contrato, limites, risco e rollback. |

O harness é uma prova de contrato, não uma publicação pública do diagnóstico. A exposição em `window.__v2` continua restrita ao banco de prova e não substitui a sidebar, o router V1, o Event Bus ou a autoridade server-side.

## Segurança e governança

O transporte não aceita comandos, não contém métodos de execução, não inclui campos `execute` ou `grant`, não carrega identificadores de atores e não envia mensagens brutas de falha. A autoridade permanece literal e imutável em `not-authorized`. A função apenas observa e resume; qualquer decisão de disponibilidade, disable, maintenance, quarantine, restart ou promoção continua fora do cliente e exige uma futura camada autenticada.

O contrato ainda não implementa Auth, RLS, assinatura, nonce, controle de origem, armazenamento persistente, retenção, auditoria de consumidor ou proteção contra replay além da janela temporal curta. Portanto, não deve ser tratado como endpoint de produção. O próximo marco de segurança deverá definir identidade, claims, redaction server-side, assinatura ou sessão, política de origem, auditoria e RLS antes de transportar esse envelope para fora do harness.

## Testes

```text
npx tsx --test test/platform-observation-transport.test.js test/runtime-observation.test.js test/jarvis-mark-xiii-console.test.js → 14/14
npm run tipos:ts → passou
npm run tipos:v2 → passou
npm run v2:integracao → 35/35
```

Antes do push, a sequência completa também deve passar: catálogo de eventos, Nexus, `npm test`, build, smoke e caminho crítico. O gate local `v2:runtime` continua sujeito à limitação conhecida do Cargo 1.75.0 com dependência que declara metadados `edition2024`; essa limitação não é mascarada.

## Riscos e rollback

O risco principal é alguém tratar o envelope redigido como autorização ou como retrato permanente. TTL curto, `authority: not-authorized`, redaction explícita e testes de expiração reduzem esse risco, mas não o eliminam. Outro risco é uma nova propriedade sensível ser adicionada ao `PlatformDiagnostic` sem atualização da lista de exclusão; por isso o transporte não espalha o diagnóstico original e publica somente um resumo construído campo a campo.

O rollback consiste em remover `platform-observation-transport.ts`, o import/export do harness, as duas asserções do gate e `test/platform-observation-transport.test.js`. O adaptador `projectPlatformDiagnostic()` e a observação existente do Mark XIII devem permanecer, pois pertencem ao contrato anterior e não dependem do novo transporte.

## Registro

- Repositório: `Lucas-Belucci-Bellini/Projeto-Baluarte`.
- Branch de entrega: `main`.
- Base: `8e0d654fbac8cb580e245d88da312f32ead1b63c`.
- Commit de publicação: será registrado após o commit e a CI.
- Autor padrão: Manus AI.
