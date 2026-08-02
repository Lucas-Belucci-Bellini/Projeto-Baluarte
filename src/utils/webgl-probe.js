/**
 * Sonda de WebGL — responde "esta máquina desenha 3D?" sem deixar rastro.
 *
 * Módulo minúsculo e SEM dependência de propósito: `/modelos-3d` precisa da
 * resposta antes de decidir se vale puxar o chunk do three.js (800 kB), então a
 * sonda não pode arrastar o three junto.
 *
 * O detalhe que motivou o arquivo: criar um canvas e pedir um contexto WebGL
 * RETÉM esse contexto. O navegador limita quantos existem por aba — algo em
 * torno de 16 — e o mais velho é descartado quando estoura. Havia três sondas
 * espalhadas pelo código (`modelos-3d.js`, `diag-3d.js`, `visor-3d.js`), todas
 * abandonando o contexto. A de `/modelos-3d` roda a CADA visita: medido, um
 * contexto retido por visita. Depois de algumas idas e vindas a galeria
 * simplesmente parava de renderizar — e o motivo seria impossível de adivinhar
 * pela tela.
 *
 * `WEBGL_lose_context` devolve o contexto na hora; é a extensão que existe
 * exatamente para isso.
 */

/**
 * @returns {{ ok: boolean, webgl2: boolean }} se há WebGL e se é a versão 2.
 */
export function sondarWebGL() {
  let gl = null;
  try {
    const canvas = document.createElement('canvas');
    const gl2 = canvas.getContext('webgl2');
    gl = gl2 || canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    return { ok: !!gl, webgl2: !!gl2 };
  } catch {
    return { ok: false, webgl2: false };
  } finally {
    /* Devolve o contexto mesmo se algo acima explodir — é o ponto do arquivo. */
    liberar(gl);
  }
}

/** Devolve um contexto WebGL ao navegador. Seguro de chamar com null. */
export function liberar(gl) {
  if (!gl || typeof gl.getExtension !== 'function') return;
  try { gl.getExtension('WEBGL_lose_context')?.loseContext(); } catch { /* já perdido */ }
}
