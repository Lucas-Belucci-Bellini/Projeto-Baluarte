# Baluarte V2 — Prompts de Execução

Este diretório concentra os prompts operacionais usados para continuar a reconstrução da V2 por fases.

## Arquivos

- [`V2_MASTER_EXECUTION_PROMPT.md`](./V2_MASTER_EXECUTION_PROMPT.md) — prompt principal para Manus/Claude/Codex/Agentes. Define missão, regras, gates, fases 00–22, política Git/GitHub e Definition of Done.
- `PHASE_XX_PROMPT.md` — prompts específicos de fase podem ser criados quando uma fase exigir instruções mais detalhadas.

## Como usar

1. Abra o `V2_MASTER_EXECUTION_PROMPT.md` antes de iniciar uma sessão de desenvolvimento.
2. Leia `docs/v2/MASTER_EXECUTION_MATRIX.md` e descubra a primeira fase realmente pendente.
3. Não refaça fases concluídas sem evidência de regressão ou decisão arquitetural.
4. Execute apenas um slice por vez.
5. Rode os gates disponíveis.
6. Atualize a documentação e a matriz.
7. Publique na `main` apenas depois de validar o resultado.
8. Registre SHA, testes, limitações e próximo passo.

## Regra de continuidade

O prompt é um contrato de execução, não uma autorização para ignorar o estado real do código. O repositório é a fonte de verdade. Se código, documentação e prompt divergirem, o agente deve auditar a divergência, registrar a decisão e seguir pelo caminho seguro.

## Estado atual

A V2 já possui uma base de documentação/arquitetura e slices de Evidence Layer. A execução deve continuar a partir da matriz real do repositório, não voltar automaticamente à Phase 00.
