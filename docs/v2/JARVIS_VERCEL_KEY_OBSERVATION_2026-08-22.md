# Observação Vercel — configuração do JARVIS

**Data:** 2026-08-22  
**Modo:** inspeção read-only no Chrome conectado; nenhuma variável foi criada, editada ou apagada.

## Estado observado

A sessão do usuário está autenticada no dashboard Vercel `lucasbellini-1240`. O projeto `projeto-baluarte` aparece na lista com domínio `projeto-baluarte.vercel.app` e vínculo ao repositório `Lucas-Belucci-Bellini/Projeto-Baluarte`.

O deploy público já carrega o console Mark XIII/JARVIS e o código do repositório informa que os modos `Servidor`, `Hermes (servidor)` e `Claude (servidor)` esperam chaves em Environment Variables da Vercel. O código também preserva modos sem chave: Local, Navegador/WebLLM e Hermes local.

## Decisão de segurança

Nenhuma API key foi lida, copiada, exibida, inserida ou salva. Para corrigir a indisponibilidade do modo de servidor, a variável precisa ser criada no projeto Vercel correto, com o ambiente adequado e redeploy posterior. Essa é uma operação sensível e exige confirmação do operador antes de qualquer alteração. A chave deve ser digitada diretamente no formulário da Vercel pelo usuário; ela não deve ser enviada no chat, colocada em arquivo do repositório, incluída em commit ou exposta no frontend.
