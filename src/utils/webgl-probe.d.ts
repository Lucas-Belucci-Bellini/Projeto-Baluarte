export interface WebGLProbeResult {
  readonly ok: boolean;
  readonly webgl2: boolean;
}

export function sondarWebGL(): WebGLProbeResult;
export function liberar(
  gl: WebGLRenderingContext | WebGL2RenderingContext | null,
): void;
