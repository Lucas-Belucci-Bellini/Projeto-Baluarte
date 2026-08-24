// O que está tocando na MÁQUINA — sem conta, sem OAuth, sem Spotify.
//
// Por que isto existe
// -------------------
// O caminho do Spotify pela Web API funciona, mas depende de coisas que não são
// do Baluarte: uma conta, um app registado no dashboard, e — enquanto esse app
// estiver em Development mode — a conta do operador explicitamente listada em
// User Management. Nada disso é código: é configuração de terceiro, e enquanto
// não estiver certa, o Núcleo não sabe o que toca.
//
// O Windows já sabe. O SMTC (System Media Transport Controls) é o que desenha
// aquele cartão de mídia no volume e responde às teclas de mídia do teclado.
// Qualquer aplicação que toque som pode publicar ali: o Spotify de desktop, o
// Spotify no navegador, o YouTube, o VLC, o player do próprio Windows. Ler o
// SMTC dá o título e o artista do que está tocando AGORA, seja qual for a
// origem, sem pedir nada a ninguém.
//
// É por isso que a leitura mora aqui e não no navegador: só o processo nativo
// alcança o WinRT. E é por isso que ela é do APP e não da web — o mega-plano
// (#238) diz exatamente isto: app = completo, web = leve.
//
// Limites que valem a pena saber
// ------------------------------
//   • Windows 10/11 apenas. Noutro sistema a sonda responde `indisponivel`
//     com o motivo, em vez de estourar — recurso ausente não vira app quebrado.
//   • Só metadado: título, artista, estado e qual app é a fonte. Nunca áudio.
//     O espectrómetro continua a vir da captura do sistema, que é outra coisa
//     e pede consentimento próprio.
//   • Se nada estiver tocando, o SMTC não tem sessão e a resposta é `idle`.
const { spawn } = require('node:child_process');

const TIMEOUT_MS = 6000;
const MAX_SAIDA = 64 * 1024;

/**
 * O script que fala com o WinRT.
 *
 * `GlobalSystemMediaTransportControlsSessionManager` é assíncrono e devolve
 * `IAsyncOperation`, que o PowerShell não sabe esperar sozinho — daí o `Await`
 * construído por reflexão sobre `WindowsRuntimeSystemExtensions.AsTask`. É o
 * caminho canónico para o WinRT em PowerShell; não há atalho mais curto.
 *
 * Falha SEMPRE em JSON, nunca em exceção solta: quem chama precisa distinguir
 * "não tem sessão" de "este Windows não expõe o SMTC" de "deu erro", e um
 * stderr cru não permite isso.
 */
const SCRIPT = `
$ErrorActionPreference = 'Stop'
$saida = @{ ok = $false; erro = 'nao executou' }
try {
  Add-Type -AssemblyName System.Runtime.WindowsRuntime | Out-Null
  $asTaskGeneric = ([System.WindowsRuntimeSystemExtensions].GetMethods() | Where-Object {
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and
    $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation\`1'
  })[0]
  function Await($operacao, $tipo) {
    $tarefa = $asTaskGeneric.MakeGenericMethod($tipo).Invoke($null, @($operacao))
    if (-not $tarefa.Wait(4000)) { throw 'o WinRT nao respondeu a tempo' }
    $tarefa.Result
  }
  $tipoGestor = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionManager, Windows.Media.Control, ContentType = WindowsRuntime]
  $gestor = Await ($tipoGestor::RequestAsync()) ($tipoGestor)
  $sessao = $gestor.GetCurrentSession()
  if ($null -eq $sessao) {
    $saida = @{ ok = $true; playback = 'idle' }
  } else {
    $tipoProps = [Windows.Media.Control.GlobalSystemMediaTransportControlsSessionMediaProperties, Windows.Media.Control, ContentType = WindowsRuntime]
    $props = Await ($sessao.TryGetMediaPropertiesAsync()) ($tipoProps)
    $estado = switch ([int]$sessao.GetPlaybackInfo().PlaybackStatus) {
      4 { 'playing' }
      5 { 'paused' }
      default { 'unknown' }
    }
    $saida = @{
      ok = $true
      playback = $estado
      titulo = $props.Title
      artista = $props.Artist
      app = $sessao.SourceAppUserModelId
    }
  }
} catch {
  $saida = @{ ok = $false; erro = $_.Exception.Message }
}
ConvertTo-Json -Compress -InputObject $saida
`;

/* `-EncodedCommand` recebe UTF-16LE em base64. Passar o script como texto no
 * `-Command` exigiria escapar aspas, crases e `$` através de duas camadas
 * (JS e PowerShell) — a fonte clássica de um script que funciona no terminal e
 * quebra empacotado. Codificado, não há nada para escapar. */
function comandoCodificado() {
  return Buffer.from(SCRIPT, 'utf16le').toString('base64');
}

function texto(valor) {
  return typeof valor === 'string' && valor.trim() ? valor.trim().slice(0, 200) : null;
}

function indisponivel(motivo) {
  return { disponivel: false, motivo, playback: 'idle', titulo: null, artista: null, app: null };
}

/**
 * Roda a sonda e devolve `{ stdout, stderr, code }` cru.
 *
 * Separado de `agora()` porque o diagnóstico precisa do texto original: quando
 * a leitura falha numa máquina que não é esta, a mensagem do PowerShell é a
 * única pista, e normalizá-la cedo demais apaga-a.
 */
function executar() {
  return new Promise((resolve) => {
    let filho;
    try {
      filho = spawn('powershell.exe', [
        '-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass',
        '-EncodedCommand', comandoCodificado()
      ], { windowsHide: true });
    } catch (err) {
      resolve({ stdout: '', stderr: String((err && err.message) || err), code: -1 });
      return;
    }

    let stdout = '';
    let stderr = '';
    let terminou = false;
    const fim = (resultado) => { if (!terminou) { terminou = true; clearTimeout(relogio); resolve(resultado); } };

    /* Um PowerShell preso seguraria o poller para sempre e o Núcleo ficaria a
     * mostrar uma faixa que já mudou. Melhor matar e tentar no próximo ciclo. */
    const relogio = setTimeout(() => {
      try { filho.kill(); } catch { /* já morreu */ }
      fim({ stdout, stderr: stderr || 'a sonda não respondeu a tempo', code: -1 });
    }, TIMEOUT_MS);

    filho.stdout.on('data', (d) => { if (stdout.length < MAX_SAIDA) stdout += String(d); });
    filho.stderr.on('data', (d) => { if (stderr.length < MAX_SAIDA) stderr += String(d); });
    filho.on('error', (err) => fim({ stdout, stderr: String((err && err.message) || err), code: -1 }));
    filho.on('close', (code) => fim({ stdout, stderr, code }));
  });
}

/**
 * O que está tocando agora, normalizado.
 *
 * Nunca rejeita: todo modo de falha vira `{ disponivel: false, motivo }`. Um
 * poller que estoura a cada 5 s enche o console de ruído e não diz mais nada
 * do que um campo `motivo` diria.
 */
async function agora() {
  if (process.platform !== 'win32') {
    return indisponivel('a leitura do que toca no sistema hoje só existe no Windows');
  }
  const { stdout, stderr } = await executar();
  const bruto = stdout.trim();
  if (!bruto) return indisponivel(texto(stderr) || 'a sonda não devolveu nada');

  let payload;
  try { payload = JSON.parse(bruto); } catch { return indisponivel('a sonda devolveu algo que não é JSON'); }
  if (!payload || typeof payload !== 'object') return indisponivel('a sonda devolveu um formato inesperado');
  if (payload.ok !== true) return indisponivel(texto(payload.erro) || 'o Windows recusou a leitura');

  const playback = ['playing', 'paused', 'unknown', 'idle'].includes(payload.playback) ? payload.playback : 'unknown';
  return {
    disponivel: true,
    motivo: null,
    playback,
    titulo: texto(payload.titulo),
    artista: texto(payload.artista),
    app: texto(payload.app)
  };
}

/**
 * A mesma sonda, com o texto cru por cima.
 *
 * Existe para o dia em que não funcionar numa máquina: `agora()` normaliza a
 * falha para caber na UI, e o que sobra não basta para consertar. Aqui sai o
 * que o PowerShell realmente escreveu.
 */
async function diagnostico() {
  const plataforma = { plataforma: process.platform, suportado: process.platform === 'win32' };
  if (process.platform !== 'win32') return { ...plataforma, stdout: '', stderr: '', code: null };
  const { stdout, stderr, code } = await executar();
  return { ...plataforma, stdout: stdout.slice(0, 4000), stderr: stderr.slice(0, 4000), code };
}

/* `comandoCodificado` sai exportado para o teste poder descodificar o script e
 * cobrar o que ele contém. É a única parte desta sonda que se consegue verificar
 * fora do Windows — o resto exige o WinRT. */
module.exports = { agora, diagnostico, comandoCodificado };
