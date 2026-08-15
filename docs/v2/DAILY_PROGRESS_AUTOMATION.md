# Relatórios diários e alertas do Projeto-Baluarte

## 1. Objetivo

Criar uma rotina de acompanhamento que explique diariamente o estado real da V2, o que avançou, o que ainda falta, quais gates passaram, quais causas raiz continuam abertas, quais issues novas exigem atenção e quais releases estão próximas. O relatório deve servir ao Lucas e aos colaboradores, sem substituir revisão humana nem enviar comandos destrutivos.

O sistema deve sempre reportar o SHA observado, a data/hora, a branch, os counts da migração TypeScript, os gates do commit, o estado das branches de feature, issues prioritárias e o próximo passo recomendado. Um “verde” sem SHA ou sem log identificável não pode ser tratado como evidência.

## 2. Conteúdo do relatório diário

| Seção | Conteúdo |
| --- | --- |
| Resumo executivo | O que mudou desde o relatório anterior e qual é o risco principal |
| Migração TypeScript | Páginas canônicas restantes, wrappers, implementações, contratos e última onda publicada |
| CI e bots | CI, Core CI, V2 Core, V2 Validation, Runtime, Vigia, CodeQL, Arma 3, Supabase e Vercel |
| Causas raiz | Problemas independentes, efeitos cascata e status de cada correção |
| Issues | Issues novas, reabertas, bloqueadoras, de segurança, release ou que mencionem o operador |
| Features | Estado de `feature/login-cadastro`, JARVIS, OpenClaw, PokeDesk, Wiki Arma 3 e layout |
| Releases | Marco atual, critérios cumpridos, bloqueios e próxima promoção possível |
| Próximo dia | Tarefas concretas, testes esperados e arquivos afetados |
| Segurança | Confirmação de que nenhum segredo apareceu no diff, log, URL ou artefato |

## 3. Alertas importantes

Nem toda issue gera e-mail. O monitor deve alertar quando ocorrer pelo menos uma destas condições: issue nova com label de blocker/security/release; issue atribuída ao proprietário ou a um colaborador configurado; issue que menciona `main`, `V2`, `login-cadastro`, Supabase, Vercel, segurança ou release; workflow vermelho por causa nova; regressão em gate anteriormente verde; mudança de branch de feature relevante; ou rate limit externo que bloqueie uma promoção.

O alerta deve conter título, número, URL, autor, labels, motivo da prioridade e ação sugerida. O corpo nunca deve incluir tokens, cookies, service keys, senhas, conteúdo privado não autorizado ou dumps completos de logs.

## 4. Alternativas de execução

| Abordagem | Trade-offs | Custo | Complexidade de setup |
| --- | --- | --- | --- |
| Relatório diário dentro da conversa | Mais simples; não exige e-mail nem servidor; depende de o usuário abrir a tarefa | Baixo por execução | Baixa |
| Serviço de relatório com cron e painel | Permite histórico, parâmetros, colaboradores, deduplicação e envio por e-mail; exige hospedagem e configuração de provedor | Sem custo por execução no plano gerenciado, sujeito a limites do provedor de e-mail | Média |
| Tarefa diária com análise completa | Bom para resumo com julgamento e explicação; não é adequado para polling frequente; depende da execução agendada e dos conectores | Consome execução diária | Baixa/média |

A recomendação de produto é começar com o **gerador determinístico versionado no repositório**, que coleta evidências e escreve Markdown/JSON. Depois que os destinatários e o provedor de e-mail forem confirmados, conectar uma entrega diária. A análise textual pode ser adicionada depois, mas o dado bruto deve continuar reproduzível.

## 5. Componentes planejados

| Componente | Responsabilidade | Saída |
| --- | --- | --- |
| `scripts/v2-daily-report.mjs` | Coletar SHA, git status, inventário, gates e branches | `reports/daily/YYYY-MM-DD.md` e `.json` |
| `scripts/v2-issue-monitor.mjs` | Ler issues/PRs e aplicar regras de prioridade/deduplicação | `reports/daily/issues.json` |
| `scripts/v2-gate-summary.mjs` | Normalizar jobs e agrupar causas raiz | Matriz de gates e causas |
| `docs/v2/DAILY_PROGRESS_AUTOMATION.md` | Contrato operacional e regras | Este documento |
| Configuração de destinatários | E-mails e papéis dos colaboradores | Variáveis protegidas, nunca commitadas |
| Entrega diária | Enviar somente o resumo e links seguros | E-mail ou outro canal aprovado |

## 6. Segurança e confirmação

O sistema não deve enviar mensagens externas sem destinatários e provedor definidos pelo usuário. A configuração deve usar segredos protegidos, nunca `.env` commitado, URL pública com token, frontend ou log. O envio para colaboradores deve ser revisável e desativável. Alertas sobre issues são informativos; o bot não deve comentar, fechar, atribuir, fazer merge, pagar ou publicar sem confirmação explícita.

O monitor também deve falhar de forma honesta: se GitHub, Supabase ou Vercel estiverem indisponíveis, registrar `unknown/external` e não converter ausência de dados em sucesso. Se o rate limit bloquear um deploy, o relatório deve recomendar espera/retry, não modificação de código.

## 7. Agendamento inicial proposto

O horário ainda precisa ser confirmado pelo proprietário. A configuração inicial sugerida é uma execução por dia, fora do intervalo de maior atividade, com um relatório completo e alertas imediatos apenas para eventos críticos. A frequência diária é deliberada: polling por minuto ou hora não deve ser implementado como sessões completas; se a necessidade crescer para quase tempo real, será preciso um serviço persistente com limites e custo explicitados.

## 8. Configuração inicial ativada

A configuração inicial foi ativada em 15 de agosto de 2026: destinatário `lucasbb2007@gmail.com`, Gmail conectado e rotina diária às **09:00 em `America/Sao_Paulo` (GMT-3)**. O agendamento está ativo e vinculado ao conector Gmail. A execução foi instruída a enviar o resumo diário e alertas críticos, mas permanece proibida de comentar, fechar, atribuir, fazer merge, publicar ou executar qualquer ação destrutiva no GitHub.

A rotina continua usando o gerador versionado (`npm run relatorio:diario`) e o monitor (`npm run monitor:issues`). Se uma execução externa exigir confirmação adicional de envio, o relatório não deve ser considerado entregue até que a confirmação apareça; a coleta e o arquivo local continuam sendo a fonte de auditoria.

## 9. Aceite

O sistema estará pronto quando gerar dois relatórios consecutivos com o mesmo esquema, detectar uma issue prioritária sem duplicá-la, diferenciar causa raiz de cascata, registrar o SHA correto, produzir o estado de release e permitir desativar a entrega sem alterar o código. O primeiro relatório real deve ser anexado ao repositório e ao e-mail somente depois que o proprietário confirmar os destinatários e o canal.
