/**
 * Wrapper tipado para localStorage com fallback in-memory.
 *
 * O arquivo `storage.js` continua sendo o ponto de importação dos consumidores
 * JavaScript durante a migração. A implementação canônica desta onda vive aqui.
 */

const NAMESPACE = 'baluarte:';
const MARCA = '__bv';

export const CLASSES = Object.freeze([
  'publico',
  'local',
  'sensivel',
  'secreto',
] as const);

export type StorageClass = (typeof CLASSES)[number];

export type StorageMigrator = (
  dados: unknown,
  de: number,
  para: number,
) => unknown;

export interface StorageSchemaSpec {
  versao?: number;
  migrar?: StorageMigrator;
  classe?: string;
}

export interface RegisteredStorageSchema {
  versao: number;
  classe: StorageClass;
  migrar: StorageMigrator | null;
}

export interface StorageSchemaState {
  chave: string;
  classe: StorageClass;
  versao: number;
  gravada: number | null;
  temMigracao: boolean;
}

interface StorageEnvelope {
  __bv: number;
  d: unknown;
}

const memory = new Map<string, string | undefined>();
const esquemas = new Map<string, RegisteredStorageSchema>();

function isStorageAvailable(): boolean {
  try {
    const testKey = '__baluarte_test__';
    localStorage.setItem(testKey, '1');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

const HAS_LS = typeof window !== 'undefined' && isStorageAvailable();

function key(k: string): string {
  return `${NAMESPACE}${k}`;
}

function isStorageEnvelope(value: unknown): value is StorageEnvelope {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) {
    return false;
  }
  const record = value as Record<string, unknown>;
  return (
    typeof record[MARCA] === 'number' &&
    MARCA in record &&
    'd' in record
  );
}

function lerCru(fullKey: string): unknown | undefined {
  const raw = HAS_LS ? localStorage.getItem(fullKey) : memory.get(fullKey);
  if (raw == null) return undefined;
  return JSON.parse(raw) as unknown;
}

function gravarCru(fullKey: string, valor: unknown): void {
  const raw = JSON.stringify(valor);
  if (HAS_LS) {
    localStorage.setItem(fullKey, raw ?? 'undefined');
  } else {
    memory.set(fullKey, raw);
  }
}

export function registrarEsquema(
  chave: string,
  spec: StorageSchemaSpec,
): RegisteredStorageSchema {
  const versao = spec?.versao;
  if (typeof versao !== 'number' || !Number.isInteger(versao) || versao < 1) {
    throw new Error(
      `[storage] Esquema de "${chave}": versao precisa ser inteiro >= 1.`,
    );
  }

  const classe = spec.classe ?? 'local';
  if (!(CLASSES as readonly string[]).includes(classe)) {
    throw new Error(
      `[storage] Esquema de "${chave}": classe "${classe}" inválida. Use: ${CLASSES.join(', ')}.`,
    );
  }

  const schema: RegisteredStorageSchema = {
    versao,
    classe: classe as StorageClass,
    migrar: spec.migrar ?? null,
  };
  esquemas.set(chave, schema);
  return schema;
}

export function esquemaDe(chave: string): RegisteredStorageSchema | null {
  return esquemas.get(chave) ?? null;
}

export function get<T>(chave: string): T | null;
export function get<T>(chave: string, fallback: T): T;
export function get<T>(
  chave: string,
  fallback: T | null = null,
): T | null {
  const fullKey = key(chave);
  try {
    const bruto = lerCru(fullKey);
    if (bruto === undefined) return fallback;

    const esquema = esquemas.get(chave);
    if (!esquema) {
      return (isStorageEnvelope(bruto) ? bruto.d : bruto) as T;
    }

    const de = isStorageEnvelope(bruto) ? bruto[MARCA] : 0;
    const dados = isStorageEnvelope(bruto) ? bruto.d : bruto;

    if (de === esquema.versao) return dados as T;

    if (de > esquema.versao) {
      console.warn(
        '[storage] chave em versão mais nova que este código — usando o fallback e preservando o dado:',
        { chave, gravada: de, entendo: esquema.versao },
      );
      return fallback;
    }

    if (!esquema.migrar) {
      console.warn(
        '[storage] esquema sem migrar() para dado antigo — usando o fallback:',
        { chave, gravada: de, atual: esquema.versao },
      );
      return fallback;
    }

    const migrado = esquema.migrar(dados, de, esquema.versao);
    try {
      gravarCru(fullKey, { [MARCA]: esquema.versao, d: migrado });
    } catch (error) {
      console.warn(
        '[storage] migrou mas não conseguiu regravar:',
        { chave, de, para: esquema.versao },
        error,
      );
    }
    return migrado as T;
  } catch (error) {
    console.warn('[storage] falha ao ler:', { chave }, error);
    return fallback;
  }
}

export function set<T>(chave: string, value: T): boolean {
  const fullKey = key(chave);
  const esquema = esquemas.get(chave);

  if (esquema?.classe === 'secreto') {
    throw new Error(
      `[storage] "${chave}" é classificada como "secreto" e o frontend é público — ` +
        'qualquer um lê o localStorage. Guarde no backend e traga só um token de sessão de curta duração.',
    );
  }

  try {
    gravarCru(fullKey, esquema ? { [MARCA]: esquema.versao, d: value } : value);
    return true;
  } catch (error) {
    console.warn('[storage] falha ao gravar:', { chave }, error);
    return false;
  }
}

export function remove(chave: string): void {
  const fullKey = key(chave);
  if (HAS_LS) {
    localStorage.removeItem(fullKey);
  } else {
    memory.delete(fullKey);
  }
}

export function clearAll(): void {
  if (HAS_LS) {
    const toRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const currentKey = localStorage.key(index);
      if (currentKey?.startsWith(NAMESPACE)) toRemove.push(currentKey);
    }
    toRemove.forEach((currentKey) => localStorage.removeItem(currentKey));
  } else {
    memory.clear();
  }
}

export function versaoGravada(chave: string): number | null {
  try {
    const bruto = lerCru(key(chave));
    if (bruto === undefined) return null;
    return isStorageEnvelope(bruto) ? bruto[MARCA] : 0;
  } catch {
    return null;
  }
}

export function estadoEsquemas(): StorageSchemaState[] {
  return [...esquemas.entries()]
    .map(([chave, esquema]) => ({
      chave,
      classe: esquema.classe,
      versao: esquema.versao,
      gravada: versaoGravada(chave),
      temMigracao: esquema.migrar !== null,
    }))
    .sort((a, b) => a.chave.localeCompare(b.chave));
}

export interface StorageApi {
  get: typeof get;
  set: typeof set;
  remove: typeof remove;
  clearAll: typeof clearAll;
  registrarEsquema: typeof registrarEsquema;
  esquemaDe: typeof esquemaDe;
  versaoGravada: typeof versaoGravada;
  estadoEsquemas: typeof estadoEsquemas;
  CLASSES: typeof CLASSES;
  hasLocalStorage: boolean;
}

export const storage: StorageApi = {
  get,
  set,
  remove,
  clearAll,
  registrarEsquema,
  esquemaDe,
  versaoGravada,
  estadoEsquemas,
  CLASSES,
  hasLocalStorage: HAS_LS,
};
