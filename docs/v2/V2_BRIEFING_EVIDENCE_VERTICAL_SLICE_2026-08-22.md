# V2 Briefing → Evidence — contrato do vertical slice

**Status:** implementação local em validação antes da publicação.

**Base de código:** `main` após o relatório `755780ae`.

**Escopo:** conectar o módulo de Briefing ao Evidence Layer local, sem rede, sem banco remoto, sem autorização client-side e sem alterar a V1.

## Objetivo

Este marco fecha uma pequena parte do primeiro vertical slice da V2: um candidato de notícia normalizado pelo Briefing pode ser projetado como uma evidência local com fonte, URL, captura, confiança e status explícitos. O Briefing continua sendo um módulo de leitura e rascunho; a IA pode futuramente resumir ou classificar, mas não publica, envia ou executa ações externas.

O slice reutiliza `EvidenceStore` e `evidenceFromCatalog`. Não cria segundo Registry, Event Bus, Storage ou Permission Manager. A integração é feita por uma referência fraca declarada em `references.modules` e resolvida por `ctx.talvez('evidence', { versao: 1 })`. Quando a capacidade não está disponível, o Briefing continua funcionando como antes e declara `evidence: not-configured` no diagnóstico.

## Contrato de entrada

O método público continua sendo `briefing.api.ingest(rawItems)`. Cada item precisa possuir, após normalização, `source`, URL HTTP/HTTPS e `title`. Campos de publicação, captura, idioma, temas, resumo, confiança e status são bounded pelo contrato já existente do Briefing.

| Campo projetado | Regra |
|---|---|
| `moduleId` | Fixo em `briefing`. |
| `entityId` | ID estável do item normalizado. |
| `field` | Fixo em `article`. |
| `evidenceId` | `briefing:<item.id>`. |
| `source.uri` | URL original do item. |
| `source.title` | Título normalizado. |
| `source.publisher` | Fonte normalizada. |
| `source.revision` | `capturedAt` do item. |
| `confidence` | Confiança bounded entre 0 e 1. |
| `collector` | `briefing-ingest`. |

O valor da evidência contém somente título, fonte, URL, data de publicação e status. O evento de barramento não contém esse valor completo.

## Saída e observabilidade

O retorno do `ingest` preserva `ok`, `total` e `items` e acrescenta `evidenceLinked` e `evidenceErrors`. A ingestão é tolerante: uma falha ao anexar Evidence não descarta o candidato normalizado, mas incrementa `evidenceErrors` e mantém o módulo utilizável.

O `health()` do Briefing continua `ok: true` quando o módulo está ativo. Ele expõe apenas o estado categórico da ligação (`linked` ou `not-configured`) e contadores bounded de itens ligados e erros. Não expõe stack trace, payload bruto ou credenciais.

| Evento | Payload público |
|---|---|
| `briefing:atualizado` | `total`, `evidenceLinked`, `evidenceErrors` |
| `evidence:appended` | `id`, `moduleId`, `status` |
| `evidence:status-changed` | `id`, `moduleId`, `status` |

Os eventos `evidence:*` não incluem `statement`, URI, título, IP, token, subject ou metadata externa. Eles são observabilidade categórica, não autoridade de publicação ou de permissão.

## Deduplicação e idempotência local

O Briefing deduplica por URL e título antes de projetar novos registros. Itens que já existem na lista do módulo não são anexados novamente. A Evidence Layer mantém sua própria proteção contra ID duplicado. O ID derivado do item faz com que uma segunda ingestão do mesmo candidato seja no-op para Evidence.

## Fronteiras de segurança

O marco não adiciona coleta de rede. A permissão `NETWORK` declarada pelo Briefing continua sendo uma capacidade de módulo para uma futura ingestão controlada; este método recebe dados já fornecidos pelo operador ou por um coletor aprovado. Nenhuma decisão de `developer`, `admin` ou `owner` é feita no navegador. Nenhuma fonte externa é tratada como fato verificado automaticamente: a evidência começa em `pending` e conserva confiança e proveniência.

O slice não usa Supabase, RLS, migrations, DDL, Billing, OpenClaw, WhatsApp, publicação automática, envio de e-mail ou comandos de reprodução. Também não transforma Evidence em health operacional, autorização ou promoção pública.

## Testes e critérios de saída

O marco pode ser publicado somente após a suíte focal comprovar Registry/lifecycle, ingestão normalizada, deduplicação, ligação ao Evidence compartilhado, eventos bounded, status e dispose. Depois do commit, devem ser executados `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke`, `npm run caminho-critico` e o runner oficial.

## Rollback

O rollback é retornar ao commit anterior ao marco. Isso remove a ligação Briefing→Evidence e os eventos adicionais, mas preserva o Briefing anterior, o Evidence Layer existente e a V1. Nenhuma migration ou alteração externa é necessária para reverter.

## Referências

[1]: ../../v2/modules/briefing/module.js "Módulo Briefing V2"

[2]: ../../v2/modules/evidence/module.js "Módulo Evidence V2"

[3]: ../../v2/data/evidence.ts "Contrato canônico EvidenceStore"

[4]: ../../v2/data/catalog-evidence.ts "Adaptador catalog-evidence"

[5]: ../../docs/v2/V2_PROGRESS_REPORT_2026-08-22.md "Medição atual da construção V2"

## Checkpoint de publicação — 9c4a2bae

O contrato foi implementado e publicado diretamente na `main` no SHA `9c4a2bae189107aee3a6eafc596b87021b1e745e`. A validação final observou `npm test` em `1250/1250`, `tipos:ts` e `tipos:v2` aprovados, `v2:integracao` em `45/45`, smoke em `99/99`, caminho crítico em `15/15` e runner local com `21` gates verdes, Rust local `blocked-known` código 101 e nenhuma falha nova. Os workflows remotos aplicáveis terminaram verdes no SHA; o Supabase Preview permaneceu `unknown/external` por divergência de versões de migrations, sem alteração remota.

A primeira execução direta de `v2:integracao` foi contaminada por um preview Vite antigo ocupando a porta de teste e servindo a página pública no lugar do harness. Isso foi classificado como causa ambiental, o processo stale foi encerrado, o gate foi repetido em porta limpa com `45/45`, e o script recebeu cleanup bounded para evitar recorrência. Nenhum código do produto foi alterado para mascarar o incidente.

## Integração no fluxo real de módulos

Após a primeira publicação, a ligação foi movida do campo de contexto de teste para o contrato real entre módulos. O manifesto do Briefing declara `references.modules: ['evidence']` e, durante `init`, chama `ctx.talvez('evidence', { versao: 1 })`. Assim, o Registry torna a relação visível, o resolvedor aplica a regra de referência fraca e o Briefing degrada honestamente quando Evidence não está registrado ou não oferece a versão esperada.

O harness V2 agora registra seis módulos ativos: Cripto, Editor, Militar, Evidence, Briefing e Visor 3D. Evidence não possui rota ou entrada de navegação, portanto a superfície continua com 19 rotas e cinco itens navegáveis. A integração de navegador confirmou `46/46`, incluindo as seis sessões de Runtime e a observação visual de Evidence conectada, sem erro JavaScript e com o shell V1 preservado.
