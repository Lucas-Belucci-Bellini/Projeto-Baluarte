# OpenClaw — Contrato de preflight server-side deny-by-default

**Versão:** `openclaw-server-policy/v1`
**Status:** contrato local aprovado para implementação
**Escopo:** classificação pura antes de qualquer chamada a upstream OpenClaw
**Autor:** Manus AI

## Objetivo

Criar uma barreira local e determinística para futuras chamadas server-side do OpenClaw. A função recebe somente uma observação de claims já produzida pelo servidor e um pedido bounded. Ela não faz rede, não lê secrets, não verifica JWT, não cria claims e não autoriza ação no estado atual.

> Observação de claims é evidência; não é autorização. O preflight deve permanecer `denied` enquanto não existir política server-side formal para o escopo OpenClaw.

## Entrada

O pedido contém `operation`, `messageCount`, `payloadBytes` e opcionalmente `hasToolCalls`. A operação permitida no contrato inicial é apenas `chat`. `messageCount` deve estar entre 1 e 32 e `payloadBytes` entre 1 e 256 KiB. Tool calls, actions, webhooks, venda, WhatsApp, notícias e uploads são sempre negados.

A claims observation deve ser o contrato `ServerClaimsObservation`. O preflight exige `identity.trustedSource`, `identity.authenticated`, `validity.fresh`, `subjectPresent`, `audienceMatched`, `decision: not-authorized` e `authority: not-authorized` como evidência de que ainda não existe autorização operacional. Como o catálogo atual não possui `openclaw:chat`, a decisão final é sempre `denied` com reason code `scope-missing` ou `authority-not-authorized`.

## Saída

```ts
interface OpenClawServerPolicyDecision {
  contractVersion: 'openclaw-server-policy/v1';
  decision: 'denied' | 'not-ready';
  operation: 'chat' | 'tool-call' | 'webhook' | 'external-action' | 'unknown';
  reasons: readonly OpenClawPolicyReason[];
  summary: {
    messageCount: number;
    payloadBytes: number;
    hasToolCalls: boolean;
  };
  authority: 'not-authorized';
  publicPromotionAllowed: false;
}
```

Os `reasons` são limitados a `claims-missing`, `claims-untrusted`, `claims-stale`, `subject-missing`, `audience-mismatch`, `scope-missing`, `authority-not-authorized`, `operation-not-allowed`, `message-count-invalid`, `payload-too-large`, `tool-calls-not-allowed` e `policy-not-configured`. A função não retorna subject, issuer, audience, token, mensagem, URL, segredo ou texto de erro externo.

## Regras de decisão

| Condição | Decisão | Reason |
|---|---|---|
| claims ausentes ou inválidas | `denied` | `claims-missing`, `claims-untrusted` ou `claims-stale` |
| `openclaw:chat` ausente | `not-ready` | `scope-missing` |
| authority diferente do contrato | `denied` | `authority-not-authorized` |
| operação não-chat | `denied` | `operation-not-allowed` |
| tool call presente | `denied` | `tool-calls-not-allowed` |
| contagem ou payload fora do limite | `denied` | reason bounded correspondente |
| todos os requisitos futuros presentes | `not-ready` | `policy-not-configured` |

Nenhuma combinação da entrada atual pode produzir `authorized` ou `allowed`. A existência de um scope futuro não deve ser suficiente sozinha: ainda seriam necessários contrato de Auth, auditoria, rate limit distribuído, secrets, origem, RLS quando aplicável e decisão explícita de rollout.

## Invariantes

`authority` deve ser sempre `not-authorized` e `publicPromotionAllowed` sempre `false`. A função deve ser pura, síncrona e livre de efeitos colaterais. Ela não deve importar `fetch`, `http`, SDK de OpenClaw, Supabase ou qualquer provider.

## Testes obrigatórios

A suíte deve cobrir claims ausentes, claims não confiáveis, claims expiradas, scopes atuais sem `openclaw:chat`, operação chat válida mas não configurada, tool calls, operações externas, payload grande, contagem inválida e redaction completa. Deve verificar que o resumo contém somente números/booleanos e que a decisão nunca é autorizada.

## Rollback

Remover o módulo, os testes e a documentação devolve o repositório ao estado anterior sem alteração de bridge harness, Auth, RLS, secrets ou serviços externos.

— **Manus AI**
