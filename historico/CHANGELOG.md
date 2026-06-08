# 📜 Histórico de Alterações — Projeto Baluarte

Registro do que entra no `main`. Fluxo de segurança: **antes de cada merge** é
criada uma branch de backup (`backup/AAAA-MM-DD-...`); **depois** registra-se
aqui o que mudou.

---

## 2026-06-07

### PR #174 — Arsenal Expandido vira banco de dados (44 → 140 armas)
- ⚔ **Arsenal Expandido:** dados movidos para `src/data/arsenal-expandido-db.js` (banco extensível), expandidos de ~44 para **140 armas** reais.
- 🛩 Nova categoria **Drones**. Total: Infantaria 35 · Blindados 19 · Artilharia 13 · Aéreo 23 · Naval 16 · Mísseis 23 · Drones 11.
- 🛡️ Backup: `backup/2026-06-07-pre-merge-pr174`.

### PR #173 — +5 universos (21 skins) + Banco de dados e Enciclopédia Militar
- 🌌 **Universos:** +Monsterverse, Titanfall, God of War, Devil May Cry, Fate (16 → 21 skins).
- 🎖️ **Seção Militar:** novo banco de dados `src/data/militar-db.js` (13 categorias) + página `/enciclopedia-militar` navegável.
- 🛡️ Backup: `backup/2026-06-07-pre-merge-pr173`.

### PR #172 — JARVIS com IA real (Gemini) + Repaginação por Universos
- 🤖 **JARVIS** modo Servidor com **Gemini 2.5 Flash + busca no Google** (key server-side); dossiê do Baluarte injetado no contexto.
- 🌌 **Motor de Universos:** 16 skins completos (cor/tipografia/formas/atmosfera) com identidades autênticas das franquias.
- 🎯 Menu com **~65 ícones de linha** que herdam a cor do universo.
- 🛡️ Backups: `backup/2026-06-07-jarvis-universos-1/2/3`.

### PR #166 — JARVIS Skills + Dossiê + Radar do Câmbio + Música + fix cap 21
- 🧬 **JARVIS Skills auto-criadas** (sandbox de 3 camadas, persistência, UI).
- ▣ **Dossiê das Forças** (`/dossie`) gerado dos Google Docs.
- 💹 **Radar do Câmbio** (`/dolar`): Dólar/Euro/BTC, banco + relatórios a cada 12h.
- 🎵 **Música:** 30 faixas do SoundCloud com loop ao clicar.
- 🔧 **Crônicas:** Capítulo 21 de "A Névoa e o Aço".

### PRs #163 / #165 — Crônicas vivas + integrações
- 📖 Sincronização automática das **Crônicas** com os Google Docs (a cada 12h).
- 🔌 Doc de **integrações futuras** (hermes-agent, gemini-cli, radar).
