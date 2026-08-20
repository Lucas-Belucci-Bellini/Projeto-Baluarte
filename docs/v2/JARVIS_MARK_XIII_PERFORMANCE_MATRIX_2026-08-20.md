# JARVIS Mark XIII — Matriz de Performance Visual

**Data:** 20 de agosto de 2026  
**Status:** `IMPLEMENTAÇÃO LOCAL VALIDADA — PUBLICAÇÃO PENDENTE`  
**Escopo:** console integrado da rota `/jarvis`, sem alteração de autoridade, Auth/RLS, Supabase ou Billing

## Objetivo

O console Mark XIII foi publicado como superfície integrada do JARVIS, mas a aparência visual não deve ser tratada como prova de que o sistema está leve, saudável ou disponível. Este marco adiciona medição reproduzível e degradação visual controlada para reduzir custo quando o navegador não sustenta o orçamento definido. A medição pertence ao console e serve à experiência local; ela não concede claims nem substitui os sinais server-side do Runtime.

> **Regra:** um núcleo desenhado no cliente pode dizer que a animação entrou em modo reduzido; não pode afirmar que o JARVIS, o Runtime, a rede ou um módulo estão saudáveis sem evidência correspondente.

## Linha de base observada

A linha de base foi obtida contra um preview de produção em Chromium headless, viewport `1440×900`, device memory reportada de `16 GB`, sem erros de console. O primeiro benchmark observou montagem em aproximadamente `1048 ms`, `1` canvas, `55` nós internos do console, heap JavaScript de aproximadamente `9,54 MB` e `19,70 FPS` no período de amostragem de dois segundos.

Esse número é uma observação do sandbox/headless usado na auditoria, não uma promessa para todos os dispositivos. A medição existe para detectar regressões entre commits e deve ser repetida em hardware real de baixa capacidade antes de declarar um orçamento de produção.

| Medição | Observação inicial | Interpretação |
|---|---:|---|
| Montagem da rota | `1048 ms` | Tempo local até a superfície estar pronta no preview auditado. |
| FPS observado | `19,70` | Abaixo do orçamento de animação contínua; acionou a política adaptativa. |
| Nós DOM internos | `55` | Complexidade estrutural do console, sem contar a sidebar e o chat completo. |
| Canvas | `1` | Um único contexto 2D para o núcleo. |
| Canvas lógico observado | `1140×406` | Depende do viewport e do shell. |
| Heap usado | `9,54 MB` | Métrica disponível no Chromium auditado; não é memória total do processo. |
| Erros de console | `0` | Nenhum `pageerror` ou `console.error` observado no benchmark. |

## Orçamento e política adaptativa

A qualidade inicial é `full`, exceto quando `navigator.deviceMemory` informa menos de `4 GB`; nesse caso, o console começa em `reduced` e não tenta voltar automaticamente para a qualidade completa. O modo completo usa até `96` partículas e avalia as conexões entre elas. O modo reduzido usa `56` partículas, examina uma fração das conexões e limita a cadência visual a aproximadamente `20 FPS` quando o navegador permite.

A cada janela de aproximadamente um segundo, o console calcula o FPS dos frames realmente desenhados. Se a medição ficar abaixo de `24 FPS`, a qualidade passa para `reduced`, o atributo `data-performance="reduced"` é atualizado e a telemetria DOM passa a exibir `REDUZIDO`. Se a qualidade reduzida mantiver mais de `48 FPS`, o dispositivo não for classificado como baixa memória e o usuário não estiver em reduced motion, o console pode retornar a `full`. A política evita oscilações em dispositivos com pouca memória.

| Estado | Partículas | Conexões | Cadência alvo | Retorno automático |
|---|---:|---|---:|---|
| `full` | Até `96` | Avaliação completa com limite espacial | Aproximadamente `30 FPS` ou o máximo sustentável | Sim, se a qualidade reduzida superar `48 FPS` e o dispositivo não for low-memory. |
| `reduced` | `56` | Stride de conexão reduzido | Aproximadamente `20 FPS` | Não em low-memory; permitido apenas em dispositivos sem esse sinal. |
| `prefers-reduced-motion` | Inicialização visual sem laço contínuo | Sem animação contínua | Sem movimento | Não é o mesmo estado que `reduced`; respeita a preferência do usuário. |

## Reduced motion e acessibilidade

Quando `prefers-reduced-motion: reduce` é detectado, o canvas monta o estado inicial, mas não mantém um loop de animação contínua. O atributo `data-reduced-motion="true"` fica disponível para diagnóstico e o CSS desativa animações e transições da superfície. Essa preferência não é sobrescrita pelo cálculo de FPS.

O canvas possui label semântico, a mensagem de estado usa `aria-live="polite"`, os temas são botões nativos e a presença Spotify é apenas um reflexo do estado de metadados já usado pela página. O novo benchmark pode ser executado com `REDUCED_MOTION=1` para verificar o caminho de preferência reduzida.

## Benchmark reproduzível

O comando oficial é `npm run jarvis:performance`. Ele pressupõe um preview disponível em `http://127.0.0.1:4173`; a URL pode ser alterada com `BASE`. Para verificar reduced motion, execute `REDUCED_MOTION=1 npm run jarvis:performance`. O resultado JSON inclui montagem, FPS observado, nós DOM, canvas, dataset do console, memória reportada quando disponível e erros de console.

O benchmark é uma ferramenta de observação, não um gate que inventa um número universal. Ele deve ser combinado com smoke, caminho crítico, build, browser integration e testes em hardware de menor capacidade. Um FPS baixo deve orientar otimização ou degradação, não ser mascarado por aumento arbitrário de timeout.

## Health e autoridade

`data-performance`, `data-fps`, `data-reduced-motion` e a telemetria do canvas são sinais locais de apresentação. Eles não devem ser usados para marcar módulos como `healthy`, `online`, `available`, `disabled` ou `quarantined` no Registry. A disponibilidade pública continua dependente de health server-side, claims, deep link, fallback, auditoria e rollback controlado.

A presença `NÚCLEO ONLINE` do layout é uma indicação visual herdada do shell e não foi convertida neste marco em uma afirmação de health do Runtime. A próxima integração válida é consumir uma projeção de health autorizada e distinguir explicitamente `visual-online`, `runtime-observed` e `server-authorized`.

## Evidência e testes

O contrato estático do marco está em [`test/jarvis-mark-xiii-console.test.js`](../../test/jarvis-mark-xiii-console.test.js). O componente está em [`src/utils/jarvis-mark-xiii.ts`](../../src/utils/jarvis-mark-xiii.ts), o comando em [`scripts/jarvis-performance.mjs`](../../scripts/jarvis-performance.mjs) e o entrypoint em [`src/pages/jarvis.ts`](../../src/pages/jarvis.ts). A matriz visual integrada anterior está em [`JARVIS_MARK_XIII_INTEGRATED_VISUAL_2026-08-20.md`](./JARVIS_MARK_XIII_INTEGRATED_VISUAL_2026-08-20.md).

Antes da publicação, foram executados os testes direcionados do JARVIS e os typechecks TypeScript e V2. A publicação ainda depende dos gates gerais e do fluxo normal de backup, sincronização com `origin/main`, commit direto, CI remoto e verificação de árvore limpa.

## Rollback

Para reverter somente o orçamento adaptativo, remova a medição de `performanceQuality`, `samplePerformance`, `particleCount`, o benchmark `scripts/jarvis-performance.mjs`, o script `jarvis:performance` e os testes associados. Preserve o console Mark XIII, a rota direta `/jarvis`, o fallback de chat, a integração Spotify e o MPA V7. Depois execute `git diff --check`, `npm run tipos:ts`, `npm run tipos:v2`, `npm test`, `npm run build`, `npm run v2:integracao`, `npm run smoke` e `npm run caminho-critico`.

## Referências internas

[1]: ../../src/utils/jarvis-mark-xiii.ts "Implementação do console Mark XIII"

[2]: ../../scripts/jarvis-performance.mjs "Benchmark reproduzível do console"

[3]: ../../test/jarvis-mark-xiii-console.test.js "Contrato estático do JARVIS integrado"

[4]: ./JARVIS_MARK_XIII_INTEGRATED_VISUAL_2026-08-20.md "Marco de integração visual Mark XIII"
