# Contrato de privacidade — `hxBeacon`

**Status:** contrato local, fail-closed, sem ativação de telemetry  
**Data:** 2026-08-26  
**Escopo:** fronteira do módulo `src/utils/hx-beacon.ts`  
**Risco:** egress de dados de dispositivo, IP/geolocalização e fingerprint  

## Decisão

`hxBeacon()` deve ser **opt-in explícito**. Uma chamada sem `{ consent: true }` retorna imediatamente e não pode ler fingerprint, `sessionStorage`, geolocalização, `fetch`, `navigator.sendBeacon`, referrer, rota, user agent, tela ou fuso horário.

O endpoint permanece fail-closed quando configurado como placeholder. Mesmo com `{ consent: true }`, o módulo não envia nada enquanto `CONFIG.ep === '__HX_ENDPOINT__'`. Não existe configuração por `localStorage`, query string, metadata editável pelo cliente ou variável pública que transforme o modo padrão em envio automático.

> O fato de o entrypoint agendar a função não é consentimento. Agendamento técnico e autorização para enviar dados são estados diferentes.

## Dados sob risco

Quando um endpoint real e consentimento explícito existirem em uma futura decisão separada, o payload atual poderia conter fingerprint derivado de sinais do navegador, user agent, idioma, resolução, fuso, referrer, rota, timestamp, IP e campos de geolocalização retornados por serviço externo. Esses dados não recebem classificação de produção por este contrato e não podem ser tratados como anônimos apenas por hashing parcial.

| Superfície | Comportamento neste slice |
|---|---|
| Consentimento ausente ou falso | retorna antes de qualquer leitura sensível |
| Consentimento explícito | pré-condição necessária, mas não suficiente |
| Endpoint placeholder | retorna sem rede, mesmo com consentimento |
| Endpoint real | continua fora de escopo; exigirá contrato de finalidade, retenção, base legal, destino, segurança e UI/fluxo de consentimento |
| Fingerprint | não é considerado anonimização garantida |
| IP/geolocalização | não é coletado no caminho default |
| `sendBeacon` | não é chamado no caminho default |
| Persistência | nenhuma nova persistência é adicionada |
| Supabase/Auth/RLS | não são envolvidos |

## Invariantes

1. O default não envia dados.
2. O default não acessa APIs sensíveis do navegador necessárias para compor o payload.
3. O default não chama o serviço `freeipapi.com`.
4. O default não grava a chave de deduplicação em `sessionStorage`.
5. O placeholder continua bloqueando a rede.
6. A função permanece best-effort e não lança erro para o chamador.
7. O entrypoint V1 continua preservado; o timer existente não é removido nem reinterpretado como consentimento.
8. Nenhuma UI, role local, claim ou parâmetro de URL concede consentimento.

## Fora de escopo

Este contrato não cria banner de cookies, sistema jurídico de consentimento, persistência de preferências, anonimização criptográfica, retenção, exportação, exclusão, registro de finalidade ou endpoint de produção. Também não autoriza a ativação do Apps Script, coleta de IP, envio de WhatsApp, analytics, publicidade ou compartilhamento externo.

Uma futura ativação exigirá uma decisão própria com finalidade, minimização, base legal, prazo de retenção, destino, segurança, revisão de terceiros e confirmação do operador. O contrato atual somente impede ativação silenciosa.

## Rollback

O rollback é a reversão do commit deste contrato, da assinatura opcional e dos testes. Como o comportamento atual com endpoint placeholder já não envia dados, a reversão não requer serviço externo nem alteração de storage remoto.

— **Manus AI**
