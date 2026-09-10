# #203 — conselho de segurança

> **Status:** open · **Criada:** 2026-06-11 · **Atualizada:** 2026-06-11 · **Comentários:** 0
> **Issue viva:** https://github.com/Lucas-Belucci-Bellini/Projeto-Baluarte/issues/203
>
> _Snapshot do corpo da issue (2026-06-27), parte do "issues → docs". Para comentários e estado mais recente, abra a issue no link acima._

---

Isso deveria ficar como uma ferramenta que o site tenha mas o usuário normal não veja 

Central de APIs
Detecta, testa e gerencia as IAs do Baluarte (issue #200). As chaves do servidor ficam na Vercel (o site só vê existe/não-existe); as do navegador ficam no cofre local abaixo — nada vai para o repositório.

🛰 Chaves no servidor (Vercel)
✓
Gemini (chat + busca web)
gemini-2.5-flash
✓
Hermes (OpenRouter)
nousresearch/hermes-3-llama-3.1-70b
✓
Claude (Anthropic)
env: Claude_Fable · claude-sonnet-4-6
A chave Claude é detectada mesmo com nome personalizado (valor começando com sk-ant- ou nome contendo claude/anthropic). Latência do /health: 27ms.

◉
JARVIS Local
navegador · sem chave
Assistente de regras embutido: navega no site e consulta equipes/armas/arcos. Sempre disponível.

✓ ok · 0ms · sempre on
🤖
Claude (navegador)
chave no navegador
Chamada direta à API da Anthropic com a chave colada aqui (a mesma do ⚙ do JARVIS). Teste custa 1 token.

sk-ant-… (chave do navegador p/ modo Claude)
não testado
🛰
Claude (servidor)
chave na Vercel
Novo /api/claude: usa a chave Claude das Environment Variables (detecta até nome personalizado, ex: Claude_Fable).

✗ [erro da API Claude: HTTP 401 — invalid x-api-key]
🌐
Gemini (servidor)
chave na Vercel
O /api/chat de sempre (modo Servidor do JARVIS), com busca no Google. Use a detecção acima para ver a chave.

✓ ok · 1698ms · gemini-2.5-flash
⚖
Hermes (servidor)
chave na Vercel
OpenRouter (/api/hermes), membro do Conselho de IAs. Teste de verdade consome tokens — aqui só detectamos a chave.

✓ ok · 12ms · nousresearch/hermes-3-llama-3.1-70b
🦙
Ollama (local)
sua máquina · sem chave
Modelos locais via Ollama (http://localhost:11434). O teste lista os modelos instalados.

✗ Failed to fetch
🔐 Cofre local de chaves
Guardadas só neste navegador (localStorage) — nunca vão para o repositório nem para o servidor. "Usar no JARVIS" coloca a chave no modo Claude do assistente (⚙).

Cofre vazio — adicione uma chave abaixo.
