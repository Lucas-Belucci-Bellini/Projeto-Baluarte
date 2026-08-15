export interface DiagnosticStage {
  readonly nome: string;
  readonly ok: boolean;
  readonly detalhe: string;
}

export interface DiagnosticResult {
  readonly etapas: readonly DiagnosticStage[];
  readonly tudoOk: boolean;
  readonly texto: string;
}

export function rodarDiagnostico3D(): Promise<DiagnosticResult>;
