# ============================================================================
#  Projeto Baluarte — Instalador do HERMES LOCAL (Windows / PowerShell 5.1+)
#
#  Instala o Ollama, baixa o modelo Hermes, sobe a API em segundo plano na
#  porta 11434 (OpenAI-compatível em /v1) JÁ COM CORS liberado pro site — a
#  única config que o modo "hermes-local" do Baluarte exige da máquina.
#
#  Uso:  clique-direito > "Executar com PowerShell", ou no terminal:
#        powershell -ExecutionPolicy Bypass -File scripts\instalar-hermes.ps1
#
#  Ajustes (opcionais, via ambiente):
#    BALUARTE_HERMES_MODELO   modelo do Ollama (default: hermes3 — Nous Hermes 3 8B)
#                             alternativa leve: openhermes (Mistral 7B)
#    BALUARTE_OLLAMA_ORIGINS  origens CORS (default: * — só a máquina local
#                             alcança a porta; restrinja com a URL do site se quiser)
#
#  Depois, no site/app (Núcleo): "hermes ollama" -> "hermes status" ->
#  "modo hermes-local" -> conversa (e "voz on" pra resposta falada).
#  Doc completa: docs/HERMES-LOCAL.md
# ============================================================================
$ErrorActionPreference = 'Stop'

$Modelo  = if ($env:BALUARTE_HERMES_MODELO)  { $env:BALUARTE_HERMES_MODELO }  else { 'hermes3' }
$Origins = if ($env:BALUARTE_OLLAMA_ORIGINS) { $env:BALUARTE_OLLAMA_ORIGINS } else { '*' }
$Porta   = 11434
$Base    = "http://localhost:$Porta"

function Ok($msg)    { Write-Host "[OK] "   -ForegroundColor Green  -NoNewline; Write-Host $msg }
function Erro($msg)  { Write-Host "[ERRO] " -ForegroundColor Red    -NoNewline; Write-Host $msg }
function Aviso($msg) { Write-Host "[!] "    -ForegroundColor Yellow -NoNewline; Write-Host $msg }
function Passo($msg) { Write-Host ""; Write-Host "==> $msg" -ForegroundColor Cyan }
function Falha($msg) { Erro $msg; exit 1 }

Write-Host "🛡  Projeto Baluarte — Hermes local (Ollama · modelo: $Modelo)" -ForegroundColor White

# ============================================================================
Passo "1/6 Verificação de ambiente"
# ============================================================================
if ($PSVersionTable.PSVersion.Major -lt 5) { Falha "PowerShell 5.1+ é necessário." }
Ok "PowerShell $($PSVersionTable.PSVersion)"
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch {}

# ~6 GB livres pro modelo 8B (aviso, não bloqueio)
try {
  $livre = (Get-PSDrive -Name ($env:USERPROFILE.Substring(0,1))).Free
  if ($livre -lt 6GB) { Aviso "Menos de 6 GB livres — o download do modelo (~4,7 GB) pode falhar." }
  else { Ok "Espaço em disco suficiente" }
} catch { Aviso "Não deu pra checar o espaço em disco — seguindo." }

# ============================================================================
Passo "2/6 Motor LLM (Ollama)"
# ============================================================================
$temOllama = Get-Command ollama -ErrorAction SilentlyContinue
if ($temOllama) {
  Ok "Ollama já instalado: $(& ollama --version 2>$null)"
} else {
  $winget = Get-Command winget -ErrorAction SilentlyContinue
  if ($winget) {
    Aviso "Instalando o Ollama via winget (silencioso)…"
    & winget install --id Ollama.Ollama -e --silent --accept-package-agreements --accept-source-agreements
    if ($LASTEXITCODE -ne 0) { Falha "winget falhou (código $LASTEXITCODE). Baixe manualmente: https://ollama.com/download/windows" }
  } else {
    Aviso "winget indisponível — baixando o instalador oficial…"
    $setup = Join-Path $env:TEMP 'OllamaSetup.exe'
    Invoke-WebRequest -Uri 'https://ollama.com/download/OllamaSetup.exe' -OutFile $setup -UseBasicParsing
    Aviso "Instalando silenciosamente…"
    Start-Process -FilePath $setup -ArgumentList '/VERYSILENT','/NORESTART','/SP-' -Wait
  }
  # o instalador põe o binário em %LOCALAPPDATA%\Programs\Ollama — garante no PATH da sessão
  $ollamaDir = Join-Path $env:LOCALAPPDATA 'Programs\Ollama'
  if (Test-Path $ollamaDir) { $env:Path = "$ollamaDir;$env:Path" }
  if (-not (Get-Command ollama -ErrorAction SilentlyContinue)) {
    Falha "Ollama instalado mas fora do PATH — feche e reabra o terminal e rode o script de novo."
  }
  Ok "Ollama instalado"
}

# ============================================================================
Passo "3/6 Servidor em segundo plano (porta $Porta, CORS p/ o site)"
# ============================================================================
# CORS é OBRIGATÓRIO pro navegador (site/app) falar com a porta local.
# setx persiste pro futuro; $env: vale pro processo que vamos subir agora.
& setx OLLAMA_ORIGINS $Origins | Out-Null
$env:OLLAMA_ORIGINS = $Origins
Ok "OLLAMA_ORIGINS=$Origins (persistido)"

# derruba instâncias antigas (podem estar SEM a env de CORS)
Get-Process -Name 'ollama','ollama app' -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1
Start-Process -FilePath 'ollama' -ArgumentList 'serve' -WindowStyle Hidden
Ok "ollama serve em segundo plano"

# espera o servidor acordar (até 30 s)
$vivo = $false
for ($i = 0; $i -lt 30; $i++) {
  try { Invoke-RestMethod -Uri "$Base/api/version" -TimeoutSec 2 | Out-Null; $vivo = $true; break }
  catch { Start-Sleep -Seconds 1 }
}
if (-not $vivo) { Falha "Servidor não respondeu em $Base após 30 s." }
Ok "API no ar em $Base"

# ============================================================================
Passo "4/6 Modelo Hermes ($Modelo)"
# ============================================================================
$lista = & ollama list 2>$null | Out-String
if ($lista -match [regex]::Escape($Modelo)) {
  Ok "Modelo $Modelo já baixado"
} else {
  Aviso "Baixando $Modelo (~4,7 GB — acompanhe o progresso abaixo)…"
  & ollama pull $Modelo
  if ($LASTEXITCODE -ne 0) { Falha "Download do modelo falhou. Rode de novo (o pull retoma de onde parou)." }
  Ok "Modelo $Modelo pronto"
}

# ============================================================================
Passo "5/6 Teste de vida (API OpenAI-compatível /v1)"
# ============================================================================
try {
  $models = Invoke-RestMethod -Uri "$Base/v1/models" -TimeoutSec 5
  if (($models.data | ForEach-Object { $_.id }) -match [regex]::Escape($Modelo)) { Ok "GET /v1/models lista o $Modelo" }
  else { Aviso "GET /v1/models não listou $Modelo — o teste de chat abaixo é o decisivo." }
} catch { Aviso "GET /v1/models falhou — o teste de chat abaixo é o decisivo." }

Aviso "Chat de teste (a 1ª chamada carrega o modelo — pode levar 1–2 min)…"
$corpo = @{ model = $Modelo; max_tokens = 24
            messages = @(@{ role = 'user'; content = 'Responda somente: BALUARTE OK' }) } | ConvertTo-Json -Depth 4
try {
  $resp = Invoke-RestMethod -Uri "$Base/v1/chat/completions" -Method Post `
            -ContentType 'application/json' -Body $corpo -TimeoutSec 180
  $texto = $resp.choices[0].message.content
  Ok "Hermes respondeu: `"$texto`""
} catch {
  Falha "O chat de teste não respondeu: $($_.Exception.Message)"
}

# ============================================================================
Passo "6/6 Pronto — como conectar no Baluarte"
# ============================================================================
Ok "Hermes instalado com sucesso! API local: $Base/v1 (modelo: $Modelo)"
Write-Host ""
Write-Host "No site/app (Núcleo — tudo por comando):" -ForegroundColor White
Write-Host "  hermes ollama      " -ForegroundColor Cyan -NoNewline; Write-Host "→ aponta o Baluarte pra esta API ($Base/v1)"
Write-Host "  hermes status      " -ForegroundColor Cyan -NoNewline; Write-Host "→ confere a conexão e lista os modelos"
Write-Host "  modo hermes-local  " -ForegroundColor Cyan -NoNewline; Write-Host "→ o J.A.R.V.I.S. pensa com o Hermes desta máquina"
Write-Host "  voz on             " -ForegroundColor Cyan -NoNewline; Write-Host "→ resposta falada (ElevenLabs com 'voz chave <key>')"
Write-Host ""
Write-Host "Obs.: o app do Ollama inicia com o Windows; como OLLAMA_ORIGINS foi persistido"
Write-Host "com setx, o CORS continua valendo após reiniciar. Doc: docs/HERMES-LOCAL.md"
