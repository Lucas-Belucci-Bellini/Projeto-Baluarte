# Bot Specialization Model

## Objetivo

O Baluarte pode usar agentes especialistas por linguagem/responsabilidade em vez de um único agente que tente dominar todo o stack.

## Especialistas iniciais

- TypeScript: interface web, 3D e Core de Orquestração.
- Rust: Core de Runtime, parsers binários e Tauri.
- Python: IA, coleta e automação.
- PostgreSQL/Supabase: dados, persistência, RLS e filas.
- CI/DevOps: GitHub Actions, Vercel, builds e releases.
- Security: permissões, isolamento, dependências e revisão de mudanças sensíveis.

## Regra de autoridade

Especialistas podem alterar somente suas áreas e devem respeitar ADRs, contratos e regras V2. Nenhum especialista deve alterar `main` diretamente.

Fluxo padrão:

```text
especialista → branch → testes → PR → revisão especializada → integração → merge
```

## Orquestrador

Um agente coordenador pode distribuir tarefas, reunir resultados e detectar conflitos entre especialistas. Ele não substitui o conhecimento profundo de cada especialista.

## Contratos entre especialistas

Mudanças que atravessam fronteiras devem explicitar:

1. contrato alterado;
2. consumidores afetados;
3. testes de integração;
4. impacto de performance;
5. impacto de segurança;
6. migração, quando necessária.

## Princípio

Especialização reduz contexto desnecessário e aumenta a profundidade da revisão. Coordenação central preserva coerência arquitetural.
