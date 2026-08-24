# Prompt para colar na sessão LOCAL

> Escrito pela sessão remota de **17/08/2026**, ao migrar para o local. Copie o
> bloco abaixo inteiro. Ele é auto-suficiente: assume que a sessão nova começa
> **sem** o histórico desta.
>
> Se o `main` tiver andado depois, confira os SHAs antes de confiar nos números.

---

```
Sessão LOCAL do Projeto Baluarte (Windows, com as skills instaladas).

ESTADO
main tem o item 3 do "próximo bloco" da docs/v2/V2_PROGRESS.md fechado:
lifecycle + Runtime Host. Veio do PR #435, verde no Linux nos 15 checks
(`Supabase Preview` sai como `skipped`, não vermelho). Backup do main de antes
do merge: branch `backup/2026-08-17-antes-runtime-host`.

O que mudou, em uma frase cada:
  - `v2/core/ciclo.ts` abre o Runtime Host ANTES do `init`. Quem não abre não
    executa fase nenhuma e não entra em `vivos()`, logo não pode ser `running`.
    A falha vai para a fase `runtime`, não `init`.
  - `v2/harness/main.js` injeta um Host real (autorização sem transporte, via
    `criarGrantRuntime`). O Host é opcional no ciclo; sem ele o comportamento é
    o de antes.
  - portão `v2:integracao` foi a 15/15 e ganhou `--strictPort`.
  - suíte 893 -> 905.
  - os 3 verificadores de catálogo passaram a ignorar fim de linha
    (`scripts/lib/eol.mjs`).

LEIA PRIMEIRO
docs/HANDOFF-LOCAL.md, seção "⏭️ Comece por aqui — retomada de 17/08/2026".
Ela traz as decisões já tomadas (não re-litigar) e as armadilhas pagas.

ORDEM
1. CONFIRME O CRLF NA MÁQUINA REAL. É a única coisa desta rodada que o remoto
   não conseguiu verificar de verdade — ele reproduziu o sintoma no Linux
   convertendo os arquivos para CRLF no disco (com o conserto passa, sem ele os
   três ficam vermelhos), mas isso não é um checkout Windows. Rode:
     npm run gen-tabela-estabilidade -- --verificar
     npm run gen-catalogo-eventos    -- --verificar
     npm run gen-catalogo-storage    -- --verificar
   Os três têm que passar. Se algum ficar vermelho, é OUTRO defeito — confira o
   conteúdo do diff antes de regenerar; regeneração que REMOVE linha merece
   desconfiança (já aconteceu: o CI mandava regenerar e obedecer teria apagado
   11 eventos verdadeiros).

2. `.gitattributes` com `*.md text eol=lf`, em branch própria. É a segunda
   metade da decisão do operador: cirúrgico já entrou, a renormalização é esta.
   Ela toca TODO .md versionado — confira o diff antes de commitar, e espere que
   ele seja grande e só de fim de linha.

3. Próximo item da fila da V2: observabilidade de transições
   starting/running/stopping. O vocabulário já existe em
   `v2/core/lifecycle-status.js` (ESTADOS_MODULO), e `starting` está lá desde o
   começo sem nunca ser produzido — o `ciclo.js` roda init/start em sequência,
   então o snapshot só observa estados estáveis. Este item é o que faz `starting`
   deixar de ser palavra e virar estado. Contrato em
   docs/v2/V2_MODULE_LIFECYCLE_STATUS.md.

4. As duas tarefas que o operador separou de uma pergunta só ("baixa junto com o
   app" eram DOIS assuntos):
   a) GitNexus empacotado no instalador da 1.0.0 (local-only, binários nativos;
      hoje o índice está corrompido nos dois lados — o CLAUDE.md manda rodar
      impact() antes de editar símbolo e NÃO dá; substitua por busca textual dos
      importadores e declare isso a cada edição).
   b) Chromium do Playwright (114 MB, exigido pelo v2:integracao). Sintoma vivo:
      no contêiner remoto o Chromium pré-instalado é build 1194 e o Playwright
      do repo quer 1234, então lá só roda com CHROME_PATH apontando à mão.

NÃO CONSERTE POR CONTA PRÓPRIA
`Supabase Preview`. Já diagnosticado, não repita o trabalho: não é credencial —
o projeto hcwzsxdcvmswebunznak é COMPARTILHADO com outras aplicações do
operador. As 15 migrations do repo estão todas no remoto, mesma ordem, sem
divergência; as outras 69 (veritas_circuit_*, room_001_*, knowledge_layer_*,
skill_*, billing_entitlements) não são schema do Baluarte. As três saídas —
projeto dedicado / importar as 69 / desconectar — são DECISÃO DE PRODUTO.

O QUE O LOCAL FAZ E O REMOTO NÃO
Skills de design/animação (freshtechbro/claudedesignskills), motor real do
GitNexus, build/release do app desktop. A fila disso está no resto do
docs/HANDOFF-LOCAL.md, que não mudou.

O QUE O REMOTO FAZ E O LOCAL NÃO
`npm run v2:runtime` (precisa de cargo), os 4 verificadores Python do Arma 3
(console em cp1252 não codifica o ✓), `npm test` direto, e o Supabase Preview.
Se precisar de evidência sobre esses, é o remoto que produz.

ARMADILHAS JÁ PAGAS — não reintroduza
- Família "Windows", agora com SEIS instâncias: spawn de .cmd, path.relative,
  npm test, cp1252, o console, e o CRLF. Script novo que monta caminho, compara
  texto de arquivo ou spawna processo tem que ser pensado nos dois sistemas — o
  CI só cobre Linux.
- Peça pronta e DESLIGADA dá o mesmo retrato verde que peça ligada. Aconteceu
  três vezes seguidas (fachada, contract test, Runtime Host): o símbolo existia,
  tinha teste, e ninguém em produção o chamava. Antes de acreditar que algo está
  em uso, ache os importadores.
- Defesa em profundidade esconde mutante. Ao escrever teste, plante o defeito
  (Regra 1 das V2_TESTING_RULES) e confirme o vermelho.
- Espera por relógio. Use --strictPort em qualquer script que suba servidor,
  senão você mede um servidor zumbi e conclui besteira.
- Commit antigo é matéria-prima, não pacote: diffe contra o main antes de
  aplicar inteiro.
- Push de bot não dispara workflow — não leia "último CI verde" como "main
  verde" sem conferir o SHA. (O main levou 28 commits de outra sessão hoje,
  incluindo o bot de câmbio.)

REGRAS
Branch por feature a partir do main, commit pequeno, backup branch antes do
merge, entrada no historico/CHANGELOG.md. Ferramental/tipos/portões/docs vão
direto ao main quando verdes; contrato, esquema de dado e comportamento visível
param para revisão.

Me diga no fim o que NÃO conseguiu verificar.
```
