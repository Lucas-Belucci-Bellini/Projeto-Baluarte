# Platform Bus Health — contrato local

## Estado

- **Slice:** projeção opcional e read-only da saúde do Event Bus na fachada da Plataforma V2.
- **Base:** `origin/main` em `6ba7875a5746bbc10bb66e6b8d3fa8d103e43267`, após a integração da PR #530.
- **Branch:** `v2/platform-bus-health`.
- **Status:** implementação e testes focais concluídos; gates completos em execução.
- **Dependência:** a fonte de verdade continua sendo `bus.saude()`; a Plataforma somente delega e compõe o retrato.

## Objetivo e causa

O Event Bus V2 já expõe `saude()` com readiness, contagens, falhas por evento, latência e histórico bounded de falhas. A fachada `criarPlataforma()` já reunia saúde do Boot, Supervisor, Registry, Lifecycle e opcionalmente do Task Manager, mas não oferecia o health do Event Bus no diagnóstico agregado.

Esta slice acrescenta a opção `PlatformOptions.bus`, valida que a dependência exponha `saude()` e projeta `PlatformDiagnostic.bus`. Quando a opção não é fornecida, o campo permanece `null`, preservando compatibilidade e sinalizando ausência de observação em vez de inventar um estado saudável.

## Contrato

A assinatura aceita uma dependência mínima:

```ts
interface PlatformOptions {
  bus?: Pick<EventBus, 'saude'>;
}
```

O resultado contém `bus: EventBusHealth | null`. A Plataforma não reimplementa a saúde do bus, não copia sua autoridade, não altera readiness e não cria uma segunda fonte de diagnóstico. Uma dependência sem `saude()` é recusada com `TypeError('bus inválido')`.

A declaração `v2/core/bus.d.ts` torna explícita a superfície TypeScript já existente do Event Bus, incluindo envelope, falhas, metadados, dependências e `EventBusHealth`. Isso evita `any` implícito na composição do diagnóstico.

## Escopo

A mudança está limitada a `v2/core/plataforma.ts`, sua declaração pública `v2/core/bus.d.ts`, `test/v2/plataforma.test.js` e esta nota factual. O teste prova o caso sem dependência, a delegação de um bus real, a presença de contagens por evento, a ausência de autoridade e a recusa de dependência inválida.

## Não escopo e limites

A slice não altera o Event Bus, não cria retry, não altera `saude()`, não promove readiness, não cria persistência, não acessa rede, não usa Supabase/RLS, Auth, RBAC, tenancy, storage remoto, OpenClaw, MCP, Hermes, webhook ou schedule. A presença de um diagnóstico `healthy` é observação local e não significa autenticidade, autorização, disponibilidade operacional ou aprovação para promoção pública.

## Segurança e compatibilidade

A opção é opcional e read-only. O diagnóstico é obtido por delegação direta a `bus.saude()`, sem receber credenciais, payloads ou dados sensíveis adicionais. O caminho sem `bus` continua retornando `null`. A V1 não foi modificada.

## Evidência local

- TypeScript da base: `npm run tipos:ts` passou após a declaração explícita do módulo Event Bus.
- TypeScript V2: `npm run tipos:v2` passou.
- Testes focais Plataforma + Event Bus: **60/60 passaram; 0 falhas** usando `npx tsx --test` para carregar a implementação TypeScript.
- O runner do Node puro falhou inicialmente com `ERR_UNKNOWN_FILE_EXTENSION` em `plataforma.ts`; isso foi uma limitação do runner, não uma falha do contrato. A execução correta com `tsx` passou.
- GitNexus foi reindexado no worktree correto. O impacto de `criarPlataforma` foi `LOW`, `exact`, com zero consumidores upstream resolvidos no índice; a revisão manual dos testes e consumidores foi mantida.

Os gates amplos devem registrar separadamente `green`, `blocked-known`, `unknown` e `not-run`. O ambiente usa Node `22.13.0`, enquanto o projeto requer Node `24.x`; qualquer `EBADENGINE` permanece explícito.

## Rollback

O rollback é feito por `git revert` do commit de integração da slice. Remover `PlatformOptions.bus`, `PlatformDiagnostic.bus`, a declaração `bus.d.ts` e os testes devolve a fachada à superfície anterior. Nenhuma migration, tag, proteção ou dado remoto precisa ser revertido.

## Bloqueios e release

A PR #531 continua independente e bloqueada pelo Vercel com `Deployment rate limited — retry in 24 hours.`. Esta slice não executa rerun, deploy, upgrade, polling, schedule, webhook ou bypass. A alpha.22 ainda não foi publicada.

A PR desta slice deve permanecer draft até que os checks aplicáveis concluam sem pending/failure/cancelled, o Vercel esteja success e o estado remoto seja simultaneamente `CLEAN` e `MERGEABLE`.

## Referências

[1]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte Projeto Baluarte — repositório GitHub.
[2]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/530 PR #530 — Evidence Revision History, integrada na base desta slice.
[3]: https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/531 PR #531 — Event Bus Envelope Integrity, independente e bloqueada pelo Vercel.
