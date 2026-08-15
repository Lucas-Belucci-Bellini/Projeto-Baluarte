export interface BaluarteNativeBridge {
  readonly native?: boolean;
  invoke(channel: string, payload?: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface Arma3RepositoryStatus {
  readonly valido?: boolean;
  readonly caminho?: string;
  readonly ramo?: string;
  readonly motivo?: string;
  readonly pendentesForaDaSaida?: number;
}

export interface Arma3PythonStatus {
  readonly versao?: string;
  readonly cmd?: string;
}

export interface Arma3RptStatus {
  readonly caminho?: string;
}

export interface Arma3DumpStatus {
  readonly registros?: number;
  readonly completo?: boolean;
}

export interface Arma3MissingDump {
  readonly etapa: string;
  readonly sqf: string;
}

export interface Arma3Status {
  readonly disponivel: boolean;
  readonly erro?: string;
  readonly repo?: Arma3RepositoryStatus;
  readonly python?: Arma3PythonStatus;
  readonly rpt?: Arma3RptStatus;
  readonly disponiveis?: readonly string[];
  readonly dumps?: Readonly<Record<string, Arma3DumpStatus>>;
  readonly faltamNoJogo?: readonly Arma3MissingDump[];
  readonly pronto?: boolean;
  readonly [key: string]: unknown;
}

export interface Arma3ExtractionResult {
  readonly ok?: boolean;
  readonly log?: string;
  readonly avisos?: readonly unknown[];
  readonly arquivosMudados?: readonly string[];
  readonly expirou?: boolean;
  readonly [key: string]: unknown;
}

export interface Arma3DeliveryOptions {
  readonly etapas?: readonly string[];
  readonly ramo?: string;
  readonly empurrar?: boolean;
  readonly observacao?: string;
}

export interface Arma3DeliveryResult {
  readonly ok?: boolean;
  readonly motivo?: string;
  readonly ramo?: string;
  readonly commit?: string;
  readonly arquivos?: readonly string[];
  readonly empurrado?: boolean;
  readonly prUrl?: string | null;
  readonly [key: string]: unknown;
}

export const extracaoDisponivel: () => boolean;
export function statusExtracao(): Promise<Arma3Status>;
export function extrairArma3(etapas?: readonly string[]): Promise<Arma3ExtractionResult>;
export function entregarArma3(options?: Arma3DeliveryOptions): Promise<Arma3DeliveryResult>;
