# Histórico de commits — Projeto Baluarte

Este é o ponto de entrada do **histórico completo de alterações do repositório**. Ele foi criado para ficar visível na raiz, ao lado do `README.md` e do `CONTRIBUTING.md`, e para que qualquer pessoa consiga acompanhar o que já foi integrado sem depender apenas do resumo das releases.

> **Estado do registro:** atualizado a partir do `main` no commit [`13360e596eb6bb9351c984d25cea67e7d1bef76b`](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commit/13360e596eb6bb9351c984d25cea67e7d1bef76b), com **1.989 commits** alcançáveis nessa linha principal.

## Onde consultar

| Necessidade | Documento |
|---|---|
| Ver todos os commits, em ordem, com SHA, autor, mensagem e arquivos afetados | [`historico/commits-main/README.md`](historico/commits-main/README.md) |
| Abrir diretamente o último bloco do ledger | [`commits-main-1801-1989.md`](historico/commits-main/commits-main-1801-1989.md) |
| Ler a história narrativa dos marcos e releases | [`historico/CHANGELOG.md`](historico/CHANGELOG.md) |
| Acompanhar o progresso e os critérios da V2 | [`docs/v2/V2_PROGRESS.md`](docs/v2/V2_PROGRESS.md), [`PHASE_STATUS_MATRIX.md`](docs/v2/PHASE_STATUS_MATRIX.md) e [`MASTER_EXECUTION_MATRIX.md`](docs/v2/MASTER_EXECUTION_MATRIX.md) |
| Ver a revisão, checks e discussão de uma mudança | [Pull requests do repositório](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pulls) e [commits no GitHub](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/commits/main) |

## O que já foi registrado

O ledger está organizado em dez blocos de até 200 commits, numerados do mais antigo para o mais recente dentro da linha `main`. Cada entrada informa o SHA completo, link permanente para o commit, data do autor, autor, pais, resumo da mensagem e a lista de arquivos criados, modificados, removidos, renomeados ou copiados.

O registro inclui os marcos técnicos que já chegaram à `main`, como a fronteira de claims de identidade da V2, o histórico bounded de revisões Evidence e a validação de entrada do módulo de sessão Runtime integrada pela [PR #533](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/pull/533). PRs abertas, drafts ou bloqueadas que ainda não entraram na `main` não são apresentadas como commits integrados; elas continuam rastreáveis no GitHub e nas matrizes canônicas.

## Como o registro será atualizado

A atualização é **evidence-first e feita por PR documental**, depois que a slice técnica correspondente for integrada e os workflows pós-merge forem auditados. Isso mantém o histórico fiel ao que entrou na `main`, sem transformar uma branch aberta, um check pendente ou um deploy bloqueado em entrega concluída.

O gerador versionado está em [`scripts/gerar-historico-commits.py`](scripts/gerar-historico-commits.py). Para atualizar o ledger:

```bash
git fetch origin --prune
git rev-parse origin/main
python3 scripts/gerar-historico-commits.py
```

O script lê somente o grafo Git local e recria `historico/commits-main/`. A atualização deve ser revisada com `git diff --check`, `git diff --stat` e pelos nomes de arquivos antes de ser commitada. Não há schedule, polling, webhook ou escrita externa para manter este registro; a atualização entra junto de uma PR documental normal.

## Limites do escopo

Este ledger cobre os commits alcançáveis a partir de `main` no snapshot indicado acima. Ele não representa automaticamente todas as branches, backups remotos, drafts ou worktrees. Para auditorias de todas as referências, é necessário um snapshot separado e explicitamente identificado; o pacote auxiliar de histórico completo de refs permanece fora do monorepo por decisão de escopo.

O documento também não substitui a memória canônica da V2 nem autoriza release. `historico/CHANGELOG.md` continua sendo o resumo narrativo de marcos; `docs/v2/V2_PROGRESS.md`, `PHASE_STATUS_MATRIX.md`, `MASTER_EXECUTION_MATRIX.md` e os demais documentos canônicos continuam sendo a fonte de estado da construção. A **V2 permanece `IN PROGRESS`** enquanto seus requisitos estruturais ainda estiverem pendentes.

## Referências

[1]: https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors "GitHub Docs — Setting guidelines for repository contributors"
[2]: https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes "GitHub Docs — About the repository README file"

O GitHub destaca automaticamente `CONTRIBUTING.md` na visão do repositório; este arquivo histórico é mantido na raiz e recebe links explícitos do README e do guia de contribuição para ficar igualmente descobrível.[1] [2]
