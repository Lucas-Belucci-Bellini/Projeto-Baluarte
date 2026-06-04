# 🔌 Integrações Futuras — Projeto Baluarte

Registro das ferramentas/projetos que o Lucas quer integrar à plataforma.
Cada item traz **o que é**, **como encaixa no Baluarte** e o **status**.

> Atualizar este arquivo conforme cada integração for planejada/concluída.

---

## 1. 🧠 hermes-agent — turbinar o JARVIS
- **Repo:** https://github.com/NousResearch/hermes-agent
- **O que é:** framework de agente de IA (Nous Research). Loop de aprendizado com
  criação autônoma de *skills*, memória persistente com busca, subagentes
  isolados, scheduler (cron), TUI e integração multiplataforma
  (Telegram/Discord/Slack/WhatsApp/Signal/CLI). Stack: Python (~84%) + TS.
- **Encaixe no Baluarte:** evoluir o **JARVIS** — `src/utils/jarvis-engine.js`,
  `jarvis-memory.js`, `jarvis-recall.js`, `jarvis-tools.js` e o backend
  `jarvis-python/`. Trazer conceitos de skills auto-criadas, memória e subagentes.
- **Status:** 🟢 **em progresso** · Prioridade: ALTA
  - ✅ **Skills auto-criadas (V1)** — o JARVIS cria, salva e reusa habilidades
    próprias via `create_skill` / `list_skills` / `delete_skill` (modo Agente).
    Sandbox de 3 camadas (denylist + shadowing de globais + strict, sem segredos),
    persistência no `localStorage` e UI das skills aprendidas. Módulo:
    `src/utils/jarvis-skills.js`. Guia: [`docs/JARVIS-SKILLS.md`](./JARVIS-SKILLS.md).
  - ⏳ **Próximos:** memória/perfil do operador, subagentes isolados, scheduler.

## 2. 💎 gemini-cli — ferramentas de IA no terminal/editor
- **Repo:** https://github.com/google-gemini/gemini-cli
- **O que é:** agente de IA open-source do Google para terminal. Gemini (contexto
  de 1M tokens), ferramentas (busca, arquivos, shell, web), **MCP**, integração
  GitHub. Stack: TypeScript (~98%) — combina com o Baluarte (JS).
- **Encaixe no Baluarte:** capacidades de IA no **Editor de Código** e no terminal
  (`src/data/terminal-commands.js`); suporte a **MCP** para extensões.
- **Status:** ⏳ a planejar

## 3. 📡 AERIS-10 / PLFM_RADAR — ferramenta de Radar
- **Repo:** https://github.com/CoderTom314/NawfalMotii79-PLFM_RADAR-8cd5464cf8f141fc973e34434ebb3e46060f67cf
- **O que é:** sistema de radar *phased array* open-source (10.5 GHz, modulação
  PLFM). Beamforming eletrônico, compressão de pulso, FFT Doppler, MTI, CFAR,
  GUI em Python com mapas. Hardware: FPGA Xilinx + STM32; firmware VHDL/Verilog/C.
- **Encaixe no Baluarte:** combina com o tema **militar** — vira uma página
  **"Radar"** no menu (visualização) ou um *showcase* do projeto de hardware.
- **Status:** ⏳ a planejar
- ❓ **Definir:** visualização **funcional** (radar simulado animado no site) ou
  **showcase/documentação** do projeto de hardware?

---

## ❓ Perguntas em aberto
1. **Prioridade** entre as três? (sugestão: hermes-agent → gemini-cli → radar)
2. **Radar:** simulado funcional no site, ou showcase do hardware?
3. Alguma outra ferramenta para somar a esta lista?
