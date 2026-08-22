# Verificação live — JARVIS Núcleo V7

**Data/hora observada:** 2026-08-22 23:02 (horário da sessão)  
**URL:** https://projeto-baluarte.vercel.app/#/jarvis  
**Método:** observação visual browser e inspeção DOM read-only  
**Status:** V7 instalado e ativo na rota publicada

## Evidência observada

A rota real `/jarvis` exibiu o astrolábio 3D dourado, partículas, anéis e os controles do artefato V7 (`MÚSICA`, `FICHEIRO`, `MICROFONE`, `PULSO`, `VARRIMENTO`, `DISSECAR`, `RETRATO`, `ROTAÇÃO` e `CAPTURA`). O chat, a configuração do Spotify e a navegação da aplicação principal permaneceram presentes.

A inspeção DOM encontrou:

| Campo | Valor observado |
|---|---|
| Versão exibida pela aplicação | `1.3.4` |
| Frame V7 | encontrado |
| `src` | `https://projeto-baluarte.vercel.app/project%20V2/Modelar%20objeto%203D/jarvis-nucleo-v7.html` |
| Estado visual | `ready` |
| Frame oculto | `false` |
| Sandbox | `allow-scripts allow-same-origin` |
| Atributo `allow` | ausente |
| Fallback Mark XIII | encontrado |
| Fallback oculto | `true` |

## Conclusão

O motor visual mostrado nas imagens está instalado na rota publicada e, no momento da verificação, está no lugar do visual principal do app. O texto `Mark XIII` no cabeçalho e na identidade do produto não significa que o visual antigo esteja substituindo o V7; ele permanece como marca da plataforma e como fallback técnico. O visual V7 é o frame ativo (`data-visual-state="ready"`), enquanto o fallback está oculto.

Esta verificação não concedeu microfone, autoplay, playback Spotify, captura de áudio, tokens ou autoridade ao iframe. A inspeção foi somente leitura e não realizou login nem alterou dados externos.
