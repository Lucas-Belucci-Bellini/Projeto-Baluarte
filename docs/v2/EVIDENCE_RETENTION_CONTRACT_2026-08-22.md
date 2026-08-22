# Evidence Retention Preview — Contrato local V2

**Status:** contrato implementado no commit funcional `752206fb`; candidata `1.3.1` em validação
**Data:** 2026-08-22
**Autor:** Manus AI
**Dependência:** `v2/data/evidence.ts` e módulo `evidence`

## Objetivo

Este slice define uma projeção local de retenção para que o Baluarte consiga medir idade e elegibilidade de registros Evidence antes de escolher persistência, descarte ou revisão humana. A projeção é somente leitura, determinística e bounded. Ela **não apaga, altera, verifica ou promove** evidências.

## API proposta

O módulo Evidence expõe `retentionPreview(options)` com a seguinte entrada:

```ts
{
  now: string;
  maxAgeDays?: number;
  limit?: number;
}
```

`now` é obrigatório e precisa ser uma data ISO válida. `maxAgeDays` é inteiro positivo, tem default 30 e teto 3650. `limit` é inteiro positivo, tem default 25 e teto 100. Valores inválidos lançam `TypeError`; não existe coerção silenciosa.

A saída é um objeto congelado com `now`, `maxAgeDays`, `items` e `summary`. Cada item possui somente `id`, `moduleId`, `status`, `observedAt`, `ageDays` e `retention`. `retention` é `within-window` quando a idade está dentro do limite, `past-window` quando ultrapassa o limite e `future-observed` quando `observedAt` está no futuro em relação a `now`. O resumo contém apenas `total`, `withinWindow`, `pastWindow` e `futureObserved`.

A ordenação preserva a ordem append-only do `EvidenceStore`. O limite é aplicado antes da projeção, e os contadores do resumo descrevem somente os itens devolvidos, nunca um total ilimitado escondido. O resultado não inclui `statement`, `source`, URI, título, publisher, collector, confidence, claimKey, token, role, claims ou permissão.

## Segurança e lifecycle

A API é local e read-only. Ela reutiliza o `EvidenceStore` existente, não cria outro Storage, não adiciona rota, não adiciona permissão e não chama rede, Supabase, SQL, RLS, Auth, OpenClaw, WhatsApp ou Spotify. Antes do `init`, a API retorna um preview vazio usando as opções validadas; depois de `dispose`, volta a retornar o mesmo fallback vazio.

Nenhum consumidor client-side recebe capacidade de mutação. `append`, `appendCatalog` e `markStatus` continuam parte do módulo Evidence para contratos locais existentes, mas `retentionPreview` não invoca nenhum deles. O cálculo de idade usa `Date.parse` e dias inteiros não negativos; datas futuras são classificadas explicitamente em vez de virar idade negativa.

## Testes obrigatórios

O teste focal deve provar data `now` determinística, default e teto bounded, contagem por janela, classificação de futuro, limite, imutabilidade, omissão de campos sensíveis, argumentos inválidos, fallback antes do init e fallback após `dispose`. Deve também provar que a chamada não altera status nem quantidade de registros.

O gate browser deve chamar `window.__v2.api('evidence', 'retentionPreview', ...)` no boot limpo e confirmar preview vazio, schema bounded, ausência de campos sensíveis e resultado congelável sem conteúdo de claims. Nenhum seed persistente deve ser introduzido no harness.

## Rollback e próximo passo

O rollback é remover somente a nova API e seus testes/documentos, preservando `append`, `appendCatalog`, `get`, `list`, `listByClaim`, `listByModule`, `markStatus`, a fila Wiki e todos os wrappers. Se o contrato passar, o próximo slice separado poderá discutir política de retenção operacional e auditoria server-side; este slice não autoriza essa decisão.

A persistência Supabase/RLS permanece bloqueada até aprovação explícita de staging, custo, migration, tenancy, retenção e rollback.
