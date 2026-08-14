/**
 * Extração do Arma 3 — lado WEB (0.9.1).
 *
 * Adaptador fino sobre o funil `window.baluarte.invoke('arma3:*')`. O poder real
 * mora no app (`desktop/src/arma3.js`, com as regras de segurança); aqui só se
 * conversa com ele.
 *
 * Na web pura nada disso existe — e é assim que tem de ser (regra do #238: o
 * pesado e o nativo ficam no app). Quem chamar sem a ponte recebe uma mensagem
 * dizendo onde a capacidade mora, não um erro genérico.
 */

export interface BaluarteNativeBridge {
  readonly native?: boolean;
  invoke(channel: string, payload?: Readonly<Record<string, unknown>>): Promise<unknown>;
}

export interface Arma3Status {
  readonly disponivel: boolean;
  readonly erro?: string;
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

declare global {
  interface Window {
    baluarte?: BaluarteNativeBridge;
  }
}

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

function bridge(): BaluarteNativeBridge | undefined {
  return typeof window !== 'undefined' ? window.baluarte : undefined;
}

const temPonte = (): boolean => {
  const current = bridge();
  return current?.native === true && typeof current.invoke === 'function';
};

const semPonte = (): Error => new Error(
  'A extração do Arma 3 só roda no app (Baluarte Launcher) — ele precisa '
  + 'do log do jogo e do clone do repositório na máquina.',
);

async function invocar(
  canal: string,
  payload: Readonly<Record<string, unknown>> = {},
): Promise<unknown> {
  const current = bridge();
  if (!current || !temPonte()) throw semPonte();

  const response = await current.invoke(canal, payload);
  /* O funil devolve `{ok, data|error}`; desembrulhar aqui evita que cada
   * chamador repita a mesma conferência e esqueça o caso de erro. */
  if (isRecord(response) && response.ok === false) {
    throw new Error(response.error ? String(response.error) : 'falha no app');
  }
  return isRecord(response) && Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : response;
}

function resultObject(value: unknown): UnknownRecord {
  return isRecord(value) ? value : {};
}

/** A capacidade existe nesta sessão? Nunca lança. */
export const extracaoDisponivel = (): boolean => temPonte();

/**
 * Panorama: o que o jogo já dumpou, se o repo aceita commit, se há Python.
 * Nunca lança — é chamado no render e não pode derrubar a tela.
 */
export async function statusExtracao(): Promise<Arma3Status> {
  if (!temPonte()) return { disponivel: false };
  try {
    return { disponivel: true, ...resultObject(await invocar('arma3:status')) };
  } catch (error: unknown) {
    return { disponivel: true, erro: errorMessage(error) };
  }
}

/**
 * Roda os parsers para as etapas pedidas. Demorado (minutos) — quem chamar
 * precisa mostrar que está trabalhando.
 */
export async function extrairArma3(
  etapas: readonly string[] = [],
): Promise<Arma3ExtractionResult> {
  if (!temPonte()) throw semPonte();
  return resultObject(await invocar('arma3:extrair', { etapas }));
}

/**
 * Commita a pasta de saída num ramo próprio.
 * `empurrar` é opt-in de propósito: sem ele o commit fica local, para o
 * operador conferir antes de mandar.
 */
export async function entregarArma3(
  {
    etapas = [],
    ramo,
    empurrar = false,
    observacao,
  }: Arma3DeliveryOptions = {},
): Promise<Arma3DeliveryResult> {
  if (!temPonte()) throw semPonte();
  return resultObject(await invocar('arma3:entregar', {
    etapas,
    ramo,
    empurrar,
    observacao,
  }));
}
