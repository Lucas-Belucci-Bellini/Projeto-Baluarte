# Server Claims Observation Contract — 2026-08-20

## Resumo

Este marco adiciona uma projeção **somente leitura** para claims que, no futuro, poderão ser produzidas por uma autoridade server-side. O contrato `claims-observation/v1` observa presença de emissor, sujeito, audiência, autenticação, origem, escopos e frescor; ele nunca concede permissão, altera o Registry, executa ação ou transforma entrada do navegador em identidade confiável.

> Uma claim observada não é uma autorização concedida. O resultado deste marco permanece `decision: not-authorized` e `authority: not-authorized` em todos os caminhos.

## Fronteira de confiança

A função `observeServerClaims()` aceita um envelope tipado como entrada para permitir testes de contrato e futura integração de backend. O campo `source: server-validated` é apenas uma pré-condição declarativa nesta camada; ele não prova assinatura, sessão, identidade, RLS ou autenticidade quando fornecido pelo cliente. Por isso, uma implementação de produção ainda deverá chamar este contrato somente depois de validar o principal em uma fronteira server-side real.

| Camada | Responsabilidade | O que este marco faz |
|---|---|---|
| Entrada | Receber um envelope candidato de claims | Normaliza texto, lista, timestamps e escopos sem preservar payload sensível. |
| Identidade | Verificar emissor, sujeito, audiência, autenticação e origem declarada | Produz flags de observação; não cria uma sessão nem assina identidade. |
| Escopo | Comparar pedidos com catálogo conhecido | Aceita somente `platform:observe`, `registry:read` e `module:read`, e somente quando a identidade está fresca e consistente. |
| Validade | Verificar `issuedAt`, `expiresAt` e TTL máximo | Rejeita claims futuras, expiradas, invertidas ou com TTL acima de 60 segundos. |
| Autoridade | Produzir decisão operacional | Não produz `allow`; devolve sempre `not-authorized`. |

## Envelope de saída

```json
{
  "contractVersion": "claims-observation/v1",
  "source": "server-authority-projection",
  "identity": {
    "issuerPresent": true,
    "subjectPresent": true,
    "audienceMatched": true,
    "authenticated": true,
    "trustedSource": true
  },
  "scopes": {
    "requested": ["platform:observe", "module:read", "module:execute"],
    "accepted": ["platform:observe", "module:read"],
    "rejected": ["module:execute"]
  },
  "validity": {
    "issuedAt": 10000,
    "expiresAt": 20000,
    "ttlMs": 10000,
    "fresh": true
  },
  "requestIdPresent": true,
  "decision": "not-authorized",
  "authority": "not-authorized"
}
```

O catálogo local é deliberadamente mínimo e read-only. `module:execute` não é um escopo conhecido neste marco, e escopos desconhecidos são rejeitados mesmo quando o restante do envelope é consistente. A projeção não retorna `subject`, tokens, cookies, claims brutas ou metadados de ator.

## Regras de negação

A projeção zera `scopes.accepted` quando qualquer uma destas condições falha: emissor esperado ausente ou divergente, audiência divergente, sujeito ausente, `authenticated` diferente de `true`, origem diferente de `server-validated`, timestamps inválidos, janela futura, janela expirada ou TTL acima do máximo. A ausência de claims também produz uma observação válida do ponto de vista estrutural, mas negada por padrão.

Esta regra não deve ser confundida com o Permission Manager. O Permission Manager continua sendo a fonte das concessões efetivas dos módulos; este contrato somente prepara evidência de que uma futura autoridade poderia ser consultada. Ele não chama `conceder()`, `revogar()`, `definirModo()`, `podeAtivar()` ou qualquer método operacional do Registry.

## Implementação e testes

| Arquivo | Papel |
|---|---|
| `src/layout/server-claims-observation.ts` | Contrato de entrada, normalização, validade, catálogo de escopos e projeção negada. |
| `v2/harness/main.js` | Expõe `serverClaimsObservation()` ao harness para testes, sem criar Auth ou sessão. |
| `scripts/v2-integracao.mjs` | Verifica claims ausentes, claims válidas limitadas e claims com origem/frescor inválidos. |
| `test/server-claims-observation.test.js` | Cinco testes unitários de identidade, escopo, negação, TTL e deduplicação. |

```text
npx tsx --test test/server-claims-observation.test.js test/platform-observation-transport.test.js test/runtime-observation.test.js test/jarvis-mark-xiii-console.test.js → 20/20
npm run tipos:ts → passou
npm run tipos:v2 → passou
npm run v2:integracao → 39/39
```

## Segurança, risco e rollback

O risco principal é um consumidor interpretar `trustedSource: true` como assinatura válida. O documento e o campo `decision: not-authorized` deixam explícito que o valor somente representa a forma do envelope que uma fronteira server-side deverá produzir. O risco secundário é adicionar novos escopos sem revisão de least privilege; por isso o catálogo é fechado e qualquer escopo não enumerado é rejeitado.

O rollback remove `src/layout/server-claims-observation.ts`, o import e a exposição no harness, as três asserções correspondentes no gate, `test/server-claims-observation.test.js` e este documento. Nenhuma parte do Permission Manager ou do Registry deve ser revertida, pois não foi alterada.

O próximo marco de segurança deve ligar este contrato a uma fonte server-side real somente depois de definir Auth, RLS, assinatura ou sessão, origem permitida, auditoria, rotação, expiração, revogação e mapeamento formal de roles. Até lá, o contrato permanece prova local de negação por padrão.

## Registro

- Repositório: `Lucas-Belucci-Bellini/Projeto-Baluarte`.
- Branch de entrega: `main`.
- Base: `17aa3f7ee2ebf6c560f52fd66e49a20efe871ad7`.
- Commit de publicação: `9b5b5d0555610f4468e83b3d2751d8421b779868`.
- Autor padrão: Manus AI.
