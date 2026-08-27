# Contrato — diagnóstico da saúde do Task Manager na Plataforma V2

**Status:** proposta implementada em slice local, aguardando revisão e gates remotos
**Data:** 2026-08-27
**Escopo:** `v2/core/plataforma.ts` + `test/v2/plataforma.test.js`

## Objetivo

A fachada `criarPlataforma()` já compõe, em um diagnóstico único, o estado do Supervisor, o health do Boot, o estado do Registry, o lifecycle dos módulos e o diagnóstico do Boot. Esta slice acrescenta a projeção opcional da saúde do escalonador local do Core, chamado de `trabalho` no contrato V2.

A mudança fecha uma lacuna pequena da faixa **Core operacional / diagnóstico unificado**. Ela não cria um segundo Task Manager e não reimplementa `saude()`: a fonte continua sendo o contrato canônico de `v2/core/trabalho.ts`.

## Contrato de entrada

`criarPlataforma(registry, boot, { trabalho })` aceita somente uma dependência que exponha o método `saude()`:

```ts
interface PlatformOptions {
  trabalho?: Pick<Escalonador, 'saude'>;
}
```

Quando `trabalho` é omitido, a Plataforma continua funcionando e retorna `trabalho: null`. Quando existe, a dependência é validada na construção; um objeto sem `saude` produz `TypeError('trabalho inválido')` em vez de falhar mais tarde de forma implícita.

## Contrato de saída

`PlatformDiagnostic` passa a conter:

```ts
trabalho: SaudeEscalonador | null;
```

Quando a dependência está presente, o valor de `trabalho` é obtido por delegação direta a `trabalho.saude()`. A projeção inclui somente o retrato já definido pelo Task Manager:

- `readiness` (`healthy` ou `unhealthy`);
- `motivos` bounded;
- `estado` instantâneo da fila e da concorrência;
- `contagem` acumulada de enfileirados, concluídos, falhados, recusados e cancelados;
- `latencia` agregada por quantidade, média, mínimo e máximo.

A fachada não interpreta esses campos e não os transforma em autorização.

## Invariantes e fronteiras

1. **Somente leitura:** `diagnostico()` consulta a saúde; não enfileira, cancela, inicia, para, reinicia ou altera tarefas.
2. **Fonte única:** a implementação da saúde permanece em `criarEscalonador().saude()`; a Plataforma apenas a compõe.
3. **Compatibilidade:** sem a opção `trabalho`, o diagnóstico retorna `null` e os consumidores anteriores continuam podendo usar a Plataforma.
4. **Falha explícita:** uma dependência malformada é rejeitada no construtor.
5. **Sem autoridade:** `readiness` do Task Manager não altera `Supervisor`, `runtimeAuthority`, permissões, claims, promoção pública ou fallback V1.
6. **Sem efeitos externos:** não há rede, persistência, Supabase, RLS, Auth, billing, worker, timer ou job recorrente.
7. **Sem política nova:** a slice não cria retry, backoff, threshold, alerta, SLA, retenção ou regra de unhealthy para falhas acumuladas. Essas decisões continuam separadas.

## Testes da slice

O teste focal cobre:

- diagnóstico compatível sem escalonador (`trabalho: null`);
- projeção usando o escalonador real, incluindo tarefa concluída e fila drenada;
- rejeição imediata de uma dependência sem `saude()`;
- regressão dos casos já existentes de Registry, incidentes, Supervisor, boot e parada.

## Rollback

O rollback é reversível por commit: remover a propriedade opcional `PlatformOptions.trabalho`, o campo `PlatformDiagnostic.trabalho`, a validação e os três casos focais. Nenhuma migração, tag, alteração de proteção, mudança da V1 ou dado persistente é necessária.

## Limitações

Esta slice não comprova saúde operacional remota, persistência de métricas, dashboards, retenção de incidentes, rate limit distribuído, restart distribuído, retry por classe de evento, RLS, claims server-side ou aceite físico desktop/mobile. Esses itens continuam pendentes ou bloqueados nas matrizes canônicas.

## Critério de conclusão

A slice só poderá ser considerada integrada quando o diff permanecer limitado ao escopo declarado, os gates locais e os workflows remotos aplicáveis passarem, a PR for mesclada sem bypass e a matriz canônica registrar o SHA real. Nenhuma alpha/release é criada apenas por este contrato.
