# Module Registry — Auditoria do piloto operacional

**Status:** AUDIT COMPLETE — sem alteração de código nesta etapa
**Repositório:** `Lucas-Belucci-Bellini/Projeto-Baluarte`
**Branch:** `main`
**SHA auditado:** `7677c389afd0739579b99f14efecec4d52cec0a3`
**Data/hora UTC:** `2026-08-21T04:41:29Z`
**Escopo:** mapear Registry, Runtime Health, quarentena, fallback e claims antes de implementar a menor extensão segura.

## Resumo executivo

O Module Registry já possui as peças operacionais centrais. `v2/core/registry.ts` valida manifests, sela o conjunto, elimina duplicidades, dependências ausentes e ciclos, e expõe rotas, navegação, storage, permissões e eventos. `v2/core/module-runtime-health.js` mantém estados `unknown`, `healthy`, `failed` e `exhausted`, limita reinícios por janela e registra incidentes bounded. `v2/core/module-registry-health.js` traduz esses estados em `registered`, `healthy`, `degraded`, `quarantined`, `maintenance`, `disabled` e `unregistered`, além de exigir autorização server-side e auditoria para overrides operacionais.

A superfície visual e o harness já observam o Registry, mas não existe ainda uma função única e tipada que projete **estado do botão da página** e **acesso de revisão elevado** a partir de health + claims. Essa é a lacuna escolhida. O próximo piloto será um adapter read-only: módulos degradados, em quarentena, maintenance, disabled ou unregistered deixam o botão normal indisponível e preservam o fallback V1; uma revisão elevada só será indicada quando houver claims frescos, fonte server-validated e scope `module:read`. Mesmo nesse caso, a decisão continuará `not-authorized`, sem liberar rota, DOM, permissão ou promoção pública.

## Evidências

| Área | Estado observado | Fonte | Decisão |
|---|---|---|---|
| Registry estrutural | Implementado e selável | `v2/core/registry.ts` | Reutilizar |
| Runtime Health | Implementado com limites e incidentes | `v2/core/module-runtime-health.js` | Reutilizar |
| Quarantine/fallback | Implementado no adapter JS | `v2/core/module-registry-health.js` | Não duplicar |
| Alinhamento UI | Implementado como observação/promoção candidata | `src/layout/module-alignment.ts` | Compor, não substituir |
| Claims | Observação fresca e scopes fechados | `src/layout/server-claims-observation.ts` | Usar somente como evidência |
| Publicação | `publicPromotionAllowed: false` nos contratos atuais | `module-observation-visual.ts`, rollout | Preservar |
| Shell/router | V1 preservado; harness é prova | `v2/harness/main.js` e docs PHASE UI | Não alterar |

## Causa raiz versus efeito cascata

Não há falha nova identificada. O gap é contratual: health operacional e claims read-only existem em adapters separados, mas o estado de ação do usuário por módulo ainda não está consolidado numa projeção bounded. Sem essa projeção, uma UI futura poderia habilitar um botão por estabilidade, metadata ou role local, criando risco de autorização implícita.

Não é correto contar Registry, Runtime Health, Module Registry Health, Module Alignment e Claims como cinco problemas independentes. Eles são componentes existentes; o piloto trata apenas a fronteira de composição que falta.

## Limites obrigatórios

O piloto não altera `src/main.js`, `docs/nexus/dominios.json`, sidebar, shell, router, Auth, RLS, Supabase, Billing, Service Worker, release, JARVIS, OpenClaw ou PokeDesk. Não executa fallback operacional, reinício automático, mudança de modo, publicação pública ou concessão de permissão. Não interpreta `actorRole` de localStorage/query string e não transforma `decision: not-authorized` em autorização.

## Rollback

Antes da implementação deve ser criado um backup branch apontando para este SHA. O rollback será a reversão do commit local do adapter, testes e documentação. Nenhum serviço externo será necessário para desfazer o piloto.

— **Manus AI**

## Resultado do piloto local

A implementação adicionou `src/layout/module-operational-policy.ts`, um adapter puro e read-only. Ele projeta `button: enabled` somente para `mode=healthy` e `status=healthy`; todos os outros estados ficam `disabled`. Claims ausentes, stale, untrusted ou sem `module:read` nunca habilitam revisão elevada. Claims server-validated frescas com `module:read` produzem apenas `elevatedReview: review-only`, mantendo `authority: not-authorized`, `publicPromotionAllowed: false`, `normalUserAction: preserve-current-surface` e `fallback: v1-preserved`.

O harness V2 expõe `moduleOperationalPolicyPilot()` somente como superfície de prova. Nenhuma ação foi ligada à sidebar, ao shell V1, ao router ou a uma permissão real.

| Validação | Resultado |
|---|---:|
| Testes focais do adapter + health + claims | 22/22 |
| Regressão completa `npm test` | 1172/1172 |
| TypeScript strict | verde |
| TypeScript V2 | verde |
| Integração browser V2 | 45/45 |

O gate de integração recebeu duas asserções novas: módulo saudável sem claims permanece sem revisão elevada; scope `module:read` resulta somente em review-only observável. A quarentena e os overrides foram cobertos pelos testes do adapter JS existente e pelo novo contrato TypeScript, sem duplicação de supervisor.

## Arquivos do slice

| Arquivo | Papel |
|---|---|
| `src/layout/module-operational-policy.ts` | Projeção de botão, fallback e review-only |
| `v2/harness/main.js` | Exposição do piloto somente no harness |
| `scripts/v2-integracao.mjs` | Duas asserções do piloto; gate 45/45 |
| `test/module-operational-policy.test.js` | 6 testes do adapter e claims |
| `tsconfig.json` | Inclusão strict do adapter |
| `docs/v2/MODULE_REGISTRY_PILOT_AUDIT_2026-08-21.md` | Auditoria e evidência |
| `docs/v2/MODULE_REGISTRY_PILOT_CONTRACT_2026-08-21.md` | Contrato bounded antes da implementação |

## Limitações preservadas

O piloto **não** implementa acesso real de admin/dev/owner. Ele só reconhece o escopo `module:read` como evidência server-validated para uma revisão futura e continua sem autoridade. A integração de Auth/RLS/claims server-side, a aplicação visual do botão no shell e qualquer promoção pública seguem bloqueadas até os gates correspondentes.

— **Manus AI**

## Publicação e CI remoto

**Commit publicado:** `e8da0473f34e7039326e0f1e86a3fd6bf55ff5c0`

O piloto foi integrado diretamente na `main` após `fetch` e `merge --no-edit`, sem force push. O runner oficial local passou todos os gates executáveis: catálogo de eventos, Nexus, tipos, `npm test`, build, integração V2, smoke, caminho crítico, contratos Python, module visual, controlled rollout, RLS local, rate limit distribuído, doctor e Python compile. O Rust continuou em código 101 pelo bloqueio conhecido do Cargo 1.75.0 com metadata `edition2024`; esse estado não foi mascarado.

Os oito workflows remotos concluíram com sucesso para o SHA publicado: `Arma 3 Data CI`, `CI`, `CodeQL`, `Core CI`, `V2 Core`, `V2 Runtime`, `V2 Validation` e `Vigia das rotas`.

— **Manus AI**
