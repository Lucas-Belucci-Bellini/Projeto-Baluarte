# Baluarte V2 — Regras de Construção

> **Transcrito de [#423, comentário 2](https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/423#issuecomment-5234087837).**
> A partir daqui este arquivo é a versão de trabalho; a issue fica como origem.

Este documento contém regras **obrigatórias** para qualquer pessoa, agente de IA
ou sistema automatizado que modificar o Baluarte V2.

Estas regras têm prioridade sobre conveniência, velocidade ou preferências
pessoais de implementação.

---

## Isolamento e acoplamento

**1 — Não quebrar o Core.** Nenhum módulo pode ter poder suficiente para derrubar
o Core. Erro em módulo deve ser isolado sempre que tecnicamente possível.

**2 — Não criar acoplamento desnecessário.** Módulos conversam por APIs,
interfaces, eventos e contratos. Evitar importar implementação interna de outro
módulo.

**33 — Cada módulo deve ter limites claros.** Uma responsabilidade definida.
Evitar módulos que façam "tudo".

**34 — O Core deve permanecer pequeno.** Ele fornece infraestrutura;
funcionalidade deve preferencialmente ser módulo. Quanto mais entra no Core, mais
difícil evoluir.

**39 — O Baluarte deve ser expansível.** Uma nova categoria de módulo deve poder
ser adicionada sem reescrever o sistema inteiro.

## Antes de escrever código

**3 — Não duplicar sistemas.** Antes de criar API, Event Bus, logger,
configuração, cache, armazenamento, autenticação ou permissões: **verificar se o
Core já tem**. Segunda implementação exige justificativa.

**4 — Não reescrever sem motivo.** Não reescrever porque outra implementação
parece mais bonita. Reescrita precisa apresentar: problema atual, solução,
benefício, riscos, impacto e plano de migração.

**5 — Não adicionar dependência sem justificativa.** Verificar: já existe solução
no projeto · tamanho · manutenção · licença · segurança · impacto no bundle ·
necessidade.

**24 — Não "corrigir" comportamento sem entender.** Código estranho se investiga
primeiro — pode haver razão histórica ou dependência não óbvia.

**23 — Não apagar por suposição.** Antes de apagar arquivo, função, API, módulo,
evento ou dependência: **procurar todos os consumidores**.

**38 — Licenças importam.** Verificar licença e compatibilidade antes de
incorporar código externo. Nunca copiar sem verificar os termos.

## Qualidade e honestidade

**6 — Código novo precisa de teste.** Código crítico sem teste não está
concluído. Prioridade: Core > Module System > Permissions > Storage > Events >
APIs > módulos críticos.

**7 — Erros devem ser observáveis.** Não esconder falha silenciosamente.
Registrar, classificar, contextualizar, permitir diagnóstico. Evitar `catch`
vazio ou tratamento que ignore a falha.

**27 — Não mascarar falhas.** Não alterar código só para o teste passar sem
corrigir a causa. Não desabilitar teste, não diminuir cobertura artificialmente,
não ignorar erro, não esconder warning importante.

**19 — Performance deve ser medida.** Não afirmar "mais rápido", "mais leve" ou
"mais eficiente" sem medição quando ela for possível. Preferir benchmark.

**31 — Não sacrificar arquitetura por velocidade.** A V2 existe para construir
base melhor. *"Funciona" não significa "está pronto".*

**32 — Não sacrificar simplicidade por complexidade.** Arquitetura mais complexa
não é automaticamente melhor. Entre duas soluções que funcionem, a mais simples
que mantenha os requisitos.

## Estado, configuração e dados

**8 — Não confiar em estado global.** Estado deve ter proprietário, ciclo de
vida, escopo e mecanismo de acesso.

**9 — Configuração não deve estar espalhada.** URLs, limites, caminhos, flags e
parâmetros têm fonte definida — não espalhados por dezenas de arquivos.

**12 — Dados são classificados.** Antes de armazenar: origem, finalidade,
sensibilidade, retenção, acesso, necessidade de sincronização.

**36 — Recuperação é parte do projeto.** Sistemas críticos pensam em rollback,
recuperação, migração, backup e estado inconsistente — não apenas no caminho
feliz.

## Segurança

**10 — Segredos nunca entram no código.** Nunca no repositório: API keys, tokens,
senhas, credenciais, chaves privadas, secrets de produção. Mesmo em teste, usar
mecanismo apropriado.

**11 — Permissão mínima.** Módulo recebe só as permissões necessárias. Não
conceder acesso total por conveniência.

**20 — Segurança não é feature opcional.** Mesmo antes da V4, a V2 deve ter
fundamentos seguros. A V4 aprofunda.

**37 — Não presumir que o ambiente é confiável.** Entrada externa é não
confiável: arquivos, APIs, módulos, plugins, dados externos, conteúdo de usuário
e **resultados de agentes**.

**21 — Agentes de IA não têm autoridade absoluta.** Nenhum agente recebe
automaticamente acesso irrestrito a filesystem, execução, rede, secrets ou
modificação do sistema. Ferramentas têm permissões.

## Ciclo de vida dos módulos

**13 — Módulo deve poder ser removido.** Instalar deve ser reversível sempre que
possível; módulo não espalha dependência irreversível pelo sistema.

**14 — Versionamento.** Módulos têm versão. Alteração incompatível é
explicitamente identificada.

**15 — Compatibilidade.** Não quebrar API existente sem avaliar consumidores,
migração, compatibilidade e documentação.

**29 — Toda nova API precisa de dono.** Finalidade, consumidor, contrato, versão
e documentação.

## Escopo — o que **não** fazer agora

**17 — Não implementar o futuro antes da hora.** O roadmap (V3 Desktop, V4
Segurança, V5 IA, V6 Automação, V7 Jogos, V8 Otimização, V9 Gráficos, V10
Baluarte OS) **não** significa implementar tudo na V2. Preparar interface quando
necessário; não construir sistemas inteiros antecipadamente.

**18 — Preparar não significa acoplar.** É permitido criar interface para
funcionalidade futura. Não é permitido criar dezenas de dependências porque
aquela funcionalidade *poderá* existir.

**25 — Issues não são todos requisitos.** Issue antiga pode conter ideia, bug,
experimento, discussão, funcionalidade descartada ou duplicata. Não transformar
tudo automaticamente em tarefa da V2.

**40 — Pensar em 2030, implementar o necessário hoje.** A arquitetura deve
permitir chegar ao Baluarte OS; a V2 não deve tentar implementá-lo.

## Como trabalhar

**22 — Alterações grandes precisam de plano.** Antes de mexer em muitos arquivos:
mapear dependências · explicar a mudança · definir etapas · identificar riscos ·
implementar incrementalmente · testar cada etapa.

**28 — Small steps.** Pequena alteração → teste → revisão → próxima. Evitar
grande alteração em centenas de arquivos e descobrir problema no fim.

**26 — O agente deve parar quando não souber.** Havendo ambiguidade arquitetural
importante: **não inventar**. Documentar a dúvida e solicitar decisão.

**16 — Documentação é parte da implementação.** Funcionalidade importante não
está concluída se ninguém sabe como usar, quais suas limitações ou quais suas
dependências.

**30 — Toda decisão arquitetural importante deve ser registrada.** ADR ou
equivalente, no formato: Decisão · Contexto · Alternativas · Escolha ·
Consequências. → [`V2_DECISION_LOG.md`](./V2_DECISION_LOG.md)

**35 — A V2 deve ser observável.** Saber, sempre que possível: qual módulo está
executando, qual evento ocorreu, quanto demorou, qual recurso consumiu, qual erro
aconteceu, qual dependência estava envolvida.

---

## Regra final

Antes de cada alteração, perguntar:

> **"Isso torna o Baluarte mais modular, seguro, testável, observável e
> expansível?"**

Se não: questionar se a alteração realmente pertence à V2.
