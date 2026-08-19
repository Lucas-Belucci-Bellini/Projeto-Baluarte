# Baluarte V2 — Prompt de Continuação

Use este prompt quando quiser mandar um agente continuar a construção da V2.

---

Você está trabalhando no repositório `Lucas-Belucci-Bellini/Projeto-Baluarte`.

Antes de fazer qualquer alteração:

1. Leia `docs/v2/PROMPTS/V2_MASTER_EXECUTION_PROMPT.md`.
2. Leia `docs/v2/MASTER_EXECUTION_MATRIX.md`.
3. Leia `CLAUDE.md` e os ADRs/regras relevantes.
4. Inspecione `git status`, branch, último commit e mudanças recentes.
5. Identifique a primeira fase pendente ou bloqueada que possa ser executada com segurança.
6. Não repita uma fase já concluída sem encontrar uma regressão ou decisão que justifique isso.

Depois:

- audite o código existente antes de projetar código novo;
- transforme o objetivo da fase em um slice pequeno, vertical e testável;
- implemente contratos antes de integrações complexas;
- mantenha V1 funcionando;
- não adicione rede, storage, dependências ou serviços externos sem necessidade comprovada;
- crie testes de unidade, contrato, integração e regressão adequados;
- preserve provenance/Evidence para qualquer dado externo;
- mantenha tenancy e autorização no domínio correto;
- não coloque segredos no código;
- não faça refactors não relacionados apenas para deixar o código mais bonito.

### Gates

Execute todos os scripts existentes relevantes, incluindo quando disponíveis:

- `npm run tipos:ts`
- `npm run tipos:v2`
- `npm test`
- `npm run build`
- `npm run smoke`
- `npm run v2:integracao`
- `npm run caminho-critico`
- `npm run prova-offline`
- `npm run sonda-memoria`
- `git diff --check`

Se um gate não existir, informe `N/A`. Se falhar, investigue e corrija antes de declarar a fase concluída. Não falsifique resultados.

### Git

Antes de publicar:

- confira o diff completo;
- confirme que não existem alterações de terceiros para incluir;
- verifique que o branch remoto não avançou de forma incompatível;
- não use force push;
- faça commit com mensagem clara;
- publique na `main` somente se todos os gates relevantes estiverem verdes.

### Documentação

Ao terminar, atualize:

- matriz de execução;
- documentação da fase;
- Decision Log/ADR se houver decisão arquitetural;
- changelog/histórico quando aplicável.

### Relatório obrigatório

Retorne:

```text
PHASE XX — Nome
Status: DONE/BLOCKED

Objetivo:
...

Implementado:
...

Arquivos principais:
...

Testes:
...

Gates:
...

Commit:
...

SHA:
...

Impacto na V1:
...

Limitações/riscos:
...

Próxima fase:
...
```

### Regra final

Não pare depois de escrever código. A fase só existe como concluída quando implementação, testes, documentação, validação e publicação estiverem alinhados. Se algo estiver ambíguo, prefira investigar o repositório e registrar a decisão em vez de inventar.
