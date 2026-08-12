# Baluarte V2 — Delivery Roadmap

## Horizonte

Meta operacional: chegar a uma V2 utilizável até **junho de 2027**, mantendo a arquitetura da #423 como ordem de construção. O prazo é uma meta de entrega, não autorização para remover contratos, testes ou gates de segurança.

## Faixas de entrega

### Faixa A — Fundação

- [x] Manifest Contract
- [x] Module Registry
- [x] Permission System
- [x] Runtime Rust inicial
- [x] Runtime Bridge
- [x] Runtime envelope v1
- [x] Runtime Host
- [x] Health / Readiness
- [x] Supervisor inicial
- [ ] integração completa Boot → Supervisor → Runtime Host
- [ ] contrato de transporte estabilizado

### Faixa B — Core operacional

- [ ] Module lifecycle formal
- [ ] startup/shutdown supervisionado
- [ ] diagnóstico unificado
- [ ] event contract
- [ ] API contract
- [ ] storage contract
- [ ] testes de integração Core ↔ Runtime

### Faixa C — Migração controlada

- [ ] primeira família de módulos migrada
- [ ] adapters para comportamento V1 necessário
- [ ] TypeScript no Core de Orquestração
- [ ] CI com gates V2 obrigatórios
- [ ] regressão V1/V2 documentada

### Faixa D — Plataforma

- [ ] transporte local real
- [ ] Tauri quando o contrato justificar
- [ ] observabilidade persistente
- [ ] isolamento por módulo endurecido
- [ ] ferramentas de diagnóstico para operador

### Faixa E — Módulos grandes

Somente após os gates anteriores:

- [ ] Wiki System
- [ ] módulos de ferramentas
- [ ] módulos de IDE
- [ ] módulos 3D
- [ ] outros módulos derivados de #422

## Regra de velocidade

O projeto pode avançar em paralelo quando as fronteiras forem independentes. Não pode pular uma fundação para entregar uma feature grande.

A pergunta para cada etapa é:

> **"Isto reduz o risco de construção dos próximos módulos ou apenas adiciona uma feature?"**

Se for a primeira, entra na fundação. Se for a segunda, fica para a faixa de módulos.

## Gates antes da V2 operacional

1. contratos versionados;
2. testes de unidade e integração;
3. permissões deny-by-default;
4. Runtime separado do Core de Orquestração;
5. boot e shutdown idempotentes;
6. diagnóstico observável;
7. CI reproduzível;
8. migração de pelo menos um módulo real sem editar o Core para registrá-lo.
