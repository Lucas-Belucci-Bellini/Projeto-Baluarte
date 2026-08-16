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

- [x] integrar a fachada ao entrypoint oficial da V2 — `v2/harness/main.js` sobe
  por `criarPlataforma`, não mais pelo `boot` cru. Coberto por
  `npm run v2:integracao` (navegador real), que voltou a rodar no Windows.
- [ ] contract test completo Manifest → Registry → Permission → Runtime
- [ ] lifecycle + Runtime Host: módulo só fica `running` quando sua autorização estiver disponível
- [ ] observabilidade de transições `starting/running/stopping`
- [ ] transporte concreto depois do contrato estabilizado
- [ ] primeiro vertical slice de módulo nativo

## Defeito conhecido no portão

`npm run v2:integracao` dá **13/14**. Falha `a superfície de briefing V2
renderiza`, e o próprio script aponta a causa provável:
[`V2_MODULE_RULES.md`](V2_MODULE_RULES.md) — *"view devolve o ELEMENTO"*.

É **anterior** à integração da fachada, medido: com o `harness/main.js` revertido
ao original, dá 13/14 igual, mesma asserção. Ficou invisível porque o portão não
rodava no Windows — o script morria em `spawn npx ENOENT` antes de abrir o
navegador. Exige `npx playwright install chromium` (114 MB) na máquina.

## Regra de manutenção

Uma caixa só vira `[x]` quando existe código e teste correspondente. Documentar
uma intenção não conta como implementação.
