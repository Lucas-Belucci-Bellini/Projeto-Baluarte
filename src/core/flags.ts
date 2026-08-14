/**
 * Feature flags e níveis de estabilidade do Baluarte.
 *
 * Implementação canônica TypeScript. O wrapper `flags.js` mantém os imports
 * existentes durante a migração gradual.
 */

import { bus } from './events.js';

export type Nivel = 'estavel' | 'beta' | 'experimental';
export type Ambiente = 'ambos' | 'web' | 'app';

export const NIVEIS = Object.freeze([
  'estavel',
  'beta',
  'experimental',
] as const);

export const AMBIENTES = Object.freeze(['ambos', 'web', 'app'] as const);

export interface FlagSpec {
  id: string;
  nivel?: Nivel;
  padrao?: boolean;
  descricao?: string;
  ambiente?: Ambiente;
}

export interface Flag extends Required<Omit<FlagSpec, 'nivel' | 'ambiente'>> {
  nivel: Nivel;
  ambiente: Ambiente;
}

export interface ResolvedFlag extends Flag {
  ativo: boolean;
  escolhida: boolean;
}

export interface PersistenceAdapter {
  ler(): Record<string, boolean>;
  gravar(value: Record<string, boolean>): void;
}

const registro = new Map<string, Readonly<Flag>>();
const escolhas = new Map<string, boolean>();
let ambienteAtual: Exclude<Ambiente, 'ambos'> = 'web';
let persistir: PersistenceAdapter | null = null;

export function declarar(spec: FlagSpec): Readonly<Flag> {
  const id = spec?.id;
  if (typeof id !== 'string' || !/^[a-zA-Z][a-zA-Z0-9]*$/.test(id)) {
    throw new Error(
      `[flags] id "${id}" inválido — use camelCase sem separadores (ex.: "jarvisAgente").`,
    );
  }

  const nivel: Nivel = spec.nivel ?? 'experimental';
  if (!NIVEIS.includes(nivel)) {
    throw new Error(`[flags] "${id}": nível "${nivel}" inválido. Use: ${NIVEIS.join(', ')}.`);
  }

  const ambiente: Ambiente = spec.ambiente ?? 'ambos';
  if (!AMBIENTES.includes(ambiente)) {
    throw new Error(
      `[flags] "${id}": ambiente "${ambiente}" inválido. Use: ${AMBIENTES.join(', ')}.`,
    );
  }

  const padrao = spec.padrao === true;
  if (nivel === 'experimental' && padrao) {
    throw new Error(
      `[flags] "${id}" é experimental e não pode vir ligada por padrão. ` +
        `Se ela já é boa o bastante pra todo mundo, promova pra "beta" — e assuma o que isso significa na 1.0.0.`,
    );
  }

  const anterior = registro.get(id);
  if (anterior && anterior.nivel !== nivel) {
    bus.emit('flags:promovida', { id, de: anterior.nivel, para: nivel });
  }

  const entrada: Readonly<Flag> = Object.freeze({
    id,
    nivel,
    padrao,
    ambiente,
    descricao: spec.descricao ?? '',
  });
  registro.set(id, entrada);
  return entrada;
}

export function declararTodas(specs: FlagSpec[] = []): Readonly<Flag>[] {
  return specs.map(declarar);
}

export function configurarAmbiente(
  ambiente: Exclude<Ambiente, 'ambos'>,
): Exclude<Ambiente, 'ambos'> {
  if (ambiente !== 'web' && ambiente !== 'app') {
    throw new Error(`[flags] ambiente "${ambiente}" inválido — use 'web' ou 'app'.`);
  }
  ambienteAtual = ambiente;
  bus.emit('flags:ambiente', { ambiente });
  return ambienteAtual;
}

export function ambiente(): Exclude<Ambiente, 'ambos'> {
  return ambienteAtual;
}

export function conectarPersistencia(io: PersistenceAdapter): number {
  persistir = io;
  const salvo = (io?.ler && io.ler()) || {};
  for (const [id, value] of Object.entries(salvo)) {
    if (registro.has(id) && typeof value === 'boolean') escolhas.set(id, value);
  }
  return escolhas.size;
}

function salvar(): void {
  persistir?.gravar(Object.fromEntries(escolhas));
}

export function ativo(id: string): boolean {
  const flag = registro.get(id);
  if (!flag) return false;
  if (flag.ambiente !== 'ambos' && flag.ambiente !== ambienteAtual) return false;
  if (escolhas.has(id)) return escolhas.get(id) === true;
  return flag.padrao;
}

export function descrever(id: string): ResolvedFlag | null {
  const flag = registro.get(id);
  return flag
    ? { ...flag, ativo: ativo(id), escolhida: escolhas.has(id) }
    : null;
}

export function listar(): ResolvedFlag[] {
  return [...registro.keys()].sort().flatMap((id) => {
    const flag = descrever(id);
    return flag ? [flag] : [];
  });
}

export function porNivel(): Record<Nivel, string[]> {
  return {
    estavel: listar().filter((flag) => flag.nivel === 'estavel').map((flag) => flag.id),
    beta: listar().filter((flag) => flag.nivel === 'beta').map((flag) => flag.id),
    experimental: listar()
      .filter((flag) => flag.nivel === 'experimental')
      .map((flag) => flag.id),
  };
}

export function definir(id: string, ligada: boolean): boolean {
  if (!registro.has(id)) throw new Error(`[flags] "${id}" não foi declarada.`);
  escolhas.set(id, ligada === true);
  salvar();
  bus.emit('flags:mudou', { id, ativo: ativo(id), origem: 'operador' });
  return ativo(id);
}

export function resetar(id: string): boolean {
  if (!registro.has(id)) throw new Error(`[flags] "${id}" não foi declarada.`);
  escolhas.delete(id);
  salvar();
  bus.emit('flags:mudou', { id, ativo: ativo(id), origem: 'reset' });
  return ativo(id);
}

export function aplicarDaURL(search: string): string[] {
  const params = new URLSearchParams(String(search || '').replace(/^\?/, ''));
  const bruto = params.get('flags');
  if (!bruto) return [];

  const aplicados: string[] = [];
  for (const parte of bruto.split(',')) {
    const item = parte.trim();
    if (!item) continue;
    const desliga = item.startsWith('-');
    const id = desliga ? item.slice(1) : item;
    if (!registro.has(id)) {
      console.warn('[flags] "?flags=" pediu uma flag que não existe. Ignorada:', id);
      continue;
    }
    escolhas.set(id, !desliga);
    aplicados.push(id);
  }
  if (aplicados.length) bus.emit('flags:mudou', { ids: aplicados, origem: 'url' });
  return aplicados;
}

export function limpar(): void {
  registro.clear();
  escolhas.clear();
  ambienteAtual = 'web';
  persistir = null;
}

export const flags = {
  NIVEIS,
  AMBIENTES,
  declarar,
  declararTodas,
  configurarAmbiente,
  ambiente,
  conectarPersistencia,
  ativo,
  descrever,
  listar,
  porNivel,
  definir,
  resetar,
  aplicarDaURL,
  limpar,
};
