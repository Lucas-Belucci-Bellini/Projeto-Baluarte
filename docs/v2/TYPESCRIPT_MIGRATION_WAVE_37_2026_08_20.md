# TYPESCRIPT MIGRATION — WAVE 37

**Data:** 2026-08-20
**Status:** `IMPLEMENTED / LOCALLY VALIDATED / READY FOR MAIN`
**Onda:** promoção do consumer TypeScript do adaptador Arma 3

## Contrato

A implementação canônica já estava em `src/utils/arma3-extracao.ts`, com o wrapper de compatibilidade `src/utils/arma3-extracao.js`. Esta onda promoveu apenas o painel TypeScript `src/pages/arma3-extracao-painel.ts` para importar a implementação canônica sem extensão:

```ts
import { statusExtracao, extrairArma3, entregarArma3 } from '../utils/arma3-extracao';
import type { Arma3DeliveryResult, Arma3Status } from '../utils/arma3-extracao';
```

O comportamento não foi reescrito. A ponte continua dependendo de `window.baluarte.native`, retorna fallback controlado na web, consulta `arma3:status`, executa `arma3:extrair` e entrega por `arma3:entregar`. O push continua opt-in por `empurrar = false`; a web não recebe acesso direto a filesystem, Git, logs locais ou tokens.

## Arquivos alterados

| Arquivo | Alteração |
|---|---|
| `src/pages/arma3-extracao-painel.ts` | Imports runtime e type-only promovidos para `../utils/arma3-extracao` |
| `docs/nexus/dominios.json` | `src/utils/arma3-extracao.ts` registrado no domínio `baluarte-arsenal` |
| `src/utils/arma3-extracao.js` | Mantido como wrapper para consumers JavaScript |
| `docs/v2/TYPESCRIPT_MIGRATION_WAVE_37_2026_08_20.md` | Este relatório |

O `src/main.js` não foi alterado; portanto não houve mudança de rotas nem divergência router↔Nexus.

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

O runtime remoto V2 continua sendo a referência para a limitação local; a toolchain remota já passou nas ondas anteriores. Nenhuma configuração Rust foi relaxada.

## Segurança e riscos

A promoção não amplia a superfície nativa. A ponte continua app-only, com `temPonte()` e mensagem explícita quando executada no navegador. O painel apenas orquestra o adaptador; não cria ponte, não expõe credencial e não envia push sem ação explícita.

O wrapper `.js` permanece necessário para consumers JavaScript. Removê-lo agora criaria risco de regressão para a superfície V1. A próxima auditoria deve mapear consumers restantes antes de eliminar wrappers.

## Rollback

O rollback é direto: restaurar os dois imports `.js` no painel e remover `src/utils/arma3-extracao.ts` do domínio `baluarte-arsenal` do Nexus. A implementação TypeScript e o wrapper não precisam ser apagados.

## Próximo passo

A próxima fronteira segura deve ser escolhida entre `geo-tracker.ts` e `arma3-extracao` consumers restantes, sempre mantendo os wrappers para JavaScript. `hx-beacon.ts` não foi promovido nesta onda porque seu único consumer relevante ainda é `src/main.js` e a implementação envia fingerprint, geolocalização e user-agent para endpoint externo; qualquer mudança exige auditoria de privacidade e alteração coordenada do entrypoint.
