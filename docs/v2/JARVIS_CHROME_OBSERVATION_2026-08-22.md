# Observação no Chrome — JARVIS publicado

**Data:** 2026-08-22  
**URL:** `https://projeto-baluarte.vercel.app/#/jarvis`  
**Modo:** inspeção read-only; nenhum login, segredo, formulário ou ação externa executada.

## Estado observado

A aplicação pública carregou a rota `/jarvis` com a tela de inicialização Mark XIII e, após a espera, mostrou o console integrado. A superfície contém sidebar modular, barra superior Baluarte, console Mark XIII, canvas central do núcleo, telemetria lateral, presença Spotify, seleção de temas, configuração de modos, sessões e chat.

O console mostrou `VERSÃO V1.2.6`, `NÚCLEO VISUAL`, `REDE PENDENTE`, `SAÚDE OBS. UNKNOWN`, `AUTORIDADE NÃO AUTORIZADA` e `MOTOR NATIVO (GUGF)`. O estado de música apareceu como `SPOTIFY OFF`. Existem conversas persistidas localmente na interface pública, mas nenhuma API key foi exibida ou lida.

O botão `⚙ MODOS & CONFIG` está disponível. O modo observado é `AGENTE`; a configuração do modo exibe campo de API key Claude no código da página, atualmente gravado por `saveConfig`, e a própria UI informa que essa chave fica no `localStorage` e vai diretamente para `api.anthropic.com`. Isso é um risco de superfície para produção e não deve ser resolvido colando chave no chat ou na imagem.

## Comparação com a referência visual fornecida

A referência apresenta a mesma linguagem visual: tema escuro, ouro/âmbar, sidebar fixa, console Mark XIII, núcleo central com órbitas/partículas, telemetria à direita, barra de presença musical e chat abaixo. O deploy atual já contém esse console; a principal diferença funcional observada é que o estado de rede/saúde permanece `UNKNOWN/PENDENTE` e o chat mostra o modo Agente sem API key server-side validada.

## Próxima ação segura

O trabalho deve separar três coisas: (1) preservar o visual Mark XIII como referência; (2) adicionar estados visuais bounded para configuração ausente, servidor degradado e modo local/WebLLM disponível; e (3) documentar que chaves Claude/Gemini/OpenRouter devem permanecer em Environment Variables do servidor ou em runtime local controlado. O navegador não deve ler nem persistir secrets de produção.
