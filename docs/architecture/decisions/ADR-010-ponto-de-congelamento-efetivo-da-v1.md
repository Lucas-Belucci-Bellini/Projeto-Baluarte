# ADR-010 — O ponto de congelamento efetivo da V1 é a `v1.3.8`

**Data:** 2026-11-24 · **Estado:** aceita · **Contexto:** [#541](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/541) · **Depende de:** [ADR-001](./ADR-001-1.0.0-como-ponto-de-congelamento.md) · [ADR-003](./ADR-003-congelamento-e-manutencao-da-v1.md)

## O problema

O [ADR-001](./ADR-001-1.0.0-como-ponto-de-congelamento.md) declarou que a 1.0.0
seria o ponto de congelamento da V1. A 1.0.0 **nunca foi publicada**: a série
pública salta de `v0.9.2` (2026-08-03) para `v1.1.0` (2026-08-19), e a linha 1.x
termina na `v1.3.8` (2026-08-24). Uma decisão cujo objeto não existe não governa
nada — e "congelado" volta a ser adjetivo de README, que é exatamente o que o
ADR-001 queria impedir.

Errata no ADR-001 e no [ADR-003](./ADR-003-congelamento-e-manutencao-da-v1.md)
conserta a referência, mas não responde duas perguntas que só uma decisão nova
responde: **congelado em quê** e **a partir de quando**. Como a base é escolhida
depois de já estar publicada, e como a data de vigência é posterior a ela, isto é
decisão — não conserto de registro.

## A decisão

1. **Base.** A V1 congelada é a release **`v1.3.8`**, identificada pelo commit
   `7cce9d42bf756afcb1feffb7e05a4e87f0020616`. O SHA é o identificador canônico;
   a tag é o nome de conveniência.
2. **Vigência.** O regime de manutenção restrita vale a partir de **2026-11-24**,
   data desta decisão.
3. **Sem tag retroativa.** A tag `v1.0.0` **não** é criada, e a das tags
   existentes não é recriada, movida ou substituída. A ausência de `v1.0.0` fica
   registrada como fato histórico, não como dívida pendente.
4. **Relação com os ADRs anteriores.** O ADR-001 mantém a tese — congelar antes
   de reformar — e recebe errata apontando para cá; o ADR-003 mantém as regras de
   manutenção (§§1–4) e recebe errata na numeração e no gatilho. Este ADR não
   revoga nenhum dos dois: responde o que eles deixaram em aberto.
5. **Marco compartilhado com o ADR-004.** O "pós-1.0.0" usado no
   [ADR-004](./ADR-004-stack-poliglota-por-responsabilidade.md) para situar a
   migração do Electron para Tauri designa **este mesmo marco** — o congelamento
   da V1, não uma versão diferente. Passa a ser lido como "pós-congelamento,
   base `v1.3.8`". A escolha do shell (D13) continua em aberto e não é decidida
   aqui.
6. **Cronologia real, registrada e não redecidida.** A intenção de congelar é de
   2026-08-09 (ADR-001); o primeiro marco de V2 no código é de 2026-08-10
   (`12d78a70`, `v2/core/manifest.js`); a base é de 2026-08-24; a primeira release
   `v2.0.0-alpha.1` é de 2026-08-25; a formalização é de 2026-11-24. A V2 começou
   **antes** da base e antes da formalização.

## Evidências da base

| Item | Valor | Como foi verificado |
| --- | --- | --- |
| Tag | `v1.3.8` — tag **leve**, aponta direto para o commit | `git ls-remote --tags origin`; `gh api …/git/ref/tags/v1.3.8` → `type: commit` |
| Commit | `7cce9d42bf756afcb1feffb7e05a4e87f0020616` | `git log -1 7cce9d42` |
| Assunto | `Merge pull request #468 — release 1.3.8: o Núcleo sabe o que toca na máquina` | idem |
| Data do commit | 2026-08-24 17:01:40 −0300 (20:01:40Z) | idem |
| Ancestral de `main` | sim | `git merge-base --is-ancestor 7cce9d42 origin/main` |
| Versão no commit | `1.3.8` em `package.json`, `desktop/package.json` e `src/data/version.js`; `baluarte-v1.3.8` em `public/sw.js` | `git show 7cce9d42:<arquivo>` |
| Release | `v1.3.8`, nome `1.3.8`, não rascunho, não pré-release | `gh api …/releases/tags/v1.3.8` |
| Publicação | criada 2026-08-24T20:01:40Z · publicada 20:11:57Z · autor `github-actions[bot]` | idem |
| Última da linha 1.x | sim — nenhuma release `v1.x` posterior | listagem de releases filtrada por `^v1\.` |

Artefatos publicados na release — oito assets, todos `uploaded`:

| Asset | Tamanho (bytes) |
| --- | --- |
| `Baluarte-Launcher-Setup-1.3.8.exe` | 644.733.659 |
| `Baluarte-Launcher-Setup-1.3.8.exe.blockmap` | 670.074 |
| `Baluarte-Launcher-1.3.8-arm64.dmg` | 407.011.077 |
| `Baluarte-Launcher-1.3.8-arm64.dmg.blockmap` | 424.282 |
| `Baluarte-Launcher-1.3.8.AppImage` | 774.490.326 |
| `latest.yml` | 363 |
| `latest-mac.yml` | 363 |
| `latest-linux.yml` | 386 |

## Associação fortemente indicada, mas não provada criptograficamente

O run que publicou os artefatos foi identificado: **`32772263989`**, do workflow
`Desktop Release` (`.github/workflows/desktop-release.yml`), disparado por
`workflow_dispatch`, ator `Lucas-Belucci-Bellini`, entre 20:09:23Z e 20:17:11Z,
com `head_sha` e `head_commit.id` iguais a
`7cce9d42bf756afcb1feffb7e05a4e87f0020616` — o commit da base.

Os oito assets foram enviados por `github-actions[bot]` dentro das janelas dos
três jobs: `AppImage` e `latest-linux.yml` no job do Ubuntu (20:11:57Z e
20:12:27Z, job até 20:12:30Z); `dmg`, seu blockmap e `latest-mac.yml` no job do
macOS (20:12:37Z a 20:12:51Z, job até 20:12:55Z); `exe`, seu blockmap e
`latest.yml` no job do Windows (20:16:35Z a 20:17:01Z, job até 20:17:11Z). Nenhum
outro run do mesmo workflow ocorre naquele intervalo.

**A associação entre o run, o commit e os oito assets é fortemente indicada, mas
não provada criptograficamente.** As ressalvas, preservadas sem maquiagem:

- **O objeto da release foi criado antes do run.** `created_at` da release é
  20:01:40Z; o run começa às 20:09:23Z, 7 min 43 s depois. O run populou um
  registro que já existia e a publicação coincide com a chegada do primeiro
  asset — não houve criação pelo run.
- **A autoria da criação do objeto não foi identificada.** A API não expõe
  histórico de rascunho e o log de auditoria da organização não está acessível.
- **Os logs expiraram.** `gh api …/actions/jobs/<id>/logs` retorna HTTP 410
  (retenção de 90 dias) e a listagem de passos dos jobs vem vazia. Não há prova
  de log.
- **A tag é leve.** `v1.3.8` é tag leve (`objecttype=commit`), diferente da
  `v1.3.4`, que é anotada; tag leve não tem autor nem data e pode ser
  re-apontada. Por isso a base é citada pelo SHA, e não pelo nome.
- **O conteúdo de cada asset não é atestado pelo commit.** A API de releases não
  registra o run que gerou os arquivos; o vínculo demonstrado é `tag → commit` e
  `release → tag`, com a janela temporal acima como indício forte.

Data de referência das verificações: 2026-11-24.

## Por quê

Sem objeto, congelamento não se cobra. Com base nomeada por SHA e data de
vigência, a regra passa a ter onde ser verificada: qualquer artefato da linha 1.x
é comparável com `7cce9d42`, e qualquer pedido de mudança na V1 é julgável pela
régua do ADR-003 §4. A alternativa — deixar o ADR-001 apontando para uma versão
inexistente — produz o pior resultado possível: uma política que parece existir,
não pode ser cumprida e não pode ser auditada.

## Consequências

- Toda documentação que citar "1.0.0" como base de congelamento deve citar
  `v1.3.8` e, quando precisar de precisão, o SHA `7cce9d42`.
- A V1 não recebe funcionalidade nova; segue recebendo correção de bug, correção
  de segurança, atualização de dado e documentação (ADR-003 §2).
- O histórico de tags não é fonte de verdade para o launcher: de 1.3.5 em diante
  as tags `desktop-v*` não existem e as releases foram disparadas por
  `workflow_dispatch`. Reconstruir o que foi publicado é tarefa de **releases**;
  o que acionou o build está em **workflow runs**. O contrato está registrado em
  [`docs/architecture/README.md`](../README.md#namespace-de-tags-e-releases).
- Um congelamento com base posterior ao início da V2 significa que a V2 nasceu
  sobre uma V1 ainda em movimento. É fato registrado; se isso tiver custo, ele se
  paga com contrato de fronteira (ADR-007/008/009), não reescrevendo a V1.
- O marco "pós-1.0.0" do ADR-004 passa a ser lido como pós-congelamento; a
  escolha do shell continua pendente (D13) e não é resolvida por este ADR.

## O que revogaria esta decisão

Descobrir que `v1.3.8` não é reproduzível — artefatos ausentes, `latest*.yml`
inconsistentes ou impossibilidade de reconstruir o build a partir do commit — ou
que uma correção crítica exige mudança arquitetural na V1. Nesse caso é preciso
ADR novo dizendo qual defeito e por quê, como já prevê o ADR-001.