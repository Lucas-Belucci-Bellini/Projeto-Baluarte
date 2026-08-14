# Marco 1 V2 — JARVIS, OpenClaw e Briefing de Notícias

**Estado:** validado localmente; aguardando commit e CI remoto
**Escopo:** primeiro vertical slice orientado a leitura
**Objetivo:** reduzir o custo repetido do contexto do JARVIS, integrar o Gateway OpenClaw pelo contrato oficial atual e criar uma superfície V2 de briefing com proveniência.

## Decisão

O marco usa o endpoint `POST /v1/chat/completions` do Gateway OpenClaw quando disponível. A documentação atual também descreve WebSocket/RPC para controle de sessões, mas o projeto não inventa um método RPC de prompt. Quando o token do Gateway não puder ficar no navegador, o processo local `scripts/openclaw-bridge.mjs` encaminha somente chat completions e mantém a credencial fora do frontend.

O WhatsApp permanece sob responsabilidade do OpenClaw e não é acionado pelo primeiro marco. Não há rota de envio, escolha de destinatário ou publicação automática no bridge. Qualquer operação futura de envio exigirá política, idempotência, logs redigidos e confirmação explícita do operador.

## Componentes

| Componente | Responsabilidade | Falha esperada |
|---|---|---|
| `src/utils/jarvis-context.ts` | Cache do briefing completo/compacto e janela de histórico | O JARVIS continua respondendo sem cache ou com fallback |
| `src/utils/news-briefing.ts` | Tipos, normalização, deduplicação e prompt somente leitura | Item inválido vira candidato rejeitado |
| `src/pages/jarvis.js` | Modo `Briefing` e seleção de contexto compacto | Outros modos V1 permanecem independentes |
| `scripts/openclaw-bridge.mjs` | Proxy local protegido para `/v1/chat/completions` | Timeout/HTTP/CORS retornam erro sanitizado |
| `v2/modules/briefing/` | Manifesto, Data Layer mínimo, Evidence/proveniência e view experimental | Módulo pode ser recusado ou desligado sem derrubar o Core |
| `v2/harness/main.js` | Registro do módulo no harness V2 | Falha fica visível no selo/diagnóstico |

## Contratos do módulo V2

O manifesto `briefing` declara `NETWORK`, `briefing:items` e o evento `briefing:atualizado`. A API pública possui `health`, `prompt`, `ingest` e `list`. A ingestão aceita somente itens com fonte, URL HTTP(S) e título; cada item conserva URL, data de publicação/captura, idioma, temas, confiança e status `candidate`, `reviewed` ou `published`.

Declarar `NETWORK` não concede a permissão automaticamente. O módulo deve ser iniciado pelo ciclo V2 com Permission System injetado. A view é lazy e somente renderiza dados já normalizados; ela não acessa credenciais nem executa busca por conta própria.

## Critérios de segurança

O navegador não recebe `OPENCLAW_GATEWAY_TOKEN` ou `OPENCLAW_GATEWAY_PASSWORD`. O bridge escuta em loopback, restringe CORS, limita payload, aplica timeout e permite apenas health/chat. O primeiro marco não envia WhatsApp, não publica briefing, não altera campanha, não faz compra e não escreve em serviço externo.

## Validação executada

O teste focal `test/jarvis-first-slice.test.js` cobre cinco cenários: cache e variante compacta; limite de contexto; rejeição/deduplicação de notícia; bridge contra upstream fake com CORS; e registro/abrir/fechar do vertical slice V2.

O `npm run tipos:ts` permanece verde. O `npm run tipos:v2` retorna os 61 diagnósticos históricos nos 12 arquivos de Core já documentados e não apresenta diagnóstico novo em `v2/modules/briefing/`. A suíte completa passou em 876/876, o build passou, a integração V2 passou em 14/14, o smoke permaneceu em 98/98 e o caminho crítico passou em 15/15. O Runtime Rust foi tentado, mas o Cargo 1.75 disponível no sandbox rejeita o `Cargo.lock` versão 4; nenhum lockfile foi alterado, e a validação remota do Runtime continua sendo a referência até usar toolchain compatível.

## Rollback

A reversão é feita removendo a importação do modo `Briefing`, o registro do módulo no harness e os novos utilitários/bridge. O modo OpenClaw anterior continua compatível porque mantém `processOpenClaw()` e o endpoint configurável.

## Referências

- [Gateway OpenClaw](https://docs.openclaw.ai/gateway)
- [Gateway protocol](https://docs.openclaw.ai/gateway/protocol)
- [WebChat e métodos de sessão](https://docs.openclaw.ai/web/webchat)
- [`docs/OPENCLAW.md`](../../OPENCLAW.md)
- [`docs/ROADMAP_COMPLETO.md`](../../ROADMAP_COMPLETO.md)
