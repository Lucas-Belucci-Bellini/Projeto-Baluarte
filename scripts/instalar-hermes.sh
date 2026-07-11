#!/usr/bin/env bash
# ============================================================================
#  Projeto Baluarte — Instalador do HERMES LOCAL (Linux/macOS)
#
#  Instala o Ollama, baixa o modelo Hermes, sobe a API em segundo plano na
#  porta 11434 (OpenAI-compatível em /v1) JÁ COM CORS liberado pro site — a
#  única config que o modo "hermes-local" do Baluarte exige da máquina.
#
#  Uso:      bash scripts/instalar-hermes.sh
#  Ajustes (opcionais, via ambiente):
#    BALUARTE_HERMES_MODELO   modelo do Ollama (default: hermes3 — Nous Hermes 3 8B)
#                             alternativa leve: openhermes (Mistral 7B)
#    BALUARTE_OLLAMA_ORIGINS  origens CORS (default: * — só a máquina local
#                             alcança a porta; restrinja com a URL do site se quiser)
#
#  Depois, no site/app (Núcleo): "hermes ollama" → "hermes status" →
#  "modo hermes-local" → conversa (e "voz on" pra resposta falada).
#  Doc completa: docs/HERMES-LOCAL.md
# ============================================================================
set -uo pipefail

MODELO="${BALUARTE_HERMES_MODELO:-hermes3}"
ORIGINS="${BALUARTE_OLLAMA_ORIGINS:-*}"
PORTA=11434
BASE="http://localhost:${PORTA}"
LOG="${HOME}/.ollama/baluarte-serve.log"

# ----- feedback visual (cores só se o terminal suportar) --------------------
if [ -t 1 ] && command -v tput >/dev/null 2>&1 && [ "$(tput colors 2>/dev/null || echo 0)" -ge 8 ]; then
  VERDE="$(tput setaf 2)"; VERMELHO="$(tput setaf 1)"; AMARELO="$(tput setaf 3)"
  CIANO="$(tput setaf 6)"; NEGRITO="$(tput bold)"; RESET="$(tput sgr0)"
else
  VERDE=""; VERMELHO=""; AMARELO=""; CIANO=""; NEGRITO=""; RESET=""
fi
ok()    { echo "${VERDE}[OK]${RESET} $*"; }
erro()  { echo "${VERMELHO}[ERRO]${RESET} $*" >&2; }
aviso() { echo "${AMARELO}[!]${RESET} $*"; }
passo() { echo ""; echo "${CIANO}${NEGRITO}==> $*${RESET}"; }
falha() { erro "$*"; exit 1; }

echo "${NEGRITO}🛡  Projeto Baluarte — Hermes local (Ollama · modelo: ${MODELO})${RESET}"

# ============================================================================
passo "1/6 Verificação de ambiente"
# ============================================================================
SO="$(uname -s)"
case "$SO" in
  Linux|Darwin) ok "Sistema: $SO" ;;
  *) falha "Sistema não suportado por este script: $SO (use o instalar-hermes.ps1 no Windows)." ;;
esac

command -v curl >/dev/null 2>&1 || falha "curl não encontrado. Instale-o (ex.: apt install curl / brew install curl) e rode de novo."
ok "curl disponível"

# ~6 GB livres pro modelo 8B (aviso, não bloqueio)
DESTINO="${HOME}"
LIVRE_KB="$(df -Pk "$DESTINO" 2>/dev/null | awk 'NR==2 {print $4}')"
if [ -n "${LIVRE_KB:-}" ] && [ "$LIVRE_KB" -lt 6291456 ]; then
  aviso "Menos de 6 GB livres em $DESTINO — o download do modelo (~4,7 GB) pode falhar."
else
  ok "Espaço em disco suficiente"
fi

# ============================================================================
passo "2/6 Motor LLM (Ollama)"
# ============================================================================
if command -v ollama >/dev/null 2>&1; then
  ok "Ollama já instalado: $(ollama --version 2>/dev/null || echo 'versão desconhecida')"
else
  if [ "$SO" = "Linux" ]; then
    aviso "Instalando o Ollama (o instalador oficial pode pedir sua senha de sudo)…"
    curl -fsSL https://ollama.com/install.sh | sh || falha "Instalação do Ollama falhou. Veja https://ollama.com/download"
  else # Darwin
    if command -v brew >/dev/null 2>&1; then
      aviso "Instalando o Ollama via Homebrew…"
      brew install ollama || falha "brew install ollama falhou. Alternativa: baixe o app em https://ollama.com/download/mac"
    else
      falha "No macOS sem Homebrew, baixe o Ollama.app em https://ollama.com/download/mac, abra-o 1x e rode este script de novo."
    fi
  fi
  command -v ollama >/dev/null 2>&1 || falha "Ollama instalado mas não está no PATH — abra um terminal novo e rode de novo."
  ok "Ollama instalado"
fi

# ============================================================================
passo "3/6 Servidor em segundo plano (porta ${PORTA}, CORS p/ o site)"
# ============================================================================
# CORS é OBRIGATÓRIO pro navegador (site/app) falar com a porta local:
# OLLAMA_ORIGINS precisa valer ANTES do servidor subir.
if [ "$SO" = "Linux" ] && command -v systemctl >/dev/null 2>&1 && [ -f /etc/systemd/system/ollama.service ]; then
  # Instalação padrão do Linux = serviço systemd → grava a env num drop-in.
  aviso "Configurando OLLAMA_ORIGINS=${ORIGINS} no serviço systemd (pode pedir sudo)…"
  sudo mkdir -p /etc/systemd/system/ollama.service.d
  printf '[Service]\nEnvironment="OLLAMA_ORIGINS=%s"\n' "$ORIGINS" | sudo tee /etc/systemd/system/ollama.service.d/baluarte.conf >/dev/null
  sudo systemctl daemon-reload
  sudo systemctl enable --now ollama >/dev/null 2>&1 || true
  sudo systemctl restart ollama
  ok "Serviço systemd reiniciado com CORS liberado"
else
  # macOS / Linux sem systemd: processo em segundo plano com a env na frente.
  if curl -fsS -m 2 "${BASE}/api/version" >/dev/null 2>&1; then
    aviso "Um servidor Ollama já responde na ${PORTA} — reiniciando com CORS do Baluarte…"
    pkill -f "ollama serve" 2>/dev/null || true
    sleep 1
  fi
  mkdir -p "$(dirname "$LOG")"
  OLLAMA_ORIGINS="$ORIGINS" nohup ollama serve >"$LOG" 2>&1 &
  ok "ollama serve em segundo plano (log: $LOG)"
fi

# espera o servidor acordar (até 30 s)
VIVO=""
for _ in $(seq 1 30); do
  if curl -fsS -m 2 "${BASE}/api/version" >/dev/null 2>&1; then VIVO=1; break; fi
  sleep 1
done
[ -n "$VIVO" ] || falha "Servidor não respondeu em ${BASE} após 30 s. Veja o log: $LOG"
ok "API no ar em ${BASE} (versão: $(curl -fsS -m 3 "${BASE}/api/version" 2>/dev/null | tr -d '{}\"' || echo '?'))"

# ============================================================================
passo "4/6 Modelo Hermes (${MODELO})"
# ============================================================================
if ollama list 2>/dev/null | awk '{print $1}' | grep -q "^${MODELO}"; then
  ok "Modelo ${MODELO} já baixado"
else
  aviso "Baixando ${MODELO} (~4,7 GB — acompanhe o progresso abaixo)…"
  ollama pull "$MODELO" || falha "Download do modelo falhou. Tente de novo (o pull retoma de onde parou)."
  ok "Modelo ${MODELO} pronto"
fi

# ============================================================================
passo "5/6 Teste de vida (API OpenAI-compatível /v1)"
# ============================================================================
curl -fsS -m 5 "${BASE}/v1/models" | grep -q "$MODELO" \
  && ok "GET /v1/models lista o ${MODELO}" \
  || aviso "GET /v1/models não listou ${MODELO} — siga; o teste de chat abaixo é o decisivo."

aviso "Chat de teste (a 1ª chamada carrega o modelo — pode levar 1–2 min)…"
RESPOSTA="$(curl -fsS --max-time 180 "${BASE}/v1/chat/completions" \
  -H 'content-type: application/json' \
  -d "{\"model\":\"${MODELO}\",\"max_tokens\":24,\"messages\":[{\"role\":\"user\",\"content\":\"Responda somente: BALUARTE OK\"}]}" \
  2>/dev/null || true)"
if [ -n "$RESPOSTA" ] && echo "$RESPOSTA" | grep -q '"content"'; then
  TRECHO="$(echo "$RESPOSTA" | sed -n 's/.*"content"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -1)"
  ok "Hermes respondeu: \"${TRECHO:-…}\""
else
  falha "O chat de teste não respondeu. Veja o log ($LOG) e tente: curl ${BASE}/v1/models"
fi

# ============================================================================
passo "6/6 Pronto — como conectar no Baluarte"
# ============================================================================
ok "Hermes instalado com sucesso! API local: ${BASE}/v1 (modelo: ${MODELO})"
echo "
${NEGRITO}No site/app (Núcleo — tudo por comando):${RESET}
  ${CIANO}hermes ollama${RESET}      → aponta o Baluarte pra esta API (${BASE}/v1)
  ${CIANO}hermes status${RESET}      → confere a conexão e lista os modelos
  ${CIANO}modo hermes-local${RESET}  → o J.A.R.V.I.S. passa a pensar com o Hermes desta máquina
  ${CIANO}voz on${RESET}             → resposta falada (ElevenLabs com 'voz chave <key>')

${NEGRITO}Obs.:${RESET} no Linux (systemd) o servidor volta sozinho no boot; no macOS,
rode 'OLLAMA_ORIGINS=\"${ORIGINS}\" ollama serve' (ou este script) após reiniciar.
Doc: docs/HERMES-LOCAL.md"
