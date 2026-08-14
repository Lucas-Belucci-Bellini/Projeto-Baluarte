/**
 * Permission Manager do Baluarte.
 *
 * A implementação canônica foi migrada para TypeScript. O wrapper `permissions.js`
 * mantém compatibilidade com consumidores JavaScript durante a transição.
 */

import { bus } from './events.js';

export const RISCOS = Object.freeze(['leitura', 'escrita', 'restrito'] as const);
export type Risco = (typeof RISCOS)[number];
export type PermissionCode = 'negada' | 'desconhecida' | 'invalida';

export interface PermissionSpec {
  id: string;
  risco?: Risco;
  descricao?: string;
  dono?: string;
}

export interface PermissionEntry {
  id: string;
  risco: Risco;
  descricao: string;
  dono: string;
}

export interface GrantMeta {
  origem?: string;
}

export interface PermissionState {
  versao: 1;
  concedidas: Array<{ id: string; origem: string; em: number }>;
}

export class PermissionError extends Error {
  readonly permissao: string;
  readonly code: PermissionCode;

  constructor(permissao: string, code: PermissionCode, detalhe?: string) {
    super(detalhe || `Permissão negada: "${permissao}" (${code})`);
    this.name = 'PermissionError';
    this.permissao = permissao;
    this.code = code;
  }
}

const RISCO_PADRAO: Risco = 'restrito';
const declaradas = new Map<string, Readonly<PermissionEntry>>();
const concedidas = new Map<string, { origem: string; em: number }>();
const LIMITE_AUDITORIA = 200;
const auditoria: Array<Record<string, unknown>> = [];
const FORMATO = /^[a-z0-9-]+(\.[a-z0-9-]+)+$/;

type AuditEntry = Record<string, unknown>;

function registrarAuditoria(entrada: AuditEntry): void {
  auditoria.push({ ...entrada, em: Date.now() });
  if (auditoria.length > LIMITE_AUDITORIA) auditoria.shift();
}

function validarId(id: string): string {
  if (typeof id !== 'string' || !FORMATO.test(id)) {
    throw new PermissionError(
      String(id),
      'invalida',
      `Permissão "${id}" fora do formato "dominio.acao" (minúsculas, dígitos, hífen).`,
    );
  }
  return id;
}

export function declarar(spec: PermissionSpec): Readonly<PermissionEntry> {
  const id = validarId(spec?.id);
  const risco = spec.risco ?? RISCO_PADRAO;
  if (!RISCOS.includes(risco)) {
    throw new PermissionError(
      id,
      'invalida',
      `Risco "${risco}" inválido. Use: ${RISCOS.join(', ')}.`,
    );
  }

  const anterior = declaradas.get(id);
  if (anterior) {
    if (anterior.risco !== risco) {
      throw new PermissionError(
        id,
        'invalida',
        `"${id}" já foi declarada como "${anterior.risco}" e agora como "${risco}". ` +
          'Mudar o risco de uma permissão viva muda o que o curinga alcança — declare uma permissão nova.',
      );
    }
    return anterior;
  }

  const entrada = Object.freeze({
    id,
    risco,
    descricao: spec.descricao ?? '',
    dono: spec.dono ?? '',
  });
  declaradas.set(id, entrada);
  bus.emit('permissions:declarada', entrada);
  return entrada;
}

export function declararTodas(specs: PermissionSpec[] = []): Readonly<PermissionEntry>[] {
  return specs.map(declarar);
}

export function existe(id: string): boolean {
  return declaradas.has(id);
}

export function descrever(id: string): Readonly<PermissionEntry> | null {
  return declaradas.get(id) ?? null;
}

export function listar(): Readonly<PermissionEntry>[] {
  return [...declaradas.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function expandir(pedido: string): string[] {
  if (typeof pedido !== 'string' || pedido === '') {
    throw new PermissionError(String(pedido), 'invalida', 'Pedido de permissão vazio.');
  }

  if (!pedido.includes('*')) {
    if (!declaradas.has(pedido)) {
      throw new PermissionError(pedido, 'desconhecida', `Permissão "${pedido}" não foi declarada.`);
    }
    return [pedido];
  }

  if (pedido !== '*' && !pedido.endsWith('.*')) {
    throw new PermissionError(pedido, 'invalida', 'Curinga só no fim: use "dominio.*" ou "*".');
  }
  const prefixo = pedido === '*' ? '' : pedido.slice(0, -1);
  return [...declaradas.values()]
    .filter((permission) => permission.risco !== 'restrito' && permission.id.startsWith(prefixo))
    .map((permission) => permission.id);
}

export function conceder(pedido: string | string[], ctx: GrantMeta = {}): string[] {
  const pedidos = Array.isArray(pedido) ? pedido : [pedido];
  const origem = ctx.origem ?? 'desconhecida';
  const novos: string[] = [];

  for (const item of pedidos) {
    for (const id of expandir(item)) {
      if (concedidas.has(id)) continue;
      concedidas.set(id, { origem, em: Date.now() });
      novos.push(id);
    }
  }

  if (novos.length) {
    registrarAuditoria({ acao: 'conceder', ids: novos, origem });
    bus.emit('permissions:concedida', { ids: novos, origem });
  }
  return novos;
}

export function revogar(pedido: string | string[], ctx: GrantMeta = {}): string[] {
  const pedidos = Array.isArray(pedido) ? pedido : [pedido];
  const origem = ctx.origem ?? 'desconhecida';
  const tirados: string[] = [];

  for (const item of pedidos) {
    if (item === '*') {
      tirados.push(...concedidas.keys());
      concedidas.clear();
      continue;
    }
    if (item.endsWith('.*')) {
      const prefixo = item.slice(0, -1);
      for (const id of [...concedidas.keys()]) {
        if (id.startsWith(prefixo)) {
          concedidas.delete(id);
          tirados.push(id);
        }
      }
      continue;
    }
    if (concedidas.delete(item)) tirados.push(item);
  }

  if (tirados.length) {
    registrarAuditoria({ acao: 'revogar', ids: tirados, origem });
    bus.emit('permissions:revogada', { ids: tirados, origem });
  }
  return tirados;
}

export function checar(id: string): boolean {
  if (!declaradas.has(id)) {
    registrarAuditoria({ acao: 'checar', id, resultado: 'desconhecida' });
    return false;
  }
  return concedidas.has(id);
}

export function exigir(id: string, ctx: { alvo?: string } = {}): true {
  if (!declaradas.has(id)) {
    registrarAuditoria({ acao: 'exigir', id, resultado: 'desconhecida', alvo: ctx.alvo });
    bus.emit('permissions:negada', { id, code: 'desconhecida', alvo: ctx.alvo });
    throw new PermissionError(id, 'desconhecida', `Permissão "${id}" não foi declarada.`);
  }
  if (!concedidas.has(id)) {
    registrarAuditoria({ acao: 'exigir', id, resultado: 'negada', alvo: ctx.alvo });
    bus.emit('permissions:negada', { id, code: 'negada', alvo: ctx.alvo });
    throw new PermissionError(id, 'negada');
  }
  registrarAuditoria({ acao: 'exigir', id, resultado: 'ok', alvo: ctx.alvo });
  return true;
}

export function protegido<TArgs extends unknown[], TResult>(
  exigidas: string | string[],
  fn: (...args: TArgs) => TResult,
): (...args: TArgs) => TResult {
  const lista = Array.isArray(exigidas) ? exigidas : [exigidas];
  return function protegida(this: unknown, ...args: TArgs): TResult {
    for (const id of lista) exigir(id, { alvo: fn.name || 'anônima' });
    return fn.apply(this, args);
  };
}

export function exportar(): PermissionState {
  return {
    versao: 1,
    concedidas: [...concedidas.entries()].map(([id, meta]) => ({ id, ...meta })),
  };
}

export function importar(estado: Partial<PermissionState> | null | undefined): {
  aplicadas: string[];
  descartadas: string[];
} {
  const aplicadas: string[] = [];
  const descartadas: string[] = [];
  const lista = Array.isArray(estado?.concedidas) ? estado.concedidas : [];

  for (const item of lista) {
    const id = item?.id;
    if (!declaradas.has(id)) {
      descartadas.push(id);
      continue;
    }
    concedidas.set(id, { origem: item.origem || 'importada', em: item.em || Date.now() });
    aplicadas.push(id);
  }

  registrarAuditoria({ acao: 'importar', ids: aplicadas, descartadas });
  if (aplicadas.length) bus.emit('permissions:concedida', { ids: aplicadas, origem: 'importada' });
  return { aplicadas, descartadas };
}

export function estado(): {
  declaradas: Array<PermissionEntry & { concedida: boolean }>;
  concedidas: string[];
  porRisco: Record<Risco, number>;
} {
  return {
    declaradas: listar().map((permission) => ({
      ...permission,
      concedida: concedidas.has(permission.id),
    })),
    concedidas: [...concedidas.keys()].sort(),
    porRisco: {
      leitura: listar().filter((permission) => permission.risco === 'leitura').length,
      escrita: listar().filter((permission) => permission.risco === 'escrita').length,
      restrito: listar().filter((permission) => permission.risco === 'restrito').length,
    },
  };
}

export function ultimasDecisoes(n = 50): AuditEntry[] {
  return auditoria.slice(-n);
}

export function limpar(): void {
  declaradas.clear();
  concedidas.clear();
  auditoria.length = 0;
}

export const permissions = {
  RISCOS,
  PermissionError,
  declarar,
  declararTodas,
  existe,
  descrever,
  listar,
  conceder,
  revogar,
  checar,
  exigir,
  protegido,
  exportar,
  importar,
  estado,
  ultimasDecisoes,
  limpar,
};
