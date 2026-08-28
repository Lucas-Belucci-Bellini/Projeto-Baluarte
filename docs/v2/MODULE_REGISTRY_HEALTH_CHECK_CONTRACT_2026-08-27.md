# Module Registry Health Check — contrato local/read-only

**Marco:** `v2.0.0-alpha.19`

**Estado:** contrato de validação local; não é autoridade de produção.

**Autor:** Manus AI

## Propósito

O check `module_registry_health` transforma em evidência operacional bounded uma parte já existente do contrato canônico de Module Registry Health. Ele não cria um novo Registry, não substitui o Runtime Health e não decide autorização remota. Seu objetivo é provar, em uma execução determinística local, que os estados de fallback, degradação, quarentena e overrides auditados continuam coerentes com o contrato existente.

## Invariantes cobertas

| Invariante | Observação exigida |
|---|---|
| Módulo desconhecido | `unregistered` e `podeAtivar: false`; nenhum fallback ativa identidade inexistente |
| Módulo registrado | Começa `registered` e pode ser ativado quando o Runtime Health não o bloqueia |
| Saúde positiva | Estado `healthy` continua observável e ativável |
| Falha isolada | Uma falha fica `degraded` sem derrubar o módulo irmão ou o Registry inteiro |
| Falhas excedentes | O estado `exhausted` do Runtime aparece como `quarantined` e bloqueia ativação |
| Override autorizado | `maintenance` exige decisão autorizada, motivo e metadados de auditoria quando `requireAudit` está ativo |
| Override negado | Negação server-side mantém o modo anterior e não altera o Registry |
| Cópia defensiva | Mutar um array retornado por `resumo()` não muta o estado interno subsequente |

## Execução

O comando canônico é:

```sh
npm run check:module-registry-health
```

O Doctor executa o mesmo comando como `module_registry_health`, categoria `security-local` e política `safe`:

```sh
npm run verify:v2
```

A saída JSON possui escopo `module-registry-health/local`, seis casos, três decisões `allow`, três decisões `deny`, uma entrada de auditoria, três incidentes e `network: not-used`.

## Fronteiras de segurança

A fixture usa somente `criarModuleRegistryHealth`, `criarRuntimeHealth` e um Registry sintético local. Não acessa rede, filesystem de aplicação, banco, Supabase, Auth, RLS, tenancy, ownership, service role ou credenciais. Não inicia, para, reinicia, instala, importa ou executa módulos reais. A autorização usada no caso de manutenção é uma decisão sintética do teste e não deve ser promovida a política de produção.

> **Regra:** evidência local de quarentena ou autorização sintética prova somente a coerência do contrato local. Ela não prova que identidades, claims, RLS, auditoria persistente ou autoridade server-side de produção estão configurados.

## Compatibilidade e rollback

O slice adiciona apenas o script de check, o comando de package, a entrada do Doctor e a expectativa focal do Doctor. Não altera V1, router, sidebar, wrappers, Service Worker, Runtime Rust, transporte, IPC ou launcher. Reverter o slice remove o comando e a observabilidade adicional do Doctor; os contratos canônicos de Health e os testes existentes permanecem independentes.

## Critério de conclusão do marco

A alpha.19 somente pode ser publicada depois de PR técnica, PR documental, backups remotos, checks remotos sem falhas/pending relevantes e workflows pós-merge verdes no SHA final. Mesmo publicada, ela continuará sendo um marco local/read-only e não fechará a Phase 2, a Phase 7, a Phase 22 ou os critérios de Beta/RC/Stable.

— **Manus AI**
