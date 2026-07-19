/**
 * Diagnóstico do 3D — roda na MÁQUINA DO USUÁRIO e testa cada etapa da cadeia
 * do visor, uma por uma, dizendo exatamente onde quebra. Existe porque o "não
 * funciona" reportado não reproduz no ambiente de dev: em vez de adivinhar,
 * pedimos à máquina do operador o laudo completo (com botão de copiar).
 *
 * As etapas LEVES (1-6) não importam o three.js — dão o veredito na hora.
 * A etapa PESADA (7) importa o chunk do visor e tenta carregar um modelo real,
 * capturando o erro exato se falhar.
 */

const GLB_TESTE = 'modelos-3d/Soldier.glb';
const DRACO_TESTE = 'modelos-3d/draco/draco_decoder.wasm';
const base = () => (import.meta.env && import.meta.env.BASE_URL) || '/';

/** Info da GPU exposta pelo WebGL (o motivo nº 1 de tela preta é GPU bloqueada). */
function infoGPU() {
  try {
    const c = document.createElement('canvas');
    const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return { contexto: null };
    const dbg = gl.getExtension('WEBGL_debug_renderer_info');
    return {
      contexto: gl.getParameter ? (c.getContext('webgl2') ? 'webgl2' : 'webgl1') : 'sim',
      fornecedor: dbg ? gl.getParameter(dbg.UNMASKED_VENDOR_WEBGL) : gl.getParameter(gl.VENDOR),
      renderizador: dbg ? gl.getParameter(dbg.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
      versao: gl.getParameter(gl.VERSION)
    };
  } catch (e) { return { contexto: null, erro: String(e && e.message || e) }; }
}

/** Teste DECISIVO em WebGL cru (sem three): limpa de vermelho e LÊ o pixel de
 *  volta. Se o pixel voltar vermelho, a GPU realmente desenha — o problema (se
 *  houver) está depois, no three/modelo, não no WebGL. */
function testeRender() {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 2;
    const gl = c.getContext('webgl2') || c.getContext('webgl') || c.getContext('experimental-webgl');
    if (!gl) return { ok: false, motivo: 'sem contexto WebGL' };
    gl.clearColor(1, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const px = new Uint8Array(4);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const vermelho = px[0] > 200 && px[1] < 60 && px[2] < 60;
    const perdido = gl.isContextLost && gl.isContextLost();
    return { ok: vermelho && !perdido, pixel: `rgba(${px.join(',')})`, contextoPerdido: !!perdido };
  } catch (e) { return { ok: false, motivo: String(e && e.message || e) }; }
}

async function testeFetch(caminho) {
  const url = base() + caminho;
  try {
    const t0 = performance.now();
    const r = await fetch(url, { cache: 'no-store' });
    const buf = await r.arrayBuffer();
    return { ok: r.ok, status: r.status, tipo: r.headers.get('content-type') || '?',
      bytes: buf.byteLength, ms: Math.round(performance.now() - t0), url };
  } catch (e) { return { ok: false, erro: String(e && e.message || e), url }; }
}

/** Service worker: qual SW controla a aba e qual a versão do cache (SW velho
 *  servindo bundle antigo foi um suspeito real na 0.7.3). */
async function estadoSW() {
  if (!('serviceWorker' in navigator)) return { suportado: false };
  const controlado = !!navigator.serviceWorker.controller;
  let versoesCache = [];
  try { versoesCache = (await caches.keys()).filter((k) => /baluarte/i.test(k)); } catch { /* ok */ }
  let regs = 0;
  try { regs = (await navigator.serviceWorker.getRegistrations()).length; } catch { /* ok */ }
  return { suportado: true, controlado, registros: regs, caches: versoesCache };
}

/** Roda todas as etapas e devolve um relatório estruturado + texto pra copiar. */
export async function rodarDiagnostico3D() {
  const etapas = [];
  const add = (nome, ok, detalhe) => etapas.push({ nome, ok, detalhe });

  const gpu = infoGPU();
  add('GPU / contexto WebGL', !!gpu.contexto,
    gpu.contexto ? `${gpu.contexto} · ${gpu.renderizador || gpu.fornecedor || 'renderizador desconhecido'}`
                 : `SEM contexto WebGL (aceleração de hardware desligada ou GPU bloqueada)${gpu.erro ? ' · ' + gpu.erro : ''}`);

  const render = testeRender();
  add('Desenhar de verdade (pixel de volta)', render.ok,
    render.ok ? 'a GPU limpou e leu o pixel — o WebGL DESENHA'
              : `falhou: ${render.motivo || render.pixel || ''}${render.contextoPerdido ? ' · contexto PERDIDO' : ''}`);

  const glb = await testeFetch(GLB_TESTE);
  add('Baixar o modelo de teste (Soldier.glb)', glb.ok,
    glb.ok ? `HTTP ${glb.status} · ${(glb.bytes / 1048576).toFixed(1)} MB · ${glb.ms} ms · ${glb.tipo}`
           : `FALHOU (${glb.status || glb.erro}) — ${glb.url}`);

  const draco = await testeFetch(DRACO_TESTE);
  add('Baixar o decoder DRACO', draco.ok,
    draco.ok ? `HTTP ${draco.status} · ${(draco.bytes / 1024).toFixed(0)} KB` : `FALHOU (${draco.status || draco.erro})`);

  const sw = await estadoSW();
  add('Service worker (cache do site)', true,
    !sw.suportado ? 'não suportado' :
    `${sw.controlado ? 'controlando a aba' : 'não controla a aba'} · ${sw.registros} registro(s) · caches: ${sw.caches.length ? sw.caches.join(', ') : 'nenhum'}`);

  /* etapa pesada: importa o chunk do three.js e tenta montar o visor de fato */
  let visorOk = false, visorDetalhe = '';
  const palco = document.createElement('div');
  palco.style.cssText = 'position:fixed;left:-9999px;top:0;width:480px;height:360px';
  document.body.appendChild(palco);
  let visor = null;
  try {
    const mod = await import('./visor-3d.js');
    visor = await mod.montarVisor3D(palco, { url: base() + GLB_TESTE, nome: 'diagnostico' });
    visorOk = true;
    visorDetalhe = `montou · ${visor.stats.tris.toLocaleString('pt-BR')} triângulos${visor.temAnimacao ? ' · com animação' : ''}`;
  } catch (e) {
    visorDetalhe = 'ERRO: ' + String(e && e.message || e).slice(0, 220);
  } finally {
    try { if (visor) visor.dispose(); } catch { /* ok */ }
    palco.remove();
  }
  add('Montar o visor 3D real (three.js + modelo)', visorOk, visorDetalhe);

  const tudoOk = etapas.every((e) => e.ok);
  const texto = [
    '=== Diagnóstico 3D — Projeto Baluarte ===',
    `data: ${new Date().toISOString()}`,
    `ambiente: ${(window.baluarte && window.baluarte.native) ? 'APP (Launcher)' : 'navegador/web'}`,
    `userAgent: ${navigator.userAgent}`,
    '',
    ...etapas.map((e) => `${e.ok ? '[OK]  ' : '[FALHA]'} ${e.nome}: ${e.detalhe}`),
    '',
    `VEREDITO: ${tudoOk ? 'tudo passou — o 3D deveria abrir' : 'achei onde quebra (veja as linhas [FALHA])'}`
  ].join('\n');

  return { etapas, tudoOk, texto };
}
