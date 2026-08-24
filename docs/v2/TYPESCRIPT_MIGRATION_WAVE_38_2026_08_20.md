# TYPESCRIPT MIGRATION — WAVE 38

**Data:** 2026-08-20
**Status:** `IMPLEMENTED / LOCALLY VALIDATED / READY FOR MAIN`
**Onda:** promoção do consumer TypeScript do GeoPulse

## Contrato

A implementação canônica já estava em `src/utils/geo-tracker.ts`, com o wrapper de compatibilidade `src/utils/geo-tracker.js`. Esta onda promoveu a página TypeScript `src/pages/geopulse.ts` para importar diretamente a implementação canônica:

```ts
import { createGeoTracker } from '../utils/geo-tracker';
import type { GeoPoint, GeoTracker } from '../utils/geo-tracker';
```

O comportamento foi preservado. O GeoPulse continua usando a Geolocation API somente depois da ação explícita do usuário, persiste a trilha localmente pela chave `geo:track`, limita o histórico a 5.000 pontos, calcula Haversine, distância, duração e velocidade, e interrompe o watcher no lifecycle da página.

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/pages/geopulse.ts` | Imports runtime e type-only promovidos para `../utils/geo-tracker` |
| `docs/nexus/dominios.json` | `src/utils/geo-tracker.ts` registrado no domínio `baluarte-data` |
| `src/utils/geo-tracker.js` | Mantido como wrapper para consumers JavaScript |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_38_2026_08_20.md` | Este relatório |

O `src/main.js` não foi alterado; nenhuma rota foi adicionada, removida ou renomeada.

## Privacidade e segurança

O GeoPulse não envia a trilha para backend, endpoint externo ou Supabase. A posição fica no `localStorage` do navegador e só é coletada após a interação que inicia o tracker. A página informa que a função precisa da permissão de localização. O método `stop()` é registrado no lifecycle para liberar o watcher, e `clear()` remove a trilha persistida.

A promoção foi somente de fronteira de módulo. Não houve mudança de política de permissão, retenção, payload, rede ou persistência.

## Validação local

| Gate | Resultado |
|---|---|
| `git diff --check` | Verde |
| JSON do Nexus | Válido |
| `npm run verificar-nexus` | Verde: 99 rotas, 0 lacunas, 21/21 domínios |
| `npm run tipos:ts` | Verde |
| `npm run tipos:v2` | Verde |
| Contratos Supabase | 11/11 verdes |
| `npm test` | Verde |
| `npm run build` | Verde; apenas warnings conhecidos de chunks grandes |
| `npm run v2:integracao` | 21/21 |
| `npm run smoke` | 99/99 rotas verdes |
| `npm run caminho-critico` | 15/15 |
| `npm run v2:runtime` | Exit 101 conhecido: Cargo 1.75.0 não aceita metadata `edition2024` |

Nenhuma configuração foi relaxada para contornar a limitação Rust. O erro local é documentado e separado dos gates web que passaram.

## Rollback

O rollback é direto: restaurar os dois imports `.js` em `src/pages/geopulse.ts` e remover `src/utils/geo-tracker.ts` do domínio `baluarte-data` no Nexus. A implementação TypeScript e o wrapper podem permanecer no repositório para os próximos consumers.

## Próximo passo

Após esta onda, `hx-beacon.ts` continua deliberadamente bloqueado para uma auditoria específica de privacidade, pois seu consumer principal ainda é `src/main.js` e seu contrato envolve fingerprint, geolocalização por serviço externo e `sendBeacon`. A próxima promoção deve priorizar somente consumers TypeScript que não ampliem a superfície de telemetria ou rede.
