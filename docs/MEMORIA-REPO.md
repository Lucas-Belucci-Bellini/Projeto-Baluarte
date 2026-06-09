# 🗄️ Memória versionada no repositório

A memória do JARVIS pode ser **guardada dentro do próprio repositório** (além do
localStorage): toda memória nova vira um **commit**, e a IA **busca** nela antes
de responder. Assim a memória é **compartilhada entre dispositivos**, versionada
e auditável — e alimenta o Segundo Cérebro e o Raio-X automaticamente.

## Onde fica
- Branch dedicada **`jarvis-memory`**, arquivo **`memoria/banco.json`**.
- Fica numa branch separada de propósito: assim **um commit por pergunta NÃO
  redeploya** o site (que vive no `main`).

## Como funciona
- `api/memory.py` (Vercel, só stdlib) commita/lê via API do GitHub.
- `src/utils/jarvis-repo-memory.js` no cliente: saves **serializados** (um de
  cada vez, sem conflito) e **gateados** (se não houver token, para de tentar).
- `jarvis-brain` mescla as memórias do repo às locais em toda leitura →
  recall, `/memoria`, `/cerebro` e `/codigo` já as enxergam.

## Como ligar (2 min)
1. Crie um **fine-grained PAT** em GitHub → Settings → Developer settings →
   Fine-grained tokens, com acesso **só ao repo `Projeto-Baluarte`** e permissão
   **Contents: Read and write**.
2. Na Vercel → projeto **projeto-baluarte** → **Settings → Environment Variables**:
   - `GITHUB_TOKEN` = o PAT (Production + Preview).
   - *(opcional)* `GITHUB_REPO` (padrão `Lucas-Belucci-Bellini/Projeto-Baluarte`),
     `MEMORY_BRANCH` (padrão `jarvis-memory`).
3. **Redeploy.** A primeira memória cria a branch e o arquivo sozinha.

## Bom saber
- **Um commit por memória** (pergunta, resposta, consenso do conselho, etc.).
  Como é na branch `jarvis-memory`, não gera builds do site.
- Sem `GITHUB_TOKEN`, nada quebra: o site só usa o localStorage (a função
  responde "token ausente" e o cliente para de tentar na sessão).
- Em `/memoria`, o botão **☁️ Repo** puxa a memória versionada na hora.
