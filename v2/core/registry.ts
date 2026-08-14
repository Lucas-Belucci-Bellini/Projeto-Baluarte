/**
 * Module Registry — invariantes do conjunto de módulos da V2.
 *
 * A validação de um manifesto isolado permanece em `manifest.js`; este módulo
 * aplica as regras que só podem ser verificadas olhando o conjunto inteiro.
 */

import { normalizar, validar } from './manifest.js';
import type {
  ModuleManifest,
  ModuleStorageSchema,
  NormalizedModuleManifest,
  Permission,
  ViewLoader,
} from './manifest.js';

export interface RegistryRejection {
  id: string;
  motivo: string;
}

export interface RegistrySeal {
  ok: boolean;
  ativos: string[];
  recusados: RegistryRejection[];
}

export interface RegistryRoute {
  path: string;
  view: ViewLoader;
  modulo: string;
}

export interface RegistryNavigationEntry {
  modulo: string;
  nome: string;
  icone: string;
  secao: string | null;
  ordem: number;
  path: string;
  estabilidade: NormalizedModuleManifest['stability'];
}

export interface RegistryStorageSchema extends ModuleStorageSchema {
  modulo: string;
}

export interface EventCatalogEntry {
  emitem: string[];
  escutam: string[];
}

export interface OrphanEvent {
  evento: string;
  escutadoPor: string[];
}

export interface OrphanReference {
  modulo: string;
  tipo: 'rota' | 'modulo';
  alvo: string;
}

export interface ModuleRegistry {
  registrar(manifesto: unknown): boolean;
  selar(): RegistrySeal;
  rotas(): RegistryRoute[];
  navegacao(): RegistryNavigationEntry[];
  esquemas(): RegistryStorageSchema[];
  permissoes(): Map<string, Permission[]>;
  eventos(): Map<string, EventCatalogEntry>;
  eventosOrfaos(): OrphanEvent[];
  referenciasOrfas(): OrphanReference[];
  modulo(id: string): NormalizedModuleManifest | null;
  listar(): string[];
  readonly selado: boolean;
}

function manifestRequired(
  manifests: Map<string, NormalizedModuleManifest>,
  id: string,
): NormalizedModuleManifest {
  const manifest = manifests.get(id);
  if (!manifest) {
    throw new Error(`registry inconsistente: "${id}" está na ordem e não no mapa`);
  }
  return manifest;
}

function idFromManifest(manifesto: unknown): string | undefined {
  if (manifesto === null || typeof manifesto !== 'object') return undefined;
  const candidate = manifesto as Record<string, unknown>;
  return typeof candidate.id === 'string' ? candidate.id : undefined;
}

export function criarRegistry(): ModuleRegistry {
  const bruto = new Map<string, NormalizedModuleManifest>();
  let ativos = new Map<string, NormalizedModuleManifest>();
  let recusados: RegistryRejection[] = [];
  let ordem: string[] = [];
  let selado = false;

  function registrar(manifesto: unknown): boolean {
    if (selado) {
      throw new Error('registry já selado: registre antes de selar');
    }

    const validacao = validar(manifesto);
    const id = idFromManifest(manifesto);
    if (!validacao.ok) {
      const nome = id && id.length > 0 ? id : `<anônimo #${bruto.size + 1}>`;
      recusados.push({
        id: nome,
        motivo: `manifesto inválido: ${validacao.erros.join('; ')}`,
      });
      return false;
    }

    const normalizado = normalizar(manifesto as ModuleManifest);
    if (bruto.has(normalizado.id)) {
      recusados.push({
        id: normalizado.id,
        motivo: `id duplicado: já existe um módulo "${normalizado.id}"`,
      });
      return false;
    }

    bruto.set(normalizado.id, normalizado);
    return true;
  }

  function selar(): RegistrySeal {
    if (selado) throw new Error('registry já selado');

    const donoDaRota = new Map<string, string>();
    const recusasPorRota: RegistryRejection[] = [];
    for (const [id, manifest] of bruto) {
      for (const route of manifest.routes) {
        const dono = donoDaRota.get(route.path);
        if (dono) {
          recusasPorRota.push({
            id,
            motivo: `rota "${route.path}" já pertence ao módulo "${dono}"`,
          });
        } else {
          donoDaRota.set(route.path, id);
        }
      }
    }
    for (const recusa of recusasPorRota) {
      recusados.push(recusa);
      bruto.delete(recusa.id);
    }

    const donoDaChave = new Map<string, string>();
    const recusasPorChave: RegistryRejection[] = [];
    for (const [id, manifest] of bruto) {
      for (const schema of manifest.storage) {
        const dono = donoDaChave.get(schema.key);
        if (dono) {
          recusasPorChave.push({
            id,
            motivo: `chave "${schema.key}" já pertence a "${dono}"`,
          });
        } else {
          donoDaChave.set(schema.key, id);
        }
      }
    }
    for (const recusa of recusasPorChave) {
      recusados.push(recusa);
      bruto.delete(recusa.id);
    }

    let mudou = true;
    while (mudou) {
      mudou = false;
      for (const [id, manifest] of bruto) {
        const faltando = manifest.dependencies.filter(
          (dependency) => !bruto.has(dependency),
        );
        if (faltando.length > 0) {
          recusados.push({
            id,
            motivo: `dependência ausente: ${faltando.join(', ')}`,
          });
          bruto.delete(id);
          mudou = true;
        }
      }
    }

    type VisitState = 'visitando' | 'pronto';
    const estado = new Map<string, VisitState>();
    const emCiclo = new Set<string>();
    ordem = [];

    function visitar(id: string, caminho: string[]): void {
      const atual = estado.get(id);
      if (atual === 'pronto') return;
      if (atual === 'visitando') {
        const inicio = Math.max(0, caminho.indexOf(id));
        caminho.slice(inicio).forEach((modulo) => emCiclo.add(modulo));
        return;
      }

      estado.set(id, 'visitando');
      const manifest = manifestRequired(bruto, id);
      for (const dependency of manifest.dependencies) {
        if (bruto.has(dependency)) visitar(dependency, [...caminho, id]);
      }
      estado.set(id, 'pronto');
      if (!emCiclo.has(id)) ordem.push(id);
    }

    for (const id of bruto.keys()) visitar(id, []);

    for (const id of emCiclo) {
      recusados.push({
        id,
        motivo: `ciclo de dependência envolvendo: ${[...emCiclo].join(' → ')}`,
      });
      bruto.delete(id);
    }

    ordem = ordem.filter((id) => bruto.has(id));
    ativos = new Map(
      ordem.map((id) => [id, manifestRequired(bruto, id)]),
    );
    selado = true;

    return {
      ok: recusados.length === 0,
      ativos: [...ordem],
      recusados: [...recusados],
    };
  }

  function exigirSelado(): void {
    if (!selado) throw new Error('chame selar() antes de ler o registro');
  }

  function rotas(): RegistryRoute[] {
    exigirSelado();
    return ordem.flatMap((id) =>
      manifestRequired(ativos, id).routes.map((route) => ({
        path: route.path,
        view: route.view,
        modulo: id,
      })),
    );
  }

  function navegacao(): RegistryNavigationEntry[] {
    exigirSelado();
    const candidates = ordem.map((id) => {
      const manifest = manifestRequired(ativos, id);
      return {
        modulo: id,
        nome: manifest.name,
        icone: manifest.icon,
        secao: manifest.nav.section,
        ordem: manifest.nav.order,
        path: manifest.routes[0]?.path ?? null,
        estabilidade: manifest.stability,
      };
    });

    return candidates
      .filter(
        (
          candidate,
        ): candidate is Omit<RegistryNavigationEntry, 'path'> & { path: string } =>
          candidate.path !== null,
      )
      .sort(
        (left, right) =>
          left.ordem - right.ordem || left.nome.localeCompare(right.nome),
      );
  }

  function esquemas(): RegistryStorageSchema[] {
    exigirSelado();
    return ordem.flatMap((id) =>
      manifestRequired(ativos, id).storage.map((schema) => ({
        ...schema,
        modulo: id,
      })),
    );
  }

  function permissoes(): Map<string, Permission[]> {
    exigirSelado();
    return new Map(
      ordem.map((id) => [
        id,
        [...manifestRequired(ativos, id).permissions],
      ]),
    );
  }

  function eventos(): Map<string, EventCatalogEntry> {
    exigirSelado();
    const catalog = new Map<string, EventCatalogEntry>();

    function eventEntry(name: string): EventCatalogEntry {
      let entry = catalog.get(name);
      if (!entry) {
        entry = { emitem: [], escutam: [] };
        catalog.set(name, entry);
      }
      return entry;
    }

    for (const id of ordem) {
      const manifest = manifestRequired(ativos, id);
      manifest.events.emits.forEach((name) => eventEntry(name).emitem.push(id));
      manifest.events.consumes.forEach((name) => eventEntry(name).escutam.push(id));
    }
    return catalog;
  }

  function eventosOrfaos(): OrphanEvent[] {
    return [...eventos()]
      .filter(([, entry]) => entry.emitem.length === 0)
      .map(([evento, entry]) => ({
        evento,
        escutadoPor: entry.escutam,
      }));
  }

  function referenciasOrfas(): OrphanReference[] {
    exigirSelado();
    const caminhos = new Set(rotas().map((route) => route.path));
    const soltas: OrphanReference[] = [];

    for (const id of ordem) {
      const manifest = manifestRequired(ativos, id);
      for (const path of manifest.references.routes) {
        if (!caminhos.has(path)) {
          soltas.push({ modulo: id, tipo: 'rota', alvo: path });
        }
      }
      for (const moduleId of manifest.references.modules) {
        if (!ativos.has(moduleId)) {
          soltas.push({ modulo: id, tipo: 'modulo', alvo: moduleId });
        }
      }
    }
    return soltas;
  }

  function modulo(id: string): NormalizedModuleManifest | null {
    exigirSelado();
    return ativos.get(id) ?? null;
  }

  function listar(): string[] {
    exigirSelado();
    return [...ordem];
  }

  return {
    registrar,
    selar,
    rotas,
    navegacao,
    esquemas,
    permissoes,
    eventos,
    eventosOrfaos,
    referenciasOrfas,
    modulo,
    listar,
    get selado(): boolean {
      return selado;
    },
  };
}
