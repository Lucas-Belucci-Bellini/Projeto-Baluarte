# V2 — Lifecycle Contract

## Objetivo

Definir a separação de responsabilidades entre Registry, Boot, Lifecycle e Supervisor.

```text
Registry
  ↓ decide quem existe e em que ordem
Boot
  ↓ orquestra a subida/descida
Ciclo
  ↓ executa init/start/stop/dispose por módulo
Supervisor
  ↓ coordena estado global e concorrência
Health
  ↓ observa liveness/readiness
```

## Estados do módulo

```text
registered → initializing → starting → running
                                  ↓
                               failed

running → stopping → stopped → disposed
```

A implementação atual do ciclo preserva a regra de descida inversa da ordem de subida.

## Estados do Supervisor

- `idle`
- `starting`
- `ready`
- `degraded`
- `stopping`
- `stopped`
- `failed`

O Supervisor não deve registrar rotas, criar módulos ou decidir permissões. Essas
responsabilidades pertencem ao Registry/Boot/Permission System.

## Regras

1. Startup e shutdown são operações coordenadas e não podem ser executadas
   simultaneamente.
2. `start` repetido depois de `ready` não inicializa o sistema duas vezes.
3. `stop` repetido depois de `stopped` não executa shutdown novamente.
4. Falha isolada de módulo produz `degraded`, não uma falha global automática.
5. Falha estrutural do Boot produz `failed`.
6. Health é observação; não é mecanismo de reparo automático.
7. Hot reload e atualização de versão ficam fora deste contrato até existir
   consumidor e especificação próprios.
