# Platform → Module Registry Diagnostic — Wave 1

## Status

`IMPLEMENTED LOCALLY — PENDING PUBLICATION`

## Objetivo

Expor o resumo operacional do Module Registry dentro do diagnóstico da fachada Platform, sem criar uma segunda fonte de observabilidade e sem alterar o boot da V1. A integração conecta a superfície `Platform.diagnostico()` ao adaptador `module-registry-health.js` por uma opção explícita.

## Contrato

`criarPlataforma(registry, boot)` continua válido para consumidores existentes. Quando a terceira opção `registryHealth` não é fornecida, a fachada cria um retrato neutro dos módulos registrados: `mode = registered`, `status = unknown`, zero reinícios e ativação permitida pelo contrato local. Quando o adaptador é fornecido, `Platform.diagnostico().registry.modulos` devolve os modos reais `healthy`, `degraded`, `quarantined`, `maintenance` ou `disabled`.

Essa opção evita acoplamento obrigatório entre Platform e um mecanismo de health específico. O Registry continua responsável por registro/selagem, o Runtime Health continua responsável por falhas/restarts e a Platform apenas compõe diagnóstico.

## Segurança

O diagnóstico não concede acesso. A transição para `maintenance`, `disabled` ou `active` continua exigindo o callback de autorização server-side definido no piloto Registry. A fachada não lê claims client-side, não aceita service role e não permite que um módulo não registrado apareça como ativo.

## Testes

`test/v2/plataforma.test.js` mantém as asserções existentes de Supervisor, Health e Lifecycle e acrescenta a verificação do retrato neutro compatível e de um override `maintenance` autorizado. Os testes do Registry Health continuam cobrindo deny-by-default, quarentena e isolamento de módulos vizinhos.

## Rollback

O rollback é o revert da alteração em `v2/core/plataforma.ts`, do teste e deste documento. Consumidores antigos continuam usando a assinatura de dois argumentos, portanto o risco de incompatibilidade é limitado à nova propriedade de diagnóstico.

## Próximo passo

Conectar a opção `registryHealth` ao construtor real do Runtime quando o bootstrap fornecer uma instância compartilhada, sem criar outro supervisor. Depois disso, a autorização server-side/RLS deverá registrar quem colocou um módulo em manutenção, por qual motivo, quando e qual operador aprovou a mudança.
