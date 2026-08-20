# Platform Observation Transport Contract — 2026-08-20

## Resumo

Este marco cria a primeira fronteira de transporte **read-only** para o diagnóstico `PlatformDiagnostic` da V2. O envelope `platform-observation/v1` permite que uma superfície futura receba um resumo observável com validade temporal, sem transportar o diagnóstico bruto, mensagens de erro, métricas detalhadas, catálogo/uso de APIs, permissões, decisões de permissão, atores, tokens ou comandos operacionais.

> O envelope descreve um retrato redigido. Ele não é um claim de identidade, não concede autorização, não executa fallback e não substitui Auth, RLS ou uma política server-side.

## Contrato

```json
{
  "contractVersion": "platform-observation/v1",
  "origin": "v2-harness",
  "source": "v2-platform-diagnostic",
  "nonce": "nonce-transport-example-01",
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
  "integrity": {
    "algorithm": "SHA-256",
    "status": "sealed",
    "digest": "<64 hex characters>"
  },
  "authority": "not-authorized"
}
```

O TTL padrão é de cinco segundos e o máximo permitido pelo contrato é de sessenta segundos. Um envelope é válido somente quando `now >= capturedAt`, `now < expiresAt` e `expiresAt - capturedAt === ttlMs`. Não existe tolerância implícita para dados futuros ou expirados.

## Campos transportados e excluídos

| Grupo | Incluído | Motivo |
|---|---|---|
| Versão e origem | `contractVersion`, `origin`, `source` | Permite identificar versão e origem declarada sem inferir autoridade. A origem atual é fixa em `v2-harness`. |
| Validade e replay | `capturedAt`, `expiresAt`, `ttlMs`, `nonce` | Impede tratar uma observação antiga, futura ou repetida fora da janela como estado atual. |
| Observação | `connection`, `health`, `severity`, `fallback`, `authority`, contagens | Projeta o contrato compartilhado já usado pelo Mark XIII. |
| Resumo | total de módulos, saudáveis, degradados, falhos e incidentes adversos | Permite telemetria mínima sem expor o Registry bruto. |
| Redaction e integridade | `applied: true`, lista de campos omitidos e `integrity` | Torna a ausência de dados sensíveis auditável e permite detectar tampering do payload canônico. |
| Excluído | `PlatformDiagnostic.boot`, `registry`, mensagens de erro, métricas, APIs, permissões e decisões | Evita stack traces, segredos, detalhes operacionais, atores e trilhas de autorização no transporte público. |

A lista redigida é declarativa e não deve ser interpretada como prova de que o envelope possui autoridade. O resumo conta registros `healthy` do Registry como estado normal; somente incidentes adversos entram em `incidentCount`, preservando a regra já estabelecida no adaptador de Runtime Observation.

## Implementação

| Arquivo | Papel |
|---|---|
| `src/layout/platform-observation-transport.ts` | Cria, congela, valida TTL/nonce, sela com SHA-256, verifica frescor/origem/digest e serializa o envelope. |
| `v2/harness/main.js` | Expõe `platformRuntimeObservationEnvelope()` ao harness ao lado da observação existente. |
| `scripts/v2-integracao.mjs` | Verifica origem, redaction, resumo, nonce, TTL, digest SHA-256 e ausência de comandos em três novas asserções. |
| `test/platform-observation-transport.test.js` | Testa redaction, imutabilidade, origem, nonce, validade, expiração, digest, tampering, replay e serialização. |
| `docs/v2/PLATFORM_OBSERVATION_TRANSPORT_CONTRACT_2026-08-20.md` | Registra o contrato, limites, risco e rollback. |

O harness é uma prova de contrato, não uma publicação pública do diagnóstico. A exposição em `window.__v2` continua restrita ao banco de prova e não substitui a sidebar, o router V1, o Event Bus ou a autoridade server-side.

## Segurança e governança

O transporte não aceita comandos, não contém métodos de execução, não inclui campos `execute` ou `grant`, não carrega identificadores de atores e não envia mensagens brutas de falha. A autoridade permanece literal e imutável em `not-authorized`. O nonce e o digest detectam repetição fora do TTL e alteração do payload, mas não provam identidade de servidor nem autorização. A função apenas observa e resume; qualquer decisão de disponibilidade, disable, maintenance, quarantine, restart ou promoção continua fora do cliente e exige uma futura camada autenticada.

O contrato agora possui integridade local verificável por SHA-256 e origem declarativa fixa do harness. Ele ainda não implementa Auth, RLS, assinatura assimétrica, controle de origem server-side, armazenamento persistente, retenção ou auditoria de consumidor. Portanto, não deve ser tratado como endpoint de produção. O próximo marco de segurança deverá definir identidade, claims, redaction server-side, assinatura ou sessão, política de origem, auditoria e RLS antes de transportar esse envelope para fora do harness.

## Testes

```text
npx tsx --test test/platform-observation-transport.test.js test/runtime-observation.test.js test/jarvis-mark-xiii-console.test.js → 15/15
npm run tipos:ts → passou
npm run tipos:v2 → passou
npm run v2:integracao → 36/36
```

Antes do push, a sequência completa também deve passar: catálogo de eventos, Nexus, `npm test`, build, smoke e caminho crítico. O gate local `v2:runtime` continua sujeito à limitação conhecida do Cargo 1.75.0 com dependência que declara metadados `edition2024`; essa limitação não é mascarada.

## Riscos e rollback

O risco principal é alguém tratar o envelope redigido como autorização ou como retrato permanente. TTL curto, nonce, digest, origem fixa, `authority: not-authorized`, redaction explícita e testes de expiração/tampering reduzem esse risco, mas não o eliminam. O SHA-256 aqui é detector de alteração, não assinatura de autoridade. Outro risco é uma nova propriedade sensível ser adicionada ao `PlatformDiagnostic` sem atualização da lista de exclusão; por isso o transporte não espalha o diagnóstico original e publica somente um resumo construído campo a campo.

O rollback consiste em remover `platform-observation-transport.ts`, o import/export do harness, as duas asserções do gate e `test/platform-observation-transport.test.js`. O adaptador `projectPlatformDiagnostic()` e a observação existente do Mark XIII devem permanecer, pois pertencem ao contrato anterior e não dependem do novo transporte.

## Registro

- Repositório: `Lucas-Belucci-Bellini/Projeto-Baluarte`.
- Branch de entrega: `main`.
- Base: `8e0d654fbac8cb580e245d88da312f32ead1b63c`.
- Commit de implementação: `f8614de2474258fd09ddd845da68c54b450226e4`.
- Commit de integridade: será registrado após a publicação e a CI.
- Autor padrão: Manus AI.
