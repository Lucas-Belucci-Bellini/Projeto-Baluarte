# V2 — local backup/restore drill

**Data:** 2026-08-26  
**Gap:** `RECOVERY-001`  
**Status:** ensaio local reproduzível; recuperação de produção ainda não aprovada  
**Comando:** `npm run drill:v2:backup`

## Objetivo

Demonstrar, em um processo local isolado, que a ponte de backup já existente consegue exportar dados locais, validar o envelope, limpar o storage e restaurar os dados esperados sem reabrir dois riscos conhecidos: importar uma sessão de autenticação ou gravar uma chave não declarada.

Este drill não reimplementa `montarBackup()`, `validarBackup()` ou `restaurarBackup()`. Ele exercita essas funções existentes sobre o fallback in-memory do storage quando executado no Node, sempre limpando o estado ao final mesmo em caso de falha.

## Cenário reproduzível

| Etapa | Verificação |
|---|---|
| Preparação | Limpa permissões, flags e storage; reaplica a política local. |
| Dados | Grava `editor:state` com Unicode, `ui:theme` e a chave de sessão forjada para verificar exclusão. |
| Exportação | Monta e valida o backup; `auth:session` não aparece no envelope. |
| Perda simulada | Executa `clearAll()` e confirma que os dados de aplicação desaparecem. |
| Restauração | Restaura o backup e compara o editor com acentos e a preferência de tema. |
| Adulteração | Injeta uma chave desconhecida e confirma que ela é ignorada e não gravada. |
| Limpeza | Executa `clearAll()` no bloco `finally`, sem deixar o sandbox contaminado. |

## Resultado observado

A execução passou com `backupValidado: true`, `editor:state`, `permissoes` e `ui:theme` restaurados, `sessaoExcluida: true` e `chaveDesconhecidaIgnorada: true`. A suíte canônica `test/backup.test.js` passou `14/14` na mesma iteração.

O campo `rpoRto` permanece explicitamente `não-aprovados`. O ensaio demonstra comportamento funcional do caminho local; não mede janela de perda aceitável, tempo de recuperação operacional, durabilidade de arquivo, criptografia em repouso, disponibilidade, retenção ou restauração entre máquinas.

## Limites de segurança

O comando não usa rede, banco, Supabase, storage remoto, provider, login, sessão real, credencial, filesystem de produção ou autoridade server-side. Ele não altera o formato do backup e não transforma o arquivo local em fonte autorizada de identidade ou tenancy.

A chave `auth:session` é deliberadamente excluída tanto na exportação quanto na restauração. Chaves desconhecidas continuam sendo reportadas como ignoradas. O drill não testa e não afirma recuperação de dados remotos, RLS, Billing, Evidence server-side ou Auth real.

## O que continua bloqueado

`RECOVERY-001` só poderá ser reclassificado quando houver contrato aprovado para RPO/RTO, localização e durabilidade do backup, criptografia e gestão de chaves, retenção, ownership, tenancy, concorrência, auditoria, staging isolado, restauração destrutiva controlada, custo e rollback. O próximo passo não é ligar escrita remota por inferência: é obter a decisão operacional e a autorização de ambiente.

## Rollback

O rollback deste slice remove o comando npm, o script do drill, seus documentos e a cobertura específica sem alterar o mecanismo de backup V1/V2 bridge. O storage é limpo ao fim do ensaio, e a execução não cria migração nem artefato remoto.
