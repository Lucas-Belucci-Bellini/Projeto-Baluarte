# Contrato — metadados do Event Bus através do contexto de módulo

**Data:** 2026-08-27  
**Fase:** 03 — Event Bus e API Contracts  
**Status:** slice local/read-only em validação  
**Implementação:** [`../../v2/core/contexto.js`](../../v2/core/contexto.js)  
**Teste focal:** [`../../test/v2/contexto.test.js`](../../test/v2/contexto.test.js)

## 1. Lacuna observada

O Event Bus V2 já aceitava os campos `versao`, `contexto`, `correlacao` e `causa` no envelope. O contexto entregue aos módulos, entretanto, expunha `ctx.bus.emit(evento, payload)` e encaminhava somente `{ origem: id }`. Portanto, um módulo que precisasse continuar uma correlação após uma fronteira assíncrona ou carimbar a versão do payload não conseguia usar a capacidade que o bus já declarava.

A correção é uma ponte limitada. Ela não cria outro barramento, não altera o bus V1, não altera o catálogo do Registry e não inventa um schema de payload ou uma política de compatibilidade.

## 2. Contrato implementado

A assinatura do contexto passa a aceitar:

```text
ctx.bus.emit(evento, payload?, {
  versao?,
  contexto?,
  correlacao?,
  causa?,
  origem? // ignorada; a origem autoritativa é o manifesto/contexto
})
```

| Campo | Tratamento | Motivo |
|---|---|---|
| `versao` | Encaminhado quando definido | Permite usar a versão de formato já prevista pelo envelope. |
| `contexto` | Encaminhado quando definido | Preserva contexto bounded declarado pelo chamador. |
| `correlacao` | Encaminhada quando definida | Permite continuar a cadeia fora do despacho síncrono; `derivar()` continua sendo a forma recomendada. |
| `causa` | Encaminhada quando definida | Preserva a relação com o evento anterior em uma fronteira assíncrona. |
| `origem` | Ignorada na entrada e substituída pelo ID do módulo | Um módulo não pode emitir em nome de outro. |
| campos desconhecidos | Não encaminhados | A ponte não expande o contrato implicitamente. |

O contexto ainda exige que o evento esteja declarado em `manifest.events.emits`. Um evento não declarado continua sendo recusado antes de chegar ao barramento.

## 3. Limites e não-objetivos

Esta slice não adiciona validação de payload, negociação de compatibilidade, catálogo manual, retry, persistência, rede, autorização server-side, RLS ou autoridade operacional. O payload continua opaco nesta fronteira, e o versionamento continua sendo um metadado do envelope, não uma validação de schema. O retry permanece deliberadamente aberto porque requer política por classe de evento e limites aprovados; inventá-la aqui contrariaria a regra de não criar requisito por inferência.

A propagação automática continua limitada ao despacho síncrono. Para um handler assíncrono que emite depois de `await`, o chamador deve usar `derivar(envelope)` e encaminhar o resultado; o contexto agora não descarta mais essa informação.

## 4. Evidência e segurança

O teste focal cobre a emissão autorizada, a origem forçada pelo contexto, a preservação de versão, contexto, correlação e causação, além da ausência de bus injetado. O teste também envia uma origem falsa para demonstrar que ela não se torna autoridade.

A mudança não altera router, shell, sidebar, Service Worker, launcher normal, V1, armazenamento ou transportes. Ela não faz chamadas externas, não inicia jobs e não cria estado persistente.

## 5. Rollback

O rollback é reversível por remoção das alterações em `v2/core/contexto.js`, `test/v2/contexto.test.js` e deste documento. Nenhuma migração, dado persistido, tag ou contrato externo é alterado.

## 6. Próximos gaps não fechados

O Event Bus ainda precisa de decisão explícita para validação de schemas/compatibilidade e política de retry por classe de evento. A Phase 03 permanece parcial; esta ponte não deve ser lida como fechamento do Event Bus ou das API Contracts.
