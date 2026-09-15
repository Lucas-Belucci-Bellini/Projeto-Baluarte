export interface EventEnvelope {
  id: string;
  evento: string;
  origem: string;
  correlacao: string;
  causa: string | null;
  versao: number;
  em: string;
  contexto?: Record<string, unknown>;
}

export interface EventBusFailure {
  evento: string;
  origem: string;
  correlacao: string;
  causa: string | null;
  erro: string;
  em: string;
}

export interface EventBusHealth {
  readiness: 'healthy' | 'unhealthy';
  motivos: string[];
  contagem: {
    emissoes: number;
    falhas: number;
    padroes: number;
    ouvintes: number;
  };
  porEvento: Record<string, { emissoes: number; falhas: number }>;
  latencia: {
    n: number;
    mediaMs: number;
    minMs: number | null;
    maxMs: number | null;
  };
  ultimasFalhas: EventBusFailure[];
}

export interface EventBusMeta {
  origem?: string;
  versao?: number;
  contexto?: Record<string, unknown>;
  correlacao?: string;
  causa?: string | null;
}

export interface EventBusDependencies {
  log?: {
    aviso?: (...args: unknown[]) => void;
    erro?: (...args: unknown[]) => void;
  };
  tetoFalhas?: number;
  relogio?: () => number;
}

export interface EventBus {
  on(padrao: string, handler: (payload: unknown, envelope: EventEnvelope) => void): () => void;
  emit(evento: string, payload?: unknown, meta?: EventBusMeta): EventEnvelope;
  inscricoes(): Array<{ padrao: string; ouvintes: number }>;
  contagem(): Record<string, number>;
  saude(): EventBusHealth;
  limpar(): void;
}

export function derivar(envelope: unknown): { correlacao?: string; causa?: string | null };
export function validarEnvelope(value: unknown): { valid: boolean; errors: readonly string[] };
export function criarBus(deps?: EventBusDependencies): EventBus;
