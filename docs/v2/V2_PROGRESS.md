# V2 — Registro de construção

Este arquivo é um retrato de implementação, não substitui o Master Plan, Rules ou
Decision Log. Serve para uma sessão nova descobrir rapidamente o que já existe.

## Fundação operacional

- [x] Manifest validation
- [x] Module Registry
- [x] Permission System
- [x] Module lifecycle (`init → start`, `stop → dispose`)
- [x] Runtime Rust
- [x] Runtime capabilities
- [x] Runtime filesystem confinement
- [x] Runtime envelope v1
- [x] Runtime Host por módulo
- [x] Runtime Bridge
- [x] Runtime bootstrap
- [x] Transport abstraction
- [x] Health / readiness
- [x] Supervisor global
- [x] Per-module lifecycle status
- [x] Operational platform facade

## Próximo bloco

- [ ] integrar a fachada ao entrypoint oficial da V2
- [ ] contract test completo Manifest → Registry → Permission → Runtime
- [ ] lifecycle + Runtime Host: módulo só fica `running` quando sua autorização estiver disponível
- [ ] observabilidade de transições `starting/running/stopping`
- [ ] transporte concreto depois do contrato estabilizado
- [ ] primeiro vertical slice de módulo nativo

## Regra de manutenção

Uma caixa só vira `[x]` quando existe código e teste correspondente. Documentar
uma intenção não conta como implementação.
